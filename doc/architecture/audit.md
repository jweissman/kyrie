# Kyr architecture audit (Milestone A)

19 October 2026. A concept-level inventory of the repository, written before the consolidation work.
Companion documents: [ontology.md](ontology.md) (canonical vocabulary and authority) and
[migration.md](migration.md) (staged plan and classification). Counts come from parsing every `.kyr` file
([inventory script](../../bin/kyr-lint.ts), see `kyrie lint --inventory`) and reading the TypeScript.

## Scale of what exists

| Layer | Count | Notes |
|---|---:|---|
| Kyr source files | 42 | 15 rulesets (10 legacy, 5 world), 27 campaign, situation, site and experiment modules |
| Distinct relations, measures and queries | 196 | 42 are defined in more than one file; 46 exist only inside one campaign or experiment |
| Campaign manifests | 17 | 12 distinct worlds or demonstrations |
| Module bundles | 18 | Each with its own generation templates |
| DEEM template sets / table sets | 17 / 12 | The player party is defined in four different tables |
| Player clients | 6 | `player-app`, Folio, Wayfarer, Mono, workbench, parity harness |
| Golden histories (replay and save files) | 29 | Plus Serewater's two browser histories |
| Orsino backgrounds / imported into Kyr | 215 / 0 | Kyr's 3 "backgrounds" are invented campaign keys |
| Orsino gear items / Kyr item kinds | 67 / 12 | No Kyr item comes from Orsino's gear catalog |

## Concept inventory

Each row answers the ten questions in compressed form: meaning; definition site; authority; authoring; DEEM;
runtime; player; competing versions; actual use; verdict.

### Identity and physical existence

