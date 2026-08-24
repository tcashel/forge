# ADR 0034 — A durable session-history archive, separate from the state ledger

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-08-24
**Related:** [`0032-forged-provider-neutral-rust-orchestrator`](./0032-forged-provider-neutral-rust-orchestrator.md), [`0033-execution-package-ownership-boundary`](./0033-execution-package-ownership-boundary.md), [`0023-sqlite-cutover-track-a`](./0023-sqlite-cutover-track-a.md), [`0010-permissive-licenses-only`](./0010-permissive-licenses-only.md)

## Context

Claude Code, Codex, and Pi each keep their own native session logs, and each
of them rotates, compacts, or deletes those logs on its own schedule. Once a
harness drops a session, the record of what was actually said — the prompts,
the tool calls, the reasoning, the token spend — is gone. forged's ledger
holds execution state, not content: it knows a run happened and how it
settled, not what the session contained.

`forged-ledger` is crash-critical. Every settlement, claim token, and
external-effect fence goes through one blocking writer thread over
`~/.anvil/state.db`. Putting hundreds of megabytes of compressed
conversation content behind that same writer would make an archive
compaction able to stall a settlement — the one thing the ledger's design
exists to prevent.

Later work needs source parsers, a sync pass, and query commands. Those can
only be built independently if the storage contract, the identity model, and
the indexing seam are frozen first.

## Options

### A — Extend `state.db` with history tables

**Pros:**
- One database, one migration ladder, one open path.
- Attempt-to-session joins are plain SQL.

**Cons:**
- Bulk content shares the crash-critical writer thread and its lock.
- A large archive's checkpoint or vacuum becomes a settlement outage.
- The two stores need opposite backup, retention, and durability policies.

### B — A separate `history.db` behind its own crate and writer thread

**Pros:**
- Archive load can never block execution state.
- Retention, purge, and rebuild policies stay independent.
- The archive can be moved, rebuilt, or discarded without risking the ledger.

**Cons:**
- Cross-store joins become an application-layer concern.
- A second schema, a second open path, a second set of pragmas.

### C — Store native logs as files under `~/.anvil/history/`

**Pros:**
- Trivial to write; the source format is preserved by definition.
- No schema to migrate.

**Cons:**
- No lexical search without a separate index anyway.
- No transactional publication, so a crash leaves half-copied files.
- Deduplication, integrity verification, and identity all become bespoke.

## Decision

Add a tenth workspace crate, `forged-history`, owning `history.db` at
`$ANVIL_HOME/history/history.db`. It does not depend on `forged-ledger`, it
never opens `state.db`, and it runs behind its own synchronous blocking
actor with its own writer thread, connection, and error type.

The archive keeps two tiers with different guarantees:

- **Durable archive.** The EXACT valid-record bytes of every ingested
  event, compressed into immutable, independently decompressible Zstandard
  blocks, content-addressed by SHA-256 over the uncompressed bytes and
  verified on every read. Records are never parsed and re-emitted, so a
  record that is not valid JSON — or that a JSON round-trip would normalize
  — comes back byte-identical.
- **Rebuildable index.** A contentless FTS5 projection holding terms and
  chunk row ids only. The complete extracted text is retained as compressed
  blocks beside the archive, so the index can be dropped and rebuilt with no
  source file present.

**Whole-corpus by default.** An absent repository predicate means every
repository. Narrowing is something a caller asks for; the archive's reason
to exist is the corpus, not one checkout.

**Source families are a closed set** of exactly `claude_code`, `codex`, and
`pi`. Every stored vocabulary in the schema is closed, carries a matching
`CHECK` constraint, and fails decoding rather than widening on an unknown
value.

**Identity.** One stable random `host_id` is generated once per archive and
never re-derived. Session identity is `(host_id, source_family,
native_session_id)`. Physical paths are OBSERVATIONS, never identity: a
session may be observed at several paths, and a path may vanish without the
session losing its content. Event identity uses the source's native event id
where one exists; where none does, it falls back to a deterministic
source-specific basis PLUS the content digest — so a native identity can
gain revisions, and a derived one cannot, because its content is part of
what makes it that event.

