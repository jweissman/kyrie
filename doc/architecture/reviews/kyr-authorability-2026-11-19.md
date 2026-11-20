# kx-1: Can Kyr and Deem author a new kind of item?

Branch `kx-1`, commit `f0d03b1c1`. Brief: directions of 19 November, section 4. The spec is `test/kx-lodestar.test.ts`
(5 tests, about 2 s). The fixture is `test/fixtures/kx-1/`.

## Answer

**Mostly yes. The boundary holds inside one module and failed in one place across modules. A seven-line language change
fixes that place, and it is prototyped on this branch.**

- I defined a new kind of thing, the *lodestar chip*, in Kyr. It is a sliver of a way-stone that leans toward the stone
  it was broken from.
- Deem generated distinct instances of it.
- The instances were placed in the Long Man's world, then taken, handed on, used, sold, and kept across a save.
- A separate scenario, a pedlar, reused the kind as written.
- None of this needed bespoke TypeScript or any change to the catalog.

What failed: a kind's own per-instance vocabulary (its relations and measures) could not be shared between modules. The
fix is a `shared` mark on `Relation` and `Measure`.

## 1. The machinery as it stands

**Two meanings of `Kind`.** `Kind fact.` declares an entity type. `Kind id "name" is <category> | like <kind> …`
declares an item kind, handled by `LocalKinds` in `src/canon/local-catalog.ts`.

- While its campaign is played, a declared item kind joins `Canon.items` and `ItemCatalog` "as if it had always been
  there". It is taken out again when another campaign is played.
- A kind's id is an `itemkind` entity. That type is canonical, so the id is never namespaced. A module installed later
  can place `Item x is lodestar_chip` with no import at all.

**A kind has a closed set of eight parts**, and each one has engine behaviour behind it:

- `worth`, `weighing`, `described`
- `granting` (a skill or capability)
- `teaching` (a fact; documents only)
- `worn as` (a slot)
- `using "<effect>"` (consumables only)

The category also comes from a closed set of eight, held in TypeScript (`LocalKinds.categories`, `ItemKind['category']`
in `src/canon/schema.ts`).

**Items and what can be done with them.**

- Declaring one: `Item id "name" is kind at|in|nowhere [hidden until f] [owned by g] [{states}]`.
- Who holds it is the `ownedItem(item, member)` relation, read through the `holding` and `carries` queries in
  `passages.kyr`.
- Whose it is (`owns`, `lends`, objection rules) is in `belongings.kyr`.
- The ordinary actions are all shared rules in `belongings.kyr`, written once for every kind: `take_item`, `take_out`,
  `put_in`, `transfer_item`, `give`, `sell` and `sell_ware`, `buy_item`, `use_item`, `read_item`, `equip_item`.
- `Give x to party` works from a topic or an action.

**Deem has two routes. Only the first needs no TypeScript.**

1. **A module's own generation.** The manifest's `generation: {type, templates, tables}` names Deem JSON. Its output
   (a `SituationManifest`) can do these things to the module's declared entities:
   - rename them (`labels`)
   - assert facts (`facts`: rows of name and args)
   - set measures (`initial`)
   - bind items to kinds (`items`)
   - cast people (`casting`)

   It cannot create entities. Instances must be declared ahead as slots, and generation picks among them. The den and
   fellowship situations already work this way.
2. **`.kyrt` Kyr templates** (`src/world/kyr-template.ts`). These are filled and drawn into generated countries.
   **All 33 of the 33 `.kyrt` files are imported by name from TypeScript.** A new template file therefore needs a TS
   import. A new *option* inside an existing template does not; the undertown already declares kinds that way
   (`Kind corn_store_key … like cell_key`).

## 2. The experiment

| File | Holds | Lines that are not comments |
|---|---|---|
| `lodestar/lodestar.kyr` | The kind (`is gear`, not `like` anything), shared `tunedTo(item, fact)` and `leanings(item)`, the action `follow_lean`, a spent-chip observation | 15 |
| `chips/chips.kyr` | Five chip slots placed `nowhere`; three way-stone places, each with its fact, `leadsTo`, and a path hidden until known | 22 |
| `chips/templates.json`, `tables.json` | Deem template and tables (details below) | 26 |
| `pedlar/pedlar.kyr` | A separate scenario: a pedlar on the green who `Buys lodestar_chip`, gives his own chip through a topic, and tunes it to his own chert pit | 20 |
| 3 × `module.json` and `kx.campaign.json` | Manifests, and imports of `longman.party` and `longman.green` | 23 |

The Deem template does three things for each seed:

- It samples three of the five slots and lays them at the green.
- It tunes each one to a way-stone and gives it 1–3 leanings.
- It names all five apart, using `sample`, `mapGenList` and `dig`.

**What the spec proves:**

- The campaign lints with no errors, and `Canon.items.lodestar_chip` is `gear` worth 6.
- The same seed lays the same three chips again. Another seed lays three different ones. Each chip has a distinct name,
  a stone, and 1–3 leanings.
