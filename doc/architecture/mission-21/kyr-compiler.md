# The Kyr compiler: what a start costs, stage by stage, and what the language makes it repeat

The owner, 15 November: does Kyr's language design or compilation model impose costs it need not? Profile the
compiler by stage before prescribing; find what the 39 installs repeat, which validity can be cached, what blocks
incremental compilation; tell missing constructs from library patterns from kernel operations; and measure the full
world's start like for like, the cold browser path included. No syntax rewrite or redesign without a small measured
proof.

**The short answer:**
- **The first touch is slow because a fresh browser profile parses everything,** not because the browser is three
  times slower than Node. Like for like, Chromium is 1.3–1.5× Node, cold to cold and warm to warm. The "3×" set a
  cold browser against a warm Node.
- **Of a first visit's 18.4 s from Start to the first place, 10 s is parsing Kyr:**
  - about 4.5 s is the authored and shared texts, the same for every player of a build;
  - about 5.5 s is the country just generated, new for every new game.
- **Parsing is ohm's matching, not the grammar's shape:** 75 % of it is the match, at about 550 KB/s, and 25 % the
  semantics. Nothing in the grammar forces a text to be read twice; across a cold start, 148 of 151 parses are of
  distinct texts.
- **Warm, the 39 installs repeat the shared rules each time.** Each recomposes the shared rules (82 actions, 57
  rules), and the join then throws them away:
  - an install that brings almost nothing costs 30 ms;
  - about 0.9 s of a 5.7 s warm start is that repetition.
- **Validity is monotone under joining, with one exception,** which the new property test finds: an action's
  parameter may not share a name with an entity, and that holds only until another module brings the entity. So
  validating the shared rules by reference is sound if that one check is kept per install, and it is cheap.
- **No compiler change was made.** The change the profile justifies most for the first touch is shipping the
  authored texts' parses with the build: 4.7 MB of JSON, 0.62 MB gzipped, read back in 24 ms against 3.8 s to parse
  them. Its gain is measured already, by the benchmark's "new country" pass: 18.4 → 13.9 s. It belongs in the site
  build, not in the language, and it is proposed in §6 with what it needs.

## 1. The benchmark

`bun scripts/startup-bench.ts [full|tiny …] [--runs N] [--browser [--browser-runs N]] [--md] [--json out]`

- **Files:** scripts/startup-bench.ts, with scripts/startup-probes.ts, startup-report.ts and startup-browser.ts.
- **Node:** each run is a fresh process.
  - **cold:** no disk parse store (`KYRIE_PARSE_STORE=0`);
  - **warm:** the store primed by one run before;
  - **again:** the same start a second time in that process, with no store and with the store.
- **Stages:** timed by wrapping the compiler's and installer's own methods in the benchmark's process only. The engine
  carries no new instrumentation.
  - Each stage's time includes what it calls: an install includes its compose, and a compose its validations.
  - `structuredClone` is counted wherever it is called from.
  - Each install is timed, and so is each stage within it.
- **Browser:** the local site build (`SiteBuild.site`) in Playwright's Chromium, 1180×820 with touch, a1 by
  `?world=a1`. Each profile is fresh:
  - **first visit:** nothing kept in IndexedDB;
  - **returning:** the same country begun again in that profile;
  - **new country:** a1 begun in a profile that has begun kite first. The authored and shared texts are kept, a1's own
    generated texts are not. This is what a returning player who starts a new game waits for.
  - **15 s at creation:** a first visit whose player reads creation for 15 s before Start.

  Start is pressed as soon as creation shows, except in the last pass. What the engine says of itself in its first
  frame (drawing, placing, the screen, the telling) is set apart from the page, the transfer and the paint. Every
  request to the worker is timed from the page.

Machine: WSL2, 16 cores, 15 GB, bun 1.4.3. Another agent and the lead were at work throughout, so the load averages
given with each table are real and the medians are noisy. The run-to-run spread is in §1.4.

