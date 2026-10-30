# What stops Kyrie from being as enjoyable to inhabit as it is ambitious to describe

Independent systemic-play review, 30 October 2026. Reviewed at `d13991d`, with the working tree's unrelated asset
changes left untouched.

## Scope and standard of evidence

This is a review of conversion: how reliably Kyrie's authored adventures, simulation, rules, generation and interface
turn a player's chosen attention into worthwhile play. It is not a count of implemented features and not a code-quality
audit.

Evidence has four grades:

1. **Current ordinary play:** choices made through the current built application or its identical offered-command
   interface, without state injection. The current build was rebuilt and sampled as fresh generated campaigns. The
   first arrival at Mistcastle and its chandlery are new observations for this review.
2. **Recorded ordinary play:** browser records with exact text, screenshots and saves in `doc/playtests`, especially
   `play-structure-2026-10-26`, `exploration-2026-10-29`, `pellam-frost-fair-2026-10-29`,
   `living-world-2026-10-21`, and `product-2026-10-19`.
3. **Builder-directed demonstrations:** useful proof that a path exists, but not evidence that a newcomer would find
   or want it. These are identified as such.
4. **Architecture and measurements:** source and engine measures used after play to test whether a symptom is systemic
   and to locate its cause.

The requested real-browser rerun was blocked in this environment because the installed Chromium lacks `libnss3.so`.
The application was nevertheless rebuilt successfully, and current play was conducted through the terminal's shared
runtime and presentation choice model. Visual judgments rely on the browser captures from the previous day. This is a
material limitation: it prevents a fresh independent verdict on animation, touch and the newest visual creation flow,
but not on the current commands, prose, economy, geography or state transitions.

## A. Executive diagnosis

Kyrie's central problem is **not a lack of mechanics or content. It lacks a dependable situation-composition layer**.
The engine computes everything legal; modules contribute places, people and facts; the interface groups the resulting
commands. But no single authority usually answers the player's more important question: *given what I perceive, what I
am trying to do, and what is changing now, what are the few meaningful possibilities?*

Consequently Kyrie often presents a simulated world's inventory rather than staging its activity. The player sees a
large union of destinations, people, possessions and generic verbs, while the connections that could make one of them
matter remain in prose, hidden facts, a remote journal, or author knowledge.

The eight principal obstacles are:

1. **Legality is mistaken for affordance.** `ScreenModel` begins with all legal `PlayerView.choices`, adds unavailable
   skill and coin readings, and distributes them by target/exit/item. That is a sound authority boundary, but not a
   dramatic selection mechanism. In current play Mistcastle's first bailey exposed **45 choices**: 13 destinations,
   four waits, seven inventory operations, search, commerce, talk and local acts. Most were valid; very few answered an
   intention a newcomer had formed. The result is overload without agency.

2. **The world model represents state more readily than situations.** An occupation can assign a role, a planner can
   move someone, a clock can fire a rule, and a relation can record knowledge. None guarantees an observable activity
   with a beginning, pressure, possible interventions and aftermath. World activity therefore alternates between
   excellent authored incidents and hidden state changes. People frequently become interfaces only when selected.

3. **Content modules share a runtime but not yet a world.** Thirteen adventures are still principally separate
   countries beyond marches; generated and authored settlements do not normally share residents, shops, institutions
   or geography. Module namespacing deliberately makes most identities private. The M18 design correctly identifies
   multiple private `imbar` entities and no canonical identity for planes, the House of Doors or the Infinite Library.
   A shared save is not composition when facts cannot address the same place or institution.

4. **Generated quantity outruns causal density.** The prior measured sample found exactly one large ruin in every one
   of 24 countries, but a third of narrated sentences appeared verbatim in at least 75% of countries. Towns and roads
   contain many entities and hooks, yet the meaningful combinations are concentrated in a few scenario kits and one
   dungeon. More POIs under the current scheme would increase menus faster than play.

5. **The reward economy still privileges one form of play.** The measured pre-M18 ruin held median 3,789 coin and
   treasure and 8,390 fight XP, 8.75 times the value of every shop's stock. The current treasure formula has been
   reduced and ordinary outfitting is much improved, but selling a valuable still grants its full worth as experience
   to every company member, and the game has not yet published a new whole-country economy measurement. Careers,
   service, performance, scholarship and relationships do not offer comparable capability-opening progress.

6. **Noncombat identities are descriptive before they are operational.** A bard, physician, scholar, trader or
   professional can have appropriate labels, skills and dialogue gates without possessing a repeatable livelihood or
   a distinctive way to transform a situation. The earlier ordinary sessions found no performance, trade or inn work,
   and one-click scholarship. M18 Gate C9 remains unbuilt. This is why a large character system can still yield a
   warrior-shaped campaign.

