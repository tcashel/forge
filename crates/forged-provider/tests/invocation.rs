//! Golden tests for the emitted shell lines (acceptance criteria 3-5).

mod support;

use std::path::PathBuf;

use forged_provider::{
    ClaudeDriver, CodexDriver, PacketDirs, PiDriver, ProviderDriver, ProviderError,
};
use forged_types::{claude_session_id, Sandbox};

/// The known claim token the exact-line tests pin.
const CLAIM_TOKEN: &str = "0198b0d2-0000-7000-8000-000000000000";
/// `claude_session_id(CLAIM_TOKEN)`: UUID v5 over `b"forged-session!!"`.
const SESSION_ID: &str = "a070b2df-8ef9-53dc-bdaa-0dc5693905be";

fn dirs() -> PacketDirs {
    PacketDirs::new("/tmp/run-1/packets/pkt-1", 7)
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
        invocation.shell_line,
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
    assert!(invocation.shell_line.contains("--permission-mode plan"));
    assert!(invocation.shell_line.contains("--tools Read,Grep,Glob"));
    assert!(!invocation
        .shell_line
        .contains("--dangerously-skip-permissions"));
    assert!(!invocation.shell_line.contains("Bash"));
}

#[test]
fn codex_invocation_emits_the_documented_line() {
    let packet = support::sample_packet();
    let invocation = CodexDriver
        .invocation(&packet, &dirs(), CLAIM_TOKEN)
        .expect("codex invocation builds");
    assert_eq!(
        invocation.shell_line,
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
    assert!(invocation.shell_line.starts_with("pi --mode json -p"));
    assert!(invocation
        .shell_line
        .contains("--no-session --no-extensions --approve"));
    assert!(invocation
        .shell_line
        .contains("--model anthropic/claude-sonnet-4-5 --thinking high"));
    assert!(!invocation.shell_line.contains("--no-skills"));
    assert!(!invocation.shell_line.contains("--no-context-files"));
    assert_eq!(invocation.session_hint, None);
}

#[test]
fn codex_read_only_sandbox_maps_to_read_only() {
    let mut packet = support::sample_packet();
    packet.provider_hints.sandbox = Sandbox::ReadOnly;
    let invocation = CodexDriver
        .invocation(&packet, &dirs(), CLAIM_TOKEN)
        .expect("codex invocation builds");
    assert!(invocation.shell_line.contains("--sandbox read-only"));
}

#[test]
fn codex_effort_none_omits_the_config_argument() {
    let mut packet = support::sample_packet();
    packet.provider_hints.effort = None;
    let invocation = CodexDriver
        .invocation(&packet, &dirs(), CLAIM_TOKEN)
        .expect("codex invocation builds");
    assert!(!invocation.shell_line.contains("-c "));
    assert!(!invocation.shell_line.contains("model_reasoning_effort"));
    assert!(invocation.shell_line.contains("-m opus -o "));
}

#[test]
fn codex_rejects_effort_outside_the_closed_set() {
    for effort in ["bogus", "extreme", "xhigh\"'", "HIGH"] {
        let mut packet = support::sample_packet();
        packet.provider_hints.effort = Some(effort.to_owned());
        let err = CodexDriver
            .invocation(&packet, &dirs(), CLAIM_TOKEN)
            .expect_err("effort outside the closed set must be refused");
        assert!(
            matches!(err, ProviderError::UnsupportedEffort { .. }),
            "{effort:?} gave {err}"
        );
    }
}

#[test]
fn codex_accepts_every_effort_in_the_closed_set() {
    for effort in ["minimal", "low", "medium", "high", "xhigh"] {
        let mut packet = support::sample_packet();
        packet.provider_hints.effort = Some(effort.to_owned());
        let invocation = CodexDriver
            .invocation(&packet, &dirs(), CLAIM_TOKEN)
            .expect("closed-set effort builds");
        assert!(invocation
            .shell_line
            .contains(&format!("-c 'model_reasoning_effort=\"{effort}\"'")));
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
                    .shell_line,
            );
            lines.push(
                CodexDriver
                    .invocation(&packet, &dirs(), CLAIM_TOKEN)
                    .expect("codex builds")
                    .shell_line,
            );
            lines.push(
                PiDriver
                    .invocation(&packet, &dirs(), CLAIM_TOKEN)
                    .expect("pi builds")
                    .shell_line,
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
