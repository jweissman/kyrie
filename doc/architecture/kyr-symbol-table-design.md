# Kyr's binding authority: design and spike (26 November)

**Recommendation:** make binding an output of the existing lowering, not a second parser or a second compiler. A
required, immutable compilation context supplies the declarations visible to a compilation. A declaration pass assigns
identities; lowering emits references to those identities and their source provenance. The compiler, installation and
lint consume the same result. This is slices 4–6 of
[the compilation-context review](https://github.com/jweissman/kyrie/blob/bc8f1f046cee27bb94c6661ffad28fa2aa37869d/doc/architecture/compilation-context-review-2026-11-26.md); slices 0–3 are a prerequisite, owned
elsewhere. This spike changes no product path and does not close a register row.

The prototype is deliberately narrower than that design. It indexes explicit relation, measure, query and action
declarations and explicit calls, and compares `KyrLint.twins` and `KyrLint.vocabulary` with queries. It is not an
authoritative table: it misses generated declarations and implicit operations, entity and kind references, variables,
interpolation and templates. Its resolution policy is not the compiler's complete policy. Do not use it to implement
ModuleShadow or cache keys.

## Inventory: where names are resolved now

The counts below count **mechanisms or files**, not dynamic lookups. A name can cross several mechanisms. This is a
survey of binding and the lint's name-based checks, not a count of every `.find` in the program. It is not yet a
mechanically exhaustive census of every lowering and lint consumer; that census is an acceptance item for slice A.

| Mechanisms (count) | Present authority / repeated derivation |
|---|---|
| Syntax and lowering (3) | `module-parser.ts` and `statement-parser.ts` turn syntax into string ids; `module-made.ts`/`module-declarations.ts` combine authored and generated declarations; `catalog-parser.ts` declares local kinds before the rest. Only semantic records currently retain a source span (`semantic-record.ts`); ordinary `Call`, `Signature`, entity and action have none. |
| Catalog and cache (1 family, 9 `src/lang` files referencing `Vocabularies`) | `catalog-parser.ts`, `module-declarations.ts`, `person-parser.ts`, `world-constructs.ts`, `module-compiler.ts`, `module-parser.ts`, `kept-parses.ts`, `declaration-parses.ts`, `declaration-shapes.ts`. They ask for names, items, species, abilities, installation or cache fingerprints. `Vocabularies` is process-wide. The count includes a comment-only reference in `declaration-parses.ts` as well as code; `rg -l 'Vocabularies\\.' src/lang --glob '*.ts'`. |
| Compiler (4) | `ModuleCompiler.validate/check` builds entity and signature maps and checks uniqueness; `kind`, `type`, `call`, `predicate`, `value` and `change` check types and arity; `text` reparses references via `ObservationText`; `bound`, `binds`, `variables`, `writes` and `acyclic` independently derive scope and dependencies. `writes` serializes changes to find variables. |
| Composition (4) | `ModuleBundle` parses and joins files and imports; `ModuleShadow.shared/text/apart` finds collisions and rewrites source or actions; `ModuleNamespace` derives three more mappings for functions, entities and kinds and scopes calls and prose; `ModuleCanon`, `ModuleExports` and `RoleRequirements` resolve canon, exports and imports. The last three are grouped as one contract boundary. |
| Runtime (4) | `World` builds relation/measure/query indexes, `QueryIndex` and `Candidates` resolve queries and runtime variables, `Reads` expands query dependencies and adds computed dependencies, `DeclaredReads` checks names actually read against the world. These dynamic world bindings must remain dynamic; a declaration identity is not a runtime variable value. |
| Sources and diagnostics (2) | `Diagnostics.names/locate/clashes` infers names and locations from errors and text; `LintSource.at` searches source with a regex. Both can confuse equal spellings and generated or multi-file declarations. |
| Repository lint (3) | `KyrLint.vocabulary/twins/inventory` derives declarations from parsed modules; `CanonicalNames.all/own/shadows/doubled` mixes parsed rules with source regexes; `AdventureNames` scans text for declarations and module ids. |
| Campaign lint (3 families) | `CampaignLint` resolves entities and world facts, reparses placeholders, walks JSON-shaped values for reads/writes and uses `LintSource`; `AuthorLint` independently examines conditions, effects and serialized calls; `CommitmentLint`, `CrossingLint`, `FateChainLint`, `FictionLint`, `OfficeLint`, `CompoundKindLint` and `SiteKindLint` apply further domain checks. `OfficeLint` infers office from words (MT-21). Not all domain checks are symbol resolution. |

For orientation, `rg -l 'JSON\\.stringify|matchAll\\(|new RegExp|\\.find\\(|\\.has\\(' src/lang --glob '*.ts'`
matches 34 files; it is an intentionally broad search, **not** 34 binding sites. A similar CLI search for text
heuristics and lint source references matches 13 name/lint files: `adventure-names`, `canonical-names`,
`campaign-lint`, `author-lint`, `commitment-lint`, `crossing-lint`, `fate-chain-lint`, `fiction-lint`, `office-lint`,
`lint-source`, `compound-kind-lint`, `suggest-names` and `kyr-lint`. Some matches are prose checks or ordinary
collection lookups. Enumerate and classify the remaining syntax handlers and consumers before claiming completeness.

## Table contract

The table belongs to a compiled **module**, with its files and installation provenance, not to the process or a client.
Suggested logical shape (indexes are views over these records):

```text
Symbol { id, kind, spelling, declaredBy: moduleId, declarationSpan, signature, origin }
Reference { id, sourceSpan, enclosingDeclarationId, role, target: SymbolId | unresolved }
ModuleBindings { contextIdentity, symbols, references, byId, byNameAndScope, byTarget, byRole }
```

`role` distinguishes declaration, read, write, mention, type, import/export, call argument, template parameter and
other grammar-defined uses. References to local parameters and quantified variables have lexical scope identities;
values bound by a running world are separate. Spans include file, start/end offsets and line/column in authored
source; generated IR carries `ModuleSource` provenance and either a source span or an explicitly generated origin.
Template substitution needs a source map to both template and input: never fabricate a span. Synthesized declarations
link to their originating syntax and lowering rule. A module spanning files has one scope; an installation gives it a
distinct identity even if it is installed twice. Shared, imported, local and catalog definitions retain distinct
identities even where their printed names agree. Preserve declaration order where it affects diagnostics.

Invariants:

1. The parser's declaration pass emits every declaration and reference by syntax, including interpolation, high-level
   forms, generated IR and non-call references. No dependency is discovered by regex over source.
2. Resolve once against an explicit required immutable catalog/context and import environment. The table records the
   unique target, or a diagnostic for unresolved/ambiguous/wrong-kind references; it never silently chooses one. A
   reference cannot change target when a different campaign loads. The table never consults ambient state.
3. Lowering and generated facts preserve their origin and refer to those same identities. A semantic transformation may
   create an explicitly linked reference, not infer one back from emitted strings.
4. Namespaces and lexical scopes are explicit. A same-spelled action, entity, parameter and relation are not the same
   symbol; an `or` binds a variable only where every branch binds it. Imports and local shadows have specified
   precedence and duplicate/conflicting candidates have diagnostics with both spans.
5. Cache keys derive from referenced definitions and their content identities, source paths/provenance, declared
   generated inputs and the compiler/key version. No source substring guess; immutable definitions shared by
   reference. Interleaving and sequential starts must produce the same results.
6. Queries can distinguish a direct read from a transitive query dependency, a write from a read of its value, and a
   textual mention from a state read. They retain scope and locations. Typed accessors are generated from signatures
   and identities, not setting-specific `Vocabulary` members.

This design does not assert that every prose noun denotes an entity: ordinary prose is not Kyr. Explicit
interpolations and declared template slots are bindable; detecting prose that claims an unsupported fact needs a
separate authored contract or a heuristic.

## Queries and migration

`ModuleShadow.shared` becomes a join of local declarations and shared declarations by namespace and spelling.
References already point to the local identity, so lowering/installation maps identities to installed ids; neither
source rewriting nor a second prose scan is needed. Compiler diagnostics consume the recorded reference and candidate
spans. `writeOnly` is a join of writes against reads in the assembled context, including transitive query reads,
interpolation and generated consequences; `twins` and `vocabulary` join declarations and compare signatures.
The scope must be the same as the current check before replacing it. `DeclaredReads` remains a runtime guard until
typed accessors cover dynamic reads; the table alone cannot prove a runtime call actually occurs.

Thin independently landable slices, after review slices 0–3:

| Slice | Acceptance and row effect |
|---|---|
| A. Census and source provenance | Classify **every** grammar declaration/identifier position and each lint/runtime binder; fixtures cover multi-file, templates, generated IR, escaped prose and shadowed names. Missing provenance is explicit. No behaviour change; establishes AR-14's binding-hole inventory. |
| B. Declaration identities | Emit symbols during existing lowering, with scopes and both collision spans; compare corpus identities with existing compiler and `KyrLint` findings. No extra parse, no product behaviour change. Enables OR-402/AU-46, not their closure. |
| C. References and namespace | Resolve all references, including imported and generated ones, under required context; compare installed modules, prose and saves with current behaviour. Replace ModuleShadow's regex and source reparse; prove same-name local/shared calls, comments and interpolations and both installation orders. Close AR-08/MT-26 only on this proof. |
| D. Dependency keys | Key from recorded referenced definitions and paths, including inherited kinds and slots as grammar references; compare with the slice-1 over-approximation across the corpus, test changed definitions and interleaved campaigns. No stale hits, no dropped dependencies, no performance regression. |
| E. Lint queries | One check per landing; compare severity, message, location and ordering to the existing check, plus a non-vacuous mutation of the row's example. Where an old finding has no span, preserve its existing location and add a separately tested precise location; do not claim identical spans that did not exist. Keep `bin/kyrie lint` green. Close each row only on its full acceptance. |
| F. Typed vocabulary | Generate signatures and accessors from symbols, negative typecheck tests for undeclared/wrong-arity reads, and ratchet the 849 string reads down by family. Close OR-744 only when its acceptance is met; declare office facts and consumers separately for MT-21. |

Every slice measures cold/warm compile, cache hits and full startup on the same fixtures, plus the quality gate's
decision/turn measures where runtime changes. No increase in compile time is the acceptance, not an enlarged ratchet.
Avoid per-lookup cloning, full-catalog copies and quadratic scans: build immutable maps once and visit each syntax node
once, with incremental reuse keyed by identity. The review measured 827,406 clones versus 4,306 and warm full-world
startup 11.7 s versus 6.4 s in the earlier spike. A cheap context alone does not make downstream copies cheap.

## Cause C: what the table can and cannot retire

The table is infrastructure, not proof that these 23 rows are fixed. Closed and duplicate rows remain so.

| Rows | Consequence required beyond the table |
|---|---|
| AR-13, OR-541 | Track template slots and generated name provenance; fail unfilled slots **and** fix the debt generator. |
| AR-14 | Enumerate and prove all binding holes; ability-text fidelity also needs rules execution evidence. |
| OR-235, OR-236 | Cross-module write/read query finds candidates; author the missing consequences and prove them in play. |
| SI-05 | Trace sold kinds to actual consumers; implement useful behaviour, not merely silence a warning. |
| OR-402, AU-46 | Compare identities in the correct namespaces and report both declarations; fix collisions, including display-name-derived ones. |
| AU-35, AU-36, GR-26 | Already closed; retain their proving specs. |
| AU-15 | Make objective targets explicit or prove inference; author remaining targets. |
| OR-176, R11-08 | Reachability and time/state analysis plus engine/content correction; a mention graph alone cannot prove an act advances an aim or a topic is available at the right time. |
| CF-04 | Duplicate of CF-05; trace consumed item effects through later rules and implement the correct attack/save/damage. |
| MT-21 | Declare and write office facts, then change the consumers; typed accessors cannot create the facts. |
| OR-404 | Compare text in the same reachable scene and correct content; names alone cannot prove duplicate display. |
| AU-52 | Model actual told budgets and report suppressed lines. |
| AU-49 | Runtime deadline/closure notification and a journey proof; a table cannot guarantee it. |
| AU-59, OR-403 | Classify lowering origins (ending/chapter/fate) so advice is applicable; OR-403 is its duplicate. |
| AU-43 | Copy or reject external trace steps in `keep`; file portability is not name binding. |
| MT-25 | Stage 0 already closed; its typed-accessor remainder is OR-744. |

## Prototype evidence and limits

`test/spikes/kyr-symbol-table.ts` takes required module inputs and a required catalog map. The table implementation
does not read `Vocabularies`; the test's **existing** `ModuleParser.parse` still does, so this is not evidence that
compilation is isolated. The three inputs are `data/rules/core.kyr`, `data/rules/belongings.kyr` and
`data/adventures/eelbell/night.kyr`. The index contains 168 declarations and 642 explicit call occurrences (568 reads,
74 writes); 112 calls have no target in this deliberately incomplete context. The unmodified modules have zero
findings in both tested lint checks. Mutations insert a shared relation clash and a query/shared-relation clash to
exercise nonempty results. The test compares complete existing finding objects and verifies source offsets against
the source text. These checks report file/name locations, **not source spans**; identical existing span reporting
cannot be claimed. Neither query covers all generated declarations, templates or all real modules.

On this shared Linux environment, Bun 1.4.3, five alternating warm-process runs after one warm-up, parsing and lowering
those three files with `ModuleParser.whole` (no parse cache), median was **66.8 ms** without and **228.9 ms** with the
prototype, 3.43 times as long (individual runs: 62.8–90.9 and 212.4–269.9 ms). The table reparses all three files
with Ohm, so this experiment fails the no-regression criterion and must not be wired in. This measures parse/lowering
plus table, **not** complete compiler validation, cached compilation, CI or full-world startup. No claim is made about
production compile time; slice B must measure it after integrating emission into the existing pass. The context work,
corpus-wide parity, complete lint span parity and real installation interleaving remain unverified here.
