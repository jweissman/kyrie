# Mission 19: closure report

Closed 10 November 2026 by the builder, at the owner's commission of 9 November and its final word of 10 November.
**M19 closes as an implementation mission with player-experience acceptance explicitly unmet.** The brief's seven
accounts as they stood on 8 November (content migration, authoring workflows, the Encyclopedia) are in
[closure-draft-2026-11-08.md](closure-draft-2026-11-08.md). How to run the new checks, and what they do not prove,
is in [verification-loop.md](verification-loop.md). The forward plan is
[../mission-20/opening-brief.md](../mission-20/opening-brief.md).

The implementation state is frozen at the commit that adds this report, on main. Its CI run is given in the closing
message of the handoff.

## 1. Limitations, plainly

- **No cold players.** PD-14's acceptance (five cold players) remains unmet. Nothing in M19 has been accepted by an
  independent player.
- **The rendered tour stops short.** The Chromium reference journey reaches the casket puzzle in Lapisrecs' hall of the
  bones (run 42772673502). It has not demonstrated the first hour: no debt paid, no return, no ending. Since the inn no
  longer tells of deep halls, the debt now goes to the hobs' toll-house instead.
- **Legacy targets.** About 200 objectives still depend on target inference from their words. Only the origins, the
  drover, the fever and the first town's jobs and dungeon declare `toward`.
- **Authored countries are exempt from the hex rule.** The engine refuses cross-hex moves outside map journeys in
  generated countries only.
