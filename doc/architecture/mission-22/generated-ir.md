# Generated worlds without the text round trip: a typed IR for Observe and Initially (AX-04, a design note)

Following the parse-performance review of 20 November (§1). Its step 1 is done: `ModuleParser.parse` now reports
match, lowering, clone and store apart, with bytes as UTF-8. On a new world (ax04-c, 1.66 MB of new Kyr) those are
1.56 s match, 0.32 s lowering, 0.09 s clone and 0.12 s store, reconciled against an outer timer to within 0.12 s. The
remainder is the clones on cache hits and the vocabulary key. Reordering the grammar took 11 %, and nothing contained
is left inside it. The generators know every construct they write, and they write it as text the parser must
rediscover. This note designs the first migration: the two constructs a drawn country writes most. Observe is 1 848
of one world's declarations, and Initially (a fact or a value set) is 1 574, together about 40 %.

## Where the text is written now

- **Observe:** written as template strings in 34 files of `src/world`. Among them are settlement-writer, region-borders,
  region-roads, region-sites, region-faith, region-works, general-stores, memorial and renewal.
- **Initially:** written in 29 files, as `Initially Assert …` and `Initially Set … to …`.
- **Assembly:** each writer returns `string[]` lines. The region's files are joined from those lines, written to the
  bundle source, and parsed at loading (and at composition, for the ledger: one parse, kept by `ParseCache`).
- **Writer that exists:** `ModuleWriter` (src/lang) already writes a `Module` back to Kyr, and builds `Call`s and
  `NumberValue`s. `WrittenKyr` parses lines a generator wrote to read their structure back.

## The IR

- **`ModuleSource`**, a builder in src/lang beside `ModuleWriter`. It holds typed declarations: an `Observation`
  (`{ id, anchor, when: Predicate, text, aspect?, teaches?, … }`, the `Module['observations']` element as the parser
  lowers it) and a `Change` for each Initially (the `Module['initial']` element).
- **Typed values:** predicates and values are the parser's own types (`Call`, `Predicate`, `Value`), built with
  `ModuleWriter.call` and friends, never strings.
- **Provenance:** every declaration carries `{ generator, seed, construct }`. A diagnostic with no source line then
  names the generator and the seed: "settlement-writer, seed ax04-b, Observe s2_green_well".
- **Migration shape:** writers return `{ lines: string[]; source: ModuleSource }` during the migration. Lines for what
  is not migrated; the source for Observe and Initially.

## Lowering, and what stays downstream

- **One canonical `Module`:** `ModuleSource.lower(): Partial<Module>` gives the same `observations` and `initial`
  elements the parser's semantics would, from typed parts. This is the convergence point.
- **`ModuleBundle.loading`** joins a module's parsed files (what is still text) with its sources' lowered parts before
  `merge`, so everything after is unchanged and runs on both alike:
  - catalog binding (`LocalKinds`, kinds read among the module's own);
  - `ModuleDeclarations.declare`, `CatalogParser.declare`;
  - `ModuleCompiler.validate` and `instantiate`;
  - `ModuleAssembly.compose` and `ModuleNamespace`.
- **Validation is the same:** a bad generated value (an unknown relation in a `when`, a measure that is no measure) is
  refused by the validator that refuses it in Kyr, now naming its provenance.
- **Caching:** `CompiledModules` is keyed by a digest of the lowered parts and the remaining texts. There is no text to
  key by for what was never written.

## The Kyr writer kept

`ModuleWriter.write` writes the lowered parts back to Kyr. That gives the bundle an inspectable text for `bin/kyrie
play --dump`, the handbook, fixtures and author export. It is never written or read at a player's start.

## What proves text and AST agree

- **Differential harness** (`test/generated-ir`): over a corpus of seeds (a1, iscoed, kahitude, ax04-a/b, and ten
  drawn at random and named in the spec), each region is generated both ways. The text is parsed, the source lowered,
  and the two normalized modules are compared structurally: observations and initial, order kept, ids equal. The
  first difference fails the spec with its provenance.
- **Same games:** the canonical hashes of the started campaigns are equal, and so are the checkpoints and transcripts
  of a ten-act walk on each seed.
- **Rejection:** a deliberately invalid generated value is refused with the same message, its line replaced by its
  provenance.
- **Measure:** `scripts/startup-bench.ts` on the new-generated case. Parse bytes should fall by the migrated share
  (about 40 % of the region's 1.6 MB), and the start by the match and lowering of it.

## The smallest first step

Observe from one writer: settlement-writer, the most prolific of the 34. Add `ModuleSource` with `observation()` and
its `lower()`, join it at loading, and build the differential harness on that one construct over the corpus. The rest
of Observe, then Initially, follow writer by writer, each a commit with the harness unchanged.
