# Kyr: reusable rules and authored situations

Design review, 17 October 2026. Proposal only; none of the syntax below is implemented. The recommendation is to keep Kyr's declarative world core, add parameterized ruleset actions, and compile several small authoring forms to one typed execution model. Do not start by expanding the English verb list or replacing the planner.

The decisive test is **whether an unchanged ruleset can operate on a second crossing whose entities, topology, demands, and resources differ**. More expressive spelling of seven crossing-specific operators would fail that test.

## Evidence and limits

Inspected Kyr's grammars, parsers, module compiler/world, planner/campaign adapter, battle/effects/targeting, content, crossing, tests, and existing `doc/design.md`. Also inspected the sibling DEEM and Orsino checkouts. Orsino's published site did not load through the browser; coverage observations below refer to actual local JSON definitions, with repository paths and keys supplied for verification. They are not claims that every prose description in Orsino is fully implemented. No full corpus port or runtime audit was attempted.

Sources: [DEEM](https://github.com/jweissman/deem), particularly `src/deem.ohm`, `src/deem.ts`, `src/Generator.ts`, and `src/stdlib.ts`; [Orsino](https://github.com/jweissman/orsino), particularly `settings/fantasy/{abilities.json,abilities/arcane.json,abilities/divine.json,statuses.json,traits.json,tables/items.json,tables.json,templates.json}`. DEEM's published README also describes sequential template evaluation and inherited generation contexts. The proposed runtime restrictions below are additional requirements, not existing DEEM guarantees.

## 1. Diagnosis: three different problems

### Syntax

Kyr already separates generic declarations from the fantasy ability grammar. Keep that distinction. Controlled English is useful for simple effects, while named parameters and blocks suit conditional multi-step rules. Grammar inheritance alone does not produce shared semantics.

Current grammar constraints become awkward beyond the examples: action declarations have no typed parameters; call arguments are identifiers rather than arbitrary expressions; ability targets are a closed vocabulary; saves only negate a statement; conditionals attach to one effect. These are real limitations, but syntactic extensions alone cannot solve the world-model split.

### Semantics

`src/lang/module.ts` models grounded planning operators. Queries accept parameters; actions do not. `crossing.kyr` consequently declares `parley`, `bribe`, `assault`, `ford`, `recover`, and `deliver` against named objects. Authors encode both circumstances and the transitions that solve them.

For example, `recover` relocates cargo without checking party position, possession, capacity, or a route. `parley` consumes food and also creates an alliance and opens the entire crossing. Those outcomes are authored shortcuts, not consequences of a reusable exchange/access rule. They are perfectly reasonable planning fixtures but weak foundations for persistent play.

Combat has a different ontology: `Fighter`, two fixed teams, hardcoded HP/mana/statuses, a specialized target selector, and an effect switch. `Effects.modifier` reads only armor/power; status processing reads damage/skip. A new status identifier cannot introduce a new behavior. Damage type names are validated and logged, but current damage resolution does not implement typed resistance.

Important implicit semantics already exist:

- Module DEEM values, including action changes, are sampled once at instantiation. Combat values are sampled per execution. Neither behavior should silently change.
- Battle prepares conditions, target sets, amounts, and save DCs before applying effects. An amount is rolled once per effect, shared across its targets; saves roll separately per target. Later statements' conditions see the pre-effect actor state.
- Statuses tick and decrement at the affected actor's turn start. Thus “three turns” differs from three rounds or three global action steps.
- Missing campaign facts mean false, and missing measures mean zero. `known(ford)` is a public flag, not observer-specific knowledge.
- HP zero functions as death; healing does not revive. This is a useful explicit consequence, although corpse eligibility and resurrection restrictions are not yet modeled.

Make these decisions visible before adding more effects.

### Architecture

The strengths worth preserving are significant: structured facts instead of opaque strings; exact kind/arity checking; read-only acyclic queries; exclusive relations; copy-before-apply atomic world changes; parser/compiler/runtime separation; seeded generation and combat; detached snapshots; headless commands, controllers, and event tests.

The campaign bridge is the main architectural seam. `CampaignState` holds symbolic world state and separate party records. `encounterBattle` resets statuses/cooldowns and regenerates opponents; returning combatants preserve party HP/mana/death, but opponents do not have equivalent persistent identity/state. A wounded raider is not automatically a wounded world entity. `Travel` in combat causes an escape outcome without updating campaign topology. These are integration limitations, not requests to discard battle code.

The planner applies success effects optimistically, including for combat. It is a bounded symbolic search, not an authoritative predictor of a stochastic encounter. `cost` is search preference; `time` consumes the deadline; neither is automatically an inventory debit. Preserve these distinctions.

Finally, a seed is not a replay format. Existing logs are useful observations, but do not yet specify a versioned command stream, complete random draws, rule identities, and reconstructible committed state changes.

## 2. Plausible language architectures

| Architecture | Concrete shape | Advantages | Drawbacks |
|---|---|---|---|
| A. One explicit Kyr rule language | Declarations, parameterized actions, modifiers, triggers and effects share a block grammar; English abilities become optional sugar | One compiler surface; consistent bindings; easiest cross-domain inspection | Dense for a one-line spell; temptation to turn Kyr into a general programming language; migration burden |
| B. Related DSLs, one typed IR — recommended | World/situation declarations, action/rule blocks, controlled-English abilities, and DEEM expressions compile through shared checking and execution | Preserves readable spells and existing work; each form fits its task; interoperability is enforced below syntax | Multiple frontends must preserve identical semantics; sugar needs documented defaults and conformance tests |
| C. Facts plus production rules | Actions submit intents; matching rules derive effects from events/facts; scenarios chiefly populate data | Very flexible environmental interactions and reactions; highly declarative | Rule ordering, agenda loops, explanations and planning become difficult; mechanics can become distributed and hard to inspect |

Use B with an explicit, ordered action core. Borrow a bounded event queue from C, not a general forward-chaining inference engine. Keep acyclic derived queries initially. Do not require all definitions to adopt one grammatical style.

## 3. Minimal semantic foundation

The smallest useful core is six cooperating constructs, plus observational annotations:

1. **Typed identities and stored facts.** Stable entity IDs; schema-declared scalar fields and typed relations. Properties are unary functions, not an independent metaphysics. Quantities are numeric facts with units and bounds. Start with exact named kinds and a small capability/component mechanism rather than a deep inheritance hierarchy.
2. **Pure queries and bindings.** Derived values/predicates and typed finite selectors over a world snapshot. Conditions are Boolean queries; selectors are queries returning IDs. Queries cannot mutate state or consume randomness. Missing optional values differ from zero unless the schema explicitly supplies zero as the default.
3. **Action schemas.** Typed actor, arguments and targets; pure eligibility; resource/time costs; ordered resolution body. An ability is an action granted by a class, item, condition, or entity. A command is a fully bound request to execute one schema.
4. **Effect programs.** Small ordered trees of state changes, local bindings, branches, bounded iteration, and calls to checked ruleset procedures. Primitive writes are trusted implementation tools; players cannot issue arbitrary writes. Ruleset procedures such as damage or transfer validate invariants and return typed results.
5. **Attachments and modifiers.** An instance attaches a definition to an entity with source, parameters, lifetime and stacking identity. Conditions, equipment bonuses, perks, traits and location influences reuse this mechanism. Their acquisition/removal policies differ; they need not become interchangeable nouns in source.
6. **Events and scheduled boundaries.** Immutable typed occurrence records and an explicit clock/turn scheduler. A trigger matches an event and enqueues an effect program. Duration is attachment metadata interpreted by this scheduler, not another effect verb.

Constraints are schema invariants and action eligibility checks. Goals are observer objectives evaluated against facts; they do not grant permission to mutate facts or stop the world. A village can miss its delivery deadline while play continues. Descriptions have no mechanical authority. Planner heuristics and controller policies are intentions outside the transition kernel.

Knowledge needs an explicit boundary: objective facts remain closed-world where declared, but the controller sees an actor's observations. Start with `discovered(observer, entity)` and disclosed action parameters; do not implement a modal epistemic logic. Omitting a ford from menus while an omniscient planner freely uses it is not discovery. Unknown is not objectively false, and discovery is not world creation.

### Where mechanics belong

| Layer | Responsibility | Examples |
|---|---|---|
| Kernel | Typed storage, invariant checks, ordered transactions, IDs, deterministic random service, events, attachment lifetime | Assert/retract/write, bounded iteration, create entity, enqueue event |
| Ruleset library | Authoritative domain procedures and action schemas, authored in Kyr where practical | Damage/heal/death/revive, saves, attack, transfer, inventory/carrying, travel, search, lock checks, exchange/access contracts |
| Scenario | Instances, topology, ownership, demands, hazards, objectives and genuinely local exceptions | Bridge guards, food demand, hidden ford, cargo mass, village grain need |

Damage should be a named ruleset procedure, not raw `hp -= n`: it applies resistance, records actual loss, and transitions life state. Likewise transfer conserves quantities and travel respects containment. The kernel need not know what “bribe” means. A later subsystem may expose a typed native procedure where interpreting the same logic in Kyr would be unreasonable; its semantics and replay outputs still belong in the registry.

Drinking a potion composes possession/charge cost with healing. Unlocking composes a tool requirement, a check, and lock state change. Attacking composes eligibility, an optional hit check, damage, and death. Travel changes location and elapsed time. Negotiation requires an actual exchange or influence procedure; labeling an effect “negotiate” supplies none.

## 4. Typed intermediate representation and execution contract

This is a design sketch, not a replacement for the current interfaces. `TypedDeem` represents an expression compiled by a DEEM adapter with checked bindings/functions; it is not an opaque English command. Named aliases below stand for separately declared schemas.

```ts
type Expr<T> = TypedDeem<T> | Literal<T> | LocalRef<T> | FactRead<T>;
type Selection<T> = {
  query: QueryRef<T>;
  cardinality: 'one' | 'optional' | 'many';
  choice: 'command' | 'all' | 'random';
  bindAt: 'admission';
  order: 'entity-id';
};
type Lifetime =
  | { kind: 'permanent' }
  | { kind: 'clock'; expiresAt: Expr<Tick> }
  | { kind: 'boundary'; owner: EntityRef; phase: 'start' | 'end';
      remaining: number; count: 'strictly-after-application' }
  | { kind: 'while'; predicate: PureExpr<boolean> };
type Step =
  | { kind: 'let'; name: LocalId; value: Expr<Scalar> }
  | { kind: 'if'; test: PureExpr<boolean>; yes: Step[]; no: Step[] }
  | { kind: 'each'; source: BoundSelection; variable: LocalId; body: Step[] }
  | { kind: 'write'; operation: FactMutation }
  | { kind: 'call'; procedure: ProcedureId; args: TypedArguments;
      result?: LocalId }
  | { kind: 'attach'; definition: AttachmentId; target: EntityRef;
      lifetime: Lifetime; stacking: StackingPolicy }
  | { kind: 'detach'; attachment: AttachmentRef }
  | { kind: 'emit'; event: TypedEventPayload };
interface ActionIR {
  id: ActionId; parameters: ParameterSchema[];
  targets: Record<string, Selection<EntityId>>;
  requires: PureExpr<boolean>;
  costs: CostIR[]; body: Step[];
  atomicity: 'single-command';
  source: SourceSpan;
}
interface TriggerIR {
  event: EventSchemaId; filter: PureExpr<boolean>;
  body: Step[]; priority: number;
  reentry: 'once-per-attachment-per-root-command';
}
```

The IR must also preserve expression result type, unit, available bindings, permitted functions, randomness classification, evaluation phase, and source span. A production TypeScript implementation should encode argument/result types in the procedure registry rather than accepting an untyped bag. Event schemas distinguish `DamageResolved`, `Death`, `AttackResolved`, and turn boundaries; “after attacked” must not ambiguously mean both an attempt and a hit.

Recommended initial execution contract:

1. Parse source to frontend ASTs. Resolve symbols/imports and lower syntax sugar. Check entity kinds, cardinalities, procedure arguments, writable facts, effect result references, expression types and purity. Retain source mappings. Reject unknown references before play.
2. A controller submits a command with actor, schema ID and chosen bindings. Validate against current state and actor observations. Enumerating legal commands and executing them share this checker. Enumeration, rendering and planning never roll dice.
3. Freeze admitted target IDs in stable order. Reject an illegal singular choice or required empty selection. A many-selection explicitly permits or rejects emptiness. Recheck procedure eligibility at use; an earlier effect can kill a later target. Each procedure declares the resulting typed no-op/failure behavior. Do not silently retarget.
4. Reserve/pay costs once in a working copy. Execute statements sequentially: later reads see earlier writes. `let` rolls once at its position; a `let` inside `each` rolls once per target. Actor, target, attachment source and event bindings are separate; do not overload `#strength` with whichever entity happens to be current.
5. A failed save is an ordinary branch; armor absorbing damage is a successful resolution with zero actual loss. A resisted spell still spends its cost. An invariant violation or unexpected runtime fault aborts the command, including costs, pending events and speculative RNG advancement. Return a diagnostic, not an in-world miss.
6. Check invariants and atomically commit the root command, its draws and ordered deltas. Dispatch after-commit reactions in deterministic `(priority, attachment ID, rule ID)` order, each as a child transaction. Record parent/root causality. Earlier deaths are not undone if a later reaction fails. A reaction engine fault pauses further command admission with a diagnostic until resolved; it must not silently discard remaining reactions.
7. Drain immediate reactions before advancing the scheduler. Bound reaction depth/work and disallow reentry of the same attachment on the same root command initially. This deliberately limits recursive thorns/healing chains. A loop-limit hit is a diagnostic, not an ordinary combat result.

Multi-turn combat is **not** one enormous transaction. Entering an encounter is a committed transition; every combat command is another. Deaths, costs and retreat survive subsequent defeat or failed objectives. A resumed encounter references the same world entities. The current battle can temporarily remain a specialized resolver, but it must eventually consume and return explicit world deltas rather than regenerate an unrelated roster.

A save procedure returns roll, total, DC, success; damage returns requested, mitigated and actual HP loss. Drain heals from actual loss, not requested damage. Resistances require an explicit stacking, rounding and clamp policy. Use bounded integers for HP/inventory, signed numbers for bonuses, and a chosen exact representation for multipliers (for example basis points); the current universal nonnegative-integer wrapper is too narrow.

Persist an initial snapshot plus engine/ruleset/content versions or hashes, commands, command sequence IDs, random draw records, generated IDs, scheduler transitions, and authoritative committed deltas. Re-execution replay verifies the command/draw trace and state hashes under the same versions. Delta replay reconstructs historical state without pretending newer rules reproduce older results. Stable iteration and pinned content matter as much as the seed. Saving must include pending reactions and clock state or occur only at quiescent command boundaries.

### DEEM's boundary

Keep DEEM arithmetic, dice, Boolean expressions, table sampling and compositional generation. Do not recreate its arithmetic parser in Kyr. Parse embedded expression regions through DEEM, exposing a small immutable context and a registered pure/random function set. Initially use flat numeric bindings (`#actorStrength`, `#targetHp`) and explicit `dig` for structured data; DEEM's current identifier grammar does not support dotted access.

Keep entity selectors as typed Kyr query/selection nodes initially. DEEM can later call a read-only query adapter returning typed IDs, but its existing generation functions are not automatically a world-query language. Type checking and randomness classification need an adapter or small DEEM API extension; grammar acceptance alone is insufficient.

Distinguish `generate` expressions sampled once when instantiating content from runtime expressions sampled at an explicit step. Pure predicates prohibit dice, random lookup and generation, including through called functions. Generation yields validated declarations; it cannot mutate the live world. DEEM currently allows supplied functions, so the host must enforce this capability boundary. Partial evaluation and expression explanations can follow later; full symbolic algebra is unnecessary.

## 5. Proposed authoring forms, side by side

All examples are illustrative proposed syntax. `Use` imports schema declarations and procedures; the examples below use a `fantasy` ruleset with the contracts described here. Parenthesized scalar calculations use DEEM. Predicates/selectors remain Kyr syntax. No free-form English is interpreted at runtime.

| Purpose | Concise authoring form | Explicit meaning after lowering |
|---|---|---|
| Combat ability | `Deal (#actorStrength + 1d6) physical damage to target.` | Bind one chosen living opponent; roll once; call typed damage procedure |
| Passive condition | `Modify armor by 2.` | Contribution to effective armor while this attachment exists; never edit base armor |
| Triggered trait | `After Death where event.killer = bearer ...` | Subscribe to committed typed Death event; enqueue checked reaction |
| Situation | `bridge guarded by raiders; demand ...` | Stored guard/contract facts read by reusable travel/exchange rules; no crossing action list |

The first three in full:

```kyr
Action crushing_blow(actor: Character, target: Character) {
  Target target: choose one living opponent of actor.
  Requires canAct(actor) and reachable(actor, target).
  Cost mana(actor) 2.
  Time combatAction(actor) 1.
  Bind actorStrength = strength(actor).
  Deal (#actorStrength + 1d6) physical damage to target.
}

Condition warded {
  Stacking refresh by (bearer, definition).
  Modify armor(bearer) add 2.
}
// Applying it chooses the duration, rather than hiding it in the name:
// Attach warded to target until after 3 end-turn boundaries of target.

Trait blood_frenzy {
  After Death as event
    where event.killer = bearer and event.victim != bearer {
    Attach frenzied to bearer
      until after 1 end-turn boundary of bearer
      stacking refresh by (bearer, definition).
  }
}
Condition frenzied {
  // A roll modifier is evaluated per damage resolution, not when attached.
  Modify outgoing physical damage(bearer) add (1d4).
}
```

`reachable` can mean same encounter with no spatial grid. Attack rolls, range bands and weapon checks are optional ruleset layers, not assumed by this direct-damage ability. Passive modifier resolution has a defined additive/multiplicative/override order and rejects conflicting equal-priority overrides. `frenzied` uses a typed damage-calculation modifier slot, not an arbitrary event rewrite. A one-turn attachment applied during the bearer's action expires at the next end boundary; a ruleset wanting “through your next action” needs that distinct duration explicitly.

### The crossing as a situation

The topology is deliberately more explicit than the present puzzle: the village lies west of the river, the cargo is at the east landing, and both routes connect the banks. This makes movement and carrying real operations.

```kyr
Situation crossing {
  Use fantasy.travel, fantasy.inventory, fantasy.exchange, fantasy.search,
      fantasy.encounters, fantasy.needs.

  Place village, west_bank, east_bank.
  Route approach from village to west_bank { duration 1; public true; }
  Route bridge from west_bank to east_bank {
    duration 1; public true; capacity 100;
    guardedBy raiders;
  }
  Route ford from west_bank to east_bank {
    duration 3; public false; capacity 20;
    discoverAt west_bank; searchDC 12;
  }
  // Routes are bidirectional; capacity and load are abstract weight units.
  Group party at village { carryCapacity 20; }
  Group raiders at east_bank {
    members raider_1, raider_2, raider_3;
    controls bridge;
  }
  Character raider_1, raider_2, raider_3 from raider_template.
  Stock cargo at east_bank {
    owner village; goods grain; quantity 10; unitWeight 1;
    collectionPermission party;
  }
  Inventory party { gold 8; rations 1; }
  Need raiders { goods rations; remaining 1; }
  Need village { goods grain; remaining 10; deadline clock 12; }

  Demand toll by raiders {
    scope passage(bridge);
    alternatives { gold 8; rations 1; }
    availableWhile canControl(raiders, bridge);
    refuseIf hostile(raiders, buyer);
    grants passage(buyer, bridge) permanent;
  }
  Objective supplies: fulfilled(village, grain) before clock 12.
}
```

These fields must have library semantics, not suggestive prose:

| Reusable action/rule | Exact initial contract |
|---|---|
| `search(actor, place)` | Requires actor at place; costs one clock tick. Roll `1d20 + searchBonus`; disclose discoverable route IDs with DC at most total. Failed searches consume time. Hidden routes stay unavailable to travel until disclosed to this actor/group. |
| `exchange(actor, demand, option)` | Requires contact with the demand issuer at either endpoint of its controlled route, a currently available demand, no refusal condition, and sufficient goods. Atomically debit buyer, credit issuer, satisfy matching issuer need up to remaining amount, and create the specified grant. No charisma roll. Initially only listed options, one purchase per buyer/grant. |
| `travel(actor, route)` | Requires actor at an endpoint, route discovered/public, carried load within route and actor capacity, and permission if an effective guard controls it. Move actor to the other endpoint with carried stocks; charge route duration. Cargo carried by the group inherits its location. |
| `collect(actor, stock, quantity)` | Requires co-location, stock availability, owner permission or possession authority, and capacity. Move the selected quantity to actor inventory, preserving provenance and conserving goods. It does not teleport cargo home. Theft is a separate future permission/risk rule. |
| `contribute(actor, need, quantity)` | Requires co-location with need owner and sufficient matching goods. Atomically transfer goods and reduce need remaining, clamped at zero. Fulfillment is derived, not a separate arbitrary `supplied` flag. |
| `attack(actor, opponent)` | Requires contact with a living opponent; records hostility and enters/resumes a persistent encounter. Controllers issue ordinary combat actions. A guard group is effective while a living, non-incapacitated member controls the route. Removing all effective guards removes the access restriction by query; it does not magically create an alliance. |

All these rules are imported once and parameterized; none checks for an entity named `bridge`, `cargo`, or `village`. Demand offers are still authored affordances, but they describe what this faction exchanges rather than a private transition graph. Hunger alone does not imply accepting food: the explicit ration option supplies that policy. Paying gold does not satisfy hunger. Either payment grants passage to this buyer, not to everyone. Grants survive a trip back across the same bridge; alternative policies can restrict uses or expiry later.

Executable approaches now compose general actions:

- Travel to west bank, exchange eight gold for passage, cross, collect ten grain, return, contribute.
- Substitute the listed ration exchange. This satisfies the raiders' food need without asserting friendship.
- Search successfully, cross the ford, collect, return by ford, contribute. This is slower and leaves the raiders controlling the bridge.
- Attack the guards at the bridge contact point, survive or incapacitate them, then cross and collect normally. Retreat leaves surviving opponents and hostility in the world.

There is no unconstrained bargain, intimidation, deception, bridge construction, swimming or alliance formation yet. Adding those requires reusable mechanics and relevant facts. A future `proposeExchange` could accept a bundle with explicit item valuations and a threshold; that would be a limited economic policy, not humanlike negotiation. An LLM may suggest commands but cannot authorize an unmodeled success. New solutions emerge from available mechanics; declarations alone cannot guarantee open-ended agency.

## 6. Orsino coverage sample

These are actual definition keys, not invented coverage examples. “Fits” means fits the proposed model, not already supported by current Kyr.

| Definition and source | Actual mechanic | Required semantics / coverage judgment |
|---|---|---|
| `charge`, `backstab` — `abilities.json` | Charge requires Preparing to Charge and uses `3d8+1+#level`; Backstab requires Hidden, removes it, attacks, then lists extra damage | Fits action eligibility, expressions and ordering. Whether backstab bonus requires a hit must be explicit; prose and a bare sequence are not equivalent. |
| `fireball` — `abilities/arcane.json`; `shield_bash` — `abilities.json` | `6d6` fire with save-for-half; bash has damage and a separate save-negated stun | Fits explicit save-result branches and per-effect versus shared checks. Current Kyr's `unless` only expresses negation. |
| `life_drain`, `raise_dead` — `abilities/divine.json` | Save-negated necrotic drain; resurrection at 50% HP | Fits damage result binding plus healing; requires explicit life-state/eligibility procedure, percentage rounding, corpse identity and forbidden-resurrection policy. |
| `poison`, `meditating` — `statuses.json` | Turn-end damage; meditation forbids actions, modifies saves/resistance, heals `1d2+#level` | Fits attachments, derived modifiers, scheduler hooks and action prohibition. Requires deliberate migration from current turn-start ticking. |
| `hordeling`, `tough`, `lucky` — `traits.json` | On-kill Blood Frenzy; +2 max HP on level-up; reroll natural ones | First two fit typed events and persistent changes. Rerolls require a structured roll/check subsystem exposing individual dice; a summed DEEM result loses necessary information. |
| `knight`, `mana_focusing` — `traits.json`; `ring_of_protection`, `ring_of_thorns` — `tables/items.json` | Heavy-weapon conditional bonus; extra spell slots; AC -2; counterattack on attacked | Fits conditional attachments, equipment activation and triggers. Needs equipment slots, perk acquisition validation, spell resource policy and precise attacked-event semantics. AC direction is a ruleset choice. |
| `summon_vermin` — `abilities/arcane.json` | Generated animal options and `1d4 + floor(#level / 2)` count | Fits generation plus creation/ownership/control. Requires stable IDs, summon lifetime, scheduling and persistence policy; current “append a fighter” is insufficient outside combat. |
| `polymorph` — `abilities/arcane.json` | Sheep form replaces stats and abilities, prohibits items, then recalculates HP | Requires a deliberate form/overlay subsystem. Define HP mapping, damage carryover and nested form precedence; not safely reducible to arbitrary writes and undo. Defer. |
| `elvenkin` — `traits.json`; `planeModifiers` — `tables.json` | Forest-only search bonus; planes alter spell DC, slots and duration multipliers (Arcadia 1.2) | Fits scoped derived modifiers. Needs location/plane membership and explicit integer duration rounding; plane travel also needs destination generation/identity policy. No universal physics required. |
| `pc`, monster templates — `templates.json` | Procedural equipment/stats, level scaling, generated HP (e.g. `max(1,dig(#_statLine,'hp') + statMod(#con) + #level * 3)`) | Preserve DEEM generation, table lookup and registered helpers. Validate generated output before insertion; distinguish initial sampling from level-up recomputation. |

This sample exposes useful boundaries: expressions, facts and ordered procedures cover much; rolls, forms, equipment and clocks still need domain design. A universal effect object does not supply those semantics for free. Orsino itself illustrates the risk of prose outrunning mechanics: backstab's stated successful-hit dependency must not be assumed from its separately listed damage effect.

## 7. Incremental implementation and smallest experiment

Do not rewrite the campaign or battle first.

1. **Characterize existing behavior.** Retain current tests and document existing sampling, preparation, status and planner semantics. Add focused regression cases only where a semantic migration is intended. Existing content stays executable through its current frontend.
2. **Smallest executable experiment: parameterized exchange and movement.** Add a small typed `ActionSchema`/bound-command path alongside grounded `Operator`. Reuse `World` storage and atomic application. Implement only travel, exchange, collect and contribute over a tiny declared topology; use a permanent condition modifier to prove that an attachment can affect travel capacity. Skip stochastic planning, new English syntax and a generic trigger engine. Hand-construct checked IR in a fixture first so grammar design does not block the semantic test.
3. **Test generality, not just a successful script.** Instantiate two independently named situations with different toll prices, route durations and cargo quantities using exactly the same schemas. Supply command sequences externally; situation data contains no `Action` declarations. Verify conservation, capacity denial, buyer-specific permission, co-location requirements, objective fulfillment, and atomic rejection of an unaffordable exchange. Remove the ration option and verify that hunger alone grants nothing. These tests should fail a disguised hardcoded `recover` implementation.
4. **Add one combat action, one attachment and one reaction.** Lower the existing damage sentence to a typed procedure call. Share stable IDs and HP with a campaign entity through a narrow adapter. Implement `warded` and on-death Blood Frenzy, with ordered damage/death events and bounded reactions. Test lethal damage, resistance, duration boundaries, actual-loss drain and a failed transaction. No wholesale combat scheduler migration yet.
5. **Validate persistence and replay.** Save/reload between commands; execute the same bound command/draw stream headlessly and compare full states and events. Revisit surviving opponents after retreat. A combat loss must not undo deaths or paid resources. Introduce search only after legal-command enumeration is demonstrably RNG-free.
6. **Choose surface syntax after the IR proves useful.** Add the smallest schema/action grammar and situation sugar needed by those fixtures. Compile English and explicit-block versions of one ability to equivalent IR. Then adapt the planner to lazily ground eligible schemas from typed queries, retaining its bound and clear optimistic labeling. Keep unsupported stochastic effects opaque to search until an explicit planning abstraction exists.

The first experiment passes only if the second situation works without changing action code and a changed circumstance changes legality or consequences. Pretty syntax, one planned path, or a larger spell corpus is not sufficient evidence.

## 8. Decisions and risks still open

- **Actor scale:** parties, characters and factions need explicit membership and authority. Group capacity and contact are prototype abstractions; mixed-location parties need a later policy. Avoid duplicating character resources into an unrelated party ledger.
- **Life model:** decide whether zero HP is death or incapacitation, what remains targetable, and what makes resurrection legal. Fatality must persist regardless of the chosen policy.
- **Temporal model:** distinguish combat action slots, actor turn boundaries and world clock ticks. The experiment can use fixed travel durations; long journeys interrupted by deadlines or hazards require smaller committed intervals later.
- **Modifiers:** choose stacking keys, precedence, resistance rounding, maximum-resource changes and duration scaling. Avoid inverse writes on removal; recompute effective values from base facts and active contributions.
- **Triggers:** deterministic ordering is reproducible but still a game-design choice. Bounded reentry prevents loops while excluding some legitimate chains. Keep this restriction visible in author documentation.
- **Knowledge and planning:** who may inspect which facts? How are perceived legal actions and hidden failure modeled? Begin with discovery permissions; do not claim realistic deception or omniscient planning as player knowledge.
- **Planning scale:** parameterized schemas increase branching. Quantity choices and offer bundles can be enormous. Use bounded candidates, explicit quantity domains and heuristics before considering a new solver. A failed bounded search is not proof of impossibility.
- **Extensibility:** allowing arbitrary native procedures would recreate opaque mechanics. Require typed contracts, declared reads/writes/events and replay behavior. Restrict capability registration to trusted rulesets.
- **Migration:** changing preparation-time conditions to sequential reads, or turn-start to turn-end expiry, changes balance. Version these semantics rather than silently reinterpreting old text.

The direction to discuss before implementation is the boundary: **a compact world/action kernel, a reusable mechanically authoritative ruleset, and several ergonomic authoring forms**. The crossing should declare pressure, ownership, access and needs; the ruleset should determine what commands can actually do.