### 1.1 a1, Node (3 cold, 3 warm runs; load 5.3–7.7)

| stage | cold | warm | again, no store | again, store |
|---|---:|---:|---:|---:|
| import | 212 ms | 188 ms | — | — |
| **start, whole** | **14084 ms** | **5694 ms** | **8924 ms** | **5233 ms** |
| world | 763 ms (1) | 543 ms (1) | 515 ms (1) | 382 ms (1) |
| region | 183 ms (1) | 179 ms (1) | 38 ms (1) | 46 ms (1) |
| campaign | 12873 ms (1) | 4722 ms (1) | 8093 ms (1) | 4503 ms (1) |
| kits | 0 ms (1) | 0 ms (1) | 0 ms (1) | 0 ms (1) |
| canon | 0 ms (1) | 0 ms (1) | 0 ms (1) | 0 ms (1) |
| install | 6408 ms (39) | 2182 ms (39) | 1945 ms (39) | 1921 ms (39) |
| parse | 8204 ms (151) | — | 3790 ms (39) | — |
| parse kept | 0 ms (36) | 0 ms (187) | — | 0 ms (39) |
| compose | 857 ms (39) | 822 ms (39) | 828 ms (39) | 814 ms (39) |
| instantiate | 299 ms (39) | 290 ms (39) | 285 ms (39) | 288 ms (39) |
| validate | 634 ms (52) | 620 ms (52) | 700 ms (52) | 684 ms (52) |
| discovery | 15 ms (40) | 14 ms (40) | 13 ms (40) | 14 ms (40) |
| namespace | 435 ms (39) | 439 ms (39) | 453 ms (39) | 473 ms (39) |
| join | 461 ms (39) | 474 ms (39) | 458 ms (39) | 443 ms (39) |
| roles | 34 ms (39) | 38 ms (39) | 35 ms (39) | 39 ms (39) |
| check joined | 266 ms (1) | 258 ms (1) | 320 ms (1) | 305 ms (1) |
| populate | 548 ms (37) | 556 ms (37) | 512 ms (37) | 570 ms (37) |
| project | 608 ms (39) | 598 ms (39) | 534 ms (39) | 604 ms (39) |
| creature | 166 ms (628) | 178 ms (628) | 159 ms (628) | 178 ms (628) |
| structuredClone | 1167 ms (50650) | 1054 ms (49726) | 960 ms (49881) | 956 ms (49549) |
| refresh | 309 ms (2) | 288 ms (2) | 265 ms (2) | 299 ms (2) |
| settle | 23 ms (38) | 24 ms (38) | 19 ms (38) | 20 ms (38) |
| session | 12873 ms (1) | 4723 ms (1) | 8093 ms (1) | 4503 ms (1) |
| screen | 402 ms (1) | 403 ms (1) | 297 ms (1) | 310 ms (1) |
| leaf | 34 ms (1) | 31 ms (1) | 21 ms (1) | 21 ms (1) |

