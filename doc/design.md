# Kyrie module experiment

## Language, ruleset, and scenario

`src/lang/Kyr.ohm` defines a small module language: typed entities, declared
relations, numeric measures, derived boolean queries, conditions, changes, goals,
and actions. It contains no fantasy damage types, currencies, classes, ancestry,
or crossing-specific concepts. The module parser's semantic actions are named
class methods. Only Ohm's fixed action arities have a lint exception.

`src/lang/Abilities.ohm` extends that grammar with the current RPG combat verbs.
Their execution lives in the battle ruleset. Damage types and resources come from
`data/rules.json`; syntax accepts identifiers, while the ruleset validates names.
This is a separation of the generic module core from the existing combat DSL,
not yet a general plugin registry for arbitrary English effect verbs.

`data/modules/crossing.kyr` is the hand-authored scenario. It replaces the former
JSON file of opaque dot-separated facts. `has(party, rations)` is a query defined
inside the module over `quantity(party, rations)`. The engine has no special-case
`has`, `at`, `hungry`, or `gold` implementation.

## Module semantics

- Kinds and signatures validate argument types and arities. The built-in kind
  `entity` accepts any entity; other kinds match exactly. Entities have stable
  identifiers and independent display names.
- Relations are stored structured calls. An exclusive relation makes its final
  argument unique for each preceding argument tuple. Asserting `at(cargo, village)`
  replaces `at(cargo, bridge)` rather than leaving contradictory location flags.
- Measures are nonnegative safe integer functions. Missing entries mean zero.
  `Set`, `Increase`, and `Decrease` modify that storage. Underflow/overflow fails
  atomically on a copy of the world.
- Queries bind typed parameters and evaluate pure predicates over relations and
  measures. Recursive queries are rejected. Queries cannot be directly asserted.
  This is closed-world logic: an absent declared relation evaluates false.
- Predicates support calls, numeric comparisons, `not`, `and`, `or`, and grouping.
  `not` binds most tightly, then `and`, then `or`.
- Parenthesized Deem numeric expressions in module budgets, initial quantities,
  action changes, and comparisons resolve once during module instantiation.
  They are generation-time choices, not rerolled per action. Combat dice continue
  to resolve during combat. Stateful random predicates are excluded from planning.
- Actions have a pure precondition and explicit success/failure changes. Time is
  a positive integer, cost a nonnegative integer. Costs guide search; they are
  separate from authored resource consumption.
- `Resolve combat(raiders)` references a registered external capability. Its
  name and argument signature are checked by the compiler. The module core does
  not adjudicate combat. The current fantasy adapter maps the group to an authored
  encounter roster; new capabilities require an execution adapter too.

The AST and state are in `src/lang/module.ts`; parsing, compilation, serialization,
and evaluation are separate classes. The compiler checks declarations, references,
argument kinds, query recursion, capability signatures, and number types. Module
validation is not the same as proving a goal reachable.

## Planner and execution

The bounded uniform-cost planner evaluates the same predicates and applies the
same changes as the campaign executor. It searches detached world snapshots and
checks the remaining time budget. Inventory quantities are part of that world;
there is no separate `party.has.coin` flag or campaign gold counter.

The planner currently uses grounded actions and parameterized queries, not lifted
first-order action schemas, quantifiers, or a general theorem prover. Search stops
at 2,000 expanded nodes by default. A null result can mean infeasible or exhausted
search budget. Actions whose numeric changes cannot execute are inapplicable.

Encounter success is optimistic during planning. Execution invokes the shared
battle engine, commits the original party's wounds, deaths, mana, and learned
abilities, then applies the corresponding world changes. Replanning uses the
actual outcome. Combat losses therefore do not magically establish victory facts.
An automatic run can stop without a plan even while time remains; this does not
claim a general solution to uncertainty or narrative direction.

Campaign state currently lasts for the process. There is no disk save/load.
Transient statuses, cooldowns, and summons are encounter-local. Individual battle
resource grants and the module's group inventory remain separate holdings; there
is no implemented inventory-transfer or pooled-loot system yet.

## Generated modules

`src/campaign/modules.ts` starts from the authored module AST. A Deem generation
manifest supplies names, cargo, initial quantities, hunger, time pressure, and three
of four available approaches. The composer includes the corresponding actions
and dependencies. This changes the graph of possible plans. It writes complete
Kyr source, reparses it through the same parser as authored source, type-checks,
and tests symbolic reachability under its actual initial quantities and deadline.

Up to 32 deterministically seeded candidates are considered. The returned artifact
includes source, the instantiated module, attempts, and selected approaches.
Generation is bounded rejection sampling; acceptance biases its distribution
and should not be treated as an unbiased sample of possible campaigns.

