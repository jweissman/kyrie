# Missions 11–15: what was commissioned, and what became of it

Research note for the project retrospective, 12 November 2026. Read-only: worktree `/var/tmp/kyrie/wt-m20` at
`a2587989`, git history, GitHub Actions run metadata (`gh api`, read-only), and the builder's memory notes. Nothing
was run except `git`, `ls`, `grep` and `gh api`.

## Limits of the record (read first)

- **None of the five original commissions is in the repository.** M13 has only the builder's own `mission-13/plan.md`
  (benchmarks and order of work, derived from the brief). M11, M12 and M14 are known only through their reports'
  paraphrase ("The brief was blunt…", `mission-11-report.md:3`; "profoundly unsatisfactory in ordinary human play",
  `mission-12/report.md:3`; "as the brief asks", `mission-14/baseline.md:3`) and through the builder's memory
  summaries (`memory/mission-1{1..5}-*.md`). M15's comes only from `memory/mission-15-brief.md`.
- **`findings/briefs.md` (the 6 Nov reconciliation) traces no requirement of M11, M12 or M14**: `grep -cE
  "mission-1[124]" doc/architecture/findings/src/briefs.tsv` → 0. It says only M15–17's briefs are missing. In fact
  M11, M12 and M14 are missing as well and are not covered at all. `reconciliation-2026-11.md` deals mostly with M16
  onward.
- **Speed.** M11 ran 19:57–23:26 on 22 Oct (18 commits). M12 ran 00:10–03:56 on 23 Oct (14). M13 ran 09:10–13:21 on
  23 Oct (11). M14 ran 13:47 on 23 Oct to about 01:15 on 25 Oct (145). M15 ran 25 Oct (53, report `0e066e54`). So
  three "reconstructions" of the game landed in about 18 hours of wall clock, each judged by its builder only.
- **Evidence levels used below.** *impl* = code exists. *tested* = a spec asserts it. *integ* = on main and in the
  built bundle. *deployed* = a successful GitHub Pages run for that commit. *exp* = a player met it working: (B) the
  builder, (A) a cold agent, (H) a human. "claimed" = read only in a report.
- **Deployment is confirmed** by Pages workflow runs for every mission's closing commit: `0f525bb1` (M11),
  `25c80952` (M12), `e7719758` (M13), `0494ee62`/`e3c5e76c` (M14; the report commit `50666cea` failed, later runs
  succeeded), `0e066e54` (M15). So "deployed" holds for every mission's final state. Whether a given feature was
  *reached* on the deployed build is a separate question.
- **No independent human played any of the five missions' builds as a test.** The only human evidence is the owner's
  own play, known indirectly: the next mission's brief reacted to it (M12's "Reported" column; M13's "Kyrie remains a
  poor experience to play"; M15's iPad slowdown).

## Matrix

