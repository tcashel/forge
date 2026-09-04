# Operation surface

Generated from the dispatch table, clap tree, MCP router, and fenced-call audit. Regenerate with `forged generate-surface-manifest`; do not edit this table directly.

`class` applies only to dispatch operations. `audience` filters MCP discovery only. `explicit key` means dispatch refuses a keyless request before any defaulting.

| Operation | CLI verb | CLI | MCP | Audience | Class | Explicit key | Dispatch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `artifact_compact` | `forged artifact compact` | yes | yes | machine | fenced | yes | yes |
| `artifact_verify` | `forged artifact verify` | yes | yes | machine | read_only | no | yes |
| `attention_acknowledge` | `forged attention acknowledge` | yes | yes | lead | fenced | no | yes |
| `attention_list` | `forged attention list` | yes | yes | lead | read_only | no | yes |
| `attention_reopen` | `forged attention reopen` | yes | yes | lead | fenced | no | yes |
| `attention_resolve` | `forged attention resolve` | yes | yes | lead | fenced | no | yes |
| `claim_next` | `forged claim-next` | yes | yes | machine | fenced | yes | yes |
| `definition_validate` | `forged definition validate` | yes | yes | lead | read_only | no | yes |
| `doctor` | `forged doctor` | yes | yes | lead | read_only | no | yes |
| `epic_abandon` | `forged epic abandon` | yes | yes | lead | fenced | no | yes |
| `epic_pause` | `forged epic pause` | yes | yes | lead | fenced | no | yes |
| `epic_preflight` | `forged epic preflight` | yes | yes | lead | read_only | no | yes |
| `epic_resolve` | `forged epic resolve` | yes | yes | lead | fenced | no | yes |
| `epic_resume` | `forged epic resume` | yes | yes | lead | fenced | no | yes |
| `epic_revise_policy` | `forged epic revise-policy` | yes | yes | lead | fenced | no | yes |
| `epic_revise_roster` | `forged epic revise-roster` | yes | yes | lead | fenced | no | yes |
| `epic_start` | `forged epic start` | yes | yes | lead | fenced | no | yes |
| `epic_status` | `forged epic status` | yes | yes | lead | read_only | no | yes |
| `epic_submit` | `forged epic submit` | yes | yes | lead | fenced | no | yes |
| `events_tail` | `forged events` | yes | yes | operator | read_only | no | yes |
| `explain` | `forged explain` | yes | yes | lead | read_only | no | yes |
| `gate_run` | `forged gate run` | yes | yes | machine | fenced | no | yes |
| `init` | `forged init` | yes | no | — | fenced | no | yes |
| `mcp` | `forged mcp` | yes | no | — | — | no | no |
| `next` | `forged next` | yes | yes | lead | read_only | no | yes |
| `operations_overview` | `forged operations overview` | yes | yes | operator | read_only | no | yes |
| `overview` | `forged overview` | yes | yes | operator | read_only | no | yes |
| `packet_claim` | `forged packet claim` | yes | yes | machine | fenced | no | yes |
| `packet_complete` | `forged packet complete` | yes | yes | machine | fenced | no | yes |
| `packet_fail` | `forged packet fail` | yes | yes | machine | fenced | no | yes |
| `packet_heartbeat` | `forged packet heartbeat` | yes | no | — | unfenced_write | no | yes |
| `packet_show` | `forged packet show` | yes | yes | machine | read_only | no | yes |
| `reconcile` | `forged reconcile` | yes | yes | machine | fenced | no | yes |
| `review_publish` | `forged review publish` | yes | yes | operator | fenced | no | yes |
| `run_accept_risk` | `forged run accept-risk` | yes | yes | lead | fenced | no | yes |
| `run_adjudicate_settlement` | `forged run adjudicate-settlement` | yes | yes | lead | fenced | no | yes |
| `run_advance` | `forged run advance` | yes | yes | machine | machine-fenced | no | yes |
| `run_drive` | `forged run drive` | yes | no | — | machine-fenced | no | yes |
| `run_retry` | `forged run retry` | yes | yes | lead | fenced | no | yes |
| `run_revise_policy` | `forged run revise-policy` | yes | yes | lead | fenced | no | yes |
| `run_revise_roster` | `forged run revise-roster` | yes | yes | lead | fenced | no | yes |
| `run_start` | `forged run start` | yes | yes | lead | fenced | no | yes |
| `run_status` | `forged run status` | yes | yes | lead | read_only | no | yes |
| `run_stop` | `forged run stop` | yes | yes | lead | fenced | no | yes |
| `run_submit` | `forged run submit` | yes | yes | lead | fenced | no | yes |
| `service_install` | `forged service install` | yes | no | — | — | no | no |
| `service_restart` | `forged service restart` | yes | no | — | — | no | no |
| `service_start` | `forged service start` | yes | no | — | — | no | no |
| `service_status` | `forged service status` | yes | no | — | — | no | no |
| `service_stop` | `forged service stop` | yes | no | — | — | no | no |
| `service_uninstall` | `forged service uninstall` | yes | no | — | — | no | no |
| `session_inventory` | `forged session inventory` | yes | yes | operator | read_only | no | yes |
| `session_list` | `forged session list` | yes | yes | lead | read_only | no | yes |
| `session_message` | `forged session message` | yes | yes | lead | fenced | no | yes |
| `session_read` | `forged session read` | yes | yes | lead | read_only | no | yes |
| `session_stop` | `forged session stop` | yes | yes | machine | fenced | no | yes |
| `supervise` | `forged supervise` | yes | no | — | machine-fenced | no | yes |
| `usage_ingest` | `forged usage ingest` | yes | yes | operator | unfenced_write | no | yes |
| `usage_report` | `forged usage` | yes | yes | lead | read_only | no | yes |
| `work_adjudicate` | `forged work adjudicate` | yes | yes | lead | fenced | no | yes |
| `work_close` | `forged work close` | yes | yes | lead | fenced | no | yes |
| `work_create` | `forged work create` | yes | yes | lead | fenced | no | yes |
| `work_detail` | `forged work detail` | yes | yes | operator | read_only | no | yes |
| `work_history` | `forged work history` | yes | yes | operator | read_only | no | yes |
| `work_import_beads` | `forged work import-beads` | yes | no | — | unfenced_write | no | yes |
| `work_link` | `forged work link` | yes | yes | lead | fenced | no | yes |
| `work_list` | `forged work list` | yes | yes | lead | read_only | no | yes |
| `work_map` | `forged work map` | yes | yes | operator | read_only | no | yes |
| `work_note_add` | `forged work note add` | yes | yes | lead | fenced | no | yes |
| `work_note_list` | `forged work note list` | yes | yes | lead | read_only | no | yes |
| `work_park` | `forged work park` | yes | yes | lead | fenced | no | yes |
| `work_promote` | `forged work promote` | yes | yes | lead | fenced | no | yes |
| `work_ready` | `forged work ready` | yes | yes | lead | read_only | no | yes |
| `work_release` | `forged work release` | yes | yes | lead | fenced | no | yes |
| `work_reopen` | `forged work reopen` | yes | yes | lead | fenced | no | yes |
| `work_revert` | `forged work revert` | yes | yes | lead | fenced | no | yes |
| `work_show` | `forged work show` | yes | yes | lead | read_only | no | yes |
| `work_supersede` | `forged work supersede` | yes | yes | lead | fenced | no | yes |
| `work_update` | `forged work update` | yes | yes | lead | fenced | no | yes |
| `worktree_retire` | `forged worktree retire` | yes | yes | operator | fenced | yes | yes |

