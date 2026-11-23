# Mission 22-beta — The owner's commission

**23 November 2026 · Westernesse / Kyrie / Kyr / Deem**

**Status:** Canonical mission brief for M22-beta. Place at `doc/architecture/mission-22-beta/BRIEF.md`. Preserve the original alpha commission at `doc/architecture/mission-22/brief.md` as history. Where prior beta proposals conflict with this commission, this brief governs. Technical findings in earlier reports remain evidence, not binding implementation prescriptions.

## 1. The purpose

**Make one small world worth inhabiting, make its machinery trustworthy, and make the next world easier to create.**

Westernesse is a literary, painterly, persistent, simulation-first RPG. The world exists independently of the player. Actions have material and social consequences, danger is real, histories persist, and the player can develop distinctive capabilities and forms of life. Kyr declares consequential fictional processes; Kyrie executes a single authoritative world; Deem generates structured variation; human creators select, edit, critique and develop the results.

M22-alpha closed as a proving phase **without acceptance of the first hour as a product**. Beta may take several weeks. It is an implementation and integration mission, not another broad investigation. The alpha retrospective, human play findings, independent architecture audit, continuity census, performance profile and beta preparation plan already give sufficient grounds to start. Further investigation should answer specific questions raised by implementation—not become a prerequisite to it.

Beta has four interconnected aims:

1. **Playable experience:** a rapid, coherent first minute; an understandable first fifteen minutes; and an interesting small settlement–dungeon–return loop with meaningful combat, conversation, and responsive interactions.
2. **Engine trust and architectural maturity:** eliminate causes of recurrent defects; enforce authoritative actions, situation focus, atomic commands, reproducible worlds and performance budgets.
3. **Kyr authorability and Deem:** preserve high-level fictional meaning, demonstrate one substantial language lift, improve generated templates, and give human authors simple ways to sample, inspect and revise work.
4. **Platform/product separation and artistic foundations:** enforce generic-versus-setting dependency boundaries, prove a second rules-distinct world, and build enough coherent world and visual identity to give the supported experience life.

The **same playable small world** must be the integration fixture for all four aims. No track succeeds through reports, code motion, or unit tests alone. Structural improvement must create a visible player or authorial dividend.

## 2. An acceptance ladder that protects human attention

Spend the cheapest reliable evidence first:

1. **Fast setting-independent unit, property and invariant tests.** Parser, compiler, language, runtime, generic domain logic, command integrity and dependency rules must be testable without installing Imbar. Prove not only valid behavior but that invalid constructions fail explicitly.
2. **Headless seeded journeys.** Test real sequences of actions, world changes, generation, travel, engagements, saves and restores. Assert invariants **at every turn**, not merely at an expected endpoint.
3. **Inexpensive automated players.** Deterministic, typed/constrained, gold-following, exploratory and adversarial agents should expose reachable states outside scripted golden walks.
4. **Independent blind cold-play agents.** Strong agents play the rendered browser with no privileged source knowledge or scripted route. Include a careful reader, impatient presser, wanderer and player who follows or ignores the offered aim. Record seed, revision, device/viewport, choices and failures.
5. **Human acceptance and editorial judgment.** Reserve genuinely fresh human time for integrated builds and questions machinery cannot answer: clarity, dramatic interest, aesthetics, surprise, pleasure, and desire to continue. Existing human findings are already valid engineering evidence; do not ask humans repeatedly to confirm the same failure.

A higher-level objective defect becomes a permanent regression at the **lowest reliable level**. Conversely, cheap mechanical proof does not establish a good experience. Cold-agent success never silently substitutes for human acceptance; if human evidence is absent, mark that gate **outstanding**, but do not stop implementation awaiting it.

Maintain separate judgments of **trustworthy play** (the game behaves as promised) and **compelling play** (the promise merits participation).

## 3. What the player should experience

### 3.1 An immediate beginning

The owner's direction of 23 November governs the target:

