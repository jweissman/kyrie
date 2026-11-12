# Encounters: audit and tuning (Westernesse Phase II, branch `adventure/p2-encounters`)

Blind playtests said: nearly every fight ends in one Attack, bosses included ("The king under the mound takes 1 fire damage
(0 HP left)"); wounds are invisible, so attrition killed a level-1 party with no warning; fights offer little tactical choice.
This page measures that, separates what is authored data from what is engine, says what was changed in data, and what is
asked of the engine (`kyr-deem-requests.md`, section E, R47 to R51).

## 1. How it was measured

`scripts/encounter-audit.ts` (with `scripts/encounter-bands.ts`) plays every foe against two representative companies by the
game's own choices (`Battle.chosen()` for both sides, as `scripts/novice-fights.ts` does), many trials each, from a seed:

- **solo**: one level-1 human warrior (14 hit points, longsword, ring mail);
- **four**: a level-3 warrior, cleric, mage and thief.

Per foe it reports hit points, armour class and weapon damage per round (the weapon die only: abilities such as curse or
life-drain are in the fights, not in that column), rounds for the company to end it, rounds for it to end the company, the share of
trials over in the company's first round ("one round"), the share in which the company is wiped out, and how hurt the worst-hit
member is at the end (share of maximum hit points lost). Foes come from: every creature kind at levels 1, 3 and 5 (`kinds`); the bands
of six generated countries, deep sites and wild (`sites`); the bands of eight countries carrying the placed troubles and the three
standing modules (`scenarios`); and the bands of the 28 authored campaigns, begun afresh (`adventures`).

```
bun scripts/encounter-audit.ts kinds|sites|adventures|scenarios [--trials 12] [--seeds 6 | a1,b2,...] [--only a,b] [--out f.json]
```

Limits: fights are fought in the open, without the place's laws, ambush or surprise (`Environment.encounter`), so the numbers say
how strong a foe is, not how a meeting goes. Four level-3 characters are a strong company; the solo warrior is the first hour.

## 2. What the numbers say (before)

| set | bands | mean foe HP | solo: over in one round | solo: wiped | four: over in one round | four: wiped | four: rounds to win | four: mean hurt |
|---|---|---|---|---|---|---|---|---|
| deep-site bands (6 countries) | 155 | 17.7 | 10 | 44 | 81 | 3 | 2.4 | 0.14 |
| keepers (barrow king, Unsung) | 6 | 35.3 | 0 | 6 | 0 | 1 | 6.2 | 0.45 |
| wild bands (first-hour country) | 127 | 2.7 | 121 | 0 | 127 | 0 | 1.0 | 0.00 |
| Numbered House (8 countries) | 40 | 17.7 | 0 | 20 | 10 | 1 | 2.3 | 0.18 |
| placed troubles and standing modules | 278 | 39.7 | 1 | 177 | 44 | 28 | 5.2 | 0.31 |
| authored adventures | 110 | 40.8 | 4 | 79 | 22 | 32 | 5.2 | 0.47 |
| creature kinds at level 1 / 3 / 5 | 170 each | 19 / 24 / 30 | 57 / 38 / 19 | 62 / 71 / 80 | 113 / 76 / 56 | 20 / 25 / 33 | 2.1 / 2.5 / 3.5 | 0.21 / 0.29 / 0.37 |

(Counts are of bands with the share at or above one half. Rounds are per-round initiative cycles.)

### Why fights collapse, by cause

**Engine / driver causes (not fixable in authored data; asked for in the requests file):**

1. **One scripted "Attack" is the whole fight.** `PlaySession.perform` runs the battle to its end, asking `PlaySession.auto`
   (`Tactics.choose`) for every command of the player's side. A blind player driving `bin/kyrie play` or `Journey` therefore
   gets a single step that is the entire fight, and that is the "ends in one Attack" of the playtests. Repro: a solo warrior in the
   barrow king's room (`room = region__<site>_grave_heart`), step "Attack": "The king under the mound hits Wenna. Wenna takes 5
   piercing damage (0 HP left). Wenna falls. The fight is lost." With a per-command controller the same fight is nine rounds
   (round 2: Wenna 1/14). (R47.)
2. **The damage line shows the clipped amount.** `Effects.hp` records `amount: applied`, with `applied = min(rolled, hp)`;
   the tidied narration also drops `(roll N)`. A blow of 9 on a creature with 1 hit point reads "takes 1 fire damage (0 HP left)".
   That is the quoted king line: the last point of a long fight, read as a one-hit kill. (R48.)
3. **Wounds are invisible.** Eight `hurt` lines are written in `data/voice/combat.json`, but `Barks.moment` only produces
   kill, fall, crit, flee and miss; `hurt` is never said, and there is no wound state in the narration of the company or the foe. (R49.)
4. **Empty menu after the company falls.** After "PARTY DOWN" in the repro above, `Journey.choices()` is empty and the campaign
   has no ending recorded: nothing offered, nothing said. (Seen in the scripted driver; the browser's own screen was not checked. R47.)
5. **Monster damage does not grow with level.** A species grows only in hit points (`growth.hitPoints`); natural weapons are
   1d3 to 1d8, one action. A level-12 mummy deals 1d4. Level makes foes long, not dangerous. (R50.)
6. **Deep dwellers cannot carry their own words or ways round.** `DeepGroup` has species, count, label, role, temperament and
   variations; no `Warns`, `Comes`, `Refuge` or `Fears`. Only the keeper has words. So the most-trodden fights (a deep site's
   rooms) have the plain words of the temperament, and no lure, bait or parley. (R51.)

**Authored-data causes (changed here):**

7. **Numbers.** Half of all deep-site bands are one or two small creatures; a company of four ends them in one round. Rooms
   below the first level were written for a company of one.
8. **The barrow king.** A level-8 mummy, 36 hit points, one claw (1d4): four level-3 characters beat it in about four rounds and are scratched (hurt 0.11 to 0.25, never wiped).
   Alone, the warrior dies. It is the one keeper that is both trivial and unfair.
9. **Savage groups with no warning.** Barrow ghouls, shades and mourners were `savage`: they come at once, with no turn to leave. A
   `territorial` group warns first and gives a turn (the page then shows the patience left).
10. **The Numbered House's deeps** (eels, great beetles, the slump) were levels 1 and 2 against a company that has come that far.

Not a cause: HP values, a display cap on HP, or party size alone. Kind hit points are reasonable (median 11 at level 1, 25 at level 5); what is thin is damage.

## 3. What was changed (data only)

| file | change | why |
|---|---|---|
| `data/generation/deep/barrow.json` | keeper level 8 to 12; its Warns now shows the split shields and the dark floor round the bier. Depth 1: ghouls 2 to 3 and `territorial`, bone hounds 2 to 3, restless dead 1 to 2. Depth 2: king's men 2 to 3, shades 1 to 2 and `territorial`. Elites: great hound `Variant great`, the mourner is two mourners and `territorial`, the champion is two champions, `Variant elder`. | A king who is long and costly but fair (fears the day, has a warning, a bane in the embalmers' room); company-of-four groups that last; a warning turn on every group that can kill. Depth 0 untouched (the first-hour rooms). |
| `data/generation/deep/deep.json`, `waterworks.json`, `singing.json` | Depth-1 and depth-2 counts raised by one (ghouls, bone hounds, mud, drowned spirits, drowned wardens, cantors); the singing hill's voice is two, `territorial`. Keepers left (measured at level 8 to 9 against four level-3 characters: the vein-thing wipes them 94 times in 100, the still water 44, the Unsung 25 to 50). | Same. |
| `data/catalog/monsters.json` | mummy: weapon `slam`, two actions (was claws, one). `data/catalog/challenge.json` re-measured for mummy (`bin/kyrie bestiary challenge mummy`: 0.33/1 to 1/4), since party composition spends that budget. | The weakest keeper species; the measure stays honest. |
| `data/situations/arcology/deeps.kyr` | eels level 1 to 3, great beetles level 2 to 4, the slump level 2 to 4. Their Warns, the drained-water ways round and the vent are unchanged. | They were the Numbered House's depth and were over in two rounds. |

Left alone on purpose: the wild bands and every depth-0 deep-site room (121 of 127 wild bands are over for the solo warrior in
one round, as the first hour needs); the Bound Howe and the Silent Lord (their bands are already 50 to 100 hit points with a
written `Warns`, and the Howe's Spade-Company and the Mouth wipe four level-3 characters; the Lord's authored ways round, the toll, the rites,
the bone thrown to the hound, the ewe for the brood-mother, the smoke for the den, are already the tactical alternatives); the
authored adventures (two thirds are meant for their own companies, not a lone warrior).

## 4. Before and after

| set | state | bands | mean foe HP | solo wiped | four: one round | four: wiped | four: rounds to win | four: mean hurt |
|---|---|---|---|---|---|---|---|---|
| deep-site bands | before | 155 | 17.7 | 44 | 81 | 3 | 2.4 | 0.14 |
| | after | 155 | 19.2 | 46 | 77 | 3 | 2.7 | 0.16 |
| keepers | before | 6 | 35.3 | 6 | 0 | 1 | 6.2 | 0.45 |
| | after | 6 | 43.3 | 6 | 0 | 1 | 8.8 | 0.87 |
| barrow king alone (four countries) | before | 4 | 36 | .58 to .92 | 0 | 0 | 3.3 to 4.4 | .11 to .25 |
| | after | 4 | 48 | 1.0 | 0 | .08 to .25 | 7.3 to 8.1 | .73 to .88 |
| Numbered House | before | 40 | 17.7 | 20 | 10 | 1 | 2.3 | 0.18 |
| | after | 40 | 26.5 | 37 | 5 | 1 | 3.0 | 0.23 |
| wild bands | both | 127 | 2.7 | 0 | 127 | 0 | 1.0 | 0.00 |

The first hour is unchanged: the wild rows are identical, and so are all depth-0 rows. The aggregate deep-site share over in one round only moves
from 81 to 77 of 155 because most such bands are depth-0 (rats, bats, a spider) and stay as they were. Below the first level the king is now an eight-round,
nine-tenths-of-a-party's-hit-points fight, in which the warning and the day (noon-jar, sunlight at the door) are the way through; the
barrow's two- and three-fold groups last two to six rounds where they lasted one to three.

## 5. Played

- `scripts/encounter-audit.ts` run over all four sets before and after (trials 12); the figures above.
- A scripted fight at the barrow king in `a1` (solo warrior, per-command controller): the king warns ("will give you 9 minutes,
  no more"), then in the first round takes the warrior from 14 to 1; with a flee order at half hit points the flight is not legal at 1 hit point and
  the warrior falls in the second round. That is the picture the requests file asks to make legible.
- Focused tests: see the branch's final report.

## 6. The depth pass on the Numbered House and the Silent Lord (`adventure/p3-depth`)

`bun scripts/encounter-audit.ts scenarios --trials 12` before and after: **unchanged for every band it reads** (the House's Usher,
owlbear, eels, beetles, slump; the keep's door-ward and rats) because the audit reads only bands that are not `Peaceable` at install, and the
new foes (Brannock's hands, Thole's Hands, Ansel) are made hostile by a rule, in play, by what the company does. Measured by hand
with the audit's own `measure` (12 trials, human warriors, solo level-1 warrior / four level-3 characters):

| foe | solo wiped | four: rounds to win | four: wiped | four: mean hurt |
|---|---|---|---|---|
| Brannock's hands, first drawn as 4 x L2 (too lethal) | 1.0 | 15.3 | .75 | .88 |
| Brannock's hands as shipped, 4 x L1 | 1.0 | 10.1 | .42 | .76 |
| Thole and the Hands, 3 x L2 | 1.0 | 14.2 | .42 | .81 |
| Ansel, 1 x L2 (a first-fall bout) | .58 | 3.3 | 0 | .10 |

These are long, dangerous fights a four can lose, and a solo first-hour company cannot win: every one of them warns first, in the
ward (*a guest who counts trays*), on the span (*that's a toll*), across the ward (*the king's champion*), and has three or more
ways round (toll, talk, a calling's reading, the marshal, the pawl, the paid garrison). Left unmeasured: the rival's fights as a
company would meet them on a tipped deck or at a stair's head, which the audit cannot set up.
