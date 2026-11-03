# The Book of Faces: Quiet Hill and the Gauntlet (hill.kyr, warrior.kyr)

*Author A5. Two files: `hill.kyr` (prefix `hl_`) and `warrior.kyr` (prefix `wr_`), and the tests `test/ombra-hill.test.ts` and
`test/ombra-warrior.test.ts`. Nothing foreign is referenced but the spine (`named`, `unmaskTeaches`, `heat`, `roundDone`,
`handReady`, `handWay`, `arcBegun`, `arcDone`, `privateStairOpen`, `private_stair_known`, `newsHour`).*

## What is built

### The Dinner of Spoons (day 7, local comic; the Contessa)

*People.* The Contessa Ismene Tarn (83, bored, brilliant, cheats at a patience game of precedence, the last who enjoys being
known); Lord Hadrian Vesper (will not sit with his back to a door: 1269, a cousin, a carving knife) and Lady Philomena Corm
(wants the first soup hot: 1280, cold soup); Gaspar; the Fourteen and the Seconds as the room's furniture.

*The problem.* The seventh and eighth places are disputed by the precedence of a round bowl and a bruised oval one. What
the two want has nothing to do with the spoons (a door; a hot soup), and the Contessa wants something she has not said: to be
argued with, beaten, and called by her name. If nothing is done, at seven on the seventh evening the dinner is a duel
(`hl_feud`), the stair is closed, and the Hill is shuttered.

*Approaches, each leaving something different.*
1. **Protocol (the Ladle of 1103).** Dust the portraits with Gaspar (a favour, two hours, no roll) or read the Venn Book of
   Spoons at its lectern (lore); lay it before the Contessa (no roll). The complication: the Ladle was repealed in 1104 save
   that a *voice of Venn* may call it. The steward of a vacant House speaks for it (an old rule): Gaspar must stand at table and
   say so, aloud, or, if Lisbet has been told, she does. This route needs no charm and no learning, and it is the one
   that ends Gaspar's thread tenderly at the same moment.
2. **The absurd compromise (a round table, the soup from the stair).** Listen to Vesper and Corm on the Terrace at noon, beat
   the Contessa at Spoons (insight to see that she cheats, lore to beat her), call her Ismene, and pitch the table
   (persuasion). Costs: four rolls, any of which can send her bored for the day.
3. **Cheating (swap the spoons).** Stealth against the footman, 15:00 to 19:00 on day 7. Costs: it is found at breakfast on the
   eighth (heat on the Hill, and the Contessa will not lend the stair); a failure and the footman tells her.
4. **A Named Second.** If the company has Named the Veiled Second on the Stair (warrior.kyr, the sixth landing), Lord Vesper's
   son is ruined, Vesper does not dine, and the dispute dissolves; the Contessa is not pleased with the company.

