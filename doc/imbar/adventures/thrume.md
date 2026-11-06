# Thrume: the broad pass

*Revised against `14-bible.md`. Data only. New files: `wages.kyr`, `voices.kyr`, `faces.kyr`; `module.json` and `placed.json` list them and
declare the canon events they read. Tests: `test/thrume-depth.test.ts` (14), fixtures in `test/fixtures/thrume-depth/`.*

## The ledger

| | |
|---|---|
| **Count** | Thrume's sleep, in three clocks (the stirring, the breath, the host of Harle) and, under them, a wage: a hundred and eight smiths, seven bars of starmetal a day, the last day's pay due on the day the hill was down. |
| **Keeper** | The Rememberer keeps the song; the Gauge of Sleep keeps the needle; the dead Paid keep the pay-window. Nobody keeps all three, and none of them knows the others do. |
| **First page** | The Hollow Smiths were *hired*: the contract is on the pay-roll in the Paymasters' hall. The young gods never paid the last day, because the hill was never brought down. "Kept" and "owed" are the same wage seen from two sides of the counter. |
| **Price of reading** | A fight in the Delving rings along the iron and moves the needle toward WAKING (`stirring +1`); the office that closes the account costs an afternoon and a torch; paying costs twelve crowns and leaves the names unread. |

## Acts and scenes

| Act | Where | Faces (new in bold) |
|---|---|---|
| I. The dream-houses | Saltgrave: market, Salt Office, Red Lantern, Saltcellar, shrine, Dunmore's | Varne, Hauk, Mother Quietly, Hesper, Sister Agathe, Gil Sorrow, **Tamsin Quarrow (clerk)** |
| II. The Shoulder Hall | scree road, gate-yard, long hall, hearth, high seat, pens, wolf-pens, glacier cellars | Mórrach, Skarn, the Rememberer, Aud, **Wenna** |
| III. Inward | the workings, the Veins, the Lungs, the Smiths' Delving | Brannoc, the carvers, the warden, the Smith-Master (bones), **the Paid** |
| IV. Hush and the Tomb | the gate, the Thrall-Market, the Silent Library, the spire; the Heart-Tomb | the Weigher, Col, the Lady of Lull, the Abbess, Ardath |
| V. The Dream and the Between | the Palace of Before, the grey waste, the Mouth | the old ones, the dreaming Abbess |

## What changed (before, then after)

