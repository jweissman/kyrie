# Debt: is it accumulating faster than it is paid down?

Read-only, 12 Nov 2026, worktree `/var/tmp/kyrie/wt-m20` at `a2587989` (plus `origin/integrate/first-steps` for CI).
Derived data beside this file: `register-rows.csv` (all 324 rows of open-register.md, each with a status class and an
origin mission), `m20-log-rows.csv` (E1–E223, each with its intro day from `git log -S`), `mission-flow.csv`,
`clusters.csv`, `aging.csv`, `growth.csv`, `commits.csv`. `cluster-tags.csv` is a keyword pass and is noisy. Use it
only as a cross-check.

**Data limits.** The whole history is 24 days long (19 Oct → 12 Nov), so a "mission" is 1–7 days. Row size changes
between registers. M16–M19 have one symptom per row. The M20 open-register has one *problem* per row: CB-01 cites
about 20 sources, and 3+ inherited rows fold into one. Row counts therefore **understate** M20 growth. "Fixed" is
always the builder's claim. No human has played since M19 (FH-01). Where I say "regression", a record says so. Most
records do not tell an old defect newly found from a regression.

## 1. Inflow and resolution

| Mission (days) | Inherited open | New rows | Closed in mission | Carried out | P0 / P1 raised |
|---|---|---|---|---|---|
| M16 (10-26..27) | (M15) | 203 | 98 | **105** | no priority column |
| M17 (10-27..28) | 105 | 184 (70 from authors) | 216 | **73** | no priority column |
| M18 (10-28..11-03) | 73 | 495 | 383 fixed (+40 NR/sup./held) | **145** ("none open": renamed Wishlist) | 81 / 149 |
| M19 (11-04..10) | 145 | 297 + **74 UNT** found never registered | 192 | **≈250 + 74 UNT** | 22 / 52 |
| M20 (11-10..12) | ≈324 + 109 BRF, consolidated | 221 log rows + 175 register rows of M20 origin | log: 155 fixed, 39 partial; register: 43 of 324 | **281 rows** (coarser grain) | 31 / 85 (log) |

Counting method: the accounting tables in each register or closure, as written. For M20, I classed each status cell
by its leading word. The M20 log by intro day was 100 / 68 / 53 rows on 10 / 11 / 12 Nov. All 31 P0s are recorded as
fixed (27) or fixed in part (3); the other is a record of a round. The P0s are paid; the **carried-out column grows at every mission boundary except
M17**. M20's P0 *rate* (≈10 a day, against M19's ≈3) reflects 12 rounds of cold play (more looking). It does not
show that the code got worse.

**Recorded regressions** (the only ones the records name):
- E157: E154's gold rule went too far.
- E163: the gold walk circled after a content change.
- AI-01 and AI-04: the integration redrew shop stock and added 170–190 words on arrival.
- T24-08: the integration's people were drawn human in dwarf countries.
- M19-22: the trade change emptied shops.
- FH-04 / M19-234 and NP-02: fixes reverted.
- Spec breakage from fixes: E144, E176, E189, E192, E201, E204. Six "mended in the spec" rows on 12 Nov alone, from
  wording or world digests.

## 2. Recurring clusters (hand-classified; ids in `clusters.csv`)

