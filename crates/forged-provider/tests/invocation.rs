//! Golden tests for the emitted shell lines (acceptance criteria 3-5).

mod support;

use std::path::PathBuf;

use forged_provider::{
    ClaudeDriver, CodexDriver, Invocation, PacketDirs, PiDriver, ProviderDriver, ProviderError,
};
use forged_types::{claude_session_id, Sandbox};

/// The known claim token the exact-line tests pin.
const CLAIM_TOKEN: &str = "0198b0d2-0000-7000-8000-000000000000";
/// `claude_session_id(CLAIM_TOKEN)`: UUID v5 over `b"forged-session!!"`.
const SESSION_ID: &str = "a070b2df-8ef9-53dc-bdaa-0dc5693905be";

fn dirs() -> PacketDirs {
    PacketDirs::new("/tmp/run-1/packets/pkt-1", 7)
}

fn shell_line(invocation: &Invocation) -> String {
    invocation.shell_line().expect("shell line renders")
}

#[test]
fn claude_session_id_derivation_is_pinned() {
    assert_eq!(claude_session_id(CLAIM_TOKEN), SESSION_ID);
}

#[test]
fn claude_invocation_emits_the_documented_line() {
    let packet = support::sample_packet();
    let invocation = ClaudeDriver
        .invocation(&packet, &dirs(), CLAIM_TOKEN)
        .expect("claude invocation builds");
    assert_eq!(
        shell_line(&invocation),
        format!(
            "claude -p --output-format stream-json --verbose \
             --dangerously-skip-permissions --session-id {SESSION_ID} --model opus \
             < /tmp/run-1/packets/pkt-1/attempts/7/prompt.md > \
             /tmp/run-1/packets/pkt-1/attempts/7/.out.jsonl.incomplete"
        )
    );
    assert_eq!(invocation.session_hint.as_deref(), Some(SESSION_ID));
    assert_eq!(
        invocation.prompt_path,
        PathBuf::from("/tmp/run-1/packets/pkt-1/attempts/7/prompt.md")
    );
    assert_eq!(
        invocation.stdout_path,
        PathBuf::from("/tmp/run-1/packets/pkt-1/attempts/7/.out.jsonl.incomplete")
    );
}

#[test]
fn claude_read_only_removes_bypass_and_write_capable_tools() {
    let mut packet = support::sample_packet();
    packet.provider_hints.effort = Some("bogus".to_owned());
    packet.provider_hints.sandbox = Sandbox::ReadOnly;
    let invocation = ClaudeDriver
        .invocation(&packet, &dirs(), CLAIM_TOKEN)
        .expect("claude never returns UnsupportedEffort");
    let line = shell_line(&invocation);
    assert!(line.contains("--permission-mode plan"));
    assert!(line.contains("--tools Read,Grep,Glob"));
    assert!(!line.contains("--dangerously-skip-permissions"));
    assert!(!line.contains("Bash"));
}

#[test]
fn codex_invocation_emits_the_documented_line() {
    let packet = support::sample_packet();
    let invocation = CodexDriver
        .invocation(&packet, &dirs(), CLAIM_TOKEN)
        .expect("codex invocation builds");
    assert_eq!(
        shell_line(&invocation),
        "codex exec --json --skip-git-repo-check --sandbox workspace-write -m opus \
         -c 'model_reasoning_effort=\"high\"' -o \
         /tmp/run-1/packets/pkt-1/attempts/7/.last.txt.incomplete - \
         < /tmp/run-1/packets/pkt-1/attempts/7/prompt.md > \
         /tmp/run-1/packets/pkt-1/attempts/7/.out.jsonl.incomplete"
    );
    assert_eq!(invocation.session_hint, None);
    assert_eq!(
        invocation.prompt_path,
        PathBuf::from("/tmp/run-1/packets/pkt-1/attempts/7/prompt.md")
    );
    assert_eq!(
        invocation.stdout_path,
        PathBuf::from("/tmp/run-1/packets/pkt-1/attempts/7/.out.jsonl.incomplete")
    );
}

#[test]
fn pi_invocation_is_ephemeral_but_keeps_project_cognition() {
    let mut packet = support::sample_packet();
    packet.provider_hints.provider = "pi".to_owned();
    packet.provider_hints.model = "anthropic/claude-sonnet-4-5".to_owned();
    let invocation = PiDriver
        .invocation(&packet, &dirs(), CLAIM_TOKEN)
        .expect("pi invocation builds");
    assert_eq!(
        shell_line(&invocation),
        "FORGED_PI_WORKER=1 pi --mode json -p --no-session --no-extensions --approve \
         --model anthropic/claude-sonnet-4-5 --append-system-prompt \
         'You are a Forged packet worker. Follow the frozen packet and repository skills. \
         Do not invoke Forge lead planning, dispatch, or lifecycle-control skills.' \
         --thinking high < /tmp/run-1/packets/pkt-1/attempts/7/prompt.md > \
         /tmp/run-1/packets/pkt-1/attempts/7/.out.jsonl.incomplete"
    );
    assert_eq!(invocation.session_hint, None);
}

#[test]
fn codex_read_only_sandbox_maps_to_read_only() {
    let mut packet = support::sample_packet();
    packet.provider_hints.sandbox = Sandbox::ReadOnly;
    let invocation = CodexDriver
        .invocation(&packet, &dirs(), CLAIM_TOKEN)
        .expect("codex invocation builds");
    assert!(shell_line(&invocation).contains("--sandbox read-only"));
}

