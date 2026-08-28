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
if (ui.defaultPrompt.some((value) => value.includes('/forged:'))) process.exit(1);
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
for (const key of ['version', 'description', 'homepage', 'repository', 'license', 'skills']) {
  if (codex[key] !== claude[key]) process.exit(1);
}
if (codex.author.name !== claude.author.name) process.exit(1);
NODE
}

check_manage_work_contract() {
  node - "$1" "$2" <<'NODE'
const fs = require('fs');
const [skillPath, fixturePath] = process.argv.slice(2);
const skill = fs.readFileSync(skillPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

const requiredSkillText = [
  'name: manage-work',
  'Position:',
  'Next:',
  'Boundary:',
  '../plan/SKILL.md',
  '../configure/SKILL.md',
  '../critique/SKILL.md',
  '../adjudicate/SKILL.md',
  '../dispatch/SKILL.md',
  '../run-epic/SKILL.md',
  'forged-execution-approval/1',
  'forged definition validate',
  'forged doctor',
  'forged service status',
  'forged work update',
  'forged work show',
  '--expected-revision',
  'workItemId',
  'metadata.repository',
];
if (!requiredSkillText.every((token) => skill.includes(token))) process.exit(1);

const approvalStart = skill.indexOf('## Require exact execution approval');
const approvalEnd = skill.indexOf('## Bind every existing-work control', approvalStart);
if (approvalStart < 0 || approvalEnd <= approvalStart) process.exit(1);
const approvalSection = skill.slice(approvalStart, approvalEnd);
const requiredApprovalText = [
  'APPROVED_NOTES_PATH',
  '[[ ! -r "$APPROVED_NOTES_PATH" || ! -s "$APPROVED_NOTES_PATH" ]]',
  '[[ -z "$APPROVED_NOTES" ]]',
  '--expected-revision "$OBSERVED_REVISION"',
  '--notes="$APPROVED_NOTES"',
];
if (!requiredApprovalText.every((token) => approvalSection.includes(token))) process.exit(1);

if (fixture.schema !== 'forged.manage-work-intent-fixtures/1' ||
    fixture.purpose !== 'validation-only' ||
    fixture.budgetScope !== 'base intent classification only; delegated skills and portfolio-control-fixtures enforce their own contracts' ||
    !Array.isArray(fixture.cases)) process.exit(1);
if (Object.keys(fixture).sort().join('\n') !== ['budgetScope', 'cases', 'purpose', 'schema'].join('\n')) process.exit(1);

const expected = new Map(Object.entries({
  observe: ['observe', 'none', 'read-only'],
  explore: ['explore', 'none', 'discuss'],
  plan: ['plan', 'plan', 'delegate'],
  revise: ['revise', 'plan', 'delegate'],
  configure: ['configure', 'configure', 'delegate'],
  critique: ['critique', 'critique', 'delegate'],
  adjudicate: ['adjudicate', 'adjudicate', 'delegate'],
  'plan-approval': ['plan-approval', 'none', 'no-execution'],
  'execute-slice': ['execute-slice', 'dispatch', 'execute-once'],
  'execute-epic': ['execute-epic', 'run-epic', 'execute-once'],
  'ambiguous-approval': ['ambiguous-approval', 'none', 'refuse'],
  'stale-approval': ['stale-approval', 'none', 'refuse'],
  status: ['status', 'none', 'read-only'],
  control: ['control', 'none', 'portfolio-control'],
  'external-context': ['external-context', 'none', 'discuss'],
}));
const effectKeys = [
  'workItemNotesUpdates', 'runStarts', 'runSubmits', 'epicStarts', 'epicSubmits',
  'controlCalls', 'serviceMutations', 'providerCalls', 'githubWrites',
].sort();
const seen = new Set();
for (const entry of fixture.cases) {
  if (!entry || typeof entry !== 'object' || seen.has(entry.id) || !expected.has(entry.id)) process.exit(1);
  if (Object.keys(entry).sort().join('\n') !==
      ['decision', 'delegate', 'id', 'request', 'result', 'routerMutationBudget'].join('\n')) process.exit(1);
  seen.add(entry.id);
  if (typeof entry.request !== 'string' || !entry.request.trim()) process.exit(1);
  const [decision, delegate, result] = expected.get(entry.id);
  if (entry.decision !== decision || entry.delegate !== delegate || entry.result !== result) process.exit(1);
  const budget = entry.routerMutationBudget;
  if (!budget || Object.keys(budget).sort().join('\n') !== effectKeys.join('\n')) process.exit(1);
  if (!Object.values(budget).every((value) => Number.isInteger(value) && value >= 0)) process.exit(1);

  const expectedNonzero = entry.id === 'execute-slice'
    ? {workItemNotesUpdates: 1, runStarts: 1, runSubmits: 1}
    : entry.id === 'execute-epic'
      ? {workItemNotesUpdates: 1, epicStarts: 1, epicSubmits: 1}
      : {};
  for (const key of effectKeys) {
    if (budget[key] !== (expectedNonzero[key] || 0)) process.exit(1);
  }
}
if (seen.size !== expected.size) process.exit(1);
NODE
}

check_manage_work_portfolio_contract() {
  node - "$1" "$2" <<'NODE'
const fs = require('fs');
const [skillPath, fixturePath] = process.argv.slice(2);
const skill = fs.readFileSync(skillPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

const requiredSkillText = [
  'forged operations overview',
  'forged work detail',
  'forged.operations-overview/1',
  'forged.work-detail/1',
  'forged.work-identity/1',
  'forged.attention-item/1',
  'forged.attention-transition/1',
  'forged.attention-transition-result/1',
  'ui://forged/operations-overview.html',
  'ui://forged/work-detail.html',
  'detailTarget.subjectKind',
  'detailTarget.subjectId',
  'forged epic pause',
  'forged epic resume',
  'forged run stop',
  '--outcome cancelled',
  'forged run accept-risk',
  'forged attention acknowledge',
  'forged attention resolve',
  'forged attention reopen',
  'forged work update',
  '--expected-revision',
  'Current main does **not** expose priority mutation',
  'Intended priority:',
  'ore-063',
  'top-level `priority` value is unchanged',
  'lower numbers win',
  'never preempts active work',
  'accepted-unknown',
  'evidence-absent',
  'manifest-less attempt',
  'forged run adjudicate-settlement',
  'ADJUDICATION_REQUIRED',
  'session stop',
  'portfolio-control-fixtures.json',
];
if (!requiredSkillText.every((token) => skill.includes(token))) process.exit(1);

if (fixture.schema !== 'forged.manage-work-portfolio-control-fixtures/1' ||
    fixture.purpose !== 'validation-only' ||
    !Array.isArray(fixture.cases) ||
    Object.keys(fixture).sort().join('\n') !==
      ['cases', 'isolation', 'purpose', 'schema', 'schemas'].join('\n')) process.exit(1);

const expectedIsolation = {
  requiredTemporaryEnv: ['HOME', 'ANVIL_HOME', 'FORGED_CONFIG'],
  fakeBoundaries: ['forged-ledger', 'forged-cli', 'forged-mcp', 'service', 'provider', 'git', 'github', 'app-host'],
  liveEffects: 'forbidden',
};
if (JSON.stringify(fixture.isolation) !== JSON.stringify(expectedIsolation)) process.exit(1);
const expectedSchemas = {
  operationsOverview: 'forged.operations-overview/1',
  workDetail: 'forged.work-detail/1',
  workIdentity: 'forged.work-identity/1',
  attentionItem: 'forged.attention-item/1',
  attentionTransition: 'forged.attention-transition/1',
  attentionTransitionResult: 'forged.attention-transition-result/1',
};
if (JSON.stringify(fixture.schemas) !== JSON.stringify(expectedSchemas)) process.exit(1);

const expected = new Map(Object.entries({
  'status-unscoped': ['operations-overview', 'none', 'bounded-portfolio'],
  'status-repository': ['operations-overview', 'none', 'exact-repository-only'],
  'needs-me': ['operations-overview', 'none', 'needs-me-group'],
  'app-unavailable': ['operations-overview', 'none', 'structured-fallback'],
  'detail-exact': ['work-detail', 'none', 'exact-work-ref'],
  'title-unique': ['operations-then-detail', 'none', 'unique-canonical-target'],
  'title-zero': ['refuse', 'not-applicable', 'not-found-no-mutation'],
  'title-ambiguous': ['refuse', 'bounded-target', 'disambiguate-no-mutation'],
  'blocker-explanation': ['work-detail', 'none', 'evidence-and-next-action'],
  'spend-known': ['work-detail', 'none', 'known-spend'],
  'spend-unknown': ['work-detail', 'none', 'unknown-not-zero'],
  'plan-only-detail': ['refuse', 'not-applicable', 'plan-summary-only'],
  'priority-change': ['work-notes-priority-intent', 'none', 'priority-only-lower-wins-later-no-preemption',
    {workItemNotesUpdates: 1}],
  'epic-pause': ['epic-pause', 'none', 'paused-readback', {epicPauses: 1}],
  'epic-resume': ['epic-resume', 'none', 'active-readback-no-submit', {epicResumes: 1}],
  'input-required-resume': ['work-detail', 'not-applicable', 'resolve-domain-first'],
  'slice-cancel': ['run-stop-cancelled', 'destructive', 'cancelled-terminal-readback',
    {runStops: 1}],
  'slice-pause-unsupported': ['refuse', 'not-applicable', 'unsupported-no-session-stop'],
  'epic-stop-unsupported': ['refuse', 'not-applicable', 'offer-pause-boundary'],
  'stale-precondition': ['refuse', 'not-applicable', 'stale-input-required'],
  'duplicate-response': ['refuse', 'not-applicable', 'readback-no-retry'],
  'attention-acknowledge-lead': ['attention-acknowledge', 'none',
    'acknowledged-still-active', {attentionAcknowledgements: 1}],
  'attention-resolve-lead': ['attention-resolve', 'none',
    'accepted-unknown-readback', {attentionResolutions: 1}],
  'attention-resolve-human': ['attention-resolve', 'human-decision',
    'resolved-after-domain-evidence', {attentionResolutions: 1}],
  'attention-source-backed': ['refuse', 'not-applicable', 'domain-transition-only'],
  'attention-stale-occurrence': ['refuse', 'not-applicable',
    'stale-occurrence-no-mutation'],
  'attention-reopen': ['attention-reopen', 'none', 'open-new-decision-required',
    {attentionReopens: 1}],
  'review-risk-acceptance': ['run-accept-risk', 'human-decision',
    'accepted-risk-readback', {riskAcceptances: 1}],
  'merge-approval': ['refuse', 'human-decision', 'human-github-boundary'],
  'session-diagnostic': ['session-diagnostic', 'none', 'read-only-attempt-detail'],
  'session-stop-substitution': ['refuse', 'not-applicable', 'work-control-required'],
  'adjudicate-unfenceable': ['run-adjudicate-settlement', 'destructive',
    'adjudicated-terminal-readback', {runAdjudications: 1}],
  'adjudicate-fenceable-refused': ['refuse', 'not-applicable',
    'live-fence-run-stop-only'],
}));
const effectKeys = [
  'workItemClaims', 'workItemNotesUpdates', 'workItemOtherWrites',
  'epicPauses', 'epicResumes', 'runStops', 'runAdjudications',
  'riskAcceptances',
  'attentionAcknowledgements', 'attentionResolutions', 'attentionReopens',
  'runStarts', 'runSubmits', 'epicStarts', 'epicSubmits', 'sessionStops',
  'serviceMutations', 'providerCalls', 'repositoryWrites', 'githubWrites',
].sort();
const alwaysZero = [
  'workItemClaims', 'workItemOtherWrites', 'runStarts', 'runSubmits', 'epicStarts',
  'epicSubmits', 'sessionStops', 'serviceMutations', 'providerCalls',
  'repositoryWrites', 'githubWrites',
];
const seen = new Set();
for (const entry of fixture.cases) {
  if (!entry || typeof entry !== 'object' || seen.has(entry.id) || !expected.has(entry.id)) process.exit(1);
  if (Object.keys(entry).sort().join('\n') !==
      ['confirmation', 'effectBudget', 'id', 'postcondition', 'request', 'route'].join('\n')) process.exit(1);
  seen.add(entry.id);
  if (typeof entry.request !== 'string' || !entry.request.trim()) process.exit(1);
  const [route, confirmation, postcondition, nonzero = {}] = expected.get(entry.id);
  if (entry.route !== route || entry.confirmation !== confirmation ||
      entry.postcondition !== postcondition) process.exit(1);
  const budget = entry.effectBudget;
  if (!budget || Object.keys(budget).sort().join('\n') !== effectKeys.join('\n')) process.exit(1);
  if (!Object.values(budget).every((value) => Number.isInteger(value) && value >= 0 && value <= 1)) process.exit(1);
  for (const key of effectKeys) {
    if (budget[key] !== (nonzero[key] || 0)) process.exit(1);
  }
  if (!alwaysZero.every((key) => budget[key] === 0)) process.exit(1);
  if (Object.values(budget).reduce((sum, value) => sum + value, 0) > 1) process.exit(1);
}
if (seen.size !== expected.size) process.exit(1);
NODE
}

check_manage_work_host_parity_contract() {
  node - "$1" <<'NODE'
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const parityPathArgument = process.argv[2];
const repoRoot = fs.realpathSync('.');

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function stableJson(value) {
  return JSON.stringify(stable(value));
}

function exactKeys(value, expected, label) {
  invariant(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object`);
  invariant(
    stableJson(Object.keys(value).sort()) === stableJson([...expected].sort()),
    `${label} has an unexpected key set`,
  );
}

function readJson(file, label) {
  let value;
  try {
    value = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${label} is not readable strict JSON: ${error.message}`);
  }
  return value;
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function resolveInside(root, relativePath, expectedKind, label) {
  invariant(typeof relativePath === 'string' && relativePath.length > 0, `${label} path is missing`);
  invariant(!path.isAbsolute(relativePath) && !relativePath.includes('\0'), `${label} path must be relative`);
  const lexical = path.resolve(root, relativePath);
  invariant(isInside(root, lexical), `${label} path escapes its root`);
  const real = fs.realpathSync(lexical);
  invariant(isInside(root, real), `${label} symlink escapes its root`);
  const stat = fs.statSync(real);
  invariant(
    expectedKind === 'file' ? stat.isFile() : stat.isDirectory(),
    `${label} is not a ${expectedKind}`,
  );
  return real;
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function inventorySkills(skillsRoot) {
  const files = [];
  const activeDirectories = new Set();

  function walk(logicalDirectory) {
    const realDirectory = fs.realpathSync(logicalDirectory);
    invariant(isInside(skillsRoot, realDirectory), 'skill directory symlink escapes the shared skill root');
    invariant(!activeDirectories.has(realDirectory), 'skill directory symlink creates a cycle');
    activeDirectories.add(realDirectory);
    for (const name of fs.readdirSync(logicalDirectory).sort()) {
      const logicalChild = path.join(logicalDirectory, name);
      const realChild = fs.realpathSync(logicalChild);
      invariant(isInside(skillsRoot, realChild), 'skill file symlink escapes the shared skill root');
      const stat = fs.statSync(realChild);
      if (stat.isDirectory()) {
        walk(logicalChild);
      } else if (stat.isFile()) {
        const relative = path.relative(skillsRoot, logicalChild).split(path.sep).join('/');
        files.push({path: relative, sha256: sha256(fs.readFileSync(logicalChild))});
      } else {
        throw new Error('shared skill tree contains a non-file entry');
      }
    }
    activeDirectories.delete(realDirectory);
  }

  walk(skillsRoot);
  files.sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0);
  const entrypoints = files
    .map((entry) => entry.path)
    .filter((relative) => /^[^/]+\/SKILL\.md$/.test(relative));
  const expectedEntrypoints = [
    'adjudicate/SKILL.md',
    'board/SKILL.md',
    'configure/SKILL.md',
    'critique/SKILL.md',
    'dispatch/SKILL.md',
    'manage-work/SKILL.md',
    'plan/SKILL.md',
    'run-epic/SKILL.md',
    'setup/SKILL.md',
  ];
  invariant(stableJson(entrypoints) === stableJson(expectedEntrypoints), 'shared skill entrypoint inventory moved');
  return {files, digest: sha256(Buffer.from(stableJson(files)))};
}

const commonManifestKeys = [
  'author', 'description', 'homepage', 'license', 'name', 'repository', 'skills', 'version',
];

function validateCommonManifest(manifest, label) {
  invariant(manifest.name === 'forged', `${label} plugin identity moved`);
  invariant(typeof manifest.version === 'string' && manifest.version.length > 0, `${label} version is missing`);
  invariant(typeof manifest.description === 'string' && manifest.description.trim(), `${label} description is missing`);
  invariant(manifest.skills === './skills/', `${label} shared skill path moved`);
  invariant(manifest.author?.name === 'Tripp Cashel', `${label} author moved`);
  exactKeys(manifest.author, ['name'], `${label} author`);
  for (const key of ['homepage', 'repository', 'license']) {
    invariant(typeof manifest[key] === 'string' && manifest[key].trim(), `${label} ${key} is missing`);
  }
}

function loadHost(host) {
  const isClaude = host === 'claude';
  const marketplaceRelative = isClaude
    ? '.claude-plugin/marketplace.json'
    : '.agents/plugins/marketplace.json';
  const manifestRelative = isClaude
    ? '.claude-plugin/plugin.json'
    : '.codex-plugin/plugin.json';
  const marketplacePath = resolveInside(repoRoot, marketplaceRelative, 'file', `${host} marketplace`);
  const marketplace = readJson(marketplacePath, `${host} marketplace`);

  invariant(marketplace.name === 'forge', `${host} marketplace identity moved`);
  invariant(Array.isArray(marketplace.plugins), `${host} marketplace plugins are missing`);
  const entries = marketplace.plugins.filter((entry) => entry?.name === 'forged');
  invariant(entries.length === 1, `${host} marketplace must contain one forged entry`);
  const entry = entries[0];
  let source;

  if (isClaude) {
    exactKeys(marketplace, ['description', 'name', 'owner', 'plugins'], 'Claude marketplace');
    exactKeys(marketplace.owner, ['name'], 'Claude marketplace owner');
    invariant(marketplace.owner.name === 'Tripp Cashel', 'Claude marketplace owner moved');
    invariant(typeof marketplace.description === 'string' && marketplace.description.trim(), 'Claude marketplace description is missing');
    exactKeys(entry, ['description', 'name', 'source'], 'Claude marketplace forged entry');
    invariant(typeof entry.description === 'string' && entry.description.trim(), 'Claude marketplace plugin description is missing');
    invariant(typeof entry.source === 'string', 'Claude marketplace source must be a relative string');
    source = entry.source;
  } else {
    exactKeys(marketplace, ['interface', 'name', 'plugins'], 'Codex marketplace');
    exactKeys(marketplace.interface, ['displayName'], 'Codex marketplace interface');
    invariant(typeof marketplace.interface.displayName === 'string' && marketplace.interface.displayName.trim(), 'Codex marketplace display name is missing');
    exactKeys(entry, ['category', 'name', 'policy', 'source'], 'Codex marketplace forged entry');
    exactKeys(entry.source, ['path', 'source'], 'Codex marketplace source');
    exactKeys(entry.policy, ['authentication', 'installation'], 'Codex marketplace policy');
    invariant(entry.source.source === 'local', 'Codex marketplace source must be local');
    invariant(entry.policy.installation === 'AVAILABLE', 'Codex marketplace installation policy moved');
    invariant(entry.policy.authentication === 'ON_INSTALL', 'Codex marketplace authentication policy moved');
    invariant(typeof entry.category === 'string' && entry.category.trim(), 'Codex marketplace category is missing');
    source = entry.source.path;
  }

  const pluginRoot = resolveInside(repoRoot, source, 'directory', `${host} plugin source`);
  const manifestPath = resolveInside(pluginRoot, manifestRelative, 'file', `${host} manifest`);
  const manifest = readJson(manifestPath, `${host} manifest`);
  const expectedManifestKeys = isClaude
    ? [...commonManifestKeys, 'mcpServers']
    : [...commonManifestKeys, 'interface', 'keywords'];
  exactKeys(manifest, expectedManifestKeys, `${host} manifest`);
  validateCommonManifest(manifest, `${host} manifest`);

  if (isClaude) {
    exactKeys(manifest.mcpServers, ['forged'], 'Claude manifest mcpServers');
    exactKeys(manifest.mcpServers.forged, ['args', 'command'], 'Claude manifest forged MCP server');
    invariant(manifest.mcpServers.forged.command === 'forged', 'Claude manifest forged MCP server command moved');
    invariant(
      stableJson(manifest.mcpServers.forged.args) === stableJson(['mcp']),
      'Claude manifest forged MCP server args moved',
    );
  }

  if (!isClaude) {
    invariant(
      stableJson(manifest.keywords) === stableJson(['forged', 'planning', 'code-review', 'beads', 'orchestration']),
      'Codex manifest discovery keywords moved',
    );
    exactKeys(
      manifest.interface,
      ['capabilities', 'category', 'defaultPrompt', 'developerName', 'displayName', 'longDescription', 'shortDescription'],
      'Codex manifest interface',
    );
    for (const key of ['category', 'developerName', 'displayName', 'longDescription', 'shortDescription']) {
      invariant(typeof manifest.interface[key] === 'string' && manifest.interface[key].trim(), `Codex interface ${key} is missing`);
    }
    invariant(
      Array.isArray(manifest.interface.capabilities) &&
        manifest.interface.capabilities.length > 0 &&
        manifest.interface.capabilities.every((value) => typeof value === 'string' && value.trim()),
      'Codex interface capabilities are malformed',
    );
    invariant(
      Array.isArray(manifest.interface.defaultPrompt) &&
        manifest.interface.defaultPrompt.length >= 1 &&
        manifest.interface.defaultPrompt.length <= 3 &&
        manifest.interface.defaultPrompt.every((value) => typeof value === 'string' && value.trim() && value.length <= 128),
      'Codex interface default prompts are malformed',
    );
  }

  const skillsRoot = resolveInside(pluginRoot, manifest.skills, 'directory', `${host} skill root`);
  const inventory = inventorySkills(skillsRoot);
  const parityRelative = path.relative(skillsRoot, fs.realpathSync(parityPathArgument)).split(path.sep).join('/');
  invariant(parityRelative === 'manage-work/host-parity-fixtures.json', `${host} parity fixture is outside the shared skill root`);
  const parityPath = resolveInside(skillsRoot, parityRelative, 'file', `${host} parity fixture`);

  return {
    host,
    pluginRoot,
    skillsRoot,
    manifest,
    commonManifest: Object.fromEntries(commonManifestKeys.map((key) => [key, manifest[key]])),
    marketplacePluginName: entry.name,
    inventory,
    parity: readJson(parityPath, `${host} parity fixture`),
  };
}

const expectedAllowedDifferences = [
  'manifest-filename',
  'codex-manifest-discovery-metadata',
  'host-marketplace-envelope-and-source-metadata',
  'claude-only-mcp-server-registration',
];
const expectedForbiddenDifferences = [
  'plugin-identity',
  'version',
  'resolved-plugin-root',
  'skills-root-or-bytes',
  'workflow-route',
  'delegate',
  'confirmation-class',
  'authority',
  'postcondition',
  'effect-budget',
  'tool-inventory',
  'result-schema',
  'resource-uri',
  'compatibility-metadata',
  'fallback-contract',
];
const expectedForbiddenEffects = [
  'process-spawn',
  'network-access',
  'filesystem-write',
  'legacy-store-access',
  'ledger-access',
  'operator-state-access',
  'forged-cli-call',
  'forged-mcp-call',
  'provider-call',
  'service-call',
  'git-call',
  'github-call',
  'plugin-install',
  'plugin-cache-access',
];
const expectedTools = [
  'artifact_compact', 'artifact_verify', 'attention_acknowledge', 'attention_list', 'attention_reopen',
  'attention_resolve', 'claim_next', 'definition_validate', 'doctor', 'epic_advance',
  'epic_drive', 'epic_pause', 'epic_preflight', 'epic_resolve', 'epic_resume', 'epic_revise_roster',
  'epic_start', 'epic_status', 'epic_submit', 'events_tail', 'operations_overview',
  'overview', 'packet_claim', 'packet_complete', 'packet_fail', 'reconcile',
  'review_publish', 'run_accept_risk', 'run_adjudicate_settlement', 'run_advance', 'run_revise_roster',
  'run_start', 'run_status', 'run_stop', 'run_submit', 'session_inventory', 'session_list',
  'session_message', 'session_read', 'session_stop', 'usage_ingest', 'usage_report',
  'work_detail', 'work_history', 'work_list', 'work_map',
];
const surfaceShared = {
  structuredContent: 'required',
  jsonTextFallback: 'identical',
  resourceMetadataKeys: ['_meta.ui.resourceUri', 'ui/resourceUri'],
  resourceMimeType: 'text/html;profile=mcp-app',
};
const expectedSurfaces = [
  {
    role: 'portfolio-queue',
    tool: 'operations_overview',
    resultSchema: 'forged.operations-overview/1',
    resourceUri: 'ui://forged/operations-overview.html',
    selectionRule: 'ordinary portfolio, repository, queue, or needs-me read',
    ...surfaceShared,
  },
  {
    role: 'durable-subject',
    tool: 'work_detail',
    resultSchema: 'forged.work-detail/1',
    resourceUri: 'ui://forged/work-detail.html',
    selectionRule: 'exact canonical run or epic only',
    ...surfaceShared,
  },
  {
    role: 'topology',
    tool: 'work_map',
    resultSchema: 'forged.work-map/1',
    resourceUri: 'ui://forged/work-map.html',
    selectionRule: 'explicit dependency or topology request only',
    ...surfaceShared,
  },
  {
    role: 'provider-diagnostics',
    tool: 'session_inventory',
    resultSchema: 'forged.provider-session-inventory/1',
    resourceUri: 'ui://forged/agent-sessions.html',
    selectionRule: 'explicit provider diagnostic request only',
    ...surfaceShared,
  },
  {
    role: 'compatibility',
    tool: 'overview',
    resultSchema: 'forged.overview/1',
    resourceUri: 'ui://forged/overview.html',
    selectionRule: 'compatibility smoke only, never the normal modern choice',
    ...surfaceShared,
  },
];

function validateContractSource(host, manageWorkRoot, label, contract, expected) {
  exactKeys(contract, ['caseCount', 'caseIds', 'comparisonFields', 'path', 'schema'], `${label} contract`);
  invariant(contract.path === expected.path, `${label} fixture path moved`);
  invariant(contract.schema === expected.schema, `${label} fixture schema moved`);
  invariant(contract.caseCount === expected.caseCount, `${label} fixture count moved`);
  invariant(stableJson(contract.comparisonFields) === stableJson(expected.comparisonFields), `${label} comparison fields moved`);
  invariant(
    Array.isArray(contract.caseIds) &&
      contract.caseIds.length === contract.caseCount &&
      new Set(contract.caseIds).size === contract.caseCount,
    `${label} case ids must be complete and unique`,
  );
  const sourcePath = resolveInside(manageWorkRoot, contract.path, 'file', `${host} ${label} source`);
  const source = readJson(sourcePath, `${host} ${label} source`);
  invariant(source.schema === contract.schema && Array.isArray(source.cases), `${host} ${label} source contract moved`);
  invariant(
    stableJson(source.cases.map((entry) => entry?.id)) === stableJson(contract.caseIds),
    `${host} ${label} source omits, duplicates, or reorders cases`,
  );
  const comparedCases = source.cases.map((entry) => {
    const result = {id: entry.id};
    for (const field of contract.comparisonFields) {
      invariant(Object.prototype.hasOwnProperty.call(entry, field), `${host} ${label} case ${entry.id} lacks ${field}`);
      result[field] = entry[field];
    }
    return result;
  });
  return {schema: source.schema, cases: comparedCases};
}

function validateParityFixture(registration) {
  const fixture = registration.parity;
  exactKeys(
    fixture,
    [
      'allowedHostDifferences', 'contracts', 'evidenceScope', 'forbiddenEffects',
      'forbiddenHostDifferences', 'purpose', 'schema', 'surfaces', 'tools',
    ],
    `${registration.host} host parity fixture`,
  );
  invariant(fixture.schema === 'forged.manage-work-host-parity-fixtures/1', 'host parity fixture schema moved');
  invariant(fixture.purpose === 'validation-only', 'host parity fixture purpose moved');
  invariant(fixture.evidenceScope === 'declarative-contract-parity-only', 'host parity evidence scope is overstated');
  invariant(stableJson(fixture.allowedHostDifferences) === stableJson(expectedAllowedDifferences), 'allowed host differences moved');
  invariant(stableJson(fixture.forbiddenHostDifferences) === stableJson(expectedForbiddenDifferences), 'forbidden host differences moved');
  invariant(stableJson(fixture.forbiddenEffects) === stableJson(expectedForbiddenEffects), 'forbidden validation effects moved');
  invariant(stableJson(fixture.tools) === stableJson(expectedTools), 'exact 46-tool declaration moved');
  invariant(fixture.tools.length === 46 && new Set(fixture.tools).size === 46, 'tool declaration must contain 46 unique tools');
  invariant(stableJson(fixture.surfaces) === stableJson(expectedSurfaces), 'exact five-surface declaration moved');
  invariant(fixture.surfaces.length === 5, 'surface declaration must contain five resources');
  exactKeys(fixture.contracts, ['intent', 'portfolioControl'], 'host parity contracts');
  const manageWorkRoot = resolveInside(registration.skillsRoot, 'manage-work', 'directory', `${registration.host} manage-work root`);
  return {
    intent: validateContractSource(
      registration.host,
      manageWorkRoot,
      'intent',
      fixture.contracts.intent,
      {
        path: 'intent-fixtures.json',
        schema: 'forged.manage-work-intent-fixtures/1',
        caseCount: 15,
        comparisonFields: ['decision', 'delegate', 'result', 'routerMutationBudget'],
      },
    ),
    portfolioControl: validateContractSource(
      registration.host,
      manageWorkRoot,
      'portfolio-control',
      fixture.contracts.portfolioControl,
      {
        path: 'portfolio-control-fixtures.json',
        schema: 'forged.manage-work-portfolio-control-fixtures/1',
        caseCount: 33,
        comparisonFields: ['route', 'confirmation', 'postcondition', 'effectBudget'],
      },
    ),
  };
}

try {
  invariant(typeof parityPathArgument === 'string', 'host parity fixture argument is missing');
  const parityReal = fs.realpathSync(parityPathArgument);
  invariant(isInside(repoRoot, parityReal), 'host parity fixture argument escapes the repository');

  const claude = loadHost('claude');
  const codex = loadHost('codex');
  invariant(claude.pluginRoot === codex.pluginRoot, 'host marketplaces resolve different plugin roots');
  invariant(claude.skillsRoot === codex.skillsRoot, 'host manifests resolve different skill roots');
  invariant(claude.marketplacePluginName === codex.marketplacePluginName, 'host marketplace plugin identities differ');
  invariant(stableJson(claude.commonManifest) === stableJson(codex.commonManifest), 'canonical host manifest registrations differ');
  invariant(stableJson(claude.inventory) === stableJson(codex.inventory), 'complete shared skill inventories differ');
  invariant(stableJson(claude.parity) === stableJson(codex.parity), 'host parity declarations differ');

  const claudeContracts = validateParityFixture(claude);
  const codexContracts = validateParityFixture(codex);
  invariant(stableJson(claudeContracts) === stableJson(codexContracts), 'host workflow/effect contracts differ');

  console.log(
    `HOST PARITY: claudeRoot=${claude.pluginRoot} codexRoot=${codex.pluginRoot} ` +
      `version=${claude.manifest.version} skills=9 inventorySha256=${claude.inventory.digest} ` +
      `cases=15+31 tools=46 surfaces=5 evidence=declarative-contract-only`,
  );
} catch (error) {
  console.error(`host parity validation failed: ${error.message}`);
  process.exit(1);
}
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
const workspaceManifest = fs.readFileSync('Cargo.toml', 'utf8');
let workspaceVersion;
let inWorkspacePackage = false;
for (const line of workspaceManifest.split(/\r?\n/)) {
  if (line === '[workspace.package]') {
    inWorkspacePackage = true;
    continue;
  }
  if (line.startsWith('[')) inWorkspacePackage = false;
  const match = inWorkspacePackage && line.match(/^version\s*=\s*"([^"]+)"$/);
  if (match) workspaceVersion = match[1];
}
if (!workspaceVersion || workspaceVersion !== manifest.version) {
  console.error(`Cargo.toml workspace version: expected ${manifest.version}, got ${workspaceVersion || 'missing'}`);
  process.exit(1);
}
const piPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (piPackage.version !== manifest.version) {
  console.error(`package.json: expected ${manifest.version}, got ${piPackage.version}`);
  process.exit(1);
}
const cargoFiles = fs.readdirSync('crates', {withFileTypes: true})
  .filter((entry) => entry.isDirectory())
  .map((entry) => `crates/${entry.name}/Cargo.toml`)
  .filter((path) => fs.existsSync(path));
const cargoLock = fs.readFileSync('Cargo.lock', 'utf8');
for (const path of cargoFiles) {
  const contents = fs.readFileSync(path, 'utf8');
  const crateName = contents.match(/^name\s*=\s*"([^"]+)"/m)?.[1];
  const inheritsVersion = /^version\.workspace\s*=\s*true\s*$/m.test(contents);
  const literalVersion = contents.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
  if (!crateName || !inheritsVersion || literalVersion) {
    console.error(`${path}: version must inherit workspace ${manifest.version}`);
    process.exit(1);
  }
  const lockEntry = cargoLock.match(
    new RegExp(`\\[\\[package\\]\\]\\nname = "${crateName}"\\nversion = "([^"]+)"`),
  );
  if (!lockEntry || lockEntry[1] !== manifest.version) {
    console.error(`Cargo.lock ${crateName}: expected ${manifest.version}, got ${lockEntry?.[1] || 'missing'}`);
    process.exit(1);
  }
}
NODE
}

