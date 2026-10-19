# Modules installed in one campaign

Run the two-site campaign without any TypeScript content registration:

```sh
bun run kyrie campaign data/bundles/two-sites.campaign.json sites
```

Use numbered actions, `inspect`, `hint`, or `save /tmp/sites.json`; resume with `bun run kyrie resume /tmp/sites.json`. The shared footpath leads from the crossing village to its wayside market, and an ordinary route connects that market to the pantry. Neither travel direction reloads a module.

## Audit and ownership

Previously `Campaign` accepted one `Instance`: a compiled module, initial world, and optional flat `CampaignDefinition`. It had one module goal/deadline summary, while `Modules.adventure` registered its source files in TypeScript. There was already one canonical `CreatureStore`, one typed `World`, one watch loop, and one authoritative combat/execution path. Those pieces did not need replacement.

The smallest change is an installation registry plus a loader/linker. `Campaign.module` remains the aggregate compiled world schema/rules for existing consumers; it is no longer the identity of a single adventure. Installed adventures are records inside the existing campaign definition, not separate `Campaign` or `World` objects.

| Owner | Data |
| --- | --- |
| Campaign | Root seed, elapsed watch, party membership, canonical creature store, combat encounter counter, controller order, command log, observations, installed-module registry. |
| Installed module | Installation ID/seed/time, authored name, resolved goal/outcome predicates, owned controller/pressure IDs, absolute deadline, exports. Its generated initial facts are applied once. |
| Shared world | All locations, actor locations, inventories, route connections, claims, hostility, pressure records, and typed derived queries. Module-local IDs are scoped names in this same world. Creature facts remain read-only projections of the canonical store. |
| Shared ruleset | Compatible type/relation/measure declarations and reusable action schemas. Identical declarations merge once; incompatible definitions fail. Ground actions are rebuilt over the combined entity domain. |

The first bundle bootstraps the one player actor/creature. The campaign adopts those records; later modules import the existing party rather than generating a new one. Every creature has one controller; an imported NPC can be referenced or fought without giving it another controller or mutable copy.

## Author-facing files

`data/bundles/two-sites.campaign.json` selects instances and binds imports:

```json
{
  "version": 1,
  "name": "Crossing and wayside pantry",
  "modules": [
    {"id":"crossing","bundle":"crossing.module.json"},
    {"id":"pantry","bundle":"pantry.module.json","imports":{
      "party":"crossing.party","gold":"crossing.gold","rations":"crossing.rations","clock":"crossing.clock",
      "road":"crossing.exit","watcher":"crossing.guard"
    }}
  ]
}
```

Paths in the campaign manifest resolve relative to that file. Paths inside each bundle resolve relative to the bundle. `crossing.exit` means the `exit` export of the already-installed `crossing` instance, not a private global identifier guessed by the second author. Dependencies must appear first; unresolved, undeclared, or wrongly typed imports fail before installation.

The crossing bundle uses its existing Kyr situation, shared rules, and DEEM `adventure` template:

```json
{
  "version":1,
  "situation":"../modules/living-crossing.kyr",
  "rules":"../rulesets/adventure.kyr",
  "generation":{"type":"adventure"},
  "globals":["party","gold","rations","clock"],
  "exports":{
    "party":"party","gold":"gold","rations":"rations","clock":"clock",
    "exit":"refuge","guard":"guard"
  }
}
```

`globals` explicitly declares shared entity IDs on first installation. A later module imports these entities; it cannot redeclare them and reinitialize their state. `gold` and `clock` are existing runtime/ruleset protocol entities. Ordinary local commodities, stocks, queries and creatures are scoped to their module. Shared rule functions and actions retain their names.

The pantry bundle declares placeholders and exports a site:

```json
{
  "version":1,
  "situation":"../modules/pantry.kyr",
  "rules":"../rulesets/adventure.kyr",
  "generation":{"type":"pantry_manifest","templates":"pantry.templates.json"},
  "imports":["party","gold","rations","clock","road","watcher"],
  "exports":{"site":"shelter","carrier":"carrier"}
}
```

A generation entry supports a template type, default context, and optional JSON `tables`/`templates` files. An installation request may override context. Extra definitions use DEEM's existing `buildSetting`/template machinery and cannot replace shared generation definitions such as `creature`. There is no new generator. Race/class/ability selection remains data passed into `Content.createCreature` and its shared score-only creature template.

The tiny pantry content adds one caretaker, one place, a ration crate and a pantry stock. Its DEEM template describes a commoner context, one provision goal, one initial ration and a deadline subtemplate. Its Kyr source includes:

```text
Entity road: place "Imported crossing exit".
Entity shelter: place "Wayside shelter".
Entity watcher: group "Guard elsewhere".
Initially Assert route(road, shelter).
Initially Assert route(shelter, road).
Initially Assert mayCollect(carrier, cache).
Query supplied() means quantity(granary, rations) >= 1.
Goal supplied().
```

