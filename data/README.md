# data/

All authored content for Kyr. Each directory holds one *kind* of content. A module never says where it is installed;
a campaign composes modules and binds their roles.

| Directory | Holds | Authority |
|---|---|---|
| `catalog/` | The canonical fantasy domain: ancestries, species, classes, traits, abilities, conditions, items, backgrounds, skills, religion, organisms, vocabulary | Global. Read only through `src/canon`. Validated at load (`kyrie validate`). |
| `rules/` | Kyr rule modules every world is written against (`core`, `passages`, `people`, `needs`, `services`, `discovery`, `care`, `belongings`; optional `elements`) | Global. A manifest names them in `rules`; `"world"` means the standard set. |
| `regions/` | Settlements, wilderness and the routes between them: towns, roads, shops, inns, the company's starting place | Local to an installation. |
| `sites/` | A substantial place to explore: levels, rooms, passages, hazards, guardians, discoveries | Local. Imports the region places it attaches to. |
| `institutions/` | An organization with members, holdings, obligations and the facts it controls (a burial society, a guild) | Local. Exports its people and the facts others can rely on. |
| `situations/` | A reusable problem with roles (someone caught below, a salvage permit against the dead, a dragon's roost). Declares people, objectives and outcomes; imports every place it uses | Local. Must install in at least two settings. |
| `campaigns/` | `*.campaign.json`: which modules are installed, in what order, how their roles are bound, and the default company. `companies.json`: example parties | Composition only; no content. |
| `generation/` | DEEM tables and templates for creature and character generation | Global. |
| `sources/orsino/` | The Orsino registry snapshot, Kyr's feature judgements and the adaptation ledger | Provenance only. Nothing at runtime reads it. |

## A module

Every region, site, institution and situation is a directory with a `module.json` manifest and its Kyr source:

```json
{
  "version": 1,
  "source": "site.kyr",
  "rules": ["world"],
  "globals": ["party"],
  "imports": ["party", "ridge"],
  "roles": { "ridge": { "type": "place" } },
  "exports": { "site": "censer_hill" },
  "generation": { "type": "…", "templates": "templates.json", "tables": "tables.json" }
}
```

- `imports` are placeholders the module declares (`Place ridge "The high approach" is room.`) and the campaign binds
  to another module's export (`"ridge": "march.high_road"`). `roles` states each import's type and conditions.
- `exports` name what later modules may bind to. Ids are namespaced by installation (`hill__vault`); catalog-backed
  entities (abilities, item kinds, capabilities, goods) keep their ids everywhere.
- `generation` is optional. A situation uses it to cast and label its people and things per setting.

## Current composition

- `campaigns/serewater-march.campaign.json`: `regions/serewater-march` → `institutions/keepers-of-names` →
  `sites/censer-hill` → `situations/caught-below` + `situations/salvage-rights`.
- `campaigns/skellfold.campaign.json`: `sites/skellfold` (hamlet, fellside and quarry in one module) →
  `situations/caught-below` + `situations/salvage-rights`.
- `campaigns/red-crag.campaign.json`: `sites/thrale` (village and crag in one module) → `situations/dragon-roost`.

Skellfold and Thrale still combine their region and site in one module.

Removed material is listed in [doc/archive/legacy-material.md](../doc/archive/legacy-material.md).
