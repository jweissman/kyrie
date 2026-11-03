# The Mark-Forger (`q_forger.kyr`, prefix `fg_`)

*Test: `bun test test/quittance-forger.test.ts` (11 tests).*

## Premise

Ma Gedge (properly Gedgewick; "nobody has called me that since the Works") was die-sinker to the Phoenix Mark Works for
thirty-one years and cut the master of the bird from a drawing by a man who had never seen a feather. A steam press and a
contractor retired her, and a person of no registered mark cannot draw a pension. Her pension is the false plates she
casts for the unmarked poor, who nail them up in the Wards. The Phoenix has hired a mark-hunter, Mr Dabney, to find her; he
expects to know by Wednesday, which is a raid at four on the second afternoon (watch 336).

## Three scenes

1. **The back-shop** (`gedge_back`): the master dies, a tray of birds with eight tail-feathers where the Office's has
   seven, and a woman with a file she will not put down.
2. **Dyers' Alley** (`dyers_alley`): the hunter, with a glass and a plate and forty-one in a drawer.
3. **The Pargeters' front room** (`pargeter_front`): why the marks work, from a fireman who turned out for a bird he
   wondered about, because "half the lads are from the Wards. We don't look hard."

## Approaches

| Approach | Needs | Result |
|---|---|---|
| Report her | knows the founder (walk into the shop) | 12 coin, `regard(phoenix)` +1, `fg_informed`; Ma Gedge in the fire-house cell; no network; ten coin buys her out and her trust |
| Warn her | has heard of the hunter (ask him or the notice) | she hides the dies and trusts you; the raid finds door-knockers |
| Join her | trust | `fg_network`, twelve doors, `fg_writ`, the lesson; "Don't use it on the Wharf, use it on the bell" |
| Improve her marks | trust + lore (hard) *or* mending (fair) | `fg_better`, eight more doors; the true bird has seven feathers |
| Extort her | intimidation (fair) | 15 coin, she is hostile for good (`fg_hostile`, `fg_extorted`), `regard(wardsfolk)` down; a failed bluff is hostile too |
| Turn the hunter | learn he has a sister in Salt Lane behind one of her plates (insight on him, or her ledger) | `fg_turned`, `fg_protected`, `witness(fg_dabney)`; no raid |

## Complication

The forged marks work *some of the time*, and she knows why: the brigade men are mostly from Wards families and their eyes
are kind. Learned from her (trusted) or from Tobias Pargeter; teaches `d_marks_work`.

## Writes into the contract

`d_marks_work`; `witness(fg_dabney)`; `regard(phoenix)` +1 and `regard(wardsfolk)` down (reporting, extortion); the writ
(`fg_writ` of kind `forged_writ`, given on joining). Ours: `fg_network(party)` and `fg_doors(party)` (12 joined, +8
improved), `fg_informed`, `fg_turned`, `fg_extorted`, `fg_hostile`, `fg_bailed`, `fg_warned`, `fg_better`, `fg_raided(fg_shop)`.
A plate item (`fg_plate_kind`) opens `bk_nail_plate` in the bakery.

## Slate and the other doors

Slate claim until day 2 afternoon (teaches `fg_claim`); a notice at the mouth of Brick Lane (teaches `fg_plates`); a plate
polished by a child in Salt Lane (teaches `fg_plates`); the hunter's own greeting; the shop door.

## Build matrix

Warrior: extortion. Mage/bard: lore improvement. Cleric/monk: mending improvement, insight on the hunter. Thief: nothing of
their own (see critique). Plain: report, warn, join, bail, the ledger.

## What changed from the brief

* The hunter's lever is the sister, and the company can also reach it from her ledger, when she trusts it to them.
* "Three scenes" are a room, an alley and a front room; the third is a topic of Tobias's, not a staged event.
* The person is named **Ma Gedgewick** in the world (the names lint collides with Mopsa Gedge of Hessel); the alley's
  name for her, and the name of the room in `city.kyr`, are unchanged.

## Weakest part

The writ has no use inside this file. A raid that finds her is a failure with a fine rather than a scene. The thief build
has no distinct door (a lock on a ledger would have given them one).
