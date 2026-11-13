# Missions 16–20: what was commissioned, and what became of it

Retrospective research, 12 November 2026 (evening). Read-only. I worked in `/var/tmp/kyrie/wt-m20`, branch `m20-work`
at `a2587989`. That branch is 19 commits ahead of `main` (`b4f567df`). `integrate/first-steps` (`9e5643d6`) is
`m20-work` up to `c1f7a20c` plus the adventure branch, and it is **not on main**. Paths below are repo-relative unless
they start with `/`.

**Levels.**
- **impl**: a commit exists.
- **tested**: a spec asserts it.
- **integ**: it is on main.
- **depl**: it is on the public Pages build.
- **exp**: a player met it working. *exp-agent* means a cold AI agent. *exp-owner* means the owner, who is not a cold
  player.
- **claimed**: it rests on a report sentence only.

No mission had **human acceptance**. PD-14 (five cold human players) has never been run (`mission-19/register.md:97`;
`open-register.md` FH-01, P0). Every human play recorded is the owner's own, and every one of them was a negative
verdict or a list of corrections.

**Deployment.** Pages has deployed main since the initial commit (`.github/workflows/pages.yml`, d022845e). So
"integ" mostly implies "depl" in practice, but no mission verified play on the deployed build. M20's amendment 3 had to
"restore Pages first" (`mission-20/log.md:26-29`; be974d1f, 3a69fa02 add version.json and the built-from commit).
Every cold round was served locally. The deployed build was never played by an agent (`briefs-audit.md`, "Omissions"
§6; FH-02).

---

## Matrix

