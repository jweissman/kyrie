# The House That Grows: prose quality pass

Editor's pass on `data/adventures/house-that-grows/*.kyr` (the shortest of the four: about 52 KB dumped). Text only. No ids, conditions or mechanics touched; no test asserts a changed line.

## What I found

The house is the best idea in the set: a room of glass that grows whenever it is not watched, a town that stays awake as a way of life, a child who has been fourteen for two and a half thousand years and
knocks eleven times and waits for a twelfth. Its descriptions are physical and odd (the blanket in seven folds, then eight; the cup with a twin a hundred times its size; coats on hooks at the height of a barn roof,
the last for a girl of fifteen) and its set pieces (the footman of folded glass, the stare at the gate, "Because it isn't polite to do all the knocking") are the best prose in the corpus.

Where it slips is the voice of *explanation*. Three kinds:

1. **The four `Chapter` texts** told the reader what the house means ("the whole house is built to keep you from using it", "dreamed ... by someone who is not tired").
2. **Aphorisms in the mouths of people who are not wise**: Sabe on wanting in and wanting out; the lamp-keeper's "Seventy years of not seeing is a long time to mind a lamp"; the monk at the gate explaining that "one of us has to blink".
3. **Closing codas** on the endings ("It does not matter now"; "Whether by someone who has been told is only a matter of who comes by").

And two scenes were bare lists (Kezu's sleeping-room, Haddo's well).

## Before / after

1. **Chapter III, the Keel.** *Before:* "Up here the house is not a room but a city's underside, and the Long Hall has been dreamed for two and a half thousand years by someone who is not tired." *After:* "Up here the house hangs from the underside of the city, and the Long Hall is a little longer every time you look down it."
2. **Chapter I, Cobble Ring.** *Before:* "...It is how the town has lived on this plain since before the Veil came down, and it has never once been asked what the watching is for." *After:* "...The lamp-oil is the biggest line on the reeve's slates." A town's cost instead of its meaning.
3. **Sabe on the knocking (`slope.kyr`).** *Before:* "There is a difference between wanting in and wanting out, and from the inside you can't tell, and from the outside you can't either. Don't you open that gate for the first one you think it is." *After:* "Might be she is knocking to get out; from this side it sounds the same. Don't open that gate on a guess." Sabe now speaks like a woman who has minded a stair: short, practical.
4. **Sabe on the lamp.** *Before:* "I have not seen. Seventy years of not seeing is a long time to mind a lamp." *After:* "I have not seen. The oil is a mark a month." (She and the reeve now share a currency of oil; the reeve's slates carry the same figure in Chapter I.)
5. **The monk stares at the gate.** *Before:* "'We have been staring at each other through a door for as long as you have been here. One of us has to blink, and it will not be her.'" *After:* "'She is not looking away either,' ... 'My eyes are watering. Don't talk to me for a minute.'"
6. **The reeve on a sold house.** *Before:* "...as if it might be watching her. ... She is quiet a moment. 'They don't know how to sit up. They'll learn, or the house will teach them.'" *After:* "...She taps the draft. 'They don't know how to sit up. I told Dace. He wrote it down.'" The reeve counts; she does not foretell.
7. **The Chair ending.** *Before:* "Cobble Ring does not speak of it, as a town does not speak of the stool it keeps empty for someone." *After:* "The widows on the rim have knitted Neme a cap, too big, which she wears over her eyes."
8. **Kezu's sleeping-room (`bed_scene`).** *Before:* "A narrow sleeping-room with a reed bed, a chest, and one window onto the pond." *After:* "...a reed bed with the blanket kicked to the foot, a chest, one window onto the pond, and on the sill a tin cup of tea gone cold with a skin on it." Haddo's well got the same treatment ("the turf round it trodden bare by forty households waiting their turn").

Also: the bard in the Long Hall no longer completes the glosses ("...I think that is what has been said to everyone who ever stood here") but "opens a mouth to supply the twelfth beat, and shuts it again"; the cleric, thief, ranger lines were left alone.
The monk at the cup shelf, "Don't tell me it's a trick of the light", became "Count them again. I'll wait. I would like to be wrong."

## Patterns fixed (counts across `data/adventures/house-that-grows`, before to after)

| Pattern | Before | After |
|---|---|---|
| "a long time / while / moment" | 4 | 1 |
| "as if" | 9 | 6 |
| thematic-summary sentences in Chapters and endings | 6 | 0 |
| closing aphorism in a non-sage's mouth | 4 | 0 |
| bare list descriptions given one concrete, unexpected object | - | 3 |

## Speaking habits (distinct, kept)

Hanu talks to the shutter and never faces anyone; Tobu answers with counts; Tessa the reeve talks in slates and arcs, no metaphors; Wenu quotes prices and gossips with a ledger; Haddo uses no figures of speech and spits; Dace does arithmetic and
corrects himself in his mother's voice; Sabe speaks in kitchen things (a pot turned to the fire); Neme is literal and polite and will not say thank you.

## Still weak

- **Duplicated `_again` text** (about 25): the second ask returns the identical speech.
- **Wise-old-woman concentration**: Kezu, Sabe, the reeve and Pammu all say a clever thing near the end of a speech. I trimmed four; at least four more could lose their last sentence.
- **The Keel is a corridor of doors.** The coat hall, the long hall and the bunk room each have a good first line and then repeat the same grey light, glass floor, barn-height hooks. Each needs one smell or sound of its own.
- **The ending texts** are still the three longest paragraphs in the file and each ends on a general statement about the town.

## What a structural fix would need

- A visible cost for not watching: the barley only grows while the player's party is elsewhere, and nothing in the prose tells the player a minute by minute story (the "eight folds, there were seven" blanket is the only one). A second growth tell per room (a pane that was not there, a cup that has moved) needs a rule per room, not prose.
- A fourth Keel place that is not a corridor of doors: a room with an occupant who is not Neme and not a lamp.
