# Bells Under Blackvein — first integrated campaign

Run `bun run web:dev`, select **Bells Under Blackvein**, seed **bells**. The static build also opens
from `site/index.html`; no server, narrator service, or network simulation is required.
The CLI uses `bun run kyrie campaign data/blackvein/campaign.json bells`; exported transcripts run with
`bun run kyrie replay transcript.json`.

## Campaign design and dependency map

Blackvein depends on wages from reopened workings. Caldus seeks road security and mining revenue under a
purchased deed. Ada needs employment but will protect her workers when presented with reliable evidence.
Iven measures the rising water. Len has fled both the underground bell and Caldus's claim. Their interests
intersect at a real workplace rather than a common delivery objective.

```
shared campaign / creatures / discovery / planner / browser session (reused)
  -> local, conditional observations + compact saves
  -> eleven-place explorable town and mine
  -> evidence changes NPC commitments; ordinary mechanisms change physical access
  -> offscreen claims, extraction, seepage and displacement
  -> reopening after closure; independent political and environmental aftermath
  -> contextual variation + contrasting histories + host parity
```

Reuse: canonical generation and creature store; combat projection/commit; one campaign clock, world and
save format; typed actions; discovery provenance and trusted communication; bounded goal selection;
module namespacing; the browser/CLI PlaySession. No second campaign or combat runtime was introduced.

Refine: location presentation, chronicle, legal-action scan, browser checkpoints, dead-recipient handling,
and repeated reports. New bounded mechanisms: `Observe`, `Pursuit`, and watch-driven `Rule` declarations,
all in the existing Kyr grammar and semantic model. No institutional simulator or dialogue interpreter.

## What can be played now

The south road reaches the square; the square connects the inn, countinghouse, shrine, checkpoint and
ridge. The ridge reaches the mine and Len's hollow. The pumping gallery and buried bell chamber form the
adventure site. A discoverable ventilation crawl bypasses its combat encounter. Exits remain usable after
closure, occupation and disaster.

| Situation | Interventions and actual consequences |
| --- | --- |
| The competing deeds | Support Caldus to accelerate his enforcement. Compare the displayed deeds and tell him the charter to withdraw his mine mandate while retaining his road objective. Occupation excludes unsupported travelers from the direct mine road and transfers existing miners' coins to his canonical purse. The ridge remains usable. |
| Len and the old workings | Find his account or his independent pump warning. Tell Ada what happened; she closes the bulkhead and then travels to the inn. Show Len the charter and he comes home with evidence of his rights. Learning it yourself does not inform him. His written evidence remains where he left it. |
| The rising water | Unchecked, the active striker spoils the well at watch 30; at watch 42 continued exposure drives Iven to shelter and empties the square. Close the bulkhead to contain it, or reach the chamber and dismantle the striker. Existing contamination is retained. |

The missing-person investigation gives access to the safety conflict. Showing Len the charter changes his decision
to return. Closing the mine prevents contamination but displaces its workers. When the bell's publicly
perceptible vibration stops, Ada can return, check the bulkhead and reopen it. Unopposed Caldus can then
appropriate the reopened mine. Death removes his ability to enforce; it does not erase his body or regenerate him.

## Author-facing source and semantics

Start with [blackvein.kyr](../data/blackvein/blackvein.kyr): geography, characters, historical propositions,
competing pursuits, causes, and local presentation are together. For example:

```kyr
Pursuit protect_workers for ada priority 30
  when knows(ada, danger) and functioning(bell) seeks closed(shaft).

Rule seepage when watch(clock) >= 30 and functioning(bell)
  and not closed(shaft) and not tainted(shrine) {
  Assert tainted(shrine).
}

Observe foul_well at shrine when tainted(shrine)
  "An oily black film covers the well. The water already drawn is spoiled even if the bell is silenced now. Iven's evacuation threshold is watch 42. Cutting off the source can still prevent further flight.".
```

