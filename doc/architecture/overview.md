# How Kyr works: from an authored line to a remembered consequence

20 October 2026. For builders deciding where a change belongs. The vocabulary and state ownership are defined in
[ontology.md](ontology.md); time and the expedition loop in [play-model.md](play-model.md); costs in
[performance.md](performance.md). Examples come from Silkholme
([site](../../data/sites/silkholme/site.kyr), [situation](../../data/situations/brood-hollow/situation.kyr)).

## The four layers

| Layer | Owns | Does not own |
|---|---|---|
| **Deem** (the `deem` package, pinned in `package.json`; `data/generation`) | Choosing: compatible, weighted, seeded selection and composition of definitions | Anything after generation: a generated creature is data until Kyr accepts it |
| **Kyr** (`data/**/*.kyr`, catalog effects) | Meaning: what exists, what can be done, what changes, what is said | Execution order, persistence, presentation |
| **Kyrie** (`src/lang/world.ts`, `src/campaign`, `src/battle.ts`) | Truth: the one world state, time, encounters, creatures' bodies, history | Wording, layout, which choices to emphasise |
| **Presentation** (`src/presentation`, `src/ui`, `web`) | What the player can see, choose and remember | Any rule. It offers only `PlayerView.choices` and never mutates state |

## One path through all four

The webs in Silkholme, as authored:

```
Thing webs "the webs" on web_way {
  State whole blocking "Sheets of grey silk close {web_way} from wall to wall. Things hang in them.".
  State burnt "Black threads curl from the walls of {web_way}. The air stinks of burnt hair.".
  Change burn "Put a torch to the webs" from whole to burnt needing torch.
}
Event blaze beside web_way when state(webs, burnt) and not scattered(brood) "Fire runs up the silk…" then {
  Assert scattered(brood). Assert state(frames, ruined). Assert state(odile, bitter). Retract at(brood, nest). … }
```

1. **Lowering.** The parser turns the thing into facts (`state`, `blocksWhen`, `changeOf`, `needs`) and the state
   sentences into observations conditioned on those facts. No action is written for the burn: the generic
   `change_thing` schema in [passages.kyr](../../data/rules/passages.kyr) covers every authored change.
2. **Composition.** The campaign installs region, site and situation; imports bind roles (`web_way` → the site's
   `web_gallery`) and ids are namespaced (`brood__webs`). Action schemas stay schemas.
3. **Applicability.** `Operators` grounds on demand: it joins the facts a schema requires against the current world
   (here `at(party, cave)` binds the place), builds candidate operators, then tests the full precondition: the burn needs `meets(party, torch)`, so it is offered only
   while someone holds a torch. The same test serves the player, NPC planning and the UI.
4. **Execution.** `Campaign.complete` applies the change, then runs each watch: NPCs act, rules and events fire in
   authored order, projections refresh. `blaze` fires in the same command, and the brood leaves the world.
5. **Perception.** An event is told only to a player who perceives its anchor (`beside web_way`). Later, Reedwake
   quay, bound as the situation's `gossip` place, describes the outcome, and only by day:
   `Observe smoke_news at gossip when scattered(brood) and state(frames, ruined) and not dark()`.
6. **Memory.** The command, its replies and perceptions enter the event log and the save; the chronicle and the
   history strip are views of it.

Garth, an NPC, reaches the same burn through the same `change_thing` action: his `Pursuit burn_out … seeks
state(webs, burnt)` is planned with the shared planner, using the rope and torch he `Carries`.

## Invariants worth defending

- **One world, many views.** `World` is immutable; every change is a new world from `apply`. The campaign holds
  one state; `PlayerView`, NPC planning and tests read it, none of them keep their own copy of a fact.
- **Bodies belong to the creature store.** HP, mana, conditions and possessions live in `CreatureStore`; the
  world sees them only through the `CreatureFacts` projection (`awake`, `holding`, `capable`…), which rules may not
  write. Combat leases creatures and commits atomically or not at all.
- **Rules may not write what the engine maintains:** projections, `watch(clock)`, `dark()`, `untilLight(clock)`,
  records. `ModuleCompiler` rejects it.
- **One mechanical meaning.** An ability's typed effects are what combat executes and what `MechanicsText` explains,
  specialised to the actor ("1d10 + 3 (4–13)"), including conditions a damage type sets off. Authored prose
  descriptions are not shown as mechanics.
- **Generation is strict.** `select` fails rather than falling back. `creature` dispatches only to families that
  own every requested dimension (`creatureDimensions`), so `lineage=green` yields a green dragon and
  `classId=ranger` on an animal is an error, not a wolf with a class.
- **Randomness is keyed by identity,** not by evaluation order: each creature and each of its domains (attributes,
  name, spells, gear…), each encounter by its action and occurrence, each installed module by its id and seed.
  Giving someone rope changes nothing else about them.
- **Selecting is not committing.** A row only shows its actions, with time and cost; an action happens when it is
  chosen. What a player is shown as known (objectives, journal) is what the company has heard or seen.

## Where a change belongs

| You want | Put it in | Example |
|---|---|---|
| A new creature body, lineage, material, weight | Deem tables (`data/generation`), plus the canonical species if it is a new species | Cave spider: species, `creatureBody`, a weighted `creatureKinds` row, the cave family pool |
| A family-specific dimension routable from `creature` | One `creatureDimensions` row | `lineage` → dragon |
| A new ability or condition | Catalog typed effects; its text is generated | Green breath: `breathe_poison`, `poison_lineage` |
| A place, obstacle, person, quarrel | A site or situation module in Kyr | Silkholme |
| A group of creatures as one opponent | `Numbers 3.` on a person | the spider brood |
| A generated person | `Creature body cave_spider, level 3.` | the brood-mother |
| Something every world needs | A rule module in `data/rules` | `dark()`, `routed`, `wait_for_light` |
| An adventure a generated region may hold | A scenario manifest in `data/scenarios` over ordinary modules ([generated-worlds.md](generated-worlds.md)) | the unquiet tower: needs a tower site, a town's priest, three rumours |
| A new kind of resolution (combat, purchase, recovery) | `src/campaign` resolver, with a Kyr `Resolve` call | `Resolve combat(opponent)` |
| How it looks | `src/ui` (screen model) and `web` (renderer) | numbered menus, grouped combat log |

Prefer the higher row. An engine change that one module needs is usually a missing general construct: the brood
needed `Numbers` and `Creature`, not a spider-specific resolver; night needed `dark()`, not a Silkholme timer.

## Known weaknesses

- **Two geographies.** Canon habitats (`woodland`, `marsh`→`swamp`) and Deem terrains (`forest`, `marsh`) are
  separate vocabularies, and species statistics are repeated in Deem body rows (drift-tested, not derived).
- **Rules namespaces leak.** A situation entity named like a rule schema parameter (`site`) is rejected at load;
  the error is clear, but authors cannot see the reserved names.
- **Implicit Orsino mechanics.** Damage-type status triggers (fire → burning, slashing → shred) apply on top of an
  ability's own effects; now explained, but a venomous bite still applies poison twice.
- **Narration of quantities.** Goods changes read as deltas ("dead ewe: 0 → 1"); lodging is a fixed eight hours.
- **Combat is positionless.** Multi-enemy fights work and read clearly, but there is no reach, cover or zone.
