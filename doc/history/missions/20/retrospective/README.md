# Mission 20's landing, and a retrospective of Missions 11–20

12 November 2026, at M20's close. The question the owner asked: **after ten missions, are we building a better game at
an improving rate, or is the growing complexity beginning to outrun our ability to test, understand and finish it?**

**Short answer: the second.** Each mission adds real capability, and surface defects are found and fixed fast, but
no mission since M11 has had its central player-facing commission accepted by a person; the same eight or so
commitments recur under new names; the open register has grown at every mission boundary but one; and the test suite
has grown 4.4× in lines and 8× in CI file-minutes against 1.7× for the source. The causes are a few structural
liabilities and a process that adds breadth before it closes depth, not a lack of effort. They are fixable, and the
places where debt *was* paid down this week (the safe zone, the local loop 86 s → 29 s) show how: measure, make the
invariant structural, enforce it.

Evidence, each a file beside this one:
[missions-11-15.md](missions-11-15.md) · [missions-16-20.md](missions-16-20.md) · [debt.md](debt.md) (+ `data/`) ·
[architecture.md](architecture.md) · [aesthetic-and-play.md](aesthetic-and-play.md) ·
[../test-loop.md](../test-loop.md) · [m21-recommendations.md](m21-recommendations.md) ·
[reproducibles.md](reproducibles.md) · the handoff's Part 0 ([../handoff.md](../handoff.md)).

## A. M20's landing

- **Shipped:** M20's first-hour work (gold only after Follow, signals that lead to their acts, up to four led acts,
  the way back, talk numbering), the adventure branch integrated (six standing modules in every first country), one
  resting scene with Talk/Go/Look lenses, the safe zone as the outer tenth, the contact-sheet cleanup, the test-loop
  down payment (`check:fast`), E205–E223. **Deployment:** see Part 0 of the handoff for the main commit and its CI.
- **Verified:** by specs (the quick suite, the browser specs on six pages and four sizes, the long descents) and by
  agents (twelve cold rounds, the last two headless on the integrated build). **Not verified by any human** (PD-14,
  FH-01: P0 since M20 began).
- **The first fifteen minutes:** followable. Both round-12 reviewers saw the opening aim through and finished two of
  three town jobs; the opening is praised ("excellent: moving and well paced"). **The first hour:** clarity rated 2 in
  the terminal (its own faults, fixed tonight), interest 4, challenge 1–2, wish to continue 3; no larger adventure was
  reached by either, because the game never makes one the aim (T24-18).
- **Outstanding P0/P1:** human acceptance (FH-01); narration volume (T24-05); no larger adventure as an aim (T24-18);
  combat balance and free recovery (R10-12, R11-05); conversation depth (R11-02); paintings against state (R10-08,
  R11-09); a stated option not takeable, empty talk, silent aim switches (T24-19). One spec skipped with its reason
  (AI-02). The successive green-pair acceptance standard (two independent players, green on one fixed build) was
  **not reached**: no pair of players, human or agent, played one build to an acceptance verdict.

## B. Ten missions: aims against outcomes

| | Central commission | Implemented | Tested | Integrated / deployed | Experienced by a player | What came back |
|---|---|---|---|---|---|---|
| M11 | reconstruction: book, map, wild country, fellows | yes | partly | yes / yes | owner only | book page and map plate deleted 1½ h after the report |
| M12 | uplift: region split, warm parse, inventory | yes | partly (a "fixed" spec tested nothing) | yes / yes | owner only | its reader deleted ~6 h later |
| M13 | experience: stage reader, foundings, travellers | yes | partly | yes / yes | its own playthroughs | misses 4 of its 7 benchmarks; road stage deleted 6 Nov |
| M14 | expedition: a generated dungeon to its heart | yes | **yes** (descents, now a CI job) | yes / yes | one cold agent, never completed | the best-evidenced outcome of the ten |
| M15 | fast loop, independent adventures, text-first UI | loop yes; adventures merged; UI 4 of 7 steps | loop measured | yes / yes | adventures unfindable until M16 | CI 4 → 45 min by 9 Nov |
| M16 | an inviting RPG; a discoverable authored dungeon | yes | yes (Long Man specs) | yes / yes | builder's policy only | white page, assisted travel, the Long Man as lead: replaced |
| M17 | 30 enjoyable minutes; close 105 findings | partly | partly | yes / yes | one cold agent; owner: "like a web application" | closed by the owner with 11 open, 61 partial |
| M18 | dark-stage UI, one shared country, Kyr/Deem/CLI | partly (no Seven Towers, no stats/bench) | partly | yes / yes | owner corrections ×≈10 | "closed, not complete: no requirement Accepted" |
| M19 | the inhabitable world: a playable loop in a1 | yes, broadly | yes | yes / yes | cold agents; owner | "player-experience acceptance explicitly unmet" |
| M20 | the first good hour | yes | yes (more than any mission) | yes / yes (at landing) | 12 agent rounds; **no human** | PD-14 never run |

**Recurring commitments that never reached reliable completion** (each in three or more missions): independent human
play (every mission); a real iPad and Safari (M11, M12, M15, M17, M18, M20); startup speed (every mission; ~10 s
headless now); an interface accepted before being replaced (rebuilt in every mission, M11–M20); conversation depth and
memory (M13–M20); level-one danger that is fair (M11–M20); portraits and paintings that fit (M12–M20); trustworthy
guidance (M18–M20); adventures discoverable in ordinary play (M14–M19, then T24-18); generated content as data and
module-local isolation (M14–M19); a fast verification loop (M15–M20).

