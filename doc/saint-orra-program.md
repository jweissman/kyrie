# Saint Orra: Ash and Silver

This is the first integrated increment under the adventure/content/player priorities, not completion of all three waves. Blackvein and the sanctuary remain available in the developer workbench. Their Discovery authoring and execution paths are unchanged.

## Player design and dependency map

A company arrives at a refuge beside a charcoal kiln and a drowned watchtower. A child is sick. Mere has blamed a worker, Tamsin, and detained her. The missing healer Ys left evidence of a different cause: firing scavenged silver stone carries residue into the spring. Ys herself is below the tower, trying to stop a second source of danger. The keeper wants safety without losing the refuge's heat; the worker wants her place back; the healer wants the reservoir drained before returning; the dead warden honors a narrow burial oath.

The investigation **Ashes at Saint Orra** asks whether to accept, challenge, circumvent or ignore an accusation. The expedition **The Hart Below** asks how to penetrate a dangerous site, whom to spare and whether to stop a physical process before it destroys an approach. They overlap geographically and causally, but neither is a prerequisite for the other.

```
Existing canonical creatures + DEEM + installed modules + Discovery
                    ↓
Two connected authored situations, with deadlines and physical routes
                    ↓
Canonical party capabilities → different approaches without party-specific scripts
                    ↓
Player page: choose company → explore/investigate → communicate/fight → revisit
                    ↓
Divergent histories + browser observation + compatibility/gap review
                    ↓
Next: recovery, useful rewards and progression; equipment/attachment semantics
```

Eight places form a readable graph: green—porch—guest house; green—kiln; green—moor—watchtower—undercroft—reservoir. The hidden kiln flue also enters the undercroft. Barriers are actual action preconditions; knowledge unlocks the flue without inventing a new destination. Leaving never stops either module's clock or NPC opportunities.

## Experience now implemented

* Examine either independent analysis/ledger source, then communicate the result. Learning is private; Mere does not change course until told. She opens the guest house, walks to the kiln, dismantles its bellows and returns. Tamsin leaves custody. Destroying the ledger does not destroy the independent analysis or erase truth.
* The Free Fellowship (human/elf/dwarf) receives a hearing by an explicit local compact. A hired human company must establish another basis for access. Both companies can solve both situations using the same actions.
* A ranger can approach this explicitly receptive wolf; anyone can give food, let it eat and pass. Attacking makes subsequent ranger approach unavailable. Feeding and ranger affinity are different resource/capability interactions, not separate expedition branches.
* A guardian resists weapons, is vulnerable to fire/radiant damage, drains life, wards itself and casts wisdom-resisted sleep. Communicating the established burial oath also opens passage. The flue bypasses both guardians. No roll result or death is overridden to preserve a confrontation.
* Stop either hazard independently. Kiln discharge empties the clean-water stock at watch 20; collected water survives. Expulsion at watch 28 remains historical even after a later correction. Reservoir overflow at watch 36 closes the tower approach permanently; the known flue still works. Stopping a source does not retract earlier damage.
* Ys opens the reservoir hatch offscreen. After the siphon stops she plans a route home; her testimony becomes available on the green. Killing her prevents that return. Module outcomes do not end the campaign. In the recorded violent-company history the warden dies, Nell also dies, Bran survives at 5 HP, and the two hazards are still running.

The default static page offers company selection, seed entry, location prose, a knowledge-limited connectivity list, contextual actions, journal, party sheet, save/resume, replay export/import and a dedicated encounter screen. The old workbench is `workbench.html`. The same PlaySession/Campaign/Battle execute both interfaces and CLI replay.

## Actual author-facing source

The two coherent situation files own geography, discoveries, commitments, consequences and state-dependent prose:

* [Investigation](../data/orra/refuge.kyr)
* [Expedition](../data/orra/tower.kyr)

For example, the investigation's causal chain is authored directly:

```kyr
Discovery runoff "Silver residue from the watchtower stones is carried into the spring by the kiln's forced draft; Tamsin did not poison the water." {
  Denied by mere.
  Source cup "Ys’s signed water analysis beneath the testing cup" at green readable by party.
  Source ledger "Firing ledger: illness follows silver-stone firings, even during Tamsin's absence"
    at kiln readable by party destructible.
}
Pursuit hear_challenge for mere priority 30 when knows(mere, runoff) seeks not closed(cell).
Pursuit stop_poison for mere priority 20 when knows(mere, runoff) seeks not functioning(furnace).
```

