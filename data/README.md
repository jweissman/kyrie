# data/

All authored content for Kyr. Each directory holds one *kind* of content. A module never says where it is installed;
a campaign composes modules and binds their roles.

| Directory | Holds | Authority |
|---|---|---|
| `catalog/` | The canonical fantasy domain: ancestries, species, classes, traits, abilities, conditions, items, backgrounds, skills, religion, organisms, vocabulary | Global. Read only through `src/canon`. Validated at load (`kyrie validate`). |
| `rules/` | Kyr rule modules every world is written against (`core`, `passages`, `people`, `needs`, `services`, `discovery`, `care`, `belongings`, `dominion`, `probing`, `inhabitants`; optional `elements`) | Global. A manifest names them in `rules`; `"world"` means the standard set. |
| `campaigns/` | `*.campaign.json`: which modules are installed, in what order, how their roles are bound, and the default company. `companies.json`: the ready companies | Composition only; no content. |
| `sites/`, `situations/` | The generator's library: a reusable problem with roles (someone caught below, a brood in a hollow, an unquiet tower, a den in the wild) and the sites some of them need | Local to an installation. A situation must install in at least two settings. |
| `scenarios/`, `kits/`, `frameworks/` | How the world assembler places situations and kits in a generated region: what each needs, where it fits, how word of it travels | Global. |
| `generation/`, `assembly/` | DEEM tables and templates by domain, and the assembler's own vocabulary | Global. |
| `sources/orsino/` | The Orsino registry snapshot, Kyr's feature judgements and the adaptation ledger | Provenance only. Nothing at runtime reads it. |

Regions, sites, planes, institutions and conflicts are written the same way wherever an adventure keeps them.

**The old corpus is retired.** Mission 8 took the Varrow (with Brack, the Unlit, the Lanthorn, the Candle Tombs, the
Brimming and the Hush), the Red Crag, Skellfold and the Serewater March out of the game. Their last versions are in
the history at commit `b8b20e6` (`git show b8b20e6:data/regions/varrow/region.kyr`). The Serewater March and the modules it installs live on as a mechanical test bed in
`test/fixtures/march`, because many rules tests still run on it; small purpose-built fixtures sit beside it in
`test/fixtures`.

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

## A conflict

A conflict module gives powers their own aims and the means to pursue them, in the same terms as everything else:

- **Operations** are ordinary actions with time and consequences (`raise_warden`, `take_up`, `complete_rite`). A
  power's agents plan with them toward its pursuits (`Pursuit rite for necromancer … seeks holds(necromancer,
  founders) using depart, arrive, begin_rite, complete_rite.`). A pursuit for a person another module declared
  extends that person at installation (Iven sends to the Ecumenon).
- **Long undertakings can be obstructed.** A pending action is checked again when its time is up; if it no longer
  holds, its `On failure` changes are its aftermath (the rite breaks, the plinths crack; the hallowing is cut short
  and the warden goes back hurt).
- **Agents travel out of sight** by `byway`s (`dominion.kyr`): known routes with their own times, absent from every
  map until they arrive.
- **What the company knows follows evidence.** `Observe … teaches fact` makes a scene teach what it shows; objectives
  are conditioned on what the company knows, never on what happened out of its sight.
- **Requests and trade** use the standard `give` (`Wants burial_register.`) and `sell` (`Buys grave_rings for 8 coin.`);
  reactions are events on `keeps`.
- **Activities can be interrupted**: `Interrupted when threatened(actor).` on a wait, a rest or a rite.

See [the living world](../doc/architecture/living-world.md) for how the March's conflict is built and tested.

## Current composition

- `campaigns/serewater-march.campaign.json`, the recommended campaign and the testbed for play across expeditions:
  `regions/serewater-march` (Reedwake, Chalkcross, the downs) → `institutions/keepers-of-names` →
  `sites/censer-hill` → `situations/caught-below` + `situations/salvage-rights` → `regions/brackenholt` (the far
  bank, the holt and its bears, Holt tower's foot) → `sites/silkholme` → `situations/brood-hollow` →
  `situations/unquiet-tower` (Holt keep: five floors, several ways in) → `regions/march-word` (who knows what, and
  says it, across the three settlements) → `conflicts/register-of-names` (Sorgen, his digger and his dead against
  the keepers and the Ecumenon, while the company is elsewhere). `test/march-journey.test.ts` walks its three
  expeditions; `test/conflict.test.ts` and `test/holt-keep.test.ts` the conflict and the keep;
  `test/living-world-browser.test.ts` plays both in a real browser.
- `campaigns/silkholme.campaign.json`: the Silkholme expedition alone (one short session).
- `campaigns/skellfold.campaign.json`: `sites/skellfold` (hamlet, fellside and quarry in one module) →
  `situations/caught-below` + `situations/salvage-rights`, the same rescue in a quarry.
- `campaigns/red-crag.campaign.json`: `sites/thrale` (village and crag in one module) → `situations/dragon-roost`
  (a grown red dragon whose hunting costs the village a sheep a day, then its cattle, unless it is paid).
- `campaigns/companies.json`: the ready companies on the creation screen.
- `scenarios/`: the library a generated region draws its adventures from (`library.json`, one
  `*.scenario.json` per situation: the contexts it fits, the places it needs, how word of it spreads). See
  [generated regions](../doc/architecture/generated-worlds.md).

Skellfold and Thrale still combine their region and site in one module.

Removed material is listed in [doc/archive/legacy-material.md](../doc/archive/legacy-material.md).
