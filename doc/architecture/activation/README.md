# Activation and depth: the editorial commission's record

*Branch `claude/great-hamilton-xr4iyo`, 10–11 November 2026. Independent of M20: nothing here is integrated into `main`, and nothing in it changes the first-hour opening.*

The commission asked, in three phases, for a deeper starting region (Phase One), a lightweight corpus survey with two richer locations and a Kyr/Deem boundary investigation (Phase Two), and an activation census of stranded content with the same locations made richer (Phase Three). They overlap; this is one record of the three.

| Page | What it is |
|---|---|
| [handoff.md](handoff.md) | **Start here for merging.** What is implemented and exercised vs designed; every shared file touched and why; how to merge without duplicating people, places or quest systems; blockers. |
| [treatment.md](treatment.md) | Phase One: the diagnosis, the new places and people, the quest interconnection map, Aenean sites and clues, tested routes, and what is designed-only. |
| [editorial-map.md](editorial-map.md) | The corpus survey: how far each kind of content gets, ranked opportunities, what to rewrite, consolidate, retire or leave alone. |
| [census.md](census.md) | The reproducible content-activation census (`bun scripts/activation-census.ts`): paintings, creatures, works, items, scenarios, adventures. |
| [dormant.json](dormant.json) | The ledger of intentional dormancy, with reasons. |
| [storyboard.md](storyboard.md) | The spatial storyboard of the Hall, the old stones and the Empire's posting-house, with painting briefs, and the storyboard-first method. |
| [kyr-deem-requests.md](kyr-deem-requests.md) | Two migrations done (`@count`, template `if`/`unless`), a survey of what else is TypeScript, eleven narrowly specified requests with reproductions. |
| [transcripts/](transcripts) | Two played routes by the page's own labels (`bin/kyrie play`): the road-wood quarrel from the landing to a companion joining, and a walk to the posting-house and what its papers say. |
| [arcology.md](arcology.md) | A conception, not built: a ruined Mathematical Age arcology, twelve environmental moments, ecology, motives. |

## What was built (all tested)

- **The Empire's posting-house** (`data/generation/works/roadstation.kyrt`): an Aenean road station in every country; twelve rooms, three entries, documents in three voices, four unexplained endings, six occupant draws.
- **The Hall below stairs and the old stones below the dome** (`data/generation/town/outskirts-deep.kyrt`): kitchen, cellar, muniment room, undercroft; four named people (a cook, a boy, a gamekeeper who can join the company, a reeve); a quarrel over the old road that an Empire's grant settles.
- **A batch of the owner's paintings**, imported and placed (149 → 199 of 207 imported; 148 → 184 mapped): `scene-ruins`, `-waterworks`, `-crossroads`, `-lone-tower`, `-parchmentry` and 45 more, with 21 new scene kinds in `scenery.json`.
- **`scripts/activation-census.ts`**, `scripts/dump-region.ts`, `scripts/play-at.ts`, `scripts/rooms-painted.ts`, `test/support/placed.ts`: the verification tools and helpers.
- **Specs:** `test/roadstation.test.ts` (10), `test/outskirts-deep.test.ts` (5), `test/authorable-generation.test.ts` (2).

## Reproduce

```bash
bun install
bin/kyrie world kahitude                                  # the reference country; the posting-house is e1
bun test test/roadstation.test.ts test/outskirts-deep.test.ts test/authorable-generation.test.ts
bun scripts/activation-census.ts --seeds kahitude,a1,b2,thorn,c3,d4 > doc/architecture/activation/census.md
bun scripts/play-at.ts kahitude mage e1_office "Set the standard weights in the pan, in order"
```
