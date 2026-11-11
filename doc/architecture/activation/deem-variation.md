# Deem variation: what a template can express, and an institution drawn across the towns

*11 November 2026, branch `adventure/p2-deem`. Data first: no TypeScript changed. What was tried, what was built in Kyr and Deem JSON alone, how it was checked, and what could not be done (requests R47 to R55 in [kyr-deem-requests.md](kyr-deem-requests.md)).*

## 1. How the pieces fit

A generated country holds scenarios by four steps, each of which varies something:

1. **`WorldAssembler.settle`** (`src/world/world-assembler.ts`) draws, from the library, which scenarios a country gets: an adventure round (three) and a town round (two), a weighted Deem `select` over the scenarios whose `context` fits the country; then the *standing* scenarios (`data/scenarios/standing.json`) every first country holds, placed last. Each is `place`d: its `places` are bound to real sites and settlements (`site`; or `settlement` as `any`, `largest`, `along:role`, `near:role`, `toward:side`; or a `way`). Only here is a *town* chosen. A manifest cannot say how many towns, only name roles.
2. **The module's Deem** (`generation` in its `module.json`: `tables.json`, `templates.json`) is generated once when the module installs, from the context the assembler gives it (`terrain`, `ancestry`, `domain`, `folk`, `townName`, `taken`, and for a site the den's `beast…`) and the manifest's own `context`. Its output is a fixed shape (`SituationManifest`, `module-assembly.ts`): `casting` (who each declared Person is: folk, calling, name, level, variations, count), `labels` (a new name for any declared entity), `facts` (any relation asserted at the start, with the entity ids it names), `initial` (measures), `outcomes`. That is all it can say.
3. **The module's Kyr** (`situation.kyr`, any number of files) is written by hand and entirely present whatever was drawn.
4. **Hooks** spread word of the scenario from its first place and a road neighbour.

A `.kyrt` template (`data/generation/town`, `works`, `wild`, `deep`) is a different mechanism: TypeScript chooses its sections for a *place* of the region and writes the filled Kyr into the region module. A module's Deem cannot reach one (R51).

So variation is **branching on facts**: an author writes every alternative in Kyr, guards each by a relation, and the Deem draw asserts which hold. The fellowship below is that pattern pushed as far as it goes.

## 2. What a template can do: answered by trying it

Each row was tried in `/tmp` spikes or in the fellowship/den themselves (a spike scenario placed in a real country, loaded with `Campaign.load`, read back through the world). "Fellowship"/"den" means the shipped data does it.

| Can a Deem template…? | Answer | Evidence |
|---|---|---|
| …cast a declared person by folk, calling, name, level | **yes** | the fellowship's six people; the den's leader (`level` 3, a captain) |
| …cast a different number of people | **no** | a casting for an undeclared Person: `Generated casting names an undeclared Person`. *Worked round:* declare the most, park the rest in a room called Nowhere with an `at` fact (the fellowship's dead keeper and its unused apprentice; the den's absent leader) |
| …choose which of several authored branches holds | **yes** | `facts`: `lapse(keeper, c_sold)` etc.; every Kyr topic, action and observation that matters is guarded by one |
| …move a person or an item to a drawn place | **yes** | an `at` fact replaces the Kyr `at` (`at` is exclusive): the three officers are a permutation of the three halls (6 of 6 permutations in 300 draws); the den's finds lie in Nowhere until one is moved in |
| …draw without replacement | **yes** | `sample(concat('hall_b','hall_c','hall_d'), 3)`; `lookupUnique` also exists |
| …put drawn prose in Kyr text | **yes, by label** | `labels` renames *any* entity, a Place or a fact as well as a person, and `{id}` in Kyr text is its name. The fellowship's name (`the Guild of Salters`), its nouns (`the guildhall`, `the barracks`, `the chapter-house`), the roll's page and the shopkeepers' answers are all labels. One string each; not usable in `Role`/`Description` |
| …put one drawn number in a measure and in text together | **yes** | `_price` is `2d6 + 8`; it is the tally's `tally_price` and, in the shopkeeper's label, "16 coin" |
| …depend on the country | **yes** | `terrain` picks the kind of fellowship and its names (`fellowshipKind`), `domain` the chapter's emblem, `folk` limits callings to what the folk can be (a dwarf cannot be a mage: seed `s19` failed to load until `fellowshipClass` said so) |
| …depend on each bound town, not only the first | **no** | `WorldAssembler.folk` gives `folk` and `townName` of one settlement (R48) |
| …choose the *kind* of item a declared item is | **no** | `items` in the manifest refuses any item the author declared (R52). *Worked round:* declare every candidate in Nowhere, move the drawn ones in |
| …add rooms, passages, topics, actions | **no** | only the five output fields above exist; the author declares all of it (R51) |
| …assert a relation on a module's own nested room | **no, oddly** | `hushed(hall_b)` is refused; `at(x, hall_b)` and a relation on an own top-level room are not (R53) |
| …make two instances of one scenario differ | **no** | `den` and `den2` draw identically (R47). Seen in 12 of 12 seeds |
| …invoke a `.kyrt` | **no** | `"templates": "x.kyrt"` is `JSON Parse error: Unrecognized token '#'` (R51) |
| …read the world as it plays | **no** | generation completes when the module installs; `now` is the only clock it sees |

