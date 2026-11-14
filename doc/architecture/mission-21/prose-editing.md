# Prose editing (DN-06)

The owner played the first scene of a new game and called the writing "abhorrent": too much, unspecific, unserious,
indeterminate. This is the editorial pass on the generated description sources and the standard it applies. The work
is on the `prose-edit` branch, in the batches `ci/prose-1`, `ci/prose-2`, `ci/prose-3` and onward.

## The standard

- Each sentence is a particular thing seen, heard or smelt, or a fact the player can act on, said plainly.
- Cut what is indeterminate ("whatever", "something", "somewhere", "nobody in particular"). Cut what is mannered
  ("in the grey of the house"), what is whimsical or winking ("and the geese are winning", "as though it owed them
  money"), and what decorates without informing (the river that "talks round every post").
- Name the thing: which flower, which tool, what the figures are. When the season is not known, choose what is true
  in every season (ivy, not "whatever is in flower").
- Put one image or fact in a sentence. `test/small/clause-load` holds the first hour's heavy sentences, and each
  edit lowers its `held` by what it removed.
- A place names only what it holds, or pure sense (CO-17, `test/small/foundings-own-trades`). A person's activity
  invents no stall, notice or animal the town lacks.
- Keep every fact, clue, name, label, and anything an aim or a spec reads. What belongs to examination stays on the
  thing, readable on a look.
- The voice is a sober, particular English, nearer a careful travel writer than fantasy pastiche.

The ratchet started at 1,144 heavy sentences in the first hour (1,141 measured). It now stands at 1,066 of 7,522
(14.2 %).

## Before and after

These are ordered by how often a first hour meets them. The first three are the owner's own examples, from a1's
shrine at Lowmouth.

1. **The shrine's practice** (`data/generation/tables/faith.json`, `shrinePractice.nature`)
   - Before: Garlands of whatever is in flower hang on it, and are changed when they wilt.
   - After: A wreath of ivy hangs on it, cut fresh at each new moon.
2. **The acolyte at the shrine** (`data/generation/town/neighbours.kyrt`, `{t}_anselm_seen`)
   - Before: At the back of the shrine, under the lamp, a young man in the grey of the house is copying a column of
     figures out of the offering-book with a ruler, tutting.
   - After: Under the lamp at the back, a young acolyte in a grey habit is copying the offering-book's yearly sums
     onto a slate.
3. **The shrine's name** (`src/world/region-faith.ts` and `faith.json`'s seat tags; `test/small/shrine-named`)
   - Before: A well-head with a carved lip, the water close under it: the well-kept fountain of Nodens, Lord of
     Nature.
   - After: A well-head with a carved lip, the water close under it: the well-head of Nodens, Lord of Nature.
4. **A trader at work** (`data/generation/scenes/kinds-of-life.json`)
   - Before: Nicol is writing a column of figures on a slate and rubbing out the last of them.
   - After: Nicol is reckoning the week's takings on a slate.
5. **The tinker** (`data/generation/scenes/occupations.json`)
   - Before: Lambert is crying wares to nobody in particular: pots mended, knives ground, news for nothing.
   - After: Lambert is crying wares along the street: pots mended, knives ground.
6. **The road in, in a fen country** (`data/origins/tables.json`)
   - Before: Someone is cutting reed in the ditch beside the causeway, up to the knees in it. They straighten to watch
     you go by.
   - After: A man is cutting reed in the ditch beside the causeway, knee-deep in the water. He straightens to watch you
     go by.
7. **A farmer** (`occupations.json`)
   - Before: {Name} is leaning on a gate, looking at a field as though it owed them money.
   - After: {Name} is leaning on a gate, looking at a field of beans gone black with fly.
8. **The town's gardens** (`data/catalog/plants.json`, the Orsino stands)
   - Before: Amaranth grows in the gardens about the green in the open, its colorful flower clusters standing out
     among the grass.
   - After: Amaranth grows in the gardens about the green, its dark red tassels hanging over the beds.
9. **The notice by the well** (`src/world/region-undertown.ts`)
   - Before: Paper nailed to the post by the well, written over in several hands.
   - After: A notice is nailed to the post by the well, written over in several hands.
10. **The town at dusk** (`data/generation/town/troubles.kyrt`)
    - Before: At dusk every dog in the town lifts its head and faces the hill, and the geese go silent, and nobody says
      why.
    - After: At dusk every dog in the town turns its head toward the hill, and the geese go silent.
11. **The goose-girl** (`occupations.json`)
    - Before: {Name} is driving a gaggle of geese along between the houses with a willow switch, and the geese are
      winning.
    - After: {Name} is driving a gaggle of geese between the houses with a willow switch.
12. **The makers' well** (`data/generation/scenes/foundings.json`)
    - Before: The air coming up out of it is cold and smells of iron, and of something older than iron.
    - After: The air coming up out of it is cold and smells of iron.
