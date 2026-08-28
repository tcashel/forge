//! The provider error taxonomy and its mapping onto the closed
//! `forged_types::ErrorCode` wire set.

use forged_types::ErrorCode;

/// A failure building an invocation, parsing captured provider output, or
/// recovering usage from a rollout file.
#[derive(Debug, thiserror::Error)]
pub enum ProviderError {
    /// An embedded path is empty, not valid UTF-8, or contains characters
    /// outside `[A-Za-z0-9/._-]` — the charset `forged-host` accepts for
    /// paths it embeds in shell lines.
    #[error("unsafe path {path:?}: {reason}")]
    UnsafePath {
        /// The offending path, lossily decoded when it was not UTF-8.
        path: String,
        /// Why the path was refused.
        reason: String,
    },
    /// A caller-controlled string would make the emitted shell line unsafe
    /// (a model outside `^[A-Za-z0-9][A-Za-z0-9._:/\[\]-]*$`, or a rollout
    /// thread id outside `^[A-Za-z0-9-]+$`).
    #[error("unsafe shell value {value:?}: {reason}")]
    UnsafeShellLine {
        /// The offending value.
        value: String,
        /// Why the value was refused.
        reason: String,
    },
    /// A reasoning effort that cannot be embedded safely: outside
    /// `^[A-Za-z0-9._-]{1,64}$`. Effort vocabulary itself is the provider
    /// CLI's contract, never a forged allowlist.
    #[error(
        "unsafe reasoning effort {effort:?}: must match ^[A-Za-z0-9._-]{{1,64}}$; the provider cli decides which efforts are valid"
    )]
    UnsupportedEffort {
        /// The effort value the packet carried.
        effort: String,
    },
    /// Captured provider output (or a template/render input) declared a
    /// field of the wrong shape — e.g. a token count that is not a
    /// non-negative integer.
    #[error("malformed provider data: {message}")]
    Malformed {
        /// What was malformed, and where.
        message: String,
    },
    /// No identity-valid rollout file for the thread exists under either
    /// `sessions/` or `archived_sessions/` of the given codex home.
    #[error("no rollout found for thread {thread_id} under {codex_home}")]
    RolloutNotFound {
        /// The thread id searched for.
        thread_id: String,
        /// The codex home that was searched.
        codex_home: String,
    },
    /// An underlying I/O failure that was not a NotFound.
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

impl ProviderError {
    /// The stable wire code for this failure, so callers never re-derive the
    /// mapping — the convention every sibling error type follows.
    pub fn wire_code(&self) -> ErrorCode {
        match self {
            ProviderError::UnsafePath { .. }
            | ProviderError::UnsafeShellLine { .. }
            | ProviderError::UnsupportedEffort { .. }
            | ProviderError::Malformed { .. }
            | ProviderError::RolloutNotFound { .. } => ErrorCode::InvalidRequest,
            ProviderError::Io(_) => ErrorCode::Internal,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn wire_code_is_total_over_the_variant_set() {
        let invalid: [ProviderError; 5] = [
            ProviderError::UnsafePath {
                path: "/bad path".to_owned(),
                reason: "space".to_owned(),
            },
            ProviderError::UnsafeShellLine {
                value: "x; rm -rf /".to_owned(),
                reason: "charset".to_owned(),
            },
            ProviderError::UnsupportedEffort {
                effort: "bogus".to_owned(),
            },
            ProviderError::Malformed {
                message: "input_tokens is a string".to_owned(),
            },
            ProviderError::RolloutNotFound {
                thread_id: "t-1".to_owned(),
                codex_home: "/tmp/codex".to_owned(),
            },
        ];
        for err in invalid {
            assert_eq!(err.wire_code(), ErrorCode::InvalidRequest, "{err}");
        }
        let io = ProviderError::Io(std::io::Error::other("disk on fire"));
        assert_eq!(io.wire_code(), ErrorCode::Internal);
    }
}
