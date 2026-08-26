# Changelog

This file records user-visible changes to Forge.

## [Unreleased]

## [0.5.0] - 2026-08-26

This is the first distribution of the provider-neutral Rust system. The
historical TypeScript `v0.4.0` product has been replaced and is unsupported.

### Added

- Durable slice and epic execution that continues independently of the lead
  agent session and stops at a reviewed draft pull request.
- Rolling-wave epic planning that reassesses the remaining plan as integrated
  code changes, while preserving the operator's locked outcome and safety
  boundaries.
- Final integrated assurance over the exact epic branch before Forge declares
  the draft pull request ready for human review.
- One shared lead-agent plugin for Claude Code, Codex, and Pi, with planning,
  critique, adjudication, portfolio inspection, and explicit execution handoff.
- Versioned macOS and Linux release archives, checksum verification, and
  idempotent install and uninstall scripts.

### Changed

- Replaced the former TypeScript workflow product with the `forged` Rust
  execution kernel and operator-scoped state under `~/.anvil`.
- Made native Bead fields the editable specification and Beads dependencies the
  work graph; Forge no longer creates a parallel repository specification.
- Kept default-branch merge human-owned. Unattended work may prepare and review
  pull requests, but it does not merge them.
- Treats Beads as a host dependency with a `bd >=1.2.1` version floor and
  required behavior probes, without installing, upgrading, downgrading, or
  imposing an upper pin. The macOS service freezes the absolute compatible
  binary selected at setup.

### Fixed

- Hardened controller recovery, provider deadlines, planning checkpoints, and
  cleanup so interrupted work either resumes safely or stops with explicit
  operator action required.

### Security

- Fenced claims, provider effects, GitHub publication, and recovery against
  stale or ambiguous execution identity.
- Made release installation verify SHA-256 checksums before replacing
  installer-owned files.
- Refuses non-normalized or root-equivalent install prefixes before touching a
  live path.

[Unreleased]: https://github.com/tcashel/forge/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/tcashel/forge/compare/v0.4.0...v0.5.0
