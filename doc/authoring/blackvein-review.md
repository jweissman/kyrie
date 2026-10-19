# Authoring situations: Blackvein audit and bounded redesign

## Diagnosis and dependency map

The problem is semantic ownership, not the spelling of `Initially Assert`. A writer must currently
reconstruct a character from their identity, generated body, controller, initial location, knowledge,
goals, permissions and separate prose. A situation should be a readable composition of those things.
This study recommends units with explicit lowering, not a second simulation engine.

| Subject | Identity/construction | Executable meaning | Player interpretation | Dependencies to synchronize |
| --- | --- | --- | --- | --- |
| Ada | `blackvein.kyr` group/title/location; `tables.json` resident name/class and controller membership/actions/horizon | Four Kyr pursuits; bulkhead permissions; closure/displacement/shelter rules; canonical purse initialized by `worker_purse` | work/closed-mine/inn observations | Three `ada` records, two names, twelve-coin wage metaphor; changing her abilities can silently make her pursuit impossible |
| Caldus | Kyr group/mandates/location; resident `vey` and controller in tables | Three pursuits; early claim, mandate withdrawal, occupation, road exclusion/access and revenue rules; DEEM pace → `enforceAt` | checkpoint/backing/garrison/charter descriptions | The charter, belief, pursuit applicability and mandate withdrawal must agree; road security is promised but not simulated |
| Len | Kyr group/location/knowledge; resident and controller in tables | Return-home pursuit requires his own acquired charter knowledge; testimony points to sketch | hollow, body and empty-hollow descriptions | Reader permissions and testimony in separate files; departure destination repeated in prose |
| Bell/water | Kyr mechanism, mount/functioning and permissions | `disable` in capabilities; seepage at 30, flight at 42; closed shaft prevents exposure | vault/shrine/inn descriptions | Times repeated in prose; pulse treated as publicly observable without an explicit propagation model |
| Mine/geography | Eleven Kyr places; pairs of route assertions; guarded passage and knowledge passage | `travel/cross/passage`, `closed`, `denied` in libraries | Directions embedded again in observations | A changed route can leave directions false; closing the shaft is distinct from closing the mine |
| Discoveries | Fact/source entities and text in Kyr; source/fact/place/reader bindings in DEEM table | `Discovery.lower`; `examine/ask/tell`; initial knows/denies, destructibility/testimony in Kyr | Source names, knowledge journal, observations | One idea spans ~six declaration sites; fact/source IDs must match several tables |
| Outcomes | Table predicate strings → generated manifest | Module assembly parses predicates; campaign observes independently | Mostly Inspect; local observations provide player feedback | `miners_displaced` means “ever sheltered,” not current displacement |
| Installation | campaign and module JSON; globals/exports/rule list | namespace/compiler/one campaign runtime | title/description | Browser `Scenarios` must separately embed the same assets; CLI requires no registration |

Paths above are under `data/blackvein/`. Runtime ownership: `src/campaign/module-bundle.ts` generates the
manifest, `module-assembly.ts` joins declarations, `module-namespace.ts` scopes them, `campaign.ts` schedules
NPCs and rules. `src/presentation/player-view.ts` filters state; `local-observations.ts` evaluates authored
observations; `web/play-view.ts` renders them. These are real author-facing dependencies, not incidental plumbing.

Specific audit findings:

- Names/class/body/controller/ID are repeated. Residents' `role` is decorative; it selects no actual policy.
  Empty controller goals coexist with goals authored elsewhere. `__no_id` and delayed `>name` are construction
  necessities today, not interesting scenario content.
- Route pairs, signed notices, controls, queries and descriptive directions are manually synchronized.
  Neither the road authority nor the miners' collective is an institution with membership/assets.
- The revenue rule takes Ada's personal canonical coins, not modeled mine earnings. Closure has no employment
  production system to stop. A single Ada creature stands for an unspecified population of workers.
- Prose promises patrols and security without patrol creatures or a protective effect; the inn keeper and
  blankets have no inventory/capacity. Water is a latched threshold, not propagation through connected terrain.
  `quiet_inn` can promise Ada's return even if she is dead. The toll corpse description does not check corpse
  location. These claims must be flagged, not silently repaired during a behavior-preserving authoring migration.
- `occupation_ends` treats incapacity like death. Its predicate is mechanically clear but its fictional
  interpretation needs review. No succession, rebellion, wage negotiation or adjudication exists.
- Caldus's acceptance of the charter, Len's willingness to return, audible safety assessment, confiscation,
  evacuation and opening access all require local rules/commitments. They are authored exceptions, not general
  law, persuasion or economic models.
- Sources themselves are actual world objects with historical content. The charter is a guaranteed factual
  counter to Caldus; that frames a favored intervention. Several descriptions explicitly coach “bring evidence,”
  “find the survey,” and “silence the striker.” These are affordances, but become prescribed solutions if no
  alternatives have executable consequences. A declaration called `Conflict` would not change this.

