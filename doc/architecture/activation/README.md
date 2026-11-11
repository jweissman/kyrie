# Activation and depth: the editorial commission's record

*Branch `claude/great-hamilton-xr4iyo`, 10–11 November 2026. Independent of M20: nothing here is integrated into `main`, and nothing in it changes the first-hour opening.*

The commission asked, in three phases, for a deeper starting region (Phase One), a lightweight corpus survey with two richer locations and a Kyr/Deem boundary investigation (Phase Two), and an activation census of stranded content with the same locations made richer (Phase Three). They overlap; this is one record of the three.

| Page | What it is |
|---|---|
| [final-report.md](final-report.md) | **Start here for the outcome.** What is implemented, what is automatically verified, what was actually experienced (three blind playtests), M20 notes, and what remains unintegrated. |
| [phase-two.md](phase-two.md) | **Phase Two guidance:** which of its seven parts are already met, the final coherence and economy pass, generic balance observations for M20, and what a small independent Phase Two pass should do next, in order. |
| [handoff.md](handoff.md) | **Start here for merging.** What is implemented and exercised vs designed; every shared file touched and why; how to merge without duplicating people, places or quest systems; blockers. |
| [treatment.md](treatment.md) | Phase One: the diagnosis, the new places and people, the quest interconnection map, Aenean sites and clues, tested routes, and what is designed-only. |
| [editorial-map.md](editorial-map.md) | The corpus survey: how far each kind of content gets, ranked opportunities, what to rewrite, consolidate, retire or leave alone. |
| [census.md](census.md) | The reproducible content-activation census (`bun scripts/activation-census.ts`): paintings, creatures, works, items, scenarios, adventures. |
| [dormant.json](dormant.json) | The ledger of intentional dormancy, with reasons. |
| [storyboard.md](storyboard.md) | The spatial storyboard of the Hall, the old stones and the Empire's posting-house, with painting briefs, and the storyboard-first method. |
| [kyr-deem-requests.md](kyr-deem-requests.md) | Two migrations done (`@count`, template `if`/`unless`), a survey of what else is TypeScript, and 95 numbered requests with reproductions. **Begins with a triage of the ten that matter.** |
| [corpus/](corpus/README.md) | Phase Two corpus reviews of the 27 authored adventures: greetings, return greetings, aims, `after` news and cross-links, one page each, plus `deem-proposals.md`. |
| [dramatic-assessment.md](dramatic-assessment.md) | A dramatic reading of the corpus (clocks, one-shot talk, parked violence, errands) and what to change. It drove the Phase Three modules below. |
| [encounters.md](encounters.md) | Encounter audit and bands, generic combat observations (separate from scenario design), and the data tuning applied. |
| [deem-variation.md](deem-variation.md) | Deem variation of scenarios: the Fellowship (a drawn institution with members in the first country) and what the engine would need to span the world. |
| [modules/](modules) | The exemplary modules with storyboards, hazards, consequences and what is proved: *The Bound Howe* (an escalating crisis with a rival expedition), *The Numbered House* (a ruined arcology with a rival survey), *The Silent Lord* (a keep under siege and malice), and *The Walk of the Milestones* (a movement across four towns, six end states). |
| [transcripts/](transcripts) | Two played routes by the page's own labels (`bin/kyrie play`): the road-wood quarrel from the landing to a companion joining, and a walk to the posting-house and what its papers say. |
| [campaign-seeds.md](campaign-seeds.md) | The foreshadowing threads (coin, credential, letters, chronicles, veteran, preacher, plaque, levy, grant, grey blank): what each leaves open and what is deliberately not said. |
| [arcology.md](arcology.md) | A conception, not built: a ruined Mathematical Age arcology, twelve environmental moments, ecology, motives. |
| [modules/barrow.md](modules/barrow.md) | **Module 3, built:** *The Bound Howe*, a dangerous expedition (a king's howe on a ridge; a salvage crew, a warden, the dead's three laws, something older beneath): storyboard, hazards with clues, encounters with levels, consequences, variation, what is proved and what is not. Requests R15a–R15f are in [kyr-deem-requests.md](kyr-deem-requests.md) §D. |

## What was built (all tested)

- **The Empire's posting-house** (`data/generation/works/roadstation.kyrt`): an Aenean road station in every country; twelve rooms, three entries, documents in three voices, four unexplained endings, six occupant draws.
- **The Hall below stairs and the old stones below the dome** (`data/generation/town/outskirts-deep.kyrt`): kitchen, cellar, muniment room, undercroft; four named people (a cook, a boy, a gamekeeper who can join the company, a reeve); a quarrel over the old road that an Empire's grant settles.
- **The first town's neighbours** (`data/generation/town/neighbours.kyrt`): a scholar, an acolyte and an apprentice who can be companions or have arcs of their own; the generated innkeeper, priest, merchant and traveller given lives that touch them; a death at the landing with three readings; the reeve's father's papers; a spoon; the family's answer.
- **Small situations played, and a conflict with real malice** (`troubles.kyrt`, `conflict.kyrt`): a missing apprentice, an escort, odd animals and a theft (both drawn per country, with different answers), and a bailiff with a forged seal who collects from three communities on a clock, with three ways to answer.
- **Larger-world threads** (`threads.kyrt`): a different intimation for each settlement in each seed (a coin too bright for its age, a credential from a prefecture no clerk can place, a merchant's letters about a lord over the water, two chronicles, a veteran's column under a wheel-and-wing standard, the Keepers of the Road, a black plaque of true sums, a quietly redefined bushel), none resolved; companions notice the pattern after three and decline to name it.
- **Two abstractions:** *ties* (every settlement is tied to its nearest place by one of three authored shapes, told from both ends so the countryside leads back to a named town person) and *bonds* (each companion asks three questions of their own, remembers what the answers showed, and, at regard three, offers a paragon quest ending in a keepsake that grants the company a capability).
- **A batch of the owner's paintings**, imported and placed (149 → 199 of 207 imported; 148 → 184 mapped): `scene-ruins`, `-waterworks`, `-crossroads`, `-lone-tower`, `-parchmentry` and 45 more, with 21 new scene kinds in `scenery.json`.
- **`scripts/activation-census.ts`**, `scripts/dump-region.ts`, `scripts/play-at.ts`, `scripts/rooms-painted.ts`, `test/support/placed.ts`: the verification tools and helpers.
- **Specs:** `test/roadstation.test.ts` (10), `test/outskirts-deep.test.ts` (5), `test/neighbours.test.ts` (9), `test/ties.test.ts` (3), `test/troubles.test.ts` (7), `test/authorable-generation.test.ts` (2).

## Reproduce

```bash
bun install
bin/kyrie world kahitude                                  # the reference country; the posting-house is e1
bun test test/roadstation.test.ts test/outskirts-deep.test.ts test/authorable-generation.test.ts
bun scripts/activation-census.ts --seeds kahitude,a1,b2,thorn,c3,d4 > doc/architecture/activation/census.md
bun scripts/play-at.ts kahitude mage e1_office "Set the standard weights in the pan, in order"
```
