# The maturity track: next steps toward register zero

19 November 2026. Read-only planning, done in `/var/tmp/kyrie/wt-m21` at `7e92d1e5a` (branch m22). No code, data or
specs were changed. The register stands at 423 live rows (190 open, 192 partly, 41 deferred) and 6 live P0s (FH-01,
PP-05, OR-91, OR-94, AT-04, AT-07), per `bun scripts/m22-status.ts` and `register-state.ts`. Specs run, one at a
time: test/small/page-controls (3 pass), one-projection (21 pass, no `it.failing` left), opportunity-support (3 pass),
riddle-focus (5 pass), atlas-perception (7 pass, OB-10's three pins still `failing` as pinned).

## Recommendation

Start with a close-out. Today's landings closed more than the register says, so three of the track's own steps can
close by rule 2 with no code.
- Step 1's two invariants now hold: one-projection has no `it.failing`, and page-controls pins an allowed set by name.
- Step R is finished.
- AT-07's M22 part is done.

Closing them takes **TB-12, MT-01, CL-34 and OR-94 (P0)** off the live list, and splits **AT-07 (P0)** and **OR-91 (P0)**
so each has an M23 or browser-lane remainder.

Next, land **mt-8's MT-12 commit** on its own. Its compat run moved no row, line or save. Hold only its layout commit
(MT-11).

Then do **L in its smallest form**: a data change to the undertown's notice, not a lead record.
- It closes HP-01 and FH-05.
- Do it in the same compatibility run as MT-11's layout and the undertown's two remaining stairs. The same template and
  the same world-moving class make that one compat classification and one CI run, and close MT-11 too.

After that, the one-line `review record --roll` fix from AT-09. It unblocks the skipped-spec chore, mechanism S: OA-01
to OA-04 and OB-09, five rows. It also unblocks S3-0's clean recorded run.

Step 7 only as **7a**, offices written as facts. It is additive, closes MT-10, and is the substrate that SS-01 and PG-01
both assume. Step 8 and step 7b (binding a situation to a resident) move to M23.

The first five steps close about **15 rows, 2–3 of them P0**, all inside the first hour or the track's own rows. No new
system is involved.

## 1. Candidate steps, counted from row texts

"Closes" means the row's stated remainder is wholly the step's. "Advances" means part of it is. Sizes are lines of code
and spec together: XS under 30, S under 150, M under 400, L over 400.

| # | Step | Closes (live rows) | Advances | Size | Moves worlds? |
|---|---|---|---|---|---|
| V | **Close-out by verification** (see §4–5) | **TB-12, MT-01, CL-34, OR-94** (P0); AT-07 (P0) and OR-91 (P0) split | AR-20, OR-11, AR-22 (carried as their own rows) | XS (register text; optionally delete `Wayfinder.View`'s `way-row`, the page-controls `unreached` entry) | No |
| 2′a | **Land mt-8's MT-12 commit** (`e1f79b09c`) and the drawn-choice reading (`e9fffb8c0`) | **MT-12** | MT-02's seven acts read | XS (cherry-pick; regenerate the bundle) | No. Its compat run: "no row, line or save moved" |
| L | **A notice gives a lead, not three aims** (undertown template) **+ MT-11** (`6daa0989c` and undertown's `u_vault_stair`, `u_deeper`) | **HP-01** (P1), **FH-05** (P1, once its "lingering" clause is re-checked), **MT-11** | OR-74 (its "jobs off a notice listed rather than held" clause), CP-13, FH-04, S3-3, OR-60 | S–M (~150: 5 Objective lines and the notice's comment, `origins.ts`'s `work_told`, 4 specs and a fixture, the beat map again) | **Yes.** Aims and rows change in every drawn world with a notice; MT-11 moves layout only. Run `compat --base` (full) |
| S′ | **`review record --roll`**, then the skipped-spec chore | **OA-01, OA-02, OA-03, OA-04, OB-09** (the last on the nightly lane) | S3-0, AT-09 | XS for the fix; S per spec rewritten (or deleted with a reason) | No |
| P′ | **OR-91's headless remainder** under 150 ms an act | OR-91's headless half (the browser half moves to lane B) | AX-05 | M | No ("hash for hash", as perf-p0 kept it) |
| 7a | **Offices declared as facts**: the town generator writes canon's `holdsOffice`, and the office lint reads it in place of titles | **MT-10** | MT-07, WD-02, CP-08, SS-01, PG-01 | S–M | Additive: facts only, classified additive |
| W | AT-09's `review` fields (`why`/`note`, `withdrawn`) and `--why fact` on a fact that does not hold | none outright | AT-09, S3-2 (silently shut alternatives), MT-04's extension, OA-11 | S + S | No (command line only) |
| 7b | A situation binds a generated resident (the drove's Reeve Annis Talfryn is Porthalen's reeve) | **MT-07** | WD-16 (still needs cross-country runtime facts) | L | **Yes**, and replay-breaking on iscoed's golden route |
| 8 | Declarative placement | MT-08 | OR-66 (an owner decision, "scheduled apart"), WD-13, WD-03 | L | Yes |

### Each step's proving slice and construction invariant (the track's rule 2)

- **V.**
  - Slice: the speaking door, pressed alike on page, runner and terminal. This is `GlanceStage.acted` (web/reader/stage/glance.tsx:534), which now asks `Doable.one`; ad68847e1 removed the first-row guess.
  - Invariants: one-projection's "presses alike on the page", now a pin, and page-controls' named allowed set (820dc9ec0). Both pass.
- **2′a.**
  - Slice: `career__dragon` toward the march of the first country on the dragon's side (`Career.way`), and the fellowship's carry toward its head.
  - Invariant: test/career-world, plus `kyrie lint --world` with no `target` warning on a1, iscoed or kite.
- **L.** The cause is in data/generation/town/undertown.kyrt:238, 345, 422, 589 and 694. Each `Objective {t}_u_*_job_sought` is held as soon as `knows(party, {t}_u_notice)` holds. Reading the notice (`RegionUndertown.notice`, src/world/region-undertown.ts:51) or hearing the inn's `work_told` rule (src/world/origins.ts:310–314, the wanderer's) teaches that fact.
  - **The change, with no new record.** Reading the notice teaches the notice, a fact the Notes already list. The jobs stay on it by name. Each job's aim arises when its giver is asked, which `_job_aim when given` already does. Optionally, one data-only `Action` at the post ("Take up the notice's work") makes the single deliberate keep. Each giver's topic (e.g. `{t}_u_rats_job_ask`, :374) is offered without the notice, so all three jobs can still be found.
  - Slice: cold play 5's mage at T1. The aim count stays 1, not 4 (beat-map.md, 19 Nov). Asking Mik then gives the rats aim.
  - Invariant: a spec on a drawn first town. Reading the notice adds no Objective. Asking each giver adds exactly that job's aim. Every job's giver and topic stays reachable.
  - Also fold the two "held" filters into one. `AimWords.held` (src/presentation/aim-words.ts:18) re-implements `Undertakings.held` (src/presentation/undertakings.ts:27) for `PlayerView`. Then no client can count a lead as an aim by its own test.
  - Note: `Undertakings.folded` (:110, :116) keys on the id suffix `/_sought$/`. Deleting the job `_sought` lines leaves its other users (works' `_sought`) unchanged, but this lexical rule should be named in the row.
- **S′.** `JourneyCapture.start` (src/cli/journey-capture.ts:33) returns the session and never calls `j.roll`. `PlayTool.main` (src/cli/play-tool.ts:131) and `again` (:102) both call it, so `review record --roll` is parsed and then dropped.
  - Slice: the drove's ink before the reeve, recorded with `--roll pass`. AT-09 could reach it only through `kyrie play`.
  - Invariant: a small spec in which a review with `--roll pass` passes a check that fails without it.
  - The rewrites need it: OA-02's journey turns on "the morning's dice".
- **P′.**
  - Slice: `scripts/act-costs.ts` on cold plays 4–6. The ordinary-act median is under 150 ms (today 163–191).
  - Invariant: the existing counts, test/small/screen-once and ways-kept, plus one more for the costs perf-p0 found and did not take. That is the offered actions' `at` re-read, about 25 ms an act.
- **7a.**
  - Slice: Porthalen's two reeves found by `holdsOffice` facts, not by words.
  - Invariant: test/office-lint with titles stripped, which finds the same two; plus a compat run classified additive.

## 2. Recommended order (the next five)

Everything below comes after the owner's P0s. AT-04's remainder is still the Atlas: the blank first row, and the
focused quarter with no "Leave it for now". Sprint 3's S3-0 to S3-5 run beside it. The stop rule holds throughout: L
is template data and one optional authored act, not a quest or lead system.

1. **V: close-out** (XS, no code). 4 closed, 2 P0s split. It also corrects the register: OR-94's row still says 53
   buttons in 28 files, and the code has 35 in 22 (`grep -rn '<button' web/reader --include=*.tsx`).
2. **2′a: MT-12** (XS). 1 closed, no world moves.
3. **L + MT-11** (S–M, one compat run, one pushed CI run). 3 closed, 4–5 advanced. All of it is first hour: HP-01 is
   S3-3's first defect.
4. **S′: `--roll`, then OA-01 to OA-04 and OB-09** (XS, then S each). Up to 5 closed. It also serves S3-0's eight-beat
   record.
5. **7a: offices as facts** (S–M, additive). 1 closed, and it is the first general step toward standing as facts
   (SS-01 §"standing is facts"; PG-01).

P′ (OR-91's headless half) can replace 5 if the owner rates per-act cost above the office lint. It is the only
remaining P0 among these, but its size is M for one row.

## 3. Today's research: small track steps or M23

| Finding | Where | Verdict |
|---|---|---|
| AT-09 (1a): `review record --roll` dropped | journey-capture.ts:33 | **Track, now** (S′). Its cause is a one-line bug. |
| AT-09 (1b): `ReviewChoice` keeps the led `why`/`note`; each frame lists `withdrawn` rows | review-types.ts:24–25; glance-types.ts:67–100 | **Track, small** (W, an extension of step 4). It is S3-2's instrument for alternatives closed silently. |
| AT-09 (2): `--why fact` on a fact that does not hold names each writer's first unmet `Requires` | why-dependents.ts:68 (`WhyDependents.uses`); why-fact.ts:100 ("no step changed it") | **Track, small** (W). It needs no grammar. |
| AT-09: aspects say why a row is led, not what it means (cost, irreversibility, acts of care drawn as `own`) | aspects.ts:13, 35–39; promotion.ts:372 | **M23** (with AT-02's flagged experiment). A new carrier for cost would be a new Atlas facet, and the hold forbids a sixth hue. |
| Opportunity architecture §5, steps 1–4 | landed today: 6e5095783, 32930b5ec, c0a8cf7ff, ad68847e1, f4ecf598c | **Done.** Close AT-07's M22 part. |
| §5 steps 5–7: the Offering tree, the `Known` facade, `--why indicator` | — | **M23**, as the review says. Open one M23 row for them when AT-07 is split. |
| SS-01: a two-faction kit on Iscoed (1–2 days, no engine change) | ss01 §"smallest experiment" | **M23.** A faction kit is what the stop rule forbids in Sprint 2/3. |
| SS-01: a seeded actor order in `CampaignTick.npcs` (~20 lines) | ss01 §3 | **M23.** It changes every drawn world's NPC decisions (world-moving) and no live first-hour row needs it. |
| SS-01: `holdsOffice` is written by nothing | ss01 §"Actors" | **Track: 7a.** It is the same gap MT-10 names ("offices are read from words, not declared"). |
| SS-01: observatory script | ss01 last § | Not track. Tooling for the cold-play lane, when wanted. |
| KX-01 (branch kx-1) | directions §4 | Any small general syntax improvement it finds may join the track. Otherwise M23. |

## 4. Track steps to close or split now

- **Step 1: close (MT-01).** Its rule-2 invariants pass (see §1, V).
  - The riddle is an engine focus on all three clients: test/small/riddle-focus, 5 pass.
  - The page's folds go through Doable (ad68847e1).
  - OR-94's buttons are pinned by name and kind.
  - Its leftovers already have rows of their own and should not keep MT-01 live:
    - AR-20: `web/reader/stage/lens-focus.ts` is still the page's;
    - OR-11: digits commit by `app.choose` (web/reader/reader-keys.ts:70, 78, 93, 98), and 88 `onClick` handlers remain;
    - AR-22: four web/engine files still import web/reader.
- **Step R: close as R.** AR-21 and OPR-01 are fixed (ce6c03c9f). Split its second half, "travel leg by leg in the
  page", into a step of its own, **R′** (TR-01, OR-112, OR-113's road-leg clause, NM-06, OA-06).
  - R′ is M–L and world-moving.
  - Streaming the legs was tried once and taken back (TR-01's text).
  - It is first-hour navigation (OR-113, the owner's "chaotic"), so keep R′ in M22 after L. It is not a close-out.
- **Step P: split.** OR-114 is fixed. OR-91 keeps two parts:
  - the headless target, which is P′;
  - "(1) creation behind the worker's world read, (3) the page's per-turn cost", which are browser measurements for
    lane B (CI). OR-120 and OR-121 (Strike Out Now under 100 ms; the world before the title) are new owner rows, not
    P's.
- **Step 2′: split.** MT-12 now; MT-11 with L. AU-15 (about 130 objectives without `toward`) leaves 2′: it is a
  codemod over all of data, world-moving through every aim's lead. Keep it as advisory lint in M22 and do the codemod
  in M23.
- **Step 7: split** into 7a (offices as facts, additive; M22) and 7b (a situation binds a resident; world-moving and
  replay-breaking on iscoed; M23).
- **Step 8: move to M23** (MT-08 deferred, with the reason). The study rates it medium-high cost and world-moving. Its
  one first-hour row, OR-66, is an owner decision, "scheduled apart". No live P0 or P1 waits on it.
- **AT-07 (P0): split.** Close its M22 steps. Open one M23 row for the Offering tree, `Known` and `--why indicator`.

## 5. Rows the track can close by verification alone

| Row | Evidence today |
|---|---|
| **TB-12** | Its one open part ("the page's folds … pinned `it.failing` in one-projection") is fixed by ad68847e1. The test no longer has `it.failing` (21 pass). |
| **MT-01** | See §4. Its status is still dated 18 Nov. |
| **CL-34** | The speaking door's first-try guess is gone (ad68847e1, 7313c9a7d: test/speaking-door-business). The riddle is read on the page's Look lens (riddle-2), and the gold walk goes through the door on a1 order and kite order (riddle-focus). Its other cases are "not reproduced by the nine gold walks". |
| **OR-94** (P0) | 35 `<button>` in 22 files. Every one is named with its kind and reason in test/small/page-controls (820dc9ec0), and a new kind fails. If the owner's rule wants "unreached" gone, deleting `Wayfinder.View`'s `way-row` is the only code left. |
| **AT-07** (P0), split | Its status already says "its M22 steps done … Open for M23". |
| **FH-05** after L | "Finished things lingering as leads, unverified since 11 Nov". A paid job's knowing is let go (undertown.kyrt, the comment over `{t}_u_paid`); one probe after a job is paid verifies it. |
| Hygiene the audit named, still open | BP-07 is a duplicate of CB-03. CL-53's only remainder is TS-03 (deferred). OR-60 is an umbrella: (3) is CL-07, (4) is OPR-01 (now fixed), (5) is CO-03. Keep only (1) and (2), or close it as a duplicate. |

The verify-or-close day the revised order planned is mostly done. Only 19 non-deferred live rows now carry no 17–19
November date (SP-01, SP-05, AR-05, OPR-06, R10-10, T24-19, T24-20, TB-01, TB-10, OA-01 to OA-04, PV-01, PV-02, PV-04,
SI-08, MT-07, MT-08), counted with `RegisterTickets.rows` against the register.

**Yield if V, 2′a, L, S′ and 7a land:** about 15 rows closed, out of the 20–25 the whole original track would have
closed. Two P0s are closed (OR-94, and AT-07's M22 part) and one is split (OR-91). Only L moves worlds, and it is
classified by one compat run.