| Mission | Aims (short) | Implemented | Tested | Integrated / deployed | Experienced | Deferred / abandoned | Revisited later | Complexity added | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| **11** Reconstruction, 22 Oct | Rebuild play structurally: one protagonist with an origin; a book page (folio); wild country as ground; map from the land; narrator that chooses; fellows; varied works; a living toll road; report frankly | Yes, all (origins, region-zones, region-fellows, narrator, book/verso/recto, land-map, works shapes, toll riders) | Partly: origins, fellows, wild-country, narrator, land-map, toll specs exist now | Yes; Pages `0f525bb1` success; builder checked the served site (§11) | B: journeys A–G in Chromium. H: owner played it and reported 14 failures, which became M12's brief. No A | Danger calibration, continuation after death, treasure history, cosmology, settlement depth, parse speed (report §13). Real iPad/Safari untried | **Book UI deleted 1.5 h after the report** (`fd1331d9`, 00:53 on 23 Oct). The M11 map was replaced the same night. Toll death repaired in M12. Settlements reworked M12/M13/M19 | Origins as modules (`data/origins/*`); new Kyr declarations (`outdoors`/aspects/`noticed by`/`Topic … with x travelling`); scene tables in `data/generation/scenes`; narrator layer | `mission-11-diagnosis.md`, `mission-11-report.md`, `doc/playtests/mission-11-2026-10-23`, `doc/design/mission-11/` |
| **12** Uplift, 23 Oct | Answer the owner's 14 reported failures: communities not service shops, readable map, willow findable, toll death explained, no waits, kin brother, pettable dog, label merging, causal death; Orsino inventory; painting registry; editorial workflow; region split and warm parse; Long Man placed | Yes: community model, voice/happenings, new reader, obituary/continuation, Orsino inventory (2,651 entries), paintings registry (804), `ModuleBundle.warm`, `countries.json` | Yes: community, voice, consequences, continuation, narration-audit, command-contract, frontier, the-long-man. **The willow spec was vacuous** until repaired 26 Oct (`69125e50`, comment at `test/community.test.ts:151`) | Yes; Pages `25c80952` success | B: four seeded machine walks plus one short browser journey. H: owner judged the result "a poor experience" (M13 brief). No A | Its own list: same-shaped settlements, empty roads, quiet first hour, saves carrying the compiled module, Begin at once 3.9 s (worse), no device, no human. Riddles and shops blocked | **Reader replaced about 6 h later** by M13's stage (`416805c3`, deleting world-view/here-view). Saves redone in M13. Paintings redone in M13/M16/M18. Settlement sameness persists (M19-73) | `src/world/community/`, `src/narrative/*`, `data/voice/*.json`, Orsino inventory with a staleness spec, paintings registry, `bin/*` tools (moved to subcommands in M14) | `mission-12/{diagnosis,report,architecture,performance}.md`, `doc/playtests/mission-12-*`, `doc/authoring/findings-response.md` |
| **13** Experience, 23 Oct | Seven benchmarks judged by play: arrival in 10 s; conversation changes the screen; a road goes somewhere; a strange thing has parts; a fight at a glance; two settlements differ; half an hour without a quest finds something. Plus art direction by prototypes, paintings by content, talk as a Kyr act, saves without compiled country, Orsino closure, Kyr gaps, fresh-world playthroughs | Yes: stage reader (place/talk/thing/road/fight), foundings, road traffic, KeptGame deltas, world audit, credits rule, `talk_to`/`take_leave`, weariness/making | Yes: foundings, traffic, kept-game, world-audit, paintings, weary-fights specs exist | Yes; Pages `e7719758` success | B only: three builder playthroughs. The report itself says "no independent human tester" and that "many would not" go on past 15 min | Benchmarks 1, 5, 6, 7 not met by its own account (people thin, wandering quiet, first minute plain, Begin 2.3–2.9 s). "Real players, watched" deferred | Walled field removed in M16; **road stage deleted** (`1c149c0a`, 6 Nov; BRF-03). Fighting objects as species reversed in M19 (BRF-12). Fight legibility still open in M19 (M19-78). Settlement layout (BRF-06) and wandering (BRF-07) superficial | Stage component family `web/reader/stage/*`; founding table; region traffic rules; kept-game save format; world-audit gate | `mission-13/{plan,report,playthroughs,world,narrative,orsino,authorability,performance}.md`, `findings/briefs.md` BRF-01..14 |
| **14** Expedition, 23–25 Oct | Proof A: a generated, persistent, multilevel dungeon found in ordinary play and sustaining several expeditions. Proof B: an argument with consequences. Proof C: a historical landscape with material effects. Proof D: an independently authored scenario with local kinds. Also: Orsino dungeon audit, UI with no dead clicks, title with Options, opening incident, conversation memory, authorability gaps, `bin/kyrie` only, project contract, cached parses | A: yes (`src/world/deep/*`, 4 purposes). B: yes (deep-argument, disputation, `belief.kyr`). C: partly (deep-history, rivals, land). D: small fixtures only. bin/kyrie, CONTRACT, Options, arrivals: yes | Yes: descent (4 kept descents, KYRIE_LONG), long-expedition, deep-*, disputation, local-isolation, world-starts (110 seeds), world-browser, repository | Yes; Pages successful through `e3c5e76c`. **Browser Begin of seed `wren` was broken on the deployed build for much of the mission**, found only at the end (`8cb664cf`) | B: heart brought up in 4 worlds. A: two cold-agent reviews of the deployed build. The first did not reach the deep site and would not continue past 15 min. The second found two deep sites by ordinary leads, visited upper levels, and "would continue" but did not "trust it with hours"; it never completed a deep dungeon | Its own list: conversation memory; dynamic entities; conditional passages; counted offers; rule trace; pronouns; the sky purpose; ecology beyond the site; a full-size Proof D; level-1 survival; portraits contradicting prose | Local-kind isolation (F1/COR-04/ARV-H7): Partial in M16–17, "Open risk" in M19 (UNT-237). The M16 primary gate moved to a *discoverable authored* dungeon. Lethality recurs (cold playtest finding 2; UNT-124) | The largest new subsystem: deep generator (12 TS files, 8 data files), rivals/ambitions and belief rule modules, local catalogs, long-descent replay suite (a CI job), 110-seed start gate, `CONTRACT.md` | `mission-14/{report,expedition,baseline,orsino-dungeon}.md`, `mission-14/independent-review-*`, `mission-14/arch-review/` |
| **15** Inner loop, 25 Oct | I: measure a sustained journey by layer and repair it; budgets; CI that runs every spec, shows skips and is proved red; clean clone; pin Deem and languages; iPad. II: independent adventures integrated, discoverable from generated worlds; move scenario fiction out of TS; module-local tables, templates, naming; author environment. III: a text-first UI (audit, art direction, prototypes, then build). Cross-cutting: adventure quality (strategic antagonists, pacing) | I: yes (COW worlds, incremental projection, indexes; 65 ms p50 / 514 ms max). CI with three jobs, pins. II: four adventures merged, placed by seed, `kyrie new`, argument as JSON. III: steps 1–4 of 7 (audit, art sheet, three compositions); the page **not built** | Yes: same-game hashes, CI red canary (run 40211561350, claimed), journey driver playing 72 adventure journeys, probes | Yes; Pages `0e066e54` success. The adventures were on the title page **only under `?dev`** | B: wren measured; compositions read. A: cold playtest of `2684952` (on branch `review/cold-playtest-2026-10-25`, not on main) found the adventures "effectively unfindable" and the first expedition "a coin-flip party wipe". H: none; **no tablet measured** | Module-local tables and templates (not begun); time advancement (designed in `time.md`, never built); march crossing 1.2–2.1 s; persistence O(game); UI steps 5–7; adventure quality and strategic antagonists "Not taken up" | E1 (findable from Begin) was fixed only in M16. The white page built in M16 was superseded by M18's dark stage (BRF-21). Module-local tables built in M17 (BRF-18). The inner loop is slow again: 390 test-minutes, 45 min CI wall clock (2026-11-09 review); Begin ~9 s (BRF-11) and ~20 s on iPad (owner, 11 Nov) | CI workflow (now 6 suite shards, 2 browser shards, contracts, reference hour); benches (`scripts/sim-bench.ts`, `journey-profile.ts`, `journey-browser.ts`); the same-game hash protocol; journey driver; `kyrie new` scaffold; four adventure corpora to keep green; `web/compositions` | `mission-15/{report,ledger,performance,time}.md`, `mission-15/priority-iii/*`, `mission-15/independent-audit-2026-10-25/`, `verification.md` |

