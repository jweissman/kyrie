# The installed domain: semantic authority in Kyr, acceleration in TypeScript

**A design note, starting from conditions.** It records the owner's direction of 27 November: "Kyr declarations
should be the authoritative source of installed-domain ontology, with a generated, strongly typed, optimized
TypeScript representation where appropriate." The invariant: **the runtime does not need to import Westernesse to
understand an installed Westernesse domain.** A minimal Tethys domain proves the same mechanism with a materially
different ontology.

This is a direction for implementing the intended architecture. It is not a move of the rules into a generic
evaluator. It keeps the beta work and the package-separation sequence (platform-separation.md) as they are: this is
stage 3, "canon behind the setting port", given its form.

## Three layers

| Layer | What belongs to it | Who may change it |
|---|---|---|
| **1. Intrinsic Kyr** | Entities, kinds and their parents, relations, measures, state, actions, effects (one statement grammar, OR-1333), identity, time (one clock, OR-1331), knowledge (witnessed, never written by an arbitrary rule), execution, and one intrinsic form this note adds: the **overlay** | The language (src/lang), with census and parity proofs |
| **2. Installed domains** | Rule packages (data/rules, BX-02): the fantasy rules (SRD), physics, biology, organizations, a setting's own. Each declares its kinds, measures, verbs, conditions and rules in Kyr. Westernesse installs the fantasy rules and its own additions; Tethys installs its own. Authors may import standard ontologies the same way | The domain's authors, in Kyr |
| **3. Runtime acceleration** | TypeScript implementations of intrinsic operations: compiled indexes, cached predicates, specialized loops (a fight's turn, a journey leg), keyed by intrinsic operations and given domain *handles* at installation | The runtime, never adding meaning |

**Semantic authority resides in Kyr source alone.** What a condition is and does is in Kyr. This covers which
measures it moves and by how much, what it does each turn or hour, and how it ends. TypeScript may compute *with*
that meaning, fast. It may never *hold* it: no domain identity, number or rule written in runtime code.

## Conditions today

- **The data:** `data/catalog/conditions.json` (59 entries) and Orsino's generated set, merged by `Canon`
  (src/canon/canon.ts), a setting module.
- **The schema:** the condition's schema (src/rules/catalog-schema.ts) holds the SRD's vocabulary as TypeScript
  fields: `toHit`, `ac`, `saves`, `attributes`, `resistances`, `onTurnEnd`, `noActions`, `concealment`.
- **The port:** the runtime asks through the `ConditionDomain` port (src/ports/conditions.ts), answered by the
  installation in scope (src/ports/installed.ts).
- **Inferred tone:** `Conditions.tone` infers whether a condition helps or hurts by weighing those fields.

The port is right; what it carries is not. The meaning is split between a JSON catalog and a TypeScript schema
that *is* the fantasy ontology. So the runtime understands `ac` and `saves` intrinsically, and Tethys could
not install a condition over a ship's speed without editing the runtime.

## The overlay: the one intrinsic form

A condition generalizes to a **reversible, typed overlay on a stable identity**. The gamma study's first
highest-leverage improvement, the same form, carries:

- enchantment;
- curses;
- temporary forms (OR-1205);
- borrowed capabilities;
- and conditions.

An overlay, declared in Kyr:

- **bears on** an entity of a kind (a creature, a ship, a place), whose identity never changes;
- **modifies declared measures** of its bearer, by a value or an expression (the domain's measures: `ac` is the
  fantasy rules', `speed` is Tethys's);
- **grants or withholds capabilities**: it gates actions through relations, as `noActions` does today;
- **recurs**: an effect each turn, watch or hour, in the one clock (OR-1331);
- **ends** by a duration, a save, a rule or an act; and everything it did ends with it. The gamma probe's cat form
  that outlived its climbing is the failure this forbids;
- **is witnessed and told**: its onset and end are facts the narration and the knowledge boundary read.

Illustrative only; the syntax follows OR-1333's grammar when it settles:

```text
Measure ac(creature) higher is better.
Overlay poisoned on creature "Poisoned" {
  Each turn: Deal 2 poison to it.
  Ends when cured(it, poison) or a save of constitution against 11 succeeds.
}
```

and, in Tethys:

```text
Measure speed(ship) higher is better.
Overlay becalmed on ship "Becalmed" {
  Modifies speed(it) by -3.
  Ends when wind(here) is fresh.
}
```

The **polarity** of a measure ("higher is better") is the domain's declaration. So whether an overlay helps or
hurts is *inferred* by the intrinsic machinery from what it does, as facets are, never declared by its author.
`Conditions.tone`'s field-weighing becomes an intrinsic inference over any domain's overlays.

## What is compiled

Installation compiles each domain's declarations once into runtime structures:

- **An overlay index per bearer:** which overlays are active, and their net modifier per measure, kept incrementally
  by the reads it rests on (KeptReading, the incremental frame's mechanism).
- **Measure handles:** each declared measure resolved to a slot. A fight's turn reads the measure's slot in the
  bearer's modifier index, not a field or a name.
- **Recurring-effect schedules,** by clock.
- **Ending predicates,** compiled as cached predicates, re-tested only when their reads change.

Compilation is deterministic and keyed by the domain's declarations. Its cache follows #16's rule: by declaration
content, never installation identity.

## What TypeScript may accelerate, and how the face stays honest

TypeScript may:

- implement every intrinsic operation (sum an overlay index, apply a recurring effect, resolve a save, roll dice,
  order initiative);
- specialize hot paths: a fight's turn loop, a journey leg;
- hold domain *handles*, opaque ids resolved at installation, and use them in indexes.

TypeScript may not:

- name a domain identity in runtime code: `'poisoned'`, `'ac'` or `calling_warrior` as string literals in src/campaign,
  src/rules or the root engine files;
- hold a domain value: a modifier, a duration, a damage;
- decide a domain rule: what a condition does, when it ends.

**The generated face (OR-744)** gives TypeScript typed access to an installed domain's declarations. It must never
become a parallel source of truth:

1. **Generated, never edited.** It carries a header naming its source declarations and their content digest. A spec
   fails when it is stale, as the Orsino coverage report's does.
2. **Identities and types only.** The face holds handles, kind and arity types, and accessor signatures. It never
   holds values, numbers or rules. A face that carries a modifier is a lint failure.
3. **Optional for correctness.** Every behaviour must be reachable through the installed context without the face.
   The face exists for types and speed, and a spec runs a fight with the face's fast paths off and compares.
4. **Per installation.** Two campaigns with different domains get different handles from the same face shape. A face
   is never "the" fantasy domain baked into the runtime.

## How we hold it: the ratchets

- **Layer edges:** runtime → setting edges for conditions fall to zero (scripts/layers.ts), then for every family.
- **A domain-literal census:** string literals of an installed domain's identities in runtime code, counted by file,
  only falling. It works like the knowledge door's census, and is seeded from conditions first.
- **Parity:** a condition battery. Every condition applied in seeded fights and world hours, its outcomes digested
  before and after, as the ability census (414) holds #16's verbs. It passes with zero differing, and the kept traces
  stay unmoved.
- **The face's staleness spec,** and its spec with the fast paths off.
- **Performance:** the fight and leg medians held by the experience gate. No slice lands slower than its band.

## Order of work, conditions first

1. **The census and the battery.** Count condition literals in runtime code, and digest every condition's
   behaviour. Nothing moves.
2. **Measures declared, with polarity,** in the fantasy package: `ac`, `toHit`, saves by attribute, resistances. The
   schema's fields map to them. Behaviour is identical.
3. **The overlay, intrinsic**, compiled to the per-bearer index. Static modifiers go first (the `toHit`, `ac` and
   saves families), read by the fight through measure handles. The battery passes with zero differing.
4. **Recurring effects and endings** (`onTurnEnd`, saves to end, cures) in the one clock. This depends on OR-1331's
   one notion of duration, so it lands no sooner.
5. **The conditions declared in Kyr** in the fantasy package, generated from Orsino (`bin/kyrie orsino catalog` emits
   Kyr). A hand entry still replaces a generated one only by naming the same `source.orsino`. The JSON becomes a
   generation source, not runtime data.
6. **The port answered by the installed domain;** `Canon` no longer answers it. The edge count falls, and the literal
   census reaches zero for conditions.
7. **Tethys's minimal domain:** a ship, two measures and two overlays (becalmed, a fouled hull), played through the
   shared lifecycle with no canon. That proves the invariant.
8. **Then the next families**, each by the same steps: traits, then callings and ancestries (overlays and grants on a
   creature), then abilities (already verbs, #16).

Each step lands alone, behind its ratchet, without interrupting the Game or World streams.

## Open questions, decided as the slices meet them

- **Where expressions are evaluated:** an overlay's modifier expression ("half its level") compiles to a closure
  once. It is not interpreted per read.
- **Stacking rules:** the SRD's "the same condition does not stack" is a fantasy-domain declaration, not an intrinsic
  one. The overlay machinery needs an intrinsic stacking *policy* slot that a domain fills.
- **Fight-only overlays:** Orsino's encounter-long conditions become overlays whose duration is the fight's, in the
  one clock, not a separate mechanism.
- **The narration of onset and end:** a domain's words, through the presentation port, never the runtime's.