| Cluster | First seen | Re-reported | M20 P0s (clusters overlap) | State now |
|---|---|---|---|---|
| Gold/guidance (where the aim leads) | M18 REV-07/08 (P0) | 8 M19 P0s; M20 cold rounds 1, 7, 8, 9, 10, 11, 12; the owner twice | 10 | Rules re-typed (E153/154). The same keep-door P0 came back in round 10 (E190) after round 9's fix (E173). Open remainders: PR-01, R9-09/10, R10-18, R11-04 |
| Signal promises nothing (pips) | M18 IFR-03; UNT-101 | M19-36; E63, E183/185, PR-04, R9-03, T24-19 | 3 | Fixed one channel at a time. AP-01 false-promise corpus and R10-03 test not built |
| Navigation / level transitions | M16 NAV-04/05; M17-29 (P0) | REV-08/09, M19-31/32/224; E1, E9, E103, E126, E129, E132, E136, E155; PR-08 rounds 8+9, R10-09 | 8 | Way-back "addressed quietly" (E206). NM-01 junctions, T24-03 Go/Look as pages, R9-04 open |
| Aims / undertaking continuity | M18 OWN-53, OWN-83 ("ten things to follow") | M19-01, PD-08; E12 (9–10 aims on day 1), E58, E64, E124, PR-09, R10-13, T24-18/19 | 2 | FH-05 partly fixed. PD-08 (US-07, P1) open since M19 |
| Paintings vs text | M17-15, M17-65 | M19-71/114/172; E48, E140, R9-12, R10-08 ("again"), R11-09 | 0 | Only the outdoor hour handled (E207); "nothing else has changed" (handoff Part 0) |
| Narration volume/repetition | M16 NAR-04, PT-15 (a third of sentences repeat) | M18-11, M19-06/106; E5, E16, E127, NP-05, R11-06, T24-05, round 12 (22 paragraphs on the first green) | 1 | **Worsened by the integration** (AI-04). The telling is 666 px in a 269 px panel. NP-10 never measured |
| Combat balance/recovery | M16 CMB-01 (lone L1 dies: 30 of 48) | CB-01 cites rounds 1–6; R7-02, R10-12, R11-05, round 12: challenge rated 1–3 in **every** round | 0 | Swung from too deadly to trivial in company; lone casters still die (CB-03/04). Instrument is only an idea (CB-20) |
| Conversation depth | M15/16 NAR-03, ARV-A19 | ICE-10, REV-07, BOF-24, M19-106/227; rounds 3, 4, 6, 7, 10, 11, 12 | 0 | Renumbering fixed (E205). Depth open (R11-02, P1) |
| Safe zone/layout | M16 NAV-05; M17-31 iPad (P0) | M19-116/119 (P0); E5, E130, E202, E218, E222, T24-05/06 | 1 | **Improving**: safe zone specced on six pages. Never measured on a real iPad (SP-05, open since 28 Oct) |
| Test/CI speed | M18 GTR-X13 (an author could not run the suite) | M19-237/276, TC-01..03, T24-01/02/10/11, AI-03 | 0 | Local loop 86 s → 29 s (E223). CI rising (§5) |

## 3. Age and concentration of what is open

The origin of a row is the earliest mission among the ids it cites. This is a lower bound on age: UNT/BRF rows count
as M19 though they sweep sources back to 25 Oct. Of the 281 open, partial or deferred rows: **M16: 27, M17: 4,
M18: 22, M19: 84, M20: 137, unknown: 7**. 80 rows read "unverified since" a date before 10 Nov. 43 rows homed
"M20 close" are still open.

| Section | Open | From M16–M18 | Oldest examples |
|---|---|---|---|
| 11 Architecture & risk | 19 | **9** | AR-02 global catalogs (ARV-H7/COR-04), AR-05 text inference in the page, AR-10 party lifecycle, AR-12/13 hidden registries, silent placeholders |
| 12 Authoring | 16 | **8** | AU-10 Deem tables (AUT-25, since M15), AU-09 namespaces (AUT-07), AU-04 clocks (AUT-09) |
| 2 Combat | 24 | 7 | CB-03 (PT-11), CB-22 economy, CB-26 two teams |
| 7 Undertakings | 12 | 5 | US-05 successor threads (PT-01), US-12 offstage agency |
| 9 Content & paintings | 17 | 5 | CP-04 likenesses (PRE-05), CP-08 thin generated people |
| 13 Persistence | 6 | 2 | PR-04 determinism unverified (ARV-H6) |
| 4 Atlas & perception | 17 | 2 | AP-15: presentation reads omniscient truth (ARV-H5, 26 Oct) |
| 5 Narration | 17 | 4 | NP-08, NP-10 (both M16) |

The newest rows (§16–§24, M20) are player-facing, and 51 of 96 are open. The **oldest rows are structural** and have
not moved since they were raised.

## 4. Author requests that survived

- **Deem module-local tables / weighted choice:** M15 → M16 Open → M17 Open → M18 P1 wishlist → M19 open risk → M20
  AU-10 open. The branch's authors asked again (AB-12).