| # | install | warm | cold |
|---:|---|---:|---:|
| 1 | canon | 60 ms | 296 ms |
| 2 | region | 595 ms | 649 ms |
| 3 | factors | 59 ms | 175 ms |
| 4 | word1 | 21 ms | 30 ms |
| 5 | players | 28 ms | 75 ms |
| 6 | word2 | 19 ms | 36 ms |
| 7 | tower | 43 ms | 116 ms |
| 8 | word3 | 25 ms | 47 ms |
| 9 | den | 37 ms | 52 ms |
| 10 | word4 | 18 ms | 32 ms |
| 11 | den2 | 29 ms | 38 ms |
| 12 | word5 | 19 ms | 43 ms |
| 13 | quarrel | 21 ms | 36 ms |
| 14 | word6 | 23 ms | 27 ms |
| 15 | drover | 34 ms | 110 ms |
| 16 | oxen | 27 ms | 36 ms |
| 17 | word7 | 19 ms | 43 ms |
| 18 | circus | 262 ms | 2024 ms |
| 19 | word8 | 25 ms | 39 ms |
| 20 | arcology | 80 ms | 437 ms |
| 21 | word9 | 29 ms | 53 ms |
| 22 | howe | 97 ms | 438 ms |
| 23 | word10 | 28 ms | 57 ms |
| 24 | keep | 91 ms | 408 ms |
| 25 | word11 | 21 ms | 50 ms |
| 26 | fellowship | 61 ms | 113 ms |
| 27 | word12 | 30 ms | 47 ms |
| 28 | walk | 98 ms | 474 ms |
| 29 | word13 | 27 ms | 31 ms |
| 30 | origin | 30 ms | 73 ms |
| 31 | arrival | 18 ms | 29 ms |
| 32 | raidersHold | 22 ms | 27 ms |
| 33 | raidersFolk | 29 ms | 67 ms |
| 34 | raidersWord1Lead | 20 ms | 28 ms |
| 35 | raidersWord1Name | 18 ms | 20 ms |
| 36 | raidersWord1Teller1 | 19 ms | 22 ms |
| 37 | raidersWord1Teller2 | 18 ms | 20 ms |
| 38 | tollKeepers | 32 ms | 49 ms |
| 39 | pricePatron | 27 ms | 33 ms |

### 1.2 A tiny world, Node (3 cold, 3 warm runs; load 5.5–5.7)

| stage | cold | warm | again, no store | again, store |
|---|---:|---:|---:|---:|
| import | 158 ms | 161 ms | — | — |
| **start, whole** | **595 ms** | **238 ms** | **101 ms** | **89 ms** |
| campaign | 538 ms (1) | 172 ms (1) | 70 ms (1) | 69 ms (1) |
| canon | 0 ms (1) | 0 ms (1) | 0 ms (1) | 0 ms (1) |
| install | 383 ms (2) | 102 ms (2) | 53 ms (2) | 52 ms (2) |
| parse | 369 ms (23) | — | — | — |
| parse kept | 0 ms (6) | 0 ms (29) | — | — |
| compose | 43 ms (2) | 46 ms (2) | 27 ms (2) | 22 ms (2) |
| instantiate | 22 ms (2) | 23 ms (2) | 16 ms (2) | 10 ms (2) |
| validate | 22 ms (3) | 23 ms (3) | 19 ms (3) | 13 ms (3) |
| discovery | 1 ms (3) | 1 ms (3) | 0 ms (3) | 0 ms (3) |
| namespace | 18 ms (2) | 19 ms (2) | 13 ms (2) | 18 ms (2) |
| join | 6 ms (2) | 6 ms (2) | 2 ms (2) | 2 ms (2) |
| roles | 0 ms (2) | 0 ms (2) | 0 ms (2) | 0 ms (2) |
| check joined | 5 ms (1) | 5 ms (1) | 4 ms (1) | 4 ms (1) |
| project | 8 ms (1) | 8 ms (1) | 1 ms (1) | 2 ms (1) |
| creature | 6 ms (1) | 8 ms (1) | 1 ms (1) | 1 ms (1) |
| structuredClone | 31 ms (938) | 27 ms (938) | 19 ms (898) | 19 ms (898) |
| refresh | 17 ms (2) | 12 ms (2) | 3 ms (2) | 3 ms (2) |
| settle | 0 ms (1) | 0 ms (1) | 0 ms (1) | 0 ms (1) |
| session | 538 ms (1) | 172 ms (1) | 70 ms (1) | 69 ms (1) |
| screen | 48 ms (1) | 57 ms (1) | 23 ms (1) | 18 ms (1) |
| leaf | 8 ms (1) | 8 ms (1) | 2 ms (1) | 2 ms (1) |

### 1.3 a1 in the browser (Chromium, local site build; final run, load 5.5–10)

