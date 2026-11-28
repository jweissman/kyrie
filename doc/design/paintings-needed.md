# Paintings needed

The one current list of the paintings the game still lacks, scenes and portraits alike. It replaces the art wishlist,
the place commissions and the scene-needs list of 21–22 November, which are kept in
[doc/history/paintings/](../history/paintings/) as the record of how the list was made and what filled it.

**Measured 23 November**, after the owner's ~200 scene paintings of 21–22 November and a tagging pass over the whole
corpus. Re-measure after each batch with `bun scripts/scene-census.ts <world>`: it puts the company at every place of
a generated world and asks for the scene's painting on a fair day, in rain by day, on a fair evening, on a fair
night and in rain by night.

**Measured again 23 November, evening, against the sky** (BRIEF §3.4; register CP-20). The census now also judges
each painting it is given against the sky it is asked under, by the light and weather recorded for it in
`data/paintings/seen.json` (src/ui/painted-sky.ts): never clear or sunlit in rain, never rain on a dry day, never
daylit at evening or night, never of dusk or the moon by day, never a painting with no light recorded. Fifty placed
paintings, most of them the old masters, had no light recorded and stood in any sky; they are tagged now, and the fit
rules refuse what they contradict. So places that had a painting against the sky now have none: the counts rose, and
each is a painting wanted, not a picture against the place.

| World | Places | Blank in some sky, 24 Nov (bound) | Blank, 23 Nov evening | Painted against some sky | Was (23 Nov morning, four skies) |
|---|---|---|---|---|---|
| Iscoed | 756 | **103** | 136 | **0** | 50 blank |
| a1 | 877 | **123** | 184 | **0** | 77 blank |

The warrior's golden walk (`bun scripts/scene-census.ts walk`) is held at no fault at every turn by
test/features/world/the-sky-in-the-painting.pin. Porthalen rains through it and it ends at night.

## By terrain and subject (the owner's folders)

The owner's own scene paintings counted by terrain and by subject (the direction of 24 November, §6: an overview, a
shelter to rest in, a hamlet or town, a city, the wild, a wonder), resting scenes first: a **0** is a painting wanted.
A painting kept in a terrain's folder (`assets/bg/terrain/<t>/`) is of that terrain; the rest are sorted by their
words until they are filed (`temperate` is what no word sorts). Written by `bin/kyrie suggest paintings --write`;
`bun scripts/bg-import.ts` first brings in what was added or moved.

<!-- by-terrain -->
| Terrain | Paintings | shelter | overview | town | city | wild | wonder | Wanted first |
|---|---|---|---|---|---|---|---|---|
| cave | 10 (10 filed) | 2 | 2 | **0** | **0** | 2 | 4 | town, city |
| coast | 72 (29 filed) | 28 | **0** | 5 | 6 | 26 | 7 | overview |
| desert | 35 (30 filed) | 4 | 5 | **0** | 10 | 11 | 5 | town |
| frost | 12 | 3 | **0** | 2 | 1 | 5 | 1 | overview |
| jungle | 13 (13 filed) | 2 | 3 | **0** | 1 | 4 | 3 | town |
| marsh | 4 | **0** | **0** | 1 | **0** | 3 | **0** | shelter, overview, city, wonder |
| mountain | 21 (4 filed) | 10 | 1 | **0** | **0** | 8 | 2 | town, city |
| plains | 13 | 4 | **0** | **0** | **0** | 9 | **0** | overview, town, city, wonder |
| sky | 5 (5 filed) | **0** | 1 | **0** | 2 | 1 | 1 | shelter, town |
| temperate | 169 | 94 | 4 | 16 | 14 | 36 | 5 | — |
| tropics | 9 | 1 | **0** | 2 | **0** | 4 | 2 | overview, city |
| tundra | 19 (19 filed) | 2 | 1 | 1 | 2 | 11 | 2 | — |
| valley | 70 (31 filed) | 9 | 4 | 10 | 6 | 27 | 14 | — |
| waste | 19 (16 filed) | 7 | 1 | **0** | 2 | 1 | 8 | town |
| woodland | 41 (19 filed) | 9 | 5 | 1 | 1 | 23 | 2 | — |
<!-- /by-terrain -->

