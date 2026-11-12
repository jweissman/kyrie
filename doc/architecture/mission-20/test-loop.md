# The test loop: a measured diagnosis, and a route to a quick loop ten times faster

For Mission 21. Measured on 12 November 2026 on the builder's machine: WSL2, 16 logical CPUs, 15 GB, bun 1.4.3, at
`integrate/first-steps` (main with the adventure branch integrated). All numbers are wall-clock unless marked CPU. The
scratch scripts that took them are in `evidence-tools/test-loop/`; each says what it measures.

**Nothing here is implemented.** It is a diagnosis and a proposal, with a first experiment for each item.

## Summary (M20 closing): baseline, the five biggest costs, layers, first experiment

**Baseline** (this machine; reproducible with `bun run check:fast` and the scripts in `evidence-tools/test-loop/`):

| | Cold | Warm |
|---|---|---|
| `check:fast` (typecheck:fast + lint:fast + test:quick) | ≈ 60 s (caches empty) | **≈ 29 s** |
| before E223 (typecheck + lint + test:quick) | ≈ 86 s | ≈ 86 s |
| quick suite alone | 34.4 s before; 9.6–11.6 s now (17.6 s with a game running beside it) | |
| a process importing the engine | 0.34–0.6 s | |
| a fixture campaign's start | 0.15 s | 0.07 s |
| a generated world's start (parse store on) | 7–8 s (14 s with first imports) | 6.6–7 s |
| a started world resumed from a kept checkpoint | 1.1 s | |
| one command in a1 / `ScreenModel.build` | 52 ms / 176 ms | 63 ms |
| the whole suite on CI | 813 + file-minutes in ten shards; the slowest single files 20–53 CI-minutes until split | |

**The five highest-leverage costs:**
1. **Specs that start a whole generated world to test one rule**: 301 files, **62 % of CI time** (layers below);
   each start is 7–8 s, and their tests replay walks.
2. **Authored playthroughs that replay the same prefix in every test**: 50 of the 70 dearest files, 317 CI-minutes
   (§5b; `bound-howe` alone 53).
3. **A fresh module registry per spec file** (fixed for the quick suite by `--no-isolate`, E223; CI's suite still
   isolates).
4. **The presentation's per-step cost** (`ScreenModel.build` 3–15× the engine step; `Itinerary.shown` 36 % of it),
   paid by every walking spec.
5. **No parse store on CI and quadratic province installs** (T24-10, T24-11): CI parses every text in every job; a
   world's twentieth install costs ten times its first.

**Where the tests live, and where their guarantees belong** (`evidence-tools/retrospective/layers.tsv`, by what each
file loads, helpers resolved):

| Layer | Files | CI time | In the quick suite |
|---|---|---|---|
| pure unit | 166 | 3.5 % | 130 |
| small integration (a tiny Kyr situation) | **22** | 0.2 % | 14 |
| headless adventure (an authored campaign) | 327 | 34 % | 126 |
| full Westernesse (a generated world) | 301 | **62 %** | 6 |
| browser E2E | 28 | own jobs (two shards, ≈ 30 min) | — |

The middle layer barely exists, though the kernel runs a small Kyr situation in 0.15 s (`retrospective/architecture.md`).
Candidates to move down a layer, each read: `weary-fights`, `voice` (the hour), `companion-sensed`, `vantage`'s rule,
`deep-rivals`, `wild-meetings`' cache (§5); the generator properties of `ties-forms`, `road-names`, `page-paintings`
(assembler output, no session); the 25 "lints clean" tests (one lint run).

