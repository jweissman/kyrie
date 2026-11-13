# Quest intent and travel contract

**Date:** 9 November 2026  
**Scope:** Narrow, read-only follow-up to the Westernesse stabilization review  
**Repository state reviewed:** `main` at `c56669b4`, with focused inspection and reproductions against the working tree  
**Central question:** What is the smallest safe, generalizable change that would eliminate the recurring quest-navigation and cross-hex movement failures?

## Executive recommendation

The smallest safe repair is two related contracts, implemented independently:

1. Give each actionable objective one resolved semantic target—principally `subject`, `actionAt`, and `routeTo`—and make journals, highlights, navigation, and contextual actions consume that same resolved target.
2. Make cross-hex movement an engine invariant by permitting it only when an ordinary movement command is executed as a trusted leg of `Travel.go`.

This does not require a new planner, spatial rewrite, quest framework, or comprehensive content migration. The existing itinerary planner, action system, objective lifecycle, player-knowledge checks, and public-choice projection can remain.

The recommended implementation fits within two or three days if confined to:

- one objective-target representation and compatibility resolver;
- one shared hex-boundary classifier and trusted travel execution context; and
- three or four focused headless contracts, including one honest-start journey.

The recurring failures arise because the engine already has the necessary facts, but presently reconstructs player intent independently in several presentation components. Cross-hex policy has the inverse problem: presentation recognizes the boundary, but execution does not enforce it.

## 1. Established findings

### 1.1 Objective identity is inferred, not authored

The compiled objective contract contains only:

```ts
interface Objective {
  id: string;
  when: Predicate;
  text: string;
}
```

This is defined in `src/lang/module.ts`. `when` determines whether the objective is active and—through fallback inference—what it is “about.” `text` is also parsed for embedded entity references. Neither field specifies:

- whom or what the objective concerns;
- where its interaction must occur;
- where route guidance should lead; or
- which interaction constitutes progress.

The principal inference is `Stakes.named` in `src/ui/stakes.ts`. It:

1. extracts IDs embedded in objective prose;
2. if none are embedded, collects every argument in every predicate call in `when`; and
3. adds descendants of named spatial entities.

That inferred set is expanded and reinterpreted again:

- `Undertakings.places` adds site exteriors, ancestors, and character whereabouts;
- `Glance.whereabouts` adds known current locations for named people;
- `Glance.inside` substitutes a site for its outside or front;
- `Glance.toward` plans short routes toward members of the resulting set; and
- browser map selection again chooses among the inferred places.

These are individually reasonable repairs, but together form multiple interpretations of the same intent. A containing settlement, exterior, room, person, and predicate participant can all compete to be “the objective.” This is the architectural reason an objective inside a structure can lead the player back outside.

### 1.2 The objective lifecycle is adequate

The lifecycle should be retained:

- an objective is active while `world.test(o.when)` holds;
- the player may follow one active objective; and
- after an action, `Undertakings.after` retires or advances the followed objective when its `when` predicate becomes false.

This is implemented in `src/presentation/undertakings.ts`. It is not the source of the navigation failures. The defect lies in deriving actionable intent from the activation and retirement predicate.

### 1.3 Cross-hex policy is presentation-enforced

Every connection is lowered to an ordinary movement action. The action itself does not encode whether it crosses a hex boundary.

The browser presentation calculates which exits cross hexes and suppresses them from local navigation. The map, however, has two command paths:

- ordinary country destinations use `travel:<destination>`; while
- a visible cross-hex exit returned by `MapView.step` exposes its underlying raw `go(...)` command.

`PlaySession.perform` resolves and executes any publicly offered command without movement context. `Campaign.executeAsync` checks that the action is offered, but not whether its execution violates the map-only rule. A direct raw command can therefore cross a hex without going through world-map travel. Hiding the action in one UI is not enforcement.

## 2. Typed objective targets

### 2.1 Minimum contract

The minimum useful addition is:

```ts
interface ObjectiveTarget {
  subject?: string;
  actionAt?: string;
  routeTo?: string;
  progress?: Predicate;
}

interface Objective {
  id: string;
  when: Predicate;
  text: string;
  target?: ObjectiveTarget;
}
```

