# The Lull: playtesting, and what it does and does not show

## Four kinds of evidence, kept apart

| | What it means here |
|---|---|
| **Implemented** | Written in Kyr in `data/adventures/the-lull` and reachable by offered choices (lint finds no unreachable room or impossible action) |
| **Tested mechanically** | A test drives it by the labels a player sees and checks the world's facts after |
| **Encountered in play** | I read the page as it was told, step by step, in a transcript or the browser, and changed what read wrong |
| **Evaluated as satisfying** | My judgement as a reader, given below with its doubts. Nobody else has played it. |

## Tests (`bun test test/the-lull*.ts`)

- `test/the-lull.test.ts`: 25 journeys. The sennight (the road shut, then open at six; the stone's wait; a night
  inside is 1,008 watches; awake past midnight and shut in); the law found; every ending (*The Seventh Day*,
  *Monday*, *The Long Sunday* twice, one paid for, *The Bridge in the Leat*, *What Was Meant*); the Sixnight twice
  (the loom; open hands, the beam and the Gap); the ribbons; the Brock by honey and by the bounty; the wedding;
  Dorcas and Piran; Simeon turned back and brought home; Linnet's promise and Linnet joining; Hester's Monday from the
  company's hand with Simeon; Corin told and reconciled; and six builds (a cleric's rites and insight, a thief's
  sheep-walk and the pay-chest, a bard's hymn and lore, a ranger's woodcraft, a monk's climb and a monk meeting the
  Overseer unready; a company of three that fights).
- `test/the-lull-wander.test.ts`: three companies (a warrior, a thief, three fourth-level adventurers) taking 250
  random offered choices from two seeds each, then sleeping out to the Working Day's end; after every step, the page
  has no ids or blanks, Hester died by one hand, the Working Day ended one way, the law went only with the week, Linnet
  was promised one thing, and at most one ending was reached; a company that came into the valley and lived reaches
  exactly one ending. Five of the six random walks ended in *The Bridge in the Leat*, which is what a company that
  does not engage with the wardens should get.
- `test/the-lull-placed.test.ts`: an ordinary wanderer in a generated world (seed `l127`, a forest first country)
  walks east, is told of the Lull by an innkeeper, goes over the north march, finds the board by the pump, waits at the
  stone, and goes down; and a second wanderer plays the Seventh Day there, sees the chapter close and the game go on,
  the country behind the Lull hear it as old news, and walks back in a day later to find AND THEN MONDAY on the stone
  and the bridge standing. The plan places the Lull for eight seeds without moving any other country.
- `test/the-lull-browser.test.ts` (opt in with `KYRIE_BROWSER=1`): the march road, Sixways, the stone, the shoulder,
  the green, in Chromium, with no page errors. Screenshots: `playtest/browser-*.png`.

## Transcripts (`playtest/*.md`)

Every fixture played and written out as the page told it: `seventh`, `monday`, `sunday`, `wages`, `broken`, `meant`,
`sixnight`, `loom`, `phial`, `betrayal`, `law`, `wedding`, `dorcas`, `ribbons`, `brock`, `simeon`, `sheep`, `linnet`,
`overseer`, `rites`, `insight`, `lore`, `woodcraft`, `hoist`, `chest`. They are the evidence for "encountered in
play": I read each and revised what I found (see [11-second-pass.md](11-second-pass.md)).

## An ordinary protagonist, without the source

The least privileged play I could make, in a generated world (`bin/kyrie play --world l127 --origin wanderer --as
human/warrior/Morwen`): a wanderer comes into Pardataure, goes into the Golden Chalice, and is offered, among the
innkeeper's topics, *"Ask Aelar about what lies beyond Tinfells"*. Aelar says: *"North of it there is the Lull, forest
country, they say, where there is a valley you can only walk into one day in seven, where nothing done without meaning
it lasts the day. Folk in Tinfells would know more of it than I do."* From there the way is by the map, east to
Tinfells and north over its march (the placed test walks exactly this). On arriving: the march road, the chapter
"Sixways", the board by the pump with LULL IN 2. Nothing on the page assumes the player knows what the Lull is. The
first thing anyone tells you (Dorcas) is the whole rule set in four sentences, in her voice, including the warning
about midnight. That warning is the one thing I would most want a cold player to hear, and it is in the first
conversation they are likely to have.

What I cannot claim: that a player who has never read this document will find Aldith's experiment, the hymn, or the
Gap without a nudge. Each is told by someone (Aldith offers; the Old Shift say what was sung; Hob tells of the Gap),
but they are three of nearly a hundred topics.

## What reading the transcripts changed

The second pass ([11-second-pass.md](11-second-pass.md)) lists the revisions. The ones the transcripts forced:
the Watching's events had all begun "At sunset" and were told as one paragraph after an unrelated "Sit down" (now
an opening line, then each making in turn, and an explicit "watch until the sun goes"); the sleep's result was told
after the next day's chapter heading (now in the past tense); the midnight of the Sixnight was told on waking from a
week's sleep (now only to a company awake in the dark); Tobias confessed to a stranger on the first morning (now not
on the first Lullday, and only after two conversations); a girl who "walks off along the leat" was still standing on
the bridge in the next line; roles came out as "an of the Old Shift"; a whole valley's Long Table was hidden from the
browser's glance behind a sentence about houses.
