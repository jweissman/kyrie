# Validation first: the plan (14 November)

The owner's ruling: engaging several agents barely helps while every one of them validates through the same slow
gates, so validation is optimized before any further swarming. The aims are: a staged pipeline; every test as the
baseline gate on every push, fast; deploys gated on the full run; nightlies only for inherently long journeys and
evidence (kept green, and their artifacts reused for critique rather than regenerated); and quality gates moved down into
lower-order tests that exercise less of the universe. "Ideally almost every test but a handful of browser journeys could
run in sub-15s."

## What the suite costs (the full run on a4edc643, its JUnit)

- 923 files; their wall times sum to 732 minutes, run as 246 job-minutes over 10 shards (27 minutes wall).
- **540 files already run under 15 s.** 174 take over a minute; 31 take over five.
- **The cost is concentrated:**

  | Files | Share of the time |
  |---|---|
  | top 50 | 48 % |
  | top 100 | 67 % |
  | top 200 | 85 % |

- The slowest cases are long played journeys: the silent lord's keep, the bound Howe's week, the ring, the circus's acts,
  a road across a whole country.
- **Where a journey's time goes**, measured on the silent lord's keep:

  | Step | Time |
  |---|---|
  | `DrawnWorld.start` | 9.4 s |
  | waiting to day 10 | 80.6 s |
  | ten more hours | 4.6 s |
  | one more step | 0.2 s |

  World time costs about 60–80 ms a watch (ten minutes) however little happens. A spec that waits days pays tens of
  seconds before it tests anything, and pays it again in every case.

## The levers, by size

1. **Shared prefixes.** A journey's common beginning is played once per process and each case resumes from its
   checkpoint (`test/support/kept.ts`: `Kept.start` for campaigns, `Kept.drawn` for drawn worlds, `Keep.at`). Cheap,
   and it applies to any family of specs that share a start.
2. **Time that costs what happens in it.** An idle stretch of world time should cost the events in it, not one
   evaluation per ten minutes (the performance standard: cost follows causal extent). This is the largest engine lever,
   for play as well as tests: waiting to day 10 should be milliseconds when nothing happens.
3. **Lower-order tests.** A rule tested in a whole generated country or a long journey is tested in a tiny Kyr world
   (`test/small`, 0.1–0.4 s), with one journey kept as evidence. About 90 ports so far; the top 200 files are the list.
4. **Prepared artifacts.** Bundles, the parse store, and kept worlds per seed are built once per run and shared by the
   shards.

## The pipeline (to build)

- **On every push, in parallel:**
  - `check` — lint, typecheck, the quick lane (tiny worlds and unit), under 2 minutes;
  - `artifacts` — the web bundle, the warm parse store, kept worlds for the seeds the suite draws;
  - `boot` — the page boots in Chromium.
- **`suite`**, after `artifacts`: the whole suite, sharded, from those artifacts. The gate.
- **`deploy`** (Pages), after `suite` and `boot`: deploys only a green main.
- **Nightly:** the long descents, the reference hour, the terminal walks, the evidence missions. Their transcripts and
  screenshots are kept as artifacts for critique, read rather than regenerated. They are kept green: a red nightly is a P0.

## Measures to report

Every week, and with each change to the pipeline:
- the whole suite's job-minutes and wall time;
- the files over 15 s and over 60 s;
- the quick lane's time;
- the push gate's wall time.

The targets:
- **now:** the whole suite on every push under 15 minutes wall;
- **next:** under 10;
- **the owner's ideal:** nearly every file under 15 s.

## Progress (14 November, evening)

- **The pipeline.**
  - Every push runs the whole suite in 16 shards as its gate (the push lane is gone).
  - Pages deploys only once CI has passed on main (`workflow_run`).
  - The first such run took 20 min wall, 229 job-minutes, and found five regressions the push lane had hidden: two
    specs moved to the owner's rulings; three cases of the wound rule, with the rules line.
- **Kept times** from the last full run's JUnit (`scripts/timings-from-junit.ts`): the shards balanced again, and the
  quick lane grew to 390 files in 16.5 s.
- **Shared prefixes:** the silent lord's specs begin once a file (`Kept.drawn`, `Keep.at`).
- **Idle world time, measured on a1, two days waited:**

  | Change | ms a watch |
  |---|---|
  | start of the day | 68 |
  | one route search per world state, not per place on the map | 51 |
  | band names by an index | 43 |
  | known ways read once per state | 42 |

  Next, the screen is still half of a waited step. What it reads (the known ways, perception, grounding) changes only
  when its own facts do, not with the clock. Caching it across watches needs the world to stamp each relation's version
  (Experiment B's step 5), or a wait that builds the page only where the spec reads it.
