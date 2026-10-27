# A Winter in Carth — Stage 3: what Kyrie can do, and the plan

*Written after reading, for this purpose: the grammar (`src/lang/Kyr.ohm`); the shared rules (`data/rules/core.kyr`,
`people.kyr`, `belief.kyr`, `care.kyr`, `needs.kyr`, `belongings.kyr`, `passages.kyr`, `inhabitants.kyr`); checks
(`src/rules/checks.ts`) and who brings a skill (`src/campaign/party-capabilities.ts`); light and flame
(`data/catalog/conditions.json`, `src/campaign/field-use.ts`, `src/presentation/player-view.ts`); placement
(`src/world/countries.ts`, `data/adventures/countries.json`); the most recent finished metropolitan work, *The Banns at
Hessel* (`data/adventures/hessel`), its tests, helper, wander and friction report; *The Liberty of the Ice*'s
companion topics; and the name rules in `test/adventure-names.test.ts`. Each element of the revised design is marked
**direct** (Kyr says it today), **work-round** (sayable with machinery the module builds) or **extension** (a general
change).*

## 1. The module, and how it is entered

- **One module, `gaunt`**, in `data/adventures/winter-in-carth/`, in files by strand. Ids are `gaunt__…`. **Direct.**
- **Alone**: `data/campaigns/a-winter-in-carth.campaign.json`, whose bundle (`module.json`) includes `company.kyr`: a
  company of one at the Penitent's Cross at nine in the morning. **Direct.**
- **In a world**: `placed.json`, the same sources with `placed.kyr`. Entered at the `cross_road` room. **Direct.**
- **Placement**: a `countries.json` entry appended last, side **north**, beside **mountain** and **frost**. The Long Man
  fits north of every terrain, so this country is never on the first ring: it lies a country further out, north of a
  drawn mountain or frost country, which the seed chooses (`Countries.plan`). Appended last, it moves no earlier
  country. **Direct**; to be proved by a journey from a first country and by the existing frontier tests.
- **Geography turned to fit.** The design's "north road" comes into Gaunt from the north. Placed north of the country it
  is entered from, the company comes in from the *south*: so the road climbs north from the march over Carth Fell and
  comes down into Gaunt at its south gate, the **Fell Gate**. Nothing else changes.
- **Names.** Surnames and proper place-names are each one adventure's own (`adventure-names.test.ts`). *Tallis* (Pellam)
  and *Crane* (Wrayford) were taken, so the Lady Penitentiary is **Hawise Strake** and the heretic **Ninian Hern**.
  *Carth* is used as a place (a farm), never a surname; Hessel's *Carth House* and family keep theirs. Every kind is
  the module's own and named `gaunt_…`-distinct.

## 2. The clock

| Element | Mechanism | Status |
|---|---|---|
| Days counted from arrival | `dayN(gaunt_town)`, increased at each six o'clock after the first hour (Hessel's pattern) | work-round |
| Shrove Monday, Fastens' Eve, Ash Day | Queries `dayTwo()`, `eveDay()`, `ashDay()`, and hours | direct |
| Chapters at the turn of each day | Rules latched by `spread`, anchored by a condition on where the company is (Hessel friction 1) | direct |
| The book closes | An `accounting()` query at Ash Day 18:00 (or the next morning for a company away), fate rules then one ending | direct |

## 3. The country

| Element | Mechanism | Status |
|---|---|---|
| The road, Carth, the Levels, three rings of the city, the Bishop's Wood | One region `gaunt_country`; wilderness areas (`fell_road`, `levels`, `bishops_wood`), a site (`carth`), a settlement (`gaunt_town`) with buildings | direct |
| Carth dark: a flame is a fire | Carth's rooms are `unlit`; the company sees nothing there without a light (`benighted`). A torch, lamp or candle brings `flame` as well as `light`; a conjured light brings only `light`. The house door **opens when** the company brings no `flame` in, and its shut text is Annis asking for the light | direct |
| The snow closes the fell | A scenery `snow` with states; the descent passage `opening when` the snow is not falling; the snow comes when the company first tops the fell and stops at seven the next morning | direct |
| The Close Gate: a clean tally | A passage `opening when closeAdmits()`, a query over shriven, forged, Joby's leave, Hern's delivery | direct |
| Over the Close wall at night | A passage `needing climbing` `opening when dark()` | direct |
| The Gate of Ash | A passage opening only on Ash Day after the sentence | direct |
| The gaol window, from the lane | A room `gaol_lane` outside the cell; Hern speaks there through the bars (a topic needs him present, so his window is a room he is "at" as far as talk goes: he is placed at the lane at night, `Seen when` from the lane only) | work-round, see §9 |