## A new life's first steps (the quantity gate, 27 November)

The world gate now holds the paintings a new life meets (`bun run quantity -- --only paintings`,
scripts/quantity/painted.ts; doc/architecture/quantity.md, measure 11): a life begun in each of a hundred named worlds,
played five steps by the page's leads, every frame judged as the page draws it. At most 2% may be unresolved: no
painting, one against the sky, or a talk with no portrait. Before 27 November one frame in five was (20.5%), nearly
all the road, the market-place and the inn's garden in rain, fog or storm, and the way in over a fen causeway by
day. A rule answered them, not a commission: where none of a place's own paintings fits the sky it is under, it is
painted by what it lies in (the town's back lane in rain, the valley's great oak in fog), the sky's own weather
first. These are what that stands in for, and would be truer painted for themselves:

- `scene-market-rain` (and fog): the market-place under dripping awnings. The market is the first town's heart in
  most worlds, and its three paintings are all of a sunlit day.
- `scene-road-rain` (and fog): the road down into a town in rain, the town's roofs ahead. The road's one painting is
  a clear day's; the held-back road paintings (below) have none in rain either.
- `scene-approach-fen` by day: a causeway over a fen to a town, for a marsh country's way in. A marsh has only the
  bog at dusk in fog, so a fen life opened on the valley.
- `scene-garden-rain`: a walled garden in rain, for the inn's back garden and every garden kind.
- A thatched village in rain, and in fog, outside spring: the village from above in rain is in blossom, so it
  stands only in spring.

**Portraits.** Two kinds of talk still open in type in the first steps: someone of a people the paintings are not
held to look like (a half-elf woodwright, a sylph innkeeper: OR-1763), which is a ruling to make, not a painting to
ask for.

## Scenes still needed

Measured, not kept by hand: each kind of place blank under some sky in Iscoed and a1, by the scene census, and for
each, whether a painting already named for it would serve and only wants binding, or is held back, or is still to
paint. The list of 23 November had gone stale as the owner painted (the barrow in rain, the great house, the byre and
granary by lantern, the manor library at evening and night, the fairground in rain, the charcoal clamps in rain, a
broken keep); those are bound now, and what is asked below is what no painting yet gives. Written again by:

    bun scripts/scene-census.ts iscoed iscoed.json && bun scripts/scene-census.ts a1 a1.json
    bun scripts/scene-asks.ts iscoed.json a1.json --write

A painting named for a kind but looked at and refused for it is kept in `scripts/scene-asks.ts` (refused), with why.

<!-- scene-asks -->
Measured 2026-11-24 over iscoed and a1.

