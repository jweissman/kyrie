# Generated Kyr parsing: performance review

20 November 2026. Read-only investigation of `2455117f8`; this report is the only repository change.

## Judgment

Parsing generated Kyr is slow principally because Kyrie serializes already-structured TypeScript generation into a
human language, asks Ohm to construct a concrete syntax tree for it, and then lowers that tree back into structured
`Module` values. The reported rate of roughly 0.85 MB/s is not file-reading throughput. It is the aggregate cost of
grammar rule evaluation, memoization, syntax-tree allocation and semantic lowering over tens of thousands of dense
declarations.

This is not evidence that Kyr or Ohm is unsuitable for authored content. It is evidence that the authored-language
front end is the wrong mandatory transport for bulk machine-generated content. Preserve one compiler and one
semantic validator, but let generators enter through a typed intermediate representation.

## Evidence

A controlled 1,606,154-byte module containing 29,200 generated entities was timed by phase in a fresh Bun process:

| Phase | Time | Share |
|---|---:|---:|
| vocabulary/cache-key preparation | 0.14 ms | negligible in this probe |
| Ohm grammar match | 2,990 ms | 83% |
| concrete syntax tree to `Module` lowering | 377 ms | 11% |
| defensive cache clone | 217 ms | 6% |
| total | 3,584 ms | 100% |

This synthetic module is intentionally repetitive and is not a release benchmark. Its shape nevertheless isolates
the same dominant operation as the repository's world measurements: 55–61 new texts totalling about 1.67 MB took
about 4.2 seconds before later lexical improvements. Current results near two seconds are plausible after
`KyrQuick` and the removal of a quadratic semantic traversal.

The measured `parse` stage is narrower than its name suggests. `ModuleParser.parse` calculates its duration before
calling `ParseCache.set`; the latter then clones the result. Startup pays for that clone, but parse telemetry does
not. Conversely, the byte count is a JavaScript string/key length rather than a precise UTF-8 byte measurement.
Throughput should therefore remain an approximate diagnostic, not a service-level metric.

## Problems and mitigations

### 1. Generated structure makes a text-to-tree-to-structure round trip

World generation already knows that a value is a place, passage, person, fact or action, but discards that structure
into Kyr source. `ModuleParser` must rediscover it before compilation. New worlds produce new text, so text-keyed
parse and compiled-module caches cannot remove this first cost.

**Mitigation: introduce a typed generation IR.**

1. Define a `ModuleSource` or builder layer containing the constructs generators are allowed to emit. Start with the
   highest-volume forms: places, things, passages, people and initial facts.
2. Lower both parsed Kyr and generated builders into the same canonical `Module`/bound IR. Keep name binding,
   vocabulary checking, validation, compilation and installation downstream of that convergence point.
3. Retain a deterministic Kyr writer for inspection, fixtures and author export; do not make serialization part of
   normal startup.
4. Migrate one generator family at a time. During migration, emit both forms for a corpus of seeds, parse the textual
   form and compare normalized modules structurally.
5. Include source provenance in the IR so diagnostics can still identify the generator, seed and construct when no
   source line exists.

**Verification:** byte- or structure-equivalent canonical modules across representative seeds; identical campaign
digests, checkpoints and transcripts; deliberately invalid generated values rejected by the same validator; parse
time approaching zero for migrated generated content without changing authored `.kyr` behaviour.

### 2. Ohm constructs far more runtime structure than the final module needs

Ohm applies a general grammar, memoizes rule results and retains source intervals before semantic actions construct a
second object graph. Declaration-dense generated input is especially expensive: short identifiers and optional
clauses create many grammar events per byte. The grammar is broad because Kyr expresses both general rules and the
RPG world schema.

**Mitigation: reserve the general parser for authored text and keep optimizing it by evidence.**

1. Do not replace Ohm solely to accelerate generated worlds; the typed generation path removes that workload with
   less semantic risk.
2. Add phase and grammar-rule profiling on a fixed authored corpus. Optimize only rules with high aggregate cost.
3. Preserve the differential contract between `KyrQuick` and `Kyr`: every accepted input must produce the same
   module, and rejected input must receive the authoritative grammar's diagnostic.
4. Benchmark declaration count and construct mix as well as bytes. Those better predict CST size.
5. If authored parsing remains a material cold-start cost after generated IR lands, evaluate a lexer or alternate
   parser in a spike against the complete parse-store corpus. Adoption requires identical canonical modules and
   diagnostics of comparable quality.

**Verification:** corpus-wide equivalence tests, malformed-input diagnostic tests, and scaling runs over bytes,
declarations and nesting depth. Require approximately linear growth and record peak heap as well as elapsed time.

### 3. Ownership is enforced with repeated deep clones

