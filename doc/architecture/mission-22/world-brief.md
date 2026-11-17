# Commission: the health and interest of the world (the owner, 17 November 2026, evening)

Verbatim, as the owner gave it.

I think we are beginning to get somewhere with the opening. I can now start the game without immediately bouncing off the interface. But ordinary play still quickly becomes frustrating, repetitive, and boring. Navigation remains uncertain, interesting things are hard to find, locations are often thin, starting undertakings feel too similar, and successful expeditions do not yet create enough new possibilities.

**I would like us to treat the health and interest of the world as the next major design problem.**

Please preserve M22's principal first-touch and interaction work. This is an additional, bounded investigation, preferably delegated to an independent world-generation/design subagent.

## First: recover what we already have

Before proposing a new hierarchy or generator, review:

- `doc/design/VISION.md`, `DOCTRINE.md`, and `ATLAS.md`.
- `doc/architecture/mission-22/brief.md`, particularly Phase 4C–D.
- `doc/architecture/mission-22/prospectus.md`, especially its spatial ambitions.
- `doc/architecture/mission-22/boundary-brief.md`, which already commissions a setting/framework investigation.
- `src/world/world-shape.ts`, `world-grid.ts`, `countries.ts`, `region-writer.ts`, and the region/settlement generation pipeline.
- `data/imbar/shape.json` and `data/adventures/countries.json`.
- Existing opportunity-depth, first-hour, dungeon, and economy audits.

I understand that `WorldShape` already defines large-scale geography, seas, and canonical city placement, and that `WorldGrid` and `Countries` supply further structure. Please investigate what these actually establish today, how faithfully the generated regions inherit it, and what is missing. **Do not rebuild an existing layer merely because it is incomplete.**

## The hypothesis: the world needs more deliberate composition from above

I wonder whether we're generating too much of the world from the bottom up.

We have worked extensively on the regional hex crawl and are contemplating a more detailed scale inside individual hexes. But perhaps we also need a stronger **strategic atlas above the regional map**, defining the world's important countries, major cities, populations, histories, economies, and political relationships.

This should serve two purposes simultaneously.

For the player, it should reveal the broad shape of the world and invite travel: named countries, cities, great roads, mountain ranges, seas, frontiers, and a few famous places. The map ought to suggest that distant lands offer genuinely different lives and possibilities.

For generation, it should supply meaningful context. Lower-level generators should know enough about the place they're building to produce specific settlements, inhabitants, material cultures, trades, histories, creatures, ruins, opportunities, and dangers.

I do not want an ornamental atlas or a superficial layer of national labels on otherwise identical generated terrain.

## Begin with a deliberately handcrafted strategic skeleton

Please experiment with **two or three contrasting, neighboring countries**, using or extending existing canonical geography where practical.

For each, establish an intelligible identity:

- Proper names, major geography, boundaries, capital, important settlements, and approximate population.
- A plausible settlement hierarchy and distribution of population.
- Political organization, important institutions, and relations with neighboring powers.
- Characteristic livelihoods, production, trade, resources, shortages, and things worth buying.
- Distinctive dangers, creatures, habitats, historical events, and ancient works.
- Important roads, borders, ports, and reasons to travel.
- A few substantial tensions or opportunities, some of which develop whether or not the player intervenes.

These should be **world facts and constraints**, not just prose for a country-description screen.

A country can have multiple kinds of terrain and danger. Avoid reducing each to one biome, one ancestry, or one challenge number.

The strategic layer should accommodate later change: rulers die, borders change, settlements grow or fail, routes become unsafe, creatures migrate, and institutions pursue their interests.

## Test whether this actually improves regional generation

Generate several regions under the contrasting strategic contexts.

Then conduct a blind editorial comparison.

Without being shown which country each region belongs to, can a reader or player recognize meaningful differences in the towns, people, landscape, opportunities, creatures, and economy?

Does crossing a border change the experience in an intelligible way?

Does a town's prosperity or poverty follow from its location and livelihood?

Do the ruins and wonders belong to the history of the larger world?

