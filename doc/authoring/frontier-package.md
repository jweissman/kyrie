# Authoring a site inside a persistent region

The northern margin is new material, not merely a prettier migration. Its source is [margin.kyr](../../data/frontier/margin.kyr); its construction is [templates.json](../../data/frontier/templates.json), [tables.json](../../data/frontier/tables.json), and [module.json](../../data/frontier/module.json). The [campaign](../../data/orra/play.campaign.json) supplies the explicit shared village reference. The generated [dossier](../playtests/frontier/fen.dossier.json) and [lowered Kyr](../playtests/frontier/fen.lowered.kyr) expose the instance.

## Before and after

Previously, adding a significant person meant synchronizing a Kyr entity/location, DEEM casting entry, canonical creature ID, controller permissions, name presentation and browser import. A dialogue-like exchange was another low-level action plus separately written prose. Party-member targets required manual bindings.

The site now says:

```kyr
Person tala "Tala" at camp {
  Role "northern guide and trader". Race human. Class ranger. Level 2. Uses travel.
}
Topic tala_route with tala "Ask for a route around the altered wolf"
  when knows(tala, old_trail) {
  Says "The guide marks a dry ledge from the northern track to the shrine.".
  On discuss { Assert knows(actor, old_trail). Retract assumesFalse(actor, old_trail). }
}
Pursuit leave_danger for tala priority 20
  when functioning(font) and watch(clock) >= departAt(winter)
  seeks at(tala, village).
```

`Person` supplies the existing group entity, initial location, canonical DEEM generation context and controller. The role is descriptive identity, not an executable social rule. Generated casting overrides may supply name, race or other creation context; an override referring to an undeclared person is rejected. Names update the entity and canonical creature together.

`Topic` lowers to an ordinary typed action with actor/site bindings, both participants able, distinct and co-located, the additional `when` condition, time 1, authored response, and the written effects. A statement in `Says` changes no knowledge by itself. This example explicitly grants the route fact. There is no interpretation of the English sentence.

The pursuit uses the existing bounded goal selector/planner. The frost pressure is a measure and rule, not a new threat scheduler. Abandonment and NPC absence are represented by ordinary facts and changing observations.

## Composition rather than complete profiles

The single `frontier_margin` template composes `frontier_labels`, `frontier_casting`, pressure measures and stock initialization. Labels are separate table lookups; guide ancestry is weighted by inherited biome; guide name can be explicitly overridden; beast level and pressure pace are independent parameters. `>name` deliberately prevents the inherited region name from replacing a nested person's name. The standard creature constructor still creates actual creatures.

The fen and pine campaigns use the same source and rules. They do not choose complete adventure profiles. Overrides may change random draw consumption; identical seed plus identical context is the replay guarantee, not identical downstream draws after changing context.

## Actual author steps

1. Write the site: geography, people, motives expressed as topics/goals, sources, explicit pressures and observations.
2. Reference shared rules for travel, discovery, field care, trade and mechanisms. Add only genuinely local facts/consequences.
3. Supply small DEEM templates/tables for independent contextual variation, or use direct defaults.
4. Add a bundle with source, rule dependencies, imports and generation entry point. Install it in a campaign with an explicit namespace and shared-place binding.
5. Build. The asset catalog includes new Kyr/JSON automatically; no browser TypeScript registration is needed. Inspect the instantiated dossier and lowered source.

Native people get canonical member bindings automatically. Player `Uses *` tracks installed action schemas; NPC permissions stay explicit. Builtin ability IDs and exported shared globals do not need duplicate imports. A bundle can combine existing Kyr files, preserving legacy content while adding player-facing material.

## Remaining friction

This is still four content files plus a campaign installation, not a finished ideal authoring system. Old Orra people still use legacy casting records. Bidirectional routes, some permissions and state-conditioned prose remain manual. Source-level names can collide with library parameter names; hygienic binding was not introduced. Fixed-price trade is a ruleset choice; the market is not an economy. Explicit `operates` grants mechanism access without a tool/skill check. Topic knowledge and trustworthy testimony are coarse. The generic discovery action still often yields certainty immediately.

No copied adventure ruleset or new TypeScript subsystem was needed for this site. The reusable changes were bounded native construction/response conveniences and generic field/trade services. Further syntax should follow observed author/player needs rather than conceal these remaining semantics.
