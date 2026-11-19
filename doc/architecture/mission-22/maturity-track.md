# The maturity track

The owner, 18 November: "investigate a 'maturity track' trying to work through some of [the] suggestions" of the
platform maturity study (`doc/architecture/reviews/platform-maturity-study-2026-11-18.md`). This is the plan for doing so beside the sprints, not a second register: each step cites the register rows
it moves, and its rows are MT-01.. in the open register.

## The rules the track keeps (the study's §9, and the mission's own)

1. **Subordinate to play.** The opening, the owner's P0s and the sprint board come first. The track runs in the one
   agent slot the sprints leave, or in the lead's gaps.
2. **One proving slice and one construction invariant per step.** A step is closed only when a real Westernesse
   sequence works through it and a spec makes the old failure impossible to write, not when a type or a grammar
   production exists.
3. **Compile into what is there.** Libraries and sugar expand into ordinary Kyr; no second interpreter, no second
   scheduler, no Deem-written Kyr.
4. **World-moving changes last, and measured.** Anything that changes generated worlds (placement, fact projection,
   roads: see TR-03's revert of 18 November) waits for the compatibility harness (step 6), so a kept replay that
   moves is classified rather than re-recorded by hand.

## Where each suggestion stands (checked against the code, 18 November)

| Study item | State found | Track step |
|---|---|---|
| A. Authoritative `Doable` and presenter | Steps 1–2 landed (TB-12): the runner, terminal and autoplay read Doable; the rail's marks read the lens's own rows (LensRows, OR-95); indicators need witnesses (Attest). Open: the page's folds (GlanceStage.acted), the riddle as an engine focus (CL-34, in hand), the page's own buttons (OR-94: 70 in 28 files, ratcheted) | 1 |
| C. Semantic lint and source queries | `kyrie lint` runs about forty checks; none for R26 (an action's site not tied to what it acts on), R86 (a person `nowhere` moved by `at(x, ?p)` with no `Arrives`), R42 (a shared name shadowed, found only at the spec) | 2 |
| B. Typed exports and outcomes | Exports are `Record<string, string>` (`src/campaign/definition.ts`, `module-namespace.ts`); a parent reads a child's Kyr to know what an export is | 3 |
| §7.1 `why` queries | `kyrie inspect` answers why a choice is or is not offered; nothing answers why a fact holds or why a placement won (the ledger and binder trace keep it) | 4 |
| F. Route/schedule and conversation libraries | Movement on a clock is written by hand in at least ten modules (`Pursuit` in wrongboat 60 times, patient-star, sallowfield, quittance, thrume, brood-hollow, caught-below); R41, R54, R89, R57, R60 | 5 |
| §7.4 Compatibility harness | Kept traces and replays are digests; a world-moving change shows as a failed digest, unclassified | 6 |
| E. Social facts into assembly; D. declarative placement | Not begun; world-moving | 7, 8 |
| G–I. Institutions, versioned schemas, runtime-sensitive composition | Deferred, as the study says | — |

## The steps

1. **Finish the presenter (A).** Proving slice: the speaking door's riddle read and answered alike on the page, the
   runner and the terminal (CL-34); then the page's folds through Doable (TB-12's page half), then OR-94's count to
   the rows, the lenses and the books. Invariant: test/small/one-projection's `it.failing` passes; page-controls'
   ceiling falls to the allowed set.
2. **Intention lint (C).** Proving slice: R26, R86 and R42, each reproduced as its request says, then found by the
   lint at its source line, advisory first. Invariant: a spec per check, written from the request's own reproduction.
3. **Typed exports (B).** Optional roles on exports (fact, outcome, participant, place, capability), inferred for the
   ones there are, a lint advice for an export with none. Proving slice: one parent (a standing module's complication)
   composed from declared roles alone. Invariant: a typed export read as the wrong role fails at the load.

   **Landed 18 November** (`src/campaign/module-exports.ts`, `src/cli/export-roles.ts`). An export may be written
   `"held": { "entity": "held", "role": "fact" }`; the string form stays valid. Five roles, and the entity types
   each admits: fact (fact), outcome (fact, condition, ending, milestone), participant (group, identity), place
   (place, passage), capability (thing, item, good, capability). The role is inferred from the compiled entity: a
   fact is an outcome where it is not established at the outset and nothing in play reads it (no act's condition, no
   rule but a milestone's or an ending's, nothing seen), only the goal, objectives and milestones if anything. At the
   load: a declared role its entity cannot play fails (`Module child exports word as place, but word is a fact`); a
   child's declared roles are kept on its installation (`exported`), and a parent's import whose `roles` type the
   child's role does not admit fails (`Module gate imports forged as fact from drove.altered, but drove exports
   altered as participant`). `bin/kyrie lint --exports` reads every module in data/ on its own (imports unbound,
   the canon's kinds in), lists each export with its type and inferred role, an error where a declaration
   disagrees, advice for each export with none (`--verbose`): 59 modules, 363 exports, 15 declared; inferred place
   183, participant 87, fact 49, outcome 37 (30 of them the canon's world events, rose_made_whole..pharos_fed),
   capability 7; none unclassified, no disagreement. Proving slice: the drove's and the sea-gate's exports
   annotated; the gate's three imports of the drove (forged = drove.altered fact, freedword = drove.road_west
   outcome, drovedrowned = drove.found_drowned fact) validated from the two manifests and the scenario alone
   (test/export-roles). Nothing moves: `compat --base origin/main --quick` says `same`; test/traces, drove-return,
   iscoed-sea-gate pass. Open: the roles are not yet required (advice only); no situation hook or kit reads a
   child's outcome by role; the other 57 modules untyped; the inference of outcome is lexical (an id read).
4. **Why (§7.1).** `kyrie inspect --why fact <id>` and `--why placement <id>` from what Diagnostics, the ledger and the
   binder trace already keep. Proving slice: why the corn-store key-holder is where they are.

   **Landed 19 November** (`src/cli/why-tool.ts`, `why-fact.ts`, `why-placement.ts`, `why-sources.ts`,
   `why-writer.ts`). The campaign is played to where it is asked, as `kyrie inspect` plays it; nothing is guessed:

       bin/kyrie inspect --why fact <campaign.json> | --world <seed> "at(region__s1_merchant, ?)" [step ...]
       bin/kyrie inspect --why placement <campaign.json> | --world <seed> <id> [step ...]

   A fact (a relation, `?` for any argument; a module's relation by its own name where one module has it) is told by
   what holds now; whether it held as play began, and the line that says so (an `Initially`, else the declaration of
   what it is about), in the module's own files or the world's generated Kyr, with the generator's template that wrote
   a generated line (`WhyWriter`: src's template literals and data's .kyrt, the one whose own words cover most of the
   line); what the assembly ledger committed of the things it names, by whom; and each step that changed it, change by
   change, by the rule that fired (CampaignTick's witness, the review observer's hook), someone else's act (the step's
   NPC decisions), or the act taken, each at its declaration. A placement (a kit's installation id, a scenario's
   instance, or a place bound) is told from the composition the campaign's manifest makes again by its seed (the same
   ledger and trace): per slot, how many were weighed and fit, how many each requirement ruled out, the best score and
   how many shared it, and the seeded draw that chose among them (the binder's own `Binder.draw`, said only where it
   is the placement's own), any candidate tried first and backed out of; then Deem's proposals, the commitments and
   the modules; a scenario the world's assembler placed by its report (bindings, eligibility, modules).

   Proving slice, a1's first town: `--why fact --world a1 "at(region__s1_merchant, ?)"` says Mik is at the shop as
   play began, `world-a1/region/region.kyr:44: Person s1_merchant "Mik" at s1_shop`, generated by
   `src/world/settlement-writer.ts:154` (the shop where the town sells from one, else the green); after `">s1_shop"
   "Mik" "Ask Mik about the rats in the corn-store"`, `keyholder(?, region__s1_u_store_lock)` says `+
   keyholder(party, region__s1_u_store_lock), by the act region__s1_u_rats_job_ask(party,region__s1_shop)` at
   `world-a1/region/company.kyr:108`, generated by `data/generation/town/undertown.kyrt:368`. `--why placement
   --world a1 region__w4`: the raiders' approach, 78 weighed, 60 fit, 18 ruled out by four requirements, score 2
   shared by 4, the draw 0.573 lowest of four. Invariant: test/small/why (a one-module world whose keeper a rule
   moves: the declaration's line, the rule's line for each change, an act's own change; the fells' raider-hold kit
   placed with nothing fixed under three seeds, the draw said the binder's own; the generator found for the two
   slice lines). Nothing moves: command-line only (DrawnWorld.drawn keeps the assembler's source and report for it).
   Open: `why action` is `kyrie inspect` as it was; a placement made by the world's assembler (WorldAssembler's
   scenarios) keeps no candidates, so it is told by its bindings and eligibility only; `dependents <symbol>` (§7.1's
   fourth) not begun.
5. **Routes and pursuits (F).** A `Route` form compiled into the pursuits and clock rules there are, introduced only
   after two current modules' hand-written schedules compile to the same Kyr; then counted conversation (R57, R60).
   Invariant: the two modules' kept journeys unchanged.

   **Route landed 19 November** (`src/lang/routes.ts`; the grammar's `Route`). Someone who keeps a round on the clock:

       Route riders for riders priority 5 when not riders_gone(party) {
         scar "riding the Scar road" at lookout from watch 12.
         ford "riding down to the ford" at ford_stones from watch 80. }

   lowered as the parser reads it into a `Pursuit {route}_{leg}` for each leg, sought from its watch until the next
   leg's (the last for good), its window first and the route's condition after, joined to the right as "a and b and c"
   is; a leg whose watch does not rise fails at its line. No scheduler of its own: the pursuits are the ones there
   were. The two modules whose schedules were such pursuits written by hand, Sallowfield's riders (four legs, a
   condition) and Quittance's Fettiplace at the wake (two, none), now say a Route, and compile to those pursuits key
   for key (test/small/clock-routes keeps the hand-written lines of 19 November and compares the JSON of both), so no
   journey or save can move: test/sallowfield (49) and test/quittance-wake (20) pass. In the authoring guide
   ("Someone on an errand of their own").

   **The moving target landed 19 November** (R54): `Pursuit hunt_bess for bess "coming for you" priority 8 when
   huntBess() seeks the company.` is said again, when the module's files are joined (`Routes.company`, from
   ModuleBundle's merge), as a pursuit for each of the module's rooms in the order declared: `hunt_bess_<room>`, its
   condition and `at(party, <room>)`, seeking `at(bess, <room>)`. The Wrong Boat's hunt, sixty hand-written lines (30
   rooms each for Bess and the lads), is two, and compiles to those sixty key for key (test/small/company-pursuit
   keeps them); only their order differs (the lockup is declared before the Pelham inn, the lines had it after),
   which cannot matter, each asking that the company is in its own room, so one is eligible at a time; wrongboat and
   wrongboat-2 (46) pass. Open: a route suspended while
   its walker is occupied (R89's proposal); a route by day and hour rather than watch (R41's `Keeps … from … to`);
   the arcology's rival stages, whose legs also change the world, stay rules; then counted conversation (R57, R60).
6. **Compatibility harness (§7.4).** For the pinned worlds and journeys: command ids and presenter rows, save restore,
   placement commitments and replay digest, compared and classified additive, presentation-only, world-moving,
   save-breaking or replay-breaking. This is what lets TR-03's faster roads come back with its replays classified.

   **Landed 18 November** (`scripts/compat.ts`, `src/cli/compat-snapshot.ts`, `src/cli/compat-journeys.ts`,
   `src/cli/compat-compare.ts`). A snapshot of the pinned set: the worlds a1, kite and iscoed (as the drove and as
   the weir begin) — every place, every passage with its ends and minutes (`ActionTime.passage`), every creature and
   where it is, every placement by its bindings — and the journeys: the fourth and fifth cold plays' lines
   (`doc/architecture/mission-22/cold/cold-4-lines.txt` and `cold-5-lines.txt`, sent to the runner as the iscoed
   cold-play specs send them) and each kept trace (`test/fixtures/traces`), every step recorded as: taken or why not,
   the rows the runner offers after it (`id | label`, opened rows too), the scene's lines, the digest; and each
   journey's end saved, restored in its own build, and (with a base) the base's save opened in this build. Two
   snapshots compared, each difference is one of: additive (a place, passage, person, placement or row more, nothing
   gone), presentation-only (a label or line changed where the digest after the step is the same), world-moving
   (layout, minutes, people or placements changed; play coming to another watch or place; a row no longer offered; a
   label or line changed where the state is not the same), replay-breaking (a recorded line or command taken before
   and not now, or steps fewer), save-breaking (a save not restoring, or the base's opening as another game). A
   journey is told until play first comes to another watch or place; the turns after are counted, not listed.
   Deterministic: a tree against itself says `same`.

       bun scripts/compat.ts --base origin/main            # the base checked out in /var/tmp/kyrie/compat/base
       bun scripts/compat.ts --base /var/tmp/kyrie/wt-x    # a worktree that holds the base
       bun scripts/compat.ts snapshot --out base.json --saves dir [--quick]
       bun scripts/compat.ts compare base.json [now.json] [--findings all.json] [--examples n] [--out now.json]

   A base without the harness has its four files copied in. The whole set is about two minutes a snapshot (so four
   with `--base`); `--quick` (a1, the cold play 4's first twelve lines, the Hessel trace) is 18 s a snapshot, about a
   minute with `--base` (the checkout and a cold parse cache), so it is not on the push lane: a stored quick baseline
   compared would be 18 s, and goes stale with every change it reports. `test/small/compat-kinds.test.ts` pins the
   classes on snapshots shaped as the runs below.

   The two proofs, against ccf5ec1a's snapshot:
   - **Wording** (`data/voice/conditions.json`, defending's "{target} stands on guard." to "{target} takes guard,
     blade up."): `presentation-only: 1`, at `cold-5 step 43 {"act":"fight:defend:region__party_1"}`, nothing else.
   - **TR-03's faster roads** (cf45653a's `region-roads.ts` and `region-sites.ts`: roads at 20 minutes an hour,
     tracks at 30): `replay-breaking`. World-moving in all four worlds (a1 66 passages, kite 72, iscoed 51 each: e.g.
     a1's east edge road 270 to 180 minutes, iscoed's road to the Long Man's gate 180 to 120). The fourth cold play
     comes otherwise at step 27 (`travel:region__s4` now arrives at Gatesend, watch 65, where HEAD's had turned off
     to the barrow at watch 18), takes step 28's `travel:region__w8` HEAD refuses, and 46 of its later lines are no
     longer offered, from step 29 (`go(region__w8_in,region__w8_barrow_mouth)`) to step 90; the fifth cold play's
     state differs from step 1 but every line still goes, at the same watches and places, with the same rows and
     words; the wren-turf-hut trace arrives at watch 61, not 67 (its kept watch, so test/traces fails); the
     wren-tower trace keeps its watch and places but loses "Set out for Redkeep" and "Talk to Baern" (the priest's
     row became `talk:`). Saves: none broken.
   - Seen on the way: at HEAD the fourth cold play's own lines break at step 27, its journey to Gatesend turned
     aside to the barrow, so lines 28 on are refused or sent into a fight and its save cannot be taken; its spec
     plays only its first twelve.
7. **Social facts into the ledger (E)** and **8. qualitative placement (D)**, after 6, each by its study proof.

## Begun

- Step 1: the riddle (CL-34) in hand; OR-94 and OR-95 landed 18 November.
- Step 2: started 18 November (an agent, R26/R86/R42).
- Step 3: landed 18 November (typed exports; see the step).
- Step 4: landed 19 November (`kyrie inspect --why fact|placement`; see the step).
- Step 5: the Route (Sallowfield, Quittance) and the moving target (the Wrong Boat's hunt, R54) landed 19 November;
  counted conversation open.
- Step 6: landed 18 November (scripts/compat.ts; see the step).
