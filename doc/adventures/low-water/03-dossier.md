# Low Water — design dossier

*The adventure as built (branch `claude/laughing-cerf-lwk6hb`, from `main` 6aedbe2). The first conception is
[00-conception-2026-10-25.md](00-conception-2026-10-25.md); the comparison that revised it is
[01-corpus-comparison.md](01-corpus-comparison.md); the plan it was built against is
[02-implementation-strategy.md](02-implementation-strategy.md); what changed and why is
[04-revisions.md](04-revisions.md).*

## 1. The situation before the Assessor arrives

Ammerlin is a city of four terraces down the inside of an old crater, the Bowl. The Ninefold comes in at the Rim and
goes down the **Stair** — nine locks, three cisterns, a hundred sluices — to the **Mere** at the bottom. Water is the
city's money and its peace: since the Thirst Riots two hundred years ago the **Office of Measures** has measured every
right and read it aloud at need, under the words WHAT IS MEASURED HONESTLY CAN BE SETTLED PEACEFULLY.

For three years the Mere has been falling. Three things, each done by a sensible person for a good reason, have
compounded:

| What | Who | Why | What it actually did |
|---|---|---|---|
| The **Short Hymn**: the Long Hymn cut from two hours to forty minutes, the Fourth, Fifth and Seventh Remainders removed | Cantor Sabeth Orr | The young would not stand two hours of repetitions she took for copyists' accretions | The Seventh Remainder was the order, heard by the machine under the Mere through the water of the Sounding's shaft, that lowered the **Deep Gate** to a cupful each night. Without it the gate stands raised: the machine drinks the Mere |
| The **Fulling Channel**: a fifth of the Ninefold along the Rim to eight new mills | Harrow Quill, Millwrights' Guild | Work for four hundred people; bought rights from failing farms | A real, small loss (its water mostly comes back to the Stair below the Rim). It is the cause everyone can see |
| The keeper's silence | Piet Harl, Ninth Lock | The Lock-Rhyme tells the keeper to *watch* the gate and *send to the Sounding* if it does not come down | He sent, twice. A young Cantor answered that the Remainders were a matter for the Cantors. He has written *Deep did not come down* every night for three years |

Under the Mere is the **Reckoner**, a machine of the Mathematical Age that counts by passing measured water through
itself and out of the world. It has counted for three thousand years at a cupful a night; for three years it has
counted fast. Of nine wheels, six have locked. Left alone, it finishes on the eighth evening.

## 2. Who is acting, and on what

| | Believes | Wants | Can do | Misunderstands | Fears | Doing already | If left alone |
|---|---|---|---|---|---|---|---|
| **Isaura Vant**, Clerk-Measurer | That what is measured honestly can be settled peacefully | An honest Finding, in time | Read any ledger, gauge any flow, open Office seals, carry a warrant | That measuring is neutral | That the Office is a costume over force; that her brother is right about her | Keeping a private tally that does not close: forty ells a day arrive nowhere | Gives her tally to the Registrar, is told to put it on the Guild, and knows she is lying |
| **Harrow Quill**, Guild Master | Water should go where it does most good, and good can be counted | The Channel kept, the charter renewed, the Ward's land | Money, lawyers, bailiffs, rhetoric | That the fall is drought | His debts being known | Buying the Ward plot by plot through Basset; sitting on his engineers' report | Has the dig by the third morning and sends bailiffs at three |
| **Cantor Sabeth Orr** | A hymn is a building everybody stands in at once | Her reform defended | Command the bells — and so, unknowingly, the Deep Gate | That the Remainders were silt | That faith is only obedience to a forgotten machine | Packing the Sounding three times over | Defends the Short Hymn at the Council and wins |
| **Dov Vant**, the Ward | The city is letting the Ward die because it is poor | His people kept together; his boat afloat | Forty diggers, the Ward's loyalty | That the ruins are only loot | Becoming Quill's labourer; losing his sister to the Office | Digging the Listening Hall's throat toward a wall that hums | Breaches it on the fourth morning, under the waterline: three drown — unless the bailiffs have taken the dig first |
| **Teodor Halm**, Collegium | The Mathematical Age asked questions we cannot state | The machine to finish, and to hear it | Read the oldest marks, buy finds, sell the glossary | People | — | Buying stones at the dig | Reads the keystone on the fourth day, goes down on the fifth night, sounds the high voice and the bright: the count ends with what it has, and the Mere drops six spans in one breath |
| **Registrar Fenn** | No cause is ever only one thing | A Finding that will still stand at the end of the afternoon | Freeze titles, postpone the Hearing, give a warrant | — | The Office's own charter coming up for review | Holding the Council off | Gives the Office's own finding — the Guild — if the Assessor does not come |
| **Piet Harl** | The keeper is there to see the gate | — | Drop the stop-logs, with the crane | Why Abel said *never* | — | Watching | Watching |

## 3. The physical model (what the world does every eight hours)

* **The Mere** (`mere(bowl)`, spans on the Ward gauge) starts at 40. While the Deep Gate is raised and the machine
  not fed from the Rim: −1 every eight hours. Half raised: −1 every sixteen. The Guild's Channel: −1 every other
  morning. The Channel turned home, and the Deep not drawing: +1 a day.
