# The live defects by cause (25 November)

**The question:** which architecture or maturity work would retire the most true defects at once? AGENTS.md: "Common
blockers go in register-kinds.json's blockedBy. Prefer the maturity work that retires the most rows at once." Counting
by feature says where the defects are, not why they exist. This reading classifies each live row by its root cause.

**What was read.** All 415 rows `bun scripts/planning-instruments.ts defects` counted as live defects on main at
aa85de40a:
- every row's claim and the head of its status;
- the 39 P1 rows, and every page-ui, undertakings, travel, fight, prose, talk, atlas and terminal row, in full;
- a sample checked against the code and `git log` (§5).

The architecture steps are those of
[platform-separation.md](mission-22-beta/platform-separation.md): the fifth review's ten steps ("Seams or
authorities?"), its immediate queue, and the trust thread.

## 1. The headline

**Fewer than half of the 415 are defects.** By the register's own definition, a defect is an observed violation of a
claimed contract. Read that way:
- 187 are true defects;
- 228 are not: requirements (instruments and specs wanted, maturity stages, performance targets, commissions, and
  decisions owed by the owner) and directions (deferred M23 systems, creative studies, and Kyr forms or capabilities
  wanted).

217 of the 228 are reclassified in register-kinds.json (§4), 114 as directions and 103 as requirements, each with
its why. All of them lie outside the supported slice, whose gate is not narrowed. The other 11 are flagged here but
left alone, because each mixes a want with a real failure.

After the reclassification, the instrument reads **198 live defects: P1 31, P2 112, P3 55**, with 26 still in the
slice.

**The true defects come from a few causes.** Among the 187:

| Cause | True defects | P1 | In slice |
|---|---:|---:|---:|
| Client-side derivation: a second derivation, or a client's own workflow | 33 | 13 | 10 |
| Authoring contracts not enforced by Kyr's compiler or lint | 23 | 2 | 1 |
| Content thin or alike | 22 | 3 | 2 |
| Page layout and visual craft | 21 | 1 | 1 |
| Told text or a painting claims what the world does not hold | 20 | 3 | 3 |
| Rules, SRD and balance | 15 | 0 | 0 |

The remaining 53 are scattered among nine smaller causes (§2).

The architecture already planned retires the first cause and most of the second. The fifth cause ("said vs held") is
the largest one that no planned step addresses.

## 2. Causes, their rows, and the step that makes each impossible

The candidate causes from the brief are confirmed, merged or replaced as follows:
- "Player-facing meaning derived more than once" is confirmed, and merged with "the client inventing controls". They
  are one doctrine (the trust thread), retired in two steps.
- "Content stale after a rule change" was not found as a class of its own. Its instance, OR-423, is closed, and what
  is left is OR-533, under knowledge.
- "ScreenModel reading the whole campaign" is the mechanism behind several derivation rows. Taken alone, it has no
  registered defect.
- "Said vs held" is new: told text or a painting asserting what the world's facts deny.