13. **A drover on the road** (`data/generation/scenes/traffic.json`)
    - Before: {Name} is standing in the road shouting at a hedge. One of the cattle has gone through it and is
      somewhere on the other side, being a cow.
    - After: {Name} is standing in the road shouting at a hedge. One of the cattle has gone through it into the field
      beyond.
14. **The market's gossip** (`traffic.json`, CO-17's kind of stray)
    - Before: The cheese-woman has a new cheese, and the town is divided.
    - After: The baker has put up the price of a loaf, and the town is divided.
15. **The posting-house** (`data/generation/works/roadstation.kyrt`)
    - Before: The posting-hall: a long room with a hearth at each end, benches round the walls, a low platform for the
      clerk, and on the wall facing the door a painted strip of plaster as long as the room, a road running across it
      between towns and rivers and hills, each marked with a name and a number.
    - After: The posting-hall is a long room with a hearth at each end, benches round the walls and a low platform for
      the clerk. On the wall facing the door a road is painted the length of the room, between towns, rivers and
      hills, each with a name and a number.
16. **The mine's lode** (`data/generation/deep/deep.json`)
    - Before: The vein shows in the face of the gallery as a seam of pale stuff as thick as your arm, and it is not
      pale here: in your light it moves, a slow shimmer under the surface, as if something far off were breathing on
      it.
    - After: The vein shows in the face of the gallery as a seam of pale ore as thick as your arm. In your light it
      shimmers slowly under the surface, rising and falling like breath.

Where the edits went:

- the shrine table;
- every kind-of-life and occupation activity line, with the evening and recognition lines;
- the founding scenes, lives and keeping;
- the approach lines;
- the wilds' stray "something"s;
- the Orsino garden plants;
- traffic and its gossip;
- the shop scenes;
- the settlement and weather lines;
- single standing lines in `troubles`, `ties`, `outskirts` and `outskirts-deep`;
- the posting-house's rooms and the mine's rooms, each told in short sentences;
- the stray "something"s in the voice tables and the fellows.

Spoken replies (named topics) were left nearly whole. They are chosen reading, and their humour is the speakers'.

## What the data cannot fix

These sentences are assembled in TypeScript, so editing the tables cannot reach them.

- **The wayside shrine.** `RegionFaith.lines` (`src/world/region-faith.ts`) builds "By the track stands {wayside}: a
  {look} {form}, small and weathered, with offerings of {trade} before it." It still uses Orsino's form word
  ("obelisk", "mural", "fountain") and look adjective, because no seat is described there. The town shrine's frame is
  fixed: it takes its name from the seat's tag.
- **The gardens.** `RegionGrowth.lines` (`src/world/region-growth.ts`) rewrites a plant's " here" as " in the gardens
  about the green", so a stand written for the wild reads "grows in the gardens about the green in a dense clump".
  More seriously, its choice of garden plants looks only at the habitat and the rock. Bamboo, cinnamon and amaranth
  grow in a northern fishing town. That is a coherence fault (climate), not a prose one, and needs a climate or region
  filter on `planted`.
- **The crowd roll.** `Narrator` (`src/presentation/narrator.ts:327`) joins everyone present into "Here are A, the
  reeve of …; B, a boat-wright's apprentice …; and C …", one sentence with five semicolons on Lowmouth's green. The
  roles read well alone. The chain belongs in People rows (the density audit's §look).
- **Prose held in TypeScript.** The inn's dogs and the town's cats are string arrays in
  `src/world/community/community.ts` (`dogs`, `cats`), and the notice line is in `region-undertown.ts`. Their wording
  is now plain, but they should move to `data/` with the rest.
- **The shrine's lead sentence.** It is "{seat}: the {called} of {god}, {title}." The Orsino title ("Lord of Nature",
  "Goddess of Light") is generic pastiche. A god's epithet belongs to the canon's deity entry (`Canon.deities`), not
  to a title built from its domain.

## What still reads badly in data, and is left

- **The town templates' authored storylines** (`neighbours`, `ties`, `outskirts-deep`, `conflict`) are specific and
  often good. Their weight is length: long compound sentences in observations and greetings. They are quoted by
  journeys and drive aims, so they want an author's pass with the playability line rather than mechanical splitting.
  `undertown.kyrt` (DN-03, the laboratory) was left to that line.
- **The other generated dungeons** (`deep/waterworks.json`, `barrow.json`, `singing.json`) are heavy in the same way
  the mine was: specific nouns in four-clause sentences. They want the same two-sentence split.
- **The voice tables' greetings** (`data/voice/address.json`) are manner by design ("'Back for more of my wisdom'"). A
  few are winking. Trim them when DN-05 shortens greetings.
- **The snares and wonders** (`scenes/snares.json`, `scenes/wonders.json`) keep "something" and "whatever" on purpose:
  the player has not yet identified the thing. A sign should still name what is seen ("a wire at ankle height", not
  "something catches the light").
