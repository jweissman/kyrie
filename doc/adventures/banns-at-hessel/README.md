# The Banns at Hessel

*A metropolitan region for Kyrie: a comedy of manners in a spa city at the end of its Season, with one gothic house in
it and one walk out of it. Spoilers throughout.*

A stranger comes over Lim Bridge into Hessel in the last four days of the Season and stops a runaway bath-chair.
The vast old woman in it, Mrs Abigail Cherrett, hires them to be her legs. She has forty thousand pounds, a heart
that is giving out, a granddaughter whose banns are being read to the wrong man, a great-nephew who writes bad poems
to a girl behind a shutter, and a companion she means to marry off. And she has been barred from the Assembly Rooms
for laughing at a minuet. Everything she has arranged is wrong, and her physician is quietly doubling her drops. The
book closes at noon on the fifth day, when the coaches go.

The commission's three seeds are its parts. *The Banns at Hessel* is the spine. *A Winter in Carth* is the shuttered
house at the end of the Crescent where every clock says two. *The Road to Orm* is the walk with Dr Ottery, who is
summoned before the College for telling the truth.

| Document | |
|---|---|
| [00 — the withdrawn first concept](00-withdrawn-treatment.md) and [its critique](00-withdrawn-critique.md) | A frost fair, withdrawn because it collided with `adventure/pellam-fair` |
| [01 — treatment](01-treatment.md) | Stage 1: the original design |
| [02 — critique](02-critique.md) | Stage 2: a severe editorial review, with a ledger against Wrayford, Pentrice and Pellam |
| [03 — revised design](03-revised-design.md) | The design the build is held to: eleven strands, the calendar, the two approaches |
| [04 — adaptation](04-adaptation.md) | Stage 3: Kyrie inspected, and how each part is said in Kyr |
| [05 — the map](05-map.md) | The valley in the world, the town on its hill, ways that are conditions, where people are |
| [06 — the small adventures](06-adventures.md) | The eleven strands against the seven parts, and how they hold together |
| [07 — the story](07-story.md) | Synopsis, acts, characters, conflicts |
| [08 — environment and resolutions](08-environment.md) | The hill, the round, doors with hours, things that speak; every resolution and where it is seen again; the five endings |
| [09 — builds](09-builds.md) | What each build can do, where a build matters, and the two approaches compared |
| [10 — rewards](10-rewards.md) | Experience, things, companions, and what they imply outside Hessel |
| [11 — playtest evidence](11-playtest.md) | The journeys, the two approaches, entries, negotiations, outcomes, persistence, wandering |
| [12 — critique](12-critique.md) | The first final critique (partly answered by 14) |
| [13 — changes](13-changes.md) | Stage 6: what reading and wandering changed |
| [14 — the second pass](14-second-pass.md) | **Read as literature**: what was pulp, what was missing, the buried history, foreshadowing, themes, chapters, danger with ways round it; and where 10× the ambition would start |
| [friction.md](friction.md) | Where Kyr resisted, by severity and kind, with remedies |
| [playtest/](playtest) | Nine journeys as the page told them |

## Status

Complete and placed. 33 places in the town and eight beyond it, 27 people, 11 strands, 5 endings with a closing
account of 37 fates, 28 milestones. 31 journey tests and 6 wander tests pass; the campaign lints clean.

```sh
bin/kyrie lint data/campaigns/hessel.campaign.json
bin/kyrie play data/campaigns/hessel.campaign.json --choices
bun test test/hessel.test.ts test/hessel-wander.test.ts
bun scripts/hessel-transcripts.ts      # rewrites playtest/
```

## Files

| | |
|---|---|
| `data/adventures/hessel/` | The module: `clock` (the Season's days, hours, latches), `city` (the region and its ways), `cherretts`, `rooms`, `oldtown`, `carth`, `orm`, `banns`, `ball`, `endings`, `growth`; `company` for the campaign, `placed` for a generated world |
| `data/adventures/countries.json` | Hessel's entry: beyond the north march of a forest, fen or frost country, entered at the south road |
| `data/campaigns/hessel.campaign.json` | Tamsin, a bard, at Lim Bridge |
| `data/rules/inhabitants.kyr` | One shared change: no tribute to the fallen (friction 9) |
| `test/hessel.test.ts`, `test/hessel-wander.test.ts`, `test/support/hessel.ts`, `test/fixtures/hessel/` | Journeys, wander, helper, builds and step files |
| `scripts/hessel-transcripts.ts` | Writes `playtest/` |

## Compatibility

Hessel reads nothing from another adventure, and no other adventure reads from it. It is appended last to
`countries.json`, so every existing country keeps its place in a generated world. It is offered beside forest,
marsh and frost countries, not mountain, so the frontier's existing placements are unchanged
(`test/frontier.test.ts`). Its people's names are its own (`test/adventure-names.test.ts`).
