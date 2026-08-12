# Contributing

forge is a personal project; issues and PRs are welcome but the roadmap is
operator-driven.

Before opening a PR, run the full gate set locally — CI runs exactly the
same commands:

```bash
cargo fmt   --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo build --workspace --locked
cargo test  --workspace
cargo test -p forged --features failpoints
```

Use conventional-commit messages (`feat(scope): …`, lowercase, ≤ 70 chars).
Design context lives in [`docs/adr/`](docs/adr/) — read
[ADR-0032](docs/adr/0032-forged-provider-neutral-rust-orchestrator.md) first;
`CLAUDE.md` lists the invariants a change must not break.

By contributing you agree your contribution is licensed under the repository
license (MIT with the OpenAI/Anthropic rider — see [LICENSE](LICENSE)).
