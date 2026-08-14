//! forged-proto owns the slice/v1 protocol engine and the reconcile saga:
//! the pure decision function that says what a run should do next
//! ([`advance`]), the projection that builds its input ([`project_run`]),
//! the proto-owned event kinds and replay parser ([`events`]), the
//! result-landing seam ([`land_packet_result`]), and the crash/hijack
//! reconciler ([`reconcile`]).
//!
//! This crate is the brain; the wave-2 crates are the hands. `forged-host`,
//! `forged-git`, `forged-gate`, and `forged-beads` are deliberately NOT
//! dependencies — their work reaches the engine through the
//! [`ReconcilePorts`] traits, whose signatures mirror the merged functions
//! one-for-one. The engine never spawns a provider; it emits an intent and
//! someone else honors it. This crate reads no environment variables and
//! never constructs a filesystem path.

#![deny(missing_docs)]

pub mod engine;
pub mod error;
pub mod events;
pub mod ports;
pub mod project;
pub mod reconcile;

pub use engine::{
    advance, backoff_deadline, classify_failure, machine_idempotency_key, transport_backoff_s,
    FailureKind, MachineStage, NextAction, PacketIntent, ProfileEscalation, RunView, Terminal,
    TerminalAttempt, MACHINE_STEPS,
};
pub use error::{PortError, ProtoError};
pub use events::{
    grant_retry, parse_proto_events, record, transport_failures_of, widen_rfc3339, GatePhase,
    ProtoEvent,
};
pub use ports::{
    KillOutcome, LeaseReclaim, PrSnapshot, ReconcilePorts, ResolveState, SessionLiveness,
};
pub use project::{
    packet_columns, packet_spec, project_run, project_run_with_policy, stored_packet,
};
pub use reconcile::{land_packet_result, reconcile, LandOutcome, ReconcileConfig, ReconcileReport};