| Concept | What exists | Diagnosis | Verdict |
|---|---|---|---|
| **Entity** | `Entity id: kind "name"` ([module.ts](../../src/lang/module.ts)); identity is the id. There is no provenance, so it is unclear who set a name or whether a generator renamed it | Names are overwritten by bundle `labels` after authoring ([module-assembly.ts](../../src/campaign/module-assembly.ts) `labels`) | **Canonical**, add provenance |
| **Kind** | `Kind x` per module; flat, untyped, no hierarchy. `group`, `place`, `item`, `itemkind`, `member`, `stock`, `good`, `mechanism`, `hazard`, `door`, `passage`, `thing`… | `stock` (Serewater coin piles), `mechanism`, `hazard`, `door` and `thing` overlap: all are "physical objects with state" | Collapse to **thing** with states; **retire** `mechanism`/`hazard`/`door`/`stock` as kinds |
| **Physical object state** | Legacy: per-campaign flag predicates (`armed`, `triggered`, `obstruction`, `mounted`, `functioning`, `lockedDoor`, `openedDoor`, `intact`). World rules: one exclusive `state(thing, condition)` with authored transitions | Two incompatible models coexist | **Canonical:** `Thing` states/changes; **migrate** flags |
| **Item instance vs kind** | World entity `item` + `itemKind(item, kind)` + catalog `data/items.json` + creature inventory `{id, definition}` | Three names per object ("Nera's healing draught" / "Minor healing potion" / feedback "gains 1 Minor healing potion"). Ownership lives in `CreatureStore` (authoritative) and is copied into `ownedItem`/`wearing` facts | **Canonical:** one instance name (authored, otherwise the kind's name); creature store stays authoritative with a declared projection |
| **Goods and quantities** | `quantity(entity, good)` measure; coin also in creature purses (`state.gold`) reconciled by `CreatureFacts.commitMoney` | A declared projection, not a defect, but money appears in two places and the rule is undocumented | **Keep**, document as projection |
| **Containers** | None (`inside` relation declared in `spatial.kyr`, never used) | Missing content/feature | **Extension**, later |

### Space and geography

| Concept | What exists | Diagnosis | Verdict |
|---|---|---|---|
| **Place / containment** | `Place … is kind within parent` (typed tree, validated by [spatial.ts](../../src/spatial.ts)); legacy `district(place, districtkind)` + `townDistrict`… (Serewater, folio metadata) | Containment exists twice. District facts duplicate it | **Canonical:** `Place`; **retire** district facts |
| **Traversal** | Five models: `route(a,b)` facts (Serewater, Orra, crossing…), `footway`, `gate`, `hazardPassage`/`climbingPassage`/`informedPassage`, typed `Exit … from a to b by mode` (Greenhollow), and `Passage … between a and b` (world rules) | Traversal is authored as directional permissions in four of five models. Obstacles attach to one direction (the review's boar, counterweight and custodian) | **Canonical:** `Passage` (two-sided, kinds, duration); **migrate** the rest |
| **Scale and distance** | Every move is one 10-minute tick; typed `Exit` uses 1/6/12 by mode | Crossing a room and crossing a floodplain take the same time | **Add** passage kind and duration |
| **Map** | `PlayerView.map` (links from five relation names), Folio's map drawer, Wayfarer's board, Mono's SVG chart (passages + grid) | Projections disagree. Only Mono's comes from canonical passages | **Canonical:** chart from passages + containment, at two scales |

### People and creatures

| Concept | What exists | Diagnosis | Verdict |
|---|---|---|---|
| **Creature (mechanical body)** | `Creature` in [creature.ts](../../src/creature.ts): attributes, hp/mana, abilities, conditions, inventory, `backgroundId`. Built by the DEEM `creature` template | Sound core | **Canonical** |
| **Actor (who decides)** | `CampaignActor` (group of creature members, allowed actions, goals). Defined by DEEM tables (`marchControllers` in Serewater, Greenhollow and `sites/shared`; `orraCompany`…) or implicitly by `Person` | **Tables define the world model.** The player company is a table row copied into four files | **Canonical:** actor = `Person`/`Company` declaration; tables only supply distributions |
| **Person** | `Person id "Name" at place { Race. Class. Level. Uses. }` → group entity + generated creature. DEEM `casting` merges over it | Parser defaults (`human`, `commoner`) are indistinguishable from authored values, and **generation silently overwrites authored ancestry** (`{…authored, …casting}`): Serewater's Nera is written `Race human` and plays as a dwarf | **Fix precedence** (authored > generated > default) with provenance |
| **Ancestry / class** | `races.json` (11, 4 playable), `classes.json` (12 incl. monster classes). Orsino-adapted fields | Adequate | **Canonical** |
| **Background** | Kyr `backgrounds.json`: 3 entries (`forager`, `surveyor`, `pilgrim`) mapped by `capabilities.json` to Serewater puzzle keys (woodcraft, delving, burial lore) | Labels used as scenario keys. Orsino's 215 backgrounds (stats, gold, starting gear, required class) are not used at all | **Replace** with an overlay catalog adapted from Orsino |
| **Capability** | Party-level flag derived from class, race set, background or equipped item ([party-capabilities.ts](../../src/campaign/party-capabilities.ts)) | One mechanism, four sources, no provenance. Orsino's five exploration skills (examine, search, pick lock, disarm trap, gather information) are missing | **Canonical** as **skill**, granted by overlays, class and equipment, with provenance |
| **Condition** | Creature conditions (`statuses.json`, 8) for combat/body; world `state(entity, condition)` for people (pinned, hurt, guarding) | Two condition systems: body status (mechanical) and situational state (fictional). Acceptable if named distinctly | Keep both; call world ones **state** |
| **Goals and activity** | `Pursuit` (labelled) planned by [agency.ts](../../src/campaign/agency.ts); 7 of 8 Serewater NPCs have none | The mechanism is good; the content is missing | **Canonical**; give professions default routines |
| **Relationships / affiliation** | Ad hoc relations (`trusts`, `serves`, `grateful`, `supports`, `allied`) | No common vocabulary | **Extension**, later |

### Knowledge and interaction

| Concept | What exists | Diagnosis | Verdict |
|---|---|---|---|
| **Knowledge** | `knows(group, fact)`, `Discovery` with readable sources ([discovery.ts](../../src/information/discovery.ts)) | Coherent and the strongest part of the model | **Canonical** |
| **Readable content** | The discovery fact's text is what the player learns | Sources have a title but the player never sees "the document"; only the extracted fact | **Extend**: a source can carry its own text |
| **Observation / description** | `Observe id at/near/beside X when P "text"`; thing state descriptions | Legacy scene text mixes base description, flag-dependent changes and walkthrough instructions | **Canonical**: anchored claims; **lint** for engine commentary |
| **Event** | `Event` (once, anchored) → rule with `say`; NPC actions narrated by `Seen` | New; no reactions by witnesses | **Canonical**; add witness reactions later |
| **Action applicability** | Schemas grounded over every entity of a parameter kind (8,785 operators in Serewater) | `pay`/`give_food` to any group; attack anyone | **Retire** generic gifts; applicability through typed relations (offers, peaceable, eats) |
| **Topics** | `Topic … when P { Says … }`, optionally `once` | Fine | **Canonical** |

### Rules and mechanics

| Concept | What exists | Diagnosis | Verdict |
|---|---|---|---|
| **Abilities / effects** | `abilities.json` parsed by [Abilities.ohm](../../src/lang/Abilities.ohm); one executor for combat, field use, items, traps (traps run as a cloned "Hazard" fighter) | Sound executor; trap and rest content is hacky (`Heal 9999`) | Keep; replace rest content |
| **Time** | `watch(clock)`; one tick = 10 minutes; action `Time n` fixed per schema | No duration varies with distance | **Add** per-passage duration |
| **Food and rest** | `eat` action (sated flag, no consequence), `rest` at `restful(place)` costing a ration (Serewater: the inn *and the quay* are restful); `camp_recovery` heals 9999 | Rations matter only as a rest fee. `restful` is a scenario flag | **Replace** with daily meals, lodging service and camping |
| **Economy** | `buy` (goods, fixed 2 coins), `buy_item` (instance, `price`), `pay`, `salvage_coin`, commissions | Prices cannot be computed in Kyr (changes take only literal numbers), so `buy` hard-codes 2 coins and `buy_item` delegates to TypeScript | **Add** measure-valued changes; services as declared offers |
| **Combat** | One command resolves a whole fight; level 1 parties beat level 5 guardians | Pacing and danger content problem, not architecture | Deferred (unchanged in this program) |
| **Environment** | Per-campaign rules (`rising_water`, `rain_begins`) | Expressible now as a `Thing` on a passage with a timed event | **Migrate** |

### Generation and content

| Concept | What exists | Diagnosis | Verdict |
|---|---|---|---|
| **DEEM templates** | 17 sets; each bundle reinvents `*_actors`, `*_casting`, `*_purse`, `*_labels` | The same templates under different names | **Consolidate**: generation produces typed contributions (casting, labels, values) to declared entities |
| **DEEM tables** | Proper distributions (names, populations, seasons) mixed with world definitions (`marchCompany` holds the full player company; `orraCast`, `refugeCast`) | Tables are used as the world model | **Retire** world definitions from tables |
| **Orsino** | `doc/orsino-compatibility.md` is candid. Classes and ancestries adapted; backgrounds, gear, shop types, skills and traits unused | Depth is available but unimported | **Import** through overlays and a gear catalog |

## Dependency map

```
                      ┌────────────────────────── player clients ──────────────────────────┐
                      │  Mono · Folio · Wayfarer · player-app · workbench · parity harness │
                      └───────────────▲───────────────────────────────▲────────────────────┘
                                      │ ScreenModel / CombatModel     │ PlayerView, ActionFeedbackView
                                      │ (src/ui)                      │ (src/presentation)
┌──────────── session ────────────────┴───────────────────────────────┴──────────────────────────┐
│ PlaySession (transcripts, replay) → Campaign (atomic commands, ticks, NPC agency, rules,      │
│ events, saves) → World (facts, measures, queries, solver) + CreatureStore (bodies, purses,     │
│ inventory) ⇄ CreatureFacts (declared projection) → Battle / FieldUse / Items (effect executor) │
└───────────────▲───────────────────────────────────────────▲───────────────────────────────────┘
                │ grounded operators, rules, observations    │ creatures, actors, goals
┌───────────────┴──────── language ──────────────┐  ┌───────┴──────── generation ──────────────┐
│ Kyr.ohm → ModuleParser → WorldConstructs        │  │ DEEM templates + tables → Content        │
│ (lowering) → ModuleCompiler (validate) →        │  │ (creature constructor) → bundle manifest │
│ ActionSchemas (grounding) → ModuleNamespace     │◄─┤ (casting, labels, initial values)        │
│ (installation scoping) → ModuleInstallations    │  └───────▲──────────────────────────────────┘
└───────────────▲─────────────────────────────────┘          │ adapted catalogs
                │ rules + world modules                      │
┌───────────────┴─────────── content ───────────────────────┴─────────────────────────────────┐
│ rulesets (legacy 10: adventure, dungeoneering, spatial…; world 5: core, passages, people,   │
│ care, belongings) · catalogs (races, classes, abilities, statuses, items, backgrounds,      │
│ capabilities) ← Orsino (partial, by hand) · sites · situations · campaign manifests         │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

The arrows that should not exist, and do:

1. **Generation → identity.** DEEM `casting` overwrites authored `Person` fields.
2. **Tables → actors.** Player companies and NPC controllers come from table rows.
3. **Campaigns → rules.** 46 relations live only inside one campaign. Several (`closesAt`, `rescued`) are
   redefined with different signatures in different campaigns.
4. **Catalog → scenario.** `capabilities.json` maps backgrounds to one campaign's puzzles.
5. **Client → semantics.** `PlayerView.map` and `Passages` hard-code the names of legacy route relations to draw
   maps.

## Duplication report

- **Same name, same meaning, defined twice** (harmless but noisy): `able`, `dead`, `at`, `distinct`, `closed`,
  `quantity`, `watch` in `adventure.kyr` and `world/core.kyr`, plus all of `items.kyr` / `belongings.kyr` and
  `fieldcraft.kyr` / `care.kyr`. The world copies exist because the legacy rule text explains implementation and
  cannot change without breaking recorded histories.
- **Same name, different meaning:** `hostile(group)` vs `hostile(group, group)`; `carrying(person, item)` vs
  `carrying(group, good)`; `closesAt(entity)` vs `closesAt(pressure)`; `supplied` as a relation in one module and
  a query in two others.
- **Different names, same meaning:** the five traversal models; `trapped` / `restrainedBy` / `pinned`;
  `armed` / `rotten` (dangerous state); `released(keeper)` / `state(hound, calm)`; `district` / containment;
  `marchCompany` / `orraCompany` / the `sites/shared` copy.
- **Redundant generators:** 17 template sets each containing an `*_actors` template that does the same thing.
- **Unused definitions:** `inside`, `searched` (written, never read), `soldRecord`, `deliveredBearing`,
  `recorded` outside pressures, the `module` / `adventure` default templates outside the crossing experiment.

## Diagnosis by category

**Architectural defects:**

- Authored identity can be overwritten by generation.
- Tables serve as the actor model.
- Multiple traversal models.
- Durations cannot vary.
- Changes cannot use computed amounts.
- There are no quantified rules, so nothing can apply "to every company".
- Campaign-local redefinition of rule vocabulary is not detected.

**Missing content:**

- Orsino backgrounds, gear, shops and skills.
- NPC goals.
- Services.
- Daily needs.

**Missing authoring conveniences:**

- Shops and services.
- Professions on people.
- Passage kinds and durations.
- Containers.
- Readable documents.

**Ordinary bugs** (several fixed in earlier increments):

- Escort from home.
- One-directional obstacles.
- Item names drifting.
- Contradictory scene text.

## What to retain, extend, replace or deprecate

| Retain | Extend | Replace | Deprecate (keep for legacy fixtures) |
|---|---|---|---|
| World/fact runtime, atomic commands, replay, transcripts, CreatureStore, effect executor, discovery, agency planner | Entity provenance; passage kinds and durations; quantified rules; measure-valued changes; services; overlays; readable sources | Background keys → Orsino overlays; `restful` → lodging and camping; capability lists → skills with provenance; table-defined actors → declared people and companies | `route`/`gate`/`hazardPassage`/`climbingPassage`/`informedPassage`/`footway`; `district`; `trapped`/`rescued`/`escort`; `pay`/`give_food`/`eat`/`buy`; legacy rulesets (`adventure`, `dungeoneering`, `spatial`, `items`, `fieldcraft`, `expedition`, `affinities`, `site-capabilities`) |
