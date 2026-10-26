# What Tessary Owes — playability report

*How it plays, how it was tested, what the tests show and do not show. Every journey plays by the labels a player
sees, through the same choices the page offers; nothing is asserted into the world from outside except in the
generated-world journey, which places the company at the innkeeper's table as the frontier tests do.*

## The test evidence

| File | What it plays | Result |
|---|---|---|
| `test/what-tessary-owes.test.ts` | 18 journeys (below) | all pass |
| `test/what-tessary-owes-wander.test.ts` | seeded random legal play: from a fresh start, one of whatever the page offers, again and again, with long waits mixed in, checking after every step that the company is somewhere real, that nobody held walks with the company, that counts stay sane | 4 walks of 160 steps (default); 8 walks of 700 steps (`WANDER_STEPS=700 WANDER_SEEDS=x1,…,x8`) — all pass |
| `test/what-tessary-owes-browser.test.ts` | the title page, the Causeway, the notice read and put down, the Withies, Wick, in Chromium at 1440×900 and at 390×844 with touch | passes (`KYRIE_BROWSER=1`); screenshots in `playtest/screens` |
| `test/milestones.test.ts` | the two engine extensions on their own probes | passes |
| The whole fast suite | everything else in the repository, with the engine changes | see the final report |

A failing random walk reports its seed and every command it took, as `@command` steps the play tool replays.

### The journeys

| Journey | Approach | What it checks |
|---|---|---|
| Left alone | waits out the fortnight from the Landgate | Durrance answers the drum on the eighth night; the Treasurer drowns on the tenth; the riot; the vote lost; the Factor's bid lodged and the note hers; the news reaches the company in the city; no calling at the Settlement itself |
| The Kept Promise | investigation, Lowtide twice, the goose, the letter, Fisk turned, Marrable guarded, the Board session with proof, the Seal guarded by the Eel boatmen, the deeds carried down through the Hall, the Long Stair, the counterweight door and the Holding | support of five or more; the deeds delivered; every held soldier home; ≥ 3,000 experience |
| The Release | the drum on the seventh night, the letter by stealth, Fisk turned, the Board left alone, the Muster at the Oath Stone | Durrance held back, Elcock taken in her place, the vote lost, the release made |
| The Void Note | the Assessor joined, the compact read aloud by them, the Room of Defaults opened in the course of the inventory, the indictment, the Assembly | testimony, mercy asked, the Comptroller deposed and not unravelled |
| The Broken Note | as above, no indictment, the Assessor asked at the last | the note broken, the Assessor unravelled and gone from the company |
| The Warden | hired by the Factor, the King beaten at draughts (or not) and asked about the war, the letter shown to the Board, terms put | the Warden's oath, the note hers, the held home |
| Foreclosure | the letter, the Assessor told of the bid | the objection heard, the Factor in the Weighing Chamber in person, the note fallen in, the held still held |
| Caught by the flood | waits in the Forum through the turn | the warning at the turn, the company rolled out to the Pans, three coin lighter, still playing |
| A roof is a refuge | rope bought, the aqueduct climbed | the company above the flood until the night ebb; the way down closed and reopened |
| Beaten by the ebb-runners | attacks Bettany Slake | taken prisoner, dumped on the Pans, purse lighter, still playing |
| A lie on the weighing floor | hired by the Factor, then denies it to the Assessor | forsworn; the Assessor no longer opens the Room of Defaults; the Weights carry the company out and the black wall does not open to it again |
| The Comptroller's bargain | Durrance passed over for a promise, the letter never brought | Durrance safe, Elcock taken, the company forsworn on the Feast eve |
| The pledge | the Assessor takes the company through the Door before the Settlement | a name laid on the Notary's desk; the purse empty; Davy home in the Withies |
| Kept and opened again | the Release journey, saved after the seventh night's approach, restored, finished | the same ending, the same clock, the same held |
| Played twice | sixty steps from the same seed, twice | identical histories |
| The world it lies in | a generated fen country (seed `ossel`) | the innkeeper's rumour, the heard fact, the frontier installing Tessary as a chapter, the road across the march, the notice |
| As a chapter | the default fortnight with the module installed as a chapter | the ending reached, the world still running, the Withies and the Landgate showing the Factor's rule |

## Difficulty

- **Combat.** The dangerous creatures are few and placed: the Forsworn (two level-2 revenant-kin, in the plunge-room
  the page warns of), Bettany Slake and three ebb-runners (levels 1–3, take prisoners), three lightermen (level 2, take
  prisoners), the Factor herself (level 5, takes prisoners), and the Weights (who do not fight). A level-1 thief alone
  loses to the ebb-runners and wakes on the Pans; with Durrance (level 4) she wins. Nothing obliges a fight on any
  path to any ending.
- **The tide.** The main pressure, and fair: five hours of low water twice a day, the turn announced an hour before the
  flood, refuges, and a cost (three coin and a wound) rather than death. The night ebb is dark; the Hall of Oaths needs
  a light. Torches gutter: a player who means to read the drowned court should carry several.
- **The clock.** Fifteen days is generous for one ending and tight for two: a player who wants both the vote and the
  Assembly must plan. The night-8 calling is the first hard deadline and the most affecting; a player who has not
  found the drum, the Comptroller's bargain or the strength to hold her will lose Durrance to the sea, and can find her
  again in the Ranks.
- **Knowledge.** No single conversation gives the plot away; each person knows a part and will say it when shown
  reason. The Assessor is the richest source and the most guarded.

## Persistence and replay

Saved mid-fortnight and opened again, the world goes on to the same end; played twice from one seed, the same steps
give the same history; the generated-world journey saves and resumes through the frontier tests' own checks. A
browser transcript of a generated world replays in the terminal (`test/drawn-replay.test.ts`, after the bundle was
regenerated).

## What the tests do not show

- **That it is good.** See [08-judgment.md](08-judgment.md) and the cold playtest summarised there.
- **Every combination.** Seven endings, four Assessor fates, five Durrance fates, the Treasurer's three and the
  Factor's four multiply past testing. The random walks and the failure journeys look for broken states, not for dull
  ones.
- **A full browser playthrough.** The browser journey covers the opening at two widths; the rest is played headlessly
  through the same choices the page offers.

## Known limitations

- **Waiting is the main way time passes between the deeds of the first days and the Board's sitting.** A player who
  has done what can be done in the first week has little to do but wait for the eighth night and then for the
  thirteenth day. The city's own news fills some of it; more errands would fill it better.
- **The Board session is laid out as actions.** It reads well and the arithmetic is honest, but it is still a vote.
- **The Strongrooms have one weighing-floor gag, not a society.** The Scruples' Hall is a room of clerks with one
  vivid junior; the design wanted a culture.
- **The Holding is small**: seven rooms, one of them the Ranks. Its marvels are seen more than used.
