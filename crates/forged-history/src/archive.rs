//! Compression and integrity for archive blocks.
//!
//! A block is an INDEPENDENTLY DECOMPRESSIBLE Zstandard frame over a slice
//! of exact source bytes. Nothing here parses the record: the archive stores
//! what the source wrote, byte for byte, and a SHA-256 over the original
//! bytes proves it on the way back out. There is no MessagePack path and no
//! JSON reserialization — the codec decision is architectural, not a knob.

use std::io::Read;

use sha2::{Digest, Sha256};

use crate::error::{internal, invalid, HistoryError};
use crate::types::ArchiveCodec;

/// How large a block the writer aims for before starting the next one.
///
/// This is a TARGET, not a limit: content larger than it is split across
/// blocks, never rejected and never truncated. Callers cannot configure a
/// maximum source size, because refusing a large native log would silently
/// lose exactly the history the archive exists to keep.
pub const ARCHIVE_BLOCK_TARGET_BYTES: usize = 256 * 1024;

/// The Zstandard level every block is written at. Chosen for archive-shaped
/// data: written once, read rarely, kept forever.
pub(crate) const ZSTD_LEVEL: i32 = 9;

/// A compressed block plus everything needed to verify it later.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct PreparedBlock {
    /// SHA-256 over the UNCOMPRESSED bytes, lowercase hex.
    pub(crate) sha256: String,
    /// How many bytes the block holds once decompressed.
    pub(crate) uncompressed_len: i64,
    /// The Zstandard frame.
    pub(crate) compressed: Vec<u8>,
}

/// Lowercase hex for a digest.
fn hex(bytes: &[u8]) -> String {
    let mut out = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        out.push_str(&format!("{byte:02x}"));
    }
    out
}

/// SHA-256 over `bytes`, lowercase hex.
pub(crate) fn sha256_hex(bytes: &[u8]) -> String {
    hex(&Sha256::digest(bytes))
}

/// Compress one block's worth of exact source bytes.
///
/// Runs OUTSIDE any SQLite transaction by construction: the caller prepares
/// blocks first and only then opens a bounded staging transaction to store
/// them. Holding a write lock across compression would make every ingest a
/// contention event.
pub(crate) fn compress_block(bytes: &[u8]) -> Result<PreparedBlock, HistoryError> {
    let compressed = zstd::bulk::compress(bytes, ZSTD_LEVEL)
        .map_err(|err| internal(format!("zstd compression failed: {err}")))?;
    Ok(PreparedBlock {
        sha256: sha256_hex(bytes),
        uncompressed_len: bytes.len() as i64,
        compressed,
    })
}

/// Decode a stored block through its RECORDED codec.
///
/// The codec is read back from the row rather than assumed, so a block
/// written by a future encoding is refused by the closed-vocabulary decoder
/// instead of being fed to the wrong decompressor.
pub(crate) fn decode_block(
    codec: ArchiveCodec,
    compressed: &[u8],
    uncompressed_len: i64,
    expected_sha256: &str,
) -> Result<Vec<u8>, HistoryError> {
    match codec {
        ArchiveCodec::Zstd => decompress_block(compressed, uncompressed_len, expected_sha256),
    }
}

/// Decompress a stored block and PROVE it is what was written.
///
/// Both the length and the digest are checked. A block that decompresses to
/// the right length but the wrong digest is corruption, and reporting it as
/// content would quietly poison every downstream reader.
pub(crate) fn decompress_block(
    compressed: &[u8],
    uncompressed_len: i64,
    expected_sha256: &str,
) -> Result<Vec<u8>, HistoryError> {
    let capacity = usize::try_from(uncompressed_len).map_err(|_| {
        internal(format!(
            "stored block length {uncompressed_len} is not usable"
        ))
    })?;
    let bytes = zstd::bulk::decompress(compressed, capacity)
        .map_err(|err| internal(format!("zstd decompression failed: {err}")))?;
    if bytes.len() != capacity {
        return Err(internal(format!(
            "archive block decompressed to {} bytes, expected {capacity}",
            bytes.len()
        )));
    }
    let actual = sha256_hex(&bytes);
    if actual != expected_sha256 {
        return Err(internal(format!(
            "archive block digest is {actual}, expected {expected_sha256}"
        )));
    }
    Ok(bytes)
}

/// Read exactly one block's worth of bytes from `reader`, or fewer at EOF.
///
/// Returns an empty vector only at end of stream. Reads are looped because a
/// `Read` is free to return short: a short read is not EOF, and treating it
/// as one would silently truncate the archived record.
pub(crate) fn read_block(reader: &mut impl Read, target: usize) -> Result<Vec<u8>, HistoryError> {
    if target == 0 {
        return Err(invalid("archive block target must be positive"));
    }
    let mut buf = vec![0_u8; target];
    let mut filled = 0;
    while filled < target {
        match reader.read(&mut buf[filled..]) {
            Ok(0) => break,
            Ok(n) => filled += n,
            Err(err) if err.kind() == std::io::ErrorKind::Interrupted => continue,
            Err(err) => return Err(err.into()),
        }
    }
    buf.truncate(filled);
    Ok(buf)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn blocks_round_trip_exact_bytes() {
        // Deliberately non-UTF-8 and non-JSON: the archive stores bytes.
        let bytes: Vec<u8> = (0..=255_u8).cycle().take(70_000).collect();
        let block = compress_block(&bytes).expect("compress");
        assert_eq!(block.uncompressed_len, bytes.len() as i64);
        let back = decompress_block(&block.compressed, block.uncompressed_len, &block.sha256)
            .expect("decompress");
        assert_eq!(back, bytes);
    }

    #[test]
    fn every_block_is_independently_decompressible() {
        let first = compress_block(b"first block payload").expect("compress");
        let second = compress_block(b"second block payload").expect("compress");
        // The second frame decodes with no reference to the first: no
        // dictionary, no shared window, no ordering requirement.
        let back = decompress_block(&second.compressed, second.uncompressed_len, &second.sha256)
            .expect("decompress");
        assert_eq!(back, b"second block payload");
        assert_ne!(first.sha256, second.sha256);
    }

    #[test]
    fn a_corrupted_block_refuses_rather_than_returning_content() {
        let block = compress_block(b"payload").expect("compress");
        let wrong = decompress_block(&block.compressed, block.uncompressed_len, &"0".repeat(64));
        assert!(
            matches!(wrong, Err(HistoryError::Internal { .. })),
            "a digest mismatch must refuse, not return bytes"
        );
    }

    #[test]
    fn short_reads_do_not_truncate_a_block() {
        /// A reader that returns one byte at a time.
        struct Dribble(Vec<u8>, usize);
        impl Read for Dribble {
            fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
                if self.1 >= self.0.len() || buf.is_empty() {
                    return Ok(0);
                }
                buf[0] = self.0[self.1];
                self.1 += 1;
                Ok(1)
            }
        }
        let payload: Vec<u8> = (0..100_u8).collect();
        let mut reader = Dribble(payload.clone(), 0);
        assert_eq!(read_block(&mut reader, 100).expect("read"), payload);
        assert!(read_block(&mut reader, 100).expect("read").is_empty());
    }
}
