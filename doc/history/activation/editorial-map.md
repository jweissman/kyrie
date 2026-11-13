# Editorial map of the corpus

*11 November 2026. A lightweight, mostly read-only survey, ranked, with each opportunity marked **done on this branch**, **proposed**, or **left alone**. The reproducible numbers are in [census.md](census.md) (`bun scripts/activation-census.ts`); this page is the judgment.*

## 1. What exists, and how far each kind gets

The five stages the commission names, collapsed to what each kind of content can actually reach:

| Content | Authored | Loadable | Installed / eligible | In a generated world | Discoverable in play | Actionable |
|---|---|---|---|---|---|---|
| **Authored adventures** (`data/adventures`) | 27 directories, about 75,000 lines of Kyr in top-level files (Book of Faces 12,131; Gosse's Company 6,363; Quittance 6,164 …) | all 27 | **all 27 are provinces of every first country** (`countries.json`) | all 27 in every sampled world | each has a spoken *rumour*; five also have a posted *notice*; ten say how the talk goes *after* | by their own design; the first-hour reference (M20) only exercises the debt and the first town's jobs |
| **Scenarios** (`data/scenarios`) | 12 manifests | library + standing + heralds + city-bound | 8 library, 1 standing (circus), 3 heralds (factors, players), 1 city-bound (`hessel-quarrel`) | 3-4 of 8 fit-and-placed per country (three draws) | a hook per scenario, told by a named teller | yes (dens, tower, drover, fever, oldcoin, quarrel, disputation) |
| **Works** (`data/generation/works`) | 14 plans + a section library (`riddle-door`), 1 added here | registered in `region-works.ts` | by an art, a successor kind, or `imperial` | `keep` 6/6 and the new posting-house 6/6 seeds; singing halls, cisterns, galleries 2/6; **the great watch-tower 0/6** | a hook per plan, a view from a height, an aim when named | rooms, things, people |
| **Creatures** (`data/catalog/monsters.json`, `animals.json`) | 146 species (54 + 81 + others) | all | den / open / deep paths decided from habitats + abundance | 56 met in 6 sampled worlds; 34 more eligible but unmet (sample size, rarity) | by ordinary play | combat, negotiation, avoidance |
| **Paintings** (`assets/bg` → `assets/portraits` → registry → `scenery.json`) | 207 backgrounds | 149 imported as `scene-*` and 148 mapped when this work began; **199 imported and 184 mapped after its one batch (the owner’s newest seven, and the auditorium, are left for the batch M20 is placing)** (the registry is 1,026) | a kind or a place maps it (hash-picked) | shown for a place whose name says its kind | on the page | no |
| **Items** (`data/catalog/items`) | 372 records in 7 files | all | **the catalog is the loot table** (`LootTables`): everything with `drops` not false, by worth | loot draws from it | by looting/shops | yes |
| **Abilities and spells** (`data/catalog/abilities.json`) | 26 records | all | named by a class, species, item, rule or adventure | by use | by use | every one is named somewhere: the four named only by an adventure (`pratfall`, `reversal`, `detonation`, `hornet_swarm`) belong to the circus and the Book of Faces |

**The finding that matters:** *nothing authored is stranded at the "installed" stage.* The corpus is dense, loaded, and placed. What is thin is the **middle**: whether a player *reaches* a thing, *knows* it matters, and finds something *beneath* it. That is where this branch worked.

## 2. Highest-value opportunities, ranked

| # | Opportunity | Evidence | Status |
|---|---|---|---|
| 1 | **The Empire is absent from a first country.** The setting's most important historical fact has no place in the world a new player lives in. | works: 5 pre-imperial arts + 3 successor kinds, no Aenean; the history ledger (`doc/imbar/02-history.md`) already says Aenean surveyors catalogued older works and wrote law about them | **done**: the posting-house (`roadstation.kyrt`, `imperial` in `arts.json`) |
| 2 | **The first town's two places to look at were shallow** (a steward and a wisp-fight). | `outskirts.kyrt`: 5 + 5 rooms, 1 person, 0 documents | **done**: `outskirts-deep.kyrt` (kitchen, cellar, muniment room, undercroft; four named people; a legal quarrel; a tunnel) |
| 3 | **The scholar with old coin has nowhere to go.** The `oldcoin` scenario places a one-room ruin; the only work with an inside that fits it cannot be claimed (scenarios take only non-work sites). | `oldcoin.scenario.json`; `world-assembler.ts` (`!w.work`) | **proposed**: request R5 |
| 4 | **A verbal tic.** *"Nobody has … in living memory"* ends 154 files, 258 times; the work plans write one per plan as their objective. | `grep -r "nobody has" data` | **left alone** (rewriting the 13 plans' objectives is a bounded editorial task; the new files avoid it) |
| 5 | **Works' social life is monsters.** `present` groups across the older plans: wolves, revenants, ghouls, elementals, a wyvern, wisps, a golem, rats, frogs, plus smugglers, lookouts, a hermit. Nearly every person-group is a threat. | `grep -ho "Species" works/*.kyrt` | **done for the new plan** (carters, a lamp-keeper, a copyist: peaceable and speaking); **proposed** for older ones: a peaceable option per plan |
| 6 | **A plan named but never written.** `arts.json` names a `weir` plan for the Water-Wardens that does not exist; the draw ignores it. | histories draw filters `this.plans.has(p)` | **proposed**: write it (a weir and sluice-house: a natural second water work) or delete the name |
| 7 | **Every work gets a riddle door** whatever it is (40% on any `{w}_in`). An Aenean road-house with a "speaking door" is wrong. | `region-riddles.ts` | **worked around** (entry passage named `{w}_front`); request R3 |
| 8 | **Three liberties with the same device** (customary, ecclesiastical, Aenean). | `doc/imbar/01-audit.md` | **left alone** (editorial: differentiate when touched) |
| 9 | **Contradiction between two adventures on who built the black stone** (Low Water vs the Grand Tour / Book of Faces). | `doc/imbar/01-audit.md` §1.4, resolved in the ledger as "Aeneans found, learned to start, fenced" | **left alone** (the ledger's resolution is respected; the posting-house is written consistently with it: Aeneans surveyed and kept what they did not make) |
| 10 | **Weak scenes repeating motifs:** "as big as cats/dogs" (5 files), "pale lights … go round" (4), "in the old script" (45 hits). | grep counts in the working notes | **left alone**; one instance removed from this branch's new rooms |

## 3. Retire, consolidate, rewrite

| Material | Recommendation | Why |
|---|---|---|
| `weir` (name in `arts.json`) | write or delete | a dangling reference |
| The older works' objective lines ("Nobody has …") | rewrite as `--- aim` variants, three each | the tic; they are the line the player sees most |
| `hold-one-season`, `the-third-night` campaigns | check they still load; likely fold into their adventures | legacy standalone campaigns ("legacy; see M19-75"): 28 of 28 load, but only as a preset-party scaffold |
| Scenario `hessel-quarrel` | leave | city-bound (`cities.json`); placed only when Hessel is entered, which the census's first-country sample cannot show |
| The island fauna (17 animals) | **keep dormant** | each record says so: "No habitats are written … it lives on the Isle of Sarn alone"; the creatures are a closed ecology for one scene. *(A first attempt to activate `pass_marmot` was reverted on reading its record.)* |
| `ruins-arcology`, `ruins-installation`, `ruins-starship`, `ecumenopolis`, `floating-disk` paintings | **keep dormant** | held for the arcology expedition; not Aenean; never a generic ruin |

## 4. Where behaviour lives in TypeScript that an author would write

See [kyr-deem-requests.md](kyr-deem-requests.md) §B. In short: the *prose* of generated places is already data; what is TypeScript is the **selection** (which section for which place) and the **composition** (what holes a template gets). Two migrations were made and tested; twelve narrowly specified requests are listed with reproductions.

## 5. What stayed untouched

The M20 opening, `first-hour` quest guidance, the undertown, `errands`, `teachers` and the generated townsfolk. The posting-house is invisible to every existing consumer of "the country's works" (the first town's origins, fellows, meetings, rumours, traffic, founding, outskirts view): each was patched to skip `imperial` works, so a world's first hour differs from `main` only where it should, in the new rooms.
