//! Secure literal-path opening for the independent history database.

use std::fs::{self, File};
use std::os::fd::{AsRawFd, FromRawFd};
use std::os::unix::ffi::OsStrExt;
use std::os::unix::fs::{DirBuilderExt, MetadataExt, PermissionsExt};
use std::path::{Component, Path, PathBuf};

use rusqlite::{Connection, OpenFlags};

use crate::error::{internal, invalid, HistoryError};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum OpenMode {
    Create,
    Existing,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct FileIdentity {
    device: u64,
    inode: u64,
}

impl FileIdentity {
    fn of(metadata: &fs::Metadata) -> Self {
        Self {
            device: metadata.dev(),
            inode: metadata.ino(),
        }
    }
}

/// A connection whose main file is still held and can be reverified before
/// and after configuration. A pinned directory walk opens the held descriptor,
/// and SQLite's live HAS_MOVED control binds its independent pathname open to
/// that descriptor before any configuration or migration write.
pub(crate) struct SecureConnection {
    pub(crate) connection: Connection,
    path: PathBuf,
    sqlite_path: PathBuf,
    _directory: File,
    descriptor: File,
    identity: FileIdentity,
}

impl SecureConnection {
    pub(crate) fn verify_identity(&self) -> Result<(), HistoryError> {
        let descriptor_metadata = self.descriptor.metadata().map_err(|error| {
            internal(format!(
                "inspecting held history descriptor {}: {error}",
                self.path.display()
            ))
        })?;
        validate_database_metadata(&self.path, &descriptor_metadata)?;
        let path_metadata = fs::symlink_metadata(&self.sqlite_path)
            .map_err(|error| internal(format!("rechecking {}: {error}", self.path.display())))?;
        validate_database_metadata(&self.path, &path_metadata)?;
        if FileIdentity::of(&descriptor_metadata) != self.identity
            || FileIdentity::of(&path_metadata) != self.identity
        {
            return Err(internal(format!(
                "history database identity changed during open: {}",
                self.path.display()
            )));
        }
        self.verify_sqlite_file_unmoved()?;
        let reported_sqlite_path = self
            .connection
            .path()
            .ok_or_else(|| internal("history SQLite connection has no main path"))?;
        let expected = self.sqlite_path.to_str().ok_or_else(|| {
            invalid(format!(
                "history database path is not valid UTF-8: {}",
                self.sqlite_path.display()
            ))
        })?;
        if reported_sqlite_path != expected {
            return Err(internal(format!(
                "history SQLite path mismatch: expected {expected:?}, got {reported_sqlite_path:?}"
            )));
        }
        Ok(())
    }

    fn verify_sqlite_file_unmoved(&self) -> Result<(), HistoryError> {
        let mut moved: libc::c_int = 0;
        // SAFETY: `Connection::handle` is used only while this exclusively
        // owned connection is idle, `main` is a static NUL-terminated schema
        // name, and SQLite writes only the integer supplied for HAS_MOVED.
        let result = unsafe {
            rusqlite::ffi::sqlite3_file_control(
                self.connection.handle(),
                c"main".as_ptr(),
                rusqlite::ffi::SQLITE_FCNTL_HAS_MOVED,
                (&mut moved as *mut libc::c_int).cast(),
            )
        };
        if result != rusqlite::ffi::SQLITE_OK {
            return Err(internal(format!(
                "SQLite could not verify live history file identity: result {result}"
            )));
        }
        if moved != 0 {
            return Err(internal(format!(
                "SQLite history database file moved during open: {}",
                self.path.display()
            )));
        }
        Ok(())
    }
}

/// The default `history.db` location.
///
/// Resolves `$ANVIL_HOME/history/history.db`, then
/// `$HOME/.anvil/history/history.db`, then `.anvil/history/history.db`.
pub fn default_history_path() -> PathBuf {
    let anvil_home = std::env::var("ANVIL_HOME").ok();
    let home = std::env::var("HOME").ok();
    resolve_history_path(anvil_home.as_deref(), home.as_deref())
}

pub(crate) fn resolve_history_path(anvil_home: Option<&str>, home: Option<&str>) -> PathBuf {
    if let Some(root) = anvil_home.filter(|value| !value.is_empty()) {
        return Path::new(root).join("history").join("history.db");
    }
    if let Some(home) = home.filter(|value| !value.is_empty()) {
        return Path::new(home)
            .join(".anvil")
            .join("history")
            .join("history.db");
    }
    Path::new(".anvil").join("history").join("history.db")
}

pub(crate) fn secure_open(
    path: &Path,
    mode: OpenMode,
) -> Result<Option<SecureConnection>, HistoryError> {
    secure_open_inner(path, mode, |_| {})
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum OpenPhase {
    BeforeSqlite,
    AfterSqlite,
}

pub(crate) fn secure_open_inner(
    path: &Path,
    mode: OpenMode,
    mut phase_hook: impl FnMut(OpenPhase),
) -> Result<Option<SecureConnection>, HistoryError> {
    let path = absolute_literal_path(path)?;
    if path.file_name().is_some_and(|name| name == "state.db") {
        return Err(invalid(format!(
            "history database may not use the execution-ledger name: {}",
            path.display()
        )));
    }
    let parent = path.parent().ok_or_else(|| {
        invalid(format!(
            "history database has no parent: {}",
            path.display()
        ))
    })?;
    validate_existing_chain(&path)?;
    let operator_root = operator_state_root(parent);
    if mode == OpenMode::Create {
        ensure_private_directories(parent)?;
    } else if !parent.exists() {
        if operator_root.exists() {
            validate_private_directory(operator_root)?;
        }
        return Ok(None);
    }
    validate_private_chain(operator_root, parent)?;

    let directory = open_pinned_directory(parent, operator_root)?;
    let file_name = path
        .file_name()
        .ok_or_else(|| invalid("history database path has no file name"))?;
    let descriptor = match mode {
        OpenMode::Create => open_create_or_existing_at(&directory, file_name, &path)?,
        OpenMode::Existing => match open_existing_file_at(&directory, file_name) {
            Ok(file) => file,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(None),
            Err(error) => {
                return Err(internal(format!(
                    "opening existing history database {}: {error}",
                    path.display()
                )))
            }
        },
    };
    let descriptor_metadata = descriptor
        .metadata()
        .map_err(|error| internal(format!("inspecting {}: {error}", path.display())))?;
    validate_database_metadata(&path, &descriptor_metadata)?;
    let identity = FileIdentity::of(&descriptor_metadata);
    let sqlite_path = descriptor_rooted_path(&directory, file_name, &path)?;

    phase_hook(OpenPhase::BeforeSqlite);
    let flags = OpenFlags::SQLITE_OPEN_READ_WRITE
        | OpenFlags::SQLITE_OPEN_NO_MUTEX
        | OpenFlags::SQLITE_OPEN_NOFOLLOW
        | if mode == OpenMode::Create {
            OpenFlags::SQLITE_OPEN_CREATE
        } else {
            OpenFlags::empty()
        };
    // Deliberately omit SQLITE_OPEN_URI. A name beginning with `file:` is a
    // literal filename, including its `?` and `#` bytes.
    let connection = Connection::open_with_flags(&sqlite_path, flags)
        .map_err(|error| internal(format!("opening SQLite {}: {error}", path.display())))?;
    phase_hook(OpenPhase::AfterSqlite);
    let secure = SecureConnection {
        connection,
        path,
        sqlite_path,
        _directory: directory,
        descriptor,
        identity,
    };
    secure.verify_identity()?;
    Ok(Some(secure))
}

fn absolute_literal_path(path: &Path) -> Result<PathBuf, HistoryError> {
    if path.as_os_str().is_empty() {
        return Err(invalid("history database path is empty"));
    }
    let absolute = if path.is_absolute() {
        path.to_path_buf()
    } else {
        std::env::current_dir()
            .map_err(|error| internal(format!("resolving current directory: {error}")))?
            .join(path)
    };
    if absolute
        .components()
        .any(|component| matches!(component, Component::ParentDir | Component::CurDir))
    {
        return Err(invalid(format!(
            "history database path must be lexically normalized: {}",
            absolute.display()
        )));
    }
    if absolute.to_str().is_none() {
        return Err(invalid("history database path must be valid UTF-8"));
    }
    // Resolve only macOS's fixed root-level compatibility aliases before
    // walking the operator-controlled suffix. Canonicalizing an arbitrary
    // existing parent here would bless a user-created symlink and erase the
    // very evidence the component walk must reject.
    for system_anchor in ["/var", "/tmp", "/etc"] {
        let anchor = Path::new(system_anchor);
        if absolute.starts_with(anchor) {
            let canonical = fs::canonicalize(anchor).map_err(|error| {
                internal(format!(
                    "resolving trusted system history anchor {system_anchor}: {error}"
                ))
            })?;
            let suffix = absolute.strip_prefix(anchor).map_err(|error| {
                internal(format!(
                    "resolving history path suffix {}: {error}",
                    absolute.display()
                ))
            })?;
            return Ok(canonical.join(suffix));
        }
    }
    Ok(absolute)
}

fn open_existing_file_at(directory: &File, file_name: &std::ffi::OsStr) -> std::io::Result<File> {
    open_file_at(
        directory,
        file_name,
        libc::O_RDWR | libc::O_NOFOLLOW | libc::O_CLOEXEC,
        0,
    )
}

fn open_create_or_existing_at(
    directory: &File,
    file_name: &std::ffi::OsStr,
    display_path: &Path,
) -> Result<File, HistoryError> {
    match open_file_at(
        directory,
        file_name,
        libc::O_RDWR | libc::O_NOFOLLOW | libc::O_CLOEXEC | libc::O_CREAT | libc::O_EXCL,
        0o600,
    ) {
        Ok(file) => Ok(file),
        Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
            open_existing_file_at(directory, file_name).map_err(|error| {
                internal(format!(
                    "opening existing history database {}: {error}",
                    display_path.display()
                ))
            })
        }
        Err(error) => Err(internal(format!(
            "creating history database {}: {error}",
            display_path.display()
        ))),
    }
}

fn open_file_at(
    directory: &File,
    file_name: &std::ffi::OsStr,
    flags: libc::c_int,
    mode: libc::c_uint,
) -> std::io::Result<File> {
    let file_name = std::ffi::CString::new(file_name.as_bytes())
        .map_err(|_| std::io::Error::new(std::io::ErrorKind::InvalidInput, "NUL in file name"))?;
    // SAFETY: the directory descriptor and C string are valid for this call;
    // a successful descriptor is immediately owned by `File` exactly once.
    let descriptor =
        unsafe { libc::openat(directory.as_raw_fd(), file_name.as_ptr(), flags, mode) };
    if descriptor < 0 {
        Err(std::io::Error::last_os_error())
    } else {
        // SAFETY: `openat` returned a fresh descriptor which is not otherwise owned.
        Ok(unsafe { File::from_raw_fd(descriptor) })
    }
}

fn open_pinned_directory(path: &Path, private_root: &Path) -> Result<File, HistoryError> {
    let mut directory = File::open(Path::new("/"))
        .map_err(|error| internal(format!("opening history filesystem root: {error}")))?;
    let mut current = PathBuf::from("/");
    for component in path.components() {
        let Component::Normal(name) = component else {
            continue;
        };
        current.push(name);
        directory = open_file_at(
            &directory,
            name,
            libc::O_RDONLY | libc::O_DIRECTORY | libc::O_NOFOLLOW | libc::O_CLOEXEC,
            0,
        )
        .map_err(|error| {
            internal(format!(
                "opening pinned history directory {}: {error}",
                current.display()
            ))
        })?;
        let metadata = directory.metadata().map_err(|error| {
            internal(format!(
                "inspecting pinned history directory {}: {error}",
                current.display()
            ))
        })?;
        validate_safe_ancestor(&current, &metadata)?;
        if current.starts_with(private_root) {
            validate_private_directory_metadata(&current, &metadata)?;
        }
    }
    Ok(directory)
}

fn descriptor_rooted_path(
    _directory: &File,
    file_name: &std::ffi::OsStr,
    display_path: &Path,
) -> Result<PathBuf, HistoryError> {
    if file_name.as_bytes().contains(&b'/') {
        return Err(invalid("history database file name contains a separator"));
    }
    Ok(display_path.to_path_buf())
}

fn validate_existing_chain(path: &Path) -> Result<(), HistoryError> {
    let mut current = PathBuf::new();
    for component in path.components() {
        current.push(component.as_os_str());
        match fs::symlink_metadata(&current) {
            Ok(metadata) => {
                if metadata.file_type().is_symlink() {
                    return Err(internal(format!(
                        "refusing symlink in history path: {}",
                        current.display()
                    )));
                }
                if current != path && !metadata.is_dir() {
                    return Err(internal(format!(
                        "refusing non-directory history ancestor: {}",
                        current.display()
                    )));
                }
                if current != path {
                    validate_safe_ancestor(&current, &metadata)?;
                }
            }
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => break,
            Err(error) => {
                return Err(internal(format!(
                    "inspecting history path {}: {error}",
                    current.display()
                )))
            }
        }
    }
    Ok(())
}

fn validate_safe_ancestor(path: &Path, metadata: &fs::Metadata) -> Result<(), HistoryError> {
    let mode = metadata.mode();
    let sticky_world_writable = mode & 0o002 != 0 && mode & 0o1000 != 0;
    if mode & 0o022 != 0 && !sticky_world_writable {
        return Err(internal(format!(
            "refusing writable history ancestor: {}",
            path.display()
        )));
    }
    Ok(())
}

fn ensure_private_directories(path: &Path) -> Result<(), HistoryError> {
    let mut current = PathBuf::new();
    for component in path.components() {
        current.push(component.as_os_str());
        match fs::symlink_metadata(&current) {
            Ok(metadata) => {
                if metadata.file_type().is_symlink() || !metadata.is_dir() {
                    return Err(internal(format!(
                        "refusing unsafe history directory: {}",
                        current.display()
                    )));
                }
                validate_safe_ancestor(&current, &metadata)?;
            }
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                let mut builder = fs::DirBuilder::new();
                builder.mode(0o700);
                match builder.create(&current) {
                    Ok(()) => {}
                    Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {}
                    Err(error) => {
                        return Err(internal(format!(
                            "creating private history directory {}: {error}",
                            current.display()
                        )))
                    }
                }
                let metadata = fs::symlink_metadata(&current).map_err(|error| {
                    internal(format!("verifying {}: {error}", current.display()))
                })?;
                if metadata.file_type().is_symlink() || !metadata.is_dir() {
                    return Err(internal(format!(
                        "history directory was substituted: {}",
                        current.display()
                    )));
                }
            }
            Err(error) => {
                return Err(internal(format!(
                    "inspecting history directory {}: {error}",
                    current.display()
                )))
            }
        }
    }
    Ok(())
}

