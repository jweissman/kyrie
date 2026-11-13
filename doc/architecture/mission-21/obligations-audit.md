# Mission 21: an audit of the obligations it inherited and took on

An independent reconciliation for the lead, made on 14 November 2026 (night). It was made by reading only: no suite,
browser spec, play or world generation was run. The tree read was branch `m21` at `3758b9c3`, with `main` at
`cc8186f2`, and the agents' branches `m21-look`, `m21-play` and `m21-rules` read beside them. Counts from
`bun scripts/register-state.ts` and `bun scripts/register-held.ts` were taken at `3758b9c3`. §31 (RI-01..05) was
committed while the audit was being made; it is included.

Each state below was checked against the code, the specs, or a commit. Where the register's status word and the code
disagree, the code is reported, and the disagreement is listed under register hygiene. Anything that could not be
verified by reading says so.

## Verdict

- **Obligations audited: 95.** They come from the M21 brief and completion plan, the M20 handoff and retrospective,
  the M19 closure, the owner's M21 direction documents, the findings ledgers, and the register's P0/P1 rows homed in
  M21 or earlier, plus the P2 rows that bear on them. Several rows group register ids that are one problem.
- **Verified done, or decided, and ready to close: 19.** Twelve of them still read open in the register.
- **Superseded: 2.**
- **Partly built: 45.**
- **Not started: 24,** plus three outcomes not met.
- **State unclear: 2.** A further seven are built enough to name, but whether they break the first hour needs a
  reproduction.
- **Gamebreakers on main as it stands: four,** listed below. Two of the four are already fixed on the aesthetic
  line's branch and have not reached main. **No new engine-level gamebreaker was found by reading.** The P0s that round
  13 found are fixed and held by specs.
- **The four M21 outcomes: none met.** The development loop is partly met. The other three are not met (`state.md`).
  The register's open P0s went from 1 to 8 since M20 landed, and its open P1s from 22 to 40, with 30 more P1s partly
  done. Most of the rise is new rows, M21's own and the owner's.

**The single largest finding is a merge backlog, not a missing feature.** Eighteen commits on `m21-look` (`ci/look-1`
to `ci/look-4`) are not ancestors of `m21` or of `main`. They include:
- the compass inside enclosed places (CN-02, CN-03);
- the interior walk in the browser (CN-08);
- the aim's person marked from `Glance.likenesses` (PL-32);
- one-choice pages (CN-09);
- creation drawn from `CreationFlow` (CN-10);
- the page's four drawn from `Glance.offer` (TB-02);
- the Pack as a book page, and the Encyclopedia (CN-11).

The lead's note of 14 November says look-2 is held because it carries look-1's lens-step regression. Meanwhile the
aesthetic line has moved on to the title (TO-01, uncommitted in `wt-m21-look`). What the owner plays at Pages lacks
all of the above.

## The gamebreakers, most severe first

"Gamebreaker" here means it stops or seriously misleads an ordinary player in the first hour, as `main` stands.

1. **CN-02 / CN-03: the world map opens from inside a building, and there is no compass (P0).**
   - The engine half is on main: `Itineraries.shown` offers nothing overland from inside, `Glance.enclosed` and
     `Glance.compass` exist, held by `test/small/compass`.
   - On main's page, `web/reader` has no `enclosed` handling at all (grep: no match). The rail's Map
     (`web/reader/stage/scene-rail.tsx:73-78`) opens the world map wherever the company is.
   - This is where the owner's play of 14 November broke down (`owner-continuity.md` §2). The way back is kept in
     sight wherever the company is enclosed (`7269438e`), which softens it.
   - The fix, `CompassStage`, is in `93cb4963` on `m21-look`, held there by `test/small/compass-stage` and
     `test/interior-walk-browser`. It is not merged.
2. **PL-32: the followed aim's person is drawn blue in the page, and is not in the foreground (P1).**
   - Round 13 found it in the page at 820 × 1180 (`playability.md` PL-32): at Merscstede, Lindal's pip read blue and
     only the rail's people icon was gold.
   - The contract `Glance.likenesses` is on main, held by `test/small/likenesses`.
   - The page's side, `ef24773f` (`WorldStage.seen` drawn from it), is on `m21-look` only.
   - It misleads on the one thread the game asks a new player to follow.
3. **T24-18 / PL-06: after two or three notice jobs, nothing pulls (P1).**
   - Ranks 1 and 2 of the successor are built (`src/presentation/succession.ts`, held by `test/small/aim-successor`).
   - Ranks 3 and 4, and "a larger adventure made the aim", are not.
   - Every cold round since 12 November reports it: round 12's review A, and round 13 ("after the oxen, nothing
     pulls"). It does not break the first fifteen minutes. It does break the claim of a worthwhile first hour
     (outcome 2).
4. **PL-14: in authored provinces, Follow this leads nowhere for about 56 aims (P1).**
   - The Lull's first aim is fixed. `test/small/aim-target-lint` and the lint list the remaining aims, each still to
     be given a target.
   - The twenty-one authored adventures stand as provinces of every first country (STATUS.md). A player who takes
     one up meets aims with no gold and no route.

