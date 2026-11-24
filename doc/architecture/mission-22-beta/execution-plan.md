# M22-beta: the execution plan (23 November)

**Beta is authorized to build.** The owner, 23 November: "We know enough to begin. Build, test cheaply, integrate
frequently, and reserve scarce human attention for judging whether the game has actually become better."

**The owner's commission, [BRIEF.md](BRIEF.md), governs beta.** This page is its execution plan: the first queue,
the first tasks and how each is accepted. Where this page and the brief differ, the brief wins. The preparation
report's sprint table (§F) is superseded, and the owner's direction (owner-direction-2026-11-23.md) is evidence.

No discovery phase stands between this page and code.

## The record, reconciled

- **Alpha is closed, not accepted** (mission-22/closeout.md). Its unmet acceptance is carried forward:
  - FH-01: no player has accepted a build;
  - the three continuity rows: OR-177 focus, OR-178 opportunity, OR-179 undertaking;
  - S3-P: per-act cost, now OR-183 with OR-145 and AX-05;
  - S3-R1: cold plays of the slice as shipped.

  All of them are live rows in the supported slice. None was closed by the move.
- **The preparation report, the owner's direction, this plan and doc/STATUS.md agree** on beta's scope:
  - a trustworthy, responsive, more compelling opening and a small village–dungeon loop;
  - more reliable combat, conversation and engagement;
  - enforced platform boundaries;
  - one Kyr authorability gain;
  - better Deem and inspection, where feasible.
- **Gamma, not beta:**
  - full SRD migration;
  - new cities;
  - expansive generation;
  - a complete Studio;
  - 3D exploration;
  - perks and the Arcana;
  - chaining adventures.

## The acceptance ladder

From the cheapest proof to the dearest judgment. **A failure found on a higher rung is turned into the cheapest
reliable lower-rung test before it is fixed.** Human feedback already given is evidence and is not gathered again.

