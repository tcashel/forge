# Releasing Forge

This procedure publishes one immutable GitHub Release from the current `main`
branch. The release workflow derives the version from
`[workspace.package].version`; it creates the tag and release only after every
platform build succeeds.

## Version policy

Forge follows semantic versioning while it is pre-1.0:

- increment the patch version for compatible fixes;
- increment the minor version for a new user-facing capability or a breaking
  change.

The historical TypeScript `v0.4.0` tag is reserved. Never reuse, delete, or
move a release tag.

## Prepare the release pull request

1. Start from the latest `main` and choose a version whose remote tag and
   GitHub Release do not exist.
2. Update `[workspace.package].version`, `Cargo.lock`, `package.json`, and both
   plugin manifests. Do not replace historical version references in ADRs or
   notices.
3. Move the user-visible entries from `Unreleased` into
   `## [X.Y.Z] - YYYY-MM-DD` in `CHANGELOG.md`, then leave an empty
   `Unreleased` section and update the comparison links at the bottom.
4. Run the complete local gates:

```sh
BD_REQUEST="${BD_BIN:-bd}"
export FORGED_TEST_BD="$(command -v "$BD_REQUEST")"
export FORGED_REQUIRE_BD=1
test -x "$FORGED_TEST_BD"
bash scripts/validate-plugin.sh
bash scripts/test-install.sh
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo build --workspace --locked
cargo test --workspace
cargo test -p forged --features failpoints
cargo run --quiet -p forged -- --version
git diff --check
```

5. Confirm the reported binary, workspace, Pi package, and plugin versions all
   equal `X.Y.Z`.
6. Open the release pull request and let its Rust, plugin, and release-workflow
   checks pass. Only the operator merges it to `main`.

Use a conventional commit such as `chore(release): prepare v0.5.0`.

## Publish from `main`

Before the first release, enable GitHub private vulnerability reporting and
release immutability in the repository settings. Immutability applies only to
future releases, so enable it before dispatch. Verify both settings, update your
local refs, and verify the release heading exists:

```sh
gh api repos/tcashel/forge/private-vulnerability-reporting --jq '.enabled'
gh api repos/tcashel/forge/immutable-releases --jq '.enabled'
git fetch origin main --tags
git show origin/main:CHANGELOG.md | grep -F '## [0.5.0] - 2026-08-26'
gh workflow run release.yml --ref main
```

Replace the example version and date for later releases. The workflow takes no
inputs. It derives the version from `main`, refuses an existing remote tag or
release, extracts the matching curated changelog section, and creates a draft
against the exact dispatch SHA. After verifying the draft tag, target, and
assets, it publishes the release and marks it latest.

Do not create or push the tag yourself. The workflow owns tag creation after
the complete build matrix succeeds.

The release must contain exactly these seven assets:

- `SHA256SUMS`
- `forge-aarch64-apple-darwin.tar.gz`
- `forge-aarch64-unknown-linux-gnu.tar.gz`
- `forge-x86_64-apple-darwin.tar.gz`
- `forge-x86_64-unknown-linux-gnu.tar.gz`
- `install.sh`
- `uninstall.sh`

`SHA256SUMS` verifies downloaded asset integrity. Release archives are not
claimed to be bit-for-bit reproducible across the native macOS and Linux build
hosts.

## Read back the release

Watch the dispatched run and use its `headSha` as the release SHA:

```sh
run_id="$(gh run list --workflow release.yml --event workflow_dispatch \
  --branch main --limit 1 --json databaseId --jq '.[0].databaseId')"
gh run watch "$run_id" --exit-status
gh run view "$run_id" --json databaseId,headSha,status,conclusion
gh release view v0.5.0 \
  --json tagName,targetCommitish,isDraft,isPrerelease,isImmutable,assets
gh release view v0.5.0 --json assets --jq '.assets[].name' | sort
git ls-remote origin refs/tags/v0.5.0
```

Confirm both setting commands printed `true`, the run succeeded, the release is
published and immutable, the tag resolves to the run's exact `headSha`, and the
sorted asset names match the list above. Download the assets and verify
`SHA256SUMS` before qualifying an installation.

## Qualify macOS and Linux

Test the release on at least one macOS host and one Linux host. Use an isolated
prefix when the host already has Forge:

```sh
curl -fsSL https://github.com/tcashel/forge/releases/latest/download/install.sh \
  | sh -s -- --version 0.5.0 --prefix /absolute/test-prefix
/absolute/test-prefix/bin/forged --version
```

Run the same install command a second time and confirm it reports the existing
identical installation without replacing unrelated files. Then verify explicit
`--force`, repeat uninstall, checksum-failure refusal, and preservation of
`ANVIL_HOME`, `BEADS_DIR`, configuration, credentials, and target repositories.

```sh
curl -fsSL https://github.com/tcashel/forge/releases/latest/download/uninstall.sh \
  | sh -s -- --prefix /absolute/test-prefix
```

Run this uninstall command twice; the second invocation must succeed without
changing anything outside the selected prefix.

Provision `bd` 1.2.1 or newer separately through `PATH` or `BD_BIN`; the Forge
installer does not install it. Run `forged init`, inspect every required
`forged doctor` probe, and validate the intended profile and roster. Register
the installed plugin explicitly in a fresh Claude Code, Codex, or Pi session
and confirm the harness discovers it. See the
[plugin installation guide](plugins/forged/README.md#install-and-register) for
the exact registration commands.

On macOS, an existing supervisor uses its immutable installed generation. Run
`forged service install` after upgrading the CLI, then verify service status.
The managed supervisor service is unsupported on Linux; do not claim Linux
service qualification.

## Recover a failed release

- If no tag or release exists, fix the cause on `main` and dispatch again.
- If an unpublished draft exists and no remote tag exists, either verify and
  publish the exact draft or delete only that draft, fix `main`, and dispatch
  again.
- Once a tag exists, do not move, delete, or reuse it. If its source or assets
  are wrong, leave an explicit record and prepare the next patch version.
- Never replace assets on a published release. Mark a defective release as
  withdrawn and publish a new version.
- Roll back a host by installing an explicit earlier version. Do not rewrite
  release history.
