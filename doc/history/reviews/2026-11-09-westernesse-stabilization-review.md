# Westernesse stabilization review

**Date:** 9 November 2026  
**Scope:** Read-only review of player experience, architecture, authoring and integration, generated-world adequacy, and verification strategy  
**Repository state reviewed:** `main` at `c56669b4`, with focused tests run against the working tree  
**Central question:** If this repository were inherited today, what should change in its architecture, testing, and development process to make it reliably enjoyable to play within seven days—and what work should explicitly stop?

## Executive diagnosis

Westernesse is not failing because it lacks content, systems, tests, or engineering effort. It is failing because those assets do not yet meet at a stable player-intent boundary.

The recurring path is:

> Authored fact → generated entity → inferred objective → heuristic route or highlight → raw legal command → UI projection → event receipt.

Each stage works locally, but several important relationships are reconstructed downstream from prose, predicates, containment, command names, or regular expressions. The repository can therefore prove that an adventure exists, a command is legal, and a scripted path completes without proving that an ordinary player can identify and execute the next sensible action.

The strongest evidence is:

- M19's own draft says the adventuring loop is "not close to acceptable," the expanded undertown has never been played through the page, and the required five-player acceptance has not occurred ([M19 closure](../missions/19/closure.md)).
- Current `main` fails a focused adjacent-contract test. A four-file run took 97.16 seconds: ten tests passed, but `choice-contract` found a map `travel:` offer with no valid itinerary. Both new cross-hex tests passed. A narrow invariant is green while the adjoining player contract is red.
- The checked-in timing inventory covers 582 of 736 test files and totals 390.5 test-minutes. Fifty recorded files take at least three minutes individually. The published 12-minute/130-test-minute figure is stale ([verification](../../architecture/verification.md)).
- M19's closure snapshot says 210 rows; the current register contains roughly 246 M19/PD rows. "Fixed" explicitly does not mean independently accepted.
- Twenty-one authored adventures are installed but have never been played together by one protagonist ([M19 closure](../missions/19/closure.md)).
- Since 19 October, the repository has accumulated roughly 1,748 commits; 849 were from 3–9 November, including 114 merges. This is extraordinary integration churn during a stabilization mission.

The conclusion is not that the engine should be rewritten. It has substantial reusable foundations. The immediate need is to stabilize the semantic contract between player intention, actionable objective, spatial route, contextual interaction, consequence, and persistent presentation.

Human enjoyment cannot be established from this review. That requires fixed-build cold playtesting.

## Causal map

| Root cause | Finding status | Player-facing effects |
|---|---|---|
| Objectives identify prose and predicates, not a typed actionable subject and destination | Established | Guidance selects containing areas, exits structures, highlights the wrong person or place, or cannot distinguish "go there" from "do this there" |
| Spatial policy is imposed in presentation rather than command legality | Established | Cross-hex controls can be hidden while direct clients retain the underlying movement; adjacent map planning can regress |
| UI derives interaction meaning from the full legal-command set | Established | Combat overload, nested target menus, topic-menu NPCs, inconsistent priority and highlighting |
| Perception and locality semantics exist but are optional or inferred | Established | Offscreen processions or speech can become immediate narration; world history, perception, and discovery blur together |
| Scenario tests prove scripted reachability more often than player discoverability | Established | Green suites coexist with failures in the opening minutes |
| Full worlds and long authored paths are repeatedly rebuilt | Established | Slow feedback, stale timings, five-way sharding, and reduced ability to rerun the same first-hour loop |
| Integration volume exceeds experiential validation capacity | Established | Local repairs, register growth, shifting behavior, and insufficient cold revalidation |
| Commissioning rewards breadth and completed artifacts more than integration-ready play | Strongly supported hypothesis | More adventures, art, and revision rounds arrive while core interaction contracts remain unstable |
| Excessive accumulated context causes local patching | Plausible, not established | Exception-heavy guidance and presentation code; this should not be treated as proven causation |

## 1. Player-experience pipeline

### 1.1 Opening settlement: generated first-town rats