7. **Navigation has gained genuine geography but has not been reconciled with local navigation.** The new wilderness
   loop—leave town freely, cross unknown terrain, survey, see a tower, set out for it, retain the discovery—is real and
   promising. Yet settlement and interior movement remain lists of named passages, and places may appear under several
   descriptions or at multiple semantic levels. The map answers *where in the country* while the scene still often
   fails to answer *what in front of me is worth doing*.

8. **Resolution too often terminates intention instead of creating consequence.** The best play produces return,
   recognition and altered opportunity. The ordinary baseline repeatedly ended with “Nothing more is asked of you,”
   unchanged NPC behavior, or rewards with no new use. A persistent fact is not itself a consequence; it must change a
   later perception, choice, relationship, route, price, danger or ambition.

These are mutually reinforcing. A thin situation makes the interface rely on lists; lists make generated repetition
visible; weak composition prevents consequences crossing modules; weak rewards leave the player without a durable
ambition; without an ambition, every legal command becomes a peer again.

## B. Boredom and ordinary economy report

### The current first hour

The new creation flow appears materially quieter in the latest browser records: life-reason, ancestry, calling,
tradition and name are staged as centered choices, and spell traditions reveal actual starting spells. That is a real
improvement over the earlier rules form. A fresh graphical rerun was unavailable, so no independent aesthetic verdict
is given.

The first moment after creation remains structurally old. A fresh warrior arriving at Mistcastle read 142 words in a
single arrival: dog, yard, history, river confluence, strategic role, village economy, soldier, smith and castellan.
It was attractive prose, but it was a gazetteer plus cast list rather than a quiet dramatic arrival. The next screen's
45 commands erased the hierarchy the prose briefly created.

Pleasure came from specificity: Bolt barking “for form's sake”; a soldier mending the wrong boot when assigned other
work; sparks from Randal's wheel. Confusion came not from missing information but from the inability to tell whether
the castellan, the old workings, the inn, the smith, three wild-country edges or the thirteen other exits constituted
the beginning of play.

### Commerce and preparation

Ordinary supply availability is now a success. From the starting approach it took **two movement choices** to enter
Hugh's chandlery. In one place the player could buy rations, torch, candle, lantern, oil, rope, crowbar, sack, chalk,
bedroll, waterskin, bandages, pole and spikes. The warrior bought food, light, rope and a crowbar in four direct acts.
Pellam likewise placed a chandler at the first booth on the ice; a lantern reduced the purse from 26 to 20.

This repairs “an elaborate market in which one cannot buy a torch.” It does not yet establish a healthy adventuring
economy:

- Prices are visible and transactions are direct, but services and sellers are still discovered through place lists
  unless an authored place explicitly summarizes them.
- Finite merchant purses and specialist buyers are useful friction. Yet treasures still tend to become coin and XP
  rather than equipment, knowledge, leverage or obligations.
- Preparation matters strongly where authors connect it to obstacles: torches in Holt keep, rope down Silkholme,
  pole or trapwork in a ruin, crowbar at a blocked mechanism. Elsewhere equipment is merely carried and multiplied in
  the Pack's actions.
- Successful adventuring opens levels and purchases, but not reliably a new profession, institutional role,
  relationship or style of action. Numerical capacity grows faster than the possibility space.

The material economy has therefore improved more than the **attention economy**. Buying the kit is easy once the
chandler is known; identifying which of dozens of controls matters remains expensive.

### Self-directed exploration

The 29 October browser journey proves a genuine new loop. A solo protagonist left Ramavor without a quest, chose a
compass direction, crossed unknown fells, surveyed from height, saw a square tower eight hours away, selected it on a
terrain map, reached it, returned toward town, and retained the revealed land. Terrain, distance, night and vantage
all participated. This is more than hex decoration.

It remains a proof of geographical agency, not yet a proof of sustained exploratory pleasure. The journey produced
one significant discovery—the tower—and the report itself records that wilderness meetings and small finds remain
absent. A seen site becomes a destination, but the country between origin and destination supplies little interaction.
The map creates the *promise* of discovery more consistently than generation supplies discoveries worth the trip.

### Solo and class-different play

The pre-M18 measured baseline was severe: in large-ruin fights a level-one warrior had a median 80% win rate, cleric
25%, thief 0% and mage 0%; 55% of hostile groups attacked without a warning turn. M18's current register still reports
7 of 17 solo mages falling in the first ruin. Every start now points a solo protagonist toward a cheap hire, which is
good mitigation, but it does not satisfy the requested test of a character intentionally adventuring alone.