- No long-press barriers. The title offers **Play**, resuming a compatible game when appropriate; restarting or leaving a game must be intelligible.
- Quickly offer **create a character** or **“We enter the world as we are”** (a complete, competent pre-rolled character). Quick start must not mean inferior or unfinished.
- Present the opening in the same choice vocabulary as the game, using two or three clear actions. **Light a torch** is the exemplary first act.
- A short stock starting situation should teach material interaction by doing it: about two rooms, one person, one ration, one fight and a small puzzle, riddle or hazard; then an exit into the open world. A ravine, collapsed mine or fallen arcology bridge are candidate situations, not all required.
- A player should learn why light, food, equipment, social help, risk and knowledge matter without an extended tutorial or forced prophecy. An optional childhood formative memory remains a future creative probe, not a mandatory opening.

**Performance ambition:** first meaningful action within **1.5 seconds of Play**, with the conditions measured and reported, not asserted from a hopeful animation.

### 3.2 One small starting settlement, one clear dungeon

The supported environment is a quiet farm cooperative, mountain hamlet, fishing village or desert encampment, **largely isolated in a hexcrawlable wilderness**. Choose **one principal fixture** and make it convincing before generating all its variants. Include a conspicuous, substantial dungeon in or beside the settlement's hex.

The village offers shelter, food, trade, rest, equipment, a few recognizable people, relationships, rumors and perhaps companions. **Most inhabitants are not quest dispensers**; they have occupations, memories and reasons to respond to changed circumstances. The dungeon offers actual danger, discoveries, secrets, obstacles, treasures, inhabitants and repeatable reasons to return. For beta, a strong playable entry and return loop is worth more than six mechanically thin levels.

**Reference journey:** establish oneself → prepare → enter dungeon → encounter danger → discover and decide → withdraw/return → recover, resolve a consequence or reward, and consider another expedition. The world must remember what happened. Local tasks and nested undertakings can teach exploration, preparation, fighting and return; avoid errands to dull distant points of interest that lead nowhere.

The distant world should nevertheless be imaginable. An imperial coin, a traveler, a story or a book may introduce **Dun Rìerdan**, its Seven Towers, and the prospect of reaching the great metropolis. Distinguish **hearing a name**, **learning about a place**, and **choosing to pursue an aim**. Do not force a compulsory main quest. The Black Pool, invisible tower, Babylon, Porthalen, St. Thera's Reach, and the deep city belong to the creative horizon, not mandatory beta content.

### 3.3 Combat, conversation, play feel

**Combat** in the supported loop must be consequential, legible and genuinely risky. Supply meaningful decisions, real costs, sensible enemy morale, surrender or retreat where warranted, and immediate readable feedback. An overwhelming party may intimidate weaker opposition by the situation itself, without requiring a special feature. Compression or automatic resolution may shorten presentation but **must never waive actual danger, time, resource use or consequences**.

**Conversation** should be a focused encounter between people with intentions, knowledge and memory. Relevant topics belong together; exits are clear; one response can open other questions, change relationships, or reveal facts. Do not present an engagement as unrelated general-world action rows or a sequence of decorative dialogue buttons.

**Everyday interactions** must work coherently too: light a torch, take and eat food, carry an item, examine an object, prepare supplies, rest, complete a minor obligation, hear someone react. The material world must respond and resist rationally.

**Feel** is part of causality: stable controls, quick acknowledgment and settlement, readable transitions, consistent map behavior, intelligible motion, no flickering choice rows, minimal unnecessary steps per intention. Measure latency and interaction count, not just CPU time.

### 3.4 Visual consistency

Develop a recognizable visual identity for the chosen settlement and dungeon. Repair missing scene bindings and weather/time mismatches before multiplying art. A few consistent views of the **same** place in selected rain, dusk, clear weather, cold or different seasons produce more verisimilitude than unrelated beautiful images. Do not depict a sunny day when the world is in a storm. Use and reconcile the existing painting inventory. A 3D environment is an optional downstream visualization experiment, not beta's renderer.

## 4. Immediate engineering priority: act cost and responsive opening

Begin with the **measured performance problem**, not speculative rewriting. The 23 November act-cost profile found that the pure simulation is much cheaper than a complete headless turn; repeated grounding of legal actions, journey processing, perception, route finding and screen rebuilding are prominent costs. A language/runtime port is not justified before incremental algorithms are repaired.

Suggested first slices: add or retain a **turn-cost ratchet** across seeded walks; recompute legal actions only for relevant changed relations/read sets; avoid rebuilding a full player frame for each uneventful journey leg; delay expensive routes and perception until genuinely needed; reprofile after each change. Preserve all ways an attack or other interruption can legally reach a traveler. No performance shortcut may break simulation truth.

