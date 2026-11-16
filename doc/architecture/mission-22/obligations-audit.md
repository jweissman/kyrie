# M22 orientation: historical audit and obligation reduction (Phase 6 input)

Read-only audit of `/var/tmp/kyrie/wt-m21` at `025ed83e` (branch m22 = main), 16 Nov 2026. Nothing was edited or run
heavy. **checked** means I confirmed the claim by grep or by reading the code or spec named. Where a status sentence is
all there is, the row is marked "status only". Owner rulings are cited as such. Lead or assistant notes in the records
are called "lead's".

## 1. Register state now

| Script | Output (one line) |
|---|---|
| `register-state` | 541 rows: 191 open, 161 fixed, 104 partly, 45 deferred, 30 duplicate, 6 ambition, 4 decided. P0: 28 fixed, 1 open, 1 partly. P1: 42 open, 37 partly, 3 deferred, 1 ambition, 1 decided, 13 duplicate, 90 fixed. Ids used twice: 0 |
| `register-tickets` | 580 rows: 166 closed, 36 reference, 30 duplicate, 98 partly, 169 open, 43 deferred, 10 unverified, 28 other. 348 live (267 ready, 3 decision, 7 research, 71 unverified). 3 rows read as closed but still say open (OPR-01, T24-19, T24-20) |
| `register-held` | Of the 161 fixed rows, 10 are process fixes. Of the game's 151, 132 name a spec that exists and **19 name none**: NM-12 TC-02 PL-32 CN-09 GT-04 TO-02 BP-09 CO-02 CO-06 CO-07 IG-01 IG-09 IG-11 IG-14 TP-01 TP-04 TP-07 EX-01 PB-10 |

**Why the counts differ** (from reading the three scripts):
- **register-state** counts only tables whose header row starts `| id |` and has a column whose name starts with "status".
  - It classifies a row by the earliest state keyword anywhere in the status cell.
  - So "Direction recorded, not built" reads as ambition, "addressed" as partly, and "held" as fixed.
- **register-tickets** takes every table line with at least 5 cells and an id-like first cell, in either layout.
  - It adds the 36 pointer rows of §18 as "reference".
  - It also adds PB-25..27, which sit after §50's header.
  - It classifies a row by its leading words only. That yields 28 "other" and 10 "unverified".
  - Cross-tab against state: open→other 12, partly→other 6, fixed→other 2, deferred→other/unverified 2, open→closed 1.
- **register-held** works on state's "fixed" subset.
- **Blind spot in both scripts.** The §49 and §50 tables have 3-column headers (`id | finding | state`).
  - Neither script reads them, so 13 rows go uncounted: PB-14..PB-24, PB-16b, PB-21b.
  - At least 8 of them are live: PB-14, PB-16, PB-16b, PB-17, PB-18 open; PB-21 designed; PB-21b and "CF-02 (step 1)" partly; PB-24 open.
  - PB-15 appears twice: "open" at line 1092 and "closed (by design)" at line 1109. The duplicate-id check cannot see this.
  - **So the closeout's figure (541 / 191 open) under-counts the live obligations.**
- **Date slips.** "Status (17 November)" banners appear in `mission-21/state.md`, `consolidated.md` and `first-touch.md`, and PB-26 says "Retracted (17 Nov)". Today is 16 Nov, and 025ed83e said the dates were corrected.

## 2. Live P0/P1 rows by root cause, with their class

There are 86 live P0/P1 rows by tickets, plus the uncounted §49 rows. Classes:
- **D**: verified defect
- **IC**: incomplete commitment
- **IU**: implemented but unverified
- **SR**: settled by doctrine or ruling
- **OQ**: genuine open design question
- **DA**: deliberately deferred ambition
- **SS**: superseded or stale

**A. Acceptance**
- FH-01 (P0, open): no person has accepted the first hour. **IC.**
- AI-07 (P1, partly): no module played to an ending. **IU.**
- Neither can be checked by code. No row exists for Gate 1 (a blind agent on the *deployed* build); see §3.

