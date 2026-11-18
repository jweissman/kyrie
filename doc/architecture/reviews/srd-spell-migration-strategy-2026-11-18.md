# SRD spell migration and semantic engine strategy

**Date:** 18 November 2026  
**Method:** repository census, generated fidelity ledger, proving-case review, engine capability review, and focused
test verification  
**Scope:** the 605 extracted Revised 3.5 SRD spell records, the 286-spell Westernesse catalog, spell execution in and
out of combat, generation stability, authorability, presentation, and migration tooling

No code, catalog data, open-register item, or active M22 plan was changed for this study. The generated
[SRD fidelity ledger](../mission-21/rules/srd-fidelity.md) remains the authority for current counts. This report
proposes a program for moving from isolated proof slices to broad spell coverage without claiming that approximate
execution is exact SRD fidelity.

## Executive conclusion

Kyrie has proved that it can reproduce individual SRD spells faithfully, but the current one-spell-at-a-time method
cannot economically deliver a catalog of approximately 650 useful spells.

The present census is:

| Measure | Current | Remaining |
|---|---:|---:|
| Extracted SRD spell records | 605 | — |
| SRD records mapped to a Westernesse catalog spell | 119 (19.7%) | **486 absent or unmapped** |
| Westernesse catalog spells | 286 | — |
| Catalog spells without an SRD counterpart | 167 (58.4%) | intentional Orsino/Kyr magic or mapping candidates |
| Mapped spells passing structure | 32/119 (26.9%) | 87 |
| Mapped spells passing resolution | 21/119 (17.6%) | **98** |
| Mapped spells with focused play-identity proof | 20/119 (16.8%) | **99** |

Only 21 of the full 605-record SRD corpus, 3.5%, currently pass the resolution census. That number is honest but does
not mean the engine has only 3.5% of the necessary machinery. Recent work has delivered reusable damage scaling,
save conversion, Hit Dice pools, partial and repeated saves, burst/cone/line/chain shapes, area-friendly fire, field
casting, planar travel, and stable spell draws. The foundations are materially ahead of the content count.

The program should now change shape:

1. **Build one typed resolution pipeline and one normalized spell representation.** Stop making each spell decide
   how attacks, spell resistance, saves, effects, durations, and aftermath compose.
2. **Compile the whole SRD corpus into a coverage manifest immediately.** Every record should become mapped,
   classified, executable at a declared approximation grade, or rejected for a named capability—not silently absent.
3. **Make common spell families work in bulk.** Damage, healing, conditions, bonuses, removal, detection, movement,
   creation, summoning, transformation, and world magic should each be adapters over shared primitives.
4. **Use conservative fallbacks for breadth.** A roughly correct spell should preserve its defining player decision,
   target, cost, broad consequence, and counterplay even when range, duration, or a secondary clause is converted.
5. **Promote fidelity by family and risk, not alphabetical spell order.** Deepen primitives once, then regrade every
   spell that uses them. Reserve bespoke proof slices for high-impact or exceptional semantics.

This is a two-speed strategy: broad executable coverage first, semantic depth continuously underneath it. It avoids
both bad extremes—hundreds of inert catalog rows and hundreds of hand-coded mini-engines.

## 1. What “650 spells working” should mean

“Working” needs a contract. Without one, a spell can be present in a menu, consume a slot, and still fail to express
its identity. Conversely, demanding literal SRD treatment of feet, components, concentration, material costs, and
every exceptional clause before a spell may ship makes breadth unattainable.

### 1.1 Four coverage grades

Every imported spell should carry a generated grade. The grade belongs to the compiled spell and is visible to
developers and authors; player-facing wording should describe the behavior actually implemented.

| Grade | Contract | Appropriate use |
|---|---|---|
| **E0 — indexed** | Parsed, identified, assigned lists/level/school, but deliberately unavailable because no safe semantic adapter exists | Keeps the corpus complete and exposes capability demand |
| **E1 — approximate** | Castable; preserves spell role, legal target class, resource cost, primary consequence, and meaningful counterplay; every conversion or omission is declared | Fast broad coverage |
| **E2 — adapted** | Defining SRD behavior runs through shared engine semantics; Westernesse conversions are deliberate, documented, and tested by family | Normal production target |
| **E3 — faithful** | Structure and resolution pass the census, and a focused test proves recognizable play identity | High-risk, iconic, or frequently encountered spells |