The strongest current end-to-end proof is `test/first-town-job.test.ts`. It follows player-facing labels through arrival, notice, merchant, key, corn-store, cellar, rats, buck rat, return, payment, and inventory. It passed in the focused run.

It proves that:

- The adventure is instantiated.
- Its rooms and actors retain executable identities.
- Required actions and consequences exist.
- Completion and payment can occur.

It does not prove that:

- A cold player notices the correct lead.
- The visual hierarchy explains Look, Go, and aims.
- Alternate callings or orders remain coherent.
- The reward, changed world, and completed objective are understood.
- The same path succeeds through the rendered interface.

### 1.2 Interior quest: House That Grows

`test/house-that-grows-slope.test.ts` establishes authored rooms, stateful gates, alternative capabilities, companion consequences, and downstream vote effects.

This is good evidence for consequence execution and stable adventure-local identity. It remains a long scripted happy path. It does not independently establish ordinary discovery or UI actionability.

### 1.3 Overland expedition: Serewater

`test/expedition.test.ts` integrates distance, elapsed time, food, camping, lodging, commerce, rescue, followers, and return.

It proves considerable travel mechanics. It does not prove:

- World-map-only cross-hex enforcement.
- That the player can read and choose the intended route.
- That knowledge-limited route presentation remains truthful.
- That a journey does not stop at an intermediary the player did not intend.

### 1.4 Combat dungeon: generated undertown

`test/undertown.test.ts` covers the notice, locked entrance, light, fights, rest, joined wings, puzzle, deeper levels, loot, and payment. Six undertown assertions plus the opening job passed locally, but individual assertions took approximately 5–15 seconds.

Some undertown tests directly relocate the party or assert knowledge. Therefore:

- Existence and mechanical execution are established.
- Full discovery from the honest starting state is not.
- The rendered dungeon-and-return journey remains unaccepted.

### 1.5 Precise boundary failures

#### Objective → actionable target

`src/presentation/undertakings.ts` extracts places and people from objective words and conditions. `src/presentation/glance.ts` then compensates for parent and container ambiguity. This is the systemic reason guidance repeatedly points outside structures.

#### Legal movement → spatial policy

Movement is lowered as an ordinary legal spatial operator in `src/spatial.ts`. Cross-hex classification appears later in `src/ui/passages.ts`, and the browser hides it in `web/reader/menu-model.ts`. The rule is a UI and projection convention, not an engine invariant.

#### Legal command → designed interaction

Combat projects every legal ability through `src/ui/combat-model.ts`. `src/ui/combat-choices.ts` exposes each ability and then a target list. The component is faithfully displaying the command model; it lacks a separate layer of player intents.

#### World event → perceived narrative

The engine has observations, knowledge sources, locality, shelter, and perception concepts. But unanchored rule narration remains unsafe, and player feedback can append NPC chronicle entries as "You witness" in `src/presentation/action-feedback.ts`.

#### Consequence → lasting history

Persistent state is much stronger than the lasting narrative model. The latter recognizes a limited set of happenings rather than typed acts such as promises, testimony, public recognition, institutional change, and historical significance.

## 2. Spatial coherence and movement

A credible canonical hierarchy already exists:

> plane → region → settlement or wilderness → site or building → level → room

Containment and validation live in `src/spatial.ts`. Stable IDs, doors, exit modes, ancestry, and knowledge-gated passages are real foundations.

The required repair is not a new spatial rewrite. It is to:

1. Add a typed objective target with at least `subject`, `actionAt`, `routeTo`, and an optional progression predicate.
2. Make journals, highlights, route planning, and conversations consume it.
3. Retain prose and predicate inference temporarily as compatibility plus an author lint.
4. Enforce cross-hex travel beneath presentation, either through a distinct `travel` operator or an engine-checked map-travel context.

The decisive regression test is: directly submitting a cross-hex local movement command must be refused even if no browser is involved.

The current cross-hex change should be described as UI-enforced, not as a structural invariant. The new tests check the projected menu and map paths; they do not prove rejection in the underlying action model.

## 3. Interaction architecture

Combat already has contextual cards, enemy intentions, aftermath, and auto-resolution support in `web/reader/stage/fight-stage.tsx`. The problem is the primary selection model.

