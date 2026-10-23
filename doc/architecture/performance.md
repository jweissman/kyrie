# Performance and the development loop

Measured 2026-10-20 on a 16-core WSL2 machine with Bun 1.4.3. Baseline = commit `0948983` (the prior agent's
work, before any change below). Reproduce with `bun scripts/bench.ts` and per-file runs of `bun test ./test/<file>`.

## Test tiers

| Command | What | Wall time |
|---|---|---|
| `bun run test:changed` | files affected by uncommitted changes (Bun's git-aware selection) | seconds |
| `bun run test:fast` | everything except the 608-call public-CLI proof | **18 s** |
| `bun run test` | full suite, `--parallel` | **35–39 s** |
| `KYRIE_BROWSER=1 bun test test/*-browser.test.ts` | opt-in real-browser journeys | — |

Baseline `bun test` (single process) did not finish in 17 minutes. Run one file at a time the suite took **1,788 s**
(about 30 minutes), with four 60 s timeouts in `caught-below`, `expedition` and `play-session` **even run alone**. The same
files now take about 110 s one at a time. Every file now passes
serially and in parallel with the original timeout limits.

| File (serial) | Baseline | Now |
|---|---|---|
| caught-below | 481 s, 2 timeouts | 9.4 s |
| expedition | 370 s, 1 timeout | 7.7 s |
| red-crag | 233 s | 7.2 s |
| serewater-march | 157 s | 6.7 s |
| causal-integration | 129 s | 4.7 s |
| command-contract | 126 s | 8.0 s |
| overlays | 109 s | 10.6 s |
| play-session | 74 s, 1 timeout | 11.0 s |
| deem-choice-space (608 CLI processes) | 64–92 s | 22 s |
| arena | 18 s | 5.9 s |
| authoring-guide | 18 s | 2.7 s |

## Engine workloads (`bun scripts/bench.ts`, Serewater March: 999 facts, 24,766 grounded actions)

| Workload | Baseline | Now |
|---|---|---|
| Load campaign (first in process) | 16.3 s | 2.75 s |
| Load campaign (again, same inputs) | 15.2 s | 2 ms |
| List player choices | 166 ms | 90 ms (first; then cached per state) |
| Walk one hour (6 ticks) | 1,579 ms | 23 ms |
| Wait one tick (10 min) | 702 ms | 14 ms |
| Camp (8 hours) | 8,269 ms | 122 ms |
| 23-command rescue-and-lodging session | 26.0 s | 0.65 s, **byte-identical canonical output** |
| 200 arena encounters | 3.9 s | 1.35 s |

October 21, 2026, after the register-of-names conflict and Holt keep (3,509 facts, 116 schemas, 74 rules, five powers
planning): a watch costs about 10 ms when nobody is planning, and a power's first long plan once costs more (Corvin's
eight-step errand, about 130 ms). Measured: load 3.2 s (first), 5 ms (again); choices 39 ms; an hour's walk 224 ms;
one watch 49 ms; six watches 203 ms; camp 486 ms; save and restore 87 ms (a 1 MB save).

## What was wrong

Costs were not proportional to relevant work. Every one of these traversed or copied unrelated state:

- **`World` copied everything on every step.** Construction `structuredClone`d the full state, each assert re-keyed every
  fact, and `Campaign.world` built a fresh `World` on *every property access*. Now a world indexes facts by key and by
  relation, forks copy-on-write per relation, memoizes its key and snapshot, and the campaign caches one world per state.
- **Applicability applied effects.** Testing whether an action was possible cloned the world to apply its effects. Now
  `World.admits` checks effect validity without building a world, and `Planner.applicableAmong` files each grounded action
  under one fact its precondition requires (preferring an exclusive relation such as `at`), so only actions whose guard
  holds are evaluated. Action lists are indexed by actor, so an NPC no longer scans all 24,766 actions per tick.
- **Quadratic bookkeeping.** Module validation used `indexOf` uniqueness and linear entity lookups over 24k actions (and
  ran twice); command receipts and tick diffs compared fact lists pairwise. All are now hashed.
- **Projection recomputed every tick.** `CreatureFacts.project` ran before every NPC decision. It now runs only when the
  creature store (new `version`) or a relation it writes (new per-relation `World.stamp`) has changed.
- **Deem rebuilt its interpreter per instance and reparsed every expression.** One Ohm semantics is shared (the active
  runtime is passed through a re-entrant slot) and parses are cached by source text.
