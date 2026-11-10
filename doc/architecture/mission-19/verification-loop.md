# The verification loop left by Mission 19

Three checks were added in M19's closing pass. They are fast, and they play the game as a player meets it. They add
to the full corpus; they do not replace it. The full suite (six shards), the browser specs and the long descents
still run on every push, and a release still needs them.

## The three checks

| Check | Run it | Takes | Fixed inputs | Plays by |
|---|---|---|---|---|
| Player contracts | `bun run test:intent` | ~47 s locally, one process | kahitude, kite and a1; a warrior; origins courier, kin, wanderer | Engine and page projections; refusals sent straight to the campaign |
| Honest start | `bun run test:honest` | ~36 s locally | kahitude; a human warrior "Wenna"; the kin and debt origins | The page's lead only (`test/support/honest-player.ts`) |
| Reference hour | `KYRIE_TOUR=1 KYRIE_SHOTS=<dir> bun test test/reference-hour.test.ts` (needs Chromium: see the Playwright NSS note) | ~2.5 min on CI | kahitude; the debt; a warrior of the page's own default company | The rendered page in Chromium, by its leads |

On CI, the **player contracts** job runs `test:intent` and `test:honest` and answers in about 2.5 minutes, before
the suite's verdict. The **reference hour** job runs the tour and uploads a picture of every step, with `tour.txt`,
as the run's artifact. It may fail without failing the workflow (`continue-on-error`): it is evidence for a person
to read, not a gate.

### Player contracts (`test:intent`)

`objective-target`, `hex-ways`, `choice-contract`, `stakes`, `danger-talk`, `aim-inside-site`.

**Holds:**
- An aim's declared target is parsed, namespaced and refused when it names nothing, and resolved once into a
  subject, the place where it is done, and the place to go by. The map is given an addressee's town, not their room.
- From every out-of-doors place of two generated worlds, nothing the page offers crosses into another hex.
- The campaign refuses a crossing sent as an ordinary command, and takes it as a map journey's leg.
- Every map choice is a `travel:` with a plan, and one is set out on.

**Does not prove:**
- That the target is hidden from the journal or the local choices before it is learned (only the map is tested).
- Anything about authored countries, which are outside the hex rule.
- That anyone understands what the page shows.

### Honest start (`test:honest`)

**Rules (`HonestPlayer`):**
- Each step is the glance's first lead.
- At a person, the reply drawn in the aim's gold, else the first shown.
- A `travel:` lead is set out on as the map does (`Travel.go`).
- Fights are fought as "let them fight" fights them.
- No teleport, no knowledge given, no command chosen by id.

**Journeys:**
1. **Kin.** The brother, the road, the ruts, home, the mother told: the aim retired.
2. **Debt.** The promise to the creditor, the inn, the innkeeper's question, the nearest place told of, set out for
   and arrived at, kept over a save and a restore.
3. **Kin continued.** Its errand done, the son is led about the town (unvisited places, people with something to say)
   and down under it, to a fight won and something found. He does not find the notice of jobs: M19-234 is open.

**Does not prove:**
- That the leads are understood, or pleasant to follow.
- That the debt can be paid.
- That a character other than a lone human warrior survives.
- Anything at another seed.

### Reference hour (`test/reference-hour.test.ts`)

The debt's opening in Chromium, at 1280 by 800. The page's leads are taken:
- at a place, the glance's lead;
- in talk, the gold reply;
- a journey lead by the lit Map key, then "Set out" on the map;
- in a fight, the T key until the fight ends, then "Go on";
- a find's pane: its first act.

It stops where the same lead comes three times.

**As of run 42772673502:** shop → the promise → the green → the inn → the innkeeper's question → the Map key →
"Set out for Lapisrecs" → the barrow → the bats fought → a torch → the flute and the amethyst taken → the coins
gathered → the passage stone read → the pressure plate risked → the counterweight levered → down the stair → the hall
of the bones, where the stone casket's riddle stops it.

Since 10 November the inn tells of no deep halls, so the debt now goes to Seolforfyrd (the hobs' toll-house); the next
run's tour follows that path.

**Does not prove:**
- The first hour as a whole: it has never reached a debt paid, a return to town, or an ending.
- Anything a person would think of what they see.

## What CI cost, before and after

| | Before (the review's run at c56669b4) | After (10 November) |
|---|---|---|
| Wall clock | 45 m 40 s; suite shard 1 of 5 cancelled at its limit, as in every run seen | ~40 m; every job passing |
| Suite shards | 5 | 6, balanced on timings that now cover every file |
| Spec files with no timing | 160 (~180 test-minutes the shards could not weigh) | 0, read from a complete CI run |
| First relevant verdict | at the suite's end | the player contracts, in ~2.5 min |

**A negative result.** Building the browser site once per shard was tried, and reverted:
- **Not the cost.** One build takes 2 s, so the twenty-six specs' rebuilds cost under a minute; the shard's test step
  went from 14 m 37 s to 14 m 54 s.
- **Not equivalent.** The shared site was built with every fixture, and its larger bundle made the handbook specs time
  out.

The browser time is in the journeys themselves (register M19-237).

## What was not built

The throughput review's larger interventions are in the M20 backlog, not done:
- content-addressed reusable fixtures;
- dependency-recorded test selection;
- checkpoints in place of replayed prefixes;
- moving simulation-only browser specs to headless;
- a scheduled corpus gate;
- phase timings in failures;
- a performance trend suite.

See [closure.md](closure.md) §5.

Running the full suite locally (sixteen workers) overloads the builder's machine. Full runs belong to CI: push a
branch.