| Mission | Aims (short) | Implemented | Tested | Integ/depl | Experienced | Deferred / abandoned | Revisited later | Complexity added | Owner corrections mid-mission | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| **16** (25–27 Oct) | Inviting RPG: production UI on a white page; Long Man as the discoverable primary dungeon; Character view + first-stage advancement; assisted travel; truthful survivable combat; return told; Low Water. Deepening: autoplay lab, every finding registered, nine adventures in one world | Most gates A–D (report "In short") | Advancement, long-man, autoplay specs (`test/advancement.test.ts`, `test/the-long-man*.test.ts`) | On main; Pages | Builder and policy plays only: "No one outside this session has played this build" (`report.md:9`). The owner's verdict came in M17's brief: cannot enjoy it "more than a few minutes" | Low Water never played Begin→end (`report.md:241`); the nine adventures sat in separate countries, none played to its end in one career; register left 63 open + 42 partial of 203 | White page → dark stage (M18 A2); assisted travel → map only (OWN-85); Long Man as principal → superseded by kahitude/first town (BRF-23); combat survivability every mission since | Tests 175→264; adventures 6→10; autoplay laboratory (44b1be4); 203-row register; CI from 55e1bbff (1 job) | 0 corrections recorded. 1 follow-on commission (26 Oct, "deepening") + 4 added asks during it (`deepening-report.md:3-11`) | `mission-16/plan.md`, `report.md`, `deepening-report.md`, `register.md`; `findings/briefs.md` BRF-23..39 |
| **17** (27–28 Oct) | 30 enjoyable minutes + pleasant authoring; close 105 inherited; UI rebuild; compact dense region; 10–100× POI density; perception/maps; studio; portraits; cold evaluation + owner verdict | Studio (69cffd9), place by salience, fight field (a942a22), character lab | 386 test files; lab examples in the suite | On main at 28b306c | exp-agent: 1 cold evaluation on bdc87ba, not the final build (`play/cold-evaluation.md:3-6`). exp-owner: the interim report found it "frustrating, confusing … like a web application" | Dense region (V) not built; POI-density measure disappeared (BRF-43); iPad never; Manuals, battle and reinterpretation disappeared (BRF-47..49); 52/43/9/1 of the 105 inherited; closed **by the owner** with 11 open + 61 partial (`ahead.md:3-6`) | UI rebuilt in M18, M19 and M20; dense region → M18 B1/B2 → M19-77 → M20 integration; NAV-10 still open in M20 (CP-10) | Tests 264→386; CI 3 shards; studio CLI (`new`, `inspect`, `verify`, `play scene`); adventures 10→14 | 1 interim report (27 Oct) that reordered the mission, + "still painful" (report §In short), + "burn down before surface" | `mission-17/report.md`, `ahead.md`, `register.md`, `play/`; memory `m17-owner-interim-report` |
| **18** (28 Oct–3 Nov) | Dark-stage game UI (A1–A10); one country + Seven Towers + Imbar chassis (B); density, deep dungeon, economy, novice survival, combat (C); Kyr review, studio, CLI stats/info/bench, save parity (D); careers, planes, Encyclopedia (E); verification incl. independent and owner play (F) | A, B1/B5/B7, C1–C5, C8, D1/D2/D4/D5, E4/E5 Built or Played (`brief.md:122-158`) | 1,362 quick + 601 slow + 58 browser, green locally on 3 Nov (`closure.md` Evidence) | On main; CI red 2–3 Nov | Builder plays of the first town. exp-agent: the cold review, whose "selector is not a human" (`review.md:131`). exp-owner: negative, 3 Nov ("does not yet feel like a game") | "Closed, not complete. No requirement is Accepted" (`brief.md:124`). Not built: B2 Seven Towers, D6/D8 `stats`/`info`/`bench` (absent from `src/cli/kyrie.ts`), D7 save parity, E2/E3/E6/E9/E11, F1.2/F1.7–F1.12, F3. Seven Partial rows dropped from the wishlist | Map rebuilt again in M19 ("one 3D map only") and M20 (routes, panel); dark stage → M20 scene-first/cinematic; Encyclopedia built in M19; careers → M21 (FH-03) | Tests 386→582; web TS 66→122; adventures 14→22 (8+ adventures merged mid-mission); CI 5 shards; 3D hex map; one-universe planes; 430–568 rows | **74 OWN rows** (OWN-01..85) from ~10 dated owner messages, 29 Oct–3 Nov: map-first, quiet UI, diagnose one expedition, one universe… (`register.md:171-291`); 8 memory notes | `mission-18/brief.md`, `closure.md`, `register.md`, `handoff-supplement.md`, `audit.md`; reconciliation §4.1–4.5 |
| **19** (4–10 Nov) | Inhabitable world: the ten-step loop in a1/kahitude; product UX; identity consequential; content activated; human-scale authorship; coherence; integrity (no regex over Kyr); Encyclopedia; six journeys | Aims `toward` (`src/lang/Kyr.ohm:65`), `src/ui/objective-target.ts`, `src/hex-boundary.ts`, `src/campaign/crossing.ts`, Encyclopedia, creature canon (`data/catalog/animals.json`, `monsters.json`, `plants.json`) | `test:intent`, `test:honest` (package.json); 741 test files | Frozen on main at 7302392c; first fully green CI ff2cd799 | exp-owner: many plays, all corrective. exp-agent: fresh playtests 7 Nov. "No cold players … Nothing in M19 has been accepted" (`closure.md` §1) | Closed "as an implementation mission with player-experience acceptance explicitly unmet". Own 252 rows: 150 fixed, 25 partial, 19 open, **49 deferred to M20**; 45 audit rows (39 open). A fix for M19-234 and one for M19-229 reverted at closure | M20 redid the aims (golden thread), the resting scene (marked "SETTLED" in M19, redesigned twice in M20), talk, light, combat foot and travel | Tests 582→741; src 430→478; web 122→133; adventures 22→28; CI 6 shards, ~40 min; 22 MB saves (M19-236) | **27 owner memory notes**; 87 register rows sourced to the owner, 4–10 Nov; the owner's process audit | `mission-19/brief.md`, `closure.md`, `register.md`, `journeys.md`, `evidence.md`; memory `m19-*` |
| **20** (10–12 Nov) | One enjoyable, comprehensible first hour on kahitude (debt, warrior), then PD-14 with five cold humans (`opening-brief.md` Objective). Amendments 1–8: place-first, one app on main, environment pass, scene-first opportunities and atlas, combat as a scene mode, closure. 12 Nov: golden thread, cutoff, integration | Golden thread (E153/E154/E173), signals→acts (E183/E185), glance menu, safe zone, town entry, light, headless merge (672026c7), autoplay walkers | 56 cited specs exist (e.g. `test/gold-follow`, `glance-menu`, `safe-zone-browser`, `signal-inside`, `client-parity`); 809 test files on main | M20 fixes are on main through E214 (b4f567df). **The integration and E215–E223 are not on main**: the handoff's Part 0 still reads "Main is `__MAIN__`" (`handoff.md:13`) | exp-agent only: 12 rounds, 23 agent players. Clarity 2–4, challenge 2–3, continue 3–4 (`handoff.md:309-322`). exp-owner: user-notes (10 Nov), player report (12 Nov, register §19) | PD-14 never run (FH-01). Combat as a scene mode outstanding, with no row; silver leads on the map: no evidence; Notes/Story, narration-by-position and the authored-walks decision deferred to M21. Register: 324 rows, ~189 homed M21 | Not yet: M21 is to be stabilisation and the test loop (memory `m20-owner-land-and-handoff`) | Tests 809 (844 with integration); CI 6→10 shards, 60-min limit; quadratic install cost (T24-11); src/autoplay; evidence-tools; open-register.md; 6 adventures standing in every country | Amendments 1–8 in the log, + **18 owner memory notes** (11 after amendment 8: map panel, colour grammar, action projection, acceptance defects, golden thread, cutoff, landing…) | `mission-20/opening-brief.md`, `log.md`, `amendment-6.md`, `briefs-audit.md`, `handoff.md`, `cold/`; `open-register.md` |

