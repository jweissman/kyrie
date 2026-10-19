# Representative rewrites and lowering contracts

Read with [the audit and recommendation](blackvein-review.md). Only the Discovery unit and the existing
Kyr syntax are executable now. Other grouped constructors below are proposed contracts, not installed APIs.
Their purpose is to compare ownership and composition before extending the grammar further.

## Mine and geography

**Before (executable now):**

```kyr
Entity mine: place "Blackvein minehead". Entity shaft: place "Old pumping gallery".
Initially Assert route(mine, shaft). Initially Assert route(shaft, mine).
Entity bulkhead: mechanism "the mine's emergency bulkhead".
Initially Assert mounted(bulkhead, mine). Initially Assert barrier(bulkhead, shaft).
Initially Assert operates(ada, bulkhead).
```

**Native grouping, proposed:** `Place mine` owns its named exits and `Barrier bulkhead closes shaft`;
Ada's operating permission is still explicit. The group emits exactly those entities and relations.
A two-way exit emits two directed routes; it does not promise unrestricted travel. The existing `travel`
still checks closure and actor-specific denial. The ridge crawl remains `informedPassage(ridge,vault,tunnel)`;
the echo remains a real canonical creature guarding the gallery/vault edge.

**Compositional binding, proposed:**

```json
{"id":"mine","name":"Blackvein minehead",
 "connections":[{"to":"shaft","return":true},{"to":"ridge","return":true}],
 "barriers":[{"id":"bulkhead","name":"Emergency bulkhead","destination":"shaft","operators":["ada","party"]}]}
```

A reusable DEEM site constructor could receive `_site` through `mapGenList`, emitting the same entity,
route and mechanism facts. A generated region supplies destination IDs; it must not invent a route that
bypasses the knowledge requirement or guarded edge. No pathfinding or access policy belongs in DEEM.

## Ada and closure

**Before:** name/class/body/controller in one table, title/location in Kyr, four pursuits elsewhere, key
permissions at the mechanism, wage purse in a DEEM helper, closure effects later in the file.

**Native grouping, proposed:** the person block in the main review collects identity, body constraints,
allowed operations and pursuits. A separate named workplace situation binds Ada, mine, shaft, bell and inn,
so the consequence is readable beside the commitment:

```kyr
Pursuit protect_workers for ada priority 30
  when knows(ada,danger) and functioning(bell) seeks closed(shaft).
Rule lost_livelihood when closed(shaft) and not displaced(ada) { Assert displaced(ada). }
```

**Compositional binding, proposed:**

```json
{"worker":"ada","warning":"danger","hazard":"bell","entrance":"shaft","shelter":"inn",
 "safetyPriority":30,"shelterPriority":20}
```

A workplace-safety pattern would have to declare its contract: existing `knows` gates the safety goal;
closing the supplied entrance latches displacement; a second goal routes the worker to the supplied shelter.
It must not infer wages, relocate extra people, transfer a creature into a different store, or declare the
mine safe. This pattern is **not implemented**: one mine plus one different sanctuary commitment is not
sufficient coverage to standardize all workplace behavior.

## Caldus: legal acceptance and extraction are separate commitments

**Before:** `mandate`, `controlled`, `knows`, `denied`, `supports`, `enforceAt`, `quantity` and three pursuits
jointly express a claimed jurisdiction. No declaration owns the distinction between road and mine rights.

**Native grouping:** the charter now owns its text, evidence and initial denial in one executable Discovery
block. His acceptance rule and revenue rule remain explicit. A proposed `Commitment` wrapper must state
its trigger and effects, e.g. on acquiring charter knowledge retract mine mandate and mine control, leaving
road control unchanged. It has no general legal interpretation.

**Compositional binding, proposed:**

```json
{"holder":"vey","subject":"mine","counterevidence":"charter",
 "onAcknowledgement":["retract mandate(vey,mine)","retract controlled(mine,vey)"],
 "levy":{"from":"ada","to":"vey","perWatch":1,"while":"controlled(mine,vey) and not closed(shaft)"}}
```

The strings here illustrate typed changes/predicates, not opaque English to execute. A real constructor
would produce the existing typed Change/Predicate representation and validate all references. It would
check available funds before each transfer. The transfer is from a person's finite purse in today's model;
calling it `revenue` does not make it a generated economy. Changing his willingness to acknowledge evidence
must replace an explicit policy, not merely change his adjective to “stubborn.”

## Len and discovery — implemented comparison

