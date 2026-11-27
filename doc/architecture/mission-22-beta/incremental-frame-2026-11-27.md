# Incremental Frame: Baseline, 27 November 2026

## Method

`NO_COLOR=1 scripts/machine/heavy.sh bun scripts/performance/frame-parts.ts` replays the same 59-turn warrior golden walk as the quality gate. The profiler wraps existing method boundaries and reports each turn's p50/p95 milliseconds, call totals and number of turns called. Measurements are **inclusive and nested**, so rows do not sum to a turn. This baseline ran while two other heavy test lanes were active; use it as a directional part breakdown, not a clean absolute timing claim. Repeat the same command after each part.

## Detailed Snapshot

| Part | p50 ms/turn | p95 ms/turn | Calls | Turns called |
|---|---:|---:|---:|---:|
| `ScreenModel.built` (screen) | 60.8 | 189.3 | 56 | 55 |
| `PlayerFrame.of` | 5.3 | 39.4 | 400 | 58 |
| `PlayerView.choices` (row construction plus returned clones) | 4.8 | 36.0 | 55 | 53 |
| `KeptParts.of` + `KeptParts.named` | 25.6 | 97.2 | 1,263 | 56 |
| `Glance.reading` (routing) | 8.9 | 51.0 | 58 | 57 |
| `PlayerView.observe` | 35.2 | 73.8 | 218 | 57 |
| `PlayerRevision.of` | 18.5 | 44.0 | 947 | 59 |
| `PlayerView.perceive` | 15.5 | 45.3 | 55 | 53 |
| `KeptReading.holds` | 3.3 | 9.2 | 19,729 | 58 |
| `KeptReading.read` | 44.8 | 173.0 | 10,398 | 53 |
| `World.agrees` | 0.6 | 2.1 | 73,830 | 58 |
| `Withheld.rows` | 6.2 | 18.2 | 56 | 55 |
| `ChoiceGrouping.group` | 4.4 | 23.1 | 56 | 55 |
| `TownPlan.of` | 3.5 | 6.1 | 56 | 55 |
| `Services.of` | 2.3 | 7.4 | 56 | 55 |
| `Quarters.shown` | 0.1 | 4.3 | 56 | 55 |
| `FightHelp.reckoning` | 0.0 | 121.8 | 1,023 | 45 |
| `DangerSense.reckon` | 0.0 | 122.2 | 8 | 4 |
| `DangerSense.play` (fight simulation) | 0.0 | 121.1 | 4 | 4 |
| `Itineraries.shown` | 3.8 | 9.1 | 56 | 55 |
| `ScreenModel.fees` | 0.3 | 0.6 | 56 | 55 |
| `ScreenModel.prices` | 0.0 | 0.1 | 56 | 55 |
| `Agency.explain` | 0.0 | 0.1 | 224 | 40 |

The timing categories with large tails are selective: a median of zero means most turns do not enter the path, while four danger turns pay the simulation cost. The screen build is the largest inclusive component; within it, `PlayerRevision.of`, `PlayerView.observe`, and `KeptParts` are broad hot paths. Nested values are not additive to `ScreenModel.built`.

The quality-walk snapshot before changes was: median turn 333 ms, still-turn median/p95 320/662 ms, decision median/p95 96/248 ms. The command ran while other heavy jobs were active against local ratchets (121, 150/330, 28/92); use it as a loaded diagnostic, not a clean absolute comparison.

The first unmodified part capture measured `ScreenModel.built` at 113.1/416.6 ms and `PlayerFrame.of` at 8.8/89.4 ms (p50/p95). The following cross-run comparison is directional: profilers and quality walks ran under different shared-machine load, not interleaved A/B.

| Part | Before p50/p95 ms | After p50/p95 ms | Reading |
|---|---:|---:|---|
| `ScreenModel.built` | 113.1 / 416.6 | 34.9 / 118.3 | inclusive; several parts changed |
| `PlayerRevision.of` | 18.5 / 44.0 | 11.1 / 30.1 | fewer offer groundings on unchanged revisions |
| `PlayerView.observe` | 35.2 / 73.8 | 21.1 / 44.9 | includes nested frame reads |
| `KeptParts` | 54.0 / 147.1 | 15.5 / 47.2 | aggregate of `of` and `named` |
| `Glance.reading` | 15.5 / 58.4 | 5.3 / 13.0 | route planning and reading |
| `FightHelp.reckoning` | 0.0 / 202.0 | 0.0 / 77.8 | tail occurs on four danger turns |
| `DangerSense.play` | 0.0 / 201.1 | 0.0 / 77.5 | four fight simulations |
| `PlayerView.choices` → `frameRows` | 3.8 / 40.5 | 3.5 / 14.6 | public copies retained; frame uses canonical rows |
| `ScreenModel.fees` | 0.3 / 0.6 | 0.0 / 0.1 | read-tracked cache |

