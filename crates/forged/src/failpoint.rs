//! Env-driven failpoints for the kill-matrix falsifier, hand-rolled behind
//! the `failpoints` cargo feature — default off, so a release binary
//! carries no failpoint code.
//!
//! `FORGED_FAILPOINT=<site>` names exactly one site; `FORGED_FAILPOINT_MODE`
//! is `pause` (default), `crash`, or `fail`. `pause` requires
//! `FORGED_FAILPOINT_DIR`: the process creates `<site>.reached` there and
//! blocks until `<site>.release` exists (polled ~50 ms); the test
//! synchronizes on `.reached` and releases by creating `.release`. `crash`
//! calls `std::process::abort()` at the site. `fail` is read by
//! [`injected`] rather than [`hit`], and makes the site return an error
//! instead of succeeding.
//!
//! Sites are fixed strings at forged-owned boundaries only:
//! `op.begin.before`, `op.begin.after`, `packet.materialize.before`,
//! `provider.spawn.before`, `provider.spawn.after`, `bd.claim.before`,
//! `bd.claim.after`, `bd.reclaim.before`, `bd.reclaim.after`,
//! `guardian.start`, `git.push.before`, `git.push.after`, `gh.call.before`,
//! `gh.call.after`.
//! `admission.batch.commit.before` and `admission.batch.commit.after` fence
//! the atomic admission decision/reservation write; the latter represents a
//! committed response that the caller has not yet observed.
//! `admission.reservation.transfer.after` is the first boundary after an
//! admitted reservation belongs to its controller or attempt.
//! `provider.result.recorded.after` is after immutable provider evidence is
//! joined to the attempt and before that attempt is settled.
//! `packet.materialize.before` is the post-claim, pre-spawn boundary: the
//! attempt row is `running` and nothing has been written to the packet
//! directory yet, so a test paused there can make the materialization fail
//! for real.
//! `epic.child.merge.after` is the scheduler's applied-but-response-lost
//! boundary: GitHub accepted the integration merge, but the operation and
//! epic journal have not yet been completed.
//! `controller.record.after` is the handoff equivalent: the detached
//! controller identity is on disk, but its event and operation response are
//! not yet durable in the ledger.
//! `supervisor.stop-check.after` is the gap after landed-stop projection and
//! before the controller-submit singleton. `epic.stop.guarded.before-commit`
//! holds that same singleton immediately before an input/final event and its
//! desired-state transition commit atomically.
//! `epic.resolve.desired.after` is the inverse seam: the identified
//! INPUT_RESOLVED event and due wake are committed, but the safe-effect
//! operation has not yet been settled.
//! `run.adjudicate.recorded.after` is the settlement adjudication's seam:
//! the operator's adjudication event is durable, but the generation-fencing
//! terminal write has not committed. `run.adjudicate.submit.before` is the
//! arrival boundary immediately before that operation's submit singleton: a
//! rival paused there is provably at contention while the holder still owns
//! the lock.
//! `deadline.reconcile.settle.before` is after reconcile has durably marked
//! and kill-confirmed expired attempts but before whole-run settlement. The
//! run submit singleton must remain held across this exact seam.
//! `run.start.bundle.after` and `epic.start.bundle.after` sit after the
//! creation record, compatibility event, and WorkIdentityV1 commit in one
//! transaction but before the operation response is settled; replay must use
//! the durable bundle without consulting Beads again.
//! `review.publish.probe.before` and `review.publish.probe.after` bracket the
//! exact-marker observation. `review.publish.post.before` is after uncertain
//! intent is durable but before GitHub is called; `review.publish.post.after`
//! is the response-lost seam after GitHub returns and before delivery settles.
//! `bead-settlement.read.after` sits between the retry pass's convergence
//! read and any append or charge; `bead-settlement.charge.after` is after the
//! durable budget charge and before the bd mutation;
//! `bead-settlement.landed-custody.after` is between the landed retry's
//! guarded claim of an unassigned bead and its held close; and
//! `bead-settlement.mutate.after` is the response-lost seam after the bd
//! write and before `run.bead-settlement.succeeded` lands.
//! `mcp.ledger.open.before` sits between the MCP gate's existence precheck
//! and its no-create open — the deletion-race window the gate must refuse
//! without creating state.
//! `controller.orphaned-submit.probe.after` sits after the recorded Herdr
//! socket returned exact `pane_not_found` and before any cleanup request is
//! durable; a crash there must leave the row fenced for the next tick.
//!
//! `fail`-mode sites are separate, and exist for the seams whose OWN failure
//! is the contract and which no external condition can provoke:
//! `host.fallback.record` is the ledger write that makes a preferred-Herdr
//! fallback visible, sitting post-claim and pre-spawn where nothing may
//! propagate over a `running` attempt row. The bead settlement pass fences
//! every exit after a successful per-run claim — `bead-settlement
//! .wake-deadline`, `.mutation-lease-deadline`, `.charge`, `.get-run`,
//! `.mutation`, `.append-succeeded`, and `.append-pending` — because each
//! must release the claim token on failure rather than leave the run
//! contended.

