//! Canonical JSON: a deterministic byte serialization used for hashing, and a
//! parser that rejects the JSON ambiguities canonicalization cannot repair.
//!
//! Canonical form: object keys sorted bytewise at every depth, arrays kept in
//! order, strings escaped exactly as `serde_json` escapes them, numbers
//! restricted to integers representable as `i64` or `u64`. Because
//! `serde_json`'s documented behavior on duplicate object keys is
//! last-value-wins (duplicates vanish before canonicalization could see
//! them), [`parse_canonical`] runs a pre-parse duplicate scan over the raw
//! text and rejects any object with a repeated key.

use std::collections::BTreeSet;
use std::fmt::Write as _;

use serde_json::{Map, Value};
use sha2::{Digest, Sha256};

use crate::envelope::OperationRequest;

/// Failures producing or parsing canonical JSON.
#[derive(Debug, thiserror::Error)]
pub enum CanonicalError {
    /// A float or non-integer number appeared; canonical JSON forbids them.
    #[error("non-integer number cannot be canonicalized: {0}")]
    NonIntegerNumber(String),
    /// An object in the raw text repeated a key.
    #[error("duplicate object key: {0:?}")]
    DuplicateKey(String),
    /// The text is not valid JSON.
    #[error("invalid JSON: {0}")]
    Parse(#[from] serde_json::Error),
    /// The duplicate scan lost sync with text serde_json accepted (a bug).
    #[error("malformed JSON reached the duplicate scan")]
    Malformed,
}

/// Serialize `v` to canonical JSON bytes.
///
/// Objects are emitted with keys sorted bytewise at every depth, arrays in
/// order, strings and bools as-is; any non-integer number fails with
/// [`CanonicalError::NonIntegerNumber`].
pub fn canonical_json_bytes(v: &Value) -> Result<Vec<u8>, CanonicalError> {
    let mut buf = Vec::new();
    write_canonical(v, &mut buf)?;
    Ok(buf)
}

/// Parse `text` as JSON, rejecting duplicate object keys at any depth.
///
/// This is the safe entry point for untrusted text: `serde_json` validates
/// the syntax, then a raw-text scan rejects objects whose keys collide after
/// escape decoding (so `"\u0061"` and `"a"` count as duplicates).
pub fn parse_canonical(text: &str) -> Result<Value, CanonicalError> {
    let value: Value = serde_json::from_str(text)?;
    let mut scan = DuplicateScan {
        bytes: text.as_bytes(),
        pos: 0,
    };
    scan.value()?;
    Ok(value)
}

/// Hex-encoded SHA-256 of the canonical bytes of `req.params`.
pub fn request_sha256(req: &OperationRequest) -> Result<String, CanonicalError> {
    let params = Value::Object(req.params.clone());
    let bytes = canonical_json_bytes(&params)?;
    let digest = Sha256::digest(&bytes);
    let mut hex = String::with_capacity(digest.len() * 2);
    for byte in digest {
        write!(hex, "{byte:02x}").map_err(|_| CanonicalError::Malformed)?;
    }
    Ok(hex)
}

fn write_canonical(v: &Value, buf: &mut Vec<u8>) -> Result<(), CanonicalError> {
    match v {
        Value::Null => buf.extend_from_slice(b"null"),
        Value::Bool(true) => buf.extend_from_slice(b"true"),
        Value::Bool(false) => buf.extend_from_slice(b"false"),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                buf.extend_from_slice(i.to_string().as_bytes());
            } else if let Some(u) = n.as_u64() {
                buf.extend_from_slice(u.to_string().as_bytes());
            } else {
                return Err(CanonicalError::NonIntegerNumber(n.to_string()));
            }
        }
        Value::String(s) => {
            let encoded = serde_json::to_vec(s)?;
            buf.extend_from_slice(&encoded);
        }
        Value::Array(items) => {
            buf.push(b'[');
            for (idx, item) in items.iter().enumerate() {
                if idx > 0 {
                    buf.push(b',');
                }
                write_canonical(item, buf)?;
            }
            buf.push(b']');
        }
        Value::Object(map) => write_canonical_map(map, buf)?,
    }
    Ok(())
}

