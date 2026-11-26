# The compilation-context spike, reviewed (26 November)

The branch reviewed is `origin/spike/compilation-context-20261125`: one commit, 74bfb0527, by a cloud agent. It
changes 137 files (+3,752 −1,096) and branched from main at 97efd1346, which is 61 commits behind main today (4ded25b92).
The owner's question was whether it is "genuinely an improvement over what we have and helps meaningfully pave the way",
and whether it "does everything we need to make Kyr authoritative".

The measure throughout is step 5 of platform-separation.md's fifth review, together with recommendation #2 of
defects-by-cause-2026-11-25.md, which widens step 5 to "Kyr's compiler as the binding authority": one symbol table with
spans, typed vocabulary (OR-744) and lint as queries, over the 23 rows of cause C. The code was read rather than the
spike's own account. The evidence is file:line on the spike unless marked main.

## Verdict: rework. Do not land as is. Salvage two pieces as their own slices.

- **It does not land as is.** CI run 45745418073 on the branch is red: 13 specs fail in six jobs.
  - Three are behavioural regressions in shipped play:
    - The Patient Star, as shipped: "light a flask" is not offered.
    - The Patient Star probes: "Use a flask of lamp oil on Tamsin" has gone.
    - A local species' encyclopedia entry has lost its link to the kind it is like.
  - Seven are ratchets breached:
    - process-wide installs: +1;
    - direct Canon reads: gains in six families;
    - the knowledge door: +1 world read in screen-model;
    - Kyr's entry: 1,252 → 1,277 deep imports;
    - folder cycles: 11 new edges.
  - **The full-world start nearly doubles:** warm, 6.4 s → 11.7 s (median of 3, startup-bench). `structuredClone`
    calls go from 4 thousand to 827 thousand, because every scoped lookup clones (§4).
  - Of the spike's own specs plus the two behavioural failures, run locally: 66 pass. The Patient Star probe and the
    encyclopedia link fail here as in CI.
  - It also edits 12 files of src/lang. That is under the owner's language hold of 25 November, which put "the compiler
    as binding authority" and "the compiled-module cache" explicitly out of scope until asked again.
- **It does not make Kyr authoritative, and does not claim to.** It moves isolation, not authority:
  - none of cause C's 23 rows is retired;
  - the vocabulary interface grows into a bag of optional setting capabilities;
  - cache dependencies are guessed from source text with regular expressions, the pattern AR-08 exists to remove.
- **The defect it found is real** (a reproduction on main is below). **Its central principle is right:** a cache key
  carries the *definitions* of the kinds a text depends on, not their names. So are its proof pattern (interleaved loads
  compared with sequential ones) and fork-based read-ahead.
- **Salvage, as separate slices** (see "A sequence toward authority"):
  - (a) **Correct cache keys:** the definition-carrying key and its spec, taken from local-catalog.ts `signature`/`seen`
    and compiled-modules.ts `key`, with the dependencies taken from the parse rather than from regular expressions.
  - (b) **Loading without ambient catalog state:** the campaign path off `LocalKinds.activate/reset/reclaim/aside`
    (campaign.ts, campaign-assembly.ts, module-bundle.ts read-ahead). It carries the catalog as one **required**
    per-campaign context, not 125 optional parameters that fall back to the ambient one.
  - Slice (a) touches src/lang and needs the owner's leave first.

## 1. Correctness

### The isolation defect is real on main

On main, a parse is kept by `Vocabularies.seen(text)` (main src/lang/kept-parses.ts:14). That resolves to
`LocalKinds.seen`, which returns the *ids* of the installed kinds a text names: `item:token`, never what `token` is
(main src/canon/local-catalog.ts `seen`). A text `Kind made "made" like token.` read while `token` is worth 1 is
therefore handed back, unchanged, when `token` is worth 9.

The reproduction ran on a main worktree (test/probe-specrev/names-only.test.ts, not committed). It used
`LocalKinds.activate({token: alpha worth 1})`, then beta worth 9, then alpha, parsing the heir between each:

```ts
const make = (name: string, worth: number) =>
  LocalKinds.item(name, { id: 'token', name, base: { category: 'gear' }, worth } as never);
const a = make('alpha', 1), b = make('beta', 9);
const text = 'Module heir "Heir" { Kind made "made" like token. }';
const read = () => LocalKinds.merge(ModuleParser.parse(text, []).catalog).catalog?.items?.made?.value;
LocalKinds.activate({ items: { token: a } }, {}); read();   // 1
LocalKinds.activate({ items: { token: b } }, {}); read();   // 1, should be 9
LocalKinds.activate({ items: { token: a } }, {}); read();   // 1
```

```
expected [1, 9, 1]   received [1, 1, 1]
```

The disk parse store (`ParseCache.store`) keeps the same key, so the stale parse also survives across processes. The
compiled-module key has the same flaw (main src/campaign/compiled-modules.ts:35, `Vocabularies.seen(all)`).

**Reach in shipped play is not shown.** The defect needs two campaigns in one process, or one disk store, that give one
local kind's name two definitions, while some text inherits from it (`like`) or wears its slot. The spike's specs prove
it on synthetic texts only. It is a real violation of "campaign isolation is an invariant" at the mechanism level,
without a witnessed player-facing failure.

### The fix is mostly correct, with holes

- **Cache keys** now carry the JSON of each named kind's definition, its species ancestry, and the slots when the text
  says `worn` (src/canon/local-catalog.ts `seen`, `signature`). Compiled keys add the source paths and every shared
  rule text's key (src/campaign/compiled-modules.ts:35-39). The key prefix moved from `\u0003` to `\u0005`, so old disk
  entries are not reused. This is sound: it over-includes, matching ids by substring (`text.includes(id)`), and never
  under-includes for the forms it knows.
- **The dependency scan stays textual.** `KeptParses.inherited` (src/lang/kept-parses.ts:52-56) finds dependencies with
  `/like(?:\s|\/\/…)*ident/` and `text.includes('worn')`, and `LocalKinds.seen` checks `text.includes('like')`. Any
  future form of dependency (a new inheriting keyword, a kind used in an expression) is silently missed. This is the
  same class of fault as ModuleShadow's regex renaming (AR-08), now in the cache's correctness.
- **`KeptParses.together`** (src/lang/kept-parses.ts:11-48) re-parses every sibling file until a vocabulary
  fingerprint is stable, up to 2n+1 passes. It is a fixed-point loop standing in for a declaration pass a symbol table
  would do once.
- **Forks:**
  - `Campaign.fork` builds a fresh scoped context from `module.catalog` (src/campaign/campaign.ts:110), which is correct.
  - `ModuleBundle.prepare` forks the *campaign's* vocabulary (src/world/frontier.ts:134,139 → module-bundle.ts:274),
    which is correct.
  - `warm`/`warmRules` fork the ambient one (module-bundle.ts:263,302), which is fine before any game.
  - The cost is that a read-ahead made against the ambient catalog misses wherever the real load names one of the
    campaign's own kinds, since the keys now differ. That costs performance, not correctness.
- **The ambient catalog is still written on product paths, and is now never reset.** `CanonVocabulary.install` with no
  local scope still calls `LocalKinds.read` (src/canon/canon-vocabulary.ts:114), so every parse without a vocabulary
  writes the process catalog:
  - src/world/origin-opening.ts:13 (an origin's module, which can declare the debt's `purse_kind`);
  - src/world/written-kyr.ts:18;
  - src/handbook/encyclopedia-lore.ts:45;
  - src/campaign/role-requirements.ts:35 (compile).

  The spike removed `LocalKinds.reset()` from campaign assembly (main campaign-assembly.ts:16), so those writes now
  accumulate for the life of the process. Every consumer that still reads the ambient catalog sees whichever previous
  origin was read last. That is a cross-campaign leak the old reset had bounded. It is reasoned from the code, not
  reproduced.
- **Ambient reads still sit on product paths**, and the CI failures land exactly there:
  - EncyclopediaEntry no longer finds a local species (test/small/encyclopedia-local-kind.test.ts:16, received
    undefined);
  - test/compiled-modules.test.ts:49 expected the ambient catalog to hold the kind;
  - src/ui/purchase-compare.ts:24 (`ItemCatalog.definitions[kind]`);
  - src/world/parties.ts:31-90 (`Canon.creature`, `Canon.temperament`);
  - src/world/region-market.ts:70-71;
  - src/overlays.ts:58 (an unscoped `ItemCatalog.get`).