fn validate_private_directory(path: &Path) -> Result<(), HistoryError> {
    let metadata = fs::symlink_metadata(path)
        .map_err(|error| internal(format!("inspecting {}: {error}", path.display())))?;
    if metadata.file_type().is_symlink() || !metadata.is_dir() {
        return Err(internal(format!(
            "history database parent is not a directory: {}",
            path.display()
        )));
    }
    validate_private_directory_metadata(path, &metadata)
}

fn validate_private_directory_metadata(
    path: &Path,
    metadata: &fs::Metadata,
) -> Result<(), HistoryError> {
    if !metadata.is_dir() {
        return Err(internal(format!(
            "history database parent is not a directory: {}",
            path.display()
        )));
    }
    let uid = unsafe { libc::geteuid() };
    if metadata.uid() != uid {
        return Err(internal(format!(
            "history database parent is not owned by the current user: {}",
            path.display()
        )));
    }
    if metadata.permissions().mode() & 0o077 != 0 {
        return Err(internal(format!(
            "history database parent is not owner-only: {}",
            path.display()
        )));
    }
    Ok(())
}

fn operator_state_root(parent: &Path) -> &Path {
    if parent.file_name().is_some_and(|name| name == "history") {
        parent.parent().unwrap_or(parent)
    } else {
        parent
    }
}