| Kind | Places blank | Under which sky (places) | Painted already? | For example |
|---|---|---|---|---|
| fields | 73 | rain by day (73), fair evening (73), fair night (73), rain by night (73) | paint | the home fields of Porthalen; the home fields; the home fields of Gatesend |
| road | 43 | rain by day (43), fair evening (43), fair night (43), rain by night (43) | `scene-road-night` (held back for OR-182) | the road between Porthalen and Reedbridge; the road between Wrackham and Gatesend; the road through Ashwood |
| stones | 18 | rain by day (18), fair evening (18), fair night (18), rain by night (18) | paint | the old stones at Wrackham; the crossing stones; the march-stone of Rìerdan |
| home | 11 | fair day (2), rain by day (11) | paint | the upper House; The Numbered House; the chapter-house |
| mine | 10 | fair evening (10), fair night (10), rain by night (10) | paint | the robbers' hole; the old quarry pit; the old workings under Porthalen |
| dam | 9 | rain by day (9), rain by night (9) | paint | the mere; a dam of dressed stone across a valley; the top of the dam |
| well | 4 | fair evening (4), fair night (4) | paint | the makers' well; the gate-well, under the gatehouse; the rim of the Great Void |
| charcoal | 4 | fair evening (4), fair night (4) | paint | the charcoal clamps; the charcoal-burners' clearing; the charcoal-burners' clearing in Oakhurst |
| abbey | 4 | fair evening (4), fair night (4), rain by night (4) | paint | the cloister; a roofless abbey |
| hill-door | 4 | rain by day (4), rain by night (4) | paint | a square doorway in a hillside in Greenwood; a square doorway in a hillside in Ashwood; a square doorway in a hillside in Bearwood |
| tower | 4 | fair evening (4), fair night (4) | paint | a lone tower; The tower |
| manor | 4 | rain by day (4), fair evening (4), fair night (4), rain by night (4) | paint | the loggia; the walled garden |
| stair | 3 | rain by night (3) | paint | the water-stair; the stair down the mere's side |
| garden | 3 | rain by day (3), fair evening (3), fair night (3), rain by night (3) | paint | the Hanging Garden; the inn's back garden |
| coast | 3 | rain by day (3), rain by night (3) | paint | the nesting cliffs; the foot of the nesting cliffs; the top of the cliffs |
| boat-sheds | 2 | rain by day (2) | paint | the boat-sheds |
| sluice | 2 | fair day (2) | paint | the broken sluice |
| roof | 2 | rain by day (2), fair evening (2), fair night (2), rain by night (2) | paint | the fallen walls |
| barrow | 2 | fair day (2), rain by day (2), rain by night (2) | paint | the forecourt |
| ruin | 2 | fair evening (2), fair night (2) | paint | the carriage-arch |
| larder | 2 | rain by night (2) | paint | Marjory Ashby's general store; Marjory Twelvetrees's general store |
| lift | 2 | rain by day (2) | paint | the stalled lift |
| overlook | 2 | fair day (2), rain by day (2), fair evening (2), fair night (2) | paint | the salvagers' lookout |
| mill | 2 | fair evening (2), fair night (2), rain by night (2) | paint | the mill |
| toll-house | 1 | rain by day (1), fair evening (1), fair night (1), rain by night (1) | paint | a toll-house by the water |
| shop | 1 | rain by night (1) | paint | the smugglers' store, behind the chain |
| woodwork | 1 | rain by day (1), fair evening (1), fair night (1), rain by night (1) | paint | the wright's yard |
| huts | 1 | fair day (1), rain by day (1), rain by night (1) | paint | the eel-catcher's hut |
| oast | 1 | rain by day (1), fair evening (1), fair night (1), rain by night (1) | paint | the old lime-kiln on the common |
| fullery | 1 | fair evening (1), fair night (1), rain by night (1) | paint | the old fulling-mill |
| gloriet | 1 | rain by day (1), fair evening (1), fair night (1), rain by night (1) | paint | the Preserve-house |
| grave | 1 | rain by day (1) | paint | the bone-beds |
| sea | 1 | fair day (1) | paint | the Sundial's deck |
| cabin | 1 | fair day (1), rain by day (1), rain by night (1) | paint | the great cabin |
| mews | 1 | rain by day (1), fair evening (1), fair night (1), rain by night (1) | paint | the kennels and mews |
<!-- /scene-asks -->

The roads' blanks (10 + 33 places in rain, at evening and at night) are the held-back road and lane paintings' (below):
nothing new is wanted for them.

