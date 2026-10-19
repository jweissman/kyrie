# Glass Orchard: bounded discovery and information transfer

This experiment adds reusable discovery rules, an actor-facing information view, and an executable Glass Orchard fragment. It adopts no dossier syntax and changes no Kyr grammar. The existing `World`, action executor, canonical creatures, goal selector, planner, campaign clock, namespace linker and saves remain authoritative.

```sh
bun run kyrie campaign data/discovery/orchard.campaign.json glass
bun test test/discovery.test.ts
```

The terminal displays the player view for this ruleset. `inspect` shows that same view. It does not print the omniscient world, NPC plans, module outcomes, or hidden action bindings. Saving remains a GM/debug checkpoint operation; saves include the complete world. This is a semantic presentation boundary, not encryption or protection against a player reading source/save files.

## Six distinct concepts

| Concept | Actual representation and meaning |
| --- | --- |
| Objective fact | `established(mirror_prisons)`: the founder made the manor's mirrors as prisons for living people. This is a fixed historical proposition, not an assertion that every captive remains alive forever. It exists before discovery, is not established by evidence, and survives destruction of all sources. |
| Source/observation | `reveals(mirror, mirror_prisons)` links one reliable, physical source to a named fact. The gatehouse observation mirror and founder's journal are independent sources. A source has a location, visibility, examination permission, and intact state. The observation mirror is not a captive's binding vessel; destroying it has no unimplemented rescue/death consequence. |
| Actor knowledge | `knows(party, mirror_prisons)` is private to the acting group. It is acquired by examination or the explicitly trusted report rule. Absence means not recorded as known, not belief in its negation. |
| Mistaken belief | `assumesFalse(orris, mirror_prisons)` explicitly records Orris's denial of that proposition. The world establishes it as true, so the assumption is mistaken. Acquiring knowledge of this same fact removes that one assumption. No other beliefs are inferred or revised. |
| Player visibility | The actor view returns the party's location, local people, noticeable local sources, its own knowledge/assumptions and safe command choices. It omits other actors' private knowledge and beliefs, objective truth markers, source-to-fact links and remote state. An actor's own false assumption is displayed as a negative assumption, not labeled as objectively wrong. |
| NPC policy | Orris pursues his rounds while he assumes the prison account false. Once he knows it, he pursues the portrait loft. Existing authored goal predicates and the existing planner choose ordinary travel actions. Truth or party knowledge alone never activates his new goal. |

Orris also privately knows a separate fact about the founder escaping through the loft stair. That fact and its source are independently bound, and they do not leak into the initial party view. All routes in this small experiment are public; the private fact does not implement a hidden-map system.

Knowledge is group-level because current campaign actors are groups backed by canonical creature IDs. The fixture uses one creature per group. Per-character knowledge inside a multi-person party is deferred.

## Executable contracts

The library is `data/rulesets/discovery.kyr`, composed with the existing adventure rules through a bundle `rules` array. The bundle loader merges these ordinary Kyr declarations; this is not another interpreter.

- **Examine:** require a capable actor, co-location with a noticeable, intact source, examination permission, and the source's established fact. Assert `knows`, retract that actor's `assumesFalse` for the same fact, and record `learnedFrom(actor, source, fact)`. A source can be examined once per actor/fact. A second independent source can add corroborating provenance without duplicating knowledge.
- **Tell:** require a capable, knowledgeable sender and capable, distinct, co-located recipient who explicitly trusts that sender. Assert recipient knowledge, retract the corresponding negative assumption, and record `toldBy(recipient, sender, fact)`. Source survival or presence is unnecessary: remembered knowledge can be communicated. Repeating a known report is allowed and consumes time; menu availability therefore does not disclose whether the recipient already knew it.
- **Destroy source:** require capability, co-location, visibility, intact state and an explicit `destructible` marker. Retract `intact`. This is a bounded source-destruction rule, not combat against arbitrary objects. It cannot erase truth, memories or provenance.

All use existing typed preconditions and `Assert`/`Retract` effects. Invalid commands consume no time and change no state. Valid actions advance the existing campaign scheduler, including NPC opportunities while the party is elsewhere.

Reports are **trusted, factive transfers** in this bounded model. There is no untrusted-report, lie, testimony uncertainty, persuasion or dialogue system. A source cannot attest an unestablished proposition. Sources attest exactly one fact each; many sources may attest the same fact. Validation rejects ambiguous source bindings, conflicting initial locations, unestablished source content, inconsistent initial knowledge and action writes to the immutable `established` relation.

The engine/planner still has authoritative world access. The experiment makes knowledge relevant through explicit predicates and capabilities; it does not create an epistemic planner or restrict every possible author-written query to an NPC's beliefs. Source disclosure is deterministic, with no skill-check subsystem added.

## Compositional DEEM and exact Kyr lowering

`data/discovery/discovery.templates.json` contains one reusable `discovery` constructor. Its inputs are four references, supplied directly as context or through the `_binding` context used by `mapGenList`:

```json
{"actor":"party","source":"mirror","fact":"mirror_prisons","place":"gate"}
```

The three records in `discoveryBindings.orchard` bind two independent sources to the prison fact and a third source to another fact for another actor at another location. The constructor is the same for all of them. The test also binds `researcher / inscription / lost_city / quarry` without adding a template or adventure profile.

`orchard_situation` assembles those records using existing nested generation and table machinery:

```text
discoveries = mapGenList(discovery,
                        gatherEntries(discoveryBindings, orchard), '_binding')
```

`gatherEntries` supplies the complete binding list; `lookup` would select one entry. Context overrides suppress field defaults as in ordinary DEEM templates, and `_binding` is not emitted. The creator contains no complete adventure profile, procedural solution list, or new randomness mechanism. The small Orchard table separately supplies creature contexts and inspectable goal configurations; creatures still use the canonical shared generation path.