**Unclear, and worth one reproduction each before they are ranked:**
- R9-04: the circus's wagons drawn as a town, and "Enter Lowmouth" setting the company down in Wapshott's field.
- OPR-03: the route preview before setting out. It is counted fixed as "not reproduced headlessly", and was never
  checked in the page.
- SP-01 / SP-05: start-up on a real iPad, never measured. Node's a1 set-out is about 6.5 s warm
  (`workflow-parity.md`); M20 measured 13–20 s in a browser.
- AI-02: a walk across a ford in spate fails, because `Journey.way` ignores `hazardous`. It is skipped in a spec; the
  same may be true in play.
- CB-04: placed road troubles kill a lone novice who fights. The placement report covers dens, not roads.
- AB-04: a fallen company left with nothing offered.
- The paintings that contradict state (row 18 of the table). Players say they stopped trusting what they saw. That
  does not stop play, but it is the most often repeated complaint without a line working on it.

## Slated for M21, but not on the radar

Each was promised for M21 by the M20 handoff, the M19 closure, an owner brief or the M21 brief, and has either no
register row or a row that none of the four lines is working on. The lines are working on:
- lead: TB and TM rows, terminal and engine contracts;
- playability: TB-04..06 and spec migration;
- aesthetic: TB-02's page side, the title (§30) and creation;
- rules: SRD proof slices, then §28.

Ranked by what each costs the first hour:

1. **Landing the aesthetic line's finished work** (see the verdict). Nobody's queue holds "merge look-1..4". The
   aesthetic line's queue is the title; the lead's is TB-10. Without it, CN-02, CN-03, CN-08, CN-09, CN-10 and PL-32
   stay unfixed on main, though built.
2. **Paintings against state** (R9-12, R10-08, R11-09, CP-01; §18 P4; review V1).
   - The M20 handoff ranked it first of what is still wrong (Part 2 §1).
   - The M20 cutoff's recommended order made it step 4 ("paintings audit").
   - The retrospective's aesthetic brief made it item 5 ("pictures as evidence").
   - No M21 commit, plan, or line touches it. The completion plan does not name it.
   - The cheapest step is the review's: a missing painting before a contradicting one.
3. **PD-14: two people on one fixed build, recorded** (FH-01).
   - The retrospective's process rule 1, and step 1 of the M20 cutoff's order.
   - `acceptance-guide.md` exists for the owner, but no session is set and no build is frozen for it. FH-01's home
     still reads "M20 close (gate)".
4. **The compact, tense expedition** (the brief's Phase 2, "restore the dramatic core"; the retrospective's
   acceptance scenario; the review's "one exemplary expedition", the hobs' toll-house).
   - It has no row, no document and no line. `grep -i 'toll-house\|tense expedition\|compact expedition'` over
     `mission-21/` finds only the brief.
5. **The external review's mitigations** (`history/missions/20/review-mitigations-2026-11-12.md`: P1–P3, U1–U3,
   C1–C2, A1–A2, T1–T2, D1–D3, V1).
   - The M20 handoff told M21 to read them alongside. The register mentions the review zero times.
   - Some are in effect: U1 through PL-05, 12, 13 and 23; A1 through the narrator's budget; D3 through the tended
     rule.
   - Not started: the departure reckoning (T1), interrupting only for a decision (T2), the combat diagnostic and the
     fight reconciled from events (D1, D2), the interaction contract for foreground people (C1), evidence provenance
     (U2, U3), and promise provenance with its diagnostic view (P1, P2).