An E1 spell is not a failed E3 spell. It is a supported compatibility promise. It must never be reported as faithful,
and it must not retain SRD prose for mechanics the engine does not perform.

### 1.2 Minimum E1 semantic invariant

An approximate spell must preserve all of these unless its record explicitly says otherwise:

- **role:** harm, protection, control, information, movement, restoration, creation, summoning, or transformation;
- **agency:** what the caster chooses and what the recipient can do about it;
- **eligibility:** self, ally, foe, creature kind, object, place, known person, or other genuine target category;
- **economy:** spell level, slot/use consumption, and recharge policy under the chosen adaptation;
- **primary magnitude:** bounded scaling appropriate to spell and caster level;
- **primary timing:** immediate, encounter, short field duration, long field duration, or permanent;
- **counterplay:** attack, save, resistance, immunity, dispel, interruption, or none, as appropriate;
- **persistence:** a lasting consequence survives save/reload and expires through the ordinary clock;
- **telling:** the outcome says what actually occurred, including resistance, saving, partial effect, expiry, or refusal.

It may initially convert exact feet to field positions, material components to a declared omission or inventory cost,
variable durations to a duration band, and rare secondary clauses to named omissions. It may not turn domination into
ordinary damage, divination into a cosmetic line, or transformation into unexplained stat bonuses and call that
spell supported.

### 1.3 Three independent axes

The existing structure/resolution/play-identity grades should remain. Coverage grade adds a deployment decision; it
does not replace fidelity measurement. A useful dashboard therefore reports:

1. **corpus coverage:** indexed, executable, unavailable;
2. **execution grade:** E0–E3;
3. **fidelity fields:** level, school, dice, type, save, DC, attack, target, duration, and later range/components.

This prevents the desired rapid expansion from making the current census less honest.

## 2. Current strengths to preserve

### 2.1 Deterministic generation is no longer a migration blocker

Spell selection now ranks each option by the caster's spell stream and spell id. Adding or moving one spell changes
only casters who gain or lose that spell, rather than re-indexing every subsequent draw. This was the correct
prerequisite for bulk catalog change and should remain a migration invariant.

### 2.2 Reusable combat geometry exists

Burst, cone, line, and chain establish the right pattern: a target form computes recipients; resolution then applies
the spell independently to those recipients. Area spells can catch allies, saves are per recipient, and deterministic
ordering is explicit where Westernesse substitutes for free target selection.

### 2.3 Scaling and save conversion exist

The engine can read casting level and casting score, cap dice, and convert the SRD DC into Westernesse's save scale.
These are reusable across large damage and condition families.

### 2.4 The project already distinguishes catalog presence from proof

The generated ledger grades fields and focused tests prove play identity. This discipline is unusually valuable and
must survive the breadth phase. The migration should automate more of it, not relax it.

### 2.5 Field effects use authoritative world machinery

Sleep, Raise Dead, healing, and Plane Shift demonstrate the desirable architecture: spells invoke ordinary world
state, time, travel, and creature transitions. World magic should follow that route instead of growing a second,
combat-shaped simulation.

## 3. Major problems and mitigation approaches

## 3.1 The corpus is mostly outside the migration boundary

**Problem.** Of 605 extracted SRD records, 486 have no concordance mapping. The current ledger can grade only the 119
mapped records. Absence hides demand: it is impossible to distinguish an irrelevant duplicate, a simple spell the
engine could already run, and a spell blocked by a missing semantic primitive.

**Mitigation.** Generate a complete import manifest from the extracted source. For every SRD record, record:

- canonical SRD id and inherited/function-like parent;
- arcane/divine/domain lists and levels;
- normalized school, descriptors, components, range, target/area, duration, save, and resistance;
- Westernesse identity, if any;
- semantic family and required capabilities;
- execution grade and named conversions;
- availability decision and owner.

Do not require a hand-written Westernesse catalog entry before classification. The compiler should be able to create
a generated baseline record and permit a hand entry to override it, as the existing catalog already overrides
Orsino records.

**Expected result.** Corpus coverage becomes 605/605 immediately, even though many entries begin at E0. Simple
families can then move to E1 in batches, and the remaining unavailable count becomes an engine roadmap rather than
an invisible backlog.

## 3.2 Resolution order is implicit and fragmented

**Problem.** Natural attacks have riders, spells have effects and saves, weapon attacks follow another path, and
spell resistance has no path at all. Touch attacks, Disintegrate, Acid Arrow, poison, grab, reflection, and similar
effects need ordered stages. Adding each as a spell-specific exception will multiply bugs and make telling
inconsistent.

