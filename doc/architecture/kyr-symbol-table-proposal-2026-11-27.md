# Kyr's symbol table: proposal for slice 4

**Decision sought:** make Kyr's existing parse and lowering produce one binding record, rather than add a second
parser. Bind authored and generated references in their module's scope before installation maps their identities to
installed names. Use that record first for shadowing and compilation dependencies. It is an enabling layer, not a
claim that lint, facets, world effects or typed vocabulary are finished.

This is a proposal, not authority to build slices 4–6. It follows
[the compilation-context review](compilation-context-review-2026-11-26.md), especially its sequence. The evidence
includes `spike-kyr-symbol-table-1126:test/spikes/kyr-symbol-table.ts` and its design note. On three files, the spike
records 2,244 identifier nodes, but resolves only a subset of calls; generated IR, interpolations, lexical variables,
and kind and entity references are not complete. Its five alternating warm-process runs measured 61.0 ms median
without the table and 264.2 ms with it (4.33×): it reparses with Ohm. That is a three-file prototype measurement,
not a world-start measurement. Do not put that second parse on the product path.

## What slices 2–3 stepped around

The review described the **earlier** `spike/compilation-context-20261125` (`74bfb0527`), not this tree. Its
`src/canon/local-catalog.ts` selected dependencies by substring and made `like` and `worn` special textual cases:

```ts
const { items, species, matches } = words, inherited = text.includes('like');
const named = keys.filter(key => {
  const [family, id] = key.split(':') as [string, string];
  return this.names(text, id, matches) && (inherited || !(family === 'item' ? items : species).has(id));
});
```

Its `names` method was:

```ts
private static names(text: string, id: string, matches: Map<string, boolean>): boolean {
  let found = matches.get(id);
  if (found === undefined) {
    found = text.includes(id);
    if (matches.size < 512) { matches.set(id, found); }
  }
  return found;
}
```

A different identifier, comment or quoted prose could include a kind without referring to it. Its slot dependency
was:

```ts
const slots = text.includes('worn') ? keys.flatMap(key => {
  if (!key.startsWith('item:')) { return []; }
  const slot = local ? local.items?.[key.slice(5)]?.slot : Canon.items[key.slice(5)]?.slot;
  return slot ? [slot] : [];
}).sort() : [];
```

The same spike's `src/lang/kept-parses.ts` guessed inherited dependencies separately:

```ts
private static inherited(text: string): string {
  const names = [...text.matchAll(/like(?:\s|\/\/[^\n]*)*[\p{L}\p{M}_][\p{L}\p{M}\p{N}_-]*/gu)]
    .map(match => match[0]);
  return [...names, ...text.includes('worn') ? ['worn'] : []].join('\n');
}
```

Those heuristics are **already gone** in slices 2–3. The current `src/lang/vocabulary.ts` instead records the
lookups actually made during lowering:

```ts
kind(id: string): { name: string; use?: unknown } | undefined {
  this.asked(id); return this.vocabulary.kind(id);
}
item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string>): KindMade {
  if (spec.base.like) { this.asked(spec.base.like); }
  return this.vocabulary.item(module, spec, capabilities);
}
species(module: string, spec: LocalSpeciesSpec): SpeciesMade {
  this.asked(spec.like); return this.vocabulary.species(module, spec);
}
```

`VocabularyContext.reading`, `holds` and `keep`, `ModuleReads.parse`, and `CompiledModules` carry and check those
readings. This is better than substring matching and must remain sound while being replaced or augmented by binding
records. The remaining gap is not another `includes`: `LocalKinds.item` validates a `worn` slot by a collection
query, without recording that query as a dependency:

```ts
if (spec.slot && ![...Object.values(Canon.items), ...Object.values(this.items)].some(i => i.slot === spec.slot)) {
  throw new Error(`Kind ${spec.id} is worn as ${spec.slot}, where nothing of the catalog is worn`);
}
```

A table must therefore represent the **slot-namespace existence query**, not invent a reference to one item. Its
dependency includes negative results and changes to the candidate set, even when a previous witness disappears. It
must also cover actual `like` targets, ordinary kind references, aliases, and future forms without adding keyword
scans. Until then this collection query needs its own explicit tracked dependency; declaring slice 4 done while
ignoring it would leave a cache hole.

