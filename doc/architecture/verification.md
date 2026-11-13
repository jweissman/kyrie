# Verification: what to run, what it costs, and what CI runs

Written for anyone changing Kyrie who wants the check that answers their question fastest, and to know what a push
is held to. Times are on one desktop machine (WSL2, bun 1.4.3, sixteen threads) and on CI's runners; the measures
behind them are kept by the scripts named here, not written into this page to go stale.

## From cheapest to dearest

| tier | what | command |
|---|---|---|
| a rule | the rules on a tiny Kyr world written in the spec (`test/support/tiny.ts`): a tenth of a second a spec, no generated country | `bun test test/small/<spec>` |
| one spec | the spec beside what you changed | `bun test test/<spec>.test.ts` |
| routine | incremental types, cached lint, and the quick lane: every spec file kept under two seconds by `test/timings.json`, `test/small` among them (seconds, warm) | `bun run check:fast` |
| changed | the specs whose imports reach the code changed since the last commit, and those that name a changed data file's adventure, module or fixture | `bun run test:changed [since]` |
| named sets | the player contracts, the intent specs, the honest start | `bun run test:contracts`, `test:intent`, `test:honest` |
| same game | a journey through the browser's engine whose hashes must not move for a change meant to change nothing | `bun scripts/journey-profile.ts wren --every 400` |
| by layer | the simulation alone and the headless session, by kind of command | `bun scripts/sim-bench.ts wren` |
| the suite | every spec but the long and the browser ones | CI (below); `bun run test` locally takes long and loads the machine |
| long | four deep sites played to their hearts from kept records (`test/fixtures/descent`) | `KYRIE_LONG=1 bun test test/descent.test.ts -t <name>` |
| browser | the built page, played by keys in Chromium | `KYRIE_BROWSER=1 bun test test/<spec>-browser.test.ts` |
| terminal | deterministic walks through the terminal client, with the arrival-prose budget measured | `bun scripts/terminal-walks.ts` |

A browser spec needs Chromium (`bunx playwright-core install chromium`) and its NSS libraries. Where they cannot be
installed (`sudo apt-get install libnss3`), `apt-get download libnss3 libnspr4`, unpack each with
`dpkg-deb -x <deb> <dir>`, and run the specs with `LD_LIBRARY_PATH=<dir>/usr/lib/x86_64-linux-gnu`. CI installs
them with Chromium.

Locally, run one heavy thing at a time: the whole suite, a browser spec or a full `kyrie lint` beside another (or
beside tests in another worktree) runs WSL out of memory. Never run `bun test` with an empty path, which is the whole
suite: guard a computed one with `test -f "$f" && bun test "$f"`. The local habit is `check:fast`, then
`test:changed`, then the one spec; the whole suite is CI's.

## Making a slow spec cheap

The cost of the suite is in drawing whole countries: a generated-world spec spends seconds composing a world before
it tests anything. In order of preference:
- **A tiny world.** A spec that proves one rule (an effect, what is known, what is offered, gold, navigation, an atlas
  facet, a fight's rule, what is told) writes the few places and people it needs in Kyr and starts in a tenth of a
  second (`Tiny.start`). Mutation-check it: break the rule, see the spec fail, restore.
- **A situation alone.** A spec of one situation's or adventure's own rules installs that module as the world does,
  its imports bound to a host of a few lines (`test/support/alone.ts`), in under half a second
  (`test/silent-lord-alone`).
- **A shared start.** A spec that needs the generated country reads one start per seed shared across its cases
  (`test/support/kept.ts`, `test/support/keep.ts`), not its own `DrawnWorld.start` per case.
- **The whole world, kept for what only it proves:** that the generators write what a rule reads, that a journey
  composes across places and days, and that saves resume.

What a start costs is counted at each boundary it crosses (`src/costs.ts`: parses, installs, Deem's creatures and
countries, world composition, sessions, screens). `Tiny` and `Alone` keep the tally of their start, and a spec can
hold it (`test/small/tiny-costs`). `bun scripts/load-costs.ts` measures every scale cold, warm and in process, and
`doc/architecture/mission-21/loading-boundaries.md` is the map it made.

`bun scripts/spec-audit.ts` classifies every spec file over fifteen seconds by what it starts and what its cases
assert, and writes the counts the migration is measured by to `doc/architecture/mission-21/spec-audit.md`.

## What CI runs

`.github/workflows/ci.yml`. **On every push to any branch and every pull request:**
- **lint and types**: a frozen install, lint, typecheck.
- **player contracts**: `test:intent`, `test:honest`, `test:small`.
- **the page boots**: Chromium, the page loaded, a character made, a conversation drawn at 820 × 1180. A gate: a bare
  `process.env` read at a module's load once stopped the game loading in the page, and nothing else on a push had a
  browser in it.
- **suite 1/16 to 16/16**: the whole suite, balanced by `test/timings.json`, with a thirty-second default timeout and
  the library parse store cached between runs (a cold parse is about thirty seconds a worker). Each shard writes bun's
  JUnit report, and `scripts/test-summary.ts` puts the counts and every skipped or failed spec in the run's summary.
  Orsino is checked out beside Kyrie at the revision `data/sources/orsino/registry.json` names, so the registry spec
  runs rather than skips.
- **reference hour, through the page**: evidence, not a gate (it may fail without failing the run).

**Nightly on main (08:00 UTC), and on any branch on demand** (`gh workflow run CI --ref <branch>`):
- **long descents**: `KYRIE_LONG=1`; any skip fails the job.
- **browser specs 1/2 and 2/2**: every `*-browser` spec; any skip fails the job.

`.github/workflows/pages.yml` publishes the page only after CI has passed on a push to `main`: the whole suite is the
gate a deploy waits on. Work in flight is proven on its own `ci/<line>-<n>` branch before it reaches `main`. A change
to many worlds or to the page (the shared rules, the generators, the reader) also gets a dispatched run, for the long
descents and the browser specs.

Watch a run with `gh run watch <id> --interval 60 --exit-status`, one watch at a time: the default three-second poll
once spent the shared hourly API limit.

**The kept times.** `test/timings.json` balances the shards and chooses the quick lane. When files are added, split
or much changed, keep them again from a whole run's reports: `gh run download <run> -D <dir>`, then
`bun scripts/timings-from-junit.ts <dir>`.

## Dependencies

Deem and the languages package are pinned by commit in `package.json` as git URLs
(`git+https://github.com:443/jweissman/deem.git#<commit>`, and the same for `languages`), and `bun install` clones
each at that commit, so a clean clone needs no sibling checkouts: `git clone`, `bun install`, and every check above
runs. The `:443` is deliberate: bun takes a plain `github.com` URL, git or not, for a GitHub tarball fetched through
`api.github.com`, which a review environment refused with 403 (the architecture review's L4); with the port named, it is
a git dependency like any other, fetched wherever git can reach GitHub. The commit is what pins it. To move a pin, push
the dependency's commit, then change the commit in `package.json` and `bun install`. `main` is protected against
force-pushes, so a commit a review names stays on it.

To work on Deem (or languages) beside Kyrie without pushing each change: `bun link` in the sibling checkout, then
`bun link deem` in Kyrie. `node_modules/deem` then points at the checkout, and `package.json` is left as it is. The
next `bun install` puts the pinned commit back.

Found by the clean clone: Kyrie's lint loads a TypeScript ESLint configuration, which needs `jiti`, and Kyrie had
never declared it; it had come in as a development dependency of the sibling Deem checkout. It is now Kyrie's own.
