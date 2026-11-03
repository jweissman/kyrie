# The Scuttled Barge (`q_barge.kyr`, prefix `bg_`)

*The Lightering Reach. Whose salvage, whose fraud, whose girl.*

## Premise

The *Prudent Margaret*, a barge of sealed cold-lamps, lies sunk at the Mere Wharf. The Salvors' Yard and Skell & Sons
both claim her; Mr Orpwood of the Lamprey & River will call her a **Total Loss** at noon on day 2 unless somebody gives
him a reason; her owner, Mistress Honor Veasey, sits on a stool on the wharf and knits. The truth: she holed her own
barge from inside to hide a passenger, **Kitty Spratling**, twelve, sent out of the Bare Wards the week before an
Appointed block burned. Orpwood had seen the Phoenix's stamped notice cross his counter, told the girl's mother, and was
then given a consideration to call the loss total and ask nothing. The fraud saved the child. Handing it in returns her
to the list.

Clocks: **low water at five and five** (the wreck, the bell, the hold); **day 2 noon** the Total Loss is signed;
**night of day 3** the girl is shipped away; **day 4 noon** the cargo is sold. Reversible until the bell: the call can be
changed, by the company, until noon on day 4.

## People

| Who | Where | What moves them |
|---|---|---|
| Mr Orpwood, Lamprey adjuster | `lamprey_floor` | being asked as a colleague (not accused); a figure persuades him only to a salvage |
| Mistress Honor Veasey, owner | `mere_wharf` | the child's safety, never evidence. Her hands can be read (insight) and she can be pressed (persuasion, hard); told that Kitty is dry, she signs anything |
| Hester Grindle, Salvors' Yard | `salvor_yard` | a claim and a tariff board; hints at Skell's nights |
| Josiah Skell and **Skell's sons** (3, level 1) | `skell_yard` / `skell_loft` | shown the jars, he withdraws. His sons are the dangerous fight |
| Cob Jessop, Sluice-tap | `sluice_room` | a company that carried the Water-Stair (`entered_water`), a tongue, or the owner's word |
| Kitty Spratling | `bg_cellar` (under the sluice-wheel, found by searching) | being promised; the promise is a real `Promise` |
| Captain Dree (people.kyr) | `dree_room` | being out-bargained (arc 0→1), being named generous on the Slate (1→2) |
| Tam Ridd (arch.kyr, read only) | towpath, then the Stairs | greets differently after the quest and by `entered_water` |

Places added: `skell_loft` (Skell's bunkhouse, reach 3,2), `bg_cellar` (Sluice-tap cellar, sluice_b 0,2), passages
`bg_loft_door`, `bg_trap` (hidden until the cellar is found).

## Approaches and what each needs

| Door | What it needs | What it yields |
|---|---|---|
| **Dive the wreck** | low water; brawn (a check on the crank) **or** six coin to the lightermen; Dree's blessing optional | the count (311), the berth, the holed planking (`bg_counted bg_berth bg_holed`); without a chit, `bg_slighted_dree` |
| **Search Skell's yard** | dark; stealth (check) | 89 wet jars, a jar in hand, `bg_skell_dived`; Skell, shown them, withdraws his claim and his sons let the company be |
| **Caught in the yard** | failure of the above | the sons warn; talk (persuasion), pay six coin, show the licence (persuasion), name Dree (arc ≥ 1), or fight. The fight is lethal: of seven tried seeds, one was won |
| **Manifest against the wreck** (lore) | read the manifest (400) and either the Stairs tally-board or the hold count (311) and compare (lore check, one try) | `bg_count_short`. The tariff board (`salvor_yard`, lore) and the Lamprey's table of Averages (lore, one try) give `bg_tariff_known`, `bg_average_known` |
| **Confront the owner** | read her hands (insight), then press (persuasion hard); **or** find the girl and tell her Kitty is dry (no check) | `d_barge_girl`, `d_list_exists`, `bg_bought`, her word, her consent to a jettison |
| **The girl** | search the Sluice-tap; Jessop's trust (Water-Stair / persuasion / the owner's word) | `d_barge_girl`, `d_list_exists`, `bg_berth`; Kitty promised |
| **Deal with Dree** | out-bargain him (persuasion hard, or fair with the tariff known) | arc 1, `dree_leave`, the bell at sixpence; then "as agreed" |

## The complication

The owner's fraud *saved* the child. The company that proves it and does the lawful thing sends the girl back to the list;
the company that does the honest thing for the salvors ruins the woman who saved her. The call has to be made with that in
hand, and the better calls need the owner's **consent**, which cannot be had with evidence.

## Outcomes (`bg_ruling(lamprey)`)

