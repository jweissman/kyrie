# Creature lifecycle: Milestone 1

The persistent `Creature` in `src/creature.ts` replaces the original presentation-only interface. It has no team, guarding, cooldowns, initiative cursor, or controller. `Fighter` remains the detached flattened combat projection consumed by the existing engine, tests, and UI; it is not another persistent record.

## Generation and ownership

`Content.createCreature(stableId, context)` always runs the same DEEM `creature` template. Tables supply races, class defaults, population choices, abilities, and progression; an `attributes` subtemplate supplies shared attribute construction through `gen(attributes)` and an overlay. Explicit context fields override defaults before dependent properties are evaluated, following the pattern in Orsino's actual `Template.assembleProperties`, nested equipment generation, and table-selected class/racial overlays. There are no `fighter_pc` or `goblin` construction templates.

```ts
const content = new Content('seed');
content.createCreature('hero', { raceId: 'human', classId: 'fighter', level: 3 });
content.createCreature('goblin', { raceId: 'goblin' });
content.createCreature('monster', { population: 'monster' });
content.createCreature('chosen', { raceId: 'goblin', classId: 'cleric', strength: 18 });
```

Race and class settings are exposed as DEEM tables built from the existing `races.json` and `classes.json`. Population pools are authored in `deem.tables.json`. A race's class list supplies procedural defaults; it does not prohibit an explicitly selected class. Unspecified level defaults to 1. Max HP gains the class table's `hpPerLevel` amount for each level above 1; other statistics currently retain level-one generation rules. Level is retained in canonical base characteristics and combat projections. Equipment mechanics remain deferred.

The existing `Content.character` and `Content.creature` convenience entry points bind context and return detached projections. Their construction path is identical. `Content.generate('character', context)` remains a thin compatibility alias that delegates to `creature`; it contains no separate algorithm. The fighter class table grants the English-authored `wounding_blow` to fighters of any ancestry or allegiance.

The adapter validates generated numeric values and content references and then validates the complete canonical instance. IDs are supplied by the caller and uniqueness is enforced on insertion. The template does not choose persistent identity. Generation draws and combat draws use separate seeded runtimes; runtime damage never regenerates scores or HP maxima. No DEEM implementation changes were necessary.

`base` preserves six rolled ability scores, maxima, speed, and initially granted abilities. Attribute modifiers are derived on demand with the shared `statMod(score)` ruleset function; they are not cached in creatures. See [attribute generation correctness](attribute-generation.md) for the corrected schema, source evidence, and semantic tests. `state` holds current HP/mana, gold, experience, learned ability IDs and persistent conditions. A zero-HP creature remains stored and dead; ordinary healing does not resurrect it. Temporary armor/power contributions are evaluated by the existing effect resolver without writing base values. Equipment and separate lasting-injury mechanics are deferred; injuries currently mean lost HP.

`CreatureStore` owns the canonical instances. Reads and snapshots are detached. An encounter acquires an exclusive lease on its creature IDs; overlapping encounters or other leases cannot write those creatures simultaneously. Validated commits replace mutable state for all admitted participants together and reject identity/base replacement. Callers cannot change an instance by mutating a snapshot.

`Battle.encounter(store, participants, options)` admits `{ creatureId, team }` bindings and creates working combat projections. Each completed command, including the following turn-boundary processing, commits both sides to the same owner. Entering an encounter also commits its initial turn-boundary processing. A finished encounter releases its lease. Call `close()` to retreat from an unfinished encounter; it preserves completed consequences and releases the lease. This is an execution API, not a side-effect-free preview. `battle.participants` exposes only IDs and encounter-local state; `battle.state` retains the existing detached rich view for controllers/UI.

The legacy `new Battle(scenario, seed)` path creates a private canonical store from its input projections. It still leaves the supplied scenario unchanged for standalone simulation/replay. Use `Battle.encounter` with a retained store for cross-encounter persistence.

## Lifetime policy