## Mission 11: the reconstruction (22 Oct, `ac9fadc0`…`0f525bb1`)

- **Aims** (`mission-11-report.md:3-5`): "an integrated reconstruction of Kyr as a beautiful, humane, imaginative and
  genuinely playable fantasy RPG". The diagnosis's table of seven assumptions (`mission-11-diagnosis.md`, "The
  assumptions to replace") is the effective commission.
- **State.** The report marks its claims "implemented, validated and played" (§3, §4, §6, §8). "Played" means the
  builder in headless Chromium. §12 says "Nobody else has played it". The owner then played it. Every one of M12's 14
  "Reported" failures (`mission-12/report.md`, table) is a property of the M11 build: an "unreadable map", a
  "web-app-like UI", the undiscoverable willow, the toll death, the mercenary brother, the dog. **So M11's two
  headline outcomes, the book page and the map plate, met a human and failed.**
- **Spot checks.** `web/reader/{book,verso,land-map,way-chart}.tsx` are absent. `git log --diff-filter=D` shows them
  deleted in `fd1331d9` (23 Oct 00:53), 1 h 27 m after the M11 report. `protagonist-page.tsx` was deleted 27 Oct
  (`5f4f6230`). The engine side survives: `src/world/{origins,region-zones,region-fellows,region-works,region-weather,settlement-scenes}.ts`,
  `src/presentation/narrator.ts`, `src/ui/{intentions,land-model}.ts` exist, as do `test/{origins,fellows,wild-country,narrator,toll,land-map}.test.ts`
  and `data/origins/{kin,debt,herbs,order,wanderer,…}`.
