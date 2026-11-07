# The Repertory: four engagements on the Wend Circuit

Gosse's Company (the King's Players of `doc/adventures/anthology/the-kings-players.md`) once the Wick is theirs and
the King's command is set. Four engagements, each a classical play whose *shape* the company walks into without
having been cast in it. Source: `data/adventures/gosses-company/rep_circuit.kyr`, `rep_errors.kyr`, `rep_three.kyr`,
`rep_prince.kyr`, `rep_wood.kyr` (module `pentrice`; appended to `module.json` and `placed.json`). Played in
`test/repertory.test.ts`. Frictions in `friction-repertory.md`.

## The frame: why the tour comes before the Command

The brief was a tour *after* the command performance. The engine will not allow it: an `Ending` closes the book (`doc/authoring/guide.md`,
"How the story ends"), and Act V has **eight** Endings (grave, pebble, chain, shamed, sea, staged, exile, river) that fire on `commandDone`,
with a coda over whichever is reached (fiasco at `chaos >= standingR + 4`). Tested: asserting `commandDone` and waiting an hour leaves the
page with no choices. So the tour opens at **`commandOn`**, the days between the Wick being theirs and the Command being played, and the
Command is *held* while the company is away:

- `tour_gathers` moves the seven tourers (Gosse, Hepzibah, Swale, Dorcas, Pudding, Kit, Tam) to the Drum and Whistle on the first arrival at the Wend
  Cross, remembering where each stood (`touredFrom`).
- `tour_holds` pushes Act V's `commandDay` two days out every tick the company is away; `tour_home` puts each tourer back when the party reaches the River
  Gate and `tour_home_clock` sets the Command a day off (the hold is switched off by `tourHomeSet` so the day-off is exact). The Wend road itself
  is closed on the day of the Command (`commandDay > day(clock)`), so the company cannot walk out at six in the evening into its own first night.
