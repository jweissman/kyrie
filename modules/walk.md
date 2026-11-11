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

## 8. Not built, and built (filled at the end)

*(see the end of this file)*