Its controller may use only the existing `collect` and `put` schemas, planning to `supplied()`. Its `guard_dead` observation reads `dead(watcher)` through the imported crossing guard. It defines **no actions or TypeScript orchestration**. Authors add JSON, DEEM and Kyr files and list them in a campaign manifest; they do not edit `Modules` or an engine catalog.

## Names, installation and time

An instance ID such as `pantry` produces IDs such as `pantry__carrier`, `pantry__winter`, `pantry__supplied` and `pantry__caretaker`. Another installation of the same bundle gets its own prefix and generation seed. Instance IDs use a letter followed by letters/digits/hyphens, reserving `__` for the linker. Entities, local queries/functions/types/actions and creature/member references are transformed structurally in the typed representation, respecting parameter bindings. Runtime strings are not interpreted as narrative instructions.

Cross-module references bind typed entity aliases, not raw string substitutions. Imported placeholders disappear from the merged entity list. Generated creature seeds derive from campaign seed, instance ID and local creature ID; adding a module does not consume the existing creatures' generation stream. Reproducibility includes the installation order and content inputs, including planner tie-breaking order.

`await campaign.install(request)` installs another bundle between commands. It stages schema merging, imports, initial effects, generated creatures, canonical validation and projections before publishing the new aggregate. It applies only the incoming initial facts, never the previous modules' initialization. Imported-subject numeric changes, retractions, unary state flags, and exclusive assertions are rejected, preventing resets of party location, inventory or currency. Nonexclusive connection facts such as `route(importedRoad, localSite)` can be added. Conflicting shared definitions, duplicate installation IDs, controller ownership conflicts and imported pressure ownership are rejected. If the campaign advances while asynchronous assets are loading, installation fails and can be retried at the new boundary. Saving/installing during a combat lease is rejected.

There is still one global clock. Each player command advances it and all installed NPC controllers receive opportunities in installation/authored actor order, regardless of player location or module outcome. Each installed pressure's due time is its authored delay plus installation time. `now` is provided to DEEM as the installation watch; the crossing's generated mercy/urgency thresholds use it to construct absolute clock thresholds. Authors of other absolute-time conditions must make the same distinction. No wall-clock progression or second scheduler was added.

Module goals/outcomes are evaluated from the current shared world. `campaign.state.modules` returns local outcome names and developments under each installation ID. `state.outcomes` also exposes qualified keys such as `crossing.supplied`; first-observed developments remain separate from current truth. `plan(moduleId)` can target an installed goal; the default chooses the first unsatisfied module goal and retains the existing bounded player-only planning limitations.

A module may report failure at its deadline and later show `supplied: true`; the historical deficit survives. The campaign summary remains active while the party can act. Completing or failing either module never closes the campaign. Legacy one-instance entry points keep their previous summary behavior.

Save snapshots include the aggregate schema, ungrounded shared schemas, installation registry, exports, controllers, pressure schedules, world facts, canonical creatures, encounter counter, observations and command log. Restore does not reread bundles or rerun generation. Later installation after restore uses saved exports/schemas. Saves remain same-ruleset checkpoints; no cross-version content migration is promised.

## Evidence and deliberate limits

`bun test test/module-bundles.test.ts` exercises:

- Two file-loaded modules, duplicate local names/queries/pressure names, one party, one shared action definition and typed exports/imports.
- Cross-site travel while both controllers act, pantry provision at watch 2, crossing deadline failure at 8, and eventual offscreen crossing delivery at 11. Returning preserves both situations' facts and original creature bases/IDs.
- Independent module results: pantry success alongside crossing failure and late recovery; the campaign remains playable. Coin/cargo ownership and ration quantities are checked.
- Identical complete saves/logs from independent command histories and uninterrupted versus JSON-restored execution.
- Installation at watch 5 without changing existing party state or granting its initial money again; the new pantry's deadline is watch 8.
- Two instances of the same pantry bundle with distinct creature/entity IDs and different deadlines; one can fail and recover while the other succeeds.
- Actual combat death of the canonical crossing guard observed by both modules through an explicit imported alias, including after restore.
- Atomic rejection of unresolved/wrongly typed imports, duplicate installations and an attempted imported-party location reset.

No regional generation, streaming/unloading, dependency graph solver, hot reload, module-local clocks, comprehensive scheduler, cross-version saves, generalized social reasoning, or new planner/rules engine is included. Modules currently share the existing campaign ruleset conventions; incompatible versions fail rather than silently overriding each other. One controller owns each creature and modules cannot replace that controller by importing it. The party is bootstrapped by the first bundle; an independent character-selection/bootstrap bundle is a future authoring refinement. Installation metadata records when/with which seed content entered the world; there is no new command-only replay file format for installation operations. Existing single-module campaigns are preserved, but are not automatically migrated into the new scoped bundle format.
