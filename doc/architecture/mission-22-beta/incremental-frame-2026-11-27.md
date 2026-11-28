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

## After the Frame: Precision and the Module's Shape (the performance builder, 27 November, evening)

Three changes, each held by the screen oracle: a fact taken away and put back marks only itself as written, not its
whole relation (KeptReading; test/small/kept-put-back); the page's readers find entities by the module's one index
(EntityIndex, which now keeps the entities with roles) instead of walking the walk's 9,878 entities; and what a
glance and a chart ask of the module's shape (each place's site, the survey relations, the chapters' headings, each
act's words) is found once for it. Interleaved with the base (this doc's profiler fixed), three rounds each at load
4 to 5:

| Reading | Base, three rounds | After, three rounds |
|---|---|---|
| Median turn (ms) | 110, 105, 129 | 101, 103, 101 |
| Still turn, median / p95 | 106/241, 98/199, 116/232 | 96/168, 93/199, 96/197 |
| Decision, median / p95 | 34/80, 32/67, 37/88 | 30/88, 30/75, 31/82 |
| Leg, median / p95 | 47.7/174.7, 61.4/153.9, 74.2/183.5 | 40/143.6, 52.9/173.7, 56.9/170.5 |
| `frameRows` p50 | 2.2, 2.5, 3.0 | 1.9, 1.5, 1.6 |
| `perceive` p50 | 7.7, 8.2, 9.6 | 7.7, 7.2, 6.9 |
| `glanceRouting` p50 | 4.1, 4.3, 5.1 | 3.3, 3.6, 3.2 |

Measured but not kept: reading the towns the company was told of by each fact's key instead of everything it knows
(KnownCountry.named) took one chart miss of 45 away, the learned fact being among the chart's own reads anyway.

The next costs, ranked: the grounding after a move (OR-1600: some 140 schemas read where the company stands, 6,034 of
6,656 regroundings on the walk return what they had); the chart worked out again on 44 of 56 screens and the
itineraries after it (OR-1601); perception and the frame's rows worked out whole for every revision (OR-1602).

## Grounding After a Move, and the Chart Kept Without Here (the second performance builder, 27 November, night)

Two changes, each held by the screen oracle and the kept traces, each measured interleaved with the commit before it
on this shared machine (load 3.5 to 9; trust the differences, not the absolute readings).

**What a schema asks (OR-1600, closed).** Some 140 schemas read where the company stands on the way to finding that
nothing they need is there, so every move grounded them again. `SchemaAsks` reads from each schema's compiled
precondition the parts every act of it must meet (what it asks of the actor or of named things alone; the facts it
must find apart from the place; the facts it asks of the place the actor stands at, joined through what is bound) and
asks them before grounding. The first part unmet settles it, and only what that part read is noted in the grounding's
reading (`WorldReads.apart`), so the existing stale index of `KeptGroundings` (by names read) does the rest: a need
unmet apart from the place reads nothing of where the company stands, and one unmet at the place is asked again only
of the new one. Exact by construction (every part holds of any binding that holds); `KYRIE_CHECK_GATES=1` grounds every
schema found unmet anyway and throws if any of it holds (the oracle and the traces pass with it on). A grounding that
comes to the same operators is the same list (`KeptGroundings.alike`).

| Reading | Base, two rounds | After, two rounds |
|---|---|---|
| Groundings asked again a move (median; fresh Operators warmed on the world before each of 21 moves) | 218, 218 | 86, 86 |
| A move's grounding, median / p90 (ms, micro-benchmark) | 21.1/46.3, 18.9/35.7 | 12.8/31.5, 10.8/29.2 |
| Groundings over the walk; of them, the same as they were | 7,912; 5,288 | 4,664; 2,274 |
| `KeptReading.read` calls over the walk | 10,378 | 7,119 |
| Decision, median / p95 (quality, local) | 52/161, 41/98 | 44/116, 35/119 |
| Still turn, median / p95 | 167/295, 134/270 | 155/335, 112/258 |
| `observe` p50 / `perceive` p50 (frame-parts) | 28.5/12.3, 23.5/11.6 | 20.2/9.3, 19.2/8.0 |

**The chart kept without here (OR-1601, closed).** Where the company stands is read once outside the chart's kept
reading (`ChartModel.standing`): the plan it is on, below ground or not, the country it is in and the one it may go
across, and its darkness, through which the ways had told what bars them (benighted's `at(party, ?p)`); the chart is
kept by that and where it has been, and where it stands is marked on the plan kept (`ChartHere`, `LandModel.placed`).
The same plan marked at the same place is the same chart, and a chart or region drawn again just as it was is the one it
was, so that the itineraries, kept by the region's token, keep. Every chart, itinerary and charted journey of the
golden walk is byte for byte what the base drew.

| Reading | Base, two rounds | After, two rounds |
|---|---|---|
| Chart misses of 57 (here alone) | 46 (5) | 41 (0) |
| Itineraries' misses of 57 | 48 | 40 |
| The chart's misses over the walk (ms) | 336, 358 | 263, 265 |
| Median turn / still turn (quality, local) | 107/96, 94/89 | 93/88, 91/86 |
| Decision, median | 32, 28 | 29, 29 |

No local baseline was lowered: the machine was never quiet (load 3 to 9), though every reading after is under its
ratchet or within its slack (turn 121, still 131, still95 284, decision95 92; the decision 28 to 29 against 28).

The next costs, ranked: the schemas whose needs pass only through a query or a negation (OR-1700: attack's reaches and
peaceable, the ways with things, a measure compared; 2,169 groundings of the walk give the nothing they gave, attack
some 3 ms each); perception and the frame's rows worked out whole for every revision (OR-1602, some 8 and 2 ms a turn);
the chart drawn whole on 41 screens, 17 of them for a place first come to (OR-1701, some 6 ms each).
