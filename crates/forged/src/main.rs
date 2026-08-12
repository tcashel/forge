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

use std::sync::Arc;

use clap::Parser;

use crate::config::ForgedConfig;
use crate::core::Ctx;

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

async fn run(args: cli::Cli) -> i32 {
    let config = match ForgedConfig::load() {
        Ok(config) => config,
        Err(message) => {
            eprintln!("forged: {message}");
            return 1;
        }
    };
    let ledger = match forged_ledger::Ledger::open(&config.db_path) {
        Ok(ledger) => ledger,
        Err(e) => {
            eprintln!("forged: cannot open ledger: {e}");
            return 1;
        }
    };
    let ctx = Arc::new(Ctx { config, ledger });

    if matches!(args.command, cli::Command::Mcp) {
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

    let (name, request) = match cli::to_request(args.command) {
        Ok(pair) => pair,
        Err(message) => {
            eprintln!("forged: {message}");
            close(&ctx);
            return 1;
        }
    };
    let response = core::dispatch(&ctx, name, request).await;
    match serde_json::to_string(&response) {
        Ok(text) => println!("{text}"),
        Err(e) => {
            eprintln!("forged: cannot serialize response: {e}");
            close(&ctx);
            return 1;
        }
    }
    close(&ctx);
    i32::from(!response.ok)
}

/// Close the ledger deliberately on exit paths, so crash cases in the kill
/// matrix exercise real crash recovery rather than clean shutdown.
fn close(ctx: &Arc<Ctx>) {
    let _ = ctx.ledger.clone().close();
}
