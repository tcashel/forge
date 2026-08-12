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
