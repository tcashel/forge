#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob

cd "$(dirname "$0")/.."

plugin=plugins/forged
failures=0

pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; failures=$((failures + 1)); }
check() {
  local label=$1
  shift
  if "$@"; then pass "$label"; else fail "$label"; fi
}

check_json() {
  node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' "$1"
}

check_frontmatter() {
  awk '
    NR == 1 { if ($0 != "---") exit 1; next }
    /^---$/ { found_close=1; exit }
    /^name:/ { has_name=1 }
    /^description:/ { has_description=1 }
    END { exit !(found_close && has_name && has_description) }
  ' "$1"
}

check_codex_interface() {
  node - "$1" <<'NODE'
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const ui = manifest.interface || {};
const required = ['displayName', 'shortDescription', 'longDescription', 'developerName', 'category'];
if (!required.every((key) => typeof ui[key] === 'string' && ui[key].trim())) process.exit(1);
if (!Array.isArray(ui.capabilities) || !ui.capabilities.length ||
    !ui.capabilities.every((value) => typeof value === 'string' && value.trim())) process.exit(1);
if (!Array.isArray(ui.defaultPrompt) || ui.defaultPrompt.length < 1 || ui.defaultPrompt.length > 3 ||
    !ui.defaultPrompt.every((value) => typeof value === 'string' && value.trim() && value.length <= 128)) process.exit(1);
NODE
}

check_manifest_contract() {
  node - "$plugin/.codex-plugin/plugin.json" "$plugin/.claude-plugin/plugin.json" <<'NODE'
const fs = require('fs');
const [codexPath, claudePath] = process.argv.slice(2);
const codex = JSON.parse(fs.readFileSync(codexPath, 'utf8'));
const claude = JSON.parse(fs.readFileSync(claudePath, 'utf8'));
for (const manifest of [codex, claude]) {
  if (manifest.name !== 'forged' || typeof manifest.version !== 'string' || !manifest.version.trim()) process.exit(1);
  if (manifest.skills !== './skills/' || !manifest.description?.trim() || !manifest.author?.name?.trim()) process.exit(1);
}
if (codex.version !== claude.version) process.exit(1);
NODE
}

check_marketplaces() {
  node - <<'NODE'
const fs = require('fs');
const codex = JSON.parse(fs.readFileSync('.agents/plugins/marketplace.json', 'utf8'));
const claude = JSON.parse(fs.readFileSync('.claude-plugin/marketplace.json', 'utf8'));
const c = codex.plugins?.find((entry) => entry.name === 'forged');
const h = claude.plugins?.find((entry) => entry.name === 'forged');
if (codex.name !== 'forge' || !codex.interface?.displayName?.trim()) process.exit(1);
if (!c || c.source?.source !== 'local' || c.source?.path !== './plugins/forged') process.exit(1);
if (c.policy?.installation !== 'AVAILABLE' || c.policy?.authentication !== 'ON_INSTALL' || !c.category) process.exit(1);
if (claude.name !== 'forge' || !h || h.source !== './plugins/forged') process.exit(1);
NODE
}

check_version_parity() {
  node - <<'NODE'
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('plugins/forged/.codex-plugin/plugin.json', 'utf8'));
const cargoFiles = fs.readdirSync('crates', {withFileTypes: true})
  .filter((entry) => entry.isDirectory())
  .map((entry) => `crates/${entry.name}/Cargo.toml`)
  .filter((path) => fs.existsSync(path));
for (const path of cargoFiles) {
  const match = fs.readFileSync(path, 'utf8').match(/^version\s*=\s*"([^"]+)"/m);
  if (!match || match[1] !== manifest.version) {
    console.error(`${path}: expected ${manifest.version}, got ${match?.[1] || 'missing'}`);
    process.exit(1);
  }
}
NODE
}

check_handoff_block() {
  awk -v start="$2" -v submit="$3" '
    function invokes(line, verb, tail) {
      sub(/^[[:space:]]+/, "", line)
      if (index(line, verb) != 1) return 0
      tail = substr(line, length(verb) + 1, 1)
      return tail == "" || tail ~ /[[:space:]]/
    }
    /^[[:space:]]*```/ { fenced = !fenced; froze = 0; next }
    !fenced { next }
    invokes($0, start) { froze = 1; next }
    froze && invokes($0, submit) { ok = 1 }
    END { exit !ok }
  ' "$1"
}

check_reconnect_surface() {
  local path=$1
  shift
  local verb
  for verb in "$@"; do
    awk -v verb="$verb" '
      function invokes(line, tail) {
        sub(/^[[:space:]]+/, "", line)
        if (index(line, verb) != 1) return 0
        tail = substr(line, length(verb) + 1, 1)
        return tail == "" || tail ~ /[[:space:]]/
      }
      /^[[:space:]]*```/ { fenced = !fenced; next }
      fenced && invokes($0) { found = 1 }
      END { exit !found }
    ' "$path" || return 1
  done
}