The warrior enjoys the broadest support because brawn, armor, weapons and combat rewards recur everywhere. The mage
gets fascinating local moments—light budgets, inscriptions, oaths, prepared spells—but low health and abrupt threats
make ordinary independent travel brittle. The bard/social character gets the best authored experience at Pellam,
where Callow asks a public question and remembers the answer, but the generated world still lacks performance, trade
and repeatable social work. Solo play is technically allowed; for several callings it is not yet a reliably informed,
recoverable choice.

### Where boredom occurs

- **Confusing:** immediately after rich arrivals, when a long unranked action set replaces a dramatic lead; at
  interior transitions whose reversibility or spatial relation is not said.
- **Tedious:** repeated travel stops, repeated room props, restocking and inventory manipulation when none changes a
  plan, and conversations that must be opened to discover whether they contain anything.
- **Repetitive:** shared scenario kits, ambient lines, dens, tolls, raiders and dungeon coin props across generated
  countries.
- **Frustrating:** a natural verb exists elsewhere in the interface but not in context; a one-way passage looks like
  a stroll; a meaningful knowledge option is consumed by one failed roll; danger arrives without a decision point.
- **Empty:** generated places whose entities have roles and names but no current activity, and wilderness legs between
  discoveries.
- **Overloaded:** towns, character sheets and packs where every legal or reference-level fact competes with the next
  decision.
- **Unrewarding:** short origin threads, empty searches, social victories with no changed conduct, and treasure whose
  only future is conversion.
- **Mechanically opaque:** hostility timers, ambush protection, retreat odds, trap consequences and the difference
  between “known destination” and “known route.”

The genuine pleasures are equally diagnostic: a torch expiring at the casket; a dog revealing a cart's trail by the
mud on her paw; the persistent portcullis at Holt; a priest's oath paying in knowledge; Pellam's argument occurring
before a crowd; seeing a tower from the fells; returning to find the graveyard changed. In every case chosen attention
reveals a usable relation among multiple systems.

## C. Structural causality

| Symptom | Evidence | Deepest supported causes | Smallest systemic intervention |
|---|---|---|---|
| Many choices, little agency | 45 commands at current Mistcastle arrival; earlier town median 25 legal commands, 90th percentile 40 | Screen construction starts from the union of legal commands; grouping is by entity/verb, not perception, urgency or intention; reference and action share a scene | Add runtime-owned **affordance facets**: perceptible-now, responsive-to-current-aim, changing/urgent, familiar/reference. Stage only the first three; keep the full legal set one deliberate inspection away |
| NPC simulation is hard to feel | Occupations and schedules often yield cast lists; strongest counterexample is Pellam's scheduled crowd and trial | `at`, role, relation and planner goals describe state, not a public activity with phases, witnesses, interventions and aftermath | Introduce a small situation protocol over existing facts: invitation, pressure/clock, participants, local interventions, resolution, public aftermath. Do not add another global simulator |
| Natural intentions are unsupported | No generated performance/trade/work; inaccessible talk; generic Search required for obvious ruts | Verbs are action-schema-specific and appear only when an authored rule binds the exact entity; prose nouns carry no declared affordances | Let authored/generated observations attach a small semantic affordance set (`track`, `ask-why`, `use-light`, `perform`, `work`, `survey`), resolved through existing rules and capabilities |
| Adventures do not compose | Thirteen private countries; duplicated Imbar/planes; generated residents cannot enter authored institutions | Default namespacing protects modules by making identity private; geography is installed beside rather than into shared canonical entities | Complete M18 B1/B4/B7 and one-universe canon: shared place/institution identities, declarative placement, explicit exports and cross-module public events |
| Resolution produces drift | “Nothing more is asked”; three days of unchanged rumors after Coming Home | End states record completion but do not require a successor perception, changed relationship or newly possible action | Require each significant situation to declare at least one **aftermath surface**—who notices, what changes locally, and what new possibility or settled quiet results. Lint absence; do not require an endless quest chain |
| Procedural worlds feel alike | 33% of narrated sentences in at least 75% of sampled countries; fixed den/raiders/toll/buyer kits | Generation varies names and placement more than causal roles and interaction structures; common text is emitted late from shared templates | Rotate situation families, condition them on geography/economy/institutions, and measure repeated *interaction structures* as well as sentences |
| Rewards collapse variety | One ruin formerly 8.75× all shop stock; sale value also experience; noncombat rewards tiny | Independent tuning of dungeon, village economy and progression; reward mostly scalar | Publish a single reward budget by expedition scale; reduce sale-XP coupling; make major rewards open one route, technique, contact, office, recipe or interpretation before adding numbers |
| Exploration is spatially real but experientially sparse | Successful tower survey journey; only one significant discovery and little between | Terrain generation and site placement are ahead of encounter/situation density; map knowledge states not yet one canonical model | Populate travel with sparse, terrain-caused observations and situations, not more permanent POIs; finish one perceived/reported/visited/explored knowledge ladder used by map, journal and travel |
| Danger interrupts momentum | Current register: 7/17 solo mages fall; old 55% attack immediately; one-way and trap warnings inconsistent | Encounter temperament is systemic but poorly taught; generated sites assume party tools; failure sometimes removes adaptation | Guarantee a readable warning, scouting clue, preparation answer or reliable retreat for novice content; say one-way and risk before commitment; verify per calling through ordinary choices |
| Authorial depth is inaccessible | Hessel reach: 70/161 topics and 13/54 acts in 376 steps; Thrume 30/52 topics and 2/13 acts in 1,071 steps | Conversation is authored as conditional topic inventory; discoverability depends on exact state and selection rather than conversational initiative | Major NPCs should surface one question, contradiction or request themselves; track authored, offered, chosen and consequential dialogue separately |

