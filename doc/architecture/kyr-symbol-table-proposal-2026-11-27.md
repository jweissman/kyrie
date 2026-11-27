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

**Form and identity (OR-1205).** Bind an enduring identity separately from its form and currently available
capabilities, following [the transformation direction](../design/direction-2026-11-26-transformations.md), §2.
A polymorph keeps identity and changes form; a disguise changes observers' beliefs about form; a clone has a new
identity and copied form; a hologram presents a form without a substantive entity. References and writes must
distinguish those targets, and preserve transformation and reversal provenance. The kernel binds the distinction,
not an ontology of forms: installed domains supply their kinds, capacities and transformation rules. The binder
does not itself implement these effects or make a shown form into a world entity.

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

## Implementation probe (27 November)

The first production-shaped increment is on `build-kyr-symbol-table-1127`. It records declaration sites as
`ModuleMade` lowers the existing parse, and retains them on each parsed file's `Module`; the whole and declaration-
chunked paths share that recorder. The kept-parse version is bumped so an older cached module cannot masquerade as
one with sites. A joined or saved module drops the per-file record. `SymbolTable.of(context, installation)` requires
an explicit `VocabularyContext`, takes shared files and installed units, and owns its indexes and reference cache;
there is no process-wide table. It indexes entities, relations, measures, queries, kinds, acts (topics are typed acts)
and rules. `SymbolReferences` walks selected lowered declarations and effects. KyrLint's twin-name check now queries
that table; its existing finding shape and order are covered against the prior set-based implementation.

The fragment spec `test/small/kyr-symbol-table.test.ts` proves cross-module binding, own-before-shared shadowing,
unresolved binding with file/line/column provenance, installation isolation and exact twin-check parity on a Kyr
fragment. `test/small/declaration-parses.test.ts` proves sites survive whole, chunked and cached parses, and the
language-entry specs continue to guard load order and deep imports.

**This is not yet a complete binding authority.** A reference currently inherits the span of its containing
declaration (or initial fact), not the exact identifier token. `SymbolReferences` traverses lowered IR and covers
common calls, arguments, action uses and type signatures, but it does not yet inventory every name-bearing field;
imports are absent. Catalog and language names are represented as external binding statuses, not declaration
identities with their own provenance. Places share the entity namespace, and topics share the act namespace. Generated
values have generator/construct provenance but no authored line; declarations produced later by module-wide lowering
are marked unplaced. Consequently OR-700 remains open. OR-1370 tracks exact reference spans; OR-1371 tracks the
complete reference inventory and external/import identities. The remaining limitation is explicit rather than
silently treated as a successful binding.

### Measurements and checks

On 27 November, a warm-process microbenchmark used the 18 Kyr files in `data/rules/` and the five authored
`iscoed-*` situations (23 parsed modules, 1,389 indexed declarations). It first compared the existing twin lint with
the prior set-based algorithm; the findings were identical (zero findings in this corpus). Across 15 measured runs,
the old twin lookup had a 0.072 ms median and the table-backed query 1.194 ms; building the table alone took
1.485 ms, and building it plus binding the five situations' references took 6.521 ms. These are warm microbenchmark
medians, not end-to-end compile timings. They show a small absolute lint cost, not that compile time is unchanged.

The generated reference world (`s0`) was not assembled for this measurement: this checkout has no `heavy.sh`, and
the repository's machine rule reserves world walks for the guarded environment. Thus its table-build time and
compile-time overhead of collecting sites versus the uninstrumented parser remain unmeasured. The fragment and
whole/chunked parity specs pass, but corpus-wide reference parity, exact token spans, all reference forms, and actual
reference-world behavior are not proved here. Keep the table off product execution paths until those gaps are closed.

Lint-as-queries (slice 5), typed vocabulary (slice 6), regex-based shadow lowering and dependency-key migration are
not part of this increment.
