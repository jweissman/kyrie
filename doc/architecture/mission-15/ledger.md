# Mission 15 ledger

Written for: whoever is following Mission 15 as it goes, the person who set it first. A living record: what is done
and verified, what is found and not yet done, and what is deliberately left. Newest entries at the top of each part.
The brief is in the conversation of 2026-10-25; its three priorities are I (a fast, trustworthy inner loop), II (the
independent adventures as first-class content) and III (a new human-facing experience).

## The independent audit of 2026-10-25

[`independent-audit-2026-10-25/report.md`](independent-audit-2026-10-25/report.md) audited ab9055a. Its findings and
where each stands (each repair with the audit's cases as specs, which fail before it and pass after):

| finding | stands | where |
|---|---|---|
| F1 catalogs process-global; a failed declaration poisons them | partly: a second game no longer takes the first's kinds (each campaign claims its own as it reads its world); a refused kind takes nothing of the catalog's; two modules cannot give one kind two meanings. The catalogs are still the process's: kinds kept with each campaign are the full repair | this commit (see the log), `test/campaign-isolation.test.ts` |
| F2 open questions answered wrongly | done: negations wait on what binds them, a repeated variable is one, an unbindable parameter ranges over its type, and a query asked within a query of a bound parameter asks of its value; every shared-rules query is checked open against closed | 6c4575a, `test/query-answers.test.ts` |
| F3 a failed expansion commits a command without recording it | done: the command, the country beyond it draws, its telling and its step are undone together | this commit (see the log), `test/command-atomicity.test.ts` |
| F4 a rule can end travel without ending membership | open | |
| F5 observation instances lose their teaching and binding | open | |
| F6 a dead speaker answers | open | |
| F7 distinct actions hidden behind one wording | open | |
| F8 event and epistemic forms narrower than authors expect | open (a design boundary, not a defect) | |
| F9 dependencies and verification | done: pins, clean clone, CI with a red canary run, skips listed | 55e1bbf, 37b0276, b8e1341 |
| retained heap of a long session (its section 7) | done: 128 MB of grounded actions kept forever; a long session now holds 77 MB at step 333 of wren, a fresh restore 48 | 7ff6072 |
| frontier expansion 3.9–6.1 s | partly: crossings 1.2–2.1 s (prepared ahead, installed into the live world) | 66a968d, 3b9fa5e |

## Done and verified

- **I.F. Crossings, memory, and the audit's urgent findings.** The country beyond a march-stone a step away is drawn
  and parsed while the player reads (66a968d) and installed into the live world (3b9fa5e): crossings 3.0–4.5 s to
  1.2–2.1 s. A long game no longer keeps every action it ever grounded (7ff6072): 232 to 77 MB at step 333 of wren
  after a full collection, against 48 MB for a fresh restore of the same game. F1–F3 and F9 of the audit, above.
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

- **A march crossing still takes 1.2 to 2.1 s**: everyone's creature facts are projected again with each of the
  country's modules, kept so because projecting the newcomers alone, and everyone once at the end, holds the same facts
  in another order within their relations, which rules read. An order-preserving projection of what each module adds
  is the next step.
- **The catalogs are the process's** (F1's full repair): two campaigns' commands interleaved within one command would
  still meet. Kinds kept with each campaign, not joined to shared catalogs, would end it.
- **The audit's F4–F7**: companions leaving by an authored rule stay members; an observation near a variable does not
  teach what it teaches, and a fixed one prints its variable; a dead speaker's action is offered and answers; two
  distinct actions with one wording show as one.
- **Keeping the game rewrites the whole state after every command**, 1.25 MB by wren's step 175: the command log
  (1.07 MB, two thirds of it the receipts, which hold each command's world changes a second time and its bodies
  before and after), and measures and creatures written whole. The engine's keeping now waits on nothing a player
  sees at a player's pace (see `performance.md`), but grows with the game.
- The player's choices are grounded afresh in every new world (22 ms warm in the frontier, 1,199 schemas).
- `test/smoke-deem.sh`, which no spec runs, fails in its own verify step (an undefined command in a battle).

## Deliberately left

- CPU throttling of the page (CDP) does not reach the engine's worker, so a tablet's slowness is not emulated; it is
  reasoned from the measured parts (see `performance.md`). Safari is not measured.
- Required status checks on `main` (a branch protection rule) are a setting of the repository, not set here: they
  would stop a push to `main` that CI has not passed.
