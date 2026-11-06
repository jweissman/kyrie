# 7. Contributing to a settlement or a city

*The authoring trail, page 7 of 9. [Start](../README.md) · previous: [Canonical plants, animals, monsters, items](06-canon.md)
· next: [Testing reachability, consequences, save and reload](08-testing.md)*

You want to add to a town that already exists (an inn's back garden, a quarrel between people who already live there)
without making a second copy of the town. What works depends on whose town it is.

## A generated town: supported

A **scenario** (`data/scenarios/*.scenario.json`) places an ordinary module in a generated town and binds its roles
to that town's own parts. The quarrel over the boundary stones is the model:

```json
"places": { "town": { "settlement": "any" } },
"modules": [ { "id": "quarrel", "bundle": "../goings-on/quarrel/module.json",
  "imports": { "party": "@party", "town": "@town", "taproom": "@town.taproom", "shop": "@town.shop",
    "shrine": "@town.shrine", "keeper": "@town.innkeeper", "trader": "@town.merchant", "priest": "@town.priest" } } ]
```

The module declares stand-ins for what it imports (`Place town "The town" is settlement.`, `Entity keeper: group "The
innkeeper".`) and adds its own places *within* the imported town (`Place garden "the inn's back garden" is room
within town at 1, 2.`), its own facts, topics and discoveries about the people it was given
(`data/goings-on/quarrel/situation.kyr`). It never declares the town again: the town and its keeper are the world's.
`settlement` may be `any`, `largest`, `along:`, `near:` or `toward:` (`src/world/scenario-towns.ts:52`); a town must
have the parts the module imports. Two modules in one generated town are proven by `test/two-modules-one-town.test.ts`
(it passed on `fbf38d58`): in a1, Lowmouth holds the circus, the players and a quarrel, and no module's choices leak
into another's places. `bin/kyrie world <seed>` lists, under *Eligibility*, which scenarios fit that world.

What a contributor may not do: reset what the town's module set; it may only assert about the people and places it
imported (`src/campaign/module-installations.ts:93-100`).

## An authored city shared by two adventures: not soundly supported

Each of the 21 authored adventures brings its own region and its own towns (Quittance's eight districts, Ombra's
seven Sleeves, Hessel, Sennet, Calamy…); none binds to another's. Today:

- an authored province exports only `party`, `region` and its entry room, so there is nothing of its town to import;
- provinces install lazily, so the city another adventure would contribute to may not be installed yet;
- two modules that both declare the city as a global bind first-writer-wins, by load order, or fail with "Duplicate
  entity" (`src/campaign/module-installations.ts:88-89`);
- there is no settlement need that names an authored city (`city:` is not one of the forms), and no quarter of a town
  as a place (`src/spatial.ts:5` has no quarter kind; Hessel's quarters are comments).

So **do not** write a second Hessel or a second Quittance to set a story there, and do not move your strand into
another author's country. This is open: **M19-77** ("No two adventures can contribute to one persistent city", in the
owner's working tree, 6 November), with the city of Seven Towers, B2 of Mission 18 (BRF-54) and the quarters of a town
(M19-73). The research behind it, with a proposed contract (an exported `city` with its parts and quarters, and a
`city:` need), is the owner's working note `/var/tmp/kyrie/m19/metropolis.md` (not in the repository). Until it is
built, a story set in an existing authored city belongs in that adventure, by its author.

*Next: [Testing reachability, consequences, save and reload](08-testing.md).*