**Before:** source entities and historical truth in Kyr, bindings in `communityRoles.discoveries`, DEEM
`mapGenList(discovery,...)`, separate initial knowledge and `testimony`, plus the return pursuit.

**After, native Kyr (actual Blackvein):**

```kyr
Discovery tunnel "A ventilation crawl connects Heather ridge with the buried bell chamber, bypassing the pumping gallery." {
  Known by len.
  Source survey "Ventilation survey nailed to a fallen survey post" at ridge readable by party.
  Source escape_route "Len's ventilation sketch"
    at hollow readable by party spoken by len destructible.
}
Pursuit return_home for len priority 10 when knows(len,charter) seeks at(len,inn).
```

**After, DEEM constructor input (same executable contract):**

```json
{"id":"tunnel","text":"A ventilation crawl connects Heather ridge with the buried bell chamber, bypassing the pumping gallery.",
 "knownBy":["len"],"deniedBy":[],
 "sources":[
   {"id":"survey","text":"Ventilation survey nailed to a fallen survey post","place":"ridge","readers":["party"]},
   {"id":"escape_route","text":"Len's ventilation sketch","place":"hollow","readers":["party"],"speakers":["len"],"destructible":true}
 ]}
```

The shared `information_unit` DEEM template is in `data/default/templates/deem.templates.json`.
`Discovery.describe` lowers either form. Each source gets `reveals`, `at`, `intact`, `noticeable` and reader
permissions; the sketch additionally gets `testimony(len,escape_route)` and `destructible`. The truth and
Len's initial knowledge are explicit. Neither unit tells the player the answer before examination/asking.
The passage action still requires the player's knowledge; Len's return requires his knowledge of a different
fact. Burning the sketch leaves Len's memory intact; the source does not generate or resurrect him.

## Bell, propagation and lasting contamination

**Before:** 30 and 42 are embedded in rules and repeated in prose; the spatial relation between the mine
and the well is supplied by a rule, not represented as connected watercourses.

**Native improvement available using existing syntax (not migrated here):**

```kyr
Measure exposureAt(mechanism).
Initially Set exposureAt(bell) to 30.
Rule seepage when watch(clock) >= exposureAt(bell) and functioning(bell)
  and not closed(shaft) and not tainted(shrine) { Assert tainted(shrine). }
Observe warning at shrine when not tainted(shrine)
  "The reservoir crests at watch {exposureAt(bell)}.".
```

This removes a duplicated number. It does not infer a drainage network.

**Compositional binding, proposed:**

```json
{"source":"bell","sourceActive":"functioning(bell)","containment":"closed(shaft)",
 "destination":"shrine","at":30,"persistentMark":"tainted(shrine)",
 "later":{"at":42,"whileStillExposed":true,"effects":["displaced(iven)","abandoned(square)"]}}
```

A bounded exposure constructor must emit two ordered, latched watch rules with these exact conditions and
ordinary typed changes. No cleanup effect is emitted, so contamination persists after the source stops.
Names such as “threat” must not imply damage, spreading neighbors, knowledge or casualties.

## Changing descriptions and reports

**Before:** separate prose strings can promise an action when its actor is dead, or describe a corpse at the
wrong site. A local predicate is necessary but insufficient unless it tests the claim being made.

**Native:** keep `Observe` adjacent to the thing/situation it describes. A corpse observation should require
`dead(vey) and at(vey,toll)`; an Ada return report should check ability and the relevant location/commitment.
Those corrections would alter presentation, so this behavior-preserving migration flags rather than hides them.
The existing typed numeric interpolation already handles Caldus's generated threshold.

**Compositional binding, supported by existing observation IR:**

```json
{"id":"foul_well","place":"shrine","when":"tainted(shrine)",
 "text":"An oily black film covers the well ..."}
```

This is an authored observation definition, not proof that anyone has heard a report. A future messenger
pattern must use a real actor and the existing knowledge-transfer mechanism. Prose should not itself set
`knows`, reveal private goals, or fabricate offscreen witnesses.

## What the comparison establishes

The useful abstraction is a binding-rich unit with a known expansion, not a universal fantasy noun.
Discovery now has that contract. Sites, bodies/controllers, commitments, pressures and observations still
need a coherent composition/editor model; simply placing the six JSON examples into one profile would
recreate the current problem. Prefer small proven patterns, native local exceptions and generated bindings,
with a rendered instantiated view for review, over a single all-purpose `Adventure` record.