| pass | load | page to creation | Start to first place | engine (draw + place) | screen + telling | transfer and paint |
|---|---:|---:|---:|---:|---:|---:|
| first visit (3) | 5.5 | 2808 ms | 20957 ms | 19813 ms | 455 ms | 689 ms |
| returning (3) | 6.2 | 2824 ms | 8328 ms | 7404 ms | 468 ms | 456 ms |
| new country (3) | 6.9 | 2797 ms | 13857 ms | 13204 ms | 490 ms | 163 ms |
| first visit, 15 s at creation (3) | 8.3 | 2813 ms | 8899 ms | 7244 ms | 641 ms | 1014 ms |

| request (cold pass, median) | ms |
|---|---:|
| catalog | 1078 |
| world | 868 |
| creation | 39 |
| preview | 40 |
| set-out | 20506 |
| ready | 0 |

### 1.4 Spread, and an earlier quieter browser run

The earlier run (same build, load 3.8–4.0, 3 runs a pass, no 15 s pass):

| pass | load | page to creation | Start to first place |
|---|---:|---:|---:|
| first visit (3) | 3.8 | 2813 ms | 18389 ms |
| returning (3) | 4.0 | 2817 ms | 8335 ms |
| new country (3) | 3.9 | 2828 ms | 13858 ms |

- **Browser, first visit:** 17.4–23.5 s in the final run and 17.4–18.9 s in the earlier one; the slowest runs fell when the load passed 8.
- **Browser, returning:** 7.3–12.4 s.
- **Node, warm:** 5.2–6.2 s across every run today.
- **Node, cold:** 13.4–21.4 s; one outlier at load 4.8.

The medians below use the earlier run's 18.4 s for a first visit, as the quieter figure. The final run's 21.0 s is the
same measure under a heavier load.

