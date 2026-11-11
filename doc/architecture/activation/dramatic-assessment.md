# Dramatic assessment of the corpus

*Branch `adventure/p3-assessment`, 11 November 2026, from `adventure/first-steps`. Read-mostly: this page and one script (`scripts/dramatic-census.py`) are the only changes; nothing was deleted (section 5.1 says why). Status words: **COUNTED** (a lexical count by `scripts/dramatic-census.py`, `grep`, or `bin/kyrie lint`, reproducible), **READ** (I opened the file and quote or cite it), **JUDGED** (my classification from READ material and the corpus reviews in [corpus/](corpus/); not played). Nothing in this document was played through the page; no module was run, so every claim about what a player experiences is a claim about what the data declares.*

## 0. The verdict, in eight lines

1. The corpus is not short of clocks. **26 of 27 adventures have a countdown to a dated reckoning** (a verdict, a feast, a thaw, a hearing, a storm) and all 27 declare rules keyed on the clock that run whether or not the company is present (1,155 of 5,349 rules). What is rare is a clock that **does anything to the people who are not in the room**: 52% of those "autonomous" rules (597) only move a person between rooms on a timetable, and 89 raise or lower a number. The first town's one antagonist, Maudlin Rooke, is on a clock whose last tick falls **twenty hours** after the game starts (§2.4).
2. **A request for help is the commonest first beat of the new material and the rarest of the old**: 9 of 27 rumours offer a hire, a notice or a bounty; 13 of 13 of the first town's errand/tie/job/trouble templates are someone asking for something to be fetched, found, carried or killed, and paid a flat sum.
3. **Talk is almost all one-shot.** 84% of topics in the adventures (2,951 of 3,514) and 98% in the first town's templates (108 of 110) are `once`; 35% of the adventures' topics change nothing in the world.
4. **Violence is mostly territorial and parked.** Of 108 `Temperament` lines in the corpus 77 are `territorial` (stay in the room); 90% of the adventures' people are declared `Peaceable`; only 16 of 27 adventures contain any rule that turns a person hostile (61 in all), and in 5 adventures there is no creature, lair or hostile flip at all.
5. The three new exemplary modules **are not three engines**. The Silent Lord is a real one (a dated decision among factions); the Bound Howe is a faction-and-hazard map with **no clock at all** (its rival expedition does not advance); the Numbered House is a mechanism-puzzle with six clock rules that all reset a lock. All three start their pressure only when the company enters (§6).
6. The fellowship is an **errand with a drawn cause**: one rule, no clock, no one who opposes, everyone `Peaceable`.
7. The best existing seed for an enthusiasm is already in the first region and unexploited: **the Keepers of the Road** (a preacher, hearsay) beside **Maudlin Rooke's dues** (a forged seal in three settlements) beside **the Hall's chained road-wood** and **the posting-house's "wardens"** (§5.3).
8. Nothing is clearly dead and unreferenced, so nothing is deleted. Candidates for rotation out of the first-country pool, consolidation, or a second pass are in §5.1.

## 1. What the counts mean, and do not

`scripts/dramatic-census.py` reads every `.kyr` file of a module and counts declarations. It does not run the world. "Autonomous" means the rule's condition names the clock (`watch`, `day`, `hour`, `dice`, `untilLight`, a `fourthDay()`-style predicate, `dark()`) and does not name `party`, `actor` or `been(`. A watch is ten minutes, counted from eight on the first morning, so `watch(clock) >= 120` is **twenty hours** in and 144 watches make a day (`doc/authoring/guide.md`, the clock). Some autonomous rules are harmless (a drawer unjamming); some party-conditioned rules are the real pressure (`Rule rooke_fall when rooke_reported(party) and watch(clock) >= 72`). The counts therefore bound claims from below and above; they do not settle them. The classification columns in §2 are judgment.

`bin/kyrie lint` was run on all 29 campaigns (§2.6); `bin/kyrie voice coverage` was run and says nothing about drama (it measures canned engine lines). `bin/kyrie reach --all` and the autoplay laboratory were not run: this is a structural survey.

## 2. (a) The census

### 2.1 Corpus-wide counts (COUNTED, the 27 adventures)

| What | Count | Reading |
|---|---:|---|
| Kyr lines | 76,265 | |
| Rules / of which keyed on the clock / of which autonomous | 5,349 / 1,717 / 1,155 | every adventure has some (the fewest: Sallowfield, Muster 6, Skerrow 7, Thrume 7; the most: Wrayford 104, Gosse's Company 110) |
| Autonomous rules that only move a person (`Assert/Retract at(...)`, `Bring`) | 597 (52%) | timetables: who is in which room by the hour |
| Autonomous rules that change another state | 678 | most are "after hour H, door X is open/shut", "from day N, W has gone" |
| Autonomous rules that **raise or lower a number** | 89 (7.7%), of which Low Water 17, Dorothea 10, Let One Remember 9, Patient Star 9 | gradual escalation is the rarest kind of momentum |
| Rules with an `Event` form (reactions that fire on a world state) | 192 in 20 modules; 7 modules have none | |
| `Measure` declarations (numeric state) | 316; seven modules have 3 or fewer (Long Man 1, Thrume 1, Sallowfield 2) | pressure is mostly boolean |
| `Objective` | 138 in **19 of 27** adventures; none in Book of Faces, Half the Hive, Hessel, House that Grows, Liberty of the Ice, Quiet in the Sky, Skeel, Grand Tour | the page's gold lead is made from one |
| `Ending` | 233 in 21 adventures; **none** in Let One Remember, Patient Star, Tallow, Dorothea, Long Man, Thrume | |
| `Topic` / `once` / with an `On discuss` effect | 3,514 / 2,951 (84%) / 2,268 (65%) | |
| `Observe` / `Action` | 4,511 / 2,215 (2.0 to 1) | the corpus describes twice as much as it lets a company do |
| `Observe ... as sign` | 159, **zero in 19 of 27** | |
| `Person` / `Peaceable` | 1,053 / 944 (90%) | |
| `Temperament` lines (adventures 75; with situations and the circus 108) / `territorial` | 108 / 77 (71%) | the rest: obedient 10, ambush 8, proud 5, savage 3, wary 2, defensive 2, seizing 1 |
| Adventures where a rule can turn someone hostile or make them assail (`Assert hostile(…)`, `Assert assails(…)`) | 16 of 27 (61 asserts); Tessary 10, Wrayford 9, Book of Faces 8, Lull 7 | most are on a failed check, not a social collapse |
| Adventures with no creature, lair or hostile flip | 5 (Let One Remember, Sallowfield, Skerrow, Wrayford, Wrongboat) | |
| Rumours told by the first town's `{keeper}` (innkeeper) | 27 of 27; 21 contain "they say"-hearsay; **5 have a posted notice** (Long Man, Gosse's Company, Hollins, Grand Tour, Book of Faces) | `data/adventures/countries.json` |
| Rumours that open with someone paying or asking (a hire, a bounty, a proclamation) | 9: Long Man, Low Water, Tessary, Half the Hive, Hollins, Dorothea, Grand Tour, Quittance, Book of Faces (Patient Star at first meeting: 10) | |

