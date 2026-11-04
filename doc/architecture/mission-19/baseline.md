# Mission 19 baseline: what is implemented, reachable, usable, enjoyable

4 November 2026, at the start of Mission 19, kept current as the work goes ([brief.md](brief.md) §II). Evidence is of
three kinds and is said as such: **code and tests** (implemented), **the builder's own play through the browser**
(reachable, usable), and **the owner's and independent players' reports** (enjoyable or not). Nothing here is judged
enjoyable on the builder's say-so alone.

## The reference

- **Build and seed.** `bun run web:build`, `site/index.html?world=a1`, the default character (creation's first card at
  every step: Coming Home, human, warrior, Toughness, herdsman, Hamo). Drawing the world takes about eight seconds.
- **The reference town.** Millholm, in the country Merscfaenn: the drover's camp, the corn-store and its cellar, the
  shrine and churchyard with its catacombs, Corrin's alehouse and the quarry; the road to Mistshaw where the father's
  cart went off. The handoff's journey (the wanderer at Lowmouth, the same seed) is the second reference.
- **The driver.** `scripts/play-server.ts` with the step scripts kept outside the repository (`/var/tmp/kyrie/m19`):
  `start.sh` (fresh game, default creation), `go.sh` (keys, clicks, prints), `rats.sh` (the rats job).

## The ten steps of the loop, as played on 4 November

| Step (brief §III) | Implemented | Reachable in the browser | Usable | Enjoyable (evidence) |
|---|---|---|---|---|
| 1. Identity at creation | origin, people, calling, way, background, sex, name; first spell for casters | yes, five pages and Set out | yes; one question a page | promising (owner, M18) |
| 2. A settlement, understood | glance, plates for people, town plan | yes | partly: Millholm's camp shows six plates, eighteen ways under Every way, the map as the first lead | not yet: "a web app/wiki" (owner, 3 Nov) |
| 3. People, services, places | plates, services, conversation with wares | yes | yes for Bask; a salter selling lanterns and rope | — |
| 4. A reason to adventure | origin errand, notice with three jobs, rumours, heralds | yes | yes since this mission: the aim followed is the engine's (see below) | — |
| 5. Prepare | buy, carry, light | yes | yes for a torch; no comparison or recipient before buying (REV backlog) | — |
| 6. Reach a site | town jobs are a walk; country sites by the map | yes | yes in town; the map sets out at once on a click | — |
| 7. Explore a coherent site | cellar, rat-runs, drain | yes | yes, three rooms | thin |
| 8. Decisions by several means | fight, pack the run | yes | fight readable; one way to do the job | thin |
| 9. Discover, survive, return | paid in coin, lantern, oil | yes | yes | — |
| 10. Results used | the lantern for the catacombs | yes in principle | not yet seen | — |

The rats job, played through the browser on 4 November after this mission's first repairs, takes about twenty
choices from the camp to payment and goes where it says. Before the repairs it did not: see the register's M19-01 to
M19-06.

## The most consequential shared causes

1. **The engine did not know what the player is doing.** The aim followed lived in the browser by its words, and
   "your aim" was any aim's (handoff §12.2). *Repaired first* (M19-01): the followed aim is engine state by id, kept in
   the save, and "your aim" is that aim's alone.
2. **An aim's subject was read from its condition as well as its words**, so a satisfied prerequisite (the run
   stopped) stayed "your aim", and a way back up to the corn-store read as the aim from the cellar under it (M19-04,
   M19-05). Repaired in the shared code, not the town.
3. **Between town and site there is no game** (handoff §12.1): travel is the map's and arrives whole. Unrepaired.
4. **Every page is a menu** (handoff §12.3): a place is a list of leads, plates and three sheets. Unrepaired.
5. **Depth is uneven and prose repeats** (PT-15, OWN-75). Unrepaired.
6. **Generated content is TypeScript writing Kyr as strings** (handoff §8): every content fix is a code change.
   Partly in data templates (works, undertown, the wild's meetings).

## Contradictions resolved

- *Follow the job in hand* (the handoff, 4 Nov) against *keep the company's own errand first* (play 7, M17): both
  hold. A job taken up alone is followed unless the company's own errand (or an aim the player chose) is followed;
  then "Follow this" stands beside the new aim, as an RPG's journal offers to track a quest. Recorded in
  `src/presentation/undertakings.ts`.
- *The aim the place is about is said first* (stakes spec, M17 play 13) against *the aim followed is said on every
  page* (owner, 3 Nov): the followed aim is first; the place's aim comes next among the aims.