Corpus growth, by `git ls-tree` at each mission's boundary:

| Commit | Test files | `src` TS | `web` TS | Adventure dirs |
|---|---|---|---|---|
| 0e066e5 (M16 start) | 175 | 307 | 51 | 6 |
| 28b306c (M17 close) | 386 | 366 | 66 | 14 |
| b3c3a8e6 (M18 close) | 582 | 430 | 122 | 22 |
| 7302392c (M19 close) | 741 | 478 | 133 | 28 |
| b4f567df (main now) | 809 | 488 | 143 | 28 |
| integrate/first-steps | 844 | 491 | 144 | 28 |

Commits per mission:
- M16 185 (to 0b22190);
- M17 121;
- M18 442 (to b3c3a8e6);
- M19 610 (to 7302392c);
- M20 332 to main, 485 on the integration branch.

---

## Mission 16: an inviting RPG (25–27 October)

- **The brief.** The plan restates it (`mission-16/plan.md`, Decisions 1–8 and Gates A–E). The owner's text is not in
  the repo (`findings/briefs.md:5-8`).
- **Primary gate, the discoverable authored dungeon.** Implemented and tested: `test/the-long-man*.test.ts` (5 files),
  `test/long-man-browser.test.ts`. A page-only policy found the lead in 8 of 8 worlds (`report.md` In short, B).
  "Every Begin world holds it" stays unverified (BRF-24).
- **Character view and advancement.** Implemented and tested (`test/advancement.test.ts`). BRF-31 rates first-stage
  advancement *superficial*.
- **Combat survivable, return told, Low Water.** All *superficial* (BRF-32, BRF-33, BRF-35). Low Water was merged whole
  (81eaa26, verified) but "not played from Begin to an ending" (`report.md:241`).
- **Acceptance.** None independent: "Every play described here is mine, or a policy's I wrote" (`report.md:9`).
- **At close.** 203 rows: 93 fixed, 42 partial, 63 open, 2 deferred (`deepening-report.md` In short; reconciliation
  §3). The two Deferred rows were never carried into M17 (UNT-119).
- **Superseded or reworked.**
  - The white page: by the dark stage (M18 A2), and then M20's painting-led scene.
  - Assisted travel: by the map alone (OWN-85).
  - The Long Man as principal adventure (BRF-23).
  - The talk page is the one survivor, kept by owner directive.
- **Spot checks.**
  - 81eaa26 exists.
  - `data/adventures/low-water/` and `data/campaigns/low-water.campaign.json` exist.
  - `test/advancement.test.ts` exists.
  - The Long Man is still a placed country (`data/adventures/countries.json:7`).
  - No `src/` code names it. Placement is now data, so the "every world" claim cannot be checked statically.

## Mission 17: thirty enjoyable minutes (27–28 October)

- **The brief.** It survives only as the builder's memory summary (I–XXVII, gates A–F, ten demonstrations).
  `findings/briefs.md` says so.