6. **R10-01: combat as a mode of the scene** (amendment 6 E; step 5 of the M20 cutoff's order; P1). CN-06 gave the
   fight a stable composition. It is still its own page, and no line holds R10-01.
7. **Conversation depth** (R11-02, FH-15, FH-17, R10-15, AB-10, AU-05; P1).
   - It has recurred in every mission from M13 to M20.
   - M21 typed how talk is ranked and what it teaches (PL-15, `small/talk-learned`). No one is working on asking
     anyone but the giver about an aim, or on villagers with more than one stock line.
8. **SP-05: a real iPad and Safari.** P1, and a recurring commitment in six missions. Every M21 tablet check is
   Chromium at 820 × 1180. It is easy to fold into the owner's acceptance session.
9. **NM-01: road junctions** (P1; M20 handoff Part 3 §7). No code: "junction" appears only in `src/lang`. The
   acceptance guide lists it as known unfinished, but no line owns it.
10. **The second cold round on round 13's fixes, and the six starts.**
    - `playability.md:719`: "the fixes need a second cold player."
    - The completion plan's §2 evidence asks for six starts, headless and in the page, at desktop and iPad.
    - Round 13 had three headless starts and one page session. TB-06's matrix may cover the headless half; it does
      not cover the page.
11. **US-07 (PD-08): one record for heard, lead, aim and route** (P1, since M19). It is the retrospective's systemic
    cause 2. Pieces exist (`AimLeads`, `Compass`, `AimRoute.outward`), but no row is being worked as such.
12. **NP-02 / NP-03: perception-bound narration, and Notes against Story** (P1, deferred from M19 to M20, with no
    M20 record).
13. **AP-03: facets authored in Kyr** (P1). Violet is never drawn.
14. **The completion plan's own §5:**
    - a fourth state, "accepted in play";
    - a weekly line of opened, fixed, accepted and blocked.

    Neither is built: `scripts/register-state.ts:13-18` has no accepted class.
15. **The retrospective's engineering item 3: make the time budget fail for new files.** It is still reported and not
    failed (`scripts/test-summary.ts:39-41`).

## Handoff elements unresolved

What M20's handoff (Part 0 and Parts 2–5) and its retrospective asked to be settled, and where each stands:

| Element | Asked in | State now |
|---|---|---|
| Whether the way back is led with, or only kept in sight (PR-08, R10-09) | handoff Part 2 §3; register "M21 (decision)", "owner" | the owner's decision, not taken; the mechanism is on one rule (`7269438e`) |
| A heard-of town has no route line (R7-04) | register §16, "worth the owner's look" | not looked at |
| The Bound Howe's lead held to day 3 (AI-05) | register §17, "the owner's to move" | not moved |
| The skipped spec (AI-02) | handoff Part 0 | still `it.skip` (`test/silent-lord-turns.test.ts:92-96`); no M21 work |
| Kept started worlds for the six specs pinned to `standing: []` | handoff "first experiments" §4 | not found; `Kept.drawn` may supersede it (unverified) |
| Explain T24-11 | handoff "first experiments" §3; retrospective item 6 | **done** (`world/construction.md` §2; ten installs 31.6 → 14.2 s); the row still reads "a hypothesis to profile" |
| The parse store on CI (T24-10) | retrospective item 7 | **done** (`.github/workflows/ci.yml:35-42`); the row still reads open |
| `--no-isolate` on CI | retrospective item 9 | **done:** measured, gains nothing, not adopted (progress, 13 November, early) |
| Focus as an engine concept | retrospective item 8; the owner, 12 November night | partly: lens subjects in the engine (`77e8e75e`); `AtHand` still the page's for the split scene's Look |
| Boundary leaks: module-bundle apart from composition, kinds as the parser's argument, frozen cached parses | retrospective item 5 | partly: the parser imports no setting (`468e8c58`, `cc8186f2`), costs made visible (`2ea49419`); freezing parses not found |
| The risk review's immediate list: lifecycle assertions, cache telemetry, cache-on/off differential, a replay lane | handoff Part 3 §10 (AR-01, AR-03, PR-02) | `Costs` is telemetry of a kind; the rest not started |
| The review-mitigations and SRD briefings | handoff Part 0, "Read alongside" | the SRD one taken up (`rules/srd-fidelity.md`, `proof-slices.md`); the mitigations not registered (above) |
| Houseclean: worktrees and branches that could go once the integration landed | handoff Part 0, Part 5; `housekeeping.md` | not done: `wt-int`, `wt-review`, `wt-cold8`, `wt-headless`, `wt-m20` and `wt-before6` remain (`git worktree list`); `docs/consolidation` (in `.claude/worktrees`) and `gen-prose` unchecked; 40 remote branches, among them 22 `ci/*` and 6 merged `adventure/*`. Deleting remote branches needs the owner's permission |
| The successive green-pair standard (two independent players green on one fixed build) | retrospective A | not reached |
| "Registers kept at one grain, unverified apart from open" | retrospective G3 | about 80 rows still say "unverified since" a date before 10 November, and none has been re-verified in M21 |
| The narration budget spec marked failing | handoff Part 0 | **done:** `test/scene-sentence-budget.test.ts:49-53` are ordinary cases now |
| The M19 closure's deferrals | M19 `closure.md` §2.3–2.4 | all carried: each of its first-hour rows is a register row (M19-233 and M19-170 closed by E2/E3 and E43/E79; the rest as FH-04, FH-15, FH-18, NP-02, NP-03, NP-07, UI-07..09, AP-08, NM-08, NM-11, US-07, US-11, PR-03, CB-03, CB-09, CB-19, TC-02, TC-03, TC-05, AR-16, US-08). None dropped |
| The findings ledgers | `history/findings/gaps.md`, `briefs.md` | all 74 UNT ids are cited by register rows (grep, 74 of 74), so DC-02's "not carried" is out of date. Of 109 BRF requirements, the 36 the register does not cite are implemented or superseded, apart from BRF-41 and BRF-93 (process) |

## Register hygiene

**Rows whose status contradicts the code:**

| Row | The register says | The code says |
|---|---|---|
| CN-01, CN-05 | open (page) | lenses and the time lens in the resting column on main (`2b18f6ca`, merged `5345ccb0`). The owner's rule keeps them open until CN-08 is shown in play, but the text should say the page half is built |
| CN-06 | open | one fight composition on main, held by `test/fight-geometry-browser` at two sizes (`86a57fa3`) |
| CN-07 | the page's pip open | people marked neutrally on main (`86a57fa3`) |
| CN-08 | open | headless walk on main (`test/interior-walk`); browser walk on `m21-look` |
| GT-04 | open | thorn's descent re-recorded (`818159e2`, merged `0b879d5c`) |
| T24-10 | open | the parse store cached on CI (`ci.yml:35-42`) |
| T24-11 | a hypothesis to profile | explained and improved (`world/construction.md` §2) |
| T24-04 | open: proposal A | one choice row for every activity (`e248e719`) |
| T24-19 | open: the page's italics | stress set in italics (`e248e719`) |
| R10-12, R11-05 | open: balance, the lead's to rule | rule 1 built and held (`src/rules/tended.ts`, `test/small/tended`, `d63297c2`); only "a rest gives back every spell" is left |
| PL-07 | the at-will heal not addressed | addressed by the same rule |
| TM-01 | open | a walker with the budget (`scripts/terminal-walks.ts`, `test/small/terminal-walk`, `terminal/report.md`) |
| TM-02 | open | the terminal's half built (`small/terminal-walk`: "not the place again") |
| TM-03 | open | built (`small/terminal-colour`, `small/signs-shared`) |
| TM-06 | open | built (`26fe687f`, `test/creation-conformance`) |
| TB-03 | open | eleven action types in `src/presentation/offer.ts` (`bd011a34`) |
| AI-07 | no cold round on the integrated build | round 13 played main `bc5ab64c`, which is integrated; no module was played to an ending |
| T24-02 | held by the push lane | the push lane is gone (`2ce8c468`); the row is still fixed in spirit, but its evidence moved |
| DC-02 | not carried | carried by citation (74 of 74) |

**Fixed with no named evidence.** `register-held --list` gives 19 rows: FH-02, UI-06, UI-18, AU-17, PR-07, TC-01,
DC-01, AB-05, AB-13, R7-04, OPR-03, OPR-05, R9-01, R10-16, R11-11, T24-02, T24-07, PL-17 and PL-29. Several are counted
fixed only because a keyword matched:
- **OPR-03** and **R9-01** are "not reproduced", not fixed. OPR-03's rendered check was never made; R9-01's seed was not
  kept.
- **UI-06** and **R7-04** are "by design"; R7-04 awaits the owner.
- **FH-02** says the deployed build was never played (R10-06 says so too).
- **PL-17** and **PL-29** are data fixes with no spec.

**Duplicates.** One problem is held in several rows. Each group should become one row, citing the others:
- Paintings against state: R9-12, R10-08, R11-09, CP-01, §18 P4.
- Text against state: NP-01, R9-07, R10-11, R11-07, T24-16.
- Trivial fights: CB-01, R7-02, PL-07, with CB-08 for frequency.
- The at-will heal: R10-12, R11-05.
- The way back: PR-08, R10-09.
- After an aim, nothing pulls: T24-18, PL-06, US-05.
- Conversation depth: FH-15, FH-17, R10-15, R11-02, AB-10, AU-05.
- A calling that matters: R11-03, AB-09, FH-21, and now RI-03.
- Lenses rather than pages: T24-03, CN-01.
- The prose budget: TM-01, TB-04.
- Creation in the engine: TM-06, TB-09, CN-10.
- The false-promise corpus: AP-01, R10-03, §18 P1.
- Sustained search: AP-09 and the new RI-02.
- Empty exploration: AP-17 and the new RI-01.

**Rows with no owner or no When.**
- No row in the register names a line or a person. The owner field exists only in a few section headers (§27, §29,
  §30, §31). A column for the line would let `register-state` show who holds what.
- When is "—" on AP-01 (P1, partly), AI-01, AI-05 and R9-14, and "owner" on R10-09 (P1).
- 48 rows still homed "M20 close" are open, partly or unstated, FH-01 (the P0) among them.

**Unregistered.**
- `it.skip` in `test/repertory-2.test.ts:84,133` and `test/circus-journeys.test.ts:88,109`, there since the anthology
  merge of 7 November. No row or comment gives a reason.
- Round 13's P2 remainders (`playability.md:690-719`):
  - the mother kept off the crowded page (PL-28);
  - a nine-year-old in chainmail, and "Speak with Edda" naming nothing (PL-29);
  - the toll card's "The bar stays down" with no context, and the toll-reeve's likeness a woman's;
  - at phone width, the head running under the likenesses.
- "Listen at the corn-store padlock" (`playability.md`, human reports table).

**The register is still growing.** §31 (RI-01..05, three P1) was added during this audit. That is the "breadth over
closure" pattern `state.md` names, and it leaves the counts above moving.

## The full table

States:
- **done**: built and held by the spec named;
- **built**: built, with no spec named, or the spec is on a branch only;
- **partly**: what is missing is said;
- **not started**;
- **superseded**: by what is named;
- **decided**: a ruling stands, with nothing to build;
- **unclear**.

GB means gamebreaker. Lines: L is the lead, P playability, A aesthetic, R rules.

### M21's own outcomes and plan

| # | Id | Source | Promised | State, with evidence | GB | Disposition |
|---|---|---|---|---|---|---|
| 1 | O1 | brief, outcome 1; CP §1 | a much cheaper loop, slow suites managed | partly: quick lane 390 files in 16.5 s; whole suite each push, 16 shards, ~19–20 min wall, 216–229 job-min (`validation-plan.md`); target under 10 min; −30 % job-min not yet shown | no | M21, L |
| 2 | O2 | brief, outcome 2; CP §2 | fifteen coherent minutes across starts, credible first hour | not met: round 13 failed 2 of 3 starts before its fixes (`playability.md:684-719`); no second cold player; the owner's play broke down | the gate | M21, P (second cold round on main after look-1..4 land) |
| 3 | O3 | brief, outcome 3; CP §3 | presentation markedly better, judged in play | partly: on main, one choice row, the narrator's budget, lenses in the column, the fight's composition; 18 finished commits on `m21-look` not on main; the per-scene screenshot set incomplete | no | M21, A |
| 4 | O4 | brief, outcome 4; CP §5 | P0s gone from accepted flows, P1s reduced | not met: P0 open 8, P1 open 40, partly 30 (`register-state` at `3758b9c3`); 1 and 22 when M20 landed | — | M21, L |
| 5 | PH0 | brief, Phase 0 | five real defects as cheap regressions on engine semantics | done: `test/small/` and `test/support/tiny.ts` (progress, 12 November, night; each checked against its fault) | no | close as done |
| 6 | EXP | brief, Phase 2; retrospective "Play"; review-mitigations "one exemplary expedition" | a compact, tense expedition: light, time, supplies, injury, companions, treasure; two builds differ | not started: no row, no document | no | M21, P, as a TB-06 walk; else defer to M22 by an explicit ruling |
| 7 | RETRO | brief, "Project retrospective" | debt accountability; register reconciled; branches identified conservatively | partly: `debt.md`, `register-state.ts`, `register-held.ts`; houseclean not done (#29) | no | M21, L |
| 8 | CP1.1 | CP §1.1 | an audit of the expensive specs | done: `scripts/spec-audit.ts` → `spec-audit.md` (393 files; 2,119 of 2,546 cases local) | no | close as done |
| 9 | CP1.2 | CP §1.2 | the top 150 files' local assertions moved to tiny worlds | partly: about 90 ports (`state.md`); `ombra-local` still 584 s (`spec-audit.md`) | no | M21, every line (P leads) |
| 10 | CP1.3 | CP §1.3, the scope table | per-relation version stamps; cheaper composition (Experiment B steps 4–5) | not started; the scope decision not taken | no | decide now; likely M22 (it touches the world's core) |
| 11 | CP2.4 | CP §2.4 | combat that works and reads | partly: unusable acts said (`6407f263`, `small/fight-unusable`); fight states (`f0a0cdd2`, `small/fight-states`); turning points told: not found | no | M21, P |
| 12 | CP5 | CP §5 | an "accepted in play" state; a weekly retirement line | not started (`scripts/register-state.ts:13-18`) | no | M21, L (cheap) |
| 13 | SCOPE | CP, "Needing an explicit scope decision" | late binding; version stamps | undecided (level-scaled damage and the challenge table were decided for M22) | no | owner and L to decide |

### The M20 handoff and retrospective

| # | Id | Source | Promised | State, with evidence | GB | Disposition |
|---|---|---|---|---|---|---|
| 14 | FH-01 / PD-14 | handoff Part 0 §2; retrospective G1; the M20 cutoff's order, step 1 | a person accepts the first hour; two humans on one fixed build | not started as a session; `acceptance-guide.md` written; FH-01 homed "M20 close (gate)" | the gate | M21, L: freeze a build after look-1..4 land, then the owner's session on an iPad |
| 15 | R10-06 | §21 | the deployed build played by an agent | not done: round 13 played main locally | no | M21, P (cheap) |
| 16 | AI-07 | §17 | a cold round on the integrated build, into a module | partly: round 13 on `bc5ab64c`; The Lull and Tessary 4–10 commands; no module to its end | no | M21, P (TB-06) |
| 17 | PR-08 / R10-09 | §19, §22; handoff Part 2 §3 | the owner's decision on leading with the way back | partly: kept in sight wherever enclosed (`7269438e`, `small/compass`); decision open | no | owner, with CN-02's acceptance |
| 18 | PAINT | handoff Part 2 §1; R9-12, R10-08, R11-09, CP-01; review V1 | paintings that do not contradict state | not started in M21 (only E207's hour, from M20) | unclear (trust) | M21, A: V1's rule (compatible, else a plate, else none) |
| 19 | MITIG | handoff Part 0, "Read alongside" | the review's P1–V1 mitigations | partly in effect (U1, A1, D3); T1, T2, D1, D2, C1, U2, U3, P1, P2 not started; 0 register rows | no | L: register them; most to M22 with the reason "new contracts" |
| 20 | FOCUS | retrospective item 8 | focus as engine state for every client | partly (`77e8e75e`, `Lensed.subjects`); `AtHand` still the page's | no | M21, L |
| 21 | NOISO | retrospective item 9 | `--no-isolate` on CI measured | done: no gain, not adopted (progress, 13 November) | no | close as done |
| 22 | KEPT | retrospective item 2 | kept prefixes for `ombra-local`, then 49 more | partly: `test/support/kept.ts`, −17 %; `Kept.drawn`, `Keep.at` | no | M21, L |
| 23 | BUDGET | retrospective item 3 | over-budget specs fail, with an allow-list that shrinks | not started (`scripts/test-summary.ts:39-41`) | no | M21, L (cheap) |
| 24 | LEAKS | retrospective item 5 | bundle loading apart from composition; kinds as the parser's argument; frozen parses | partly (`468e8c58`, `cc8186f2`, `2ea49419`) | no | M21, L |
| 25 | T24-10 | §24; retrospective item 7 | the parse store on CI | done (`ci.yml:35-42`); row stale | no | close as done |
| 26 | T24-11 | §24; retrospective item 6 | explain the quadratic install | done (`world/construction.md` §2, `world/tools/t24-11.ts`); row stale | no | close as done |
| 27 | STARTED | handoff "first experiments" §4 | kept started worlds for six specs | not found | no | close as superseded by `Kept.drawn` if it covers them (unverified) |
| 28 | AI-02 | §17; handoff Part 0 | the forged remission's walk over a ford in spate | not started; still skipped (`test/silent-lord-turns.test.ts:92-96`) | unclear | M21, P: reproduce in play |
| 29 | HOUSE | handoff Part 0, Part 5 | remove merged worktrees and branches | not done (see "Handoff elements unresolved") | no | L, with the owner's permission for the remote branches |
| 30 | RISK | handoff Part 3 §10 (AR-01, AR-03, PR-02) | lifecycle assertions, cache telemetry and differential, a replay lane | partly: `src/costs.ts`; the rest not started | no | defer to M22: no player symptom; the brief's limits |
| 31 | NARR-SPEC | handoff Part 0 | the narration budget spec passing | done (`test/scene-sentence-budget.test.ts:49-53`) | no | close as done |
| 32 | GREEN-PAIR | retrospective A | two independent players green on one build | not met | the gate | with #14 |

### Register rows: continuity, title, terminal and planes (§26–§31)

| # | Id | Source | Promised | State, with evidence | GB | Disposition |
|---|---|---|---|---|---|---|
| 33 | CN-01 | §26 | lenses rerank four within the scene, taking no time | partly: engine `small/lenses`; page on main (`2b18f6ca`); not shown end to end | no | A; fix the row's text |
| 34 | CN-02 | §26 | no world map inside; the way out unmistakable | partly: engine on main (`small/compass`); page fix `93cb4963` on `m21-look` only; main's `web/reader` has no `enclosed` | **yes** | M21, A to land; L to clear look-1's regression |
| 35 | CN-03 | §26 | a local compass inside | built on branch (`CompassStage`, `small/compass-stage` on `m21-look`) | yes (with CN-02) | M21, A |
| 36 | CN-04 | §26 | every world-action surface on one action system | partly: census (`aesthetic/census.md`); link-like rows remain (census row "Resting scene: the way back") | no | M21, A |
| 37 | CN-05 | §26 | Wait as a time lens | partly: page on main (`2b18f6ca`), engine `small/lenses` | no | A; fix the row's text |
| 38 | CN-06 | §26 | the fight's stable geometry | done for desktop and tablet (`test/fight-geometry-browser`, `86a57fa3`); phone is T24-06 | no | close the page half once CN-08 is shown |
| 39 | CN-07 | §26 | no pip for being a person | done: engine `small/person-aspects`; page `86a57fa3` | no | close as done |
| 40 | CN-08 | §26 | one interior scenario end to end, desktop and iPad | partly: `test/interior-walk` on main; the browser walk on `m21-look` only | no | M21, A + P |
| 41 | CN-09 | §26 | one-choice pages are no webapp buttons | partly: engine `small/prologue-pages` (`e9e709df`); page `85011849`, `4b8ee734` on branch | no | M21, A |
| 42 | CN-10 | §26 | creation by the engine's flow, the kind of life only | partly: `CreationFlow`, `small/creation-flow`, `test/creation-conformance`; the page's own steps remain (`workflow-parity.md`); `59c5e944` on branch | no | M21, A |
| 43 | CN-11 | §26 (P2) | the Encyclopedia in parchment and ink | built on branch (`e5947f78`) | no | M21, A to land |
| 44 | TO-01..03, TO-06 | §30 | the title in the game's language; motion behind it; one passage; judged in motion | partly: uncommitted in `wt-m21-look` (`title-page.tsx`, `frame.css`, an untracked `zz-title-browser` spec) | no; the owner bounced here, but it stops no one | M21, A, after landing #34–#43 |
| 45 | TO-04 | §30 (P2) | the observatory | partly: engine side on `m21` (`87d9d584`, `data/imbar/sky.json`); no page | no | M21, A, after TO-01 |
| 46 | TO-05 | §30 (P2) | expressive interactions with things | not started | no | M22, as homed |
| 47 | TM-01 | §27 | a walker that fails over three sentences | done (`scripts/terminal-walks.ts`, `small/terminal-walk`, `terminal/report.md`: 2.67–3.00); only 2–6 arrivals a walk | no | close; continue as TB-04 |
| 48 | TM-02 | §27 | no repeated static context | done for the terminal (`small/terminal-walk`); page `2660e8d3` on branch | no | close the terminal half |
| 49 | TM-03 | §27 | ANSI colour as the atlas | done (`small/terminal-colour`, `small/signs-shared`) | no | close into TB-01 |
| 50 | TM-06 | §27 | the terminal makes the whole life | done (`26fe687f`, `test/creation-conformance`) | no | close as done |
| 51 | TB-01 | §29 | one projection, held by a parity spec | partly (`creation-conformance`, `small/offer-four`); no general parity spec | no | M21, L (in hand) |
| 52 | TB-02 | §29 | four promoted on every surface | partly: engine `Offer` (`bd011a34`), `small/creation-four`; page `a5198483` on branch; talk and the fight hand still the clients' (`workflow-parity.md`) | no | M21, L + A |
| 53 | TB-03 | §29 | a taxonomy of action types | built: eleven in `src/presentation/offer.ts`; row stale | no | L: close or narrow |
| 54 | TB-04..06 | §29 | blind walks, a stdio runner, a matrix | partly: runner `73493374` and its first find `0dcd2c51` on `m21-play` only | no | M21, P (in hand) |
| 55 | TB-07 | §29 (P2) | a small System 1 model | not started | no | defer to M22 (research) |
| 56 | TB-08 | §29 | information design shown by walks | partly (`0dcd2c51`) | no | M21, P + A |
| 57 | TB-09, TB-10 | §29 | workflows the engine's; the terminal plays by its frames | partly (`26fe687f`); TB-10 not started | no | M21, L (in hand) |
| 58 | GT-01..03 | §28 | planes that differ; Plane Shift; the tour as specs | not started | no (past the first hour) | M21, R after the slices; else M22 |
| 59 | GT-04 | §28 | thorn's descent regression | done (`818159e2`, merged `0b879d5c`); row stale | no | close as done |
| 60 | RI-01..05 | §31 (added during this audit) | a place worth returning to; earned instruments | not started | no | check against the brief's limits; RI-04 to M22 |

### Register rows: guidance, play and content (§1–§25)

| # | Id | Source | Promised | State, with evidence | GB | Disposition |
|---|---|---|---|---|---|---|
| 61 | PL-32 | §25 | the aim's person marked from the engine | partly: `small/likenesses` on main; page `ef24773f` on branch | **yes** | M21, A to land |
| 62 | T24-18 / PL-06 | §24, §25 | a larger adventure once the town's jobs are done; ranks 3–4 | partly: ranks 1–2 (`small/aim-successor`) | **yes** (for the hour) | M21, P: rank 3, a region-history lead after two jobs |
| 63 | PL-14 | §25 | every authored aim has a target | partly: the Lull's first; about 56 left (`small/aim-target-lint`) | **yes** (in provinces) | M21, L: author the lint's list, the first aim of each province first |
| 64 | OPR-01 | §19 (P0) | gold only on the followed aim's next step | done: `small/gold`, `small/gold-thread`, `small/gold-at-the-place`, `gold-fight`, `gold-doors`, `gold-lead`, `gold-step-room`, `debt-purse`, `gold-site`, `debt-chain` | no | close as done |
| 65 | OPR-02 | §19 (P0) | a place in one's own hex is not reached across the country | done: `small/own-hex`, `small/own-hex-engine` | no | close as done |
| 66 | OPR-03 | §19 | a route preview before setting out | unclear: "not reproduced headlessly"; never checked in the page | unclear | A: check in CN-08's browser walk |
| 67 | AP-01 | §4 | a false-promise corpus | partly (`gold-walk`, `small/signals`, `signal-inside`); no corpus; When "—" | no | M21, P (TB-06's matrix as the corpus) |
| 68 | AP-02 | §4 | atlas states as engine data | partly: faint and idle projected (`src/presentation/glance-types.ts:79-125`) | no | M21, L |
| 69 | AP-03 | §4 | facets authored in Kyr | not started | no | defer to M22: a new authoring capability |
| 70 | AP-07 | §4 | key acts not one menu deep | partly (Offer's four, lenses) | no | fold into TB-02 |
| 71 | AP-17 | §4 | ordinary exploration not empty | partly (rovers) | no | fold into RI-01 |
| 72 | CB-01 / R7-02 / PL-07 | §2, §16, §25 | first fights that are not trivial | partly: a1 at 11/20/8 trivial/fair/lethal (`placements-a1`, `region-stock-numbers`) | no | M21, R; make these one row |
| 73 | R10-12 / R11-05 | §22, §23 (P2) | no at-will healing between fights | done for the cantrip (`test/small/tended`, `d63297c2`); "a rest restores every spell" left | no | close as done, keeping the remainder |
| 74 | CB-02 | §2 | a reliable reckoning of a fight | partly, since 11 November | no | M21, R |
| 75 | CB-03 | §2 | the lone caster or thief | decided: no change to the calling; every lethal group told at the door (`deep-sounds-ambush`) | no | close as decided |
| 76 | CB-04 | §2 | road troubles a lone novice can live through | not started in M21 | unclear | M21, R: add roads to the placement report |
| 77 | CB-08 | §2 | danger that is not thin in exploration | open | no | fold into RI-01 and TB-06 |
| 78 | FH-15 / FH-17 / R11-02 | §1, §23 | talk as an exchange; any villager asked about the aim | not started beyond `small/talk-weight` and `small/talk-learned` | no | M21, P: one substantive person per first town; the rest M22 |
| 79 | FH-05..08 | §1 | aims piling up; Go…; the fold; the town's threads | partly since 11 November; not re-verified; homed "M20 close" | no | P: re-verify by walk, then close or re-home |
| 80 | FH-03, US-14, UI-17 | §1, §6, §7; `owner-adventure-to-career` | an in-medias-res opening, careers, a Company page | not started | no | defer to M22: the brief's limits; the roadmap was "not an M20 mandate" |
| 81 | NM-01 | §3 | road junctions | not started (no road junction in `src/`) | no | defer to M22: routes are walkable; a generation change re-seeds traces |
| 82 | NM-12 | §3 | play as a world moved through | superseded by CN-01..08 | no | close as superseded |
| 83 | NP-01 | §5 | prose that fits the moment | partly (`small/sky`, `small/sky-lint`, `small/torch-out`) | no | M21, P |
| 84 | NP-02 / NP-03 | §5 | perception-bound narration; Notes against Story | not started (since M19) | no | defer to M22: no line, and M19's attempt was reverted |
| 85 | US-07 (PD-08) | §7 | one record for heard, lead, aim and route | not started as such | no | M21, L: name the record; build in M22 |
| 86 | US-09 / US-10 | §7 | a dungeon found and the route rendered; depth and reward | partly | no | M21, P (CN-08, TB-06) |
| 87 | WM-01 | §8 | the world remembers (the sergeant's speech) | partly (`small/near-dead`) | no | M21, P |
| 88 | SP-01 / SP-05 | §10 | start-up; a real iPad and Safari | partly (Node a1 4.7–6.5 s warm); the browser and iPad not re-measured since M20 | unclear | M21, L: one measured iPad session with #14 |
| 89 | SP-02 | §10 | lazy materialization | partly (230k → 33k facts) | no | defer to M22 (Experiment B steps 4–5) |
| 90 | AR-05 | §11 | no text inference in the page | partly (typed talk roles, the roll, the calling, learned, act; 32 regex tests counted) | no | M21, L |
| 91 | AI-03 / AI-04 / T24-03 | §17, §24 | timings for new specs; a busier first green; Go and Look as pages | superseded: timings from JUnit (`scripts/timings-from-junit.ts`); the narrator's budget (T24-05); CN-01 | no | close as superseded |
| 92 | T24-04 / T24-19 / T24-20 | §24 | one menu style; review B; Common names | done: `e248e719` (one row, italics); T24-20 held by `test/old-names`, `old-names-a1` (`03776153`) | no | close; keep "a human country's name in Common" as a P3 |
| 93 | R9-04 | §20 | the circus not read as a town | not started | unclear | M21, P: reproduce |
| 94 | R10-01 | §21 | combat as a mode of the scene | not started (CN-06 is geometry only) | no | the owner to rule: fold into CN-06's acceptance, or defer to M22 |
| 95 | AB-04 | §16 (P2) | a fight not fought for the player; a fallen company not left with nothing | partly: journeys' fights are the player's (PL-02, `small/journey-fight`); what a fallen company is offered not verified | unclear | M21, P: reproduce |

The tally, by row:
- **Done or decided (19):** #5, 8, 21, 25, 26, 31, 38, 39, 47, 48, 49, 50, 53, 59, 64, 65, 73, 75 and 92.
- **Superseded (2):** #82 and #91.
- **Not met (3):** #2, #4 and #32.
- **Not started (24):** #6, 10, 12, 13, 14, 15, 18, 23, 28, 29, 46, 55, 58, 60, 69, 76, 77, 78, 80, 81, 84, 85, 93 and
  94.
- **State unclear (2):** #27 and #66.
- **Partly (45):** the rest.

The four "yes" rows are #34–#35 (one fault), #61, #62 and #63. The seven where the gamebreaker is unclear are #18, 28,
66, 76, 88, 93 and 95.

## What to do first, if the lead wants an order

1. **Land the aesthetic line's finished batches.** Clear look-1's lens-step regression, then put `ci/look-2` to
   `ci/look-4` through the suite. That fixes two of the four gamebreakers (CN-02/03, PL-32) and moves CN-08, CN-09,
   CN-10 and TB-02 to "shown in play".
2. **Correct the stale statuses (the 19 rows of the first hygiene table) and merge the duplicates.** This is an hour of the lead's time, and
   it makes `register-state`'s P1 count truthful.
3. **Freeze that build and hold the owner's session** (FH-01) on an iPad, with the acceptance guide, and with a second
   cold agent on the same build.
4. **Then T24-18 rank 3 and PL-14's list,** the two gamebreakers that remain, before the title work (TO) or §31.
5. **Write the explicit deferrals into the register:** paintings V1 (or a commitment), R10-01, NM-01, NP-02/03, AP-03,
   the review's mitigations, and the compact expedition. Each with its reason, so that "not on the radar" becomes
   "deferred, and why".