The optional manifest field `discoveries` is a **provisional typed data-binding convenience**, not a new language. `Discovery.lower` expands each record into exactly these existing Kyr declarations:

```text
Initially Assert reveals(mirror, mirror_prisons).
Initially Assert at(mirror, gate).
Initially Assert intact(mirror).
Initially Assert noticeable(mirror).
Initially Assert mayExamine(party, mirror).
```

It does **not** assert the objective truth or grant knowledge. Those are separate authored facts:

```text
Initially Assert established(mirror_prisons).
Initially Assert assumesFalse(orris, mirror_prisons).
Initially Assert knows(orris, stair_plan).
Initially Assert trusts(orris, party).
```

No new author-facing construct is semantically necessary. `glass-orchard.direct.kyr` writes out all five declarations for each source directly. Tests combine that file with the same rules/controller data and prove it produces the same world as the DEEM-generated records. They also export the generated module with `ModuleWriter`, parse and instantiate that Kyr again, and compare its world. Controller configuration remains in the existing manifest structure; the Kyr export does not pretend to contain a newly invented NPC-policy syntax.

To inspect a namespaced generated bundle as ordinary Kyr, use the existing writer:

```ts
const draft = await ModuleBundle.load(
  { id: 'orchard', bundle: 'data/discovery/orchard.module.json' },
  { seed: 'glass' }
);
console.log(ModuleWriter.write(draft.instance.module));
```

This is GM inspection and intentionally includes secrets. It is distinct from `InformationView.observe(campaign)`.

The actual DEEM CLI was also exercised:

```sh
deem run --type orchard_situation --seed glass \
  --templates data/discovery/discovery.templates.json \
  --tables data/discovery/discovery.tables.json
```

It returns the two creature contexts/controllers and all three linked discovery records. Complete saves are compared across identical campaign inputs, so the integration tests cover generation semantics and repeatability rather than merely checking that generation returns.

## Player-facing commands and privacy

Internally the grounded examine operator includes the source's fact as a binding. Exposing its generated action ID or default label would spoil discovery. `InformationView` instead offers `examine(orchard__mirror)` and resolves that to the applicable existing operator on the trusted side. The fact is not a player-selected target. The one-fact-per-source invariant makes resolution unambiguous.

Initial player output includes the visible observation mirror and the option to examine it; it contains neither `mirror_prisons` nor `stair_plan`. After examination, only the newly learned prison fact appears. The view does not return NPC goal names, raw event diffs or outcome predicates. Current `Campaign.world`, `state`, `events`, saves, source files, and bundle inspection remain omniscient GM/debug APIs, not actor-safe transport objects.

The view supports this ruleset's examination, reporting, source destruction, public travel and waiting choices. It is not a complete visibility/presentation policy for every future action library. Information-aware hints and automatic player planning are deliberately not exposed through this experimental terminal view.

## Tested counterfactuals and what is new

1. **No discovery:** objective truth and two surviving sources exist, but Orris follows his old rounds and retains the false assumption.
2. **Private discovery:** the party learns from the mirror; Orris still does not know and follows exactly his old policy. Learning has not silently become broadcast information.
3. **Alternative evidence:** destroy the mirror first, then examine the journal. The same fact can still be learned and communicated. Reading both sources records both origins.
4. **Lost opportunity:** destroy both sources before examination. The objective fact remains true; neither actor gains that knowledge through those sources. Destruction survives reload.
5. **Communication:** a report fails without co-location, sender knowledge or recipient trust. A valid report changes knowledge and removes the one false assumption; the next NPC opportunity replans from Orris's actual location.
6. **Persistence:** learn privately, destroy the source, JSON-save/reload, report later, then leave. Orris reaches the loft offscreen and stays there. Uninterrupted, resumed and independently repeated command histories produce identical saves and logs.

The executable trace `examine mirror -> travel yard -> travel glasshouse -> tell Orris -> wait` records Orris first traveling gate → yard → glasshouse under `keep_rounds`, then reversing toward yard → loft under `reach_captives`. The policy does not recognize a named player solution action; it reads acquired knowledge.

Already proven before this work: predicates can activate goals and the planner can change course. **Newly proven:** a reusable, constrained learning/transfer protocol produces the activating predicate; multiple sources, privacy, source destruction, provenance and presentation have consistent effects on who can acquire it. That causal chain survives ordinary campaign time and save/replay. This does not prove general understanding, believable persuasion, rescue mechanics, or a compelling complete adventure. Reaching the loft is a demonstrated intention, not an implemented rescue.

## Situation as the reusable unit

A situation is the better default unit: a persistent local configuration with optional actors, discoveries, goals, pressures and observations. An adventure can package several situations, introductions and presentation content without becoming their runtime owner. A situation need not have a deadline or a terminal success condition.

The existing manifest type is now named `SituationManifest` with `AdventureManifest` retained as a compatibility alias. A pressure is optional. A module without pressures has no installed deadline; the Orchard does not invent a resource shortfall or artificial countdown to fit the old shape. Existing deadline-bearing modules retain their timing behavior. No new `Situation` grammar or campaign runtime was introduced.

A future region generator could first instantiate persistent settlements, places and inhabitants, then bind situation inputs to those IDs through existing module imports. Reusable discovery records can reference those actors/places. NPC controllers still receive campaign opportunities regardless of party proximity, and leaving does not regenerate sources or memories. That direction uses the current namespace/import/store lifecycle; full regional generation, shared-actor controller composition, unloading, general hidden-map exploration and dynamic proposition/belief logic remain deferred.