The rows `kits` and `canon` are 0 ms in a1: it composes no kits, and its canon is installed as its first module (the
install table's row 1), not by `CanonInstall.first`.


## 2. The stage profile

### 2.1 Warm: what each install recomputes

Each of the 39 installs (`ModuleBundle.load`, then `ModuleInstallations.prepare` and `populate`) does this:

1. **Copies the merged shared rules** (`structuredClone(combined)`). The parse is kept, but compose lowers in place, so
   each install needs its own copy.
2. **Joins them to its own module and lowers the whole** (`ModuleCompiler.instantiate`). Expressions are settled and
   predicates resolved, the shared rules' included. The shared rules hold no dice, so their lowering is the same for
   every seed.
3. **Validates the whole twice:**
   - once in `instantiate`;
   - once more in `ModuleAssembly.readOnly`, to check its goals, pressures and outcomes as predicates.

   Both passes cover all 82 shared actions and 57 shared rules.
4. **Namespaces the whole** (`ModuleNamespace.draft`). Every shared action, rule and change is copied and mapped.
5. **Joins it to the campaign.** The union keeps the campaign's first copy of every shared action and rule, and throws
   this install's away:
   - **3,116 actions and 2,166 rules dropped over a1's 39 installs**, against 2,294 own actions kept;
   - the join also copies every actor already in the world (`extended`), and checks entities by linear scans.

What an install that brings almost nothing costs (the 17 `word`/`raidersWord` installs, median, warm):

| stage | ms | of it |
|---|---:|---|
| compose | 8.0 | lowering 3.2, validation 2.9 |
| namespace | 5.6 | |
| the rest of loading | 5 | generation, merging, shadowing |
| join | 9.8 | grows with the world |
| populate | 2.8 | creature facts, newcomers only |
| **in all** | **about 30** | **×38 installs after the first: about 1.1 s** |

Of it, the shared rules' own work is about 0.9 s of a 5.7 s warm start (16 %): compose, namespacing, and their share of
the 1.1 s of `structuredClone`. The CPU profile's callers of `structuredClone`, in samples of 1 ms:

| caller | samples |
|---|---:|
| namespacing, actions and changes | 218 |
| the shared rules' copy per install | 126 |
| compose: schemas and cast | 117 |
| the parse cache's copies | 112 |
| the campaign's fork | 45 |
| `extended` | 36 |

Validation in all is 0.65 s:
- **compose's first passes:** 237 ms;
- **the `readOnly` second passes:** 121 ms;
- **the joined whole, once at the end:** 273–296 ms.

Inside validation, one line stands out: `ModuleCompiler.action` looks up a topic's speaker by scanning every entity
(module-compiler.ts:156), **150 ms**. It is quadratic in a world of 11,000 entities, though the compiler's own lookup
table already holds the answer. The same pattern is in module-assembly.ts:296, about 60 ms (each ability and feat is
looked for among all entities), and in `LocalKinds.seen` (local-catalog.ts:104), 156 ms: every installed kind is looked
for in every text a parse is kept by.

### 2.2 Cold: the parse

A cold a1 start parses 151 texts, 3.35 MB, in 8.7 s (385 KB/s):

| texts | count | KB | ms (Node) |
|---|---:|---:|---:|
| generated (the region, provinces, people) | 54 | 1,626 | 4,827 |
| authored files (data/ adventures, sites, kits) | 73 | 1,587 | 3,578 |
| shared rules (data/rules) | 18 | 115 | 253 |
| canon (data/imbar) | 6 | 25 | 59 |

- **Three texts are parsed twice,** 172 ms in all. Each was read once among the canon's kinds and once among a
  module's own. The parse is keyed by the kinds a text names; see §4.
- **The rest are distinct:** re-parsing the same text is not the cost.
- **Matching is 75 % of a parse.** `Grammars.kyr.match` alone over the same 151 texts takes 6.0 s, about 550 KB/s; the
  semantics (`ast`) and what follows take the other 25 %. The largest texts are the slowest per byte: a 39 KB generated
  province parses at about 200 KB/s, while the 347 KB region parses at 400 KB/s.
- **With no store, a second start in the same process parses 39 texts again (4.0–4.7 s).** `ParseCache` keeps 96 texts
  and a1 has 187. This happens in Node when `KYRIE_PARSE_STORE=0`. The browser is spared it, because its ParseKeep
  answers the cache's misses.

### 2.3 Why the browser looked three times slower

Medians of the browser runs (§1.3–1.4), against Node's (§1.1):

| | Node | Chromium | ratio |
|---|---:|---:|---:|
| cold, Start to play | 14.1 s (cold start) | 18.4 s (first visit) | 1.30 |
| warm | 5.7 s | 8.3 s (returning) | 1.46 |
| the authored texts' parse (first visit − new country) | 3.9 s | 4.5 s | 1.15 |
| a1's own generated texts' parse (new country − returning) | 4.8 s | 5.5 s | 1.15 |

- **The "17–19.5 s, 3× Node" of SP-01 set a fresh-profile browser, which parses everything, against a warm Node.**
  Every Playwright context is a fresh profile, so every browser measure so far has been a first visit.
- **Like for like, the worker is 15 % slower at parsing and about 45 % slower at installing.** V8 in a worker, against
  bun's JavaScriptCore. Transfer and paint are 0.2–0.6 s.
- **Before Start, the page costs 2.8 s to creation:**
  - the worker's boot and its first request (`catalog`), about 1.1 s;
  - drawing the country (`world`), about 0.9 s.
- **A player who reads creation for 15 s still waits 8.9 s after Start** (5.4–9.4 s). The page begins the start
  1.2 s after creation shows (`ReaderOpening.readySoon`), but a first visit's start takes 18–21 s, so 15 s of
  reading hides only part of it.

## 3. Validity: local, composition-dependent, and monotone

What ModuleCompiler.validate checks, by what it depends on:

| property | depends on | monotone under joining? |
|---|---|---|
| an action's cost and time are integers; its parameters are distinct | the declaration | yes |
| each predicate is well typed: the relation, measure or query named, and the arity and kinds | the signatures it names | yes, given unique names |
| a rule's or action's writes are bound by its condition (`writes`, `bound`) | the declaration | yes |
| words speak only of what the condition binds | the declaration | yes |
| no rule writes what the engine owns (EngineOwned) | the declaration | yes |
| aspects, `teaches`, `about`, `by` name an entity of the right type | the entities | yes (adding entities only adds answers) |
| queries are acyclic | the queries it reaches | yes: a cycle through A's query would need B to redefine one of A's names |
| **an action's parameter is not named as an entity** | **every entity** | **no:** B's entity `origin` breaks A's `go(origin: place, …)` |
| unique ids: kinds, entities, actions, functions, rules, observations, objectives, pursuits | the whole | a property of the composition, not of a declaration |
| Spatial.validate: parents, modes, positions | the whole set of places | of the composition |
| Discovery.validate, RoleRequirements, `admit` (typed imports, no reset of imported state) | the whole, and the world | of the composition |

**The property test** is test/small/kyr-monotone.test.ts (1 s). It draws 160 pairs of small modules:
- **A** is a ruleset with an action whose parameters are named from a few common names;
- **B** is a module written against A, from fragments: new kinds, relations, entities named like A's parameters,
  queries, rules, actions.

For each pair whose names do not collide, A's own declarations are checked among every name of A+B. The test finds:
- **Joined (ModuleCompiler's `joined`, as a world is checked):** monotone. Nothing valid in A alone is invalid among
  A+B's names.
- **Composed (a module first joined to its rules, as `ModuleAssembly.compose` checks it):** exactly one failure,
  "Parameter shadows entity". The check was mutated to apply when joined too, and the first case failed, so the test
  sees it.

**What follows for AX-03:**
- The shared rules can be validated once per edition and referred to after.
- Each install must still check:
  - its own declarations, among the shared signatures;
  - the shared actions' parameter names against its own entities (a set lookup over about 200 names);
  - the composition's properties: uniqueness, Spatial, Discovery, roles.
- Every check but the shadow is local or a composition property, so nothing else is lost.

## 4. What the language assumes that blocks incremental compilation

1. **A parse depends on the kinds in force.** `ModuleParser.parse` reads a text among the vocabulary active at that
   moment (`Kind figurine like dreg_ox`, a catalog's item kinds), and the parse is kept by `Vocabularies.seen`.
   - That key is the vocabulary's id and every installed kind the text names (`LocalKinds.seen`, 156 ms a warm start).
     So the same text is a different parse in a different composition.
   - That is the three duplicate parses of §2.2. It is also why a parse cannot be cached by its text alone, nor shipped
     without its key.
   - vocabulary.ts calls this "the next boundary to move". Resolving kinds after parsing, as names, would make a parse
     a pure function of its text.
2. **Lowering is done in place, with the module's seed.** `instantiate` settles dice with `${seed}:module` and mutates
   the definition it is given, so every install needs its own copy of the shared rules. The shared rules hold no
   dice, so their lowered form is the same for every seed; nothing in the language marks that.
3. **Shared and own declarations are merged into one flat namespace, then pulled apart again.** compose concatenates
   the shared rules with the module's own. Namespacing copies them all and keeps the shared ids. The join's `union`
   then drops the shared ones as duplicates by id. The manifest has explicit interfaces (`imports`, `globals`,
   `exports`, `canon`), but the Kyr module itself declares none: a module cannot say "against rules edition E" and be
   compiled once against E's signatures.
4. **Bare names resolve to parameters or entities by context.** Action and query parameters are bare (`actor`,
   `origin`), entities are bare, and only rule and observation variables are marked (`?c`). That is the one
   non-monotone check of §3. Marking parameters, or scoping them lexically and always preferring the parameter, would
   remove it. The joined mode already prefers the parameter.
5. **A name a module shares with the shared rules is rewritten in its text, and the text parsed again**
   (`ModuleShadow.text`). It was not exercised in a1's start, but it is a textual, not a structural, renaming.
6. **Validation is whole-module.** `validate(module)` checks everything it is given. There is no unit smaller than a
   module to validate or to keep valid.

Nothing in the grammar forces a re-parse. The re-parses come from 1 and 5, and from the in-process cache's size.

## 5. Constructs, library patterns and kernel operations

### Declarative queries

**Already a construct:** `Query near(x: place, y: place) means …` is a typed, acyclic, Datalog-like predicate, and
`World.solve` answers any predicate.

**The integration code that asks the world questions by hand:** 161 `world.related('…')` reads in src/, the most in
src/ui/chart-model.ts (15), trade-model.ts (10), world-audit.ts (10), company-knowledge.ts and aim-leads.ts (6 each).

**Example:** `TradeModel` (src/ui/trade-model.ts:51–58) works out what a merchant would buy:
- the company's members (`memberOf(?m, party)`);
- what they own (`ownedItem`);
- the merchant's trades (`dealsIn`, `tradeOf`) and whether they buy valuables (`buysValuables`, `valuable`);
- each item's form, found in TypeScript.

As Kyr, it is a query: `Query sellable(item: thing, merchant: group) means memberOf(?m, party) and ownedItem(item, ?m)
and (…)`.

**What is missing:**
- **Not a construct, a library pattern plus one kernel affordance:** queries exported by name, which the engine and the
  UI call through a typed entry point instead of `related`;
- **a construct:** reading a catalog field in a predicate (an item's form, its price). It is what forces the form
  lookup out into TypeScript;
- **counting and sums** exist (src/lang/counts.ts) and need no new construct.

**What it would replace:** most of the ui/*-model reads, which are projections of facts the world already holds. It
would not replace World.solve's binder, which is the kernel.

### Generic resource modifiers

**Already constructs:** `Give x to actor` and `Spend kind from actor`, and `consumes` on a change (ChangeConsumes).
They lower to signal relations (`handed`, `usesUp`, the `gifts` measure).

**The integration code:** `Consequences.hand` (src/campaign/consequences.ts:80–) reads those signals each tick:
- retracts them;
- makes a new item where a kind was given;
- finds the first member who is up, and moves the item between creatures' inventories in the creature store.

**Why that stays TypeScript:** inventories live in the creature store, not in Kyr's facts, so the move is a genuine
**kernel operation** (a transfer between stores, with its lease and its event). The same is true of `CreatureFacts.
project`, 0.6 s a start: it writes the store's state into the world as facts.

**What a construct would and would not change:**
- A generic modifier construct ("add n of resource r to x", with bounds) would replace the bespoke signal-and-tick
  pairs one by one, each new resource's TypeScript reader among them.
- It would not remove the kernel operation underneath.
- Until inventories are facts (or facts are views of the store), adding constructs only moves the bespoke code into
  lowering.

### Deferred generation commitments

**Already patterns:**
- **The Ledger** (src/world/compose/ledger.ts) is an append-only set of commitments in Kyr's assembly vocabulary.
  Kits are placed against it, and a fact established is never rewritten.
- **Regions** say their commitments in their manifests (`assembly.commitments`).

**The integration code:** `Frontier` (src/world/frontier.ts) watches whether the company stands at a march-stone
(`at(party, …__edge_side)`). It then draws the country beyond, writes it as Kyr, parses it and installs it.

**The split:**
- **Library pattern:** the trigger. A rule over `at` and a `marchStone(edge, side, beyond)` relation, its effect a
  commitment `drawn(beyond)`, would replace `Frontier.drawing`'s regular expression and grid arithmetic.
- **Kernel operation:** the realization. Generating, composing and installing a module cannot be Kyr.
- **Missing construct:** an effect that asks the kernel to realize a commitment (`Realize region(beyond)`), with the
  commitment kept in the ledger. Then a hex or a site could be realized when first perceived, the investigation of
  investigations.md §3.

**It would cut start-up only together with AX-04.** Realizing less at the start is the gain, and that needs generated
content kept as structure, not as text to parse: generate to the AST.

## 6. The proof not made, and the proposals, with their expected gains

**No engine change was made.** The highest-leverage change the profile justifies is outside the language, and it is
already measured. The compiler's own changes are each worth less than 16 % of a warm start, and the largest of them
needs the shared rules threaded by reference through compose, namespacing and the join. That is a redesign the
brief asks to prove first, and it is proposed below, not made.

In the order of their gain to the first touch:

1. **Ship the authored texts' parses with the build.** Expected: first visit 18.4 → about 13.9 s (−4.5 s, −25 %).
   - **Measured:** that is the "new country" pass exactly: the same texts kept, the generated ones not.
   - **Its cost, measured** (a1's 97 authored and shared texts):
     - 4.7 MB of JSON, 0.62 MB gzipped (v8 serialization 5.2 MB);
     - `JSON.parse` 24 ms, and copying them all 68 ms, against 3.8 s to parse them in Node and about 4.5 s in the
       worker.
   - **What it needs:**
     - keys as ParseKeep keeps them: the vocabulary-dependent key of §4.1, made by a start at build time, so
       compositions that read a text among other kinds still miss;
     - delivered inside the engine bundle, since the site must work from file:// and a blob worker cannot fetch
       beside itself;
     - made once per build stamp and cached by content, because SiteBuild runs in every browser spec's `beforeAll`.
       A start per build would add 15 s to each.
   - **Better after §4.1:** with a parse a pure function of its text, the table is keyed by the text's hash alone.
2. **Generate to the AST (AX-04).** Expected: every new country, −5.5 s in the browser (−4.8 s in Node). That is the
   new-country pass's 13.9 s down to about 8.4 s, the returning figure. RegionWriter, Provinces and the people's
   writers write Kyr text that is parsed at once; writing the Module directly skips the 1.6 MB parse. Keep the text
   writer for authors and for the lint, with a round-trip spec.
3. **Compose the shared rules once, by reference (AX-03).** Expected: −0.8 to −0.9 s warm (−15 %); about −1.2 s in the
   browser. The monotonicity test makes it sound (§3). The shared rules have no dice, so one lowered, validated and
   namespaced copy per edition can stand for all; compose, namespacing and the join would carry only the module's own
   declarations, plus the shadow check of §3 against the shared parameters.
4. **Small and safe, worth doing beside 3** (about −0.4 s warm together):
   - the speaker lookup by the compiler's own table (150 ms);
   - the abilities' and feats' presence by a set (60 ms);
   - `readOnly`'s goals folded into `instantiate`'s one validation (121 ms);
   - `LocalKinds.seen` by the text's own words rather than every kind's `includes` (156 ms).
5. **Faster matching.** Only if 1 and 2 are not enough. Ohm's PEG matcher with full memoization runs at 550 KB/s, and
   a hand-written recursive-descent reader for the generated subset, or a lighter grammar for generated text, could
   be several times faster. But generating to the AST removes the generated half of the parse altogether, and
   shipping parses removes the authored half for the first touch.

## 7. What not to do

- **Do not rewrite Kyr's syntax for speed.** Nothing in the grammar forces a re-parse. The costs are reading texts the
  engine itself wrote (AX-04), reading texts every player's browser reads the same (§6.1), and copying and checking the
  shared rules 39 times (§2.1). None is the syntax.
- **Do not cache validation by declaration without the shadow check.** A shared action valid beside one module is not
  valid beside another that brings an entity named as its parameter (§3).
- **Do not key parses by text alone** while a parse depends on the kinds in force (§4.1). That was the review's H7.
- **Do not judge the browser by a Playwright context's first start.** It is a first visit: give the profile, the pass,
  and the load.
- **Do not grow `ParseCache` to fit a1** for the browser's sake. The browser's misses go to its ParseKeep; only a Node
  process without its store re-parses.
- **Do not chase `structuredClone` at its call sites one by one.** Most of it is the shared rules' copies (§2.1), and it
  goes with 3.
