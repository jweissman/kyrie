# The Patient Star (Hold One Season): revision ledger

**Count.** The held, by seasons: the Holdfolk lay their dying in the light and say eleven words.
**Keeper.** The Holdfolk of Ennick (Bren the holder, Ilis the old holder), and the cairn at the cord.
**First page.** The twelfth word, which the Seridane clerk said over every jar: an order, not a prayer.
**Price of reading.** Said over a held man it works, and gives him a day of a world forty years on.

## Acts and scenes

| Act | Scenes (faces) |
|---|---|
| I, Quell | the Shift Market (Rusk), the Mutual's hall (Dagny Ferrow), the lazar house (Saro, Sister Wenda) |
| II, Tamaun | the Granary Ring, the ninth vault (Garret), the **twelfth vault (the kept clerk)** |
| III, Ennick | the Lower Inn (Kerra Lowe), the holders (Bren, Ilis, Mirel), the cord and cairn, **Doran's brick** |
| IV, the Undersun and the Corbel | the Hour (Amaru, Kesset), the Tip, the Corbel (the Interlocutor) |
| V, the Keeping and the Masonry | the Tideline (the Remembrancer, **the post**), the Outer Wall, the Heart |

## What changed

- **The misread granary formula, finished.** The line has eleven words (`Seri amar ka, dane tamaun eth. Seri amar ka, ithel sonne.`); the Plate Hall children count twelve and shout the twelfth. A kept clerk at a vault with no number says a twelfth, `Venn`, as an order: hold this one season, then give it out. The Holdfolk stopped one word short, because the prior read the last word as the Office's.
- **The thief's door.** The preset Tamsin sees that eleven vaults have polished cleats and a twelfth has a cleat and no door: the lime-washed door with the second bolt in the lintel. Only a thief finds it; it is optional, and everyone else loses nothing on the critical path.
- **A choice with a price.** At Doran's brick, say the twelfth word or keep it. Said: Doran wakes, asks "Is the fire kept?" and walks home; Mirel (if she carries for you) leaves ("I carry for the held, not against them"); Ilis moves to the holder's house; Bren forbids the word to anyone else ("Not yet"); Doran dies at the next dusk, in his chair, between his wife and son. Kept: Doran stays held; Ilis can be told on her terms and asks that Bren be told when she is laid.
- **Characterization.** Bren (wants his father; fears the hold was a mistake; lies that a held man cannot give his word; pressed, will not say it for anyone else). Ilis (wants to be useful; fears her husband's question; lies that she followed the rite; "Tonight I am going to sit by him and not be sensible"). Mirel (the carrier's line).
- **Danger with exits (wolves at the cord).** Before: be home by dark or fight. Now also: light the lantern in the cairn (a light kept for no one now living) which also turns back wolves already assailing; or go with Mirel, who sings the names. Eels, chimeflies, the Delver and archivores were not changed.
- **Voices (thief x1 acted, cleric, ranger, warrior, mage).** Cleat/door at the Ring; no dismissal at Doran's brick; wolf-sign at the cord; a siege by calendar at the Pit floor; a masonry that cannot be dispelled at the Lintel.
- **Contrast.** Kerra Lowe's book for the Office: every guest since 340 is a turnip merchant (a Veyra schoolmaster, a Lesser Instruments man from Corran, an Arbitral sister); and the cat of 176 that split the terraces.
- **Depth.** The walnut heap at the shrine (the village's only census); the cat; the book; the cleats; the twelve-word board.
- **Keeping rhymes with the Slack.** A post of black wood at the head of the shore with eleven notches and a smooth place: "The twelfth is not lost, it is not yet. It is the stroke you are standing in." Not unified with the Slack, which is never named.
- **Links.** Out: Veyra (schoolmaster, Grand Tour), Corran (Lesser Instruments collects), the Slack by rhyme. In: a Veyra or Corran visitor can come for Kerra's book; a keeper of any count wants the post.
- **Foreshadow and payoff.** The Plate Hall's twelve-word song and the eleven-word prayer pay off at the clerk; the post on the shore pays off only for a company that walked into the Keeping.

## Tests

`test/patient-star.test.ts` (unchanged, passes) and `test/patient-kept.test.ts` (5 pass): thief and clerk; say the word (Doran home, speeches, dead at dusk); keep the word (Ilis told, say closed); the cairn lamp turns the wolves; Kerra's book.

## Honest shortfalls

- Mirel's departure and Bren's other-carriers line are written but only the `say` path with Mirel absent is played.
- The Tideline post is not played (needs Ithmar and the Way); it lints.
- Cleric, ranger, warrior and mage voices are not played; the preset party is one thief.
- The twelfth vault is invisible to non-thieves; no second way in.
- Acts are named, not re-cut; Dagny's debt arc is not touched.
