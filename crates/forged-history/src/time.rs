use crate::error::{invalid, HistoryError};

/// Parse RFC3339 at the API boundary and return fixed-width UTC.
pub fn canonical_timestamp(value: &str) -> Result<String, HistoryError> {
    let timestamp = value
        .parse::<jiff::Timestamp>()
        .map_err(|error| invalid(format!("invalid RFC3339 timestamp {value:?}: {error}")))?;
    Ok(widen_fraction(&timestamp.to_string()))
}

pub(crate) fn now_timestamp() -> String {
    widen_fraction(&jiff::Timestamp::now().to_string())
}

fn widen_fraction(value: &str) -> String {
    let body = value.strip_suffix('Z').unwrap_or(value);
    let mut output = String::with_capacity(30);
    match body.find('.') {
        Some(index) => {
            let (seconds, fraction) = body.split_at(index);
            output.push_str(seconds);
            output.push('.');
            let fraction = &fraction[1..];
            let take = fraction.len().min(9);
            output.push_str(&fraction[..take]);
            for _ in take..9 {
                output.push('0');
            }
        }
        None => {
            output.push_str(body);
            output.push_str(".000000000");
        }
    }
    output.push('Z');
    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn equivalent_offsets_are_canonical_fixed_width_utc() {
        assert_eq!(
            canonical_timestamp("2026-08-24T20:30:00-04:00").unwrap(),
            canonical_timestamp("2026-08-25T00:30:00Z").unwrap()
        );
        assert_eq!(
            canonical_timestamp("2026-08-25T00:30:00Z").unwrap().len(),
            30
        );
        assert!(canonical_timestamp("yesterday").is_err());
    }
}