**Mitigation: typed resolution.** Compile every ability into a stage graph over a stable recipient set:

```text
acquire targets
  → validate eligibility and range
  → pay/commit cost
  → attack?            (ordinary, melee touch, ranged touch)
  → resist?            (spell resistance or typed immunity)
  → save?              (none, negate, half, partial, repeated)
  → primary effects    (harm, heal, apply, remove, move, create, summon, reveal…)
  → secondary effects  (rider, splash, chain, wake, discharge…)
  → aftermath           (concentration, persistent area, expiry, hostile engagement)
```

Stages should emit typed events with provenance. The default compiled graph must be equivalent to today's behavior
for every existing ability before any catalog row opts into a new stage. A recipient's result should be a structured
account, from which combat prose, logs, replay, and the fidelity census read the same facts.

**Expected result.** One implementation unlocks spell resistance, touch spells, multi-stage spells, clearer
immunity, consistent partial effects, and later counterspelling and reflection.

## 3.3 There is no normalized semantic representation between SRD text and effects

**Problem.** Hand catalog entries mix identity, source conversion, targeting, effect syntax, and exceptional rules.
The source corpus is structured, but not in the same vocabulary as the runtime. Directly translating 605 records to
runtime effects would encode the same conversion hundreds of times.

**Mitigation: a Spell IR.** Introduce a generated, typed intermediate representation independent of both SRD page
layout and runtime classes. It should contain:

- identity and list membership;
- casting profile: level, school, descriptors, components, cost, recharge;
- target expression and spatial form;
- range band;
- ordered resolution stages;
- magnitude expressions over casting level;
- duration expression and concentration policy;
- typed conditions and world effects;
- explicit conversions and omissions;
- capability requirements;
- source provenance.

Adapters compile the IR to existing ability/effect records. Hand-authored overrides alter the IR, not arbitrary
downstream runtime fields. The same IR feeds validation, handbook text, developer inspection, and census grading.

**Expected result.** Most spells become data instances of a small semantic algebra. Improvements to one adapter
automatically regrade every dependent spell.

## 3.4 Time semantics are too coarse

**Problem.** Fixed combat rounds cannot express rounds/level, minutes/level, hours/level, concentration, discharge,
or permanent/instantaneous distinctions. Outside combat, converting every turn to a watch makes a minute-long Sleep
last many hours.

**Mitigation.** Add typed duration expressions:

```text
instant
rounds(fixed | perCastingLevel, cap?)
minutes(fixed | perCastingLevel, cap?)
hours(fixed | perCastingLevel, cap?)
encounter
concentration(maximum?)
untilDischarged
permanent
```

Store expiry in one world-time representation. Combat turns advance or consult that clock through a documented
conversion, while encounter-scoped effects retain a separate explicit band. Concentration becomes a maintained
relationship between caster and effect, broken by declared events. The E1 adapter may round exact durations into
short/encounter/watch/long bands, but the conversion is generated and visible.

**Expected result.** A large fraction of buffs, controls, wards, detections, and persistent areas become expressible
without bespoke conditions.

## 3.5 Targeting and range cover shapes but not the full target language

**Problem.** Current shapes cover several combat areas, but spells also choose unions and predicates: self or ally,
one or more willing creatures, living creatures, humanoids, objects, places, known people, touched recipients,
creatures below a Hit Dice limit, and secondary recipients within a range of the first. Exact range is mostly absent
from the fidelity grade.

**Mitigation.** Separate four concerns:

1. **eligible kind:** actor, member, group, object, place, threshold, known person;
2. **predicate:** living, undead, willing, hostile, humanoid, alignment proxy, size, Hit Dice, condition held;
3. **selection:** one, up to N, all eligible, one per level, primary plus secondaries;
4. **geometry/range:** self, touch, near, field, sight, remote, burst, cone, line, chain, emanation.

The UI should consume projected legal target choices from the engine rather than interpret these expressions itself.
For E1, feet can compile into stable range bands. Range-band conversion must still affect legality; it cannot be
flavor text.

**Expected result.** Target-only blockers disappear, remote and object magic obtain a real path, and presentation
does not need spell-specific pickers.

## 3.6 Conditions are named more often than they are semantic