- **Left open** (§13): human/iPad/Safari testing, announced danger and lone-protagonist odds, continuation after
  death, settlements of four rooms, treasure history, cosmology, companions in the moment, parse/copy cost (start
  about 2 s, crossing about 2 s).
- **Complexity.** Origins as Kyr modules bound to generated people, a dozen new Kyr declaration forms, and a
  presentation narrator layer. Whatever the next UI is, it must carry all of these.

## Mission 12: the uplift (23 Oct, `73e1efe6`…`25c80952`)

- **Aims.** Answer the 14 reported failures (`mission-12/report.md`, "The failures, one by one"). Deliverables per the
  memory note: Orsino ledger, painting registry, editorial workflow, authorability response, journeys and performance
  numbers. The brief's sections I–XIII are not in the repo.
- **State.** The report's self-judgment is "ten are fixed … four are better but not solved" and "not yet a game that
  would be judged satisfactory". Each "Fixed" row cites a spec. The evidence is machine walks and one short browser
  journey; there was "No human playtest". The next brief ("remains a poor experience", memory M13) is the owner's
  verdict.
- **Spot checks.** `src/world/community/`, `src/narrative/{voice,obituary,voice-review}.ts`, `ModuleBundle.warm`
  (`src/campaign/module-bundle.ts:224`), `data/adventures/countries.json` and `src/world/countries.ts` exist.
  `web/reader/world-view.tsx` and `here-view.tsx` were deleted by `416805c3` (09:46 on 23 Oct), about 6 h after the
  report. The willow claim's spec "returned early there, having tested nothing" until `69125e50` (26 Oct): a "Fixed"
  claim that rested on a vacuous test for three days.
- **Revisited.** The reader (M13), saves (M13 KeptGame), paintings (M13 credits; M16 41 refused; M18 census), Begin
  speed (M13, M14), and settlement sameness (M13 foundings, still M19-73 "no quarters"). Riddles and shops were picked
  up in M13.
- **Complexity.** A community model, voice tables with an editor's review tool, an Orsino inventory with a spec that
  fails if stale, and a paintings registry. The last two are standing regeneration duties: see
  `memory/orsino-registry-workflow.md`.

## Mission 13: experience (23 Oct, `eb558740`…`e7719758`)

- **Aims** (`mission-13/plan.md`): seven benchmarks "judged by playing, at 1440, 820 and 390 wide", and eleven work
  items.
- **State by benchmark,** from the report's own "Frank assessment" and `findings/briefs.md`:
  - 1 arrival: unverified (BRF-01);
  - 2 conversation: implemented and kept (BRF-02, talk stage still in `web/reader/stage/talk-stage.tsx`);
  - 3 road: built, then retired (BRF-03; `road-stage.tsx` deleted in `1c149c0a`, 6 Nov);
  - 4 strange thing: implemented (BRF-04);
  - 5 fight: superficial (BRF-05; M19-78 open 6 Nov);
  - 6 settlements differ: superficial (BRF-06);
  - 7 wandering: not met ("Wandering is quiet"; BRF-07);
  - playthroughs with real players: deferred (BRF-14), never done in seven missions.
- **Experienced.** Three builder playthroughs (`mission-13/playthroughs.md`). The report answers its acceptance
  question with "many still would not" continue, and says "no independent human tester".
- **Spot checks.** `web/reader/stage/{place,talk,thing,fight}-stage.tsx`, `src/world/{founding,region-traffic,world-audit}.ts`,
  `web/engine/kept-game.ts`, `src/paintings/credits.ts` and `data/rules/making.kyr` exist, as do
  `test/{foundings,traffic,kept-game,world-audit,weary-fights}.test.ts`. The walled-field art direction it chose was
  removed by M16 decision 4 (BRF-08).
- **Complexity.** The stage reader became the base component family that every later UI rebuilt inside
  (`web/reader/stage/` now holds explorer, glance, drawer and more). The kept-game save format became a long-lived
  persistence obligation (N1/N2 in M16; PD-08 in M19).

## Mission 14: the expedition (23–25 Oct, `637642e4`…`e3c5e76c`)

- **Aims** (memory `mission-14-expedition.md`; report §intro): Proof A primary, then B, C and D. "If constrained,
  finish the expedition loop first."