*The Contessa's substantial conversation.* Five checks across four registers (insight, lore, persuasion, stealth, and the
Gaspar persuasion), branches that do not rejoin (the Ladle, the round table, the swap, the paper), and a mind changed by
something other than evidence three times: **being beaten at a game she cheats at** (`hl_beaten`), **being called Ismene** (`hl_ismene`,
available only after she has been beaten), and **an hour sat up with her at night** (`hl_sit_up`, no roll). Any one of them gives trust 1;
the private stair needs trust 1 and a dinner that was not a duel. Her price is a position: **a Second for one killing** (the
warrior's arc, see below) or **the company's voice at the Hearing** (`hl_contessa_voice(party)`, which the integrator reads).
Two registers: bare by day she is delighted, masked by day she asks for the mask to come off, masked at night she rings for a
Second (heat +1), bare at night she tells the truth (she is the last who remembers what it was to be called by a name).

### The Last Servant (Round 9, `r_gaspar`)

Gaspar (78) dusts the empty Palazzo Venn each day and lays the long table at nine for a family that has Spent itself. Lisbet
(26, sempstress in the Drip) is the heir and does not know it; the Registrar had found her. The clue is a thimble with three keys
(Lisbet's, Orla's): `hl_orla` (Gaspar) + `hl_thimble` (Lisbet) deduce `hl_heir`. Five ends, each setting `roundDone(party, r_gaspar)`:
1. **Tell Lisbet** (persuasion, or no roll at all with Orla's key from Gaspar): she goes up to the Palazzo the next morning and the
   old man says *The family is receiving*. Costs her anonymity and the loft. If the Ladle is also ruled she calls it herself.
2. **A kind lie** (deception): Orla did well abroad and the family asks him to rest. He closes the shutters (*Aired*) and sits in the
   sun. The family never wrote.
3. **The curtains** (six coin, two days, no roll): the company hires Lisbet to mend the gallery curtains for the Procession and tells
   neither. He serves her tea; he says *you hold your head like Miss Orla*; nobody understands what has been said.
4. **The paper** (trust and a plain request): the Contessa holds the Venn debt, forecloses, keeps him as caretaker and lays the Venn
   place at her dinners. The house is kept and Lisbet loses it without knowing.
5. **The Ladle** (above): he finds a voice.

Default if left alone: he goes on dusting; the Fate says so.

### The Gauntlet (warrior.kyr)

Nine landings, nine Seconds, ninety-nine steps, and the creed they add up to. A landing asks one question of a blade; every landing
has a **non-lethal way by a roll**, a **way by steel** (the engine's real, lethal fight; a Second killed is blood on the Stair and the
Captain will not swear a company that left any), and a **third thing** (coin, a kindness, an hour). The answers add to three measures
(`wr_hire`, `wr_defend`, `wr_break`); the Captain's question is asked once at the ninth and each answer is open only to a company
that has earned it (two deeds of that kind), or *plain* if none.

| Landing | Second | The question | Hireling | Defender | Breaker |
|---|---|---|---|---|---|
| 1 Dignity | Odo Sturry (L1) | steel on the rack, first blood | pay the toll | box him (brawn) | keep the steel (fight) |
| 2 the Door | Hale and Tace (L1 x2) | hold the doorway | fight both in the open (fight) | hold it (brawn, hard) | |
| 3 the Fool | Fenwick Dobb (L1), a child's father | to be fought | spar him (brawn) | be a better fool (performance) | draw on him (fight; Dilly orphaned) |
| 4 the Ledger | Corin Vask (L2), paid to lose | what is done with what is not earned | take the win and a half of the purse | refuse it, make him fight (brawn, hard) | fight in earnest (fight) |
| 5 the Yielding | Aldous Wend, old champion | what is done with a gift | take his sword (it is owed to nine families) | refuse it, carry his water | break it |
| 6 the Veil | a Second of no name (L2): Tobias Vesper | what is done with a thing not meant to be seen | take the House's ten coin | give him back his mask and say nothing | Name him aloud in the street |
| 7 the Brother | Anselm Reeve (L3), the Captain's brother | to be disarmed by the best | disarm him (brawn, hard) | let him touch you, say he won | fight him (fight) |
| 8 Fear | Pen Hesk, 16 | the one who is afraid | stare him down (intimidation) | sit and wait an hour | cut him down (fight) |
| 9 the Captain | Brannoch Reeve (L4) | what do you refuse | | | |

Complication: the fourth landing's purse is the Captain's own (she tells you at the top, if you ask: *it was only that you were next*).
A non-warrior (anyone with no `brawn` among the company) is let up the nine landings as the weather is, and sworn to nothing.
Retreat: every way is open both ways once a Second is passed; a company that falls is carried down to the foot (the engine's Mercy
spares an entirely fallen company of those who `takesPrisoners`) and the passed landings stay passed; the yard of the Guild has a
surgeon (3 coin; free to a sworn Second) and is `restful`. Three failed bouts in one climb (`wr_falls`) carry the company down to the bench in any case.

*At the top.* Swearing gives the blade (`wr_seconds_blade`), a milestone, `handReady(party, hand_stair)`, an hour's drill (endow
strength by one). The Contessa then commissions the sworn Second to kill **Lord Dacre Ullin**, the husband of her goddaughter Elinor
(the Houses will not own the marriage; Ullin's spoon is the eleventh and Elinor's the fourteenth): **take it** (60 coin, a fight at
level 3 in the yard by lamplight), **refuse it** (the Contessa hires another; Ullin is found on the ninth morning), or **stand for Elinor** on
the Guild's Rule of Acknowledgement (brawn, hard) or **persuade Ullin** to say it before the Fourteen (persuasion). Left alone, the eighth night
settles it.

*The Stair held (hand_stair, at `urn_hall` on `drawingNight()`).* `handWay(hand_stair)`: **1** held with shields (nobody hurt; any creed),
**2** held with steel (eleven of the crowd bled; not for a Defender), **3** the line opened (a Breaker only). The Captain walks the Seconds
to the Urn Hall at dusk if the company is sworn.

## What other files may read

Relations: `hl_feud(party)`, `hl_dinner_done(party)`, `hl_contessa_voice(party)` (the Hearing should hear the Old Names), `hl_vesper_gone(party)`,
`hl_end_told/lie/curtains/sold/ladle(party)`, `hl_lisbet_told(party)`, `hl_trust(party)` (measure, the Contessa), `wr_sworn(party)`, `wr_hireling/defender/breaker/plain(party)`,
`wr_blooded(party)`, `wr_ullin_dead/bound(party)`, `wr_other_second(party)`, `wr_promised(party)` (promised a Second for the stair).
Persons: `tarn`, `gaspar`, `lisbet`, `reeve`; mine too: `hl_vesper`, `hl_corm`, `hl_surgeon`, `wr_marl`, `wr_pair`, `wr_dobb`, `wr_vask`, `wr_wend`, `wr_veil`,
`wr_anselm`, `wr_rook`, `wr_elinor`, `wr_ullin`. Items: `wr_seconds_blade`, `wr_wend_blade`, `hl_book`, `hl_orla_key`.
`handWay(hand_stair)`: 1 shields, 2 steel, 3 line opened. `restful(seconds_yard)`.

## Friction

**1. No mercy for the beaten (the severe one).** Combat has no way to end short of death or flight: a foe at 0 HP is `dead`; `Pleads`/`routed`
happen only when a foe *flees*, which nothing in `tactics.ts` ever has a foe do. A Seconds' Guild in which a champion is made by what they
refuse cannot have its fights end in yielding. *Did instead:* every landing offers a **roll** for the non-lethal bout (and says so: first blood), and offers
**steel** as the real, lethal fight with the blood it leaves (`wr_blooded`, the Captain refuses the oath). Mercy is the engine's for a beaten
*company* but not for a beaten *foe*. *Remedy:* a `Yields at N hp` on a person (flee-at-threshold in the foe AI, and `routed` on it), or `Resolve combat(opponent) to first blood`.

**2. A fight is not shown with its odds.** `Resolve combat` offers "Fight X" with no chance on the page; the only way to know the odds
of a level-one climb was to simulate (below). A check says "an even chance"; a fight says nothing. *Remedy:* a rough odds line for a fight against a named foe.

**3. There is no calling test for a company.** "A non-warrior may climb but cannot finish" needed `capable(party, brawn)`, which is true only because brawn is
a warrior's class skill. A commoner with the `brawn` skill learned would pass as a warrior. *Remedy:* `callingOf(member, class)` or `hasCalling(group, warrior)`.

**4. `Greets` cannot be gated.** One greeting for every company, masked or bare, day or night; the two registers were made with topics only, so the
first words of a person are mask-blind. *Did instead:* a neutral Greets and gated topics. *Remedy:* `Greets … when …`, as `Role` has.

**5. A fate in two moods and a telling that is not done.** Rules anchored `at` the dining-room happen wherever the company is and are told only
where it is; the lint (rightly) advises on seven of them. The Dinner has to happen whether or not the company is at the table, so I accepted the advice.
The Grand Tour's friction 22 again: the doing and the telling want separate anchors.

**6. Results cannot vary and topics cannot be two turns.** The cap of ninety words a turn is kept by splitting a talk into topics (`hl_tarn_dinner`, `hl_tarn_why`), which
costs a menu entry each; and the Gauntlet's bouts have one Result for the success and one for the failure whatever the Second said before. A `Says` that is a list of turns would
let a talk be shown as a talk.

**7. Names are unique across every adventure.** `names` lint refused Marl, Pask, Rook and Quill because other adventures have a Marl, a Pask, a Rook and a Quill: two
renames and two more (now Sturry, Hesk, Sarum). The lint reads a surname alone. *Remedy:* scope the check to a module's own persons, or to the full name.

**8. `dead` is engine-written.** A person killed by *a Second in the night* cannot be asserted dead (the engine writes `dead`); `wr_other_second` and an `offstage` Ullin say it instead, and
the fates say *found in the morning*. *Remedy:* a way for a module to say a person is dead in the story and not in the creature store.

**9. A way into a site is labelled "Into the Duelling Stair by the first flight of the Stair".** The label names the area and the passage; a company stepping from a street room
onto a stair is told it twice. *Did:* leave it; the Stair's own landings read well ("To the landing of the Door"). *Remedy:* a way's label may be given.

**10. One try a day has no construct.** A roll that should not be re-rolled at once (Gaspar, Lisbet, the Contessa) is a measure of the day (`hl_try_day`, `hl_bored_day`) read in the
condition and set on failure, and a rule to lapse it. *Remedy:* `Retry after a day` on a check.

**12. A rule's line told in the command of a fight is not on the page.** When a lost fight and the company's being carried down (a rule moved them) came in one command, the line
the rule said (`Come again`) was in the step's `told` and absent from its `page`; the page told the fight, then the new room. The tests read `told`. *Remedy:* the page should keep what rules said
in the command that carried the company elsewhere, before the arrival.

**13. The rented face goes back at the Ninth Bell**, so a masked company at night can only be one with a face of its own; the burglar's topics (Lisbet's, the Contessa's) wait for one, and are tested
by their absence.

**11. Fate lines and the Ledger's `once`.** The closing rules need `once` and no body; fine. But a fate that must read *how* something ended (five ends of Gaspar) is five rules, each
excluding the others by hand.

## Odds, honestly

Level-one human warrior with the class's random weapon and armour (40 seeds per row, the fight alone, full health):
Sturry (L1) 57% won; Hale and Tace (L1 x2) 17%; Dobb (L1) 55%; Vask (L2) 35%; the Veil (L2) 35%; Anselm Reeve (L3) 22%; Hesk (L1) 47%. The same Door fought at
level 2: 23%, at level 3: 30%; the Brother at level 2: 43%, at level 3: 63%. The pair at the Door is a deliberate trap (*the open is dearer*): the doorway
roll is the way. The rolls (brawn +4 at level 1): fair (13) 60%, hard (16) 45%. A first version of the climb let a failed bout cost a d4 bruise with no limit on retries: of 24 level-one seeds walking the
mixed route with five to eight tries at every roll, 19 were sworn at the ninth landing and **3 died of bruises** (the other 2 ran out of tries). Now a failed bout is a d3 bruise
(save against 11) and three falls in a climb is *the Guild's count*: the company is carried down to the bench, the count starts again, the yard is `restful`, the surgeon is three
coin (free to the sworn, `wr_yard_care`) and the climb goes on where it left off. With that, the careful player (answers by the roll, retries, is carried down at the third fall,
sits on the bench, comes again) was sworn **40 of 40** at level one and **40 of 40** at level three, none dead, about 1.4 carry-downs a climb (`test/ombra-warrior.test.ts`, "a level-one climb"). One who answers
by steel throughout will be carried down at the second landing: a level-one warrior meets the Door's pair with a 17% chance. Fights are single commands in a journey, so what is
reported is the win rate of the whole fight; there is no way to see mid-fight odds.

## Tests

`test/ombra-hill.test.ts` (16 tests, about three minutes on a loaded machine) and `test/ombra-warrior.test.ts` (17 tests, about two minutes) both point at the real campaign and pass there, with
the stubbed module (the other authors' files are stubs in this worktree: nothing of mine reads a foreign person). The Stair-held tests walk to the Urn Hall by the map's own
bridges and ferry and would break if another author shuts a way (the Registry's door) on the ninth evening. Each has a happy path per thread, an alternative per thread, the
offered-action exploration (200 steps) and the persistence checks.

## Thin or unfinished

* The Fourteen are furniture: the dinner is seen in three observations and four tellings; Lord Ullin and Elinor Sarum have two topics each. The Dinner has no
  Fourteen to talk to at table, only Vesper and Corm on the Terrace.
* The Contessa's three other registers (the Chapel of her great-grandmother, what she thinks of the Concord) are one topic.
* A masked company at night in the Palazzo Venn is not turned away (passages cannot be gated by mask); only Lisbet, the Contessa and the topics are.
* The second face of the Gauntlet for a Breaker is two non-lethal deeds only (the old man's sword and a name said aloud); the other Breaker answers are
  steel and cost the oath.
* The Hill's rumours of the Registrar (that she married a Sarum to an Ullin in October) are in Elinor's mouth and nowhere else.
* `wr_promised` (a Second promised for the stair) is read by one fate only: the Contessa's price is a promise the Gauntlet's third way
  slips past, and the Contessa says so in no topic.
