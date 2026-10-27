# The Banns at Hessel: playthrough evidence

Everything here is reproducible. The journeys are step files in `test/fixtures/hessel/`, played by the labels a player
sees. `test/hessel.test.ts` asserts what each must leave behind, and `scripts/hessel-transcripts.ts` writes nine of
them out, as the page told them, to [`playtest/`](playtest).

```sh
bin/kyrie lint data/campaigns/hessel.campaign.json
bun test test/hessel.test.ts test/hessel-wander.test.ts
WANDER_SEEDS=a1,a2,a3,a4,a5,a6 WANDER_STEPS=500 bun test test/hessel-wander.test.ts   # a wider walk
bun scripts/hessel-transcripts.ts
bin/kyrie play data/campaigns/hessel.campaign.json --choices     # to play it yourself
```

## The journeys

| Journey | Build, seed | What it shows | Ending |
|---|---|---|---|
| [Left alone](playtest/alone.md) | bard, h1 | The world without the company. The banns stand; Rupert walks past his bride on the church steps to his wife; the knock goes on; Mrs Cherrett does not wake | *The Season's End* |
| [The Rooms](playtest/rooms.md) | bard, h1 | The apology in form; Jack in Lady Wenlock's arms; Ismay asks her grandmother; the navvy story and the blessing; the poem through Mrs Brannagh; the last minuet; Mopsa's yes | *The Last Dance* |
| [The Rooms, without the gifts](playtest/rooms-soldier.md) | warrior, h1 | The same, with no check rolled | *The Last Dance* |
| [The Old Town](playtest/oldtown.md) | thief, o1 | With the chairmen; Jem as a cousin; the drops swapped for Pump water; Hetty up the aisle; the coal-hole; Celia out of the window to her mother; Hartopp's boots, heard at the Two Poles | *The Morning After* |
| [The Road to Orm](playtest/orm.md) | ranger, r1 | The stile, the child, the sheep-path, the gibbet, the College; Ottery at Carth House; the door opened by Sir Gervase's own hand | *The Morning After* |
| [Turned Away](playtest/gossip.md) | bard, h1 | A lie told to Mrs Scrope. Public by three; the company dismissed by note; "She cried. M. G." | *Turned Away* |
| [The Window](playtest/window.md) | monk, m1 | The climb fails; Mrs Brannagh takes the poem; the window set ajar; Rob and Celia; Celia out at night | *The Season's End* |
| [The Prayers](playtest/cleric.md) | cleric, c1 | Hired from her bed as someone who only watched; the ankle strapped; Ismay read; the drops reckoned and not acted on; the prayers said | *The Season's End* |
| [Ismay Stands](playtest/objection.md) | bard, h1 | Stood beside, Ismay objects at the third reading herself, which does not stop the banns | *The Season's End* |

`test/hessel.test.ts` also plays the following:

- **Gossip of every kind**: claims, warned (Mr Pyne told, so he pauses long enough).
- **Brocca**, sobered and carried by a warrior.
- **Pocklington's bribe**, found out at the door.
- **The doorway**: in at Carth House as Hartopp's man.
- **The licence**: Kit and Ismay married on the fourth morning.
- **Ottery's other two fates**: north, and back unlicensed.
- **Mopsa's lease.**
- **The intruder** thrown out of Carth House and the window nailed.
- **Pyne**, and **Ismay's objection**.
- **A mage** who reckons the drops by lore.
- **A warrior on the Orm road**: told the child costs the College, walks past, fights the footpads, and is in time.
- **A friend of the chairmen on the Orm road**: names Davy's uncle at the gibbet, hears about the cloves, and has
  Hartopp made to walk.
- **A thief in Carth House at night**: stops Sir Gervase's sword with the truth about the letter.
- **The two tablets**: the memorial to a living woman, and the child Ottery came too late for.
- **Hartopp faced**, and the pumper's son.
- **The chapters**: the Rooms journey sees all four days open.
- **Keeping**: a Season saved on the second morning and resumed, which ends as the unbroken one does.
- **Determinism**: two identical runs.

## The two principal approaches differ

The Rooms test asserts the Old Town's facts are absent, and the Old Town test the Rooms':