**The smallest credible first experiment toward 10×:** a `Tiny.campaign(kyr)` helper (a one-module campaign from a
string, 0.15 s) and two specs ported to it (`weary-fights`, `voice`'s hour), with their old versions kept until the
new ones are shown to catch the faults those specs were written for. Second: kept playthrough prefixes for
`ombra-local`. The quick suite's 30-second budget is already met for the quick set (≈ 10 s); the 10× ambition is now
about **moving guarantees into the quick set**, not making the current quick set faster.

## 1. What the loop is now

The routine loop (memory: "fast inner loop"; `CLAUDE`-style practice in this repository) is:
typecheck, lint, the quick suite, then the specs a change touches. CI runs everything.

| Step | Command | Wall | Notes |
|---|---|---|---|
| Typecheck | `bun run typecheck` (`tsc --noEmit && tsc --noEmit -p web`) | **28 s** | root 19 s cold; web 10.6 s |
| Lint | `bun run lint` (`eslint . --max-warnings=0`) | **24 s** | type-aware rules; one file alone still 4.7 s (startup) |
| Quick suite | `bun run test:quick` | **34.4 s** (321 s CPU) | 300 files under 2 s each by `test/timings.json`; 663 tests; 23 untimed files left out |
| Web build | `bun run web:build` | 3.1 s | needed after any `.kyr`/`.kyrt` edit |
| **Routine total** | | **≈ 86 s** before touched specs | |

The whole suite on CI: 816 spec files, **813 file-minutes** as CI's JUnit reports time them (contended), in ten shards;
shards run 25–60 min. Two of ten ran past 45 minutes on 12 November (their files' times had never been kept; the limit
is now 60, see ci.yml). Browser specs are two more shards.

## 2. Where the quick suite's time goes

### 2a. The worker model costs more than the tests

`bun test --parallel=6` gives every spec file a fresh worker, which imports the engine afresh. Importing what an
ordinary spec imports costs **0.35–0.6 s** (`src/campaign/campaign` 0.6 s in a fresh bun; of it `canon-validation`
0.16 s, which imports nine painting catalogs and the geology catalog; `content`, `campaign`). In the quick run:

- file time **208.5 s**, of which **75.9 s** in tests and **132.6 s outside them** (import and hooks): **64 %**;
  median outside-test time per file **0.52 s** (JUnit, `quick-junit.xml`);
- 26 browser specs, skipped without `KYRIE_BROWSER`, still cost **14.9 s** of file time: their imports
  (`SiteBuild`, Playwright types) for no test.

The same 40 quick files, measured both ways:

| How | Wall | CPU |
|---|---|---|
| `bun test --parallel=6 <40 files>` | 5.0 s | **43.1 s** |
| `bun test <40 files>` (one process) | 5.4 s | **7.8 s** |

And the whole quick set (300 files, 663 tests):

| How | Wall | CPU | Result |
|---|---|---|---|
| `bun run test:quick` (as now: `--parallel=6`) | **34.4 s** | 321 s | 663 pass |
| one process, `bun test <300 files>` | 31.3 s | **38.0 s** | 663 pass |
| **six processes, each `bun test <its 50 files>`, balanced by kept time** | **10.6–10.8 s** | 75 s | **663 pass** |
| fourteen such processes | 10.7 s | — | 663 pass (no gain: CPU-bound, see 2b) |

**So the quick suite's real work is about 38 CPU-seconds; the worker model spends 321.** Running it as a few ordinary
bun processes over balanced chunks of files is 3.2× faster today, with no spec changed, and all 663 pass (the files
share module state within a process without a failure; that is the risk to watch, see §4).

### 2b. What is left is spread thin

In one process the 300 files take 31 s; the top 10 files are 20 % of it, the top 50 58 %, the top 100 81 %
(`q-serial.xml`). No single file dominates. The heaviest (`danger-grind` 1.0 s, `countries-tool` 0.9, `arrives` 0.7,
`company-range` 0.7) mostly start a small fixture campaign and build screens. 102 of the 300 use `test/fixtures/`; 64
call `PlaySession.start`; only 2 assemble a generated world. The quick suite already avoids Westernesse; what remains is
the presentation's cost per step (2c) and per-process start-up.

### 2c. The presentation costs more than the engine, per step

A step, measured over 12 steps (`command-cost.ts`):

| World | choices | engine step (`leg`) | `ScreenModel.build` |
|---|---|---|---|
| a1, generated | 12 ms | 52 ms | **176 ms** |
| Low Water, authored | 3 ms | 4 ms | **56 ms** |
| The Long Man, authored | 2 ms | 2 ms | **65 ms** |

Profiled (`screen-prof.ts`, 30 builds in a1, 63 ms each warm): **36 % in `Itinerary.shown`** (route planning to every
place shown: `route` 33 %, `plan` 19 %, `ActionTime.passage` 19 %, `around` 16 %), 13 % `ChartModel.build`, 17 %
`World.number`/`measure` lookups. Nothing is kept between builds of an unchanged world: a spec (or the page) that builds
the screen, the narrator's leaf and the glance at one step builds the routes each time.

## 3. Where the whole suite's time goes: Westernesse at every start

Spec files by what they load (pattern match over `test/*.test.ts`; CI file-minutes from `test/timings.json`):

| Loads | Files | CI file-min | Share | In quick |
|---|---|---|---|---|
| a generated world (`WorldAssembler.assemble`, `DrawnWorld.start`, `Glanced.country`, …) | 258 | 300 | 37 % | 3 |
| an authored campaign or adventure (`data/campaigns`, `data/adventures`) | 281 | 252 | 31 % | 134 |
| other (support helpers that load either, or units) | 249 | 234 | 29 % | 134 |
| a test fixture | 27 | 27 | 3 % | 9 |

What a start costs (`setup-cost.ts`, `parse-count.ts`, `resume-cold.ts`; one process, parse store on):

| Setup | Cold | Warm (same process) |
|---|---|---|
| imports | 0.34 s | — |
| fixture campaign (`household`) | 0.15 s | 0.07 s |
| authored campaign: The Long Man / Hessel / Low Water | 0.24 / 1.1 / 1.3 s | < 0.01 s |
| `WorldAssembler.assemble('a1')` (writes the world) | 0.66 s | 0.32 s |
| **`PlaySession.start` of a generated a1** | **7–8 s** (14 s with the first imports and JIT) | **6.6–7 s** |
| the same, `standing: []` | — | 6.3 s |
| `DrawnWorld.start('kahitude')` (assemble + start) | 11.7 s | — |
| one command in a1 | 0.5 s (with screen) | — |
| `checkpoint()` / `resume()` in process | 0.5 s / 1.0 s | — |
| **a started a1 kept as a checkpoint (29 MB, v8-serialized) and resumed in a fresh process** | **1.1 s** (read 0.1, resume 1.0) | — |

A generated world's start, profiled cold with the parse store on (8.8 s; `one-store.cpuprofile`):

- `ModuleBundle.load` 3.8 s, of which **`structuredClone` of cached parses 1.7 s (self)** and `ModuleCompiler.validate`
  1.7 s (re-validating what was parsed before; `Deem.grammar.match` of every expression);
- `ModuleAssembly.compose` 2.3 s (`readOnly` 1.2 s);
- `Campaign.install` 1.5 s (`CreatureFacts.project` 1.0 s, `World.apply` 0.8 s);
- region composition 0.7 s, `Geography.distances` 0.6 s, `Campaign.refresh` 0.6 s, Deem generation 0.4 s.

Parsing itself is mostly cached on disk already (`ParseStore`, since Mission 18: 186 parses, 147 distinct texts, 4.8 MB,
**0.31 s** cold). Two cautions found on the way:

- **CI never keeps the parse store** (`node_modules/.cache/kyrie-parse`, 1.2 GB locally) between runs: no cache step in
  ci.yml, so every CI job parses every text, and a profile run from outside the repository's root (where
  `ParseStore.open` finds no `src/lang/Kyr.ohm`) parses everything too: there, Ohm was 8.9 s of a 17.5 s start.
