# Incremental Frame: Baseline, 27 November 2026

## Method

`NO_COLOR=1 scripts/machine/heavy.sh bun scripts/performance/frame-parts.ts` replays the same 59-turn warrior golden walk as the quality gate. The profiler wraps existing method boundaries and reports each turn's p50/p95 milliseconds, call totals and number of turns called. Measurements are **inclusive and nested**, so rows do not sum to a turn. This baseline ran while two other heavy test lanes were active; use it as a directional part breakdown, not a clean absolute timing claim. Repeat the same command after each part.

## Baseline

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

The quality-walk snapshot before changes was: median turn 333 ms, still-turn median/p95 320/662 ms, decision median/p95 96/248 ms. The command ran while other heavy jobs were active and compared against the local ratchet (121, 150/330, 28/92); it is not suitable for lowering a baseline. No baseline is changed by this report.

## First Part: Revision Lookup

`PlayerRevision.of` used to recompute `Campaign.offered()` before checking its other revision inputs on every read. The first change checks the world and external revision parts first on a stable between-command turn, avoiding repeated offer grounding; an open command or fight retains the original full check. The focused revision test passes, and `test/screen-oracle.test.ts` proves the kept screen/narration equal fresh on every golden-walk turn and seeded journey stop.

| Part | Before p50/p95 ms | After p50/p95 ms | Calls/turns |
|---|---:|---:|---:|
| `PlayerRevision.of` | 18.5 / 44.0 | 15.2 / 40.5 | 947 / 59 |
| `PlayerView.observe` | 35.2 / 73.8 | 28.8 / 70.0 | 218 / 57 |
| `ScreenModel.built` | 60.8 / 189.3 | 52.0 / 141.3 | 56 / 55 |

These profiles ran under differing shared-machine load, so the reductions are directional, not a causal claim. The quality reading after this part was turn 221 ms, still-turn 202/443 ms and decision 65/172 ms (median/p95), versus the earlier loaded snapshot 333, 320/662 and 96/248. The turn and decision remain above their ratchets; the still-turn values are within slack. None fell below the checked-in baselines, so no `--update` was applied.

## Second Part: Choice Rows

The public `PlayerView.choices` contract remains a fresh mutable copy for each caller. `PlayerFrame` now uses `PlayerView.frameRows`, which retains canonical rows only with a `KeptReading` record and explicit campaign/module/actor/offer key. A read of `Campaign.readout` makes rows unkeepable across worlds; the current frame holds them only in its `PlayerRevision`. Rows and choice payloads are frozen once and shared by the frame and perception. The screen oracle passes after this change.

| Part | Before p50/p95 ms | After p50/p95 ms | Calls/turns |
|---|---:|---:|---:|
| `PlayerView.choices` (public mutable-copy path) | 3.8 / 40.5 | 0 / 0 (not used by frame) | 55 / 53 before; 0 / 0 after |
| `PlayerView.frameRows` (immutable frame path) | not present | 4.8 / 31.0 | 55 / 53 after |
| `PlayerFrame.of` | 4.1 / 45.1 | 5.2 / 42.6 | 400 / 58 |
| `ScreenModel.built` | 52.0 / 141.3 | 53.5 / 168.9 | 56 / 55 |

This profile does not establish a speed win: timings vary under shared load and the inclusive screen is higher in this run. Its proven results are safer cache invalidation, preserved public mutability, and immutable row sharing. The quality readings across these runs ranged from turn 186–235 ms, still-turn 179–216/418–457 ms, and decision 56–65/151–179 ms (median/p95). The variation and ratchets show no reliable gain; turn and decision remain above baseline. No baseline was widened or updated.

## Third Part: Fees

`ScreenModel.fees` now keeps the map of service, goods, hire and sale prices through `KeptParts`; its non-World key is the measures array's identity and length, while `WorldReads` records each measure it reads. The full screen oracle and fee-specific tests pass.

| Part | Before p50/p95 ms | After p50/p95 ms | Calls/turns |
|---|---:|---:|---:|
| `ScreenModel.fees` | 0.3 / 0.6 | 0.0 / 0.1 | 56 / 55 |

The saved time is small but the cache now follows the same dependency contract as prices. No quality baseline is lowered: the final local reading was turn 235 ms, still-turn 216/457 ms, and decision 65/179 ms (median/p95), a loaded run that did not beat the ratchets.

## Scope Notes

The profiler directly records itinerary building, fees, prices and NPC goal explanation so the other OR-1362 candidates are not guessed at. Their measured golden-walk costs are smaller here than the screen's aggregate. Next by broad cost are kept-part reads/validation and perception; the fee opportunity remains separately measured. OR-1350 remains a separate fight-end concern; this golden walk's ordinary place-build timings do not replace the dedicated fight-engine measure.
