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

`bun bin/kyrie.ts lint` counts every relation a campaign module declares for itself (`campaign-vocabulary`). That
count is the measure of how much is still scenario-local. Mission 6 brought it from 101 to 92. The table below says
where the rest stands.

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

## Audit: scenario-local state

Before mission 6 the Lanthorn declared its own alarm (`roused`), standing (`wanted`, `sworn`), toll (`tollAt`),
supply (`provisions`, `creditAt`) and plunder (`plundered`). The hobs and the outlaws each declared their own alarm
(`roused`) and their own losses (`losses`, `tithes`). These are now the shared relations above.

What remains local, and why:

| Module | Local relations | Judgement |
|---|---|---|
| Lanthorn | `passing`, `guest`, `admitted`, `shotAt`, `hailed`, `laden`, `earned`, `lifted`, `kindled`, `taken`, `pathSeen`, `gloom` | The Lanthorn's own mechanisms and custom; `lifted(toll)` is a historical fact the reeve's bounty reads. `earned` should become a general record of who did what. |
| Hob folk | `freed`, `quiet`, `paid`, `rung`, `shame` | Captives coming home (`freed`) duplicate the Lanthorn's Tamsin and caught-below's guest: next to become a shared homecoming. Tribute (`paid`) duplicates the outlaws' road-money. |
| Outlaws | `quiet`, `demanding`, `impatient`, `dueling`, `ended`, `paidUp` | Road-money is now visible as `tolls`; the hold-up exchange is theirs. |
| Situations (brood, caught-below, dragon roost, den, salvage, tower) | `asked`, `thanked`, `grateful`, `returned`, `escortedHome`, `reunited`, `raidAt`, `lost`, `robbed`, `looted` | The largest remaining duplication: captives, thanks and raids each have three or four versions. Raids should increase `losses`. Rescues should use one homecoming rule. |
| Candle Tombs, Brimming, Hush | `candle`, `stirring`, `timed`, `robbed`, `counted`, `restless`, `returned`, `jars_lost`, `refused`, `shamed` | Mostly the sites' own mechanisms. |

## Limits

- The claimant is bound by the campaign author, not yet chosen by the assembler for generated worlds. Kits do not
  yet support an optional slot for "a nearby stronghold".
- When the hobs hold the Lanthorn, they hold it and guard it, but they do not yet raid from it, and the Toll does
  not return under them.
- What the Lanthorn's crew owe the Heron is never collected. A debt that is never paid changes nothing yet but a
  conversation.