### The simulation-to-experience gap

- **Occupation → visible work:** A role currently supplies a noun and sometimes a location. It becomes play only when
  work creates a material change, request, conflict or opportunity the player can observe. Randal's sparks are visible;
  his occupation does not yet constitute smithing activity the player can join, commission or interrupt.
- **Belief → conversation:** Beliefs become substantial when they generate claims, questions and revised conduct.
  Callow is a successful authored case. A topic menu that reveals lore but changes nothing is not.
- **Relationship → recognition:** The engine can retain relations, but ordinary payoff needs altered greeting,
  trust, price, access, aid, disagreement or initiative. Recognition should be a view over relation changes, not more
  bespoke thank-you lines.
- **Institution → opportunity:** An institution needs seats, membership, authority, services, schedules and conflicts
  addressable by shared identity. M18's canonical institution proposal is foundational; without it institutions are
  module-local scenery.
- **Site → discovery:** The new map and surveying now perform this conversion. The remaining gap is enough site-specific
  interaction and enough partial knowledge to create a reason to investigate.
- **Treasure → consequence:** Buyers and appraisal exist. Use, specialist desire, provenance, gifting and institutional
  claims are much rarer. Coin conversion is the fallback, not a satisfying universal meaning.
- **Profession → action:** This conversion largely fails outside combat callings. It belongs in M18 C9, not future
  career expansion.
- **World event → noticed opportunity:** Local “SINCE YOU WERE LAST HERE” and news work extremely well. Events that
  mutate facts without a witness, messenger, changed scene or later report do not exist experientially.
- **Completed adventure → lasting world:** Persistent local state works. Cross-module aftermath cannot work reliably
  until canonical identity and public event semantics are complete.

## D. High-leverage recommendations

Scores: benefit, confidence and scope are 1–5; difficulty is 1 (small) to 5 (large).

| Rank | Intervention | Benefit | Scope | Confidence | Difficulty | Dependencies |
|---:|---|---:|---:|---:|---:|---|
| 1 | **Situation/affordance projection:** runtime selects perceptible, urgent and aim-relevant possibilities from the legal set | 5 | 5 | 5 | 3 | Existing PlayerView, stakes, knowledge and choice authority |
| 2 | **Finish shared identity and placement inside M18** | 5 | 5 | 5 | 5 | B1/B4/B7 and one-universe design |
| 3 | **Aftermath contract for significant situations** | 5 | 4 | 4 | 2 | Events, knowledge sources, relations, successor links |
| 4 | **Balance one expedition across money, XP and capability rewards** | 4 | 4 | 5 | 2 | Current census rerun; C5/C6 |
| 5 | **Novice danger covenant by calling**: warning/preparation/retreat/recovery | 4 | 4 | 5 | 3 | Encounter temperaments, danger reading, shops/recruits |
| 6 | **Operational professions in generated situations**: perform, treat, study, work, trade | 4 | 4 | 4 | 3 | Situation protocol; reward budget |
| 7 | **Sparse causal wilderness events and partial discoveries** | 4 | 3 | 4 | 3 | Unified knowledge model; exploration loop |
| 8 | **Procedural rotation by causal role, with repetition measures** | 3 | 4 | 5 | 2 | Generator tables and measurement harness |

### Quick corrections

- On first arrival, show one distinctive observation, one sign of current activity and at most three promoted acts.
  Keep “all ways” and “all present” inspectable.
- Mark every one-way, irreversible or danger-advancing choice before activation.
- Put contextual spells and usable gear beside the obstacle or fight they answer; Pack remains the reference view.
- Make major NPC initiative visible without first opening a topic inventory.
- Re-run the economy census after the reduced treasure formula and publish ruin/shop, expedition/service and XP/capability
  ratios. Do not claim the economy repaired without it.

### Medium redesigns

- Add situation and aftermath metadata using existing rules, not a parallel quest system.
- Give every origin and every resolved common situation a local aftermath, a successor possibility, or an explicitly
  satisfying settled state.
