# The Book of Faces: broad-pass ledger

*Data only. New file `data/adventures/book-of-faces/revision.kyr` (prefix `rv_`, added to `module.json`, plus `"canon": ["rose_made_whole"]`). Tests: `test/the-book-of-faces-revision.test.ts` with fixture `test/fixtures/book-of-faces/` (a company of four) and `test/the-book-of-faces-shipped.test.ts` (the shipped campaign, a lone warrior).*

## The Account
- **Count:** the Standard Pound (and, behind it, the Book's ninety years of names).
- **Keeper:** the Collegium of Measures, which *weighs*; in practice an office of eleven Assayers and a twelfth hook, now held by the Bursar, Perpetua Gaunt.
- **First page (missing):** the Pound's own first leaf: THIS IS NOT A WEIGHT. IT IS KEPT. It is in a drawer under the Pound's mould, behind a second lock felt from below.
- **Price of reading:** a standard that was kept becomes a standard that is owed; the Collegium says "owed" for everything, and the old writs say "kept".

## Acts and scenes (existing structure, named; one gap filled)
I. **The Gate** (road end, Customs Steps, Strangers' Square, Gatehouse: Vail). II. **The Rows** (Counting Row: Exchange, Hall of Weights, Warden of Locks, Collegium; the Wet Post; Maskers' Lane). III. **The Water** (the Drip, cisterns, Heronry). IV. **The Hill and the Chapel** (Palazzi, Duelling Stair, Chapel, Urn Hall). V. **The Drawing**. Every existing scene already had a place and a face. The gap: the Collegium had a hall, a Master and no one to *keep* it, and the Pound a card and no history. **New scenes:** the Bursar at the hooks; the assay stair and the Counterpoise (landing); the assay cellar by day and by night.

## What changed, before to after
| | Before | After |
|---|---|---|
| Collegium of Measures | a hall, plaster Masters, Thole in the workroom | a Bursar (want/fear/lie/surprise in play), twelve hooks (eleven tagged, one oiled; the only eleven-and-a-blank left in the adventure), the wet thumb on the slate (a nine-year-old's wrong reason for it), the cheese suit of 211 years ago, a stair behind the Frame |
| Danger | eel, rats, Gauntlet | the Counterpoise (level 6): fight is possible and costly; ways round are the Bursar's chit (by fee or by the Corran letter), a short Drip loaf, and Thole's recitative |
| Calling | arcs keyed to the group's capabilities | seven calling-keyed voice rules for six callings (cleric nave, thief Warden's office and cellar, ranger Drip pilings, warrior Duelling Stair, bard Wet Stage, mage Frame) |
| Companion choice | none | thief vs cleric over the leaf: *keep it for the rest* (the leaf leaves the cellar) or *return it and tell the Bursar* (8 coin, her entry that the Pound is kept). A lone warrior has a weaker, costly route: force the case with a bar (`rv_force_case`): the leaf comes out, the Pound's mould is cracked, the Bursar will not speak of the hooks or the writ again, the vigil cannot be sat, and the news records the Pound as OWED |
| Hour before | no Collegium lines | four new fate lines |

## Characterization (want / fear / lie / surprise; shown in play)
- **Bursar Gaunt:** wants the quarter's assay to come out even; fears it is light by a grain; lies "a measure has no opinion"; surprise: she is the twelfth Assayer and has kept a hook oiled for a successor she may not appoint. Played in `rv_b_owed`, `rv_b_twelfth`, `rv_tell_bursar`.
- **Dr Thole:** wants a mask that stays on; fears it is the rule; lies "the Frame is warped"; surprise: shown the leaf he puts on a mask and does arithmetic in it. Played in `rv_thole_stair`, `rv_thole_leaf`.
- **Sergeant Vail:** wants to be a person a little; fears she is only the hound; lies "procedure"; surprise: takes the domino off for a kettle (`rv_vail_kettle_t`).
- **Orsolya Hart:** wants a name on a lock; fears the Book's names are small; lies "less safe, not hurt"; surprise: asked for the leaf, asks *not* to be given it (`rv_vane_leaf`).

## Companion arc
Voices at six beats across the acts. **Calling-unique:** only a thief of the company can find the case's second lock (`rv_open_case`; `rv_search_case` tells a non-thief they have not the eye, and that a bar would find the drawer: `rv_force_case`, the warrior's costly route, which the shipped lone warrior takes). Choice with consequence: `rv_side_thief` / `rv_side_cleric` (quarrel fires only for a company with both; each side closes the other).