/// Hit a failpoint site. A no-op unless the `failpoints` feature is on AND
/// `FORGED_FAILPOINT` names this exact site.
#[cfg(feature = "failpoints")]
pub fn hit(site: &str) {
    let Some(armed) = std::env::var_os("FORGED_FAILPOINT") else {
        return;
    };
    if armed.to_string_lossy() != site {
        return;
    }
    let mode = std::env::var_os("FORGED_FAILPOINT_MODE")
        .map(|m| m.to_string_lossy().into_owned())
        .unwrap_or_else(|| "pause".to_owned());
    match mode.as_str() {
        "crash" => std::process::abort(),
        // A `fail`-armed site is consumed by `injected`, never here: the two
        // read the same variables and must not both act on one arming.
        "fail" => (),
        _ => pause(site),
    }
}

/// Whether this site is armed to INJECT A FAILURE: `Some(detail)` when
/// `FORGED_FAILPOINT` names this exact site and `FORGED_FAILPOINT_MODE` is
/// `fail`. The caller mints the error, because only the caller knows what
/// failing there means.
#[cfg(feature = "failpoints")]
pub fn injected(site: &str) -> Option<String> {
    let armed = std::env::var_os("FORGED_FAILPOINT")?;
    if armed.to_string_lossy() != site {
        return None;
    }
    let mode = std::env::var_os("FORGED_FAILPOINT_MODE")?;
    (mode.to_string_lossy() == "fail").then(|| format!("failpoint {site}: injected failure"))
}

#[cfg(feature = "failpoints")]
fn pause(site: &str) {
    let Some(dir) = std::env::var_os("FORGED_FAILPOINT_DIR") else {
        // A pause with nowhere to signal is unusable; crash loudly rather
        // than hang the test invisibly.
        eprintln!("failpoint {site}: pause mode requires FORGED_FAILPOINT_DIR");
        std::process::abort();
    };
    let dir = std::path::PathBuf::from(dir);
    let _ = std::fs::create_dir_all(&dir);
    let reached = dir.join(format!("{site}.reached"));
    let _ = std::fs::write(&reached, b"");
    let release = dir.join(format!("{site}.release"));
    while !release.exists() {
        std::thread::sleep(std::time::Duration::from_millis(50));
    }
    // Consume the pair so the same site can pause again on its next hit and
    // the test can release hit-by-hit.
    let _ = std::fs::remove_file(&release);
    let _ = std::fs::remove_file(&reached);
}

/// Hit a failpoint site (feature off: compiled to nothing).
#[cfg(not(feature = "failpoints"))]
#[inline(always)]
pub fn hit(_site: &str) {}

/// Whether this site is armed to inject a failure (feature off: never).
#[cfg(not(feature = "failpoints"))]
#[inline(always)]
pub fn injected(_site: &str) -> Option<String> {
    None
}
