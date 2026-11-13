# Mission 21, Phase 0: the fast loop

Working record of the enabling sprint (brief: [brief.md](brief.md), Phase 0). M20's measured diagnosis is
[../mission-20/test-loop.md](../mission-20/test-loop.md); this file does not repeat it, it says what changed and what it
cost.

## The baseline (12 November, night, at d3607041; this machine: WSL2, 16 CPUs, 15 GB)

| | Cold | Warm |
|---|---|---|
| `bun run check:fast` (typecheck:fast, lint:fast, test:quick) | 67 s | **18 s** (667 pass) |
| the quick suite alone | — | 10–11 s (303 files) |
| the whole suite (CI, ten shards) | 45–60 min wall; 1 087 kept file-minutes | |

**The real inherited loop for a gameplay change is CI.** The quick suite is fast but leaves out every spec over two
seconds, which is every spec with a world in it. `test:changed` selects the specs whose imports reach a changed file,
and almost every source file reaches almost everything: **the median file in `src/` is imported (transitively) by 670
of 846 spec files, 99 % of the suite's kept CI time** (`/var/tmp/kyrie/tools/reach.ts --all`; the quartile below the
median is 11 specs, 32 CI-minutes). A change to the gold (`src/presentation/aim-advances.ts`, `glance.ts`), to
affordances or to engagement reaches 670–672 specs. So a developer either trusts the quick suite, which never
exercises gold, signals, talk or the map, or waits for CI.

The 10× target is therefore not "make the quick set faster" (it is 10 s already) but **put the gameplay guarantees
into it**: the rules that the expensive specs prove through a generated country, proved on worlds that start in a
tenth of a second.

## The small lane: `test/small/`, on `test/support/tiny.ts`

`Tiny.start(kyr, { party?, chart?, rules? })` is one Kyr module written in the spec, on the shared rules, started in
**0.07–0.25 s** (a generated country: 7–8 s). It plays through the engine's own `Journey` (steps by the labels a player
sees, strict: an ambiguous step fails), and reads the page's own projections (`ScreenModel`, `Narrator.leaf`'s glance,
`MapView` for the map). Its ids are `t__<id>`. A hand-drawn `chart` gives it a land with stretches of open country
(the map's "across country" path, which an authored region's land has not got).

Every spec in `test/small/` is in the quick suite whether timed or not (`scripts/test-quick.ts`); `bun run test:small`
runs the layer alone (2–4 s).

### The five regressions the brief asked for

Each was checked against the fault it is for: the fault put back by hand, the spec fails; taken out, it passes.

| Brief's case | Spec | Bed | Time | The fault restored |
|---|---|---|---|---|
| Gold only for the followed undertaking | `small/gold` | an inn-yard, two aims | 0.24 + 0.15 s | `Undertakings.followed` following the first aim held for the player: fails |
| A blue or coral signal resolves to its act | `small/signals` (shares `support/signals.ts` with `signal-inside`) | a green of three | 0.24 + 0.27 s | blue for any word to be had (the wagoner): fails |
| Intra-hex movement does not exit the place | `small/own-hex` | the Reedlands: Hythe, a barrow, three fens (hand chart) | 0.1–0.3 s each | E155's guard in `MapView.way` removed: fails (it had **no spec** before) |
| Conversation reflects who is actually there | `small/one-or-many` | a churchyard: one grave-robber, or three | 0.33 s | the old line filter: a band's line, or the stock one, said of one: fails. **Fixed here** (T24-19 "one of him says") |
| An action's state changes are correct and inspectable | `small/state-changes` | a yard with a seller | 0.29 s | — (pins the event's changes and `inspect`'s refusal) |

Found on the way: E155's fix lived in the browser's `web/reader/map-view.tsx` with no spec (a navigation decision made
by the page, which is the projection boundary the retrospective names); the error "Invalid initial knowledge" named
neither the fact nor the remedy (now it does).

### Writing a small spec

```ts
import { Tiny } from '../support/tiny';
const t = await Tiny.start(`
  Place yard "the yard" is room.
  Company party "You" of 1 at yard.
  Person halm "Teodor Halm" at yard { Role "a scholar". Peaceable. Pronouns he. Sells torch for 2 coin from 3. }
  Initially Set quantity(party, gold) to 20.
  Goal false.`);
await t.play('Buy a torch');            // by the label a player sees
t.journey.taken.at(-1)!.event.changes;  // every change, written
t.gold; t.glance; t.screen;             // what the page leads with, and what it is drawn from
```

A world that fails to compile says so with file and line in under 0.1 s. The forms to copy are the probes in
`test/fixtures/probes/` (125 of them), each a small world for one rule.

### Rules ported down from Westernesse specs

| From (CI-seconds) | To | Time | The fault restored |
|---|---|---|---|
| `gold-thread` (190) | `small/gold-thread`: the thread walked, one gold a step, inn → door → search → box | 0.3 s ×2 | search led only for a sign or a naming: fails |
| `companion-sensed` (31) | `small/companion-sensed`: a lane of three | 0.3 s ×2 | perception reach 2: fails |
| `voice` (the hour, 16) | `small/hour`: a green and an adit | 0.2 s | night underground: fails |
| `weary-fights` (18) | `small/weary-fights`: two galleries, kept and replayed | 0.6 s | the fight's weariness written back: fails |