- `ModuleBundle.parsed`'s own map is cleared whole at 400 entries, and `ParseCache` keeps 96: neither is the cost
  now, but a profile that shows Ohm should first check the store was open.

### 3a. The single worst spec: twenty-five minutes for one test

`test/all-in-one-world.test.ts` ("every province in one world") installs every province a mountain thorn holds (25 or
more) into one running world, one after another, travelling to each gate first. On CI (integration run 43280749973) it
**ran into its own 25-minute timeout** (`1500000` ms) and is why one suite shard runs to the job limit in every run:
the shard can never finish, so its other files' times are never kept and the shards never rebalance (register T24-01).
What it proves (no two modules declare the same thing differently) is a property of the modules' declarations, not of
a session that has walked to every gate. **Proposal:** a declaration-conflict check over all provinces' bundles (load
each, merge the declarations, report conflicts: seconds), plus one live install of two or three provinces that are
known to share kinds (Sennet and Tessary's congers), and the walking version moved to the long-descents job if it is
kept at all.

**Measured** (`evidence-tools/test-loop/provinces-cost.ts`, thorn in the mountains, 25 provinces, this machine): the
walk to each gate cost 1.5–7 s; **each install costs more the more are installed**, 1.4 s for the first, 2.5 s by the
sixth, 5–7 s by the tenth, 10–14.6 s from the twentieth (Quittance 10.7, Ombra 14.6): installing all 25 without walking
took **2 min 45 s**, so the whole is quadratic in the provinces. **Done on 12 November:** the spec sets the company at
each gate instead of walking it there and runs with the long descents (`KYRIE_LONG`, CI's long-descents job), 2.4
minutes locally; it is out of the suite's shards. **For Mission 21:** why an install's cost grows with what is already
installed (a hypothesis, not profiled: `Campaign.install` refreshes projections over the whole world each time).


## 4a. Done on 12 November (the owner's "down payments")

Items 1–3 below are in: `test:quick` and `test:changed` pass `--no-isolate` (9.6–11.6 s for the quick set, 663
passing at 4, 6 and 10 workers; 17.6 s with a game running beside it); `typecheck:fast` and `lint:fast` (6.3 s and
1.7 s warm); `check:fast` runs the three in **29 s** against ≈ 86 s. The full `typecheck`, `lint` and suite are CI's
as before. Everything else in §4 and §5–§5b is M21's.

## 4. The route to a quick loop ten times faster

Target: the routine loop from **≈ 86 s** to **≈ 9 s**, and a quick suite that covers more of the engine's invariants
than it does now (it leaves out every spec over two seconds, which is most of what a generated world proves).

Ranked by measured or estimated gain per unit of risk. "Avoid" is setup not done; "speed" is runtime made cheaper.

| # | Change | Kind | Measured / estimated gain | Risk | First experiment |
|---|---|---|---|---|---|
| 1 | **Run the quick set as N plain `bun test` processes over chunks balanced by kept time**, not `--parallel` workers — or this bun's own **`--no-isolate`** ("let each worker keep one global and module registry across the files it runs"), which is the same thing inside `--parallel` and was not measured yet | avoid | quick 34.4 → **10.6 s measured** (CPU 321 → 75 s) | specs sharing module state in one process (static caches: `NodeBundleSource.shared`, `LocalKinds`, `ParseCache`); all 663 pass now | change `scripts/test-quick.ts` to spawn 6 chunk processes (the measuring script is `evidence-tools/test-loop/run6.sh`); run it 20 times with shuffled chunk order to flush order dependence |
| 2 | **Incremental typecheck** (`tsc --incremental --tsBuildInfoFile node_modules/.cache/tsc-*`) for both projects | avoid | root 19 → **4.0 s measured** warm; web 10.6 → est. 3 s | none for correctness (tsc's own); stale buildinfo after a branch switch is self-correcting | add `typecheck:fast`; time ten edit/check cycles |
| 3 | **ESLint's cache** (`--cache --cache-location node_modules/.cache/eslint`) | avoid | 24 → **1.7 s measured** warm | type-aware rules can miss a cross-file type change for an unchanged file; CI keeps the full uncached lint | add `lint:fast`; compare its findings with `lint` on ten real commits |
| 4 | **Keep started worlds**: a content-addressed store of started sessions (seed + options + hash of `src/` and `data/`), as `ParseStore` keeps parses; specs ask for a started world and get a resumed copy | avoid | generated-world start 8.9 → **1.1 s measured** (cold process); 258 files, 37 % of CI time | a stale snapshot if the key misses an input (the assembler reads `data/` widely: key on all of it); specs that assert the start itself must still start | a helper `Worlds.started('a1', opts)` in `test/support`; move the six specs pinned to `standing: []` today (vantage, weary-fights, voice, deep-rivals, wild-meetings, companion-sensed) to it and compare their time and results |
| 5 | **Memoize the screen's routes per world revision** (`Itinerary.shown` and `ChartModel.build` keyed by the world's change count and the company's place) | speed | `ScreenModel.build` 63 → est. 30 ms warm in a1; it is 3–15× the engine's own step in every walking spec | a memo that outlives a change it depends on (time of day changes `passage`); key on the clock too | memoize `Itinerary.shown` alone; assert identical screens over the 160-step `told-audit.ts` walk; measure |
| 6 | **Copy-on-write for cached parses** instead of `structuredClone` of every module at every read | speed | up to 1.7 s of each generated start | a caller that mutates a shared module (the reason for the copies); find them by freezing the cached modules in a test run first | `Object.freeze` deep in `ParseCache.get` under an env flag; run the suite; list what throws |
| 7 | **Skip compile-time validation of a text already validated** (cache `ModuleCompiler.validate`'s verdict with the parse) | speed | up to 1.7 s of each generated start | a validation that depends on more than the text (kinds in scope): key as the parse is keyed | measure `validate` hits on the second start of a1 in one process |
| 8 | **Keep the parse store in CI** (`actions/cache` on `node_modules/.cache/kyrie-parse`, keyed by the `ParseStore` version) | avoid | every CI job parses cold now; est. 5–8 s per generated-world file on CI's runners | cache size (1.2 GB locally; prune to the current version) | one CI run with the cache step; compare shard times |
| 9 | **Browser specs out of the default glob** (a `*-browser.test.ts` that skips still imports `SiteBuild` and Playwright) | avoid | 26 files, 14.9 s of quick file time (≈ 0.6 s each) | none: they are CI's and opt-in already | name them `*.browser.ts` with their own runner, or gate their imports inside `describe.skipIf` |

**Together:** typecheck 4 + web ~3 + lint 2 + quick ~8 (1 alone; less with 5–7) ≈ **17 s** measured or near-measured,
5× from 86 s. **The rest of the way to ten times** is the quick suite's own work (38 CPU-s), which items 5–7 cut, and
**what the quick suite is made of** (§5): it should be the engine's invariants on small beds, about 1 000 tests in a few
seconds, with Westernesse kept for what only Westernesse proves.

## 5. Which specs need Westernesse, and which only use it as a bed

258 spec files start a generated world. Many assert an engine or presentation invariant for which the world is a
convenient bed, not the subject. From the specs touched on 12 November (each read; the judgment is the builder's):

| Spec | What it proves | Needs Westernesse? | Candidate bed |
|---|---|---|---|
| `weary-fights` | a fight's state kept and replayed across two galleries | no | a fixture cave of two rooms with two foes |
| `voice` (the hour) | night above ground, no hour below it | no | a fixture with one outdoor and one underground room |
| `companion-sensed` | perception range: one place off, not two; Gregarious three | no | a fixture of four rooms in a line with a willing traveller |
| `two-modules-one-town` | no module's acts offered at another's places | partly: the integration of real modules is the point | keep, but on a kept started world (item 4) |
| `vantage` (spyglass) | sight past the edge from a height | no for the rule; yes for its wording | the rule on a fixture; the wording on a kept world |
| `deep-rivals` | rivals leave marks on each level they pass | no | a fixture deep site of three levels |
| `wild-meetings` (cache) | a cache's sign, search, take; journey stops at a meeting | partly: the meetings' drawing is Westernesse's | the cache and stop on a fixture; the drawing on the region alone (no session) |
| `world-lint` (5 seeds) | generated worlds lint clean | **yes** | keep; it found the standing modules' ancestry fault on 12 November |
| `the-moment` (Flee odds) | `Battle.flight` agrees with the roll | no (already a unit) | — |
| `still-likeness`, `teaches-marked` | page components | no (already units) | — |

The pattern, from these and the spec titles: **perception, time of day, fights, search and cache, warnings, route
planning, conversation numbering, aims' next steps** are engine invariants proved through a generated world because a
world was at hand. A small set of **bed fixtures** (a town of four rooms with a green, an inn and a shop; a two-level
deep site; a road between two towns; an outdoor/underground pair), written in Kyr like `test/fixtures/household`, would
let these run in tens of milliseconds and join the quick suite. **First experiment:** port `weary-fights` and `voice`'s
hour test to a fixture; compare run time (now 17.6 s and 15.7 s on CI) and whether the fixture versions would have caught
the faults those specs were written for (read each spec's comment and its git log).

Keep Westernesse for what only it proves: generated worlds lint, their prose fits, standing scenarios place, the first
hour's journeys, seeds' censuses, replays of kept traces. Those are CI's.

## 5b. The seventy dearest specs, by kind (the owner, 12 November: "an awful lot of our expensive tests could be reformulated as units or integrations")

`evidence-tools/test-loop/expensive-70.tsv` lists the seventy spec files with the most CI time, each with what it loads,
its number of tests and its first title. **They are 452 of the suite's 813 CI file-minutes (56 %).**

| Kind | Files | CI-min | What they are | Reformulation |
|---|---|---|---|---|
| **Authored playthroughs** (Ombra's 16 stories, Quittance's, the Walk, Low Water, Hessel, the circus, the Repertory, the Parliament, Muster) | 50 | **317** (39 % of the suite) | each `it` starts the adventure and replays a shared prefix of labelled steps (Ombra's `row`: walk to the Row, wait to day 3) before its own few steps and assertions; `ombra-local` is 30 tests, 13.6 CI-min | (1) **kept prefixes**: the checkpoint at the end of a shared prefix, kept by campaign + steps + the content hash as `ParseStore` keeps parses, each test resuming from it (a resume is ~1 s against a replay of tens of steps); (2) **scenes**: `bin/kyrie play scene <id> --in <adventure>` already plays an adventure to one of its scenes in an author's context (`PlayParts`): a spec of what a scene does can start there; (3) the static checks out (below) |
| **World beds** (ties, the ring, the Exchange, factors, origins, goings-on, community, troubles, road names, page paintings, the Slack) | 20 | 137 | some prove the generator (ties' forms "in more than one seed", road names, page paintings) and need only `WorldAssembler.assemble` or the region it writes, no session; others prove an engine rule on a world because one was at hand | generator properties against the assembler's output alone (no `PlaySession.start`: 0.3 s against 7 s); engine rules on bed fixtures (§5); kept started worlds (§4, item 4) for what is left |
| **Other** (circus acts, autoplay tempers, the Third Night, Parliament outcomes) | 12 | 70 | mixed: long journeys through one adventure | as the playthroughs |
| **"Lints clean as a recommended campaign"** | 25 files have such a test | (inside the above) | a static check of one campaign, each in its own file, each parsing its campaign afresh in a fresh worker | one `bin/kyrie lint` over every recommended campaign in one process (shared parses), or a CI step of its own |

**The first experiment for the playthroughs:** `ombra-local` (30 tests): time the shared prefix and the tails; keep the
prefix's checkpoint once; resume each test from it; compare time and that every assertion still holds. If the prefix
is most of each test, as the steps suggest, the file falls from minutes to tens of seconds, and the same helper serves
all fifty.

## 6. What is a hypothesis and what is measured

- **Measured:** every number in §§1–3 and the "measured" cells of §4.
- **Estimated:** items 5–8's gains (from profile shares, not from a change made).
- **Hypothesis:** that the bed fixtures of §5 catch what the Westernesse versions caught. That is the first thing to
  check, spec by spec, before moving any.
- **Not measured:** CI runners' own speed against this machine (CI's file times are about 1.2–1.7× local, with
  contention); memory on CI with ten shards.