**Repository facts** preserve the observed cwd verbatim alongside a
lexically normalized absolute path. Normalization touches no filesystem and
the directory need not still exist. A worktree path is not a cross-host
repository identity; when host-qualified repository identity arrives it will
be a new column, not a reinterpretation of this one.

**Storage encoding is locked to Zstandard.** There is no MessagePack codec
and no JSON reserialization path. Blocks and text chunks have internal
target sizes that SPLIT content; they never reject or truncate it.

**No-cap streaming contract.** No public ingestion API requires the source
file or the event to exist as one `String`, `Vec<u8>`, or parsed JSON value,
and none accepts a configured maximum source size. Refusing a large native
log would silently lose exactly the history the archive exists to keep.

**Staged bounded publication.** An event of any size is written through
bounded staging transactions and made visible by one final publication
transaction. That transaction is metadata-only: it compresses nothing,
hashes nothing, and rewrites no blob, and it touches only this event's own
index rows — so it never scans the archive and never repeats the work
staging already did. Every committed read, FTS match, usage aggregation,
and cursor join excludes staging, and a source cursor advances only inside
a publication. Compression, hashing, and segmentation happen outside every
transaction.

**Retention and purge.** Missing sources and stale index generations are
STATES, not deletions. There is no TTL, no pruning pass, no source-missing
delete, and nothing in the crate mutates a source file. The only API naming
removal records a digest-confirmed purge tombstone as evidence; purge
execution is a separate, later, explicitly authorized path.

**Execution isolation.** The crate contains no async runtime and no
execution effect. Async callers add `spawn_blocking` at the binary seam, so
the ledger's no-transaction-across-`await` invariant is preserved by
construction on both sides.

**Rationale:** B over A because the ledger's crash-safety story is the
product, and sharing a writer with bulk content trades it away for a
convenience — a cross-store join — that the application layer can do
cheaply. B over C because transactional publication and lexical search are
requirements, and rebuilding them over a directory of files is the same
work with weaker guarantees.

**Risks to monitor:** archive growth against an operator's disk with no
retention policy in place; FTS5 rebuild time on a large corpus; the
application-layer cost of attempt-to-session joins once query commands land.

## Consequences

- The workspace has ten crates. `forged-history` is a leaf: nothing depends
  on it yet, and it depends on no other forged crate.
- Zstandard enters the dependency tree. `zstd` is MIT, `zstd-safe` and
  `zstd-sys` are MIT OR Apache-2.0, and the bundled libzstd is dual
  BSD-3-Clause OR GPL-2.0 — we take the BSD-3-Clause grant, which
  [`0010`](./0010-permissive-licenses-only.md) permits. No GPL, LGPL, or
  AGPL obligation is introduced.
- Operator scope is unchanged: `history.db` lives beside `state.db` under
  `~/.anvil/`, owner-only, and nothing is imposed on a target repository.
- Search answers honestly. With no complete index generation standing, a
  query reports itself rebuilding or unavailable rather than returning fewer
  hits from a partial index.
- Backup and recovery diverge deliberately: losing `history.db` loses
  content, losing `state.db` loses execution state, and neither loss
  compromises the other.

## Implications for current work

This ADR covers the storage and indexing seam only. Native filesystem
discovery, the per-family parsers, the sync pass, public CLI and MCP history
commands, supervisor integration, pricing, attempt-ledger reads, a semantic
index, and purge execution are all later slices building ON this contract.
They may add tables and vocabularies through new migrations; they may not
reinterpret the identity model, the two-tier guarantee, or the publication
fence without a superseding ADR.

## Non-goals locked by this ADR

- The archive does not read, write, migrate, or open `state.db`.
- The archive does not delete content on a timer, a size cap, or the
  disappearance of a source file.
- The archive does not parse-and-reserialize a native record, and does not
  gain a second storage codec.
- The archive does not cap the size of a source file or an event.
- The archive does not run async code or perform an execution effect.