## 4. People and talk

| Element | Mechanism | Status |
|---|---|---|
| Hern in custody, walking with the company | `acceptsEscort(hern, party)` and `following(hern, party)`; a keep-up rule (Hessel friction 6) | direct |
| His three questions, and the answers kept | An event per station asserts `asked…`; answer topics assert `said…` facts; later topics, events and the trial read them and quote them | direct (Hessel's Ottery pattern) |
| Minds moved by people | Named facts asserted by acts (sat the vigil, spoke masked, carried a plea, stood barefoot); no measure shown | direct |
| Hawise masked in the Row | A second person-entity is not needed: Hawise is *at* the Row copper from 21:00 to 23:00 on Fastens' Eve with a `Role … when` masked, and her topics there are gated on the hour | direct |
| Thackray's change | Facts `nightAtCarth(thackray)`, `annisSaid(thackray)`, `joanLaughed(thackray)`; his acts gated on two of them | direct |
| What the company carries between people | Facts `carrying(word)`, topics that deliver them | direct |

## 5. The law: shrift

| Element | Mechanism | Status |
|---|---|---|
| Pains owed | `Measure pains(group)`; increased by named faults (`Increase pains(party) by 17`) | direct |
| Assessment at the Fell Gate | An event when the company first passes the gate: reads what was done on the road (`brokeVigil`, `struckReeve`, `keptCompany`), sets `pains`, gives a tally (`tallied(party)`) | direct |
| Shriven or not, seen by others | `Query shriven() means tallied(party) and pains(party) == 0`; the Close Gate, the witness's place, prices read it | direct |
| Paying: doing it | Actions at the Stand and on the Minster steps: a fast (sets `hungry`, delays the meal a day), a barefoot mile (a cold hazard), a night's vigil (time and a hazard), stripes (a hazard); each takes pains off | direct |
| Paying: a proxy | An action at the Stand: coin for pains, told as someone's back | direct |
| Paying: earning it | Proxy work for burgesses, paid in coin | direct |
| Paying: a forged tally | Heb's action: coin; a fact `forged(party)`; the Close Gate's porter may see it (a check), and a seen forgery adds pains and turns the porter away | direct |
| Remission | Hawise's ring (a local kind) once given; an action at the Penitentiary that spends it | direct |

The shrift is never shown as a number on its own. It is told in the city's words where it matters: the Assessor
writes it on the tally ("seventeen nights of cold hearth and one of Association"); a merchant reads it; the porter
reads it. The page shows the company's coin, as it always does, and nothing else.

## 6. The strands

| Strand | Mechanism | Status |
|---|---|---|
| S1 The beadle | A person at the Cross; topics; an action to take the custody (coin now, a fact for later); refused, Hern goes ahead by rules | direct |
| S2 The road | Three stations; events; answer topics; the fork as three actions, one `Grave` | direct |
| S3 Carth | Rooms `unlit`; the hearth as a thing (`cold`, `burning`, `warm`, `snowed`); a byre fire as a thing; actions for the beasts, the bed, the nursing, the rites; hour rules for the cough (21:00), the grandmother (23:00), Raistrick (03:00); morning rules for the outcome; Raistrick a person who can be followed, fought or talked to | direct |
| S4 The Fell Gate | An assessor; the assessment event; Hern delivered by an action | direct |
| S5 The Stand and the Ladder | Proxy actions; Dinsdale and Sowerby with topics that tell on each other (`ladderStake` beats); the Stand hired out on Ash Day as a fact the Barefoot read | direct |
| S6 The widow | Abel faints by a rule at four; Joan's topics; the Fat Lamb on Fastens' Eve as an action gated on the hour | direct |
| S7 The tower | A night observation at the scaffold, `teaches`; Joby's topics; Pellow's | direct |
| S8 Whose forty nights | Discoveries by following Raistrick (an action at three), by Annis's coin (a topic), by Thackray on the fell (an observation at nine on day 2) | direct |
| S9 The Barefoot | Bess's topics; the strike as a fact at six on Ash Day if called and not answered; the wood as a sledge (a local kind) carried from the Bishop's Wood, where wolves are `Species wolf` at dusk and the woodmen a `proud` band | direct |
| S10 The rescue | Hal at the gaol lane at 23:00 on Fastens' Eve; Prudence's informing at 20:00 by a rule unless turned; the serjeants a band; the window a thing `needing lockwork or brawn` | direct |
| S11 Fastens' Eve | Hour rules from 19:00 to midnight; the Fast rung in at midnight | direct |
| S12 Ash Day | A scene in the Chapter House from 12:00: events in order (charge, Determination, the question to Hern), live actions in a window (testify, offer, shout), and a verdict rule at 14:00 reading what has been made true | direct, by hand (as Hessel's reading and Ball, Wrayford's verdict) |
| Local: baker, slide, dog | Topics and small actions; the dog a `Species dog` that follows | direct |

## 7. Endings and the account

At 18:00 on Ash Day (`accounting()`), fate rules tell each strand's morning (Carth, the widow, the Ladder, the tower,
the Barefoot, Hal, Thackray, the company's shrift); then one ending holds, by what happened at the trial: **The
Fast**, **The Recantation**, **The Bearer**, **The Flight**, **Put Out**. All require `cameToGaunt(party)`. A company
that leaves before Ash Day is told nothing until it is back in the region; the book closes all the same.

## 8. Rewards

Milestones for things done (§ design 8). The Barefoot soles: `Resolve endow(member, constitution, by_one)` once, when
the conditions are met (the Manual idiom). Hawise's ring and Joby's mark are local kinds. Hern can join (`willing`) if
he leaves Gaunt free or put out and the company is with him. Fly is `Species dog`, following.

## 9. What is not built, or worked round

- **A general proxy construct.** The Commerce's "borne by another" is the module's own law, in its own measure.
  It is the satire's subject and belongs to no other adventure.
- **Belief apart from knowledge** (the repertoire's G3): Raistrick believing the warmth is a fever is a fact
  `raistrickDeceived`, not a belief system.
- **Talking through a window.** A person is talked to where they are. Hern in the gaol is at the cell; the company in
  the lane is not there. Worked round by putting Hern at the lane while the company stands at the window: a rule moves
  him to `gaol_window` (a room the company can be in, described as the bars) whenever the company is there and he is
  in the cell. Noted for the friction report.
- **Sound.** The night at Carth is heard, not seen. The page in an unlit place shows "only who is here can be heard";
  the module's events still print, so the night's sounds are told by events anchored at the house, which print in
  the dark. To be checked in play.
- **The Grave confirmation** is not exercised by Journey (Hessel friction 7); the fork's "go with him" is Grave.

## 10. Tests planned

`test/winter-in-carth.test.ts` (lint; left alone; each Carth approach; the gate and shrift; each way past the Close
Gate; the two principal approaches to the trial end to end; each ending; builds: a bard, a thief, a warrior, a ranger,
a cleric, a commoner with no charisma or learning; keeping and resuming; replay from a seed; the generated world),
`test/winter-in-carth-wander.test.ts` (seeded random offered play with invariants), `test/support/gaunt.ts`, fixtures
in `test/fixtures/gaunt/`, and `scripts/winter-in-carth-transcripts.ts` writing `doc/adventures/a-winter-in-carth/playtest/`.