fn validate_private_chain(root: &Path, parent: &Path) -> Result<(), HistoryError> {
    validate_private_directory(root)?;
    let suffix = parent.strip_prefix(root).map_err(|error| {
        internal(format!(
            "history state root {} does not contain parent {}: {error}",
            root.display(),
            parent.display()
        ))
    })?;
    let mut current = root.to_path_buf();
    for component in suffix.components() {
        current.push(component.as_os_str());
        validate_private_directory(&current)?;
    }
    Ok(())
}

fn validate_database_metadata(path: &Path, metadata: &fs::Metadata) -> Result<(), HistoryError> {
    if metadata.file_type().is_symlink() || !metadata.is_file() {
        return Err(internal(format!(
            "history database is not a regular file: {}",
            path.display()
        )));
    }
    let uid = unsafe { libc::geteuid() };
    if metadata.uid() != uid {
        return Err(internal(format!(
            "history database is not owned by the current user: {}",
            path.display()
        )));
    }
    if metadata.permissions().mode() & 0o077 != 0 {
        return Err(internal(format!(
            "history database is not owner-only: {}",
            path.display()
        )));
    }
    if metadata.nlink() != 1 {
        return Err(internal(format!(
            "history database has {} hard links: {}",
            metadata.nlink(),
            path.display()
        )));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::os::unix::fs::{symlink, PermissionsExt};

    #[test]
    fn default_path_precedence_is_exact() {
        assert_eq!(
            resolve_history_path(Some("/operator"), Some("/home/me")),
            PathBuf::from("/operator/history/history.db")
        );
        assert_eq!(
            resolve_history_path(Some(""), Some("/home/me")),
            PathBuf::from("/home/me/.anvil/history/history.db")
        );
        assert_eq!(
            resolve_history_path(None, Some("")),
            PathBuf::from(".anvil/history/history.db")
        );
    }

    #[test]
    fn no_create_absence_creates_nothing() {
        let scratch = crate::test_scratch();
        let path = scratch.path().join("missing/history.db");
        assert!(secure_open(&path, OpenMode::Existing).unwrap().is_none());
        assert!(!path.parent().unwrap().exists());
    }

    #[test]
    fn symlinks_hard_links_special_files_and_unsafe_modes_are_refused() {
        let scratch = crate::test_scratch();
        let real = scratch.path().join("real");
        fs::create_dir(&real).unwrap();
        fs::set_permissions(&real, fs::Permissions::from_mode(0o700)).unwrap();
        let link = scratch.path().join("link");
        symlink(&real, &link).unwrap();
        assert!(secure_open(&link.join("history.db"), OpenMode::Create).is_err());

        let db = real.join("history.db");
        secure_open(&db, OpenMode::Create).unwrap();
        let alias = real.join("alias.db");
        fs::hard_link(&db, &alias).unwrap();
        assert!(secure_open(&db, OpenMode::Existing).is_err());

        let fifo = real.join("pipe.db");
        let fifo_bytes = std::ffi::CString::new(fifo.as_os_str().as_encoded_bytes()).unwrap();
        assert_eq!(unsafe { libc::mkfifo(fifo_bytes.as_ptr(), 0o600) }, 0);
        assert!(secure_open(&fifo, OpenMode::Existing).is_err());

        let open_dir = scratch.path().join("open");
        fs::create_dir(&open_dir).unwrap();
        fs::set_permissions(&open_dir, fs::Permissions::from_mode(0o755)).unwrap();
        assert!(secure_open(&open_dir.join("history.db"), OpenMode::Create).is_err());
    }

    #[test]
    fn deterministic_substitution_is_detected_before_configuration() {
        for phase in [OpenPhase::BeforeSqlite, OpenPhase::AfterSqlite] {
            let scratch = crate::test_scratch();
            let parent = scratch.path().join("history");
            fs::create_dir(&parent).unwrap();
            fs::set_permissions(&parent, fs::Permissions::from_mode(0o700)).unwrap();
            let path = parent.join("history.db");
            File::create(&path).unwrap();
            fs::set_permissions(&path, fs::Permissions::from_mode(0o600)).unwrap();
            let replacement = parent.join("replacement.db");
            File::create(&replacement).unwrap();
            fs::set_permissions(&replacement, fs::Permissions::from_mode(0o600)).unwrap();
            let original = parent.join("original.db");
            let result = secure_open_inner(&path, OpenMode::Existing, |observed| {
                if observed == phase {
                    fs::rename(&path, &original).unwrap();
                    fs::rename(&replacement, &path).unwrap();
                }
            });
            assert!(result.is_err(), "phase {phase:?}");
        }
    }

    #[test]
    fn aba_substitution_of_sqlites_live_file_is_detected() {
        let scratch = crate::test_scratch();
        let parent = scratch.path().join("history");
        fs::create_dir(&parent).unwrap();
        fs::set_permissions(&parent, fs::Permissions::from_mode(0o700)).unwrap();
        let path = parent.join("history.db");
        File::create(&path).unwrap();
        fs::set_permissions(&path, fs::Permissions::from_mode(0o600)).unwrap();
        let replacement = parent.join("replacement.db");
        File::create(&replacement).unwrap();
        fs::set_permissions(&replacement, fs::Permissions::from_mode(0o600)).unwrap();
        let original = parent.join("original.db");

        let result = secure_open_inner(&path, OpenMode::Existing, |phase| match phase {
            OpenPhase::BeforeSqlite => {
                fs::rename(&path, &original).unwrap();
                fs::rename(&replacement, &path).unwrap();
            }
            OpenPhase::AfterSqlite => {
                fs::rename(&path, &replacement).unwrap();
                fs::rename(&original, &path).unwrap();
            }
        });
        assert!(result.is_err());
    }

    #[test]
    fn owner_only_directory_and_file_modes_are_enforced_in_both_modes() {
        let scratch = crate::test_scratch();
        let parent = scratch.path().join("history");
        let path = parent.join("history.db");
        secure_open(&path, OpenMode::Create).unwrap();

        fs::set_permissions(&path, fs::Permissions::from_mode(0o640)).unwrap();
        assert!(secure_open(&path, OpenMode::Existing).is_err());
        fs::set_permissions(&path, fs::Permissions::from_mode(0o600)).unwrap();

        fs::set_permissions(&parent, fs::Permissions::from_mode(0o750)).unwrap();
        assert!(secure_open(&path, OpenMode::Existing).is_err());
        assert!(secure_open(&path, OpenMode::Create).is_err());
    }
}
