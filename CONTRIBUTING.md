# Contributing

forge is a personal project; issues and PRs are welcome but the roadmap is
operator-driven.

Before opening a PR, run the standard local gates:

```bash
bash scripts/validate-plugin.sh
cargo fmt   --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo build --workspace --locked
cargo nextest run --workspace
cargo nextest run -p forged --features failpoints
```

The two test gates run under [cargo-nextest](https://nexte.st), installed once
with `cargo install cargo-nextest --locked` or from a prebuilt binary. It is a
required development tool — Cargo cannot declare binary tools as
dev-dependencies — and `.config/nextest.toml` declares the minimum version.
Under plain `cargo test` the `supervise` suite skips loudly rather than run
unserialized; `RUST_TEST_THREADS=1 cargo test` is the deliberate serial
fallback.

The suite has two deliberate layers, and nextest filtersets address each
directly. Unit tests live in-source under `#[cfg(test)]`; integration and
end-to-end tests live in each crate's `tests/` directory and mostly drive the
real `forged` binary. For a fast inner loop, run just the units; run the
integration layer before handing work off:

```bash
cargo nextest run --workspace -E 'kind(lib) | kind(bin)'   # units, seconds
cargo nextest run --workspace -E 'kind(test)'              # integration/e2e
```

The gate remains the full unfiltered run above. Test results in CI are
reported per binary, so the layers stay distinguishable in Codecov's Tests
tab as well.

CI runs the `cargo` gates above in parallel jobs (`lint`, `test`,
`failpoints`); a PR must pass the `ci-ok` aggregate check before it can
merge.

Use conventional-commit messages (`feat(scope): …`, lowercase, ≤ 70 chars).
Design context lives in [`docs/adr/`](docs/adr/) — read
[ADR-0032](docs/adr/0032-forged-provider-neutral-rust-orchestrator.md) first;
`CLAUDE.md` lists the invariants a change must not break.

Maintainers preparing a release must follow [`RELEASE.md`](RELEASE.md). Release
notes belong in [`CHANGELOG.md`](CHANGELOG.md), not in a separate per-release
document.

By contributing you agree your contribution is licensed under the repository
license (MIT with the OpenAI/Anthropic rider — see [LICENSE](LICENSE)).
