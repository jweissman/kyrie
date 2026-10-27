# The Third Night: playthrough evidence

Deliverable 8. What was played, how, and what the playing found. Everything here can be re-run; a transcript is written with `bun test/support/transcript.ts <campaign> <seed> <steps.json> <out.md> <title>`.

## How it was played

- **By label.** Every journey is a list of the labels a player would choose, in `test/fixtures/wrayford/*.json`,
  played through `Journey` (`test/support/wrayford.ts`), which finds each label among what the page offers and fails
  if it is not there. A journey cannot reach anything a player could not.
- **As a reader.** Seventeen of those journeys are kept as transcripts in `playtest/`, the page text the player sees
  under each choice, with waits folded and the events they passed through quoted. They were read as a player reads
  them, which is how most of the faults below were found.
- **At random.** `test/the-third-night-wander.test.ts` takes seeded random walks over whatever the page offers (for
  the homecomer, a thief and a traveller), checking invariants after every step (the company is somewhere; no page
  shows an id, an unfilled `{slot}`, `undefined` or `NaN`; the buried are in the earth and the rail not hanging over
  them; whoever is taken is in the cellar until the verdict; at most one ending), then waits out the four days and
  checks that a verdict was given and exactly one ending told. The default is two seeds of 200 steps each; it was
  also run with `WANDER_STEPS=300 WANDER_SEEDS=s1,…,s6` (eighteen walks, all clean).
- **From outside.** The generated-world test assembles a mountain country, has its innkeeper tell of the bridge at
  Wrayford, walks the company to the south march, lets the frontier draw the vale, goes down the drove road, waits
  out the four days as a stranger, and walks back out to the march-stone.

## The tests

`bun test test/the-third-night.test.ts test/the-third-night-small.test.ts test/the-third-night-legend.test.ts
test/the-third-night-wander.test.ts`: 40 journeys and six wanders, all passing; the whole repository suite passes with them.

