# Half the Hive

*An independent adventure for Kyrie, on the branch `adventure/half-the-hive`. Written 30 October 2026.*

On the Wold of Hume, south over a march beyond a mountain country, four hundred people live inside a honeycomb that
hangs under a limestone overhang, and belong to bees as big as hounds by the smell of their queen. The old queen is
about to swarm. Half the town will walk out behind her and found a new comb wherever the bees choose, and never come
back. The Searchers who must find that place are short of hands.

A protagonist can be scented at the gate, taken on, taught the dance, and sent over the Wold to stand in the places
the swarm might go, every one of which costs someone; can sit a night in the dark with a widow and the thing that
drinks from the dead; can help two lovers who are each secretly giving up their calling for the other; can take a
useless, magnificent Drone out walking and find that he knows a road nobody asked him about; can finish a stair of wax
nineteen years in the making; can steal, pour away, or uncork a flask that will call the swarm wherever it is opened;
and can walk with the Leaving and be named to the hive, or stay with the half that wakes that night to the piping of a
new queen. Or ignore all of it, cut wild comb for a living, and watch half a town walk away.

## Play it

```sh
bin/kyrie campaign data/campaigns/half-the-hive.campaign.json     # alone, up the drove road
bun run web:build && open site/mono.html                          # the title page offers "Half the Hive"
```

In a generated world it lies south of a mountain country, two or more marches out; the innkeepers of that country
speak of it.

## Documents

| | |
|---|---|
| [00-concepts.md](00-concepts.md) | Five competing concepts, and why this one |
| [01-treatment.md](01-treatment.md) | The first treatment, unrevised |
| [02-editorial.md](02-editorial.md) | The severe editorial criticism of it |
| [03-revised-design.md](03-revised-design.md) | The design that was built |
| [04-adaptation.md](04-adaptation.md) | Kyrie inspected; the design mapped onto Kyr |
| [05-map.md](05-map.md) | The geography, a map, the places and why each is there |
| [06-story.md](06-story.md) | Synopsis, acts, characters, themes, endings |
| [07-adventures.md](07-adventures.md) | The fifteen smaller stories |
| [08-builds.md](08-builds.md) | Which builds open which ways |
| [09-rewards.md](09-rewards.md) | Experience, goods, training, companions, and what persists where |
| [10-playtest.md](10-playtest.md) | What was tested, encountered and looked at; [playtest/](playtest) holds transcripts and screens |
| [11-critique.md](11-critique.md) | The second, more severe reading of the finished work |
| [12-changes.md](12-changes.md) | What changed from conception to the last revision |
| [friction.md](friction.md) | Authoring and simulation friction (HTH-1 to HTH-20) |

## Files

- `data/adventures/half-the-hive/`: twenty Kyr files (country, clock, the dance, Smoke End, the Apron, the lovers,
  the Stores, Ivo, the Wold, the Gallowtree, the Dell, Larkhill, the Calling, the Leaving, the Daughters, the
  Turning-out, after, endings, growth; company and placed), `module.json` and `placed.json`.
- `data/campaigns/half-the-hive.campaign.json`; an additive entry in `data/adventures/countries.json` and
  `web/scenarios.ts`.
- `test/half-the-hive*.test.ts`, `test/support/hume.ts`, `test/fixtures/half-the-hive/` (journeys, build campaigns,
  a company-of-three module).

## Status

| | |
|---|---|
| **Implemented** | Everything in the revised design except what [11-critique.md](11-critique.md) lists as unanswered |
| **Mechanically tested** | Sixteen journeys; seven of the nine endings (not the Dell taken in blood or held nightly against the brocks); both placements; the browser at two sizes |
| **Encountered in ordinary play** | A cold run by visible labels; a curious autoplayer; the author's own long sessions in the terminal |
| **Judged satisfying** | By its author only, in part, and with the reservations in the critique. Not by a stranger. |

Not merged to main.
