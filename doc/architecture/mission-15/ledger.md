# Mission 15 ledger

Written for: whoever is following Mission 15 as it goes, the person who set it first. A living record: what is done
and verified, what is found and not yet done, and what is deliberately left. Newest entries at the top of each part.
The brief is in the conversation of 2026-10-25; its three priorities are I (a fast, trustworthy inner loop), II (the
independent adventures as first-class content) and III (a new human-facing experience).

## Done and verified

- **I.B. Local work for local changes, nine commits (037ba96 to the observation's).** Worlds are shared copy-on-write
  by relation; the campaign keeps its world; only actors whose part changed are projected; idle rules go unasked;
  read views are kept with each relation's facts; the observation is worked out once per world; queries propose
  candidates to grounding. Each change comes to the same game (hashes in [`performance.md`](performance.md)). wren
  through the engine: command p50 244 to 61 ms, p99 5,280 to 411 ms, worst 7,952 to 630 ms. The simulation alone:
  5.4 to 63.7 commands a second. The frontier segment (104,000 facts, 33 modules): engine p50 753 to 133 ms.
  Tests: `test/world-reads.test.ts`, `test/projection.test.ts` (incremental projection equals projecting everyone),
  `test/candidates.test.ts` (grounding through a query equals grounding every binding).
- **I.A. Measuring by layer, bounded.** `scripts/sim-bench.ts` measures the simulation alone (A) and a headless session
  (B) by kind of command, from the start or from a profile's checkpoint (`--resume`, `--replay`).
  `scripts/journey-profile.ts` measures the engine's parts (C); it is bounded and diagnostic (streamed steps,
  `--slow`, `--deadline`, checkpoints to take up again, hashes to compare two versions, `--dump`) and can wander
  across marches. `scripts/journey-browser.ts` plays the same commands in the built page (D).

## Found, not yet done

- **A query asked of what is not yet bound can miss answers.** `world.solve(reaches(a, ?t))` leaves out a thing no
  clue reveals, because `noticed` begins with a negation over `?t` before anything binds it, and negation as failure
  over an unbound variable means "nothing at all is so" (shown in `test/candidates.test.ts`). Grounding no longer
  depends on it (`Candidates`). A rule whose condition asks such a query with a variable may still miss bindings; no
  rule has been audited for it yet.
- The player's choices are grounded afresh in every new world (25 ms warm in the frontier, 1,199 schemas).
- Keeping the game after every command, on the engine's thread, grows with the game (32 ms median in wren, 102 ms in
  the frontier).
- The heap after a full collection grew by about 0.35 MB a command at the baseline; a long session against a fresh
  restore is not yet compared.
- The page (layer D) has not been measured since the baseline.
- Required CI, a deliberately failing spec, pinning Deem and the languages, a clean clone: not yet begun.

## Deliberately left

- CPU throttling of the page (CDP) does not reach the engine's worker, so a tablet's slowness is not emulated; it is
  reasoned from the measured parts (see `performance.md`). Safari is not measured.