- Build three generated noncombat loops end to end (performance, medicine, trade or scholarship), each with preparation,
  uncertainty, social/material consequence and capability progression.
- Use current aims/stakes to rank actions; let the player state or pin an aim when the game cannot infer one.

### Fundamental M18 architecture

- Canonical world identities and shared institutions.
- Declarative geographic placement into one principal country.
- One knowledge model from perceived through understood, shared by map, journal, dialogue and travel.
- A runtime-owned perceived/affordance view so presentation neither reads omniscient truth nor dumps every legal action.

None requires an engine rewrite. They refine the boundary between the authoritative world and presentation and make
module composition explicit.

### Verification

For each intervention, measure outcomes rather than implementation:

- first meaningful intention formed within five minutes by a cold player;
- promoted choices versus full legal commands at each decision;
- proportion of selected actions that advance, revise or deliberately abandon the current aim;
- authored dialogue: written / legally available / visibly offered / chosen / conduct-changing;
- time and actions from wanting ordinary kit to possessing it;
- significant discoveries per hour of unquested exploration;
- returns with a changed perception, relationship, route, service or opportunity;
- solo novice survival/retreat across callings, with the warning and preparation path included;
- cross-module consequences observed without module-specific glue.

## E. Three reconstruction demonstrations

### 1. A satisfying ordinary expedition

At breakfast the innkeeper does not list nine rumors. She points to wet ash on a carter's sleeve: the north ford's
beacon failed in the storm, and a medicine cart has not arrived. The player may ask the carter, inspect the ash, or
ignore it. Asking establishes distance, water and darkness; the chandlery is named because the intention now requires
light and rope. A physician recognizes the delayed medicine; a bard knows the beacon keeper's guild song; a warrior
can help move a fallen spar.

The map shows the known road and an uncertain floodplain, not every remote destination. En route, rising water offers
a choice caused by terrain: spend rope, detour before dark, or seek the ferryman whose smoke is visible. At the beacon,
physical evidence supports several explanations and approaches. Failure costs time or equipment but reveals something.
The reward is coin plus a guild introduction and knowledge of an old service stair into the ridge. Back in town the
cart arrives, patients appear at the herb-shop, the innkeeper recognizes the company, and the stair becomes a new
ambition. Every system participates in one course of action; none needs a special quest marker.

### 2. A truly inhabited settlement

Arrival shows a mill wheel stopped while three people argue beside it. Bells indicate market opening. Smoke and sound
distinguish working smithy, kitchen and shrine. The scene promotes: listen to the mill dispute, ask the gate child what
the bell means, or go to the inn. “Look around” reveals services and ways without turning them into forty peers.

Residents have routines because their work produces public states: the baker needs flour while the mill is stopped;
the smith delays a repair; the reeve must decide who gets the remaining water. Relationships affect who speaks for
whom. The player can work, buy, perform, treat, investigate or simply watch. At dusk the market closes, a rehearsal
begins, and travelers bring news. Returning days later, resolved matters have mundane aftermaths: bread is dearer,
someone remembers assistance, a repaired tool is ready, and a newcomer has taken the vacant stall. Quiet places remain
quiet, but their quiet has intelligible causes and possible uses.

### 3. Free wilderness exploration that creates goals

The protagonist leaves by no quest. Nearby land is partly known; mist conceals what has not been seen. From a ridge,
three different kinds of evidence appear: smoke beyond a wood, unnatural white birds circling a sink, and dressed
stone in a river bend. Skills and weather change identification, not existence. Choosing the birds crosses boggy land,
uses a pole, and reveals tracks that avoid the sink.

At the sink the player finds a dropped survey token and hears water below. Investigation can stop there with a useful
map annotation, descend with rope, or carry the token to a known surveyor. On return, asking about it identifies an
abandoned water project and a missing crew; the smoke may meanwhile have moved. Exploration has created two goals
through attention, and what was ignored remains a changing possibility rather than a failed quest.

## F. Required-study accounting and comparative measures

| Required study | Evidence | Result |
|---|---|---|
| Fresh character's first hour | Current Mistcastle start; six-session cold baseline; latest creation captures | Strong specific prose and improved creation; immediate overload and weak prioritization persist |
| Solo expedition: preparation, commerce, danger, return | Red Crag product record; March/Holt; current commerce check | Full loop can be excellent; current generic solo viability is not reliable across callings |
| Self-directed wilderness, no quest | `exploration-2026-10-29` | Geographical loop works; one major discovery, sparse intervening play |
| Extended authored urban adventure | Pellam and product urban records; reach census | Authored depth is high, ordinary accessibility much lower; no fresh independent long urban run |
| Significant social/intellectual encounter | Callow at Pellam | Strong beginning and remembered answer; multi-person sustained debate remains incomplete |
| Noncombat livelihood/profession | Attempted bard/scholar baseline; M18 C9 status | **Unavailable as a repeatable ordinary activity; finding, not substituted** |
| Return after meaningful world time | Holt keep and validation return | Strong local persistence and news; renewal uneven outside clocked authored situations |
| Cross independent modules in shared campaign | Existing marches and validation travel | Travel between modules exists; shared settlement/institution/consequence does not. **Required composition study presently impossible** |

