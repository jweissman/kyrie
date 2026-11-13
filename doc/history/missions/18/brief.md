# Mission 18: the commission's requirements

The owner's commission of 28 October 2026, set out as the requirements it names, each with its acceptance and where
it stands. The [register](register.md) keeps the inherited findings; this keeps the constructions. Both are written as
the work goes, and the final report answers both.

**Standards.** Astonishment: places, people, situations and choices of unusual imaginative quality. Pull: curiosity,
intelligible reasons to act, attention rewarded, a wish to return. Astonishment without pull is insufficient.
Sophistication is met through play, not documentation or tests; an implemented feature is not an experiential pass
until ordinary play shows it working.

**Order (IX).** 0, reconcile and baseline; 1, the interface, with early owner review; 2, two adventures in one
settlement, then the library, then the City of Seven Towers; 3, the ordinary loop, density, NPCs, shops, dungeons,
combat, expeditions; 4, Kyr and Deem, tools, isolation, CLI parity, performance, architecture (the Kyr review early
enough to inform it); 5, careers, social life, culture, cosmology, epics, the Encyclopedia; 6, the register, prolonged
independent play, owner evaluation, the report. Dependency-driven, not rigid; unblocking repairs at once.

**Responsibility.** The builder: construction, integration, correctness, evidence. The independent Kyr reviewer:
analysis and recommendations. Adventure authors: their prose and dramatic material, through the public authoring
system. The owner: creative director and final judge of the interface, navigation, combat feel and imaginative quality.