Do important cities function as plausible centers of population, economic activity, knowledge, and institutional power rather than oversized villages?

If the differences are mainly descriptive, the experiment has not succeeded.

Please distinguish between facts that the world knows, facts that a character knows, and things the map chooses to show. The atlas must not accidentally disclose unknown locations, secret histories, or future discoveries.

## Connect this directly to boredom and the first hour

I want a specific diagnosis of the repetitive opening experiences.

Please compare several generated starts and categorize their undertakings by **actual activity and dramatic structure**, not just their titles or prose.

A missing-person inquiry, a dangerous hunt, a practical repair, a civic dispute, and an exploration of a ruin should feel fundamentally different in how they unfold, what capabilities they reward, and what consequences they create.

I would like to eliminate the abstract **"What brings you to this land?"** style of origin selection. Let character circumstances be established diegetically through places, relationships, possessions, employment, obligations, memories, and events in the world.

Do not simply rename the same compulsory opening quest for each origin.

The player should encounter several credible invitations to become involved, with enough variation that a new character and a new seed feel genuinely different.

Please also revisit:

- The density and actual accessibility of interesting discoveries.
- Structural depth in explorable sites.
- Creature variety, ecology, and behavior, informed by continued SRD census work.
- The relationship between expedition rewards and useful purchases.
- Equipment, skills, companions, knowledge, and institutions that unlock new executable adventuring verbs.
- Navigation defects that prevent a player from reaching something already interesting.

The goal is not to add more markers or maximize the number of available actions. It is to increase the player's reasons to care about what happens next.

## Make one complete vertical slice

I'd rather see **one convincingly improved starting area** than a large theoretical architecture proposal.

Choose a generated starting country whose strategic context has been deliberately established. Demonstrate:

1. An opening with plausible, diegetic circumstances.
2. Three distinctly different opportunities to undertake something meaningful.
3. A substantial explorable site with layered dangers, clues, secrets, and rewards.
4. A settlement where expedition gains can open a genuinely new capability or avenue of play.
5. A legible reason to travel toward another country or major city.
6. At least one meaningful consequence that the world remembers.

Keep the work on the normal Kyr/Deem and authoritative action paths. Identify anything that cannot presently be expressed without bespoke TypeScript.

Use the established opportunity funnel—Exists → Reachable → Perceptible → Offered → Executable → Realized → Consequential—but supplement quantitative reporting with independent human editorial judgment.

A headless walk showing that an opportunity exists is not proof that a player finds it engaging.

## Architectural boundaries

Please coordinate with the existing setting/framework investigation.

The strategic atlas should not require the universal Kyrie kernel to know that worlds have medieval kingdoms, hexagonal countries, fantasy ancestries, or feudal capitals.

The engine may need generic relationships between places, containment, routes, populations, institutions, knowledge, and generated commitments. The Westernesse setting should determine how those are realized.

The same underlying concepts ought eventually to support a star chart containing planetary systems, a network of planes, or a world of islands linked by sea routes.

Do not generalize prematurely. Use the specific strategic-world experiment to establish which abstractions are genuinely necessary.

## What I want back

Please first return a short orientation and proposal containing:

1. **Existing architecture:** what we already have at the strategic level and where its influence currently stops.
2. **The proposed handcrafted reference geography:** which countries to use, what makes them different, and how their characteristics propagate downward.
3. **A baseline boredom diagnosis:** what repeats, why interesting things are hard to find, and which defects are content, generation, presentation, or navigation problems.
4. **One bounded implementation slice:** the smallest change that can demonstrate an improvement in actual play.
5. **Evidence and tests:** seeded consistency, meaningful cross-country variation, discoverability, economic consequences, and an independently reviewed playthrough.
6. **The next architectural implications:** what to generalize, what to keep within Westernesse, and what belongs in a later mission.

Do not turn this into an unbounded world-generation rewrite or postpone concrete improvements until we have a perfect model.

**The intended result is a world that feels composed at the largest scale, distinctive at the local scale, and consistently interesting at the scale of an individual player's next decision.**

The central question remains: *Does the world repay the player's attention and make them want to continue?*