- **Proof A** is the best-evidenced outcome of the five missions. It is implemented, tested by four kept descents
  (`test/fixtures/descent/{wren,thorn,a1,d4}.choices`, `test/descent.test.ts`, now a CI job `long descents`, KYRIE_LONG),
  integrated and deployed. It was experienced by a cold agent in part: the follow-up review found "two deep sites
  through ordinary leads" and visited "upper mine and haulage access; upper singing halls"
  (`independent-review-follow-up-2026-10-24/report.md` §11). It was never completed by anyone but the builder, and
  "a completed deep dungeon" is "Not verified". The builder's d4 heart came "too easily" (report, What next).
- **B** is tested (`test/deep-argument.test.ts`, `test/disputation.test.ts`). Its limits are stated: the crowd's
  sides are told, not counted, and nothing in the town changes. **C** is partial ("Ecology beyond this… not worked";
  one ambition only). **D** is "small fixtures; there is no full independently written scenario"
  (`test/local-isolation.test.ts`).
- **Integration defect.** For much of the mission, seed `wren` could not be begun in the browser at all (missing kind
  `abbey_chalice`). No test began a generated world in the browser; that was found and fixed at the end (`8cb664cf`,
  `test/world-browser.test.ts`). The tested and deployed levels therefore did not imply working.
- **Spot checks.** `src/world/deep/` holds 12 files, 1,257 lines, with 23 commits since 26 Oct. `bin/` holds only
  `kyrie`, `doc/CONTRACT.md` exists, and `test/repository.test.ts` exists. `src/world/deep/deep-argument.ts` exists
  but now imports `data/generation/deep/argument.json` (M15 `f7f6100`), so BRF-19's "still present" understates the
  move. `web/reader/options-page.tsx` and `data/origins/wanderer/arrivals.json` exist.
- **Left open** (report "What I would do next" and "Not done"): level-1 margins (a 7-HP mage "scarcely grows"),
  purses in every room, 2–5 h wild legs, conversation memory, dynamic entities, pronouns, the sky purpose, portraits
  that contradict prose (not repaired), and an incident for every town.

## Mission 15: the inner loop, the adventures, a new page (25 Oct, to `0e066e54`)

- **Aims** (memory `mission-15-brief.md` only; the brief is not in the repo): priorities I, then II, then III, plus a
  cross-cutting charge on adventure quality.
- **I** is implemented, tested (same-game hashes; `doc/architecture/verification.md`) and integrated. The measured
  before/after is in `mission-15/report.md` §I: 244 → 65 ms p50 and 7.95 → 0.51 s worst. "No iPad, and no Safari, was
  measured", although the owner's complaint came from an iPad. The slowdown there is "reasoned … not reproduced".
  The CI and pins exist: `.github/workflows/ci.yml`, and `package.json:22,24` pins deem `967deac` and languages
  `b6e78c3` (since bumped, still pinned).
- **II** is implemented and integrated. The four adventures still exist (`data/adventures/{thrume,house-that-grows,let-one-remember,patient-star}`).
  They were discoverable only "beyond the first country" and on the title page "only under `?dev`". The cold playtest
  of the same day found them "effectively unfindable" (M16 `reconciliation.md` §4, item 1); E1 was fixed in M16.
  Module-local tables and templates were "not begun" (built in M17, BRF-18).
- **III** got steps 1–4 of 7 (`priority-iii/{audit,art-direction,compositions}.md`, `web/compositions/`,
  `scripts/compositions.ts`). The page was not built; it "waits on an independent player's verdict", which never came
  (BRF-102). M16 built a hybrid on white without that verdict, and M18 replaced it with a dark stage (BRF-21, BRF-27).