- **Thirty minutes.** The report says "Nearly" (`report.md` In short). This rests on the builder's own plays 8–13.
- **The cold evaluation.** One agent, on bdc87ba, not the final build. It found "in between … it feels like browsing".
- **The owner.** His interim report from real play (27 Oct, memory `m17-owner-interim-report`) called it
  "frustrating, confusing … like a web application". It reordered the mission to playability first and the studio last.
- **The 105 inherited rows.** 52 fixed, 43 partial, 9 open, 1 not reproduced. BRF-41 rates this *superficial*.
  "Close all" was not met.
- **The dense region (V).** Not built: "they are still separate countries". POI density 10–100× was never measured, and
  it then disappeared (BRF-43).
- **Close.** The owner closed M17 at 28b306c with 11 open and 61 partial (`ahead.md` §1–2). This was closure by the
  owner, not completion.
- **Built and still present.** The studio (69cffd9 exists). `src/cli/kyrie.ts` has `new`, `inspect`, `verify`, `play`
  and `reach`. The character lab is BRF-46, *implemented*.
- **Spot checks.**
  - 69cffd9 and a942a22 exist.
  - The `kyrie` CLI cases are confirmed.
  - The `arms` spec that M17-19 cites is absent from `test/` (consistent with reconciliation §3).
  - NAV-10 ("every installed adventure found and entered") runs open from M16 through M17, M18 (audit "partly") and the
    M18 wishlist, and appears in M20 as CP-10.

## Mission 18: the dark-stage game and one country (28 October–3 November)

- **The brief.** `mission-18/brief.md`: gates A–F, with each row's status kept in place. It closed with "**Mission 18
  is closed, not complete.** No requirement is **Accepted**" (`brief.md:124`). The owner's verdict on ordinary play,
  on 3 November, was negative.
- **Built and played by the builder.** A1–A10 (A2/A3 "Owner verdict awaited"), B1/B5/B7, C1–C5, C8, D1/D2/D4/D5,
  E4/E5. F1.6 (novice solo) was simulated, not played: lone casters die (PT-11, SYS-05).
- **Not built.**
  - B2: the City of Seven Towers. Only mentions exist, in `data/adventures/gosses-company/rierdan.kyr`.
  - D6/D8: `kyrie stats`, `info`, `bench`. They are absent from the CLI case list in `src/cli/kyrie.ts`, which I
    verified. The handoff supplement listed them as carried "with rows", but they had none (reconciliation §4.3,
    UNT-122).
  - D7: save parity between terminal and browser.
  - E2/E3/E6/E9/E11 and F3.
- **The closure's own claim.** The closure draft said "every step was a visible choice doing what it said"
  (`closure.md`, "The owner's test"). M19's first play found wrong aims, dead keys and false danger (reconciliation
  §4.5).
- **OWN-28 discrepancy.** The row is marked Fixed, but dens still promise "A dark mouth opens in the hillside"
  (`data/generation/scenes/sites.json:6`, verified today) and are one room (UNT-101).
- **Mid-mission redirection.** The 74 OWN rows across about 10 owner messages are the strongest evidence of brief and
  acceptance mismatch. Among them:
  - interim 2 (busy, map not a hex crawl, empty adventures);
  - the map correction, then map 2;
  - quiet UI;
  - "stop adding features; diagnose one ordinary expedition" (30 Oct);
  - one universe;
  - map-first.
- **Breadth during stabilisation.** At least eight adventures were merged during M18: Grand Tour, Wapshott's Circus,
  Fair Weather, Half the Hive, The Lull, Quiet in the Sky, Quittance, Book of Faces (`register.md:382-787`).
- **Spot checks.**
  - `web/reader/ident.tsx` exists (A3).
  - `test/encyclopedia.test.ts` exists, but the Encyclopedia was built in M19, not M18.
  - `stats`/`info`/`bench` are absent.

## Mission 19: the inhabitable world (4–10 November)

- **The brief.** `mission-19/brief.md`, Priorities I–XIV. Success is the player's and author's sentences (§XIV), and
  "land the plane".
- **The closure.** `closure.md:3-4`: "closes as an implementation mission with player-experience acceptance explicitly
  unmet". No cold players. The rendered tour stopped at the casket puzzle: no debt paid, no return, no ending.
  First-hour defects stayed open: M19-233 (lethal lead), M19-170 (light), M19-234 (its fix reverted), M19-227/228/229.
