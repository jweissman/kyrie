# Directions preserved (the owner, 19 November 2026)

Written down at the owner's request, as design and architectural guidance, **not** an implementation commission. M22's
current work (the authoritative opportunity architecture, route consolidation, the maturity track, critical
burn-down) is not interrupted by anything here. Register rows point here (AT-09, PG-01, KX-01, SS-01); each waits on
the current priorities settling.

The governing idea: **the world should not merely contain interesting things. It should continually create meaningful
possibilities, make them perceptible in appropriate ways, and respond coherently when the player acts.** The Color
Atlas may be one of the best instruments for making that principle explicit and measurable. And the larger ambition:
**one persistent Westernesse, supporting ordinary lives, heroic adventure, institutional power, and strategic conflict
through the same authoritative simulation.**

## 1. The Color Atlas as a central semantic design instrument

Beyond indicator correctness (AT-04..AT-07): investigate how Atlas aspects relate to action semantics, command
intents, risks, discoveries, social possibilities and world transformations. No one-to-one correspondence of aspect
and action type is assumed. Distinguish three things: the meaning of a situation, the evidence through which the
player learns of it, and the actions available in response. The goal is a coherent account of how the world
communicates significance, not a new taxonomy for its own sake.

## 2. A theory of opportunity density

Counting places, actions, people, topics or encounters is not evidence of a compelling adventure. Eventually, a
lightweight, source-grounded opportunity profile for scenarios and their major dramatic segments:

- what invites the player to become involved;
- what meaningful alternatives are available;
- what risks or costs can arise;
- what can be discovered;
- what lasting change the player can bring about;
- what new possibilities emerge afterward.

Distinguish the author's intended dramatic structure from the opportunities and consequences the engine can actually
demonstrate. No mechanical quotas (one fight, one talk, one colour an act): a quiet but consequential act can be
excellent. For now: whether the existing journey-review, semantic inspection and scenario census machinery can support
a small analytical experiment; no new narrative grammar or reporting framework. A valued future Studio feature: an
omniscient view of a scenario's Atlas opportunities, their conditions, witnesses, sources and resulting changes.

Once the foundations settle: a short analysis of how well the current Atlas and inspection machinery reveal the
dramatic possibilities in one existing adventure (not another large commission).

## 3. Character standing as a future progression framework

Distinct starting circumstances: **Commoner, Adventurer, Aristocrat, King, Vizier, and potentially Dark Lord.** Not six
engines or rigid levels: different combinations of personal capabilities, possessions, social standing, institutional
office, authority, knowledge and strategic reach in the same world. A commoner begins with minimal setup and discovers
possibilities through ordinary life; an adventurer begins with a heroic calling (explore, fight, wealth, companions, a
safe house or keep, eventually standing); an aristocrat with property, resources, retainers and access to political
institutions, without a heroic class; a king in sovereign office (govern, alliances, orders, strategic threats); a
vizier with delegated authority, diplomacy, intelligence, intrigue and influence, perhaps serving either side; a Dark
Lord perhaps through an exceptional campaign-scale transformation or an advanced start. Standing is gained or lost
through actual world events. Guidance for later progression and institutional work.

## 4. Kyr expressivity: one bounded authorability experiment

Whether Kyr and Deem can define and generate genuinely new kinds of items with no bespoke TypeScript and no change to
the catalog implementation. Investigate the machinery first, then one small example: a new item kind and several
properties; distinct instances generated through Deem tables or templates; an instance placed in an existing world,
exercising ownership, transfer, inventory and interaction; one meaningful capability through existing Kyr rules and
effects; referenced from a separate authored scenario without modifying the engine or the original definition.
Distinguish a new item of an existing kind from a genuinely new reusable kind. A minimal, orthogonal syntax
improvement may be proposed if it makes this natural; no ontology language, macro system or preprocessor.

Alongside: a lightweight census of setting-specific coupling in the language, runtime, assembly and presentation
layers (direct imports, embedded defaults, deeper semantic assumptions), with rough counts and examples, separating
legitimate general mechanisms from accidental Westernesse dependencies. Measure the authoring burden and where the
boundary fails: a small executable proof and a short findings report. Not a platform extraction, catalog migration,
language redesign or feature track. A small, general improvement may join the maturity work; a larger missing
capability is recorded for a later effort.