- **Cross-cutting.** Adventure quality, strategic antagonists and pacing variety were "Not taken up" (report "In
  short"). BRF-20 marks this "disappeared".
- **Later state of the inner loop.** The 2026-11-09 throughput review measured 390.5 test-minutes, a 45 m 40 s CI
  wall clock, and a1 starting in about 5–6 s (`2026-11-09-development-throughput-performance-review.md`, Executive
  diagnosis). The owner's 7 Nov note says CI takes about 1 h and is too slow. M15's "suite in four minutes" did not
  survive the growth of the corpus.

## Recurring commitments that did not reach reliable completion

1. **Independent human play.** M11 §12 says "Nobody else has played it". The same gap appears in M12 ("No human
   playtest"), M13 ("Real players, watched", next step 5), M14 ("No one but me") and M15 (the direction "provisional
   until someone who has not seen the prototypes plays them"). Later it is M16 gate E, M18 F1.12 and M19 PD-14 (Open),
   and the M20 reconciliation's §9.1 ranks it the first unresolved obligation. BRF-14 and BRF-102 record it as never
   done.
2. **A real iPad and Safari.** Untested in M11 §11, M12 ("No device testing") and M15 ("no tablet was measured").
   It is asked again in M17 and M18, and BRF-16 marks it "disappeared". It came back as the owner's own iPad finding in
   M20 (about 20 s world creation, `memory/m20-owner-startup-place-icons.md`).
3. **Startup and Begin speed.** M11 measured about 2.1 s in the engine and 2.8 s in the browser. M12 got worse (3.9 s
   at once). M13 brought it to 2.85 s and M14 to 0.22 s only after reading, still 3.85 s if clicked at once. M15 left
   crossings at 1.2–2.1 s. In M19 a first world took about 9 s (BRF-11, M19-49 Partial), and M20 saw about 20 s on
   iPad.
4. **The interface rebuilt every mission.** M11 built the book, M12 the left/right reader, M13 the stage with its
   walled field, and M15 three prototypes; then M16 a white hybrid, M17 "rebuilt as a game", M18 a dark stage, M19 a
   resting scene and M20 scene-first. The M11 and M12 UIs each lived hours. No UI was accepted by an independent
   player before it was replaced.
5. **Settlements that differ in layout and life.** In M11 they are "still the same four rooms". In M12 they have "the
   same five parts" and M13's foundings are superficial on layout (BRF-06). M18's owner interim said "towns
   uninhabited", and M19-73 and M19-77 are still open (no quarters, no persistent city).
6. **The country coming to meet the player: the road and wandering.** M11's long walk met no fight. M12 says "Nothing
   happens on the road" and "the first hour can be quiet"; M13 says "Wandering is quiet". BRF-07 is superficial: in
   M19's aimless autoplay, 107–119 of 200 steps brought nothing new. M18's owner said the "adventures [were] empty".
7. **Conversation depth and memory.** M13 "people are thin". M14 lists conversation memory as not done. M15 says
   "topics vanish once asked". M16 is partial, and M19-63's topics with progression were added late. Never judged by a
   player.
8. **Danger calibration and level-1 survival.** M11: a lone protagonist died at step 40, and danger was not
   announced. M12 fixed the toll death. M14: "a level-1 company has little room for a bad fight". The M15 cold
   playtest called the first expedition "a coin-flip party wipe", and M16 is partial. The M20 reconciliation's
   UNT-124 has road troubles killing a lone warrior (93% and 81%).
9. **Portraits that fit the person.** M12 started the registry, M13 chose paintings by what they show, and M14 found
   portraits contradicting prose and did not repair it. In M15 Baern was painted as David with the Head of Goliath. M16
   refused 41 paintings, M18 took a census, and the M19 owner still found foe portraits overlapping text.
10. **Module-local content isolation and authorable generation.** M14 Proof D gave local kinds as small fixtures. M15
    F1 was "contained", and module-local tables were not begun (built in M17). COR-04 and ARV-H7 are Partial in
    M16–17 and "Open risk" in M19. UNT-237 says two campaigns sharing files break each other. "Most generated content
    is TypeScript" (reconciliation §7).
11. **A fast verification loop.** M15 established the tiers and a four-minute suite. By 9 Nov it was 390 test-minutes
    and a 45-minute CI (the throughput review), with owner directives `specs-fast-page-objects` and `heavy-runs-on-ci`.
    Time advancement was designed in `mission-15/time.md` and never built (M16 reconciliation §1: "deferred").
12. **Adventures discoverable in ordinary play.** M14 Proof A was discoverable for one cold agent; M15's adventures
    were placed but unfindable (cold playtest); M16 made it the primary gate. M19 notes "dungeon-finding still open"
    (memory `m19-state-nov7-late.md`). On 7 Nov the owner was still "lost in an opening quest"
    (memory index entry for `m19-owner-coherence-chain`).

## Inferences, flagged

- I infer, without a written owner verdict on M11's UI, that the owner's play drove the replacement. The M12 table
  calls the M11 page "web-app-like" and its map "unreadable", and the replacement began within the hour.
- The "experienced (H)" entries come from later briefs as summarised in memory. The owner's actual messages were not
  checked.
- I did not re-run any spec, so "tested" means only that a spec of that name exists now and the report cites it.
