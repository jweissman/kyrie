# Mission 20: the briefs audited (12 November, about 5 a.m.)

Each brief and instruction of Mission 20, set against what the repository shows. Read at `6d3d0e79`, with another
session's uncommitted edits in the tree. The log ran to E188 and the handoff had just been updated to match.
Sources:
- opening-brief.md, amendment-6.md, the log's amendments 1–8;
- the owner's memory notes (all `m20-owner-*`, `mission-20`, `owner-adventure-to-career`);
- the owner's message of 12 November, early;
- handoff.md, log.md, `../open-register.md` (cited "reg"), `../2026-11-11-forward-design.md` (cited "fwd");
- git log and grep.

**Statuses:**
- **fulfilled**, with how it was checked: by spec, by agent play, by commit only, or rendered by the builder;
- **partly**;
- **outstanding**;
- **superseded**;
- **deferred to M21**.

No person has accepted anything. Every cold round was played by AI agents, so nothing below reads "accepted".

## 1. The opening brief (10 November)

| Commitment | Status | Evidence or gap |
|---|---|---|
| One enjoyable, comprehensible first hour on the reference (kahitude, debt, warrior) | partly | Built and verified by spec and by agent play, rounds 1–9. Agents rate clarity 2–3 and challenge 1–3 |
| PD-14: five cold human players on that build | **outstanding** | reg FH-01 (P0). Never run |
| No new adventures or further authored content on main | fulfilled | `adventure/first-steps` verified, not merged (integration-first-steps.md). outskirts.kyrt was the owner's own ask (amendment 4) |
| M19-233: no unwarned lethal lead | fulfilled, by spec | E2, E3, E23; honest-start |
| M19-170: light runs out, a trap in the dark | fulfilled, by spec | E43, E79 (test/light-pressing), E145 (test/torch-out) |
| Conversation an exchange, not topics | partly | E11, E148, E150 (test/talk-focus, test/castellan-answered). reg FH-15, deferred to M21 |
| M19-234: jobs found without an aim; a heard-of aim must not become the followed one | partly | FH-04 checked for the wanderer. The followed-aim half is held by E153 (test/gold-follow). The rest is open, P2, M21 |
| One public-action journey: Begin → debt paid → consequences → save and reload, rendered | fulfilled, by spec and agent play | E22 (honest-start's fourth journey); the reference hour through the page on CI (handoff, closing note); round 2's two agents paid and reloaded |
| M19-228: Notes and Story as separate records | deferred to M21 | reg NP-03 ("no M20 record") |
| M19-229/M19-126: narration bound to where the company is | deferred to M21 | reg NP-02 |
| M19-121: the fight's remaining engine words | partly | E127 (the dice kept apart from the telling); reg NP-07 in part |
| Decide, country by country, which authored walks are journeys | deferred to M21 | reg NM-10. No decision was taken |
| Test that an aim's target is not shown before it is learned | deferred to M21 | reg US-08 (partial) |
| Fast loop: balance the shards first | partly | f33df419 and c41ace76 (timings read from CI). A shard still hit its 45-minute limit afterwards (E176). reg TC-01 still says Open, which is stale |
| Fast loop: whatever the honest start shows is slow | partly | E107, E121 (11.8 → 10.1 s). reg SP-01, M21 |
| Freeze a candidate | superseded | By amendment 3 (one app on main) |
| DoD: a player-like failing step for each change | partly | Most rows name a spec. E155 and E162 name none, and are "not seen rendered" |
| DoD: "accepted" only from a person | fulfilled | The handoff's status line. No log row is in the state "accepted" |

## 2. Amendments 1–5 (10 November)

| Commitment | Status | Evidence or gap |
|---|---|---|
| A1: design A, a town with trouble (threads tied, choice in exchange, road meetings kept) | partly | E11 (test/talk-focus). Threads tied only in part: E4, reg FH-08 |
| A1: first screen is the place, not the map | fulfilled, by commit | E1 (306e9a0e) |
| A2: no pausing at checkpoints | fulfilled | process |
| A2(1): CI on 5a6618a0 and a frozen candidate | superseded | By amendment 3 |
| A2(2): fewer early aims, clearer hierarchy | partly | E12, E54, E153. reg FH-05 partly |
| A2(3): keys name their locks; consequences told; creation glitches; repeated paintings | partly | E33 and E32 fixed. E30 and E31 in part (reg FH-10, CP-01) |
| A2(4): an engaging, fair opening (difficulty, danger, retreat) | deferred to M21 | reg CB-01 (P1). Agents rate challenge 1–3 |
| A2(5): title, creation, introduction and key pages as one designed whole | partly | E67, E106, E117, E125. reg UI-10, M21 |
| A2(6): a third cold round on a frozen candidate | fulfilled, by agent play | cold/round-3 |
| A3: one app on main; Pages restored; deployed commit shown | fulfilled, by commit | be974d1f, 3a69fa02, ea8354b6 |
| A4: paintings placed in batches | fulfilled, by commit | E48 |
| A4: a stately home and an ancient ruin near the start | fulfilled, by commit | E50 (16229567: the Hall, the makers' stones). No agent visit recorded |
| A5(1): every mark answers to an act; gold and green each mean one thing | fulfilled, by spec | E63–E66; later E183 and E185 |
| A5(2): title and introduction | fulfilled, rendered | E67 |
| A5(2): scene-led layout | superseded | By amendment 6 A |
| A5(3): travel as a journey (pace, rations, consult ≠ set out) | partly | E70, E71, E81 |
| A5(3): landscape seen on the way; a meeting chance at each hex | deferred to M21 | reg NM-06 |
| A5(3): the rail's Map reconsidered | partly | Kept, by builder decision (E70). Owner not asked (reg, owner directives #10) |
| A5(4): first-hour challenge, with a small diagnostic | partly | E74 diagnostic and fix. CB-01, M21 |
| A5(5): gendered forms; the Encyclopedia inside the game | fulfilled, by spec and commit | E68, E69 |
| A5(5): creation order | deferred to M21 | reg PR-07 (§19), at the owner's word |
| A5(6): larger ideas recorded, not built | fulfilled | design-opportunities.md |

## 3. Amendment 6 and its addendum (11 November)

| Commitment | Status | Evidence or gap |
|---|---|---|
| A: painting to the viewport, overlays, safe zones | fulfilled, by spec | 79c26bdf, fa7e8802; test/safe-zone-browser (E130) |
| A: top rail removed; one dossier; map apart | fulfilled, by commit | E104 (fb622d59: the book is character, notes, pack, story; the rail at the foot) |
| B: two to four genuine opportunities, never filler | fulfilled, by spec | 59e399f3; E184, E186 (test/glance-menu) |
| B: no TypeScript-heuristic inventions | partly | Semantics still live under src/ui (reg AR-05, AR-07, M21) |
| C: atlas tones, neutral controls, non-colour cues | partly | a554aa17, E108, E109, E119 (an aspect's word as its label) |
| C: violet drawn | deferred to M21 | Never drawn: no Kyr facet (reg AP-03) |
| D: a legible continuation, no routine dead ends, closed sites investigable | partly | E76, E136. Open: reg PR-08 (§19, the owner's to decide); R9-01, R9-02 |
| E: real pressure in first-hour danger | deferred to M21 | reg CB-01, CB-08 |
| E: combat as a mode of the scene (tactical foreground, readable transitions) | **outstanding** | Fight-page fixes only: E127, E139. No row: see the last section |
| F: route, walk, time and preview agree | partly | E103, E126, E132 (test/route-weave, test/route-drawn). Junctions: NM-01, M21 |
| F: silver leads on the map | no evidence found | — |
| G: interface as an honest integration test, no fake buttons | partly | E113, E146 (test/gold-walk). The false-promise corpus is incomplete (handoff part 3 §10) |
| H: silver walker; optional gold walker and danger-seeker; stalls recorded | partly | E99, E100 (src/autoplay). No danger-seeking policy found. Recurring record: reg TC-07, outstanding |
| I: phase A, then B, by rendered desktop/mobile and a 15-minute journey | partly | shots/ (3 images); cold rounds 6–9, agents |
| J: bounded increments on main; no new adventures | fulfilled | git log |
| Addendum 1: inspect the existing machinery first | fulfilled | opportunities.md |
| Addendum 3: meaning, perception and presentation kept apart | partly | ae134710; Perception (E108). Atlas states as engine data: reg AP-02, M21 |
| Addendum 4: two characters perceive one situation differently | fulfilled, by spec | test/perceived-differently, test/companion-sensed |
| Addendum 5: missing Kyr/Deem contracts recorded | fulfilled | opportunities.md gaps; handoff part 3 §2–5 |

## 4. Amendments 7 and 8 (11 November)

| Commitment | Status | Evidence or gap |
|---|---|---|
| 7(1): finish the game-like experience | partly | As in section 3 |
| 7(2): creation's skills, background and spells made clear and useful | deferred to M21 | reg FH-12 ("no completion recorded"). Small steps: 8acb9314, E166, E168 |
| 7(3): real journeys and independent agents | fulfilled | honest-start; rounds 7–9 |
| 7(3): a cheap public-action gauntlet | **outstanding** | reg TC-07 (home "M20 close") |
| 7(3): implementation, automation, agent and human kept apart | fulfilled | Log states; handoff status line |
| 7(4): consolidation (overlapping tests, obsolete UI paths, the loop measured, stale docs) | **outstanding** | reg TC-06 (no record) |
| 7(5): a bounded, current authoring trail | partly | doc/authoring/trail, ten pages (7f7eb928, becaf6e3). reg AU-01 "in progress". No evidence that superseded guides are marked |
| 7(6): one app on main | fulfilled | — |
| 7(7): an honest handoff with an M21 list | fulfilled | handoff.md parts 1–4 |
| 8: land the work on main and verify the deploy | partly | CI green on d0c279cb (handoff, closing note). No agent played the Pages build (E134: served locally) |
| 8: round 6 | fulfilled, by agent play | cold/round-6 |
| 8: why the silver walker meets so little danger | partly | E100, E105 count frequency apart from balance. No write-up (reg CB-08) |
| 8: bounded first-hour danger | partly | Rovers (E105, test/rovers). CB-08 still open |
| 8: walkers as a recurring, recorded diagnostic | **outstanding** | reg TC-07 |
| 8: the register reconciled; cleanup | partly | open-register.md. Stale rows: see section 8 |

## 5. The owner's notes of 11 November

| Note: commitment | Status | Evidence or gap |
|---|---|---|
| Map panel: eyebrow, short title, context, particulars, short action; Explore nearby only where real | fulfilled, by spec | 30d497f8 (test/map-browser, test/support/map-card). The log's open queue item 1, reg NM-02 and owner directive #3 still call it open. No render with long names or several actions found |
| Map panel: hex crossing as a structured property, in a diagnostic view | partly | Journey glyph only (E108). reg NM-05, M21 |
| Map panel: kits | deferred to M21 | reg US-14; fwd inventory #38 |
| Startup: the title's flash and reset | fulfilled, frame by frame | E106 (1deb7d59) |
| Startup: the iPad freeze (real progress, yield, saves kept) | partly | E107 (a568a73e). Measured in Chromium, never on an iPad (reg SP-05). The start itself: SP-01, M21 |
| Startup: place icon whose accent aggregates the known aspects | fulfilled, by code reading | The glyph was superseded by the strict-colour note (no glyph in the title). The accent aggregates (web/reader/stage/place-mark.tsx). No spec |
| Companions: coral, only for a real recruitment | fulfilled, by spec | E108 (b07f456a) |
| Companions: OKLab compounds; travel glyph; faint ≠ dim | fulfilled | E108, E109, E187 |
| Companions: one-node signal; same world, two reaches | fulfilled, by spec | test/companion-sensed. The reach is granted in the test: Gregarious is not in the game (reg AP-06, M21) |
| Strict colour: one indicator; neutral surfaces; no duplicates; soft pip; no glyph in the title | fulfilled | E109 (fa7e8802); E127, E130 (no coloured borders) |
| Strict colour: before-and-after screenshots (one facet, several, neutral) | no evidence found | Not in the repository |
| Action projection: targets named | partly | E119 (`GlanceStage.whom`). The loaf's lost name not traced (reg AP-10) |
| Action projection: no meta labels; compounds flattened; natural phrasing | fulfilled, by spec | E119 (test/action-flat) |
| Action projection: the Eye as a deliberate search | deferred to M21 | E120 assessed; reg AP-09 |
| Headless: find the real bottleneck; a bounded cut | fulfilled | E121 (21b9ecec); dec514db tried by A/B and reverted |
| Headless: integrate the branch, leave nothing divergent | fulfilled, by commit | 672026c7. `investigate/headless-rpg` is an ancestor of HEAD |
| Headless: typed projection over label heuristics | partly | E123, E131. reg AR-05, M21 |
| Headless: PlayerHost facade | deferred to M21 | reg AR-06 |
| Headless: parity test | partly | E122 (test/client-parity). No fight: reg PR-05 (§13), M21 |
| Acceptance A1: routes traced by their whole ordered path | partly | E126, E132. Junctions: NM-01, M21 |
| Acceptance A2–A3: safe zones incl. creation; school page without internal scroll | fulfilled, by spec and walk | E125, E128, E130. E125's walk script, frames/safe.js, is scratch only |
| Acceptance B1–B5: the rat aim kept; gold after; one outcome; short aims; no nested borders | fulfilled, by spec | E124 (test/aim-successor), E135 (test/nest-aim), E127 (test/fight-told-once) |
| Acceptance B6: one replay, headless and rendered at narrow sizes, all agreeing | **outstanding** | Only in reg "owner directives possibly unmet" #9, with no row id |
| Safe overlay drawn from the layout's own geometry | fulfilled, by spec | E130 (`?safe`, test/support/safe-zone.ts) |
| "Enter [town]", with perceived aspects only, not crowded out by the gold | fulfilled, by spec | E129 (test/town-entry). A site in the company's own hex: NM-04, M21 |
| Before closure: credible rendered routes; marrowby explained | partly | E132 (four cases explained). NM-01, M21 |
| Before closure: map labels stay selectable | fulfilled, by spec | E130. Crowding on a phone: NM-03, open |
| Before closure: a bounded parse improvement | fulfilled | E121 |
| Before closure: typed combat end and aim identity; `Narration.ends` replaced | fulfilled | E131; text-inference.md. No `Narration.ends` left in src/ or web/ |
| Before closure: review the branches carefully | fulfilled | integration-first-steps.md; reg §17; handoff part 5 (great-hamilton superseded) |
| Before closure: round 7 on the deployed build | partly | E134: main's commit, served locally (Pages was queued). reg FH-02 says "Done" |
| Before closure: human acceptance; closure kept apart from acceptance | outstanding / fulfilled | FH-01 / the handoff's status line |
| Atlas "now" (1)–(4): restrained atlas and place line; town entrance; trustworthy gold; safe zones | partly | E109, E129, E130, E153, E154, E173. Gold still off the aim in places: reg R9-09, §19 PR-01 |
| Atlas "now" (5): verify character-specific perception in real play | **outstanding** | reg AP-12 (no record) |
| Atlas "now" (6): contradictory styling and high-risk heuristics removed | partly | E109, E123, E131 |
| Atlas: full, faint, dim and silver as projected engine states | deferred to M21 | reg AP-02 |
| Forward: six directions and the 39-item inventory recorded | fulfilled | fwd A–F, the inventory |
| Forward: integrate the authored adventure branch | partly | Verified, not merged. R81 and R82 taken (AB-01, AB-02). AI-01..07 wait on the owner (reg §17) |
| Forward: three narrow prototypes, concept apart from feasibility | fulfilled, by spec | test/entity-card, test/serve, test/prospects; fwd "the shared interface" |
| Adventure → career: direction only | deferred to M21 | ../2026-11-11-adventure-to-career.md (4105e94d); reg FH-03, US-14, CP-12, UI-17 |

## 6. 12 November: the golden thread and the cutoff

| Commitment | Status | Evidence or gap |
|---|---|---|
| Gold only after Follow this; none followed, no gold; Follow this lighter | fulfilled, by spec | E153 (test/gold-follow) |
| One primary next step, recomputed after every act | partly | E154, E173 (test/gold-thread). Two golds at once, gold on the way out: reg R9-09, M21 |
| Never loop; never a spent waypoint | partly | E146, E163 (test/gold-walk). The gold survey: 10 of 13 (a scratch tool) |
| A place known by report gets an intelligible approach | partly | E54. reg R7-04, left to the owner |
| Moving within a hex must not leave the place | fulfilled, by probe | E155. No spec; not seen rendered |
| Hex crossing a distinct transition | partly | Journey glyph (E108) |
| Route preview before committing | partly | reg §19 PR-03: not reproduced headlessly; no rendered check recorded |
| Every pip traces to an act | fulfilled, by spec | E156, E183, E185 (test/signal-inside, test/teaches-marked); the signal census (6d3d0e79) |
| Coherent Common-language names | deferred to M21 | reg §19 PR-06 (a rule proposed, not applied) |
| Creation order; a physical pack | deferred to M21 | reg §19 PR-07, at the owner's word |
| Cutoff: stabilize the opening | partly | Not one round was clean (handoff) |
| Cutoff: verify the adventure integration | fulfilled | integration-first-steps.md |
| Cutoff: paired playtests; recurring P0s fixed; P1s recorded | fulfilled, by agent play | Rounds 8–9 (E158, E172); E173; reg §20 |
| Cutoff: placement and density censuses | fulfilled | census-2026-11-12.md (9d15bd1c, 6d3d0e79) |
| Cutoff: durable evidence (seeds, traces, outcomes, performance) | partly | Round 8 M's and round 9's seeds not kept. Some evidence is scratch only (the last section) |
| Cutoff: houseclean, nothing destructive | partly | handoff part 5. Stale documents remain (section 8) |

## 7. The owner's message of 12 November, early

| Point | Status | Evidence or gap |
|---|---|---|
| 1. A likeness's colour leads to the actual act | fulfilled, by spec | E183, E185 (test/signal-inside); 6d3d0e79. A human has not seen it |
| 2. Gold's strict semantics | partly | E153, E180, E185. R9-09 open |
| 3. Up to four meaningful acts across the scene | fulfilled, by spec | E184, E186 (test/glance-menu). People led with are still capped (handoff) |
| 4. Attention lenses, as an M21 idea | deferred to M21 | fwd §G |
| 5. Restraint: silver, neutral and dim told apart | partly, rendered by the builder only | E187 (dim said), E188 (no ivory edge read as silver). No spec; not in the register |
| 6. World time apart from presentation | deferred to M21 | fwd §H |
| 7. Ordinary life and related ideas | deferred to M21 | fwd §I–N |
| 8. Disciplined closure | partly | Censuses rerun; this audit; handoff updated to E188. A round 10 (R, S) seems to be running in scratch (/var/tmp/kyrie/m20/cold10, since 04:24). No report filed yet |

## 8. Evidence sampled, and register accuracy

**Checked and true:**
- 56 spec files the log and handoff cite exist under test/ (e.g. gold-follow, gold-thread, signal-inside, glance-menu,
  town-entry, safe-zone-browser, route-weave, client-parity, companion-sensed, perceived-differently).
- Ten cited commits exist, with subjects matching their rows (306e9a0e, fb622d59, 79c26bdf, 1deb7d59, 16229567).
- E184's spec was updated as the row says.
- `investigate/headless-rpg` is merged.
- `test:honest` exists in package.json.

**Not checked:** whether a spec "fails on the old code" (route-weave, gold-walk). Running specs was out of scope.

**Register defects:**
- **NM-02** (map panel) says Open, but 30d497f8 did it.
- **TC-01** says Open, but f33df419 rebalanced the shards.
- **FH-02** says round 7 was "Done" on the deployed build; it was served locally.
- **"Owner directives possibly unmet"** (written 11 November) is stale in #1, #2, #3 and #7.
- **The ids PR-01..PR-09 are used twice**: in §13 (persistence) and in §19 (the owner's report). So "PR-03" and
  "PR-06" each name two different rows.
- **The log's "Open queue (11 November, late)"** still lists the map panel.

## Omissions that matter

These commitments are neither done nor recorded anywhere as outstanding or deferred:

1. **Combat as a mode of the scene** (amendment 6 E, amendment 7(1)).
   - The fight is still its own page.
   - Not built: a tactical foreground (attack, the abilities and spells that apply, a manoeuvre, a retreat) and
     readable passages from exploration to threat, parley, fight and aftermath.
   - Register CB-12 covers only "legible at a glance".
   - The handoff's part 2 lists only balance.
2. **Silver leads on the map** (amendment 6 F, the atlas synthesis). Nothing shows the map offering silver leads for
   exploration, and no row holds it.
3. **Restraint in the atlas has no test** (the owner's point 5; the strict-colour note's before-and-after shots).
   - Silver, neutral and dim are told apart only by the builder's renders (E187, E188).
   - No screenshot set, no spec, no row.
   - Silver (#D7DBE4) sits close to the neutral greys.
4. **Evidence kept outside the repository.**
   - In /var/tmp/kyrie/m20, not in the repository:
     - the gold survey (the 10-of-13 claim);
     - E125's creation walk (frames/safe.js);
     - the safe-zone shots;
     - the probes E155, E179 and R9-13 rest on.
   - The handoff cites these as reproducible.
   - No row says they live in scratch. They would be lost if it is cleared.
5. **Acceptance defect B6** (one combined replay through the headless projection and the rendered screen, at narrow
   sizes).
   - Named only in the register's prose list of possibly unmet directives.
   - It has no row, no home and no owner, so it will not be carried.
6. **The deployed build was never played by an agent** (amendments 3 and 8; before-closure §6).
   - Every cold round was served locally.
   - FH-02 records round 7 as done, so the gap is hidden rather than recorded.
7. **Silent closures.**
   - Two commitments were done but are still recorded as open: NM-02 (map panel) and TC-01 (shards).
   - Others are recorded as done without their remainder: FH-02.
   - The register's directives list (11 November) and the log's open queue are stale.
   - So M21 would start from a misleading list unless they are corrected.
