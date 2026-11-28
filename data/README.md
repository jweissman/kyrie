# data/

All authored content for Kyr. Each directory holds one *kind* of content. A module never says where it is installed;
a campaign composes modules and binds their roles.

| Directory | Holds | Authority |
|---|---|---|
| `catalog/` | The canonical fantasy domain: ancestries, species, classes, traits, abilities, conditions, items, backgrounds, skills, religion, organisms, vocabulary | Global. Read only through `src/canon`. Validated at load (`kyrie validate`). |
| `rules/` | Kyr rule modules every world is written against (`core`, `passages`, `people`, `needs`, `services`, `discovery`, `care`, `belongings`, `dominion`, `probing`, `inhabitants`, `growing`, `making`, `belief`, `ambitions`, `canon`; optional `elements`, `devotion`, `venturing`), and `packages.json`, the packages they are: the kernel (`core`, `passages`, `people`, `discovery`) and what each other package reads of the rest | Global. A manifest names them in `rules`, each installed with the kernel and what it declares it reads; `"world"` means the standard set. |
| `imbar/` | The canon: Imbar, the inner and outer planes, the Infinite Library and the upper House (each with one region and a threshold in it), the College of Dun Rì, its House of Doors, Dun Rì, the Rose of the Winds, the Rector's office, and the world events other modules read; and `shape.json`, the great regions every generated world's grid of countries holds (the Eastern Ocean, the Great Desert, the Southern Sea and Continent: see `WorldShape`) | Global. Installed first in every world; a module names what it uses in its manifest's `canon`. The shape is read before any country is drawn. |
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
- `canon` names the ids of `data/imbar` the module uses (`"canon": ["imbar", "inner_fire"]`). The loader gives it
  their declarations from there, bound to the world's own, so it declares none of them (one that does is refused); a
  plane named brings its region and threshold. It may set regions of its own within a canonical plane, join its ways
  to a threshold, and say `seatOf(identity, place)` of a canonical identity; it puts no `law` on a canonical place.
  A world event is asserted in play, `Assert befell(door_of_doors_opened)`, and read by any module that names it.
- A country of the material world is a region within `imbar`: every generated country is, and so are the authored
  countries that name it. One set in no plane is taken to be in Imbar too, so the road over a march is no planar
  crossing. A province is installed `within` its host country, and only its own region is moved there (its export
  `region`; naming none, each region it sets in Imbar or in no plane): its regions elsewhere (a Commonplace) or in
  another plane stay where they are.
- `exports` name what later modules may bind to. Ids are namespaced by installation (`hill__vault`); catalog-backed
  entities (abilities, item kinds, capabilities, goods) keep their ids everywhere.
- `generation` is optional. A situation uses it to cast and label its people and things per setting.

For a causal storytelling example, [The Empty Seat](goings-on/theemptyseat/NOTES.md) uses a Deem visitor profile to
bind a person's name, words and practical aid together. Kyr's Occasions, Promises and ordinary resource effects
decide which possibility becomes an event. Variation is not a rerolled explanation for a predetermined result.

Its [news module](goings-on/theemptyseat/news.module.json) is a portable reporting kit. Bind `party`, `news_place`
and `news_carrier` to an existing company's, room's and teller's exports. It reads canonical `befell` events, waits
for delivery, and offers a local rumour and a carried newspaper edition. Reading uses ordinary ownership, light and
wakefulness guards. Neither reading nor gossip makes the reported event happen; an old edition is never updated
into a new one. In a world it is installed twice in Dun Rìerdan (data/scenarios/empty-seat.scenario.json): in the city's heart and at the Guild safehouse; the standalone campaign does the same over a stand-in city.

### Conversations that move something

A question can be a consequence: a `once` topic opens replies written `answering` it. The consequence census
counts that opening, but not the topic's own recall or its merely becoming unavailable. Replies can commit a
character, permit an act, change a relationship or put evidence to use; they need not give money or teach a fact.

Teaching a fact is not by itself literary payoff. Give it a reader: another question, an inference, a route or an
act that changes the world. The [Empty Seat audit](goings-on/theemptyseat/NOTES.md#conversation-audit) distinguishes
these uses from journal-only hooks and deliberate respite. Deem should draw a coherent motive and difficulty
together; Kyr carries their consequences forward rather than rerolling them at the next scene.

### Venturing Guild halls

Add `"venturing"` beside `"world"` in the manifest's `rules`. Each hall declares its keeper and local survey area:

```kyr
Initially Assert guildHall(hall).
Initially Assert guildKeeper(keeper).
Initially Assert guildRange(hall, district).
```

The keeper must be present, able and visible. Membership costs three coin and belongs to the company, so another
hall recognises it. Each `guildRange` is a containment catchment, not a distance radius; halls can share an area.
Declare a local district rather than the whole kingdom.

Installing a hall or subsequent content surveys actual wonders and valuable item kinds within its catchments.
Loose finds and finds in a container at a place qualify; shop stock and recovered items do not. The generator
creates an established location report, `leadsTo`, a `guildSurvey(report, item, place)` record and an ordinary
objective. Asking teaches the report and records `guildIssued(company, item)`. The map and chosen aim use the
existing knowledge and gold-continuation machinery; no client invents a quest or an indicator.

The live query excludes known, recovered, sold and moved finds. A visited place can still hold an unknown find.
Moving a surveyed find makes its old report stale and warns a commissioned company once. An authored
`guildSurvey` prevents a duplicate generated report; supply its `established`, `leadsTo` and objective yourself.
Generated report and objective IDs use `<item-id>__guild_survey`; do not reserve these for unrelated declarations.

There is no commission quota or prewritten quest pool. An unchanged finite world can exhaust its eligible
unknown finds: the keeper says so, rather than inventing treasure or selling the same report twice. Newly
installed local content supplies fresh leads. This rule does not generate new sites itself, rank by distance,
provide category-search controls, resurvey a moved item, or build a safehouse network.

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
- **Requests and trade** use the standard `give` (`Wants old_glossary.`) and `sell` (`Buys grave_rings for 8 coin.`);
  reactions are events on `keeps`.
- **Activities can be interrupted**: `Interrupted when threatened(actor).` on a wait, a rest or a rite.

See [the living world](../doc/history/architecture-2026-10/living-world.md) for how the March's conflict is built and tested.

## Current composition

> **Obsolete, 6 November 2026** (the documentation reconciliation; the text below is kept as it was). The campaigns
> this section names (`serewater-march`, `silkholme`, `skellfold`, `red-crag`) are no longer in `data/campaigns`: the
> Serewater March and its modules are test beds under `test/fixtures`, and a game is now played in a generated world,
> with every authored adventure (`data/adventures/*`) installed as a province of its first country
> (`data/adventures/countries.json`). The standalone `*.campaign.json` files that remain are each adventure played on
> its own with a preset company (legacy; see M19-75). `catalog/` no longer has `organisms`: plants are
> `plants.json`, creatures `animals.json` and `monsters.json`. For how to write and place content today, see
> [doc/authoring/README.md](../doc/authoring/README.md).

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
  [generated regions](../doc/history/architecture-2026-10/generated-worlds.md).

Skellfold and Thrale still combine their region and site in one module.

Removed material is listed in [doc/history/archive/legacy-material.md](../doc/history/archive/legacy-material.md).