And a scenario manifest:

| Can a manifest…? | Answer | Evidence |
|---|---|---|
| …bind roles to several different towns | **yes** | the circus (three) and the fellowship (four): `largest`, then `along:a`, `along:b`, `along:c` follow the roads; four distinct towns in each of 6 countries drawn (`test/fellowship.test.ts`) |
| …use a different number of towns | **no** | a settlement role always binds, and every country has five (40 of 40 seeds) (R55) |
| …give each town's people topics in a module | **yes** | the fellowship imports each town's `green`, `town` and `merchant`, and its Persons stand in rooms it adds `within` those towns; the merchants of all four towns take a topic (`seek_a`…`seek_d`) |
| …have the module's own rooms in a town | **yes** | `Place hall_b … is room within town_b`, a `Passage … door` from the town's green |
| …have members in another country | **no** | placement is per country, and nothing but an authored country's herald goes ahead (R50) |
| …have its news told in its other towns | **no** | a hook is told at the first place and one road neighbour (R49): `hook fellowship.rumour: told by s1_…, s4_…` only |
| …stand in more than one country as an instance | **no** | see R50 |

## 3. The fellowship: an institution drawn across four towns

`data/scenarios/fellowship.scenario.json` (kind `town`, weight 2) and `data/situations/fellowship/` (`module.json`, `situation.kyr`, `tables.json`, `templates.json`).

**What is placed.** A head in the largest town and three halls in the next three along the roads. Each hall is a room added `within` its town, through a door from the green. Head and halls are for a *guild*, a *garrison* or a *chapter*, by the country's terrain (`fellowshipKind`: marsh gives guild or chapter, frost garrison or chapter, and so on); the kind chooses the name (a trade for a guild: `the Guild of Reed-Cutters`; a watch for a garrison: `the Causeway Watch`; the domain's emblem for a chapter: `the Chapter of the Open Book`) and the words (`the guildhall` / `the barracks` / `the chapter-house`; `the Master` / `the Captain` / `the Prior`), all by labels, so one telling of the story serves all three.

**What is drawn, and what it changes in play.**

| Drawn | By | What it changes |
|---|---|---|
| the kind and the name | terrain, domain | how the fellowship is spoken of; its people's callings (a garrison's are warriors and rangers, a chapter's clerics and monks) |
| which hall is silent (b, c or d) | `oneOf` | which of three towns the head names, where the keeper is, where to walk |
| why it is silent | `lookup(fellowshipCause, kind)`, per kind | **the keeper, the clue and the cure** (below) |
| which officer sits in which hall | `sample` | where the one who tells what the page says, the one who gives the token and the one who pays are to be found; sometimes they are in the silent hall, sometimes two towns away |
| which shop holds the tally, if sold | `pick(except(…))` | which of the three other towns' merchants has it; a topic on each of the four merchants asks, and one answers yes with a price |
| the price | `2d6 + 8` | what the company must find, or ask the treasurer to stand |
| the clue's wording | a table per cause, two each | what the recorder's page and the head's own copy say |

**The four causes, each a different thing to do** (every cure is reachable by any calling):

| Cause | The hall | The clue | The cure |
|---|---|---|---|
| `proud` | the keeper sits with the roll shut and will not answer | "Answered. Nothing owing." in the keeper's hand | put the summons (persuasion, hard); or take a **hall-token from the warden** (wherever the warden is) and lay it down (persuasion, easy) |
| `sold` | a pale clean rod's length of plaster where the tally hung | a stranger's counting-mark in the margin | learn it was sold; ask the shops in the other towns; pay the price (the treasurer will stand it) to the one who has it |
| `lapsed` | the keeper is dead; an apprentice does the sums | "the keeper's apprentice, entered as successor, and never confirmed" | show the apprentice the page |
| `fallen` | the keeper is hurt, a cup of water out of reach | the last tick wanders off the line | bind the leg (woodcraft), give a draught (a potion), or sit up the night (anyone, eight hours) |