fn write_canonical_map(map: &Map<String, Value>, buf: &mut Vec<u8>) -> Result<(), CanonicalError> {
    // Sort explicitly rather than trusting Map iteration order: with the
    // default BTreeMap backend it is already bytewise-sorted, but a
    // `preserve_order` feature unification elsewhere in the tree would
    // silently change that.
    let mut keys: Vec<&String> = map.keys().collect();
    keys.sort_unstable();
    buf.push(b'{');
    for (idx, key) in keys.into_iter().enumerate() {
        if idx > 0 {
            buf.push(b',');
        }
        let encoded = serde_json::to_vec(key)?;
        buf.extend_from_slice(&encoded);
        buf.push(b':');
        let value = map.get(key).ok_or(CanonicalError::Malformed)?;
        write_canonical(value, buf)?;
    }
    buf.push(b'}');
    Ok(())
}

/// A structural scan over raw JSON text that decodes object keys (including
/// escapes) and rejects duplicates per object. The text must already have
/// been validated by `serde_json`; any desync is reported as `Malformed`.
struct DuplicateScan<'a> {
    bytes: &'a [u8],
    pos: usize,
}

impl DuplicateScan<'_> {
    fn peek(&self) -> Option<u8> {
        self.bytes.get(self.pos).copied()
    }

    fn skip_ws(&mut self) {
        while matches!(self.peek(), Some(b' ' | b'\t' | b'\n' | b'\r')) {
            self.pos += 1;
        }
    }

    fn value(&mut self) -> Result<(), CanonicalError> {
        self.skip_ws();
        match self.peek().ok_or(CanonicalError::Malformed)? {
            b'{' => self.object(),
            b'[' => self.array(),
            b'"' => self.string().map(|_| ()),
            _ => self.scalar(),
        }
    }

    fn object(&mut self) -> Result<(), CanonicalError> {
        self.pos += 1; // consume '{'
        let mut seen = BTreeSet::new();
        self.skip_ws();
        if self.peek() == Some(b'}') {
            self.pos += 1;
            return Ok(());
        }
        loop {
            self.skip_ws();
            let key = self.string()?;
            if !seen.insert(key.clone()) {
                return Err(CanonicalError::DuplicateKey(key));
            }
            self.skip_ws();
            if self.peek() != Some(b':') {
                return Err(CanonicalError::Malformed);
            }
            self.pos += 1;
            self.value()?;
            self.skip_ws();
            match self.peek() {
                Some(b',') => self.pos += 1,
                Some(b'}') => {
                    self.pos += 1;
                    return Ok(());
                }
                _ => return Err(CanonicalError::Malformed),
            }
        }
    }

    fn array(&mut self) -> Result<(), CanonicalError> {
        self.pos += 1; // consume '['
        self.skip_ws();
        if self.peek() == Some(b']') {
            self.pos += 1;
            return Ok(());
        }
        loop {
            self.value()?;
            self.skip_ws();
            match self.peek() {
                Some(b',') => self.pos += 1,
                Some(b']') => {
                    self.pos += 1;
                    return Ok(());
                }
                _ => return Err(CanonicalError::Malformed),
            }
        }
    }

    /// Skip a number, `true`, `false`, or `null`.
    fn scalar(&mut self) -> Result<(), CanonicalError> {
        while let Some(b) = self.peek() {
            if matches!(b, b',' | b']' | b'}' | b' ' | b'\t' | b'\n' | b'\r') {
                break;
            }
            self.pos += 1;
        }
        Ok(())
    }

    /// Consume a string, returning its unescaped value.
    fn string(&mut self) -> Result<String, CanonicalError> {
        if self.peek() != Some(b'"') {
            return Err(CanonicalError::Malformed);
        }
        self.pos += 1;
        let mut out = String::new();
        loop {
            let b = self.peek().ok_or(CanonicalError::Malformed)?;
            match b {
                b'"' => {
                    self.pos += 1;
                    return Ok(out);
                }
                b'\\' => {
                    self.pos += 1;
                    let esc = self.peek().ok_or(CanonicalError::Malformed)?;
                    self.pos += 1;
                    match esc {
                        b'"' => out.push('"'),
                        b'\\' => out.push('\\'),
                        b'/' => out.push('/'),
                        b'b' => out.push('\u{0008}'),
                        b'f' => out.push('\u{000C}'),
                        b'n' => out.push('\n'),
                        b'r' => out.push('\r'),
                        b't' => out.push('\t'),
                        b'u' => out.push(self.unicode_escape()?),
                        _ => return Err(CanonicalError::Malformed),
                    }
                }
                _ => {
                    let len = utf8_len(b)?;
                    let end = self.pos.checked_add(len).ok_or(CanonicalError::Malformed)?;
                    let chunk = self
                        .bytes
                        .get(self.pos..end)
                        .ok_or(CanonicalError::Malformed)?;
                    let s = std::str::from_utf8(chunk).map_err(|_| CanonicalError::Malformed)?;
                    out.push_str(s);
                    self.pos = end;
                }
            }
        }
    }

    /// Decode `\uXXXX`, pairing surrogates, with the leading `\u` consumed.
    fn unicode_escape(&mut self) -> Result<char, CanonicalError> {
        let hi = self.hex4()?;
        let code = if (0xD800..=0xDBFF).contains(&hi) {
            if self.peek() != Some(b'\\') {
                return Err(CanonicalError::Malformed);
            }
            self.pos += 1;
            if self.peek() != Some(b'u') {
                return Err(CanonicalError::Malformed);
            }
            self.pos += 1;
            let lo = self.hex4()?;
            if !(0xDC00..=0xDFFF).contains(&lo) {
                return Err(CanonicalError::Malformed);
            }
            0x10000 + ((hi - 0xD800) << 10) + (lo - 0xDC00)
        } else {
            hi
        };
        char::from_u32(code).ok_or(CanonicalError::Malformed)
    }

    fn hex4(&mut self) -> Result<u32, CanonicalError> {
        let end = self.pos.checked_add(4).ok_or(CanonicalError::Malformed)?;
        let chunk = self
            .bytes
            .get(self.pos..end)
            .ok_or(CanonicalError::Malformed)?;
        let s = std::str::from_utf8(chunk).map_err(|_| CanonicalError::Malformed)?;
        let v = u32::from_str_radix(s, 16).map_err(|_| CanonicalError::Malformed)?;
        self.pos = end;
        Ok(v)
    }
}

