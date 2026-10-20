# Checkpoint A: repository audit and disposition

19 October 2026, against commit `fbd3741`. This document proposes the target organization of `data/`. Nothing has
been moved yet. Section 7 lists the decisions that need review before the destructive steps.

## 1. What `data/` contains today

Twenty-two directories and one loose file. "Loaded by" is the code path that actually reads it. Tests are counted
separately because many directories are read only by tests.

| Directory | What it actually is | Loaded by | Status | Name accurate? |
|---|---|---|---|---|
| `canon/` | 13 canonical catalogs (ancestries, species, classes, traits, …) | `src/canon/canon.ts` only | active, authoritative | Partly. It is the fantasy catalog; "canon" says how authoritative it is, not what it contains. |
| `orsino/` | Registry snapshot (1.7 MB), support table, ledger | `src/registry`, `bin/orsino-registry.ts`, tests | active tooling | Yes, but it reads like a second content source. |
| `legacy/` | Quarantined catalog entries for old campaigns, plus the frozen ability order | `src/canon` (always loaded) | fixture support | Yes. It is always loaded, so it is not actually isolated. |
| `default/` | DEEM tables and templates. Half is **load-bearing for every creature**: the `creature` and `attributes` templates, forenames, populations. Half is the crossing demo's adventure generator. | `src/content.ts` | active and legacy, mixed | No. It is neither "default content" nor a test bed. It is creature construction plus a demo. |
| `rulesets/` | `world/*.kyr` (8 canonical rule modules) and `discovery.kyr` (canonical), plus 10 legacy rulesets (`adventure`, `dungeoneering`, `spatial`, `items`, `fieldcraft`, `expedition`, `affinities`, `site-capabilities`, `ecology`, `devotion`) | module manifests | mixed | No. Canonical and legacy rules sit side by side. |
| `sites/` | Reedwake (settlement **and** dungeon in one module), Skellfold (village **and** quarry), Thrale (village, gorge **and** crag) | manifests | recommended | Partly. Each "site" is a whole small region. |
| `situations/` | `caught-below` and `dragon-roost` (canonical), `trapped-traveler` and `founding-charter` (legacy rules, installed only by Greenhollow) | manifests | mixed | Yes, but the legacy two are not portable to canonical sites. |
| `caught-below/` | Two campaign files (river, quarry) | lint, Mono client, tests | recommended | No. It is named after a situation but holds campaigns. |
| `red-crag/` | One campaign file | lint, tests | recommended | No; same problem. |
| `modules/` | Three Kyr experiments: `crossing.kyr` (redefines `at`/`quantity`), `living-crossing.kyr`, `pantry.kyr` | `src/campaign/modules.ts` (CLI `play`, `adventure`, `module*`), bundles | legacy demo | No. "Module" is the general composition unit, not a folder of three experiments. |
| `bundles/` | Manifests that package `modules/` crossing and pantry as campaigns | tests, workbench | legacy demo | No. "Bundle" means the same thing as module. |
| `experiments/` | `resource-gate.kyr`, `npc-goals.kyr` and DEEM gate tables | `src/experiments/resource-gate.ts`, 2 tests | experimental | Yes, but there is no retirement policy. |
| `ecology/` | DEEM habitat palette tables | 1 test | experimental | No; looks like an ecology catalog. |
| `serewater/` | **The richest authored world**: 38 places on three dungeon levels, 9 people, salvage permit and flood pressures, traps, a secret stair, the Keeper of Names tradition | Folio client (`index.html`), Mono, tests (golden histories) | legacy fixture | Yes. |
| `orra/` | Saint Orra: refuge accusation (Mere, Tamsin, the sick child, poisoned spring) and tower expedition (Ys, the silver siphon, a she-wolf); 3 campaigns, "player" variants | Orra client, tests | legacy fixture | Yes. |
| `frontier/` | Saint Orra's northern margin (Tala, Frostback the altered wolf, the winter ice-pump, the frost line) | tests, recorder | legacy fixture | No; it is part of Saint Orra. |
| `blackvein/` | Mining town: deed dispute (Caldus), forewoman Ada, rising water, the buried bell, 11 places | workbench, tests | legacy fixture | Yes. |
| `greenhollow/` | Apothecary house above older halls, ferry hamlet, Veyra's house; installs the two legacy situations | Wayfarer client, tests | legacy fixture | Yes. |
| `sanctuary/` | One porch, one hall, a founding charter (source of `founding-charter`) | workbench, tests | legacy fixture | Yes. |
| `discovery/` | Glass Orchard: knowledge, sources and trusted reporting | workbench, tests | legacy fixture | Mostly. |
| `client-study/` | A cut-down Censer Hill used to compare clients | recorder, 1 test | legacy fixture | No. |
| `party-examples.json` | Default companies for four clients | web clients | active | Acceptable. |