**Problem.** Insight, focus, invulnerability, spell turning, disabled states, detection, and several protections are
represented as condition names whose modifiers or hooks the engine cannot execute.

**Mitigation.** Make a condition a composition of typed contributions:

- numeric modifiers to attacks, armor, saves, DC, damage, speed, or action count;
- permission/prohibition hooks;
- immunity, resistance, reduction, reflection, or suppression;
- perception and knowledge grants;
- allegiance or attitude overlays;
- triggered stages on attack, damage, save, casting, turn start/end, movement, or expiry;
- links to caster, source ability, chosen subject, and concentration;
- dispel tags and stacking category.

Prefer a small vocabulary of hooks to condition-specific code. Validate that a condition with no executable
contribution cannot be attached by an E1+ spell unless its sole purpose is a world fact explicitly consumed
elsewhere.

**Expected result.** Divinations, wards, turning, immunities, and buffs can be imported as data, and inert statuses
become compiler errors rather than false support.

## 3.7 World magic has no common effect interface

**Problem.** Maze, teleportation, Sending, divination, creation, terrain alteration, and time magic are not naturally
combat effects. Treating them as conditions or damage loses their identity. Plane Shift proves a better route but is
currently a special slice.

**Mitigation.** Define a small set of authoritative world effects used by spells and ordinary actions alike:

- `travel` and `banish`;
- `contact`, `send`, and `observe`;
- `reveal` and `ask` against world knowledge;
- `create`, `transform`, `restore`, and `destroy` entities;
- `open`, `close`, `ward`, and `alter` passages or places;
- `advance`, `suspend`, or schedule bounded time consequences;
- `bind`, `release`, and change a relationship or attitude.

Each effect must resolve through existing Campaign facts and events, persist normally, and expose authorable hooks.
An E1 adapter may narrow broad SRD freedom—for example, Plane Shift uses known thresholds—but should preserve the
spell's world-changing role.

**Expected result.** Non-combat spells become first-class play rather than unavailable curiosities or combat-shaped
approximations.

## 3.8 Transformation, illusion, and summoning lack models

**Problem.** Polymorph and Shapechange cannot safely be bundles of temporary modifiers; phantasms are not ordinary
creatures; summoned creatures require ownership, placement, behavior, and expiry.

**Mitigation.** Build three related but distinct abstractions:

- **form overlay:** which body, statistics, movement, attacks, traits, equipment, and identity are retained,
  replaced, or suppressed;
- **manifestation:** an entity or aspect with a source, controller, disbelief/revelation rules, interaction limits,
  and expiry;
- **summoned participant:** a normal transactional creature with summoner, allegiance, initiative/placement,
  command policy, dismissal, and return.

For E1 breadth, offer curated form and summon profiles rather than arbitrary access to the entire bestiary. Do not
label a cosmetic condition as Polymorph.

**Expected result.** Large blocked families gain safe approximations and later fidelity can deepen the same models.

## 3.9 Components, costs, and recharge are not consistently part of casting

**Problem.** Material and focus requirements, expensive components, once-per-day behavior, and recovery policy are
commonly omitted. The engine has a recharge enabler, but catalog spells do not broadly declare it.

**Mitigation.** Put costs in the resolution transaction before effects:

- slot/use;
- inventory item, quantity, or value band;
- held focus that is required but not consumed;
- casting time/time advance;
- recharge policy;
- optional E1 conversion such as `cost omitted`, `rare component`, or `focus required`.

Failure to pay must prevent the cast before the world changes. Handbook and UI should derive requirements from the
same record.

**Expected result.** Raising, restoration, creation, and powerful divinations receive meaningful economy, while
approximate imports state which costs were intentionally deferred.

## 3.10 Spell definitions are not authorable enough

**Problem.** Kyr can teach a known spell but cannot define one. A 600-spell migration concentrated in central JSON
and TypeScript makes every new semantic family an engine-team bottleneck.

**Mitigation.** Expose the Spell IR/effect algebra through a validated authoring form. It need not begin as free-form
Kyr syntax. A schema-backed catalog declaration is sufficient if it supports:

- reusable target, duration, magnitude, and resolution templates;
- named condition and world-effect references;
- source and conversion notes;
- compiler errors for missing capabilities;
- generated handbook text and test fixtures.

Later, Kyr syntax can compile to the same IR. There must remain one execution semantics.

**Expected result.** Content authors can add or adapt spells without writing engine code, while validation prevents
invented or inert mechanics.