* **The count** (`count(reckoner)`, of 900) starts at 640. Raised: +12 every eight hours. Half: +6. Fed by the Grey
  Way: +60. Lowered or jammed: nothing.
* **Thresholds**: 37 the *Tench* on the mud; 34 the Hall's throat open to the diggers; 30 the Ward well fails and the
  Ward begins to leave; 24 the Listening Hall stands in the air; 18 the Ward is empty.
* **The hymn**: each evening at seven the Sixth raises the Deep Gate (unless jammed); at eight, if restored, the
  Seventh lowers it; the Fifth sets every fountain humming for an hour; the Fourth holds the last door.

The rule that the city's water is *moved, never made* is taught on the Dyers' Terrace and holds everywhere — except at
the Deep Gate, which is the single place water goes and is not seen again. That exception is the first great clue,
and Isaura's tally is the instrument that finds it.

## 4. Composition

### Movement I — The Measure (day 1)
The Rim; Isaura at the head of the Stair; the Channel gauged with her rod (twenty-two ells) and her tally confessed
(forty more arrive nowhere); Sella and the unpaid hands; Quill's charming account and his engineers' report; the
Office's register (the fall began three autumns ago) and its oldest map (the Grey Way, *to feed the Deep when the Mere
is low*); the Sounding and Orr's reform; Abel Lusk's rhyme; the Dyers' Basin, drained by understanding when the third
bell draws it; the Ninth Lock, where water goes down and comes out nowhere; Piet's book. **Turn**: it comes together
as *hymn_cause* — the Short Hymn left out the verse at which the gate came down — and the player's sympathy for Orr,
who is wonderful, becomes costly.

### Movement II — The Drowned Ward (days 1–4)
The lakebed coming up into the air: the dig, Halm, the Listening Hall and its keystone; the Ward's politics — the
*Tench* stranded, Basset buying, the well failing, the bailiffs at three on the third afternoon, the breach on the
fourth morning. The Seventh sung once as a trial, the gate watched from the Ninth Lock at eight. **Turn**: closing the
gate does not end the matter. The machine is real, near completion, and asks — through the fountains, when starved —
to be fed. The question changes from *why is the Mere falling* to *what do we owe the thing under it, and each other*.

### Movement III — The Reckoner (any night the gate is down, or through the breach)
The culvert (a death if the gate rises while you are in it); the Equals and their one rule; the nine wheels showing
the count truthfully; the listening column, where the hymn's grammar becomes speech; the governor; the last door.

### Movement IV — The Finding (day 7, or day 9 if postponed)
The Moot Hall. Exhibits laid one by one, each needing what was found; witnesses who agreed to stand (Orr, Piet, Halm)
and those who come uninvited (Dov; Mag Torrin, if her season was drowned); Quill's answer, which a story without his
report does not survive; a cause named; a remedy asked; the Council's verdict by what it was shown.

### Coda — The Interval
If the count closes and the last door is not held, a passage onto still water under no sky, where three thousand years
of counted water has been used: someone has built a copy of Ammerlin out of it, left for right, with the Mere full and
every boat afloat, and at the centre of its Sounding a figure of water singing, or listening.

## 5. Outcomes (eleven endings, reached on leaving by the north road)

| Ending | What makes it | |
|---|---|---|
| **The Measured Accord** | The machine entered in the ledger as a holder of a right: one cupful nightly, by the Seventh, sung by the Sounding and measured by the Office. Needs the tally signed, the grammar shown, the machine named with the hymn, and credence ≥ 8 | A new institution |
| **The Seventh Remainder** | The Seventh restored for good (by the Cantor, or by Council order) and the count left running slowly | The ancient pace |
| **The Census Heard** | The count closed while fed by the Grey Way: the Mere spared | Quill's water, Quill's price |
| **The Kept Count** | The count closed with the Fourth sung again: the last door held shut | The optional discovery |
| **The End of the Song** | The high voice and the bright sounded, by the Assessor or by Halm | Six spans in one breath |
| **The Silent Engine** | The governor broken | The Mere saved; the question lost |
| **The Registrar's Finding** | The Guild named (or no Finding given) and the count not closed | The wrong verdict, honestly reached |
| **Low Water** (two) | The count closed on its own; or nothing changed | The default world |
| **The Assessor Who Left** | Gone before the Hearing | |
| **The Bowl in the Water** | Staying in the Interval | |

Several consequences persist independently of the ending: whether the diggers drowned, whether Dov was arrested,
whether the Ward's titles were frozen or sealed to the Guild, whether Mag Torrin's season was drowned, whether the mill
hands were paid, whether the fountains purr again, whether Abel Lusk went down to see the Deep come down once more.

## 6. Character arcs