Useful current/baseline quantities:

- ordinary supplies: two movement choices from a fresh approach to full chandlery; four direct purchases for food,
  light, rope and crowbar;
- current first settlement: 45 legal commands after arrival;
- generated baseline town: median 25 legal commands, 90th percentile 40;
- wilderness demonstration: one significant discovered tower in the recorded session;
- Thrume reach: 33/85 rooms, 20/35 people, 30/52 topics, 2/13 acts after 1,071 steps; zero mute NPCs;
- Hessel reach: 37/42 rooms, 22/30 people, 70/161 topics, 13/54 acts after 376 steps; zero mute NPCs;
- repetition baseline: 33% of narrated sentences present in at least 75% of sampled countries;
- old economy baseline: median large-ruin loot 3,789, fight XP 8,390, 8.75× whole-country shop stock;
- current register: 7/17 solo mages fell in first-ruin audit;
- persistent cross-module consequences observed in ordinary play: effectively zero, because composition is not built.

## G. Implications for M18 and M19

The following are unfinished M18 foundations and must not be relabeled as expansion:

- A4/A5/A7/A8: quiet, distinct compositions and a runtime-owned perceived/affordance view;
- B1/B4/B5/B7: one country, declarative placement, knowledge states and cross-module state;
- C1/C3/C5/C6/C8/C9/C10: productive density, physical affordances, economy, solo viability, conversational depth,
  noncombat life and renewal;
- F1.1–F1.12, especially cold extended play and the ordinary expedition;
- the representative expedition repair required by OWN-28.

M19 may properly expand careers into multi-stage arcs, add broad cultural calendars, construct distant planes and
supermodules, and deepen physical substance simulation **after** the M18 conversion path works. M19 should not inherit:
ordinary performance, buying gear, recognizable aftermath, basic shared identity, contextual action presentation,
novice retreat, or one coherent country. Those are prerequisites for expansion to be enjoyable rather than merely
larger.

## H. Why it does not yet feel like a game

The diagnosis can be stated more sharply: **Kyrie has rules for the states of an adventure, but no dependable grammar
that turns those states into a repeatable game loop.**

A game loop is not merely “town, wilderness, dungeon, town.” Each transition must do a particular job:

1. A perceptible disturbance or opportunity creates a desire.
2. The desire becomes a located, intelligible objective.
3. Preparation lets the player make consequential predictions.
4. Travel asks for navigation or resource decisions and changes the context.
5. The site has an inside whose structure can be learned and exploited.
6. Investigation and risk yield information, access, resources and reversals.
7. Extraction asks what to carry, abandon, protect or promise.
8. Return converts the expedition into money, recognition, recovery and new capabilities.
9. Those gains make a previously impossible or unknown ambition possible.

Kyrie can perform every one of these operations somewhere. It does not enforce the connections among them. The
ordinary loop therefore behaves less like a wheel than a tray of parts.

### The three incompatible content pipelines

The current generator builds adventure material through three main paths:

| Pipeline | Usually provides | Usually omits |
|---|---|---|
| Scenarios: den, brood, fever, drover, tower | Lead, aim, immediate stake | A substantial interior; a den is commonly one exterior room |
| Historical works: halls, keeps, galleries, deep mine/barrow/cistern | Interior, history, gates, inhabitants, treasure | A nearby reason to care; a player-facing objective; alternate keys to every gate |
| Installed kits: raider hold, toll road, bounty | Authored stake, interior, parley or alternate solutions | A generated-world lead, map position, aim and aftermath unless the kit supplies each specially |

This separation is not accidental. The assembler contains the rule that a scenario claims a newly generated plain
site rather than one of the makers' works. Purpose and structure are therefore prevented from composing. The
ordinary-expedition record demonstrates the outcome exactly:

- The most strongly advertised destination, Thorn Hole, had an aim and enemies but no inside. “A dark mouth opens in
  the hillside” was followed by no inward passage. Search found nothing.
- The actual delve at Gaudumport had a riddle door, trap, dark hall, guardian, hob warren and captive, but was revealed
  by a drover's incidental “country off the road” topic. It produced no aim.
