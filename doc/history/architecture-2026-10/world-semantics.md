# One world: shared facts, not scenario flags

A campaign has four kinds of content, and they are kept apart:

| Kind | What it is | Where it lives | Example |
|---|---|---|---|
| **Framework** | The rules every world uses: bodies, places, time, trade, knowledge, standing, power | `data/rules/*.kyr` (the `world` rule set) | `holds`, `tolls`, `credit`, `owes`, `losses`, `alarmed`, `admits`, `hostile`, `vacant`, `covets` (in `dominion.kyr`) |
| **World content** | Places, people and things that exist whether or not anyone pays attention to them | regions (`data/regions`), sites (`data/sites`), institutions | Hollin, the Heron and Eel, Bryony Crake and her meal bin; the Lanthorn, its gate and its cellars |
| **Situations** | Something happening in the world, with its own pressure | sites' and kits' rules, `data/situations` | Ninefingers tolling the Gap; the hobs raiding the ford's farms |
| **Objectives** | What an actor wants | an actor's `Objective`, `Topic` or `Pursuit` | the reeve wants the Toll ended; Ninefingers wants noonlight |

An objective is never the organizing principle. The company can climb to the Lanthorn, talk to the wardens, search
the cellars or rob the strongbox without having heard of the reeve's bounty. The bounty is one person's offer about
one state of the world. The world does not wait for it.

## The rule: a fact one module sets for another is shared vocabulary

A module may keep its own state where nothing else needs it: the Lanthorn's beacon, its false step, the Unlight's
gloom. When another module has to react to something, a fact the first module made up is not enough. The thing has
to be said in the framework's terms, so that any module can read it:

- an alarm (`alarmed`);
- a road being tolled (`tolls`);
- a debt (`owes`);
- a place robbed (`losses`);
- a stronghold left empty (`vacant`).

`bin/kyrie lint --verbose` lists every relation a campaign module declares for itself (`campaign-vocabulary`).
That list is the measure of how much is still scenario-local. Mission 6 brought it from 97 (at the end of mission 5)
to 88. The table below says where the rest stands.

## The Varrow, as one causal web

Each link below is a shared fact. No module names another's internal state.

1. **A settlement supplies a power.** Ninefingers' crew eat their own store, `quantity(ninefingers, rations)`, a
   ration a night.
   - When the store runs low, the carters walk down to the Heron and Eel and load meal on credit:
     `credit(ninefingers, bryony)`. The load comes off Bryony's own stock and adds to `owes(ninefingers, bryony)`.
   - Bryony bakes a sack a day from the ford's farms, unless the hobs have robbed them (`losses(ford_green)`).
   - If the Heron has nothing, because the company bought it up or the hobs took the farms, the carters come back
     empty. The crew then go down and take Skerry's meal (`losses(square)`).
   - The weather takes part too: rain swells the ford, the carters cannot cross, and Skerry is robbed.
2. **The power threatens a route.** The wardens' `tolls(wardens, toll_gate)` is what the region reads:
   - Skerry's grain is dear (3 coin, not 2) and does not restock.
   - Iselde Vane's coin, which comes from Skerry's silver, does not come back after she spends it.
   - Hollin's wagons stand going nowhere.

   When nobody tolls the Gap, all of this changes at once.
3. **The route affects merchants and expedition planning.** What the company can buy in Skerry, and what it can
   sell in Hollin, depends on whether the Gap is open.
4. **A smuggling passage, and a strategic actor who changes its use.** The goat path round the Toll is the region's
   own passage. The company can learn it from Jory, or find it by searching with woodcraft or a keen eye.
   - Seen using it from the Lanthorn's tower, the company is reported to Ninefingers.
   - At the next dawn she posts a watch on the cairn field. The watch takes the Toll there (`tolls(lookouts,
     cairn_field)`) and keeps the Skerry road (`guards`).
   - The path is the same path, now watched.
5. **A site changes ownership.** However Ninefingers' Toll ends (a bargain, the dark, her death, her crew quarrelling
   over her boots), her collectors stop tolling and her holdings are released. The gate passage becomes `vacant`.
   - The Lanthorn names its claimant, bound by the campaign to the hobs' chief: whoever would take it if it stood
     empty (`covets`).
   - `dominion`'s `seized` rule sends the band the hobs post (`posts(raiders, gaffer)`) to hold it at the next
     dawn.
