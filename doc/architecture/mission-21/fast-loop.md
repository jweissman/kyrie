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

## What is next in Phase 0

See the progress section of [progress.md](progress.md).