## First Part: Revision Lookup

`PlayerRevision.of` used to recompute `Campaign.offered()` before checking its other revision inputs on every read. The first change checks the world and external revision parts first on a stable between-command turn, avoiding repeated offer grounding; an open command or fight retains the original full check. The focused revision test passes, and `test/screen-oracle.test.ts` proves the kept screen/narration equal fresh on every golden-walk turn and seeded journey stop.

| Part | Before p50/p95 ms | After p50/p95 ms | Calls/turns |
|---|---:|---:|---:|
| `PlayerRevision.of` | 18.5 / 44.0 | 15.2 / 40.5 | 947 / 59 |
| `PlayerView.observe` | 35.2 / 73.8 | 28.8 / 70.0 | 218 / 57 |
| `ScreenModel.built` | 60.8 / 189.3 | 52.0 / 141.3 | 56 / 55 |

These profiles ran under differing shared-machine load, so the reductions are directional, not a causal claim. A later quality reading was turn 167 ms, still-turn 161/320 ms and decision 47/113 ms (median/p95), versus the earlier loaded snapshot 333, 320/662 and 96/248. The final update run measured still-turn at 131/284; `--only=still,still95 --update` lowered just those local ratchets from 150/330. No other baseline was updated or widened. Decision median remains above its ratchet, although lower than the earlier measured value.

## Second Part: Choice Rows

The public `PlayerView.choices` contract remains a fresh mutable copy for each caller. `PlayerFrame` uses `PlayerView.frameRows`, which calls `Campaign.readWorld`; that delegates to `KeptReading.memo`, scoped to the Campaign and keyed by the offered-list identity. `WorldReads` carries the row builder's dependencies through nested memo reuse. `Campaign.readout` calls `WorldReads.all()`, so readout-dependent rows are unkeepable across worlds and live only for their exact `PlayerRevision`. Rows and choice payloads are frozen once and shared by the frame and perception. The screen oracle passes after this change.

| Part | Before p50/p95 ms | After p50/p95 ms | Calls/turns |
|---|---:|---:|---:|
| `PlayerView.choices` (public mutable-copy path) | 3.8 / 40.5 | 0 / 0 (not used by frame) | 55 / 53 before; 0 / 0 after |
| `PlayerView.frameRows` (immutable frame path) | not present | 3.5 / 14.6 | 55 / 53 after |
| `PlayerFrame.of` | 4.1 / 45.1 | 3.8 / 20.7 | 400 / 58 |
| `ScreenModel.built` | 52.0 / 141.3 | 34.9 / 118.3 | 56 / 55 |

This profile does not establish a speed win: timings vary under shared load. Its proven results are safer cache invalidation, preserved public mutability, and immutable row sharing. Do not attribute the inclusive screen change to this part alone.

## Third Part: Fees

`ScreenModel.fees` now keeps the map of service, goods, hire and sale prices through `KeptParts`; its non-World key is the measures array's identity and length, while `WorldReads` records each measure it reads. The full screen oracle and fee-specific tests pass.

| Part | Before p50/p95 ms | After p50/p95 ms | Calls/turns |
|---|---:|---:|---:|
| `ScreenModel.fees` | 0.3 / 0.6 | 0.0 / 0.0 | 56 / 55 |

The saved time is small but the cache now follows the same dependency contract as prices. The final quality reading was turn 167 ms, still-turn 161/320 ms and decision 47/113 ms (median/p95). The turn and still-turn readings hold within their ratchets; the decision median remains above its local band. Only still-turn median/p95 baselines were lowered with `--update` (150/330 to 131/284); no band was widened.

## Scope Notes

Full gates on the final code with `NO_COLOR=1`: `check:fast` 2,268 passed, 172 skipped, 31 todo, 0 failed; `test:small` 1,197 passed, 0 failed. Typecheck and lint pass. The profiler measures headless presentation boundaries, not browser-worker time or contact-sheet frame time; the fight-end aftermath remains unmeasured here and belongs to OR-1350's `scripts/performance/fight-engine.ts`/`fight-press.ts` acceptance.

The profiler also records itinerary building, fees, prices and NPC goal explanation, so those OR-1362 candidates are not guessed at. Existing `Itineraries.shown` plans only the local scene or followed aim in this hex; full map routes are already deferred to `Itineraries.charted`. The next broad cost is `KeptParts`/`KeptReading.read` and perception. Further incremental work should target those with the screen oracle before expanding to the browser frame tree.
