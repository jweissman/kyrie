# Gosse's Company

*An independent adventure for Kyrie: a comedy about a company of travelling players, and the first adventure written
to perform in the generated world's own towns. Conceived first as literature and design
([01-treatment.md](01-treatment.md)), attacked by its own editor ([02-critique.md](02-critique.md)), revised
([03-revised-design.md](03-revised-design.md)), read against the engine ([04-adaptation.md](04-adaptation.md)), then
built in Kyr (`data/adventures/gosses-company`, `data/goings-on/players`) and played. Spoilers throughout.*

```sh
bin/kyrie lint data/campaigns/gosses-company.campaign.json      # 0 errors, 0 warnings, recommended
bin/kyrie preview data/campaigns/gosses-company.campaign.json   # the reader
bun test test/gosses-company.test.ts                            # 30 journeys and a lint
bun test test/gosses-company-wander.test.ts                     # seeded random legal play from Wending Cross
bin/kyrie play test/fixtures/gosse/city.campaign.json --seed g1 --steps test/fixtures/gosse/book.json
```

It is on the title page as *Gosse's Company*. A generated world whose first country is a forest may hold it beyond its
west march (seed `gosse`, for one); when it does, the players are stuck in the town the west road leaves from.

## The kernel

Forty years ago, at the Wheel in the Soke, a young player called Absalom Gosse, playing a fool, said something about
Lord Mayor Ezra Orde that the pit took up and carried over the river and through the City for two nights. The Mayor,
who had been in the house with his four-year-old daughter on his knee, founded the **Office of Plain Speech** within
the month. Nothing has been said on a stage in Pentrice since without its licence, and Gosse has never played inside
the walls again.

This season, the last he can walk, Gosse brings his company back for the **Trial of the Wheel**: three companies, three
nights at the Wheel, a bench of four critics, and the **Patent** of the Wheel for the one they choose. A play is
waiting for them at the Painted Moon, unsigned: *The Alderman's Ghost*, a comedy about a pompous, loving, absurd old
alderman who will not stay dead. It is the best thing any of them has read. It is very obviously about Ezra Orde. It
was written by his daughter, who keeps his Office.

## The reports

| | |
|---|---|
| [05-map.md](05-map.md) | the city, the Soke and the road; where Pentrice lies in a generated world, and how the company finds it |
| [06-the-week.md](06-the-week.md) | the dramatic synopsis, the acts, the characters and their strategic conflicts; the inventory of the small adventures and how they bear on each other |
| [07-the-night.md](07-the-night.md) | the performance scene by scene; environmental design; the resolutions and endings |
| [08-builds.md](08-builds.md) | the character-build interaction matrix; rewards and their implications |
| [09-playtest.md](09-playtest.md) | playthrough evidence: the journeys, the entries, negotiations, alternate outcomes, persistence, wandering |
| [friction.md](friction.md) | the authoring-friction report: what the engine needed, what was changed, what was worked round |
| [10-editorial.md](10-editorial.md) | the final editorial revision, and the record of changes made after play |
| [11-critique.md](11-critique.md) | an honest literary and experiential critique |
| [12-second-pass.md](12-second-pass.md) | the second pass: what was wrong, the play performed, the Bench's supper, what the riot cost, the dogs and the weir, and the 10x answer |
| [playtest/](playtest/) | full transcripts, every step as the page told it |

## What is where

| | |
|---|---|
| `data/adventures/gosses-company/` | the city (`city.kyr`), the week's clock (`clock.kyr`), the company (`troupe.kyr`), the Office and the mystery (`office.kyr`), the Bench (`bench.kyr`), the town's small stories (`town.kyr`), the other companies' nights (`nights.kyr`), Gosse's night (`night.kyr`), the Bench's supper (`supper.kyr`), what the riot cost and who remembers it (`history.kyr`), the dogs and the weir (`combat.kyr`), the verdict, the endings and the rewards (`verdict.kyr`) |
| `data/adventures/gosses-company/placed.json` | Pentrice as a country beyond a march, reading what the herald learned |
| `data/adventures/gosses-company/module.json` | Pentrice alone, from the road (the test fixtures' city) |
| `data/adventures/gosses-company/road/` | Wending Cross, an authored village on the west road, and the road across the march, for the standalone campaign |
| `data/goings-on/players/` | the herald: *the players on the green*, set in a generated town |
| `data/scenarios/players.scenario.json` | the herald's placement: the town the west road leaves from |
| `data/adventures/countries.json` | the `pentrice` entry: west of a forest country, with its herald |
| `data/campaigns/gosses-company.campaign.json` | the standalone campaign: Wending Cross, the herald, the road, Pentrice |
| `src/world/countries.ts`, `world-assembler.ts`, `scenario-towns.ts`, `frontier.ts` | the herald contract (see [friction.md](friction.md)) |
| `src/lang/world-constructs.ts` | a hidden way is not described shut to a company that has never heard of it |
| `src/campaign/campaign.ts` | a campaign's own kinds are back in the catalogs before it is forked |