### 2.2 The 27 adventures (every row: engine and time are JUDGED from READ rules and the corpus reviews; the counts in §2.5 are COUNTED)

Columns: **engine** (dominant form); **time** (what moves without the company); **opposes** (is there an actor with aims, or fauna in rooms); **incompatible aims** (`Y` two or more parties want exclusive outcomes and the endings follow from who gets it; `~` a cast with sides but no exclusive prize; `–` none); **opens** (R request/hire/bounty at the rumour; E event or occasion; M marvel).

| Adventure | Engine | Time | Opposes | Aims | Opens |
|---|---|---|---|---|---|
| book-of-faces | investigation under deadline | Drawing on the ninth night; 103 autonomous rules, 91 are people on a timetable | Offices of a masked city; no antagonist named in the review | ~ | R (the Watch hired a stranger) |
| gosses-company | festival / contest | three Trial nights; 110 autonomous | the licensing office (comic), rival companies | Y (the Patent) | E |
| half-the-hive | movement and schism | one clock to flight day; every person has a side (`leaving.kyr`) | none; a decision per person | Y | R ("want hands") |
| hessel | social comedy on a calendar | four-day Season; 78 autonomous | none; a rich woman buying husbands | ~ | E |
| hollins | infiltration of a hidden society + pest job | the Lady dies on a clock | Wainscot factions (Pinmen, Regiment, Jarmen); the Lady is "the best antagonist-who-is-not-one" (review) | Y | R (a ratcatcher) |
| house-that-grows | rule-puzzle vigil (attention) | Kezu's sleepwalk clock | none; the danger is losing state | ~ | M |
| let-one-remember | epic expedition chain, memory as rule (Act II) | Unfolded approach; Midwinter in 28 days | Unfolded (level 10), the Registry | Y (the Registry vs the kin) | M |
| liberty-of-the-ice | fair + legal fiction | thaw on the fourth day | Harker's hired, bailiffs, wolves; deals that "land" | Y | E |
| low-water | inquiry and hearing | the Hearing; 17 gradual counters (most in the corpus) | Council vs creditor vs Reckoner | Y (20 endings, each a verdict) | R (the Office of Measures pays) |
| muster | expedition: three days of road | passes close the seventh day; dice weather | a garrison that has kept eleven centuries of hours; a wyvern | ~ | E |
| parliament-of-books | investigation → ritual | Kindling eve | the books vs the binders | ~ | M |
| patient-star | rescue expedition, three claimants | a thing descends two metres a day (9 counters) | Saro, the mother-church, the king | Y | M, then R at first meeting |
| quiet-in-the-sky | investigation-journey, ghost story | testing day | the Field and Halt | ~ | M |
| quittance | ensemble: twelve office-errands, each with its own deadline | Reckoning; 97 clock rules | rival Offices and brigades | Y | R (the Offices take adjusters) |
| sallowfield | negotiation before an approaching army | dusk each day; dice-thrown casualties | the Margrave's unpaid company | Y | E (a warning) |
| skeel | inquiry/trial | the Wreck Court in two days | a town that lives off wrecks | Y | E |
| skerrow | one-night siege by a caller that comes with the tide | tide, noon causeway | the caller (names of the drowned) | ~ | E |
| tallow | **expedition under resource pressure** | hunger gnaws at watch +72, rats, spate, spiders return +144; **no dated deadline** | smugglers, three peoples' leavings, fauna (10 `Temperament`) | – | M |
| the-dorothea | voyage: six landings | noon ebb, squall, stays | the House of Marchbank (leases lights and does not light them) | ~ | R (captain short of hands) |
| the-grand-tour | contest quest in a three-storey port | strike on day 4; the Door of Doors | rivals for the petals; a young lord who fell | Y (first through) | R (a proclamation) |
| the-long-man | investigation + race against a failing wall | storm 312, wall gives 396 (`watch`) | a steward selling bronze "teeth" from a wall that holds a lake | Y | R (a bounty for the wrong thing) |
| the-lull | rule-world, community drama | one day in seven | none | ~ | M |
| thrume | expedition + movement (quota wakes a mountain) | duke's host on the tenth; forty miners to be killed the second night | thanes, a quota-cutter, a duke | Y | M |
| what-tessary-owes | investigation with an answer, ten ordered Objectives | Feast of Settlement; events on nights 7, 10, 13 | the Valuers; lightermen | Y | R (an eel-wife's notice) |
| winter-in-carth | moral-economy trial | Ash Day; 48 autonomous state rules | the Consistory, the Commerce of Merit | Y | E |
| wrayford | standoff / siege-vigil | the captain at dusk of day 3; three bodies hang; 104 autonomous | reeve and lord's captain vs carters; a widow; a skimming clerk | Y (11 endings, "none clean") | E |
| wrongboat | pursuit (farce) | Bess and her lads follow by open ways | a toll-clerk | – | E |

**By engine** (JUDGED): investigation 7 (book-of-faces, low-water, parliament-of-books, skeel, tessary, long-man, quiet-in-the-sky); expedition 6 (tallow, muster, dorothea, let-one-remember, thrume, patient-star); festival or contest 5 (gosses, hessel, liberty, grand-tour, carth); siege or standoff 3 (wrayford, sallowfield, skerrow); rule-world or vigil 2 (house-that-grows, lull); errand-ensemble 2 (quittance, hollins); movement 1 (half-the-hive); pursuit 1 (wrongboat). Nobody in the corpus is a **tournament, a pilgrimage, a revival, a rebellion, a succession** or a **rival expedition**; "movement" is one module, and its movement is a single swarm.

### 2.3 The five standing modules and the library

| Module | Engine | Time | Opposes | Aims | Choice consequence | Violence from the situation | Opens on a request |
|---|---|---|---|---|---|---|---|
| **Silent Lord** (`situations/silent-lord`, 1,098 lines, 62 rules, 24 autonomous) | household intrigue to a dated decision (the feast) | feast on day `max(12, today+2)` **set when the company first enters** (`feast.kyr:36`); crier amends the notice on day 12 if never entered | a castellan with a will she cannot show, a herald with a false seal, a leaguer inside; no plain villain | Y (herald, castellan, chaplain, marshal, clerk) | four outcome states of the banner (regency, hushed, usurped, mutinous), a `hunted` state for the company, and a "week on" tail | Y: 6 `hostile/assails` asserts, a poisoning, forced doors, hounds | no: a crier's notice |
| **Bound Howe** (666 lines, 37 rules, 4 autonomous) | expedition into a half-robbed barrow with factions | **none**: weather dice and the household walking out at night | the Spade-Company (captain, level 4), the warden, the dead household, what lies under | ~ (three parties, no exclusive prize but the torc) | two outcome fates (`fate_sealed` / `fate_broken`) | Y but mechanical: `assails` fires from bells, flutes, a forced seal | no (a levy, hearsay of diggers) |
| **Numbered House** (925 lines, 55 rules, 6 autonomous) | exploration of a mechanism: answer the tablets, the House counts | none that matters: `hum_falls`, `ring_unjams`, `deck_rights` reset a lock | none (bookkeepers that outlived their books; 5 `Temperament` lines of fauna and an automaton) | – | the House's rival readings stay open | no (2 asserts) | no |
| **Fellowship** (196 lines, 1 rule) | errand with a drawn cause (proud / sold / lapsed / fallen) | **none** | none: every person `Peaceable`; the "cause" is a stance | – | one outcome `mended(order)` | none | yes: the head asks you to carry a summons |
| **Circus** (goings-on, 5,354 lines, 452 rules, 124 autonomous) | itinerant institution on a three-town circuit | pitches three days, strikes on the fourth | its debts and rival; 8 `Temperament` lines (menagerie) | ~ | per-act progress | not from the situation | no |

### 2.4 The first town's generated arcs (`data/generation/town/*.kyrt`, READ)

| Template | What it is | Shape | Momentum if nothing is done | Counted |
|---|---|---|---|---|
| `errands.kyrt` (willow, strayed goat, wants) | a neighbour asks | ask → fetch → a coin | none | 3 situations, 3/4 topics `once` |
| `ties.kyrt` (kin, debt, custom) | the innkeeper/merchant/priest wants a thing back from the nearest site | ask → fetch from site → `Give 10–14 gold` → an `Observe _after` on the green | none | 3 shapes, 6/6 `once`, 6/6 paid flat |
| `undertown.kyrt` (rats, dead, spiders, below, vault) | a posted job | notice → job → clear a room → return → pay | none | 14 `Objective`s, 15/15 `once`, 9 `Temperament` (every one a creature in a room) |
| `troubles.kyrt` (Hesper missing, pilgrim escort, theft ×2, animals ×2) | small mysteries | clue → accuse → paid; a wrong accusation has a cost | **Hesper goes at `watch >= 40` only if she has been told of**; no other | 11/11 `once` |
| `conflict.kyrt` (Rooke) | **a forger collects dues in three settlements** | seal → proof at the Hall or the posting-house → challenge / buy / report | **cosmetic**: the price rises and a hayrick burns at `watch` 48 and 120 (eight and twenty hours in) as `Observe` text only; no number, no person moves; after hour 120 nothing continues. The only consequences that run are the player's: `rooke_fall` at `watch >= 72` after a report | 7/7 `once`; the only template with an antagonist |
| `threads.kyrt` | eight pieces of hearsay (a coin, a credential, factor's letters, two chronicles, a veteran, a preacher, a plaque, a levy) | ask → learn a fact → `heard_threads + 1` | none by design ("none is an aim") | 8/8 `once` |
| `neighbours.kyrt`, `outskirts-deep.kyrt` | the Hall's household, a quarrel over the road-wood, the stones | speak to each once; a quarrel about oak and the herd is `Observe` text | none | 33/33 and 18/18 `once` |

So of the 14 distinct situations the first town can draw, **13 open as "someone asks you to fetch, find, carry or clear"**; one (Rooke) has an antagonist; none has a clock that outlasts the first day. The goings-on that ride on the same towns: drover (missing man), fever (fetch herbs), oldcoin (escort a scholar), players (pay a debt) are requests; quarrel (68 lines, 1 rule) and disputation (204 lines, 1 rule) are the two situations in which two parties want exclusive things, and both are tiny.

### 2.5 The table

Reproduce with `python3 scripts/dramatic-census.py`. Columns: `auto` is the autonomous clock rules, `auto_move` those that only move someone, `auto_state` those that change another state, `auto_count` those that raise or lower a number, `once` topics that can be asked once, `temper` `Temperament` lines, `hostile` asserts of `hostile`/`assails`, `signs` `Observe ... as sign`.

| module | lines | rules | clock | auto | auto_move | auto_state | auto_count | objectives | endings | topics | once | temper | hostile | signs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| book-of-faces | 12166 | 958 | 255 | 103 | 91 | 13 | 0 | 0 | 10 | 495 | 364 | 3 | 8 | 0 |
| gosses-company | 6449 | 543 | 125 | 110 | 54 | 79 | 7 | 11 | 19 | 275 | 185 | 5 | 1 | 0 |
| half-the-hive | 1990 | 182 | 35 | 23 | 14 | 14 | 1 | 0 | 9 | 112 | 100 | 0 | 3 | 10 |
| hessel | 2540 | 255 | 115 | 78 | 47 | 47 | 4 | 0 | 5 | 134 | 132 | 2 | 0 | 0 |
| hollins | 2274 | 163 | 60 | 41 | 20 | 24 | 3 | 20 | 9 | 118 | 118 | 3 | 4 | 17 |
| house-that-grows | 1178 | 66 | 22 | 18 | 6 | 15 | 2 | 0 | 3 | 51 | 31 | 2 | 0 | 0 |
| let-one-remember | 2266 | 91 | 26 | 24 | 6 | 13 | 9 | 7 | 0 | 92 | 66 | 0 | 0 | 0 |
| liberty-of-the-ice | 3193 | 280 | 102 | 86 | 60 | 37 | 1 | 0 | 11 | 117 | 115 | 2 | 3 | 0 |
| low-water | 3089 | 245 | 91 | 73 | 22 | 47 | 17 | 3 | 20 | 217 | 209 | 2 | 2 | 0 |
| muster | 1969 | 54 | 28 | 6 | 2 | 6 | 0 | 6 | 17 | 137 | 52 | 5 | 0 | 31 |
| parliament-of-books | 3806 | 181 | 64 | 56 | 21 | 49 | 2 | 12 | 8 | 245 | 245 | 1 | 1 | 0 |
| patient-star | 2732 | 154 | 33 | 26 | 3 | 14 | 9 | 7 | 0 | 73 | 72 | 1 | 1 | 0 |
| quiet-in-the-sky | 1913 | 155 | 64 | 58 | 21 | 38 | 3 | 0 | 7 | 104 | 98 | 3 | 0 | 25 |
| quittance | 6202 | 269 | 97 | 44 | 18 | 30 | 3 | 21 | 9 | 283 | 253 | 6 | 2 | 0 |
| sallowfield | 1114 | 104 | 42 | 6 | 0 | 6 | 0 | 5 | 16 | 37 | 16 | 0 | 0 | 0 |
| skeel | 1861 | 125 | 32 | 22 | 15 | 11 | 1 | 0 | 7 | 97 | 97 | 1 | 1 | 23 |
| skerrow | 766 | 56 | 33 | 7 | 0 | 4 | 1 | 2 | 9 | 30 | 16 | 0 | 0 | 0 |
| tallow | 1301 | 40 | 15 | 10 | 1 | 10 | 0 | 4 | 0 | 56 | 21 | 10 | 0 | 8 |
| the-dorothea | 2503 | 118 | 35 | 21 | 11 | 18 | 10 | 2 | 0 | 83 | 83 | 4 | 0 | 0 |
| the-grand-tour | 3399 | 268 | 84 | 49 | 37 | 15 | 1 | 0 | 11 | 157 | 157 | 0 | 4 | 39 |
| the-long-man | 994 | 54 | 25 | 24 | 14 | 12 | 0 | 3 | 0 | 44 | 27 | 2 | 2 | 0 |
| the-lull | 2114 | 197 | 55 | 49 | 28 | 30 | 3 | 2 | 5 | 108 | 97 | 4 | 7 | 6 |
| thrume | 1506 | 61 | 12 | 7 | 3 | 6 | 2 | 11 | 0 | 46 | 43 | 11 | 3 | 0 |
| what-tessary-owes | 2503 | 183 | 50 | 33 | 14 | 26 | 1 | 10 | 7 | 119 | 119 | 4 | 10 | 0 |
| winter-in-carth | 2456 | 253 | 83 | 68 | 40 | 48 | 4 | 4 | 6 | 108 | 107 | 4 | 0 | 0 |
| wrayford | 2891 | 243 | 118 | 104 | 49 | 65 | 5 | 5 | 11 | 107 | 106 | 0 | 9 | 0 |
| wrongboat | 1090 | 51 | 16 | 9 | 0 | 1 | 0 | 3 | 34 | 69 | 22 | 0 | 0 | 0 |
| S:arcology | 925 | 55 | 6 | 6 | 1 | 4 | 1 | 6 | 0 | 24 | 24 | 5 | 2 | 25 |
| S:bound-howe | 666 | 37 | 9 | 4 | 1 | 3 | 0 | 7 | 0 | 18 | 18 | 11 | 3 | 22 |
| S:brood-hollow | 160 | 3 | 1 | 1 | 0 | 0 | 1 | 5 | 0 | 9 | 4 | 0 | 0 | 0 |
| S:caught-below | 135 | 1 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 8 | 3 | 0 | 0 | 0 |
| S:den | 110 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| S:fellowship | 196 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 16 | 16 | 0 | 0 | 0 |
| S:silent-lord | 1098 | 62 | 24 | 24 | 4 | 20 | 0 | 8 | 0 | 54 | 51 | 5 | 6 | 7 |
| S:unquiet-tower | 275 | 6 | 2 | 2 | 2 | 0 | 1 | 4 | 0 | 12 | 8 | 0 | 0 | 0 |
| G:circus | 5354 | 452 | 166 | 124 | 31 | 100 | 25 | 9 | 0 | 276 | 222 | 8 | 0 | 5 |
| G:disputation | 204 | 1 | 1 | 1 | 0 | 1 | 0 | 2 | 0 | 3 | 3 | 0 | 0 | 1 |
| G:drover | 240 | 8 | 4 | 1 | 1 | 1 | 0 | 5 | 0 | 19 | 15 | 0 | 0 | 3 |
| G:factors | 405 | 22 | 8 | 5 | 5 | 2 | 1 | 2 | 0 | 16 | 12 | 4 | 0 | 0 |
| G:fever | 87 | 4 | 3 | 3 | 0 | 3 | 0 | 4 | 0 | 9 | 7 | 0 | 0 | 0 |
| G:oldcoin | 54 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 6 | 6 | 0 | 0 | 0 |
| G:players | 189 | 5 | 2 | 2 | 0 | 2 | 0 | 2 | 0 | 10 | 10 | 0 | 0 | 0 |
| G:quarrel | 68 | 1 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 6 | 5 | 0 | 0 | 0 |
| **adventures total** | 76265 | 5349 | 1717 | 1155 | 597 | 678 | 89 | 138 | 233 | 3514 | 2951 | 75 | 61 | 159 |

Two modules the table flags that the reviews did not: **Sallowfield** has 104 rules but only 6 autonomous and 16 `once` of 37 topics; its pressure is dice-thrown casualties when the army arrives (`stands1(?p) … dice(?v) > 8`), a good small siege model that the corpus has not copied. **Muster** (54 rules) and **Tallow** (40 rules) are the two smallest rule sets among the expeditions, and they are the two with the highest share of terrain-and-resource rules (weather by `dice(clock)`, hunger by `gnawAt`).

### 2.6 `bin/kyrie lint`, all 29 campaigns (COUNTED)

`bin/kyrie lint data/campaigns/<c>.campaign.json` on all 29 campaigns (about 50 seconds each): **0 errors anywhere; 14 warnings** (Quittance 9, Book of Faces 3, Liberty of the Ice 1, Thrume 1) and 435 pieces of advice. The advice that bears on drama is the **261 `write-only`** notes: a relation or measure the module sets and nothing reads, which is a consequence the world does not take up (or a thread left for another module). Per campaign: Quittance 55, Low Water 20, Hessel 19, Parliament of Books 19, the Dorothea 19, the Grand Tour 19, the Lull 15, Book of Faces 13, Tessary 13, Liberty of the Ice 11, the Third Night 11, Let One Remember 8, Hold One Season 7, Patient Star 7, Skeel 7, Gosse's Company 5, Half the Hive 4, the House that Grows 4, the Long Man 3, Carth 2; **none** in Hollins, Muster, Sallowfield, Skerrow, Tallow, Thrume, the Quiet in the Sky and Wrongboat. The other advice is 95 `role` (a role that is true "wherever they are"), 35 `anchor`, 13 `target`, 10 `lowered`, 7 `greeting`. The modules with none are mostly small (Hollins, Skerrow, Sallowfield, Wrongboat); the ones with most are the large anthologies and ledger-cities, whose states are written for an ending and never consulted in play. (Reproduce with the command above.)

## 3. (b) The seven grammars that repeat

Each is a way the data is shaped, not a subject. "Reduces to" is a judgment, with counts where I have them.

**G1. The dated reckoning.** A public event on day N (a verdict, a feast, a thaw, a hearing, a storm), a timetable of who is where, and an ending chosen by what the company knew and favoured. 26 of 27 adventures, and the Silent Lord. It is the corpus's native form, so it does not distinguish anything; what distinguishes is whether the days before the reckoning *change* (Wrayford, Tessary's nights 7/10/13, the Long Man's wall) or only *wait* (Hessel's calendar is a schedule of a ball). The weakness: **the reckoning is almost always the same kind of event, a ruling**, and the company is almost always a witness or a late ballot.

**G2. The ledger.** The thing that is forged, misread, owed or sealed is a *document*: a seal, receipt, licence, tally, charter, register. Frequency of `seal|receipt|ledger|tally|licence|register|charter|writ|deed|forged` per line: Fellowship 12%, Bound Howe 8%, Tessary 7%, Silent Lord 7%, then 4% in Low Water, Parliament, Skeel, Long Man, Carth, Let One Remember, and the first town's templates; near zero only in House that Grows, the Lull and Wrongboat. Four of the five newest pieces (Rooke's wheel with no wing, the Silent Lord's two seals and the clerk's forged hand, the Bound Howe's survey plate and tally-stick, the fellowship's split tally) hinge on a forged or misread object. It is a good idea (the Empire is a bureaucracy) used so often that "find the document and compare it" has become the standard investigation.

