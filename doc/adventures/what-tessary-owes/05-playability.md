# What Tessary Owes — playability report

*How it plays, how it was tested, what the tests show and do not show. Every journey plays by the labels a player
sees, through the same choices the page offers; nothing is asserted into the world from outside except in the
generated-world journey, which places the company at the innkeeper's table as the frontier tests do.*

## The test evidence

| File | What it plays | Result |
|---|---|---|
| `test/what-tessary-owes.test.ts` | a lint and 25 journeys (below) | all pass |
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
| Past the Forsworn | the votive weight bought at Saint Evenhand's and given into the hollow people's hands; the drain under the plunge-pool | the Strongrooms reached without the Assessor or the compact; the Scruples' cistern; the Forsworn not fought |
| The eel-mother | the Throat Stair at the night ebb, warned and turned back; then fed a cone of Gudrun's hot eels | her warning gives a choice before any fight; going back up is safe; fed, she lets the company by |
| Bettany's letter | Bettany Slake told what her letters are for | the Factor's letter handed over, no lockbox, no goose, no fight |
| The Assessor balances the pans | the Assessor at the counterweight door with no weights carried | the door opened without the brass weights |
| The Factor at dusk | hired, then on the Tidewall at dusk; later, shown the Room of Defaults' truth | she seeks the protagonist out, reacts to what they have done, and speaks of her father and the First Muster |
| The Factor pays | hired, the Treasurer's list read, what is taking her lads told to her | twenty coin; her plans brought forward (`saultInformed`) |
| The Drum's gossip and the Treasurer at the Throat | Hannelore asked on the third day and the ninth; the head of the Throat Stair before dawn on the tenth night | the gossip names the next night's danger, its hour and place; the Treasurer is there; talked down, he goes home, or he drowns |
| Someone they cannot call a liar | the Assessor joined on the first night, the Council House at the sitting | the Board's bell; the Assessor states the city's affairs to the Board and is counted |
| Kept and opened again | the Release journey, saved after the seventh night's approach, restored, finished | the same ending, the same clock, the same held |
| Played twice | sixty steps from the same seed, twice | identical histories |
| The world it lies in | a generated fen country (seed `ossel`) | the innkeeper's rumour, the heard fact, the frontier installing Tessary as a chapter, the road across the march, the notice |
| As a chapter | the default fortnight with the module installed as a chapter | the ending reached, the world still running, the Withies and the Landgate showing the Factor's rule |

## The cold playtest

A player who had read nothing of the source played from the Causeway to the Release by labels alone (seed `cold`,
about 230 steps, every day of the fortnight). What they liked: the Copyist and the chapbook (bought on a whim, paid off
under the sea, and rhymed at the end in what Davy remembers), Durrance's account of Sedge Ford and the King's of the
same moment, the Comptroller ("I would draw it again"), Mistress Plum, and "I hold it quit". What they found, and what
was done:

| Found | Done |
|---|---|
| **The mystery solved by the eighth hour, then eleven days of news.** A methodical player had the Treasurer's confession, the Room of Defaults and the Factor's letter on the first day and night, and nothing to do until the Feast | The middle week's events (the eighth night, the Treasurer at the Throat, the lightermen at Marrable's door, the Muster on the Row, the Board, the Seal) were already scenes a company could be present at, but nothing said where or when. Hannelore at the Drum now has the city's gossip, a day or two ahead of each, with its hour and place; the Treasurer stands at the head of the Throat Stair for an hour before he goes down it, and anyone there can speak to him; the Board's bell rings on the morning of the sitting. The Room of Defaults no longer does the deduction for the player: its margin ends "Balanced", and the reversal comes only to someone who also knows what the War Note's weight is. The confession itself still comes early to a player who asks the right man the right question; that is left, deliberately |
| **The Board could not be moved in a scene** | The player came at two, when the count had begun. The sitting's hours are now on the Landgate bill, in Marrable's mouth, in Hannelore's and in the bell. And "someone they can't call a liar" now means what a player would think it means: the Assessor, travelling with the company, can state the debtor's affairs to the debtor, and is counted |
| **The Factor a dead end in person; her twenty coin never paid; no fate for her or the Comptroller in the Release** | She now pays for being told what is taking her lads (and moves sooner for knowing it); she can be told to her face that her letter has been read, and answers with the levers against her; every ending now tells what became of her and of the Comptroller |
| **Rewards never paid** | Haverick presses a purse on whoever brings Plum home. Nan pays whoever tells her where Davy went (that was so before; the player had not told her) |
| **One step on the ebb-runners' quay and the day ended** | Bettany's warning now names the price and the way out. The fight itself is unchanged: three runners and their captain will beat a lone first-level thief, and dump her on the Pans |
| **Stock greetings shared across the cast; Durrance talking about her pot and Hannelore in the Comptroller's office; labels that never change** | Every person a player returns to has their own greeting; Durrance's lines no longer assume the taproom; roles say only what does not change; the bunting, the Yard and the drowned city at night say what day and hour it is |
| **The War Note's dates did not add up** (twelve years, eleven years, "when the war was a year old") | The Muster was raised when the war began, eleven years ago; the note was drawn a year later, ten years ago; the silver was carried for ten years. The Assessor's argument (the promise to the soldiers came first) now follows from the dates |
| **"Into under the warehouse"; "To under the Aqueduct"** | The warehouse cellars; the foot of the Aqueduct |
| Engine-side: the defeat told before the blow; an unaffordable purchase silently absent; "Mind how you go in the dark" under the sea | Recorded in [friction.md](friction.md) (W18–W24) |

## Difficulty

- **Combat.** The dangerous creatures are few and placed: the Forsworn (two level-2 revenant-kin, in the plunge-room
  the page warns of, guarding the drain that is the drowned city's own way down; fought, slipped past while they answer
  an oath sworn aloud in the hall, or given the weight of a kept promise), the eel-mother (a level-5 conger at the foot
  of the Throat Stair at the night ebb only; she warns first, and can be fed, slipped past, or left alone by taking the
  stair at the day ebb), Bettany Slake and three ebb-runners (levels 1–3, take prisoners), three lightermen (level 2, take
  prisoners), the Factor herself (level 5, takes prisoners), and the Weights (who do not fight). A level-1 thief alone
  loses to the ebb-runners and wakes on the Pans; with Durrance (level 4) she wins. Nothing obliges a fight on any
  path to any ending, and every fight the adventure offers has at least one way round it.
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

- **A thorough player still finishes the investigation early.** The middle week now has five scenes with an hour and
  a place, each announced at the Drum a day or two ahead, but a player who has pre-empted them all (Durrance safe,
  Marrable guarded, Fisk turned) has only the Board and the Feast left to attend. That is a reward for diligence, and
  also a lull.
- **The Board session is laid out as actions.** It reads well and the arithmetic is honest, but it is still a vote.
- **The Strongrooms have one weighing-floor gag, not a society.** The Scruples' Hall is a room of clerks with one
  vivid junior; the design wanted a culture.
- **The Holding is small**: seven rooms, one of them the Ranks. Its marvels are seen more than used.