## 5. Strategy: one world, many positions, a living conflict

The same world and action system supports all the positions of §3; characters move between them through real events.
A substantial overstory: the king, the Dark Lord, their advisors, armies, institutions, allies and competing aims. The
Dark Lord's influence not only scripted encounters or quest flags: agents carrying out continuing plans that alter the
world; the king and other powers with meaningful means of resistance, diplomacy, military action and political
intervention; the conflict met at every scale, from rumour and local danger to commanding troops and sovereign power.
Independent adventures, livelihoods, exploration, creatures and mysteries continue beyond it.

**A bounded strategic-simulation spike** (when compatible with priorities): an existing or minimal generated region,
its real hex geography; two opposed factions or actors and perhaps one neutral settlement, modest resources, simple
objectives, deterministic policies, deciding as time advances through a few genuine world actions (travel, an envoy,
securing a position, moving a company). Not a strategy game or a second simulation engine. It should answer:

1. Can multiple actors observe the same committed world through their own knowledge and authority?
2. Can they select valid actions through the existing command and rules machinery?
3. Can time advance and their actions resolve deterministically, competing intentions included?
4. Can the history persist, resume and replay?
5. Can a player then meet the real consequences of what they did?
6. Can strategic activity stay abstract until local detail is needed, without fabricating inconsistent state?

Multiple actors in one simulation is not several independent cold-play sessions (partly supported, useful for
evaluation). A browser worker moves the simulation off the UI thread; it does not solve multi-actor scheduling,
command arbitration or shared-world consistency. The shipped game stays fully playable offline after loading: no
remote model, permanent server or external decision service. Deterministic policies first; model-based actors later,
as clients of the same authoritative action interface.

**Two independent authorial studies:** an *adversarial* perspective (tactical danger, military conflict, political
opposition, the Dark Lord's strategic aims; the institutions and actions through which the opposition exerts durable
influence) and a *resistance* perspective (how the king, the protagonist, companions, settlements and institutions
resist or redirect it; alliances, strategic choices, reversals, consequences). Independent critiques, not competing
agents modifying the same files; their synthesis a serious, coherent overstory grounded in existing canon, geography,
institutions and adventures, separating what Kyr and Deem can represent today from what needs language or runtime
work; a few strong interconnected situations over large quest inventories.

**Kyr, Deem and Studio:** strategic agency as a consequence of the same rules that govern ordinary actors, capabilities
from office, resources, institutions and relationships. A king needs no privileged command interpreter; a vizier cannot
create troops, alter allegiance or found an outpost by narrating it. No speculative higher-order constructs unless
they materially reduce authoring complexity or remove setting-specific engine logic. Studio's progression: Level 0,
omniscient read-only inspection of the actual world, its agents, histories, capabilities and provenance; Level 1,
controlled experimentation and validated authoring, temporary world state kept distinct from durable source. Semantic
operations proven in the CLI before browser authoring; reuse PlaySession, autoplay, cold-play, replay and
journey-review. A multi-session cold-play observatory (a terminal view switching among independent agent sessions) as an
intermediate tool, kept distinct from concurrent actors in one world.

**The useful result, when taken up:** a short, concrete assessment of the existing machinery, the smallest credible
two-faction experiment, its missing capabilities, and how the findings should shape progression and campaign design.

## 6. An assembler-derived interior map (the owner, 19 November, night)

Preserved as a future architectural experiment, not M22 work: no roguelike, new tactical engine or general map system
during M22's stabilization. Kyr should ordinarily describe an interior's meaningful spatial constraints (room
topology, passage conditions, containment, size requirements and the like) rather than use coordinates merely to lay
rooms out. The assembler should produce one authoritative geometric realization, from which a terminal schematic, an
architectural drawing and eventually player navigation are derived. Atlas marks on passages reuse the existing
authoritative opportunity model (the folds of AT-05/AT-06; a passage's mark a route's first step). The future proof
of the boundary: one small existing interior.