The parse cache clones a new module when remembering it; cache hits clone before returning; `ModuleBundle` maintains
another parsed-module cache and clones its result. These copies defend correctly against later in-place compilation,
but ownership is implicit and distributed. In the controlled case one necessary-looking cache clone cost 217 ms,
and larger startup profiles show cloning distributed across many later boundaries.

**Mitigation: make immutable and mutable phases explicit.**

1. Define the parsed/bound representation as immutable and treat cache entries as shared values.
2. Identify every downstream mutation—lowering, namespacing, sizing, canon installation and composition—and change
   each to return a new value or copy only the branch it changes.
3. Replace full defensive clones only after mutation tests prove the reader cannot modify the shared value.
4. Consolidate `ParseCache`, `ModuleBundle.parses` and compiled-module ownership rules behind one cache abstraction.
5. In development, deep-freeze cached modules or use mutation-detecting proxies to expose hidden writes.

**Verification:** run the full suite with frozen cache entries; load the same cached module into two campaigns and
prove mutations in one cannot appear in the other; measure clone count, cloned bytes and clone time by caller before
and after each removal.

### 4. Telemetry conflates and omits parsing costs

The present parse duration combines Ohm matching and semantic lowering but excludes the cache clone and persistent
store write. It also reports key/string length as bytes. This makes a useful broad signal look more precise than it
is and can send optimization toward the wrong phase.

**Mitigation: report the pipeline directly.**

Record, per text and in aggregate:

- UTF-8 bytes, characters, declarations and resulting entity/action/fact counts;
- cache-key/vocabulary time;
- memory-cache and persistent-store lookup time;
- grammar-match time;
- semantic-lowering and validation time;
- clone/ownership-transfer time;
- persistent-store serialization and write time;
- cache hit, miss and eviction status.

Keep wall-clock campaign startup as the governing metric because improvements that merely move work between labels
do not help the player.

**Verification:** phase totals should reconcile closely with an outer timer, with unexplained time printed
explicitly. A benchmark should be able to show cold authored, new generated, warm memory and warm persistent-cache
cases separately.

### 5. Cache identity depends on vocabulary and large source strings

Parses correctly depend on the vocabulary under which a module was read. Keys currently include that fingerprint and
the complete text, while vocabulary discovery may scan generated text against active kinds. This is necessary under
the current context-sensitive parser, but makes cache identity large and couples parsing to mutable catalog state.
It was negligible without an active catalog in the controlled probe, although earlier full-world profiles found a
measurable vocabulary-scan tail.

**Mitigation: move binding out of syntax parsing and use compact content identities.**

1. Make parsing produce unresolved names independently of the active catalog.
2. Resolve and validate those names in a binding/compiler phase given an explicit immutable catalog context.
3. Key syntax parses by grammar edition and content digest; key bound/compiled IR by syntax digest, compiler edition
   and catalog-context digest.
4. Store the original text once, outside the in-memory key, and use collision-resistant digests with equality checks
   where untrusted content can enter.
5. Remove process-global vocabulary activation after campaign-owned catalog contexts are available.

**Verification:** the same text parses once across distinct catalogs but binds separately; two campaigns with
conflicting local kinds remain isolated under interleaved loads; changing a relevant catalog entry invalidates bound
IR but not syntax; changing an irrelevant entry does not force reparsing.

### 6. Many small generated files add overhead and complicate diagnosis

A generated country commonly arrives as dozens of texts. Per-text matching, cache lookup, cloning and vocabulary
installation add fixed cost, while aggregate reporting hides whether time follows bytes, declarations or file count.

**Mitigation: treat batching as a secondary optimization.**

1. Benchmark the actual corpus unchanged, concatenated into one valid module, and grouped by generator family.
2. If fixed per-file overhead is material, allow generated IR to be delivered in batches while preserving logical
   source units and provenance.
3. Do not concatenate authored modules merely for speed; file boundaries serve diagnostics, local-kind semantics and
   incremental caching.

**Verification:** hold declarations and construct mix constant while varying file count. Pursue batching only if it
remains material after the typed-generation path and ownership work.

## Recommended order

1. Correct the instrumentation so subsequent decisions use match/lower/clone/store timings.
2. Build the typed generation IR and differential harness for the highest-volume constructs.
3. Migrate generated families incrementally, preserving the Kyr writer as a diagnostic representation.
4. Make cached parsed/bound values immutable, then remove proven-unnecessary clones.
5. Separate syntax parsing from catalog binding and compact the cache identities.
6. Reprofile authored Kyr; only then consider further grammar work or a parser replacement.

The first three steps target the player's two-second complaint directly. The later steps improve campaign isolation,
cache correctness and architectural clarity as well as performance. A parser rewrite or indiscriminate file
concatenation should not precede them.
