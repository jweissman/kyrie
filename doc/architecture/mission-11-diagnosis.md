# Mission 11, stage A: why Kyr plays the way it does

A human player found Kyr hard to enjoy, hard to follow and hard to believe. This note traces each of the failures
they met back to the structure that produces it. It was written after playing the published build (`cd92406`) in a
browser at desk, tablet and phone sizes, from the opening into the first forest of world `a1`. The pictures are in
[`doc/playtests/mission-11-before`](../playtests/mission-11-before).

The short version: each failure is the honest output of an assumption built into the generator, the language, the
runtime or the page. None of them can be polished away while those assumptions stand.

## What a player meets

1. **The opening is a form.** The first screen asks for three companions from presets ("The fellowship, Delvers,
   Pilgrims…"), with a list of skills nobody has. The game then starts on a town green. The first prose is census
   data ("Murkstede is a town of human folk, living by salt. The name is Westron for 'black stead'"), then three
   unrelated reasons three strangers came.
2. **Talking hides what is said.** Asking the innkeeper about the missing drover prints *"Eamon tells you what they
   have heard about the drover who did not come home to Murkstede"*. What he actually said is in the journal, behind
   a note: *"◆ In the journal: A drover went out on the road from Murkstede…"*.
3. **The page is a ledger.** Ten "Ask about…" lines, two of them the same rumour from two people, sit above the ways
   out. On a phone the list runs past the bottom of the screen, and the company strip covers the last choice.
4. **The forest is three words.** *The edge of Eikwudu*, *deep in Eikwudu* and *the heart of Eikwudu* are rooms in a
   line. Each has one sentence picked at random ("A squirrel scolds you from a bough overhead"). There is no road
   through it, no fork, no landmark, and the heart is a dead end. On the map all three are one dot.
5. **The map is a tiling.** The region is drawn as a grid of glyphs (a tree, a reed, a blue square per cell).
   Labels run into each other, and the water is a staircase of rectangles. On a tablet in portrait the map replaces
   the page.
6. **The weather is a sentence.** One line per kind of weather is set on every green and every road: *"A raw cold
   gets in at every gap"* is said out on an open road; *"A hard wind pulls at cloaks and doors"* is said where
   there are no doors.

## Where each comes from

### The generator stamps templates

- **Settlements.** `RegionWriter.settlement` writes every hamlet, village and town as the same four rooms (green,
  taproom, shrine, shop) and the same four people (innkeeper, priest, merchant, traveller). Each settlement has one
  sentence of description, and its taproom has *"Benches, a long table, a fire."* Size changes a merchant's purse and
  whether the priest raises the dead; nothing else. There are no households, no work, and no institutions with
  members, obligations or interests.
- **Wild country.** `RegionZones` turns each wood, fen, moor or fell into a chain of at most three rooms (edge,
  deep, heart). All three hang inside one `wilderness` place that has a single map position; the rooms' own
  positions are `(i, 0)` and mean nothing on the regional chart. Roads are routed around wild cells and never through
  them. A road and a forest therefore never share a place, and "continuing along the road" from inside a forest is
  impossible: the only way out is back the way you came.
- **Sites.** Each work plan (`data/generation/works/*.kyrt`) has one layout. Every barrow is the same four rooms,
  every cistern the same stair and hall, every watchtower the same three floors. The makers' history is revealed one
  way in every case: read an inscription in the old script, then find the next work.
- **People's troubles.** There are seven authored scenarios and three kits. They are placed by eligibility, and
  they come back from world to world with the same people in them: Garth, Odile, the drover's wife.
- **Atmosphere** is a random pick from two or three lines per terrain and role (`RegionZones.scenes`), and one fixed
  line per weather kind (`weather.json`). Neither knows whether the company is under a roof, in the dark, or has
  just heard the same line.

### The language gives places, people and things too little to be

Kyr (`src/lang/Kyr.ohm`) can say a great deal about rules, but it says these few things about the fiction:

- **A place is a room.** It has a kind (`room`, `building`, `wilderness`, `settlement`, `site`), a parent, and an
  optional grid cell. It cannot have parts, a scale, a shelter from the weather, a sightline to another place, or
  ground that can be crossed without a passage.
- **A person speaks through topics.** A `Topic` has one fixed `Says` line. The shared `ask` action teaches a fact
  and answers *"{informant} tells you what they have heard about {topic}"*; the fact's text, which is what was said,
  goes only to the company's knowledge. Nothing lets a person answer from what they know, in their own voice.
- **An observation is all or nothing.** `Observe … when …` is told whenever its condition holds. It has no aspect
  (fixture, sign, weather, ambience, event), no salience, no "once", and no notion of who perceives it.
- **A companion is a member.** Recruiting moves a person's creature into the company. Their role, their topics and
  their town stay behind; from then on they are a name with hit points.

### The runtime tells everything that is true

`LocalObservations.read` returns every observation at the place whose condition holds, in authored order.
`ScreenModel.scene` joins them into paragraphs. Nothing selects among them or remembers what has already been told.
Nothing asks whether a line suits a roof overhead, the dark, or the season. The only perception there is, aliases
("a round tower" until the name is known), covers names and nothing else. It does not change what a ranger notices
that a warrior does not.

### The page is one column that grows

The reader (`web/reader`) draws a scene as:

1. the place's prose;
2. every entry since the company arrived, each with its echo and its lines;
3. every authorized action, grouped by subject;
4. a company strip fixed over the foot of the page.

The present situation, the last exchange, what can be done and what happened earlier are one undifferentiated
stream. When something is learned, the page says that it went to the journal, so the journal is being used to repair
a scene that did not say what happened. Choices are enumerated from the planner (`PlayerView.choices`), so the menu
is as long as the list of everything the rules permit. The map (`land-map.tsx`) draws the generator's cells, one
glyph each.

### The opening assumes a company

The campaign manifest declares a party. `Creation` offers presets of three, and `RegionRecruits.arrival` supplies
each member with an acquaintance who "sent word". A company of one is possible ("Go alone"), but it is the exception,
and nothing about one person's past reaches the world beyond a sentence.

## The assumptions to replace

| Assumption | Its consequence | What replaces it (stages B–D) |
|---|---|---|
| A place is a room with a description. | Forests are three rooms, settlements four, ruins a corridor of rooms. | Places at real positions on real ground, joined by routes that run through terrain; landmarks, junctions and routes as places; sites built from varied architectures. |
| Every true observation should be told. | Repetition, contradiction, dumped census data. | A narrator that knows the physical situation (shelter, light, weather, season), what this person perceives and knows, and what has already been told; it chooses. |
| Conversation is a topic dispenser. | Answers hidden, the same rumour from two mouths. | Speech shown where it is spoken, in the speaker's voice. A person answers from what they know; topics are things to say, not a menu of facts. |
| The interface lists every authorized action. | A ledger of choices that pushes the situation off the page. | Intentions grouped by kind of attention (speak, look, go, the company), short at the top level, opened in place. |
| One column holds everything. | The current situation lost under history. | Four separate functions: the present situation, the immediate exchange, the available intentions, and memory. |
| The map shows the grid. | An illegible tiling. | Charts drawn from the land: regional geography, the routes the company knows, a local route diagram where it matters. |
| The player is a company. | No protagonist; three arrivals with three unrelated reasons. | One character with a past that the world remembers; companions met as people, who stay people. |
