# Audit of Mission 22's plan: the sprints, and the maturity track against register zero

19 November 2026. Read and measured in `/var/tmp/kyrie/wt-m21`, branch m22, HEAD `781af0bec` (main `37fa5ea9e` plus
three commits). I changed no code and no data. Counts come from `bun scripts/register-tickets.ts --json`, cross-checked
with `bun scripts/register-state.ts` and `bun scripts/m22-status.ts`. Spec results are runs made today, one file at a
time (§6 lists them all).

**The register at HEAD:** 905 rows, 442 live:

- 179 open, 195 partly, 63 deferred, 5 unverified;
- 6 P0, 115 P1.

The two register readers agree row for row: S0-1 still holds.

---

## Summary (one page)

### Verdicts

1. **Sprint 0: genuinely met.**
   - Its rows are true at HEAD. register-count passes (4/4), and both readers agree with 0 bad leads, 0
     closed-yet-open and 0 ids used twice.
   - PA-02, PA-03 and OR-32 are closed with evidence.
   - STATUS names M22 as extended for acceptance.
2. **Sprint 1: its rows are met; its goal was met only as the owner re-scoped it.** Robots replaced people, by the
   owner's ruling of 18 November.
   - All 11 CL rows S1-2 claims are closed, and their 13 pins pass (§1).
   - S1-3's recording exists, but it does not show reduced motion checked, which is §6's acceptance. Its "no
     unexplained black" stands only because the ~10 s "Setting out…" checklist counts as explained.
   - The sprint's own close note is honest about FH-01 and setting out's length. No row is falsely marked done.
3. **Sprint 2: every row marked met has a passing pin, but the sprint goal is not demonstrated.**
   - S2-4, S2-5, S2-6 and S2-8 are true at HEAD; barrow-forewarned, drove-reeve, drove-resumed and hireling-viable all
     pass.
   - **No single run completes the eight beats.** The beats are proven one spec at a time:
     - barrow-forewarned plays "the descent's two ends, the halls between not played";
     - the warrior's replay stops at T90;
     - cold play 7, the sprint's own measure, died to an ambush.
   - §7's acceptance asks for a clean run and one internal play that completes the route.
   - **Recommendation: close Sprint 2 now.** Make "one recorded clean run of the eight beats per character" Sprint 3's
     opening row (S3-0), and carry S2-3 and S2-7 as below.
   - **S2-3 is met on its own acceptance.** The mage's three aims at T1 come from reading the notice: a deliberate
     choice ("Want: get oriented. The notice board is the obvious first read", cold-5-log T1). That is "work sought".
     What is left is HP-01's stricter bar (one principal aim and two prospects). It is one template change in
     `data/generation/town/undertown.kyrt` (the five `*_job_sought` Objectives, lines 238–694). It is within the stop
     rule, and it moves worlds, so it must be classified by `compat`.
   - **S2-7: what remains is small, apart from one item.**
     - "Nest at the gate" (ST-03; story-sheets.md: "Nest is not there") is authored content: reachable.
     - The Tower's reckoning past the march (WD-16) needs facts to cross a country boundary. That is MT-07's
       mechanism, and the stop rule correctly forbids it here. Carry it to MT-07 or M23.
     - ST-04's status still lists "the cold pans reading the chain" as open, which ce68a339c met. Its open line is
       stale.