- **The fallback pattern is itself the hole.** The spike adds **125 `vocabulary?: CatalogContext` parameters** and
  **38 `vocabulary: Vocabulary = Vocabularies` defaults**, and about 127 sites of the form
  `vocabulary ? vocabulary.x(id) : Canon.x(id)` (for example src/overlays.ts:87-178, src/creature.ts:75-147,
  src/rules/burden.ts:17,35). Every caller that forgets the argument silently reads the ambient catalog, which, with the
  activation gone, no longer holds the campaign's kinds. The type system cannot find the omissions. The two Patient
  Star failures are consistent with this, a lamp and its fuel losing their uses, but their root cause was not traced.
- **New authoring checks in passing** change what loads:
  - "a consumable needs a use" (local-catalog.ts:46);
  - "unknown habitat" (local-catalog.ts:68);
  - `LocalKinds.identity`: an item named like an ability, skill, deity or plant, or shadowing a canonical alias
    (local-catalog.ts:224-235).

  These are welcome contracts, but unannounced in a cache refactor, and their effect on the corpus is CI's to show.

## 2. Completeness against step 5

| Step 5 / "authoritative" requires | What the spike provides | Judgement |
|---|---|---|
| Vocabulary and local kinds passed *into* parsing and compilation | `ModuleParser.parse(text, declared, vocabulary)`, `ModuleCompiler(…, vocabulary)`, `ModuleBundle.load({vocabulary})`, all optional, defaulting to ambient | Partial: possible, not required |
| …and into their cache keys | Keys carry kind definitions, paths and rule keys (kept-parses.ts:62, compiled-modules.ts:35) | Done, by text heuristics |
| `LocalKinds.activate/reset/reclaim/aside` gone from production loading | Gone from campaign.ts, campaign-assembly.ts, module-bundle.ts; `aside`/`reclaim`/`claim` deleted; `activate` kept as a "legacy ambient" replacement used by specs | **Done** |
| No ambient catalog on product paths | 4 product parse sites unscoped; ambient read by encyclopedia, purchase-compare, parties, region-market, overlays; ambient now never reset | **Not done**, and the reset's bound lost |
| Proved with module loading interleaved between campaigns | test/small/scoped-loading.test.ts:105: two tiny campaigns, one paused mid-read, each equal to its sequential start | Done for one rules installation, on synthetic worlds |
| …between campaigns of different installations | Ordered, not interleaved (load-cache.ts:16-33) | Acceptable (see below) |
| One symbol table with identities and spans (MT-26/AR-08 Stage 4) | None; ModuleShadow untouched (module-shadow.ts:28-29, still regex) | Not begun |
| Typed vocabulary (OR-744) | None; the `Vocabulary` interface gains 9 optional members (vocabulary.ts:15-24) | Not begun; the interface moves the other way |
| Lint as queries over reads, writes and mentions | None | Not begun |
| Layers respected, ratchets held | +1 process-wide install (`CatalogContexts.install`), +25 deep imports into Kyr, +11 cycle edges, +1 knowledge-door read, Canon-read gains | **Regressed** |

**On "different installations remain ordered":** acceptable, and not a hole in isolation. Main serialized *every* load
(main load-cache.ts:13-19). The spike lets loads of one rules installation interleave and queues different
installations behind each other, because `Installed.during` has no async carrier in the browser. That is scheduling,
not leakage: nothing shared is mutated across the boundary any more. Only one installation ships, so it costs nothing
today. It belongs in OR-531's list as the remaining reason for an ordering, and it must not be reported as proof that
two installations interleave.

**What still reads the ambient vocabulary**, and whether it matters:
- **Language tools:**
  - kyr-lint.ts:75,99;
  - canonical-names.ts:24;
  - kyrie.ts:189;
  - kyr-doc.ts:28;
  - the handbooks (mm.ts, phb-company.ts, encyclopedia.ts:145).

  These are audit tools over the canon, and matter little, except that `bin/kyrie lint` is the gate. A gate that reads
  modules against a different catalog than the game does is a second derivation.