## Authoring model and alternatives (design before implementation)

Four layers should stay distinguishable:

1. **Construction:** DEEM chooses and composes constrained people, sites, evidence bindings and operating
   parameters. Tables supply content; inherited contexts and overlays supply constraints. Freeze the result.
2. **Execution:** Kyr compiles typed facts, actions, goals and watch processes to the existing world and planner.
3. **Meaning:** authored purposes, disputed claims, obligations and stakes explain what the executable model
   represents. Documentation is valuable even when it does not authorize an effect. Mark unsupported claims.
4. **Observation:** sources, acquired knowledge, local descriptions and reports define what can be learned.
   Do not derive all prose from facts or grant knowledge just because the narrator describes something.

Recommended units and their status:

| Unit | Ownership and precise meaning |
| --- | --- |
| Place | Entity + exits/access + local descriptions. Group these; geography still uses the ordinary location rules. |
| Person | Stable actor/body binding + generation constraints + location + allowed actions + pursuits. A future grouped declaration can lower these; no new kind of creature is needed. |
| Institution | For now named people/assets and explicit commitments. Do not implement membership, jurisdiction or collective assets merely by adding an `Institution` keyword. |
| Object | Entity + capabilities/attachments, e.g. mounted striker or barrier. A future convenience can collect existing relations; it must specify which operation changes which target. |
| Situation | Authoring composition/root with participant bindings, stakes, discoveries, commitments, pressures and consequences. It is not an act machine or independent world. One situation may span installed sites. |
| Discovery | Immutable true proposition, initial actor knowledge/false denial, independently accessible sources and offered testimony. This is the bounded executable unit selected for implementation. |
| Goal/commitment | Existing `Pursuit`: applicability, priority, target; existing explicit rules for conditional promises. `protects` or `accepts evidence` adds no implicit inference. |
| Pressure/consequence | Existing ordered watch rules, with explicit threshold/latch and state effects. A label such as “famine” does not imply food consumption or damage. |
| Report | Authored observation whose condition and locality are explicit; genuine communication uses existing knowledge-transfer actions. No omniscient news feed is inferred. |

### A. Improved native Kyr: ownership and grouping

Preferred when the writer is specifying a particular place and cast. Put each character's operating
commitments next to the relevant discovery. Proposed place/person/object wrappers below are **design
sketches**, not implemented syntax; their bodies explicitly name the lowering.

```text
Place mine "Blackvein minehead" {
  Exit ridge bothWays.                    // route(mine,ridge), route(ridge,mine)
  Exit shaft bothWays.                    // same; travel still checks closed(destination)
  Barrier bulkhead closes shaft usableBy party, ada.
  // mechanism entity, mounted(bulkhead,mine), barrier(bulkhead,shaft), operates(...)
  Observe when closed(shaft) "The emergency bulkhead is closed ...".
}
Person ada "Ada Flint" at mine {
  Body from resident(classId: commoner).   // shared creature generation; stable actor/member binding
  Can travel, shut, open. Horizon 5.
  Pursue protect_workers priority 30
    when knows(ada,danger) and functioning(bell) seeks closed(shaft).
  Pursue shelter priority 20
    when displaced(ada) and closed(shaft) and functioning(bell) seeks at(ada,inn).
}
```

Ada's closure still needs the explicit existing consequences `closed(shaft) → displaced(ada)` and
`displaced(ada) and at(ada,inn) → sheltered(ada)`. Do not quietly infer wage loss, population relocation,
or a safety guarantee from the wrapper. Reopening still checks the public physical striker state.

Caldus's honest native unit would collect his two mandates and the actual exceptions:

```kyr
Initially Assert mandate(vey, toll). Initially Assert mandate(vey, mine).
Pursuit secure_revenue for vey priority 9
  when able(vey) and controlled(toll,vey) and not knows(vey,charter)
  seeks controlled(mine,vey).
Rule contested_mandate when knows(vey,charter) and mandate(vey,mine) {
  Retract mandate(vey,mine). Retract controlled(mine,vey).
}
```

Calling this `Claim mine contestedBy charter` would only be justified as a library pattern with precisely
those effects, not as general jurisprudence. Confiscation remains a separately visible, finite transfer.

The discovery unit implemented in this slice is genuine consolidation:

```kyr
Discovery danger "The buried bell drove water upward when the old pumps stopped; Len fled after seeing it." {
  Known by len, iven.
  Denied by ada.
  Source report "Len's scratched warning beside the abandoned pump"
    at shaft readable by party destructible.
  Source bark "Len's account of the bell, scratched into charcoal bark"
    at hollow readable by party destructible.
}
```

