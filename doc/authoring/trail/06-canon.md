# 6. Canonical plants, animals, monsters, items

*The authoring trail, page 6 of 9. [Start](../README.md) · previous: [Variations with Deem](05-variations-with-deem.md) ·
next: [Contributing to a settlement or a city](07-settlements.md)*

Westernesse has one canon, `data/catalog/*.json`, read only through `src/canon` (the schema is
`src/canon/schema.ts`). Each file opens with an `about` that says what it holds and how a record is read; read it
before adding. A record added there is the thing everywhere: an adventure that needs a new kind of creature or item
adds a record, it does not invent a private one (the owner, 5 November: one canonical creature pipeline).

| File | A record is | Key fields |
|---|---|---|
| `animals.json` (61), `monsters.json` (64) | a **base kind** of creature | `name`, `kind`, `type`, `description`, `looks`, `statistics` (attributes, `weapon`, `armor`, `growth.hitPoints`), `abilities`, `traits`, `resistances`, `temperament`, `habitats`, `abundance`, `variantOf`, `variations`, `portrait`, `worth`, `source` |
| `variations.json` (51) | what varies a specimen, not a species: age, size, region, role, condition, undeath | `axis`, `word`, `kinds`, `says`, attribute and health changes |
| `plants.json` (13) | a plant that grows in the generated world | `name`, `habitats`, `yields` (an item), `gathered`, `count`, `stand` (how a stand is told), `cut`, `uses`, `abundance` |
| `items.json` (54), `materials.json` (17), `devices.json` | an item kind; a material (hardness, looks); a device (a turret, a ward) that takes part in a fight without being a creature | `name`, `category`, `value`; `kind`, `hardness`; a device's own chassis fields |
| `abilities.json`, `conditions.json` | effects: what an ability does (typed effects are what combat executes and what its text says), a condition's modifiers and ticks | see each file's `about` and `src/rules/modifiers.ts` |
| `habitats.json` (15) | a kind of country (wood, river, fen, cave…) a record can live in | |

Orsino's generated entries (`data/catalog/orsino/*.json`) are joined with these; a hand record replaces the Orsino one
its `source` names. `bin/kyrie validate` checks the catalog; `bin/kyrie handbook` regenerates the handbooks
(`doc/handbook`) after a catalog change.

## A new creature: what works and what is landing

On `fbf38d58` a creature record loads, is made by the one chassis (`Creation.chassis`), takes its variations, and an
author can set it in a module (`Species x.`, `Variant y.`). A record with `habitats` and an `abundance` is drawn into
dens of those habitats by its record alone (`RegionEcology.recorded`, `src/world/region-ecology.ts:54`), though no
record in the catalog yet sets `abundance` (22 of 61 animals have `habitats`, 3 of 64 monsters).

**Landed since (7 November):** each kind's danger measured by the game's own fights against a lone first-level
warrior (`data/catalog/challenge.json`, `src/world/challenge.ts`, measured by `bin/kyrie bestiary challenge <kind>`),
and deep sites and dens composing parties within a budget from what each record says (`src/world/parties.ts`). A
monster (the hollow-stalker) was added by its record alone and met in generated countries (1c149c0a); a plant added
so, self-heal, was later removed at the owner's word, the authoring proof made the owner's hazel (d7edde06). The recipe
for a creature: add the record with `habitats` and `abundance`, run `bin/kyrie bestiary challenge <kind>`, and meet
it in a generated site. For a plant, an item and a spell, see below.

Specs that hold the pipeline: `test/creature-pipeline.test.ts`, `test/creature-variation.test.ts`,
`test/natural-history.test.ts`, `test/devices.test.ts`. The design is
[mission-19/creatures.md](../../history/missions/19/creatures.md).

## A new plant, item or spell, end to end (journey 5, 7 November)

Mission 19's journey 5 added a plant (`betony_plant`, plants.json), the item gathered from it (`betony`,
items/consumables.json) and a spell (`hornet_swarm`, abilities.json), each marked demonstration content in its
`source.notes`, with no engine change. The path, and what it showed:

- **A plant** names its `habitats` (habitats.json, or an alias of aliases.json: `forest` is the wood), its `grounds`
  (geology.json's formations, or a soil), an `abundance` from one to ten (without one it grows only where nothing
  more particular does), and `yields`, an item of the catalog. With an abundance it stands, by that chance, in every
  stretch of its habitats (it was in Look on a road of meadow). `bin/kyrie validate` checks the names.
- **An item** is a line of its file under `items`; `use` is Kyr's effect language (`Heal (1d4+1) health to ally.
  Remove bleed from ally.`), which the pack and the Encyclopedia both read. Without a `portrait` the pack shows an
  empty square: the plates are the owner's paintings, cut from sheets by `scripts/animal-portraits.py` into
  `data/paintings/*.json`, so a new kind waits for its plate; leave `portrait` unset until it has one.
- **A spell** is a record of `kind: "spell"` with `spell: { tradition, level, school or domain }` and typed `effects`
  (copy one of Orsino's in `data/catalog/orsino/abilities.json`: `damage` with a `damageType`, `apply` with a `status`
  of conditions.json or orsino/conditions.json, a `duration` and a `save`). The effects are what the fight does, and the
  creation page's line ("1d4 piercing to every foe, and distracts them"), the Encyclopedia's "In play" and the fight's
  log are all said from them. A spell of a domain is offered to clerics of that domain at its level, and may be among
  those a new cleric starts with (Hornet Swarm was one of a nature cleric's three at once); `cost: 1` spends a slot.
  Piercing harm can set bleeding on its own (a Constitution save): no need to write it.
- **Seen**: `bin/kyrie validate`, then `bun run web:build` (the browser's bundles and the Encyclopedia, which is
  written from the catalog at build: the new plant and spell had their entries at once), and `bin/kyrie handbook` for
  the generated handbooks. Then the game: the spell chosen at creation and cast at the rats under the corn-store, the
  plant gathered in a wood, the item carried and given.

## Boundaries

- A plant's `uses` are descriptive: no rule reads them; nothing identifies a plant (a stand is seen and named
  outright) (owner's working notes, 6 November).
- An ability in the catalog that is not loaded lints clean and throws only when it strikes (UNT-210); ability text
  is still not validated catalog-wide against what it executes (ARV-A5, Partial).
- A module's own `Species x "…" like base` may change only name, temperament, description and habitats, and two
  modules' local kinds can clash in id (mission-19/creatures.md); prefer a canonical record.

*Next: [Contributing to a settlement or a city](07-settlements.md).*