## Deprecated projection keys

Legacy keys remain present with same-value provider-neutral twins until 1.0.

| Schema | Legacy key | Twin | Remove at |
| --- | --- | --- | --- |
| `forged.work-identity/1` | `bead` | `work` | `1.0` |
| `forged.packet/1` | `beadId` | `workId` | `1.0` |
| `forged.admission-inputs/1` | `beadId` | `workId` | `1.0` |
| `forged.admission-inputs/1` | `beadRevision` | `workRevision` | `1.0` |
| `forged.admission-inputs/1` | `beadStatus` | `workStatus` | `1.0` |
| `forged.admission-inputs/1` | `beadRepository` | `workRepository` | `1.0` |
| `forged.projection/*` | `bead` | `work` | `1.0` |
| `forged.projection/*` | `bead_id` | `work_id` | `1.0` |
| `forged.projection/*` | `beadId` | `workId` | `1.0` |
| `forged.projection/*` | `beadTitle` | `workTitle` | `1.0` |
| `forged.projection/*` | `beadRevision` | `workRevision` | `1.0` |
| `forged.projection/*` | `beadSettlement` | `workSettlement` | `1.0` |
| `forged.projection/*` | `beads` | `work` | `1.0` |
| `forged.projection/*` | `beadsStatus` | `workStatus` | `1.0` |
| `forged.projection/*` | `beadsInventory` | `workInventory` | `1.0` |

## Deprecated inputs

Legacy inputs remain accepted by the CLI until their named replacement lands.

| Operation | Parameter | Value | Replacement | Remove at |
| --- | --- | --- | --- | --- |
| `work_note_add` | `kind` | `approval` | `run_dispatch` | `ore-080.11` |