- **The Rooms** (bard): `householdAdmitted`, `grandmother(lady_wenlock)`, `bannsWithdrawn` without `bannsStopped`,
  `cherrettBlessesKit`, the drops stopped by asking, `cherrettDanced` → *The Last Dance*.
- **The Old Town** (thief): `stoodWith`, `swapped`, `stoppedByHetty`, `celiaMetMother`, `hartoppBarred` by boots,
  and never `householdAdmitted` or `grandmother` → *The Morning After*.

The transcripts read differently. In the Rooms, things are said in drawing rooms, and the Season is told about them
at the Ball ("'My son's wife,' she says, and dares them"). In the Old Town they are done in the dark, in a laundry
yard, in a church, and the Rooms learn only about the boots.

## Multiple entry approaches

- **Into Hessel**: from the generated world, over the north march (below), or as the campaign's opening.
- **Into the household**: catch the chair, steer it, or watch it crash, then go up the hill to her bed and either
  say you tried or say you watched.
- **Into the Rooms**: the form, Brocca, or Pocklington's bribe (which fails at the door).
- **Into Carth House**: the area at eight with Mrs Brannagh; the area gate picked or wrenched; the coal-hole; the front
  door as Hartopp's man; with Ottery; as one received after sitting up; the window (climbing) when it is ajar.
- **Into the truth about the drops**: the label; Jem paid; Jem as a cousin; the bottle reckoned by lore or mending;
  Ottery; Mopsa's suspicion.

## Negotiations

- Mrs Cherrett's question on the second day: let them choose, give them money, or ask them. Each answer softens her
  differently.
- Mr Twiss: the apology in form, or plainly (persuasion, hard); separately, warned of the strike, he makes the
  Corporation restore the fares.
- Hetty: to the family scene, or to church.
- Kit: told about the window, or pushed.
- The footpads: talk, warn, pay or fight.
- Ottery at the gate: witness, let go, bring back.
- Sir Gervase: told, sat up with, asked to open the door himself. Opening it yourself sends Nan away for good.
- Mopsa: rescue her (refused) or ask her (accepted, on her terms).

## Alternate outcomes, tested

Mrs Cherrett lives or dies. The banns are withdrawn, stopped (four ways), objected to without effect, or broken on
the steps. Ismay is married, engaged, jilted, or free. Ottery is licensed, gone, or back unlicensed. The household is
admitted, barred, or turned back at the door. Carth House ends with the door opened, Celia with her mother, Celia
out, the window nailed, or nothing. The fares are restored or the strike stands. Mopsa gets her house, her yes, both,
or neither.

## Persistence

- **Saved and resumed**: `kept and resumed` saves a checkpoint on the second morning, resumes it in a new session,
  and checks that the Season ends as the unbroken one does.
- **Determinism**: `twice` runs the same steps twice and compares the worlds.
- **Generated world**: "walked into over the north march" assembles a world with seed `h14`. Hessel is placed at
  `x1ym1`, beyond the march from `x1y0`. A company starts outside it, finds it by its marker, crosses the march,
  lives the Season to an ending, and walks back out. The campaign keeps running after the book closes.

## Exploratory play

`test/hessel-wander.test.ts` takes one of whatever the page offers, again and again, for three builds (bard, thief,
warrior). It checks after every step that:

- the company is in a place;
- the page shows no ids or unfilled slots;
- the banns are never both stopped and read;
- a wedding breaks only on banns read;
- the household is never both admitted and barred;
- Mrs Cherrett is gone only at the fifth failing night, and then in her bed;
- whoever follows the company is where it is;
- there is never more than one ending.

Then it waits out the Season and requires one ending. By default it runs 200 steps from two seeds per build; this
pass also ran six seeds of 500 steps each.

What wandering found, and what was done about it:

| Found | Fix |
|---|---|
| The runaway chair ran on the day after Mrs Cherrett died. A late arrival at the Abbey Yard brought a dead woman down the Parade | The chair runs only while she is alive, up, and not yet grey (`cherretts.kyr`) |
| A first invariant, "the banns end one way", fired on a legitimate state: `bannsWithdrawn` also means the match is off, which the broken wedding asserts | The invariant was wrong, not the module. It now says what is meant: stopped and read are exclusive, and a broken wedding needs read banns |

Reading the transcripts as a player found more than wandering did; see [13-changes.md](13-changes.md).
