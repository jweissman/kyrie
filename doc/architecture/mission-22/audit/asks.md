# Owner asks against the register, missions 18 to 22 (audit, 17 November 2026)

The owner, 17 November: "review past owner asks from this and the previous few missions to see that everything has
been translated into a register item … both to see how we're doing overall burning down past items, but also to make
sure they correspond to what was actually asked and started to be built."

Read at `99ea0c8d`. The register was not edited. New rows and corrections are proposed in §6, ready to paste.

## 1. Sources and depth

**Sources:**
- the owner's words as kept in memory notes: `m18-owner-*`, `m19-owner-*`, `m20-owner-*`, `m21-owner-*`,
  `m22-owner-*`, `owner-*`, `mission-22`, `feature-pins`;
- the verbatim briefs in the repository:
  - mission-22/{boredom-brief, feature-pins-brief, world-brief, sites-brief, career-brief, phases-abc-brief,
    sensory-narration-brief}.md;
  - mission-21/owner-*.md.

**Against:**
- doc/architecture/open-register.md, 698 rows by `bun scripts/register-state.ts`;
- `register-held` and `register-tickets`;
- features.json;
- the code and specs.

**Depth by mission. Not every ask was read at the same depth:**
- **M22 and M21:** every ask was enumerated from its source and matched to rows by id and text.
- **M20:** item by item from the notes, using the M20 briefs audit (doc/history/missions/20/briefs-audit.md, 12 Nov)
  for the mapping.
- **M19 and M18:** at the level of each owner note. Their rows were carried id by id into M19's inherited ledger and
  then into the consolidated register (doc/history/findings/index.md). The M22 obligations audit (16 Nov, §3)
  checked by script that every UNT and BRF row is cited. I re-checked a sample by grep and in the code (§2.4).

**Earlier audits this one builds on:**
- doc/architecture/mission-22/obligations-audit.md (16 Nov): M17–M21. Its findings became OB-01..15.
- The M20 briefs audit.

This audit does not repeat them. It starts where they stop: the asks of 16–17 November, and the rows they made.

## 2. The asks and their rows

### 2.1 Mission 22 (16–17 November)

