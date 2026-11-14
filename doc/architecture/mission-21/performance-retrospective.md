# Mission 21: a performance retrospective

*Succeeded by [performance-report.md](performance-report.md) (15 November, evening): the same measures again, world
size in facts, and where its figures differ from these (its §7).*

Written for the owner, 15 November. Measurements are on this machine (WSL2, 16 CPUs, 15 GB) and on CI (GitHub
runners). "Before" means the baselines recorded at the start of M21:
- [fast-loop.md](fast-loop.md), 12 November;
- [loading-boundaries.md](loading-boundaries.md), 13–14 November.

Where a before and after were not measured the same way, the table says so.

**The honest summary:** most of the dramatic gains are in **the test harness**: what runs when, on what world, and how
it is sharded. The **runtime and compiler** gains are real but narrower. They fixed quadratic and world-sized costs
so that a local act's cost follows what it touches. A full world's start remains about as heavy as it was.

## 1. What became dramatically cheaper

| What | Before | Now | Harness or runtime |
|---|---|---|---|
| A gameplay rule proved by a spec | a generated country, 7–8 s, CI only | a tiny Kyr world, about 0.12 s warm (0.25 s cold), in the local loop | **harness** (test/support/tiny.ts) |
| Specs that prove gameplay locally in under 30 s | the quick suite, 667 tests, none exercising gold, signals, talk or the map | 1,215 tests in 471 files, including 150 small-world spec files; gold, signals, talk, the map, the fight, promises, parity | **harness** |
| What a push runs | the whole suite, 45–60 min wall | the push lane, 755 files (74 kept CI-minutes), **5 min wall**; the whole suite nightly and on demand | **harness** (test/lanes.json, timing-kept lanes) |
| The whole suite on CI | about 270 shard-minutes over 10 shards, 45–60 min wall | about 174 shard-minutes over 16 suite shards plus about 45 browser minutes; **28 min wall**, set by one browser shard | **harness** (sharding), and some runtime (below) |
| Starting a world of 4,000 rooms with one room's act held constant (scale-costs) | **35.6 s** | **0.93–1.0 s** | **runtime**: exclusive asserts indexed (Displaced), ohm's children read once, the binder's join order |
| Looking again at an unchanged room in that world | 369 ms | 75–90 ms | **runtime**: the same three fixes |
| Acting in that room | 35 ms | 22 ms, flat from 0 to 8,000 rooms | **runtime** |
| A journey of four legs, writing the game out | 5 whole-game saves | 1 | **runtime/host** (EngineHost.travel, AX-05) |

## 2. Test costs now

| Loop | Command or job | Now | Before |
|---|---|---|---|
| Local fast gate | `bun run check:fast` (typecheck, lint, quick suite) | 21–29 s warm, 1,215 tests | 18 s warm, 667 tests (67 s cold) |
| Local near a change | `bun run test:changed` | about 9 s for an edit to the gold | — |
| Small lane alone | `bun run test:small` | 2–4 s | (did not exist) |
| Push (CI) | push lane, 8 shards | 5 min wall; shards 2–5 min each | whole suite on every push |
| Full suite (CI) | 16 suite shards | 4–19 min a shard; 174 shard-minutes | 10 shards, about 270 shard-minutes |
| Browser (CI) | 39 browser spec files, 2 shards | 17 and 28 min | 2 shards (not recorded in the baseline) |
| Long descents (CI) | KYRIE_LONG | 3 min | — |

**Coverage retained:**
- **Nothing was dropped to make a lane fast.** Every spec still runs nightly and on demand, and a spec leaves the
  push lane only by its kept time.
- **The suite has grown:** 1,061 spec files (911 in test/, 150 in test/small) against 846 at the baseline.
- **The kept timings cover 923 files, 754 CI-minutes in all.** The rest lane is 267 files, 680 CI-minutes: what a
  push does not yet run. Its top is waits in drawn countries (silent-lord-malice alone 19 CI-minutes), being worked
  on (section 5).
- **Tonight's pins are guarded:** each was checked against a mutation, failing with its fix undone.

## 3. The runtime and the compiler

**Start-up of a full world (a1, warm, fresh process):**

| | Before (13 Nov) | Now (15 Nov) |
|---|---|---|
| Drawn, composed, started (a1) | 6.5 s warm, 15.1 s cold (first page included) | 5.5 s warm (`PlayTool.start`, first page not included: **not the same measure**) |
| Of it: 39 module installs | 2.5 s | 2.25 s (41 % of the start) |
| Of it: `structuredClone` | 1.5 s self time | still about a fifth of a start; whole-world copies in start, save and restore |
| Cold parse | 8.6 s of the 15.1 s | unchanged in kind; kept on disk warm |

So a full start is **about the same**: the gains went into locality, not into the start.

**Small worlds:**

| Scale | Warm |
|---|---|
| A tiny Kyr world (one module on the shared rules and the canon) | about 0.12 s; 0.25 s cold |
| An authored adventure alone (Low Water) | 0.69 s (13 Nov) |
| Full Westernesse | 5.5–6.5 s |

The tiny world installs only its module and the canon, and draws no country (test/small/tiny-costs pins that).

**The working set held constant** (scripts/scale-costs.ts: a cellar of five things, a world growing elsewhere):

| Rooms elsewhere | Start | First observe | Act | Observe again | Heap |
|---:|---:|---:|---:|---:|---:|
| 0 | 0.52 s | 63 ms | 24 ms | 31 ms | 25 MB |
| 1,000 | 0.96 s | 102 ms | 14 ms | 45 ms | 46 MB |
| 4,000 | 0.93–1.0 s | 217 ms | 22 ms | 77–90 ms | 131–157 MB |
| 8,000 | 1.7 s | 271–296 ms | 34 ms | 113 ms | 194–282 MB |

- **The act is flat. Starting grows linearly.** test/working-set pins both on every push.
- **The first observation still grows with the world** (LC-02): a long tail of per-entity reads, none over about
  21 ms.

## 4. What is still heavy

- **The 39 installs: 41 % of a world's start (AX-03).** Each validates the whole composed module again, shared rules
  included. Validating by reference is sound only if validity is monotone in the module it is checked against; that
  has to be proved first.
- **Waiting in a drawn country: about 7 s a game day (LC-03).**
  - In the **harness**: Journey.until steps an hour at a time, and each hour builds a whole screen and narrated leaf,
    about 44 % of a wait.
  - In the **runtime**: the world's watches run, about 18 %.
  - Keeping views across hours failed twice: grounding at a 4.5 % hit rate, and the map's reads unchanged in only 7 of
    27 hours. In a living country, `at` changes most hours as someone somewhere moves; per-name stamps are too coarse.
  - The real fix is stamps by relation and subject.
- **Setting out in the browser: 10–17 s** (the interaction research's measure). This is the worst moment of the first
  touch, and it is start-up work, not the page's.
- **A journey's legs:** about 630 ms each on kite, a screen and a narrated leaf per leg, shown leg by leg.
- **The browser shard:** 28 min, the full suite's wall.

## 5. Being worked on now, and what needs investigation

- **The fast-lane line (ci/fast-n):** moving the rest lane's top specs onto tiny worlds or cheaper waits, measured
  before and after, each conversion mutation-checked.
- **Needs investigation:**
  - stamps by relation and subject (LC-03);
  - proving validation monotone (AX-03);
  - the cold parse;
  - `structuredClone` in start, save and restore.

  None of these is a harness change; each is runtime work.