| Rung | What | Where it lives today | Run by |
|---|---|---|---|
| 1. Contracts | Setting-independent unit and invariant tests over Kyr, the compiler, the engine and the runtime | test/small/, Kyr fixtures (no campaign where possible) | `bun run check:fast` (~30 s), `bun run test:small` |
| 2. Seeded journeys | Contracts proved through real sequences: acts, transitions, saves, generation | golden walks (doc/architecture/mission-22/golden/), test/*-walk, scripts/continuity-census.ts | `bun run test:changed`; the push lane |
| 3. Cheap players | Constrained agents: gold-follower (HonestPlayer), wanderer, adversarial explorer | test/support/honest-player.ts; the census's gold walk | the push lane; nightly |
| 4. Cold-play agents | Agents of stated kinds on the rendered page, without implementation knowledge or scripted answers | mission-22/cold/ (the method); a flagship agent per sprint's milestone | at each sprint's integration milestone |
| 5. Human acceptance | Clarity, pleasure, drama, visual quality, wanting to go on | the owner, at the milestones below | the owner only |

Automated success never stands in for rung 5. Rung 5 is asked for only at a sprint's integration milestone, never to
re-establish a known problem.

## The order

The brief's integration sequence (§10), as gates, not a calendar. The small-world loop comes before the full
Outcome and situation work, and those contracts are worked on from the first wave wherever they block the loop.

Each sprint ends with a playable reference build on main (`?world=iscoed`, the drove road), an invariant for each
repair, and a demonstration. **A structural cause is fixed in preference to a local guard.**

| # | Sprint | Repair (the structural cause) | Invariant (rung 1–2) | Demonstration | Depends on |
|---|---|---|---|---|---|
| 1 | **Act cost** | Legal actions found stale by what changed (OR-183); a journey's legs checked without the frame (AX-05); routes and perception only when drawn | Incremental equals full on every turn of the golden walks; the turn-cost ratchet | Decision under 15 ms median; an act settled under 300 ms p95 in the browser (OR-145) | — |
| 2 | **The first minute** | The world and a life pre-rolled at the title; Play → build, or "We enter the world as we are"; the opening as one Situation of Incidents (light, ration, recruit, fight, puzzle); no long presses (OR-160, OR-23, OR-169, OR-144) | A spec over the opening's Incidents, each reachable and each changing the situation; Play-to-act timed | First meaningful action within 1.5 s of Play; cold agents of each kind out of the opening in under 2 minutes | 1 (speed), AX-04 |
| 3 | **Town and dungeon** | One settlement alone in a hexcrawlable wild, a deep repeatable dungeon in its hex; teaching quests; people who respond (the owner's direction) | The census at 0 breaches on the town's walks; the dungeon re-entered differently | Cold agents complete town → dungeon → return unprompted | 2; the contracts of 4 where they block it |
| 4 | **Action and Atlas truth** | One Outcome per drawn row, over session commands, by the cheap apply-and-rules step, memoised per world (outcome-cost-study.md); Attest, the gold and the Atlas read only it (OR-178) | Predicted equals observed on every turn of the walks; census opportunity breaches at 0 | The three census walks clean; ChoiceGrouping.teaches and Teaching.shows deleted | 1 (the budget it spends) |
| 5 | **Situation continuity** | One situation state (place, talk, engagement, map, journey, fight) with explicit transitions, owned by the engine (OR-177, OR-173, OR-163); undertaking hand-off with reward and aftermath (OR-179) | One state per frame, every client drawing it (parity); the gold walk past Redkeep's riddle door with no undertaking breach | A riddle, a card hand, the map and a fight each held to their focus in the browser | 4; MT-24 (atomic command) |
| 6 | **Combat and conversation** | Occasion as the Kyr construct for engagement and talk (the authorability gain); fights that cost (CB-01); conversation that progresses (OR-149, OR-165) | Control facts counted down; challenge per round measured | Cold agents rate the fights risky and the talks consequential; **the owner's acceptance of the opening and loop** | 3–5 |

**Platform work rides with the sprint it unblocks:** MT-24 before sprint 4, AX-04 for sprint 2, and the layer ratchet
on the paths each sprint touches. The separation proof (the allotment scenario) and the Deem workbench run on the
second agent's stream when a sprint gives them leverage; both are beta exit conditions (the brief, §11: portable platform, authorial leverage), not optional.

**The feature atlas is M22's instrument project** (the owner, 23 November). It runs on the instruments stream,
beside the sprints, and never in their place. Its aim is a behavioural map of the product that is read top-down and
run like a test:
- the major aspects numbered I, II, III (gameplay, world, simulation, experience, language, platform);
- the tagged features under each, each placed on an architectural layer;
- for each feature, its pins, its open defects and its ambitions;
- generated as a page from the record (scripts/planning-instruments.ts is the start);
- showing where the negative space is: missing worldbuilding, authoring or structure;
- catching defects recorded as features.

Its first deliverable is the aspect tree over features.json and a generated page. Bringing doc/design's ambitions in
with IDs follows.

## The owner's civilizational direction (24 November): beta's six proving cases

The direction ([doc/design/direction-2026-11-24-civilization.md](../../design/direction-2026-11-24-civilization.md)) is
gamma's ([mission-22-gamma/COMMISSION.md](../mission-22-gamma/COMMISSION.md), OR-450 to OR-457, deferred). It does not
enlarge the active queue or change the order above. Beta implements six narrow cases in the sprints they belong to:

| Case | Sprint | Rows |
|---|---|---|
| A rapid opening, dark to revelation: light, a person, a fight won together, loot, a wonder | 2 | OR-184, OR-441 |
| Town, dungeon, return, with a nearby discoverable dungeon and preparation by its entry | 3 | OR-311 (closed), OR-321, OR-370 |
| One persistent, semantically declared Wonder | 2–3 (language) | OR-440 |
| Variable opening situations, across seeds by cold play | 3 | OR-310 |
| Asset metadata and placement interfaces, so gamma's atlas needs no rewrite | 3 (World) | OR-442 |
| One optional nested First Aims undertaking, recognizing independent progress | 5 | OR-443 |

None waits on the settlement census or the city corpus.

## The scorecard

`bun run quality` (scripts/quality/quality.ts), nightly in CI, about two minutes. The first reading (23 November,
local): slice P0/P1 defects 67; a new life to its first act 7.3 s headless (the start 6.5 s); the median turn 121 ms
(p90 334); census breaches 13; main CI on a push 10.3 minutes. Each is held by a ratchet; lower it when it falls.

## The first queue

In doc/architecture/mission-22/planning.json (`bun scripts/planning-views.ts`).

- **Blockers, in order:**
  1. OR-145, an act settled within 300 ms;
  2. OR-182, the late journey card;
  3. OR-144, Set out now within 3 s;
  4. OR-160, Play;
  5. OR-23, Play to act in 1.5 s;
  6. OR-169, no long presses;
  7. OR-178, opportunity truth;
  8. OR-177, focus;
  9. OR-179, undertaking;
  10. CB-01, fights that cost.
- **Platform:**
  - OR-183, the decision under 15 ms;
  - AX-05, a journey leg and the screen;
  - MT-24, the atomic command.

The alpha queue's other rows (OR-149, OR-173, OR-163, OR-162) stay live in the slice and return with sprints 4 and 6.

## The first three tasks

**1. The turn-cost ratchet** (rung 2; no dependency).
- **Build:** a spec that plays the warrior's golden walk and times, by stage, each turn:
  - `Campaign.execute`;
  - the legal actions (`KeptGroundings.all`);
  - `ScreenModel.build`;
  - `Glance.of`;
  - the whole runner turn, with non-journey turns and journey legs counted apart (the brief's targets: a
    non-journey turn under 30 ms, a leg under 5 ms).

  It records the median and p90 in a baseline file and fails on a regression beyond a set margin (CI machines vary;
  start at 1.5× the recorded median). It runs nightly, not on push: it is a 44-turn walk.
- **Test:** the spec itself, plus a deliberate slowdown, to show that the spec catches it.
- **Demonstration:** today's numbers recorded:
  - an act 6.1 ms;
  - a turn 127 ms;
  - the legal actions 24 ms;
  - the screen after an act 57 ms.
- **Accepted when** it is green on CI and fails on the injected slowdown.

**2. Staleness by what changed (OR-183)** (rungs 1–2; after task 1).
- **The measured cause** (probe, 23 November):
  - each turn 1,189 of 1,211 schemas are found stale by name, nearly all because they read `at`;
  - each is asked again, through `KeptReading.holds`;
  - only about 77 are actually re-grounded.
- **Build:** in `KeptGroundings.stale` (src/campaign/kept-groundings.ts), index each schema by the picks it read
  (`Kept.picks`), not only by the name. Then work out, once per world and name, what of a name changed
  (`KeptReading.changed` already computes it), and mark stale only the schemas whose picks it touches, plus every
  schema of a name that was reordered (`'all'`) or read whole.
- **Invariant:** incremental equals full. On every turn of the three census walks, the kept legal actions equal those
  ground from scratch, in order. This spec must exist before the change and stay green after it.
- **Demonstration:** the probe shows about 80 stale a turn, not 1,189; the ratchet shows the legal actions falling
  from 24 ms toward 5 ms.
- **Accepted when** incremental equals full holds on all three walks, the decision (execute plus legal actions) is
  under 15 ms at the median, and the ratchet's baseline is lowered.
- **Risks:**
  - picks are recorded only for keyed reads, so a read without picks must still go stale by name;
  - the `reordered` rule must still invalidate a name whole;
  - the kept line must be advanced to the new world exactly as `all` does today.

**3. A journey leg without the frame (AX-05's journey half)** (rung 2; after task 1, independent of task 2).
- **Build:** `Travel.step` (src/session/travel.ts)'s danger check asks the attack operator's own grounding at the leg's place, through
  KeptGroundings, instead of building `PlayerView.choices` on every leg. The full frame is built once, on arrival or
  interruption.
- **Invariant:** seeded journeys are interrupted at the same hexes, by the same threats, as before. This covers the
  golden routes and one journey for each of `reaches`' five cases (data/rules/passages.kyr:86): same place, on a way,
  guarding a way from its far end, inside an open container, carried.
- **Demonstration:** a leg under 5 ms on the ratchet; an act's settled time in test/input-answered-browser falls.
- **Accepted when** the interruption spec is green for all five cases, before and after, and OR-145's browser number
  is under 300 ms p95.

After these: sprint 2's first minute, starting with OR-160 (Play) and the pre-rolled world (AX-04, OR-23).

## For the next builder

- **Baseline measurements:**
  - act-cost-profile.md: stages and profile shares;
  - outcome-cost-study.md: 10.5 ms an act forked;
  - sprint-0-baseline.md: census breaches warrior 4, mage 6, gold 3; browser settled: act 372 ms, talk 202 ms,
    reply 134 ms;
  - the probe above.
- **Commands:**
  - `bun run check:fast` (~30 s), then `bun run test:changed`;
  - `bun scripts/continuity-census.ts`;
  - `bun scripts/planning-views.ts` and `bun scripts/planning-instruments.ts next`;
  - `bun --cpu-prof` over the warrior walk;
  - landing by `scripts/landing/land.sh <sha>`, and the full suite by `scripts/landing/full.sh <sha>`. A landed
    commit gets a new id; never wait on the old one.
- **Interfaces touched first:**
  - src/campaign/kept-groundings.ts, src/lang/kept-reading.ts and src/lang/world-reads.ts;
  - src/campaign/operators.ts;
  - Travel.step and Travel.danger;
  - src/ui/screen-model.ts and src/presentation/glance.ts;
  - then the sprint-3 files named in the preparation report's §H.
- **Branches:** main is the one app. Work in dated worktrees under /var/tmp/kyrie and land small verified increments
  often (mission-22/handoff-beta.md).
- **Regression risks:**
  - cache invalidation, guarded by incremental-equals-full;
  - journeys walking past a guard, guarded by the five-case spec;
  - specs that pin today's frame shapes (sprint 4: land behind parity and the census, not spec by spec);
  - flaky timing specs: quarantined (test/quarantine.json), run only by the optional quarantine workflow after CI
    passes on main; a spec leaves it by being rewritten lower. OR-182's card timing and act-budget's wall clock are the
    first two.
- **Decisions still the owner's:**
  - is a job offer knowledge or an undertaking (OR-178);
  - do rooms answer weather;
  - which stock starting situations come first;
  - does the dungeon grow from Porthalen's undertown or come from a kit.

  The first three tasks need none of them. Sprint 2 needs the stock-situation answer; until the owner gives one, the
  lead decides it (owner-use-judgment) and reports the choice.

## Is M22-beta ready to start implementation?

**Yes.** No genuine blocker remains. The first task depends on nothing. The second has a measured cause, a named
file and a correctness invariant. The third has its risk enumerated: the five reach cases. The open owner decisions
bear on sprint 2 and later, and each has a default the lead may take.