#[test]
fn codex_effort_none_omits_the_config_argument() {
    let mut packet = support::sample_packet();
    packet.provider_hints.effort = None;
    let invocation = CodexDriver
        .invocation(&packet, &dirs(), CLAIM_TOKEN)
        .expect("codex invocation builds");
    let line = shell_line(&invocation);
    assert!(!line.contains("-c "));
    assert!(!line.contains("model_reasoning_effort"));
    assert!(line.contains("-m opus -o "));
}

#[test]
fn codex_and_pi_reject_efforts_outside_the_embedding_charset() {
    let long = "x".repeat(65);
    for effort in [
        "xhigh\"'",
        "hi gh",
        "x;rm -rf /",
        "e$fort",
        "",
        long.as_str(),
    ] {
        let mut packet = support::sample_packet();
        packet.provider_hints.effort = Some(effort.to_owned());
        for driver in [&CodexDriver as &dyn ProviderDriver, &PiDriver] {
            let err = driver
                .invocation(&packet, &dirs(), CLAIM_TOKEN)
                .expect_err("charset-unsafe effort must be refused");
            assert!(
                matches!(err, ProviderError::UnsupportedEffort { .. }),
                "{} {effort:?} gave {err}",
                driver.name()
            );
        }
    }
}

#[test]
fn codex_and_pi_pass_charset_safe_efforts_through_verbatim() {
    // Vocabulary belongs to the provider CLI: values forged has never heard
    // of embed unchanged and the CLI adjudicates them.
    for effort in ["minimal", "high", "xhigh", "max", "ultra", "future.tier-2"] {
        let mut packet = support::sample_packet();
        packet.provider_hints.effort = Some(effort.to_owned());
        let codex = CodexDriver
            .invocation(&packet, &dirs(), CLAIM_TOKEN)
            .expect("charset-safe effort builds");
        assert!(shell_line(&codex).contains(&format!("-c 'model_reasoning_effort=\"{effort}\"'")));
        let pi = PiDriver
            .invocation(&packet, &dirs(), CLAIM_TOKEN)
            .expect("charset-safe effort builds");
        assert!(shell_line(&pi).contains(&format!("--thinking {effort}")));
    }
}

#[test]
fn every_driver_rejects_unsafe_and_empty_models() {
    for model in ["x; rm -rf /", ""] {
        let mut packet = support::sample_packet();
        packet.provider_hints.model = model.to_owned();
        let claude_err = ClaudeDriver
            .invocation(&packet, &dirs(), CLAIM_TOKEN)
            .expect_err("claude must refuse the model");
        assert!(
            matches!(claude_err, ProviderError::UnsafeShellLine { .. }),
            "claude {model:?} gave {claude_err}"
        );
        if let ProviderError::UnsafeShellLine { value, .. } = &claude_err {
            assert_eq!(value, model, "the error names the offending value");
        }
        for driver in [&CodexDriver as &dyn ProviderDriver, &PiDriver] {
            let err = driver
                .invocation(&packet, &dirs(), CLAIM_TOKEN)
                .expect_err("driver must refuse the model");
            assert!(
                matches!(err, ProviderError::UnsafeShellLine { .. }),
                "{} {model:?} gave {err}",
                driver.name()
            );
        }
    }
}

#[test]
fn every_driver_rejects_unsafe_packet_dirs() {
    let unsafe_dirs = PacketDirs::new("/tmp/run 1;/pkt", 7);
    let packet = support::sample_packet();
    for driver in [
        &ClaudeDriver as &dyn ProviderDriver,
        &CodexDriver,
        &PiDriver,
    ] {
        let err = driver
            .invocation(&packet, &unsafe_dirs, CLAIM_TOKEN)
            .expect_err("unsafe dir must be refused");
        assert!(
            matches!(err, ProviderError::UnsafePath { .. }),
            "{} gave {err}",
            driver.name()
        );
    }
}

#[test]
fn every_emitted_line_satisfies_the_host_rules() {
    // The rules forged-host applies downstream: a single non-empty line,
    // no \n or \r, and a last non-whitespace character that is not the
    // sentinel-breaking `;`, `&`, or `|`.
    let mut lines = Vec::new();
    for sandbox in [Sandbox::ReadOnly, Sandbox::WorkspaceWrite] {
        for effort in [None, Some("minimal"), Some("xhigh")] {
            let mut packet = support::sample_packet();
            packet.provider_hints.sandbox = sandbox;
            packet.provider_hints.effort = effort.map(str::to_owned);
            lines.push(
                ClaudeDriver
                    .invocation(&packet, &dirs(), CLAIM_TOKEN)
                    .expect("claude builds")
                    .shell_line()
                    .expect("claude line renders"),
            );
            lines.push(
                CodexDriver
                    .invocation(&packet, &dirs(), CLAIM_TOKEN)
                    .expect("codex builds")
                    .shell_line()
                    .expect("codex line renders"),
            );
            lines.push(
                PiDriver
                    .invocation(&packet, &dirs(), CLAIM_TOKEN)
                    .expect("pi builds")
                    .shell_line()
                    .expect("pi line renders"),
            );
        }
    }
    for line in lines {
        assert!(!line.trim().is_empty(), "line is empty: {line:?}");
        assert!(
            !line.contains('\n') && !line.contains('\r'),
            "line spans multiple lines: {line:?}"
        );
        let last = line.trim_end().chars().next_back().expect("non-empty");
        assert!(
            !matches!(last, ';' | '&' | '|'),
            "line ends in {last:?}: {line:?}"
        );
    }
}

#[test]
fn driver_names_are_stable() {
    assert_eq!(ClaudeDriver.name(), "claude");
    assert_eq!(CodexDriver.name(), "codex");
    assert_eq!(PiDriver.name(), "pi");
}