The other workaround remains in the current `src/campaign/module-shadow.ts`. It recognizes calls and edits source
with regular expressions before parsing again:

```ts
const call = new RegExp(`\\b(${s.functions.join('|')})\\(`, 'g');
return source.replace(/"(?:[^"\\]|\\.)*"|\/\/[^\n]*|[^"/]+|[/"]/g, token => token.startsWith('//') ? token
  : token.startsWith('"') ? token.replace(/\{[^}]*\}/g, braces => this.rename(braces, call))
    : this.rename(token, call));
// ...
return code.replace(call, (_whole, name: string) => `${this.local(name)}(`);
```

`ModuleBundle.compiled` first parses and merges, calls `ModuleShadow.shared`, reparses each source with
`ModuleShadow.text`, then uses `ModuleShadow.apart` to rename actions and their uses. It even refuses generated
declared values with shadowed functions. A binding table must identify the local declaration and each reference,
including calls inside interpolation and action references in people and pursuits. Namespace lowering can then map
those identities without editing comments or string literals, or refusing a generated value merely because a name is
shared. Language-generated constructs that mean the shared relation must continue to bind to the shared declaration,
not to a same-spelled local one.

`ModuleBundle.own` also forks and rereads files when later siblings declare kinds. A declaration index can make all
siblings visible before resolving their references; it must retain current forward-reference semantics and diagnostics.
These are the places where the context slices had to work around the absence of a binder, rather than reasons to
silently assume a symbol table already exists.

## The contract

One immutable table belongs to a compilation context, not the process. It is built from the existing parsed
declarations and lowerer's generated records, in two logical steps: register declarations across the module's files,
then resolve references against the module and its explicit imports and shared rules. This may share an existing
pass or use a cheap index over already parsed structures; it must not parse source a second time.

- A **declaration identity** is distinct from its spelling: it identifies its module, declaration namespace and
  source or generated origin. A **reference occurrence** has its own identity, role (`read`, `write`, `mention`,
  declaration target, type, import, slot query), source span and either a bound declaration identity or an explicit
  unresolved/ambiguous result with candidate spans. A mention is not automatically a world read.
- Scope is explicit: lexical parameters and variables, file and multi-file module, local versus shared declarations,
  imports/exports, domain vocabulary and installation. Resolve local shadowing as Kyr does today; report ambiguity
  rather than choosing an arbitrary match. Two installations of one authored module share source declaration
  identities but map them to distinct **installed identities**. A runtime entity or fact is a value, not its
  declaration identity.
- Spans contain file, start/end offsets and line/column; generated declarations and uses retain generator/template
  provenance and source mappings, or explicitly say that no authored span exists. Include interpolation and declared
  template slots, but do not pretend ordinary prose nouns are references.
- Lowered objects retain links to their authored identity and origin. `SemanticRecord` already retains source,
  participants, phases and string-named reads/writes for selected high-level declarations; connect it to the table,
  rather than make a competing trace. It is not yet a complete binding authority.

Bindings are stable under unrelated declarations and module installation order. Diagnostics name both locations for
collisions, including generated origins. Compiling a cached module must preserve the same identities, bindings and
provenance as compiling it fresh; the table and frozen definitions are shared, not cloned per lookup.

## Consumers and limits

**Cache keys.** A cache variant records resolved declaration identities and the content signatures of definitions
actually used in lowering, together with the compiler/key version, module and source paths, shared rules edition,
generator-declared values and relevant namespace queries. A dependency on the absence of a name or slot is recorded
as such, including membership changes. Transitive inheritance and imported definitions contribute their real
dependencies; an identical spelling in another module is not interchangeable. On a hit, validate these dependencies
against the current context before reusing the immutable result. Compare real reference sets with the historical
over-approximation over the corpus: explain false positives, and treat any real dependency missing from the new set
as a failure. The table cannot substitute for tracking dynamic validation queries which are not single references.

**Facets (AP-03).** Record an act's direct reads and writes by identity and a separate, bounded transitive dependency
graph through queries, rules and lowered consequences. `Outcome` currently reads success effects, observations and
rules, and applies the company's `foresees` knowledge boundary. Those semantics remain: the graph identifies
candidates, not a promise that an effect will occur or be perceived. Knowledge, taught abilities, unvisited ways,
payoffs and topics leading to them must each be proven against actual consequences. Authors still declare acts, not
indicator colours.

**Abilities (OR-1097).** An invoked ability's declared effect needs a typed lowering to Kyr world changes, with the
same bound write identities exposed to execution, forecast, facets, telling and lint. Link the call, cost, target,
conditions and origin to that lowering. Combat effects currently operate on fighters; a symbol table by itself does
not implement world effects, choose their rules, or prove that text matches execution. Land those as the independent
OR-1098–1106 proof slices.

**Form and identity (OR-1205).** Provisionally, bind an enduring character identity separately from the form and
its currently available capabilities; a form change writes the form relationship, not a replacement character.
Reads and writes must say which is addressed, and a transformation's source and reversal retain provenance. The
requested `doc/design/direction-2026-11-26-transformations.md` and OR-1205 are absent from the fetched main at
`665ab4ebbf56dc274d3c881c1cabd331c44bedec`; their policy cannot be inferred here. Review this part against that
direction before commissioning it.

**Typed vocabulary (slice 6, OR-744).** Generate typed relation, measure and kind accessors from the installed
declarations' identities and signatures. The kernel owns generic binding, types and query mechanics; each installed
domain declares its own words and semantics. A fantasy slot, fuel or effect is not a hard-coded kernel vocabulary
member. Wrong names, arities and argument kinds should fail typechecking; dynamic reads still need the existing
declared-read guard. This is a later consumer, not a reason to grow the current setting-shaped `Vocabulary` interface.

## Smallest landable increments

Each increment is separately reviewable, maintains campaign isolation, preserves the existing acceptance ladder,
and measures parse/compile, cold and warm starts and cache hit rates without widening a band. Establish a census
before ratcheting an unmeasured property; never substitute a smaller denominator after finding a failure.

| Increment | Acceptance | Ratchet or row |
|---|---|---|
| 1. Inventory and spans | Classify every grammar identifier position, generated origin and binding hole; fixtures cover lexical scope, multiple files, declarations, interpolation, imports and templates. Compare the corpus with the existing parser without changing play. | A checked missing-origin/identifier census, lowered toward zero; AR-14's binding-hole inventory only. |
| 2. Declarations | Emit immutable declaration identities and spans during existing lowering, including generated origins. Same spelling in different scopes stays distinct; collision diagnostics preserve both locations. No second parse and no corpus or performance regression. | Unidentified declaration census falls; no AR-08 closure yet. |
| 3. References | Bind each authored and generated occurrence, including shadowed and unresolved cases, to identities in explicit per-module scope. Compare fresh and cached bindings across the corpus and installation orders; mutations prove missing and ambiguous bindings are detected. | Unbound/unclassified-reference census falls; no silent increase in corpus failures. |
| 4. Shadow lowering | Replace both source regex rewriting and action-name rewriting with identity mapping. Prove local/shared collisions, comments, escaped literals, interpolations, generated values, sibling files, imports and two installations; compare compiled behaviour, diagnostics and kept replays. | Regex source-rewrite/reparse sites fall to zero; close AR-08 on the full proof (MT-26 remains its duplicate). |
| 5. Dependency keys | Use bindings plus explicit namespace queries for parse and compiled variants. Test changed definitions, inheritance, removed and added slot witnesses, missing names, declared values, disk hits and interleaved campaigns; compare dependency sets with the old over-approximation and measure cache hits. | Untracked dependency/query census falls to zero; no stale hits and no performance-band increase. |

After these, **slice 5** is lint as queries, one check per landing with a mutation of the actual defect and corpus
parity. A finding alone does not mend content or runtime behavior. **Slice 6** generates typed vocabulary in families,
ratcheting down the 849 string reads recorded by OR-744 and keeping negative typecheck tests. Neither follows
automatically from a populated table. OR-542's language-entry cycle and its deep-import ratchet can be a separate
small parser-boundary increment if it is needed to emit bindings; it is not permission to move unrelated layers.