The fields have deliberately narrow meanings:

- `subject` is the person or object whose presentation and interactions should receive objective prominence.
- `actionAt` is the exact place where the relevant interaction can occur.
- `routeTo` is the destination route guidance may expose, subject to player knowledge. It defaults to `actionAt`.
- `progress` is optional evidence that an interaction advances the objective.

`progress` should not be required or broadly used in the first implementation. Existing action bindings and consequences already describe what actions touch, and `when` already determines retirement. A mandatory progression predicate would duplicate quest-state semantics. It is justified only where several interactions concern the same subject but existing structural action metadata cannot distinguish the one that progresses the objective.

Spatial targets should also remain optional. Some objectives are temporal, investigative, survival-related, or otherwise non-spatial. A discriminated hierarchy of objective kinds would be cleaner in theory but is unnecessary for M19 stabilization.

### 2.2 One resolution point

Downstream systems should consume one resolved value:

```ts
interface ResolvedObjectiveTarget extends ObjectiveTarget {
  source: "authored" | "legacy";
  confidence?: "exact" | "ambiguous";
}
```

A single resolver should:

1. return the authored `target` when present;
2. otherwise invoke legacy inference once;
3. record that inference as compatibility behavior; and
4. warn when inference is ambiguous or non-actionable.

This resolver belongs near the compiled-module and presentation boundary. The exact module name is less important than the ownership rule: one resolver produces intent, and every consumer projects it according to knowledge and context.

### 2.3 Concrete trace: Garret in the Granary Ring

The “bring Garret up” objective is a representative multilevel-structure case.

The objective is authored in `data/adventures/patient-star/quell.kyr`. Its prose says Garret is held in a granary vault, while its predicate refers to Garret, the party, kinship, sleep, and whether he has been brought up.

Garret is instantiated at a specific vault in `data/adventures/patient-star/tamaun.kyr`. The progression interactions, including bringing him out, are defined later in that file. Completion ultimately asserts `cameUp(garret)`, causing the objective's `when` predicate to become false.

The present trace is:

```text
Kyr objective
  → compiled {id, when, text}
  → text contains no embedded {garret} reference
  → Stakes.named falls back to every argument in when
  → place descendants, site exterior, ancestors and whereabouts are added
  → Glance applies further “whereabouts” and “inside” repair
  → one inferred place drives route and highlight
  → ordinary action execution asserts cameUp(garret)
  → when becomes false
  → Undertakings.after retires the aim
```

The intended trace is:

```text
Kyr objective target
  subject = garret
  actionAt = vault
  routeTo = vault

  → namespace and compile IDs normally
  → instantiate canonical Garret and vault
  → journal displays unchanged prose
  → player view exposes only a knowledge-safe target projection
  → route planner plans toward routeTo
  → local guidance highlights ways toward actionAt
  → Garret receives objective prominence
  → existing action bindings expose drag, wake, or join as applicable
  → chosen public action executes existing authored consequences
  → cameUp(garret) makes when false
  → existing Undertakings.after retires the aim
```

No command ID should be stored in the objective. Commands are state-dependent: shutters may be open or closed, Garret may be asleep or awake, and several valid authored resolutions may exist. The target identifies intent; the existing action system continues to determine what can presently be done.

### 2.4 Knowledge-safe projection

A target is engine metadata, not automatically player knowledge. An objective might internally have:

```ts
{
  subject: garret,
  actionAt: ninthVault,
  routeTo: granaryRing
}
```

until the exact vault is learned. Projection should obey these rules:

- The journal shows authored text only.
- The world map exposes `routeTo` only if the player knows a route or is entitled to explore toward it.
- Local navigation exposes guidance toward `actionAt` only as far as known exits permit.
- The subject is highlighted only when presently perceived.
- Contextual actions remain limited to currently public actions.
- A private room name or ID is never revealed merely because it appears in the target.

Garret's objective can use the vault as both `actionAt` and `routeTo` if Dagny's information genuinely teaches that location. Where authors intend vaguer knowledge, `routeTo` should name the known site or exterior while `actionAt` names the actual interaction room.

