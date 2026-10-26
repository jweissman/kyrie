# What Tessary Owes

*An independent adventure for Kyrie, set in Imbar. Conceived first as literature and design
([01-treatment.md](01-treatment.md)), attacked by its own editor ([02-critique.md](02-critique.md)), revised
([03-revised-design.md](03-revised-design.md)), then built in Kyr (`data/adventures/what-tessary-owes`) and played.
The reports that close the commission are linked at the end. Spoilers throughout.*

```sh
bin/kyrie lint data/campaigns/what-tessary-owes.campaign.json        # 0 errors, 0 warnings
bin/kyrie preview data/campaigns/what-tessary-owes.campaign.json     # the reader
bun test test/what-tessary-owes.test.ts                              # 17 journeys
bun test test/what-tessary-owes-wander.test.ts                       # seeded random legal play
bun scripts/tessary-pages.ts release tessary                         # a journey written out as the page tells it
```

It is on the title page as *What Tessary Owes*, and a generated world whose first country is a fen may hold it beyond
its east march (seed `ossel`, for one).

## The kernel

A tidal city of salt and paper won an eleven-year war by calling in an enemy king's nine-hundred-year-old oath,
borrowed from the keepers of an ancient engine under the sea, and pledged its own soldiers' oaths as the collateral.
The soldiers have come home. The principal falls due at the Feast of Settlement and can be paid only in a kept promise
of equal weight; the only promise of that weight Tessary ever made is the one it made to those same soldiers: land
and a pension for every one who came home. The city cannot afford it. The salt-factor who carried the interest silver
for eleven years means to buy the note when it falls in, and govern with the Muster. The engine's eldest keeper drew
the note to fail, because the oaths that fall into his keeping will fill a hole he made in the ledger eleven hundred
years ago, when the sea took the city he had sworn to protect.

The protagonist comes because an eel-wife pinned a notice to the Landgate about her son.

## The setting

**Tessary on the Ossel**: a city on piles over a drowned Aenean city, at the mouth of a delta. It lives on salt, eels,
reed-paper and rope; it is a city of documents, scriveners and seals, whose people swear about everything. Its wards
each have a trade and a temper: the stilt-houses of **the Withies**, where the rank and file came home to;
**Saltgate** and its pans and warehouses; the **Lettered Quarter**, its Office of Seals and the queue that has not been
shorter in living memory; the **Tidewall** on its Aenean footings; the **Legion Yard** and the black **Oath Stone**,
salvaged from the drowned city; the **Terraces**, where the old houses sit on the Board of Moieties and the city keeps
a defeated king in good rooms.

**Lowtide**: twice a day the outer basin drains through the Throat and the drowned Aenean streets stand out of the
water for five hours: a colonnade furred with weed, a forum, a street of shops with scales on every counter, a
bath-house whose plunge-room is full of hollow people, the ebb-runners' quay, and at the bottom of everything the
windowless **Hall of Oaths**, whose end wall is the way down. The tide is the clock. Whoever is in the streets when it
turns is rolled out through the Throat onto the salt-pans, hurt and lighter; the aqueduct and the bath-house dome are
refuges.

**The Strongrooms**: a Mathematical Age vault under the delta, kept by **the Scruples**, the drowned city's clerks'
descendants: pale, long-lived, unable to lie, ruled like paper, their names pledged at birth. A weighing floor holds
whatever is said on it. A thin ledger in a locked room records every default. At the bottom hangs **the Balance**, a
scale the size of a ship, in a nave cut out of the bottom of the world.

**The Holding**: beyond the Balance, a white floor under no sky where pledged and forfeit things are kept with their
tags: a kingdom's harvest in stooks, a lake folded like linen, a three-hundred-year-forfeit goose, the names of the
Scruples on ten thousand cords, the held of the Long Muster asleep on their feet, and at the far edge, nine points of
black light that the Scruples say are what the Kiritarun tally.

## The movements

| | Register | What changes |
|---|---|---|
| **I. The Homecoming** | city comedy, unease, investigation | The vanishings are a lawful collection, and the Treasurer knows. |
| **II. Lowtide** | tidal exploration, danger, marvel | The Factor carried the interest silver, and means to buy the note. |
| **III. The Strongrooms** | alien society, negotiation, reading | The held are alive; the Comptroller is an ally against the Factor, and then the author of the trap. |
| **IV. The Feast Approaching** | political crisis, action, loyalty | The Board votes, or fails to; the Factor moves against Marrable, the Board and the Seal. |
| **V. The Holding** | wonder, quiet, the final bargain | The promise is delivered, released, voided, broken, sold, or forfeit. |

