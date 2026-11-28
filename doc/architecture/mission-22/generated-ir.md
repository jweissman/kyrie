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

## Where the migration stands (28 November)

Measured by `scripts/performance/fresh-start.ts`: a new world on a named seed, its parse store answering only what
worlds drawn on other seeds (kite, thorn) asked of it, so s0 and a1 parse their own Kyr as a new player's does. Its
`--shapes` names the declarations the grammar still matched; `rounds` interleaves seeds and worktrees, one process each,
every store emptied first.

- **What moved, by what the grammar read on s0:**
  - the settlement writer's Observe;
  - the keepers' Topic of the lands beyond;
  - each stretch's Passage, Observe, Place and facts (RegionTracts);
  - Initially, the second construct: RegionGrowth's (each stand, each crop) and the stretches' first;
  - RegionBorders' Topic of a country seen through, put once (the parser's field for its line, declared as the line's
    is: `ModuleSource.field`);
  - RegionWeather's Observe;
  - RegionRovers' facts.
- **The proof** is the harness unchanged (test/generated-ir), on its eight worlds and on s0 and a1 besides.
- **What it bought** (three rounds interleaved against 2065bbb38, medians):

  | | parse, before → after | start, before → after | the parse's share |
  |---|---|---|---|
  | s0 | 1 398 → 1 166 KB, 1 498 → 1 295 ms | 6 018 → 5 619 ms | 25 % → 23 % |
  | a1 | 1 660 → 1 377 KB, 1 826 → 1 590 ms | 7 009 → 6 768 ms | 26 % → 23 % |

- **What is left:** the grammar still matches 3 907 of s0's declarations, 767 KB (about 5 300 before). It is spread
  over some thirty writers, and most of it is template sections filled as text: the works and deep places (about
  190 KB) and the undertown (undertown.kyrt and below.kyrt, about 170 KB). Then come the settlement's people and talk
  (about 115 KB). A writer at a time pays less from here. The next lever is the templates' own: a section read once,
  its holes marked as DeclarationShapes marks a declaration's, and filled as values (OR-1900).
