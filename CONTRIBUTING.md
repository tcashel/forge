# Contributing to Forge

Thanks for your interest in Forge. It's an early-stage, pre-release project
(`0.4.0-dev`) — APIs and config keys may still change. Contributions, bug
reports, and ideas are welcome.

## Development setup

Forge runs on [Bun](https://bun.sh) (1.3+). You'll also want `tmux`, `git`, and
the GitHub CLI (`gh`) on your PATH to exercise the full launch/review flow — see
the [Prerequisites](README.md#prerequisites) in the README.

```bash
git clone https://github.com/tcashel/forge
cd forge
bun install
bun link        # puts ./bin/forge.ts on PATH as `forge`
forge --version
```

## Quality gates

Run these before opening a PR — CI runs the same checks:

```bash
bun test              # bun test
bun run lint          # biome check .
bunx tsc --noEmit     # type check
```

`bun run check` (`biome check --write .`) auto-fixes most lint/format issues.

## Commit & PR conventions

- **Conventional commits.** Match the existing history:
  `feat(review): …`, `fix(serve): …`, `perf(...)`, `chore(...)`, `docs(...)`.
- **Branch off `main`**, keep PRs focused, and make sure the quality gates pass.
- Describe *what* changed and *why*; link any relevant issue.

## Architecture decisions (ADRs)

Forge records architectural decisions as numbered ADRs under
[`docs/adr/`](docs/adr/) — start at [`docs/adr/README.md`](docs/adr/README.md)
for the one-line index.

Before changing anything architectural, **read the relevant ADR.** If a decision
needs to change, **write a new ADR that supersedes the old one** — never edit an
accepted ADR in place. Use [`docs/adr/template.md`](docs/adr/template.md).

The authoritative plan and priorities live in [`docs/ROADMAP.md`](docs/ROADMAP.md);
the product thesis is in [`docs/VISION.md`](docs/VISION.md).

## Packaging

Forge is installed from source (git clone + `bun link`, or `bun install -g`
against the git URL). **Registry publishing (`npm publish` / `bun publish`) is
not supported yet** and is blocked by a `prepublishOnly` guard.

The blocker: the package root `skills` is a git symlink to `cc-plugin/skills`,
and the runtime loaders resolve skill bodies from `<root>/skills/forge-*`
(`src/core/launch.ts`, `src/cli/cmd/review.ts`, `src/core/critique.ts`,
`src/core/plan-chat.ts`). Registry tarballs don't carry that symlink, so a
published package would ship empty reviewer/critic/fixer/planner prompts.
Git-based installs preserve the symlink and work fine. Before publishing to a
registry, replace the symlink with a packaged real directory (or point the
loaders at `cc-plugin/skills`) and remove the guard.

## Reporting bugs & requesting features

Use the [issue templates](https://github.com/tcashel/forge/issues/new/choose).
For security issues, **do not** open a public issue — see [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).
