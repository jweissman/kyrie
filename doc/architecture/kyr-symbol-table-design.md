# Kyr's binding authority: design and spike (26 November)

**Recommendation:** make binding an output of the existing lowering, not a second parser or a second compiler. A
required, immutable compilation context supplies the declarations visible to a compilation. A declaration pass assigns
identities; lowering emits references to those identities and their source provenance. The compiler, installation and
lint consume the same result. This is slices 4–6 of
[the compilation-context review](https://github.com/jweissman/kyrie/blob/bc8f1f046cee27bb94c6661ffad28fa2aa37869d/doc/architecture/compilation-context-review-2026-11-26.md); slices 0–3 are a prerequisite, owned
elsewhere. This spike changes no product path. OR-700 tracks the implementation requirement; this research and prototype do not
close it.

The prototype is deliberately narrower than that design. It indexes explicit relation, measure, query and action
declarations and explicit calls, and compares `KyrLint.twins` and `KyrLint.vocabulary` with queries. It is not an
authoritative table: it misses generated declarations and implicit operations, entity and kind references, variables,
interpolation and templates. Its resolution policy is not the compiler's complete policy. Do not use it to implement
ModuleShadow or cache keys.

## Inventory: where names are resolved now

Counts are unique files, classes or named checks within the row; rows overlap where one file both declares and resolves
names. They are not counts of runtime lookups. This inventory names the binding-producing and name-consuming
surfaces, including the separate dynamic runtime binders; ordinary prose/domain checks that do not bind names are
identified as such rather than counted as symbol resolution.

| Surface and count | Current binding / name handling |
|---|---|
| Parse and declaration lowering (22 files) | `module-parser`, `statement-parser`, `module-made`, `module-declarations`, `catalog-parser`, `module-source`, `semantic-record`, `declaration-parses`, `declaration-shapes`, `object-parser`, `person-parser`, `information-parser`, `objective-parser`, `parse`, `occasions`, `situations`, `milestones`, `promises`, `routes`, `chapters`, `endings` and `during`. Grammar actions turn identifiers into string ids; author and generated declarations are merged, while only selected semantic records and `ModuleSource` retain provenance. Ordinary `Call`, `Signature`, entity and action records do not carry a source span. |
| Ambient catalog (9 `src/lang` files) | `catalog-parser`, `module-declarations`, `person-parser`, `world-constructs`, `module-compiler`, `module-parser`, `kept-parses`, `declaration-parses` and `declaration-shapes` reference `Vocabularies`. They resolve catalog names or consult/install active kind, item, species, ability and installation data. One match in `declaration-parses` is comment-only. Counted by `rg -l 'Vocabularies\\.' src/lang --glob '*.ts'`; these nine references are not nine independent authorities. |
| Compiler binding (1 class, 14 named resolver/check helpers, plus 1 uniqueness check) | `ModuleCompiler.validate/check` builds entity, type and signature indexes. `kind`, `type`, `call`, `predicate`, `value`, `change`, `text`, `anchor`, `subject`, `bound`, `binds`, `variables`, `writes` and `acyclic` resolve or validate names and scope; `unique` separately rejects duplicate declaration names. Text is reparsed through `ObservationText`; `writes` serializes changes to discover variables. |
| Module composition (6 classes) | `ModuleBundle` parses and joins modules/imports; `ModuleShadow.shared/text/apart` finds collisions and rewrites function calls and action ids; `ModuleNamespace` separately maps functions, entities and kinds and scopes calls/prose; `ModuleCanon`, `ModuleExports` and `RoleRequirements` resolve canonical names, exports and imports. These are independent bindings over some of the same declarations. |
| Runtime name binding (6 modules) | `World` builds relation/measure/query indexes; `QueryIndex`, `Candidates` and `query-modes` resolve queries and lexical variables; `Reads` expands query dependencies and computed dependencies; `DeclaredReads` checks actual runtime reads against the world. Dynamic world-value binding must remain dynamic: declaration identity is not a runtime value. |
| Source locations and diagnostics (2 classes) | `Diagnostics.names/locate/clashes` infers names and locations from errors and text; `LintSource.at` searches source with a regular expression. Equal spellings, generated declarations and multiple source files can make those locations ambiguous. |
| Repository-level lint/name tools (5 files, 7 checks) | `KyrLint.vocabulary/twins/inventory` derives relation/measure declarations; `CanonicalNames.all/own/shadows/doubled` mixes parsed rules with source inference; `AdventureNames.read/modules/clashes/twice/sharedFirsts` scans source for declarations and module ids; `ExportRoles` derives module roles; `suggest-names` inspects candidate names. The seven binding-oriented lint checks are vocabulary, twins, canonical shadows, canonical duplicates, adventure clashes, duplicate module ids and export/role matching. |
| Campaign lint (23 named checks; 8 `AuthorLint` checks; 6 supplementary passes) | The `CampaignLint` checks are `identity`, `shadows`, `containment`, `passages`, `traversal`, `geography`, `applicability`, `labels`, `items`, `prose`, `domain`, `hazards`, `placeholders`, `roles`, `anchors`, `targets`, `keeps`, `movers`, `endings`, `writeOnly`, `commitments`, `skies` and `weathers`. They resolve/read entity and world names, inspect placeholders and text, walk structured values for reads/writes, resolve targets, and use `LintSource`. `AuthorLint`'s eight checks are `inert`, `lowered`, `unpaid`, `unheard`, `everywhere`, `untied`, `neverThere` and `growth`; they inspect conditions, effects and serialized calls. `CrossingLint`, `FictionLint`, `FateChainLint`, `OfficeLint`, `CompoundKindLint` and `SiteKindLint` add domain checks, only some of which bind names. `OfficeLint` infers office from words (MT-21). `CommitmentLint` is invoked as the `commitments` check. |

This file inventory is an auditable static survey, not a claim that every `.find`, `.has`, or prose regex is a binder.
The broad search `rg -l 'JSON\\.stringify|matchAll\\(|new RegExp|\\.find\\(|\\.has\\(' src/lang --glob '*.ts'`
matches 34 files, including ordinary collection operations. In `src/cli`, 13 files touch names or lint source:
`adventure-names`, `canonical-names`, `campaign-lint`, `author-lint`, `commitment-lint`, `crossing-lint`,
`fate-chain-lint`, `fiction-lint`, `office-lint`, `lint-source`, `compound-kind-lint`, `suggest-names` and
`kyr-lint`. A slice-A acceptance will maintain this inventory as the grammar and consumers evolve; the counts above
are of the named mechanisms, not a static-analysis-derived total of every dynamic lookup.

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
| C. References and namespace | Resolve all references, including imported and generated ones, under required context; compare installed modules, prose and saves with current behaviour. Replace ModuleShadow's regex and source reparse; prove same-name local/shared calls, comments and interpolations and both installation orders. Close AR-08 only on this proof; MT-26 remains its duplicate reference. |
| D. Dependency keys | Key from recorded referenced definitions and paths, including inherited kinds and slots as grammar references; compare with the slice-1 over-approximation across the corpus, test changed definitions and interleaved campaigns. No stale hits, no dropped dependencies, no performance regression. |
| E. Lint queries | One check per landing; compare severity, message, location and ordering to the existing check, plus a non-vacuous mutation of the row's example. Where an old finding has no span, preserve its existing location and add a separately tested precise location; do not claim identical spans that did not exist. Keep `bin/kyrie lint` green. Close each row only on its full acceptance. |
| F. Typed vocabulary | Generate signatures and accessors from symbols, negative typecheck tests for undeclared/wrong-arity reads, and ratchet the 849 string reads down by family. Close OR-744 only when its acceptance is met; declare office facts and consumers separately for MT-21. |

The row mapping is intentionally narrower than "the symbol table fixes the cause":

| Slice | Cause-C rows it can retire after the stated acceptance |
|---|---|
| A | AR-14's binding-hole inventory only; its ability-text fidelity still needs rules-execution evidence. |
| B | OR-402 and AU-46 on identity-aware collision checks; AR-14 only if every hole and origin is proven. |
| C | AR-08 on parity across local/shared references, installations and source forms; MT-26 remains its duplicate reference. |
| D | No listed cause-C row by itself; it proves correct dependency keys and protects cache isolation. |
| E | AR-13, OR-541, OR-235, OR-236, SI-05, AU-15, OR-176, R11-08, MT-21, OR-404, AU-52, AU-49, AU-59 and AU-43 only when each row's content/runtime consequence is also met; see the row-specific requirements below. CF-04 and OR-403 stay duplicates; AU-35, AU-36 and GR-26 stay closed. |
| F | OR-744 when typed accessors and the string-read ratchet meet acceptance. MT-25 stays closed with its remaining work represented by OR-744; MT-21 remains open until office facts and their consumers change, even if E's query can expose the missing binding. |

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
compilation is isolated. The three real inputs are `data/rules/people.kyr`, `data/rules/belongings.kyr` and
`data/adventures/eelbell/night.kyr`; the shadow parity case separately uses the dedicated
`test/fixtures/probes/shadow/site.kyr` fixture. Across the three real inputs, the prototype records every one of
2,244 grammar `ident` nodes as either a declared symbol or an occurrence: 166 symbols, 554 reads, 92 writes and
1,432 mentions. Of the 646 call occurrences, 421 have no target within this deliberately incomplete context.
The per-module completeness invariant fails if an identifier node is omitted. Mutations insert a shared relation
clash and a query/shared-relation clash to exercise nonempty lint results. For vocabulary and twin lint, the test
compares complete finding objects on the real inputs. For shadow lint, the prototype's query equals the current
campaign linter's three findings including its file/line locations (site.kyr lines 10, 10 and 12). The compiler and
existing `KyrLint` vocabulary/twin findings do not carry spans, so this does not assert legacy spans that do not
exist; the prototype independently checks each recorded span against source text.
Neither query covers all generated declarations, templates or the complete corpus.

On this shared Linux environment, Bun 1.4.3, five alternating warm-process runs after one warm-up, parsing and lowering
those three files with `ModuleParser.whole` (no parse cache), median was **51.3 ms** without and **279.5 ms** with
the prototype, 5.44 times as long (individual runs: 49.3–54.9 and 245.5–288.2 ms). The table reparses all three files
with Ohm and traverses the resulting tree, so this experiment fails the no-regression criterion and must not be wired
in. This measures parse/lowering plus the prototype, **not** complete compiler validation, cached compilation, CI or
full-world startup. The measured result supports emitting symbols and references during existing lowering, not running
a parallel parse. No claim is made about production compile time; slice B must measure it after integrating emission
into the existing pass. The context work, corpus-wide parity, complete lint span parity and real installation
interleaving remain unverified here.
