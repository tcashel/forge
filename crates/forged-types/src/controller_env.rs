//! The controller-only environment a spawned subprocess must never inherit.
//!
//! A detached controller fences attempt ownership through these variables.
//! Any child that inherits them is indistinguishable from the controller
//! itself, so a repository's own tests and build scripts observe an ownership
//! claim they never made. One shared list keeps the provider and gate launch
//! paths from drifting apart.

/// Every environment variable that names the live controller.
///
/// Both subprocess launch paths — provider streaming and gate execution —
/// remove all of these before spawning. Extend this list, never a local copy.
pub const CONTROLLER_ENV: [&str; 5] = [
    "FORGED_CONTROLLER_PID_PATH",
    "FORGED_CONTROLLER_LSTART_PATH",
    "FORGED_CONTROLLER_SCOPE",
    "FORGED_CONTROLLER_ID",
    "FORGED_CONTROLLER_GENERATION",
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_list_is_unique_and_names_only_controller_variables() {
        let mut seen = std::collections::BTreeSet::new();
        for name in CONTROLLER_ENV {
            assert!(
                seen.insert(name),
                "{name} appears twice; a duplicate hides a missing variable"
            );
            assert!(
                name.starts_with("FORGED_CONTROLLER_"),
                "{name} is not controller-scoped and would strip unrelated state"
            );
        }
    }
}
