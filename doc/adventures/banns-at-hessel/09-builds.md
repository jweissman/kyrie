# The Banns at Hessel: character builds

*What each kind of company can do in Hessel. The capabilities below were read from the engine for each test build,
not from the class catalogue: `capable(party, …)` was asked of a fresh campaign for each fixture in
`test/fixtures/hessel`.*

| Build (fixture) | Capabilities in Hessel | Tested by |
|---|---|---|
| Bard, Tamsin (`data/campaigns/hessel.campaign.json`) | lore, persuasion | the Rooms; gossip; claims; warned; the licence; the lease; Pyne; Ismay's objection |
| Thief, Nell | lockwork, stealth, deception | the Old Town; the doorway (as Hartopp's messenger) |
| Warrior, Hob | brawn | Brocca carried; Pocklington; the intruder thrown out |
| Warrior, Dick ("soldier") | brawn, used for nothing | the Rooms way, with no check rolled, to the last dance |
| Ranger, Wynn (elf, hunter) | woodcraft | the Road to Orm and its three fates |
| Cleric, Agnes (dwarf, medic) | mending, rites, insight | the ankle, Ismay read, the drops reckoned, the prayers |
| Monk, Brother Aldo | mending, climbing, insight | the window (failed, then Mrs Brannagh), Rob dances with Celia |
| Mage, Osric | lore | the drops reckoned on the first day |

## Where a build matters

**Checks** can be tried by anyone; training makes them likelier. **Gates** need the capability, or there is no
offer.

| Moment | Check or gate | Strong builds | Everyone else |
|---|---|---|---|
| The runaway chair | catch: brawn check (fair) | warrior | steer it into the railings (no check, and it hurts); or watch, and be hired from her bed |
| Mrs Cherrett's ankle | strap it: mending gate | cleric, monk | she is up again on the second day |
| Signor Brocca | sober him: no check; carry him: brawn check (easy) | warrior | send for a chair; or let Twiss be disgraced |
| Mr Twiss | plain apology: persuasion check (hard) | bard | the apology in form, after Mopsa's lesson: no check at all |
| The chairmen's strike | break it: brawn check (fair) | warrior | stand with them, or take it to Twiss |
| Ismay's face | read it: insight check (fair) | cleric, monk | be told by Kit's violet, or by Mopsa |
| The drops | reckon them: lore or mending gate | bard, mage, cleric, monk | Jem for two coin, or as a chairmen's friend; Ottery |
| The drops swapped | without stealth, only when she is out of the room | thief | Ismay, Mopsa or Ottery asks her instead |
| Carth's area gate | pick it: lockwork; wrench it: brawn | thief, warrior | be there at eight when the coal comes |
| The coal-hole | lockwork or brawn, once searched for | thief, warrior | the area door with Mrs Brannagh's leave |
| The drawing-room window | climbing check (fair), at dusk | monk | Mrs Brannagh takes the poem up |
| Carth's front door | as Hartopp's man: deception check (fair) | thief | knock with Ottery; or be received after sitting up |
| The knocker | follow her: stealth check (fair) | thief | ask Big Lanyon, or Mrs Brannagh |
| The sheep-path to Orm | woodcraft or wayfinding gate | ranger (and anyone with Josiah's compass, afterwards) | the drove track, forty minutes longer |
| Ottery's ward | keep it while he is away: mending gate | cleric, monk | the ward goes without |
| Mrs Cherrett's death | pray over her: rites gate | cleric | the closing account has no prayers in it |
| The footpads | fight them (untested by the journeys) | warrior | pay three coin; or be beaten, robbed and left by the road, which the test of Ottery's third fate plays |

## What a build without charisma or scholarship can do

The commission asked that the region work without high charisma or scholarship. Two tests play it that way:

- **The soldier** plays the whole Rooms way, from the chair to the last minuet, with no check rolled. The form of the
  apology comes from asking Mopsa, the family scene from finding the hat and asking Rupert, and the drops from
  Jem's two coin and Ismay's asking. Every key in Hessel can be had by asking the right person at the right hour.
  Skills only make some keys quicker, or open a second door.
- **The thief** plays the whole Old Town way. Lockwork, stealth and deception give it ways into Carth House and to the
  drops that nobody else has, and it never needs Mr Twiss.

## Do the two principal approaches differ?

They were held to differ, and the tests check that they do (`test/hessel.test.ts`, the Rooms and the Old Town):

| | The Rooms (bard) | The Old Town (thief) |
|---|---|---|
| The household at the Ball | admitted by the apology in form | never admitted: the Old Town way does not go through the Rooms at all |
| The banns | withdrawn at Lady Wenlock's, with the baby in her arms | stopped in church, by Hetty, with the chairmen at the back |
| Ismay and Kit | Mrs Cherrett's blessing, after the navvy story | the note and the Sham Castle |
| The drops | Ismay asks her grandmother | the bottle filled with Pump Room water |
| Hartopp | dismissed by Mrs Cherrett; outdanced by the Rules | made to walk to the Ball in boots, and barred at the door |
| Carth House | the poem by Mrs Brannagh | the coal-hole; Celia out of the window to her mother in the laundry yard |
| The ending | *The Last Dance* | *The Morning After* |
| What the town knows | everything, in a drawing room | nothing, except about Hartopp's boots |

The test for each asserts that the other's facts are absent. The Old Town company never has the household admitted
or the grandson shown. The Rooms company never stopped the banns in church.