**B. Opening and first touch**
- TO-01, TO-03, TO-06, IG-16 (P1, partly): the title as a designed passage; buttons that feel good.
- BL-06 (P1, partly): creation contradicts the kit.
- Class: **IC**. TO-06 is **IU**: no tablet or WebKit run (SP-05).
- The title and creation being held is **SR** (amendment of 16 Nov). The row text predates it.

**C. Startup cost**
- SP-01, SP-02 (open, improved); AX-03, AX-04 (open); AX-05 (partly); SP-05 (open risk).
- AX-04 restates SP-01's parse cost. Merge them.
- Class: **D**, measured, status only. The 20 MB script that gates the title has no row (§3).

**D. Guidance and undertakings**
- Rows: US-07 (PD-08: heard, lead, aim and route not separate typed records), FH-05, HP-01, HP-02, BL-11, EX-03, T24-18, PB-14, PB-16 and PB-16b (the aim names no next step at its own place).
- Root cause: US-07. AR-05 (text inference in the page) is the same root on the presentation side.
- Class: **IC**.
- FH-03 ("Direction recorded, not built"): an owner direction, not built. **IC**, not an ambition, although state counts it as ambition.
- US-09 and US-10 ("unverified since 8 Nov"): **IU**.

**E. Dramatic core and consequence**
- OA-12 and HP-03 (one complete expedition): open, not started. **IC.**
- FF-02, FF-04, FF-06 say "open", but **checked**: they are held in the laboratory.
  - FF-02 by `test/small/laboratory-knowing` (knowledge above opens a way below).
  - FF-04 and FF-06 by `test/small/laboratory-paths` (force and craft both paid; the torn door asked back).
  - `consolidated.md:111` says so too. Close them, or narrow them to "not yet in a generated first hour": **SS**.
- FH-08, WM-01: world memory, partly. **D.**
- BP-07 (undertown stocked, not inhabited) and CO-03 (towns read as one kit): **D**, status only.
- RI-01..03, RI-05 (a place worth returning to; distinct Look/Search/Explore; perception differs by character): owner asks of 14 Nov. **IC.**
- R9-01 ("open (not reproduced)"): reproduce or close. **SS.**

**F. Interaction grammar and parity** (owner ruling 2: four items, paged, never unfolded)
- TB-01 and TB-10 are stale against §50, **checked**.
  - The main rows still say partly and open.
  - §50 line 1103 says "TB-01 closed; TB-10 closed", held by `test/action-identity.test.ts` and `test/client-parity.test.ts`. Both exist. **SS.**
