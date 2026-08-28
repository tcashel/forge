//! Fixed-width UTC timestamps for every `*_at` and `ts` column.
//!
//! jiff's default `Display` drops trailing fractional zeros, which breaks
//! lexicographic — and therefore SQL TEXT — comparison. Every stamp the
//! ledger writes goes through [`now_iso`], which pins exactly nine fractional
//! digits and a `Z` suffix (30 bytes).

/// The current instant as a fixed-width UTC RFC-3339 string: exactly nine
/// fractional digits and a `Z` suffix, 30 bytes total.
pub(crate) fn now_iso() -> String {
    widen_fraction(&jiff::Timestamp::now().to_string())
}

/// `now + secs` in the same fixed-width form (lease expiry stamps).
pub(crate) fn now_plus_secs_iso(secs: u64) -> String {
    plus_secs_ts(jiff::Timestamp::now(), secs)
}

/// `stamp + secs` in the same fixed-width form. A stored stamp that does not
/// parse is storage corruption and fails closed.
pub(crate) fn plus_secs_iso(stamp: &str, secs: u64) -> Result<String, crate::error::LedgerError> {
    let ts: jiff::Timestamp = stamp
        .parse()
        .map_err(|err| crate::error::internal(format!("bad stored timestamp {stamp:?}: {err}")))?;
    Ok(plus_secs_ts(ts, secs))
}

fn plus_secs_ts(ts: jiff::Timestamp, secs: u64) -> String {
    let span = jiff::SignedDuration::from_secs(i64::try_from(secs).unwrap_or(i64::MAX));
    let shifted = ts.checked_add(span).unwrap_or(jiff::Timestamp::MAX);
    widen_fraction(&shifted.to_string())
}

/// Normalize an RFC-3339 UTC string (as jiff displays it) to exactly nine
/// fractional digits before the trailing `Z`.
fn widen_fraction(s: &str) -> String {
    let body = s.strip_suffix('Z').unwrap_or(s);
    let mut out = String::with_capacity(30);
    match body.find('.') {
        Some(idx) => {
            let (secs, dot_frac) = body.split_at(idx);
            let frac = &dot_frac[1..];
            out.push_str(secs);
            out.push('.');
            let take = frac.len().min(9);
            out.push_str(&frac[..take]);
            for _ in take..9 {
                out.push('0');
            }
        }
        None => {
            out.push_str(body);
            out.push_str(".000000000");
        }
    }
    out.push('Z');
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn now_iso_is_thirty_bytes_and_ends_in_z() {
        let stamp = now_iso();
        assert_eq!(stamp.len(), 30, "{stamp}");
        assert!(stamp.ends_with('Z'), "{stamp}");
        assert_eq!(stamp.as_bytes()[10], b'T', "{stamp}");
        assert_eq!(stamp.as_bytes()[19], b'.', "{stamp}");
    }

    #[test]
    fn successive_stamps_compare_lexicographically() {
        let a = now_iso();
        let b = now_iso();
        assert!(a <= b, "{a} vs {b}");
    }

    #[test]
    fn widen_fraction_pads_and_truncates() {
        assert_eq!(
            widen_fraction("2026-08-11T18:46:15Z"),
            "2026-08-11T18:46:15.000000000Z"
        );
        assert_eq!(
            widen_fraction("2026-08-11T18:46:15.123Z"),
            "2026-08-11T18:46:15.123000000Z"
        );
        assert_eq!(
            widen_fraction("2026-08-11T18:46:15.123456789Z"),
            "2026-08-11T18:46:15.123456789Z"
        );
    }
}
