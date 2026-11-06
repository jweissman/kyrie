# The House That Grows: broad-pass ledger

*Adventure `data/adventures/house-that-grows/` (campaign `the-house-that-grows`), revised against `14-bible.md`. Largest expansion of the three: a real fourth act, `slope.kyr` (267 lines), on a 840-line book.*

## The Account

| | |
|---|---|
| **Count** | The Seventh's age *in rooms*: the Choir counts panes under its lullaby, the Reckoning on the Slope scores them in rows of **eleven strokes and a blank**, and the child's chair in the Long Hall has twelve years of nights tallied on its floor. |
| **Keeper** | Three, nested: Cobble Ring's watchers on their stools (the town), the child's chair (a person), and Sabe Orrel on the Slope with a lamp lit for a boy called Wenn who never came off his watch (the kept light, unexplained). |
| **First page (missing)** | Why a girl of fourteen was left to dream a house for two and a half thousand years, and why no one has ever come into it by the front door. Never read out. |
| **Price of reading** | Whoever reads the Reckoning takes the blank: either the watcher's chair (Tobu) or the girl's place (she walks out; the house stops growing and a town loses the thing it watched). |

## Acts and scenes (with a face and a place each)

| Act | Scenes (place: face) |
|---|---|
| **I. Cobble Ring** | Kezu's kitchen and loft (Tobu, Hanu, Kezu asleep); the sleeping-hall (Wenu, Bolt the dog); the reeve's room (Ammu Tessa, the vote). |
| **II. The House in the Barley** | the flattened barley (the watchers, Old Pammu, Dace, Haddo); the glass bedroom, cup shelf, hall of coats, root cellar and Haddo's well; the folded man in the drawer. |
| **III. The Keel** | the Long Hall and the child's chair; the bunk room (Undal names, glass mice); the lamp store (Ottie); the Choir room; the dormitory stair and Rigging Row (the Knot House). |
| **IV. The Slope** (new) | the Slope (**Sabe Orrel**, her lamp, the Reckoning); the gate with two locks; the front hall (**Neme**, back to a front door, one hand raised for a knock); the sill over the drop. Told by four in-game `Chapter`s. |