- **Observe** stores a typed place, predicate and authored text. Only a capable player at that place sees it
  when its predicate is true. It grants no `knows` fact. Numeric references such as `{enforceAt(vey)}` are type-checked measures, scoped with the module and rendered from current state. Event records retain the observations actually
  perceived at command completion and formal discoveries made; the chronicle does not retroactively narrate current truth as past experience.
- **Pursuit** supplies an existing actor's priority, applicability and target to the existing bounded planner.
  It neither creates a creature nor grants actions. Available actions and horizons remain controller data.
- **Rule** evaluates once per watch, in source order, after NPC opportunities and before the existing pressure
  check. Each matching rule executes one existing atomic World transaction. Later rules see earlier effects;
  there is no fixpoint, inferred narrative outcome, or automatic once-only behavior. Explicit predicates latch
  irreversible changes. Canonical currency updates use the same commit path as actions. Rules cannot write
  creature projections, campaign clocks/records, established historical truths, or discovery knowledge.
  An exception rolls back the entire player command, including intervening NPC/process effects.

The reusable capabilities in [capabilities.kyr](../data/rulesets/site-capabilities.kyr) are support, enforcement,
closing/opening physical barriers, dismantling mechanisms, and traversing a known passage. The existing
adventure/discovery rules supply travel, combat, gifts, examination, offered questions and reports. Questions show the offered source/topic rather than leak the hidden answer; the NPC must actually know it. A destroyed document cannot be examined, but a speaker can still remember its contents. No action checks for a
named solution. Outcomes inspect world facts independently; none ends the campaign.

The module-specific rules **are local authored exceptions**, not claims of general social simulation:
Caldus accepts the documented mine boundary; public support accelerates his writ; the bell's striker lifts
water; the bulkhead contains it; his mine claim keeps Len hiding. These commitments are visible in the
scenario and grounded in its fiction. The planner does not invent their implications.

### DEEM's responsibility

[templates.json](../data/blackvein/templates.json) uses `settled_situation`, nested `resident_context`, the
shared canonical `creature` construction path and inherited culture/pace. Historical discoveries are now declared as native Kyr units. Offered questions use the same established facts, sources, speaker knowledge and report provenance.
[tables.json](../data/blackvein/tables.json) supplies occupational roles, controller capabilities, weighted population associations, and outcome declarations. Relevant fragments:

```json
{"creatures": "=concat(gatherEntries(communityRoles, party), mapGenList(resident, gatherEntries(communityRoles, residents), '_role'))"}
```

A resident's nested context binds class/name from its occupational role and race from a weighted culture
table, with an explicit race override for the echo. Delayed `>name` fields prevent the enclosing situation's
name from overwriting resident names or measure names. Template output is validated through ordinary
module composition and the canonical creature schema, then frozen in the installed campaign.

The [early-writ campaign](../data/blackvein/upland.campaign.json) uses the same bundle with
`{"culture":"upland","pace":"urgent"}`. Population weights change independently of enforcement timing
(12 rather than 18). Geography, rules, goals and evidence semantics stay identical. These are weighted
human/goblin community associations, not rules restricting professions to races.

This is **not yet region generation**: the eleven-place geography, names, historical facts and relationships
are deliberately authored. No claim is made that these templates can invent coherent institutions or dramatic
premises. That part of milestone 6 remains open.

### Remaining fragmentation, honestly

An author currently writes the main Kyr situation, a reusable capability library, DEEM templates/tables,
and a small installation manifest. Motives and pressures now live with the Kyr situation, but casting,
controller capabilities and debug outcomes still live in generation data. Discovery text, sources, permissions and initial knowledge now live together in the Kyr source. The static browser
asset catalog still needs imports in `web/scenarios.ts`; the CLI bundle loader needs no TypeScript registration.
There is no adventure-specific TypeScript execution. No existing action was copied into this module.
The new capability library is reusable but has only this campaign as its integration test so far.

## Evaluation and milestone status

[Browser screenshots, command traces and verification results](playtests/blackvein/README.md).

