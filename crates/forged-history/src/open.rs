//! Where the archive lives and what it refuses to open.
//!
//! The archive is operator-scoped and owner-private. Both open modes refuse
//! a symlink or a special file standing where the database belongs, and the
//! create mode establishes owner-only permissions on the directory it makes
//! and the file it creates. Nothing here ever touches `state.db`.

use std::path::{Component, Path, PathBuf};

use crate::error::{unsafe_path, HistoryError};

/// The archive's file name under its `history` directory.
pub(crate) const HISTORY_DB_FILE: &str = "history.db";

/// The directory the archive lives in, relative to the anvil home.
pub(crate) const HISTORY_DIR: &str = "history";

/// The default `history.db` location.
///
/// Resolves, in order: `$ANVIL_HOME` (set and non-empty) →
/// `$ANVIL_HOME/history/history.db`; else `$HOME` (set and non-empty) →
/// `$HOME/.anvil/history/history.db`; else the relative path
/// `.anvil/history/history.db`. Empty env values count as unset. Never
/// panics, never errors.
pub fn default_history_db_path() -> PathBuf {
    let anvil_home = std::env::var("ANVIL_HOME").ok();
    let home = std::env::var("HOME").ok();
    resolve_history_db_path(anvil_home.as_deref(), home.as_deref())
}

/// Pure resolution behind [`default_history_db_path`], testable without
/// mutating process env.
pub(crate) fn resolve_history_db_path(anvil_home: Option<&str>, home: Option<&str>) -> PathBuf {
    if let Some(anvil) = anvil_home.filter(|v| !v.is_empty()) {
        return Path::new(anvil).join(HISTORY_DIR).join(HISTORY_DB_FILE);
    }
    if let Some(home) = home.filter(|v| !v.is_empty()) {
        return Path::new(home)
            .join(".anvil")
            .join(HISTORY_DIR)
            .join(HISTORY_DB_FILE);
    }
    Path::new(".anvil").join(HISTORY_DIR).join(HISTORY_DB_FILE)
}

/// Lexically normalize `path` to an absolute form WITHOUT touching the
/// filesystem.
///
/// `..` is folded against the preceding component, `.` is dropped, and
/// repeated separators collapse. A relative input yields `None`: making it
/// absolute would require a working directory the archive does not own, and
/// guessing one would fabricate a repository identity. The directory need
/// not exist — a repository fact outlives the checkout it describes.
pub fn lexically_normalize_absolute(path: &Path) -> Option<String> {
    let mut out: Vec<std::ffi::OsString> = Vec::new();
    let mut prefix = String::new();
    let mut rooted = false;
    for component in path.components() {
        match component {
            Component::Prefix(p) => {
                prefix = p.as_os_str().to_string_lossy().into_owned();
            }
            Component::RootDir => rooted = true,
            Component::CurDir => {}
            Component::ParentDir => {
                // Popping past the root is a no-op, exactly as the kernel
                // treats `/..`.
                out.pop();
            }
            Component::Normal(part) => out.push(part.to_os_string()),
        }
    }
    if !rooted {
        return None;
    }
    let mut rendered = prefix;
    rendered.push('/');
    let joined: Vec<String> = out
        .iter()
        .map(|p| p.to_string_lossy().into_owned())
        .collect();
    rendered.push_str(&joined.join("/"));
    Some(rendered)
}

/// Establish the archive's parent directory with owner-only permissions.
///
/// Directories this call creates are made `0700` from the start — never
/// created world-readable and tightened afterwards. An existing parent must
/// already be a real directory: a symlink standing in for it is a
/// substitution attempt and is refused rather than followed.
pub(crate) fn establish_parent(db_path: &Path) -> Result<(), HistoryError> {
    let Some(parent) = db_path.parent().filter(|p| !p.as_os_str().is_empty()) else {
        return Ok(());
    };
    match std::fs::symlink_metadata(parent) {
        Ok(meta) if meta.file_type().is_symlink() => {
            return Err(unsafe_path(
                parent,
                "the parent directory is a symlink; refusing to follow it",
            ));
        }
        Ok(meta) if !meta.is_dir() => {
            return Err(unsafe_path(parent, "the parent path is not a directory"));
        }
        Ok(_) => return Ok(()),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => {}
        Err(err) => {
            return Err(unsafe_path(parent, format!("cannot inspect: {err}")));
        }
    }
    create_owner_only_dir(parent)
}

#[cfg(unix)]
fn create_owner_only_dir(parent: &Path) -> Result<(), HistoryError> {
    use std::os::unix::fs::DirBuilderExt;
    std::fs::DirBuilder::new()
        .recursive(true)
        .mode(0o700)
        .create(parent)
        .map_err(|err| unsafe_path(parent, format!("cannot create: {err}")))
}

#[cfg(not(unix))]
fn create_owner_only_dir(parent: &Path) -> Result<(), HistoryError> {
    std::fs::create_dir_all(parent)
        .map_err(|err| unsafe_path(parent, format!("cannot create: {err}")))
}