Before: two source entities, one fact entity, truth/knowledge/denial/destructibility assertions, two JSON
binding rows and a DEEM table lookup had to agree. After: one native unit owns them. Its exact expansion is
one fact entity + `established`, source entities + `at/intact/noticeable/reveals/mayExamine`, optional
`destructible/testimony`, and explicit `knows/assumesFalse`. It adds no execution operation. `Denied` is only
the existing fact-indexed negative assumption, not arbitrary belief logic. `spoken by` offers a topic;
the existing `ask` action still requires the speaker actually to know its content.

Len's return remains `knows(len,charter) → pursue at(len,inn)`. Reading the charter yourself does not tell
him. The bell remains a mounted mechanism, not a narrative threat primitive:

```kyr
Rule seepage when watch(clock) >= 30 and functioning(bell)
  and not closed(shaft) and not tainted(shrine) { Assert tainted(shrine). }
Observe foul_well at shrine when tainted(shrine) "An oily black film covers the well ...".
Observe bell_silent at vault when not functioning(bell) "The striker is dismantled ...".
```

No rule retracts `tainted`, so silencing the bell does not clean the well. A future named pressure pattern
should parameterize source, containment, destination, threshold and lasting mark—not infer a hydraulic model.
Conditional observations remain separate predicates over actual state. Reports must establish their source
and visibility; the existing well description is an observation, not acquired formal knowledge.

### B. Compositional DEEM units: the same definitions with bindings

Preferred for placing reusable situations inside a generated region. A generic constructor takes a
proposition and a list of source bindings; it does not choose a story or solution. Example template shape:

```json
"information_unit": {
  "__no_id": true,
  "id": "=dig(#_information, 'id')",
  "text": "=dig(#_information, 'text')",
  "knownBy": "=dig(#_information, 'knownBy')",
  "deniedBy": "=dig(#_information, 'deniedBy')",
  "sources": "=dig(#_information, 'sources')"
}
```

The parent uses `mapGenList(information_unit, bindings, '_information')`; source/actor/place IDs can come
from independently generated sites and casting. Explicit contexts/overlays replace the binding or a
selected value; no JavaScript spread semantics or automatic deep merge is assumed. The resulting typed
record is lowered by the same function as native Kyr, then type/reference checked. See the second executable
scenario's actual template for working DEEM syntax rather than treating this illustration as pseudocode API.

Before/after record example:

```json
{
  "id":"charter", "text":"The town charter grants the miners the workings; Vey's purchased road deed excludes the mine.",
  "deniedBy":["vey"],
  "sources":[{"id":"ledger","text":"The road deed and miners' charter","place":"guild","readers":["party"]}]
}
```

This replaces separate entity/permission/truth records. It does **not** encode Caldus's whole adventure.
His acceptance policy is still a reusable commitment plus explicit local parameters, or an ordinary Kyr rule.
A generated source does not invent its proposition; the author must warrant it. Combining a generated cast
with a source must satisfy reference/type checking. Keep arbitrary narrative invention out of construction.

| Criterion | Native grouped units | DEEM-composed units |
| --- | --- | --- |
| Readability | Strong for fixed cast, discoveries and their consequences in one source | Strong for repeated binding structures; weaker if all fiction moves into tables |
| Precision | Explicit existing predicates/effects | Same lowered representation and validator |
| Composition | Author composition, future selected library patterns | Existing nested generation, context and tables; no new generator |
| Cost | Small discovery lowering now; person/place grouping deferred | Same small lowering plus manifest field; elaborate generic situation assembly deferred |
| Risk | Decorative wrapper if it merely renames assertions | Monolithic profiles or hidden coupling if entire adventures become records |

Recommendation: native Kyr for authored circumstance and local exceptions; DEEM for the construction and
binding of genuinely repeated units; one typed expansion contract. Do not implement every proposed noun.

## Extensibility experiment and scope boundary

A sanctuary keeper has closed a refuge after a false assumption about its founding restriction. A surviving
charter is offered as evidence. Learning it changes the keeper's existing pursuit to reopen the barrier.
This is a distinct dispute about shelter, not mining, taxation or water. It reuses the discovery unit,
`examine/tell`, `open`, the existing planner and canonical creatures. It needs its own proposition,
source/location/participants, one opening pursuit and local descriptions. It needs **zero new TypeScript
execution handlers, zero copied action definitions, and zero general law or persuasion subsystem**.

This validates reuse of the bounded information/commitment structure, not general dramatic situation
generation. Complete situation records would need more evidence before becoming a language feature.

## Implementation plan chosen after comparison