The first real Chromium walkthrough used only Play, on the actual static page. It traveled to the square,
read the charter, showed it to Caldus, visited Len, asked about his ventilation sketch, read his warning,
showed him the charter, followed the concealed passage and disabled the striker (15 watches). The UI showed the accepted boundary and silent bell. Reload reproduced the entire
visible play grid exactly. Inspect was never opened. Contrasting Chromium histories also observed Ada closing the bulkhead and arriving at the inn, and the unattended town becoming deserted with a spoiled well. This proves presentation/execution wiring, not that an
unbriefed human finds the adventure compelling.

The automated histories in [blackvein.test.ts](../test/blackvein.test.ts) cover:

| History | Material divergence |
| --- | --- |
| Investigator | Len returns; mine stays open and independent; striker disabled; well remains clean beyond watch 42. |
| Political supporter | Early road and mine control; actual conserved money moves from Ada to Caldus; environmental danger remains and can empty the town. |
| Violent opportunist | Caldus dies in the existing combat engine; his stable creature ID/body/HP persist on revisit; his claim cannot advance. Other conflicts continue. |
| Unattended | Caldus acts offscreen; the well spoils and Iven evacuates; the returning player sees the changed square. The campaign remains playable. |
| Safety first, politics unresolved | Ada closes the mine and seeks shelter. Disabling the bell enables reopening; Caldus can then seize the mine because his claim is unresolved. A partial intervention changes later opportunities and hazards. |

Every history uses public commands. Tests check canonical continuity, conserved money, outcomes and
continued play, checkpoint roundtrip and deterministic replay. Browser-targeted-bundle/CLI parity includes
the investigator history; an optional real-Chromium leg executes the same transcript in the static page.

Milestones 1–4 have executable content and an initial browser walkthrough; broader independent human usability tests remain necessary. Milestone 5 has the closure/reopening/appropriation loop,
but no succession, trade dependence or recovery of contaminated water. Milestone 6 has independent casting
and pressure composition, not generated geography/institutions. Milestone 7 gains grounded descriptions and
observation/discovery journal entries, using existing restart, checkpoints and run comparison. Milestone 8
has five headless histories, three browser walkthroughs and host parity, not five substantial human playtests. **The whole program is not
being declared complete.**

## Largest obstacles to interesting play

- The political dispute is still a bounded commitment model: Caldus accepts a charter or enforces a mandate.
  There is no bargaining over protection, wages or jurisdiction. Fighting him has no succession/judicial response.
- Merchants and workers are described as community activity, not separately simulated populations. Work,
  recruitment, trade, healing/rest and contaminated-water recovery are absent. Closed/open access and finite
  confiscation are real; an economy is not being claimed.
- Ada's response to the audible bell is based on public physical state; the planner still sees objective world
  state. It is not a general knowledge-aware planner. Historical information still uses the bounded reliable
  discovery model, with no lies, disputed proof or persuasion.
- The original action grounder created tens of thousands of bindings. It now joins provably static
  preconditions while preserving all potentially mutable preconditions, including rule writes and late
  creature projections. Compact checkpoints store schemas, and legal-action scans reuse one World snapshot.
  Before these fixes, the first campaign save exceeded 17 MB. Startup and planning still need profiling before adding more sites. No planner rewrite was attempted.
- There is a lot of prose in a three-column workbench. Independent player testing should determine which
  observations to shorten and whether a map/people journal improves orientation before adding content.

The next content iteration should deepen one decision already present—what protection the road actually
provides and who pays its cost—rather than introduce another detached adventure fixture.


## Authoring revision

The [authoring audit and semantic proposal](authoring/blackvein-review.md) and
[representative alternatives](authoring/blackvein-alternatives.md) supersede the original discovery binding
layout. Four native Discovery units now replace the scattered Blackvein information configuration. The
Open Hand Sanctuary demonstrates the same definition through compositional DEEM generation; five recorded
pre-migration Blackvein histories remain equivalent. Person/controller wiring and full situation composition
remain open design work.