6. **Returning reveals new inhabitants.** The road below the gate says that somebody has moved in. The gate
   passage is held against strangers by the same raiding party that waylays the valley road and keeps the
   Hob-Knot. It is not a copy, so a bell rung there routs them as it would anywhere.

`test/varrow-world.test.ts` plays each link: the supply with and without the Heron bought up, the road tolled and
open, the path seen and watched, and the Lanthorn emptied and taken.

## The same web in generated worlds

The frontier framework places a third kit in every generated region: `toll-road`.

1. A band takes a stretch of road between two settlements and `tolls` it.
2. It buys its bread at the nearest inn, either on `credit`, running up `owes`, or for coin.
3. When the inn has none to sell, it takes it, which adds to `losses` at that settlement.

The region's own rules read the same facts. Every settlement whose road is tolled pays a coin more for its inn's
meal and is not restocked. A settlement whose farms have been robbed is not restocked either.

Deem proposes who keeps the toll, by terrain:

- **Deserters** charge six coin. They remember a company that runs the toll and set on it next time.
- **A lord's customs-men** charge three coin by right. Running their toll, or raising a hand to them, gets the
  company refused at the inn of the settlement they answer to.

Either way, the bounty kit may then put a price on the toll band rather than on the raiders.

The composed campaigns differ in their merchants (by each settlement's trade), in which road is tolled and by whom,
in which raiders hold what, and in who is wanted by whom. `test/generated-economy.test.ts` checks four seeds for
four different shapes, and plays a toll from both sides: stopped, run, remembered, and the inn bought out and robbed.

## Audit: scenario-local state

Before mission 6 the Lanthorn declared its own alarm (`roused`), standing (`wanted`, `sworn`), toll (`tollAt`),
supply (`provisions`, `creditAt`) and plunder (`plundered`). The hobs and the outlaws each declared their own alarm
(`roused`) and their own losses (`losses`, `tithes`). These are now the shared relations above.

What remains local, and why:

| Module | Local relations | Judgement |
|---|---|---|
| Lanthorn | `passing`, `guest`, `admitted`, `shotAt`, `hailed`, `laden`, `earned`, `lifted`, `kindled`, `taken`, `pathSeen`, `gloom` | The Lanthorn's own mechanisms and custom; `lifted(toll)` is a historical fact the reeve's bounty reads. `earned` should become a general record of who did what. |
| Hob folk | `freed`, `quiet`, `paid`, `rung`, `shame` | The boy's homecoming is now the shared `brought_home` rule (`home`, `thanks`, `cameHome`, `grateful` in `world_people`); `freed` remains only as the event's marker. Tribute (`paid`) duplicates the outlaws' road-money. |
| Outlaws | `quiet`, `demanding`, `impatient`, `dueling`, `ended`, `paidUp` | Road-money is now visible as `tolls`; the hold-up exchange is theirs. |
| Situations (brood, caught-below, dragon roost, den, salvage, tower) | `asked`, `thanked`, `returned`, `escortedHome`, `reunited`, `raidAt`, `lost`, `robbed`, `looted` | Caught Below now uses the shared `freedBy` and `grateful`. Its reunion with a relative is its own. Thanks and raids still have several versions; raids should increase `losses`. |
| Candle Tombs, Brimming, Hush | `candle`, `stirring`, `timed`, `robbed`, `counted`, `restless`, `returned`, `jars_lost`, `refused`, `shamed` | Mostly the sites' own mechanisms. |

## Limits

- The Lanthorn's claimant is bound by the campaign author. Kits do not yet support an optional slot for "a nearby
  stronghold", so the assembler cannot yet choose a claimant in generated worlds.
- Kits cannot vary what they provide by variant, so neither toll band is recorded as raiding its market, even though
  the deserters do take bread from an inn they have bought empty.
- When the hobs hold the Lanthorn, they hold it and guard it, but they do not yet raid from it, and the Toll does
  not return under them.
- What the Lanthorn's crew owe the Heron is never collected. A debt that is never paid changes nothing yet but a
  conversation.