The recommended hierarchy is:

- **Primary intents:** strike, defend or reposition, use magic or technique, use an item, flee.
- **Contextual recommendation:** one or two appropriate actions based on range, target, resources, and current threat.
- **Direct manipulation:** selecting a visible enemy performs or prepares the default strike; explicit target selection remains for ambiguous and area effects.
- **Advanced actions:** the mechanically complete list remains available behind progressive disclosure rather than as eighteen equal top-level controls.

NPC interaction needs explicit exchange semantics:

- greeting and current state;
- an immediate request or response owed;
- contextual acts;
- relevant questions;
- learned or background topics;
- leave.

A portrait with no exchange or contextual act should not advertise a meaningful conversation.

Inventory should expose three separate states:

- equipped or held;
- worn;
- carried.

The current model mainly exposes `equipped` plus an optional slot, and the pack calls all such items "in use" in `web/reader/pack-grid.tsx`.

Notes and Story should be projections over different records:

- **Notes:** unresolved intentions, promises, reported routes, uncertain facts, and current aims.
- **Story:** selected witnessed events, consequential decisions, discoveries, completed promises, and major losses or gains.
- **Receipts:** immediate transient action feedback, not permanent narrative by default.

## 4. Narration and player knowledge

The repository has useful distinctions in `src/presentation/player-view.ts`:

- observations;
- knowledge with `seen`, `found`, `heard`, and `read` sources;
- assumptions;
- deadlines;
- present entities;
- chronicle entries.

Kyr can express much of the needed behavior, but locality must become explicit and safe by default.

The recommended authored event envelope is:

```text
event truth
audience or perception rule
knowledge produced
actionable inference or lead
prominence and lifetime
```

Unanchored player-facing rule speech should lint or fail unless declared `global`, `news`, or `history`. Only first-hour content should be migrated during the stabilization week.

The runtime should maintain explicit distinctions among:

1. What happened in the world.
2. What the character directly perceived.
3. What the character learned indirectly.
4. What the character can reasonably infer or act upon.
5. What deserves lasting narrative prominence.

## 5. Kyr, Deem, and the authoring boundary

The general engine boundary is only partly achieved. Adventure-specific names in TypeScript are mostly comments and regression history, not active branches. The more significant coupling is setting infrastructure:

- Imbar material-plane assumptions in `src/campaign/module-canon.ts`.
- The Imbar calendar in `src/campaign/calendar.ts`.
- Imbar's world shape in `src/world/world-shape.ts`.
- Imbar encyclopedia construction in `src/handbook/encyclopedia.ts`.

These are genuine architectural debt, but extracting them should not enter the seven-day critical path.

Independent composition genuinely supports namespaces, imports and exports, canon binding, and stable installation IDs. Shared identity remains opt-in: two authors referring to the same institution or person create duplicates unless they bind the same exported or canonical entity.

A future integration manifest should declare:

- imported shared entities;
- exported entities;
- entry leads;
- required capabilities and resources;
- typed objective targets;
- persistent consequences;
- ending predicates;
- world-generation requirements.

### What is genuinely reusable

- The layer-ownership contract in `doc/CONTRACT.md`.
- Namespaced, lazy province installation and save-stable IDs.
- The Kyr scaffold, lint, compile, and test trail.
- Generated-town role binding against shared places.
- Focused province tests that can demonstrate lead, route, consequence, and reload.

### What makes independent content expensive

- Many scenario proofs use preset shapes or parties that ordinary play cannot have.
- Installed adventures cannot safely share every authored-city case; first-writer and lazy export behavior remain boundaries.
- Stable author semantics are missing for some contextual topics, retries, scoped narration, conditional state text, pursuit, and member identity.
- Corpus-wide naming and identity collisions are often repaired during integration rather than rejected before it.
- Long standalone tests prove scripted paths but not player discovery.
- Large batches are integrated during the same period in which the primary builder is meant to stabilize the opening experience.

## 6. Test-cost report

### 6.1 What CI actually runs

The main workflow contains four logical gates spread across nine jobs:

- one lint and type-check job;
- five general-suite shards;
- one long-descent job;
- two browser shards.