- **Namespaces:** AUT-07 / WPC-14 / AU-09, open M16 → now.
- **Clocks and calendars:** AUT-09 → AU-04, deferred. Asked again as AB-06.
- **"Says again" / several-exchange talk:** CTH-05 (M17), BOF-24, QTC-A24 → AU-05, deferred. Asked again as AB-10
  (98% of the first town's topics are `once`).
- **Never registered:** all 43 UNT-2xx rows of authors' friction are still open, and none was entered into a register
  (DC-02).
- **Of the branch's 14 asks (AB-01..14):** 4 done in M20, 10 open.

Requests return from new authors because the language gap they name is still there.

## 5. Growth indicators

| | M15 end | M17 end | M18 end | M19 end | M20 main | M20 integration |
|---|---|---|---|---|---|---|
| Spec files | 175 | 386 | 582 | 741 | 809 | 844 |
| src lines / test lines (k) | 28.6 / 15.0 | 35.0 / 27.5 | 42.4 / 47.6 | 47.8 / 63.9 | 49.4 / 66.6 | — |
| Data files (of which .kyr) | 250 (104) | 442 (266) | 701 (486) | 927 (655) | 930 (657) | — |
| CI suite shards (timeout) | 1 (30 min) | 3 (30 min) | 5 (45) | 6 + 2 browser (45) | 6 + 2 | **10 + 2 (60)** |
| timings.json serial file-minutes | — | 130 | 391 | 571 | 588 | **1088** (194 files untimed) |

Since M15, src has grown 1.7×, test code 4.4× and serial CI time 8×. 301 spec files (62% of CI time) start a whole
generated world to test one rule, and the small-integration layer is 22 files (test-loop.md).

Startup has not fallen: 9.3 s (M19 startup.md) → 10.1 s headless and 13–22 s in a browser (SP-01, E107). The world
holds 130,826 facts and a 23.8 MB checkpoint, and province install is quadratic (T24-11).

Undocumented assumptions are recorded, not removed:
- Deem draw order re-rolls worlds (AU-10).
- A province re-seeds every world (AR-17), and one content fact rewrote every world's digest (E201).
- DC-04's facts about markers and the purse are written down nowhere.
- DC-05: fixed rows never re-proved after redesigns.

## 6. Systemic causes (hypotheses unless marked)

1. **One promise/projection boundary (strong).** Gold, pips, stale offers (R10-13), text against state (R9-07,
   T24-16) and aims all come from presentation working out from words and partial state what an act will do. The
   rows that say so: AR-05, AR-07, AP-02 (states in CSS), AP-15 and T1 (`Affordances` as a parallel engine). M19's
   inherited.md already named the causes ("identity inferred from words", "legal state taken for a decision").

   Evidence that these are symptoms, not separate defects:
   - The fixes are per channel: "fixed for talk" (E156), "typed by its effects" (E154).
   - The next round finds the same class through another channel: E173 → E190, E154 → E157, E183 → E185.

   This one boundary likely accounts for four of the ten clusters and most M20 P0s.
2. **No single location/knowledge record across map, town and site (likely).** These fixes each re-state "where the
   company is": E155, E170 and E195 (in a site, at the door's hex), E129, R9-04 (circus read as a town). PD-08 / US-07
   (heard, lead, aim and route as one record) is open, and is the same liability seen from aims.
3. **Narration composed by accumulation (verified for the first green, handoff).** Places say everything before their
   acts, with no budget. Integration adds words (AI-04), and repetition was never measured (NP-10).
4. **Paintings selected by kind and hour, not by state (hypothesis, handoff).** Contradictions keep coming in every
   round, and only E207's hour rule has landed.
5. **Tests that need whole worlds, and that assert wording (verified for the specs read).** This explains why CI
   grows faster than code. Every wording fix breaks specs (E176, E189, E192, E204), and every fact re-seeds traces
   (E201).
6. **No balance instrument.** This is independent of the others. Balance swings between missions (CMB-01 → CB-01)
   because nothing measures it, and the at-will heal (E214) was a data defect found only by play.
7. **Missing Kyr forms (conversation, clocks, tables)**, as §4. This is a language gap, not a UI one.

Some defects are genuinely independent: E214's data, spell-slot copy, grammar slips. The ten clusters are not.

## Verdict

**Debt is growing, and it is moving toward structure.** By count, the open rows carried across a mission boundary
rose 105 → 73 → 145 → ≈324 → 281 (the last on a much coarser grain). Within M20, P0 and P1 defects are paid fast:
70% of 221 log rows are recorded fixed (the builder's claim), and every P0 is fixed or fixed in part. But the same few classes come back each round:
- the gold's thread;
- signals with no act;
- level transitions;
- prose against state;
- paintings;
- narration volume.

They return because the fixes patch channels rather than the boundary that produces them.

Meanwhile the oldest rows are untouched:
- architecture, authoring, persistence and determinism, 27 of them from M16;
- the 43 authors' friction rows, never registered;
- 80 rows unverified for days.

Verification cost grows faster than code: test code 4.4× and CI file-minutes 8× against src 1.7×. The debt is
concentrated in:
1. the presentation-side promise/projection boundary, with its sibling, the location/knowledge record;
2. Kyr/Deem authoring forms;
3. a test suite built on whole worlds.

The safe zone and the local test loop are the clear exceptions, where debt was paid down.