The Westernesse specs stay for their generators' part until the suites are split (below).

**A defect found by porting** (fixed, 42d32a15): at the door of a keep with the dead man's box under its stone, the
gold went into the gate-passage and back out before it searched. `Promotion.allowed` led a search only for a sign or
for the aim's naming, and the naming is withheld while a way on is untaken; the `advance` that `AimAdvances` gave the
search was dropped. `gold-thread`'s Westernesse test asserted that `AimAdvances.of` contained the search, an
intermediate value, and stayed green while the page never led with it. **A small spec that walks the page's own gold
catches what an assertion on an intermediate does not**; this is the pattern for the rest of the ports.

## Experiment A: the mechanics, on the real kernel, without Westernesse (the owner, 13 November)

Each row is a rule played through the engine's own actions and the page's own projections, in a world written in the
spec; each was checked against its fault (the rule broken by hand: the spec fails). Times are the file's, on this
machine, almost all of it the world's start (0.1–0.25 s).

| Mechanic | Spec | Bed | Time | What breaks it |
|---|---|---|---|---|
| Gold-follow state | `small/gold`, `small/gold-thread` | inn-yard, two aims; a keep with a hidden box | 0.28, 0.38 s | following the first aim for the player; a search not led for the aim |
| Recruitment, and its signal | `small/signals` | a green of three | 0.38 s | blue for any word; rose not resolving |
| Perception range | `small/companion-sensed` | a lane of three | 0.21 s | reach 2 |
| Communication (who speaks) | `small/one-or-many` | one grave-robber, or three | 1.26 s (two worlds) | a band's line said of one |
| Knowledge propagation | `small/knowledge` | learn, tell one who trusts, a rule acts | 0.17 s | stale news passed on |
| Inventory transfer | `small/inventory`, `small/state-changes` | a company of two; a seller | 0.20, 0.23 s | — (pins the changes and inspect's refusal) |
| Movement in one's own hex | `small/own-hex` | the Reedlands, hand-drawn land | 0.47 s | E155's guard removed |
| Combat's effects on the world | `small/weary-fights`, `small/fight-after` | two galleries; a den | 0.77, 0.23 s | the fight's weariness written back |
| Time of day | `small/hour` | a green and an adit | 0.14 s | night underground |
| The authoring path | `small/single-module` | `test/fixtures/single/yard.kyr` | 0.29 s | — |

**The kernel is cheap; the start dominates.** A rule's own steps cost milliseconds; the 0.1–0.25 s is assembling
one module on the shared rules. Generated worlds' 7–8 s is the cost of Westernesse, not of the rules.

## Where a playthrough's time goes, and what did and did not help (13 November, night)

Measured on the Book of Faces (`ombra-local`, 32 tests, 8 min locally, 13.6 CI-min):

- **96 % of a test is its prefix**: start 1.0 s, the walk to the Row 0.9 s, two days' waiting 4.4 s; the test's own
  tail 0.23 s.
- **Kept prefixes** (`test/support/kept.ts`, a journey resumed from the longest beginning of its steps played before in
  the process): **8 min → 6 min 37 s (−17 %)**, all 32 passing on resumed games. Less than hoped: the tests share one to
  three steps before they diverge, and their dear waits are their own.
- **What a wait costs**, profiled: 70 % is the driver building the whole page between every hour (`Journey.screen` →
  `ScreenModel.build`); the engine's own passing of time is 19 %. Within the page: grounding every action
  (`Operators.applicable`, a third of the wait, ≈ 24 ms a step) and the map's land.
- **The land's nearest blocks** (`LandModel.goes`) were measured again at every page: memoised per chart, the page's
  cost in the wait fell 3 986 → 2 945 ms (−26 %). This is the live game's cost too.
- **Keeping each action's grounding while what it reads is unchanged** (the tick's `Reads`/`agrees` mechanism, per
  schema): tried, and **reverted: a 4.5 % hit rate**. The townsfolk move every hour, and nearly every action reads
  `at(actor, site)` (63 650 of 72 833 misses), then `hour`. Reuse would need stamps per relation *and argument* (where
  the company is, not everyone): a change to `World`, for the world-construction investigation.
- **CI with `--no-isolate`** (branch `ci/no-isolate`): every spec passes (no state leaks across 846 files), but the
  shards' total is the same (271 → 280 shard-minutes, noise): on CI a file runs for seconds to minutes, and its 0.5 s
  of imports is nothing. **Not adopted.** CI's wall-time is its work, ≈ 270 shard-minutes over ten shards.

## The suites, by what they are for

| Suite | Command | What | Where |
|---|---|---|---|
| small | `bun run test:small` | rules on tiny Kyr worlds | local; CI's "player contracts" job (minutes) |
| quick | `bun run test:quick` (in `check:fast`) | small + units + specs under 2 s | local, ≈ 11 s |
| near a change | `bun run test:changed` | the quick specs a change reaches; says what it leaves to CI | local, ≈ 9 s for an edit to the gold |
| confidence | `bun test` (CI's ten shards) | everything else: adventures, generated worlds | CI, every push |
| long | `KYRIE_LONG` specs (CI's long descents) | descents, every province in one world | CI, every push |
| browser | `*-browser.test.ts` (`KYRIE_BROWSER=1`) | the page in Chromium at four sizes | CI, two shards |

## What is next in Phase 0

See the progress section of [progress.md](progress.md).