### Duplicate authority found

1. **Two Censer Hills.** `serewater/` (legacy, rich) and `sites/reedwake` (canonical, about a third of the
   content). Both are playable as "the Serewater March" from different clients.
2. **Two rescue situations.** `trapped-traveler` and `caught-below`.
3. **Two rule stacks.** Canonical `rulesets/world/*` and the legacy `adventure`/`dungeoneering`/`spatial` stack.
4. **Region, settlement and site fused into one module** in all three canonical "sites", so nothing can be reused
   separately: Reedwake's town cannot be reached without its dungeon.
5. **Creature construction split from the catalog.** Hit points and attributes are generated in
   `default/templates`; species statistics live in `canon/species.json`.
6. **Campaign files organized by situation** (`caught-below/`, `red-crag/`).
7. **Every module manifest repeats the same nine rule paths.**
8. **Seven client entry points.** `index.html` (Folio, Serewater), `mono.html` (Caught Below), `wayfarer.html`
   (Greenhollow), `orra.html`, `folio.html`, `workbench.html`, `parity.html`. Only Mono runs canonical content.

## 2. The four concerns, kept apart

| Concern | Where it lives in the target | Not expressed by |
|---|---|---|
| **Content kind** (rules, catalog, region, site, situation, institution, campaign) | The top-level directory under `data/` | — |
| **Composition** (packaging, import, binding, installation) | One `module.json` per module directory. The campaign file lists installations. A module is *any* directory with a `module.json`. | A folder named `modules` or `bundles` |
| **Authority** (recommended, active, experimental, fixture, archived) | A `status` field in each module and campaign manifest, checked by lint. Fixtures and archives also live outside the authoring tree. | Directory names alone |
| **Provenance** (Orsino-derived, Kyr-native, generated, campaign-specific) | `source` on each catalog entry (already); a `source` line in module manifests | Prefixes in identifiers |

## 3. Target layout

```
data/
  README.md            what each directory is for, and where to start
  catalog/             the canonical fantasy definitions (was canon/), plus creature construction (from default/)
  rules/               the canonical rule modules (was rulesets/world/*, discovery.kyr)
  regions/             regions: settlements, wilderness and the routes between sites
  sites/               physical places: rooms, passages, inhabitants, things, hazards, discoveries
  situations/          portable conflicts with roles, pressures, developments and outcomes
  institutions/        persistent organizations: members, holdings, obligations, relationships
  campaigns/           compositions: which region, sites, situations and institutions, and the starting company
  sources/orsino/      Orsino import machinery: registry, support table, ledger (was orsino/)
  fixtures/            frozen material for regression tests, each with its own README and retirement condition
    legacy-catalog/    (was legacy/)    legacy-rules/ (legacy rulesets)    serewater/ orra/ … (legacy campaigns)
    experiments/       (was experiments/, modules/, bundles/, ecology/, the crossing half of default/)
```

- **`catalog`, not `canon`.** The directory says what it contains. Authority is stated in its README and enforced by
  the compiler.
- **One module system.** A region, site, situation or institution is a directory with a `module.json`. The manifest
  keeps its current fields (`rules`, `globals`, `imports`, `roles`, `exports`, `generation`), with two small
  additions:
  - `rules: ["world"]` names the canonical rule set in one word.
  - `status` records the module's authority.
- **Fixtures are compiled in a compatibility context.** The legacy catalog and legacy rules are loaded only when a
  manifest declares `"compatibility": "legacy"`. Recommended modules then *cannot* resolve a legacy identifier: the
  compiler stops it, not just lint.

## 4. Disposition of every directory