Pages is a separate build and deployment workflow and repeats three play and persistence tests before rebuilding the site.

Every push to every branch and every pull request triggers the full main CI workflow. This is a major multiplier for independent author branches.

### 6.2 Measured inventory

- 736 `*.test.ts` files.
- Approximately 5,746 test declarations.
- 26 browser-spec files.
- 582 files represented in `test/timings.json`; roughly 154–157 discovered specs are currently untimed, depending on the discovery method.
- 390.5 aggregate recorded test-minutes, not the documented 130.
- 254 timed files under two seconds.
- 50 timed files at or above 180 seconds.
- Several authored-adventure suites take 4–10 minutes individually.
- A focused four-file command took 97.16 seconds.
- A bounded `test:quick` audit was still running after 120 seconds and was terminated. Concurrent load prevents treating this as a stable benchmark, but the documented 30-second figure should not be used without remeasurement.

The focused command produced one important current-main failure:

```text
test/choice-contract.test.ts
on the map go where the engine can plan a journey

offered travel command: on__edge_west_road,region__edge_west)
Itineraries.plan(...): false
```

This immediately followed the cross-hex change. Both `hex-ways` worlds passed, illustrating a recurrent verification weakness: the local fix is covered while the adjacent player contract is broken.

### 6.3 Cost drivers and duplication

1. The quick suite is timing-driven rather than risk-driven and excludes untimed files.
2. Changed-test selection cannot soundly track runtime data and generated-world dependencies.
3. Browser setup repeatedly builds sites and launches Chromium rather than reusing one immutable artifact and browser fixture.
4. Many browser journeys inspect an exposed semantic model and could run through a headless session adapter.
5. Long scripted drivers contain recovery behavior that is more capable than a cold player and can conceal poor discoverability.
6. Checkouts, installs, and the Orsino dependency are duplicated across CI jobs.
7. Critical paths can remain skipped in ordinary scenario suites while CI is green.

### 6.4 Proposed verification arrangement

#### Under 60–90 seconds: local contract loop

- Parser and lowering tests.
- Spatial containment and command-legality tests.
- Objective-target and highlight tests.
- Combat mechanics without world assembly.
- Inventory state transitions.
- Persistence codec round trips.
- Narration-locality tests.
- Small immutable compiled fixtures and shared in-process world snapshots.

#### Under three minutes: release-intent loop

One honest-start headless journey:

> opening → take lead → route → enter → contextual interaction → combat → loot → report → reward → save and reload

Run it over a small calling matrix and a few deterministic seeds. Never teleport the party or inject knowledge.

#### Per pull request

- The fast contract and release-intent suites.
- Changed engine integrations.
- The changed adventure's parse, schema, reference, deterministic-instantiation, reachability, actionability, consequence, and reload checks.
- A small browser smoke layer against one prebuilt site artifact.

#### Targeted integration

- Run only scenarios whose declared inputs or engine contracts changed.
- Shared-rule changes fan out by contract categories rather than automatically invoking every long narrative path.
- Reuse built sites, compiled modules, generated reference worlds, and browser processes.

#### Nightly

- All adventure journeys.
- Multi-seed world census and distributional checks.
- Deep descents, fuzzing, wander, and autoplay.
- Full cross-adventure composition.
- Visual snapshots and painting-assignment census.

Correctness is preserved by moving checks to the layer that owns the claim, not by deleting them.

## 7. Author-builder integration and workflow

The repository is unusually productive but lacks a reliable conversion from implemented or reachable to coherent and enjoyable. The project contract itself says developer play is not independent acceptance and that completion requires working play (`doc/CONTRACT.md`). In practice, builder play, scripted journeys, and green focused specs have carried too much evidential weight.

The register is becoming a second product. Its traceability is useful, but rapid row growth makes closure documents stale and risks substituting accounting for repeated play of the same experience.

The sustainable division of responsibility is:

- **Engine builder:** owns semantic contracts, the reference opening, cross-cutting regressions, and the release branch. No adventure-local engine branch enters main without a generalized failing test.
- **Independent authors:** own honest-start standalone play, every ending's reachability, consequence and reload, contract validation, and a machine-readable integration manifest.
- **Technical reviewers:** validate contract conformance and systemic engine requests; reject teleport-only proofs and setting-specific engine behavior.
- **Cold playtesters:** assess comprehension, intention, orientation, continuity, and motivation on fixed release candidates.
- **Owner:** chooses the reference first hour, freezes its acceptance criteria for the week, and pauses new content commissioning while that gate is red.

New adventures should remain tagged on independent branches with reproducible artifacts. A nightly integration census can retain and validate them without imposing immediate integration cost on the primary builder.

The recommended merge gates are:

1. The author branch is internally complete and honestly playable.
2. Automated integration proves namespaces, bindings, consequences, and persistence without new content-specific engine behavior.
3. Mainline promotion occurs only when it serves the current player-facing mission and passes its fixed cold journey.

## 8. Generated-world census

`src/world/world-audit.ts` already checks structural graph reachability, resources, clue carriers, aims, and predicate producibility. `scripts/navigation-census.ts` finds dead ends, duplicate labels, and crowded rooms.

Neither proves playability. Their reachability ignores some combination of locks, knowledge, hazards, affordability, party capability, and UI exposure.

The census should report seven distinct stages:

1. Defined and compiled.
2. Instantiated and canonically bound.
3. Structurally connected.
4. Legally reachable for a specified party and state.
5. Discoverable from initial knowledge through obtainable clues.
6. Actionable through public player commands.
7. Completable with visible consequence and persistence.

### Hard per-world invariants

- Valid containment with no illegal cycles.
- No unresolved canonical bindings.
- Every instantiated adventure has an obtainable entry lead.
- Every objective target resolves to an entity and actionable place.
- Required resources have a legal acquisition path.
- Cross-hex commands fail outside map travel.
- Completion consequences survive reload.
- No completed objective remains highlighted as presently actionable.

### Distributional checks across seeds

- Adventure and site frequency.
- Route length.
- Habitat and encounter mix.
- Shops and equipment availability.
- Class-specific opportunities.
- Painting assignment.
- Economy and resource supply.
- Difficulty and death rates.
- First-hour completion rates.

Aggregate counts must never be reported as evidence of discoverability or actionability.

## 9. Seven-day remediation plan

| Time | Work | Evidence and expected improvement | Complexity and principal risk | Observable acceptance test |
|---|---|---|---|---|
| Day 0–1 | Freeze content and integration. Select one seed, ordinary character, settlement job, structure, overland leg, dungeon fight, return, reward, and reload. Run owner plus two cold sessions on one commit. | Establishes stable truth about the same first hour. | Low technical cost; high discipline risk. | Versioned recordings and intent log; no assistance. |
| Day 1–2 | Add typed objective targets for the selected path; fix container/interior guidance and truthful highlights. | Following an aim leads to the exact actionable place and subject. | Medium; compatibility with old objectives. | Headless route never exits the objective structure; redemption and completion remove stale highlights. |
| Day 2 | Enforce map-only cross-hex movement in command legality; repair the current failing map-plan contract. | Local navigation cannot accidentally cross country. | Medium; authored-land edge cases. | Direct illegal command rejected; generated and authored maps retain valid plans. |
| Day 2–3 | Build the fast intent runner with cached compiled fixtures. | The same first hour can be rerun in minutes. | Medium; danger of creating a second UI model. | Honest-start journey under three minutes, selecting only player-view commands. |
| Day 3–4 | Simplify combat and conversation for the reference hour; add direct enemy selection; distinguish worn, equipped, and carried. | Fewer top-level controls, meaningful portraits, and legible inventory. | Medium UI risk. | Cold player identifies a sensible action without exhaustive menus or assistance. |
| Day 4–5 | Audit immediate consequence, world state, aim retirement, Story and Notes, and reload. | The player can see what changed and what remains. | Medium. | Reward, injury, loot, NPC state, and objective state survive leave, return, and reload. |
| Day 5–6 | Exercise decline, alternate order and calling, insufficient light, retreat and re-entry, wrong target, and mid-quest reload. | Fewer softlocks and misleading states. | Medium. | No duplicate reward, lost aim, stale highlight, or silent refusal. |
| Day 6–7 | Freeze the candidate and run the existing five-player M19 protocol. | Produces evidence of comprehension and enjoyment rather than implementation. | Human scheduling risk. | Four of five meet orientation and motivation thresholds; all complete ordinary intentions unaided. |