- **Loads repeated deterministic work.** `Campaign.load` memoizes per (source, path, seed, party) and returns forks that
  share the immutable compiled operators and copy all mutable state.
- **The CLI proof ran 608 processes sequentially.** They are independent; the script now runs them 8 at a time.

## Determinism and random streams

- The session above produces byte-identical canonical output (transcript, save, player view, chronicle) before and
  after. All recorded transcripts replay unchanged.
- Kyr already keys streams by identity: each creature's population, class, attributes, name, traits, spells, weapon and
  armour draw from separate streams; encounters by action identity and occurrence; modules by module id. Checked
  directly: giving a character rope changes nothing else about it; choosing a different dragon lineage changes only
  lineage-dependent properties.
- **Fixed:** Deem seeded string seeds with a *sum of character codes*, so anagram seeds (`choice-12`/`choice-21`) produced
  identical streams. It now uses FNV-1a (the hash Kyr already used). Public CLI outputs for string seeds changed; the
  recorded examples were regenerated with `bun scripts/record-cli-examples.ts`. Kyr passes numeric seeds and is unaffected.
- One generated Deem expansion (a single creature) still shares one stream, so adding a draw early in a template shifts
  later draws *within that creature*. This is causal within one object and is left as is.

## Demand grounding (second wave)

Campaigns no longer ground every schema at load. `Operators` (`src/campaign/operators.ts`) finds a schema's candidate
bindings by joining the positive facts its precondition requires against the current world (most-bound atom first),
enumerates any parameter left open over the entities of its type, and then applies the unchanged test (full
precondition and admissible effects). A binding with a true precondition satisfies every positive conjunct, so the
set is exactly what eager grounding and filtering produced: checked for the player, every NPC and the unrestricted set
across 30 states of all four campaigns, and the canonical 23-command session is byte-identical. Operators are made once
per id, so event logs, pending actions and random seeds resolve ids as before.

| Serewater March | Eager | On demand |
|---|---|---|
| Load (first in process) | 2.57 s | 1.06 s |
| Save | 34.8 MB | 0.40 MB |
| Save + restore | 1,355 ms | 24 ms |
| List the player's choices | 89 ms | 18 ms |

Scaling (`bun scripts/scale-bench.ts`: a chain of rooms with items, generated through the real loader):

| Places | Items | Company | Eager operators | Load | Choices | Tick | Save |
|---|---|---|---|---|---|---|---|
| 5 | 5 | 2 | 1,736 | 184 ms | 8 ms | 5 ms | 113 KB |
| 20 | 40 | 3 | 17,248 | 154 ms | 4 ms | 4 ms | 144 KB |
| 40 | 80 | 3 | 43,068 | 203 ms | 4 ms | 5 ms | 177 KB |
| 40 | 80 | 6 | refuses (>20k for one schema) | 189 ms | 7 ms | 8 ms | 196 KB |
| 80 | 160 | 6 | refuses | 295 ms | 8 ms | 9 ms | 260 KB |

Scenarios in a generated region (same bench, seed `thorn`, upland; each scenario adds its modules and a word-of-mouth
module, see [generated-worlds.md](generated-worlds.md)):

| Scenarios | Modules | Entities | Schemas | Load | Choices | Tick | Save |
|---|---|---|---|---|---|---|---|
| 0 | 1 | 410 | 27 | 198 ms | 6 ms | 11 ms | 249 KB |
| 1 | 4 | 550 | 36 | 778 ms | 8 ms | 15 ms | 381 KB |
| 2 | 6 | 603 | 39 | 1,041 ms | 20 ms | 18 ms | 448 KB |
| 3 | 8 | 648 | 41 | 1,340 ms | 21 ms | 24 ms | 486 KB |
| 4 | 10 | 691 | 43 | 1,610 ms | 15 ms | 22 ms | 525 KB |

Load grows by about 270 ms per scenario (compiling its modules and generating its creatures); choosing and ticking
stay flat because they depend on what is near the company, not on what exists.

## Remaining risks

- The load cache assumes bundle files do not change during a process. A long-lived dev server that edits `.kyr` files
  must restart (or use a fresh `BundleSource`) to see changes.
- Shared compiled operators rely on a convention that loaded `Operator`s are never mutated in place. A test that pushes
  into `campaign.module.actions` is isolated (forks get fresh arrays), but nothing freezes the operator objects.