- **BRF ratings.** Most priorities are *superficial* (BRF-66, 67, 69, 72–74, 76–78, 82, 84, 86, 88, 92, 93). Rated
  *implemented*: BRF-68, 70, 71, 75, 83, 87, 91.
- **Register at close.** 297 rows. The mission's own 252: 150 fixed, 25 partial, 19 open, 49 deferred to M20, 1 open
  risk. The audit's 45 rows: 39 open.
- **Deferral count discrepancy.** Memory (8 Nov) gives 31 deferred to M20. The closure (10 Nov) gives 49.
- **The retrospective's candour.** `closure.md` §5 says: "the scripts knew the path"; "the same failure came back five
  times in five places, each repair green"; "breadth arrived during stabilization". Its proposed definition of done is
  implemented, verified, then accepted by a person.
- **Owner pressure.**
  - 87 of the mission's register rows cite the owner as source (4–10 Nov), across 27 memory notes. Two cases:
    - "resting scene (SETTLED)", then wayfinder;
    - "foundation first" (6 Nov), then "coherence chain" and "stabilization" (7–9 Nov).
  - An overnight close (6 Nov) also merged Imbar, the ocean, the desert and Dun Rìerdan during stabilisation.
- **Spot checks.**
  - `src/hex-boundary.ts`, `src/campaign/crossing.ts` and `src/ui/objective-target.ts` exist.
  - `ObjectiveToward` is at `src/lang/Kyr.ohm:65`.
  - `test:intent` and `test:honest` are in `package.json`.
  - `organisms.json` is retired: the catalog holds `animals`/`monsters`/`plants`.
  - PD-14 is "Open (protocol written; not yet satisfied)" (`mission-19/register.md:97`).

## Mission 20: the first good hour (10–12 November)

- **The brief.** `opening-brief.md`: the first hour on kahitude, then PD-14 with five cold players. "Their notes, not
  the builder's, decide what is done."
- **PD-14 never run.** It is FH-01, P0, and `briefs-audit.md` §1 marks it **outstanding**. The decisive half of the
  objective is unmet.
- **The first hour itself: partly.** It is built and verified by spec and agent play. 23 agent players over 12 rounds
  rated clarity 2–4 and challenge 1–3. Round 2's two agents paid the debt and reloaded.
- **Amendments.** 1–8 widened the scope: environment pass, scene-first painting-led layout, a six-colour atlas, combat
  as a scene mode, a silver walker, consolidation, an authoring trail.
- **The briefs audit's tally.** Many items fulfilled by spec. Outstanding with no row:
  - combat as a scene mode;
  - B6 (one combined headless and rendered replay);
  - the gauntlet;
  - consolidation.
- **Untested.** Silver leads on the map and restraint in the atlas.
- **Silent closures.** NM-02 and TC-01 are marked Open though done. FH-02 is marked "Done" though play was served
  locally.
- **The integration.** The adventure branch was integrated after the cutoff, on `integrate/first-steps`. It is **not
  merged to main** as of this reading:
  - `git merge-base --is-ancestor integrate/first-steps main` returns no;
  - the handoff's Part 0 still has the `__MAIN__`/`__CI__` placeholders (`handoff.md:13-14`).
- **Not on main.** E215–E223 (the cinematic resting scene, `check:fast`, the safe zone as the outer tenth). `check:fast`
  is in `m20-work`'s package.json and not in main's.
- **Still broken** (`handoff.md` Part 0):
  - CI balance (one spec at 25 min; installs quadratic, T24-11);
  - no human play;
  - Go/Look still pages;
  - the telling overflows on a phone;
  - fights too easy at first and too swingy alone;
  - paintings contradict text (R10-08, R11-09).
- **Spot checks.** All 12 specs I sampled exist (gold-follow, gold-thread, glance-menu, safe-zone-browser,
  signal-inside, town-entry, client-parity, route-weave, perceived-differently, light-pressing, torch-out,
  entity-card). be974d1f and 3a69fa02 exist. The integration is not on main, as above.

---

## Recurring commitments never reliably completed

