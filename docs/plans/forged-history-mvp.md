# Forged machine-wide session history MVP

**Status:** Approved implementation plan
**Reference implementation:** Juice at `e1c6f355221bc0085c132fcd076e3217a58516f0`

## 1. Product contract

Forged maintains a durable archive of persisted agent sessions for the current
operator across the whole host.

MVP sources:

- Claude desktop and CLI through the shared Claude session family;
- Codex desktop and CLI through the shared Codex event family;
- Pi agent;
- Forged attempt links to those native sessions, without duplicate ingestion.

Core behavior:

- Search spans every repository by default.
- Repository, host, source, role, model, and time are optional filters.
- Native source deletion, truncation, movement, or compaction never deletes
  archived history.
- Only an explicit Forged purge destroys archived content.
- No semantic search.
- No networking or multi-host aggregation in the MVP.
- No imported Juice file-size or record-size caps.

## 2. Crate and process boundary

Add:

```text
crates/forged-history
```

Operator storage:

```text
~/.anvil/history/history.db
```

This remains separate from `~/.anvil/state.db`.

History corruption, migration failure, indexing failure, or lock contention
must never affect:

- claims and leases;
- attempt fencing;
- controllers;
- GitHub operations;
- work settlement.

`forged history` commands dispatch through the history subsystem without
requiring the execution ledger to open.

## 3. Storage format decision

Do **not** transcode source JSON to MessagePack during ingestion.

That would add another serialization pass to the ingestion hot path, while FTS
search cannot operate directly on MessagePack anyway.

### Archive

Parse each source record once while streaming. During that pass:

1. extract normalized metadata;
2. emit searchable text chunks;
3. extract usage;
4. feed the original source bytes directly into segmented Zstandard archive
   blocks.

There is no JSON to MessagePack to database conversion.

Archive blocks are:

- immutable;
- independently decompressible;
- checksummed;
- segmented independently of session size;
- stored with a codec/version field;
- capable of representing a single event across multiple segments.

Segmentation is a storage implementation detail, not an admission limit. No
source content is omitted because it is large.

### Search text

Extracted text is split at valid UTF-8 boundaries into independently
decompressible chunks:

```text
search_chunks
  chunk_id
  event_id
  session_id
  chunk_ordinal
  text_zstd
  uncompressed_bytes
  role
  timestamp
```

A contentless FTS5 table stores the lexical index:

```text
history_fts USING fts5(
  text,
  content='',
  contentless_delete=1
)
```

Search therefore works as:

```text
FTS5/BM25
  -> matching chunk IDs
  -> relational metadata filters
  -> top results
  -> decompress only winning chunks
  -> build snippets
  -> serialize bounded JSON
```

Search does not parse or decompress complete sessions.

## 4. Core schema

```text
hosts
sessions
session_observations
events
event_archive_parts
archive_blocks
search_chunks
history_fts
usage_events
attempt_session_links
source_roots
source_files
sync_cursors
sync_runs
purge_tombstones
```

Canonical session identity:

```text
(host_id, source_family, native_session_id)
```

Every event preserves, where available:

```text
native_event_id
native_parent_id
source ordinal
role
timestamp
model
tool name
error state
revision identity
```

Pi's tree is retained rather than flattened. Claude subagent relationships are
also retained.

## 5. Durable retention

### Source disappearance

After a complete successful inventory:

- missing source paths are marked missing;
- the session and all events remain archived and searchable;
- no content rows or FTS rows are deleted.

An incomplete or failed inventory cannot mark anything missing.

### Movement and duplication

Codex active/archive moves and desktop/CLI duplicate snapshots resolve to one
native session. Exact event identities and hashes prevent duplicate content and
usage.

### Truncation, rewrite, and compaction

- Previously archived events remain.
- New or changed event revisions are appended.
- Exact duplicates are ignored.
- The latest revision is used for ordinary transcript rendering.
- Historical removed content remains searchable.
- Superseded conflicting revisions remain explicitly inspectable.

### Explicit purge

```bash
forged history purge --session ...
forged history purge --repo ...
forged history purge --source ...
```

Purge first produces a manifest containing affected sessions, events, archive
bytes, and a digest. Execution requires that digest.

A tombstone prevents the next sync from silently restoring purged content while
the native source still exists. Tombstones can later be explicitly released.

No automatic retention expiration exists.

## 6. Source ingestion

### Claude

Use Juice's current behavior as the reference for:

- standard source roots;
- desktop/CLI shared session identity;
- parent and subagent discovery;
- repeated assistant-record usage deduplication;
- model and cache-token extraction;
- malformed trailing records.

### Codex

Port the behavioral rules for:

- active and archived roots;
- desktop/CLI modern event envelopes;
- native ID reconciliation;
- moved and duplicate snapshots;
- valid-prefix recovery;
- turn context and token-count extraction.

### Pi

Read:

- the standard Pi session root;
- configured Pi session roots;
- explicitly configured additional Forged roots.

Preserve:

