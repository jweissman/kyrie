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
