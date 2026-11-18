# The maturity track

The owner, 18 November: "investigate a 'maturity track' trying to work through some of [the] suggestions" of the
platform maturity study (`doc/architecture/reviews/platform-maturity-study-2026-11-18.md`, the owner's, in their
checkout). This is the plan for doing so beside the sprints, not a second register: each step cites the register rows
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
4. **Why (§7.1).** `kyrie inspect --why fact <id>` and `--why placement <id>` from what Diagnostics, the ledger and the
   binder trace already keep. Proving slice: why the corn-store key-holder is where they are.
5. **Routes and pursuits (F).** A `Route` form compiled into the pursuits and clock rules there are, introduced only
   after two current modules' hand-written schedules compile to the same Kyr; then counted conversation (R57, R60).
   Invariant: the two modules' kept journeys unchanged.
6. **Compatibility harness (§7.4).** For the pinned worlds and journeys: command ids and presenter rows, save restore,
   placement commitments and replay digest, compared and classified additive, presentation-only, world-moving,
   save-breaking or replay-breaking. This is what lets TR-03's faster roads come back with its replays classified.
7. **Social facts into the ledger (E)** and **8. qualitative placement (D)**, after 6, each by its study proof.

## Begun

- Step 1: the riddle (CL-34) in hand; OR-94 and OR-95 landed 18 November.
- Step 2: started 18 November (an agent, R26/R86/R42).