**G3. The altered law.** One law of nature or society is bent, a town has adapted its customs, and the solution is to understand the rule. Lull (meaning), House that Grows (attention), Patient Star (light), Let One Remember (memory), Quiet in the Sky (sound), Parliament of Books (books speak), Half the Hive (smell), Liberty of the Ice (deals land on the thaw). **Eight adventures.** They share a rumour shape ("a place where X; the people say Y"), a tone, and an ending by rule-literacy. This is the most replaceable cluster: the rule is the story, and eight rules are eight good ideas that play alike.

**G4. The errand.** Someone asks, you fetch or clear or carry, you are paid a flat sum. 13 of the first town's 14 situations; drover, fever, oldcoin, players of the goings-on; the hire openings of Hollins, Dorothea, Patient Star, Tessary. It is correct for a first hour (M20's opening is a debt and jobs); it is wrong as the grammar of the *whole* region.

**G5. The lock and its tell.** An `Observe … as sign` or a clue reveals a fact, a topic or an action is gated on `knows`, the action succeeds, a state changes. Every module; the Silent Lord's 17 mechanisms table is this exactly ("clue / operation / consequence"), as are the Bound Howe's flutes and the House's tablets. It supports ability-specific play (one reads tracks, one counts breath), but only 159 `as sign` observations exist and **19 of 27 adventures have none**.