| # | Ask (source) | Row(s) | Text faithful? | State checked |
|---|---|---|---|---|
| 1 | The first fifteen seconds and the act of choosing (M22 brief) | OR-01..53, OB-05 | yes | partly, as rows say |
| 2 | Substantial early sites (sites-brief) | SI-01..08 | yes | SI-02 fixed: region-undertown.ts:75 `plan.buried` |
| 3 | Creation squashed; ring on rows; short press; rough sky (16 Nov late) | OR-14..17 | yes | OR-14 held by composed-creation-browser |
| 4 | World-map routes chaotic (16 Nov) | OR-35 | yes | fixed |
| 5 | Held presses unpredictable (16 Nov) | OR-36 | yes | fixed, no spec named |
| 6 | White flash, long wait before the mark (16 Nov) | OR-37 | yes | partly |
| 7 | One page template, no stray action items, enforced mechanically (16 Nov night) | OR-38 | yes | test/action-census-browser |
| 8 | Phone: no reticle; the fill finishes early (17 Nov morning) | OR-54 | yes | fixed |
| 9 | The atlas mark changes height | OR-55 | yes | fixed (row.css) |
| 10 | Rows beyond four; Trade as a scroll list; "Set out now" | OR-56 | yes | fixed |
| 11 | A lens's icon on its items; pips are the engine's | OR-57, OR-68 | yes | fixed |
| 12 | Gold on the map's markers and labels; destinations as acts | OR-58 | yes | fixed (PlaceFacets) |
| 13 | Play dull: hooks don't onboard, no way to unlock verbs or do the mundane | OR-60 | yes | partly |
| 14 | Global assertions, not one-off fixes (facet ⇒ map; lens ⇒ item; ≤ 4 rows; riddle focused) | OR-55..59, TB-02 | carried as one row per assertion; no row for the principle | the census `crowded` holds ≤ 4 |
| 15 | A riddle focused as an act, never paged | OR-59 | yes | web/reader/stage/lens-focus.ts, test/small/lens-focus. **Page only**: runner and terminal still page (threads.md §4) |
| 16 | Too much text selectable (17 Nov afternoon) | OR-61 | yes | reader.css:15 |
| 17 | Map: "View [place]"; one white outline | OR-62 | yes | map-menu.tsx:73-77 |
| 18 | Interrupted on the map: put it away, red for violence | OR-63 | yes | map-menu.tsx:79-89 |
| 19 | A starting mage dies too easily; the giver should warn | OR-64 | yes | Outmatched.warning, test/outmatched |
| 20 | The title's continue line is strange | OR-65 | yes | partly |
| 21 | Career commission: royal posting → dragon → knighthood → game-warden (career-brief) | CR-01, CR-02 | yes | partly (phase 1) |
| 22 | A lens's companion icon is a broken promise (17 Nov evening) | OR-68 | yes | fixed |
| 23 | Narration too long; it piles up and repeats | OR-69 | yes | partly |
| 24 | The sign's sky not majestic | OR-70 | yes | open |
| 25 | Sensory narration (sensory-narration-brief) | SN-01..05 | yes | open |
| 26 | Boredom as a first-class defect (boredom-brief) | BO-01..10 | yes | partly |
| 27 | **Remove the origin-quest pick; diegetic starts** (boredom-brief) | **none** | (none) | done in code: creation-flow.ts:74 filters `why`; `circumstance()`. No row, no spec named, and `--origin` remains in 12 tools (threads.md §10) |
| 28 | **Phase 1 not done until several positive cold plays in a row** (boredom-brief) | **none** (CL-01 is one report, 6/10) | (none) | open |
| 29 | Feature pins over table stakes (feature-pins-brief) | not a row by design: test/features, feature-pins.md | yes | 26 features: 1 met, 2 partly, 1 missing, 22 unwritten |
| 30 | World health; strategic atlas (world-brief) | WD-01..15 | yes | open/partly |
| 31 | Setting/framework boundary (boundary-brief) | BX-01 | yes | partly |
| 32 | SRD proving cases | SR-01 | yes | partly |
| 33 | Phase A §1: the studio mark cut off (phases-abc-brief) | PA-01 | yes | fixed |
| 34 | Phase A §2: creation flickers | PA-02 | yes | partly |
| 35 | Phase A §3: names too shallow; family identity | PA-03 | yes | partly |
| 36 | **Phase A §4: creation as an entry into the encyclopedia** | **none** | (none) | not begun |
| 37 | **Phase A §5: a contract for dual presentation and input (an instrument operable as its row)** | **none** | (none) | not begun |
| 38 | **Phase A §6: a compass that unlocks verbs** (a later proof) | **none** | (none) | not begun |
| 39 | **Phase A §7: Sending and contact abilities** (a study) | **none** | (none) | not begun |
| 40 | Phase A §8: households and lineages | PA-08 | yes | partly: test/household-kept |
| 41 | **Phase B: testing audit, adventure contracts, checkpoint branching, journey specs reused in the browser, studio evidence, an authoring convention** | **none** | (none) | not begun |
| 42 | **Phase C: the atlas of actions (diversity-aware promotion, five-colour lenses, social influence as an aspect, an intent-verb taxonomy, three forms of agency, a playable proof)** | **none** (PB-18 touches §D) | (none) | not begun |
| 43 | **A headless intent runner (17 Nov, this audit's commission)** | **none** (AR-06 and TB-01 are adjacent) | (none) | proposal: intent-runner.md |

### 2.2 Mission 21 (13–16 November)

| # | Ask (source) | Row(s) | Text faithful? | State checked |
|---|---|---|---|---|
| 44 | Cut test and CI time; e2es to invariants (m21-owner-tests-and-rail) | TC-02, LC-04 | yes | TC-02 closed (push lane) |
| 45 | The rail stays icons, never words (same note) | none: a standing constraint | (none) | held: TP-09 and OR-42 keep marks |
| 46 | Continuity: lenses in-scene, a compass inside, one action system (owner-continuity) | CN-01..08 | yes | CN-07: test/small/person-aspects |
| 47 | The first minute as one instrument (owner-first-minute) | IG-01 | yes | fixed (a critique delivered) |
| 48 | Two gates: Gate 1, blind agents; Gate 2, human (owner-two-gates) | OB-05, FH-01 | yes | open |
| 49 | Performance retrospective, harness kept apart from runtime (owner-m21-not-closed) | none needed | (none) | delivered: mission-21/performance-retrospective.md |
| 50 | Four focused investigations: compiler, command/query, Kyr/Deem, setting | AX-03, AX-04, AX-07, AX-08, BX-01 | yes | open |
| 51 | Review M21 against its commission (owner-m21-consolidation 1) | none needed | (none) | delivered: obligations-review-15-nov-late.md |
| 52 | Scaling over 0/100/1k/10k facts (consolidation 2) | none needed | (none) | delivered: performance-report.md §3 (scale-costs) |
| 53 | Repair creation, targeting, navigation, continuity, atlas, terminal, prose (consolidation 3) | many (OP-05, CO-*, BL-*, EX-*, PF-*) | yes | mixed |
| 54 | **Creation: big cards for calling and ancestry *only*; the rest rows** (consolidation 6; owner-p0: "calling and ancestry keep substantial treatments") | OR-42 | **no: reversed** | OR-42 made ancestry and calling rows too, citing a review (review-43697c8a), not the owner |
| 55 | **Commoner the default first and always available; Aristocrat a later unlock** (consolidation 6; restated in Phase C §E) | **none** (OB-03 has only "a career rule for the commoner") | (none) | not met: `commoner` is not `playable` in data/catalog/classes.json, so creation never offers it |
| 56 | The sign as an observatory or a starfield answering focus | PB-08, OR-17, OR-70 | yes | partly |
| 57 | Experience pins: variety, continuity, prose, identity, payoff (owner-experience-pins) | PF-*, EX-*, TB-06 | yes | partly |
| 58 | **Six experiential-pin families** (owner-experiential-pins-families) | §41 | **partly**: §41 has rows for families 1 (PF) and 6 (LC) only | families 2–5 are carried elsewhere (DN, EX/PB-16, BO, RI-03) without saying so |
| 59 | **Middle scale inside a hex** (owner-middle-scale-hex) | OB-03 | **bundled** with four other asks in one P3 row | not begun |
| 60 | **Books and practices as instruments: bestiary progress, imperial law, cartography, cleric Clarity** (owner-books-practices-instruments) | OB-03 | **narrowed**: the row says "almanac" | not begun |
| 61 | Kyr compiler investigation (owner-kyr-compiler-investigation) | AX-03 | yes | kyr-compiler.md delivered; AX-03 open |
| 62 | Empty words as an obstacle (empty-words-obstacle) | DN-01..05 | yes | partly; test/small/clause-load ratchet |
| 63 | P0: a mage cannot target (owner-p0-magic-targeting) | OP-05, FH-11 | yes | fixed: Spellcasting.slotFor, test/small/mage-casts |
| 64 | Casting fiction (owner-casting-fiction) | CF-01..05 | yes | CF-02 and CF-03 fixed |
| 65 | Headless pull review (owner-headless-pull-review) | HP-01..07 | yes | HP-07 fixed: kyrie.ts:113 |
| 66 | Playback notes 1–10 (owner-playback-nov15-night) | PB-01..10 | yes | PB-01 fixed (NewsFold) |
| 67 | The map as an instrument; one grammar (owner-map-instrument-wander) | PB-17 | yes | fixed |
| 68 | **A Wander policy** (same note) | OB-03 | **bundled** | open; the intent runner's `explore` (intent-runner.md) |
| 69 | The intent catalogue, one pin per family | PB-18 | yes | open: the discovery family has no pin |
| 70 | The test ladder, lanes A–E (owner-test-ladder) | TC-06 (superseded by it) | yes | delivered: test/lanes.json |
| 71 | Paragon pins: mount, familiar, flaming blade, favour | OB-03 (familiar), OB-07 (kind) | partly | pins in test/small/pin-* |
| 72 | Verb pins: Alchemist, Befriender, Commander, Landholder, Eye | PV-01..05 | **PV-01, 02, 04 stale** | pins exist: test/small/alchemist, befriender, commander |
| 73–82 | Terminal ideas, planar tour, terminal as instrument, title and onboarding, a place to return to, first fifteen, terminal playable, purposeful exploration, owner's continuity, judgment not gates | §26–§31, §38–§40 (TM, GT, TB, TO, RI, EX) | yes | mixed, as rows say |

### 2.3 Mission 20 (10–12 November)

Mapped through the M20 briefs audit and checked against current rows.

| # | Ask (note) | Row(s) | Faithful? |
|---|---|---|---|
| 83 | Acceptance defects: routes, safe zones, the school gradient, undertaking state | NM-*, UI-*, T24-*, US-* | yes |
| 84 | Action projection: named targets, no meta labels, flat compounds, the Eye, natural phrasing | BP-08, AP-07, PB-02, RI-02, AP-10 | yes |
| 85 | Atlas synthesis | AP-01..17 | yes |
| 86 | Before closure: credible routes, labels, parse, heuristics, branches, acceptance | FH-02, SP-01, AR-05, AI-* | yes |
| 87 | Companions and perception range | AP-06 (deferred), OB-10 | yes |
| 88 | Continue to closure (amendments 7, 8) | FH-*, CB-* | yes |
| 89 | Cutoff (process) | none needed | (none) |
| 90 | Environment pass: a stately home and an ancient ruin | none needed (fulfilled E50) | (none) |
| 91 | Forward directions A–F (not commissioned) | none by design (forward-design.md) | (none) |
| 92 | Golden thread (P0) | OPR-01 | yes (P0 partly) |
| 93 | Headless investigation: PlayerHost facade, parity | AR-06, TB-01, AR-05 | yes |
| 94 | Land and handoff | none needed (delivered) | (none) |
| 95 | Map panel and hex vocabulary | NM-02 | yes |
| 96 | Retrospective brief | none needed (delivered) | (none) |
| 97 | Safe overlay and town entry | T24-08, NM-* | yes |
| 98 | Scene-first opportunities A–H (amendment 6) | R10-*, FH-*, AP-* | yes |
| 99 | Startup and place icons | SP-01, the place mark (fulfilled, no spec) | yes |
| 100 | Strict colour grammar | PB-23 | yes |
| 101 | **Adventure → career, §2–8** (owner-adventure-to-career) | US-14, UI-17, FH-03 | **bundled**: seven directions in one deferred row (US-14). Acceptable as a direction, but none can close alone |

### 2.4 Missions 18 and 19 (29 October – 9 November), at note level

**How these are carried.** Every M18 note was registered as OWN-xx in M18's register (430 rows, 383 fixed at close).
Open rows went to M18's wishlist, then M19's inherited ledger (145), then the consolidated register, which cites
M19-xxx 138 times, BRF 73 times and UNT 74 times. The 33 M19 notes are carried the same way through M19's register
(95 rows) and its inherited ledger.

**Spot checks** (asks 102–138, the 37 notes: 7 of M18, 30 of M19 with its process audit and the 7 November rulings):

| Ask | Row | Code |
|---|---|---|
| M18: philosophers' conversations | OWN-06, fixed in M18; TS-01/02 restate the debate today | |
| M18: PC sex chosen at creation | the `you` and `presenting` steps exist | creation-flow.ts:22 |
| M18: Common names through `languages` | NP-12, deferred P3 | |
| M18: one universe of planes, one House of Doors | GT-01..03, CP-11 | |
| M18: map-first navigation | carried through NM-* | |
| M19: organisms.json retired | | gone from data/ |
| M19: a bestiary report | | src/cli/bestiary-report.ts |
| M19: dragon breath and save vs breath | | src/rules/daily-uses.ts |
| M19: the coherence chain (7 Nov) | US-07 (PD-08), OPR-01 | |

The coherence chain's second worry ("our tests hold privileged knowledge … the player lacks") has no row of its
own. honest-player and the runner are the partial answer. The intent runner (TB-11 below) is the full one.

**The oldest thread still live** is PD-08 (knowledge records: heard, lead, undertaking, route), named in the M18
obligations review of 6 November. It is now US-07, P1, partly.

## 3. Findings

**In numbers.** 138 asks were listed. 43 are M22's, 39 M21's, 19 M20's, and 37 are M18 and M19 notes. Of
these:
- 10 asks have no row;
- 8 rows, and the §41 section, misstate their ask;
- 0 fixed rows were found without their fix, of 18 checked. 49 fixed rows name no spec.

### 3.1 Asks with no row: 10

- Diegetic starts (#27): done in code, unregistered.
- The phase-1 cold-play gate (#28).
- Phase A §4 (#36), §5 (#37), §6 (#38) and §7 (#39).
- Phase B (#41).
- Phase C (#42).
- The intent runner (#43).
- Commoner first and Aristocrat later (#55).

Phases A–C are the owner's brief of 17 November, night. They are the newest, so they may simply not have been
registered yet.

### 3.2 Rows that misstate their ask: 8 rows, and one section

| Row | What is wrong |
|---|---|
| **OR-42** | Turns ancestry and calling into rows. The owner had asked twice (15 Nov) that they keep big cards or "substantial treatments", and Phase A §4 (17 Nov) wants them richer still. The row cites a review, not a ruling. Wants the owner's word |
| **OB-03** | Five asks in one P3 row (Wander, the commoner's career, familiar scouting, focus as engine state, the preservation asks). Its "almanac" narrows the books-and-practices ask (bestiary progress, law book, cartography, Clarity). None can close alone |
| **PV-01, PV-02, PV-04** | Say open and "missing". mission-21/verb-pins.md says the Alchemist, Befriender and Commander are pinned, and test/small/alchemist, befriender and commander exist |
| **CN-09** | Fixed as "a beat that is no act goes on by itself once read". The owner's 16 Nov night ruling (OR-33, ef2160b2) has every opening page go on by a held Continue, "no auto". Superseded, not fixed |
| **OR-26** | The fix cites `name-step.tsx`, which is gone. The summary is now CreationFlow (web/engine/creation-flow.ts:156) |
| **US-14** | Bundles adventure → career §2–8 into one deferred row |
| **§41** | Titled "by family" but carries two of the six families |

### 3.3 Fixed rows whose fix can't be found: 0 of 18 checked

`register-held`: of the 247 game rows read as fixed, 198 name a spec that exists and **49 name none**. Of those 49, 18
were checked by hand:
- OR-02, OR-03, OR-04, OR-14 and OR-61 name specs the script does not recognise (`fight-geometry-browser`,
  `talk-numbers`, `composed-creation-browser`) or CSS. The script under-reads browser specs named bare.
- CO-02, CO-06 and CO-07 are fixed in data or code, with no spec:
  - data/origins/lost/origin.kyr:15-21;
  - src/narrative/obituary.ts ("from its first day");
  - data/kits/raider-hold/hobs/folk.kyr:236 (the Gaffer's ten coin).
- IG-14 (title-page.tsx `Motes`), TP-01 (terminal-mode.ts:9), TP-04 (data/voice/instruments.json), SI-02, AX-09 and
  PB-27 hold as stated.
- CN-09 and OR-26 are the misstatements of §3.2.

None was a claimed fix with nothing behind it. The 31 unchecked rows remain unheld promises, and CO-02/06/07 are
the cheapest to pin.

## 4. Burn-down

**By section, as rows opened in that mission.** Kinds as register-state reads the status column.

| Opened in | Rows | Closed (fixed, duplicate, decided) | Live (open, partly) | Deferred / ambition |
|---|---|---|---|---|
| M20 and before, §1–24 (compiled 11–12 Nov from M16–M20) | 326 | 98 (67 + 25 + 6) | 187 (109 + 78) | 41 |
| M21, §25–50 (13–16 Nov) | 236 | 141 (130 + 10 + 1) | 91 (49 + 42) | 4 |
| M22, §51–54 (16–17 Nov) | 136 | 60 | 74 (41 + 33) | 2 |
| **All** | **698** | **299** | **352** | **47** |

**The register over time** (register-state at each revision; the script's reading changed on 16 Nov, OB-01):

| Revision | Date | Rows | Fixed | Open | Partly |
|---|---|---|---|---|---|
| 74de47a2 (M20 landed) | 12 Nov | 324 | 41 | 161 | 59 |
| 025ed83e (M22 begins) | 16 Nov | 545 | 156 | 198 | 104 |
| 99ea0c8d (now) | 17 Nov | 698 | 257 | 199 | 153 |

- **Inflow outruns resolution.** In five days the register gained 374 rows and closed about 216. Live rows went from
  220 to 352.
- **M21 burned down its own rows best** (60 % closed).
- **The rows inherited into §1–24 are the slowest:** 30 % closed, and 109 still open. Most of the old open rows are
  P2/P3, "M21" or "later".
- **Earlier missions, at their close** (doc/history/findings/index.md):

  | Mission | Rows | Fixed |
  |---|---|---|
  | M16 | 203 | 93 |
  | M17 | 289 | 216 |
  | M18 | 430 | 383 |
  | M19 | 95 (+145 inherited) | 71 (+15) |

**Live P0 and P1 now:** 94 (3 P0, 91 P1).

**Oldest P0:**
- **FH-01**, open. No person has accepted the first hour (PD-14, asked since M19).
- **OPR-01**, partly (12 Nov). The golden thread.
- **DN-06**, partly (14 Nov). The writing.

**Oldest P1, open since the 11 Nov compilation:**
- FH-03: the dense opening.
- AP-03: facets from Kyr.
- AR-05: text inference in the page.
- NP-01: prose against the moment.
- SP-02: eager instantiation.
- SP-05: no real tablet.

**Oldest P1, partly:**
- US-07 (PD-08, from M18).
- FH-05..08.
- CB-01..05.
- US-09, US-10, WM-01, NP-02, NP-03, AP-01, AP-07, SP-01.

## 5. What this says

- **Asks are registered fast and faithfully.** 30 of the 32 M22 asks before tonight's Phases brief and this
  commission have rows or need none. Every 17 Nov morning and afternoon note became an OR row the same day, and most
  were fixed that day.
- **The weak spots are elsewhere:**
  - **bundled preservation asks** (OB-03, US-14) that can never close;
  - **a lead's reinterpretation recorded as a fix** (OR-42, CN-09);
  - **stale states** after a pin landed (PV-01/02/04);
  - **work done but not registered** (diegetic starts).
- **Burn-down is real but outpaced.** M22's own rows close at 44 %, and the inherited §1–24 at 30 %. The owner's rule
  "burn down before surface" (2026-10-28) is not holding at the register level.

## 6. Proposed rows and corrections (ready to paste)

Every id below was grepped across doc/, test/, src/, web/ and scripts/ and is unused.
- PA-, OB-, TB- and AR- are placed by features.json `byPrefix` (PA → page-ui, TB → terminal, AR → architecture).
- **OB has no `byPrefix` entry.** OB-01..15 are placed one by one in features.json `rows`, and OB-16..20 need the
  same. Otherwise test/small/register-tickets fails.

**New rows, for §53 (`| Id | What | Status | Pri | When |`):**

```
| PA-05 | Creation as an entry into the encyclopedia: considering an ancestry or calling brings forward an illustrated reference (lore, attributes, capabilities, languages, culture) from the setting's own definitions, what the character may know kept apart from what the setting knows (the owner, 17 November, Phase A §4) | open | P2 | M22 |
| PA-06 | Dual presentation and input: an option drawn as an instrument (a card, the observatory, a compass, a dial, a map, a contact list) is operable as its row is, focus, consideration and commitment one state whatever the input; prove on the cards and the observatory, name the smallest shared primitives (Phase A §5) | open | P2 | M22 |
| PA-07 | A compass as equipment that unlocks verbs: set a known destination or bearing and consult it, what it tells bounded by what the character knows and what the kind can do; a later proof (Phase A §6) | open (a later proof) | P3 | later |
| PA-09 | Sending and contact abilities: choose an eligible person known to the caster, a remote exchange through the ordinary talk machinery, the NPC knowing how they were reached, no option opened by the channel alone; a study (Phase A §7) | open (a study) | P3 | later |
| PA-10 | Phase B: audit the testing arrangements; a small vocabulary of adventure expectations; checkpoint-based branching; journey specifications reused in the browser by the same public action ids; the studio regression with visual evidence; an authoring convention of six checks (fast mechanic, semantic snapshot, branch, persistence, headless spine, browser smoke) (phases-abc-brief, Phase B) | open | P2 | M22 |
| PA-11 | Phase C: the atlas of actions: diversity-aware promotion, the five-colour lens hypothesis, social influence as an aspect, a player-intention verb taxonomy (PB-18's catalogue is its start), three starting forms of agency, a compact playable proof (phases-abc-brief, Phase C) | open | P2 | M22 |
| PA-12 | Three starting forms of agency: a commoner first and always available, an adventurer with a calling, an aristocrat a later unlock (the owner, 15 November consolidation §6; Phase C §E). `commoner` is not `playable` in data/catalog/classes.json, so creation never offers it | open | P2 | M22 |
| OB-16 | Diegetic starts: the origin-quest pick removed in favour of a circumstance the world gives (the owner, 17 November evening, boredom-brief) | partly (17 Nov): CreationFlow.steps drops `why`, `circumstance()` picks the start (web/engine/creation-flow.ts:74, 90); open: the `why` step is still built and answered (lines 125, 190), `--origin` chooses starts the page cannot in 12 CLI and script places (PB-06), no spec names the absence of the pick | P1 | M22 |
| OB-17 | M22's first phase is done only when several cold-play reports in a row are positive (the owner, 17 November evening): a cold player has no code or register, plays a representative generated first hour, reports boredom and why | open: CL-01 is the first report (6/10) | P1 | M22, lead |
| OB-18 | Books and practices as instruments (the owner, 15 November): a bestiary's catalogue and the company's progress against it, a law book's query of the jurisdiction, a cartographer's survey count, a cleric's Clarity governing how far the followed aim's gold is perceived; declared in Kyr, derived by the engine, drawn by both clients. Split from OB-03, whose "almanac" stood for it | deferred (ambition): two tiny fixtures first, as the note asks | P3 | later |
| OB-19 | The middle scale inside a hex (the owner, 15 November): a gallery of existing hexes at local scale as a world-design instrument, and travel along a hex's own paths in minutes on one geography, movement system and clock. Split from OB-03 | deferred (ambition): one bounded experiment on an existing hex, if cheap | P3 | later |
| OB-20 | Wander (the owner, 15 November): a deterministic, authoritative exploration policy over known routes, routine rest and resupply, pausing at opportunity, never committing danger. Split from OB-03; the intent runner's `explore` (mission-22/audit/intent-runner.md) | open | P2 | M22 |
| TB-11 | A headless intent runner (the owner, 17 November): intents at a player's level ("pursue the aim", "talk to whoever would join", "go toward X", "rest until morning", "buy a light", "answer the riddle") resolved by the engine's projection into an act of the four, a lens unfolded, the book's aim followed, or a journey; each says how it resolved or which layer refused it; one resolver for runner, terminal and page (mission-22/audit/intent-runner.md; AR-06 adjacent) | open (design proposed) | P1 | M22 |
| TB-12 | One resolution from the glance to doable rows (Doable.of), replacing Runner.within/way/keyed, Terminal.led/way and AutoplayRun.led's `#talk` slicing (WD-15's talk/topic gap); `bin/kyrie serve` folded into the runner (checkpoint, resume, card) and retired (mission-22/audit/threads.md §1–2) | open | P2 | M22 |
| AR-20 | Interaction rules that live only in the page move into the projection: LensFocus (a riddle focused, OR-59), TalkFocus (a talk's salience), the map's danger hold (OR-63); the runner and the terminal still page a riddle and rank talk their own way (threads.md §4) | open | P2 | M22 |
| AR-21 | One route finder over `connects`: Journey.way, AimLead.way (ignores usability), ExpeditionContract.walk and Itineraries.plan reconciled behind one call with known/usable options (threads.md §5) | open | P2 | M22 |
| AR-22 | The engine imports the page: web/engine/creation-flow.ts and engine-creation.ts import web/reader/creation-rules.ts and words.ts; test support imports web/reader/talk-focus and menu-model; move them to src/presentation and forbid web/engine → web/reader by lint (threads.md §9) | open | P3 | M22 |
| AR-23 | Loose tools: seven per-adventure `scripts/*-transcripts.ts` that `kyrie transcripts` (eddf182c) was built to replace; test/support/cold-player.ts never imported since 4bcc957a; `?look=`, `?face=`, `?guide=quiet` experiments never decided (threads.md §7, §8, §14) | open | P3 | M22 |
```

**Corrections to existing rows** (replace the named cell):

```
OR-42  status → decided (the lead, 17 Nov, from review-43697c8a: one idiom for creation): ancestry and calling are rows (…as now…). Against the owner's 15 November asks ("big cards for calling and ancestry only"; "calling and ancestry keep substantial treatments") and Phase A §4: wants the owner's ruling; see PA-05
OB-03  what → Unregistered promises: a career rule for how a commoner becomes a warrior, cleric or mage; familiar scouting (test/small/pin-familiar-scouting, it.failing); focus as engine state and a controller. Wander is OB-20, the middle scale OB-19, books and practices OB-18, the commoner as a start PA-12; tarot and paragon journeys stay here
PV-01  status → partly (15 Nov): pinned, test/small/alchemist (`undiscovered` recipes, `knowsRecipe`, `experiment` in making.kyr; mission-21/verb-pins.md); open: the walk through the page
PV-02  status → partly (15 Nov): pinned, test/small/befriender (an animal as an escort, led, left and found again; the bond outlasts separation); open: an animal as a member of the company
PV-04  status → partly (16 Nov ruling 4): pinned engine side, test/small/commander (hold_here, call_on; orders grouped to the retainer); open: a group's order resolved in a conflict
CN-09  status → superseded (16 Nov night) by OR-33: the opening's pages go on by one held Continue, never by themselves (ef2160b2); what remains of 4b8ee734 is Told.pages
OR-26  status → (keep) fixed, with "name-step.tsx" read as web/engine/creation-flow.ts:156 (the summary is the engine's since PA-04)
US-14  status → (append) the directions it carries can close only apart: backgrounds unfolding in play, early companions, the company as a character, formation careers, individual careers, structural replayability; split when one is taken up
§41    intro → (append) Families 2–5 are carried by DN-01..05 (attention), EX-01..05 and PB-16 (continuity of intention), BO-01..10 (opportunity density), RI-03 and the feature pins (character differentiation)
§54    heading → the second "54." (line 1278) becomes "55."
```
