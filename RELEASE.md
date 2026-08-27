# Releasing Forge

This procedure publishes one immutable GitHub Release from a version tag
pushed to a commit on `main`. The release workflow validates that tag against
`[workspace.package].version`; it creates the GitHub Release only after every
platform build succeeds.

## Version policy

Forge follows semantic versioning while it is pre-1.0:

- increment the patch version for compatible fixes;
- increment the minor version for a new user-facing capability or a breaking
  change.

The historical TypeScript `v0.4.0` tag is reserved. Never reuse, delete, or
move a release tag.

## Beads compatibility gate

Forge does not pin or manage the Beads binary on an operator host. A candidate
must clear the `bd >=1.2.1` version floor and the required epic, heartbeat,
reclaim, merge-slot, schema, and lease-behavior probes. Version order alone is
not compatibility evidence.

Forge `v0.5.0` carries a temporary compatibility exception for the exact
upstream `v1.2.1` Linux amd64 artifact. Release CI binds that artifact to
SHA-256
`48aecf42ffdefa6470298d8022deeb762e30c8729dc0a4bdda93888c0b0354e2`,
requires the binary to report version `1.2.1` and commit
`634cbbc4bc580fa5124f63fdf65d137a46d5b4ff`, and then uses it for every
genuine Beads integration test. Upstream classifies `v1.2.1` as a prerelease
and replaced it with rollback release `v1.2.2`; `v1.2.2` intentionally omits
the heartbeat and reclaim capabilities Forge requires.

This exception does not make Forge install or manage Beads on an operator
host. It records the dependency risk accepted for `v0.5.0` while keeping every
capability, doctor, schema, and lease-behavior probe fail-closed. A later Forge
release must remove or deliberately update the pin only after its candidate
Beads binary clears the same probes. Any probe failure blocks both pull-request
validation and publication.

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
cargo nextest run --workspace
cargo nextest run -p forged --features failpoints
cargo run --quiet -p forged -- --version
git diff --check
```

5. Confirm the reported binary, workspace, Pi package, and plugin versions all
   equal `X.Y.Z`.
6. Open the release pull request and let its checks pass: `ci-ok` (the
   aggregate of `rust.yml`'s `lint`, `test`, and `failpoints` jobs) and
   `preflight` (`release.yml`'s cheap version/CHANGELOG/plugin-parity and
   pinned-Beads probe, which runs on every PR touching release-relevant
   paths). Only the operator merges it to `main`.

Use a conventional commit such as `chore(release): prepare v0.5.0`.

## Publish from `main`

Before the first release, enable GitHub private vulnerability reporting and
release immutability in the repository settings. Immutability applies only to
future releases, so enable it before the first tag push. Verify both
settings, update your local refs, and verify the release heading exists:

```sh
gh api repos/tcashel/forge/private-vulnerability-reporting --jq '.enabled'
gh api repos/tcashel/forge/immutable-releases --jq '.enabled'
git fetch origin main --tags
git show origin/main:CHANGELOG.md | grep -F '## [0.5.0] - 2026-08-26'
```

Replace the example version and date for later releases. Once the release
pull request has merged, publish by tagging the merged commit on `main` and
pushing the tag — a lightweight tag is fine:

```sh
git checkout main
git pull --ff-only origin main
git tag v0.5.0
git push origin v0.5.0
```

Pushing the tag is what starts the release workflow. `preflight` re-validates
the version and CHANGELOG heading, re-checks plugin parity, re-provisions the
pinned Beads probe, and additionally asserts the pushed tag matches the
workspace version. `test`, `failpoints`, and the four-target `package` matrix
then run in parallel, and `release` runs last once all of them succeed:
it refuses a tag whose commit is not reachable from `origin/main`, refuses a
version that is not strictly newer than the current published release,
extracts the matching curated changelog section, creates a draft release,
uploads the built archives plus `install.sh`/`uninstall.sh`/`SHA256SUMS`,
verifies the draft, then publishes it and marks it latest.

Do not tag before the release pull request has merged to `main`, and do not
tag a commit that is not on `main` — the `release` job rejects it.

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

Watch the tag-triggered run and use its `headSha` as the release SHA:

```sh
run_id="$(gh run list --workflow release.yml --event push \
  --branch v0.5.0 --limit 1 --json databaseId --jq '.[0].databaseId')"
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

The `forge-x86_64-apple-darwin.tar.gz` archive is cross-compiled on the
`macos-15` (arm64) runner and ships with no CI test coverage at all — no
smoke install, no smoke uninstall, no service smoke. That leg is a
deliberate operator decision, not an oversight. If you have access to an
Intel Mac, qualify that archive manually before relying on it.

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

Provision an upstream-supported `bd` separately through `PATH` or `BD_BIN`; it
must clear Forge's version floor and capability probes, and the Forge installer
does not install it. Run `forged init`, inspect every required `forged doctor`
probe, and validate the intended profile and roster. Register the installed
plugin explicitly in a fresh Claude Code, Codex, or Pi session and confirm the
harness discovers it. See the
[plugin installation guide](plugins/forged/README.md#install-and-register) for
the exact registration commands.

On macOS, an existing supervisor uses its immutable installed generation. Run
`forged service install` after upgrading the CLI, then verify service status.
The managed supervisor service is unsupported on Linux; do not claim Linux
service qualification.

## Recover a failed release

- If `preflight`, `test`, `failpoints`, or `package` fails on the tag push,
  the `release` job never starts and no draft exists. Fix the cause on
  `main` through a normal PR, delete the failed tag locally and on the
  remote (`git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`), and
  push the tag again once `main` is fixed. No release was ever created for
  that tag, so this is not moving or reusing a released tag.
- If the `release` job fails BEFORE publication (draft creation, asset
  assembly, upload, or draft verification), re-running just that job is
  safe: `create-gh-release-action` deletes and recreates its draft release
  each time it runs, so a stale partial draft is never left behind. The
  upstream `test`, `failpoints`, and `package` jobs stay cached as green
  and do not re-run.
- If the job fails AFTER `gh release edit --draft=false` succeeds — one of
  the read-back, immutability, or tag checks in the final step — the
  release is already published and immutable, and re-running the job
  cannot recover it: the version guard now sees this very release as
  latest and refuses the rerun by design. Verify by hand instead, with the
  same commands the step runs (`gh release view`, download the assets and
  `sha256sum -c SHA256SUMS`, compare the tag SHA via `git ls-remote`). If
  the published release is genuinely defective, do not touch it — mark it
  withdrawn and prepare the next patch version.
- Once a release is published (not draft) and marked immutable, never
  delete it, re-tag it, or move it. If its source or assets are wrong, leave
  an explicit record and prepare the next patch version.
- Never replace assets on a published release. Mark a defective release as
  withdrawn and publish a new version.
- Roll back a host by installing an explicit earlier version. Do not rewrite
  release history.