Status: **—** not begun, **Begun**, **Built** (implemented, not yet shown in play), **Played** (shown in ordinary play,
with the play named), **Accepted** (the owner's word, where the gate asks it).

## Gate A: the game interface (P0)

| Req | What | Acceptance | Status |
|---|---|---|---|
| A1 | A protected, bounded stage (about 20% margins at desktop as a reference), scaling to iPad landscape and portrait and phone; nothing drifts to the edges; dramatic moments may break out | Seen at the four sizes in play; no edge clipping; no long document in a smaller box | Played: every browser play of 1–3 November at desktop; test/opening-browser.test.ts at four sizes. Owner verdict awaited |
| A2 | Near-black or charcoal ground, luminous purposeful colour, geometric and modernist type explored beside literary; no web cards, links, dashboards, parchment, faux leather; beautiful without an illustration | Owner verdict | Played: the lantern in every play. Owner verdict awaited |
| A3 | Skippable studio ident, fade to black, the title revealed, a centred menu of the principal choices with an animated selection indicator | Played; owner verdict | Played (ident, title, menu: Westernesse). Owner verdict awaited |
| A4 | One vocabulary of hover, focus, press, release, activation, selection, disabled; consequential actions, replies, examining, targeting, travel and arrival, discovery and reward, level; no layout shift or focus loss; keyboard, touch, reduced motion | Browser specs for states and focus; played by touch and keyboard | Played by keyboard and pointer: one Act.View for every choice; what is grave or can hurt asks first, alike for every act on a thing (OWN-50, test/riddle-door-browser.test.ts); touch at phone size in the specs only |
| A5 | Distinct compositions in one language for creation, city, wilderness, room and dungeon, object, conversation, commerce and inventory, travel and map, combat, advancement, public events | Each shown in play | Played: place, conversation (the large portrait kept), counter, thing, fight, road, world map, book, and below ground the plan (3 November). Advancement and public events thin; 4 November: the plan of a town, a building and a site above ground (TownPlan); one plate for each person (OWN-82) |
| A6 | Creation as the choice of a life: reason or history first, three or four large cards, explanation on request, the inherited range of backgrounds and origins, ancestry, calling, profession, specialisation, attributes, equipment, varied favoured weapons with real differences; no protagonist portrait or likeness of any kind | Played at four sizes; owner verdict | Built and specified at four sizes (why first, cards, no likeness, sex chosen); a play through creation itself in this closure is OWN-55 |
| A7 | Perceptual, epistemic and dramatic lenses; a second-person narrator that does not begin every sentence "You", invents no feeling, keeps others' voices, never contradicts the world | Narrator specs; reading of plays | Played: second person for one who comes alone, the clause after another's too (GTR-19); aims said only when chosen or turned; narrator specs |
| A8 | Arrival, presence, observation, investigation, action, consequence, reflection, return told differently; revisits brief; weight by importance | Played | Played: arrivals and returns told apart (a return recalled by its first sentence and what changed); notes capped; a chapter after the night that brought it (GTR-X05) |
| A9 | One terrain-first map (illustrated hex-crawl, restrained or isometric hex, or a hybrid with local views): terrain, water, relief, settlements, roads, landmarks, discoveries, position, distance, destination; travel along known roads interrupted only for what matters | Played; owner verdict | Played: the hex map, one ring of land known about places been (OWN-58), set out from the map (OWN-48), map-only movement across hexes, roads and their tolls, "?" marks said. Owner verdict awaited; 4 November: travel between hexes is the map's alone, no compass step or Set out on any other page (OWN-85) |
| A10 | Audit of the 700+ portraits by what they show; authored NPCs matched by face, work, age, circumstance; image-free where art would contradict; environmental art for significant places | Audit file; census | Built: the census of paintings (M17-23), fight portraits, no face shared within a day, no credit where none is known |
| A✓ | Integrated playable title, creation, busy city place, substantial conversation, physical puzzle, combat, geographic map; real tablet; the owner's assessment | Owner's assessment | Played in part (title, creation, the first town, a conversation, the riddle door, fights, the map); a real tablet and the owner's assessment outstanding |

## Gate B: one country and an enduring Imbar (P0)

| Req | What | Acceptance | Status |
|---|---|---|---|
| B1 | The installed adventures composed into one principal country, sharing towns, wards, roads and valleys; first two in one settlement and hinterland without duplication or overwriting; then the library; distant fiction kept but connected; standalone launch and tests kept | Placement report; play | Played: every authored adventure a province of the first country (badf74a), Behind the Wainscot (1a2c9bdd) and the Grand Tour (3 November) merged; rumours say where each lies. Two adventures in one settlement not shown; 4 November: two modules in one town proven apart (the town, the circus, the players and a quarrel in Lowmouth, a1: test/two-modules-one-town.test.ts, COR-05) |
| B2 | The City of Seven Towers: wards, buildings, streets, markets, institutions, residents, economy, history; seven towers as distinct destinations; common ground for modules | Played | — (the City of Seven Towers was not built) |
| B3 | Imbar's chassis: lands, cities, coasts, rivers, ranges, forests, deserts, tundra, underground, oceans; demographics, ecology, livelihoods, trade, institutions, cultures; layers kept apart (canon, procedural, adventure) | Atlas data and a map of it | Begun: one Imbar canon installed first (data/imbar), its planes world-owned; the atlas of lands not built |
| B4 | Declarative placement (a temple in a ward, a cave in a desert, a harbour, a ruin by a river, a monastery a distance off, an institution in several towns, a place in a plane), with provenance, decisions and conflicts recorded; no shared-map or registry edits | Placement semantics documented; report | Built: placement by need and province (countries.json, the composer's kits, ScenarioTowns refusing an unknown need); `kyrie world <seed>` lists where each scenario landed and `kyrie countries --diff` what a change moves; not documented as one semantics |
| B5 | Discoverability and aspiration; knowledge states perceived, reported, recognised, visited, explored, understood | Played | Played: heard of, seen, been to, with the map and the Book; discovery rewarded (OWN-58) |
| B6 | Surveying: vantage, climbing, sight lines; spyglass; expertise and companions identify; weather, light, terrain, distance; recorded on the map | F1.4 demonstration | Played: towers climbed and their prospects (seed wren), spyglass bands; companions identifying not shown |
| B7 | One clock and world state across modules; items, relationships, promises, knowledge and consequences cross module boundaries; no separate campaign | Play | Played: one clock and one world; the canon's planes and House of Doors shared (OWN-31, OWN-33); a placed module still counts its own days (GTR-01, open) |
| B✓ | Placement report; several adventures in one town and wilderness; one protagonist through significant parts of three adventures with outcomes, no reset; cross-module interaction by shared rules only | — | —: no placement report; three adventures by one protagonist not played |

## Gate C: density, depth and ordinary pleasure (P0)

| Req | What | Acceptance | Status |
|---|---|---|---|
| C1 | 10–100× local POI density where fitting and 2–3× interaction depth at substantial places, against measured baselines; measured per region and per travel, by kind, interactions, discoveries, alternate routes, consequences, revisits, skill rewards; typical and low end reported | Baseline and after | Played: works stocked with a den and a searched cache (f826363e); the first town's undertown, catacombs and barrow (OWN-57, 4c8faace). The 10× baseline not measured |
| C2 | Places from causal surroundings: river settlements, battlefields, woodland livelihoods, city occupations matching buildings; quiet country kept | Played | Built: settlements by founding and trade, generated works by geology and history |
| C3 | Physical interaction: look, examine, search, listen, open, move, use, alter; described things answer; secrets, mechanisms, traps, texts, hidden ways; many answers to obstacles | Played; specs | Played: things on ways, a puzzle's acts under it, a lettered flag the page answers, traps marked and answerable (M17-56), searching led once the ways on are taken |
| C4 | At least one deep dungeon: levels, entrances, backtracking, persistent change, residents, ecology, traps, secrets, treasure, route choices | Played | Played: the catacombs and the barrow under the first town (three levels and more, more to carry than one trip takes); deep sites in every country (Ruberport's drowned stair, REV-10) |
| C5 | An adventuring economy: merchants by trade (a smith sells crowbars), light, rope, food; treasure with buyers or uses; equipment that differs | Played; audit | Played: tolls, a capability market in the first town (drill-yard lessons, the smith's better weapons, the scrivener's spells, a mule), treasure a quarter of its worth in experience when found and half in coin when sold, each ware said beside what it replaces. The economy re-measured: doc/history/missions/18/economy.md |
| C6 | Novice survival for every calling alone: warnings, preparation, first actions, retreat, consumables, healing; no unanswerable grinds | Sim by calling; F1.6 | Built: odds read before a fight, parley, retreat; simulated (doc/history/missions/18/novice-viability-closure.md): careful novices rarely die (0–6%), but alone a mage, thief or bard who stands dies in 85–96% of the first ruin's fights; with the first town's hire every calling wins a median 0.5–1.0 |
| C7 | Combat as an encounter: participants, threats, capabilities, turn order, targets, conditions; honest dice; several sides; negotiated or environmental endings | Played; owner verdict on feel | Played: readable fights, fight experience ten for each foe (REV-22); morale and surrender not built (REV-16); morale by default carried to Mission 19 with REV-16 (a band its author says Breaks runs; a bout ends at the first fall) |
| C8 | About 10× conversational richness for major NPCs; follow-ups; capability-sensitive interventions; compound prerequisites; NPCs ask, remember, initiate, act on beliefs; conviction changes as development; recruitment keeps a life; the philosopher-conversion and phantom-audience defects tested | Specs; F1.7 | Played: topics, follow-ups, memory, disputation, deeds beside talk (BTW-01) |
| C9 | Noncombat lives: work, service, investigation, religion, scholarship, trade, medicine, performance, craft, institutions; people various and ordinary | Played with a noncombat character | Built: performance, trade, service at an inn, talking a toll down; not played with a noncombat character in this closure |
| C10 | Renewal: incidents, changed circumstances, returning visitors, requests, relationships, NPC activity; origins continued; fewer repeated tolls, raids, dens, voice lines, settlement shapes | Long play | Played: dens retaken, jobs that say what is owed and where; long play not measured |
| C✓ | A full expedition (creation, shopping, preparation, travel, investigation, combat or avoidance, treasure, return, development); a sustained intellectual conversation with durable effects; a noncombat character; searching and examining measured for yield | — | Played: the local expedition from the first town into the catacombs and back, paid, spent (1–2 November browser plays); a sustained intellectual conversation not played |

## Gate D: Kyr, Deem, modules, the studio, technical discipline

| Req | What | Acceptance | Status |
|---|---|---|---|
| D1 | An independent Kyr language review: 15–25 examples, current against proposed; grammar against library, tooling, docs or semantics; prioritised | Review document | Built: the IF review (IFR-01..10 in the register) |
| D2 | `kyrie new adventure <id>` makes a complete self-contained module under `data/adventures/<id>/` (Kyr, Deem, definitions, items, tables, generators, fixtures, tests); imports, exports, namespaces, dependencies, conflict diagnostics; clean install and uninstall | Demonstrated | Built: `kyrie new` scaffolds a module, lints clean (test/new-tool.test.ts) |
| D3 | Deem describes and composes; Kyr expresses interaction; runtime applies; assembler composes; presentation renders; no fiction from TypeScript emitters; module tables, templates, generators; geographic role binding; provenance | Demonstrated | Begun: the undertown a Kyr template in data (data/generation/town/undertown.kyrt), generated Kyr read by parsing (WrittenKyr), the audit (authorability.md); 22 emitters still write content |
| D4 | The CLI family (new adventure/character/scene/site/item/table/generator; play character/scene; inspect; lint; test; verify) audited for fidelity; named test contexts; traces as tests | Demonstrated | Built: new, lint (with advice to authors: AuthorLint), play (--choices folded), inspect, reach, keep, verify, transcripts, prose |
| D5 | The character laboratory: scaffolds by depth; the nine runnable examples | Nine passing examples | Built (Mission 17's laboratory, its examples run in the suite) |
| D6 | `kyrie stats` and `kyrie info <adventure>`; inspection of campaign content, origins, professions, regions, classes; diagnostics for empty sites, shallow characters, ineffective searches, unreachable outcomes | Demonstrated | —: `kyrie stats` and `kyrie info` not built; lint weighs encounters (CMB-12) |
| D7 | `kyrie play` interactive; `kyrie play <campaign.json>`; batch, direct-to-scene, save, resume, transcripts; one authority with the GUI; cross-interface saves | Save made in one, continued in the other | Built: `kyrie play` with steps, probes and saves; a browser save kept as a test (`kyrie keep`); one save made in each and continued in the other not shown |
| D8 | `kyrie bench` (or `--profile`) by phase, fixed seeds, fixtures, traces, machine-readable, history; distributions and slowest operations; large worlds and long sessions | Bench output and history | Begun: scripts/bench.ts and the performance standard; `kyrie bench` not built |
| D9 | Architecture repairs by severity: registries, scenario knowledge in runtime, process-global caches, id patterns, identity in strings, companion models, two-team combat, presentation privilege, saves, replay, errors, precedence, performance, module boundaries | Register rows | Begun: see the ARV, COR and AUT rows of the register |
| D✓ | An independent author scaffolds an adventure with custom items and generated content, launches a complex NPC or scene, inspects choice conditions, saves a trace, installs beside others, with no engine edits; terminal and GUI agree; performance and diagnostics catch regressions | — | — |

## Gate E: long careers, extraordinary worlds, literary breadth

| Req | What | Status |
|---|---|---|
| E1 | Orsino's inheritance accounted for (backgrounds, professions, specialisations, feats, skills, equipment, monsters, abilities, effects, spells, conditions, formations); distinct mechanics kept; party formations (Clerical Synod, Academy, Free Fellowship …) operational and socially recognised; the clown's mimicry and the mirror mage's reflection | Built: the Orsino registry and the handbooks (PHB, DMG, MM) account for the inheritance |
| E2 | Multi-stage careers (knight or berserker, thespian, physician); professions open actions, access, interpretation; capstones | — |
| E3 | Companion arcs: histories, goals, obligations, relationships, futures; trust, promises, disagreement, reconciliation; relationship capstones; learned against cooperative; optional chaste romance | — |
| E4 | The planes and the House of Doors from Orsino and Imbar's lore (the Virina, the Varakiiri, the Kiritarun); common planes shared by modules | Built: the canon's planes and House of Doors (data/imbar), shared by the Grand Tour and Behind the Wainscot's world |
| E5 | The elemental grand tour: distinct planes, parts of an artifact, the upper House of Doors unlocked | Built: the Grand Tour integrated as a province, its planes the canon's (OWN-36..38 partly) |
| E6 | The Great Desert, the Underground Sea, the Ocean and Sunken City, the Planar Grand Tour, as supermodules (only once A–C are genuinely complete) | — |
| E7 | One chronology, cultural calendars, seasons, festivals, markets, deadlines, schedules; events placed in real seasons; preparation, interruption, aftermath; deterministic warm-up; institutions working offscreen | Begun: seasons, a calendar, days and festivals in the generated country |
| E8 | Art and culture as play: works, a troupe's repertory, rehearsal, venue, performance; thespian and troupe formations; works remembered, criticised, adapted | Begun: works and repertories in the authored adventures (the Lull, Gosse's Company) |
| E9 | Physical semantics: vessels, substances, quantities, transfer, mixing, breaking, repairing; authorable materials; flora and fauna by properties | — |
| E10 | Literary variety (comedy, tragedy, satire, romance, mystery, debate, intrigue, horror, domestic, art, adventure, epic); a large battle as part of a wider conflict | Built across the authored adventures (comedy, satire, tragedy, mystery, debate) |
| E11 | The Encyclopedia of Imbar from the title: classes, backgrounds, professions, paths, species, flora, fauna, spells, monsters, artifacts, cities, planes, history, religion, institutions; derived from data; player reference kept apart from what the protagonist knows | — |

## Gate F: verification through complete experience

| Req | What | Status |
|---|---|---|
| F1.1 | The first fifteen minutes | Played (1–2 November, the first town) |
| F1.2 | An actual shared country, several adventures advanced by one protagonist | — |
| F1.3 | POI richness in city, road and wilderness | Begun (the first town and its works) |
| F1.4 | Geographic perception: noticed, surveyed, identified, recorded, chosen, reached | Played: a tower climbed, sights recorded on the map |
| F1.5 | An ordinary expedition | Played (the catacombs expedition) |
| F1.6 | Solo novice combat: warrior, mage, thief and other callings | Simulated, not played (doc/history/missions/18/novice-viability-closure.md): see C6 |
| F1.7 | A substantial NPC: several exchanges, a question asked, answers remembered, consistent action | — |
| F1.8 | Character-specific progress opening a new capability | — |
| F1.9 | A living civilization acting independently, its consequences met | — |
| F1.10 | Independent authoring with only public facilities | — |
| F1.11 | Interactive terminal play, GUI/terminal save parity, reproducible performance reports | — |
| F1.12 | Extended engagement: independent cold play and owner play | — |
| F2 | Long-horizon and cross-module verification: offered-action autoplay, traces, minimisation, replay, no collisions | Begun: offered-action autoplay and wanderers per adventure, kept traces replayed and re-digested (scripts/redigest-trace.ts, test/traces.test.ts), collisions said in one load; no minimisation |
| F3 | Boredom, pull and productive interaction measured | — |
| F4 | Performance and scale before and after | Begun: the performance standard (performance.md); a session's start 11 s to 3 s, a drawn country's lint 57 s to 12 s (4 November); no before-and-after report at scale |
| F5 | The final register and report | Built: the register (568 rows, none open), the closure report, and the handoff for Mission 19 (handoff.md, handoff-supplement.md) |

## At the close, 4 November 2026

**Mission 18 is closed, not complete.** No requirement is **Accepted**: the gates that ask for the owner's word (A,
and C and F through play) have not had it, and the owner's verdict on ordinary play of 3 November was negative.
Every requirement below that is short of Played or Built has a disposition, so nothing is carried silently; the
register's matching rows are Wishlist with what each needs ([wishlist.md](wishlist.md)), and [handoff.md](handoff.md) and
[handoff-supplement.md](handoff-supplement.md) say what Mission 19 should take first.

| Req | State | Disposition |
|---|---|---|
| A1–A3, A6, A✓ | Played or Built; the owner's verdict outstanding; no real tablet | Carried: the owner's review, on the supplement's reference journey; a tablet pass |
| B2 | Not begun (the City of Seven Towers) | Aspiration: after one loop is good (the supplement's order) |
| B3 | Begun (Imbar's canon; no atlas of lands) | Aspiration, with OWN-80's boundless map |
| B4 | Built, not documented as one semantics | Carried: a document of placement |
| B6 | Played; companions identifying not shown | Carried, small |
| B✓ | One protagonist through three adventures not played | Carried (NAV-10) |
| C1 | Density baseline not measured | Carried: the measure |
| C6, F1.6 | Simulated, not played; lone casters die | Carried, a defect (PT-11, SYS-05) |
| C7 | Morale and surrender not built | Carried (REV-16) |
| C9, C✓ | A noncombat character and a sustained conversation not played | Carried (IND-05, F1.7) |
| C10 | Long play not measured | Carried (IND-07) |
| D3 | About 35 TypeScript writers still emit content | Carried: the first migration (handoff §10) |
| D6, D8 | `kyrie stats`, `info`, `bench` not built | Carried |
| D7 | A save continued across terminal and browser not shown | Carried (F1.11) |
| D9 | Architecture repairs begun | Carried: the register's ARV, COR and AUT rows (Wishlist) |
| D✓, F1.10 | An independent author's run not done | Carried |
| E2, E3, E6, E9, E11 | Not begun (careers, companion arcs, supermodules, physical semantics, the Encyclopedia) | Aspirations |
| E7, E8 | Begun (seasons and festivals; works and repertories) | Aspirations |
| F1.2, F1.7–F1.9, F1.12 | Not played (several adventures by one protagonist, a substantial NPC, character progress, a civilization's consequences, extended independent play) | Carried: Mission 19's plays |
| F1.3 | Begun (the first town's density) | Carried, with C1 |
| F2, F4 | Begun (autoplay and traces; performance measured in parts) | Carried: minimisation; a before-and-after report at scale |
| F3 | Not begun (boredom, pull, productive interaction measured) | Carried |

What is done: phase 0 (the register reconciled), the interface built and played (A), every adventure one country's
province with one clock and canon (B1, B5, B7, E4, E5), the ordinary loop's first town played end to end (C1 to C5,
C8, F1.1, F1.4, F1.5), the language review, the tools and the laboratory (D1, D2, D4, D5), and the register and report
(F5).
