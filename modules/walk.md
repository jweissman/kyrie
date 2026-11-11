# Module 4: The Walk of the Milestones (an enthusiasm that moves along four towns)

*11 November 2026. Branch `adventure/p3-enthusiasm`, from `adventure/first-steps`. Written before the Kyr; the last section says what was built, proved and not proved. Status words are used strictly: IMPLEMENTED (data on this branch, compiled in the audited seeds), AUTOMATICALLY VERIFIED (a spec), ACTUALLY PLAYED (a scripted journey by public actions; the transcripts say what was scripted).*

## 0. Choice of movement, and why

Candidates weighed: a pilgrimage to a spring, a prophetic revival, a mystery cult of the recovered past, a season of revelry, a reform movement, a tournament fever. The first country already has, in its own history, one thing every town stands on and none uses: **the old road** (the Office of the Road, its milestones, the wheel-with-a-wing seal), and one live quarrel about it: the false bailiff Maudlin Rooke collecting "dues for the keeping of the road" on a forged seal. A movement that **walks the road** therefore needs no invented geography. It is a pilgrimage (it moves, so it touches every town in turn), a revival (it has a prophet), a cult of the recovered past (the Office will come again), and a reform movement (the road belongs to the wayfarer, not the bailiff) in the one body, and which of these a seed's Walk is, is Deem's draw. It spreads by **bands**, one to a town on a timetable, so that a company that stands in one green on the third day and another on the seventh sees the same thing grown. A tournament or a spring would sit in one place; revelry has no institution that must answer for it. The road gives the magistrate a reason to suppress (assembly, dues, disorder), the priesthood a reason to split (is the walk a prayer or a heresy?), a patron a reason to pay (a walking crowd is a lever), and merchants a reason to both profit and resent.