| Test | Build | What it shows |
|---|---|---|
| Lints clean, alone and placed | — | No lint errors for the homecoming, the traveller, or the module as a world chapter |
| Left alone in the city | homecomer | The city's own clock: Kit taken at the counting-house at midnight on night 2, Maudie at the gate on night 3, both hanged; The Third Night |
| Never coming into the city | homecomer | Away: the news from a drover |
| By night, alone | ranger | Pier face by rope, lowered to the bank, read the ford, carried, buried at dawn; not seen; Kit taken at dawn; Earth on Him, 600 experience |
| By night, taking Kit's place | ranger | The same, then "not Kit" before the reeve: the company in the cellar, Kit freed, banished at the verdict |
| By day, the two mothers | ranger | No checks. Ice, an hour by the bed, Kit's telling, the walk; temper ≥ 2; Ned buried with them |
| By day, the Liberty's charity | bard | The hide, the claim, the tithe ruling, the clause, the reeve's cover |
| The reeve's release | warrior | Gault asked as one who has stood a watch; the hand; Hal tells his father; Hulme cuts them down |
| Too late | warrior | The Bench's clause hardens the reeve, answered to his face; Hal reached on the third evening; Hulme a quarter-hour behind Maudie |
| The Company's bargain | homecomer | Kit sold; trust to nothing; the dead given back at supper; Maudie never goes; Kit hanged |
| The lime | homecomer | Maudie held; nothing else; the lime |
| The fire that comes anyway | homecomer | Kit turned to the board, which goes in the river; his mother taken; the carters rise; The Fire |
| By Dorcas's boat | thief (seed `ferry`) | Two kind lies; the meeting at eight; the door picked; the boat; Dorcas's charter at dawn; Earth on Him |
| A failed lie closes that door | thief (seed `boat`) | The same lies failing: no meeting, no boat |
| Joining Kit's fire, alone | warrior | Beaten in the counting-house and taken; in the cellar when Maudie goes; The Third Night; banished |
| Joining Kit's fire, seasoned | three strangers, level 4 | Gault and two riders beaten; the counting-house burns, and Pinch's day-book with it; The Fire |
| Saving and resuming | homecomer | Checkpointed in the small hours on the leads and resumed from JSON: the same ending, time and blame |
| Determinism | homecomer | The same seed and steps tell the same history |
| The generated world | a world's company | Rumour, frontier, entry as a stranger (no "your mother"), the four days, the chapter closed, the world going on, and the way out |
| The hide and the bear-ward's boy | ranger | The brand read; the Abbess obliged; the whistle; Robin home; the knife; Ham's word to the captain |
| Kindnesses | ranger | Win's chisels; her claim; Pinch's shirt; the ring argued and failed, then bought |
| The offal cart | monk | Pier face by climbing; the Shambles before dawn; over at seven; carried from the tan-yards; Earth on Him |
| The night of the rising | thief | The flask, Pinch cornered, the tithe, the lock picked in front of the clerk, the day-book, the captain on the road and at supper, and her question answered; Maudie spared |
| A stranger at the captain's supper | traveller | Her question; only the stranger's answer and the yards offered; believed for having no reason to lie |
| The office for the dead | cleric | Rites under the rail; regard two; the claim; sanctuary; the charity; the freedom of the bridge |
| The scholar | mage | Graves dug by day; the ford learned from Ham's herd on night 2; two of three over; the third found; The Third Man |
| The portrait | warrior | Painted true while Gidley talked; hung; Gidley's tears carry the release |
| The felon ruling | homecomer | The crowd angrier; no carcass ruling after; Pratt's argument closed; her price still open |
| The legend and the past | homecomer | Wade in five tellings, the hymn, the Burning, the ten stones, the captain's father; she is asked about Water Lane |
| The chapters | homecomer | THE SECOND DAY to THE FOURTH MORNING; something wades at the Step on the third night |
| The Bargeman, alone | warrior | The way on blocked; bread offered; going at it, death |
| The Bargeman, with bread | warrior | A loaf on the water; over the ford untaught |
| The Bargeman, killed | seasoned company | Its body on the shingle; "My grandfather fed that fish" |
| The Step floods | warrior | Washed back to the bank when the sluices open |
| Bread to the riders | homecomer | Riders awake, backs to the parapet; the dead cut down unseen |
| No bread | homecomer | The same climb at the same hour is seen |
| Jennet's bread | homecomer | Refused before trust; held, still warm, after an hour by the bed |
| Maudie under the rail | homecomer | The second morning, Gidley weeping beside her; "Tomorrow night, then" |
| The weight at the Step; Kit at the grave | world-chapter homecomer | The weight changes halfway; Kit freed sits by the grave in the evening after the verdict |
| Carrying the way you know | homecomer | The second and third carried in one choice each; Earth on Him |
| Wandered ×6 | homecomer, thief, traveller | Coherence over random play, and a verdict at the end |

## Transcripts

In `playtest/`, each the page as the player saw it:

| File | Route |
|---|---|
| `01-two-mothers-ranger.md` | The Two Mothers, no checks |
| `02-charity-bard.md` | The Liberty's Charity, by the hide and the Bench |
| `03-earth-ford-ranger.md` | Earth on Him by the ford |
| `04-earth-boat-thief.md` | Earth on Him by Dorcas's boat |
| `05-mystery-thief.md` | The night of the rising, told to the captain |
| `06-charity-cleric.md` | The Liberty's Charity, by the office for the dead |
| `07-earth-cart-monk.md` | Earth on Him by the offal cart |
| `08-third-man-scholar.md` | The Third Man |
| `09-fire-rising.md` | The Fire that comes anyway |
| `10-fire-counting-house.md` | The Fire, by joining Kit |
| `11-bargain.md` | The Company's Bargain |
| `12-reeve-warrior.md` | The Reeve's Release |
| `13-too-late-warrior.md` | Too Late |
| `14-lime.md` | The Lime |
| `15-left-alone.md` | The Third Night |
| `16-liberty-locals.md` | The hide and the bear-ward's boy |
| `17-kindnesses.md` | Win's chisels and Annis's ring |
| `18-the-legend.md` | Saint Wade, the Michaelmas Burning and the hymn, told in pieces across the city |
| `19-bread-and-the-bargeman.md` | Maudie's bread up to the riders at dusk; the dead cut down unseen; bread on the water at Wade's Step |
| `20-earth-ford-carried.md` | Earth on Him by the ford, the second and third carried the way you know |