### 2.5 Interfaces to change and retain

Likely direct changes are:

- `Objective` in `src/lang/module.ts`;
- objective parsing in `src/lang/module-parser.ts`;
- objective serialization in `src/lang/module-writer.ts`;
- namespace rewriting in `src/campaign/module-namespace.ts`;
- player-facing objective projection in `src/presentation/player-view.ts`;
- `Undertakings.shown`, `aimedAt`, and target-place handling in `src/presentation/undertakings.ts`;
- aim screen types in `src/ui/screen-types.ts`;
- objective reading in `src/presentation/glance.ts`; and
- browser map aim selection in `web/reader/aims.ts`.

Existing abstractions to retain are:

- `Objective.when` and `Undertakings.after`;
- `Itineraries.plan` and its knowledge-aware graph;
- `Spatial.ancestry` and canonical containment;
- existing action applicability, bindings, success predicates, and consequences;
- `Affordances` as the contextual presentation layer; and
- `AimWords` for prose, but not authoritative target selection.

Heuristics to demote are:

- `Stakes.named` predicate fallback;
- `Undertakings.places` expansion as the authoritative destination;
- `Glance.whereabouts` and `Glance.inside` for explicitly targeted objectives; and
- browser selection of the “best” member of an inferred places list.

They may remain temporarily when `target.source === "legacy"`.

### 2.6 Migration scope

A static scan found:

- 214 objective declarations across `data/**/*.kyr` and `data/**/*.kyrt`;
- 64 with an explicit ID or interpolation-like reference in their prose; and
- 150 without one, meaning they currently depend on predicate fallback or produce no explicit textual identity.

This is a source count, not a count of installed adventures: it includes templates, scenario variants, setting material, and generated content. It nevertheless demonstrates that mandatory manual rewriting is inappropriate for M19.

The opening generated undertown objectives are comparatively migration-friendly because their templates already carry explicit references in prose. A compatibility resolver should recover good targets for many of them.

The migration policy should be:

1. Add optional authored targets.
2. Compile legacy objectives unchanged.
3. Infer legacy targets once, centrally.
4. Emit warnings for ambiguity.
5. Explicitly annotate only the opening journey and other stabilization-critical objectives.
6. Require explicit targets for new or materially edited actionable objectives after the compatibility period.

This repairs the opening generically without blocking on every adventure.

### 2.7 Authoring lint

For an explicit target, lint should verify:

- all referenced IDs exist after namespace resolution;
- `subject` names an entity;
- `actionAt` and `routeTo` name spatial entities;
- `actionAt` lies within, equals, or is normally reachable from `routeTo`;
- the objective does not expose a target the activating discovery has not made knowable;
- at least one action potentially applicable at `actionAt` concerns `subject` or can make `when` false; and
- a parent destination is not supplied as `actionAt` when the actual subject or action is in a known child room.

For legacy objectives, lint should warn when:

- no target can be inferred;
- multiple spatial candidates have equal standing;
- the predicate names only the party or incidental state entities;
- the inferred route points outside a site while the inferred subject is inside it; or
- target inference depends on prose wording rather than embedded references.

This lint belongs in author validation. It need not assemble and play an entire world.

## 3. Engine-enforced travel

### 3.1 Smallest correct change

The required invariant is:

> An ordinary player command may move within the current hex. A movement action crossing the current hex boundary may execute only as a trusted leg of world-map travel.

Three small changes establish it.

#### A. Share the boundary classifier

Move or extract the existing `Passages.crosses` logic into a runtime-accessible spatial helper, for example:

```ts
Spatial.crossesHex(module, origin, destination): boolean
```

Both presentation and execution must call the same function. The cell, region, road, and synthetic-road-cell logic must not be reproduced in two modules.

One edge case needs an explicit decision: current presentation classification also treats `cross_plane` transitions as crossing. A planar threshold should not automatically become illegal unless the world-map-only requirement is intended to cover planar transitions.

#### B. Require trusted travel context

Add an internal execution context:

```ts
interface ExecutionContext {
  movement?: "local" | "map-travel";
}
```