**Companion arc.** Before: none (the party was three presets and the module said nothing about them). After, in `voices.kyr`, by calling and
once each: **ranger** reads the snow of the gate-yard (hostages fed from the hold's own plate), the meadow of the Dream-Hollows (a place kept,
not made); **warrior** reads the long hall (no wall-walk: "built to be sat in"), the cold forge (hammers worn on the heel: "afraid every day
they worked"); **cleric** counts the sleepers' breath in the Red Lantern (six hours in, six out), knows the pulse again in the red gallery,
and stands in the Smith-Master's cell ("nobody has said a word over him"); plus a bard (inn), a mage (the Gauge) and a thief (the pegs), for
other parties. Six of these are heard by the presets, across all five acts.

*The calling-unique beat:* the cleric alone can say **the office for the dead at their work** over the Paid (`read_the_office`): it takes
three hours and lights the names; it closes the account, ends the danger, and is the only way to learn `smith_names`. The ranger alone can calm
the wolves (`calm_wolves`).

*The consequential choice:* the warrior and the cleric quarrel in the Paymasters' hall once the pay-roll is read (`quarrel_over_wage`):
**pay** (twelve crowns, or hand over the bars from the tray: instant, the Paid keep the window, no names) or **read the office** (an afternoon and a
torch, the Paid go, the names are learned and *sung at the Mouth*). One closes the other. The Mouth reads the choice back: the smiths' names go up
after the old ones' only for a company that read them (`smiths_sung`).

**Danger with ways round.** The Paid: two Hollow Smiths, Level 3, territorial, in a hall with no back door. The fight is possible and costly (tested:
it is won, one of the three is down and the others on a hit point or two, and the sleeper *stirs*, because "what kills, wakes"). Ways round, all
tested: pay in crowns; hand over the starmetal bars from the tray (the wage was always on the counter); show the Smith-Master's hammer; the
cleric's office; and the shared rules' own "ask them to let you by". They give a company an hour to say its business before the line decides it is
not on the roll. The wolves in the wolf-pens, which had no exit: now the ranger, or Skarn's bone whistle.

**Characterization (want / fear / lie / the thing they do when pressed).**

| Person | Want | Fear | Lie | Does, pressed |
|---|---|---|---|---|
| Provost Hauk | to be left alone and paid | what his ledger says he is | "I have not asked" | *opens the strongbox and gives the company the Lantern's hush money, twenty crowns, to buy Col back* (`hauk_turn`) |
| Skarn | the war | that when the old ones go there is no one to carry him | "Honour" | *gives the company the wolf-whistle*, having carried his thane to bed for eleven winters (`skarn_pressed`) |
| Brannoc | the quota met | being right about the Margravine's mountain a third time | "salt is salt" | *lies for the company to the Salt Office, and is the worst liar in the service* (`brannoc_after`) |
| Mórrach | the cutting to stop | being the last of the keepers | "I took them to stop the cutting" | *confesses he sits the seat at night to hear whether Thrume still sleeps* (`morrach_seat`) |
| Mother Quietly | (not changed) | | | |

At least two are shown in play, not only here: Hauk, Skarn, Brannoc, Mórrach (all four tested).

**Depth beyond the frame** (all off the critical path): the Paymasters' hall itself (108 pegs, a lintel that says *she was not*, a tallow dip nobody lit);
the boots on the adit props (112); the pinch of white salt owed the shrine by the Office, a two-century quarrel that broke every axle the third time it
was tried; the ham that cannot be eaten twice ("the second slice is the pig's own last dream"); the miners' lanterns hung in the wolf-pens with black wool on
the handles; the pebbles at the foot of the hearth pillars (grey, white, red for the three cut down by smiths, and one socket empty); Wenna's wooden hall.

**Links.** *Out:* Sister Agathe's fire is named as the same kind as the lamp on a rock beyond the Combs (Skerrow, the Pharos); Tamsin Quarrow
says a Founders' Exchange factor at Orsett has asked three springs running for unmarked red salt (the Dorothea's Orsett; the Exchange's errand);
the Gauge of Sleep marks a twelfth stroke when `befell(slack_opened)` (the black square in the House of Doors); the cloud landing thins when
`befell(cloudgate_fell)`. *In:* the Orsett factor's carter is what would bring a company from the river countries; a surveyor with the old glossary
would find the Delving's script legible. Neither module sets a flag for the other by name: both are reads of the canon.

**Tone.** The contrast scene is Wenna, who is eight, which is the height of a barn door, and puts the company to bed in a wooden hall in the
middle of the grimmest hold in the dale (`play_house`).

**Foreshadowing.** *Early, pays off in the last act:* Wenna's counting-out rhyme, learned in the hold, which a child's voice finishes at the Mouth
(`rhyme_sung`). *Only if the player went looking:* the pay-roll and the names, learned in the Delving, sung in the Mouth (`smiths_sung`). Neither
appears in the finale for a company that did not hear them (tested).

**Playability.** Every new action is reachable from the shipped campaign; every item is obtainable (`Give`, `Take` from a tray or a wall; the
whistle is `Give thrume_whistle to actor`, the wage is `Spend thrume_starbar`). Fixtures start the company at the Smiths' gate, the hold's yard, the
Mouth's edge and Brannoc's camp, because a full play to each is five hundred steps; the first two tests use the shipped campaign.

## Tests

`test/thrume.test.ts` (existing, 6) and `test/thrume-depth.test.ts` (new, 14 including a fight and a company that dithers). `bin/kyrie lint
data/campaigns/thrume.campaign.json`: 0 errors.

## Honest shortfalls

- The Wound's warden and the hunger in the cold shaft were not given second exits (the warden only waits to see whether you will come closer; the hunger is `ambush`).
- The Hush is unchanged. The Court's dossiers are the thinnest in the module and I did not thicken them.
- The ranger's "calm the wolves" is the only ranger-unique solution; the warrior has voices but no unique problem-solver.
- `smith_names` pays off in the finale as a sentence; it does not change an ending.
- The brannoc_after / Salt Office scene is an Observe, not a person to talk to.
- No new items in the shared catalog; the only catalog kind used is `lantern`.
