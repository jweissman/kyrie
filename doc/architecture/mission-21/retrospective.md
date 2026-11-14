# Mission 21: the retrospective

Written for the owner, 15 November (night). The mission was to make the game dependable and experimentation cheap. Each
claim below says how it was measured. **Achieved, partly achieved, unverified** and **unmet** are kept apart, and a green
test count is never offered as experience. Sources: performance-report.md, kyr-compiler.md, first-touch.md,
casting-fiction.md, verb-pins.md, the register (open-register.md §41–48) and the runs named in them.

## Against the original commission

| Commitment (brief.md, 12 Nov) | Verdict | Evidence |
|---|---|---|
| A quick suite of about 30 s, about 10× faster feedback | **Achieved** | `bun run check:fast` is 26–35 s for typecheck, lint and 1,449 tests in 544 files (it was 18 s for 667 tests that exercised no gold, signals, talk, map or fight). A push runs the push lane, about 9 min from push to done (slowest shard 5 min); the whole suite is nightly and on demand (about 29 min wall). Nothing was deleted. |
| Small Kyr worlds that exercise real rules without Westernesse | **Achieved** | test/support/tiny.ts: a tiny world starts in 70 ms warm (180 cold). About 170 spec files in test/small, plus fixtures this stretch: a mage built through creation casts at rats (mage-casts), a landholder keeps a built hut through a save and load (landholder), a forecast held to its fights (forecast-honest, the-eye). |
| Serious gamebreaker repair; player trust restored | **Partly** | 27 of 29 P0 rows closed; the mage who could not cast (OP-05) is fixed. **Trust is not restored:** the owner still met serious failures in the same week (spells, creation, rumor walls, compound rows, a small cursor), FH-01 ("no person has accepted the first hour") is open, and navigation "still feels off" and is undiagnosed (PB-03). |
| An independent aesthetic investigation, then integrated improvements | **Partly** | Landed: the lantern scene, embers-only title, circle cursor (now twice the size), one-line rows, composed creation as the default. Behind a flag, not accepted: the press treatments (`?touch=down|up`) and the observatory. Not done: a true night-sky engine; the opening judged as one piece by a human. |
| Stewardship of the register and architecture | **Partly** | 576 rows read as tickets and features (scripts/register-tickets.ts: 155 closed, 36 pointers, 30 duplicates, 95 partly, 181 open, 44 deferred); AX-03's precondition proved (monotone validity, one exception). The cheap high-leverage runtime changes are ranked and mostly unbuilt. |
| A small, convincing demonstration of gripping, consequential ordinary play | **Unmet** | OA-12 and HP-03 (one complete expedition) are open. The verb pins are small proofs of consequence (a landholder, a mixed party's boss fight), not play a person lived through. |

The four acceptance outcomes: **the loop is cheaper** (achieved); **the game is dependable** (an unfamiliar player sustaining
fifteen coherent minutes: *unverified to unmet*); **the presentation is significantly better** (partly, and no real iPad or
WebKit run exists: SP-05); **obligations materially discharged** (partly).

## 1. Test economics

| | Before | Now | Harness or runtime |
|---|---:|---:|---|
| Local gate | 18 s, 667 tests | 26–35 s, 1,449 tests | harness |
| A rule proved in a spec | a generated country, 7–8 s | tiny world 70 ms warm; a whole fight 14 ms warm | harness |
| A push | whole suite, 45–60 min | about 9 min wall | harness |
| Whole suite (CI) | about 270 shard-min | 172 shard-min plus 43 browser-min, 29 min wall (the browser shard) | harness |
| One quiet game hour, a1 | | about 265 ms (6.4 s a game day) | runtime |
| a1 start, Node warm / cold | 6.5 s / 15.1 s | 5.5 s / 14.0 s | runtime (barely moved) |
| a1 first visit, browser | "3× Node" | 18.4 s; **1.3× Node like for like** | measured |

**The ladder** (scripts/lane-costs.ts, warm; cold in brackets): parse a Kyr fragment 0.1 ms (0.7–8); parse and validate it
0.3 ms; create a creature 1 ms (26–33); a whole fight 14 ms (36); start a tiny world 70 ms (180); read its choices 65 ms;
a full country 5.5 s (14). Specs on large worlds: the rest lane is about 470–500 CI-minutes, almost all waiting hours in
drawn countries, not starting them.

**Locality** (0 → 100,000 irrelevant facts, a five-thing cellar held constant): the act is flat to 10k facts and under 2 ms
worse at 100k; looking again grows 44 % at 10k and is 4.9× at 100k, half of it two scans over every `connects` fact
(`ChartModel.aimed`, `Glance.inward`); start, save and restore grow linearly (a whole-world copy, by design). Three small
fixes cut growth but moved a1's quiet hour little.

**What stays expensive, and why:** the 39 module installs are 41 % of a start (each recomposes and revalidates the shared
rules); the cold parse of generated text is about 8.6 s of 14 s; a first browser visit parses everything (10 s of 18 s).

## 2. Playability

**Now works** (each with a spec, and where it mattered a real page): a mage made at creation casts Magic Missile at each rat
and Mage Armor on itself; creation is rows, four cards at a time, one press a step, no Continue or Details; a person with many
hearsay asks has one "for news"; the title is embers; rows are one line; a beat of the opening has no square, bar or hint.
**Does not yet:** navigation "feels off" (undiagnosed); compound rows (Wait ›, Buy ›, a thing's look) remain in places; a
lone first-level mage dies to three rats (the forecast tells the truth, CB-03 stands); the first hour is unaccepted (FH-01);
the browser and terminal start different runs of one seed (PB-06).

## 3. Aesthetic integration

Landed and judged by screenshot or spec: the lantern scene, the embers title, the circle cursor at twice its size with a hold
that fills a disc from the centre out, one-line rows, composed creation (default), the intro without its chrome. **First-touch
research** (first-touch.md): committing on the press instead of the release saves about 95 ms a act (94 → 1 ms to send, 265 →
165 ms to draw) over 60 acts with no duplicates; the cost is that a mouse press slid off a row still commits, which `up`
avoids. Both stay behind `?touch=down|up` until the owner decides. **Not judged by a human:** how the continuous opening feels.

## 4. Behavioral quality

Pins made from real traces: promise fidelity (a walk and the laboratory), the forecast against fights (rats, a dragon, a
discerner, in both directions), a mixed party against a boss, a landholder through a save, news asked once, a ratchet on
magic outside the rules (casting-audit), and the register mapped to features. **Walkers found**: a lone first-level mage loses two fights in three
against three rats (33 % won); a discerner at the party's level is 22–40 rounds; the dragon does not scale with
its level; a cleric in place of a thief or mage lifts a boss fight from 7 % to 71 %; 14 authored actions slay or restore, none
through an ability, 2 on a calling alone.

## 5. Inherited obligations

The register: 576 rows, 2 live P0s (FH-01, opening acceptance; DN-06, the owner on the writing). SRD: the proof slices stand; **an unlanded bulk spell
layer** sits on `ci/rules-2` (PB-12) for the owner to mine or retire. The casting-fiction invariant is written and audited, the
engine step (CF-03: a band as a target of `Resolve invoke`, a persistent sleeping state) is not begun.

## 6. Architecture

The most consequential measured couplings: the shared rules recomposed on each install (AX-03: about 0.9 s warm); whole-world
copies in start, save and restore (1.05 s of 5.5 s); a world-sized scan inside every wait (`LocalObservations.read`); the
`connects` scans in the screen. **Repairs made:** screen names asked only on demand; `Narrator.shelter` and
`Operators.bindings` no longer scan every entity. **Decisions worth keeping:** validity is monotone under composition except
one shadowing check, so shared rules can be validated by reference; ship the authored parses with the build (−4.5 s on a first
visit); `Resolve invoke` is the one invocation route and wants a band as a target; a shared ownership relation beside
dominion's `holds` (a library pattern); the Landholder needed nothing the kernel lacked.

## 7. What M22 inherits

**Dependable enough for polish:** creation, the opening's pacing, the one-line row, the reticle, the title, the press pipeline
(behind its flag), the fast loop and the ladder. **Still to repair, not to hand forward:** navigation into and around a
space; the compound rows; the first hour's acceptance; the browser/terminal seed drift; the sign's night-sky engine; a real
iPad and WebKit run. **The narrow subject** the owner named stands: the first fifteen seconds, the first minute, and the
repeated act of choosing.
