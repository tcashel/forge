//! Sentinel line assembly, path/line validation, and status-file reading.
//!
//! The status file is the ONLY exit-code truth: `Liveness::Exited` is only
//! ever produced from a successfully parsed status file.

use std::path::Path;

use crate::HostError;

/// Append the sentinel to the caller's shell line:
/// `<shell_line>; echo $? > <status_path>`.
///
/// The recorded code is the exit status of the LAST command in the line
/// (`a && b` records b's status; no `set -e` or `pipefail` is injected).
pub(crate) fn append_sentinel(shell_line: &str, status_path: &Path) -> String {
    format!("{}; echo $? > {}", shell_line, status_path.display())
}

/// Validate a caller-supplied shell line for sentinel compatibility.
///
/// Refused (spawn failure) when the line is empty or whitespace-only,
/// contains a newline or carriage return, or when its last non-whitespace
/// character is `;`, `&`, or `|` — any of these makes `<line>; echo $?` a
/// shell syntax error.
pub(crate) fn validate_shell_line(shell_line: &str) -> Result<(), HostError> {
    let trimmed = shell_line.trim();
    if trimmed.is_empty() {
        return Err(HostError::spawn_failed(
            "shell_line is empty or whitespace-only",
        ));
    }
    if shell_line.contains('\n') || shell_line.contains('\r') {
        return Err(HostError::spawn_failed(
            "shell_line contains a newline or carriage return",
        ));
    }
    if let Some(last) = trimmed.chars().next_back() {
        if matches!(last, ';' | '&' | '|') {
            return Err(HostError::spawn_failed(format!(
                "shell_line ends in {last:?}, which would break the appended sentinel",
            )));
        }
    }
    Ok(())
}

/// Validate that a forged-generated status path is safe to embed in a shell
/// line: the full path must match `[A-Za-z0-9/._-]+`.
pub(crate) fn validate_status_path(status_path: &Path) -> Result<(), HostError> {
    let Some(text) = status_path.to_str() else {
        return Err(HostError::spawn_failed(
            "status path is not valid UTF-8; refusing to spawn",
        ));
    };
    let safe = !text.is_empty()
        && text
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '/' | '.' | '_' | '-'));
    if safe {
        Ok(())
    } else {
        Err(HostError::spawn_failed(format!(
            "status path {text:?} contains characters outside [A-Za-z0-9/._-]; refusing to spawn",
        )))
    }
}

/// Read the sentinel status file.
///
/// - Path absent → `Ok(None)`: fall through to the liveness path.
/// - Contents that do not fully match `^\s*-?\d+\s*$` (including the empty
///   file, since `>` truncates before `echo` writes, and values overflowing
///   i32) → `Ok(None)`: treated as NOT YET WRITTEN, re-checked next call;
///   never an error, never an inferred code.
/// - Any other I/O error (permissions, …) → `Err(HostError::SentinelIo)`.
/// - `Ok(Some(code))` only from a successfully parsed file.
pub(crate) fn read_status(status_path: &Path) -> Result<Option<i32>, HostError> {
    let bytes = match std::fs::read(status_path) {
        Ok(bytes) => bytes,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(e) => {
            return Err(HostError::sentinel_io(format!(
                "{}: {e}",
                status_path.display()
            )))
        }
    };
    let Ok(text) = std::str::from_utf8(&bytes) else {
        return Ok(None);
    };
    let trimmed = text.trim();
    let digits = trimmed.strip_prefix('-').unwrap_or(trimmed);
    if digits.is_empty() || !digits.chars().all(|c| c.is_ascii_digit()) {
        return Ok(None);
    }
    Ok(trimmed.parse::<i32>().ok())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn appended_line_has_the_exact_sentinel_shape() {
        let path = PathBuf::from("/base/proc-1-0/status");
        assert_eq!(
            append_sentinel("sleep 5", &path),
            "sleep 5; echo $? > /base/proc-1-0/status"
        );
    }

    #[test]
    fn shell_line_refusals() {
        assert!(validate_shell_line("").is_err());
        assert!(validate_shell_line("   \t ").is_err());
        assert!(validate_shell_line("echo hi\necho bye").is_err());
        assert!(validate_shell_line("echo hi\r").is_err());
        assert!(validate_shell_line("sleep 5;").is_err());
        assert!(validate_shell_line("sleep 5 &").is_err());
        assert!(validate_shell_line("cat foo |").is_err());
        assert!(validate_shell_line("sleep 5; ").is_err());
        assert!(validate_shell_line("true").is_ok());
        assert!(validate_shell_line("a && b").is_ok());
        assert!(validate_shell_line("(exit 3)").is_ok());
    }

    #[test]
    fn status_path_validation() {
        assert!(validate_status_path(Path::new("/tmp/run-1/proc-1-0/status")).is_ok());
        assert!(validate_status_path(Path::new("/tmp/bad dir/status")).is_err());
        assert!(validate_status_path(Path::new("/tmp/bad$dir/status")).is_err());
        assert!(validate_status_path(Path::new("/tmp/bad;dir/status")).is_err());
        assert!(validate_status_path(Path::new("")).is_err());
    }

    #[test]
    fn status_read_absent_falls_through() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("status");
        assert_eq!(read_status(&path).expect("read"), None);
    }

    #[test]
    fn status_read_empty_is_not_yet_written() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("status");
        std::fs::write(&path, "").expect("write");
        assert_eq!(read_status(&path).expect("read"), None);
    }

    #[test]
    fn status_read_zero_with_newline() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("status");
        std::fs::write(&path, "0\n").expect("write");
        assert_eq!(read_status(&path).expect("read"), Some(0));
    }

    #[test]
    fn status_read_bare_number() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("status");
        std::fs::write(&path, "42").expect("write");
        assert_eq!(read_status(&path).expect("read"), Some(42));
    }

    #[test]
    fn status_read_negative_number() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("status");
        std::fs::write(&path, "-3\n").expect("write");
        assert_eq!(read_status(&path).expect("read"), Some(-3));
    }

    #[test]
    fn status_read_garbage_is_not_yet_written() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("status");
        std::fs::write(&path, "garbage").expect("write");
        assert_eq!(read_status(&path).expect("read"), None);
    }

    #[test]
    fn status_read_i32_overflow_is_not_yet_written() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("status");
        std::fs::write(&path, "99999999999999").expect("write");
        assert_eq!(read_status(&path).expect("read"), None);
    }
}