## 4. A bulk migration architecture

## 4.1 Pipeline

```text
SRD extraction (605 records)
        ↓
canonicalization and inherited-page expansion
        ↓
Spell IR + source provenance
        ↓
semantic-family classifier and capability requirements
        ↓
generated Westernesse adaptation profile
        ↓
hand override, where genuinely exceptional
        ↓
validated ability/effect compilation
        ↓
coverage manifest + handbook + fidelity census + test matrix
```

The pipeline must be reproducible. Generated records are never edited directly. Overrides should be small diffs over
the normalized record, so source updates and engine improvements can be reapplied.

## 4.2 Semantic family adapters

The fastest route to broad coverage is to order adapters by likely corpus leverage. Exact counts should be generated
from the Spell IR rather than estimated by hand.

| Adapter family | Baseline E1 behavior | Deeper semantics added later |
|---|---|---|
| Direct damage | scaling dice, type, target/shape, attack/SR/save, cap | objects, ignition, barriers, unusual secondary effects |
| Healing/restoration | scaling healing or typed removal | undead reversal, costly components, level/ability restoration |
| Bonus/penalty | typed condition, stacking category, duration | conditional bonuses, discharge, complex exclusions |
| Control | typed condition, save, repeated/partial save, wake/break condition | persistent areas, commands, allegiance nuances |
| Protection | armor/save/resistance/immunity contribution | absorption pools, reflection, school/alignment filters |
| Detection/divination | reveal typed knowledge in a range band | questions, probability, remote sensors, false information |
| Dispel/counter | remove/suppress matching effects by check | area dispels, counterspelling, artifacts and exceptional immunity |
| Movement | relocate within field or world threshold | exact range, unwilling targets, planar error, carrying limits |
| Creation | create a typed temporary/permanent item or terrain aspect | quantities, quality, economy, fabrication constraints |
| Summoning | curated participant profile, controller, duration | selectable summons, placement, command and dismissal detail |
| Transformation | curated form overlay | arbitrary forms, equipment and extraordinary ability rules |
| Communication | choose eligible known subject; authoritative contact event | distance/plane failure, reply limits, interception |
| World alteration | invoke a typed place/passage/time effect | spell-specific exceptional clauses |

Do not begin with a perfect parser of arbitrary spell prose. Classify from structured SRD fields plus maintained
concordance annotations. Ambiguous records should remain E0 or receive a reviewed adapter assignment.

## 4.3 Approximation profiles

Bulk migration needs a small, explicit Westernesse conversion policy:

- feet and miles → touch/near/field/sight/remote bands;
- rounds/minutes/hours per level → exact expression where supported, otherwise declared timing band;
- grid areas → position shapes and recipient rules;
- SRD DC → the established Westernesse DC conversion;
- alignment → named Westernesse affiliation/trait where one exists, otherwise a declared broadening;
- material components → item/focus/value band or named omission;
- concentration → maintained effect, or a fixed conservative duration until the relation exists;
- free selection among many targets → deterministic legal order only where UI choice is not yet available;
- exact creature menus → curated summon/form profiles;
- unsupported secondary clause → omit and record, never silently retain it in description.

Each conversion has an id and version. A spell refers to the conversion rather than repeating prose. When a
conversion improves, the migration tool reports every affected spell and the census regrades them.

## 4.4 Capability ratchet

The compiler should maintain a finite registry of semantic capabilities, for example:

```text
attack.meleeTouch
attack.rangedTouch
resist.spell
duration.perCastingLevel
duration.concentration
target.object
target.knownPerson
area.persistent
effect.dispel
effect.createItem
effect.summon
effect.transform
effect.reveal
effect.contact
condition.reflectSpell
```

Every Spell IR record declares what it requires. Compilation produces:

- E1+ when every required capability has an adapter or declared conversion;
- E0 with a precise list when it does not;
- an error if a spell claims executable behavior that no runtime consumer owns.

This turns the remaining corpus into a ranked capability-demand report. It also makes engine work measurable: adding
one capability reports how many E0 records become candidates for E1 and how many existing spells can be promoted.

## 5. Verification without 650 bespoke tests

The project should not write one handcrafted integration test per spell. It should also not trust schema validity as
proof of execution.

### 5.1 Contract tests per primitive and adapter

Each resolution stage, target form, duration, condition hook, and world effect receives focused semantic tests with
faults put back. Each family adapter has representative fixtures covering its branches.