## Danger with ways round
Counterpoise at the Pound's door. Fight: Attack (the page offers it); costs the Weight, the chit, the Bursar's candour (`rv_b_twelfth` closes) and the vigil (it needs the Counterpoise to tolerate you); a fate line. Exits: chit (item, Give, fee 3 or the letter), short loaf (item), Thole's recitative (witness; needs his audience).

## Depth beyond the frame (non-critical)
The wet thumb pressed to the slate by the door; the Collegium's suit against the Hall of Weights over a cheese, 211 years ago, with a card at midwinter; a lintel naming the Assayers, the last ISAURA HEXHAM; the Row's plates whose lowest corner everyone touches (left unexplained); the green flood-lines on the Drip's pilings; the Duelling Stair worn on the left. The Aenean/mathematical claim is not made; the Pound is "kept", not built.

## Links
- **Out:** `collegium_letter` (Lesser Instruments at Corran) opens the Bursar's chit (and she says Corran *collects* while Measures *weighs*); `tally_rubbing` is read by the Magpie tallyman (Row's three notations); `befell(rose_made_whole)` changes the coffee-house board; "owed" versus "kept" (the Prefect's writ vocabulary).
- **In:** the Watch's notice in any town; a visitor with a standard to be sealed against the Pound would be sent to the Bursar (the letter and the rubbing are the items that arrive with them).

## Foreshadow and payoff
Early: the Standard Room's card (THE POUND IS A PROMISE) and the oiled twelfth hook in the hall. Payoff at the last act: the leaf, Thole's mask, Hart's refusal, the fate lines. Only if looked for: the stair, the second lock, the vigil.

## Contrast
After a city of masks and satire: the vigil in the assay cellar (`rv_sit_vigil`), a still hour; the Counterpoise sets its pebble down and holds the door on the way up.

## Tests (12 in `the-book-of-faces-revision`, 1 in `the-book-of-faces-shipped`)
Bursar and chit; stair/Counterpoise guarded and chit; thief-only lock; cleric side + eight coin; thief side + no Bursar report; Thole's recitative + mask (seed `b`); Hart's refusal; the fight and its costs; the vigil and the hour-before line; voices; short loaf. Also run: `the-book-of-faces-placed`, `all-in-one-world`.

## Honest shortfalls
- A party with no thief and no warrior cannot get the leaf (deliberate); the warrior's way gives no Bursar route (she is cold to it) and no quarrel or side to take.
- `test/the-book-of-faces-shipped.test.ts` plays the shipped warrior down the bar route (fee, chit, Counterpoise, force the case, the Bursar's coldness, Hart's refusal, the Stair voice) with no put, give or assert. The thief's lock, the quarrel and the vigil are tested only in the company-of-four fixture.
- The letter and the rubbing links are untested in play (no way to obtain those items inside this adventure without a visit elsewhere); they are gated on `holding(...)`, which lint accepts.
- Ranger/warrior/bard/mage voices are one-liners; the ranger and mage beats are voice only (their existing arcs carry the rest). The revision test asserts the cleric, thief, warrior and ranger voices and the absence of the mage line; the bard's Wet Stage voice is not asserted.
- Calendar left local; no conversion.
- A second fight (the eel, the Gauntlet) was not rechecked for two exits.
