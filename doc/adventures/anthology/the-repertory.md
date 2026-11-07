# The Repertory: four engagements on the Wend Circuit

Gosse's Company (the King's Players of `doc/adventures/anthology/the-kings-players.md`) once the Wick is theirs and
the King's command is set. Four engagements, each a classical play whose *shape* the company walks into without
having been cast in it. Source: `data/adventures/gosses-company/rep_circuit.kyr`, `rep_errors.kyr`, `rep_three.kyr`,
`rep_prince.kyr`, `rep_wood.kyr` (module `pentrice`; appended to `module.json` and `placed.json`). Played in
`test/repertory.test.ts`. Frictions in `friction-repertory.md`.

## The frame: why the tour comes before the Command

The brief was a tour *after* the command performance. The engine will not allow it: an `Ending` closes the book (`doc/authoring/guide.md`,
"How the story ends"), and Act V's three Endings fire on `commandDone`. Tested: asserting `commandDone` and waiting an
hour leaves the page with no choices. So the tour opens at **`commandOn`**, the three days between the Wick being theirs
and the Command being played, and the Command is *held* while the company is away:

- `tour_gathers` moves the seven tourers (Gosse, Hepzibah, Swale, Dorcas, Pudding, Kit, Tam) to the Drum and Whistle on
  the first arrival at the Wend Cross, remembering where each stood (`touredFrom`).
- `tour_holds` pushes Act V's `commandDay` two days out every tick the company is away; `tour_home` puts each tourer
  back where they were when the party reaches the River Gate, and sets the Command a day off.