- **Runtime consumers:**
  - the encyclopedia, which matters: a player-facing regression in CI;
  - purchase-compare, which matters: a comparison silently missing for a local kind;
  - world/parties and region-market: world generation over canonical species and items, which matters only once a
    generated party may be of a module's species;
  - the four unscoped parse sites, which matter because they write the ambient catalog without reset.

## 3. Paving the way to authority

The spike runs alongside the authority work and, in two respects, obstructs it.

- **Toward:**
  - the compiled module's `catalog` becomes the single source of a campaign's kinds, with contexts derived from it
    (campaign.ts:56,72,110);
  - caches are keyed by meaning;
  - read-ahead is isolated by a fork;
  - an interleaving proof harness exists (the `PausedSource` in kinds-two-modules and scoped-loading).
- **Against:**
  1. **The `Vocabulary` interface becomes a capability bag.** It is the language's whole contract with a setting
     (src/lang/vocabulary.ts). It grows from 6 required members to 6 + 9 optional ones:
     - `fingerprint?`, `isBody?`, `isSpecies?`, `speciesDefinition?`, `resolveSpecies?`, `bodyName?`, `itemTraits?`
       (`slot`/`fuel`/`use`), `fork?`, and a `kind()` that now returns `slot`/`fuel`.
     - `CatalogContext` extends it with ten more (src/catalog-context.ts).
     - What a provider can do is discovered at run time ("An explicit vocabulary used for composition must provide
       itemTraits", src/campaign/item-traits.ts:31; canon lookup "requires a fork").
     - Fuel and slot are setting concepts, and the language's interface now names them. Typed vocabulary wants the
       opposite: the module declares its kinds and relations, and the compiler generates the accessors.
  2. **Dependencies are inferred from text, not from the parse** (above). A symbol table would give each module's
     references exactly. The spike's heuristics would then be deleted, not extended.
  3. **More of the campaign reaches presentation:**
     - `campaign.vocabulary` is read in screen-model, means, shut and character-sheet;
     - the knowledge-door ratchet gained a read (screen-model.ts world);
     - step 6 wants the APIs to stop accepting `Campaign`.

**Rows:**
- **Retired outright:** none of the 23 in cause C. It touches none of placeholders (AR-13, OR-541), unread writes
  (OR-235, OR-236, SI-05), name clashes (OR-402, AU-46, AU-35's rest), unreachable objectives (AU-15, OR-176, R11-08),
  MT-21, OR-404, AU-49, AU-52, AU-59/OR-403, AU-43, CF-04 or AR-14.
- **Advanced:**
  - **OR-531:** LocalKinds no longer activated per campaign. But the list *grows* by `CatalogContexts.install`, and
    `Vocabularies` and `SettingPort` remain, so it does not close.
  - **AR-02:** per-campaign catalog state and a relaxed load queue. A good part of its acceptance is met, though not
    "no leaking", given the unreset ambient writes.
- **Unchanged:** OR-418 (names drawn by install order), PR-04, OR-744, AR-08/MT-26.
- **Worsened:** OR-542 (+25 deep imports into the language).
- **Already closed, untouched:** OR-540.

## 4. Risk and cost

- **Conflicts.** A three-way `git merge-tree` against today's main gives textual conflicts in two files:
  - src/campaign/campaign.ts, the restored-save branch, where main now reads `SavedSchemas.read(saved)`;
  - platform-separation.md.

  Six more files changed on both sides merge cleanly: terminal.ts, choice-wording.ts, play-session.ts,
  choice-grouping.ts, screen-types.ts and world-assembler.ts. Two builders are now in campaign.ts and screen-model.ts,
  which the spike changes by +34 −35 and +53 −55. The real cost is semantic: every ambient catalog read added on main in
  the 61 commits since the branch is a new silent fallback.
- **Performance.** The full-world start was measured with scripts/startup-bench.ts (`full --runs 3`, through heavy.sh,
  each run a fresh process). The machine was shared with two other builders' quick suites, so treat differences under
  ~10% as noise:

  | median, full world | main 4ded25b92 | spike 74bfb0527 | change |
  |---|---:|---:|---:|
  | start, cold (no parse store) | 11,125 ms | 17,721 ms | +59% |
  | start, warm (store full) | 6,362 ms | 11,686 ms | **+84%** |
  | start again in the same process | 5,099 ms | 11,689 ms | +129% |
  | campaign (warm) | 4,080 ms | 8,953 ms | +119% |
  | populate (warm, 39 installs) | 937 ms | 2,796 ms | ×3.0 |
  | project (warm, 41) | 1,076 ms | 4,600 ms | ×4.3 |
  | refresh (warm, 2) | 349 ms | 2,188 ms | ×6.3 |
  | structuredClone (warm) | 128 ms in 4,306 calls | 2,201 ms in 827,406 calls | **×192 calls** |
  | parses, cold | 156 | 187 | +31 misses |

  Tables: main, from /var/tmp/kyrie/wt-specrev-main-1125; spike, from /var/tmp/kyrie/wt-specrev-1125. Each is
  `bun scripts/startup-bench.ts full --runs 3 --md`.

  - **The start nearly doubles,** and a second start in the same process no longer benefits at all. That breaches the
    quality gate's start ratchet many times over its slack.
  - **The cause is plain in the table:** 827 thousand `structuredClone` calls against 4 thousand. The scoped context
    clones on *every* lookup:
    - `creature()` clones a whole body;
    - `itemDefinition`, `runtimeItem`, `speciesDefinition` and `kind` each clone their result;
    - `itemDefinitions()` clones the catalog (src/canon/canon-vocabulary.ts:43-106).
  - Projection and refresh, which look bodies and items up per actor, pay it hundreds of thousands of times.
  - `refresh` is also on the act's path (`Campaign.refresh`), so the per-turn numbers (decision under 15 ms, turn
    under 30 ms) are very likely breached too. That is unmeasured, since CI's quality job did not run.
  - The 31 extra cold parses are the definition-carrying keys missing where names alone had hit. Some of those misses
    are correct; the read-ahead made against the ambient catalog accounts for others.

  - Scoped contexts are cheap to build: `CanonVocabulary.scoped()` took 0.36 ms over 483 items and 135 species. Their
    lookups clone, though. `itemDefinitions()` deep-clones the whole item catalog, 1.38 ms a call, and is called from
    `Means.sources` (presentation/means.ts:32, once per shut way in a frame) and `Items.rummage` (campaign/items.ts:46).
  - Against the 15 ms decision budget that is a real risk, unmeasured because CI's quality job was skipped on the red
    run.
  - The keys' substring scan and JSON signatures make each key longer and its making costlier, and every shared rule's
    key is now part of every compiled key.
- **Complexity.** The providers (fork, species shadowing, item traits) are *more* concepts, not stronger ones:
  - three capabilities a provider may lack, each discovered by a throw;
  - a `shadowableSpecies` mode;
  - a legacy ambient path kept alive beside the scoped one in every lookup.

  "Kyr: fewer, stronger concepts" is not met.
- **CI:** run 45745418073 completed **failure**, the 13 specs listed under the verdict. The browser, quality, kyr-lint
  and long-descent jobs did not run.

## What the spike teaches

### Where the grind really is

The compilation context itself is small. src/lang changes by +168 −81 across 12 files, and the caches by two more.
The grind is everything **downstream of the catalog**: a module's own kinds were joined into the setting's global
tables (`Canon.items`, `Canon.species`, `ItemCatalog.definitions`), and the runtime reads those tables directly
everywhere.

| Where the context had to be threaded | Files | Lines (+/−) |
|---|---:|---:|
| src/campaign (install, items, creature facts, party capabilities, cast, field use) | 22 | +435 −288 |
| src top level (creature, content, overlays, effects, item-catalog, battle, combat-projection, summoning, tactics) | 18 | +268 −167 |
| src/ui (screen-model, combat model/telling/presenter, item uses, owed, services) | 15 | +189 −135 |
| src/presentation (character sheet, mechanics text, danger sense, means, skill reading) | 15 | +158 −110 |
| src/canon (the vocabulary and local catalog themselves) | 6 | +321 −120 |
| src/lang (the actual compilation context) | 12 | +168 −81 |
| src/rules (checks, burden, advancement, level drain, creation) | 7 | +98 −57 |

- **Counts:**
  - 125 optional context parameters were added;
  - about 127 dual-path lookups (`ctx ? ctx.x : Canon.x`);
  - direct reads of Canon and ItemCatalog outside src/canon fell from 192 on main to 148, so 148 remain.
  - The most-threaded files: mechanics-text, item-catalog and party-capabilities with 9 parameters each,
    character-sheet and creature-facts with 8, checks and overlays with 6.
- **What made threading hard:**
  1. The consumers are *runtime and presentation*, not compilation. A fighter's body, a lamp's fuel, an item's charges
     and a creature's temperament are looked up by id at play time, far from any campaign object.
  2. They reach the catalog through statics (`ItemCatalog.get`, `Canon.isBody`), so the only way to scope them was a
     new parameter at every hop.
  3. Making the parameter optional kept the build green, and hid every missed hop.
  4. Item traits (slot, fuel, use) are needed at *compile* time too (ItemTraits writes `burns`, `fuel` and `wearable`
     facts), which is why the language's interface grew setting-shaped members.

### Moves sound enough to keep as patterns

- **The compiled module owns its kinds.** Contexts are derived from `module.catalog` (campaign.ts:56,72,110) and never
  restored after an await. Keep this, as one context per campaign, made once and required.
- **Cache keys carry definitions, not names**, and compiled keys carry the source paths their spans record
  (local-catalog.ts `signature`; compiled-modules.ts:35). Keep the principle, with a key format version, and derive the
  dependency set from the parse.
- **Fork-based read-ahead**: a country read ahead into a fork of the campaign's context, so that one never visited
  leaves nothing behind (module-bundle.ts:274-289). Keep it.
- **Interleaved against sequential**: `PausedSource` holds one load mid-read while another completes, and each result
  is compared whole (world, creatures, catalog) with its sequential start (scoped-loading.test.ts:105-124). Keep it, and
  extend it from tiny worlds to the reference game at two seeds.
- **A `LoadCache` that does not memoize a rejected load** and that a cancelled caller cannot poison
  (load-cache.ts:34-52; scoped-loading.test.ts:126). Keep it. It is small and independent.

### Moves that look like dead ends

- **Optional context with an ambient fallback** at every hop. It doubles every lookup, hides omissions from the type
  checker, and turned a removed reset into silent misses (the encyclopedia).
- **A `Vocabulary` of optional capabilities** discovered by throws (`fork?`, `itemTraits?`, species shadowing). The
  language should ask the setting for less, not more.
- **Dependency discovery by regex over Kyr source** (`KeptParses.inherited`; `text.includes('like' | 'worn')`).
- **`KeptParses.together`'s fixed-point re-parse** until fingerprints are stable. It is a declaration pass in disguise.
- **Defensive `structuredClone` on every scoped lookup**, the whole catalog in `itemDefinitions()`. Immutable
  (frozen) definitions shared by reference are the cheaper guarantee. The cloning is what doubled the start (§4: 827,406 clones against 4,306).
- **New authoring checks folded into an isolation refactor.** They belong in the lint-as-queries slice, each with its
  row.

### A sequence toward an authoritative Kyr

These slices are thin and land independently. They are ordered to retire the most risk first. Slices 1 and 4-7 touch
src/lang, so each needs the owner's leave under the 25 November hold.

**0. Pin the defect** (no language change)
- **Change:** the reproduction above becomes a spec, quarantined as known-failing or held as a ratchet. Two censuses
  are added: unscoped parse sites on product paths (4 today) and ambient catalog reads by layer (the existing
  "direct reads of Canon" ratchet, 148).
- **Accepted when:** the spec records `[1,1,1]` on main.
- **Rows:** makes OR-531 and AR-02 measurable.
- **Seed:** the probe here; the spike's `PausedSource`.

**1. Correct cache keys** (src/lang)
- **Change:** parse and compiled keys carry the definitions of the kinds a text depends on. Bump the key version.
- **Accepted when:** the slice-0 spec passes. The startup bench's warm start and the parse-store hit rate on the golden
  walk are no worse.
- **Rows:** the isolation defect; part of AR-02.
- **Seed:** local-catalog.ts `signature`/`seen`, compiled-modules.ts `key`, kinds-two-modules' first and last
  describe blocks. Until slice 4, the dependency set stays a deliberate over-approximation (substring), with the regex
  `like`/`worn` special cases left out.

**2. One required catalog context per campaign** (runtime, no language change)
- **Change:** a `CatalogContext` made once from `module.catalog`, held by the campaign and its creature store, and
  passed as a **required** argument. Convert consumers family by family, each a landing:
  - (a) items: `ItemCatalog.get`, charges, fuel, slots;
  - (b) bodies and species: `isBody`, `creature`, temperament;
  - (c) presentation: means, sheet, encyclopedia, purchase-compare.
- **Accepted when:** in each family, ambient reads on product paths reach 0 and `vocabulary?` reaches 0. The
  encyclopedia-local-kind and Patient Star specs stay green. The ratchet falls. startup-bench's warm start and the
  quality gate's decision and turn medians stay within their bands, with definitions frozen and shared, not cloned.
- **Rows:** AR-02; OR-531 in part.
- **Seed:** catalog-context.ts (made required, without the optional members); the per-file edits in items.ts,
  party-capabilities.ts, combat-projection.ts, creature-facts.ts as a map of the hops.

**3. Ambient writes gone**
- **Change:** the four product parse sites take the campaign's context, or a fork of the canon one.
  `LocalKinds.read`/`install`/`activate` stop mutating `Canon.items`/`species`/`ItemCatalog.definitions`. Unscoped
  tools get an explicit canon context.
- **Accepted when:** `LocalKinds.activate/reset/reclaim/aside` and the ambient join are deleted. The process-wide
  census falls by LocalKinds and by Vocabularies' install. The interleaved-against-sequential spec passes over the
  reference game at two seeds.
- **Rows:** OR-531's LocalKinds part; AR-02 closed.
- **Seed:** the spike's campaign.ts, campaign-assembly.ts and module-bundle.ts read-ahead changes (fork of the
  campaign's context), rebased onto today's main (two textual conflicts).

**4. One symbol table** (src/lang)
- **Change:** the parser emits declarations and references with ids and spans, per module. ModuleShadow renames
  through it, not by regex. Cache keys take their dependencies from the references, deleting slice 1's
  over-approximation and anything like `KeptParses.inherited`.
- **Accepted when:** ModuleShadow has no regular expression over source. Every cache key's dependency set equals the
  module's referenced kinds, checked by a spec against the over-approximation over the corpus.
- **Rows:** AR-08/MT-26; AR-14 in part; OR-542 if the parser registry is split out as part of this.

**5. Lint as queries over reads, writes and mentions** (one query a landing)
- **Change:** each defect in cause C becomes a query over the symbol table that cannot pass:
  - written and never read: OR-235, OR-236, SI-05;
  - a name clashing with a shared rule's: OR-402, AU-46, AU-35's rest. The spike's `LocalKinds.identity` check moves
    here.
  - a placeholder unfilled: AR-13, OR-541;
  - an objective no act can advance: AU-15, OR-176;
  - a topic conditioned past its aim: R11-08;
  - the same text twice in a room: OR-404;
  - advice that cannot be taken: AU-59/OR-403;
  - an item spent by a bare Slay: CF-04;
  - lines cut unseen: AU-52;
  - a deadline passed silently: AU-49.
- **Accepted when:** each query has its mutation spec (fails on the row's own example) and `bin/kyrie lint` is green
  over data/.
- **Rows:** about 18 of the 23.

**6. Typed vocabulary** (OR-744)
- **Change:** accessors generated from the symbol table's declared relations, measures and kinds, so that a misspelled
  or undeclared read fails at compile time.
- **Accepted when:** the 849 string reads fall by ratchet, family by family.
- **Rows:** OR-744; MT-21 with offices declared.
- **Note:** this is also where item traits (slot, fuel, use) become declared kinds' fields instead of members of
  `Vocabulary`.

**7. Interleaving between installations**
- **Change:** done only if a second installation ships. It needs an explicit installation argument in place of
  `Installed.during` on browser paths.
- **Rows:** OR-531's last line.

## What remains to make Kyr authoritative

After the spike, all of the following remain:
- every item in the table above marked not begun;
- the context made *required*;
- the ambient writes deleted;
- one symbol table with spans, and ModuleShadow binding through it;
- cache dependencies read from the parse;
- the lint rewritten as queries, about 18 rows of cause C;
- typed vocabulary (OR-744).

The spike's real contribution is that it proves the defect and shows where the grind is.
