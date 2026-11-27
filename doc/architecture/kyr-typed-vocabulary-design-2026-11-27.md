# Typed vocabulary on Kyr's symbol table

The commissioned design for review is [mission-22-beta/typed-vocabulary.md](mission-22-beta/typed-vocabulary.md);
it supersedes this earlier outline where the migration order differs.

**For review, not an implementation.** OR-744 asks for generated typed access to kinds, relations and measures;
OR-1332 asks modules to supply verbs, their phrases and their lowerings. This proposes a narrow route from one to
the other. The grammar supplies statement shapes; an installed domain supplies vocabulary, not kernel members.

## Contract

Generate a TypeScript contract from the **resolved declarations of a specified rules module set** and its required
catalog context. A relation descriptor contains its declaration identity, ordered argument-kind identities and
arity; a measure also has a numeric value. A kind descriptor identifies its declaration and its assignability to
other kinds. Generated names are conveniences, not identities: the runtime descriptor identifies the declaring
module and namespace, and installation maps that source identity to its installed identity.

An illustrative API, not proposed syntax to ship:

```ts
// Generated for a particular rules set, never from whatever campaign happens to be active.
rules.at.related(world, party, room);
rules.hp.value(world, member);
```

`at`'s descriptor determines the order and kinds of its arguments; `hp` identifies a measure rather than a relation.
Kind-specific handles distinguish, for example, a party from a room. A known mismatch or misspelled generated member
fails TypeScript checking. Where Kyr permits a subkind, the generated types admit the declared kind relationship;
they must not infer one from a name. The API's exact operation shapes should follow the actual read being migrated
(`related`, `relatedTo`, `one`, or a measure), not imply that all of these are equivalent. Queries remain separate
from stored relations. Existing declared-read checks remain for dynamic and optional string reads.

The generated types describe a **known static rules set**, not every possible generated campaign. An installation
constructs its runtime vocabulary from its own table and explicit context. A descriptor must be validated against that
installation's declarations and signature before use: a type from another rules edition or installation must not
silently read the same spelling with a different meaning. Dynamic names, optional modules, runtime-generated entities,
and data loaded after TypeScript was compiled need checked resolution that returns a binding or an explicit error;
TypeScript alone cannot prove their presence or kind. No ambient catalog or process-wide vocabulary is a fallback.

## From kinds and relations to verbs

A later module-owned verb declaration has a stable declaration identity, typed parameters, an authored phrase with
named slots, and a lowering expressed as the shared statement IR. For example, conceptually:

```text
Verb light(place: place) "Light {place}" lowers to Assert kindled(place).
```

Binding resolves `place` as the verb's lexical parameter and `kindled` to a relation identity visible to the
declaring module; typechecking checks its arity and argument kind. A call to `light` resolves the verb identity,
checks its arguments, substitutes bound parameters into the lowering, and retains call and declaration provenance.
The same lowered changes feed execution and forecasting; text never supplies the mechanics. Reject missing or
ambiguous verbs, unknown phrase slots, unbound lowering targets, wrong kinds and recursive expansion cycles with
source diagnostics. Statement shapes and invocation grammar are OR-1333's work, not an invented parser in this slice.
The example is illustrative, not accepted Kyr syntax.

## Prerequisites and first proof

The current table is a foundation, not a complete binder: signature `meaning` is a string, catalog/language
bindings are statuses, imports and reference coverage are incomplete (OR-1371), and reference positions are
declaration-level (OR-1370). Before generation relies on a declaration, preserve ordered **typed** signatures and
resolve each referenced kind and imported declaration to an identity in an explicit rules context. Do not recover
dependencies by regex, treat an unresolved reference as a typed declaration, or claim every installation is covered
by the current walker. Slot-namespace queries and negative dependencies also need explicit tracking before changing
cache keys. Freeze or otherwise snapshot the definitions used by generation; the current table and its supplied
modules/context do not yet enforce that immutability.

1. **One small rules family:** a minimal-prelude fragment with one kind hierarchy, one relation and one measure;
   generate its contract from the table. Negative typecheck fixtures reject an unknown name, wrong arity, kind and
   relation/measure mix-up. A runtime spec rejects a different installed signature and proves two installations
   do not share bindings. Compare results with the existing world reads.
2. **One real family:** migrate a small group of shared-rule reads, retaining dynamic `DeclaredReads` guards and
   behavior. Check generated output is deterministic and stale output fails a spec; measure generation and normal
   compile/start cost without widening the performance gate. Expand family by family, recording the OR-744 string
   read census rather than calling the row closed on the first accessor.
3. **Verb proof, after review:** extend the table with the verb declaration and resolved lowering, then prove one
   domain verb from authored call through the same executed and forecast changes, including cost and provenance.
   The one-statement grammar remains a separately accepted OR-1333 increment. No typed-vocabulary or verb code is
   built in this PR.
