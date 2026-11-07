# 4. Kyr/Deem authorability report, and the authored → generated → persistent → authored handoff

*Every statement is either marked **tested** (with the test or script that exercises it), **read** (from the cited
source, not exercised), or **blocked** (with the exact blocker). Branch `adventure/imbar-deep-time`. The one code
change is three lines in `src/world/world-assembler.ts` (§4.6).*

## 4.1 What an author can define, by layer

The repository's own audit (`doc/architecture/mission-18/authorability.md`) names five layers: authored definitions,
generative templates, generators, generated instances, persistent state. Against those, what I found by doing it:

| Capability | Can a Kyr-authored scenario do it? | Evidence |
|---|---|---|
| **Item kinds of its own** | **Yes, tested.** `Kind x "…" is treasure worth N weighing N described "…"` or `like <catalog kind> granting <skill>`. Joins the catalog while its campaign is played; a clash with the catalog or another module is an error | `src/canon/local-catalog.ts:5-60`; used in Quittance's `kernel.kyr:107-120` and the Wardens' oath-tablet (`doc/authoring/guide.md:963`); I did not add a kind |
| **Creature kinds of its own** | **Yes, read.** `Species x "…" like golem …` (the Lull's Overseer, `sixnight.kyr:101`). A *variant of* a catalog species, with its own name and temperament | `src/canon/local-catalog.ts` `LocalKinds.species` |
| **Its own Deem tables and templates** | **Yes for a town-level or situation module (`data/goings-on`, `data/situations`), tested.** `module.json` `"generation": { "type", "templates", "tables" }` — the module's own `tables.json` (Deem `discriminator`/`groups` tables, weights, `lookup`) and `templates.json` (`gen()`, dice, `casting`, `initial`, `outcomes`) are read through `Content.settingWith`. I wrote both for the Exchange | `data/goings-on/factors/*`; `src/campaign/module-bundle.ts` (`generated()`); `test/factors-handoff.test.ts` |
| **…inside an *adventure* module** | **Read, not tested.** No adventure declares `generation` today; the same `module.json` field is accepted. I used a town-level scenario module because that is where a Deem-cast *institution* belongs (§4.3). I do not claim an adventure's own casting works, only that nothing in the loader forbids it | – |
| **Kits** (slots in the ledger, Deem proposals, provided facts, modules) | **Blocked from inside an adventure.** A kit is requested only in a *campaign* manifest (`{kit, id, fix}`) or a *framework* (`data/frameworks/frontier.json`) via `Composition.isKit` / `expand` (`src/campaign/module-bundle.ts`, `doc/architecture/composition.md`). An adventure's `module.json`/`placed.json`/`countries.json` entry has no `kits` key. **Smallest general capability:** let a `countries.json` entry (or `placed.json`) carry `kits: [...]`, composed after the first region. Not built. | read |
| **Spells and effects** | **No.** `Kyr cannot define one, only teach one` (`doc/architecture/mission-19/authoring.md` "What does not yet work"). Magical phenomena in adventures are therefore Kyr *states and rules* (`Rule … says …`), not catalog spells | read |
| **Languages** | **No, from here.** Place and people names come from the pinned `languages` package; changing Aenean means re-pinning that repository. The *Latin* in a charter is just prose | `doc/architecture/mission-19/authoring.md`; I wrote Latin as text |
| **World events** (`befell`) | Only by adding to `data/imbar/events.kyr`, naming it in a manifest's `canon`, and asserting it in play. **At the end of the first pass no adventure asserted any** (the Grand Tour keeps its own local `doorOpen`); corrected in the second pass | read |
| **Preset companions' lines** | **No.** `Remarks` belong to a declared `Person`. A campaign's `party` members are generated from JSON. Recruited persons can have them (Loveday, Sorrel, Ned, Ivo) | `skeel/holm.kyr:21`; `hollins/library.kyr:59` |
| **Rules that write discovery knowledge** | **No.** `Assert established(fact-entity)` from a rule is refused: *"Rule … cannot change canonical projections, clocks, records or discovery knowledge"*. `stale(fact)` is the one writable shared relation on facts. Cross-module signalling therefore has to use *places* and *custody* | found by failing; `test/factors-handoff.test.ts` |
| **Optional imports** | Declare the entity in `placed.kyr`; **do not** list it under `roles` in `placed.json`, or the loader says *"Unbound required role"*, even if it is under `optional` | found by failing; `test/merrow-to-ammerlin.test.ts` is the control |

## 4.2 Separation of layers: did I keep them apart?

- **Authored definitions**: `charter.kyr`, `keeper.kyr`, the Exchange's `situation.kyr`. Kyr, human-editable, no
  engine knowledge.
- **Generative rules**: `data/goings-on/factors/{tables,templates}.json` — Deem tables (`factorFolk`, `carterFolk`
  by terrain) and templates (the run of days, the stock, the number of hands). Not Kyr; not instantiated.
- **Instantiated content**: the factor, carter and hands are *cast into the world at assembly*. Different seeds make
  different people (below). They are not written into any `.kyr`.
- **Mutable world state**: who `keeps` the lot, where the carter stands, which module is installed. Never in a file.
- **No parallel registry** was introduced. The only catalog item involved is the *existing* `bell_teeth` kind; the
  Exchange never names a Long Man or Low Water identifier.

## 4.3 The bounded proof: *The Founders' Exchange*

**The question.** Can an authored scenario introduce an organisation Deem instantiates; can a member of it act while
the company is away; can the company disrupt it; and can its consequences pass into a *different* authored scenario
through the persistent world rather than a script flag?

**What I built** (`data/goings-on/factors`, `data/scenarios/factors.scenario.json`):

- A **town-level scenario** placed by the assembler in the largest settlement (`"settlement": "largest"`), never
  drawn at random (it is a *herald*, named by two countries in `data/adventures/countries.json`). **tested**
- **Deem casts it**: a *factor* (a person seated in the taproom), a *carter*, and *the factor's hands* (a group of
  two to four), their ancestry drawn from per-terrain tables, their names from the townsfolk table (`apart(...)`
  keeps them distinct from the region's other people), a carter's run drawn as `144 × (2 + 1d3)` watches, a stock as
  `2d6`. **tested**, five worlds:

  | seed | terrain | factor | carter | run | stock |
  |---|---|---|---|---:|---:|
  | thorn | mountain | Taklinn | Baern | 3 days | 7 |
  | a1 | marsh | Naillil | Marina | 3 days | 3 |
  | kite | forest | Arannis | Ghokarn | 3 days | 7 |
  | ash | frost | Valen | Lena | 4 days | 11 |
  | wren | forest | Jeremiah | Khokarn | 4 days | 7 |

  (`doc/imbar/playtests/factor-handoff.md` §1; read from the running world.)
- **Behaviour.** The factor `Buys bell_teeth for 9 coin` (the standard `sell` action, so the company can sell its
  own). A lot `keeps`-ed by the factor starts a clock (`dueAt = now + run`). When it falls due *and the carter is in
  the taproom*, the carter takes the lot and leaves for the south road: custody moves, the carter's `at` moves.
  **tested** while the company is elsewhere (Merrowdale).
- **Disruption.** The company can `Buy … back from the factor at fourteen to the pound` before the carter goes,
  which resets the clock and puts the lot in its own pack. **tested** (`test/factors-handoff.test.ts`, third
  test): the carter never goes; Low Water's Halm has an empty cloth.

**The handoff** (the thing the brief asked for), tested end to end in `test/factors-handoff.test.ts`:

```
The Long Man (authored)        Cass's barge sails with the steward's bronze.
   placed.kyr: teeth_to_factor   Assert keeps(factor, teeth)               <- custody into the generated person
        |
The Exchange (Deem-cast)       dueAt set from the Deem-rolled run;
   situation.kyr               at dueAt the carter takes it, leaves, stands on south_road
        |                      (the company is, throughout, in Merrowdale)
        v
   persistent world            keeps(carter, teeth), at(carter, south_road), the run of days
        |
Low Water (authored)           placed.kyr: halm_buys_lot
   placed.kyr                    when keeps(carter, ?t) and itemKind(?t, bell_teeth) and at(carter, south_road)
                                 -> keeps(halm, ?t)
                               an Observe on the dig (the lot on a cloth) and a Topic (Halm's account).
```

Three things make this a handoff and not a flag: (a) the item is *the same entity throughout* (`plongman__teeth`); (b)
the only shared vocabulary is the catalog kind `bell_teeth` and the engine's `keeps`/`at`; and (c) Low Water installs
*later* and reads only what the persistent world holds when it arrives. `doc/imbar/playtests/factor-handoff.md` shows
the facts at each stage:

```
t=104   enters Merrowdale          keeps(factor,teeth)=false …
t=434   done nothing for the dale  keeps(factor,teeth)=true  carterGone=false
t=1298  six days on                keeps(carter,teeth)=true  carterGone=true  at(carter,south_road)=true  keeps(halm,teeth)=false
t=1411  at the way into the Bowl   Low Water installed       keeps(carter,teeth)=true
t=1412  one hour later             keeps(carter,teeth)=false keeps(halm,teeth)=true
```

**What the player meets.** In Low Water, on a cloth at Halm's dig: *twelve teeth of green bronze… beside them a sack
with a tin tag, in a factor's hand: NORTH.* Halm: *"I paid double. I paid for it. I'd like, if you have any idea where
the wheel is, to have it back where it belongs, and to have never been paid for it."* The player, who stood in a
dale where those teeth held a lake, has to decide what to do with that.

## 4.4 What the proof does **not** show (blockers, exactly)

1. **The antagonist does not plan.** The carter moves by a `Rule`. The runtime has a planner for persons
   (`Pursuit … seeks …`, `Uses go. Plans 14 steps`: *Caught Below*'s guest and relative), but a Pursuit can only seek
   a relation state reachable by *existing* actions in the world as installed. The carter cannot plan a journey to
   Corran because Low Water is **not installed** when he leaves, and a place that does not exist cannot be a goal.
   The toll-road kit's riders (`data/kits/toll-road/customs/keepers.kyr:99-101`) show the pattern within one
   region. **Smallest general capability:** a *byway to a named, not-yet-installed region* (the repository's
   `dominion.kyr` has byways between known places) so an agent can leave and be found in whichever country is
   installed later. Not built; I did not claim a "strategic regional antagonist". The carter is a lieutenant by
   job description only.
2. **No reaction function.** The Exchange does not respond to being disrupted beyond "this lot is not coming".
   There is no `stock`-driven pricing; `stock` is rolled and unused except as a Deem demonstration. A proper version
   would let `stock` and the company's earlier sales change the price and the carter's run.
3. **Kits from inside an adventure** (§4.1): blocked.
4. **Save/resume was not exercised.** All facts are ordinary world facts, so a saved world should carry them (the
   architecture says "saves hold the whole world and resume in the browser"), but I did not run
   `kyrie resume`. Marked read, not tested.
5. **One-way.** The handoff goes Long Man → Exchange → Low Water. Nothing flows *back* into the Long Man (the dale
   is long over by the time Halm has the lot). A return path would need the Long Man to be re-enterable after its
   "week" ends; the world's clock allows it, the adventure does not.

## 4.5 Other authored → generated links already present (read)

- `herald` in `countries.json` + `Frontier.herald`: a generated-world scenario's *exports* bind a country's optional
  imports (Pentrice's players; `players.scenario.json`; `hume`/`lull`/`larum`/`hollins` bind `word`, a fact the
  adventure marks `stale` when it is over).
- `data/generation/history/arts.json`: the generated *makers' arts* ("the Water-Wardens", "the Delvers", "the Star-Readers",
  …) give every generated country its own deep time, in the Aenean tongue, worn by the folk
  (`src/world/history/histories.ts`). **An authored adventure and a generated country share no vocabulary for who
  made what.** The Long Man's Hesk are a *Water-Warden-like* people, and the generator has an art of exactly that
  kind; nothing links them. This is the most natural next connection and is deliberately not forced: see
  `06-workbook.md` §9.

## 4.6 The code change, and why it was needed

`WorldAssembler.heralds` placed one scenario per *country*; two countries naming the same herald would have placed
the same module twice (the same installed id). Now it places each distinct scenario once and `Frontier.herald` binds
it to every country that names it. 3 lines (`src/world/world-assembler.ts`). All existing heralds (`players` only)
are unchanged: `test/frontier.test.ts`, `test/goings-on.test.ts`, `test/countries.test.ts`,
`test/world-assembly.test.ts` pass.

## 4.7 What I would build next, in order

1. `kits:` in a `countries.json` entry. (Kit composition already works against authored regions; it just can't be
   asked for by the author of one.)
2. Byways to uninstalled regions for agents.
3. A `Reacts` clause for a power's measure (so `stock` is not decoration).
4. A way to give preset-party members `Remarks`.
5. A linter note for "optional import also declared in roles".
