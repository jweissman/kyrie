# Story-shape variety study: the owner's commission (18 November 2026, verbatim)

> There's a tiny design study I'd like you to commission if we have bandwidth. We have built an enormous amount of machinery in a remarkably short period, yet ordinary play still becomes repetitive, predictable, or unrewarding much too quickly. Some of this is straightforward product immaturity. But I suspect another part concerns the architecture of our authored and generated experiences.
>
> **How can Westernesse produce a much greater variety of meaningful situations from a relatively small repertoire of well-designed story structures?**
>
> Please approach this as an independent design study, informed by the current system and actual play, not as authorization to build a new procedural narrative engine.
>
> ## 1. Study boredom as a failure of experiential variety
>
> Review the existing M22 boredom census, opportunity-depth analysis, autoplay results, and representative human playthroughs.
>
> Distinguish several different causes of boredom:
>
> - Repeated narration or descriptions.
> - Repeated scenery, objects, and characters.
> - Repeated situations with different names.
> - Repeated player choices and action sequences.
> - Repeated outcomes regardless of player approach.
> - Empty interactions that fail to reward curiosity.
> - A lack of consequential developments over time.
> - Failure to acquire new abilities or encounter unfamiliar kinds of challenge.
>
> Consider the role of anticipation, uncertainty, surprise, mastery, and meaningful consequences.
>
> Not all repetition is bad. Familiarity helps the player understand the world, recognize patterns, and become skilled. The question is when repetition becomes predictable without becoming more interesting.
>
> I'd like a diagnosis of what is actually repeating in Westernesse, rather than a general prescription to add more randomness.
>
> ## 2. Study different scales of variation
>
> Almost every concrete element of a generated scenario should potentially admit variation, subject to its fictional commitments.
>
> A stranded cart might carry a different load, belong to a different sort of traveler, or be drawn by a different animal.
>
> But these are mostly surface variations.
>
> More consequential variation might concern:
>
> - **The situation:** accident, sabotage, coercion, theft, misunderstanding, shortage.
> - **The participants:** their roles, relationships, histories, interests, and competing obligations.
> - **The causes:** what produced the problem and who knows the truth.
> - **The approaches:** what the player can investigate, negotiate, repair, fight, protect, purchase, or otherwise accomplish.
> - **The development:** what happens if the player intervenes, refuses, delays, or leaves.
> - **The consequences:** what persists, who is affected, and which new possibilities appear.
>
> Examine how these dimensions can combine without producing incoherent or contradictory results.
>
> The objective is not maximal randomness. It is greater meaningful variation within recognizable structures.
>
> ## 3. Investigate reusable story shapes and functional submodules
>
> I'm interested in authoring situations as reusable structures rather than completely specified incidents.
>
> For example, a disputed possession, a threatened household, a compromised expedition, a rivalry over a discovery, an institution facing a crisis, or a journey interrupted by an unexpected complication.
>
> Such a structure might define:
>
> - Roles that must be filled.
> - Relationships and constraints among those roles.
> - Preconditions under which the situation is meaningful.
> - A small number of alternative causes or dramatic configurations.
> - Processes that develop over time independently of the player.
> - Possible interventions and their consequences.
> - Requirements for what the player can discover and understand.
>
> The specific people, places, objects, institutions, circumstances, and even subordinate situations might then be provided by Deem, tables, existing world facts, or the world assembler.
>
> I would particularly like to investigate **composable sub-scenarios**.
>
> A larger adventure might incorporate a pursuit, a dispute, a betrayal, a mechanical obstacle, or an unexpected alliance without having to author every particular combination from scratch.
>
> Could such submodules be parameterized, instantiated in different places, and interact through ordinary Kyr facts and actions?
>
> Where should the boundary lie between reusable dramatic machinery and the particular literary identity of an adventure?
>
> We must not reduce every authored story to interchangeable procedural pieces.
>
> ## 4. Audit the existing architecture before proposing anything new
>
> Please study:
>
> - `src/world/compose/` and `data/kits/`.
> - `src/world/world-assembler.ts`.
> - `doc/history/architecture-2026-10/composition.md`.
> - `doc/history/activation/deem-variation.md`.
> - Existing generated situations, adventures, and Deem tables.
> - The existing Kyr authoring and scenario-placement contracts.
>
> The composition architecture already has slots, constraints, proposals, implications, commitments, modules, and hooks.
>
> The Deem variation study also documented meaningful limitations: alternatives must often be declared in advance, generated facts select among authored branches, and some structural variations cannot be expressed directly.
>
> Please identify which aspects of the proposed approach are already supported, which are inconvenient but expressible, and which genuinely require new language or assembly capabilities.
>
> I am particularly interested in whether an author could ask the assembler to find or establish a situation matching meaningful constraints:
>
> *Find a merchant operating between two settlements who has something valuable at risk and an existing conflict with an authority.*
>
> Or:
>
> *Find two people with incompatible claims on the same possession, place them where their dispute can develop, and bind an appropriate mechanism of resolution.*
>
> That would be much more valuable than merely choosing names from a table.
>
> However, world commitments must remain authoritative. A generator cannot casually overwrite existing relationships or introduce contradictions simply to satisfy a scenario.
>
> ## 5. Connect story variation to the atlas of player intentions
>
> Use the recent Color Atlas and intention-taxonomy study as another analytical tool.
>
> If two generated variants differ in names and scenery but invite essentially the same actions and yield equivalent outcomes, consider whether they are truly distinct gameplay variants.
>
> Investigate whether story-shape variation can produce a richer distribution of opportunities for investigation, influence, confrontation, protection, manipulation, travel, acquisition, learning, and other intentions.
>
> Different character capabilities should also change how a situation can be approached.
>
> A commoner, an aristocrat, a thief, and a mage need not receive different quests. They might encounter the same circumstances but recognize and exercise different possibilities.
>
> The aim is not to guarantee that every character can do everything. It is to ensure that differences in capabilities and circumstances produce interesting differences in play.
>
> ## 6. Examine two or three concrete examples
>
> Please select a small number of existing Westernesse situations and explore how they might be expressed as more reusable story structures.
>
> For each example, compare:
>
> 1. The existing authored or generated form.
> 2. Surface variation: names, objects, places, creatures.
> 3. Causal variation: different underlying problems or relationships.
> 4. Dramatic variation: different developments, interventions, and consequences.
> 5. Compositional variation: the same sub-scenario participating in a different larger adventure.
>
> Show several fully intelligible examples of play, not merely tables of possible parameter values.
>
> Evaluate whether the variations would actually feel different to a player.
>
> If useful, construct one tiny headless proof using existing composition tools. Do not develop a general framework as part of the study.
>
> ## 7. Consider the authoring experience
>
> I'd also like to know how this could make independent adventure authors more productive.
>
> Could an author define a strong dramatic shape once, specify a few carefully chosen variations, and have Kyr and Deem realize it in many coherent forms?
>
> Could an author write a reusable complication that other adventures can incorporate without requiring intimate knowledge of its implementation?
>
> Could the editorial Playthrough Reader and semantic journey tests help assess whether generated variants are genuinely different, readable, and consequential?
>
> We should optimize for authorial control and excellent realized stories, not an impressive number of procedural combinations.
>
> ## 8. Deliver a design judgment
>
> Please return a concise but substantial report covering:
>
> - The dominant causes of repetition in current play.
> - The kinds of variation that would most improve the experience.
> - What the existing system already makes possible.
> - Its genuine architectural and authoring limitations.
> - Two or three worked examples of reusable story shapes.
> - A proposed relationship among Kyr modules, Deem decisions, assembly constraints, and persistent world facts.
> - A small experimental plan with measurable criteria for success.
> - The risks of over-abstraction and procedural sameness.
>
> **No broad implementation is authorized by this commission.**
>
> Keep M22's first-touch playability work moving. I don't want to replace fixing the immediate experience with another major infrastructure initiative.
>
> The governing ambition is:
>
> **Westernesse should not simply have more things to encounter. It should continually present different, intelligible, consequential situations in which the player can discover new possibilities and exercise meaningful agency.**
