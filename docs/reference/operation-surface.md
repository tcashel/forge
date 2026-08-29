# Operation surface

Generated from the dispatch table, clap tree, MCP router, and fenced-call audit. Regenerate with `forged generate-surface-manifest`; do not edit this table directly.

`class` applies only to dispatch operations. `explicit key` means dispatch refuses a keyless request before any defaulting.

| Operation | CLI verb | CLI | MCP | Class | Explicit key | Dispatch |
| --- | --- | --- | --- | --- | --- | --- |
| `artifact_compact` | `forged artifact compact` | yes | yes | fenced | yes | yes |
| `artifact_verify` | `forged artifact verify` | yes | yes | read_only | no | yes |
| `attention_acknowledge` | `forged attention acknowledge` | yes | yes | fenced | no | yes |
| `attention_list` | `forged attention list` | yes | yes | read_only | no | yes |
| `attention_reopen` | `forged attention reopen` | yes | yes | fenced | no | yes |
| `attention_resolve` | `forged attention resolve` | yes | yes | fenced | no | yes |
| `claim_next` | `forged claim-next` | yes | yes | fenced | yes | yes |
| `definition_validate` | `forged definition validate` | yes | yes | read_only | no | yes |
| `doctor` | `forged doctor` | yes | yes | read_only | no | yes |
| `epic_abandon` | `forged epic abandon` | yes | yes | fenced | no | yes |
| `epic_advance` | `forged epic advance` | yes | yes | machine-fenced | no | yes |
| `epic_drive` | `forged epic drive` | yes | yes | machine-fenced | no | yes |
| `epic_pause` | `forged epic pause` | yes | yes | fenced | no | yes |
| `epic_preflight` | `forged epic preflight` | yes | yes | read_only | no | yes |
| `epic_resolve` | `forged epic resolve` | yes | yes | fenced | no | yes |
| `epic_resume` | `forged epic resume` | yes | yes | fenced | no | yes |
| `epic_revise_roster` | `forged epic revise-roster` | yes | yes | fenced | no | yes |
| `epic_start` | `forged epic start` | yes | yes | fenced | no | yes |
| `epic_status` | `forged epic status` | yes | yes | read_only | no | yes |
| `epic_submit` | `forged epic submit` | yes | yes | fenced | no | yes |
| `events_tail` | `forged events` | yes | yes | read_only | no | yes |
| `explain` | `forged explain` | yes | yes | read_only | no | yes |
| `gate_run` | `forged gate run` | yes | yes | fenced | no | yes |
| `init` | `forged init` | yes | no | fenced | no | yes |
| `mcp` | `forged mcp` | yes | no | — | no | no |
| `operations_overview` | `forged operations overview` | yes | yes | read_only | no | yes |
| `overview` | `forged overview` | yes | yes | read_only | no | yes |
| `packet_claim` | `forged packet claim` | yes | yes | fenced | no | yes |
| `packet_complete` | `forged packet complete` | yes | yes | fenced | no | yes |
| `packet_fail` | `forged packet fail` | yes | yes | fenced | no | yes |
| `packet_heartbeat` | `forged packet heartbeat` | yes | no | unfenced_write | no | yes |
| `packet_show` | `forged packet show` | yes | yes | read_only | no | yes |
| `reconcile` | `forged reconcile` | yes | yes | fenced | no | yes |
| `review_publish` | `forged review publish` | yes | yes | fenced | no | yes |
| `run_accept_risk` | `forged run accept-risk` | yes | yes | fenced | no | yes |
| `run_adjudicate_settlement` | `forged run adjudicate-settlement` | yes | yes | fenced | no | yes |
| `run_advance` | `forged run advance` | yes | yes | machine-fenced | no | yes |
| `run_drive` | `forged run drive` | yes | no | machine-fenced | no | yes |
| `run_revise_roster` | `forged run revise-roster` | yes | yes | fenced | no | yes |
| `run_start` | `forged run start` | yes | yes | fenced | no | yes |
| `run_status` | `forged run status` | yes | yes | read_only | no | yes |
| `run_stop` | `forged run stop` | yes | yes | fenced | no | yes |
| `run_submit` | `forged run submit` | yes | yes | fenced | no | yes |
| `service_install` | `forged service install` | yes | no | — | no | no |
| `service_restart` | `forged service restart` | yes | no | — | no | no |
| `service_start` | `forged service start` | yes | no | — | no | no |
| `service_status` | `forged service status` | yes | no | — | no | no |
| `service_stop` | `forged service stop` | yes | no | — | no | no |
| `service_uninstall` | `forged service uninstall` | yes | no | — | no | no |
| `session_inventory` | `forged session inventory` | yes | yes | read_only | no | yes |
| `session_list` | `forged session list` | yes | yes | read_only | no | yes |
| `session_message` | `forged session message` | yes | yes | fenced | no | yes |
| `session_read` | `forged session read` | yes | yes | read_only | no | yes |
| `session_stop` | `forged session stop` | yes | yes | fenced | no | yes |
| `supervise` | `forged supervise` | yes | no | machine-fenced | no | yes |
| `usage_ingest` | `forged usage ingest` | yes | yes | unfenced_write | no | yes |
| `usage_report` | `forged usage` | yes | yes | read_only | no | yes |
| `work_close` | `forged work close` | yes | yes | fenced | no | yes |
| `work_create` | `forged work create` | yes | yes | fenced | no | yes |
| `work_detail` | `forged work detail` | yes | yes | read_only | no | yes |
| `work_history` | `forged work history` | yes | yes | read_only | no | yes |
| `work_import_beads` | `forged work import-beads` | yes | no | unfenced_write | no | yes |
| `work_link` | `forged work link` | yes | yes | fenced | no | yes |
| `work_list` | `forged work list` | yes | yes | read_only | no | yes |
| `work_map` | `forged work map` | yes | yes | read_only | no | yes |
| `work_note_add` | `forged work note add` | yes | yes | fenced | no | yes |
| `work_note_list` | `forged work note list` | yes | yes | read_only | no | yes |
| `work_promote` | `forged work promote` | yes | yes | fenced | no | yes |
| `work_ready` | `forged work ready` | yes | yes | read_only | no | yes |
| `work_release` | `forged work release` | yes | yes | fenced | no | yes |
| `work_reopen` | `forged work reopen` | yes | yes | fenced | no | yes |
| `work_revert` | `forged work revert` | yes | yes | fenced | no | yes |
| `work_show` | `forged work show` | yes | yes | read_only | no | yes |
| `work_supersede` | `forged work supersede` | yes | yes | fenced | no | yes |
| `work_update` | `forged work update` | yes | yes | fenced | no | yes |
| `worktree_retire` | `forged worktree retire` | yes | yes | fenced | yes | yes |
