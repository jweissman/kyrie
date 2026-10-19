# Integration diagnosis and execution sequence

19 October 2026. This replaces the earlier implementation roadmap. The independent builder's ontology,
world constructs, overlays, needs/services, two-scale chart and Mono client are the starting point.

Current implementation follow-up: [canonical command contract](command-contract.md) and
[Reedwake command/effect playtest](../playtests/command-contract/README.md). The diagnosis below remains the accepted baseline.

## Verified baseline

I read the current audit, ontology, migration, play model, milestone report, authoring guide and Caught Below
report, then traced their implementations. The pre-change Mono journeys are recorded in
[the reorientation playtest directory](../playtests/integration-reorientation/): Caught Below through the
reunion, and Serewater through combat, a trap, escort and return. These were real keyboard/pointer client inputs,
not direct calls to campaign actions. They are developer walkthroughs, not human usability evidence.

| Area | Actual implementation | Boundary or contradiction |
|---|---|---|
| Construction | `Company`, `Person` with authored > generated > default in `campaign/cast.ts`; typed overlays in `overlays.ts`; bundle generation optional | Not procedural geography. Sites remain authored; tables contribute only permitted fields. |
| Space | `WorldConstructs.passage` emits two-sided `connects`, kind and duration; `world/passages.kyr` derives visibility/access from things and guards | Legacy Exit/route/gate/hazard/climbing paths remain executable. Mono/Passages still carries legacy adapters. |
| Physical state | `Thing` states/changes lower to exclusive `state` and ordinary actions | No general containers/material damage. A `Change` is deterministic; it is not a skill roll. Caught Below's broken leg is a World state/hobbled fact, not a body injury; ordinary HP healing does not repair it. |
| Identity | World owns location; CreatureStore owns bodies/purses/inventory; CreatureFacts projects these | `CombatProjection.creature` preserves background but omits profession: a real round-trip loss. |
| Agency | Pursuits + existing planner; quantified rules; pending multi-tick NPC actions | Routines return people to work, not daily life. Caught Below's reaction/reunion rules are state predicates, not witnessed command events. |
| Effects | Ability language compiles to typed effects on catalog load. Battle, FieldUse and Items use AbilityUse/Effects | Items still parse use strings on each use. Hazards/shrines clone a target into a fictitious fighter with 999 mana. World Changes use the separate, existing World reducer. |
| Damage | Ordered typed damage effects, signed resistance, status/equipment modifiers, guarding and saves already run | Automatic hits. Flat armor and power apply per component, even elemental damage. No hit/miss/critical/proficiency model. “Physical” hides Orsino subtypes. No area/object ability target semantics. |
| Durations | Owner combat-turn boundaries; persistent conditions survive projection; encounter conditions are removed at exit | “Persistent” means retained, not world-time ticking. Ongoing status damage bypasses typed resistance. |
| Services/needs | Actual finite stock, conserved transfers, meals, eight-hour lodging, camping and shared recovery resolver | Hunger is an eligibility restriction; no starvation. Healing service restores mana through full recovery too. Needs do not constitute an economy. |
| Perception | LocalObservations, PlayerView, ScreenModel, ChartModel and Mono activity strip consume authoritative state | Readable sources yield a fact, not a separately authored document. Some action labels still expose formulas; mobile regional orientation remains weak. |

The workspace is untracked, so this is a source-verified comparison with the reports and earlier design, not an attributable commit diff.

The milestone claim that duplicates were “removed” is local to recommended worlds. `world/core`, `care`,
`belongings` and legacy `adventure`, `fieldcraft`, `items` coexist with overlapping vocabulary. Legacy rest and
background keys are still active in legacy campaigns. This is a migration boundary, not one already-unified ruleset.

`test/caught-below`, `overlays`, `expedition` and `shared-item-effects` establish causal behavior: alternative
routes, autonomous return, skills changing applicability, stock/money changes, conditions, ownership and rollback.
Parser/world-construct tests establish lowering and diagnostics. Recorded-history tests establish regression and
replay. Browser tests establish operability/layout and host parity. None establishes compelling play or broad
Orsino fidelity. The baseline semantic run and browser evidence are reported alongside the final slice checks.

## Command-to-consequence map

```
Mono intent → ScreenModel/PublicChoice → PlaySession.perform
 → PlayerView.resolve → Campaign.available / grounded schema applicability
 → atomic checkpoint → Battle OR Campaign.field resolver
 → AbilityUse (eligibility, expressions, cost, saves, ordered typed Effects)
 → CreatureStore commit → CreatureFacts refresh
 → World.apply(action.success/failure)
 → elapsed ticks: pending NPC actions / planner → authored rules and Events
 → progression/outcomes → CampaignEvent → locality-filtered feedback → Mono strip
```