Measure and aim for:

| Measure | Target |
|---|---|
| Engine/title-ready load | Under 1 second on the explicitly measured path |
| Play → ready game with prepared world | Under 1 second |
| Play → first meaningful action | Within 1.5 seconds |
| Visible input acknowledgment | Within 100 ms |
| Ordinary browser action fully settled | Within 300 ms at p95 |
| Headless decision including legal action determination | Under 15 ms median |
| Normal headless non-journey turn, including scene/frame | Under 30 ms |
| Uninterrupted journey leg without rebuilding a whole frame | Under 5 ms |

These are **targets**, not claims already met. Report warm/cold, p50/p95 and outliers; disclose device/CI conditions and special action classes. Pre-rolling during title loading is legitimate, but not if it merely hides a blocking load or corrupts identity, save and restart behavior. If a numerical target is unsound for a class of action, present evidence and a justified alternative; do not quietly weaken the acceptance gate.

## 5. Four non-negotiable trust and maturity contracts

### A. Authority — one action meaning

The engine owns stable action identity, legality, refusal, semantics, knowledge and opportunities. It provides an authoritative player frame including meaningful grouping, focus, ordering and emphasis; the browser, terminal and runner render it without re-inferring meaning from labels, ID patterns or independent scans of effects.

The alpha retrospective identified competing readers of teaching, aim advancement and guidance. The preparation report and independent audit propose a verified **Outcome** or equivalent causal/transition summary. Treat this as a serious candidate, not predetermined architecture: bounded speculative execution must be assessed for randomness, side effects, cost, and equivalent alternatives. The same authoritative evidence must explain blue knowledge marks, gold guidance, what is offered, and the result of taking the action.

**Proof:** walk-wide and adversarial checks for truthful marks; blue on a person has discoverable and visibly marked teaching topics, including paginated conversations; teaching is not missed; a gold aim leads through completion, reward and aftermath; presentation clients agree on semantics, not only text labels. Predicted and actual effects agree within correctly represented contingencies.

### B. Continuity — one coherent situation

Place, conversation, map, journey, focused occasion/riddle/card hand and combat must have explicit transitions and correct ways out. The UI reflects exactly the current meaningful situation. A task's focus survives interaction, interruption and return; no map is “open” while the map is absent; no undertaking silently disappears at payoff or loops on an impossible route.

**Proof:** focus, opportunity and undertaking invariants through full golden and exploratory walks, not single scenario pins. Extend present census and parity tools to the rendered talk drawer, its paging and focus states.

### C. Integrity — one command, one history

A command commits exactly once or fails explicitly without partial mutation of world, creature state, time, inventory, history or view. Produce explainable command receipts, fault-injection tests, save/restore consistency and deterministic replay/generation where their declared inputs and versions are compatible. Record seed, setting/content/generator versions and relevant action history for reproduction. Do not promise cross-version save migration before the schema stabilizes.

**Proof:** rollback tests under induced failure, repeatable outcomes and clear incompatible-version diagnostics. A future Fortune Glass may expose the information; its full UI is not required for beta.

### D. Separation — Kyr is not Westernesse

Enforce boundaries among Kyr Core, reusable domain capabilities, Deem and composition, Kyrie host/runtime, setting packages and Westernesse-specific art/rules/presentation. Remove canon, calendar, currency, default party, SRD or setting catalogs from generic components where they violate declared ownership. Dependency checks and injected contexts come **before** a disruptive directory/package extraction.

**Proof:** a small **non-Westernesse** civic, scientific or social scenario with different character and world rules executes the same public lifecycle—install, create/resume, frame, act, receipt, persist—without inheriting Imbar. If possible, coexist safely with a Westernesse campaign in one process. Show exactly which forbidden dependency edges remain.

## 6. Kyr expressivity: preserve authorial meaning

Kyr remains one relational transition engine; don't create another quest system, hidden plot interpreter, scheduler or Deem-written executable language. When a high-level author construct lowers to ordinary facts and effects, retain its **semantic identity, participants, phases, consequences, interruptions and provenance** so presentation, generation, inspection and tests can recognize it.

Explore a bounded **Situation** composed of **Incidents**, together with **Occasion** for focused engagement and **Undertaking** for persistent intention, progress, reward and aftermath. Validate terms through real examples; don't build a universal taxonomy first.

