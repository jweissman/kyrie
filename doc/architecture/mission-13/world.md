# Mission 13: settlements and wild country

## Settlements made by why they are there

Before this mission every generated settlement was the same five rooms (green, inn, shrine, shop, houses) with
people spread over them. Now each is made from its **founding** (`src/world/founding.ts`,
`data/generation/scenes/foundings.json`): the reason it exists decides its heart, how it keeps travellers, how it
keeps its god, how it sells, what its people do, and what is seen of it from the road.

| Founding | Heart | Typically | Example from the playthroughs |
|---|---|---|---|
| crossing | the ford or the bridge | an inn, because travellers are why it exists | — |
| harbour | the landing | an inn; boats; nets; the market for the coast | Mornnal: "the one place on this shore where a boat can lie safe in a blow, and so everything that comes over the sea comes in here, and most of it stays" |
| fishing | the strand | no inn; a door to sell from | — |
| workings | the pit-head | an alehouse, the miners' shrine | — |
| yard | the yard | woodwrights, a canteen | — |
| farm | the green | the farm's hayloft; a wayside shrine | — |
| monastery | the gate-yard | the brothers' guest-hall; a chapel and a prior | Grenestede: "a wall runs round the brothers' house… with the village pressed against the outside of it like sheep against a fold" |
| fortress | the bailey | a sutler's canteen; a garrison chaplain | Loewarosto's bailey |
| ancient | by the makers' work | grown up beside something older | — |
| migration | the camp | no inn but who speaks for it; awnings and cook-fires | Bordtun: "has been a camp for forty years and shows no sign of becoming anything else" |
| market | the market square | two of Orsino's shops beside its own merchant | — |

Keeping varies (inn, alehouse, guesthouse, canteen, none), as does the holy place (shrine, chapel, garrison,
wayside) and the selling (a shop or a door); the roles every story relies on (whoever keeps travellers, a priest, a
merchant, a traveller) always exist, wherever the founding puts them. Occupations prefer the work of their founding
(a ferryman at a crossing, a lay brother at a monastery). A country has at most one crossing settlement (the one
nearest its river, not always the town) and an ancient one only within three cells of a work.

Done in this mission's playthroughs: townsfolk are drawn he or she on a stream of their own, so nothing else about
a country moves, and their role can overrule the draw (a prior, a guest-master, a herb-wife); a harbour's own
telling says its shore, so the boats are not told twice; where a settlement stands is one sentence ("It grew up
beside the Albeex, looking out over the Seolforclaene, with the fells at its back"); the people of the place you
grew up in know you.

## The roads, with people on them

`src/world/region-traffic.ts`: each road has one traveller of a kind (carrier, drover, pedlar, pilgrim, messenger,
a family moving house), out from nine until three going one way and the next day back, sleeping where travellers
are kept at the end they reach. Met on the road they say where they are going and why, news of the place they left
in that place's own gossip, and, once there is anything to say, what is said of the company. A carrier's wheel can
go into the ditch, a drover's cow through a hedge; whoever helps is thanked and paid; nobody, and it is sorted by
evening. The day a traveller passes, the road shows which way they went.

New in the playthroughs: a story's own scene is *staged* (`staged(place, story)` in the shared discovery rules), and
chance trouble keeps off it, so the father's cart is the only cart in the ditch on that road.

## Wild country

Each stretch of wild country (`src/world/region-zones.ts`) is landmarks on the land, joined by trails: an edge where
people come in from a road or a settlement, the places further in (a tarn under a crag, a charcoal-burners'
clearing), a second landmark in a large part, the crossing of any river. Leaving the trails is quicker and can lose
you; a high place shows the country round. Sites stand in a part of it, their tracks hidden deep in until found.

What lives there is causal, read off the land:

- **Dens** (`src/world/region-ecology.ts`): beasts that fit the habitat (wood, fen, fells, a barrow, a ruin), some
  drawn with an Orsino aspect by rarity, and in barrows and ruins some undead by Orsino's templates, laid to rest by
  the rites of the dead rather than fought. A den is a story: the inn hears that people who go out there come back
  short of a sheep, the way to it is told, and what was dragged in is there to be found.
- **Signs of animals**: now by the ground a road crosses (a grouse on the moor, a lark over meadow), not by the
  country at large, so no winter stoat on a summer moor.
- **What grows** (`src/world/region-growth.ts`): willow by water, sphagnum in the fen, yarrow at the waysides, on
  their own cells; a herb-wife who says the willow grows by the water is right, because it is read off the same land.
- **Wonders**: one or two deep in a country's wild country, and some within works; each now told in its own
  hand-written look until it is met.
- **Weather, light, hunger, weariness**: the sky turns each morning by the climate; rain fills the fords; after dark
  there is only what you carry for light, and a stair or a cellar is pitch dark; a company eats a ration a day and
  grows weary eighteen hours after it last slept, and fights weary until a bed, a camp or a rest.

## Finding your way

The playthroughs' largest discovery fault was the way to a place: told "the way to the round tower on the roof of
Sharpmunt", a player could not use it. A way is now told landmark by landmark ("into Sharpmunt and on to the tarn,
then the crag, where the track to it starts"), drawn on the map from the moment it is told, and the trails of wild
country are drawn where walked or told (not merely because the company can read a map).

## Every story can be found and finished

`src/world/world-audit.ts` reads a generated world, not its generator: every place a story is set in can be walked
to; every thing someone wants exists somewhere the company can reach (for sale, growing, lying about), and not only
in their own hands; every story has someone reachable who tells of it; every ending names only what something in the
world can bring about. `test/world-audit.test.ts` holds ten seeds to it, and catches a fever with no herbs anywhere.

## What remains thin

- Wandering finds signs and dens and wonders, but rarely *people* off the road: a hermit, a charcoal-burner at work.
- The ecology does not yet move: a den does not grow, a laid ghost does not change what the crows do, a flood does
  not change the map for days.
- Settlements differ by founding but not yet by fortune: a poor year, a feud, a wedding are the stories' business,
  not the place's.