World object changes already use typed `Change` values (`assert`, `retract`, numeric operations) in this same
command transaction. They are not English interpreted at runtime. `Event` is an authored, latched rule/message;
`CampaignEvent` is a command record; `CombatEvent` is mechanical resolution. These three meanings must not be
called a unified event bus. Rollback covers command failures, including leased creature changes. Random streams
are command/encounter seeded; replay is re-execution, not an omniscient narration transcript.

## Smallest valuable integration slice

Extend **canonical Reedwake**, keeping its installed Caught Below situation and existing alternatives. Use the
actual Orsino Longsword of Flames definition (1d8 piercing + 1d6 fire), a timed protective spell, a non-creature
foundry hazard, an object transition and a field keeper who witnesses violence and withdraws assistance.

- Separate source identity and expression context from an optional creature actor in the *existing*
  AbilityUse/Effects path. No fake hazard fighter, artificial mana or copied target abilities.
- Typed catalog definitions lower straight to existing effects. Controlled English remains an ergonomic source
  compiled once; no runtime free-language interpretation. Cache legacy consumable compilation.
- Equipment grants its attack while equipped; projection/commit must not accidentally learn it permanently.
- Keep existing signed fractional damage arithmetic and state its limits. Add physical subtypes without renaming
  old content or silently replacing all damage balance. Test resistance, immunity and vulnerability numerically.
- Capture bounded local witnesses at the start of committed combat. Persist a typed witnessed-attack fact only
  for present surviving witnesses when actual damage resolution occurs. Authored Event/rule content reacts;
  absent/dead actors do not gain omniscient knowledge. Existing service actions honor an explicit refusal.
- Keep the hound's food/woodcraft/crawl alternatives. Assistance lost through violence must be an actual capability
  change, not an outcome label. Do not make witnessing violence imply universal moral judgment.

This proves a causal bridge for six representative operations; it does **not** finish arbitrary object/area magic,
reactions inside combat, full Orsino weapon resolution or the entire campaign program.

## Execution sequence for Stages 2–7

1. **Stage 2, first:** implement the bounded source/effect/equipment/witness slice above. Evidence: definitions,
   exact roll/mitigation traces, canonical HP/status/item/world facts, locality-safe feedback, failure rollback and
   a Mono playthrough. Preserve Serewater histories; do not re-author them to hide regressions.
2. **Stage 2, next:** make command outcomes explicitly enumerate body/world changes in one typed contract over
   entity IDs. Extend the existing coordinator/reducers, not a second executor. Define object durability and area
   membership only when the next supported spell/hazard needs them. Specify hit packets, per-hit vs per-component
   armor, condition immunities, save-for-half, duration clocks and reaction ordering before adding their content.
3. **Stage 3:** recover content by mechanic families. Actual source inventory → supported contract → faithful or
   adapted catalog entry → numerical and composition tests → playable use. First expand weapon properties,
   defenses/saves, timed statuses, consumables and skills. Then triggers, creature behavior and progression.
   Separate formulas from flavor: Orsino Magic Missile's description and effects currently disagree. Preserve
   provenance and identify the executed source. Do not import its name as a substitute for its behavior.
4. **Stage 4:** keep Caught Below/Reedwake and Skellfold as canonical portability references. Reconstruct the
   valuable Serewater custody/register/return loop as a situation only after command semantics support its
   interactions. Keep Serewater's original campaign as a regression fixture. Freeze Blackvein/Orra/Frontier,
   Greenhollow/Sanctuary/orchard and experiments per the existing classification; do not bulk-migrate them or
   recommend their predicate collections. Retire an old library/client only when no retained fixture needs it.
5. **Stage 5:** deepen one Reedwake expedition: preparation, risk, rescue/investigation, distinctive opposition,
   useful equipment, return, recovery and a subsequent opportunity. Budget finite supplies and credible motives.
   Follow unexpected violence, abandonment and failure; the scenario must continue with deaths and lost services.
   Existing rescue completeness is not enough evidence for this full loop.
6. **Stage 6:** refine Mono in place from those sessions. Preserve map, bottom activity strip and modes. Fix missing
   object text, target ambiguity, notices and specific fictional feedback before styling. Keep implementation
   commentary out of NPC speech. No additional client or layout framework.