| Commitment | Missions | Current state |
|---|---|---|
| **Independent human acceptance** (cold players; the owner's acceptance) | M13 ("no independent human tester"), M16 (Gate E, "none claimed"), M17 (XXI cold evaluation + owner verdict), M18 (F1.12, A✓), M19 (PD-14, §XII), M20 (objective, step 5) | **Never run.** FH-01 P0. The owner played in M17–M20, and every time it produced corrections, not acceptance. The substitute was agent cold play: 1 agent in M17, agents in M18 reviews, 23 agent players in M20 |
| **Guidance you can trust** (aims, the destination held, gold) | M16 (lead in the starting town), M17 (destination held on every page; Stakes), M18 (OWN map/quiet), M19 (aims chain, wayfinder, "coherence chain"; the closure's "same failure five times"), M20 (amendment 5(1), atlas, golden thread) | Partly. Gold is strict after Follow, by spec (E153/E173). Gold off the aim (R9-09), two golds and gold on the way out are still open. Round 12 found "an aim that switched without a word" (T24-14..18) |
| **Paintings matching text and person** | M16 (42 refused), M17 XIV (audit 700+), M18 A10 (census), M19 ("painting never text", every place painted, M19-72), M20 (amendment 4, E31, R9-07, R10-08, R11-09) | Open. The handoff's Part 0 item 6 says paintings are "chosen by kind, not by state" (a hypothesis). V1 compatibility claims are proposed, not built |
| **Combat balance and solo survival** | M16 (survivable for one + companions), M17 VIII (PT-11), M18 C6 (simulated; lone casters die; deserters kill warriors 93%), M19 (M19-87, M19-117, M19-233), M20 (amendment 2(4), 6E, 8; CB-01, CB-08) | Open. "Too easy at the start and too swingy alone" (handoff Part 0 item 5). The branch's mummy beats a lone level-1 warrior |
| **Combat as its own experience** | M16 (fight shows both sides; BRF-28 *superficial*), M17 (fight as a field), M18 C7 (morale, surrender not built), M19 (fight bar M19-226), M20 (combat as a scene mode) | Outstanding, with no register row (`briefs-audit.md` "Omissions" §1) |
| **One dense shared region / city** | M17 V, M18 B1/B2 (Seven Towers), M19 (M19-77, "one metropolis by many adventures"), M20 integration | Partial. Six standing modules in every country exist only on the integration branch. No Seven Towers. Adventures cannot share a town (reconciliation §9.7) |
| **Every installed adventure found and entered** (NAV-10) | M16, M17, M18, M19, M20 (CP-10) | Open. The tour entered 9 of 13 and was never re-run to completion. Low Water was never played Begin→end |
| **Register burn-down** | M16 (203 rows), M17 (close all 105), M18 (72 inherited; 430–568 rows), M19 (297 + 145 inherited), M20 (open-register) | Each mission carried more than it closed. M20's register has 324 rows. My heuristic count gives about 137 open, 39 partly, 34 deferred, 33 done, 81 "unverified since". 189 rows are homed M21. The audit counts 74 findings that were never registered (UNT) and 16 brief requirements that "disappeared" (BRF) |
| **A fast test loop** | M15 (§I), M17 XXI ("<1000 tests shouldn't take 10 min"), M18 D8/F4 (`bench` never built), M19 (CI ~40 min; fast contracts 2.5 min), M20 (opening-brief step 4; test-loop.md) | Worse at scale. CI went from 1 job to 3, 5, 6 and 10 shards. One shard ran past 60 minutes. `check:fast` (29 s) is not on main. The quick suite is about 10 s with `--no-isolate` (E223, not on main) |
| **A real tablet (iPad)** | M15, M17, M18, M20 (SP-05) | Never done. Measured only in Chromium (BRF-16, disappeared; UNT-118) |
| **Generated content as data, not TypeScript** | M15 (BRF-19), M17 XII, M18 D3 (~35 TypeScript writers), M19 IX, M20 (AR-05/AR-07) | Open. The reconciliation counted 27 of 61 `src/world` files building Kyr in strings. My crude grep today finds 36 of 69 files with Kyr markers (not a like-for-like count) |
| **Light, talk and narration bound to state** | M17 ("by the light you carry" with nothing lit), M19 (M19-170, M19-227/228/229), M20 (E43/E79/E145, then E213 again; FH-15; NP-02/03) | Light: fixed by spec, but re-fixed in E213. Talk "says nothing" again in round 12. Notes/Story and narration by position deferred to M21 |

## Process observations

**Scoping.**
- *Evidence.* Each brief was very broad. M17 had 27 sections, M18 six gates and about 60 requirements, M19 eight
  priorities and six journeys.
- *Evidence.* Each was re-scoped mid-flight by owner messages, which became register rows: M18 74 OWN rows, M19 87
  owner-sourced rows, M20 eight amendments and 18 notes.
- *Evidence.* The commissions for M15–M17 are not in the repository (`findings/briefs.md:7-8`). Only the builder's
  summaries survive.
- *Inference.* The volume of correction is evidence that the briefs' acceptance criteria were not operational. The
  owner kept discovering, through his own play, what "playable" meant. M19's own retrospective reaches the same
  conclusion: commissions "should name a journey and its acceptance by a person … frozen for their duration".

**Breadth during stabilisation.**
- *Evidence.* M18 merged eight or more adventures while its first town was still being repaired.
- *Evidence.* M19 merged Imbar, the ocean, the desert and Dun Rìerdan while the opening was "unacceptable" (its own
  words).
- *Evidence.* M20 forbade new content (`opening-brief.md`), then integrated six standing modules after the cutoff. That
  integration doubled CI's critical path (T24-01, T24-11).

**Self-acceptance.**
- *Evidence.* Through M18, "Fixed" meant a commit plus the builder's look. The reconciliation found 127 of M18's 383
  Fixed rows cite neither a commit nor a spec.
- *Evidence.* M18's closure says "yes … every step was a visible choice doing what it said", against the owner's
  negative verdict.
- *Evidence.* From M19 the vocabulary was split: implemented, reachable, usable, never accepted. M20 kept it
  rigorously ("No person has accepted anything").
- *Evidence.* M20 reports still include silent closures: NM-02, TC-01 and FH-02 (`briefs-audit.md` §8).

**Agents standing in for humans.**
- *Evidence.* Cold play by AI agents replaced human acceptance from M17 onward. M20 is explicit that "their ratings are
  an agent's, not a player's".
- *Evidence.* Every agent round was served locally on a pinned commit, never on Pages.
- *Inference.* The agent rounds were useful for finding defects: each round produced fixes. They were also used as the
  main pass/fail signal for "the first hour", which they cannot provide.

**Closure by the owner with items open.**
- *Evidence.* M17 was closed by the owner with 11 open and 61 partial.
- *Evidence.* M18 was "closed, not complete".
- *Evidence.* M19 was closed by the owner's word with 49 rows deferred and acceptance "explicitly unmet".
- *Evidence.* M20 was cut off at about 8 a.m. on 12 November, and work continued after the cutoff (integration, round
  12, test-loop diagnosis). At this reading the landing is unfinished: the integration is not on main and the
  handoff's placeholders are unfilled.
- *Inference.* Missions ended by fatigue and re-commission, not by meeting their gates. Each next brief inherited the
  unmet gate under a new name: "30 enjoyable minutes" → "ordinary loop" → "inhabitable world" → "first good hour".

**Delegation.**
- *Evidence.* The cold rounds, adventure authors on branches, independent reviews (architecture, product design,
  throughput, risk) and docs consolidation were all delegated to agents.
- *Evidence.* Their friction reports were often lost: the Parliament of Books' 34 items were never registered
  (UNT-201), and 74 gap rows in total.

**Rework.**
- *Evidence.* The interface was rebuilt in every mission:
  - white literary page (M16);
  - game rebuild with cards and no chrome bar (M17);
  - dark lantern stage (M18);
  - resting scene and spatial reconstruction (M19);
  - painting-led scene, then the cinematic single scene (M20).
- *Evidence.* The map and travel were rebuilt about four times: assisted itinerary, hex crawl, one 3D map only, route
  fidelity.
- *Inference.* The repeated rebuilding and correction suggests that each mission optimised whatever the last owner
  message named, rather than a stable product contract. The M20 post-cutoff review's "promise contract"
  (`review-mitigations-2026-11-12.md`, untracked) is a proposal to fix that.

**Caveats.**
- I ran no tests and played nothing.
- The register counts for M20 are my heuristic classification of the status column.
- The M15–M17 commissions are known only from memory summaries.
- `review-mitigations-2026-11-12.md` and `srd-adaptation-briefing-2026-11-12.md` are untracked in the owner's checkout,
  and I did not read them.