- session header identity;
- event IDs and parent IDs;
- branches;
- model changes;
- assistant and nested-tool usage;
- reported cost.

Arbitrary session roots that were never configured or observed cannot be
discovered by scanning the entire filesystem.

### Provenance

Port behavior into Rust using synthetic fixtures. Do not import real transcript
material. Record the exact Juice files and tests used as behavioral references
so later format changes can be audited.

## 7. Incremental ingestion and long-session performance

### Fast append path

For each source file, retain:

```text
device/inode identity
last complete-record offset
source generation
boundary fingerprint
last observed size/mtime
parser version
```

When append eligibility holds:

- seek directly to the previous complete-record offset;
- parse only new bytes;
- append archive blocks, events, usage, and FTS chunks;
- preserve all existing row IDs.

Work is proportional to new bytes.

### Rewrite path

When the file shrinks, changes identity, or fails append validation:

- stream the file from the beginning;
- reconcile event identities and hashes;
- insert only unseen events or revisions;
- never load the complete file into memory.

### Streaming parser

The parser must not use `read_to_end`, `read_line` for unbounded records, or
deserialize a complete source file into `serde_json::Value`.

Use:

- buffered byte scanning for JSONL boundaries;
- streaming JSON token extraction;
- a spool-backed fallback for unusually large individual records;
- incremental text emission into FTS chunks;
- bounded preparation and database-write queues.

There is no source file, event, session-length, or message-count cap.

## 8. Synchronization

Commands:

```bash
forged history sync
forged history status
forged history sources
```

The installed supervisor:

- watches known roots for changes;
- queues changed paths;
- performs bounded incremental ingestion;
- periodically runs a complete metadata census because filesystem events can
  be lost.

Without the service, explicit sync performs the census. Reads report
`lastSyncedAt`; they do not unexpectedly run a complete scan.

SQLite uses WAL for concurrent service writes and CLI/MCP reads. A
history-specific cross-process sync lease prevents duplicate scanners.
Filesystem reads, parsing, hashing, and compression happen outside SQLite
transactions.

## 9. Search and read APIs

CLI:

```bash
forged history search "query"
forged history list
forged history show SESSION
forged history stats
```

Default search covers the entire local corpus.

Optional narrowing:

```text
--host
--repo
--source
--role
--model
--since
--until
--session
```

MCP parity:

```text
history_search
history_list
history_show
history_stats
```

No repository argument is required.

All responses include host, source, repository, session, and event provenance.
Search, list, and show use stable cursors instead of large offsets.

Agent output is JSON. Large CLI transcript reads may use JSONL pages. MCP uses
bounded pages and continuation cursors. Response bounds do not limit what
Forged archives or indexes.

## 10. Usage and cost

Store usage per native event or provider call:

```text
provider
model
input_tokens
output_tokens
cache_read_tokens
cache_write_tokens
reasoning_tokens
reported_cost_usd
native_usage_identity
```

Cost is calculated at query time and labeled:

```text
reported
imputed_api_rate
unavailable
```

Subscription-client API-rate values are described as equivalent estimates, not
charges.

Forged attempt usage and history usage are linked but never summed as separate
copies of the same native session.

## 11. Future multi-host compatibility

Generate a stable random `host_id` during host initialization. Every session
and event is host-qualified.

Search filters accept optional host sets. No host filter means the entire
available corpus.

The MVP remains local, but the following are preserved for future federation:

- globally host-qualified session identities;
- immutable archive blocks;
- event checksums;
- append-only usage;
- purge tombstones;
- host and repository provenance in every result.

No replication protocol or central coordinator is included now.

## 12. Delivery sequence

1. ADR and frozen public contracts.
2. `forged-history` schema, archive blocks, and FTS.
3. Claude discoverer/parser.
4. Codex discovery and reconciliation.
5. Pi tree-aware parser.
6. Incremental append and rewrite reconciliation.
7. Background supervisor integration.
8. CLI search/list/show/stats.
9. MCP parity.
10. Usage/cost integration.
11. Purge/tombstone lifecycle.
12. Performance, corruption, concurrency, and retention hardening.

## 13. Acceptance gates

The MVP is not complete until tests prove:

- native deletion does not remove Forged history;
- repeated sync produces no duplicate events, FTS hits, or usage;
- desktop/CLI snapshots reconcile correctly;
- a long-session append does not reread the prefix;
- a large source is never materialized in memory;
- one very large record follows the streaming/spool path;
- Pi branches remain distinguishable;
- source truncation retains prior history;
- searches cover multiple repositories by default;
- concurrent service ingestion and MCP search remain correct;
- FTS can rebuild solely from the retained archive;
- history database corruption does not affect execution-ledger commands;
- Forged-linked sessions do not double-count cost;
- purge tombstones prevent accidental reingestion;
- all normal Forged workspace gates remain green.

## 14. Non-goals

- Semantic or vector search.
- Automatic memory injection into agent prompts.
- Multi-host networking, replication, or federation.
- A UI for browsing history.
- Mutating any native agent session store.
- Treating repository scope as the default search boundary.