7. **Stage 7, throughout:** semantic tests over actual reducers; alternative and failed approaches; cross-site
   bindings; frozen state after save; deterministic histories; browser/CLI parity. Record developer friction
   separately from passing checks. Obtain unfamiliar human evaluation before asserting usability or enjoyment.

Highest risks: extending partial effects without overclaiming Orsino parity; silently changing legacy arithmetic;
allowing equipment grants to become learned abilities; source/target confusion in actorless effects; conflating
presence with visibility; and turning witnessed events into omniscient faction reputation.

Saves freeze campaign state and declared catalog membership, not every global mechanical definition body. Cross-version balance replay still needs catalog versioning; same-build deterministic replay does not solve that migration problem.

## Campaign disposition for this increment

The existing migration classification remains authoritative. The active integration target is Caught Below at
Reedwake; its quarry installation is the cross-site portability control. Reedwake and Skellfold are portable
sites, Caught Below is the canonical situation, and the world libraries/catalogs are reusable content. Serewater
is the richest retained legacy regression/porting candidate. Blackvein, Orra/Frontier, Greenhollow, Sanctuary and
the orchard remain frozen legacy references. Resource-gate/courier/crossing/client-study experiments remain
language/integration fixtures to archive after their test dependencies are accounted for; none is recommended
new-adventure content. The older trapped-traveler/founding-charter bundles are not silently promoted over the
builder's Caught Below constructs. No bulk migration or deletion was performed in this slice.

Exclusive Thing states reduce contradictory descriptions; they do not make arbitrary authored prose an invariant.
The dead-guardian claim found in the actual browser session illustrates the difference. Group state descriptions
now respect body ability, but general contradictory observations still need diagnostics and author review.

## The next command/effect contract (proposed, not implemented wholesale)

Keep Campaign as coordinator and keep both existing reducers. The next typed boundary should make their domains
explicit, rather than route every content category through its own handler:

```ts
// Illustrative types, not a new runtime or parser.
type Target = { kind: 'creature' | 'thing' | 'place'; id: string }
  | { kind: 'area'; place: string; occupants: string[] };
type ResolvedChange = { domain: 'body'; creature: string; effect: BodyEffect }
  | { domain: 'world'; subject: string; change: WorldChange };
```

A command carries the actor, action schema and bound entity IDs. A resolution carries source identity, explicitly
bound recipients, rolls/saves, costs and ordered resolved changes. A committed event records that resolution,
with a causal command ID and its actual witnesses. Source and target are separate: a pipe has an identity and
explicit expression values, but never a body or invented mana. Area resolution must freeze an explicit membership
set from containment/location queries; it must not infer a tactical radius from prose. Object state and place
access continue through World changes; bodies continue through CreatureStore.

Required decisions before that expansion:

- **Applicability versus outcome:** failed validation commits no time/resources; a resolved failure may spend
  authored costs and apply explicit failure changes. Exceptions roll back the whole command, including reactions.
- **Damage packets:** one attack's components, one or several saves, hit/critical policy, and whether armor/power
  apply per hit or per component. Preserve old arithmetic behind compatibility until authored content migrates.
- **Defense provenance:** immunity, signed vulnerability and resistance are separate from condition immunity;
  stacking and caps need explicit policies, not assumptions from a familiar spell name.
- **Clocks:** owner combat turns, world time and until removed are distinct duration types. Existing attachments
  default to owner turns; retaining them outside combat does not imply ticking them during travel.
- **Ordering:** requirements and target binding; prepare deterministic rolls; resource commitment; ordered changes;
  bounded authored reactions within the same transaction; perception and feedback. No unbounded recursive reactions.
- **World effects:** opening a thing, moving an actor, learning a fact and changing a relationship are typed world
  changes, not new fantasy verbs in TypeScript. Physical damage to objects still needs an authored durability model.
- **Replay:** record definition/catalog versions as well as seed and commands before promising replay across future
  balance changes. Same-build parity and frozen membership are necessary but insufficient.

The implemented slice exercises source separation, ordinary world changes, body effects and local reaction memory
inside the existing atomic command. It intentionally does not publish the illustrative types above as a complete
API whose unsupported target kinds would then have to be faked.

Two additional execution boundaries matter before broader effects: field resolvers currently return events, not a
first-class resolved outcome (`Campaign.complete` treats a non-throwing field action as success). A fatal hazard
therefore does not by itself choose an authored failure branch. Pending NPC travel also retains the origin `at`
fact until arrival rather than creating a physical in-transit location. These are bounded current semantics, not
proof of complete interruption or continuous movement. The next resolution contract must make those decisions
explicit rather than guess outcomes from prose or add a separate hazard executor.