Every status definition declares its lifetime in `data/statuses.json`:

- `persistent`: stored on the creature and brought into subsequent encounters. `poisoned` and `weakened` use this policy.
- `encounter`: lives in the combat projection and is excluded from persistent commits. `warded`, `blessed`, and `stunned` use this policy.

Both use existing duration semantics: tick/decrement at the affected living actor's turn start, including the initial turn start on entry. Remaining duration pauses outside combat; elapsed world time does not decrement it. “Persistent” means crosses encounter boundaries, not permanent. The examples explicitly demonstrate this distinction. Ordinary ability cooldowns and guarding always reset on a new encounter. There is no persistent cooldown counter.

`wounding_blow`, granted by the fighter class table, parses through the existing ability grammar:

```text
Deal (1d4) physical damage to enemy. Apply weakened to enemy for 3 turns.
```

`weakened` contributes -1 outgoing power through the same status/effect machinery as other conditions. It is not a custom ability handler. It persists until its turn duration expires or it is explicitly removed. Existing resurrection behavior (clearing conditions) is preserved.

## Campaign integration

Campaigns generate inhabitants once during initialization, with generation seeds derived from group identity. The campaign stores party IDs and inhabitant roster IDs and uses one `CreatureStore` for both. `Campaign.state.creatures` exposes its canonical snapshot; the existing `state.party` is a derived compatibility projection, not a mutable party ledger. Combat commits are independent of whether the scenario action succeeds, fails, or retreats. The interactive CLI uses `Campaign.executeAsync` to play the live encounter once; it no longer plays a preview and replays commands against a second encounter. Surviving and dead opponents are not regenerated on re-entry.

The existing symbolic `World` still owns relations/measures; the campaign's persistent aggregate includes that snapshot plus the creature registry and membership IDs. This milestone does not migrate creature fields into symbolic measures or unify campaign inventory quantities with character gold. No crossing action definitions or planner logic were changed.

## Executable examples and verification

Run:

```sh
bun run bin/lifecycle.ts
bun test test/creature-lifecycle.test.ts
bun run check
```

The headless example generates a fighter and goblin, executes the authored wound, retreats, snapshots/reloads the creature store, and re-enters with the same IDs. With its fixed seeds the goblin Grik has 7 HP initially and 6 HP after retreat and on re-entry, with `weakened` remaining. The reduced remaining count on re-entry comes from the next affected turn start, not travel time.

Focused tests also run two generated fighters against two generated goblins, compare full final creature states and events across identical seeds, preserve death, verify healing/resource expenditure and learned abilities, distinguish persistent/local conditions, reset cooldowns, reject concurrent leases and invalid atomic commits, and exercise injured opponents through the campaign adapter. The presentation-only test now uses the canonical creature; existing combat tests retain their semantics.

## Deliberate limits

- No reaction/trait interpreter, crossing refactor, generalized action IR, world-time scheduling, or disk save-file format. Creature snapshots can be reloaded; whole-campaign restoration and mid-encounter resumption are future work.
- Existing summons remain encounter-local and are excluded by original roster membership rather than by an ID-prefix heuristic. They are not yet persistent inhabitants.
- Two team labels remain a combat-engine convention, not part of the canonical creature schema.
- The existing battle preparation and failure semantics remain. Store commits are validated and atomic, but arbitrary runtime faults do not gain a new full command/RNG rollback mechanism here.
- Content-reference validation occurs at generation and encounter admission; the generic creature schema validates structure/bounds and does not hardcode a fantasy content catalog.
- Condition definitions remain the shared status registry. There is no second exploration condition system. A future world action should consult these same attachments, but no exploration consumer is implemented in this milestone.

## Compositional authoring boundary

The same principle applies to future situations: DEEM may construct structured declarations from authored data, sampled tables, context constraints and nested generation. Kyr rules determine which transitions those declarations permit. This correction does not change crossing operators or implement a new scenario generator.