- `rp_steady` and `rp_steady2` are the standing consequence: each engagement adds to `repertoire` (Act V's own board) and to a new `renown`
  measure; at the Command, renown 2 takes one point off Act V's `chaos` the first time it rises, and renown 4 a second.
  Act V's fiasco ending is reached at `chaos >= 4`, so the road is the only way to buy slack.

## The map

The River Gate -> the Wend road (1 hour) -> **the Wend Cross** (a signpost, an inn: the Drum and Whistle, where the
troupe sits and Hepzibah's book is open). Hepzibah's letters topic opens all four ways at once:

| Way | Cost | Episode |
|---|---|---|
| the lane to Marlcross | 30 min | 1. The Two Pairs |
| the moor road | 1 h | 2. The Three |
| the Margravate road | 2 h | 3. The Prince and the Letter |
| the green ride into the wood | 1 h | 4. The Wood near Athens-on-Wend |

They may be played in any order, any subset, and the Command comes round after any of them.

## Which classical story each is, and where it differs from Acts I and II

Acts I and II of the King's Players already did two of these. The rule I followed: *link, vary, or fold*, never repeat.

### 1. The Two Pairs (*The Comedy of Errors*)
Marlcross keeps its Fair. Corbet Ashlar, cloth-merchant, has a twin from Evesholm he does not know of, who has come
with a servant (Jibb) who is the other Jibb's double. The town behaves for a day as if everyone had gone mad: a barred
house, a chain ordered and not ordered, an arrest, an exorcist, a wife, a sister-in-law, a courtesan, a magistrate. Signature beats kept:
two masters, two servants, the locked-out husband, the unordered chain, the arrest for debt, the exorcist, the
Priory gate, the abbess who is the mother. The signature **reversal** is the Prioress's: she *is* the woman who lost the
babies, and says so in a silence. *Wink*: the dog sick in the quiet; "That explains the stove."
**Differs from Act I**: Act I played one pair of twins and a double (a farce, with the King as audience, played *for* the
King). This is the *machine* version: two pairs, a town, a timetable. The company is not on stage; it is on the square
and its work is **reconstruction by doing**, not detection by testimony: it can chalk the two Corbets and the two Jibbs
from what it sees (Observes that `teach`), pay the goldsmith, hold the exorcist, put the bailiff on the servant, or ask
either man to wait in the Mermaid. A day clock (`e1Start`, incidents at +6, +12, +14, +18, +26, +28, +34, +40, +46
watches) runs it; each incident has a "prevented" twin rule so no choice can stall the chain (found in play; see friction).
**Endings**: *early* (the two Corbets met before the dinner is cold); *Priory* (run to the gate, the Prioress, Dr Tuckett held);
*chaos* (Tuckett not held, a bound Corbet, an exorcist reading over the wrong one, sorted "as one sorts laundry"). No verdict. Kit's
three-way question after (he held a door for Luce) is read in Ep 4.

### 2. The Three (*Macbeth*)
Lord Osmund Valtry of Cairnholt, tired and honest, has been told by three women on the moor that he will be Warden of the March.
He hires the company *first to test the women*. Three tests (insight, lore, woodcraft); a report (genuine / fraud / cannot tell);
then the loop: what the company reported, whom it posted where, who carried the Warden's cup, are the prophecy's means. The
women, if you go back, are writing down *your* deeds ("And the strangers fetched it. You had not told them your names"). Signature
beats kept: the three women, the prophecy, the testing, the lady who suggests it, the old guest who comes to dinner, the night,
the cup. *Reversal*: the prophecy is not a prediction, it is a work order, and the company is the labour.
**Differs from Act II**: Act II gave the Salt-Wives *one line* about a Marshal. Here the prophecy is the whole play, and the
company is complicit by procedure (a `c2` complicity count) and not by ambition. There is no hearing. **Endings**: *murder*
(`c2 >= 2`, nobody watches the Warden's door): the Warden dies of the cold, the Lord is acclaimed, a kettle is chalked on the
milestone; *survived* (door watched, or Warden warned): you read of the Lord's heart on a broadside a month later; *quiet*
(the company never joined the loop: a drunk dull feast); *turned* (a hard persuasion, "a man told he will be king is not told
to do anything"); *revealed* (the Lady's purse and ribbon on the table: a sister's accounts balance and she goes home). Dorcas's question
(is the Lady hungry, or afraid of what her brother turns into?) is read in Ep 3.

### 3. The Prince and the Letter (*Hamlet* + Bellerophon)
Harrowmere: a Margravate in mourning, a Prince of twenty-one who talks to the rampart at midnight, a ghost with an apple
("Orchard"), a Chancellor who engages the company to keep the Prince alive (three exploits on a timer: the rampart, the
captain's foils, the chapel), a Prince who will not strike a praying uncle, and a courteous letter that asks Orlay's
Margravine to put its *bearers* to death. Beats kept: the ghost, the "to be or not to be" a good deal better than Swale can say it,
the sword that is not drawn in the chapel, the play, the two friends (Spargo and Wrenn: Rosencrantz and Guildenstern),
the substituted letter, the sealed match. *Reversal*: the Prince is not the protagonist at risk; the company is the *carrier*,
the Bellerophon bearer. **Differs from Act II**, which played the *third act* (the Mousetrap) as a night of horror with a
ghost and a Marshal; this is the first act (the ghost, the antic) and the fourth (the letter, the exile), with the
Mousetrap deliberately not repeated. The letter machinery: read it (trapwork), forge it (Swale, who has been sent for),
burn it (at the Fox and Feather), seal it away, or do nothing and let Pudding pack it in the wrong basket.
**Endings**: *escape* (Orlay lets the company go by the kitchen: delivered unread, forged-and-two-friends-seized, or burned); *misdelivery* (the
Margravine reads a laundry list and Kit's poem as a courtship and sends a ham); *grave* (the Prince left unguarded at three exploits:
no letter, a foil that is not blunt). Four tiernan flags are read in the escape (trust, lonely, scorn, spared).

### 4. The Wood near Athens-on-Wend (*A Midsummer Night's Dream*)
A squire's wedding at dawn in a beech wood, entertained by village players (Loom the weaver as Pyramus, Wall and Lion), and Gosse
beside himself. The wood has a pixie, a Lady of the ring, a Lord of the Green with a hunt and a bog of lights. Wrong
lovers: the `loves` relation is scrambled by the wood at +30 (Rafe loves Maud, Jack loves Idony), and the company may
mend it with the wood's own flowers (ofbit and poppy, which the engine says nothing about but the Kind says everything about),
or leave it. Signature beats kept: the weaver with an ass's head, the Lady in love with him, the lovers lost in the wood, the love-juice
(by flower), the play within the play, the wedding at dawn. *Reversal*: the fix is not "set right"; it has a price.
**Differs from nothing**: no earlier act plays this. **Endings**: *restored* (the right pairs; a lion who is very good);
*priced* (you gave the Lord your true name for the weaver, and at the vows you say one that is not quite yours); *fiasco*
(the squire marries the bridesmaid and the audience gives a standing ovation until noon; Gosse looks like a man who has been forgiven).
Gosse's "beside himself" question (let them improvise / run the rehearsal yourself) is read at dawn (he sleeps on the prompt-book).

## Troupe arcs across the circuit

| Troupe | Asked in | Answer | Read in |
|---|---|---|---|
| Kit | Ep 1 (after Luce) | says so / holds / leans | Kit's heart Observes; Ep 4 topics `kit_wood_a/b/c` |
| Dorcas | Ep 2 (the Lady: hungry or afraid) | wants / afraid | Ep 3 topics `dorcas_iseult_a/b` |
| Swale | Ep 3 (the Prince's speech: cut or praise) | hand / vain | Ep 4 topics `swale_wood_a/b` |
| Pudding | Ep 4 (Pyramus) | Pyramus / sings | Pudding Observes (`pudding_p`, `pudding_s`) |
| Gosse | Ep 4 (beside himself) | calm / rested | `gosse_rested_obs`; dawn |
| Tiernan | Ep 3 | scorn / trust / lonely | the escape Observes |

## The four lists

### Works (played, in `test/repertory.test.ts`)
The gate (nothing before the Wick; four ways after letters; troupe at the inn; Command held; home resets); Ep 1 early, Priory,
chaos, with a mid-episode save and reload; Ep 2 revealed (and Dorcas's answer), murder, survived; Ep 3 forged escape, misdelivered
basket, grave; Ep 4 restored (ofbit and the hautboy), fiasco; the Kit chain from Ep 1 into Ep 4.

### Authored but unreachable in play, or reached only untested
- Ep 2 *turned* and *quiet* and *warn_stroud*; Ep 3 *burned*, *sealed away*, *forged-then-seized text on the cry*; Ep 4 *priced*,
  the turn-your-coats route, the Lord's glade bargain, the ash (no action uses her: she is a person to talk to).
  These are reachable (lint-clean, linked to rules), but the specs do not walk them.
- Pudding's Pyramus question and the Dorcas/Swale readers in Eps 3 and 4 are authored and linked but no spec asks them.
- Persuasions that fail: the specs force `pass`; the "Otherwise" lines are unread.

### The engine cannot represent
- A tour *after* the Act V Endings: an `Ending` closes the book. The tour sits before the Command and holds it.
- A moved, un-bound `at` for persons not named in a rule: `Retract at(?p, ?q)` needs `?q` bound by the rule's *condition*, so
  each such move names every person as a condition (see friction F1).
- A prophecy that *predicts* rather than being enacted: there is no chance-of-fate; what is fulfilled is only what a rule or action does.
- A cast you can recast: `Person` lines are fixed; Kit cannot play Maud because he is Kit.

### Assets incomplete
No portraits, no paintings for the Circuit's places; the pixie, nymph, satyr and dryad use canon species with no custom statblocks.
No sound for the hunt horn (an authored `as sound` Observe stands in). The hautboy has no musical-instrument Kind.
