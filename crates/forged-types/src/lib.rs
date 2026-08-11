//! forged-types owns the shared wire contracts every forged crate codes
//! against: operation envelopes, error codes, canonical JSON, identifier
//! newtypes, and the work-packet schema.

pub mod canonical;
pub mod envelope;
pub mod error;
pub mod ids;
pub mod packet;

pub use canonical::{canonical_json_bytes, parse_canonical, request_sha256, CanonicalError};
pub use envelope::{OpError, OperationRequest, OperationResponse};
pub use error::ErrorCode;
pub use ids::{claude_session_id, new_claim_token, RunId, RunIdError};
pub use packet::{
    Deliverable, Finding, GateRow, Outcome, PacketResult, ProviderHints, Sandbox, Severity,
    SpecRef, Stage, StageContract, Verdict, WorkPacket,
};
