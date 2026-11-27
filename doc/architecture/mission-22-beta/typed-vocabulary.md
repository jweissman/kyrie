# Kyr's typed vocabulary: one declaration, two faces

**Design for lead review, 27 November.** OR-744 asks for typed TypeScript accessors; OR-1332 asks modules to declare
verbs and their lowerings; OR-1333 asks for one statement grammar. They are consumers of one installation-scoped
declaration model, not two independent vocabularies. This is a proposal, not authority to build the first slice
before the lead approves it.

## What is declared

The following are illustrative Kyr forms, not syntax accepted today:

```text
Kind creature.
Kind member extends creature.
Kind ability.
Relation knowsSpell(member, ability).
Measure hp(creature).
Verb teach(spell: ability, target: member) "Teach {spell} to {target}"
  lowers to Assert knowsSpell(target, spell).
Verb heal(amount: number, target: creature) "Heal {amount} health to {target}"
  lowers to Increase hp(target) by amount up to maxHp(target).
```

`Kind` declares a nominal type, optionally with parents; reject unknown parents and inheritance cycles. A relation
has ordered kind identities and returns a fact; a measure has ordered kind identities and returns a number. Existing
`Relation r(kind)` and its named-parameter form remain valid; `Measure` today takes kind names. An explicit
`number` parameter is a value type, not a world entity kind. A verb has named, typed parameters, a phrase template
whose slots name those parameters, and a typed lowering. An unknown, repeated or unbound slot is a diagnostic.
The `up to` clause above is a desired shape, not an existing `Change`; it needs OR-1333's statement work rather
than an assumed implementation.

Build a declaration index first, then resolve parameter kinds, parent edges and lowering names to declaration
identities. Validate arity, assignability, numeric operands and relation-versus-measure use; report unknown or
ambiguous names, incompatible arguments and recursive verb expansion with source positions. A binding includes its
declaring module and origin, not merely its spelling. Lowered changes retain the call's and declaration's origins.
Unresolved, ambiguous or unsupported constructs fail compilation explicitly; they must never produce an empty
success-shaped lowering.

## Installation and composition

Build from parsed files and an **explicit required catalog context** for one installation: no ambient current
catalog and no regex dependency discovery. First collect declarations in every file of a module, then bind within
that module, its explicitly bound imports and the shared rules it names. Sibling files have the same module scope.
Local shadowing follows existing `ModuleShadow` behavior: authored local uses bind local declarations; language-
generated uses intended for shared rules retain that shared identity. Imported names bind the specified installed
export, not any other same-spelled declaration. Locals in two installations are distinct even when the authored
module is the same. A local spelling shared with rules is reported by the existing redefinition lint; do not silently
change its diagnostics during this slice.

On campaign composition, validate shared declarations and imports by identity and signature; permit only the
existing identical shared-relation deduplication, and report conflicting candidates and both origins rather than
picking by order. Map authored identities to installed identities before execution. Snapshot the definitions used
to generate and bind; a changed rules edition, signature, parent, phrase, lowering, import, negative lookup or
namespace membership must invalidate the affected cached result. In particular slot-existence queries need their
own tracked dependencies. Two campaigns with different catalogs or rules compile and bind independently, including
on cache hits. Preserve current load behavior until each change has a parity proof.

PR #8 provides an initial table, not all of this contract: its signatures are strings, external bindings lack
identities, imports and reference coverage are incomplete (OR-1371), and reference spans are declaration-level
(OR-1370). Extend it only as needed for a proof slice; do not treat an unclassified occurrence as successfully bound.

## Ability sentences and effects

`Abilities.ohm` currently has one hard-coded PEG alternative per action; `AbilityParser` makes `Effect` objects.
Instead, a fixed shape rule reads a verb head and the generic operands, target, save and condition shapes. A
per-installation index looks up the head once; a validated phrase template binds its typed slots. Prefix indexing
and compiled templates avoid trying every installed verb per sentence. Reject overlapping templates that cannot be
distinguished rather than relying on declaration order. Preserve existing spelling, target forms, punctuation,
conditional and save semantics. Test ambiguous heads, missing verbs, multiple templates, and diagnostics with their
actual input positions. The target resolver still handles `self`, `party`, `it` and `here` according to the existing
execution context; those are not assumed to be ordinary entity literals.

The bound verb lowers once to typed statements. Execution and `EffectDomain.lower`/`Outcome` consume the same bound
changes, including target, condition, save and cost; facets infer opportunities from those changes, never the word.
Forecasting does not itself mutate state. `src/ports/effects.ts` currently exposes an optional domain `lower`,
and `Canon.lower` handles damage, `try` and `apply`, **not** `learn`; its absence is not evidence that Teach has a
world effect. Migrate one verb at a time and preserve combat behavior and the ability census; do not pretend all
other effects already share world semantics. Fight-specific moves such as **Defend** and **Flee** stay in
TypeScript as fight operations, rather than inventing world changes for them.