/// Whether an object stands at `db_path`, refusing anything that is not a
/// plain owner-owned regular file.
///
/// On unix the check is made against an OPEN FILE DESCRIPTOR obtained with
/// `O_NOFOLLOW`, so a symlink swapped in between a `stat` and the open loses
/// the race by construction: the open itself fails. `O_NONBLOCK` keeps a
/// FIFO planted at the path from blocking the process before `fstat` can
/// reject it. Where the platform gives no such guarantee the check falls
/// back to `symlink_metadata`, which still refuses symlinks and non-files.
pub(crate) fn validate_database_file(db_path: &Path) -> Result<bool, HistoryError> {
    #[cfg(unix)]
    {
        validate_database_file_unix(db_path)
    }
    #[cfg(not(unix))]
    {
        match std::fs::symlink_metadata(db_path) {
            Ok(meta) if meta.file_type().is_symlink() => Err(unsafe_path(
                db_path,
                "a symlink stands where the archive must be",
            )),
            Ok(meta) if !meta.is_file() => Err(unsafe_path(
                db_path,
                "a non-regular file stands where the archive must be",
            )),
            Ok(_) => Ok(true),
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(false),
            Err(err) => Err(unsafe_path(db_path, format!("cannot inspect: {err}"))),
        }
    }
}

#[cfg(unix)]
fn validate_database_file_unix(db_path: &Path) -> Result<bool, HistoryError> {
    use std::os::unix::fs::{MetadataExt, OpenOptionsExt};

    let opened = std::fs::OpenOptions::new()
        .read(true)
        .custom_flags(libc::O_NOFOLLOW | libc::O_NONBLOCK)
        .open(db_path);
    let file = match opened {
        Ok(file) => file,
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => return Ok(false),
        Err(err) if err.raw_os_error() == Some(libc::ELOOP) => {
            return Err(unsafe_path(
                db_path,
                "a symlink stands where the archive must be",
            ));
        }
        Err(err) => {
            return Err(unsafe_path(db_path, format!("cannot open: {err}")));
        }
    };
    // Validate the OPENED object, not the name: this metadata comes from the
    // descriptor, so it describes exactly what a subsequent open of the same
    // inode would see.
    let meta = file
        .metadata()
        .map_err(|err| unsafe_path(db_path, format!("cannot inspect opened file: {err}")))?;
    if !meta.is_file() {
        return Err(unsafe_path(
            db_path,
            "the opened object is not a regular file",
        ));
    }
    // SAFETY: `geteuid` takes no arguments, cannot fail, and touches no
    // memory the caller owns.
    let euid = unsafe { libc::geteuid() };
    if meta.uid() != euid {
        return Err(unsafe_path(
            db_path,
            format!(
                "owned by uid {} but this process runs as {euid}",
                meta.uid()
            ),
        ));
    }
    tighten_file_permissions(db_path, &meta)?;
    Ok(true)
}

/// Force `0600` on the archive file when it is looser.
#[cfg(unix)]
fn tighten_file_permissions(db_path: &Path, meta: &std::fs::Metadata) -> Result<(), HistoryError> {
    use std::os::unix::fs::PermissionsExt;
    let mode = meta.permissions().mode() & 0o777;
    if mode & 0o077 == 0 {
        return Ok(());
    }
    std::fs::set_permissions(db_path, std::fs::Permissions::from_mode(0o600))
        .map_err(|err| unsafe_path(db_path, format!("cannot restrict permissions: {err}")))
}

/// Create the archive file itself with owner-only permissions.
///
/// SQLite would otherwise create it under the process umask. Creating it
/// here first, exclusively, means the file is never observable at a looser
/// mode — and `O_EXCL` makes a symlink planted at the path fail the create
/// instead of writing through it.
pub(crate) fn precreate_owner_only(db_path: &Path) -> Result<(), HistoryError> {
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        match std::fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .mode(0o600)
            .open(db_path)
        {
            Ok(_) => Ok(()),
            Err(err) if err.kind() == std::io::ErrorKind::AlreadyExists => Ok(()),
            Err(err) => Err(unsafe_path(db_path, format!("cannot create: {err}"))),
        }
    }
    #[cfg(not(unix))]
    {
        match std::fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(db_path)
        {
            Ok(_) => Ok(()),
            Err(err) if err.kind() == std::io::ErrorKind::AlreadyExists => Ok(()),
            Err(err) => Err(unsafe_path(db_path, format!("cannot create: {err}"))),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_path_prefers_anvil_home() {
        assert_eq!(
            resolve_history_db_path(Some("/x/anvil"), Some("/home/u")),
            PathBuf::from("/x/anvil/history/history.db")
        );
    }

    #[test]
    fn default_path_falls_back_to_home() {
        for anvil in [None, Some("")] {
            assert_eq!(
                resolve_history_db_path(anvil, Some("/home/u")),
                PathBuf::from("/home/u/.anvil/history/history.db")
            );
        }
    }

    #[test]
    fn default_path_falls_back_to_relative() {
        for home in [None, Some("")] {
            assert_eq!(
                resolve_history_db_path(None, home),
                PathBuf::from(".anvil/history/history.db")
            );
        }
    }

    #[test]
    fn normalization_folds_dots_without_touching_the_filesystem() {
        let cases = [
            ("/a/b/../c", "/a/c"),
            ("/a/./b/", "/a/b"),
            ("/a//b///c", "/a/b/c"),
            ("/../..", "/"),
            ("/", "/"),
        ];
        for (input, want) in cases {
            assert_eq!(
                lexically_normalize_absolute(Path::new(input)).as_deref(),
                Some(want),
                "{input}"
            );
        }
        // A repository that no longer exists still normalizes.
        assert_eq!(
            lexically_normalize_absolute(Path::new("/nonexistent/repo/../repo")).as_deref(),
            Some("/nonexistent/repo")
        );
        // A relative cwd yields no repository identity rather than a guess.
        assert_eq!(lexically_normalize_absolute(Path::new("repo/x")), None);
    }
}