**The Walk.** Each walker keeps a mile barefoot, calls its number at its stone, and chalks it. They greet "Mile and mile," and are answered "And mile." They bring ash staves. On the tenth day the host is to meet at the old Station (the milestone and its roofed rest) of one town, drawn per country, to speak "the names of the road": everyone who died on it. What the Walk is *for* is drawn: **remembrance** (the Keepers of the Road will return when every mile is spoken), **penance** (the road carried the dead away from the Empire and must be walked back) or **reform** (the road is no one's, and no one may take a toll on it).

**Considered and adapted: the assessment's "Numbering of the Road"** (`adventure/p3-assessment`, §5.3). Its sketch builds on the first town's own actors (Brandt the preacher, Rooke's table, Fenn, the Hall's steward). Those are people of the region module, which exports only greens, innkeepers, priests, merchants and travellers (R38): a scenario module cannot import them, read their state or move their clocks, so Rooke's pressure cannot be made a multi-day escalation from outside without the engine request (appended as R85: export every id a town template declares). I kept the sketch's best parts (a ten-day do-nothing timeline, a day-6/7 split, two flashpoints, the dues as a cause) and put them in my own cast, with the Walk's refusal of "dues for the keeping of the road" as the reform creed's grievance and Dray's complaint about "a woman with a lead seal" naming Rooke in words. Where the sketch has a procession in three settlements I have four bands on a road timetable, and a bailiff and patron who are in the Walk's way by purpose rather than by hearsay.

## 1. Where it stands in the world

A standing scenario (`data/scenarios/walking.scenario.json`, one line to add to `data/scenarios/standing.json`): roles `a` (the largest settlement, the first town: where the company begins), `b` (along from a), `c`, `d`; it shares their greens, innkeepers, priests and merchants with whatever else is there, and adds rooms of its own to each town (the Walkers' camp, the Station) and, at `a`, the moot-house where the bailiff sits. Module id `walk`, installed ids `walk__…`. It is told of by the first innkeepers (scenario hook) and, mainly, **by the world itself**: on the second day a band of walkers comes onto the first green singing and chalking the well-stone; the stall, the chalk and the notice that follow are all on the green (see 9).

## 2. Who wants what (incompatible, none a plain villain)

| Who | Wants | Holds | Voice |
|---|---|---|---|
| **The Mile-Keeper** (leader; kind drawn: a lame drover, a discharged soldier, a widow, a novice, by creed) | The host at the Station by the tenth day, the names spoken; he is coughing blood and will not say | the Walk's loyalty | declaims in refrains, short breath: "Mile and mile and mile." |
| **Pettifer Gule** (the opportunist) | A living out of the host; and he is paid by someone | the tithe-box, the chalk stall, the patron's purse | patter, "my friend, my friend", numbers, a little too warm |
| **Annet Marl** (the grieving) | To speak her boy's name at the Station; she has no other place to put it | the roll of the road's dead, 41 names | halting, small concrete things, trailing off |
| **The Dunning lads** (bored youth) | A good thing to be in; a race, a fight, a girl | their stave-fighting, their dares | quick slang, boasting, "go on then" |
| **Brother Gaunt** (the Stave-Brethren) | The Walk kept pure; no Bench, no Opportunist, no compromise; the sanctuary held | four staves and the Station's stair | scripture-short, imperatives, never raises his voice |
| **Sister Wenna** (curate, young) | Her church to bless what is good in the Walk | the old priest's confidence, until the sixth day | breathless, long run-on sentences |
| **The elder priest** (each town's own priest) | Order of worship; the road is not holy, the altar is | the interdict (the shrine door chained) | liturgical, measured, grieved |
| **Bailiff Corwen Dray** | The Hundred quiet; no assembly above twelve without the Bench's leave; to be let off the hook of the Marcher | the Bench's men, the notice, the moot-house seat | clipped, "Item.", dry |
| **Sergeant Hask** (the Marcher's riders) | Order delivered; a price per head | six riders from outside the Hundred; frightening | few words, courteous, final |
| **The patron's steward, Master Orme** | The Walk used: its crowd to unseat Dray and seat the patron's man; the patron's identity drawn (a dowager grieving her son, a Warden's cousin, a wool-factor who wants the road free of tolls) | the purse | elliptical, careful, never names her |
| **The merchants and innkeepers** (the first towns' own) | profit (bread sold out at a good price) or resentment (pilgrims sleeping in the yard, no regulars): drawn per town | the stock | a profiteer's expansiveness; a regular's grumble |

## 3. The clock (ten days; it runs whether or not anyone acts)

* D2 a band of walkers comes to the first green; Pettifer's stall opens. **host(a)** 1.
* D3 Bailiff Dray rides into the first town with three men and nails the notice (no assembly above twelve without leave); the first town's priest preaches against it from the shrine step. Orme's first night: a purse to Pettifer at the camp.
* D4 the Walk goes on to the second town (leader, stall, grieving, lads move with the front), where a band stands before it. host(b) 1.
* D5 the notice is posted along the road; bread is short in a, long in the pockets of whoever sells it.
* D6 the Walk is at the third town; Sister Wenna leaves the first town's shrine for it and the elder chains the door (**interdict**: a hall shut). At c the Dunning lads chalk the Bench's door and **Dray's corporal calls out the eldest**: a duel to be.
* D8 the Walk is at the fourth town; Gaunt and his staves come to the host. A mounted troop is on the road. A horse-trader at the first green says so.
* D9 the host comes to the Gathering town (the **flashpoint**, drawn). Dray, with the Marcher's riders, posts an ultimatum on the Station door: disperse by noon on the tenth day.
* D9 night: **the raid** on the camp, unless prevented.
* D10 noon: **the Gathering** (the names; Dray's ultimatum; Gaunt's counter; Pettifer's patter). Dusk: **the Reckoning**.

**If the player does nothing:** the raid goes in (+2 strife), Gaunt's staves hold the Station against the Bench (+2), the lads fight the corporal (+1), the elder's interdict stands (+1): strife 6: **riot**. The first towns' notices say so, bread goes dear, and the bailiff's chair stays Dray's with a troop behind it.

## 4. End states (the Reckoning, D10 dusk; each leaves marks in all four towns)

| State | When | The Station (hall) | The bailiff's seat | Notices / stock |
|---|---|---|---|---|
| **licensed** | Dray gives leave (a lever works) and strife is low | open, lit; yearly custom | Dray, who walks the first mile | "BY LEAVE OF THE BENCH"; bread and chalk plentiful; innkeepers pleased |
| **suppressed** | strife 4-5: the Bench breaks the host | shut and boarded | Dray, strengthened | ASSEMBLY FORBIDDEN on all greens; dues and fines; stalls closed |
| **schism** | low strife, no leave, the curate gone and Gaunt holds | **barred by the Brethren** (a sanctuary shut to all) | Dray, watching | two chalk-marks on every milestone: one wheel and one cross; priests at odds |
| **usurped** | low strife, no leave, the patron's purse unexposed | open, but a fee | **Orme** (the patron's man) | "BY ORDER OF THE BENCH AND ITS PATRON": pilgrim tolls; merchants resent |
| **riot** | strife 6 or more | burnt; shut | Dray, martial | curfew; stalls burnt; innkeeper's larder bare |
| **fades** | low strife, no leave, patron exposed, Gaunt gone | left to the weather | Dray | chalk washes off; a rumour |

## 5. What the company can do (every lever has a tell)

* **Ranger** (woodcraft): reads the riders' hoofmarks at the third green and the drove-way round the ford; can **lead the host by the drove-way** so the raid finds a camp already moved.
* **Warrior**: reads whose hands are on the pommel among the Bench's men (two will not strike a pilgrim; their mother walks); can **muster stewards among the walkers** to hold a line, or take the duel in the lad's place.
* **Scholar** (lore): reads the milestone: the Office's grant of the road to "the wayfarer who keeps it". It undoes Rooke's seal, and it is the lever on a bailiff who goes by the book.
* **Thief** (lockwork/stealth): the steward's strong-box at the inn, the purse, the ledger; or the tithe-box, which Pettifer skims.
* **Cleric** (rites/insight/mending): can say whether the Walk's rite is orthodox (the elder's interdict lifts), and tends the Mile-Keeper's cough, which is the Walk's actual clock.
* **Everyone**: the grieving's roll and the bailiff's brother (a name on it): the kin lever; the lads' race (comedy, an alliance); the chalk.

What the system does not support, named in section 9: a persuasion that reads a *crowd*; noticing at a distance; companions with distinct dialogue.

## 6. Danger (arising from the situation)

* **The duel** (D6, the third town): the lads and the corporal. Talk, race, a champion, or let it happen.
* **The raid** (D9 night, the flashpoint camp): Sergeant Hask (level 5) and riders; the gate can be barred, the host moved, a price paid, a retreat made to the Station stair. **Frightening**: do not meet them in the open at level 1-2.
* **The Station** (D8 on): Gaunt (level 4) and three staves, sanctuary; they let those pass who speak the names; they fight those who come armed to the Bench's purpose.
* **The riot** (D10, only if strife is high): a mob, level 1, many; the camp and the Station are the ways out.

## 7. Deem (per country)

creed (remembrance/penance/reform: the leader's kind and words); patron (dowager/cousin/factor, weighted by creed); flashpoint town (b, c or d); Dray's lever (kin/duty/debt: which one frees him); each town's merchant stance (profit/resent). The leader, Pettifer, Annet and the rest are named from the town's folk. Coherence: a reform Walk is financed by the factor or the cousin (never the grieving dowager); the penance Walk draws the grieving; the debt-bound bailiff is bound to the patron actually drawn.

## 8. Findable (the lesson of the blind playtests)

From the second day the first town's green *shows* the Walk: a band comes up the road and takes the well-steps, chalking the stone (an `Observe … as sign` on the green that teaches `walk_heard` simply by the company standing there), a chalk-seller sets a barrel by the well, three lads are on the rim, a curate stands on the shrine step, and the notice on the post (day 3) answers them. The camp is a way on from the green, an Objective leads to the Mile-Keeper, and the scenario's hook gives every innkeeper, traveller and market-trader a line. It is not behind a wait line: nothing in it asks the player to ask for it. (`test/walk-seeds.test.ts` checks, in seven countries, that a ranger standing on the green on the second day is told of the Walk and offered the camp.) The first day is left as the first hour wrote it: nothing of the Walk is on the green before day 2.

## 9. Built, proved, not proved

**IMPLEMENTED** (data only; no TypeScript, no rules change): scenario `data/scenarios/walking.scenario.json`; module `data/situations/walk` (`walk.kyr`, `towns.kyr`, `people.kyr`, `powers.kyr`, `gathering.kyr`, `after.kyr`, `tables.json`, `templates.json`): 12 named or grouped people, 3 added rooms in each of four towns and a moot-house, 17 clocked rules for the host, 24 for people moving, 6 end states, 20 topics and 28 actions. The repetitive town sections were written by the scripts in `modules/walk-gen/` (python; the Kyr is what is checked in and is edited by hand from here).

*One line for the integrator, to add to `data/scenarios/standing.json`:* `"walking.scenario.json"` (after `"fellowship.scenario.json"`). Until then `test/fixtures/walk/standing.json` is the same list for the specs.

**AUTOMATICALLY VERIFIED** (`bun test ./test/walk-*.test.ts`):

| Spec | Proves |
|---|---|
| `walk-draw` | 120 draws: three creeds, three flashpoints, three patrons, three bailiff's levers, five leaders, sixteen merchant/innkeeper stance combinations, and the coherence rules (no dowager pays for a reform; a reform has a drover or a soldier; a penance a widow, novice or soldier) |
| `walk-seeds` | seven countries (kahitude, a1, b2, thorn, c3, d4, kite): placed on four different towns, nine people named from the country's folk, the Walk seen and taught on the first green on the second day, the camp offered. It found one real fault: a dwarf cannot be a thief, so the chalk-seller was not a thief |
| `walk-clock` | with the company never leaving the first green and doing nothing: day 2 the host is 1, day 5 the leader is at the second camp and the bailiff at the first moot-house, day 9 the Brethren are at the Station and the riders on the green, and on the tenth day the Walk ends in **riot**, in all four towns' chalk and notices, the Station burnt |
| `walk-ends` | the other five end states are reached from the same morning (levers named in each spec and set outright): **suppressed**, **licensed**, **schism**, **usurped**, **fades**; and what each leaves: the notices, the chalk, the Station's gate (open, boarded, sealed, burnt), the chair (the bailiff's or the patron's steward's), the leader's fate, the larders |
| `walk-danger` | a ranger reads the riders from their tracks and leads the host round by the drove-way, so the raid finds the camp empty; a warrior meets the sergeant (who names his price, and can be paid or argued with) and the raid goes in on a company that did nothing; a thief, a warrior and a cleric are each offered an act of their own |

**ACTUALLY PLAYED** (`test/walk-play.test.ts`, by public labels, with no teleport: only the waits for the clock are the spec's; it is a script, not a stranger): a scholar (a mage) in country a1 stands on the first green on day 2, keeps a mile with the walkers, hears the Mile-Keeper, the grieving Annet (and copies her roll), walks the road to the second camp, the third green (the duel: proposes a barefoot mile-race instead, which the corporal accepts), the fourth town; says the names at the Station arch so that the Brethren let her pass; reads the old inscription; lays the Office's grant before the bailiff (who in this country goes by the book), is not raided, sees the Walk **licensed**, and walks home to read "BY LEAVE OF THE BENCH" on the first green's post and find the bailiff in his chair. **Not played:** by a cold human; any other end state on foot; a fight to the end against the riders or the Brethren (the danger is perceivable and negotiable, and the raid arrives; no spec fights it out: the company that would is a level-1 company, and the page says so); the browser; the full suite.

**Not supported, and what was done:** a persuasion that reads a crowd (R87); the bailiff Rooke's clock cannot be moved from here (R85); noticing at a distance (the ranger's tracks are at the green, not on the road); companions with their own voice; wounds in the narration (R82), so the raid's danger is told by the warning and by what the page says of the odds ("unlikely", "an even chance"). A warrior has no `insight` skill, so "reads the disposition of armed men" is a calling test (`hasCalling(?m, calling_warrior)`) on two acts, not a perception line. Pre-existing and not touched: the first country's toll bar between the third and fourth towns is run by a company that walks the road at night, and the lord's riders then bar the way back: the scripted play pays it on the way out.

**What a next author could take:** a market-day cadence in each town (the clock is by day); a fourth faction (the lads as a gang of their own); the Mile-Keeper's death as its own end; Rooke (R85).
