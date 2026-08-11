//! Operation request/response envelopes — the outermost forged wire shape.

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

use crate::error::ErrorCode;

/// A single idempotent operation submitted to the forged core.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OperationRequest {
    pub schema_version: u32,
    pub idempotency_key: String,
    pub run_id: Option<String>,
    pub params: Map<String, Value>,
}

/// The core's answer to an [`OperationRequest`].
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OperationResponse {
    pub ok: bool,
    pub operation_id: String,
    pub reused: bool,
    pub result: Option<Value>,
    pub error: Option<OpError>,
}

/// A structured operation failure carried inside an [`OperationResponse`].
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpError {
    pub code: ErrorCode,
    pub message: String,
    pub recoverable: bool,
    pub detail: Option<Value>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn sample_request() -> OperationRequest {
        let params = match json!({"a": 1, "b": {"c": true}}) {
            Value::Object(map) => map,
            _ => unreachable!("literal is an object"),
        };
        OperationRequest {
            schema_version: 1,
            idempotency_key: "op-key-1".to_owned(),
            run_id: Some("run-1".to_owned()),
            params,
        }
    }

    #[test]
    fn request_uses_camel_case_wire_names() {
        let value = serde_json::to_value(sample_request()).expect("serializes");
        assert_eq!(value["schemaVersion"], json!(1));
        assert_eq!(value["idempotencyKey"], json!("op-key-1"));
        assert_eq!(value["runId"], json!("run-1"));
        assert_eq!(value["params"]["b"]["c"], json!(true));
    }

    #[test]
    fn request_round_trips() {
        let req = sample_request();
        let text = serde_json::to_string(&req).expect("serializes");
        let back: OperationRequest = serde_json::from_str(&text).expect("deserializes");
        assert_eq!(back, req);
    }

    #[test]
    fn response_round_trips() {
        let resp = OperationResponse {
            ok: false,
            operation_id: "op-1".to_owned(),
            reused: true,
            result: Some(json!({"n": 3})),
            error: Some(OpError {
                code: ErrorCode::WorktreeDirty,
                message: "worktree has uncommitted changes".to_owned(),
                recoverable: true,
                detail: Some(json!({"paths": ["src/lib.rs"]})),
            }),
        };
        let text = serde_json::to_string(&resp).expect("serializes");
        let back: OperationResponse = serde_json::from_str(&text).expect("deserializes");
        assert_eq!(back, resp);

        let value = serde_json::to_value(&resp).expect("serializes");
        assert_eq!(value["operationId"], json!("op-1"));
        assert_eq!(value["error"]["code"], json!("WORKTREE_DIRTY"));
        assert_eq!(value["error"]["recoverable"], json!(true));
    }

    #[test]
    fn op_error_round_trips() {
        let err = OpError {
            code: ErrorCode::Internal,
            message: "boom".to_owned(),
            recoverable: false,
            detail: None,
        };
        let text = serde_json::to_string(&err).expect("serializes");
        let back: OpError = serde_json::from_str(&text).expect("deserializes");
        assert_eq!(back, err);
    }
}