- **Standing is Act V's own.** Each finished engagement raises `repertoire`; Act V's `standing_a` / `standing_b` turn two and four plays into `standingR`,
  which is the chaos slack of the coda. This file adds nothing to it (an earlier version added a second discount, `renown`, and double-credited it; deleted).
  It reads two things of the road on the night: `swaleHand` (Swale was kind to the Prince's speech) makes his Act V blurt cost one point less
  (`rp_swale_soft`), and `e4Price` (the name paid in the wood) leaves a hole in the Chamberlain's roll (`rp_name_roll`, +1 chaos). Pudding's Pyramus
  answer asserts Act V's own `puddingBrave`, which Act V already reads (`pudding_brave_holds`).

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
Marlcross keeps its Fair (Kit has come up with the company and is at the Ashlar house all day). Corbet Ashlar, cloth-merchant, has a twin from Evesholm he does not know of, who has come
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
**The dominant line is closed**: asking each Corbet to wait at the Mermaid only *silences* the town (it sets `e1Met`); the early ending needs both pairs chalked (`two_masters_known`, `two_servants_known`), and chalking needs the day to have happened (`chainTaken`), which a company that pledges the Corbets before +6 never sees. Pledging early therefore leaves the day to run to Mother Everard, whose scene carries the reversal. The text of the chalk Results is gated on the incidents it names. **Endings**: *early* (both pairs chalked, then both Corbets at one table before +26 watches); *Priory* (run to the gate, the Prioress, Dr Tuckett held);
*chaos* (Tuckett not held, a bound Corbet, an exorcist reading over the wrong one, sorted "as one sorts laundry"). No verdict. Kit's
three-way question after (he held a door for Luce) is read in Ep 4.

### 2. The Three (*Macbeth*)
Lord Hadwin Valtry of Cairnholt, tired and honest, has been told by three women on the moor that he will be Warden of the March. He hires the
company *first to test the women*. Three tests (insight, lore, woodcraft); a report (genuine / fraud / cannot tell); then the loop: what the
company reported, whom it posted where, and who carried the Warden's cup are the prophecy's means. The women, if you go back, are writing down
*your* deeds ("And the strangers fetched it. You had not told them your names"). Beats kept: the three women, the prophecy, the testing, the lady
who suggests it, the old guest at dinner, the night, the cup. *Reversal*: the prophecy is a work order and the company is the labour.
**Differs from Act II**, which gave the Salt-Wives one line about a Marshal: here the prophecy is the whole play, the company is complicit by
procedure (a `c2` count), and there is no hearing.
**The loop now bites.** Reporting the women *genuine* is complicity (`c2 = 1`) and so is not reporting at all (at +40 watches Valtry stops waiting and
decides, `e2Unreported`); *cannot tell* is not (it was perverse as a complicity). From +60 the Warden is in the keep and Lady Marit makes the suggestion
visible (`marit_asks`: the guard at the gate, none on his stair, someone he does not know to carry the cup; a covered cup warms on her table, `marit_cup`).
The company's choices are real: post the guards at the gate (c2), carry the cup (its Result now names poppy and a bitterness), or **refuse the cup**
(`refuse_cup`, Time 0, no check) or watch the Warden's door (persuasion) or warn him. Doing nothing after a genuine report is a murder at +84; only a company
that did not join the loop (fraud or cannot-tell reports, nothing done) has the quiet dull feast. `show_purse` and `turn_the_lord` are one try each: a
failure sets `e2Rebuffed` and closes both.
**Endings**: *murder*; *survived* (door, warning, or the cup refused: a broadside a month later); *quiet*; *turned*; *revealed* (the Lady's purse and ribbon on the table).
Dorcas's question (the Lady hungry, or afraid of what her brother turns into?) is read in Ep 3.

### 3. The Prince and the Letter (*Hamlet* + Bellerophon)
Harrowmere: a Margravate in mourning, a Prince of twenty-one, a ghost, a Chancellor who engages the company to keep him alive (three timed exploits: the
rampart, the captain's foils, the chapel), and a courteous letter asking Orlay's Margravine to put the bearers to death. Beats kept: the ghost, the
antic prince alone in the dark with a skull (`tiernan_dark`), the sword that is not drawn in a chapel, **a players' trap**, the two friends who are the
Margrave's ears (Spargo and Hexham: Rosencrantz and Guildenstern), the substituted letter. *Reversal*: the company is the *carrier*, the Bellerophon bearer.
Not kept, and the doc no longer says it is: there is no sealed fencing match (the grave ending is the cut-down version of the fifth act). **Differs from Act II**,
which played the third act (the Mousetrap) as a night of horror: the trap here is a ten-minute action (`set_trap`, Swale, a performance check) that works the
Prince's one word into a speech and *sets what the Margrave does at the chapel*.
**The ghost speaks to the Prince, only if the company stands by him** (`stand_by_prince`); the company hears nothing, the Prince tells them ("Orchard"), and the word
is the key to the trap. If the trap works, the Margrave cannot pray and confesses to the stone (`e3Confessed`); if not, the Prince must be held back (persuasion, hard)
and a failure costs a wound (`harm`). `watch_friends` (insight) learns that Spargo and Hexham report to the Margrave.
**The letter is a choice.** The genuine letter is dangerous to its bearers: handed over, read or unread, Berengar obeys it (the company is shut in the Orlay larder:
*Bellerophon*). It is survived by: a seal that was cracked and clumsily re-sealed by a failed read (she will not act on a letter she cannot swear to);
a forged letter, which needs a successful read, the Prince's consent (`tell_prince_letter`), a sheet of his paper (`take_sheet`) and Swale, and which costs Spargo and Hexham their lives
(the Prince's last lines change with `tiernanTrust`, `tiernanScorn`, `e3Spies`); burning it (`burn_letter` in any hearth) and then a persuasion check at Orlay with no
letter and no cover story (failure: turned away at the gate); or Pudding's basket (misdelivery). **Endings**: *Bellerophon*, *escape* (cracked, forged, explained),
*turned away*, *misdelivery*, *grave*.

### 4. The Wood near Athens-on-Wend (*A Midsummer Night's Dream*)
A squire's wedding at dawn in a beech wood, entertained by village players (Loom the weaver as Pyramus, Wall and Lion), Gosse beside himself. The wood has a pixie
who steals from the party (`rp_robin`, two coins), a Lady of the ring, a Lord of the Green with a hunt, a bog of lights, and an Ash that remembers. The wood scrambles
`loves` at +30 (Rafe loves Maud, Jack loves Idony). Beats kept: the weaver with an ass's head, the Lady in love with him, lovers lost in the wood, the love-flower,
the play within the play, the wedding at dawn. The changeling boy the Lord and the Lady are quarrelling over (`w_changeling`) is the thing the weaver is bargained for.
**The two flowers differ.** Ofbit puts the pairs right: it needs a woodcraft check and a failed hand spends the sprig (there are two). Poppy only makes the four sleep
and forget: they marry at dawn "between two people who like one another very much and cannot say why" (`e4Blank`). **Three ways to the weaver**, in order of cost:
the Lord's bargain (persuasion, hard; one try, failure sets `e4BargainFailed`); the Ash's memory of his name (`ask_the_ash`, then `name_the_lord`, no price); and **only after the
bargain has failed** (and the name is not known) your own true name (`pay_name`), whose price is read on the night of the Command (the Chamberlain's roll has a blank).
**Differs from nothing**: no earlier act plays this. **Endings**: *restored*; *blank* (poppy); *priced*; *fiasco*.
Gosse's "beside himself" question is read at dawn (he sleeps on the prompt-book).

## Troupe arcs across the circuit

Read as Observes in the hub (order-independent), as topics in a later engagement (order-dependent: they appear only if the earlier one was played), and, for two of
them, in Act V:

| Troupe | Asked in | Answer | Read in |
|---|---|---|---|
| Kit | Ep 1 (after Luce) | says so / holds / leans | Kit's heart Observes anywhere; Ep 4 topics `kit_wood_a/b/c` |
| Dorcas | Ep 2 (the Lady: hungry or afraid) | wants / afraid | Ep 3 topics `dorcas_iseult_a/b` |
| Swale | Ep 3 (the Prince's speech: cut or praise) | hand / vain | Ep 4 topics `swale_wood_a/b`; **Act V**: `swaleHand` softens his blurt (`rp_swale_soft`) |
| Pudding | Ep 4 (Pyramus) | Pyramus / sings | Pudding Observes; **Act V**: Pyramus asserts `puddingBrave`, read by `pudding_brave_holds` |
| Gosse | Ep 4 (beside himself) | calm / rested | `gosse_rested_obs` at dawn |
| Tiernan | Ep 3 | scorn / trust / lonely | escape and killed-friends Observes |
| Tilde / Corbet | Ep 1 (sides) | side | the closing Observes `e1_tilde_side`, `e1_corbet_side` |

## The four lists

### Works (played, in `test/repertory.test.ts`; 21 specs)
The gate (nothing before the Wick; four ways after letters; troupe at the inn; Command held; home resets the clock); Ep 1 early (only after both pairs are chalked),
the three-move line shown **not** to end the day, Priory, chaos, with a mid-episode save and reload; Ep 2 revealed (and Dorcas), a failed argument closing the route,
murder by doing nothing, survived by the door and by refusing the cup (with the unreported report), quiet; Ep 3 the forged escape (with the Prince's consent and sheet),
the Bellerophon larder for the unread letter, the cracked seal, burn-and-fail at Orlay, the misdelivered basket, the grave; Ep 4 ofbit (with a failed hand), poppy (blank),
the failed bargain then the paid name, the fiasco, Kit's answer carried from Ep 1. Checks are forced only where the spec says so.

### Authored but unreachable in play, or reached only untested
- Ep 2 *turned* and `warn_stroud`; Ep 3 `seal_letter_away`, the `tiernan_a1/a3` answers, the spies Observes; Ep 4 turn-your-coats, `ask_the_ash` + `name_the_lord`, the glade bargain succeeding,
  `rp_robin`; Act V's `rp_swale_soft` and `rp_name_roll` (they need a played Command, which an Ending closes; not walked here).
- Pudding's Pyramus question and the Dorcas/Swale readers in Eps 3 and 4 are authored and linked but no spec asks them.
- No spec plays from the very beginning of the campaign: `heistOver` is asserted (the single staged premise). Most persuasions are forced `pass`; the specs that force `fail` are the ones named above.
- The tour holding the Command is tested as an effect (it does not begin in two days) but a walk-out at 18:00 on Command day is guarded by the road's opening clause, not by a spec.

### The engine cannot represent
- A tour *after* the Act V Endings: an `Ending` closes the book. The tour sits before the Command and holds it.
- A moved, un-bound `at` for persons not named in a rule: `Retract at(?p, ?q)` needs `?q` bound by the rule's *condition*, so
  each such move names every person as a condition (see friction F1).
- A prophecy that *predicts* rather than being enacted: there is no chance-of-fate; what is fulfilled is only what a rule or action does.
- A cast you can recast: `Person` lines are fixed; Kit cannot play Maud because he is Kit.

### Assets incomplete
No portraits, no paintings for the Circuit's places; the pixie, nymph, satyr and dryad use canon species with no custom statblocks.
No sound for the hunt horn (an authored `as sound` Observe stands in). The hautboy has no musical-instrument Kind.

## Second review: what changed again

- **Endings are location-free.** Every rule that sets an ending (`rp_confess`, `rp_orlay_*`, the Ep 4 quarrel that moves the lovers) now fires wherever the party stands; the telling is an `Observe` at the place. Guard, cup and warning actions in Ep 2 refuse once `e2Done` holds.
- **"I cannot tell" is silence.** It sets no report; Valtry decides at +40 watches (`e2Unreported`), so it is exactly as complicit as a genuine report. `refuse_cup` is a persuasion check; failure sends the cup up on the company's name (`e2Carried`, `c2 + 1`).
- **Night beats are clock hours.** Ep 2's night begins at 21:00 and the Warden's stair is tried (or the quiet feast ends) from 03:00; Ep 3's Orlay road is walked 06:00-19:00 (the gate shuts at dusk) and the inn's basket is rolled once, on the morning, on dice (`rp_mix`, `dice(clock) <= 10`); sleeping in the hedge at the road costs a night's cutpurses (once). Ep 4's lovers walk off at dusk (18:00-04:00) and dawn is 05:00-12:00, forty watches after.
- **Failures cost.** A failed read spends three crowns and the chance to learn what the letter says (so no forgery); a failed forgery spends the Prince's sheet.
- **Credit is for plays played through.** `repertoire` is not raised by Ep 1 chaos, Ep 2 murder, Ep 3 grave.
- **Consequences in Ep 4.** A freed Loom leads the applause on the night of the Command (`rp_loom_fan`, -1 chaos); the paid name leaves a hole in the Chamberlain's roll (+1 chaos); the Ash's route costs an hour of the night (Time 6, one try) and leaves the Lord humbled (`e4Humbled`, `w_humbled`).
- **Ep 1 early ending carries the reversal**: Mother Everard is sent for and speaks at the Mermaid; the Priory-bound lines in Kit's and Tilde's Observes are neutral.
- **Specs**: 26. Checks are forced to pass only to remove luck from a walked journey (`roll('pass')` at the head of a helper); each spec that shows a failure forces `fail` for that one step. The inn's gamble and every clock hour are unforced (seeds `rep3m` mixes, `rep3j` does not).
