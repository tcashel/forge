// Left "list" pane in settings mode. Reads the registered repo set from
// the repos signal and shows the currently-selected repo's metadata,
// matching the legacy renderSettingsMode list pane visually.
import { settingsRepo } from "../../signals/settings";
import { selectedRepo as selectedRepoSig } from "../../signals/ui";

export function SettingsRepoList() {
  const repo = settingsRepo.value;
  const sel = selectedRepoSig.value;
  const headerName = repo?.name || sel || "Current repo";
  return (
    <>
      <div class="settings-nav-head">
        <h2>Settings</h2>
        <p>{headerName}</p>
      </div>
      <div class="settings-nav-card">
        <b>Repo config</b>
        <span>{repo?.root || "No repo selected"}</span>
      </div>
      <div class="settings-nav-card">
        <b>Stored in</b>
        <span>~/.forge/repo-config.json</span>
      </div>
    </>
  );
}
