# ADR 0034 — Durable native-session history is an independent archive

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-08-24
**Related:** [`0032-forged-provider-neutral-rust-orchestrator`](./0032-forged-provider-neutral-rust-orchestrator.md), [`0033-execution-package-ownership-boundary`](./0033-execution-package-ownership-boundary.md)

## Context

Claude Code, Codex, and Pi each retain native session material in a different
shape and may remove it independently. The execution ledger records Forged
runs and attempts, but is neither an archive of provider-native records nor a
safe place to evolve source parsers and lexical indexing. Downstream history
parsers need a frozen provider-neutral storage seam that survives source-file
loss without coupling archive correctness to execution state.

Search has a different durability profile from original records. Exact native
bytes and normalized evidence must remain authoritative; a lexical index must
be disposable and reproducible. Treating both as one representation either
makes search rebuild destructive or leaves the original record dependent on a
provider codec.

## Decision

The `forged-history` crate owns an independent operator-scoped SQLite database
at `$ANVIL_HOME/history/history.db` (falling back to
`$HOME/.anvil/history/history.db`). It does not depend on `forged-ledger` and
contains no async runtime or execution effect. A dedicated blocking writer
actor owns its SQLite connection; async callers will isolate calls with
`spawn_blocking` at a later binary seam.

The durable representation has these boundaries:

- Source families are the closed set `claude_code`, `codex`, and `pi`.
  Database-local session identity is `(host_id, source_family,
  native_session_id)`. Physical paths are observations, not identity. A future
  cross-host repository identity must remain host-qualified rather than
  equating worktree paths across machines.
- Exact valid-record bytes are retained without parsing/reserialization in
  immutable, independently decompressible Zstandard blocks. SHA-256 covers
  each block and the aggregate revision. The Rust Zstandard dependency chain
  is permissively licensed (MIT and/or Apache-2.0).
- Prepared normalized metadata, ordered lineage, usage evidence, and complete
  extracted text participate in a versioned fingerprint. Identical full
  fingerprints replay as no-ops; changed meaning under one native event key is
  an append-only retained revision.
- Public ingest and exact-readback seams stream readers, iterators, segmented
  parts, and writers. There is no configured source/event size cap and no API
  requirement for a whole source file or event in one `String`, `Vec<u8>`,
  JSON value, or MessagePack object. Internal independently tuned batches bound
  archive, text, usage, and rebuild transactions without truncating content.
- Contentless FTS5 is a rebuildable projection over retained compressed search
  chunks. Queries default to the whole corpus when no repository predicate is
  supplied. Generation membership and a searchable-corpus epoch fence ranked
  continuations; incomplete generations are never advertised.
- Missing source observations and parser/index generations are states, not
  deletion. There is no automatic TTL, source-missing delete, or arbitrary
  retention limit. A later purge path may act only on canonical digest-backed
  tombstone evidence; this slice records evidence but performs no purge.

Create and no-create opens treat paths literally, refuse URI interpretation,
walk the trusted absolute path without following operator-controlled symlinks,
enforce current-user ownership and owner-only state, reject hard links and
special files, and verify the live SQLite path against a held prevalidated
file identity before migrations or writes. `state.db` is never a valid history
target.

## Consequences

- Provider-native deletion does not remove committed sessions, revisions,
  exact bytes, usage, or searchability.
- FTS can be dropped and rebuilt in bounded resumable transactions solely from
  retained chunks. This costs rebuild time and duplicate compressed text
  storage in exchange for keeping plaintext out of durable ordinary tables.
- A prepared event is staged through bounded transactions and becomes visible
  only through one constant-size parent publication fence. Crashes can leave
  reclaimable staging but cannot advance cursors or expose partial meaning.
- Later discovery, parser, pricing, semantic-index, CLI, and MCP work consumes
  this seam without changing its archive encoding or execution ownership.

## Non-goals locked by this ADR

- Native filesystem discovery or parsing.
- Public CLI or MCP history commands.
- Supervisor integration, attempt-ledger reads, or execution effects.
- Pricing, semantic/vector indexing, purge execution, TTL, pruning, or a
  configured source-size ceiling.