The movements are not gates. One player finds the Release without ever going below; another spends the fortnight in
the Strongrooms. The clock is the city's own: spring ebbs on the first night (the protagonist can watch twelve
soldiers walk into the sea), the eighth (Sergeant Durrance's turn) and the fifteenth (the Feast). The Board sits on
the thirteenth day.

## The people

- **The Ninth Assessor ("Tally")** — a Scruple sent up to inventory the collateral. Exact, literal, unable to lie,
  answers what it is asked and declines a great deal; counts the minutes you said you would be ("You said a minute. It
  has been forty minutes. I have noted it."). The principal arc: shown that their own Comptroller drew a promise in
  order that it be broken, they can indict him before the Assembly (*reformer*), break the note themselves and unravel
  (*unravelled*), have their pledged name redeemed in the Holding and keep a stall on Scriveners' Row (*freed*), or go
  below with the inventory complete (*unchanged*). Lie to them on the weighing floor and they stop opening doors.
- **Sergeant Agathe Durrance** — nineteen years in the Third Company, next on the roll, a believer in the oath (not the
  city: the oath). Held, if nobody stops it; kept back by force, by the Comptroller's bargain (and a drummer of
  nineteen goes in her place), or by the stand-down beaten on the Third Company's drum; the Factor's sergeant, if she
  learns the city sold her before she learns what the Factor means; the leader of the Release, if she learns the
  Scruples' second law.
- **Factor Imma Sault** — Mistress of the Salt Moiety, risen from the pans, right about the Board, frank about her
  ambition. The protagonist's first employer. Her undertakings run whether or not anyone interferes.
- **The Comptroller** — eldest of the Scruples, eleven hundred years old, who swore the drowned city's compact and saw
  the sea take it. He cannot lie; he can choose what to say; he can offer a bargain for silence.
- **Absalom Quire**, the Treasurer who signed, who sends the families money he does not have, and who drowns himself at
  the Throat on the tenth night unless someone gives him a reason not to; **King Amaury of Hethra**, who felt a
  nine-hundred-year-old hand on his neck at the ford; **Nan and Wick Teazle**, eel-wife and mudlark; **Ysbel
  Marrable**, one-armed councillor; **Hesketh Pounce**, scrivener, who keeps his drafts; **Benno Fisk**, corporal in a
  new coat; **Bettany Slake** and her ebb-runners; **the Fourteenth Copyist**, a young Scruple in love with bad
  surface poetry; **the Notary**; a goose called **Mistress Plum**; and another goose, forfeit since a horse-race.

## The strategic powers

**Factor Sault** wants to hold the note when it falls in. Her undertakings: the whisper that the vanished are deserters
(day 2); silver for Durrance's service (day 5, day 3 if she has the Assessor's pages); leaning on the Treasurer
(day 9); lightermen at Marrable's door (night 10, if the vote looks winnable); soldiers up the Terrace Steps with
torches (night 12, through Fisk); the Great Seal stolen (night 13, if the vote passed); the bid lodged (day 14), or
pledged in person in the Weighing Chamber if her broker has been suspended. What she misunderstands: the soldiers swore
*to keep the city*.

**The Comptroller** wants the note to fall in and stay in. He opposes the Factor (bring him her letter and he
suspends her broker), holds the city to the letter (the deeds must reach every hand, the held's included), and offers
a redeemed soldier for silence.

## How it can end

| Ending | Prepared by | Tessary afterward |
|---|---|---|
| **The Kept Promise** | proof before the Board, the Seal guarded, the deeds carried into the Holding | The held home; the old estates surveyed into strips; a city poor and honest |
| **The Release** | Durrance kept from the sea, taught the second law, the Muster gathered at the Oath Stone | The soldiers save the city again and get nothing; nobody answers the next war's drum |
| **The Void Note** | the Room of Defaults read with the Assessor, the indictment, the Assembly | The held home; a new Comptroller keeps the old hole in plain sight; the sea shows other stars |
| **The Broken Note** | the Room of Defaults read, nothing else left, the Assessor's sacrifice | The held home; a hollow man in a grey coat in the bath-house doorway |
| **The Warden** | the Factor exposed, and put to terms she can live with (the salt springs) | The Muster belongs to a woman who will never call it; the city owes her for ever |
| **The Factor's Tessary** | nothing (the default) | Order, prosperity, soldiers in her coats on the Tidewall |
| **Foreclosure** | the Factor's bid objected to as dominion, and nobody paying | The held stay held; something comes up the Throat that was not born in Imbar |

## The reports

- [04-editorial-account.md](04-editorial-account.md): what changed between the first conception and the work, and why.
- [05-playability.md](05-playability.md): journeys, alternatives, difficulty, persistence and replay, known limits.
- [06-authoring-friction.md](06-authoring-friction.md): what Kyr, Deem and the engine made hard, what was changed.
- [07-integration.md](07-integration.md): entry, placement, dependencies, campaigns.
- [08-judgment.md](08-judgment.md): where it succeeds, where it falls short, what another revision would change.
- [playtest/](playtest/): journeys written out as the page tells them.
