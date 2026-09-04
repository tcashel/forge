//! forged owns the clap CLI and the rmcp MCP server over one core.
//!
//! Every command — mutating or read-only — carries an `OperationRequest`.
//! Automation receives an `OperationResponse` as JSON; a small set of lead
//! reads renders deterministic text on terminals. `forged mcp` is the single
//! exception: it serves the protocol instead of printing an envelope.

mod adapters;
mod cli;
mod config;
mod core;
mod failpoint;
mod mcp;
mod pricing;
mod render;
mod runtime;
mod surface;

use std::{io::IsTerminal as _, sync::Arc, time::Duration};

use clap::Parser;
use forged_types::ErrorCode;

use crate::config::ForgedConfig;
use crate::core::{Ctx, Failure};

fn main() {
    if let Some(code) = provider_stream_dispatch() {
        std::process::exit(code);
    }
    let args = cli::Cli::parse();
    if matches!(&args.command, Some(cli::Command::GenerateSurfaceManifest)) {
        return match surface::regenerate() {
            Ok(()) => {}
            Err(message) => {
                eprintln!("forged: {message}");
                std::process::exit(1);
            }
        };
    }
    tracing_subscriber::fmt()
        .with_writer(std::io::stderr)
        .with_max_level(tracing::Level::WARN)
        .init();

    let runtime = match tokio::runtime::Runtime::new() {
        Ok(rt) => rt,
        Err(e) => {
            eprintln!("forged: cannot start runtime: {e}");
            std::process::exit(1);
        }
    };
    let code = runtime.block_on(run(args));
    std::process::exit(code);
}

/// Detect the exact private runner argv before Clap, tracing, runtime,
/// controller identity, config, ledger, migration, service, or MCP startup.
/// It deliberately emits no `OperationResponse`.
fn provider_stream_dispatch() -> Option<i32> {
    let mut args = std::env::args_os();
    let _executable = args.next()?;
    if args.next().as_deref() != Some(std::ffi::OsStr::new(forged_provider::PROVIDER_STREAM_ARG)) {
        return None;
    }
    let Some(request_path) = args.next() else {
        eprintln!("forged: private provider-stream request path is missing");
        return Some(125);
    };
    if args.next().is_some() {
        eprintln!("forged: private provider-stream argv is invalid");
        return Some(125);
    }
    Some(
        forged_provider::run_provider_stream(std::path::Path::new(&request_path)).unwrap_or_else(
            |error| {
                eprintln!("forged: private provider-stream runner failed: {error}");
                125
            },
        ),
    )
}

/// A failure BEFORE dispatch still owes stdout an `OperationResponse`: an
/// empty stdout with exit 1 is indistinguishable, to envelope-consuming
/// automation, from a crash. `forged mcp` is the one surface that prints no
/// envelope, so its pre-dispatch failures stay on stderr.
#[derive(Clone, Copy)]
struct OutputMode {
    text: bool,
    full: bool,
}

fn pre_dispatch_failure(name: &str, code: ErrorCode, message: String, output: OutputMode) -> i32 {
    if name == "mcp" {
        eprintln!("forged: {message}");
        return 1;
    }
    let failure = Failure {
        code,
        message,
        recoverable: false,
    };
    let response = core::err_response(&core::derive_key(name, None, None, None), &failure);
    emit_response(name, response, output)
}