- In play:
  - Elen collects a chip and hands it to Bran.
  - *Hold up … and follow its lean* teaches the stone's fact. The stone goes on the map, its hidden path is offered, and
    the chip has one leaning fewer. The action is then no longer offered for that chip.
  - A save and its reading again keep the chip in Bran's hands, with the same leanings.
  - Selling the chip to the pedlar pays 4 coin.
- The pedlar's chip is given, and it leans by the **same** action, `lodestar__follow_lean`, not by a copy.
- At the boundary:
  - Without `shared`, the pedlar's facts become `pedlar__tunedTo`, and no lean is offered for his chip.
  - Declaring the relation shared with different types (`item, place`) is refused at install.

No UI or presentation code was touched. The chip appeared with its generated name, under the ordinary *Take*, *Sell*
and *Give to* rows.

**New instance or new reusable kind? I achieved the second, with limits.**

- *A new item of an existing kind* is `Item x "…" is crowbar` or `Kind k like crowbar`. Neither is what this is.
- *A new reusable kind* is what the lodestar chip is. It is declared `is gear`, so it takes from no existing kind. It
  has its own properties (`tunedTo`, `leanings`) and its own capability (`follow_lean`). It is used unchanged by two
  other modules.
- The limits: its engine-level identity is still one of the eight categories, so it is sold and carried as gear. Every
  property beyond the eight parts listed above is ordinary Kyr vocabulary, not part of the `Kind` declaration.

## 3. Authoring burden and where the boundary fails

**Size.** 9 files: 3 Kyr, 2 Deem, 4 manifests. About 57 lines of Kyr, 26 of Deem and 23 of manifest. The engine diff is
the `shared` prototype only: 7 files, +27/−11, two of them regenerated grammar recipes.

**About 14 concepts an author must hold:**

1. `Module`
2. `Kind … is`
3. `Item … nowhere`
4. `Relation` and `Measure`
5. `Action` with `Requires`, `On success` and `Result`
6. `Observe … near ?c`
7. facts: `established`, `leadsTo`, `knows`
8. `Passage … hidden until`
9. `Person … Buys`
10. `Topic … Give`
11. manifest `imports`, `roles` and `globals`
12. import binding in the campaign manifest
13. Deem generation rows, explained below
14. the namespacing rule: ids become `module__id`, while item kinds and `party` keep theirs

The hardest was 13. A `facts` or `initial` row is `{">name": …, "args": …, "value": …}`, and that row shape is written
down nowhere an author would look. It had to be learned from `den/templates.json`.

**Where it failed, or nearly did:**

1. **F1 (fixed by the prototype): a kind's vocabulary did not cross modules.** A module's relations, measures and
   actions are namespaced per installation (`ModuleNamespace`). Only `data/rules` names are shared.
   - Without the fix, the only data-only route was to name `lodestar.kyr` among each module's own `source` files. That
     worked; I ran it during development and it showed `chips__follow_lean` and `pedlar__follow_lean`. But every module
     that includes the file gets its own copy of the vocabulary and the action. A chip from one module is invisible to
     the other's action, and kind-level rules would fire once per copy.
   - Making that path-named file "shared" by default would undo the A7 decision of the architecture review. A probe
     test, `authorability-probes` K10, deliberately keeps such files private.