**Rain by night.** The golden walk's last third is a rainy night. Its places show their rain-by-day paintings, dimmed by
the page (no fault: the weather is the world's). Each would be truer painted for itself, first the landing:
`scene-harbor-rain-night` (four turns of the walk: the quay in rain at night, lamps smeared on the wet stones), then the
gate-yard, the castle bailey (for the gate-well), the sea-bank, the salt-pans and the bridge, each in rain by night.

**The way in.** A new life's opening plate is no longer shown against the sky. A frost country has only a dusk painting
outside winter, so it opens on none by day; it opens on none in rain or fog. A forest country in rain opens only on
the grey chapel. Wanted: `scene-approach-frost` (the road between snow-fences to turf roofs, by day, no snow falling)
and a forest road in rain.

**A bridge in rain.** The bridge-foot at Reedbridge is painted by its kind's commissioned paintings (`scene-bridge`,
`scene-valley-bridge`, `scene-valley-road`), all of a dry day; the old masters that stood for it in rain are no longer
backgrounds (OR-675). Wanted: `scene-bridge-rain` (a river town's bridge in rain by day).

**Authored places.** An author's own painting is now kept only where it fits the sky. The Howe's and the Arcology's are
painted for one light, so they go blank, or take their kind's, in the others: the camp in the lee and the Lantern
Company's camp by day (their painting is a campfire by night); the survey cairn, the heather rise and the Arcology's
sunlit terraces, bridges and garden in rain or after dark; the salvagers' lookout and the old sheepfold by day (dusk
paintings). Those adventures' authors would paint them again in another light.

## Portraits still needed

Carried from the art wishlist of 21 November and not re-measured since. No named portrait has been added. A person
with no fitting likeness is drawn as an emblem. Counts are first-hour sightings out of 810 steps of ten walks.

| Paint as | Who | Sightings | Brief |
|---|---|---|---|
| `portrait-owain-cousin` | Owain, Bran's drover's boy, and the kin life's cousin (likely one portrait) | 256 | A lanky boy of fourteen in a wet drover's smock, a hazel stick and a dog's lead, more worried than he lets on. |
| `portrait-gwil-pryce` | Gwil Pryce, boat-wright on the landing | 254 | A broad man in a leather apron, sleeves rolled, adze in hand, shavings in his beard. |
| `portrait-guldrice-agent` | the Guldríce agent, keeper of the company's books | 254 | A careful clerk in good dark wool and a fur collar, a ledger under his arm, an ink-stained finger. |
| `portrait-osmund-pyle` | Osmund Pyle, the old man with a stick | 96 | An old man with a bad hip and a stubborn chin, a blackthorn stick, a good coat gone thin. |
| `portrait-isaure-venn` | Isaure Venn, scholar of the old script | 96 | A tall woman of fifty in a travelling cloak, spectacles on a cord, rubbings rolled under her arm. |
| `portrait-dannel-hobb` | Dannel Hobb, the boy kept indoors | 96 | A boy of ten, pale, a white streak through dark hair, looking at the door before he speaks. |
| `portrait-carlin-eel-catcher` | Carlin, eel-catcher | 96 | A wiry fen woman in an oilskin, an eel-glaive over her shoulder, wet to the knee, grinning. |
| `portrait-aster-factor` | Aster, factor of the Founders' Exchange | 96 | A smooth man in an Exchange coat with a brass badge, looking at your bronze, not at you. |
| `portrait-factors-hands` | the factor's hands (a group) | 96 | Two hard men in leather jerkins, cudgels at their belts, one with a broken nose. |
| `portrait-leofric-hiring-man` | Leofric, the Spade-Company's hiring-man | 40 | A cheerful red-faced man on a cart-tail, a sheaf of papers and a spade badge. |
| `portrait-wimble` | Wimble, the kitchen boy | 24 | A thin boy in a scullion's apron, looking past whoever is speaking, humming four notes. |
| `portrait-drovers-lad` | the drover's lad from over the fells | 18 | A hill boy with a sheepdog pressed to his leg and no drove behind him. |
| also | Silas Mardle (the customs clerk), Bran ap Ifor (the lead-drover behind the grille), Gek the herb-wife, Wat the collier | 10–12 | As in the wishlist record. |

**Creation's portrait grid** (`data/paintings/pcs.json`) has **64 empty cells**. A member in one is drawn by the
first letter of their name.

| Ancestry | Empty |
|---|---|
| half-elf | every calling, man and woman (14) |
| fae | mage, thief, cleric, bard (8) |
| glimmerkin | mage, thief, ranger (6) |
| halfling, gnome, half-orc, lizardfolk | three callings each (6 each) |
| goblin, sylph, undine | two callings each (4 each) |

**Groups of a painted kind** (the cellar's rats, the crypt's bats, the keeper of the mere) reach no plate. That is a
binding, below.