### 5.2 Generated spell matrix

For every executable spell, generate a minimal compatible caster and legal target/world fixture, then assert:

- the spell is offered when affordable and not otherwise;
- cost is committed once;
- every declared stage executes in order;
- success, save/resistance, and immunity paths are reachable where declared;
- magnitude stays within the compiled bound at representative casting levels;
- targets match the target expression;
- duration expires or persists as declared;
- save and reload preserve the result;
- narration/account names the actual result;
- deterministic replay is identical.

This is a schema-driven conformance suite, not a claim of play identity.

### 5.3 Equivalence tests before pipeline replacement

Typed resolution touches every ability. Before switching existing records to it, run the old and new path across the
entire current catalog and a matrix of target states and seeds. Events, costs, state, and telling must agree unless a
record explicitly opts into a changed capability.

### 5.4 Family-level play proofs

Use one or a few deep scenarios per semantic family: an area evocation, touch ray, control with repeated save,
dispel, summon, transformation, remote communication, and world travel. These prove the adapter's play identity.

### 5.5 Risk-based spell proofs

Retain bespoke E3 slices for spells that are:

- frequently encountered or available at character creation;
- capable of bypassing sites, travel, death, economy, or information boundaries;
- highly variable or open-ended;
- iconic enough that a rough substitution would violate player expectation;
- known to move generated encounters or recorded journeys materially.

This reduces bespoke review from hundreds of spells to exceptional spells and representative families.

## 6. Prioritization

## 6.1 First engine tranche: breadth-enabling kernel

1. Spell IR and complete corpus manifest.
2. Typed resolution pipeline with provenance and structured result accounts.
3. Melee/ranged touch and spell resistance stages.
4. General target expressions and range bands.
5. Duration expressions and one combat/world-time policy.
6. Typed condition contributions and stacking.

This tranche should target the largest executable subset, not a particular list of showcase spells.

## 6.2 Second tranche: high-leverage families

1. Direct damage and healing/restoration.
2. Bonuses, penalties, protections, and ordinary conditions.
3. Condition removal, dispel, and suppression.
4. Detection and knowledge revelation.
5. Persistent areas and concentration.

These families should move a large majority of conventional combat and utility magic to E1/E2.

## 6.3 Third tranche: world semantics

1. Movement, banishment, and planar travel.
2. Communication and remote observation.
3. Item and terrain creation.
4. Summoning and manifestations.
5. Transformation.
6. Exceptional time and reality alteration.

These are lower-volume but architecturally deeper. Their engine models should serve ordinary authored actions as
well as spells.

## 6.4 Fidelity promotion

In parallel with each tranche:

- promote the commonest starting spells first;
- promote spells installed on encountered creatures;
- promote spells used by adventures and recorded journeys;
- then promote by family leverage and player expectation;
- leave rare, open-ended exceptions at honest E0/E1 until their semantics earn an engine model.

## 7. Delivery plan and gates

### Phase A — inventory and normalization

**Deliverables**

- 605/605 records in the generated manifest;
- inherited/function-like pages expanded;
- every record classified by family and capability demand;
- current 119 mappings preserved;
- generated dashboard and diff.

**Exit gate:** no SRD spell is invisible; every record is mapped, intentionally excluded, or blocked for named
capabilities.

### Phase B — typed execution kernel

**Deliverables**

- typed stage graph;
- structured result/provenance account;
- equivalence path for existing abilities;
- spell resistance and touch attacks;
- generalized targets, durations, and condition contributions.

**Exit gate:** existing catalog behavior is equivalent by default, and representative new spells use every new
stage with mutation-checked tests.

### Phase C — broad E1 catalog

**Deliverables**

- generated baseline catalog records;
- common family adapters;
- approximation profiles and actual-behavior descriptions;
- generated conformance suite;
- unavailable records reduced to genuinely unsupported semantic families.

**Exit gate:** a large majority of the 605 records are safely castable at E1 or above, with no inert condition or
unconsumed effect accepted by the compiler.

### Phase D — world magic and exceptional families

**Deliverables**

- world-effect interface;
- divination/communication;
- creation;
- summoning/manifestation;
- transformation/form overlays.

**Exit gate:** unavailable spells are exceptional rules, not whole common families.

### Phase E — fidelity and product integration

**Deliverables**

- risk-based E3 slices;
- encounter and creation-card censuses;
- handbook and UI derived from compiled semantics;
- author-facing spell declaration and inspection;
- performance and balance review.

