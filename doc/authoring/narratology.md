# Narratology: how a place is told

This is the order and the limits that every generated description of a place follows: a town's green or
market-place, a taproom, a shop, a shrine, a street or yard, a room of a site. The tables and templates the
generators read (`data/generation/scenes/*.json`, `data/generation/town/*.kyrt`, `data/generation/tables/*.json`)
are written to it, and so is anything new added to them. [editorial.md](../architecture/editorial.md) holds the
rules for all of Kyrie's text; this page is the narrower rule for describing a place. It was written on 7 November
2026, after the owner read a generated market-place aloud and found it bland, cluttered and wry where it should have
been vivid.

## A place is told in three moves

1. **The senses first.** What the eye meets on arriving, then what is heard or smelled. One or two sentences.
   The light, the ground underfoot, the shape of the space, the noise in it, the smell of its work.
2. **The life of the place.** What people (or animals, or the weather) are doing there now. One sentence, seen and
   heard, not judged.
3. **At most one telling detail.** One thing that makes this place this place and no other: a mark, a sound, a
   colour. Often there is none, and that is fine.

Two to four sentences in all. Every other thing a place has is told elsewhere: by its things, its people, its ways
out, the sky, or the company's notes.

| Before | After (the tables' part: the sky, the season and a trouble's sign are told by their own lines) |
|---|---|
| Stalls stand in rows on the market-place of Reedford, under awnings that were every colour once and have faded to the same one. Lanes run off it between tall houses. It grew up where the Fishbourne runs into the Saltwater. A notice is nailed to the post by the well, in more than one hand. A padlock the size of a fist hangs on the corn-store door. Reedford holds the country's market, and has done since anyone can remember, and will tell you so, at length, at a fair price. A man is crying the price of something nobody wants, very cheerfully, as if that were the point. | Stalls stand in rows across the market-place of Reedford under awnings faded to the colour of straw, and the cobbles between them are slick with trodden cabbage leaves. The air smells of bread, wet wool and the fish-stall at the corner. Below the houses the Fishbourne runs into the Saltwater. A man cries the price of eels over the din, his voice cracking on the top note. |

## What never goes in a place's description

- **Objects that are things.** A padlock on one door, a notice on a post, a book left open: if the world has a
  `Thing` for it, the thing says it, in its own card, when it is looked at or when its way is tried. The padlock of
  the corn-store is said when the door is tried and on the padlock's card; the notice on the well-post is a thing on
  the green. A description that lists objects reads as an inventory.
- **Metacommentary and wry asides.** No "as if that were the point", "which does not mean she is not watching",
  "and the net is winning", "nobody disputes it", "with the air of a man who has been told to do something else".
  The narrator does not wink. If a detail is funny, it is funny without being pointed at.
- **History, unless it can be seen.** Why a place is there, who founded it and when belong to the company's notes
  (a founding's `why` is a fact the green's description teaches; it is not told in it). A shrine's story is likewise
  noted, not told. History is allowed only as something the senses meet: a step worn hollow, a name cut and nearly
  gone, a tide-mark on a wall.
- **Claims the narrator cannot vouch for.** "Since anyone can remember", "nobody knows whose", "everyone here".
- **What another part of the page says.** The sky and the season are told by the weather; who is here by the
  presence lines; the ways out by the ways. A scene does not repeat the river its placement names.

## Grammar checks

Read every template filled, with the longest and shortest names the generator can give it, and check:

- **Every verb has the right subject.** "Reedford holds the country's market ... and will tell you so" made a town
  speak. If a place cannot do it, its people do it, and they are named as people.
- **Every pronoun has one antecedent** in the same sentence or the one before. "It grew up beside the river" after a
  sentence about a cheese is wrong.
- **No fragments** unless the sentence is a deliberate list after a colon. "A low-beamed room, a fire, benches." is
  rewritten as a sentence.
- **Articles agree** with what fills a slot ("an ancient altar", "a humble statue"); a slot that can take either is
  written so the article is not next to it.
- **Plural agreement** with filled nouns: "the reeds are", "the reed is"; write so that either reads.
- **Capitals** at the start of a sentence that begins with a slot ({name}, {inn}).

## People and creatures: the kind before the name

- Someone is introduced by what they are and what they are doing: "a grey cat on the wall-top", "the inn's dog",
  "a woman selling cheese". A name is used only once the company could know it: someone has said it, it is written
  on something, or they have met.
- An animal is never named in narration it has not been introduced in. "Tansy, a cat, sits on a wall-top" asked the
  player how they knew; "A tabby cat sits on a wall-top" does not.
- A place told of by rumour carries its name, or a description shared by every rumour of it, so that two rumours
  of one place are plainly about one place ("the tower with the green light").

## Sentence length

Vary it. A long sentence of sight, a short one of sound. No more than two sentences in a row of the same shape
("X stands ... Y stands ..."), and never two descriptions in one country that open the same way (the generators
take the next of a list for each settlement of a size for this reason). Prefer concrete nouns and active verbs to
adjectives: "the boards are tacky with spilled ale" over "a dirty, sticky floor".

## Banned flat phrasings

These were in the tables on 7 November and are removed. Do not write them, or others of their kind.

| Phrasing | Why |
|---|---|
| "as if that were the point", "as if it owed him money", "as if it were one of the weights" | metacommentary: the narrator explaining the joke |
| "which does not mean she is not watching" | a wink |
| "and will tell you so, at length, at a fair price" | the town speaks; three asides in a row |
| "has done since anyone can remember", "nobody knows whose", "someone always has" | claims the narrator cannot vouch for |
| "nobody disputes it", "and nobody minds them", "and thinks better of it" | drollery |
| "and the net is winning", "the slate is longer than the counter" | drollery |
| "with the air of a man who ...", "with the patience of the paid", "with a great deal of advice" | the narrator judging |
| "which is the first rule they break and not the last" | an aside |
| "very cheerfully", "very proudly", "very fast" | an adverb doing the work of a detail |
| "you can tell that from a mile off", "and never pretended otherwise" | the narrator reasoning aloud |
| "everybody in it is either on duty or pretending to be" | a quip |
| "and so, very nearly, is the dog" | a quip |
| "Nobody chose {name}: the {river} chose it" | history told as a riddle |
| "{Name}, a cat, ..." | a name the company has not been told |
| "It grew up beside the {river}" | history; the river is told as seen: "The {river} runs by below the houses." |
| "A notice is nailed to the post by the well", "A padlock the size of a fist hangs on the corn-store door" | objects that are things |

## Where this is applied

- Greens, market-places, landings, yards and the other hearts of settlements: `foundings.json#foundings.*.scene`
  and `life`, `settlements.json#green` and `life`; the river or lake a place stands by:
  `RegionGeography.placement`.
- Taprooms, alehouses, guest-halls, canteens: `settlements.json#room` and `drinkers`, `foundings.json#keeping.*.scene`.
- Shops: `shops.json`, `general-stores.json`, `tables/trade.json#merchantType`.
- Shrines: `tables/faith.json` and `RegionFaith.lines` (whose shrine it is follows what it looks like; its story is
  noted).
- Lanes, fields and waterside: `commons.json`. The founding's own places (the mill, the boat-sheds, the cloister):
  `foundings.json#foundings.*.place`.
- Animals: `src/world/community/community.ts` (the inn's dog, the cats, a household's animal).
- The undertown: the notice on the well-post and the corn-store padlock are things (`src/world/region-undertown.ts`,
  `data/generation/town/undertown.kyrt`).
