# Mission 15 ledger

Written for: whoever is following Mission 15 as it goes, the person who set it first. A living record: what is done
and verified, what is found and not yet done, and what is deliberately left. Newest entries at the top of each part.
The brief is in the conversation of 2026-10-25; its three priorities are I (a fast, trustworthy inner loop), II (the
independent adventures as first-class content) and III (a new human-facing experience).

## Done and verified

- **I.D. CI that runs every spec, shows every skip, and turns red.** `.github/workflows/ci.yml` (55e1bbf, 37b0276) runs
  on every push and pull request: lint, types and the whole suite (Orsino checked out at the registry's revision, so
  its spec runs); the long descents; the browser specs with Chromium installed. `scripts/test-summary.ts` writes every
  failed or skipped spec, by file and line, to the run's summary; the long and browser jobs fail on any skip. Main is
  green on all three at b8e1341 (run 40211520897). A branch with a spec that fails on purpose went red on that spec
  alone, the other jobs green (run 40211561350); the branch is deleted. Verification tiers and their times:
  [`../verification.md`](../verification.md).
- **I.D. A clean clone, with Deem and the languages pinned.** `package.json` pins both by commit (deem 967deac,
  languages 30d36c6), the lockfile records them with integrity hashes, and Pages installs from the pins. A fresh
  clone of ab9055a with the pins installed, linted, typechecked, ran the suite (667 pass, 0 fail), the descents and the
  web build. The clean clone and CI found three things that only worked on this machine, each fixed: lint's
  TypeScript configuration needs `jiti`, which had come in through the sibling Deem checkout; the Deem smoke specs
  called whatever `deem` the shell found first (here a global link to the sibling); a playtest script under `doc/`
  imported Playwright by this machine's absolute path, and the typecheck went over `doc/`, which lint already passes
  over.
- **I.C. The page and keeping the game, measured.** wren in the built page at a tablet's size, choice to frame
  painted: p50 296 to 94 ms, p99 4,740 to 293 ms, worst 6,960 to 361 ms (22b0a1e times the page's own keeping: 1 ms).
  The kept state is told apart from its world relation by relation, from the world itself (b8e1341): 74 to 8 ms a keep
  in the frontier.
- **I.B. Local work for local changes, nine commits (037ba96 to ab9055a).** Worlds are shared copy-on-write by
  relation; the campaign keeps its world; only actors whose part changed are projected; idle rules go unasked; read
  views are kept with each relation's facts; the observation is worked out once per world; queries propose candidates
  to grounding. Each change comes to the same game (hashes in [`performance.md`](performance.md)). wren through the
  engine: command p50 244 to 61 ms, p99 5,280 to 411 ms, worst 7,952 to 630 ms. The simulation alone: 5.4 to 63.7
  commands a second. The frontier segment (104,000 facts, 33 modules): engine p50 753 to 133 ms. A wander across five
  marches: p50 164 ms over 120 commands. Tests: `test/world-reads.test.ts`, `test/projection.test.ts`,
  `test/candidates.test.ts`.
- **I.A. Measuring by layer, bounded.** `scripts/sim-bench.ts` measures the simulation alone (A) and a headless session
  (B) by kind of command, from the start or from a profile's checkpoint (`--resume`, `--replay`).
  `scripts/journey-profile.ts` measures the engine's parts (C); it is bounded and diagnostic (streamed steps,
  `--slow`, `--deadline`, checkpoints to take up again, hashes to compare two versions, `--dump`) and can wander
  across marches. `scripts/journey-browser.ts` plays the same commands in the built page (D), with `--think` for a
  player's pause.

## Found, not yet done

- **A march crossing takes 3 to 4.5 s**: drawing the country beyond, parsing its generated Kyr (about 1 s), installing
  it (about 1 s). Drawing and parsing it ahead, while the player reads the choice that leads to the march-stone,
  brought one crossing from 3.25 to 1.82 s in an experiment; it needs a parse that leaves the catalogs as they were.
- **A module's own kinds live in global catalogs** (`LocalKinds`), joined as a module is parsed and replaced whole
  when another campaign is played. The independent audit's probes (`independent-audit-2026-10-25/evidence/probes.log`)
  show a second game in one process taking the first game's kinds away from it ("Unknown item definition dreg_ox").
  Catalogs kept with the campaign would answer both this and the crossing above.
- **A query asked of what is not yet bound can miss answers.** `world.solve(reaches(a, ?t))` leaves out a thing no
  clue reveals, because `noticed` begins with a negation over `?t` before anything binds it (shown in
  `test/candidates.test.ts`). Grounding no longer depends on it (`Candidates`); a rule whose condition asks such a
  query with a variable may still miss bindings, and no rule has been audited for it.
- **Keeping the game rewrites the whole state after every command**, 1.25 MB by wren's step 175: the command log
  (1.07 MB, two thirds of it the receipts, which hold each command's world changes a second time and its bodies
  before and after), and measures and creatures written whole.
- The player's choices are grounded afresh in every new world (25 ms warm in the frontier, 1,199 schemas).
- The heap after a full collection grew by about 0.35 MB a command at the baseline; a long session against a fresh
  restore is not yet compared.
- `test/smoke-deem.sh`, which no spec runs, fails in its own verify step (an undefined command in a battle).

## Deliberately left

- CPU throttling of the page (CDP) does not reach the engine's worker, so a tablet's slowness is not emulated; it is
  reasoned from the measured parts (see `performance.md`). Safari is not measured.
- Required status checks on `main` (a branch protection rule) are a setting of the repository, not set here: they
  would stop a push to `main` that CI has not passed.