Lowmere (Sennu's red door) stays the epilogue of the Ottie thread.

## What changed (before → after)

* **Ending**: none → **three** (`the_front_door`, `the_chair`, `the_gate_shut`), each closing the Account differently (Kezu stops dreaming in two of them). They do not branch on the vote, Ottie or Pammu; that is a shortfall (below).
* **Gate** (new): three ways in, each leaving a different girl. *Knock the eleven and wait the twelfth* (anyone who heard Sabe; Neme trusts you at once); *pick the brass lock* (anyone with lockwork; Neme is hurt, `gateForced`); **stare it open** (monk only, see below).
* **Choice at the front door**: let Neme out by the front door (house stops growing; Kezu stops dreaming) / ask **Tobu** to take the chair for good (he is the price) / shut the gate and go (nothing resolved; Sabe's lamp stays lit).
* **Undal letters**: Sabe reads the Lifted brother's letter to the reeve (`give_letter_reeve`, `Give hhg_undal_letter`); it moves two arcs off the sale (the vote now has a third lever beyond `house_one` and `well_reached`).
* **Danger with a way round** (new): the Knot House riggers appear if the Netters' knot is undone from below. A fight is possible (three riggers, level 2). Noncombat exits: **pay the fee** (4 coin) or **show Sabe's token** (she gives it by `Give`). The wind on the ledge to the sill (`edge_to_sill`) is a second hazard: it drops at a fixed hour of the night (wait it out); Sabe's rope is given for it but is flavour, not a requirement.
* **Contrast**: Wenu's Beams Book, with beam 606 that nobody counts the same twice (a comic account in a grave house, with a chill in the tail).

## Characterization (want / fear / lie / surprise)

| Person | Want | Fear | Lie | Surprise when pressed |
|---|---|---|---|---|
| **Sabe Orrel** | the knocking to stop in her lifetime | being the one who stopped it | "I only mind the lamp" | hands you her Netters' token and her rope unasked once you know the custom |
| **Neme** | someone to come in *by the door* | being fixed by being watched | "I'm only knocking to see who answers" | trusts a marble over an argument; wants the twelfth knock left to the visitor ("it isn't polite to do all the knocking") |
| **Kezu** | to have been right | that she is walking toward the knocking in her sleep | "I'm too old to be dreaming" (kept) | tells the dream when shown the twin of her cup |
| **Tobu** | to understand why she shut her eyes | being a boy who sleeps like an ox | "I'm only here to look at the doors" | volunteers for the chair, if asked, without being argued with |

## Companion arc

The preset party is one **monk** (Isa Wennu); NPC companions are Tobu and Ottie. Calling-keyed voices (`memberOf(?m, party) and hasCalling(?m, calling_x)`), eight of them across Acts II to IV: **monk** at the cup shelf and at the gate; **thief** in the lamp store and at the gate's second lock; **ranger** and **bard** in the Long Hall; **cleric**, **warrior**, **monk** on the Slope.
* **Calling-unique**: only a monk (stare-trained) can *stare the gate open* (`stare_gate`: an hour, interrupted if the company stops looking). The other callings knock or pick. It leaves Neme out of sorts: "That isn't fair, you've done it before."
* **Choice with a consequence**: `tobu_takes_chair` costs Tobu his life in Cobble Ring to free Neme; `let_neme_out` costs the town the thing it watched.

## Depth beyond the frame (not on the critical path)

Sabe's Wenn and the lamp that is for no one; the Knot House's rule that a knot cut from below is theft and from above a favour (the knot-custom); Beams Book and beam 606; "Do not sit on the floor, it slides"; the dormitory's fish-and-flame mark scratched under the lamp's foot (the keepers' device, unexplained, one of five); Undal as the letters the Ballast-Reeve forbids on the nets and everyone on the nets can read.

## Links

* **Out**: Sabe's lamp is of a kind "kept in a window, on a tower on the southern sea, for nobody in particular" (the Pharos); Dace's Company sells dreg on through **the Founders' Exchange at Corran and the Lesser Instruments there**, and to lens-grinders at **Low Water** (right college, right verb: *collects*). Items: `rope` (catalog kind) from Sabe by `Give`.
* **In**: what would bring a visitor from elsewhere: a Company factor who "buys things that fall out of the city", and a pilot looking for the Pharos lamp's twin. Cobble Ring is a place a passing Exchange herald would be told of.

## Foreshadow and payoff

* Early (Act I): Kezu dreams "someone knocking at the front one, wrong." Paid on the Slope: *eleven and the wait*, the knock that wants a twelfth.
* Went-looking: the child's coat and orange marble in the glass bedroom (`Pull the coat out`) pays only if the player carries the marble to Neme (`give_marble`); she trusts it without argument.
* The cup shelf's twelve cups; the hall of coats grows "a girl's coat for a girl of fifteen." Neme's age moves when she is let out.

## Tests

`test/house-that-grows.test.ts` (17, unchanged, passing) and `test/house-that-grows-slope.test.ts` (new): the Slope and the eleven; the monk's stare; the knock and the front door; the gate shut; Tobu's chair; the letter to the reeve (vote down by two); the Knot House riggers, both exits; chapters and outward links. `bin/kyrie lint`: 0 errors, 0 warnings.

## Honest shortfalls

* The riggers' **fight** is possible (engine fights apply) but not played in a test; only the two noncombat exits are.
* The ledge to the sill (`edge_to_sill`) is built and gated by a wind clock but **not exercised** by a test.
* The endings do not read the sale vote, Ottie's homecoming or Old Pammu; they should.
* `Beams Book` is a comic scene by tone only; no mechanic.
* Kezu's sleepwalk is not extended down the Slope; she is released at the ending by prose and by retracting her door (a fuller arc would put her at the gate).
* Companion voices exist for the monk party and the other six callings; the **mage** has none on the Slope.
