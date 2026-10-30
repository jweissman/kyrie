# The Lull

*An independent adventure region for Kyrie. Spoilers throughout.*

Above the hamlet of Sixways, on a bare rise north over the march, stands a stone notched in sevens. On six days the
road from it goes round a green hill and comes back. On the seventh, at six in the morning, another road goes down
into the Lull: a valley of beech hangers, a tarn, a river called the Idle, a weaving town called Linger, and a dead
mill of seven storeys. It has been the holy day there for fifty-seven years, four hundred of the world's, since the
weavers of the Long Shift struck and asked Rhiannon for their holy day and never another. Whatever is done in the Lull
without meaning it comes apart at sunset: bread sold, a cairn stacked for a coin, a gift given to win. Spite holds;
grief holds; a skep set for a coin by a man who loves bees holds. A night slept there is a week gone outside. And
whoever is awake in the valley at its midnight is in the six days it does not keep, in the dark, with everyone asleep
and the Mill working.

The young of Linger, who have never seen a Monday, mean to work.

Module `lull`, in [`data/adventures/the-lull`](../../../data/adventures/the-lull): 18 files, about 2,000 lines of Kyr,
31 people, 38 rooms, about a hundred things to ask. Played alone from the title page (*The Lull*,
`data/campaigns/the-lull.campaign.json`), or found in a generated world north over the march of a forest, mountain or
fen country, never on the first ring, where an innkeeper a country off says "there is a valley you can only walk into
one day in seven".

## The documents

| | |
|---|---|
| [01: five conceptions](01-concepts.md) | The Ambling, the Week of Guests, the Vizard Country, the Lumber of Heaven, and the Lull; why this one |
| [02: the treatment, as first conceived](02-treatment.md) | Geography, history, institutions, people, three Lulldays, endings, twelve smaller stories |
| [03: the first critique, and the design built](03-critique.md) | Thirteen charges: the asymmetry told three times, the law that was three laws, a climax that was a vote, a saint with a secret, a mercy written as an errand, the descent reflex… |
| [04: reading the engine](04-adaptation.md) | What Kyr says directly, what it cannot, the module's files |
| [05: the map](05-map.md) | The country, the places and what each is for, time as geography, history as the player assembles it |
| [06: the story](06-synopsis.md) | The situation, the acts, the people and how they change, themes and motifs, the ends |
| [07: the smaller stories](07-adventures.md) | Eleven, with approaches, turns, consequences and how each was checked |
| [08: different hands](08-builds.md) | What each calling's skills open; danger and the lone novice |
| [09: rewards and consequences](09-rewards.md) | Milestones, things, coin; what stays done in the valley, its institutions and the world |
| [10: playtesting](10-playtest.md) | Tests, transcripts, the browser, an ordinary protagonist; implemented vs tested vs played vs judged |
| [11: the second pass](11-second-pass.md) | What reading it as a finished work changed, what tenfold would mean, and what is still weak |
| [friction.md](friction.md) | Eighteen frictions: the dead a module cannot raise, rules that run during a week's sleep, a computed relation that is never re-read, a planner that can wall in the first country… |
| [playtest/](playtest) | Every journey as the page told it; five browser screenshots |

## Status

| | |
|---|---|
| **Implemented** | Sixways (8 rooms) and its people; the Lull (29 rooms) and its people; the sennight, the long sleep, the stone's wait, the fold and the Sixnight; the Ravel; three Lulldays and the Working Day; five endings and an afterward for each person; the valley as it is after; eleven smaller stories; crafts for seven callings; placement in a generated world |
| **Tested mechanically** | 25 journeys, 6 random walks, 3 world tests and a browser test (`bun test test/the-lull*.ts`; the browser test needs `KYRIE_BROWSER=1`) |
| **Encountered in play** | Every journey read as a transcript; the opening in the browser |
| **Evaluated as satisfying** | By its author only; see the second pass for the doubts |

## Play it

```sh
bin/kyrie play data/campaigns/the-lull.campaign.json --steps test/fixtures/the-lull/seventh.json   # one whole story
bun run web:build && open site/mono.html                                                            # "The Lull" on the title page
```

## The branch

`adventure/the-lull`. It adds the module, its campaign, its tests and fixtures, these documents, one entry appended to
`data/adventures/countries.json` (north, not among the independent adventures, so no other country moves), and one
entry in `web/scenarios.ts`. It changes nothing in `src/`, the shared rules or the catalogues.