## Beyond the census: adventures, creatures and plates

Asks the census cannot see, carried from the oldest list (doc/history/paintings/commission-list.md, 12 November) and not
re-measured since:

- **Authored adventures' own places**, now painted by a kind or an old master:
  - the circus big top from inside;
  - Sarn, the circus's old country (the delta's edge, the egg-beds);
  - the Walk's camp and the Station;
  - the Numbered House's rooms (Tenants' Row, the third ring, the Keepers' Bay, the Quiet Floor; also "a great house
    by day" above);
  - the Silent Lord's crypt, armoury and oubliette;
  - the House of Doors' portals painted wide, and the planes from within.
- **Creatures and devices drawn as an emblem**:
  - the knitted hound, the barrow-dead, bats, rats;
  - the king under the mound, the risen dead;
  - spiders in old workings, a great centipede, beetles in the spoil, eels, frogs as big as dogs;
  - zombies, bone hounds, a cave hound, an owlbear;
  - one device: a blasting charge.
  - Check first whether a plate exists that a group or a variant does not reach (the binding above).
- **Item plates**: 65 wonders (amulets, rings, cloaks, crowns, named blades and mails); 54 plant yields (amaranth to
  thyme); the iron torc.

## Held back

The road and country-lane paintings of 23 November (`scene-road`, `scene-road-night`, `scene-country-lane` in five
lights and two seasons) are imported but not yet placed on the road or path kinds (and the sky census, 23 November
evening, counts the roads blank in rain, at evening and at night for want of them). A phone's held journey drew its card
late in three full runs carrying them (OR-182); they are placed once that is understood. The country lanes still stand
in the hills' views.

## Not paintings: bindings

Blank or wrong because of how a place or person is bound, not for want of a painting:

- **"The drowned street"** reads as a lane, so Deepwater's drowned village never reaches it.
- **Holgar's salt-house** is an interior but is shown the salt-pans outside it.
- **A group of a painted kind** reaches no plate.
- **City scenes for small towns:** the corpus has a city market, a city harbour, a city street and a palazzo courtyard
  (`scene-city-*`). They are placed nowhere, because no kind tells a city from a town; a lane or market in a small
  town must not draw them (test/scenery-kinds).
- **Rooms and weather** (the owner's ruling, 25 November; AGENTS.md): a room's painting follows the weather where its
  outside is seen, and holds in any weather where it is not. Ask for a weather variant only where the outside shows;
  without one, the weather-free painting stands. Prefer rooms whose outside is not seen.

## How to paint and bind

- **Paint** wide, with no figure in the foreground who could be taken for someone met, seen as the place is (the
  doctrine).
- **Name** it as given, and drop it in `assets/bg/`.
- **Light:** say one light per painting. A painting tagged "daylight, firelit" is a day painting: the evening and
  night rule refuses it for its daylight. Most of the corpus's dark interiors are day-only for this honest reason; a
  room wanted after dark must show no window light.
- **Import:** see doc/architecture/mission-22/handoff-beta.md (Paintings). Then re-run the census.

## What was delivered, in brief

On 21–22 November the owner painted about 200 scenes, and the tagging pass of 23 November placed nine more that the
corpus already held. Between them they filled:

- the landing in rain and by moon, the harbour at dawn;
- the library in rain, the muniment room (a windowless store);
- the sea-bank, Deepwater by moon, the gate-yard and gate-well;
- the boat-sheds, byre, drill-yard, staithe and reed landing;
- waterside and back lanes in rain and fog, a keep's rooms and passages (the guard room at dusk, the secret passage);
- baileys and ruined keeps by day, in fog and rain;
- a plain room and a hearth by lamp;
- salt-pans, hamlets and villages;
- lakes, woods and a mountain valley in each season;
- the dam, the fairground and its menagerie;
- the great oak, sea-cliffs, the sluice;
- a counting-room, kitchen and store by evening, a water-mill;
- a frost country's winter village, a treasury and a hoard.

The record of each ask and what answered it is in doc/history/paintings/.
