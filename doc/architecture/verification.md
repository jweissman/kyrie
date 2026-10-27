# Verification: what to run, how long it takes, and what CI runs

Written for: anyone changing Kyrie who wants to know which check answers their question fastest, and what a push
will be held to. Times are measured on one desktop machine (WSL2, bun 1.4.3, sixteen threads) on 2026-10-25, and
the suite's again on 2026-10-27, nothing else running.

## From cheapest to dearest

| tier | what | command | time |
|---|---|---|---|
| 1. one spec | the spec next to what you changed | `bun test test/world-reads.test.ts` | under a second to a few seconds |
| 1. changed | specs touching files changed since the last commit | `bun run test:changed` | as much as changed |
| 2. types, style | the whole tree | `bun run typecheck`; `bun run lint` | 18 s; 14 s |
| 3. same game | a 335-choice journey through the browser's engine, whose hashes must not move for a change meant to change nothing (see [mission-15/performance.md](mission-15/performance.md)) | `bun scripts/journey-profile.ts wren --every 400` | about 40 s |
| 3. by layer | the simulation alone and the headless session, by kind of command | `bun scripts/sim-bench.ts wren` | about 30 s |
| 3. from the middle | a slow stretch replayed from a profile's own checkpoint (`--checkpoint-every`, `--out`) | `bun scripts/journey-profile.ts <seed> --resume ck.json --replay steps.jsonl` | seconds |
| 4. quick | every spec file that took under twenty seconds when the timings were kept (167 of 264): the ordinary specs, without the journeys through whole adventures | `bun run test:quick` | about 90 s |
| 4. the suite | every spec but the long and the browser ones, the slowest files started first | `bun run test` | 12 minutes (130 test-minutes) |
| 4. long | four deep sites played to their hearts | `KYRIE_LONG=1 bun test test/descent.test.ts` | 40 s to 2 minutes |
| 5. browser | the built page, played by keys in Chromium | `KYRIE_BROWSER=1 bun test $(ls test/*-browser.test.ts)` | 1 minute |
| 6. exploratory | a wander across marches, bounded, streamed and checkpointed | `bun scripts/journey-profile.ts a1 --wander 400 --out steps.jsonl --deadline 600` | as long as allowed |

A browser spec needs Chromium (`bunx playwright-core install chromium`) and its NSS libraries. Where they cannot be
installed (`sudo apt-get install libnss3`), `apt-get download libnss3 libnspr4`, unpack each with
`dpkg-deb -x <deb> <dir>`, and run the specs with `LD_LIBRARY_PATH=<dir>/usr/lib/x86_64-linux-gnu`. CI installs
them with Chromium.

`test/timings.json` keeps how long each spec file took, and the suite reads it: `--parallel` starts the slowest files
first, and `--shard` balances shards by it. `bun run test:timings` runs the suite and keeps the times again; do so
when files are added, split or much changed in length.

## What CI runs

`.github/workflows/ci.yml`, on every push to any branch and every pull request, these jobs:

- **lint and types**: `bun install --frozen-lockfile`, lint, typecheck.
- **suite 1/3, 2/3, 3/3**: the whole suite in three shards balanced by `test/timings.json`, each with bun's JUnit
  report (on one runner the suite had come to 27 of its 30 minutes). `scripts/test-summary.ts` writes the counts and
  every skipped or failed spec, by file and line, to the run's summary. Orsino is checked out beside Kyrie at the
  revision `data/sources/orsino/registry.json` names, so the registry spec runs rather than skips.
- **long descents**: `KYRIE_LONG=1`; any skip fails the job (`--none-skipped`).
- **browser specs**: Chromium installed with its libraries, `KYRIE_BROWSER=1`; any skip fails the job.

A failing spec fails its job, and so the run. `.github/workflows/pages.yml` still publishes the page from `main`
with three quick specs of its own.

## Dependencies

Deem and the languages package are pinned by commit in `package.json` (`github:jweissman/deem#<commit>`,
`github:jweissman/languages#<commit>`), and the lockfile records each with an integrity hash, so a clean clone needs
no sibling checkouts: `git clone`, `bun install`, and every check above runs. To move a pin, push the dependency's
commit, then change the commit in `package.json` and `bun install`.

To work on Deem (or languages) beside Kyrie without pushing each change: `bun link` in the sibling checkout, then
`bun link deem` in Kyrie. `node_modules/deem` then points at the checkout, and `package.json` is left as it is. The
next `bun install` puts the pinned commit back.

Found by the clean clone: Kyrie's lint loads a TypeScript ESLint configuration, which needs `jiti`, and Kyrie had
never declared it; it had come in as a development dependency of the sibling Deem checkout. It is now Kyrie's own.
