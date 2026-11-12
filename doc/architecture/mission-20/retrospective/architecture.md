# Kyrie's execution and dependency boundaries (M20 closing, 12 November 2026)

Measured on `integrate/first-steps` (9e5643d6) on the builder's machine. Scripts in
`../evidence-tools/test-loop/` and `../evidence-tools/retrospective/`. Hypotheses are marked.

## How close an author already is to running a small Kyr thing

| Capability | Exists? | Measured | Where |
|---|---|---|---|
| Validate a standalone Kyr document | **yes** | `bin/kyrie compile house.kyr` 0.41 s (cold process) | `src/cli/kyrie.ts` compile |
| Lint a campaign | yes | `bin/kyrie lint household.campaign.json` 3.96 s (it lints the repository's vocabulary too) | `src/cli/kyr-lint.ts` |
| Play a tiny Kyr campaign without Westernesse | **yes** | `bin/kyrie play test/fixtures/household/household.campaign.json --choices` 0.62 s; in process 0.15 s cold, 0.07 s warm | `test/fixtures/household/` |
| Play an authored scene directly | yes | `bin/kyrie play scene <id> --in <adventure>` (PlayParts) | `src/cli/play-parts.ts` |
| Why an action is or is not offered, its failing conditions in Kyr with bindings | **yes** | `bin/kyrie inspect <campaign> "<pattern>"` 0.57 s | `src/cli/inspect-tool.ts` |
| Ask the world a fact or measure after steps | yes | `--probe "fact args"` / `"#measure args"` | `src/cli/play-tool.ts` |
| What an action changed | partly | each event carries `changes: string[]`; no CLI prints a per-step fact diff | `src/campaign/campaign-types.ts` |
| Deterministic replay through the shared runtime | **yes** | transcripts with digests; `bin/kyrie replay`, kept traces (`test/fixtures/traces`), `PlaySession.resume` | `src/session/`, `src/cli/traces.ts` |
| One runtime for CLI, terminal, browser, serve | **yes** | `PlaySession` / `PlayerView` / `Campaign` are shared; `kyrie serve` (JSON lines) | `src/session/play-session.ts`, `src/cli/serve.ts` |

**Conclusion:** the authoring kernel already does most of what the brief asks. A small Kyr situation compiles, plays,
explains its refusals and replays in well under a second. **No new command language, REPL or MCP server is needed for
that.** What is missing is (1) the habit and helpers to test at that level (22 of 844 spec files are small
integrations, test-loop §5), (2) a per-step change view (`changes` exists; nothing shows it), and (3) the boundary
leaks below, which make even the small path import most of the game.

## The world itself is a functional core

`World` (`src/lang/world.ts`) is persistent: `apply(changes)` forks a new world (copy-on-write maps) and leaves the old
one intact; `admits(changes)` checks without building. Its import closure is **8 files, 863 lines, no data**. This is
the right kernel for fast, deterministic rule tests: a rule's predicate and effect can be evaluated against a world of
a few facts.

## Where the boundaries leak (measured import closures, non-type imports)

| Module | TS files | Lines | JSON catalogs |
|---|---|---|---|
| `lang/world.ts` | 8 | 863 | 0 |
| `lang/module-parser.ts` | 42 | 5 035 | 34 (1.0 MB) |
| `lang/module-compiler.ts` | 45 | 5 471 | 34 |
| `campaign/campaign.ts` | 141 | 15 404 | 59 (1.3 MB) |
| `world/world-assembler.ts` | 189 | 20 221 | 102 |
| `ui/screen-model.ts` | 237 | 25 294 | 101 |
| `session/play-session.ts` | **285** (of 488) | 31 475 | 100 (1.8 MB) |

1. **The parser depends on the whole canon.** `module-parser → canon/local-catalog → canon/canon →
   data/catalog/abilities.json` (and every catalog): kinds a module names (`Item cache … is jeweled_box`) are resolved
   against the global catalog at parse time, and the parse cache is keyed by the catalog's fingerprint
   (`LocalKinds.seen`). Parsing Kyr is not a pure function of its text.
2. **Loading a bundle imports world composition.** `campaign → module-bundle → world/compose/composition`: a fixture
   campaign loads the region composer's code (not its work) because bundle loading and region composition share a
   module.
3. **A play session imports more of the game than the world generator does** (285 files against 189): session →
   frontier, drawn worlds, presentation. A spec that only needs `PlaySession` on a fixture still imports 64 % of
   `src/`.
4. **116 static mutable caches** (`static … = new Map/Set` across `src/`; `likeness.ts` 7, `player-view.ts` 4,
   `query-modes.ts` 4, …) and **164 module-level JSON imports**. Most are memoisation, correct within a process; they
   are why `--no-isolate` (E223) needs watching for leaks, and why "execute only against relevant state" is not yet
   true: a projection (`Campaign.refresh`, `CreatureFacts.project`) runs over the whole world after a command (0.6 s
   of a generated start; `Itinerary.shown` is 36 % of a screen).
5. **`structuredClone` of cached parses** (1.7 s of a generated world's 8 s start) exists because callers mutate parsed
   modules; nobody can tell which without trying (test-loop item 6).

## Low-risk improvements (in order)

1. **Test helpers at the kernel level** (no engine change): `Tiny.campaign(kyrText)` writing a one-module campaign to
   a temp bundle and starting it (0.15 s), and `Tiny.world(facts)` for a predicate or effect against a bare `World`.
   Port two specs to prove them (test-loop §5: `weary-fights`, `voice`'s hour).
2. **A per-step change view**: `bin/kyrie play … --changes` printing each event's `changes` (they exist).
3. **Split `module-bundle` from region composition** so a fixture campaign does not import the composer (measure the
   closure before and after; no behaviour change).
4. **Give the parser its kinds as an argument** (`ModuleParser.parse(text, kinds)`) with the global catalog as the
   default, so a Kyr unit test can parse against a handful of kinds. Larger; do after 1–3.
5. **Freeze cached parses in a test run** to find mutating callers, then drop the clone where none mutate.

## Progressive world realization (recorded, not proposed for M20)

The idea: establish the world's persistent facts and commitments (geography, settlements, people's identities,
standing scenarios' existence, history) at creation, and compose the detail of a place (its rooms, inhabitants' full
records, things, situations' modules) only when the company's horizon reaches it, deterministically from the seed, with
off-screen causality kept by the commitments.

**What already points this way:** the frontier installs other countries lazily (`Frontier.expand`, provinces at their
gates); regions are drawn per hex on demand; the parse store and kept checkpoints make realisation cacheable.
**Obstacles found:** (a) every first country holds six standing scenarios composed at start (the integration added
~0.7 s and 3 MB to a world, `ReaderStore.room`); (b) installs cost more the more is installed (T24-11, quadratic over
provinces), so lazy installation alone would move cost, not remove it, until that is explained; (c) projections run
over the whole world after each command; (d) rules that read the whole world (`at(?x, ?place)` over every person)
would need indexing by place to stay cheap as detail grows.
**Evidence that would justify the work:** a profile showing a generated start dominated by composing places the first
hour never reaches (the census measures reach: 2 062 places composed in three countries, of which a first hour
touches dozens), and an install-cost explanation (T24-11). Until then, kept started worlds (test-loop item 4) buy the
test-time benefit without changing the runtime.