Then carry the tally's half to the head. The head pays 24 coin and the roll is ticked: `mended(order)`, the module's goal and outcome.

**The thread** is the summons, the tally and the roll: the head sends the company with a sheet, the cure produces a rod, the rod goes home. Along the way each officer offers something the others do not: the treasurer eight coin for the road (and the price of the tally if it is needed), the recorder the page, the warden the token. Which town gives which is the draw.

### Sample draws

All with `scenarios: 0, towns: 1` over the fellowship's own library, which is what `test/fellowship.test.ts` does; the first country's other scenarios are placed as usual. "Walked" below means the steps of the play script (`Placed.at` moves the company between towns; the walking between them is not played).

| Seed | Country | The fellowship | Silent | Officers (b, c, d) | Played to the end |
|---|---|---|---|---|---|
| `a1` | marsh, human | **the Chapter of the Green Hand**; head Piers at Lowmouth; halls Mistshaw, Millholm, Sedgebrook | **Mistshaw: the keeper died** (`lapsed`); the apprentice Thurstan sits there | recorder Mabel *in the silent hall*, warden Joan at Millholm, treasurer Osbert at Sedgebrook | yes: ask Mabel for the page, show Thurstan, carry the rod to Piers |
| `m13` | marsh, human | **the Guild of Salters**; head Ralf at Duskbridge; halls Meregreen, Coalwood, Mallowham | **Meregreen: the tally was sold** (`sold`), to the merchant at **Coalwood** | treasurer Hankin *in the silent hall*, recorder Nicol at Coalwood, warden Randal at Mallowham | yes: Beatrix says it was sold; Hankin stands the price; Auron at Coalwood asks 16 coin; Ralf lays it against his half. This one is in the spec |
| `s19` | mountain, dwarf | **the Chapter of the Mended Hand**; head Eberk Dankil at Barzelmizela; halls Selakom, Gibakhafar, Gothgabar | **Selakom: the keeper will not answer** (`proud`) | warden Dagny Torunn *in the silent hall*, recorder Harbek at Gibakhafar | yes: the token from Dagny, laid on the table before Baern Battlehammer |
| `d4` | mountain, human | **the Wall Company** (a garrison); head Cecily at Rainmeet; halls Hawkmill, Ísenburg, Broadhurst | **Hawkmill: the keeper fell** (`fallen`) | recorder Martin in the silent hall, warden Bartle at Ísenburg, treasurer Nest at Broadhurst | yes, twice: a ranger binds the leg; a warrior (no woodcraft) sits up the night |

Beyond these, 300 Deem draws (fifty each terrain) gave every kind-and-cause pair the tables allow (ten of them, from `guild/sold` 56 to `garrison/lapsed` 16), all six arrangements of the officers, and no failure. Other countries drawn and read: `thorn` (marsh chapter, lapsed), `b2` (mountain garrison, fallen), `c3` (mountain guild, lapsed), `e5` (forest guild, lapsed), `j10` (marsh guild, lapsed), `l12` (mountain chapter, sold), `n14` (forest garrison, fallen).

**A sample page** (`s19`, the proud keeper; the company has the token):

> The keeper sits at the head of the table with the hall's roll shut in front of them, one hand flat on the cover, and does not rise. The hall is neat. It looks like a place where a decision has been made. … The horn disc sits on the table next to the sheet, and Baern Battlehammer looks at it a long moment, because it is the only thing in the room that cannot be argued with. 'Very well,' says Baern Battlehammer. 'Take it. It was always theirs to ask for.' The half-tally is put into your hand.

### What the fellowship does not do (the limits found)

- **Its members are all of the head's people.** All six are cast as the first town's folk (R48); in `a1`, a lizardfolk town's hall is kept by humans.
- **News is told at the seat and one neighbour** (R49), so the hall that is silent never hears of it. A company that does not start near the seat has to hear of it by chance.
- **The text a drawn fact chooses is told before the text that asked** (R54). The head names the silent town in an event that fires before his reply; it reads acceptably ("Piers gives the name without looking up from the roll: Mistshaw."), not well.
- **There is one institution per country.** The scenario has `instances: 1`; two would draw identically (R47).
- **Nothing is across the march** (R50).

### Where it goes