- The starting town visibly lacked its bell; Gaudumport displayed stolen bells; the captive explained that hobs could
  not abide bells. Those authored facts never formed a recognized course of action or a return payoff.

This is the basic reason “find a deep dungeon” is not articulated. The country does generate one deep site, deliberately
placed in wild country. But generation does not guarantee a local lead that becomes an aim, a route the player can
understand, a novice-appropriate first layer, or a town consequence for returning from it. The deep dungeon exists as
world inventory, not necessarily as a game proposition.

The correction is not to add another quest system. Define one **expedition contract** that every scenario, work and
kit must satisfy or explicitly decline:

- `lead`: how ordinary play first perceives it;
- `aim`: what desire the lead supports without prescribing one solution;
- `place`: where it is and what partial route knowledge is granted;
- `threshold`: what entering commits the player to;
- `inside`: at least one spatial or causal development beyond the threshold;
- `answers`: at least two materially different ways through the principal early obstruction, or a discoverable source
  for the missing answer;
- `yield`: information, resource, person, route or object worth extracting;
- `aftermath`: who or what changes on return;
- `successor`: a new possibility opened, or a deliberately final settled state.

The world audit should report each field separately. “The module loaded,” “the room is reachable with injected state,”
and “a player can complete the expedition” are different claims.

### Why Search feels empty

`Search here` is a universal action offered once in every lit place. It spends twenty minutes, sets
`searched(company, place)`, and always returns the same neutral sentence. **The action itself has no discovery table,
degree of success, clue guarantee, skill interaction, or local summary.** Payoff exists only if some independently
authored fact watches for `searched(...)` at exactly that place.

Some deep-room history and site tracks do attach such consequences. Most places do not. This creates four play-feel
problems:

1. The interface offers Search everywhere, falsely implying that everywhere has search content.
2. Failure and “nothing was authored here” are indistinguishable.
3. A productive Search and a barren Search cost the same time and look identical until a subsequent observation fires.
4. Because important discoveries sometimes require the generic action, players learn to search every room
   superstitiously. The result is administrative tapping, not investigation.

Search should not be a universal lottery. Two related interactions are needed:

- **Examine a perceptible cue:** tracks, cold air, disturbed dust, a hollow wall, bones with beads among them. The
  player acts because attention found a reason. Skills and tools change interpretation and safety.
- **Sweep an area:** a costly fallback used when the player suspects something but lacks a cue. Before committing, the
  UI says the search scale and likely yield (“a small chamber; twenty minutes”). Its result must say either what was
  found or why the player can confidently stop looking.

Generation should count searchable cues and guaranteed search yields, not merely hidden items. A useful acceptance
measure is: among the first twenty Searches chosen by an uninformed player, how many reveal a new actionable fact,
object, route or confident negative? If the answer is low, the action should not have been promoted.

### Why the wilderness feels thin despite a working map

The terrain system now supports real movement, sight, surveying and retained map knowledge. That is the spatial
chassis of a game. Its content model still treats most of the wilderness as connective tissue between permanent
sites. A generated sample contained eleven sites—five caves, three mines, two ruins and a tower—plus settlements and
roads. The count is not tiny. The experiential density is, because:

- several sites are one-room scenario vessels;
- several historical works have no nearby motive;
- discovery changes the map more often than it changes a plan;
- travel compresses hours into prose unless a preinstalled scenario happens to interrupt it;
- ecology rarely produces a choice about tracks, weather, camp, foraging, avoidance, pursuit or changing routes;
- seen landmarks have only a small set of visual/functional identities.

The missing unit is not primarily another POI. It is a **wilderness turn with a decision**. Each meaningful stretch
should sometimes ask one of a restrained set of questions: press on or camp; high route or sheltered route; follow a
sign or keep the bearing; spend a tool or time; approach travelers or avoid them; mark a partial discovery or
investigate now. The result should update position, supplies, knowledge, risk or a moving situation. Quiet stretches
can remain quiet; their value comes from contrast and anticipation, not from an uninterrupted travel log.

### Why treasure has no satisfying future

The rules support buying common goods and items, selling valuables, lodging, healing, resurrection, hiring a traveler,
level development and rare authored teaching rewards. That sounds like an economy. The missing piece is a compelling
choice about what success enables.

In the generated world:

- a chandler now solves replenishment well;
- towns may draw an arms, remedies or rare shop, but the stock is random and not tied to ambitions formed in play;
- every merchant buys generic valuables within a purse limit;
- selling treasure also awards experience, making liquidation the dominant interpretation of treasure;
- a recruit costs roughly three to several coins once, with no wage, share, loyalty investment or equipment decision;
- a generic training action exists, but generated residents do not ordinarily declare abilities they teach;
- level development is largely automatic expenditure of earned XP rather than a town-facing choice among mentors,
  institutions or projects;