**Record gaps:** no original brief survives for M11–M15 (M13 has a plan; the others are paraphrased in reports and
memory); the cross-mission reconciliation (`findings/briefs.md`) has no rows for M11, M12 or M14.

## C. Debt: growing, and concentrated

- **Carried-out open rows by mission:** 105 (M16) → 73 (M17) → 145 (M18, recorded as "none open" by renaming them
  Wishlist) → ≈250 + 74 never registered (M19) → 281 at a coarser grain (M20). P0s are paid (M20: 27 of 31 fixed, 3 in
  part); P1s and structural rows accumulate.
- **Age:** of 281 open rows, 27 date from M16 and 22 from M18; the oldest sit in architecture, authoring, combat,
  undertakings and content. 80 rows are "unverified since" before 10 November. All 43 authors' friction rows (UNT-2xx)
  are open and were never entered in a register; of the adventure branch's 14 author requests, 4 were done.
- **Growth:** spec files 175 → 844; test lines 15k → 67k (4.4×) against src 28.6k → 49.4k (1.7×); CI from one job to
  ten shards; serial CI file-minutes ≈130 (M17) → ≈1 088 (integration branch).
- **The register reconciled** (324 rows of `open-register.md`, classed by the words of each status cell: approximate,
  method in `data/register-rows.csv`): **29 verified complete** (by spec or agent play; none by a person), **64
  implemented but not adequately verified** (fixed in part, "addressed", or done only locally), **165 open** (many also
  "unverified since" a date before 10 November), **52 deliberately deferred** (homed M21), **8 superseded or
  consolidated**, **6 blocked on an owner decision**, **0 rejected**. Duplicates had been consolidated into problem
  rows at M20's audit; the earlier mission registers are summarised, not merged, in `debt.md`.
- **Systemic causes** (hypotheses unless marked): (1) **one promise/projection boundary**: the presentation infers what
  an act will do from words and partial state, so gold, pips that lead nowhere, stale offers, text against state and
  aim switches are one fault met through many channels, fixed one channel at a time (the keep-door P0 fixed in round 9
  returned in round 10); (2) **no single record of where the company is** across map, town and site (PD-08); (3)
  **narration composed by accumulation** with no budget (*verified*: 3.6 sentences on average, 20 scenes of five or
  more, a town's heart 23–26: `test/scene-sentence-budget.test.ts`); (4) **paintings chosen by kind and hour**, not
  state; (5) **tests that need whole worlds and assert wording** (*verified*: 301 files, 62 % of CI time); (6) no
  balance instrument; (7) Kyr lacks forms authors keep asking for (conversation, clocks, module-local tables).
- **Habits contributing:** briefs broad and redirected mid-mission by the owner's own play; breadth (adventures,
  worlds, integrations) added while the opening was still being stabilised; the builder accepting its own work until
  M19 split implemented/verified/accepted; agent play standing in for humans; missions closed by the owner's word with
  the gate unmet, and the next brief inheriting it under a new name; the interface rebuilt every mission.

## D. Test-performance baseline

`check:fast` **29 s warm** (was ≈ 86 s); the quick suite ≈ 10 s (was 34 s, 321 CPU-s for 38 of work); a fixture
campaign starts in 0.15 s, a generated world in 7–8 s, a kept checkpoint resumes in 1.1 s. The five costs, the layers
(unit 166 files, small integration **22**, headless adventure 327, full Westernesse 301 = 62 % of CI, browser 28), the
tests that can move down, and the first experiment are in [../test-loop.md](../test-loop.md)'s summary. The 30-second
quick budget is met for today's quick set; **the 10× now means moving guarantees into it**, starting with
small-integration helpers and kept playthrough prefixes.

## E. Architecture

The kernel is closer than feared: a standalone Kyr document compiles in 0.41 s, a tiny campaign plays in 0.62 s,
`inspect` explains a refusal in Kyr with its bindings, events record their changes, `World` is a persistent functional
store of 8 files, and one runtime serves CLI, terminal, browser and `serve`. **No new REPL or command language is
needed.** The leaks: the parser depends on the whole canon (kinds resolved globally at parse time); bundle loading
imports world composition; a play session imports 285 of 488 source files; 116 static caches and 164 eager JSON
imports. Progressive world realization is recorded with its obstacles (standing scenarios composed at start; installs
that grow quadratically, T24-11; whole-world projections per command) and the evidence that would justify it.
[architecture.md](architecture.md).

## F. Aesthetic and play

Strong: the paintings and dark stage at a laptop's size, the conversation page, the writing at its best, honest odds,
one indicator. Weak, in order: the scene says too much before it offers anything (3–9× a three-sentence budget);
signals still promise acts two containers deep; danger has no economy (recovery free, light unseen, challenge 1–2 in
every round); pictures contradict state; after the first jobs nothing pulls. Silver is the least legible signal. A
small tense expedition (the cellar to the rats' nest, or the hobs' toll-house) is proposed as the acceptance scenario.
[aesthetic-and-play.md](aesthetic-and-play.md), [../studies/screens/](../studies/screens/).

## G. M21

Engineering first, then an independent aesthetic thread, then one acceptance scenario played by humans:
[m21-recommendations.md](m21-recommendations.md). And for the process:

1. **One gate per mission, accepted by a person** (PD-14 on a fixed build), and no new breadth until it is met.
2. **Every recurring commitment made structural and enforced** (the safe zone and `check:fast` show the pattern):
   the narration budget spec (now `.failing`), the over-budget test report, a promise-contract diagnostic.
3. **Registers kept at one grain, with "unverified" separated from "open"**, and authors' friction entered as rows.
4. **No mission closed by renaming**: open rows stay open, and the next brief names what it inherits.