Before completing a movement action, `Campaign.execute` and `executeAsync` should determine its actual origin and destination. If `Spatial.crossesHex(...)` is true and context is not `map-travel`, execution should reject it atomically.

Enforce this at `Campaign`, not only in `PlaySession`, because direct campaign execution must not bypass the invariant. The context must be an internal argument, not something derived from a player-supplied command string.

#### C. Route every map crossing through `Travel.go`

Change `MapView.step` from returning the raw `go(...)` action to:

```ts
command: `travel:${e.destination.id}`
```

`EngineHost` already dispatches `travel:` commands to `Travel.go`. The planner already produced valid one-leg itineraries in the current `a1` world for the three map exits reproduced during this review:

- `region__edge_west`;
- `region__gate_tallow`; and
- `region__z3_edge`.

This is therefore not disabling movement. It makes those map selections use the same travel mechanism as ordinary cells.

`Travel.go` currently chooses the next ordinary public `go(...)` command and executes it through its callback. Its callback should become a trusted `performLeg` operation that passes `movement: "map-travel"`.

Do not authorize a crossing because its command happens to start with `travel:`. The travel orchestrator must confer authorization on each planned leg.

### 3.2 The failing `choice-contract`

The failing test assumes every map choice has a `travel:` command and slices that prefix:

```ts
const to = go.command.slice("travel:".length);
```

It currently encounters a raw `go(...)`, creating a malformed destination after slicing. This is both a brittle test assumption and evidence of the real command-contract mismatch.

After routing `MapView.step` through `travel:`, the test's intended expectation becomes true. It should first assert the prefix, then plan the destination:

```ts
expect(go.command).toStartWith("travel:");
const destination = go.command.slice("travel:".length);
expect(Itineraries.plan(campaign, destination)).toBeTruthy();
```

At least one such choice should also be executed and arrival verified. Proving only that a plan exists would not detect a broken travel-authorization path.

## 4. One authoritative player-intent contract

The resolved objective target should be the only semantic statement of what the followed objective concerns.

| Consumer | Field consumed | Responsibility |
|---|---|---|
| Journal | `text`, followed state | Explain intent; do not derive geography |
| World map | `routeTo` | Offer a knowledge-safe `travel:` destination |
| Local navigation | `actionAt` | Highlight the next known local leg |
| Person/object presentation | `subject` | Apply objective prominence when perceived |
| Contextual actions | `subject`, `actionAt`, optional `progress` | Rank currently public relevant actions |
| Command execution | Public selected action | Validate legality and execute authored consequence |
| Retirement | Existing `when` | Remove or advance the completed objective |

The important separation is:

- the target says what the player is trying to accomplish and where;
- public action projection says what the player can do now;
- the authored action says what happens if it is done; and
- `when` says whether the objective remains active.

No component should parse journal prose to rediscover the target. No objective should cache a command that may not currently be applicable.

## 5. Honest-start headless regression

A high-value test should begin with a normal generated world and operate only through public projections:

1. Assemble the fixed release seed.
2. Start a normal `PlaySession`.
3. Read the visible journal and aim collection.
4. Follow the chosen objective through the same public command used by the interface.
5. Obtain map and local choices from `Screen` or `PlayerView`.
6. Assert every selected command is currently public.
7. Travel through `travel:` where a hex boundary is crossed.
8. Enter the intended structure through public local exits.
9. Follow highlighted local legs to `actionAt`.
10. Select the visible `subject` and an offered contextual action.
11. Execute that public command.
12. Observe a visible consequence.
13. Assert the objective disappears or advances.
14. Save and restore, then assert that the result and objective state persist.

The test must not:

- call `world.put`, direct assertions, or other state injection;
- teleport the party;
- add player knowledge;
- call private action IDs directly;
- look up the target by a private module ID to drive the test; or
- force internal progression a player could not select.

Private IDs remain appropriate in separate structural tests. They should not drive this release-journey test.

The existing Hold One Season test demonstrates that the authored consequences can work through label-driven public actions, but it knows a long exact path in advance. The new contract should select each next action through the objective projection, proving discoverability as well as executability.

