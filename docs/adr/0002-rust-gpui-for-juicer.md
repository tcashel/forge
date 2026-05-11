# ADR 0002 — Rust + GPUI for Juicer (Track B)

**Status:** Accepted (clarified by [`0021-two-track-build-path`](./0021-two-track-build-path.md))
**Deciders:** Tripp
**Date:** 2026-05-10
**Related:** [`0021-two-track-build-path`](./0021-two-track-build-path.md), [`../BUILD_PATH.md`](../BUILD_PATH.md), [`../ARCHITECTURE.md`](../ARCHITECTURE.md)

## Context

Juicer's target audience — staff and principal engineers running multi-agent fleets — is unusually sensitive to native polish. The product has to feel like a native macOS app, not a webview. It also has heavy concurrency demands: managing N concurrent subprocess agents, worktrees, and event streams. The choice of UI framework and language for the public product (Track B) needs to support both demands.

## Options

### A — Rust + GPUI

**Pros:**
- Native rendering, native feel; Zed is the existence proof on macOS.
- Rust's concurrency story (Tokio, channels, ownership) suits subprocess orchestration.
- GPUI is Apache-2.0 licensed — usable in a closed-source paid product.
- The artifact is a portfolio piece: Rust + native UI signals technical seriousness.

**Cons:**
- Thin documentation; depending on Zed source as reference.
- GPUI is a moving target; pinning specific commits is mandatory.
- Steeper learning curve than the alternatives.

### B — Tauri (web UI in a native shell)

**Pros:**
- Reuses web skills; fast iteration.
- Cross-platform if we ever want it.

**Cons:**
- Webview latency and feel are wrong for daily-driver software.
- Weaker marketing artifact for the target audience.

### C — SwiftUI

**Pros:**
- First-class native on macOS; matches Juice.

**Cons:**
- Subprocess concurrency at scale benefits more from Rust's primitives.
- Mixing two Swift codebases (Juice + Juicer) reduces, rather than increases, leverage compared to choosing different stacks for different products.

### D — Iced / Floem / Slint / Dioxus

Considered as Rust-native alternatives to GPUI. Iced and Floem held as fallbacks if GPUI proves untenable in Phase B0. Slint and Dioxus rejected for native-feel reasons similar to Tauri.

## Decision

**Rust + GPUI** as the Track B stack, verified in Phase B0 with a calibration throwaway. If B0 reveals a blocker, Iced or Floem are the documented fallbacks.

**Rationale:** Best combination of native feel, concurrency primitives, and portfolio value for the target audience. Apache-2.0 license keeps the paid product viable.

**Risks to monitor:** GPUI churn during B0; if API breakage cost exceeds tolerance, switch to a fallback before committing to the rest of Phase B.

## Consequences

- Read Zed source as reference for GPUI patterns.
- Pin GPUI to specific commits; update deliberately, not opportunistically.
- Native performance ceiling is high; the 16ms interactive latency budget in `ROADMAP.md` is achievable.
- All Track B dependencies must remain permissive-licensed (see [`0010-permissive-licenses-only`](./0010-permissive-licenses-only.md)).
- This decision applies to Track B only. Track A (this repo) is TypeScript; see [`0021-two-track-build-path`](./0021-two-track-build-path.md) for the rationale.