| Ruling | How | regard(lamprey) | Who is paid | Where the girl ends | Else |
|---|---|---|---|---|---|
| 0→1 **Total Loss** | nobody acts (day 2 noon) | 0 | owner paid; Skell buys the lamps day 4 | shipped day 3 night (`bg_girl_gone`) unless kept | no keeper, no witness |
| 2 **Salvage** | evidence + persuasion at Orpwood | +1 | the Yard (half); Skell nothing; 12 coin | stays hidden, **not a witness** (a saviour was ruined) | `bg_veasey_ruined`; Wards −1 if the company knew the child (`bg_pellow_told`) |
| 3 **As agreed** | out-bargain Dree, strike the bargain | 0 | flat sums to both crews, the brigade takes the lamps; 8 coin | kept (`bg_staying`), witness if met | Orpwood stays bought; Dree takes the lamps; the Lamprey is not told |
| 4 **Fraud handed in** | any evidence at Orpwood (`Grave`) | +2 | the Lamprey; 12 coin | **listed**, taken by Skelter's men; promise broken | Wards −2 (`bg_gave_up_girl`); lightermen turn away |
| 5 **General Average** | `bg_average_known` + owner's consent + arc(dree) ≥ 1 | +2 | all bear it in proportion; 10 coin | kept, **witness(bg_girl)** if met | Dree's chit; keeper path open |

Independent of the ruling: **`keeper(reach)`** when Kitty is kept in Jessop's cellar past day 3 (`bg_staying`).
**arc(dree)** 1 on being out-bargained; 2 when, after a ruling of 2/3/5, he is told the Slate would name him generous and
the chalk boy (1 coin) chalks it. **`dree_leave`** is asserted at arc ≥ 1 or after any ruling that is neither Total Loss nor
fraud.

## The bell's hatch (`bell_shaft_way`)

`bg_hatch` has four ways open: **Dree's leave** (`dree_leave`), **a forged writ** (`holding(actor, forged_writ)`, a
deception check; the writ is spent, caught means `bg_writ_caught` and regard(lamprey) down), **the Teague combination**
(`teagueCombination`) or **force** (brawn; three hours; a `Grave`; the hatch is `wrecked`, the company arrives at
`bell_foot` and nothing leads back; the bell is gone, so the Margaret can no longer be dived). The first crossing of an open
shaft is foul air (`bg_foul`: damage, 20 minutes), after which the hatch is `aired`.

## What it writes into the contract

Writes: `regard(lamprey)` (+1, +2, or `Decrease … or to nothing`), `regard(wardsfolk)` (decreases only), `arc(dree)`,
`keeper(reach)`, `d_barge_girl`, `d_list_exists`, `witness(bg_girl)`, `dree_leave(party)`.
Reads: `entered_water`, `teagueCombination`, `forged_writ`, `adjuster_licence`.
**For the Hearing (read by name):** `bg_slighted_dree` (took the bell without a chit; wrecked it; killed Skell's sons),
`bg_gave_up_girl` (handed Kitty to the list), `bg_broke_kitty` (broke a promise to her), `bg_killed_sons`,
`bg_bell_wrecked`, and the measure `bg_ruling(lamprey)` (1 Total Loss, 2 Salvage, 3 As agreed, 4 Fraud, 5 General Average).

## Build matrix

- **Warrior**: crank the bell; force the hatch; the sons (a gamble); hauls the Stair for Tam.
- **Thief**: Skell's yard by night.
- **Mage / lore**: the board, manifest and table; opens the General Average and the cheap haggle with Dree.
- **Bard / persuasion**: Orpwood, the owner (hard), Dree, Jessop.
- **Cleric / insight**: Mistress Veasey's hands.
- **Plain party**: six coin to the lightermen, six to the sons, twelve to Dree; Tam's rope; searches the taproom.

## Changed from the brief

- Dree's lever is a persuasion check (hard, fair with the tariff known), as the table says, "out-bargained". Paying twelve
  coin buys a dive and not the hatch.
- Stealth/fight: the sons are a proud/territorial band that *warns* (their `Warns`), so the company has a watch to talk,
  pay, show a licence or name Dree. Winning kills them, with consequences (`bg_killed_sons`).
- The bell without a chit is not blocked but remembered (`bg_slighted_dree`).
- Added a General Average (ruling 5) as the hybrid ending; the brief's table had three.

## Honest critique

- The hardest ending (5) needs five hands (girl found, owner yielded, table known, Dree out-bargained, Orpwood's
  confidence); a very clever player may find it too long, and a rushing one will take the fraud. That is the intent, but
  the middle (3, "as agreed") is closer to a cheat code than a choice: only the Lamprey loses, and it never learns.
- Kitty has two scenes. She is the most important person in the quest and the least played.
- Salvage (2) can be reached with a roll and no thought; its cost (the saviour ruined) shows only in the Wards' regard.
- The fight is lethal enough that most players will pay the six coin; I think that is right, but it means the "genuinely
  dangerous fight" is mostly a threat.
- `witness(bg_girl)` is only for 3 and 5 with the girl met. The Hearing cannot tell the girl who trusts the company from
  the one who only knows it.
- The writ path is tested against a stand-in; the Forger's real writ has not been seen.