**G6. The room with a creature.** A `Lair`, `Guards` or `Temperament territorial` creature in a named room, to be killed, avoided or bought off. 77 of 108 `Temperament` lines; every undertown job, the outskirts' wisps/revenant/bats, the den, the tower, brood-hollow; Tallow's spiders. The creature has no aim, it has an address.

**G7. The testimony tour.** A world revealed by asking each of many people one thing. Low Water 209 of 217 topics `once`, Parliament 245 of 245, Skeel 97 of 97, Hessel 132 of 134, Dorothea 83 of 83, Tessary 119 of 119. It is graceful at its best (Low Water's 24 people hold 217 topics) and inert when the topics carry no `On discuss` (35% of the corpus).

What is **missing** as a grammar: rival expeditions that arrive whether or not the company does; a movement that is joined, spread, split or suppressed; a succession that turns violent; a pursuit that narrows the player's options (Wrongboat is a comedy of it); a siege in which resources run out and loyalties fail (Sallowfield and Wrayford are close); a tournament or a pilgrimage; a place that sustains repeated expeditions with changing state.

## 4. (c) Authoring conventions that produce shallow situations

1. **`Topic … once`.** 84% of adventure topics, 98% of first-town topics. A person who is asked once and has nothing more to say is an informant, not a person; no return visit gives anything. The cure in the corpus is gating on `knows` (Grand Tour: 157 of 157 are `once` but 123 are gated on what the company knows, so each *opens* when something changes) or a `Greets again`; the first-town templates have neither (2 of 110 first-town topics are not `once`; `neighbours.kyrt` has 4 `Greets`).
2. **The informant's `Greets`.** 1,259 `Greets` lines in the adventures; the corpus reviews counted ~200 "looks at you" openers and a house style in two modules (Grand Tour 111, Wrayford 84). A greeting that is a gesture does not state what the person wants from *you*.
3. **A flat reward ends every errand.** `ties.kyrt`: `Give 14 gold`, `12 gold`, `10 gold`; `errands.kyrt`: `Increase quantity(party, gold) by 1`; `troubles.kyrt` `Give 10 gold` / `6 gold` / `8 gold`. The only consequence of a solved errand is a line of `Observe _after at green`. Nothing about the town's relations, access or exposure changes.
4. **A wrong answer is a cost, not a different story.** `theft`: accuse right (8 gold), accuse wrong (the traveller or the girl is punished, `Observe _wrong_after`). It is the best choice in the templates and it is still binary; no one else in the town has a stake in who is guilty.
5. **Clock as description.** Rooke's escalation (`dues_up`, `dues_burn`, `dues_b`) is three `Observe` statements at `watch` 48 and 120: **text**, not state. Nobody's behaviour depends on it; after twenty hours nothing continues. The corpus does have real escalation (the Long Man's leak, Sallowfield's casualties, Low Water's 17 counters), but the generated first town does not use it.
6. **Peaceable by default.** Nine people in ten are `Peaceable`; the `Warns` and `Comes` of the other tenth are lines for a creature, so the only way the company meets a person who wants to hurt them is a hazard, a creature, or one of 61 `hostile` asserts, most set `On failure` of a check. In the first town's templates the only people with a `Temperament` are Rooke's two level-1 deserters, who "have not been asked to do anything yet", and the creatures.
7. **`Observe` outnumbers `Action` two to one.** 4,511 against 2,215. Most things in a place are described; fewer can be operated, and fewer still change another place. The commission's "mechanism in one room alters another" appears in the three exemplary modules and a handful of others (Tallow's sluice, the Long Man's gates), not as a convention.
8. **The hearsay rumour.** All 27 country rumours are told in one register by `{keeper}` ("Up the north road there is X. They say Y."); 5 have a posted notice. A player sees 27 sentences of the same length (mean 396 characters) that differ in noun.
9. **Anthology style.** Quittance's twelve office-errands and Winter in Carth's proxies are small adventures sharing a ledger metaphor; each is a one-person request with a deadline. They are the corpus's best answer to "many small things", and the template for the generated first town to imitate.
10. **Boolean pressure.** Seven modules have three or fewer `Measure`s; a state that cannot grow cannot escalate.

## 5. (d) Recommendations

### 5.1 Consolidation, deactivation, archival (nothing deleted)

**Nothing is clearly dead and unreferenced.** Checked: every `.kyr` under `adventures/`, `situations/`, `goings-on/` is named by a `module.json` or, for `gosses-company/road/*.kyr` and `drover/oxen`, by a campaign or a second module; `caught-below` is registered by no scenario but is used by three test fixtures and several design documents; `hold-one-season` and `the-third-night` are used by tests; `weir` in `data/generation/history/arts.json` is a name with no plan behind it (a one-line dangling reference listed in editorial-map §3; deleting it changes seed draws and is for the owner of that file). So the list below is for decisions, not for this branch.

| Candidate | Action | Reason (COUNTED or READ) |
|---|---|---|
| `countries.json` pool as a whole | **rotate, don't prune**: each first country draws a few of the 27 provinces; add a weight or a per-seed subset so that the draws prefer modules with a request, a clock that outlasts day 1, or a living antagonist | 27 hearsay rumours of one shape compete with the first town's 13 errands; blind play found new modules hard to find against direct leads |
| `skerrow` into `the-dorothea` | **consolidate**: Skerrow is the Dorothea's destination ("a lamp on it, older than the roads"); two rumours (a lighthouse at a causeway; a ketch that sails to an island nobody goes to) point at one place | one is a night and a day (766 lines, 56 rules); the other a voyage whose last landing is the same island; Dorothea has **no `Ending`**, Skerrow has nine |
| `let-one-remember` | **second pass or archive as an Act** | 91 rules, **no `Ending`**, 54 people / 90 topics / 151 places: breadth over play; "Act II" in a chain of five that the corpus holds only in part |
| `patient-star` | **second pass** (and keep its legacy campaign) | **no `Ending`**; but a real three-claimant conflict and a descending clock (9 counters); needs outcomes, not removal |
| `the-lull`, `house-that-grows`, `quiet-in-the-sky` (G3) | **rotation candidates**: hold two of the eight "altered law" modules back per world | five or six of eight bend one law and read alike; keep Patient Star and Lull as the contrasting two, plus Half the Hive, which has a *decision* |
| `wrongboat` | **keep, but rare**: it is the only pursuit | 34 endings, 22 of 69 topics `once` (the most replayable talk in the corpus); a comedy that should not be the first thing met |
| `goings-on/oldcoin` (54 lines, 0 rules) and `goings-on/quarrel` (68 lines, 1 rule) | **fold into one shared-state conflict** (§5.3): the scholar's coin and the stones that moved are the thin edge of an enthusiasm that does not yet exist | the smallest two situations in the library, both `weight 2–3` draws |
| `situations/den` (110 lines, 0 rules), `caught-below` (135, 1 rule, unregistered) | **keep as base layers**, register `caught-below` or note it dormant in `dormant.json` | they are inputs for generators, not stories |
| first-town `threads.kyrt` (8 hearsay) | **keep, and let three of them acquire a state** (§5.3): the preacher, the levy, the grant of the road | they are seeds; at present nothing grows from them |
| `quittance` `q_*.kyr` (twelve files) | **a second pass for the weakest three** before adding anything | the corpus's largest anthology; its lint notes are mostly "written and never read" (§2.6): consequences nothing reads |
| `data/generation/town/ties.kyrt` | **consolidate** `kin`/`debt`/`custom` into one shape with a stake for a third party | all three are the same sequence |

### 5.2 Where to build an enthusiasm: the six best places and institutions that exist (JUDGED, ranked)

The criteria: more than one actor with a divergent interest already exists in the data; a shared fact already crosses places; a dated or counted state could carry it; nothing needs engine work.

1. **The Keepers of the Road, with Rooke's dues and the Office's seal** (`threads.kyrt` preacher; `conflict.kyrt`; the Hall's grant; the posting-house). The preacher teaches that the road is a gift to be kept for its givers' return and tells folk "to pay the numbered posts"; the bailiff collects the dues in the Office's name over a forged seal in **three settlements at once**; the posting-house has "road-wardens" who are robbers charging a toll at the old post. The campaign seed note says the movement is open to "faith, fashion or policy; who funds it". Two people already know the same fact from two ends, and the Hall holds the proof.
2. **The Hall and its road-wood** (`neighbours.kyrt`, `outskirts-deep.kyrt`): a steward who has counted fourteen spoons for eleven years, a cook feeding forty on a budget for ten, a gamekeeper told to let nobody cut, a reeve (Aldous Fenn) whose boat-wrights are short of oak, a priest (Brother Anselm Tarr) and an apprentice (Hesper Lowe) who needs bronze. The quarrel is `Observe` text today; every party in it has an interest in a movement that says the road is sacred.
3. **The fellowship's halls** (`situations/fellowship`, four towns, a head, a treasurer, a recorder, a warden, a keeper whose hall is silent *because* proud / sold / lapsed / fallen). A guild, a garrison or a chapter is an institution with an internal disagreement already stated; at present the disagreement is resolved by one errand. Give the four halls a vote and it becomes a schism.
4. **The Silent Lord's keep and its levy** (`silent-lord`: crier on the home green, a levy-writ, deserters on the road): the one module whose consequences already reach the *first town* (a rewritten notice, riders, deserters on the road after the Reckoning). It is a ready host for the fear that an enthusiasm becomes a muster.
5. **Wapshott's Circus** (3,000 lines of troupe, menagerie, ledger; a three-day pitch in three towns): a visiting enthusiasm, with revelry as its natural form and debts as its natural flaw.
6. **The disputation on the green** (`goings-on/disputation`: the One, the Flow, a sophist who argues either side for pay): the only authored *fashion* in the data, two sects on a market day, with a settled answer "for whoever has found it". Seven or eight sentences away from a following.
(Seventh, the Bound Howe's salvage crew, the warden and the shire-reeve's clerk, is a conflict of interests over a thing, not a following.)

### 5.3 One enthusiasm across four places: **the Numbering of the Road**

**Where.** The first town (a), its nearest neighbour village (b, Rooke's table), the hamlet (c, the road-wood), the Hall; and the posting-house where the country has one. No new place is built: each already exists in `town/*.kyrt` and in the posting-house plan.

**What it is.** A revival of the Keepers of the Road, spreading from the preacher in the first town: people walk out on market days in procession to the numbered posts, clear the verge, pay a "stone-penny" (the dues, now willingly), and say that whoever keeps the road clear will be carried when the givers return. It is also the first reason in a generation for the three settlements to do anything together.

**Who wants what (all existing people, with the aim added):**
| Actor (file) | Wants | Cannot accept |
|---|---|---|
| Thessaly Brandt, preacher, cleric 2 (`threads.kyrt`) | the whole road walked and kept; sincere | the dues being a business |
| Maudlin Rooke, thief 3, and her two deserters (`conflict.kyrt`) | the dues to become a custom she holds the seal for, then a purse she leaves with | the seal examined; the preacher's sincerity (it spoils the price) |
| Aldous Fenn, reeve of the wood-wardens (`neighbours.kyrt`) | the road-wood opened to the boat-wrights; the Hall humbled | a movement that says the verge is sacred and chained |
| The Hall's steward and gamekeeper Wystan Hale (`outskirts-deep.kyrt`) | the family's right "in the ground about" the road kept; the chain on the oak | the grant read aloud in the muniments: "fifty paces either side belong to the road" |
| Brother Anselm Tarr, priest (`neighbours.kyrt`) | the shrine's offerings, the proper rites | a rival devotion that spends the shrine's coppers on posts |
| The innkeeper and merchant (`conflict.kyrt`, `neighbours.kyrt`) | custom; a market day full of walkers | losing the factor who buys old bronze (`goings-on/factors`) |
| The stationmaster/lamp-keeper and "road-wardens" (`roadstation.kyrt`) | a destination for the walkers; or the toll | being named the movement's goal |

**Shared state (new Kyr, no engine change):** `devotion(settlement)` 0 to 10 in each of a, b, c; `dues(town)` in crowns; `split(keepers)`; `seal_known(forged)` already exists (`{t}_forged`); `chain(roadwood)` open/chained; `armed(procession)`. Rules keyed on `day(clock)` raise devotion where a market day falls; dues rise with devotion; the bailiff's table moves between the three greens by day (the pattern is the Silent Lord's `p1…p8`).

**If the player does nothing (ten days; the timeline each rule can enforce):**
- Day 1–2: Brandt preaches in a; Rooke's table in b takes four crowns a hearth; devotion 2/1/0.
- Day 3: market day in b: the first procession; Fenn's boat-wrights jeer; dues five crowns; devotion 4/3/1. Anselm preaches against "numbering what has no number".
- Day 4: in c the road-wood chain is cut at night: devotion 4/4/5, the gamekeeper raises the Hall's complaint.
- Day 5: the Hall's steward sends a letter to the castellan; a hayrick at b burns (as in the existing text, but now a *cause*: the boat-wrights or the wardens); dues six.
- Day 6: a second procession reaches the posting-house; the road-wardens (robbers charging a toll) and the walkers meet. **First flashpoint**: a toll refused, a donkey seized; walkers hurt.
- Day 7: the movement **splits**: Brandt's "Keepers" refuse the dues, Rooke's "Collectors" keep them. Devotion falls at a, rises at b and c.
- Day 8: Anselm accuses the preacher of heresy to the castellan; the castellan's rider takes down Rooke's table *if the seal has been reported*; otherwise Rooke leaves on day 9 with the purse (the existing `rooke_flee`).
- Day 9: the factor buys the numbered posts' bronze fittings from a farmer who sold them; the Keepers discover it. **Second flashpoint**: the factor's cart, the preacher, and eleven walkers on one green.
- Day 10: the Hall and the reeve settle the road-wood by deed; the movement is *domesticated* (the Hall funds a lamp at the stones) or *persecuted* (the castellan's riders) depending on who is accused.

**Flashpoints with a combat reason** (each needs no new capability): the bailiff's two men when the seal is challenged (exists; level 1; make them level 2 and give them a cousin), the road-wardens at the posting-house toll, the boat-wrights at the chain, the factor's carters. **Choices with different consequences**: expose the seal at the Hall (the Hall gains the road-wood), expose it before the queue (a fight, the walkers divided), buy it for half (devotion up, the Hall suspicious), report it to the castellan (the rider, the movement domesticated), side with the preacher and quietly turn the dues over to her. A *ranger* reads that the chain was cut from inside (the gamekeeper's own boot-marks); a *warrior* reads which of the wardens' men are not paid; a *cleric* understands the oath behind "paying the post"; a *thief* sees that the Hall's muniments door has been left on the latch. The existing `Observe … as sign noticed by perception` form (e.g. the revenant's groove) is the vehicle.

**Missing capability (named, not built):** a **report of what happened elsewhere** reaches the company only through `Observe` text at the place or a topic; there is no generic "word reaches the company" that would let day 4's cut chain be *heard* at the inn without a rule per room. I would propose it as a narrow request if the integrator confirms it is missing; I have not reproduced it (no play was done) so I have not added it to `kyr-deem-requests.md`.

## 6. (e) The three exemplary modules and the fellowship, assessed honestly

**What the commission asked for.** Three modules with substantially different dramatic engines; one connecting places and institutions through shared state; one extensive and dangerous; all giving skills, equipment, spells, ingenuity, combat, negotiation and persistent consequences scope.

**The Silent Lord is the only one of the three with a dramatic engine of the kind the commission names**: a household that has agreed to behave as though its lord were alive, a herald with a false seal, a captive with the true one, five parties with exclusive aims and a feast that decides. It has 21 greetings, 54 topics, 17 actions, 10 checks, a banner with four outcome states, and consequences that reach the first town (the crier's notice rewritten, riders and deserters on the road, a heir "a week on"). Its failures: (1) **its clock does not run until the company enters**: `Rule entering when within(party, hold) … Set feastDay(house) to max(12, day(clock) + 2)`; if the company never goes in the keep is frozen, and the only thing that moves is the crier's notice ("postponed, the lord being indisposed"). The commission's "what happens if the player does nothing" has the answer *nothing*. (2) **It is the ledger grammar (G2) twice over**: two seals and a forged hand. (3) **Its violence is gated behind accusations**: the combat reasons are real (hounds, bravos, a poisoned herald), but the household does not move against the company on its own initiative. (4) **The first town sees only a crier.** The levy is the one piece of authored consequence outside the keep, and it is a notice.

**The Bound Howe is an expedition map with factions in the lee, not an expedition.** It is the most dangerous place in the starting country (11 `Temperament` lines, levels 3 to 13; a ranged ambush at the forecourt; a drowned passage; a well), and its map of 23 places has real architecture (a rope and a sump, a seal that can be rolled, forced or sounded, flutes that answer or shriek, bells that wake riders). But: **it has no clock**. The only autonomous rules are weather dice and the household walking out at night and back at dawn. The "salvage crew digs for the gold" is static: the Spade-Company's captain, four diggers and two sentries have a `Lair` and a disposition (`tolerates`), nothing makes them advance the trench or break in while the company is away. The commission's "rival expeditions enter a ruin" is, at present, a camp outside one. If the company does nothing, nothing happens. Its social layer (the warden, the clerk who wants the torc, the levy) is three informants. It also uses the ledger (a plate, a survey, a tally).

**The Numbered House is a wonder, not a drama, and its engine is a lock.** Answer the tablets, the House hums, the lamps fill, a stair is allotted. The dramatic question ("who is a house for, and who counts the people in it?") is the best sentence in the three. The moves are G5 (sign, knowledge, gated action). It has **no opponent who acts**: 5 `Temperament` lines, all fauna or a keeper-automaton, 6 clock rules, all of them resetting a mechanism (`hum_falls`, `ring_unjams`, `deck_rights`). Its "rival readings" and "someone has been in with a lantern and left a tin" are static. Its first beat is a rumour, then a road bend. It is rich in ability-specific play (6 `capable(`) and in the unusual, and the only one of the three with a joke (the kettle on the hob); it has no emotional range beyond awe and unease, no one to like and no one to be afraid of.

**Where they overlap.** (1) All three are *places you enter*: pressure starts on entry, not on the world. (2) All three convert a **tell into a key** (G5). (3) Two of the three use a **forged or misread document** (G2). (4) None has a rival who arrives; none has a person who attacks first; none has a way for the first town to *change* while the company is inside (the one exception is the Silent Lord's levy). (5) None has a request-for-help opening: all are found by hearsay or a posted notice. (6) The emotional palette is severe: awe (House), dread (Howe), tension (Lord); delight, affection, camaraderie, absurdity and triumph are each present in one or two lines and nowhere as the engine.

**What they lack against the commission.** Momentum if nothing is done (Howe, House), an antagonist who acts (House, Howe), rival expeditions (all), ability-specific play (Howe 0 `capable(`, Lord 0; both use items and checks), combat that arises from the social situation (the Lord only), a request to anchor the opening (all), humour and release (rhythm: tension then release is not authored), and **shared state across places** beyond the Lord's levy.

**The fellowship is an errand with a drawn cause**, not a conflict. Four halls, a head, three offices, a keeper, an apprentice, four merchants, a drawn price. It has 1 rule, 0 clock rules, 16 topics (all `once`), 10 actions of a single shape (tend, press, redeem, study), no `Temperament`, every person `Peaceable`. It *is* varied (the cause is one of four, the silent hall one of three, the merchant one of four: 4×3×4 = 48 combinations, coherently), and it demonstrates the smallest useful Deem mechanism well. But the "incompatible purposes" are stances (the keeper is proud / sold / fallen / lapsed), not parties; "what if the player does nothing" is the head's roll stays unticked forever; there is no one who gains if the hall stays silent. As a base for an enthusiasm it is excellent (§5.2 no. 3); as an adventure it is a fetch.

## 7. (f) For future independent authors: do and do not

**Do**
1. Start from *the day before the company arrives*: who wants what, who is in the way, what they will do on day 3 whether or not anyone helps. Write the day-3 rule **first**.
2. Give every antagonist an aim and a method that can be **told apart from a room** (a `Rule` that moves them or changes a number), and give the company a way to be **in the way** of it.
3. Make at least two parties want exclusive things, and make the ending depend on who got it.
4. Raise a **number** under a clock (`Increase dues by 1`, `Decrease stores by 2`), not only a boolean; a state that cannot grow cannot escalate.
5. Let a topic be asked again when the world has changed (`when knows(…)`; `Greets again`); never write one topic per person and stop.
6. Make the reward a **relationship, access or exposure**, not a flat sum: the town opens a door, a debt is called in, a name is known.
7. Use `Observe … as sign` and `Action … Requires capable(…)` so that a ranger, a thief, a cleric and a warrior notice and do different things in the same room.
8. Give danger a reason: retainers guarding an employer, rival explorers, fanatics defending a sanctuary. Let violence come out of the social situation (a challenge, a seizure, a refusal), and let some opponents be better than the company so the right move is to leave.
9. Let places affect each other: a mechanism in one room alters another; a decision in one town changes a notice in the next.
10. Write the rhythm: a tense scene, then a release; a severe line, then a dry one. Voices differ: the aristocrat, the frightened villager, the antiquarian, the reckless young warrior must not share one smooth register.
11. Prefer to remove a weak scene to adding a third.

**Do not**
1. Do not open on "a person asks for help" unless the request is wrong, partial or contested. A first request is a start; a request that is also a lie is a plot.
2. Do not write `Topic … when true once` for a person who has anything to want. One-shot talk is the corpus's commonest shallow form (84%).
3. Do not make the second act of a mystery a trip to a room with a creature in it (G6). A creature needs an aim.
4. Do not escalate by `Observe` text. A rising price that no rule reads is wallpaper.
5. Do not use the document-forgery as the only investigation (G2). Find something that is not paper.
6. Do not default every person to `Peaceable`; decide who would hit someone, and why, and when.
7. Do not put the pressure behind a gate the company must open to start the clock (the Silent Lord's `entering` rule, the Howe's absent one): let the world go on without them.
8. Do not decorate a choice with colours; establish the underlying fact and action (`doc/authoring/trail/10-scenes-and-opportunities.md`), and let the page's aspects be meaning.
9. Do not add the ninth "altered law" or the fourteenth first-town errand until a conflict with a clock exists.
10. Do not begin every speech with a look. "She looks at you" is the corpus's default first beat (about 200 uses): spend it once per module.

## 8. What was verified

**IMPLEMENTED:** this page; `scripts/dramatic-census.py` (reproduces §2.1 and §2.5). **AUTOMATICALLY VERIFIED:** `bin/kyrie lint` over the 29 campaigns (§2.6): errors and warnings as listed; the census script is read-only. **ACTUALLY PLAYED:** nothing. I did not run the page, the autoplay laboratory, `bin/kyrie reach` or any transcript, and I used no teleport or script as a substitute for play. The classification columns are judgment and the counts are lexical; claims about "what happens if the player does nothing" are inferences from reading the rules and are the first thing a playtest should check (the Silent Lord's frozen keep, the Howe's static salvagers, and Rooke's twenty-hour clock can each be confirmed in a few steps by waiting).
