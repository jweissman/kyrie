# One effect sentence (OR-1333): a de-risking spike

**27 November, the lead.** A research spike before any builder takes OR-1333, with OR-1328 (result references) and
OR-1331 (one clock). It is a map of the two grammars, what unifying them would buy and break, and a slice order. It is
not an implementation.

## The two grammars today

| | Ability sentences (`src/lang/Abilities.ohm`, 39 lines) | Act consequences (`src/lang/Kyr.ohm`, `Change`) |
|---|---|---|
| **Statements** | `Deal`, `Heal`, `Apply … for N turns`, `Remove`, `Drain`, `Revive`, `Kill`, `Flee`, `Grant`, `Summon`, `Travel`, `Cast`, `Try`, and the typed `VerbCall` (#16) | `Assert`, `Retract`, `Set`, `Increase`, `Decrease`, `Give`, `Spend`, `Restore`, `Slay`, `Bring`, and `Resolve` |
| **Conditionals** | `If <expression>, <statement>` | none (authors' most repeated ask, AU-57: "No `If` in an effect") |
| **Saves** | `unless <kind> save against N`; `; a <kind> save against N halves/negates it` | none |
| **Targets** | role words resolved at execution: `enemy`, `ally`, `random enemy`, `party`, `self`, `it`, `here` | typed terms: entity ids, parameters, `party`, `self`, `it`, `here` |
| **Amounts** | Deem expressions and dice | Kyr values and measures |
| **Duration** | `for N turns` or `hours` | none (rules and measures by hand) |
| **Executed by** | the fight (Battle), FieldUse outside a fight, `EffectDomain.lower` for Outcome | the world's transition (`World.apply`), with Outcome reading the same changes |
| **In the corpus** | 83 sentences in the catalog's items, 414 abilities in the census; 30 with a duration, 12 with a save, none with `If` | about 6,960 consequence blocks and 6,100 rules |

## What unifying buys

1. **Conditional consequences for acts:** `If` already exists on the ability side. One grammar gives authors their top ask
   without a new construct.
2. **The bridge between local and global effects (OR-1097):**
   - abilities that change the world: light a room, open or seal a way, reveal;
   - acts that hurt, heal or apply a condition.

   These are the reference dungeon's own verbs (OR-1097's slices 4–6).
3. **One duration:** `for N turns/hours` becomes the one clock's duration (OR-1331), which the installed domain's overlays
   need for their recurrence and endings (installed-domain.md, step 4).
4. **One lowering:** typed verbs (#16) lower to world changes or to domain operations by one path, and execution and
   Outcome read the same bound changes (the typed-vocabulary design's rule).

## What it must not break

- **The 6,960 consequence blocks and 6,100 rules parse and lower exactly as now.** The unification is additive on the
  act side, never a rewrite. Proof: every corpus file parses to the same module, as the 24 November During change was
  proved (test/semantic-tracing; the game hashes).
- **The ability census stays at 414 round-trips, none differing** (#16's proof). Fights, saves and odds are unchanged.
- **Execution contexts stay apart where they differ.** A creature's hit points live in the creature store, not in world
  facts. A unified `Deal` must lower to the fight domain's operation in a fight and to the projection's write outside
  one, not invent a third path. This is the main risk.

## The risks, ranked

1. **Targets.** Role words such as `random enemy` are resolved by the fight at execution, while typed terms are bound at
   grounding. One grammar needs one target notion: a *role* resolved in the execution context. Roles already exist for
   `self`, `party`, `it` and `here` in both.
   - **De-risk first:** bind the act side's `it` and `here` through the same resolver as the ability side, with parity.
2. **Determinism of draws.** Ability amounts roll dice in the fight's stream. World changes take no draws today. A
   conditional or a dice amount inside an act must draw by stable identity (the standing ruling), keyed by the act's
   id and the turn, never by sequence.
3. **Outcome's prediction.** Outcome predicts world changes before an act. A dice amount or an `If` on a fact the act
   itself writes needs Outcome to represent the contingency. The beta brief accepts "within correctly represented
   contingencies".
4. **Grammar ambiguity.** `Remove`/`Retract`, and `Grant`/`Give`, overlap in meaning, not in form. Keep both spellings
   and lower them to one change rather than retiring either: no corpus rewrite.

## Slice order, each with its proof

1. **`If` in act consequences** (`On success { If <predicate>, <change>. }`), lowered to the conditional change a rule
   ladder writes today. **Proof:** a fragment where the ladder of two rules and the one conditional reach the same
   states; the corpus parses identically; Outcome predicts both branches. This alone answers AU-57.
2. **World changes in ability sentences** (`Assert`, `Set`, `Bring` after an ability's verb), lowered through the
   typed-verb path. **Proof:** a light-the-room ability in a fragment; the census unchanged.
3. **One target resolver** for role words across both, with page, terminal and runner parity.
4. **Duration as the one clock** (OR-1331): `for N turns/hours` lowered to one duration the overlay machinery reads;
   fights' rounds as the clock's finest grain.
5. **Result references** (OR-1328): "heal half the damage dealt" as a bound result of the sentence's earlier clause.

Slice 1 is small, valuable and nearly free of risk, so it is the place to begin. Slices 2 and 3 carry the
architectural risk and want the target-resolver spike before either.

## The blockers, read from the code (27 November, later)

What stands in each slice's way, checked against main rather than inferred:

- **Slice 1 has no blocker, given one design call.** `Change` (src/lang/module.ts) is a flat union, and some 33 files walk
  an act's `success`/`failure` as a flat `Change[]`: facets, lints, Outcome, the owed and spoken readers, the writer.
  - A new `{ kind: 'if' }` variant would reach every one of them.
  - A guard on the change itself (`when?: Predicate`) reaches only the executors. Every reader of "what this act may
    write" stays correct as it is, because a guarded change is still a possible write: facets and lints read the
    superset, which is the right reading for an inferred opportunity.
  - The executors are `World.apply`/`admits` (src/lang/world.ts) and the campaign tick's binder (campaign-tick.ts,
    which binds a change's calls). The guard's calls are bound with the same bindings, and ModuleWriter writes it
    back for the round-trip.
  - The guard is read against the world *before* the act, as all of a consequence's changes are simultaneous. Outcome
    foresees by `world.apply(success)`, so it predicts the right branch with no contingency machinery. A guard that
    reads what the act itself writes is a lint error, not a semantic.
  - KyrQuick.ohm needs no change; the grammar recipes are regenerated (scripts/grammar-recipes.ts).
- **Slice 2 is blocked by a draw.** A Deem amount in an act is settled once, when the module is compiled
  (ModuleCompiler.resolve, module-compiler.ts:245). `Increase gold(actor) by (2d6)` gives the same number for the life
  of the world. Dice in a world change need a draw at execution, keyed by the act's id, its bindings and the turn
  (the standing ruling), and Outcome then reads it as a range or a mean. This is the Deem-owns-expressions work: an
  expression compiled once and evaluated per draw.
- **Slices 2 and 3 are blocked by the execution context.** An ability's `Deal` runs over the creature store (the fight
  and FieldUse), and a world change runs over facts. Before an ability can write the world, or an act can hurt, one
  role resolver must say what `it`, `enemy` and `here` denote in each context. Today the fight binds roles at
  execution and the world binds terms at grounding (risk 1). The target-resolver spike is the de-risking step: bind
  the act side's `it` and `here` through the ability resolver, with parity.
- **Slice 4 is blocked by the installed domain's step 4.** The one clock (OR-1331) is the overlays' recurrence and
  ending, so duration is designed there, once, and not under this row.
- **Slice 5 is blocked by slices 2 and 4.** A result reference (OR-1328) reads what a clause did ("the damage dealt"),
  and that is defined only once the clause executes in one context with one draw.
- **OR-1329 (topological sets) is blocked by nothing,** but by order: sets over places and ways are a target notion, so
  they come after the resolver.

## Recommendation

Give slice 1 to a builder now. It is bounded, it answers the authors' top ask, and its proof is mechanical. Run the
target-resolver spike (risk 1) in the foreground before committing slices 2 and 3. Keep OR-1331 joined to the
installed domain's step 4, so that duration is designed once.