### Explicit exclusions

- No new adventures, paintings, species, classes, planes, or major geography.
- No package extraction or engine rewrite.
- No wholesale TypeScript-prose migration.
- No shared-metropolis redesign.
- No generalized history or institution simulation.
- No Encyclopedia expansion.
- No integration merely because a branch is ready.
- No broad register intake beyond release blockers.
- No closure based solely on a commit or passing focused test.

## 10. M19 closure implications

### Satisfied at implementation level

- Canonical containment validation.
- Engine-owned aim identity and ID-based aim places.
- Single world-map presentation and choose-then-travel behavior.
- Save and reload repair for dynamically created or given entities.
- Headless first-town job completion.
- Structural generated-world audit.
- Cross-hex UI suppression in the new focused tests.

### Unverified as player success

- All "Fixed" rows without independent acceptance.
- Resting-scene redesign.
- First-hour guidance after the latest repairs.
- Expanded undertown and deeper dungeon through the rendered page.
- Authored adventures reached honestly from Begin.
- Post-fight aftermath and objective retirement.
- Redemption highlights.
- Notes and Story differentiation.
- Cold-player comprehension and enjoyment.

### Still unmet

- PD-14 five-player acceptance.
- M19-46: play as a world moved through rather than a command page.
- M19-155: the full dungeon route.
- M19-173: complete rendered journeys.
- PD-08: coherent separation of heard facts, leads, aims, routes, and immediate actions.
- Reliable integration of installed adventures in one persistent protagonist's world.
- Structural cross-hex enforcement; the current fix is presentation-level.
- Current `main`'s failing map and itinerary contract.

M19 can reasonably close as an implementation mission with unresolved acceptance. It cannot close as successful player-experience stabilization.

## 11. Process retrospective

### To the owner

- Stop commissioning breadth until a fixed build passes the first-hour gate.
- Freeze the acceptance criteria for seven days.
- Judge the same release journey repeatedly, not a moving succession of builds.
- Treat "I could not tell what to do" as a product failure even when the underlying command exists.

### To the primary builder

- Protect a stabilization branch.
- Set a daily integration budget of zero unless a branch directly repairs the reference hour.
- Require every systemic fix to identify the semantic contract, a failing focused test, the affected release journey, and the independent acceptance still required.
- Treat the register as evidence bookkeeping, not the product.

### To independent authors

- Completion means an honest-start playable artifact, not only Kyr files and scripted endings.
- Supply compile and lint output, an entry lead, typed targets, ending paths, consequence and reload proof, and declared engine gaps.
- Keep ready adventures tagged on independent branches. Nightly integration can retain their value without imposing immediate mainline cost.

### To technical reviewers

- Reject teleport-only evidence for player-facing claims.
- Distinguish structural existence, legal reachability, discoverability, UI actionability, and human acceptance.
- Re-run the same player journey after repairs before opening a new review front.

### To commissioners

- Pay for verified player outcomes and contract-clean artifacts, not volume, document count, revision rounds, or immediate merge.
- Require engine-gap requests to include a minimal generalized reproduction.
- Do not reward adventure-local engine branches.

## Conclusion

The work to stop immediately is content expansion, opportunistic integration, broad defect-register growth, and architectural extraction.

The work to begin immediately is narrower:

1. Make one ordinary first hour the release specification.
2. Give objectives typed actionable targets.
3. Enforce spatial policy in the action model.
4. Add an honest, fast intent-level verification loop.
5. Present contextual player intents instead of raw command breadth.
6. Verify consequence, persistence, and narrative prominence.
7. Accept the result through fixed-build cold play, not implementation counts.

Westernesse already contains more than enough material for a compelling game. The seven-day opportunity is to make that material cohere around what a player knows, means, can do, sees happen, and remembers afterward.
