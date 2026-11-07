# The Repertory: four engagements on the Fourways Circuit

Gosse's Company (the King's Players of `doc/adventures/anthology/the-kings-players.md`), once the Wick is theirs and the King's command is set,
is let go on the road for a few days. Four engagements, each a classical play whose *shape* the company walks into without having been cast in
it. Source: `data/adventures/gosses-company/rep_circuit.kyr`, `rep_errors.kyr`, `rep_three.kyr`, `rep_prince.kyr`, `rep_wood.kyr` (module
`pentrice`; appended to `module.json` and `placed.json`). Played in `test/repertory.test.ts`. Frictions in `friction-repertory.md`.

## The frame: why the tour comes before the Command

The brief was a tour *after* the command performance. The engine will not allow it: an `Ending` closes the book (`doc/authoring/guide.md`, "How the
story ends"), and Act V has **eleven** Endings that fire on `commandDone`, with a coda over
whichever is reached (fiasco at `chaos >= standingR + 4`). Asserting `commandDone` and waiting an hour leaves the page with no choices. (The
Command itself, the rules that fire before the Ending, can be played, and several of the tour's rules read it: see below.) So the tour opens at
**`commandOn`**, the days between the Wick being theirs and the Command being played, and the Command is *held* while the company is away:

- `tour_gathers` (and `tour_regather`, whenever the party passes the Fourways) lodges at the inn **whoever is in the troupe** (`troupe(?p)`, bar Clemency, who joined later), remembering where each stood
  (`touredFrom`). There is no fixed roster: a Dorcas or a Swale who has gone away (`dorcasGone`, `swaleGone`) is not in `troupe` and is not fetched.
- `tour_holds` pushes Act V's `commandDay` two days out every tick the company is away; `tour_home` puts each tourer back when the party reaches the
  River Gate and `tour_home_clock` sets the Command a day off (the hold is switched off by `tourHomeSet` so the day-off is exact). The Fourways road is
  closed on the day of the Command (`commandDay > day(clock)`), so the company cannot walk out at six in the evening into its own first night.
- **Standing is Act V's own.** Each finished engagement raises `repertoire`; Act V's `standing_a` / `standing_b` turn two and four plays into `standingR`.
  This file adds nothing to it. It reads three things of the road on the night, in Act V's own scenes: `swaleHand` (Swale was kind to the Prince's speech)
  makes his blurt cost a point less (`rp_swale_soft`); `e4Price` (the name paid in the wood) leaves a hole in the Chamberlain's roll (`rp_name_roll`,
  +1 chaos); a freed weaver leads the applause (`rp_loom_fan`: +1 `standingR`, the coda's slack, so it cannot be spent as less than itself); and a
  Pudding who played Pyramus because the weaver did not come (`pyramusPlayed`, a flag of this file, not Act III's `puddingBrave`/`puddingFool`) takes a point off the first scene (`rp_pyramus_brave`).
- **Credit** (`repertoire`) is for plays played through: not Ep 1's chaos, Ep 2's murder, Ep 3's grave, larder, turning-away, misdelivery or dismissal, and
  Ep 4's fiasco only if the company acted (a protective act, a flower, the weaver freed) or paid to let it play: `leave_them` takes an hour **standing at the edge of the wood with the lovers**, which is exactly where the Hunt comes.

## The map

The River Gate -> the Fourways road (1 hour) -> **the Fourways** (a signpost, a milestone, an inn: the Drum and Whistle, where the troupe sits and
Hepzibah's book is open). Hepzibah's letters topic opens all four ways at once:

| Way | Cost | Episode |
|---|---|---|
| the lane to Marlcross | 30 min | 1. The Two Pairs |
| the moor road | 1 h | 2. The Three |
| the Margravate road | 2 h | 3. The Prince and the Letter |
| the green ride into the wood | 1 h | 4. The Wood near Athens-under-Hollin |

They may be played in any order, any subset, and the Command comes round after any of them. Going home mid-episode and returning does not strand
anyone: Swale (Ep 3) and the troupe (Ep 4) are fetched **every time the party stands in the room**, not once.

## Which classical story each is, and where it differs from Acts I and II

Acts I and II of the King's Players already did two of these. The rule I followed: *link, vary, or fold*, never repeat.

### 1. The Two Pairs (*The Comedy of Errors*)
Marlcross keeps its Fair (Kit has come up with the company and is at the Ashlar house all day). Corbet Ashlar, cloth-merchant, has a twin from Evesholm he does
not know of, who has come with a servant (Jibb) who is the other Jibb's double. For a day the town behaves as if everyone had gone mad: a barred house, a
chain ordered and not ordered, an arrest, an exorcist, a wife, a sister-in-law, a courtesan, a magistrate. Signature beats: two masters, two servants,
the locked-out husband, the unordered chain, the arrest for debt, the exorcist, the Priory gate, the abbess who is the mother. The **reversal** is Mother
Everard's: she *is* the woman who lost the babies. *Wink*: "That explains the stove."
**Differs from Act I**, which played one pair of twins and a double as a farce *for* the King: this is the machine version, two pairs and a town on a timetable.
The company's work is **reconstruction by doing**: chalk the two Corbets and two Jibbs from what it has seen (`teach` Observes), pay the goldsmith, hold the
exorcist, put the bailiff on a servant, ask either man to wait, get the ring back from Madam Cinnabar. A day clock (incidents at +6 ... +46 watches) runs it;
every guarded incident has a "prevented" twin so no choice stalls the chain. **The dominant line is closed**: asking each Corbet to wait at the Mermaid only
silences the town (`e1Met`); the early ending needs both pairs chalked, and chalking needs `chainTaken`, i.e. the day to have happened, which a company that
pledges the Corbets before +6 never sees. Then the day runs on to the Prioress, whose scene carries the reversal in every ending (in the early one she is sent for
and speaks at the Mermaid). Each persuasion is one try: a failure latches (`f_grabb`, `f_tuckett`, `f_cv`, `f_cr`, `f_ring`).
**Endings**: *early* (both pairs chalked, then both Corbets at one table before +26); *Priory* (the exorcist held); *chaos* (an exorcist reading over the wrong
man; not credited). No verdict. Kit's three-way question (he held a door for Luce) is read in Ep 4. Kit is moved to Marlcross for the day and called back to the inn whenever the party next stands at the Fourways.

### 2. The Three (*Macbeth*)
Lord Ranulf Valtry of Cairnholt, tired and honest, has been told by three women on the moor that he will be Warden of the March. He hires the company *first to test the
women*: three tests (insight, lore, woodcraft); a report (genuine / fraud / "I cannot tell"); then the loop: what the company reported, whom it posted where and who carried
the Warden's cup are the prophecy's means. The women, if you go back, are writing down *your* deeds. *Reversal*: the prophecy is a work order and the company is the labour.
**Differs from Act II**, which gave the Salt-Wives one line about a Marshal: here the prophecy is the whole play, the company is complicit by procedure (`c2`), and there is no hearing.
- A genuine report is complicity (`c2 = 1`); so is silence. "I cannot tell" sets no report: Valtry stops waiting at +40 watches (`e2Unreported`) and decides for himself, exactly as
  complicit as a genuine report. Only a fraud report (or doing nothing after a fraud report) leaves the company out of the loop.
- The Warden's arrival is **telegraphed** (outriders in the yard); the night begins at 21:00 at least two hours after (`e2Night`); the feast is cleared; at 02:00 or later a step is heard on the
  stair (`e2Stair`), and **an hour** passes before the Lady's design resolves. Lady Marit makes the suggestion visible (`marit_asks`; a covered cup warms on her table).
- The company's real choices: the guards at the gate (c2), **take the cup up** (Marit hands it over in the hall; the company carries it; its Result names poppy), **refuse the cup**
  (persuasion; failure sends the cup up on the company's name), watch the Warden's door (persuasion, one try), warn him (persuasion, one try). All guard actions close with `e2Done`.
- **Turning the Lord** needs evidence: `e2_loop_known`, the women's page, which is only seen at the cairns after the company has done two things the prophecy needed. A hard persuasion
  check, one try (`e2Rebuffed` closes it and the purse).
**Endings**: *murder* (not credited); *survived* (a broadside a month later); *quiet*; *turned*; *revealed* (the Lady's purse and ribbon on the table). Dorcas's question (the Lady hungry, or afraid
of what her brother turns into?) is read in Ep 3.

### 3. The Prince and the Letter (*Hamlet* + Bellerophon)
Harrowmere: a Margravate in mourning, a Prince of twenty-one, a ghost, a Chancellor who engages the company to keep him alive (three timed exploits: the rampart, the captain's foils, the chapel),
and a courteous letter asking Orlay's Margravine (Aldith) to put the bearers to death. Beats: the ghost, the antic prince alone in the dark with a skull, **a players' trap**, the sword that is not
drawn in a chapel, the two friends who are the Margrave's ears (Spargo and Quillan: Rosencrantz and Guildenstern), the substituted letter. There is no sealed fencing match; the grave ending is the cut-down fifth act.
*Reversal*: the company is the *carrier*, the Bellerophon bearer. **Differs from Act II**, which played the third act (the Mousetrap) as a night of horror: the trap here is an action (`set_trap`, Swale,
a performance check) that works the Prince's one word into a speech and *sets what the Margrave does at the chapel*.
- The three exploits are keyed to the clock (the rampart from 23:00 to 04:00, the tiltyard from 09:00 to 17:00, the chapel from 17:00 to 22:00), each with a deadline of an hour from when it begins. The ghost speaks to the Prince **only if the company stands by him**; the company hears nothing and the Prince tells them ("Orchard"), which is the key to the trap. A working trap makes the Margrave
  confess to the stone (`e3Confessed`); without it the Prince must be held back (persuasion, hard; failure wounds him and raises `harm`). `watch_friends` (insight) learns that Spargo and Quillan report. Ysenne Fosbury, in the chapel, tells whoever asks that her father has copied a letter for Orlay and not slept (`ysenne_letter`): that warning stands for a read, so the letter may be burned unread.
- **The letter is a choice.** The genuine letter is dangerous to its bearers. Handed over, read or unread, the Margravine Aldith (id `berengar`) obeys it: the company is **shut in the Orlay larder, and
  the door is really barred** (`or_larder`; the larder door opens only on a night of the Prince's trust, a seventh night, or a spoon: `pick_larder_lock`, trapwork, one try). It is not credited.
  - **A cracked seal** (a failed read: three crowns and never learning what it says) keeps the company from the larder because she will not act on a letter she cannot swear to, but she keeps the Prince as her guest (`e3Held`) and the play is **not credited**: a failed read is the worst outcome of the read.
  - **Burning** (`burn_letter`, an hour, after a read or Ysenne's warning) leaves no letter and no cover story: a hard persuasion at Orlay (failure: turned away, not credited).
  - **Forging** needs a successful read, the Prince's consent (`tell_prince_letter`), his **one** sheet (`take_sheet`) and Swale; a failed forgery spends the sheet. At the table the forgery can be blown
    (`present_forged_letter`, persuasion): then it is the larder. If it holds, Spargo and Quillan are killed for it (the Prince's last lines change with trust, scorn and the spies).
  - **The oilskin** (`seal_letter_away`) keeps the genuine letter whole; with it, and a read, `confront_margrave` lays the sealed letter before the Margrave in the hall (hard persuasion, one try: he burns it himself; failure: dismissed, not credited); nothing of the letter (read, oilskin) is offered once it has been handed over.
  - **The inn.** Orlay shuts at dusk; the company sleeps at the Fox and Feather or in the hedge (cutpurses, once). At the inn the carrier packs the basket on a dice roll taken once on the morning (`dice(clock) <= 10`): a mixed basket is the
    farce of laundry lists, which is not credited and not a free win.
**Endings**: *larder*, *escape* (cracked with the Prince kept, forged, explained, exposed), *turned away*, *dismissed*, *misdelivery*, *grave*.

### 4. The Wood near Athens-under-Hollin (*A Midsummer Night's Dream*)
A squire's wedding at dawn in a beech wood, entertained by village players (Loom the weaver as Pyramus, Wall and Lion), Gosse beside himself. The wood has a pixie who steals from the party, a Lady of the ring, a Lord of the
Green with a hunt, a bog of lights, and an Ash that remembers. The wood scrambles `loves` at dusk-plus (Rafe loves Nan, Wat loves Idony). Beats: the weaver with an ass's head, the Lady in love with him, lovers lost in the wood, the love-flower,
the play within the play, the wedding at dawn. A changeling boy the Lord and Lady are quarrelling over is what the weaver is bargained for. **Differs from nothing**: no earlier act plays this.
- The Hunt and the bog are **telegraphed**: arriving at the edge, the horn is heard and the leaves turn; the hooves come two watches later and strike only an unprotected company (a failed dexterity save, 1d6). Protection
  is an action, not a free reroll: turn the coats (woodcraft, one try), have Tam play the hautboy on the lawn (performance, one try), or carry **iron nails or a torch, which lie on the lawn in the stage-carpenter's hamper** (`wd_iron`, `wd_torch`), or leave.
- **The two flowers differ.** Ofbit puts the pairs right (a woodcraft check; a failed hand spends the sprig; there are two). Poppy makes the four sleep and forget: they marry at dawn "between two people who like one another very much and cannot say why".
- **Three ways to the weaver**: the Lord's bargain (persuasion, hard, one try); the Ash's memory of his name (`ask_the_ash`, an hour, one try, then `name_the_lord`, no price, which leaves him humbled); and, only after the bargain has failed,
  your own true name (`pay_name`), read on the night of the Command.
- **The weaver matters**: a freed Loom is paid, with the fiddler, by the Squire's mother (+8 crowns) and leads the applause on the night of the Command (-2 chaos); the name paid costs +1 chaos.
**Endings**: *restored*, *blank* (poppy), *priced*, *fiasco* (credited only if the company acted or chose to let it play). Dawn is a clock hour (05:00-12:00), forty watches after the dusk quarrel; the quarrel is at dusk (18:00 to 04:00).

## Troupe arcs across the circuit

Read as Observes in the hub (order-independent), as topics in a later engagement (order-dependent: they appear only if the earlier one was played), and, for two of them, in Act V:

| Troupe | Asked in | Answer | Read in |
|---|---|---|---|
| Kit | Ep 1 (after Luce) | says so / holds / leans | Kit's heart Observes anywhere; Ep 4 topics `kit_wood_a/b/c` |
| Dorcas | Ep 2 (the Lady: hungry or afraid) | wants / afraid | Ep 3 topics `dorcas_iseult_a/b` |
| Swale | Ep 3 (the Prince's speech: cut or praise) | hand / vain | Ep 4 topics `swale_wood_a/b`; **Act V**: `swaleHand` softens his blurt (`rp_swale_soft`) |
| Pudding | Ep 4 (Pyramus) | Pyramus / sings | Pudding Observes; **Act V**: Pyramus asserts `puddingBrave`, read by `pudding_brave_holds` |
| Gosse | Ep 4 (beside himself) | calm / rested | `gosse_rested_obs` at dawn |
| Tiernan | Ep 3 | scorn / trust / lonely | escape, killed-friends and larder Observes (trust sets the larder's night) |
| Tilde / Corbet | Ep 1 (sides) | side | the closing Observes `e1_tilde_side`, `e1_corbet_side` |

## The four lists

### Works (played, in `test/repertory.test.ts`)
Each spec starts on the Wick's stage with Act IV's note paid (`heistOver`, the one staged premise) and **walks** to the Fourways: Playhouse Row, the Concourse, the River Gate, the road, the inn, Hepzibah's letters.
Skill checks are rolled naturally on a seed the spec names; a spec forces a result only for the one failure it shows (`roll('fail')`, then reset). The inn's dice and every clock hour are natural. The specs cover the gate
(nothing before the Wick; the lodged troupe, not a fixed roster; the Command held; home resets); Ep 1 early (chalk first), the three-move line shown not to end the day, Priory (with a save/reload), chaos, a failed argument latched; Ep 2 revealed
(and Dorcas), a failed argument closing the route, the telegraphed murder, "I cannot tell" as silence, the door, the door failing once, the cup carried, the cup refused (and failing), the quiet feast, the turn that needs evidence;
Ep 3 forged escape (one sheet; a forgery that fails), the larder (barred, and opened by a night or a spoon), the cracked seal and the Prince kept, burn-and-fail, the sealed letter laid before the Margrave, the inn's two dice outcomes, the grave,
Swale fetched after a trip home; Ep 4 ofbit (a failed hand), poppy, the failed bargain then the paid name, the Ash's route, the hautboy failing once, the telegraphed Hunt, the credited and uncredited fiascos, Kit's answer carried from Ep 1.

### Authored but not walked by a spec
- Ep 2 `warn_stroud` and `show_purse` succeeding after a report that was not a fraud; Ep 3 `tiernan_a1/a3` answers and the spies Observes, the Hunt's bog route; Ep 4 turn-your-coats, a successful bargain, Robin's theft, the weaver's wages and the Pudding/Dorcas/Swale readers in Eps 3-4.
- Act V's `rp_swale_soft`, `rp_loom_fan`, `rp_name_roll`: the rules fire in the played Command (which is reachable: the Ending only closes the book after `commandDone`), but no Repertory spec walks four acts and the Command to see them.
- No spec plays from the very beginning of the campaign: Act IV's end is asserted (`heistOver`) and the party placed on the Wick's stage. Pentrice's own rules (the troupe's day, Gosse's tiring-house) run live in the long waits.

### The engine cannot represent
- A tour *after* the Act V Endings: an `Ending` closes the book. The tour sits before the Command and holds it.
- A person moved by a rule that does not name where they stand: `Retract at(?p, ?q)` needs `?q` bound by the condition (friction F1).
- A prophecy that *predicts*: there is no chance-of-fate; what is fulfilled is only what a rule or action does.
- A cast you can recast: Kit cannot play Nan because he is Kit.

### Assets incomplete
No portraits or paintings for the Circuit's places; the pixie, nymph, satyr and dryad use canon species with no custom statblocks. No sound for the hunt horn (an authored `as sound` Observe stands in). No musical-instrument Kind for the hautboy.
