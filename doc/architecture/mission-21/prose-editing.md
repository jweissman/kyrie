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

The ratchet started at 1,144 heavy sentences in the first hour (1,141 measured). It now stands at 1,031 of 7,569
(13.6 %).

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
- the posting-house's rooms, and the rooms of the four generated dungeons (mine, barrow, waterworks, singing hall),
  each told in short sentences;
- the stray "something"s in the voice tables and the fellows.

Spoken replies (named topics) were left nearly whole. They are chosen reading, and their humour is the speakers'.

## What TypeScript assembled, and what became of it

These sentences are put together in TypeScript, so editing the tables could not reach them.

- **The shrine's frame** (fixed). `RegionFaith.lines` (`src/world/region-faith.ts`) built "{seat}: the {look} {form}
  of {god}". That gave "A well-head …: the well-kept fountain of Nodens", a sentence that contradicts itself. Each
  seat in `faith.json` is now tagged with what it is called (`[water|well-head]`). The thing, the telling and its
  history take that name, and `test/small/shrine-named` holds it.
- **The wayside shrine** (fixed). "By the track stands {wayside}: a {look} {form}, small and weathered, with
  offerings …" now reads "By the track stands the wayside shrine of Nodens, a small weathered well-head. Offerings of
  salt lie before it."
- **The crowd roll** (fixed). `Narrator` (`src/presentation/narrator.ts`, `roll`) joined everyone present into "Here
  are A, the reeve …; B, …; and C …", one sentence with five semicolons on Lowmouth's green. Now each of the first
  three is a short sentence with what they are, and the rest are named in one more. `test/small/roll-plain` holds it.
  Lowmouth now reads: "Aldous Fenn, the reeve of the wood-wardens, who license the cutting in the woods round
  Lowmouth, is here. Hesper Lowe, a boat-wright's apprentice with a drawing of a bell, is here. A drover's boy of
  fourteen, seen on the hill the morning after the herd crossed it, is here. So are Absalom Gosse, Hepzibah Dimmock
  and Jem Pudding." Three first-town roles were shortened to suit.
- **Prose held in TypeScript** (moved). The inn's dogs and the town's cats were string arrays in
  `src/world/community/community.ts`. They are now `data/generation/scenes/animals-about.json`.
- **The gardens** (left; CO-18, the lead). `RegionGrowth.lines` (`src/world/region-growth.ts`) rewrites a plant's
  " here" as " in the gardens about the green". Its choice of garden plants looks only at habitat and rock, so bamboo,
  cinnamon and amaranth grow in a northern fishing town. That is a coherence fault of climate, not of prose.
- **The notice by the well** (reworded, still in TS). The line is in `src/world/region-undertown.ts`.
- **The shrine's title** (left). The lead sentence is "{seat}: the {called} of {god}, {title}." The title ("Lord of
  Nature", "Goddess of Light") is Orsino's, built from the god's domain. That is generic pastiche, and a god's epithet
  belongs to the canon's deity entry (`Canon.deities`).

## The pins (attention economy)

Two cheap pins would have caught what this pass fixed. Both read data and are held at honest baselines.

- **`test/small/clause-load`** (existing). It counts the heavy sentences in the first hour's tables. It was held at
  1,144 and is now 1,031 of 7,569 (13.6 %).
- **`test/small/empty-words`** (new; `bun scripts/empty-words.ts [--show=…]` is its worklist). It runs three
  ratchets over the same tables, with speech passed over:
  - **indeterminate**: narration that names nothing ("whatever", "something", "someone", "nobody in particular").
    This is the owner's "garlands of whatever is in flower". The baseline is 304.
  - **similes**: the "as if" / "as though" tic, mostly whimsy tagged onto a plain act ("as though it owed them
    money"). The baseline is 89, now 85.
  - **stock**: a sentence of eight words or more said word for word in more than one table. One camp was told alike
    in every kind of dungeon. The baseline was 10; it is 9 now that each dungeon's camp has its own detail.

  A deliberate exception is declared in the data, not whitelisted in the test. In JSON it is an object with a
  `"_literary"` reason; the first is snares.json's enchanted object, told as what it seems until it is understood.
  In Kyr it is a line under a `// literary:` comment.

  "In the grey of the house" is mannered rather than indeterminate, so no word list catches it. That stays an
  editor's judgment. The pins hold the class that can be measured.
- **In play**, the playability line's experience matrix (`scripts/experience-matrix.ts`; its baseline is in
  `terminal/experience.md`) already counts heavy unasked sentences and echoes within five turns. Its c3 baseline was
  19 heavy in 30 turns. These data pins are the authoring side of the same family, so there is no second play
  counter.

## What still reads badly in data, and is left

- **The town templates' authored storylines** (`neighbours`, `ties`, `outskirts-deep`, `conflict`) are specific and
  often good. Their weight is length: long compound sentences in observations and greetings. They are quoted by
  journeys and drive aims, so they want an author's pass with the playability line rather than mechanical splitting.
  `undertown.kyrt` (DN-03, the laboratory) was left to that line.
- **The dungeons' examinations** (the closer looks and finds in `deep/*.json`) are still long. They are chosen
  reading, so they were left whole.
- **The voice tables' greetings** (`data/voice/address.json`) are manner by design ("'Back for more of my wisdom'"). A
  few are winking. Trim them when DN-05 shortens greetings.
- **The snares and wonders** (`scenes/snares.json`, `scenes/wonders.json`) keep "something" and "whatever" on purpose:
  the player has not yet identified the thing. A sign should still name what is seen ("a wire at ankle height", not
  "something catches the light").