| Now | Disposition | Destination | Dependencies and risks |
|---|---|---|---|
| `canon/` | **Retain, rename** | `catalog/` | Import paths in `src/canon`; web bundle rebuild. |
| `default/` | **Split** | creature, attribute, forename and population tables → `catalog/generation/`; crossing and adventure templates → `fixtures/experiments/crossing/` | `Content` loads both today. Golden histories depend on identical DEEM output, so the move must not change tables. |
| `orsino/` | **Retain, rename** | `sources/orsino/` | Registry CLI, tests, report paths. |
| `legacy/` | **Isolate** | `fixtures/legacy-catalog/`, loaded only in compatibility context | `Content.abilities` currently includes legacy entries for everyone. The compatibility context must be threaded through campaign loading. |
| `rulesets/world/*`, `discovery.kyr` | **Retain, rename** | `rules/` | Every canonical manifest; authoring guide test. |
| `rulesets/` legacy ten | **Isolate** | `fixtures/legacy-rules/` | Every legacy manifest path. |
| `sites/reedwake` | **Split and reconstruct** | `regions/serewater-march` (Reedwake town, floodplain, routes) and `sites/censer-hill` (merged with Serewater's three levels) | Caught Below river campaign, command-contract tests, Mono default. |
| `sites/skellfold` | **Split** | `regions/skellfold` (village, beck lane) and `sites/skellfold-quarry` | Caught Below quarry. |
| `sites/thrale` | **Split** | `regions/thrale-highlands` (Thrale, gorge, pastures) and `sites/red-crag` | Red Crag tests and histories. |
| `situations/caught-below`, `dragon-roost` | **Retain** | `situations/` | — |
| `situations/trapped-traveler` | **Retire** | `fixtures/greenhollow/` (only Greenhollow installs it) | Superseded by Caught Below. |
| `situations/founding-charter` | **Reconstruct** | `institutions/` and `situations/` (see §5) | Greenhollow fixture keeps its copy. |
| `caught-below/`, `red-crag/` | **Merge** | `campaigns/` | Lint list, clients, tests, recorders. |
| `modules/`, `bundles/` | **Archive as fixtures** | `fixtures/experiments/crossing/` | `src/campaign/modules.ts` imports them; CLI `play demo`, `adventure`, `module*` and the crossing tests depend on them. |
| `experiments/`, `ecology/` | **Archive as fixtures** | `fixtures/experiments/` | `src/experiments/resource-gate.ts`; 3 tests. |
| `serewater/` | **Reconstruct, then freeze** | Fiction recovered into region, sites, situations and an institution (§5). The original goes to `fixtures/serewater/` for its golden histories. | Recorded transcripts store `"scenario": "data/serewater/campaign.json"`; they need a path rewrite (presentational) or a resolver alias. |
| `orra/`, `frontier/` | **Freeze; partial reconstruction later** | `fixtures/saint-orra/` (both merged) | Orra client; 3 tests; transcript paths. |
| `blackvein/`, `greenhollow/`, `sanctuary/`, `discovery/`, `client-study/` | **Freeze as fixtures** | `fixtures/<name>/` | Workbench, Wayfarer client; transcript paths. |
| `party-examples.json` | **Retain** | `campaigns/` (it is starting-company data) | Four clients. |

**Fixture lifecycle.** Each fixture directory has a README stating what it guards, which tests read it, and when it
may be deleted. For example: "delete when Serewater's golden histories are re-recorded against the reconstructed
Serewater March, or after the next release". Fixtures receive no new content. `experiments/` follows the same rule;
an experiment either graduates into `rules/` or `catalog/`, or is deleted.

**Clients.** Mono becomes the single recommended client and opens the reconstructed Serewater March by default.
Folio, Wayfarer and the Orra page stay only while their fixtures are referenced. No client rewrite is planned.

## 5. What each substantial work contributes

| Work | Worth preserving | Reusable elements | Scaffolding to remove | Fixture or archive |
|---|---|---|---|---|
| **Serewater March** | Reedwake on the flooding Serewater; Censer Hill's foundry, flood refuge and ossuary on three levels; Nera the outfitter; Iven and the Keeper of Names; Edda's expiring salvage permit and the bronze bearing; Pell the surveyor; the Mortuary Custodian, who honours a funerary mandate; traps of an old works (counterweight, preservative vapour, burial shutters); the concealed stair; the lantern of names | **Region** Serewater March. **Site** Censer Hill (full depth). **Situation** "Salvage against the dead": a licensed salvager, a keeper of the dead and a guardian with a mandate, under a permit deadline. **Institution** Keepers of Names (shrine, registers, writs, the Custodian's mandate). **Encounters** the cave hound, the boar, the Custodian. | `route`/`gate` traversal, flag objects, `districtkind`, global trap abilities, puzzle backgrounds (surveyor, pilgrim, forager), `fellowship` as a skill | Original kept for its two golden browser histories, then retired |
| **Caught Below** | Already canonical | Situation (installed twice) | Rescue-specific `closesAt` stays local | — |
| **Red Crag** | Already canonical | Situation and site | Region split from site | — |
| **Saint Orra and the margin** | A false accusation against a worker; a poisoned spring traced to firing scavenged silver; a missing healer below a drowned tower; an altered wolf; a winter shrine whose ice-pump freezes a camp | **Situation** "A wrongful accusation" (accuser, accused, true cause, evidence). **Situation** "A process out of control" (the siphon, the pump). **Site** the drowned watchtower. | Player-variant modules, campaign-local `closesAt`/`rescued`/`supplied`, `fellowship` access | Fixture now; the accusation is the next reconstruction after §6 |
| **Blackvein** | A mine town's deed dispute; a forewoman protecting workers; rising water; the buried bell | **Institution** the mine company and its deed. **Site** the minehead and pumping gallery. | Directed routes, places outside the containment tree | Fixture |
| **Greenhollow** | An apothecary above older halls; the seed-register vault; Veyra's roadside house | **Site** Hearthleaf house. Organisms and habitats (already catalogued). | Legacy rules, legacy situations | Fixture |
| **Sanctuary / founding charter** | A keeper who misreads a founding obligation | **Institution** with an obligation and a charter (the first institution test) | Bolt-specific rule | Fixture |
| **Glass Orchard** | Mirror prisons; knowledge from sources | Discovery rules (already canonical) | — | Fixture |
| **Client study** | — (a cut-down Censer Hill) | — | — | **Retire** when its test is replaced |
| **Crossing, pantry, gate, NPC goals** | Planner and generator experiments | — | Redefines canonical relations | Archived fixtures |

## 6. Execution plan after review

- **B1. Mechanical moves**, with path updates only: `catalog`, `rules`, `sources/orsino`, `fixtures/*`, `campaigns`.
  The whole suite must pass unchanged. Transcript scenario paths are rewritten, which is a recorded presentational
  change.
- **B2. Compatibility context.** Legacy catalog and rules are loaded only for manifests that declare it. Recommended
  modules fail to compile against legacy identifiers.
- **B3. Splits.** Regions are split from sites (Serewater March, Skellfold, Thrale highlands). Sites bind to their
  region through manifest imports; Caught Below and Red Crag keep working.
- **B4. Reconstruct the Censer Hill site** at full depth from Serewater, plus the **Keepers of Names** institution
  and the **"Salvage against the dead"** situation. Install the situation in Censer Hill *and* in Skellfold's quarry
  to prove portability.

  **Status (19 October 2026).**

  - **B1:** done. Legacy deletion replaced B2 by user decision, so `fixtures/` was not needed.
  - **B3:** done for the Serewater March only. `regions/serewater-march` is now separate from `sites/censer-hill`.
    Skellfold and Thrale still combine region and site in one module.
  - **B4:** done.
    - Censer Hill has three levels and five hazards, including the counterweight, the kitchen vapour and the
      shutters.
    - The Custodian honours the keepers' writ, and the concealed stair needs the lantern.
    - The chalk fault is learned and remembered.
    - The boar on the low path adds a woodcraft or ration approach.
    - `institutions/keepers-of-names` and `situations/salvage-rights` are installed in
      `campaigns/serewater-march` and `campaigns/skellfold`.
  - **Language and rule fixes found while authoring:**
    - an authored offer survives the writer round-trip;
    - `climb` is a passage kind;
    - a guardian can be reached from either end of its passage;
    - a module may reveal a fact that an earlier installation establishes;
    - duplicate-name errors say which name.
- **C. Mechanics.**
  - Creatures get a separate kind and calling (no more species id in both fields).
  - Orsino classes and chassis, ancestry modifiers, hit dice and proficiencies.
  - Spell *selection*.
  - Accuracy and armour class.
  - Explicit tactics tie-breaking.
  - Histories are re-recorded where they encoded wrong rules, with a change log.
- **D.**
  - Expand coverage by mechanical family.
  - Make the reconstructed Serewater March the integrated example, played in Mono and recorded.
  - A cold authoring exercise against the docs.

## 7. Decisions needing review

1. **Classes.** I propose adopting Orsino's seven classes (warrior, mage, thief, cleric, bard, ranger, monk) with
   their real chassis as the canonical classes. Kyr's `fighter` and `magic_user` would become aliases of `warrior`
   and `mage` that resolve to Orsino mechanics, not compatibility copies. `commoner` stays as Kyr's non-adventuring
   calling. Every canonical history (Caught Below, Red Crag, command contract) will be re-recorded.
2. **Serewater.** I propose that the reconstructed Serewater March *replaces* both the legacy Serewater campaign and
   the Caught Below river campaign as the integrated example. Caught Below remains a situation installed there. The
   legacy original becomes a fixture until its golden histories are retired.
3. **Fixtures' lifetime.** I propose keeping the legacy campaigns replayable as fixtures for now, each with a stated
   retirement condition, rather than deleting them in this milestone.
4. **Directory names.** `catalog/` (not `canon/`) and `sources/orsino/` (not `orsino/`), as above.