For `standing.json` (the integrator's, not edited here), the entry, after `silent-lord.scenario.json`:

```json
"fellowship.scenario.json"
```

It places last, shares the towns it uses, and was loaded together with the other standing scenarios and the drawn ones in `thorn` (36 modules installed). As a drawn town scenario instead, add the same file name to `library.json`.

## 4. The den: encounter, treasure and wonder tables

`data/situations/den/` (`tables.json`, `templates.json`, `module.json`, one line of `situation.kyr`, and a new `extras.kyr`). What was drawn before: the beast and its count (from the country's ecology, or a table) and the coin (`2d6 + 2`). Added, drawn after those so that **those do not move** (280 draws compared before and after: identical beasts, labels and coin):

| Drawn | Tables | Effect |
|---|---|---|
| a **leader** | `denLair` | `l_lead` puts a second creature in the den: a pack leader (`pack_leader` variation, for the animals that can take it, a whitelist of 62; the same species as the others if not), or an outlaw captain, level 3. **Smoke will not move the pack** (`smoke_out` now needs `not lairkind(beasts, l_lead)`): a ranger who would have driven the bear off must fight it, or lay it. A den's leader is attacked with the rest. |
| what the den holds | `denFindCommon`, `denFindFine` | one thing from a table of eight (a snapped dagger, a gnawed pouch, a map chewed to lace, a lantern, a flask of oil…) and, one time in three, a better one (a stone, a small draught, and in an outlaws' den a scroll of curing or, rarely, a wand): fourteen items, each a real kind of the catalog, lying in the den's room |
| a **marvel** | `denMarvel`, by terrain | most dens have none (two in three); otherwise a warm **spring** (restores the company, once), a **hermit's inscription** (lore; twelve coin behind a stone), or a bed of **lamp-moss** (two torches). Each is offered only when the den is dealt with |

Samples (seed: what lives there / leader / marvel / what lies there):

| Seed | Den | Leader | Marvel | Lies there |
|---|---|---|---|---|
| `c3` | cave, the hounds (wild) | **yes** | none | a dagger, a minor draught |
| `i9` | cave, the bear (wild) | none | none | a flask of oil; **smoke is offered** to a ranger |
| `e5` | cave, the bear (wild) | yes | **inscription** | a swollen book |
| `thorn` | barrow, the zombies (unquiet) | none | **warm spring** | a bronze bracelet, a scroll of curing |
| `j10` | barrow, the zombies | yes | **lamp-moss** | a lantern |
| `k11` | cave, hollow-stalkers (stubborn) | yes | none | a bronze bracelet, **a wand of magic missile** |

Played (`thorn`, a cleric: lay the dead, bathe in the spring, search, take the bracelet; `c3` and `i9` for the smoke).

**What this did not do.** The two dens of a country draw identically (R47: the table above is each seed's `den` and `den2` alike). The treasure is picked by moving an item out of Nowhere because a manifest cannot choose an item's kind (R52). The den's *hoard* is still coin only; the items are found, not carried by the beasts.

## 5. What was checked

| | |
|---|---|
| **Automatically** | `test/fellowship.test.ts`: Deem alone, 80 draws, all three kinds, all four causes, six arrangements; four distinct towns in six countries; and `m13` played to the mend (the `sold` path). `test/den-aim.test.ts`, `test/scenario-needs.test.ts`, `test/authorable-generation.test.ts` (4 tests) pass with the new den. `bun run lint` is clean |
| **Played in the terminal** | `a1` lapsed, `m13` sold, `s19` proud (the token), `d4` fallen (a ranger binds, a warrior sits up), by `Journey.play` with `Placed.at` between towns, from a script (not in the repo); the den at `c3`, `i9`, `thorn` |
| **Loaded whole** | `bin/kyrie world thorn` with the fellowship added to `standing.json` in the working tree (not committed): 36 modules, no error |
| **Not done** | walking between the towns on the map; the browser; the `lapsed`, `proud` and `fallen` paths as committed specs (only `sold` is); the dens' marvels as specs; the web bundle (see below); the fellowship drawn by the library (only its standing form was loaded); a playtest by a player rather than a script |

## 6. Files

New: `data/scenarios/fellowship.scenario.json`; `data/situations/fellowship/{module.json,situation.kyr,tables.json,templates.json}`; `data/situations/den/extras.kyr`; `test/fellowship.test.ts`; `test/fixtures/fellowship/library.json`; this page. Changed: `data/situations/den/{module.json,tables.json,templates.json,situation.kyr}`; `doc/architecture/activation/kyr-deem-requests.md` (R47 to R55, under this branch's heading). Not changed: `data/scenarios/standing.json`, anything under `src/`, `data/rules`.
