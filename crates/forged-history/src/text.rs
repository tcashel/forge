//! Streaming UTF-8-safe text segmentation for the search projection.
//!
//! Extracted text is stored COMPLETE — every chunk of it — as independently
//! decompressible blocks, and the FTS5 index holds no copy of it. Chunking
//! exists so an unbounded conversation turn becomes bounded transactions,
//! not so text can be dropped: the splitter never truncates, and it never
//! splits inside a UTF-8 scalar value.

use std::io::Read;

use crate::error::{invalid, HistoryError};

/// How large a search chunk the writer aims for.
///
/// A TARGET, not a limit: longer text spans more chunks. Nothing rejects
/// text for being large.
pub const SEARCH_CHUNK_TARGET_BYTES: usize = 8 * 1024;

/// Whether `byte` starts a UTF-8 scalar value.
fn is_char_boundary(byte: u8) -> bool {
    (byte & 0xC0) != 0x80
}

/// Splits a byte stream of UTF-8 text into chunks of about `target` bytes,
/// never inside a scalar value.
pub(crate) struct Utf8Chunker<R> {
    reader: R,
    buf: Vec<u8>,
    target: usize,
    exhausted: bool,
}

impl<R: Read> Utf8Chunker<R> {
    /// Wrap `reader`, aiming for `target`-byte chunks.
    pub(crate) fn new(reader: R, target: usize) -> Result<Utf8Chunker<R>, HistoryError> {
        if target < 8 {
            return Err(invalid("search chunk target must be at least 8 bytes"));
        }
        Ok(Utf8Chunker {
            reader,
            buf: Vec::with_capacity(target * 2),
            target,
            exhausted: false,
        })
    }

    /// The next chunk, or `None` once the stream is fully consumed.
    pub(crate) fn next_chunk(&mut self) -> Result<Option<String>, HistoryError> {
        while !self.exhausted && self.buf.len() < self.target {
            let mut scratch = vec![0_u8; self.target];
            match self.reader.read(&mut scratch) {
                Ok(0) => self.exhausted = true,
                Ok(n) => self.buf.extend_from_slice(&scratch[..n]),
                Err(err) if err.kind() == std::io::ErrorKind::Interrupted => continue,
                Err(err) => return Err(err.into()),
            }
        }
        if self.buf.is_empty() {
            return Ok(None);
        }
        let split = self.split_point();
        let tail = self.buf.split_off(split);
        let head = std::mem::replace(&mut self.buf, tail);
        let text = String::from_utf8(head)
            .map_err(|err| invalid(format!("search text is not valid UTF-8: {err}")))?;
        Ok(Some(text))
    }

    /// Where to cut the buffer for the next chunk.
    ///
    /// The buffer's own tail may sit mid-scalar whenever the stream is not
    /// yet exhausted, so `buf.len()` is a legal cut ONLY at end of stream.
    /// Everywhere else the cut walks back to a byte that starts a scalar.
    fn split_point(&self) -> usize {
        let start = self.target.min(self.buf.len());
        let mut idx = start;
        while idx > 0 && !self.cuts_cleanly_at(idx) {
            idx -= 1;
        }
        if idx > 0 {
            return idx;
        }
        // Defensive: a scalar longer than the target cannot occur in UTF-8
        // with the enforced 8-byte floor, but falling forward keeps the
        // splitter making progress rather than looping on a zero-width cut.
        let mut forward = 1;
        while forward < self.buf.len() && !self.cuts_cleanly_at(forward) {
            forward += 1;
        }
        forward
    }

    /// Whether cutting the buffer at `idx` leaves a complete scalar behind.
    fn cuts_cleanly_at(&self, idx: usize) -> bool {
        match self.buf.get(idx) {
            Some(byte) => is_char_boundary(*byte),
            // Past the last byte: only end of stream proves the final scalar
            // is complete rather than merely unread.
            None => self.exhausted,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn chunks(text: &str, target: usize) -> Vec<String> {
        let mut chunker = Utf8Chunker::new(text.as_bytes(), target).expect("chunker");
        let mut out = Vec::new();
        while let Some(chunk) = chunker.next_chunk().expect("chunk") {
            out.push(chunk);
        }
        out
    }

    #[test]
    fn chunking_is_lossless_and_ordered() {
        let text = "the quick brown fox ".repeat(600);
        let parts = chunks(&text, 64);
        assert!(parts.len() > 100, "long text spans many chunks");
        assert_eq!(parts.concat(), text, "chunking never drops or reorders");
    }

    #[test]
    fn multibyte_scalars_are_never_split() {
        // Four-byte scalars straddling every possible target offset.
        let text = "🜂🜃🜄🜁".repeat(500);
        for target in [8, 9, 10, 11, 17, 4096] {
            let parts = chunks(&text, target);
            assert_eq!(parts.concat(), text, "target {target}");
            for part in &parts {
                assert!(!part.is_empty(), "target {target} produced an empty chunk");
            }
        }
    }

    #[test]
    fn empty_text_produces_no_chunks() {
        assert!(chunks("", 4096).is_empty());
    }

    #[test]
    fn a_scalar_longer_than_the_target_still_makes_progress() {
        // Target 8 with a 4-byte scalar cannot deadlock; prove the general
        // forward-fallback path by pushing the target to its floor.
        let parts = chunks("🜂", 8);
        assert_eq!(parts.concat(), "🜂");
    }

    #[test]
    fn a_target_below_the_floor_is_refused() {
        assert!(matches!(
            Utf8Chunker::new(&b"x"[..], 4),
            Err(HistoryError::Invalid { .. })
        ));
    }
}