## What playing found

Faults the tests could not see until the module was played, in the order found. Each was fixed and, where it could
be, pinned by a test.

**Found by playing to each ending**
1. Eight effects that would have taken a measure below nothing made whole actions and rules silently impossible: Pinch's
   carcass ruling (the city's temper starts at nothing), Gidley's purse for Kit, the butcher's boy telling the riders,
   Kit's trust after betrayal, and the Bench's clause hardening the reeve. The engine refuses any action whose effects
   would make a measure negative; it does not say so.
2. The bargain was never kept: nothing made the Company ask mercy for the dead, so Maudie still went up. Now the
   captain gives them back at supper.
3. Kit could lead the rising at the gate and walk free at the verdict.
4. The counting-house ambush told the "without you" version when the company was there and lost, and dropped Gault's
   "Evening," because the rule was scoped to a room the company could not perceive in the dark.
5. Too Late was unreachable: the Bench's clause cancelled one of only three things that move the reeve. Telling him
   the Bench has made him its bailiff now moves him back.

**Found by the random walks**
6. Dunstan's chisels lay on the pawnshop floor to be picked up for nothing, after which paying for them crashed the
   action ("Item already owned"). They are Pratt's pledge now, and she objects.

**Found by reasoning about what the walks could reach**
7. If only some of the dead were buried, no ending held. The Third Man now does; the one left lying is found by the
   reeve's men on the city side, and Corbin buries what is left by his church door at the end of his day (but only
   once nobody is still carrying, and never during a lawful release, which buries its own).

**Found by reading the transcripts**
8. The reeve's dawn reckoning blamed "persons unknown" after the whole city carried its dead, and took Kit "because
   somebody has to be taken" after the reeve had cut them down himself.
9. The Bench kept "the dead upon the rail" as the Company's surety on the afternoon they were buried.
10. The charity ending said "nobody is hanged" while Kit, left alone, went south to hang; it credited graves to the
    Liberty's brothers that Corbin dug; Earth on Him said "your mother" to strangers.
11. The kitchen showed Maudie kneading after she was hanged; the toll-keeper's room was "very hot" and "a little
    cooler" at once; the riders on the leads at one in the morning were not said to be asleep.
12. Hal "put down his pen" on a wet ledge at night, and said "before supper" at half past eight.
13. Roles read "an Alderman Gidley's ice-man", "a Lady Abbess"; the toll arithmetic did not add up; two curfew bells
    rang at once; routes walked often (the church on the way to the Acre, the Bridge End, Bridge Street) were described
    in full on every pass; farewells did not fit their speakers ("has gone back to work" from a sergeant in a tavern).
14. Ham's gratitude, Win's claim, the felon and pilgrim rulings, the portrait, and the cleric's "come back to me after"
    were each recorded and then never read. All now change what follows.

**Found in the second revision** (see `11-second-reading.md`)
15. The Bargeman as first built killed a lone warrior on arrival, before the bread could be thrown; it now lies
    across the way and is fought only by choice.
16. The shortened carrying was costed slower than the walk it replaced, so the river rose on the third trip.
17. With bread bought, the leads still said the riders were awake and watching; they now sit with their backs to it.
18. Gault greeted you "over the brazier" in a tavern; Corbin's ages did not add up against a burning thirty-one
    years ago; the Nine Wheels' new sentence ran on; Pell's farewell was the printer's.
19. Wider walks after the change (six seeds × three walkers × 300 steps) found nothing; the river, the creature and
    the flood are coherent under random play.
