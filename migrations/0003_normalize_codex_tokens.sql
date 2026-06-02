-- Re-normalize historical codex token metrics.
--
-- Codex's raw `input_tokens` is the TOTAL input (cached included). The
-- codex-stream parser now subtracts the cached portion so `tokensIn` is
-- uncached/full-rate and `cacheRead` holds the cached count — matching
-- claude's disjoint-counts semantics. Rows captured before that change still
-- have cached folded into `tokensIn`; subtract it once here so per-bucket
-- comparison and the Activity rollups are adapter-agnostic.
--
-- Cost fields are untouched: estimateCost produces the same total under both
-- the old (subtract-inside-pricing) and new (subtract-at-parse) layouts.
-- Idempotent via the migration runner (_migration_history), so this never
-- double-subtracts.
UPDATE sessions
   SET metrics = json_set(
         metrics,
         '$.tokensIn',
         MAX(json_extract(metrics, '$.tokensIn') - json_extract(metrics, '$.cacheRead'), 0)
       )
 WHERE agent_adapter = 'codex'
   AND json_extract(metrics, '$.tokensIn')  IS NOT NULL
   AND json_extract(metrics, '$.cacheRead') IS NOT NULL;