async fn run(mut args: cli::Cli) -> i32 {
    if args.command.is_none() {
        args.command = Some(cli::Command::Next(cli::NextArgs {
            repo: current_repository(),
            id: None,
            symptoms: false,
            section: None,
            limit: None,
            follow: false,
            idempotency_key: None,
        }));
    }
    let command = args.command.as_ref().expect("bare command becomes next");
    let name = cli::command_name(command);
    let stdout_is_terminal = std::io::stdout().is_terminal();
    let output = OutputMode {
        text: args.text || (!args.json && stdout_is_terminal && render::supports(name)),
        full: matches!(
            command,
            cli::Command::Work {
                command: cli::WorkCmd::Show(cli::WorkIdArgs { full: true, .. })
            }
        ),
    };
    let follow = matches!(
        command,
        cli::Command::Next(cli::NextArgs { follow: true, .. })
    );
    if follow && !stdout_is_terminal {
        return pre_dispatch_failure(
            name,
            ErrorCode::InvalidRequest,
            "next --follow requires stdout to be a terminal".to_owned(),
            output,
        );
    }
    if let Err(message) = core::record_controller_identity_from_env().await {
        return pre_dispatch_failure(name, ErrorCode::ProviderSpawnFailed, message, output);
    }
    let config = match ForgedConfig::load() {
        Ok(config) => config,
        // A malformed or unreadable config file is a bad request, not an
        // internal fault: the operator can fix the file.
        Err(message) => {
            return pre_dispatch_failure(name, ErrorCode::InvalidRequest, message, output)
        }
    };
    let command = match args.command.expect("command was defaulted") {
        cli::Command::Service { command } => {
            return emit_json_response(runtime::dispatch_service(&config, command).await)
        }
        // The MCP surface never creates operator state: a host handshake is
        // not operator intent, so the ledger (and legacy-state migration)
        // opens lazily inside the tool-call gate, never here.
        cli::Command::Mcp => {
            return match mcp::serve(config).await {
                Ok(()) => 0,
                Err(message) => {
                    eprintln!("forged: {message}");
                    1
                }
            }
        }
        command => command,
    };
    let ledger = match forged_ledger::Ledger::open(&config.db_path) {
        Ok(ledger) => ledger,
        Err(e) => {
            return pre_dispatch_failure(
                name,
                ErrorCode::Internal,
                format!("cannot open ledger: {e}"),
                output,
            )
        }
    };
    let ctx = Arc::new(Ctx { config, ledger });
    if let Err(failure) = core::await_controller_authorization_from_env(&ctx).await {
        let code = pre_dispatch_failure(name, failure.code, failure.message, output);
        close(&ctx);
        return code;
    }
    if let Err(failure) = core::migrate_legacy_state(&ctx).await {
        let code = pre_dispatch_failure(name, failure.code, failure.message, output);
        close(&ctx);
        return code;
    }

    let (name, request) = match cli::to_request(command) {
        Ok(pair) => pair,
        Err(message) => {
            let code = pre_dispatch_failure(name, ErrorCode::InvalidRequest, message, output);
            close(&ctx);
            return code;
        }
    };
    if follow {
        let mut first = true;
        loop {
            let response = core::dispatch(&ctx, name, request.clone()).await;
            if !first {
                print!("\u{1b}[2J\u{1b}[H");
            }
            first = false;
            let ok = response.ok;
            let code = emit_response(
                name,
                response,
                OutputMode {
                    text: true,
                    ..output
                },
            );
            if !ok {
                close(&ctx);
                return code;
            }
            tokio::time::sleep(Duration::from_secs(5)).await;
        }
    }
    let response = core::dispatch(&ctx, name, request).await;
    let code = emit_response(name, response, output);
    close(&ctx);
    code
}

fn emit_response(name: &str, response: forged_types::OperationResponse, output: OutputMode) -> i32 {
    if output.text {
        if let Some(text) = render::response(name, &response, output.full) {
            println!("{text}");
            return i32::from(!response.ok);
        }
    }
    emit_json_response(response)
}

fn emit_json_response(response: forged_types::OperationResponse) -> i32 {
    let ok = response.ok;
    match serde_json::to_string(&response) {
        Ok(text) => println!("{text}"),
        Err(error) => {
            eprintln!("forged: cannot serialize response: {error}");
            return 1;
        }
    }
    i32::from(!ok)
}

fn current_repository() -> Option<String> {
    let output = std::process::Command::new("git")
        .args(["rev-parse", "--show-toplevel"])
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let root = String::from_utf8(output.stdout).ok()?;
    let root = std::fs::canonicalize(root.trim()).ok()?;
    Some(root.to_string_lossy().into_owned())
}

/// Close the ledger deliberately on exit paths, so crash cases in the kill
/// matrix exercise real crash recovery rather than clean shutdown.
fn close(ctx: &Arc<Ctx>) {
    let _ = ctx.ledger.clone().close();
}