**Exit gate:** fidelity claims, player wording, and executable behavior agree; frequently met and identity-critical
spells are E2/E3.

## 8. Measures of progress

The dashboard should report at least:

| Dimension | Measures |
|---|---|
| Corpus | total, indexed, mapped, executable, unavailable, intentionally excluded |
| Grade | E0/E1/E2/E3 counts and movement since baseline |
| Fidelity | structure, resolution, play identity, plus per-field totals |
| Capability | spells blocked by each missing capability; spells unlocked by the last change |
| Families | executable and unavailable counts per semantic family |
| Product reach | creation spells, installed casters, placed encounters, adventure references |
| Quality | generated conformance pass rate, family proofs, bespoke proofs, deterministic replay |
| Risk | spells with omitted primary clauses, misleading descriptions, inert effects, or unowned runtime hooks |

The primary breadth measure should be **executable E1+ records / applicable corpus**. The primary correctness measure
should remain **resolution-pass records / mapped counterparts**. Reporting both prevents breadth from masquerading as
fidelity or fidelity work from hiding limited reach.

## 9. Principal risks and controls

### Approximation becomes permanent accidental design

**Control:** versioned conversion ids, visible grades, capability-demand reports, and a promotion backlog. Never copy
approximation prose into a supposedly faithful source field.

### Generated imports overwhelm balance and character generation

**Control:** separate “executable in the engine” from “available on Westernesse lists.” Import and test the corpus
first; curate list membership and rollout independently. Stable ranked draws limit but do not remove balance changes.

### Typed resolution becomes an over-general workflow engine

**Control:** keep the stage vocabulary small and domain-specific. Exceptional world effects are typed terminal
effects, not arbitrary callbacks. New stages need evidence that several mechanics share their ordering requirement.

### Descriptions promise omitted behavior

**Control:** generate mechanical summaries from compiled semantics. Preserve SRD source text for reference, but show
adapted player text whenever behavior differs.

### Automatic classification invents semantics

**Control:** classification may propose, never silently approve. Ambiguous records remain E0 until a family or
override is reviewed. The compiler validates structure; review owns meaning.

### The compatibility layer forks from the faithful engine

**Control:** E1, E2, and E3 compile through the same Spell IR and typed resolution. Fidelity adds more precise data
and capabilities; it does not select a second executor.

### Full-catalog tests become too slow

**Control:** primitive and representative adapter tests run in the push lane; generated full-matrix tests shard in a
scheduled or parallel lane, with a deterministic reduced sample available locally.

## 10. Recommended decisions

1. **Adopt the E0–E3 execution-grade contract.** It gives “roughly correct” a defensible meaning.
2. **Treat 605 as the present exact source denominator and approximately 650 as the product-scale target.** Recompute
   the denominator from extraction; do not maintain it by hand.
3. **Authorize generated baseline spell records.** Hand-author only overrides and exceptional semantics.
4. **Make typed resolution the next central engine investment.** It has the greatest cross-family leverage.
5. **Build the complete manifest before attempting more isolated spell slices.** The engine roadmap should be driven
   by how many records each missing capability blocks.
6. **Separate engine support from Westernesse availability.** A spell may be executable and tested without entering
   player creation, NPC draws, or loot immediately.
7. **Require actual-behavior wording and explicit omissions for every E1/E2 adaptation.** Approximation must be
   trustworthy.
8. **Test adapters and primitives exhaustively; test individual spells by generation and risk.** Do not demand 650
   bespoke scenarios.
9. **Make spell definitions authorable through the normalized schema.** Bulk migration cannot remain a TypeScript
   bottleneck.
10. **Continue the generated fidelity ledger unchanged in purpose.** Breadth is a new axis, not a relaxed standard.

## Final assessment

The project should not choose between a semantically serious engine and a broad spell catalog. It should change the
unit of work.

Today the unit is often one spell plus one proof slice. The future unit should be a typed semantic capability, a
family adapter, and every spell that capability unlocks. A complete generated manifest makes the demand visible; a
Spell IR makes it expressible; typed resolution makes composition correct; conservative approximation profiles make
breadth possible; and the existing fidelity census prevents breadth from becoming self-deception.

On that architecture, approximately 650 working spells is plausible. Without it, 650 spells means either years of
bespoke migration or a large catalog whose entries consume slots while only pretending to be the spells named.