- TB-02, partly: the creation half is done. PB-07 and `test/small/creation-four` hold four cards a page. The destinations list is still open.
- PB-02, partly: its talk clause "six or fewer shown whole, fold for longer" is stale. **Checked**: `web/reader/stage/talk-stage.tsx:285` pages two topics plus "Something else… n of N" plus leave.
- PB-17 says "Not begun". **Checked**: `web/reader/map-menu.tsx` has "Put away the map", and roads at a crossroads are in the menu (obligations review). It is partly done. **SS.**
- Still open: TB-03, TB-04, TB-06, TB-08, TB-09 (the page's creation keeps its own steps), CO-09, FH-06, FH-07, AP-07, T24-05 (ruling 5 partly answers it).
- Class: **SR** (ruling 2), with the implementation **IC**.
- PB-03 (navigation "feels off", undiagnosed): **OQ**.
- PR-08 ("addressed"; "whether to lead with it stays the owner's"): settle it by judgment (owner, 7 Nov: judgment, not gates). **SR.**

**G. Atlas**
- AP-01 (partly), AP-02 (open), AP-03 (open: facets from Kyr; a sign has no aspect). **IC.**
- AP-02 still lists "silver" as a state, but PB-23 retired silver and coral. Its wording is **SS**.
- Three `test.failing` specs in `test/small/atlas-perception.test.ts` (§5) have no row of their own.

**H. Combat**
- CB-03 (lone mage) and CB-04 (road bands): **SR** by owner ruling 6 (16 Nov), with the implementation partly done.
  - `test/small/hireling-viable` exists, **checked**.
  - The row texts predate the ruling. Re-state them as "route tested end to end: open".
- CB-05 (no try limit on a check): **D**, **checked**.
  - `data/rules/services.kyr:47,100,114` retry `Resolve check(actor, persuasion, dc_fair)` freely.
  - `src/lang/Kyr.ohm` has `once` only on Topic and Rule (lines 141, 167). The only `Tries` is a Thing part (line 45).
- R10-07: "held … `small/flight`". Close it. **SS.**
- CB-01, CB-02, BP-02: **D** / **IU**.
- R10-01 (combat as a mode of the scene): an amendment 6 and 7 commitment, unbuilt. **IC**, large. It risks becoming a **DA** if not scoped.

**I. Magic, SRD and planes**
- CF-03, **checked**: `src/campaign/runtime-capabilities.ts:21` declares `invoke: ['ability','member','member']`, and `src/campaign/field-use.ts:193-206` refuses non-"safe" effects ('Unsupported field effect'). **D.**
- CF-02, **checked**: `data/generation/town/undertown.kyrt:167` `_u_rats_slept` is gated on Sleep being learned but is still a free Slay. **D.**
- CF-01: partly.
- GT-01, **checked**: `src/campaign/environment.ts:45` reads laws only into a fight's terms, and `data/imbar/planes.kyr:12-14` says "Earth and Water carry none yet". **IC.**
- GT-02, **checked**: `data/catalog/orsino/abilities.json` plane_shift has `effects: []` and `unsupported: effect:planeshift`. **IC.**
- GT-03: open. **IC.**

**J. Prose**
- DN-06 (P0, partly: "abhorrent" writing) depends on owner ruling 7, which is unanswered ("the three rows to fix first").
  - Doctrine says decide it: owner-judgment-not-gates and never-wait-on-owner.
  - Class: **IC**, blocked only by a self-imposed gate.
- DN-01, DN-03, NP-01, BP-06, CO-17, CO-10: **IC**.
- BL-09, BL-10 (said twice; one greeting template): **D**.
- NP-02 and NP-03 ("Deferred; no M20 record"): **DA** by default, with no decision recorded. Decide or drop them.
- R11-02 (conversation cannot be steered): **OQ**, part design and part content.

**K. Art, world and travel**
- OA-13: partly, held by `small/paintings-fit`. **IC.**
- NM-01 ("Left for M21", P1): **checked** absent. `src/world` and `src/map` contain no junction code, so the commitment was carried twice and not done. **IC.**
- AX-07 (order-dependent generation): **D**, pinned by `test/crossing-order.test.ts:101` `it.failing`.

**Ruled but unregistered remainders** (in owner-rulings-nov16.md's own status table):
- #3: held key and screen-reader click untested.
- #1: the fight log's roll is still a hover title.
- #4: not browser-checked.
- #5: bright paintings, talk and fight panels unchecked.
- #6: the hireling route not tested end to end.
- Only #1 has a row (BP-03).

**Could not check:**
- The FH, HP and TO rows: they need play.
- The SP figures: they need a timing run, which is heavy.
- PB-14 and PB-16: browser.
- BL-06 and CO-03: content census.
- PB-02's "Wait ›": the Wait lens is a part of `explorer.tsx`. Whether it pages like the others needs a browser look.

## 3. Promises from M17–M21 that the register does not carry

| # | Promise (source) | Repo check | State |
|---|---|---|---|
| 1 | Split the 20 MB page script: title and creation before the engine. The title is ready at about 3 s on a laptop and 11 s on a slow device (closeout §4.1; button-discovery.md §1, §5 "first thing to do in M22") | No register row (grep "V8", "20 MB", "split": 0) | **absent** |
| 2 | About 40 boxed or quiet-word buttons and the `opens/opened` unfold pattern. Owner: "no unfolding menu … every action a full-width row" (closeout §4.2) | `web/reader/stage/act.tsx:49,79` still renders `aria-expanded` and `opened-list` | **partial**, no row |
| 3 | One focus model and focus as engine state, so a controller can work (M20 recs #8, owner 12 Nov; first-touch §10 "then a controller"; closeout on grammar.md "focus model open") | IG-01 mentions a controller. Obligations review: "attention (map, lens, talk) is still client state". No `view:map` command in `src/session` | **partial** |
| 4 | Author-defined item kinds (handoff-to-m22 §4; closeout §4.6) | `src/lang/Kyr.ohm:181-190` LocalKind has worth, weighing, described, granting, teaching and worn-as. K1 in `test/authorability-probes.test.ts:41` passes. No own use or effect, attack or armour stats, or icon | **partial**. The handoff's "cannot define a kind" is overstated |
| 5 | A career rule for how a commoner *becomes* a warrior, cleric or mage (first-touch.md §9.4; closeout §2) | grep "commoner" in register: 0 | **absent** |
| 6 | Wander: deterministic, authoritative exploration until something warrants attention (owner 15 Nov; brief 4C) | Mentioned only inside PB-17's text. `src/cli/walk-style.ts` `wandering` is a test walker, not a player command | **absent** |
| 7 | Familiar scouting: a member acting apart and passing on what it learned (paragon-pins.md) | `test/small/pin-familiar-scouting.test.ts:23` `it.failing`; no row | **absent** |
| 8 | Perception reach per facet; a sign as a facet; gold along a known route (`atlas-perception`) | 3 `test.failing` at lines 53, 59 and 66; no rows (AP-03 is nearest for the sign) | **absent** |
| 9 | silent-lord "forged remission" journey | AI-02 is closed "not reproduced" (small/ford-in-spate), but `test/silent-lord-turns.test.ts:35` is still `it.skip` with its M20 comment | **unaccounted skip** |
| 10 | Gate 1: an automated blind agent on the deployed build, owned by the lead (owner, 14 Nov "two gates"; closeout: no blind agent has played the current build) | No row; FH-01 covers a person | **absent** |
| 11 | The `?touch=` press pipeline is kept behind a flag, against the ruling's "old mechanisms are removed rather than excepted around" | `web/reader/instrument/touch.ts`, `press.ts`; `test/touch-press-browser` | **contradiction**, no row |
| 12 | Owner preservation asks of 15 Nov (now brief Phase 5): middle scale in a hex; books and practices as instruments (almanac, bestiary progress, law books, cleric Clarity); tarot and fate; paragon journeys | Register greps for middle scale, almanac, tarot, paragon, "law book", Clarity: all 0. Deeds are present (`test/small/deeds`) | **DA**, unrecorded |
| 13 | Capstone gaps (`test/capstones/features.ts`) | faction reputation, difficulty options, named save slots, content warnings, dyslexia font, localisation are absent; grep "reputation" in register: 0. `capstones.md` is **stale**: it says economy has "no haggle checks" and crafting is "partial", but features.ts (16 Nov) claims both present. Regenerate with `bun scripts/capstones.ts` | **DA**, unrecorded |
| 14 | Debt with a real creditor (brief 4D) | `data/origins/debt/origin.kyr:57` `called_in` asserts only `refusesService(creditor, party)`, though its prose says "nor will anyone who wants the custom". The prose promises more than the rule does | **partial** |
| 15 | Friction asks: `Rule … each watch` (Quiet #13, Quittance #22); a module-owned death ending (Quiet #21); `after` keyed by outcome (Quiet #4); a Rule cannot branch (Quittance #14) | Absent in `Kyr.ohm:163-167`. Carried only inside the omnibus rows AU-04..AU-13, which cannot close piecemeal | **coarse**. Answered since: `Arrives` (Kyr.ohm:102), bouts to yielding (`src/model.ts:64` Terms.yields), `Resolve restore/raise(member)`, Promise-kept effects (Kyr.ohm:77) |

The brief audits for M13–M19 are covered. All 74 UNT gap rows and every BRF row marked disappeared, deferred or unverified
are cited by register rows (checked with a script against `doc/history/findings/src/*.tsv`). BRF-41 and BRF-93 (process)
are not, and are superficial. The M20 briefs audit's "partly" items all map to live rows.

## 4. Stale rows and docs against the owner's latest rulings

**Rows**
- **IG-07** (P0, fixed): "Decision (the lead): no hold anywhere for now". Reversed by ruling 3 (rest and camp held) and the amendment (title and creation held). **Mark it superseded.**
- **BP-09** (P0, fixed): "a tap chooses [creation cards]; hold only for sustained acts". Reversed by the amendment: "Cards should definitely require it". **Mark it superseded.**
- **PB-02**: the talk clause ("shown whole, fold for longer") contradicts ruling 2 and the code.
- **TP-09**: "a group's +/− alone". A terminal group unfold; check it against ruling 2.
- **AP-02, R10-02**: built on "silver", which PB-23 retired.
- **CB-03, CB-04**: predate ruling 6.
- **TB-01, TB-10, PB-17**: see §2F.
- **PB-15**: has two contradictory rows.

**Docs that still give pre-ruling advice.** Some carry a banner ("parts superseded"); none has been rewritten.
- `doc/design/GRAMMAR.md` (last touched 14 Nov, no banner). It is **reading #1 in the brief**:
  - :58 "Creation's cards are chosen at a tap, then Continue." Contradicts the amendment and PB-09.
  - :59 "**Nothing is held, for now.** A search, a wait, a rest or a camp commits at a tap." Contradicts ruling 3.
  - :70 "The rest is one deliberate step away: a lens's "All", talk's "Something else…"". Contradicts ruling 2.
  - :80 "A thing's look unfolds in place. What can be done with it opens beneath it". Contradicts ruling 2 and "focus replaces the foreground".
  - :50 "precedence (gold, red, green, blue, violet, silver)". Silver is retired (PB-23).
  - :68 "Four promoted, as an editorial default, not a quota." Contradicts ruling 2's "Four foreground items in every context". The same sentence is at `consolidated.md:57`.
- `mission-21/first-touch.md` §10:
  - "Commit-on-down for keys, pads and mouse; on-up for a finger."
  - "Holding only the irreversible and the entrance". Cards are now held.
- `mission-21/state.md:124`: "Make the hold the default with it." Contradicts ruling 3, under which a ring appears only where holding matters. Also :46 and :126, "whole suite on every push … under 10 minutes", which the push lane supersedes (closeout §2).
- `mission-21/interaction/experiment.md:43` holds "a wait, a search, a rest, a camp, a long look". Ruling 3 holds only rest and camp ("a wait fills no ring").
- `mission-21/interaction/recommendation.md:45`: "The hold, only when Energy exists." And :54 lists as a mistake "A hold for any act that spends nothing", which the title and cards now are.
- `mission-21/first-minute/critique.md:115`: "IG-07 | No hold anywhere for now: every act commits at one tap … done". And :89 says the commitment hold has been "unused since BP-09 took it off the cards".
- `mission-21/handoff-to-m22.md:72`: "a Kyr world cannot define a kind with its own stats, effects or look". Contradicted by LocalKind and K1 (§3 #4).
- `mission-21/capstones.md`: stale generated output (§3 #13).
- `capability-audit.md` counts spells as "241 faithful", while `rules/srd-fidelity.md` passes 1 spell in resolution. "Faithful" there means faithful to Orsino, not to the SRD. Say so wherever SRD progress is reported.

## 5. Skipped and failing tests

| Spec | Kind | Reason | Row |
|---|---|---|---|
| `repertory-2.test.ts:84`, `:133` | it.skip | Unskipped on 16 Nov, fails in 1–4 s: the scripted journey has drifted from the content | OA-01, OA-02 (P3) |
| `circus-journeys.test.ts:100`, `:120` | it.skip | Same | OA-03, OA-04 (P3) |
| `silent-lord-turns.test.ts:35` | it.skip | "Skipped at M20's landing (AI-02)": a ford in spate | AI-02 closed (not reproduced). **Unskip or delete** |
| `crossing-order.test.ts:101` | it.failing (KYRIE_LONG) | A country's draw depends on what was drawn first | AX-07 (P1) |
| `small/pin-familiar-scouting.test.ts:23` | it.failing | No member can act apart; wanted for M22 | **none** |
| `small/atlas-perception.test.ts:53, 59, 66` | test.failing | Perception reach per facet; a sign as a facet; gold along a known route | **none** (AP-03 nearest) |
| `ombra-post*.test.ts`, `ombra-bard.test.ts` | conditional it.skip | Run only with OMBRA_CAMPAIGN set or the module loaded | n/a |
| `orsino-registry.test.ts:20` | skipIf | Needs a pinned Orsino checkout | n/a |
| ~55 `*-browser`, KYRIE_LONG and KYRIE_TOUR specs | skipIf env | By lane design | n/a |

The closeout says "four journey specs skipped". There are five `it.skip` journeys and five `it.failing` pins.

## 6. SRD and engine proving cases (code path and spec, not catalogue)

- **Spells outside combat.** Partial. They work for ally-targeted "safe" effects.
  - Path: `field_spell` (`data/rules/care.kyr:35-41`) → `Resolve invoke` → `FieldUse.perform`. It spends the same slot through the Spellcasting rules.
  - Specs: `test/darkness.test.ts:44`, `test/play-structure.test.ts:165`, `test/composition.test.ts:122`, `test/small/tended`.
  - Hostile spells are refused (`FieldUse.safe`, field-use.ts:193).
- **Sleep starting or altering a confrontation.** Absent outside a fight.
  - CF-03 is unbegun: `invoke` takes members only, and no fight can open with a caster's cast.
  - Inside a fight, the catalogue's `sleep` (apply `asleep`, save) runs through the generic apply/save kernel, but no spec names the Sleep spell.
  - SRD: level 3 against the SRD's 1, and DC 17 against 14 (srd-fidelity.md:203).
  - There is no persistent `sleeping` state after a fight.
- **Healing, regeneration, Raise Dead, Resurrection.** Partial.
  - Healing works in a fight and outside it (specs above; `test/effects.test.ts`).
  - Regeneration works in combat only (`src/kind-defenses.ts:49`; `test/monster-powers.test.ts:30`).
  - Raise Dead works in a fight (`revive` on a "dead ally": `test/raised.test.ts`, `test/effects.test.ts:91`) and as a town priest's 150-coin service (`test/raising.test.ts:37`).
  - A party cleric cannot cast Raise Dead outside a fight: `revive` is not in `FieldUse.safe`.
  - Resurrection shares the `revive` path (percent 100). No spec names it.
- **Plane Shift and planar laws.** Catalogue-only for Plane Shift (`unsupported: effect:planeshift`). Planar laws are partial.
  - Laws exist (`data/imbar/planes.kyr`, Fire and Air only) and are read only into a fight's terms (`environment.ts:45`), as ±1 spell DC (GT-01).
  - The kernel's typed `travel` effect is recorded (`src/effects.ts:403`), but no campaign code consumes it. That is the cheapest route to GT-02.
- **Reusable status, targeting, save, check and effect.** Partial.
  - The effect language (`src/lang/Abilities.ohm`) and `src/targeting.ts` and `src/effects.ts` are shared and specced (`test/effects.test.ts`).
  - Gaps: no band target for invoke (CF-03), no try limit on a check (CB-05), and no difficulty that reads a measure (CB-05 rest). Authorable effects and spells are absent (AU-14: "Kyr can teach a spell, not define one").

## 7. Authorability

- **Can Kyr declare an item kind? Yes, within limits.**
  - Syntax: `Kind dreg_ox "…" is treasure worth 2 weighing 1.` and `Kind day_jar "…" like old_glossary granting sunlight described "…".` (`test/fixtures/probes/local-kind/site.kyr`; K1 passes; grammar `Kyr.ohm:181-190`).
  - It can declare: base kind (`is`) or a copy (`like`), value, weight, description, a granted skill, a taught thing, and a worn slot.
  - It cannot declare its own use effect or ability, weapon or armour figures, charges or consumption, or icon.
  - The brief's proof ("custom item with real properties and effects, without modifying a global catalogue") needs only a `using <effect>` / `on use` part routed through the existing effect language and `use_item`.
- **What the friction record says Kyr cannot express** (still absent unless marked):
  - **Quiet in the Sky** (`doc/adventures/the-quiet-in-the-sky/friction.md`):
    - per-watch rules (#13);
    - a module-owned death ending, because no rule pass runs after the company falls (#21);
    - a country's `after` keyed by which outcome happened (#4);
    - cross-module world events (#5);
    - a region owning its weather (#6, overlaps NP-01);
    - suppression of engine parting lines after scripted exits (#10);
    - temperature or exposure (#3; partly `src/ui/exposure.ts`).
  - **Quittance** (`friction.md`):
    - a Rule cannot branch (#14);
    - `Grave` cannot be conditional (#14);
    - observations are told once per arrival, so lasting change must live in Thing states (#11);
    - talk costs no time (#22);
    - check outcomes are seed lotteries in tests (#7);
    - no `Gift` construct (#18).
  - **Imbar sea** (`doc/imbar/friction.md` §"consolidated asks"):
    - `Draw <row> from <table>` (#5);
    - `Time` arithmetic (#6);
    - a vessel or sea passage kind (#4);
    - cross-module measures (#8);
    - adventure kits (#9).
  - **Answered since**: `Arrives`, bouts to yielding, restore/raise, Promise-kept effects, the Commander's `hold_here` (Quittance #19).

## 8. Top 10 obligation reductions for M22, ranked

1. **Make the register measure all of itself.**
   - Fix both scripts so they read the 3-column `state` tables and `§`-headed sections.
   - Rename the second PB-15 row.
   - Proof: extend `test/small/register-tickets` so every `| XX-nn |` line is counted by both scripts and every id is unique. It fails today on 13 rows.
2. **Close or supersede the stale rows with evidence, in one pass.**
   - TB-01, TB-10 (action-identity, client-parity); FF-02, FF-04, FF-06 (the laboratory specs); R10-07 (small/flight).
   - IG-07 and BP-09 → superseded by the amendment. PB-02 talk, PB-17, TB-02 creation → partly, with specs.
   - CB-03 and CB-04 → ruling 6 plus hireling-viable. AP-02 wording.
   - Regenerate capstones.md.
   - Proof: register-held rises, with the rows' specs named.
3. **Reconcile GRAMMAR.md and the interaction docs to rulings 1–6 and the amendment.** Every Phase 0 reader starts there.
   - Proof: a small doc guard that fails if `doc/design/*.md` asserts the ruled-out phrases ("Nothing is held", "All", "unfolds in place", silver).
4. **Split the page script**, so the title and creation load before the engine.
   - Add the missing row.
   - Proof: `test/support/ui-discovery.ts` time-to-first-input on the title, before and after; slow-device profile under 3 s.
   - This serves acceptance items 1 and 4 directly.
5. **CF-03: a fight opened by a named caster's cast, plus a persistent `sleeping` state.**
   - Proof: a tiny Kyr world with a mage who knows Sleep and three rats.
   - It must show: the slot spent, saves rolled, resisters active, sleepers not dead, "kill the sleeping" a separate act, and no offer to a mage without Sleep.
   - Closes CF-02 and CF-03 and the brief's Sleep case.
6. **Gate 1 on the deployed build.**
   - Proof: one blind agent's recorded first 15 minutes on the Pages URL, with its friction carried into rows.
   - It does not close FH-01 but makes its evidence current. Add the row.
7. **CB-05: a try limit on a check** (`Resolve check(…) once`, kept as a fact).
   - Proof: a tiny world where a failed persuasion is not re-offered; convert services.kyr:47, :100 and :114.
8. **An author-defined usable item.** Add a use or effect part to LocalKind.
   - Proof: a K1-style fixture with a Kyr tonic that heals via `use_item` and shows in the encyclopedia, with no catalogue edit. Correct handoff §4.
9. **GT-02 and GT-01 smallest case.**
   - Consume the kernel's `travel` event to move the company to a canonical threshold, and give one inner plane a per-watch ambient harm stopped by a ward.
   - Proof: GT-03's first tiny-world case, on seeded dice.
10. **Clear the skip and failing debt.**
    - Rewrite or delete OA-01..04 and silent-lord's skip.
    - Give the 4 `it.failing` pins (familiar scouting, atlas-perception ×3) rows as open capabilities or ambitions.
    - Add single rows for Wander, the commoner career rule, the ~40 boxed buttons and unfolds, the focus model and the `?touch` pipeline.
    - Proof: zero `it.skip` outside env gates, and every `it.failing` named by a row.

DN-06 and US-07 sit just below the list: they cost the most to the first hour but are not cheap.
- **DN-06**: decide the three prose rows by judgment, without waiting for ruling 7.
- **US-07**: a typed lead record with its source and next step. Proof: PB-16b at the laboratory's speaking door.