**Proof:** replace a hand-built riddle, conversation, bounded performance or undertaking with a clearer authored form, preserving intended history and player results. Check a contrasting case before generalizing. Count reduced control machinery, improvement in diagnostics and author comprehension. An independent author should be able to read the fictional design before needing to mentally execute its private state flags. A new grammar production alone is not acceptance.

## 7. Deem, corpus and human-in-the-loop tooling

Expose a small **browse → sample → compare → inspect provenance → select/reject → revise → replay** workflow for existing Deem templates and generated Kyr/world objects. A browser or CLI workbench that combines existing tools is sufficient; **a complete Studio is not required**. Fix demonstrably busted templates and validate meaningful variation rather than just output volume.

Review authored material editorially, identifying the **worst fifth** for pruning, salvage or decomposition and the **best fifth** for deeper, recomposable variation. Preserve distinctive comedy, wonder, danger, romance, appetite and civilizational difference; avoid allowing every situation to become another ledger, debt or ancient obligation. Store editorial critique as creative evidence rather than reflexively opening P1 defects.

Worldbuilding may progress in parallel: compact starting-settlement types and conceptual studies of Babylon, Porthalen, Dun Rìerdan, St. Thera's Reach and the deep city. Give them material economies, institutions, histories, architectures and playable professions. These are human-led **creative inputs**, not a large beta content deliverable.

## 8. Future ambition and exclusions

**SRD completeness is a strategic goal, not beta's exit condition.** Maintain a coverage inventory of spells, levels, legal creatures and their mechanics, classes, conditions, movement, feats and missing capabilities. Choose difficult representative cases—extraordinary travel, polymorph, summoning, unusual bodies—to identify actual domain/kernel gaps. Distinguish unimplemented roadmap items from broken advertised behavior. Create original substitutes where necessary for protected product-identity material; do not reproduce protected designs.

**Travel is material and costly**, not an encounter lottery or a free UI teleport. Roads, food, weather, time, people, hazards, knowledge and means of transport matter. The presentation can compress uneventful time, but not erase consequences. **SRD magic may legitimately bypass ordinary geography** when its actual capabilities and limitations permit it: dimension door, teleport, plane shift, wish and other extraordinary travel are real advancement, not violations of world logic.

**3D is an optional viewer/input adapter**, not a second simulation authority. The engine says which people/objects/places exist and what actions are offered; a spatial renderer may locate them and submit the same commands, including conversations. Identify necessary stable public interfaces, but don't build a 3D game for beta.

**Do not absorb into beta:** all SRD spells and creatures, complete new cities, generalized transformation ontology, full profession/perk migration, 3D production, a complete Studio, world-to-world time travel, shared historical branches, or a wholesale package rewrite. Preserve these in the feature atlas and investigate selectively where they test beta's boundaries.

## 9. Planning discipline: separate defect debt from ambition

Keep the repository-local record and stable IDs. The planning-instruments work has already proposed generated views for **defects**, the **master feature atlas**, and the **architecture/maturity roadmap**. Finish only essential classification hygiene. Don't mass-import GitHub Issues, write a new planning framework, or manually rewrite the whole archive.

Differentiate:

- **Historical/global record:** all confirmed defects, requirements, directions and evidence; allowed and expected to grow.
- **Supported-slice blocker gate:** P0/P1 violations on the explicitly declared supported experience; always publish numerator, denominator and scope.
- **Active queue:** no more than **ten blockers plus three platform items** unless deliberately revised, each with owner, test, demonstration and acceptance criteria.

A defect is an observed violation of a claimed or supported contract. A desired future spell, city, animation, system or architectural lift is not automatically a defect. Classify cause as well as severity and track concentrations and regressions; don't mistake issue closure volume for quality.

**Work rhythm:** implement, prove cheaply, integrate often, maintain the playable reference build. Every major intervention needs a construction invariant, a visible/authorial dividend, a compatibility/risk account, and a reproducible demonstration. Avoid multiple competing authoritative interpretations and avoid parallel landing stacks that obscure integration.

## 10. Integration sequence, not a rigid calendar

Use the beta preparation and 23 November owner direction as evidence. They are not invitations to re-plan indefinitely. A realistic sequence is:

1. **Preserve the baseline already collected**: continuity census, seeded walks, browser timings and act-cost profile. Extend only where needed for real proof.
2. **Act cost and the immediate opening**: incremental decision making, journey cost, quick Play, pre-prepared world, stable feedback, no long holds.
3. **One focused small-world loop**: quiet village, clear dungeon, preparation, encounter, discovery, return and consequences.
4. **Authoritative action/outcome and situation continuity**: Atlas truth, engagements, map, conversation, nested undertakings and reward, proved across the loop. Work on these foundational contracts from the first wave wherever they block the other steps.
5. **Combat and conversation**: danger, morale, consequences, responsive choice design, meaningful human interaction.
6. **Maturity and authoring demonstrations**: atomic commands, setting independence, retained high-level Kyr, Deem sampling and corpus triage—run independently where integration risk allows.
7. **Integrated cold-play acceptance and honest handoff**: several independent play styles, performance and compatibility gates, remaining defects and next-stage recommendations.

These are **integration gates, not necessarily seven sprints**. Beta may take weeks. Do not postpone every gameplay improvement until after a long architectural phase. Prefer small, safe, progressively improving increments. If capacity constrains the plan, protect trust, performance, command integrity and one compelling playable loop; reduce workbench and breadth before sacrificing the core.

## 11. Exit conditions

Do not close beta solely because planned tasks landed. Require concrete evidence for:

1. **Defect gate:** zero known P0 failures in supported builds, and zero known P1 trust/play-blocking failures in the declared first fifteen minutes. The wider supported 30–45 minute loop and wider open defects have honest separate dispositions; P2/P3 remain visible.
2. **Trust and integrity:** authoritative action meaning, true Atlas promises, coherent focus/map/journey, undertaking through reward, atomic commands and save/replay guarantees hold across representative and adversarial walks, not just individual pinned states.
3. **Responsive play:** measured first-action and action-settlement budgets, including p95, cold/warm conditions and outliers; any unmet target is explicitly called unmet.
4. **Played quality:** a complete quick-start or custom character can engage with a person, gather and use supplies, confront real danger, explore a significant dungeon and return to a settlement that responds. Conversation and combat are distinctly stronger than alpha. The world gestures beyond its valley without compulsory story rails.
5. **Authorial leverage:** one retained high-level Kyr process demonstrably simplifies real authored work; sample, inspect and critique of Deem output is practical; corpus review informs what to prune and enrich.
6. **Portable platform:** a genuinely non-Westernesse scenario runs through the shared public lifecycle without hidden canon dependence, with remaining debt explicitly enumerated.
7. **Independent acceptance:** repeated blind cold agents play the rendered supported slice and objective discoveries turn into cheap tests. Human acceptance is separate: use it when available, report it as outstanding if not obtained, and **never assert it occurred on proxy evidence**.

A mission closeout must distinguish **implemented**, **structurally proved**, **cold-agent verified**, and **human accepted**, identify remaining gaps and the scope of gamma. Never call a partially proved first hour excellent.

## 12. Start immediately and communicate concisely

Read the current source of truth in this order: `doc/STATUS.md`, `doc/architecture/mission-22/closeout.md`, `doc/architecture/mission-22/handoff-beta.md`, `doc/architecture/mission-22-beta/preparation-report.md`, `doc/architecture/mission-22-beta/owner-direction-2026-11-23.md`, `doc/architecture/mission-22-beta/sprint-0-baseline.md`, and `doc/architecture/mission-22-beta/act-cost-profile.md`. Preserve the alpha historical record. Where prior beta planning disagrees with this brief, follow this brief and document meaningful reconciliations without turning them into another study.

**First step:** select the smallest measured performance repair—turn-cost ratchet, incremental legal-action grounding or journey-leg truth-preserving optimization as appropriate to the current checkout—implement and benchmark it; then move directly to the immediate opening and integrated small-world loop. Do not request new approval for routine engineering decisions within this commission.

Report briefly: **what changed, what invariant and player experience improved, what remains false, and what the next small queue contains**. Ask the owner for genuinely artistic/product choices, not for permission to perform ordinary fixes. Protect human attention for design, worldbuilding, illustrations, editorial judgment and rare meaningful playtests.

**The final criterion:** the next fifty consequential situations should be easier to author and more reliable to play than the previous fifty—and the first fifteen minutes of Westernesse should finally be worth playing.
