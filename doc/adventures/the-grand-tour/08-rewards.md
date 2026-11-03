# The Grand Tour: rewards

*Experience, things, coin, companions, and the one reward that changes the world. Spoilers.*

## Experience

Twenty-seven milestones (`growth.kyr`), given once each to the company that did the thing, by its own act or while
it was there (the engine's rule). They pay for the city's people as well as its plot, on purpose:

| Worth | For |
|---|---|
| 25 | Entered for the Tour; a capstan shift; Perrin's leg set |
| 50 | Ha'penny above the step; Bethan's sleep; Prue's heat; Jem's place; Tolley's sentences; Chert's sky; No Admittance's laugh; the dead man alive |
| 75 | Crowned in the Hour Court; the Earth petal; the Water petal; let up to the North Wind; the ember home; the brothers face to face; the raid repulsed; Fabian brought home |
| 100 | Knowing who pushed Perrin; Mercy at the Lanterns; the Whelm warned; first through the Door |
| 150 | The Rector before the Watch; Lamp Street glass in the keel; the gift renewed; the Door opened from below by the Whelm's leave |

Seeing the module through is worth its own 1000 (`module.json`, `experience`), when it is installed in a world. In
the transcripts (`playtest/`), the bard's Tour collects 850 in milestones, each, for her and both companions; the
warrior's one-day Undertow 400; the acolyte's Found Out 325; the burglar's Letter 225. The Undertow is the
cheapest road to the Door and the poorest in experience, which is the trade the editorial wanted (E5).

There is no milestone for taking the keel, for the bribe, for going with the Rector, or for the notebook given her.

## Things

| Thing | Got by | Does |
|---|---|---|
| A Tourist's licence | Entering (10 coin or the commission) | Tench lets you through; Jem lets you in |
| The House's brine-glass helm | The Rector's commission (lent) | Breath while held; one for the whole company (see friction) |
| The House's fire-cloak | Tench (lent) | Heatproof while held |
| Dame Philippa's own Handbook | Fabian's promise (lent) | Her sixth edition read aloud at forty places; shown to the Hour Court (old, therefore new) |
| A hand-mirror; a geode; a jar of the North Wind | Bought; the Minutes; the North Wind | Each is new to the Hour Court |
| The four petals | The four courts' games; the keel | The Rose; given to the Rector; the North Wind's own |
| Prue's made petal | The North Wind's breath, a true petal for a night, Prue's furnace | Holds Cloudgate up in place of the Air petal |
| Perrin's notebook | The air-bell | The plaque read without lore; or, given the Rector, his death |
| Perrin's letter to his mother | Perrin | The Dowager believes |
| Ysabeau's letter | The Dowager, or the escritoire | The North Wind renews the gift |
| The North Wind's feather | Bringing his gift home or renewed | Climbing; you do not fall (the landing; the chain) |
| A hundred coin | The Dowager's bribe | Kept Above |

Lent things (`lends`) are owed back; the news notices.

## Companions

- **Fabian Murrey**, a level-2 commoner who writes the seventh edition as you go. No use in a fight, as he says.
  Fondness rises with what you do for him; at three he will dance, at five he can be told. Lost, the promise breaks.
- **Chert**, a pebble the size of a cat, carried on your boot. Opens the tower door through the cat-flap.
- **Mercy**, for a night, in a water-butt; **Ha'penny**, in a fish-basket, for an errand; **the Dowager**, up the
  Air Door; **Perrin**, up the Fish Stairs on a crutch made of an oar.

## The Doorward's door

The highest reward in the work, and the one with implications beyond Sennet. Whoever steps through the Door of Doors
first (`step_through`) is `doorward` for good:

- **Open the Door of Doors on {dest}** (`open_on`): from the Nexus, to any outdoor place in a settlement the company
  has stood in. In a campaign that is Sennet's own streets; in a generated world it is every town square and street the
  company stands on afterwards. (The world does not record where a protagonist stood before Sennet was installed, nor
  the places a road journey passes through: `friction.md`, 16. In practice the Door learns the world as you walk it.)
- **Knock three times on the nearest door** (`knock_home`): from indoors anywhere, not on the planes, straight into
  the Nexus.

Together they are a fast-travel network of the protagonist's own making, earned once and kept for life, and they are
kept from the Rector by the endings that bar her (`bar_rector`) or take her. The placed test plays the Undertow in the
`kite` world and opens the Door on the Glass Market. Its implications are deliberate: a world that goes on has a
protagonist who can be anywhere they have been in a minute, and the Door "knows you" in every ending where you went
first, including First Through, where the text says what that costs ("a great many places you would rather not see
again").
