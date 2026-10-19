# Authoring Serewater: what actually had to be written

The complete geography, named people, motives, discoveries, local consequences and changing observations live in [serewater.kyr](../../data/serewater/serewater.kyr). Reusable mechanics live in rule libraries; construction lives in small DEEM templates/tables. No Serewater execution decisions are in TypeScript.

## The package

| Source | Responsibility |
|---|---|
| [serewater.kyr](../../data/serewater/serewater.kyr) | 27 places, district/level bindings, native people/topics/discoveries, initial relations, local pressures, custody/commission content and observations |
| [templates.json](../../data/serewater/templates.json) | One compositional campaign constructor; nested actors/casting/stock/forage/flood/permit/relic constructors |
| [tables.json](../../data/serewater/tables.json) | Party starting contexts, weighted regional population, habitat-specific threat levels, seasonal stock/timing and independent relic selection |
| [module.json](../../data/serewater/module.json) | Shared rule dependencies, globals/exports and generation entry point |
| [campaign.json](../../data/serewater/campaign.json), [rain.campaign.json](../../data/serewater/rain.campaign.json) | Install the same module with default or late-autumn context |
| [items.json](../../data/items.json), [abilities.json](../../data/abilities.json) | Reusable owned equipment, consumables, shared effects and techniques |
| [dungeoneering.kyr](../../data/rulesets/dungeoneering.kyr), [items.kyr](../../data/rulesets/items.kyr) | Generic physical trap, line, escort, custody, finite commission, forage, item and training actions |

Existing adventure/discovery/fieldcraft/affinity rules supply travel, information transfer, rest, field healing and wildlife approach. The primary browser asset catalog discovers these files automatically.

## Native fictional units and explicit mechanics

```kyr
Person pell "Pell" at vestibule {
  Role "surveyor, wants to go home with the survey intact".
  Race human. Class thief. Level 2. Uses travel.
}
Initially Assert trapped(pell).
Initially Assert restrainedBy(pell, rack).
Topic pell_request with pell "Ask Pell what happened" when trapped(pell) {
  Says "'The rack fell when they hauled the bearing. Shift it and get me back to the quay.'".
  On discuss { Assert knows(actor, pell_map). }
}
```

`Person` constructs canonical identity and controller bindings. The role explains fiction; `trapped`/`restrainedBy` plus reusable `free_obstruction` and `escort` implement it. Talking alone never frees or teleports him. The condition and transfer are inspectable world operations, not interpretation of the quoted sentence.

Likewise, a physical warning binds a trap to a discoverable fact. `disarm` requires that knowledge plus delving; `brace` requires knowledge plus a worn line; `risk_passage` invokes the shared hazard effect and latches the spent mechanism. Authors write circumstances once, then reusable schemas provide the approaches.

## Independent construction and frozen bindings

```json
"march_items": {
  "__no_id": true,
  "charm_cache": "=lookup(marchRelic, burial)"
}
```

The parent constructor nests this with `gen(march_items)`, independently of NPC and stock generation. Its result is a typed `items` binding from an existing world item entity to a known catalog definition. Assembly validates both references and rejects duplicate authored `itemKind` declarations; it lowers the binding into an ordinary typed `itemKind` fact and uses the catalog's name. No generated prose is executed. The resulting item kind is frozen before play and cannot change during inventory commits.

An inherited `season` constrains stock and flood tables. NPC `casting` overlays creation contexts on declared `Person`s without a duplicate controller registry. Creature generation still uses the same shared `creature` template. Contexts can alter independent dimensions; they do not select an entire prewritten region profile.

## Presentation is authored, not a client switch on room IDs

The shared district relations associate places with Reedwake, wilderness and the three underground levels. PlayerView publishes those labels and scene categories only for known places. Lantern uses that projection for scene art and map grouping. Adding a new room or district does not require modifying a TypeScript list of Censer Hill IDs.

A real integration mistake demonstrated why these contracts matter: declaring `encounterXp` or `district` as module-private functions silently namespaces them away from the generic engine/view contract. Their signatures now belong to the reusable ruleset; local entities and initial values remain module-owned. Better diagnostics for such mismatches remain desirable.

## What was easier; what is still awkward

People, topics, discovery sources and their local circumstances can now be read together. Item names/effect definitions are not manually duplicated in browser code. Generated bindings remove a separate casting/controller registry and catalog registration. Shared actions handle physical rescue, equipment, commission delivery and trap alternatives without room-specific TypeScript.

The source is still long. Authors manually declare both directions of routes, item stock/price/vendor facts, dynamic observations and explicit rule dependencies. There is no convenient native room-graph notation, institution model or reusable dialogue tree. A custody writ is still a fact rather than an owned document with issuer/provenance; its scope is bounded by the authored keeper/record rule. The finite commission price is currently six coins in a shared rule, not a general quotation system. The generated dossier has package-level provenance, not complete per-expression tracing. These are concrete remaining friction points, not reasons to introduce an opaque universal Adventure wrapper.