These lower through the existing Discovery expansion, ordinary predicates and bounded planner. There is no `solve_investigation` action. `knows` means acquired established information; `Denied by` initializes a contrary assumption, not probabilistic belief. The analysis is an authored expert conclusion, not an implemented chemistry experiment. The oath response is an authored commitment, not general undead persuasion.

[Shared affinities](../data/rulesets/affinities.kyr) provides two parameterized actions: request passage based on a recognized company identity, and approach explicitly receptive wildlife. Their eligibility reads a **read-only projection** from canonical living, unblocked members. [Capability data](../data/capabilities.json) defines ranger membership and the three-ancestry multiset. Death or incapacitation can remove eligibility; no independent party flags store it. The identities must currently be global entity IDs in the bundle. This library is intentionally much smaller than a feat/trait system.

[DEEM templates](../data/orra/templates.json) compose the chosen party table with resident records and controller tables; every creature then uses the existing shared `creature` constructor. [Tables](../data/orra/tables.json) supply specific cast, class/race/level constraints, allowed action vocabularies and independent outcome predicates. Choosing `company` changes party composition, not a complete adventure profile. No new generator, parser or campaign runtime was introduced. An explicit `abilities` creature context selects Dori's initial spell repertoire; runtime casts do not regenerate it.

## Authoring friction and limits

There is still substantial friction. The two Kyr situation files are 56 and 51 physical lines (including long prose strings); supporting tables are 269 lines, templates 44, and the two bundle manifests 64. This is still a substantial auxiliary authoring burden, despite putting the important causal rules and prose together. A player cannot yet offer to treat the sick child, replace the kiln with another heat source, carry a signed document as a physical object, or ask arbitrary questions. These are reasonable intentions the current slice does not support; prose must not imply that they are implemented. A designer edits one Kyr file per situation **and** cast/controller tables plus a small bundle manifest. A named character's public group label and generated creature name are duplicated. Controller action whitelists, membership IDs and allowed operations must agree with pursuits. Routes are written twice for bidirectional passages. Static browser assets are manually registered in `web/scenarios.ts`; CLI bundles need no registration. Capability definitions and race/class catalogs are shared packaged data, not externally extensible bundle catalogs. These are measured remaining problems, not hidden behind a new wrapper.

No new TypeScript contains Orra's plot decisions. The generic changes are party capability projection, innate typed damage mitigation, richer combat log evidence, perceived connectivity, and the player host. The shared mechanism library now also permits taking a keyed mechanism’s access from an incapacitated co-located keeper, then opening it through the ordinary action. Death does not magically open the door. The one shared rule correction makes `cross` respect a closed destination, just as travel already did.

**Unimplemented:** arbitrary searching, threat/persuasion, manipulation of movable evidence, general legal claims, chemistry, economies, heat loss damage, replacement leadership, equipment slots, feat/perk attachments, category saves, general triggered effects, world-time condition scheduling, field spell casting, rest/recovery, useful adventure rewards and level advancement. Elven/dwarven ancestries currently affect identity/class options, not Orsino's full racial stat/trait packages. The wolf and warden are Kyr-authored adaptations, not faithful Orsino imports. Water collection conserves stock; drinking/dehydration are not simulated.

The largest gameplay obstacle after this increment is recovery and useful rewards. Finite HP/mana make repeated combat consequential, but without field healing/rest and advancement there is no satisfactory long campaign loop. The next bounded design should show an explicit member-targeted field spell/rest interaction through the existing effect executor, rather than create a second healing interpreter. Equipment and feat attachments should follow a concrete reward whose mechanics need them. Do not advertise the compatibility inventory as a working port.

## Evidence and next evaluation

[Playtest records](playtests/orra/README.md) contain four command histories, replay files, state comparisons and actual browser screenshots. Automated completion establishes legal execution, divergence and persistence. It does **not** establish fun, clarity for a new human player, replay value or satisfying combat balance. No independent human usability test has been run. In particular, testing whether players recognize the heater/safety tradeoff without treating the analysis as a quest token remains necessary.


The subsequent [player-journey increment](frontier-player-journey.md) adds editable party creation, conversations, natural time, shared field care, a useful reward/recovery loop and the northern margin. This document records the earlier foundation.