* **Isaura Vant** (39 conversations, 37 of them asked on the way; 7 moments she speaks unasked). Her arc is from *measurement settles* to
  *measurement tells you exactly how big the thing is that you will have to decide anyway* (`isaura_measure_early` →
  `isaura_measure_late`). It is earned through what she sees: her figure that will not close; Piet's unanswered
  letters (*we'd have answered with a form*); the machine that is a ledger; the Equals that count heads, not weight.
  She can stand against the player at the Hearing if the Finding contradicts her figures. Her relation to her brother
  is the adventure's most personal line: *Measure*, the coffin measured before the joiner, the swimming step, the
  figures he listens to or does not, the three names she says the way he says them.
* **Cantor Orr** changes most visibly, and the player chooses the shape of the change: told that the Remainders were
  orders, she asks *what was it we were doing?*, and the answer given (a building, a hearing, numbers) is what she
  sings afterwards.
* **Quill** does not change; he is clarified. The sophist who believes every argument while he makes it, and whose
  honest moment (*I'm telling you the truth, and I'm also telling you what I need to be true*) is the adventure's
  sharpest statement of its own problem.
* **Dov** changes toward his sister, or away from her, according to what the Office does for the Ward.
* **Halm** is the adventure's most dangerous person because he wants none of the water.
* **Piet** and **Abel**, the keeper and his master, carry the adventure's tenderness.

## 7. The puzzles

### 7.1 The Dyers' Basin (teaching the water)
1. **Mechanism.** Three bodies: the Upper Cistern (4 of 5), the Dyers' Basin (3 of 3), the Sump (2 of 3). A wound-up
   gate passes a mark a watch from higher to lower until level or the lower is full. The Sump's overflow empties it into
   Mag Torrin's vats. Mag draws a mark at nine; the Office refills everything at six. The floor is walkable at one
   mark or less.
2. **Perceived.** A full black basin, a pale shape under it, two gates, a chained overflow, gauge-posts.
3. **Evidence.** The posts (always true, in the gate's own description as well as the place's); Mag on her draw and
   on the Sump; the rhyme (*Dyer to vat when the third bell ticks*).
4. **Actions.** Wind either gate, unchain the overflow, ask Mag to draw early, bail.
5. **Outcomes.** Before nine: open the Sump (3/2 → 2/3) and let the third bell take the last mark — no cost. After nine
   the basin and Sump stand level at 2/2: bail for two hours, or come back before nine, or unchain the overflow (fast,
   and Mag's season is drowned; she says so at the Hearing).
6. **Relations.** The arch's four mouths are the first part of the machine's grammar; the weight-stones on the floor
   answer the Equals.
7. **Over time.** Refilled each morning.
8. **Interface.** Gauge readings in place and gate descriptions; the third bell is told.

### 7.2 The Equals (one rule)
The Hall's floor is a balance. Whoever walks it tips it; the Equals warn once, then come for whatever tips it. A
weight-stone in the far pan answers each walker — *one for each of us, not by how heavy we are, by how many*. There
are enough stones in the Bowl (the basin floor, the vestibule, the dig, Dov's yard) but they are heavy. A player can
retreat when warned and come back with weight; one who stays fights two level-5 bronze figures and will usually lose.
Breaking the governor brings them, a watch later, to the governor; a player who has gone finds them standing over it
holding nothing level.

### 7.3 The column (the hymn's grammar, composed)
*Mechanism*: a phrase is two tones; the first names an organ (deep the mouth, middle the count, high the last door,
bright its own voice), the second says how much (deep least … bright all). *Evidence*: the arch's four mouths (shut to
wide, beside four note-marks low to high); the keystone (a sign beside each voice: mouth, tally-sticks, door, singing
face; and *the first voice names, the voice after says how much*, readable by Halm or with the Collegium's glossary);
the old hymnal (each Remainder's tones); the rhyme and the gate's behaviour at the Sixth and Seventh. *Actions*: strike
four bars. *What can be said*: the Seventh (gate to cupful), the Sixth (wide), half; the Long Amen (the count, in
strokes of nine); the First (its question, which lights the lintel); the Fifth (the fountains); the Fourth (hold the
door); bright-bright (the whole hymn up every pipe); and the phrase never sung, high-bright, which ends the count with
what it has. *Fairness*: every effect is told; brute force works and costs (the gate raised under you, the Mere taken
in one breath).

### 7.4 The Hearing
Every exhibit needs a fact the company can have learned and, for some, a person's consent (the tally needs Isaura to
sign; the report needs the copy Sella brings for a promise). Witnesses come because they were asked, or because they
are owed. A story about bronze men without Quill's report is laughed at by his rhetoric (−2); the Accord needs more
than any other remedy (credence 8).

## 8. Exploration

45 rooms on two planes: the Rim (4), Measures Terrace and its buildings (8, with the Moot Hall and cells), the Sounding
(4), the Dyers' Terrace (6), the Nine Locks (3 and the culvert), the Ward (4), the lakebed (6), the Undercroft (7), the
Interval (2). The Bowl is vertical: every errand goes up or down the Stair, so places once known are told in a line.
There are two ways into the Undercroft, each opened by a different state of the water: the culvert behind the Deep
Gate (dry only while the gate is down or jammed) and the breach at the bottom of the Hall's throat (reachable only once
the Mere has fallen below the throat, and safe only if dammed or the Mere is lower still).