1. Add one typed discovery definition and pure lowering beside the existing `Discovery.lower`.
2. Offer native Kyr discovery blocks and optional DEEM-generated `information` records, both using that lowering.
3. Migrate Blackvein's four propositions/six sources out of the binding table without changing its mechanics.
4. Execute the sanctuary through the existing bundle path using a generic DEEM information constructor.
5. Compare Blackvein's before/after world/creature/NPC histories; test invalid definitions, native/generated
   equivalence, source destruction/memory, reload and browser/CLI parity.

Existing expanded Kyr and legacy flat `discoveries` records remain supported. Generated inspection and saved
worlds remain ordinary typed entities/facts; no English strings are executed. Broader cast/geography/pressure
composition, author provenance in Inspect, and eliminating static browser catalog registration are deferred.

## Implemented result and remaining authoring costs

The selected slice is implemented. [Native Blackvein](../../data/blackvein/blackvein.kyr) now owns four
Discovery units and all six source bindings; the old Blackvein binding table and its discovery constructor
were removed. Shared capability actions moved to `data/rulesets/site-capabilities.kyr` unchanged. Existing
bundle authors using the old `data/blackvein/capabilities.kyr` path must update that rules entry; saved
campaigns already carry their rules. Flat discovery manifests and expanded Kyr continue to load.

[Representative rewrites](blackvein-alternatives.md) compare both approaches for the mine, Ada, Caldus,
Len, the bell and presentation. Proposed wrappers are clearly distinguished from working syntax.

The [sanctuary](../../data/sanctuary/sanctuary.kyr) has 19 lines of world/policy/presentation, one information
binding, two creature and two controller records. Its [direct Kyr example](../../data/sanctuary/sanctuary.direct.kyr)
places the same discovery beside its consequence. The generated form uses the shared `information_unit`
constructor, the bundle's casting/evidence tables and inherited context. Its root template is orchestration
of independent inputs, not a new sanctuary resolution algorithm. Tests also override a source list without
replacing the proposition or adventure. No action library is copied; no scenario-specific TypeScript executes.

For native versus generated equivalence, the test loads the same bundle with the direct example as its
source and `direct: true` as generation context, suppressing the generated duplicate. A normal CLI bundle
can do the same by changing `situation` to `sanctuary.direct.kyr` and adding that generation context. The
primary browser entry demonstrates the generated form.

What remains awkward:

- Person/body/controller wiring and outcomes still require casting records. This slice does not eliminate
  per-module configuration or solve whole-situation editing. A new author can now modify what Len knows,
  where corroboration exists, and who can learn it by reading one discovery unit; they still need other
  files to change his body, action repertoire or the complete economy.
- A public source is always noticeable and initially intact, tied to one immutable true proposition and
  one initial place. There are no conditional discovery definitions, false documents, multi-claim books,
  generalized positive mistaken beliefs, or knowledge of changing water state. Use existing explicit facts
  when that contract does not fit. `spoken by` grants a topic offer, not knowledge, trust or persuasion.
- There is no source-preserving roundtrip/editor model. `ModuleWriter` deliberately emits the expanded,
  inspectable Kyr, not the author's grouped block. Source locations/provenance and a rendered situation
  dossier in Inspect are still missing.
- Static browser catalog imports remain TypeScript. Actor parameters must be called `actor`; runtime
  conventions reserve `group`, `place`, `at`, `able/dead`, `gold` and `watch(clock)`. Controllers authorize
  actions separately from their preconditions and NPCs currently require noncombat, one-watch actions.
  Action-label placeholders determine public command parameters; changing them can break transcripts.
  Rules run one source-ordered pass per watch. Those constraints need author diagnostics, not prettier nouns.
- Authored scenery need not become a comprehensive simulation: an untakeable blanket can be description.
  But an offer of shelter, protection or income becomes a mechanical promise when players are invited to
  rely on it. The audit separates such promises from incidental atmosphere. This migration preserves and
  flags the existing presentation problems rather than silently changing the adventure's behavior.

Verification lives in `test/authoring-discovery.test.ts`: native/generated lowering, invalid definitions,
DEEM context overlays, private acquisition, actual planner-controlled reopening, checkpoint continuation,
and five pre-migration Blackvein histories. The committed baseline was recorded from the old authoring
before migration and compares complete sorted world facts/measures, canonical creatures, outcomes and
NPC action/goal/watch sequences. Host parity covers Blackvein and the sanctuary through actual CLI and
browser-targeted execution, with the opt-in real-Chromium leg as well.


Final validation: `bun run check` passed lint, both typechecks and 129 tests (the optional Chromium leg
skipped in that command). The separate real-Chromium parity test passed all seven histories, including
migrated Blackvein and the sanctuary. After final presentation wording changes, 16 targeted authoring/session
tests passed again. A real static-page click walkthrough confirmed that examination alone leaves the
barrier closed, telling Cira enables travel, and page reload reproduces the same visible session.
[Sanctuary browser screenshot](sanctuary.png). No Inspect or direct world mutation was used.