- **Knowledge-safe projection is only partly tested.** It is tested for the map (an addressee's town, not their room),
  not for the journal or the local choices.
- **Unfinished presentation.** Notes versus Story (M19-228), perception-bound narration (M19-229) and conversation as
  exchange (M19-227) remain incomplete. A fix for the parade seen from indoors was tried and reverted at closure.
- **The opening still has defects:**
  - **A lethal encounter with no warning (M19-233, partial).** Deep halls are no longer told of, but at the hobs'
    toll-house the page leads with taking their plunder, which brings their raiders down on a lone company.
  - **Light runs out within the hour (M19-170).**
  - **Corrected, with evidence:**
    - **Jobs without a selected aim (M19-234) are fixed.** A notice seen is an aim held, and honest-start shows a son,
      his errand done, led back to it and on into the undertown.
    - **Empty conversational leads were not reproduced as the page's (M19-235).** The probe had chosen greetings; the
      people led to have topics. Talk with nothing but leave is withdrawn (M19-227).
- **Large saves.** A save is 22 MB after about 25 commands (M19-236).
- **CI is still long.** Full CI passes, in about 40 minutes. The fast contract tests (about 2.5 minutes on CI) are a
  real improvement in feedback, not a replacement for the corpus, which still runs on every push.

## 2. The register, in four classes

[register.md](register.md) holds 297 rows:
- **The mission's own 252 rows (M19-01..238, PD-01..14):** 151 fixed, 25 partial, 18 open, 49 deferred to M20, 1 open
  risk, 5 not reproduced, 1 not borne out, 2 superseded.
- **The closing audit's 45 rows (M19-239..283):** findings and forward recommendations, not M19 completion
  requirements (1 fixed, 5 partial, 39 open).

### 2.1 Implemented and verified

Changes with specific supporting tests. "Verified" means a spec or CI artifact, not a person.

| Rows | What | Evidence |
|---|---|---|
| M19-224 | Cross-hex movement refused by the campaign outside a map journey, in generated countries | `hex-ways`, `choice-contract`; CI player contracts |
| M19-225 (contract part) | Objective target: `toward … by …`, one resolver, legacy marked, lint advice | `objective-target`, `go-sheet-aims`, `stakes`; honest-start |
| M19-234 | A notice seen is an aim held, led back to after needs | `honest-start` (journey 3), `glance-kite` |
| M19-230 | Pack in three, starting things' provenance | `pack-stacked`, pack specs |
| M19-232 | Chandlery painting and kind | `scenery-kinds`, paintings specs |
| M19-177, 183, 185, 186, 187 | Author harness: befell advice, a companion's calling, `at`, `fight`, `seen` | `journey-fight`, `hired-calling`; forms.md |
| M19-238 | A device broken, not dead | quick suite |
| — (CI) | Six shards and complete timings: the first full-suite verdict on record | CI runs 42767926775, 42772673502 |

Plus the 151 mission rows marked Fixed before closure, each with its commit and how it was checked.

### 2.2 Implemented but not player-accepted

Verified by scripts or browser automation; never played by a cold player:
- the aim chain as a whole (M19-225);
- the fight bar with targets on the cards (M19-226), seen in the tour's pictures;
- talk with nothing to say withdrawn, and the aim's reply led (M19-227);
- the undertown as a dungeon (M19-155);
- journeys 1 and 4 through the page (M19-173);
- play as a world moved through (M19-46);
- every other "Fixed" row of the brief's player-facing priorities (III, IV).

### 2.3 Unresolved player-facing defects

What materially affects the first hour:

| Area | Rows |
|---|---|
| Danger | M19-233 (plunder lead), M19-87 and M19-117 (balance for a lone company), M19-252 (a bare Take in a warned room) |
| Light | M19-170 |
| Conversation | M19-227 (exchange), M19-141 (calling-aware talk, deferred) |
| Narrative presentation | M19-228 (Notes and Story), M19-229 (perception), M19-121 (fight words, partial), M19-116 (results below the fold), PD-08, PD-13 |
| Navigation and comprehension | M19-85 (busy resting scene), M19-57, M19-108, PD-04, PD-09, M19-280 (map header against card) |
| Persistence | M19-236 (save size) |

### 2.4 Deferred engineering investments

From the three reviews: not immediate defects.
- **Throughput:**
  - content-addressed fixtures (M19-273);
  - dependency-based test selection (M19-274);
  - checkpoints for long specs (M19-275);
  - timing refresh and a scheduled corpus gate (M19-276, partial);
  - simulation checks moved out of the browser (M19-277);
  - a fixture command, phase timings and performance trends (M19-278).
- **Stabilization:**
  - CI on every branch (M19-268);
  - a seven-stage world census (M19-269);
  - per-adventure manifests (M19-270);
  - setting coupling (M19-271).
- **Quest-intent:** the knowledge-boundary tests for the journal and local choices (M19-272, partial).
- **Language and harness requests from the authors:** M19-179..206 and M19-239..267.

## 3. What this closing pass changed

**The aim's target.**
- Kyr gains `Objective … toward a, b by c "…"`, parsed, namespaced and checked.
- One resolver (`src/ui/objective-target.ts`) gives every aim a subject, the place where it is done, and the place to
  go by.
- A place named only as an address is no longer the aim, nor is everything inside what it names.
- Whom an aim names is led only for the reply that changes what the aim waits on, or the question its words ask.
- A journey toward a site counts from the outside it is entered by.
- The glance reads each aim's words once per module, not at every step.

**Cross-hex movement.**
- `src/hex-boundary.ts` decides, for page and engine alike, when a way enters another cell of a generated country's
  land.
- `src/campaign/crossing.ts` lets the campaign take such a way only as the leg `Travel.go` is taking.
- The map's crossing step is a `travel:` journey.
- Scripted drivers take crossings with `PlaySession.leg`; a replay takes its kept steps as they were played.

**The opening.**
- The inn and the debt tell of no deep halls.
- A notice seen is an aim held, read as the post's own act.
- The debt's aim goes from the inn to the nearest place told of there.

**Presentation.**
- The fight's foot is Attack, Abilities, Spells, Items and Other, aimed on the field.
- The pack is in three groups.
- The chandlery has its painting.
- Text slips are fixed: devices, "insane", "falling rocks", the blow's detail line.

**Verification.**
- `test:intent`, `test:honest`, and the CI reference-hour tour.
- Six suite shards, with timings for every file.

## 4. Verification, measured

Before (the throughput review's run at c56669b4): 45 m 40 s wall clock, with suite shard 1 of 5 cancelled at its
limit, as in every run seen. After: about 40 minutes with every job passing, six suite shards, and 160 untimed spec
files given timings from a complete CI run.

The player contracts answer in about 2.5 minutes on CI. Locally, `test:intent` takes 47 s and `test:honest` 36 s.

**A negative result.** Building the browser site once per shard was tried and reverted:
- **Not the cost.** One build takes 2 s, so building it once saved nothing measurable (a shard's test step went from
  14 m 37 s to 14 m 54 s).
- **Not equivalent.** The shared, fixture-bearing site made the handbook specs time out.

The browser time is in the journeys themselves (M19-237). Details are in [verification-loop.md](verification-loop.md).

## 5. Retrospective

M19 accumulated working functionality and thousands of passing assertions without an acceptable player experience,
because almost everything we verified was whether the game *could* be completed by someone who already knew the way:
- **The scripts knew the path.** The long journeys named every step. The register measured rows closed, not the first
  hour. "Fixed" meant a spec passed and the builder had looked.
- **Symptoms were patched in place.** Each complaint (aims that led out of buildings, moves across hexes, gold on the
  wrong things) was repaired where it appeared, by the component that showed it. There was no single contract for what
  an aim is about, or for which moves the map owns. So the same failure came back five times in five places, each
  repair green.
- **Breadth arrived during stabilization.** Adventures, paintings, species and planes were integrated while the opening
  was still unacceptable, so the base under the tests kept moving.
- **The player-led test came last.** The first test that played only what the page leads with found five defects on
  its first run, after a thousand commits.

**What should change:**
- **Commissions** should name a journey and its acceptance by a person ("a cold player finds and finishes the rats job
  on build X"), not a feature or a register count. They should be frozen for their duration, and reviewed against one
  build.
- **Author handoffs** should deliver honest-start play of their own adventure, a declared target on every aim that asks
  something, and a failing test with any engine request. New content waits on a branch while the opening is red.
- **Test design** should put a player-led check (public leads, no ids, no teleport) beside every scripted journey, and
  encode each rule as an engine invariant with a focused contract, not as a hidden button.
- **Definition of done** has three levels:
  - **Implemented:** a commit.
  - **Verified:** a player-led test and rendered evidence.
  - **Accepted:** a person who did not build it, playing the frozen build.

  Only the last closes a player-facing obligation.

M19 is closed.
