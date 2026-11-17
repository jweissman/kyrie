# Commission: the setting/framework boundary (the owner, 17 November 2026)

Verbatim, as the owner gave it.

So just a thought but it might be to interesting to apply some design pressure and testing of the setting/framework boundary? If you like you could commission an independent investigation into the architectural boundary between Kyrie's setting-independent platform and the Westernesse/Orsino realization.

Begin by reading `doc/architecture/mission-21/abstraction-tower.md`, `doc/history/reviews/headless-rpg-investigation.md`, `doc/history/architecture-2026-10/composition.md`, `doc/architecture/domain-model.md`, the Living Design Atlas, and the earlier discussions of formally diverse adventures.

**The question is not whether Kyrie can narrate science fiction. It is whether another setting can define and execute its own game without inheriting Westernesse's ontology or gameplay assumptions.**

First map the current boundaries: entity kinds, classes and ancestries, capabilities, equipment, effects, setting catalogs, world-generation rules, spatial containment, route semantics, travel, observations, opportunities, economics, institutions, and persistence.

Then construct the smallest convincing nonfantasy game.

I suggest a three-part science-fiction expedition: visit an orbital station, travel by spacecraft between worlds, land on a planet, explore its surface, solve a consequential problem, and return to trade or report what was found.

Use genuinely different character types and capabilities. Demonstrate at least two nested geographic scales, with one authoritative journey and action system. Do not fake the test by renaming warriors and spells or hardcoding a second navigation implementation.

Initially use a tiny fixed or simply generated universe. A procedural galaxy and simulated flight physics are out of scope.

The implementation should be independent of the Westernesse catalogs. When an assumption leaks across the boundary, identify it, produce a tiny failing proof, and propose the smallest general repair.

In parallel, propose a small anthology of deliberately different forms: minimal perception, investigation, city institutions, strategic opposition, and resource-sensitive travel. Independent authors should push the system's expressive limits; the platform builder should respond with general capabilities rather than scenario-specific code.

Investigate, but do not automatically implement, fatigue as a resource for sustained effort. Compare it against existing time, supplies, injuries, and environmental pressure. Only recommend it if it improves actual expedition decisions.

Likewise, investigate the larger progression economy. Catalog the ways advancement, goods, companions, knowledge, and institutional access can unlock new executable verbs and geographic possibilities. Identify concrete gaps in starting towns and substantial cities.

Deliver:

1. An evidence-based map of engine, setting, generation, and client boundaries.
2. One tiny executable science-fiction campaign or an exact account of what prevents it.
3. A short list of verified architectural leaks, with minimal regression examples.
4. A proposed anthology of formally distinct adventures, each tied to an expressive capability and intended player experience.
5. Recommendations on fatigue, city institutions, strategic adversaries, and the economy of new capabilities, separating immediate repairs from longer-range research.

This is a bounded research and authorability workstream. It should not displace M22's primary goal of making the first touch and fundamental interaction exceptional.

**Success means the engine has become demonstrably more general, simpler to author for, and better understood, not that it has accumulated another large setting-specific subsystem.**
