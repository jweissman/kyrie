# The Calf in the Tail-Race — friction

## Creative intent
A rescue with no villain. A whale calf is wedged in a tide-mill's tail-race at Tolt, and four people have an honest claim on it: a miller who needs her wheel, a gauger whose lamps keep a tower's readers from the dark, a whaleman whose brother died under the calf's mother, and a nine-year-old who reads it vegetables. The player's job is to learn what each of them is right about, and to find the one night (the year's spring tide, on the third night) when the sea will lift the calf, with the stop-logs drawn, the miller's mill spared, the neighbour's hay moved, the gauger answered with something he can burn, and a horn sounded by someone who means it. The Dam (the mother) is never seen until the end; she is heard at dusk, and the whole loch lights when she answers.

The surprise I wanted: the best way through is a chain of small kindnesses to people who are each slightly wrong, and the thing that unlocks the hardest man is a splinter of his dead brother's boat that the calf has carried in its flank for a year.

Connections: the Rì's lamp-oil law and the Star-Readers' towers of Dun Rìerdan (Waric trimmed wicks in the lower tower; the lamps cost more since the whalers stopped coming up the coast); Gannet Reach is named as where a man once tried to take a mother whale; the Rì's reach on a hill-country shore. It is deliberately not a ledger, a bell or a debt: its currency is herring, hay, rape-oil and a horn.

## What works (as far as automation can say)
- Eight endings' worth of consequence from one night: The Lit Water, The Line Across the Water, Sixty Barrels, A Calf Alone, Boiling Day, The Quiet Race (and two roads into the boiling). Each has its own grey-hour fates, told only if earned: Ulkin's haycocks sailing across the meadow or standing safe, Agnel's logs in four pieces, Mabet's list, Waric weighing the first gallon of rape-oil, Maric's empty hands.
- The gauger can be met four ways, each with a different cost: persuaded (needs the oil pledge from Agnel and the lamp-boy fact from Waric, in either order of discovery), paid (30 coin), robbed of his knives by a stealth check, or told to begin.
- Maric can be moved by the splinter (a chain of: look closely, Mabet's trust, her request, drawing it, the Good Intent), by a hard persuasion check, or joined. He can sound the horn himself, or lend it.
- Mabet's trust is a small question with three answers whose cost differs (not boiling: immediate; undecided: one feed; cynic: three).
- The calf's days are legible: three feeds (herring or a bucket-chain, one chain per twelve hours) before the tide or it fails at watch 300; Mabet and the page say so.
- Journey tests: 17 specs cover the main route and each ending, plus the gates (mallet refused until Ulkin is told, oil refused until the lamp is understood, logs refused before the tide, splinter refused until Mabet trusts, a forced sill).
- A wonder (the loch's cold light) that is there for anyone, Ulkin hints it, and nothing in the plot needs it.

## Incomplete or thin
- **No human has played it, and I did not look at the page.** `bin/kyrie preview` served it (HTTP 200); there is no browser in this sandbox, so I took no screenshot and cannot say how the page paints the race, the sill, or the dark.
- **Not registered in countries.json** (a shared registry I was told not to touch quietly). The adventure plays standalone from its campaign; `placed.json` is written but nothing places it. Proposed entry, for an owner to add: id `tailrace`, province, shore, bundle `tailrace/placed.json`, entry `road`, marker `mabet`, side east, terrain hills, covers meadow and hills, name "the Tolt shore", topic "Tolt, whose mill-wheel has stopped", rumour "'East, down the loch road,' says {keeper}, 'there's a tide-mill at Tolt with a whale in its race. The Rì's gauger is on his way with a copper.'". The marker (`mabet`) is a person only this country has.
- The Dam is a sound and a shape. There is no way to meet her except by answering a horn; no talking, no sighting before the tide.
- The tide is the clock, not a rule of the world: watch numbers (168, 276, 372, 408, 414) are hand-set in queries, and "the tide is too low" is a refusal, not a physical fact the sill could be read against.
- Mabet's reading is a refrain, not a performance: she does not read differently as the calf thrives or fails.
- Waric's oil deal is paid off in a fate line, not a keg the player can hold. After the ending nobody checks the rape-oil.
- Sixty Barrels has no cost for the player's own conscience beyond prose; the money (the finder's fifth) is a line in Waric's `begin` topic and not paid in coin. The Wonder is never required, so the loch's light can be missed entirely.
- Some talk is flavour only (the sea is polite; Marne on Tolt; the calf's name), with no effect later. An integrator can give Ulkin's politeness a use.

## Authoring difficulties
- **No `or` / `If` in an effect**, so every branch of the night is a separate rule with mutually exclusive conditions (`not maricYields and not maricJoined` threaded through four rules and three endings). Adding a third Maric disposition meant editing four conditions.
- **A discovery needs a source to be taught.** Observations that teach need `teaches` written by hand, and I forgot once: "Look closely" told the scar and taught nothing, so a later topic silently never appeared. Nothing warned.
- **A wonder's string is told as discovery text, not as an act's result**; I wrote it as an action in the first draft and the page told "you trail your hand through the water" on arrival, in daylight, unprompted. The pin test shows the shape but not that trap.
- **The "heard everywhere" advice cannot be satisfied for an Ending** (no anchor exists for it), so verify always lists six.
- **Deem was not a natural fit.** The tables and templates are for generated towns and wild country; I found no way for an authored adventure to draw a variant (a different vegetable each visit) except by writing a repertoire rule. I did not use Deem here and say so.
- **Journey labels that match twice:** "Ask Agnel about the mill" would also match its repeat form, so steps had to be ordered with care; fine, but the `Unoffered` message listing 20 rows of pack items ("Set down here") makes it hard to see the real choices.
- `bin/kyrie new` writes NOTES.md and a tiny test; verify then wants the friction in doc/adventures/<id>/ per AGENTS.md while earlier branches left it in data/adventures/<id>/. I put it in doc/adventures/tailrace/.

## Proposed improvements
- Kyr: `When … { … }` (conditional effects) in rules; a `before ending` hook; `Ending … after fates` ordering.
- Kyr: lint a topic or observation that is the only teacher of a discovery that a `when` elsewhere reads (it would have caught my missing `teaches`).
- Kyr: a first-class tide or clock measure (a named, repeating, authored time) so "spring tide on the third night" is not a watch number repeated in five queries.
- Deem: an authored-adventure hook for a small table (pick one of N lines per visit) so a refrain varies without a rule per line.
- Tooling: `verify` could play a list of named journeys and mark each ending reached by a test, so "5 other endings want journeys of their own" becomes "5 endings reached by tests, 0 unreached".
