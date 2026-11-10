# Mission 20: the reference configuration and the baseline

## Starting point

- **Starting commit:** `7302392c` (main, the M19 freeze). CI run 42831783183 on that commit: every job green.
- **Work branch:** `m20`, in the worktree `/var/tmp/kyrie/wt-m20`. The owner's paintings and other material keep going
  to main; the candidate takes from main only what it names.

## The reference journey's configuration

| | |
|---|---|
| Build | the `m20` branch's site (`bun run web:build`), at the commit named with each piece of evidence |
| World | the generated world `kahitude` (`?world=kahitude`) |
| Origin | *What is owed* (`debt`): fifty coin to Tuck, the woodwright of Thornhaven, by market day |
| Character | a human warrior, the page's default name (Ralf) and choices otherwise |
| Viewport | 1280 × 800, Chromium |
| Variation | another origin and calling, chosen by the cold player (first: see the cold-play reports) |

Headless, the same: `bin/kyrie play --world kahitude --origin debt --as human/warrior/Ralf "<label>" …` (about 6 s to
the first page).

## Baseline timings (10 November, before any M20 change)

| Check | Where | Time |
|---|---|---|
| `bun run test:intent` (6 files, 12 tests) | local, one process | 62 s, 1.0 GB peak |
| `bun run test:honest` (3 journeys) | local | 37 s, 1.1 GB peak |
| Headless debt opening to the first page | local | 6 s |
| Site build | local | 3.3 s |
| CI, whole run | run 42831783183 | 35 m 0 s |
| CI player contracts / reference hour | same run | 2 m 14 s / 2 m 38 s |
| CI suite shards 1–6 | same run | 33, 26, 34, 32, 35, 24 min |
| CI browser specs 1–2 | same run | 11, 15 min |

**What it costs to reproduce a first-hour defect:** a headless `bin/kyrie play` with the labels to the defect
(6–15 s per try), or the play server (`scripts/play-server.ts`, one Chromium, 1–3 s a step) for a rendered one. The
rendered reference tour exists only on CI (2.5 min), and stops at the hobs' toll-house.