2. **F2: kind properties are closed.** Only the eight parts above exist, and `using` is for consumables only. A
   kind-level number works anyway, because the kind's id is an entity: `Measure pull(itemkind). Initially Set
   pull(lodestar_chip) to 3.` A new *category* (say "instrument", with its own trade and slot behaviour) needs
   TypeScript. This is a larger missing capability, recorded for later and not prototyped.
3. **F3: Deem cannot create instances.** Slots are declared ahead (five chips, three laid), so the number of instances
   is bounded by what the author wrote. For items this is acceptable. Unbounded generation is the `.kyrt` route, which
   needs TS.
4. **F4: a Deem bug.** `lookupUnique` passes no `randomFunc` (`node_modules/deem/src/Template.ts:72`), so it falls back
   to `Math.random()`. The labels came out different on every run of the same seed. I used `sample` + `dig` instead.
   This should be fixed in Deem, and `lookupUnique` should be checked for in data meanwhile.
5. **F5: `data/` is the page's bundle.** Anything written under `data/` ships to the web: `test/repository.test.ts`
   failed until the experiment moved to `test/fixtures/kx-1`. An experiment, or a third-party module, has no non-shipped
   home inside `data/`.
6. **F6: placing the kind across generated countries needs TS.** That needs a new `.kyrt` file, and each one is
   imported by name. An existing template could carry it as a new option without TS.

## 4. Proposed syntax: `shared` (prototyped)

```
Relation tunedTo(item, fact) shared.
Measure leanings(item) shared.
```

- A relation or measure marked `shared` keeps its name in every installation that declares it, as `data/rules` names
  do.
- Every module that declares it must use the same signature. A second declaration that differs is refused at install
  (`ModuleInstallations.agree`).
- The kind's own module declares the vocabulary and the action once. A module that lays its own instances declares the
  two shared lines and asserts facts in them.
- It is orthogonal: one optional keyword, no new declaration form.
- It is opt-in: nothing is shared unless the author marks it, so A7's default privacy stands.
- Changes: the grammar (two rules and a `shared` token), the parser (two actions), `Signature.shared`, the namespace
  constructor (two lines), and the install agreement check.

**Open risk:** two unrelated authors who choose the same shared name and signature are silently joined. This is the
same as with `data/rules` names, but there are more authors. A convention such as prefixing by the kind (`lodestar_…`)
or a lint would cover it.

Not extended to `Query` or `Action`, because the experiment did not need it.

## 5. Census: setting-specific coupling

These are rough grep counts; they were not audited. "Westernesse" here means the game and its setting: in code, the
Imbar canon, Dun Rì and the catalog.

| Layer (.ts files) | Direct imports of `data/` | Embedded defaults (examples) | Deeper assumptions |
|---|---|---|---|
| `src/lang` (46) | **0**. 3 files reach `src/canon` | `person-parser.ts:46` defaults to `raceId 'human'`, `classId 'commoner'`; ~5 prose literals | The grammar's words (`Ancestry`, `Calling`, `Species`, `Peaceable`, `Manner`, `worn as`) are a generic fantasy-RPG ontology, not Westernesse |
| `src/campaign` (70) | 3 files: `imbar/sky.json`, `imbar/calendar.json`, `catalog/plants.json` | `ModuleCanon.path = 'data/imbar/module.json'`, `imbar = 'imbar'`; `cast.ts` defaults to `'human'`; `single-module` default party (Ama, human warrior) | Every world installs the Imbar canon first; a module "in no plane" is taken to be in Imbar |
| `src/world` (125) | **52 files, 93 imports**: 83 of `data/generation` (33 `.kyrt`, each by name), `imbar/atlas`, `imbar/shape`, `adventures/countries.json`, `catalog/forms`, `challenge`, `gems`, `geology`, `origins`, `career` | 44 files emit Kyr from template literals (~329 lines, mostly filling prose from data); ~81 English prose literals. Accidental: `career.ts` hard-codes "Dun Rìerdan", "the Rì's", "the Llys", seat `'dun_ri'`; `world-assembler.ts:82` default company Elen, Bran, Dori; `community.ts:282` wanted `['rope','torch','lantern','crowbar','herbs']`; `deep-*` default calling `'warrior'` | The generator is Westernesse's world-builder: countries in Imbar, reeves, greens, quarters. `strategic-atlas.ts` says so itself ("this setting's words") |
| `src/presentation` (93) | 7 files, 8 imports: `imbar/sky.json` ×2, `voice/*.json` ×3, `paintings/emblems` ×2, `editorial/prose-lint` | ~94 prose literals (`action-feedback`, etc.); `company-preview.ts:32` hard-codes the skill list `woodcraft, lockwork, trapwork, …`; `glance.ts` reads `quantity(party, gold)` | Coin is `gold`; ~67 lines across 46 files of all layers name `'party'` |
| `src/ui` (67) | 6 files, 7 imports: `paintings/*` ×4, `generation/town/quarters`, `generation/scenes/tracts`, `voice/conditions` | `screen-model.ts:242–252` and `carried-flame.ts` hard-code `torch`, `lantern`, `candle`; `passages.ts:42` defaults the plane to `imbar`; ~33 prose literals | Light is three named catalog kinds, not a property of kinds |
| `web/` (81) | 1 file (`engine/creation.ts`): `imbar/sky.json`, `campaigns/companies.json` | `creation.ts:193–196` defaults to `'human'`, `'warrior'`, name `'Wenna'`; `creation-spells.ts:28,65` makes `'cleric'` mean "prayer" | Character creation assumes the catalog's callings |

**Mechanisms that are legitimately general:**

- the grammar and compiler (`src/lang`, which imports nothing from `data/`)
- `LocalKinds` and module catalogs
- module namespacing and import binding
- the Deem generation in manifests
- the `belongings` and `passages` item rules
- `ChoiceList` and the presentation of actions

The experiment went through every one of these without them knowing anything of the lodestar chip.

**Accidental Westernesse dependencies:** about 10 fixable sites. Most are defaults that should come from data:

- the Dun Rì prose in `career.ts`
- the default companies in `world-assembler`, `single-module` and `web/creation`
- `'human'` and `'warrior'` fallbacks (5 sites)
- the light kinds in `screen-model` and `carried-flame`
- the stock list in `community`
- the skill list in `company-preview`
- the `cleric` → "prayer" mapping

**Structural rather than accidental:**

- The Imbar canon wired into `ModuleCanon` and `region-writer` (`within imbar`).
- The 33 by-name `.kyrt` imports in `src/world`. They make every generated-world template a TS change. A manifest of
  templates read from data would remove this; it is a later effort.
- `gold`, `party`, and the closed item categories. These belong to the kernel's ontology rather than to the setting.