required=(
  "$plugin/README.md"
  "$plugin/LEARNINGS.md"
  "$plugin/LICENSE"
  "$plugin/NOTICE.md"
  "$plugin/agents/critic.md"
  "$plugin/bootstrap/install-beads.sh"
  "$plugin/skills/plan/schema.md"
  "$plugin/skills/plan/research.md"
  "$plugin/skills/plan/epic.md"
  "$plugin/skills/plan/checklist.md"
)
for path in "${required[@]}"; do
  [[ -f "$path" ]] && pass "required companion $path" || fail "required companion $path"
done

check "Codex marketplace JSON" check_json .agents/plugins/marketplace.json
check "Claude marketplace JSON" check_json .claude-plugin/marketplace.json
check "Codex plugin JSON" check_json "$plugin/.codex-plugin/plugin.json"
check "Claude plugin JSON" check_json "$plugin/.claude-plugin/plugin.json"
check "Codex interface" check_codex_interface "$plugin/.codex-plugin/plugin.json"
check "dual-host manifest contract" check_manifest_contract
check "marketplace source contract" check_marketplaces
check "manifest/workspace version parity" check_version_parity

skill_files=("$plugin"/skills/*/SKILL.md)
[[ ${#skill_files[@]} -eq 6 ]] && pass "exactly six skills" || fail "exactly six skills"
for path in "${skill_files[@]}"; do check "frontmatter $path" check_frontmatter "$path"; done
check "critic frontmatter" check_frontmatter "$plugin/agents/critic.md"
check "bootstrap shell syntax" bash -n "$plugin/bootstrap/install-beads.sh"
grep -Fq '../../agents/critic.md' "$plugin/skills/critique/SKILL.md" \
  && pass "critique resolves the shared critic" || fail "critique resolves the shared critic"
grep -Fq '../../bootstrap/install-beads.sh' "$plugin/skills/setup/SKILL.md" \
  && pass "setup resolves the shared bootstrap" || fail "setup resolves the shared bootstrap"

legacy=(
  "$plugin/workflows/execute-review-fix.js"
  "$plugin/workflows/run-epic.js"
  "$plugin/workflows/plan-critique-improve.js"
  "$plugin/skills/watch-epic/SKILL.md"
  "$plugin/monitors/monitors.json"
  "$plugin/agents/reviewer.md"
)
for path in "${legacy[@]}"; do
  [[ ! -e "$path" ]] && pass "legacy path absent: $path" || fail "legacy path absent: $path"
done

check "slice handoff start then submit" check_handoff_block \
  "$plugin/skills/dispatch/SKILL.md" "forged run start" "forged run submit"
check "epic handoff start then submit" check_handoff_block \
  "$plugin/skills/run-epic/SKILL.md" "forged epic start" "forged epic submit"
check "slice reconnect command surface" check_reconnect_surface \
  "$plugin/skills/dispatch/SKILL.md" \
  "forged overview --run" "forged run status --run" \
  "forged session list --run" "forged session read --attempt" \
  "forged events --run"
check "epic reconnect and resume command surface" check_reconnect_surface \
  "$plugin/skills/run-epic/SKILL.md" \
  "forged overview --epic" "forged epic status --epic" \
  "forged session list --run" "forged session read --attempt" \
  "forged events --run" "forged epic resolve --epic" \
  "forged epic submit --epic"

if grep -Ern --include='*.md' --include='*.sh' \
  '(\.anvil/specs|--spec([[:space:]]|`)|bd create --repo|--(description|acceptance|notes)-file|workflows/(execute-review-fix|run-epic|plan-critique-improve)\.js|watch-epic)' \
  "$plugin"; then
  fail "no legacy spec-file, repo-routing, Workflow, or watch contract"
else
  pass "no legacy spec-file, repo-routing, Workflow, or watch contract"
fi

if grep -Erni --include='*.md' --include='*.json' --include='*.sh' \
  '(jira|atlassian)' "$plugin"; then
  fail "no external tracker client, instructions, or credentials"
else
  pass "no external tracker client, instructions, or credentials"
fi

for needle in 'metadata.repository' 'description' 'design' 'acceptance_criteria' 'notes' '--parent'; do
  grep -Fq -- "$needle" "$plugin/skills/plan/SKILL.md" \
    && pass "native plan contract: $needle" || fail "native plan contract: $needle"
done
grep -Fq 'BEADS_DIR' "$plugin/skills/setup/SKILL.md" \
  && pass "setup preserves BEADS_DIR" || fail "setup preserves BEADS_DIR"
grep -Fq 'ANVIL_HOME' "$plugin/skills/setup/SKILL.md" \
  && pass "setup preserves ANVIL_HOME" || fail "setup preserves ANVIL_HOME"

if [[ $failures -gt 0 ]]; then exit 1; fi