4. **The maturity track is not a strategy toward register zero.**
   - Steps 2–6 have landed, and their pins pass (§6). Yet besides their own MT rows they closed **three** register
     rows: AB-14, CN-02 and MT-09. Step 2's drawn-world lint created **two** new rows (MT-11, MT-12).
   - Step 1 has the largest yield: one P0 (OR-94) and about 7 rows closed outright, about 12 advanced. It is the
     one step still partly done, and its invariant is still `it.failing` (test/small/one-projection:57, "presses alike
     on the page").
   - It is also Sprint 4's scope in all but name.
   - By the track's own rule 2 (proving slice works plus an invariant spec), MT-02..MT-06 are closable today; their
     "Open:" lines are extensions. That is 5 rows for free.
   - The mechanisms that would close the most live rows are not in the track at all (§3).
5. **P0s: 2 are blocked on the owner, 4 are engineering.**
   - Owner-blocked: FH-01 (a person must play) and PP-05 (the owner reads 30 passages).
   - Engineering: OR-114, OR-91, OR-94, OPR-01.
   - OR-114 and OR-91 share one cause: the per-act screen build, which is also AX-05 (P1).
6. **Of the 63 deferred rows:**
   - about 50 genuinely belong to M23;
   - 6 are cheap and on the first hour (keep live: AP-13, FF-05, FF-01, CP-13, CP-04, NM-01's world-moving pair with
     TR-03 kept visible);
   - 8 are duplicates or met (CB-21, AP-06, FF-07, UI-08, PB-18, PA-12, FH-18, CP-14).

### Ranked P0/P1 drill list

| # | Mechanism | Rows it closes (outright → advanced) | Blocked on |
|---|---|---|---|
| 1 | **Per-act cost.** Profile the ordinary act: Itinerary.shown (~45 ms), PlayerView.observe run twice, the narrator, Battle.state copies. Use a narrow harness like test/small/forecast-time | OR-114 (P0), OR-91 (P0, part 2–3), AX-05 → OR-08 | nothing |
| 2 | **Finish the presenter (MT-01).** Burn 53 `<button>`s to rows, lenses and books; make one-projection's `it.failing` pass; digits commit through the row | OR-94 (P0), MT-01, OR-11, PB-02, AR-20, AR-22, TB-10 → TB-01, TB-09, AR-05, OR-71, CL-07, CL-33, AP-07 | the folds' design decision (the lead's, per owner-judgment memory) |
| 3 | **Notice gives one lead, not three held aims.** World-moving: classify it with compat | HP-01, S2-3, FH-05 (remainder) → OR-74, US-07, CP-13 | nothing |
| 4 | **One route finder (AR-21) for gold.** AimLead.way ignores usability | OPR-01 (P0: a1's debt gold into open fields), OR-60(4) → CL-34, OR-113, OB-10's third failing pin | nothing |
| 5 | **Cold play 8 on the *deployed* build.** A robot, through scripts/cold-play.sh | OB-05 → OB-17, AI-07; Sprint 3's measure | nothing |
| 6 | **Lone-novice danger on the second level and on the road.** Cold plays 6 and 7 both died suddenly | SI-01, BP-07 (dup of CB-03) → CB-03, CB-01, AP-13 | nothing |
| 7 | **One browser/phone sweep, on CI (heavy-runs-on-ci)** | T24-05, OR-37, OR-96, FM-01 → OR-69, FM-02, US-09, OR-23 | lead's browser lane |
| 8 | **Register hygiene, no code** (§4.3) | BP-07, AU-18, MT-02..06, CL-53→TS-03, OR-60 split; re-verify FH-06/07/08, WM-01, AP-07 | nothing |
| 9 | **Owner packet, one sitting** | PP-05 (P0), OR-75, FM-03, OR-116, OR-10, OR-30, TR-03, WD-02 | owner |
| — | FH-01: a person plays | FH-01 (P0) | owner recruits (Sprint 3 or 5) |

### Proposed reorder of the maturity track (detail in §3.4)

1 (finish) → **new P: per-act cost** → **new L: lead ≠ aim** → 2′ (turn the lint's findings into fixes: MT-11,
MT-12, AU-15) → **new R: one route finder and per-leg travel** (the study's increment 3) → 7 → 8. Close 3, 4, 5 and 6
on their slices, and park their remainders (R89, R41, required roles, the additive-vs-changed digest) in M23 AU rows.

---

## 1. Sprint 0 and Sprint 1 closure

### Sprint 0

| Row | Claimed | Verified at HEAD | Pin, run today |
|---|---|---|---|
| S0-1 | One parser, one state model; 0 bad leads / closed-yet-open / ids twice | **Met.** register-tickets and register-state both say 905/442 (179 open, 195 partly, 63 deferred, 5 unverified), 0 unknown leads, 0 closed-yet-open, 0 ids twice | test/small/register-count: **4 pass** |
| S0-2 | PA-02, PA-03, OR-32 closed; PA-13 split; OR-28 amended | **Met.** PA-02, PA-03 and OR-32 closed with evidence; PA-13 open (P2) with its own remainder; OR-28 partly, its remainder one browser look | (document check) |
| S0-3 | STATUS says M22 is extended | **Met.** doc/STATUS.md:7, "As of 17 November 2026: Mission 22 is extended for acceptance" | — |
| S0-4 | Golden route chosen | **Met.** current-sprint.md: iscoed, a human warrior on the roads past, an elf mage on learning, eight beats | — |
| S0-5 | Protocol written; recruiting is the owner's | **Met as a document.** No person recruited (FH-01) | — |

Exit evidence: "the Sprint 1 ready queue holds no more than eight candidates" held (5 rows).

Sprint 0 is genuinely closed.

### Sprint 1

| Row | Claimed | Verified | Pin(s), run today |
|---|---|---|---|
| S1-1 | Cold play 4, 6.5/10 | **Met.** cold-4-report.md:4, "Score 6.5/10" | test/iscoed-cold-four: **9 pass** |
| S1-2 | CL-12, 13, 14, 17, 18, 22, 24, 25, 29 fixed and pinned; CL-04, 05 closed | **Met.** All 11 rows `closed` | warned-take, creature-presence, fight-draught, every-blow-told, objects, owed-borne, healing-priced, glance-rules, iscoed-cold-two, iscoed-cold-three, runner-labels, neighbours: see §6 |
| S1-3 | Recording studio → first scene, laptop and phone | **Met, with a gap.** recordings/s1-3-opening.md: keys (laptop), touch (phone), no flash, no flicker. §6's acceptance also asks for **reduced motion checked**; the recording does not mention it. The ~10 s dark "Setting out…" passes only as "explained" | none (a recording) |
| S1-4 | Cold play 5, 6.5/10 | **Met.** cold-5-report.md:6 | test/iscoed-cold-five (not run: one heavy file at a time; cold-four stands in for the family) |
| S1-5 | Carried into Sprint 2 | Honest: OR-75, CL-41, CL-39, CL-50 and CL-48 are named done. OR-75 is still `partly`, with the owner's reading open | — |

**The goal.** §6's goal, a cold *player* reaching the first meaningful action, was re-scoped by the owner to robot
players (18 Nov night). Under that reading the robots reached it in cold plays 4 and 5. §6's acceptance line "the
participant reaches a usable title… without instruction" has no human evidence; that is FH-01, honestly left open.

**Rows marked done whose acceptance is not met:** none outright. Two qualifications:

- S1-3 lacks the reduced-motion check;
- S1-5's "done" for OR-75 is the lead's half only.

---

## 2. Sprint 2

### Met rows, checked

| Row | Acceptance | Verified | Pin, run today |
|---|---|---|---|
| S2-1 | Cold play 6 and report | cold-6-report.md:5, 5/10. The board's text says "CL-52, the warning, open", but **CL-52 is closed** (fixed 18 Nov): **stale board text** | test/iscoed-cold-six-vault: **3 pass** |
| S2-2 | Beat map | beat-map.md and scripts/beat-map.ts present; re-measured 19 Nov | — |
| S2-4 | One ordinary act changes the expedition, for both characters | **Warrior:** asking the innkeeper makes the bane an aim; with the jar carried, no fight. **Mage:** the hireling (rats, 90.5 % → 100 %). Met, but only at the descent's ends ("the halls between not played") | test/barrow-forewarned: **4 pass** (49 s); test/small/hireling-viable: **2 pass** |
| S2-5 | A decision changes a person or place; the return is a changed reception; pinned through save/resume | The drove: before the reeve, a ruling with a cost; resumed in a fresh session, the same digest | test/drove-reeve: **2 pass**; test/drove-resumed: **1 pass** |
| S2-6 | The mage viable; a warning names help that can be had | hireling-viable passes; CL-52's FightHelp is closed | as above, and iscoed-cold-six-vault |
| S2-8 | Cold play 7, report | cold-7-report.md:2, **6/10**, "ended by a sudden death I could not have read coming" | — |

Two sprint-level facts the board does not lead with:

- **The goal is not demonstrated end to end.**
  - §7's acceptance: "A clean run can complete the eight beats…", and "One internal play completes the route".
  - No spec or kept trace plays one character from T0 to the return. `grep -ril 'eight beats\|golden' test/` finds
    only per-beat specs (drove-return, iscoed-cold-2..6).
  - The warrior's beat-map replay stops at T90. Cold play 7 died.
- **Two of the last three cold plays ended in a sudden death** (cold 6: CL-51 and CL-52; cold 7: CL-58).
  - Each cause was fixed and pinned (CL-58 closed 19 Nov).
  - The lone-novice danger family is still live: CB-03, SI-01 ("the second level is where lone novices die"), BP-07
    and AP-13.

### S2-3: what remains

- **On its own acceptance** ("a new aim only once its desire is met or work sought"), **S2-3 is met**:
  - beat-map.md (19 Nov, later): every aim after T1 comes of a question the company put or a thing it found;
  - the three at T1 are the mage reading the notice by choice (cold-5-log.md:4–5).
- **What remains is HP-01's own bar:** "at most one principal aim and two kept prospects… a notice gives leads, not
  held undertakings".
  - The cause is five Objectives `{t}_u_*_job_sought when knows(party, {t}_u_notice)…` in
    data/generation/town/undertown.kyrt (lines 238, 345, 422, 589, 694).
- **Reachable without breaking the stop rule:** yes. Collapse the five into one aim ("Ask {merchant} about the work on
  the notice"), and let each job's own aim arise on speaking to its giver.
  - That is the smallest world fact. It is not a quest system.
  - It moves aims in every drawn world, so run `compat --quick` and expect world-moving on a1 and iscoed/weir.
- **Recommendation:** mark S2-3 met, and carry HP-01 into Sprint 3 as its first defect.

### S2-7: what remains

| Item | Reachable under the stop rule? |
|---|---|
| ST-03: "Nest at the gate" (story-sheets.md:71, "Nest is not there") | **Yes.** Authored lines in the gate module |
| ST-03: "the glance gives a person's deeds beside his talk no reason" (Affordances reads only the talk's replies), shared with CL-31 | **Yes, as a lead decision.** CL-31's stated blocker, the "atlas hold", was **lifted 18 Nov**: AT-01 fixed; AT-02 approved and flagged, and it includes "a reason for a check-resolved act spoken to someone". CL-31 is stale-blocked |
| ST-04/WD-16: the Tower reckons the tally past the march | **No.** A module must read another country's module facts, which is MT-07's runtime-fact projection. The stop rule rightly holds it |
| ST-04's own status | It still says "Open: the cold pans reading the chain", which ce68a339c met (test/pans-cut, 2 pass). Fix the text |

Pins: test/pans-shared **2 pass**, test/pans-cut **2 pass**, test/sea-gate-claim **3 pass**, test/iscoed-roads
**2 pass**, test/stories-apart, test/export-roles and test/iscoed-opening (§6).

### Should Sprint 2 close now?

**Yes.**

- Every row that can be met under the stop rule is met or reduced to a one-file remainder.
- The one structural remainder (WD-16) is out of scope by the plan's own rule.
- The undemonstrated goal is a measurement, not an implementation, and belongs at the head of Sprint 3.

Carry:

- HP-01 (S2-3's remainder);
- Nest at the gate (ST-03);
- WD-16 → MT-07 or M23;
- CL-31, re-blocked on AT-02 rather than the lifted atlas hold.

Record in the close: the goal is not yet shown by one clean run, and two of the last three cold plays died suddenly.

### Sprint 3, by planning-report.md §8's own outline

**Goal (§8, unchanged):** a second cold player can rely on what Westernesse shows and says. Opportunity marks, prose,
paintings, danger and consequences neither contradict nor over-promise the state beneath them.

| ID | Kind | Row(s) | Acceptance |
|---|---|---|---|
| S3-0 | Investigation | Sprint 2's carried goal | One recorded clean run (`bin/kyrie review record`) of the eight beats for the warrior (drove) and the mage (weir), kept as traces, each beat named at its step |
| S3-1 | Investigation (E1) | OB-05, OB-17, FH-01 | Cold play 8, a robot on the **deployed** build (closes OB-05); a person if the owner recruits (§8 step 1). The post-play questions on marks and colours as §8 lists them |
| S3-2 | Investigation (E3) | AP-01, PB-24 | The false-promise corpus: cold plays 2–8, each case recording state / signal / act / result / contract (§8 step 2); `scripts/promise-fidelity.ts` on iscoed |
| S3-3 | Defect (E3) | PB-24 (c3's inn case), AP-07, CL-33, HP-01 | Each corpus cause repaired in the projection, not in CSS (§8 step 3); HP-01's notice as the first |
| S3-4 | Defect (E3) | NP-01, NP-02, OA-13, CO-17 | Only the golden route's cases: narration bound to perception, a painting removed where it contradicts (§8 steps 4–5) |
| S3-5 | Story (E3) | WM-01, FH-08, CL-09, CL-46, CP-04 | The return verified: the dead do not speak, completed facts do not reset, a deed is attributed at its time; through save/resume (§8 step 6) |

- **Capacity reserve:** CL rows from cold play 8, plus SI-08 (a look before a one-way drop) and AP-13 (danger
  remembered), the lone-novice deaths.
- **Not in Sprint 3:** WD-16, careers, OR-94's button burn. OR-94 is Sprint 4's (§9), unless it runs as the track's
  step 1 in the agent slot.

---

## 3. The maturity track's strategy toward register zero

### 3.1 Yield per step, counted from row texts

"Closes" means the row's stated remainder is wholly the step's. "Advances" means part of it is.

| Step | State | Live rows it would **close** | Advances | Notes |
|---|---|---|---|---|
| 1 Presenter (A) | partly; invariant `it.failing` (one-projection:57) | **7**: OR-94 (P0), MT-01, OR-11, PB-02, AR-20, AR-22, TB-10. OB-16 (the page's leftover `why` step and `--origin` in 12 places) is a deletion chore beside it | ~12: TB-01, TB-03, TB-09, TB-11, AR-05, AR-06, AR-07, OR-71, OR-72, CL-07, CL-33, AP-07, FM-04, OA-11 | The study's §3.1 list. OR-38 and CL-49 are already closed. **This is Sprint 4** (TB-01, TB-09, TB-10, OR-11, OB-05, AR-05) |
| 2 Intention lint (C) | landed; MT-02 partly | **1–3**: MT-02, AU-18 (a duplicate of MT-10), MT-10 once offices are declared | MT-11, MT-12, AU-15, AU-03, AR-13 | Closed AB-14. It **created** MT-11 and MT-12: turning its findings into data fixes is the cheap yield |
| 3 Typed exports (B) | landed; MT-03 partly | **1**: MT-03 | WD-16 needs runtime facts, not roles | No other live row cites exports |
| 4 Why (§7.1) | landed; MT-04 partly | **1**: MT-04 | AU-12, AR-18 (lowering discards intent), OA-11 (a dev "why is this gold?") | A tool; it shortens diagnosis, it closes nothing |
| 5 Routes (F) | landed; MT-05 partly | **1**: MT-05 | AU-07 (pursuit re-planned), AU-04 (schedules), R11-02 (talk again, content), US-12 | Closed CN-02. No data module had a first-and-again pair, so nothing was rewritten |
| 6 Compat (§7.4) | landed; MT-06 partly | **1**: MT-06 | Enables NM-01, TR-03 (the owner's choice), HP-01, SP-02 ("proven against eager"), AX-04 | An enabler: its yield is through world-moving fixes |
| 7 Social facts (E) | open | **3–5**: MT-07, MT-10 and AU-18 (an office as a fact), WD-16 (with a runtime whitelist), OR-30's Anselm decision | WD-02, CP-08, WD-01, WD-13, WD-14, US-12, WM-06, CO-03, AR-10 | World-moving; the WD family's real mechanism |
| 8 Placement (D) | open | **2–4**: MT-08, OR-66 (literal coordinates: the study's §3.4 case), WD-13, WD-03 | NM-10, NM-11, NM-15, CP-05, WD-12 | World-moving |

**Total, if every step landed whole:** about 20–25 live rows closed, 4–5 % of 442. Steps 2–6 have so far closed
AB-14, CN-02 and MT-09, and opened MT-11 and MT-12.

### 3.2 Highest-yield and mis-ordered steps

- **Highest yield: step 1.**
  - It is the only step that closes a P0 (OR-94): about 7 rows closed outright, ~12 P1s advanced.
  - It is planned twice: once as MT step 1 and once as Sprint 4.
  - Make it one piece of work. Either run it as Sprint 4, or pull Sprint 4's step 1 (the page/terminal/runner trace)
    forward into the track's slot.
- **Mis-ordered: steps 3–5 ran before step 1 was finished.**
  - Each closed only its own MT row.
  - The track's rule 1 ("subordinate to play") allowed it, but register-wise it was the lowest-yield order.
- **Mis-ordered: steps 7 and 8 sit last, though the WD and CP families depend on them.**
  - That is correct under rule 4 (harness first), and the harness has now landed.
  - Step 7's office projection would close MT-10, AU-18 and the Porthalen two-reeves class, which the lint finds and
    cannot fix.
- **Closable today by the track's own rule 2:**
  - MT-02 (drawn-lint); MT-03 (export-roles); MT-04 (small/why; dependents passes too); MT-05 (clock-routes,
    company-pursuit and talk-again pass); MT-06 (compat-kinds passes).
  - Each has a working proving slice and an invariant spec. Their "Open:" lines are extensions: required roles,
    R89/R41, "additive vs changed".
  - Close them, and move the extensions to one AU row for M23.

### 3.3 Mechanisms the track does not name, by family

| Mechanism | Families | Live rows (closed outright / advanced) |
|---|---|---|
| **P. Per-act and startup cost.** The screen build per act, then generate-to-AST / keep the parse (compile-once-plan.md exists, outside the track) | OR, SP, AX | **OR-114 and OR-91 (both P0)**, AX-05, AX-03, AX-04, SP-01, SP-02, OR-08, OR-44, OR-23 (length) — 10, 6 of them P0/P1 |
| **L. A lead is not an aim.** A notice or a rumour gives a lead; it becomes an aim on speaking, witnessing or a keep (HP-01's wants) | FH, OR, OA, NP, US | HP-01, FH-05, OR-74 (remainder), CP-13, US-07 → HP-02, OA-10, NP-03, AP-05, T24-18, FH-04 — 5 / 6 |
| **R. One route finder over `connects`** (AR-21: Journey.way, AimLead.way "ignores usability", ExpeditionContract.walk, Itineraries.plan), and per-leg travel in the page (the study's §9 increment 3) | AR, NM, CL, OR | AR-21, OPR-01 (P0), OB-10's "gold two steps from the aim" pin → CL-34, OR-113, TR-01, OR-112, NM-09, NM-06, OA-06, FH-06 — 3 / 8 |
| **B. Browser/phone sweep on the deployed build** (on CI) | OR, UI, FM, T24, US | T24-05, T24-06, OR-28, OR-37, OR-96, R11-11, FH-16, UI-02, UI-03, OR-45, FM-01 → OR-69, FM-02, US-09, OR-23, OB-06, NM-03, NM-08 — ~11 / 7 |
| **D. Danger and economy census.** Extend `scripts/novice-viability.ts` to named fights (the Gaffer, the Bound Howe camp, hobs) and to home ÷ spend | CB, SI, OA | CB-06, CB-27, CB-02, CB-22, SI-07, OA-07 → CB-24, WD-07 — 6 / 2 |
| **F. Fight as typed events** (OA-08: forecast, log, turning points and "what it cost" from one event stream) | CB, OA, prose | OA-08, DN-01 → CB-02, CL-10 (failed persuasion), CB-19 |
| **K. Authorable facet and reach** (AP-03; OB-10's failing pins; AT-02's flagged experiment) | AP, OB, CL | AP-03, AP-04, OB-10 (2 of its 3 pins), AP-06 (deferred, dup), CL-31 → AP-05, AP-14 — 4 / 2 |
| **S. Drifted skipped specs.** Rewrite them against current play with `kyrie review record`, or delete them with a reason | OA, OB | OA-01, OA-02, OA-03, OA-04, OB-09 — 5 (each "fails in 1–4 s") |
| **V. Verify-or-close audit** | FH, AR, AU, AP, CP | 155 non-deferred live rows carry no status date after 11 Nov; 52 have a bare state word ("partly", "open"), 14 of them P1 (TB-06, TB-08, TO-03, TO-06, IG-16, BL-06, CF-01, HP-03, RI-05, AX-05, AX-07 …). Re-verify FH-06, FH-07, FH-08, WM-01 and AP-07 (all "Partly fixed (11 Nov)") on iscoed; close AU-17 ("not reproduced") |
| **O. Owner packet** | PP, OR, FM, TR, WD | §4.1: about 12 rows across P0–P2 |

Beside each of the twelve large families, the answer to "is there a single mechanism?":

- **OR:** splits P, B, presenter and O. No single mechanism.
- **AR:** AR-01..AR-04 (the risk review's R1–R4) are named by no step. AR-21 is R.
- **CB:** D.
- **AU:** mostly deferred breadth. AU-15 (≈200 legacy objectives without `toward`) is a lint-plus-codemod, step 2′.
- **FH:** V and L.
- **CP:** content, and deferred.
- **WD:** step 7, generalizing the iscoed atlas slice.
- **NM:** R.
- **OA:** S, F, D.
- **OB:** a deployed cold play (OB-05, OB-17), plus K for OB-10.
- **AP:** K.
- **NP:** Sprint 3's prose against state, plus a sameness census (NP-10).

### 3.4 Proposed track order (fastest path to fewer live rows, still subordinate to play)

1. **Finish step 1** (= Sprint 4's core): OR-94 to its allowed set; one-projection's folds; digits through the row.
   ≈7 closed, ≈12 advanced.
2. **P: per-act cost.** No world moves, and two P0s.
3. **L: lead ≠ aim.** Starting from HP-01's template, then the lead as a record. World-moving: compat. ≈5 closed.
4. **R: one route finder, then per-leg travel in the page.** OPR-01 (P0), plus ≈8 advanced.
5. **2′: the lint's own findings fixed in data** (MT-11, MT-12), and AU-15's codemod.
6. **7, then 8,** each by its study proof.
7. **Close 2–6 now** on rule 2. Move their extensions to M23.

**Running beside, not in the track:**

- S (skipped specs) and V (the audit): a chore day, roughly 20 rows closed or sharpened with no code.
- B (browser sweep): on CI.
- D and F: the combat lane, beside SR-01.

---

## 4. The live P0 and P1 rows

### 4.1 Blocked on the owner or a human player

| Row | Pri | Blocked on |
|---|---|---|
| FH-01 | P0 | A person plays (owner recruits) |
| PP-05 | P0 | The owner reads and approves 30 passages (prose-comparison.md) |
| OR-75 | P1 | The owner reads the wagoner again (Gate 2) |
| FM-03 | P1 | The roadside meetings read aloud by the owner |
| OR-116 | P1 | A ruling: a kind (Spells, Items) unfolding to the right |
| SP-05 | P1 | A real iPad or WebKit device |
| TO-03, TO-06, IG-16 | P1 | An aesthetic verdict in motion. Each status is a bare "partly" |
| WD-02 | P1 | "The universal ten are a later decision" |
| FM-02 (part) | P1 | An independent review of the constellation art; its phone half is engineering |
| US-09 (part) | P1 | The builder's descent played by a person; its page journeys are engineering |

**Total: 2 P0 and 8–10 P1.**

- Also the owner's, at P2/P3: OR-10, OR-30, TR-03, OP-04, OPR-06, WB-07, R7-04.
- **Not owner-blocked, though they read so:**
  - CL-31: its atlas hold was lifted 18 Nov; it is now AT-02's.
  - OB-17: robots count, by the owner's 18 Nov ruling.
  - OB-05: the lead's browser lane.

### 4.2 Engineering: P0s

| Row | What is left (verified in its status) | Mechanism |
|---|---|---|
| OR-114 | An ordinary act takes 250–400 ms, a tenth of it the game: Itinerary.shown ~45 ms, PlayerView.observe twice, the narrator; Battle.state copies per read; no browser profile of a fight's start | P |
| OR-91 | (1) the worker's world read blocks creation's answer; (2) an aim-completing act takes 350–700 ms; (3) the page's per-turn cost not re-measured | P (2 and 3 are OR-114's cause) |
| OR-94 | 53 `<button>` in 28 files (counted today: `grep -rn '<button' web/reader --include=*.tsx \| wc -l` = 53; page-controls passes at that ceiling) | Presenter |
| OPR-01 | a1's debt after Ironkeep: the gold walks into open fields; test/gold-thread passes (8) but does not hold this case | R |

### 4.3 Engineering P1s, by shared mechanism (115 P1s less the owner's ~9)

| Mechanism | P1 rows |
|---|---|
| Presenter / one projection | OR-11, OR-71, OR-72, TB-01, TB-03, TB-09, TB-10, TB-11, AR-05, PB-02, FM-04, CL-07, CL-33, AP-07, OB-16, MT-01 (16) |
| P: cost | AX-03, AX-04, AX-05, SP-01, SP-02, OR-08, OR-23, OR-37 (8) |
| L: lead ≠ aim | HP-01, HP-02, FH-05, OR-74, US-07, T24-18, OR-60 (7) |
| R: route and travel | CL-34, OR-113, OR-112, TR-01, TR-02, FH-06 (6) |
| Danger (lone novice) | CB-01, CB-02, CB-03, CB-05, SI-01, SI-08, BP-07 (7) |
| Content and depth (the content thread) | US-10, OA-12, HP-03, BO-01, BO-04, BO-05, BO-07, R11-02, RI-01, RI-02, RI-03, RI-05, WD-07, SI-07, AI-07, ST-03, ST-04, ST-08, CL-32 (19) |
| Prose and painting against state (Sprint 3) | NP-01, NP-02, NP-03, CO-17, CO-03, OA-13, DN-01, DN-03, OR-69, WM-01, FH-07, FH-08, T24-19, T24-20, CL-01, CL-06, CL-10, CL-53 (18) |
| Promise fidelity (Sprint 3) | AP-01, AP-03, PB-24, CL-31 (4) |
| Browser measure | T24-05, OR-96, FM-01, OB-05, US-09 (5) |
| World composition (step 7 / the slice) | WD-05, WD-08, WD-09, WD-12 (4) |
| Off the first hour (candidates to re-home in M23) | GT-01, GT-03 (planes), CF-01 (casting-fiction audit), BL-06, TB-04, TB-06, TB-08 (terminal walk instruments), OB-17 (process) |
| Deferred P1s | NM-01, R10-01, CR-01 |

**Hygiene found among the P1s:**

- **Duplicates.** Close them into their parent:
  - BP-07's only remainder is "a lone mage's reckoning (CB-03)";
  - CL-53's only remainder, "beginning again as someone else", is TS-03 (deferred);
  - OR-60 is an umbrella: its (3) is CL-07, its (4) OPR-01, its (5) CO-03. Keep only (1) and (2).
- **Stale:**
  - ST-04's open line (above);
  - CL-31's blocker;
  - FH-06, FH-07, FH-08, WM-01 and AP-07 still read "(11 Nov)", from a1's round 6, not checked on the golden route;
  - seven P1s have a bare "partly" with no remainder, against planning-report §4 ready-item 8.

### 4.4 Ranked drill list

As in the summary: 1 P (OR-114, OR-91, AX-05) · 2 presenter (OR-94 and 6 P1) · 3 HP-01 · 4 route finder (OPR-01) ·
5 cold play 8 deployed (OB-05) · 6 lone-novice danger (SI-01, CB-03, AP-13) · 7 browser sweep on CI · 8 hygiene ·
9 owner packet.

Items 1, 3, 4 and 5 need no decision and move no P0 backwards. Item 3 moves worlds and is classified by compat.

---

## 5. The 63 deferred rows

### 5.1 Genuinely M23, with the reason

| Rows | Reason |
|---|---|
| CB-20, CB-23, CB-25, CB-26, AB-03 | Combat and SRD breadth (an arena, OSR riders, more than two teams, level-scaled damage). The plan pauses SRD breadth. **AB-03 still says "deferred to M22": re-home it** |
| NM-13, NM-14, NM-15 | New terrains, the sea, interior conventions: not on Iscoed's first hour (NM-15 unverified since 8 Nov) |
| AP-14, NP-08, NP-11, NP-12, SN-05 | Aesthetic or perceptual ambitions with no case in the seven cold plays |
| UI-10, UI-16, UI-17 | A design language and specimen page, a living interface (against DOCTRINE), a Company page waiting on formations |
| US-12, US-13, US-14, WM-06, CR-01, CR-02, PA-12, TS-01, TS-02, TS-03 | Offstage agency, semantic enrichment, careers and formations, a metropolis, philosophical schools: new systems the stop rule forbids |
| CP-06, CP-07, CP-09, CP-10, CP-11, CP-12, CP-17 | Content breadth (Orsino tables, item depth, natural history, the anthology, planes, a murder mystery, the encyclopedia) |
| AU-04, AU-07, AU-08, AU-12, AU-13, AU-14 | Authoring breadth. AU-07 and AU-04 are partly MT-05's; AU-12 is partly MT-04's |
| PR-03, TC-08, PA-07, PA-09, PA-10, PA-11, OB-04, OB-18, OB-19, OPR-07 | Save size (no obstacle measured), test-harness comforts, Phase B and C studies, the capstone map, ambitions, the owner's "creation's order unchanged" |
| R10-01 | Combat as a mode of the scene: a redesign the plan keeps out |

About 50 rows. NM-01 (P1, junctions) says "Left for M21 (11 Nov)", a home that has passed:

- It is world-moving and pairs with TR-03, the owner's choice of road speeds.
- Re-home it to M23 explicitly, or to the track once the owner chooses TR-03; compat now classifies it.

### 5.2 Cheap and touching the first hour: keep live

| Row | Why |
|---|---|
| **AP-13** | "A way into a room where a deadly band was seen carries no danger". Cold plays 6 and 7 both died to danger they did not see coming. The lurk marks (OR-12) and FightHelp (CL-52) exist to build on |
| **FF-05** | "Every act in the first quarter-hour is announced by something seen first": the same family as CL-58 (the waylaid camp, fixed 19 Nov). A bare "deferred" with no reason given |
| **FF-01** | Something in the undertown moves on without the company. It serves the owner's 19 Nov content thread ("a thread… for at least a day"; quests that circle back). Also a bare "deferred" |
| **CP-13** | Several notices read one by one. On the golden route: cold-5-log.md:8 and :18 found two, then three, notices at Gatesend's well. Fold it into HP-01's fix |
| **CP-04** | Likenesses against the person. A trust defect for Sprint 3's painting row. Since 11 Nov it has been met only partly, by test/likeness-sex (OR-30) |

### 5.3 Duplicates or already met

| Row | Disposition |
|---|---|
| CB-21 | Duplicate of AB-03 ("waits on AB-03") |
| AP-06 | Duplicate of OB-10's first failing pin (an authorable reach per facet), as its own status says |
| FF-07 | Duplicate of TS-03 (the dead character continuing in the country) |
| UI-08 | Duplicate of FH-01 / Gate 2 (a human's verdict on the resting scene; "names no defect for the code") |
| PB-18 | Duplicate of PA-11, "to M23 with PA-11 (Phase C's verb taxonomy)" |
| PA-12 | Subsumed by US-14 (starting forms of agency, beside careers) |
| FH-18 | Duplicate of RI-03 (different characters finding different things, by calling and skill) |
| CP-14 | **Met** in its own words: "every road meeting of the opening has a spoken ask in its talk"; the help-for-nothing remainder is a different ask |

Also seen among non-deferred rows:

- **AU-18 (P3, open) is MT-10's duplicate.** Its status, "registered, not built", is false since mt-6 built
  `kyrie lint --world`'s office lint (test/drawn-lint).
- **AU-17** leads "open (not reproduced; kept for re-check)". Close it as not reproduced.

**The tally:**

- 63 deferred: ≈50 M23, 5 keep live, 8 duplicates or met.
- From the rest of the register, ≈20 rows close by hygiene alone:
  - AU-18, AU-17, BP-07, CL-53, OR-60's carried parts, MT-02..MT-06;
  - re-verification of FH-06/07/08, WM-01 and AP-07;
  - OA-01..04 and OB-09, rewritten or deleted.

---

## 6. Specs run today (`bun test <path>`, one at a time, HEAD 781af0bec)

| Spec | Result | Time |
|---|---|---|
| test/small/register-count.test.ts | 4 pass, 0 fail | 0 s |
| test/small/hireling-viable.test.ts | 2 pass, 0 fail | 5 s |
| test/small/one-projection.test.ts | 21 pass, 0 fail | 4 s |
| test/small/page-controls.test.ts | 1 pass, 0 fail | 0 s |
| test/small/compat-kinds.test.ts | 6 pass, 0 fail | 0 s |
| test/small/why.test.ts | 5 pass, 0 fail | 1 s |
| test/small/dependents.test.ts | 3 pass, 0 fail | 2 s |
| test/small/clock-routes.test.ts | 3 pass, 0 fail | 0 s |
| test/small/company-pursuit.test.ts | 2 pass, 0 fail | 0 s |
| test/small/talk-again.test.ts | 4 pass, 0 fail | 2 s |
| test/small/check-once.test.ts | 2 pass, 0 fail | 1 s |
| test/barrow-forewarned.test.ts | 4 pass, 0 fail | 49 s |
| test/drove-reeve.test.ts | 2 pass, 0 fail | 34 s |
| test/drove-resumed.test.ts | 1 pass, 0 fail | 21 s |
| test/pans-shared.test.ts | 2 pass, 0 fail | 25 s |
| test/iscoed-roads.test.ts | 2 pass, 0 fail | 52 s |
| test/pans-cut.test.ts | 2 pass, 0 fail | 23 s |
| test/sea-gate-claim.test.ts | 3 pass, 0 fail | 70 s |
| test/iscoed-cold-four.test.ts | 9 pass, 0 fail | 34 s |
| test/iscoed-cold-six-vault.test.ts | 3 pass, 0 fail | 25 s |
| test/stories-apart.test.ts | 1 pass, 0 fail | 6 s |
| test/export-roles.test.ts | 5 pass, 0 fail | 1 s |
| test/iscoed-opening.test.ts | 5 pass, 0 fail | 38 s |
| test/drawn-lint.test.ts | 2 pass, 0 fail | 75 s |
| test/small/warned-take.test.ts | 1 pass, 0 fail | 0 s |
| test/small/creature-presence.test.ts | 1 pass, 0 fail | 1 s |
| test/small/fight-draught.test.ts | 1 pass, 0 fail | 1 s |
| test/small/every-blow-told.test.ts | 4 pass, 0 fail | 0 s |
| test/objects.test.ts | 8 pass, 0 fail | 1 s |
| test/owed-borne.test.ts | 1 pass, 0 fail | 9 s |
| test/small/healing-priced.test.ts | 1 pass, 0 fail | 0 s |
| test/glance-rules.test.ts | 11 pass, 0 fail | 0 s |
| test/neighbours.test.ts | 9 pass, 0 fail | 85 s |
| test/small/runner-labels.test.ts | 1 pass, 0 fail | 1 s |
| test/iscoed-cold-two.test.ts | 3 pass, 0 fail | 17 s |
| test/iscoed-cold-three.test.ts | 2 pass, 0 fail | 14 s |
| test/gold-thread.test.ts | 8 pass, 0 fail | 95 s |
| test/small/forecast-time.test.ts | 1 pass, 0 fail | 1 s |

All 38 files pass: 0 failures. One invariant is a deliberately failing pin, so its "pass" means it still fails as expected: test/small/one-projection:57 `it.failing("presses alike on the page")`, step 1 not met. Not run, by the one-heavy-job rule: iscoed-cold-five, the browser specs, compat.