- there is no general property, expedition sponsorship, research, crafting commission, institutional access, troop,
  transport or settlement-improvement economy.

Thus the return phase lacks a strategic question. Food, light and lodging are too cheap to absorb a successful delve;
rare magic stock is occasional rather than an aspiration system; companions are inexpensive acquisitions rather than
relationships; and training is represented in rules more than distributed through the world.

The smallest useful redesign is a **capability market**, not a larger commodity list. Every substantial town should
offer two or three expensive, visible possibilities connected to its identity:

- a mentor who teaches a technique or opens a skill after proof and payment;
- a specialist who can identify, alter or use a class of treasure;
- a hireling or companion whose continued service asks for a share, equipment or a fulfilled aim;
- an expedition asset such as pack animals, a boat, guide, survey, permit or safehouse;
- an institutional threshold: membership, library access, workshop, shrine rite, guild standing;
- a commission whose result changes an item rather than merely buying a higher number.

These are sinks only secondarily. Their purpose is to let the player say: “because I returned with this, I can now
play differently.” A good reward opens a verb, route, relationship or interpretation.

### Why the interface prevents play-feel

The UI does not merely display the loop badly; it suppresses the feedback rhythms by which the loop would be learned.

`ScreenModel` takes the complete legal command set, adds unavailable skill/coin actions for explanation, and groups the
result by people, things, exits, party and inventory. This answers “what commands can the engine resolve?” It does not
answer “what changed, what threatens me, what serves my aim, and what deserves inspection?” The CLI exposes the same
underlying truth even more plainly: it is excellent for matching or inspecting commands, but it has no dramatic
hierarchy and cannot diagnose whether the player would notice the lead.

The missing play-feel loop is moment-to-moment:

1. **Anticipation:** a visible promise or threat.
2. **Commitment:** the player understands cost and chooses.
3. **Immediate response:** animation, sound, prose and state clearly acknowledge the act.
4. **Mechanical explanation:** risk, roll, resource or condition changes are legible.
5. **Changed possibility:** the next screen is materially different and foregrounds why.

Kyrie frequently collapses steps 1–4 into a button and a paragraph, then rebuilds another large legal-command list.
Examples include a Search that says only that a search occurred, a successful warning that leaves robbers visibly
unchanged, a truce that ends without a stance change, danger hidden below a journey log, and a one-way route presented
like an ordinary exit. Even correct rules feel inert when the presentation does not give them anticipation and impact.

The right UI primitive is a small runtime-owned **decision frame**, not another layout restyle:

- `now`: the most important changed or threatening fact in the current moment;
- `aim`: the one or two current intentions affected here;
- `acts`: at most three promoted actions, each with commitment/cost;
- `inspect`: perceptible cues that can reveal more;
- `reference`: all other people, ways, inventory and known destinations, deliberately opened.

After an action, the frame should explicitly show `attempt → result → changed state → newly relevant act`. The full
legal command set remains available for simulation freedom, but it stops defining the composition of every scene.

### What should be built first

Before adding wilderness quantity or more shops, reconstruct one complete loop and use it as the architectural test:

1. Start with the bell-and-hobs expedition identified by the current M18 diagnosis.
2. Make the missing bell itself create a lead, located aim and map knowledge.
3. Ensure the road includes one preparation-relevant choice and truthfully previews danger.
4. Give the hold a legible plan, more than one key to its first obstruction, cues with productive examination, and a
   recoverable retreat.
5. Let the company extract the boy and bell, with burden or hostile-route consequences.
6. On return, let the bell be rehung, the town recognize it, the boy's home become another located intention, and a
   concrete new capability become purchasable or earnable.
7. Render the whole journey through decision frames and measure hesitation, scrolling, barren actions and state-changing
   choices.

Then generalize the expedition contract to every scenario, work and kit. This order matters. More wilderness sites,
treasure or equipment added before the contract and decision frame will enlarge the inventory of disconnected things.
Once the loop exists, the current generators and authored library become a large supply of material for it.

## Conclusion

Kyrie is already enjoyable in several carefully composed sequences. That fact rules out both pessimistic diagnoses
(“the engine cannot do it”) and additive ones (“it needs more content”). Holt, Pellam and the new wilderness survey
show the ingredients: specific perception, a legible intention, several systems bearing on it, feedback that explains
the result, and a return that changes what can happen next.

What stops the rest of the world is that these relations are usually authored incident by incident while the default
architecture exposes state and legality. The highest-leverage change is to make **situations and affordances** a shared
output of simulation and content composition: what is happening, why it matters here, what the player can meaningfully
try, and what later surface will carry the consequence. Complete that together with canonical shared identity and a
balanced expedition economy, and Kyrie's existing abundance will begin to reinforce itself instead of competing for
attention.