| # | Cause | True defects | P1 | Slice | The step that makes the class impossible |
|---|---|---:|---:|---:|---|
| A | **A second derivation of player-facing meaning:** the runner, terminal, autoplay, review tool or page computes rows, a route, a mark, a step or a label itself | 18 | 5 | 5 | Fifth review step 1 and queue item 4: one row set and one frame per player revision, with the trust thread's "independent row derivations: zero" ratchet and AR-05's census (row OR-521) |
| B | **The client owns a workflow or invents a control:** a page disclosure, a focus model, a loading mode, a CLI-only start, the page's own journey course | 15 | 8 | 5 | Step 8, TB-09 activity by activity (talk, the fight hand, the map, endings, creation's circumstance), with the client-side workflow census (stage 1 of the order of work) |
| C | **Authoring contracts not enforced:** a placeholder left unfilled, a relation written and never read, a sold kind no rule reads, a name clash, a lead toward a talk that cannot end its aim, lint advice that cannot be taken | 23 | 2 | 1 | **New, widening step 5:** the compilation context as the binding authority, with one symbol table holding identities and spans (MT-26/AR-08's Stage 4) and typed vocabulary (MT-25), and lint written as queries over reads, writes and mentions |
| D | **Said vs held:** told text or a painting claims what the facts deny (lanterns lit in a sealed room, "hundreds" of two bats, a door locked after its key, the dead Gaffer, a windmill for the drove pens) | 20 | 3 | 3 | **New:** told from facts. Authored text refers to entities and their states rather than restating them; a said-vs-held census in the continuity census; paintings chosen by OR-442's metadata |
| E | Content thin or alike (one kit in every country, empty searches, flat treasure, stock talk) | 22 | 3 | 2 | Not architecture: OR-310's situation repertoire and the World stream |
| F | Page layout and visual craft (clipped, past the fold, under the menu column, contrast) | 21 | 1 | 1 | Not architecture: a geometry ratchet beside the contact sheet's contrast ratchet, and the one fixed frame (OR-382) |
| G | Rules, SRD and balance | 15 | 0 | 0 | The rules lane's proof slices |
| H | Prose and editorial | 10 | 0 | 0 | The editorial lane (PP-03's watchlist) |
| I | Atlas facets and promotion not inferred from what Kyr does | 8 | 2 | 2 | AP-03 |
| J | Performance | 8 | 5 | 5 | Queue items 1–3 and 6 (AX-04, AX-05) |
| K | **Attention not engine-owned:** a wait or journey passes what needs the player, rounds pass on one press | 7 | 1 | 1 | Steps 2–3: an engine-owned settled situation, with AX-05 through it |
| L | A missing engine capability inside a real failure | 7 | 0 | 0 | Each its own |
| M | **The knowledge door:** the player knows too much, or remembers too little | 4 | 0 | 0 | Step 6: the knowledge door as a capability boundary |
| N | Test tooling | 4 | 0 | 0 | Each its own |
| O | Identity and isolation (draws by install order, process-wide state) | 3 | 1 | 1 | Step 5 and OR-531, with an addition-invariance spec (OR-418's) |
| P | Layering | 2 | 0 | 0 | MT-16's ratchet |

**The rows of each cause** (P1 marked; † in the slice):
- **A, a second derivation:** AR-05 (P1†), BL-12 (P1†), OR-162 (P1†), OR-113 (P1†), TR-21 (P1†), PR-09, OR-166,
  OR-219, OR-515, OR-532, CL-37, TB-12, WD-15, GR-09, GR-12, GR-14, GR-15, NP-21.
- **B, the client's own workflow:** TB-09 (P1), TB-10 (P1), CL-53 (P1), OR-23 (P1†), OR-71 (P1†), OR-181 (P1†),
  CL-01 (P1†), OB-21 (P1†), UI-03, R10-14, PB-06, OR-141, OR-122, AR-20, GR-25.
- **C, authoring contracts:** OR-541 (P1†), MT-25 (P1), AR-13, AR-14, AU-15, R11-08, CF-04, SI-05, OR-235, OR-236,
  OR-402, OR-403, OR-404, OR-176, MT-21, AU-35, AU-36, AU-43, AU-46, AU-49, AU-52, AU-59, GR-26.
- **D, said vs held:** NP-19 (P1†), OA-14 (P1†), CO-19 (P1†), AP-08, NP-18, CP-04, CP-15, R10-10, T24-09, PL-29,
  OR-30, OR-46, OR-195, OR-218, CL-50, WD-13, GR-08, GR-21, GR-22, GR-23.
- **E, content:** R11-02 (P1†), FM-03 (P1†), CO-03 (P1), FH-12, FH-13, FH-14, NP-10, US-02, US-04, CP-03, CP-05,
  CP-13, R9-10, R11-06, DN-05, EX-05, SI-03, SI-06, CL-63, WD-17, WD-06, WD-10.
- **F, the page:** FH-07 (P1†), CB-11, NM-03, NM-08, UI-02, UI-04, UI-15, R9-11, T24-04, T24-06, OR-05, OR-17, OR-28,
  OR-31, OR-45, OR-49, OR-51, OR-67, OR-131, OR-512, FM-08.
- **G, rules:** FH-22, CB-06, CB-19, CB-24, CB-27, NM-09, WM-02, AU-16, AB-03, R9-13, R10-12, SI-04, OR-214, OR-410,
  BO-06.
- **H, prose:** NP-05, NP-06, NP-09, NP-16, R9-08, T24-26, HP-04, PP-06, AU-28, AU-50.
- **I, facets:** AP-07 (P1†), CL-31 (P1†), FH-04, AP-11, R11-04, PL-31, HP-06, CL-64.
- **J, performance:** OR-37 (P1†), OR-145 (P1†), OR-182 (P1†), OR-96 (P1†), OR-127 (P1†), SP-04, LC-01, OR-44.
- **K, attention:** OR-163 (P1†), AR-15, R9-05, PL-04, OA-06, FF-05, HP-05.
- **L, a capability:** FH-20, CB-15, CB-16, UI-14, WM-07, AU-06, AU-47.
- **M, knowledge:** OR-533, AP-13, R7-04, NM-07.
- **N, test tooling:** PR-10, MT-20, GR-13, GR-24.
- **O, identity:** OR-418 (P1†), AR-02, PR-04.
- **P, layering:** OR-542, AR-22.

**What the counts say about the planned steps:**
- **The knowledge door (step 6)** retires only four registered defects now: OR-423 is closed, and OR-533 is what
  remains of it. Its worth is noninterference, preventing the next leak (OR-534), not burn-down. It should not be
  ranked for burn-down.
- **The settled situation (steps 2–3)** retires the seven attention rows and two performance rows (OR-145 and OR-182,
  blocked by AX-05). It is chiefly the performance path.
- **ScreenModel pure (step 7)** retires no registered defect directly. It is the prerequisite of `kyrie-player`, and
  it makes cause A impossible to reintroduce.

## 3. The three recommendations

Ranked by the true defects each would retire, weighed by how mechanically it makes its class impossible.

### 1. One derivation: one frame per player revision, then TB-09 finished: 33 rows (13 P1, 10 in the slice)

This is the trust thread's own claim, borne out by the rows: clients deriving meaning is the commonest single cause,
and it holds the most P1s. It runs in two phases, each already in the plan.

**(a) One row set and one frame per player revision** (step 1 and queue item 4, OR-521): the runner, the terminal,
autoplay and the review tool read the frame's rows and stop grounding on their own. It retires:
- AR-05, PR-09, OR-166, OR-219, OR-532, TB-12, WD-15;
- GR-09 (a screen kept past its revision), GR-12, GR-14, GR-15 (a row's label and its outcome derived apart);
- CL-37 (a group told twice by two narrators);
- NP-21 (the Notes and the Story as two records, closed by the typed receipts of the trust thread's step 6).

That is 13 rows.

**(b) TB-09, activity by activity** (step 8): the page and the terminal keep no step machine, disclosure or control
of their own. It retires:
- TB-09, TB-10 and CL-53;
- OB-21 and PB-06 (a start the page cannot choose);
- OR-23 and GR-25 (the loading page, a fourth kind of screen with its own keys);
- OR-71 (the page's `<details>` disclosures, still at fight-stage.tsx:74, talk-stage.tsx:218 and 232, and
  prologue-stage.tsx:96);
- OR-181 (an enemy card's press, an engine row);
- OR-141 (three focus models);
- AR-20, UI-03, R10-14, OR-122 and CL-01;
- BL-12 (creation asking the trade the origin answered);
- OR-162, OR-113, TR-21 and OR-515 (the page's own JourneyCourse and MenuModel.travel).

That is 20 rows.

**What makes the class impossible:** the trust thread's ratchets on product paths: independent row derivations at
zero, frames per revision at one, and AR-05's text-inference census and a client-side workflow census held at a count
that only falls. Without them, each repair leaves the second derivation alive, as the trust thread warns.

### 2. Kyr's compiler as the binding authority: 23 rows (2 P1, 1 in the slice), about 18 still to do

This widens step 5's compilation context from isolation (vocabulary and local kinds passed in) to authority:
- one symbol table with identities and source spans (MT-26/AR-08's Stage 4, so that ModuleShadow stops rewriting text);
- typed vocabulary (MT-25's second half);
- the lint as queries over what each module reads, writes and mentions.

Each defect in cause C is then a query that cannot pass:
- **a placeholder left unfilled in a name or a text:** AR-13, OR-541 (the debt's "a purse for {creditor}", still at
  src/world/debt-shapes.ts:52);
- **an undeclared read:** MT-25's remainder;
- **a relation or kind written and never read:** OR-235, OR-236, SI-05;
- **an item spent by a bare Slay, its own attack never run:** CF-04;
- **a name clashing with a shared rule's:** OR-402, AU-46, the rest of AU-35;
- **an Objective toward a step no act can advance:** AU-15, and OR-176 (the reeve's empty talk led fifteen times in
  80 acts);
- **a topic conditioned on a state its aim has already ended:** R11-08;
- **an office read from words:** MT-21;
- **the same text twice in one room:** OR-404;
- **lines cut by the told budget unseen:** AU-52;
- **a wait past a deadline ending the book silently:** AU-49;
- **binding-check holes:** AR-14;
- **lint advice that cannot be taken:** AU-59 = OR-403;
- **keep's trace:** AU-43.

AU-35, AU-36 and GR-26 already have fixing commits (§4). The same mention query is the bridge to recommendation 3
(CO-19: a thing said and never placed).

### 3. Told from facts, said vs held: 20 rows (3 P1, all three in the slice), about 13 retired by mechanism

This is the largest class no planned step names. It extends the trust thread's "one source per claim" from marks to
narration and paintings, with three parts:

**(a) Authored text refers, never restates.** A description names a thing and its state by reference (the lantern, lit
or not), and the compiler checks the state word against the fact it names. It retires:
- NP-19 (the lit lanterns of a sealed room; the crypt door still locked after its key; the dead Gaffer speaking);
- NP-18 (a tame bear greeting while asleep);
- PL-29 (Edda told asleep on a step she has left);
- T24-09 (a dead foe's likeness in the next room);
- OR-195 (an onslaught told after the yield).

**(b) A said-vs-held census** in the continuity census:
- a told count against the group's size (GR-23: "hundreds" for two bats);
- a concrete noun said with no entity to take or look at (CO-19, CP-15, GR-21, CL-50).

**(c) Paintings chosen by asset metadata** (OR-442): OA-14, CP-04, OR-46.

Partly retired: OR-30, OR-218, WD-13, GR-08, GR-22, AP-08 and R10-10. This wants its own row and a short design note
before it starts. It is filed here as a recommendation, not a row, since it is a requirement and the brief adds only
defects.

**Close fourth:** the settled situation (steps 2–3, nine rows), already the head of the performance queue.

## 4. Misclassified, duplicate and likely fixed

### Not defects: reclassified in register-kinds.json

All 217 below lie outside the supported slice and are applied in register-kinds.json. Each entry records was "defect"
and its priority unmoved, and each why begins "25 Nov, the defects-by-cause reading".

**Directions** (114):
- **Deferred M23 systems:** CB-20, CB-25, CB-26, NM-14, AP-14, NP-08, NP-11, NP-12, UI-16, UI-17, US-12, US-13, US-14,
  WM-06, WM-08, CP-06, CP-07, CP-09, CP-11, CP-12, CP-16, CP-17, AU-13, AU-14, OPR-07, R10-01, OB-04, MT-07, MT-08,
  SN-05, TS-01, TS-02, TS-03, CR-01, CR-02, PA-07, PA-09, PA-10, PA-11, OB-18, OB-19.
- **Deferred as deliberate:** AU-30.
- **Called a direction, study or thread by its own words:** OR-85, AU-12, AU-29, AU-34, AU-41, ST-09, TB-07, WB-01 to
  WB-06, SN-01 to SN-04, OR-70, AP-16, CP-08, WD-01, WD-03, AB-07, AB-11, AB-12, AB-08, TO-05, NM-16, AU-44, AU-53.
- **A Kyr form or capability wanted, not commissioned:** AU-04, AU-07, AU-10, AU-11, AU-23, AU-24, AU-25, AU-31,
  AU-33, AU-39, AU-40, AU-42, AU-45, AU-51, AU-03, ST-05, OB-07, OB-11, CB-29, PB-21b, PA-05, PA-08, OB-20, WD-04,
  WD-14, WD-16, AB-06, RI-04, FF-01, US-11, WM-05, NM-10, AR-10, PR-06, NM-06, TR-22, AP-04, AP-05, OB-10, FH-19, TR-03.
- **No save-compatibility promise yet** (the standing ruling): PR-01.

**Requirements** (104):
- **An instrument, spec or document wanted:** FH-01, CB-28, NM-17, NM-05, AP-12, UI-19, US-16, CP-10, AU-01, PR-02,
  TC-03, TC-04, TC-05, TC-07 to TC-11, TC-13, TC-14, DC-03, DC-05 to DC-08, R10-05, T24-25, TM-04, TM-05, TB-03,
  TB-04, TB-06, OA-07, LC-04, OB-03, OB-06, OR-129, OR-180, OR-213, FM-09, PP-03.
- **A maturity stage or architecture risk:** AR-01, AR-03, AR-04, AR-06, AR-07, AR-08, AR-09, AR-11, AR-12, AR-16,
  AR-18, AR-19, AX-08, OR-66, BX-01, BX-02, MT-16, MT-26, MT-28, MT-29, OA-08.
- **A performance or size target:** AX-03, AX-06, SP-03, SP-06, T24-11, LC-02, LC-03, OR-170, OR-136, MT-27, PR-03.
- **A decision or ask owed by the owner:** OP-04, OPR-06, OR-10, OR-135, WB-07, IG-20, OR-118, OR-124, OR-138.
- **A commission, proving case or review recommendation:** OR-84, ST-06, ST-07, PV-01 to PV-05, CP-02, AI-06, AT-08,
  FF-03, OA-05, OA-09, OA-10, OA-11, CB-23, PA-06, UI-10, DN-02, PP-05.

**Flagged, left a defect** (each mixes a want with a real failure; to split):
- AU-08 and AU-09 (grab-bags with lints in them);
- AU-02, AU-38, CF-05, PB-28, UI-11, PA-13, NM-11, NM-13, NM-15.

### Duplicates and overlaps (for the lead to mark)

**Duplicates:**
- OR-403 = AU-59: lint advises anchoring an ending's or a chapter's words.
- CB-29 ⊂ OB-11: a Topic cannot carry a check.
- AR-08 = MT-26: ModuleShadow rewrites source text.
- AX-06 = MT-27 = PR-03: a save carries the compiled module.
- MT-28 = AR-04 + AR-11: mutability by convention, and identity in strings.
- OB-10 = the pins of AP-04 and AP-05 (and AP-03's sign).
- OR-113 ⊂ OR-162: "navigation chaotic", whose cause OR-162 found.
- AU-40 ⊂ AU-10: module-local Deem tables.
- R10-12's "warned dangers walked past" = OP-04.
- AX-08's "an undeclared relation read silently" = MT-25.
- CF-04 ⊂ CF-05: the casting audit's bare Slay actions.

**Overlaps:**
- OR-28 superseded by OR-512 (the measured remainder) and UI-19 (the instrument).
- NP-05's "a creature named several times at once" = CL-37.
- OR-71's "How it fell" disclosure and OR-138 (the setting that replaces it).
- OR-17, OR-70 and FM-08: the sky's look.
- T24-04 and UI-10: one design language.
- OR-145, OR-127 and OR-170: an act's time in the browser.
- OB-21 and PB-06: the start the page cannot choose.
- AR-16, BX-01 and MT-16: the setting's coupling.

### Likely fixed on main (checked against code and log; to close on the named spec, read by someone other than its closer)

**Fixed:**
- **OR-163** (P1, slice): an engagement as the engine's state, 4918b7c70 (21 November). Pinned by
  test/features/conflict/engaged.pin.test.ts (no wait but standing, no journey or map, Put away the map alone). The
  row's status still reads "open (20 Nov)".
- **OR-166:** 52697584c, test/autoplay-engaged.
- **AU-36:** 5bc35af9a and 8fa65b602, test/everywhere-lint.
- **GR-26:** 005c0dfe9, test/ambience-told.
- **GR-24:** 43af6f5d5, test/page-walk-browser.

**Fixed in part, with a remainder to split:**
- **AU-35:** 917280bae, test/small/canonical-names covers relations across every shipped folder. Queries, and a rule
  and an ending sharing a name, are to be checked.
- **OR-182** (P1, slice): out of quarantine at 033d8faea. It closes on CI runs keeping its budget, as its status says.
- **MT-25** (P1): its Stage 0 is done. Strict reads are on in every spec (717955cb5, test/support/declared-strict.ts).
  Split out generated typed vocabulary.
- **AR-22:** the engine's half is fixed (e5f3883b7: src/creation imports nothing of web/reader). Left: test/support
  imports the page (glanced.ts → MenuModel, signals.ts → TalkFocus).
- **UI-19:** the measure exists (scripts/contact-sheet-contrast.ts, test/small/contrast-measure). Its remainder is
  OR-512.
- **CL-53** (P1): the runner and the terminal offer to begin again (test/terminal-again). Left: beginning again as
  someone else, a wanted feature.

**Checked and still open:**
- OR-541 (src/world/debt-shapes.ts:52);
- R9-08 ("Something is going on here", src/session/travel.ts:253);
- NP-06 ("Another aim", web/reader/stage/wayfinder.tsx:123);
- OR-71 (the four `<details>`);
- BO-06 (wait_watch requires only able, data/rules/core.kyr:212);
- OR-515 (MenuModel's `travel:` rows).

## 5. blockedBy added

Only where the blocker is clear and live:

| Blocker | Rows added |
|---|---|
| TB-09 | OR-515, OR-141, GR-25, OB-21, AR-20, OR-162, OR-113 |
| AX-05 | AR-15, OA-06, PL-04 |
| OR-521 (one frame per revision) | OR-532, TB-12, GR-09, OR-219 |
| AR-13 | OR-541 |
| OR-442 | OA-14, CP-04, OR-46 |
| OR-310 | WD-17, US-04 |
| AP-03 | PL-31, AP-11 |
| OR-531 | AR-02 |

**Not added, because no live row names the step:**
- the knowledge door as a capability boundary (OR-527 is closed);
- ScreenModel pure;
- a complete player revision;
- the said-vs-held step.

Each wants a row of its own (a requirement) before the defects of causes M and D can be blocked by it. OR-533 would
be blocked by the first.