This is intentionally constrained composition over one situation. It does not
invent new mechanics or synthesize arbitrary stories. The interesting research
question is whether adding reusable situation structures and richer relationships
produces meaningful variation, rather than permutations of the same route puzzle.

`kyrie module-batch` reports action-set distribution, first planned choices,
mean candidates, and plan duration. These are structural measurements. A plan
exists under an optimistic encounter model; it is not a guarantee that a human or
any combat policy can win. Tests also execute seeded campaigns and check replay.

The generator uses curated town-name tables. Extracting Orsino's naming language
and pursuing phonaesthetic names remains deferred. Display names never determine
entity identity or mechanical behavior.

## Character model and terminal

Ancestry, class, and allegiance are independent fields. Human/goblin/wisp ancestry
supplies naming and identity. Fighter, Cleric, Magic-user, Thief, and Commoner are
shared classes for NPCs and party members. Creature templates combine a race and
class; encounter rosters do the same explicitly. No goblin-only class remains.
Ancestry descriptions currently grant no mechanical traits.

Raw attributes use 3d6 with a +2 class-primary adjustment capped at 18. Formula
attributes use `max(0, floor((score - 10) / 3))`. These remain experimental rules,
not edition-accurate D&D. Classes determine HP die, mana, and available abilities.
Campaign success grants XP but no advancement occurs yet.

The terminal groups legal commands by ability. A player chooses the action before
choosing among its eligible targets. Self, group, and random effects resolve their
scope automatically; they do not display a spurious hero as the group's target.
Backing out of targeting consumes no turn or resource. The engine validates the
final command again. Ordinary combat logs are readable; symbolic state is exposed
only through the explicit `inspect` command or research/automatic output.

Interactive encounter commands are recorded and replayed through the campaign's
encounter before committing consequences. This ensures the same rules and seed
adjudicate the preview and commit. Quitting aborts the unfinished session.

## Remaining combat-language target

Orsino's effect model remains the reference for expressive range, not code or
proprietary content to copy. Local inspection covered ability/status models,
combat resolution, class tables, and representative arcane/divine abilities.

| Family | Implemented | Remaining |
| --- | --- | --- |
| Damage/heal/drain/kill | Typed effects; actual HP loss governs drain | Resistances, reflection, spillover, cascade |
| Conditions | Named status, duration, poison, stun, armor/power modifiers, removal | General stat changes, reactions, stacking policies |
| Saves/guards | Per-target save to negate; Deem boolean guards | Save for half, trait/context predicates |
| Targeting | Self, selected allies/enemies, dead ally, groups, all, random enemy | Separate deployment/party scopes, variable random counts |
| Summons | Real actors with shared classes/races and turns | Lifetimes, ownership limits |
| Revival | Explicit dead-ally revival | Long-term injury and resurrection consequences |
| Resources/learning | Numeric grants, mana costs, cooldowns, teaching abilities | Inventory transfer, passive traits, progression |
| Travel/retreat | Encounter exit and an explicit travel event | Cross-module world travel and pursuit |
| Random/cycled effects | Random targets only | Choice/cycle effect combinators |
| Attack/equipment | Legacy automatic-hit damage formula | Weapon profiles, equipment, accuracy, defense, proficiency |

The attack criticism remains unresolved by this module milestone. A weapon attack
should be a ruleset procedure using equipment, training, and the defender, rather
than a fixed damage die in the ability catalog. That is the next combat task.

Other current combat semantics: descending speed, stable ties, half damage while
defending, flat ward/blessing adjustments, no implicit resurrection. Statuses tick
at the affected actor's turn start, with expired buffs removed before the action.
Reapplying a status refreshes duration. Group effects share magnitude rolls but
saves roll independently. Cooldown N blocks the actor's next N turns. Conditions
and saves can prevent an effect while the action still consumes its cost. A
500-turn limit bounds stalemates.

## Verification and research context

The tests include a science-fiction laboratory module using entirely different
types and vocabulary, source round-trips, bad declarations/references, query cycles,
atomic quantities, generated action-graph variation, plan feasibility, class/race
independence, action-then-target selection, combat replay, and 1,000 seeded battles.
The compiled binary embeds the built-in module and content; external Kyr files can
also be validated and played.

[Deem](https://github.com/jweissman/deem) provides seeded expression and template
generation. [Node-based scenario design](https://www.thealexandrian.net/creations/misc/node-design/node-design.html),
[progress clocks](https://bladesinthedark.com/progress-clocks), and the
[faction game](https://bladesinthedark.com/faction-game) remain useful design
precedents. The symbolic compiler/planner is our experiment, not a system specified
by those references. Next structural tests should add a second situation and
cross-scenario persistence, after correcting the basic weapon/attack model.
