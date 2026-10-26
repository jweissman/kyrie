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
| F1 catalogs process-global; a failed declaration poisons them | partly: a second game no longer takes the first's kinds (each campaign claims its own as it reads its world); a refused kind takes nothing of the catalog's; two modules cannot give one kind two meanings. The catalogs are still the process's: kinds kept with each campaign are the full repair | 0ecbf8f, `test/campaign-isolation.test.ts` |
| F2 open questions answered wrongly | done: negations wait on what binds them, a repeated variable is one, an unbindable parameter ranges over its type, and a query asked within a query of a bound parameter asks of its value; every shared-rules query is checked open against closed | 6c4575a, `test/query-answers.test.ts` |
| F3 a failed expansion commits a command without recording it | done: the command, the country beyond it draws, its telling and its step are undone together | 0ecbf8f, `test/command-atomicity.test.ts` |
| F4 a rule can end travel without ending membership | done: one who joined and no longer travels with the company leaves it, by whatever retracts it (an author's rule, an action): their bodies their own group's again, where they were sent or where the company is, in a kept game too; one laid to rest has left already | `test/patient-probes.test.ts` P10 |
| F5 observation instances lose their teaching and binding | done for both paths it shows: one near a variable teaches what it teaches, and a fixed one fills the variable its condition binds (the first it finds) | 0efdc56, this commit; `test/authorability-probes.test.ts` (lamps), `test/patient-probes.test.ts` P1 |
| F6 a dead speaker answers | done: an action someone speaks (`Speaker priest`) is offered only while they can speak, as a topic is: able and where the company is, or travelling with it and awake | `test/speaker.test.ts` |
| F7 distinct actions hidden behind one wording | done: choices merged only when alike things, or another member, tell them apart; two things' alike changes each offered | 4e63432, `test/patient-probes.test.ts` P4 |
| F8 event and epistemic forms narrower than authors expect | open (a design boundary, not a defect) | |
| F9 dependencies and verification | done: pins, clean clone, CI with a red canary run, skips listed | 55e1bbf, 37b0276, b8e1341 |
| retained heap of a long session (its section 7) | done: 128 MB of grounded actions kept forever; a long session now holds 77 MB at step 333 of wren, a fresh restore 48 | 7ff6072 |
| frontier expansion 3.9–6.1 s | partly: crossings 1.2–2.1 s (prepared ahead, installed into the live world) | 66a968d, 3b9fa5e |

## Done and verified

- **III.B. The map faithful to what is known.** A fact may lead to a place (`leadsTo`, in the shared rules): known,
  the place is on the company's map and its region's chart, as not yet visited, before it has been there or knows the
  way. Each generated site's name leads to it, and each authored country's rumour to its march-stone
  (`test/leads.test.ts`).
- **III.A. Nothing irreversible by a slip.** `Grave "…"` in an action: the page says what it costs when it is first
  chosen, and does it when chosen again (ba39b86; `test/grave-browser.test.ts`).
- **II.E. A deep site's argument as public content.** Every word of the shrine's argument over a deep site's seal,
  and the ways of arguing it, are in `data/generation/deep/argument.json`; `DeepArgument` binds them to each site.
  The generated worlds of eight seeds and the countries beyond them are byte for byte the same (208 files); a way of
  arguing written there is a way the company can try (`test/deep-argument.test.ts`). Its structure (the topics,
  actions and rules) is still the generator's: a template language a module could use is open. `kyrie new` scaffolds
  an adventure that lints, plays, is tested and can be placed (f2a16c0).
- **II.D. The adventures in generated worlds.** Thrume, The House That Grows, The Road the Star Came Down and The
  Patient Star are countries a generated world may hold (`data/adventures/countries.json`, each by a `placed.json`
  that leaves its own company out and takes the world's): one to a world, as its seed chooses, beyond the first
  march where it fits, as The Long Man is held where it fits. The folk of the first region speak of it by name, and
  the innkeeper of the town its road leaves from tells its rumour when asked about the road, known from then as heard
  from them; the road across the march comes into its edge (Thrume's salt road, the rim of Cobble Ring, the Peleth road's eighth
  bend, the Shift Market); its clock runs from then. Installing one takes 0.35 to 0.9 s. A module may now say what it
  will of the company it is installed for by names of its own (The Patient Star's breath and memories). Test:
  `test/frontier.test.ts` (yew's Thrume, walked into and read; wren's Ghessil Uplands).
- **II.C. What authors could not say, and can now.** A member's speed (0efdc56); a rule's or event's words teaching
  what they say (829fe2d); endings that close the book (6aedbe2); every colliding name in one load (6780b43); a count
  taken past nothing stopping there, and a long way risked not turned back by the risk (c6dbce9); two things' changes
  worded alike both offered (4e63432, the audit's F7); the dark's light taken by its command (508bfbf, 0efdc56); a
  thing used up said by its own name (508bfbf, 6cbe371); one list of what the engine writes (483e3af); an
  observation's variable filled (0efdc56), and one near a variable teaching what it teaches (the audit's F5). Each pinned by a probe; the four reports answered together in
  [`doc/authoring/adventures-response.md`](../../authoring/adventures-response.md), and the guide says each.
- **II.B. One driver for every adventure's journeys, and `kyrie play`.** `Journey` (`src/session/journey.ts`) with
  every step form the four authors grew; the four adventures' tests play by it (72 journeys), and `bin/kyrie play`
  plays the same steps from the terminal with probes of the world (6cbe371).
- **II.A. Four independent adventures on `main`, on the title page.** Thrume (93d03f4), The House That Grows
  (41ba11a), The Road the Star Came Down (5a2dec7, its branch's head as it moved) and The Patient Star with Hold One
  Season (0efdc56), each as written but for what the language's later rules asked (named in each commit), each
  played by its own journeys and offered beside The Long Man.
- **I.G. A frontier game replayed in another process.** The wander of 120 commands from a1 across five marches (16 to
  35 modules), played through the browser's engine (`EngineHost`), and its transcript replayed by `bin/kyrie replay`
  in a fresh process (26 s), come to the same canonical state, once the scenario's path is read the same (the engine
  names it relative, the terminal absolute).
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
- **What the four adventures found that is still open**, by mechanism and by how many met it, in
  [`doc/authoring/adventures-response.md`](../../authoring/adventures-response.md): knowledge from a named source and
  at a fixture's start; state names scoped to their thing; a skill a source needs; arithmetic (precedence, min, max,
  division) and computed measures; dates and periods; people on errands; passages hidden on any condition and seen
  differently from each end; senses beyond sight and a douse; alike things stacked; a grave act confirmed; lint that
  reads rules. Bugs: a shuttered light stays lit; two exits to places named alike read alike; a companion who joined is
  nowhere (F4's kin); hiring adds the hired person's purse.
- **An authored country placed in a generated world tells of its own protagonist** where it was written for one:
  The Patient Star's square speaks of "your own knife", and its debt and kinship to Garret are the cutter's, not the
  world company's. The country plays; those threads stay closed or read oddly.
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