**Teach's compatibility obligation.** Today `AbilityParser.Learn` produces `{kind: 'learn', ability, target}` and
`Effects` adds that ability to a fighter if absent and emits its learn detail. The shared rules currently declare
`learned(member, ability)`, not `knowsSpell`. The requested first slice must establish the fantasy module's
`knowsSpell` declaration and a tested mapping to actual learned-ability state; it must not merely add a disconnected
fact or replace the fighter update with one. Prove successful and repeated teaching, target selection and emitted
detail, persistence and a later read/cast, and forecasted writes agree with execution. If that mapping cannot be
made without changing the existing contract, stop and report it rather than claim parity. The census remains at
least its current floor, with no printed sentence differing; its round trip alone does not prove execution.

## Parse cost: measured baseline and estimate

On this checkout, 27 November, `AbilityCensus.entries()` contains 412 hand and generated catalog entries, counted
separately as in `test/small/abilities-said.test.ts`. Of these, 31 already have an authored effect string and the
printer can express the rest of the 216 sentence inputs; 196 entries cannot yet be printed. After three warmups,
15 warm in-process passes calling `parseAbility` on all 216 sentences (14,226 characters) took **31.43 ms median**
(30.84–37.78 ms range), about **0.146 ms per entry**. This includes parsing, AST creation and Deem validation,
not catalog loading or grammar-recipe construction. The census reports 216 equal, zero differing. It is not a
whole-world startup measurement and does not measure the 196 unprintable entries.

With an indexed head and precompiled template, the additional lookup is expected to be O(1) per sentence plus
matching the selected phrase's length, rather than O(number of verbs). The current PEG alternatives already reject
most keywords quickly, so no speedup is assumed. The proposed parser is not built: **no measured after value is
available**. Measure the same inputs and counts, warm and cold recipe/installation costs, and growth with multiple
verb counts before landing; compilation must not regress. Preserve the existing census denominator and ratchet.

## TypeScript face

Generate deterministic, checked-in TypeScript descriptors and typed read helpers from resolved symbol identities
and ordered signatures of an explicit rules-set manifest, for example under `src/generated/vocabulary/`. The
generator is a build/tooling consumer of Kyr's public entry; runtime interfaces stay generic and setting-neutral.
An illustrative generated call is `rules.knowsSpell.related(world, member, ability)`: wrong spelling, arity, kind
or relation/measure operation fails typechecking. Typed handles carry nominal kind information, including declared
subtypes; no cast converts arbitrary strings into trusted handles. A runtime checked lookup is required for
generated or dynamic entities and optional installations. Bind generated source identities against the active
installation's signatures before use; mismatch or missing declarations are explicit errors, not another campaign's
same-spelled word. `DeclaredReads` and explicit optional reads remain the guard for dynamic strings.

The manifest, module sources, catalog context and compiler version define generation inputs. Provide a generator
with write and check modes and a small stale-output spec, analogous to `scripts/grammar-recipes.ts` and
`test/small/grammar-recipes.test.ts`; never hand-edit generated files. Derive a reproducible census of direct
shared-rule string reads and hold its checked baseline so it can only fall. The 849 in OR-744 is historical, not
assumed to be today's count: measure the current denominator first, specify exclusions and retain the same scope.
Migrate one real family at a time with negative typecheck fixtures and behavioral parity, lowering the ratchet
only after callers change. Do not generate a fantasy-shaped member on the language's generic `Vocabulary` interface.

## Ordered landings and acceptance

1. **After lead approval: first slice.** In a minimal-prelude fragment, bind typed relation signatures and reject an
   unknown kind, wrong arity and incompatible argument with positions; include a successful cross-module use. Add
   the fantasy `Teach` declaration and its lowering to `knowsSpell`, with the compatibility proof above, and remove
   Teach's hard-coded grammar alternative. Compare before/after effects over the entire 412-entry ability census:
   at least 216 round trips, zero differing, and the same executable Teach behavior. Guard the language entry-first
   and deep-import contracts; measure parse cost again.
2. Resolve remaining kind, import and source-identity obligations needed by each generated family; generate one
   typed relation/measure family, prove negative typechecks, runtime installation isolation, stale generation and
   unchanged reads, then migrate and ratchet. Do not claim OR-744 complete on a single family.
3. Move other domain verbs one at a time with execution/forecast parity. Unify statement shapes under OR-1333 as
   their semantics are proven, including saves, duration and bounded measures. Only close each register row on its
   full acceptance.

Out of scope for the first slice: implementing the entire wishlist, migrating all 849 historical reads, changing
fight moves, rewriting shadow lowering or cache keys, setting-specific kernel APIs, and claiming that all
generated-world references are bound. The lead reviews this design before any of the implementation above begins.
