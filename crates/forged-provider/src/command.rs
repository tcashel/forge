use std::ffi::OsStr;
use std::path::Path;
use std::process::Command;

use forged_types::Sandbox;
use serde::{Deserialize, Serialize};

use crate::invocation::validate_embedded_path;
use crate::ProviderError;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub(crate) enum ProviderKindV1 {
    Claude,
    Codex,
    Pi,
}

impl ProviderKindV1 {
    pub(crate) fn from_name(name: &str) -> Result<Self, ProviderError> {
        match name {
            "claude" => Ok(Self::Claude),
            "codex" => Ok(Self::Codex),
            "pi" => Ok(Self::Pi),
            _ => Err(ProviderError::Malformed {
                message: "provider-stream request has an unsupported provider".to_owned(),
            }),
        }
    }

    fn program(self) -> &'static str {
        match self {
            Self::Claude => "claude",
            Self::Codex => "codex",
            Self::Pi => "pi",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct ProviderArgv {
    program: &'static str,
    args: Vec<String>,
    env: Vec<(&'static str, &'static str)>,
}

impl ProviderArgv {
    pub(crate) fn command(&self, override_path: Option<&Path>) -> Command {
        let program = override_path
            .map(Path::as_os_str)
            .unwrap_or_else(|| OsStr::new(self.program));
        let mut command = Command::new(program);
        command.args(&self.args);
        for (key, value) in &self.env {
            command.env(key, value);
        }
        command
    }

    pub(crate) fn shell_line(
        &self,
        prompt_path: &Path,
        stdout_path: &Path,
    ) -> Result<String, ProviderError> {
        let prompt = validate_embedded_path(prompt_path)?;
        let stdout = validate_embedded_path(stdout_path)?;
        let mut words = self
            .env
            .iter()
            .map(|(key, value)| format!("{key}={}", shell_quote(value)))
            .collect::<Vec<_>>();
        words.push(shell_quote(self.program));
        words.extend(self.args.iter().map(|arg| shell_quote(arg)));
        Ok(format!(
            "{} < {} > {}",
            words.join(" "),
            shell_quote(&prompt),
            shell_quote(&stdout)
        ))
    }
}

pub(crate) fn provider_argv(
    provider: ProviderKindV1,
    sandbox: Sandbox,
    model: &str,
    effort: Option<&str>,
    session_id: Option<&str>,
    last_message_path: Option<&Path>,
) -> ProviderArgv {
    let mut args = Vec::new();
    let mut env = Vec::new();
    match provider {
        ProviderKindV1::Claude => {
            push_args(
                &mut args,
                &["-p", "--output-format", "stream-json", "--verbose"],
            );
            match sandbox {
                Sandbox::ReadOnly => push_args(
                    &mut args,
                    &["--permission-mode", "plan", "--tools", "Read,Grep,Glob"],
                ),
                Sandbox::WorkspaceWrite => {
                    args.push("--dangerously-skip-permissions".to_owned());
                }
            }
            push_args(
                &mut args,
                &[
                    "--session-id",
                    session_id.expect("validated claude request has a session id"),
                    "--model",
                    model,
                ],
            );
        }
        ProviderKindV1::Codex => {
            let sandbox = match sandbox {
                Sandbox::ReadOnly => "read-only",
                Sandbox::WorkspaceWrite => "workspace-write",
            };
            push_args(
                &mut args,
                &[
                    "exec",
                    "--json",
                    "--skip-git-repo-check",
                    "--sandbox",
                    sandbox,
                    "-m",
                    model,
                ],
            );
            if let Some(effort) = effort {
                push_args(
                    &mut args,
                    &["-c", &format!("model_reasoning_effort=\"{effort}\"")],
                );
            }
            args.push("-o".to_owned());
            args.push(
                last_message_path
                    .expect("validated codex request has final-message path")
                    .to_str()
                    .expect("validated codex final-message path is UTF-8")
                    .to_owned(),
            );
            args.push("-".to_owned());
        }
        ProviderKindV1::Pi => {
            push_args(
                &mut args,
                &[
                    "--mode",
                    "json",
                    "-p",
                    "--no-session",
                    "--no-extensions",
                    "--approve",
                    "--model",
                    model,
                    "--append-system-prompt",
                    "You are a Forged packet worker. Follow the frozen packet and repository skills. Do not invoke Forge lead planning, dispatch, or lifecycle-control skills.",
                ],
            );
            if let Some(effort) = effort {
                push_args(&mut args, &["--thinking", effort]);
            }
            if sandbox == Sandbox::ReadOnly {
                push_args(&mut args, &["--tools", "read,grep,find,ls"]);
            }
            env.push(("FORGED_PI_WORKER", "1"));
        }
    }
    ProviderArgv {
        program: provider.program(),
        args,
        env,
    }
}

fn push_args(args: &mut Vec<String>, values: &[&str]) {
    args.extend(values.iter().map(|value| (*value).to_owned()));
}

fn shell_quote(value: &str) -> String {
    let bare = !value.is_empty()
        && value.chars().all(|c| {
            c.is_ascii_alphanumeric()
                || matches!(c, '_' | '@' | '%' | '+' | '=' | ':' | ',' | '.' | '/' | '-')
        });
    if bare {
        value.to_owned()
    } else {
        format!("'{}'", value.replace('\'', "'\"'\"'"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::os::unix::fs::PermissionsExt;

    const BRACKETED_MODEL: &str = "claude-sonnet-4[1m]";

    fn args(argv: &ProviderArgv) -> Vec<String> {
        argv.command(None)
            .get_args()
            .map(|arg| arg.to_string_lossy().into_owned())
            .collect()
    }

    #[test]
    fn shell_quote_preserves_bare_arguments_and_escapes_apostrophes() {
        assert_eq!(shell_quote("Read,Grep,Glob"), "Read,Grep,Glob");
        assert_eq!(shell_quote("model-1/path"), "model-1/path");
        assert_eq!(shell_quote(BRACKETED_MODEL), "'claude-sonnet-4[1m]'");
        assert_eq!(shell_quote("a b's"), "'a b'\"'\"'s'");
    }

    #[test]
    fn bracketed_model_reaches_claude_and_codex_argv_byte_identically() {
        let claude = provider_argv(
            ProviderKindV1::Claude,
            Sandbox::WorkspaceWrite,
            BRACKETED_MODEL,
            None,
            Some("session-1"),
            None,
        );
        assert!(args(&claude)
            .windows(2)
            .any(|pair| pair == ["--model", BRACKETED_MODEL]));

        let codex = provider_argv(
            ProviderKindV1::Codex,
            Sandbox::WorkspaceWrite,
            BRACKETED_MODEL,
            Some("high"),
            None,
            Some(Path::new("/tmp/last.txt")),
        );
        let codex_args = args(&codex);
        assert!(codex_args
            .windows(2)
            .any(|pair| pair == ["-m", BRACKETED_MODEL]));
        assert!(codex_args
            .windows(2)
            .any(|pair| pair == ["-c", "model_reasoning_effort=\"high\""]));
    }

    #[test]
    fn bracketed_model_is_single_quoted_and_cannot_glob_expand() {
        let temp = tempfile::tempdir().expect("tempdir");
        let bin = temp.path().join("bin");
        std::fs::create_dir(&bin).expect("bin");
        for program in ["claude", "codex"] {
            let shim = bin.join(program);
            std::fs::write(&shim, "#!/bin/sh\nprintf '%s\\n' \"$@\"\n").expect("shim");
            std::fs::set_permissions(&shim, std::fs::Permissions::from_mode(0o755))
                .expect("shim mode");
        }
        for glob_match in ["claude-sonnet-41", "claude-sonnet-4m"] {
            std::fs::write(temp.path().join(glob_match), "match").expect("glob fixture");
        }
        let prompt = temp.path().join("prompt.md");
        std::fs::write(&prompt, "prompt").expect("prompt");

        let cases = [
            (
                ProviderKindV1::Claude,
                "--model",
                provider_argv(
                    ProviderKindV1::Claude,
                    Sandbox::WorkspaceWrite,
                    BRACKETED_MODEL,
                    None,
                    Some("session-1"),
                    None,
                ),
            ),
            (
                ProviderKindV1::Codex,
                "-m",
                provider_argv(
                    ProviderKindV1::Codex,
                    Sandbox::WorkspaceWrite,
                    BRACKETED_MODEL,
                    Some("high"),
                    None,
                    Some(Path::new("/tmp/last.txt")),
                ),
            ),
        ];
        for (provider, model_flag, argv) in cases {
            let stdout = temp.path().join(format!("{:?}.out", provider));
            let line = argv.shell_line(&prompt, &stdout).expect("shell line");
            assert!(
                line.contains(&format!("{model_flag} '{BRACKETED_MODEL}'")),
                "{line}"
            );
            let status = Command::new("/bin/sh")
                .arg("-c")
                .arg(&line)
                .current_dir(temp.path())
                .env("PATH", &bin)
                .status()
                .expect("shell");
            assert!(status.success(), "{provider:?} shell status {status}");
            let emitted = std::fs::read_to_string(&stdout).expect("captured argv");
            let emitted = emitted.lines().collect::<Vec<_>>();
            assert!(emitted
                .windows(2)
                .any(|pair| pair == [model_flag, BRACKETED_MODEL]));
            assert!(!emitted.contains(&"claude-sonnet-41"));
            assert!(!emitted.contains(&"claude-sonnet-4m"));
        }
    }
}