## 6. Implementation sequence

### Change 1: Enforce travel and normalize map choices

**Estimated scope:** Half to one day.

- Extract shared `crossesHex` classification.
- Make `MapView.step` emit `travel:<destination>`.
- Add internal local or map-travel execution context.
- Reject direct raw cross-hex commands.
- Allow `Travel.go` to execute planned crossing legs.

**Acceptance:**

- Direct `perform(go(...))` across a hex fails without changing state.
- The corresponding public map `travel:` choice succeeds.
- Same-hex local movement remains legal.
- The strengthened `choice-contract` passes.
- A blocked or unknown journey remains blocked rather than receiving privileged traversal.

This change is independently valuable and can land before objective work.

### Change 2: Add one resolved objective target

**Estimated scope:** One day.

- Extend parser, writer, namespacing, and module type.
- Add the central authored-or-legacy target resolver.
- Project the resolved target through `Undertakings.shown`.
- Make `Glance`, affordances, and map aim handling consume it.
- Retain legacy inference behind the adapter.
- Explicitly target only the opening reference objectives needed for acceptance.

**Acceptance:**

- The followed objective has one stable subject, action, and route identity.
- Journal, map destination, local highlight, and contextual subject agree.
- Entering the structure does not reverse guidance toward its exterior.
- Hidden target details are not exposed before knowledge permits them.
- Completion still occurs solely through authored consequences and existing retirement.

### Change 3: Add focused contracts and lint

**Estimated scope:** Half to one day.

- Add unit tests for explicit and legacy target resolution.
- Add a knowledge-redaction test.
- Add direct-crossing rejection and legitimate-map-travel tests.
- Add one honest-start objective journey.
- Add author lint for invalid and ambiguous targets.

**Acceptance:**

- The focused contract suite finishes in under 90 seconds on a warm local checkout.
- The honest-start release journey finishes in under three minutes.
- A new ambiguous actionable objective fails author validation or requires an explicit compatibility waiver.

The complete sequence is realistic within the first two or three days if it is not broadened into spatial normalization, planner replacement, or comprehensive content migration.

## 7. Compatibility risks

### Legacy ambiguity

The compatibility resolver will preserve some existing mistakes. That is acceptable temporarily if it reports ambiguity and explicit targets override it. Inferred targets should retain `source: "legacy"` for diagnostics and eventual cleanup.

### Namespacing

Target IDs must be rewritten with the same namespace rules as predicates and entity references. Missing this would work in isolated source modules and fail after composition.

### Knowledge leakage

An exact `actionAt` can reveal a room unknown to the character if passed straight to the screen. All projection must continue through the current knowledge-aware route and perception layers.

### Alternative solutions

Some quests permit several valid approaches. A single target can still work if the approaches converge on the same interaction locus. If they genuinely do not, a small ordered target array may be introduced later. Multi-plan logic should not be introduced pre-emptively.

### Moving subjects

`subject` should remain canonical while `actionAt` may become stale if the subject moves. For objectives whose intent is “find this person wherever they are,” `actionAt` may be absent and the projection may use known whereabouts. That should be an explicit absence, not a general return to predicate inference.

### Travel interruptions

`Travel.go` intentionally stops for combat, hazards, one-way routes, fatigue, and decisions. Trusted travel context must authorize only the current planned leg; it must not bypass normal applicability or interruption checks.

## 8. Minimum focused regressions

1. **Objective compilation:** Explicit target fields parse, serialize, and namespace correctly.
2. **Legacy adapter:** One unambiguous embedded reference resolves predictably; an ambiguous predicate-only objective warns rather than acquiring an arbitrary exact target.
3. **Knowledge boundary:** A private `actionAt` does not appear in journal, map, or local choices until learned.
4. **Interior objective:** Guidance leads into a multilevel site and does not reverse toward the exterior once inside.
5. **Subject interaction:** At `actionAt`, the subject and a relevant public interaction receive objective prominence.
6. **Retirement:** The public interaction changes authored state and causes the existing lifecycle to retire or advance the aim.
7. **Direct crossing rejection:** A raw cross-hex `go(...)` without travel context is rejected atomically.
8. **Legitimate map travel:** The equivalent public `travel:` choice plans and executes the leg.
9. **Same-hex movement:** Local movement remains unaffected.
10. **Honest-start release journey:** One opening quest completes without teleportation, knowledge injection, or private command selection.

