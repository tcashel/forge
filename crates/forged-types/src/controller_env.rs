//! Forged-owned environment that selected subprocesses must never inherit.
//!
//! A detached controller fences attempt ownership through these variables.
//! Any child that inherits them is indistinguishable from the controller
//! itself, so a repository's own tests and build scripts observe an ownership
//! claim they never made. Gate children also run repository code, which must
//! not observe the operator's forged state. Shared lists keep each spawn path
//! explicit without conflating those separate contracts.

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

/// Operator-state variables that repository gate commands must not observe.
///
/// Gates execute repository-owned code, so inheriting these would run that
/// code against the operator's forged config and legacy import store. Provider
/// children are forged-owned agents and deliberately retain this state.
pub const OPERATOR_STATE_ENV: [&str; 3] = ["ANVIL_HOME", "FORGED_CONFIG", "BEADS_DIR"];

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

    #[test]
    fn the_operator_state_list_is_unique_and_disjoint_from_controller_identity() {
        let mut seen = std::collections::BTreeSet::new();
        for name in OPERATOR_STATE_ENV {
            assert!(
                seen.insert(name),
                "{name} appears twice; a duplicate hides a missing variable"
            );
            assert!(
                !CONTROLLER_ENV.contains(&name),
                "{name} belongs to both contracts; keep their spawn semantics separate"
            );
        }
    }
}
