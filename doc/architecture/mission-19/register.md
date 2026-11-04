# Mission 19 register

Findings with stable ids, as [brief.md](brief.md) §XIII asks: evidence, source, priority, resolution, verification.
Mission 18's 138 carried rows are in [../mission-18/wishlist.md](../mission-18/wishlist.md) under their own ids; a
row of this register that answers one names it. Classes, as the brief distinguishes them:

- **A** blocking correctness or action-integrity defect
- **U** systemic UX or gameplay deficiency
- **C** content or authoring integration gap
- **R** architectural weakness needing bounded remediation
- **D** larger ambition deliberately deferred beyond Mission 19

Status is the bold word at the head of its cell: **Fixed** (with the commit and how it was verified), **Partial**,
**Open**, **Deferred** (D rows), **Superseded**.

| ID | Class | Finding | Evidence and source | Pri | Status |
|---|---|---|---|---|---|
| M19-01 | A | The aim followed lived in the browser by its words; "your aim" tagged anything any aim named, so the page led toward one aim while saying it followed another | Handoff §1 and §4.1–2; builder's play 4 Nov (Millholm's camp: "Talk to Bask — your aim" while following the father); answers REV-08 in part | P0 | **Fixed** e7aeac3a: `Undertakings` (engine state by id, in the save), "another aim" for other aims; `test/undertakings.test.ts`; browser play |
| M19-02 | A | Digit keys did nothing at a place whose first lead is a way out to the country (the lead counted as none because the map stands in for it) | Builder's play 4 Nov, Millholm's camp: 1 and 2 dead | P0 | **Fixed** e7aeac3a: `MenuModel.lead` for drawing and keys; browser play |
| M19-03 | U | The world map drawn twice at a place, as the first lead and again in the row of ways | Builder's play, Millholm's camp | P2 | **Fixed** e7aeac3a |
| M19-04 | A | From the corn-store cellar the lead was "Up to the old corn-store — your aim", the way back up, because the aim named only the corn-store | Builder's play, rats job | P1 | **Fixed** 123972ae: the aim names the cellar and the store; no way back to a visited named place from another named place; browser play |
| M19-05 | A | After the rats' run was packed, "Look at the rats' run — your aim" still led: an aim's subject was read from its condition (state(run, stopped)) as well as its words | Builder's play; handoff §1 "leads go stale" | P1 | **Fixed** 123972ae: `Stakes.named` reads the words first, the condition only when they name nothing; browser play |
| M19-06 | U | "You know now: Clear the rats…" said over "A new aim: Clear the rats…", the same words twice | Builder's play, Bask's talk | P2 | **Fixed** 123972ae: `Narrator.restated` |
| M19-07 | U | A new aim while the company's own errand is followed is not followed for the player, and nothing offered to follow it | Builder's play; contradiction with M17 play 7 resolved in baseline.md | P1 | **Fixed** e7aeac3a: "Follow this" beside a new aim, in the place's notes and in conversation |
| M19-08 | U | Band members named "the first of the rats under the corn-store", long and unlike speech, on the fight page | Builder's play, the rat-runs | P2 | **Fixed** cbabb6c0: a band all of one kind by the kind ("the second great rat") |
| M19-09 | A | The reckoning said "Easily won: they are no match for you"; one great rat then bit twice in a round for 9 of a fresh warrior's 15 | Builder's play, the rat-runs; handoff §7 "fights are noisy" (PT-11, SYS-05) | P1 | **Fixed** 1eb58ad4: harm judged by the worse of the mean and the worst quarter of trial fights; specs `bout`, `danger-grind`, `play-structure` |
| M19-10 | C | A salter sells rope, torches, a lantern and lamp oil: the merchant's stock does not accord with the trade | Builder's play, Bask at Millholm (brief §IV commerce, §VIII) | P2 | **Fixed** 1eb58ad4: each trade stocks what it makes (`data/generation/tables/trade.json`); light and rope from the chandler every village and town has |
| M19-11 | U | The road page's "Ways on" column was empty while its choices existed, two of them with the same label ("To open fields east of Mistshaw by the road…") | Builder's play, the road between Mistshaw and Millholm | P1 | **Fixed** cbabb6c0: the ends, being the map's (OWN-85), are the map named for them; the labels differ (half an hour, an hour) |
| M19-12 | U | "Make camp for the night, until 5:40 p.m." offered in the morning | Builder's play, the road | P2 | **Fixed** cbabb6c0: by day it is "Make camp and sleep" |
| M19-13 | U | A key pressed while the world is being drawn after Set out is lost, with nothing said | Builder's play; handoff supplement §1 | P2 | **Open** |
| M19-14 | U | The road page drew no leads: what the aim is about there (the fresh ruts the father's cart went off by) was one of four things under "By the road", and the aim followed was not said | Builder's play, Coming Home | P1 | **Fixed** 17709636: the glance's aim and leads on the road page; an authored thing at the aim's place is what it is about, ahead of a search and of the journey it stopped; `glance-kite` spec |
| M19-15 | U | No Encyclopedia: the title's "encyclopedia" opened the developers' coverage handbooks (statuses, Orsino, "a company is three companions") | Builder's look, 4 Nov; brief §X | P1 | **Partial** fbfb8041: the Encyclopedia of Imbar (seven chapters from the played entries, lands of rumour, search, cross-references, the game's look); the handbooks under Options. Remains: history, institutions, languages, planes; authored entries by modules; illustrations |
| M19-16 | C | Raw identifiers in mechanics text ("+ level + bonusSpellDC") | Builder's look at the Encyclopedia | P2 | **Fixed** fbfb8041: references said in words |
| M19-17 | U | A calling made no difference in the first town's jobs: a key from whoever asks, then a fight, for every calling | Builder's play; brief §V | P0 | **Fixed** d7ceb585: locks picked (thief) or wrenched (warrior); the rite of rest (cleric); the chalk ring read and the raiser told (mage, bard); `undertown-callings` spec. Remains: the spiders' quarry; perception by background |
| M19-18 | A | "Open the world map — where you set out for" led after the aim had turned home (the mother at the inn), the journey set out for being the other way | Builder's play, Coming Home after the cart | P2 | **Open** |
| M19-19 | U | "Pinch out the black candle" is offered to anyone standing before the raiser, with nothing said of what he does about it | Builder's play, the ossuary | P2 | **Fixed**: withheld while he stands over it, saying so (`Change … when … "…"`) |