## 9. Verification cost and development critical path

The latest inspected CI run at commit `c56669b4` took approximately **45 minutes 40 seconds wall-clock**, from 14:28:36Z to 15:14:16Z. It failed. This is the builder's latency, not the sum of every runner's work.

| Job | Test-step time | Job wall time | Result |
|---|---:|---:|---|
| Suite 1/5 | 44m19s, then cancelled | 45m14s | Cancelled |
| Suite 2/5 | 34m41s | 35m40s | Passed |
| Suite 3/5 | 37m42s | 38m35s | Passed |
| Suite 4/5 | 30m15s | 31m20s | Passed |
| Suite 5/5 | 30m10s | 31m09s | Passed |
| Browser 1/2 | 14m37s | 15m52s | Failed |
| Browser 2/2 | 15m26s | 16m50s | Failed |
| Long descents | 2m07s | 3m04s | Passed |
| Lint and types | 58s | 1m56s | Passed |

The aggregate runner consumption is far larger than 45 minutes because jobs run in parallel. That aggregate matters for cost and throughput, but the immediate developer critical path is the slowest suite shard—currently about 45 minutes.

Repeated setup is measurable but not the principal bottleneck:

- Main checkout costs about 48–61 seconds per job.
- The five suite jobs each repeat main checkout, Orsino checkout, Bun setup, and installation.
- Browser shards separately install Chromium dependencies.
- Bun installation itself was about one second in this run.
- Suite execution consumes 30–44 minutes per shard, dwarfing package setup.
- Browser execution consumes roughly 15 minutes per shard.

The smallest useful feedback arrangement is a targeted contract command containing only:

- objective target compilation and resolution;
- knowledge-safe projection;
- direct crossing rejection;
- legitimate itinerary execution; and
- one compact interior-objective fixture.

It should reuse one assembled world fixture within the process rather than assembling a comparable world independently for each test file. A warm target below 90 seconds is realistic.

The honest-start release journey should remain separate:

- one fixed release seed;
- one world assembly;
- one complete public-choice path; and
- a target below three minutes.

Run those two jobs before, or as required predecessors of, the large suite matrix. They do not replace the full suite; they produce relevant feedback early.

Potential later improvements are to rebalance shards from measured timings, cache or artifact deterministic compiled worlds, stop rebuilding equivalent scenario fixtures, keep author validation out of browser execution, and restrict browser tests to behavior that genuinely requires rendering and pointer or keyboard interaction.

Measurement remains incomplete at the individual-test level for the latest CI run. The inspected job metadata provides job and step timestamps, but not a complete current per-test breakdown. The hypothesis that scenario assembly dominates particular shards should be confirmed from current JUnit and timing artifacts before tests are reassigned.

## 10. Explicit exclusions

Do not include the following in this repair:

- a new general-purpose planning framework;
- a rewrite of `Itineraries`;
- a universal typed spatial graph migration;
- package extraction;
- re-authoring all 214 objective declarations;
- a general quest state machine;
- mandatory `progress` predicates for every objective;
- a redesign of journal prose;
- general interface restyling;
- a new interaction command language;
- broad removal of `Stakes.named`, which remains useful for legacy compatibility and other “things mentioned” presentation;
- CI platform replacement or wholesale suite restructuring; or
- unrelated M19 defect-register expansion.

## Conclusion

The minimum general repair is not better heuristics. It is to stop asking prose and completion predicates to supply an objective's actionable identity.

Add one target, resolve it once, and let existing knowledge, routing, affordance, consequence, and retirement systems do their respective jobs. Separately, move the existing cross-hex distinction from presentation convention into command execution, while having every map crossing use the existing travel planner.

That is small enough to complete early in the seven-day stabilization window and broad enough to eliminate the two recurring failure classes without committing the project to another architectural campaign.