check_pi_package() {
  node - <<'NODE'
const fs = require('fs');
const path = require('path');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (pkg.name !== 'forged-pi' || !pkg.keywords?.includes('pi-package')) process.exit(1);
if (pkg.scripts && Object.keys(pkg.scripts).length) {
  console.error('the Pi package must not install or build the Forged binary');
  process.exit(1);
}
const expectedExtensions = ['./plugins/forged/extensions/index.ts'];
const expectedSkills = ['./plugins/forged/skills'];
if (JSON.stringify(pkg.pi?.extensions) !== JSON.stringify(expectedExtensions) ||
    JSON.stringify(pkg.pi?.skills) !== JSON.stringify(expectedSkills)) process.exit(1);
for (const resource of [...expectedExtensions, ...expectedSkills]) {
  if (!fs.existsSync(path.resolve(resource))) process.exit(1);
}
const skills = fs.readdirSync('plugins/forged/skills', {withFileTypes: true})
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join('plugins/forged/skills', entry.name, 'SKILL.md')))
  .map((entry) => entry.name)
  .sort();
if (JSON.stringify(skills) !== JSON.stringify([
  'adjudicate', 'board', 'configure', 'critique', 'dispatch', 'manage-work', 'plan', 'run-epic', 'setup',
])) process.exit(1);
const extension = fs.readFileSync('plugins/forged/extensions/index.ts', 'utf8');
for (const name of [
  'forged_overview', 'forged_detail', 'forged_history', 'forged_sessions',
  'forged_submit', 'forged_control', 'forged_attention', 'forged_critic',
]) {
  if (!extension.includes(`name: "${name}"`)) process.exit(1);
}
if (!extension.includes('registerCommand("forge"')) process.exit(1);
for (const forbidden of ['forged mcp', 'postinstall', 'cargo install']) {
  if (extension.includes(forbidden)) process.exit(1);
}
const piDriver = fs.readFileSync('crates/forged-provider/src/pi.rs', 'utf8');
for (const required of ['--no-extensions', '--approve', 'provider: "pi"']) {
  if (!piDriver.includes(required)) process.exit(1);
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
  "$plugin/skills/manage-work/intent-fixtures.json"
  "$plugin/skills/manage-work/portfolio-control-fixtures.json"
  "$plugin/skills/manage-work/host-parity-fixtures.json"
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
check "Pi package resources and direct-tool contract" check_pi_package
check "manifest/workspace/Pi package version parity" check_version_parity
check "manage-work intent fixture JSON" check_json \
  "$plugin/skills/manage-work/intent-fixtures.json"
check "manage-work authority and mutation contract" check_manage_work_contract \
  "$plugin/skills/manage-work/SKILL.md" \
  "$plugin/skills/manage-work/intent-fixtures.json"
check "manage-work portfolio/control fixture JSON" check_json \
  "$plugin/skills/manage-work/portfolio-control-fixtures.json"
check "manage-work portfolio/control contract" check_manage_work_portfolio_contract \
  "$plugin/skills/manage-work/SKILL.md" \
  "$plugin/skills/manage-work/portfolio-control-fixtures.json"
check "manage-work host-parity fixture JSON" check_json \
  "$plugin/skills/manage-work/host-parity-fixtures.json"
check "manage-work dual-host registration and contract parity" check_manage_work_host_parity_contract \
  "$plugin/skills/manage-work/host-parity-fixtures.json"

skill_files=("$plugin"/skills/*/SKILL.md)
[[ ${#skill_files[@]} -eq 9 ]] && pass "exactly nine skills" || fail "exactly nine skills"
for path in "${skill_files[@]}"; do check "frontmatter $path" check_frontmatter "$path"; done
check "critic frontmatter" check_frontmatter "$plugin/agents/critic.md"

check_board_skill() {
  local skill="$plugin/skills/board/SKILL.md"
  grep -q '^name: board$' "$skill" || return 1
  grep -qE '^description: .+' "$skill" || return 1
  grep -q 'operations_overview' "$skill" || return 1
  grep -q 'forged operations overview' "$skill" || return 1
  grep -q -- '--repo' "$skill" || return 1
  grep -q '/forged:setup' "$skill" || return 1
  grep -q 'never fail silently' "$skill" || return 1
}
check "board skill contract" check_board_skill
check "bootstrap shell syntax" bash -n "$plugin/bootstrap/install-beads.sh"
grep -Fq '../../agents/critic.md' "$plugin/skills/critique/SKILL.md" \
  && pass "critique resolves the shared critic" || fail "critique resolves the shared critic"
if grep -Fq '../../bootstrap/install-beads.sh' "$plugin/skills/setup/SKILL.md"; then
  fail "setup omits the deleted legacy-store bootstrap"
else
  pass "setup omits the deleted legacy-store bootstrap"
fi

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
  '(\.anvil/specs|--spec([[:space:]]|`)|--(description|acceptance|notes)-file|workflows/(execute-review-fix|run-epic|plan-critique-improve)\.js|watch-epic)' \
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

if grep -Ern --include='*.md' --include='*.json' \
  'BEADS_DIR|\.beads|beads-|(^|[^[:alnum:]_-])bd[[:space:]]+(create|update|show|ready|comments|where|children|init)' \
  "$plugin/skills"; then
  fail "skills forbid legacy-store commands, paths, and ids"
else
  pass "skills forbid legacy-store commands, paths, and ids"
fi

for path in "${skill_files[@]}"; do
  for needle in 'Position:' 'Next:' 'Boundary:'; do
    grep -Fq -- "$needle" "$path" \
      && pass "lifecycle contract $path: $needle" \
      || fail "lifecycle contract $path: $needle"
  done
done

for needle in 'WORK_ID="ore-' 'metadata.repository' 'description' 'design' \
  'acceptanceCriteria' 'notes' '--id "$WORK_ID"' '--kind task' '--status open' \
  '--repository "$TARGET_REPO"' '--description="$DESCRIPTION"' \
  '--design="$DESIGN"' '--acceptance="$ACCEPTANCE"' '--notes="$NOTES"' \
  'forged work create' 'forged work update' 'forged work link' \
  'forged work reopen' 'forged work show' 'forged work ready' 'parent-child'; do
  grep -Fq -- "$needle" "$plugin/skills/plan/SKILL.md" \
    && pass "native plan contract: $needle" || fail "native plan contract: $needle"
done
for needle in 'newly created id' 'ore-' 'existing or' \
  'imported stored id is preserved verbatim'; do
  grep -Fq -- "$needle" "$plugin/skills/plan/checklist.md" \
    && pass "native id contract: $needle" || fail "native id contract: $needle"
done
for needle in 'forged work update' '--expected-revision' 'notes' \
  'no separate ledger commentary operation' 'UPDATED_NOTES_PATH' \
  '[[ ! -r "$UPDATED_NOTES_PATH" || ! -s "$UPDATED_NOTES_PATH" ]]' \
  '[[ -z "$UPDATED_NOTES" ]]'; do
  grep -Fq -- "$needle" "$plugin/skills/critique/SKILL.md" \
    && pass "ledger critique contract: $needle" || fail "ledger critique contract: $needle"
done
for needle in 'forged work update' 'forged work reopen' 'non-atomic' 'ore-063' \
  '[[ ! -r "$FIELD_PATH" || ! -s "$FIELD_PATH" ]]' \
  'adjudication fields must all be nonempty'; do
  grep -Fq -- "$needle" "$plugin/skills/adjudicate/SKILL.md" \
    && pass "ledger adjudication contract: $needle" || fail "ledger adjudication contract: $needle"
done
for needle in 'for CHILD_ID in <every exact id from preflight' \
  'forged work show --id "$CHILD_ID"' 'each frozen child' \
  'parent-child' '`blocks` dependency edges' \
  'missing, extra, or contradictory'; do
  grep -Fq -- "$needle" "$plugin/skills/run-epic/SKILL.md" \
    && pass "epic child preflight contract: $needle" \
    || fail "epic child preflight contract: $needle"
done
for needle in 'Tool rates are optional' 'default_rate_card' \
  'server-side tool use' 'custom `pricing` block replaces'; do
  grep -Fq -- "$needle" "$plugin/skills/configure/SKILL.md" \
    && pass "optional pricing contract: $needle" || fail "optional pricing contract: $needle"
done
for needle in 'state.db' 'forged work create' 'Never create a repository-local work store'; do
  grep -Fq -- "$needle" "$plugin/skills/setup/SKILL.md" \
    && pass "ledger-native setup contract: $needle" || fail "ledger-native setup contract: $needle"
done
grep -Fq 'ANVIL_HOME' "$plugin/skills/setup/SKILL.md" \
  && pass "setup preserves ANVIL_HOME" || fail "setup preserves ANVIL_HOME"

if [[ $failures -gt 0 ]]; then exit 1; fi
