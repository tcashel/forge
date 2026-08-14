//! forged owns the clap CLI and the rmcp MCP server over one core.
//!
//! Every command — mutating or read-only — carries an `OperationRequest`
//! and prints an `OperationResponse` as JSON on stdout; the process exits 0
//! when `ok` is true and 1 when it is false; tracing goes to stderr.
//! `forged mcp` is the single exception: it serves the protocol instead of
//! printing an envelope.

mod adapters;
mod cli;
mod config;
mod core;
mod failpoint;
mod mcp;
mod pricing;
mod runtime;

use std::sync::Arc;

use clap::Parser;
use forged_types::ErrorCode;

use crate::config::ForgedConfig;
use crate::core::{Ctx, Failure};

fn main() {
    let args = cli::Cli::parse();
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

/// A failure BEFORE dispatch still owes stdout an `OperationResponse`: an
/// empty stdout with exit 1 is indistinguishable, to envelope-consuming
/// automation, from a crash. `forged mcp` is the one surface that prints no
/// envelope, so its pre-dispatch failures stay on stderr.
fn pre_dispatch_failure(name: &str, code: ErrorCode, message: String) -> i32 {
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
    match serde_json::to_string(&response) {
        Ok(text) => println!("{text}"),
        Err(e) => eprintln!("forged: cannot serialize failure envelope: {e}"),
    }
    1
}

async fn run(args: cli::Cli) -> i32 {
    let name = cli::command_name(&args.command);
    if let Err(message) = core::record_controller_identity_from_env().await {
        return pre_dispatch_failure(name, ErrorCode::ProviderSpawnFailed, message);
    }
    let config = match ForgedConfig::load() {
        Ok(config) => config,
        // A malformed or unreadable config file is a bad request, not an
        // internal fault: the operator can fix the file.
        Err(message) => return pre_dispatch_failure(name, ErrorCode::InvalidRequest, message),
    };
    let cli::Cli { command } = args;
    let command = match command {
        cli::Command::Service { command } => {
            return emit_response(runtime::dispatch_service(&config, command).await)
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
            )
        }
    };
    let ctx = Arc::new(Ctx { config, ledger });
    if let Err(failure) = core::migrate_legacy_state(&ctx).await {
        let code = pre_dispatch_failure(name, failure.code, failure.message);
        close(&ctx);
        return code;
    }

    if matches!(command, cli::Command::Mcp) {
        let result = mcp::serve(Arc::clone(&ctx)).await;
        let code = match result {
            Ok(()) => 0,
            Err(message) => {
                eprintln!("forged: {message}");
                1
            }
        };
        close(&ctx);
        return code;
    }

    let (name, request) = match cli::to_request(command) {
        Ok(pair) => pair,
        Err(message) => {
            let code = pre_dispatch_failure(name, ErrorCode::InvalidRequest, message);
            close(&ctx);
            return code;
        }
    };
    let response = core::dispatch(&ctx, name, request).await;
    let code = emit_response(response);
    close(&ctx);
    code
}

fn emit_response(response: forged_types::OperationResponse) -> i32 {
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

/// Close the ledger deliberately on exit paths, so crash cases in the kill
/// matrix exercise real crash recovery rather than clean shutdown.
fn close(ctx: &Arc<Ctx>) {
    let _ = ctx.ledger.clone().close();
}