fn utf8_len(lead: u8) -> Result<usize, CanonicalError> {
    match lead {
        0x00..=0x7F => Ok(1),
        0xC0..=0xDF => Ok(2),
        0xE0..=0xEF => Ok(3),
        0xF0..=0xF7 => Ok(4),
        _ => Err(CanonicalError::Malformed),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;
    use serde_json::json;

    fn canonical_text(raw: &str) -> String {
        let value = parse_canonical(raw).expect("valid JSON");
        let bytes = canonical_json_bytes(&value).expect("canonicalizes");
        String::from_utf8(bytes).expect("canonical bytes are UTF-8")
    }

    #[test]
    fn empty_object_and_array() {
        assert_eq!(canonical_text("{}"), "{}");
        assert_eq!(canonical_text("[]"), "[]");
        assert_eq!(canonical_text("{ }"), "{}");
    }

    #[test]
    fn sorts_keys_bytewise_at_every_depth() {
        let raw = r#"{"b":1,"a":{"z":[1,2],"m":true,"aa":null}}"#;
        assert_eq!(
            canonical_text(raw),
            r#"{"a":{"aa":null,"m":true,"z":[1,2]},"b":1}"#
        );
    }

    #[test]
    fn unicode_keys_sort_by_utf8_bytes() {
        // "a" (0x61) sorts before "é" (0xC3 0xA9) bytewise.
        assert_eq!(canonical_text(r#"{"é":1,"a":2}"#), r#"{"a":2,"é":1}"#);
    }

    #[test]
    fn scalars_pass_through() {
        assert_eq!(canonical_text(r#""hi\n""#), r#""hi\n""#);
        assert_eq!(canonical_text("true"), "true");
        assert_eq!(canonical_text("null"), "null");
        assert_eq!(canonical_text("-42"), "-42");
        assert_eq!(canonical_text(&u64::MAX.to_string()), u64::MAX.to_string());
        assert_eq!(canonical_text(&i64::MIN.to_string()), i64::MIN.to_string());
    }

    #[test]
    fn rejects_floats_and_non_integers() {
        for raw in ["1.5", "2.0", "1e3", "-0.1", r#"{"x":[1,2.5]}"#] {
            let value: Value = serde_json::from_str(raw).expect("valid JSON");
            let err = canonical_json_bytes(&value).expect_err("must reject");
            assert!(
                matches!(err, CanonicalError::NonIntegerNumber(_)),
                "{raw} produced {err:?}"
            );
        }
    }

    #[test]
    fn request_sha256_rejects_float_params() {
        let params = match json!({"x": 1.5}) {
            Value::Object(map) => map,
            _ => unreachable!("literal is an object"),
        };
        let req = OperationRequest {
            schema_version: 1,
            idempotency_key: "k".to_owned(),
            run_id: None,
            params,
        };
        let err = request_sha256(&req).expect_err("float params must fail");
        assert!(matches!(err, CanonicalError::NonIntegerNumber(_)));
    }

    #[test]
    fn parse_canonical_rejects_duplicate_keys() {
        for raw in [
            r#"{"a":1,"a":2}"#,
            r#"{"outer":{"k":1,"k":2}}"#,
            r#"[{"k":1,"k":2}]"#,
            r#"{"a":1,"\u0061":2}"#,
        ] {
            let err = parse_canonical(raw).expect_err("must reject");
            assert!(
                matches!(err, CanonicalError::DuplicateKey(_)),
                "{raw} produced {err:?}"
            );
        }
    }

    #[test]
    fn parse_canonical_accepts_repeats_at_different_depths() {
        let raw = r#"{"a":1,"b":{"a":1},"c":[{"a":[]},{"a":{}}]}"#;
        assert!(parse_canonical(raw).is_ok());
    }

    #[test]
    fn parse_canonical_rejects_invalid_json() {
        let err = parse_canonical("{").expect_err("must reject");
        assert!(matches!(err, CanonicalError::Parse(_)));
    }

    #[test]
    fn duplicate_scan_handles_escapes_and_surrogates() {
        let raw = r#"{"line\nbreak":1,"pair😀":2,"slash\/":3}"#;
        assert!(parse_canonical(raw).is_ok());
    }

    #[test]
    fn known_sha256_vector() {
        let req = OperationRequest {
            schema_version: 1,
            idempotency_key: "k".to_owned(),
            run_id: None,
            params: Map::new(),
        };
        // SHA-256 of the two bytes "{}".
        assert_eq!(
            request_sha256(&req).expect("hashes"),
            "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a"
        );
    }

    fn json_text(entries: &[(String, i64)]) -> String {
        let mut s = String::from("{");
        for (idx, (k, v)) in entries.iter().enumerate() {
            if idx > 0 {
                s.push(',');
            }
            s.push_str(&serde_json::to_string(k).expect("key encodes"));
            s.push(':');
            s.push_str(&v.to_string());
        }
        s.push('}');
        s
    }

    fn request_from(entries: &[(String, i64)]) -> OperationRequest {
        let params = match parse_canonical(&json_text(entries)).expect("valid JSON") {
            Value::Object(map) => map,
            _ => unreachable!("json_text builds an object"),
        };
        OperationRequest {
            schema_version: 1,
            idempotency_key: "prop".to_owned(),
            run_id: None,
            params,
        }
    }

    fn entries_strategy() -> impl Strategy<Value = Vec<(String, i64)>> {
        prop::collection::btree_map("[a-zA-Z0-9_.\\-]{1,8}", any::<i64>(), 1..8)
            .prop_map(|m| m.into_iter().collect())
    }

    proptest! {
        #[test]
        fn hash_is_stable_under_key_permutation(
            (original, shuffled) in entries_strategy().prop_flat_map(|entries| {
                let shuffled = Just(entries.clone()).prop_shuffle();
                (Just(entries), shuffled)
            })
        ) {
            let a = request_sha256(&request_from(&original)).expect("hashes");
            let b = request_sha256(&request_from(&shuffled)).expect("hashes");
            prop_assert_eq!(a, b);
        }

        #[test]
        fn hash_changes_when_a_value_changes(
            entries in entries_strategy(),
            which in any::<prop::sample::Index>(),
            delta in 1_i64..=1_000_000,
        ) {
            let mut mutated = entries.clone();
            let idx = which.index(mutated.len());
            mutated[idx].1 = mutated[idx].1.wrapping_add(delta);
            let a = request_sha256(&request_from(&entries)).expect("hashes");
            let b = request_sha256(&request_from(&mutated)).expect("hashes");
            prop_assert_ne!(a, b);
        }
    }
}
