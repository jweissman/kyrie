# Kyrie architecture review, 26 October 2026, at `0e066e5`

An independent, adversarial, read-only review commissioned as a review, not an implementation. Nothing under `src/`,
`web/`, `data/` or `test/` was changed. Probes and their outputs are in [`probes/`](probes/).

---

## 0. Snapshot, method, and the reviews before this one

| | |
|---|---|
| Commit | `0e066e5` ("Mission 15's report: …"), `main` |
| Environment | Linux, 4 cores, Bun 1.4.4. `deem` at `967deac` and `languages` at `30d36c6` (the pinned commits), installed from local clones because `bun install` gets a 403 from `api.github.com` tarballs through this sandbox's proxy (see N12). `package.json`/`bun.lock` restored afterwards. |
| Baseline | `bun run lint`: clean, 16 s. `bun run typecheck`: clean, 15 s. `bun test --parallel`: **786 pass, 32 skip, 0 fail, 15,078 `expect()`, 818 tests in 175 files, 367 s.** `bun run web:build`: 2.4 s, and the tree stays clean afterwards. |
| Method | Code reading; greps measuring patterns across the tree; five probe scripts run against production classes; a source-map breakdown of the shipped worker bundle. |
| Confidence labels | **Confirmed** (reproduced by a probe or read directly), **Strongly supported** (code path read end to end, not executed), **Plausible**. |

**This is the fourth architecture review in three days.** The earlier three were the Mission 14 review at `422a4c8`
([`mission-14/arch-review`](../mission-14/arch-review/kyrie-architecture-review-422a4c8.md)), the 25 October audit
of `ab9055a` (cited in the [Mission 15 ledger](../mission-15/ledger.md)), and the next-phase review at `483e3af` (on
branch `review/architecture-2026-10-25`, not merged). They are good, and they agree on the kernel. I did not want to
derive their findings a fourth time, so this review does three things:

1. **§2** checks their open findings against HEAD.
2. **§3** reports what none of them looked at: the browser persistence path, the generation-to-language boundary,
   the shipped bundle, the type boundary with data, layering enforcement, the repository itself, and process.
3. **§4** says where I would spend engineering effort next, and **§5** what I would leave alone.

---

## 1. Executive verdict

**The kernel is sound and getting sounder, and I agree with the earlier reviews about it.** The immutable `World`,
the checkpoint/rollback coordinator, command-transcript replay, identity-keyed randomness and on-demand grounding are
the right design. Mission 15 closed real defects: frontier expansion is now inside the recorded command, the
dependencies are pinned, CI runs every tier, A1 and A2 are fixed, and the inner loop is several times faster. The
suite is green, there are zero lint suppressions in the tree, and that discipline is rare.

**What I'm not happy with**, in the order I'd fix it:

1. **The browser save path can brick a player's game, and fails silently** (N1, Confirmed). This is the most
   user-visible defect I found. No review has looked at `web/reader/reader-store.ts`.
2. **Saves are trusted by format, not by build** (N2, Confirmed). Pages deploys on every push to `main`, so a game
   kept by last week's engine skips module validation under this week's. That turns the known lack of save versioning
   (F-10/G1) from "content fixes don't reach old games" into "old games are loaded unchecked."
3. **Process-global catalogs now break memoisation as well as isolation** (N7, Confirmed). The parser's output
   depends on the global item catalog, but it is cached by text alone. One scenario's meaning of a kind leaks into
   another's parse. B2/F-08 has been "partly" fixed three times. Each fix adds a lifecycle verb (`install`, `aside`,
   `claim`, `activate`, `reset`), and Mission 15's speculative "prepare while the player reads" now runs that
   machinery interleaved with authoritative commands.
4. **The generator talks to the language through strings** (N3, N4). About 310 lines in 29 files emit Kyr source by
   template literal. Three places regex-parse the generator's own emitted text back, and 83 `as unknown as` casts
   stand in for a schema for `data/generation`. This is the main impediment to evolving Kyr's syntax and the generator
   independently, and it sits under the 1.2–2.1 s march crossing.
5. **The layer table in `overview.md` is not enforced, and is eroding** (N5, Confirmed). `campaign` imports
   presentation in 4 files, the generator (`src/world`) imports `session` and 9 files of `campaign`, and B1 is still
   fully open in both directions.

**Significant technical debt?** Yes, but concentrated, not diffuse. The debt is in **boundaries**: process-global
state, untyped data, string-typed code generation, unversioned persistence, unenforced layering. The code inside
each boundary is careful. That is good news, because boundary debt can be paid down one seam at a time without a
rewrite.

---

## 2. Status of the earlier reviews' findings at `0e066e5`

Only the findings I re-checked are listed. Anything not listed was not re-verified.

| ID (source) | Finding | At HEAD | Evidence |
|---|---|---|---|
| F-01 (M14) | Frontier expansion outside the command record | **Closed** | expansion runs via `session.extend({ expand })` (`web/engine/engine-host.ts:100,121`); the ledger's I.G cross-process replay |
| F-11 / F9 | Deem and languages unpinned | **Closed** | `package.json` pins both by SHA; my clones at those SHAs installed and the suite passed |
| A1, A2, E2 (10-25) | Learned facts block installation; checkpoint during crossing; wrong march-stone | **Closed** per ledger, with specs | not re-probed |
| F-07 / L3 | `deep-argument.ts` privileged authoring | **Partly**: words in `data/generation/deep/argument.json`, structure still in TS | ledger II.E |
| B1 (10-25) | Presentation inside the authority boundary, both directions | **Open, unchanged** | `src/campaign/{campaign-tick,interruption,perceptions}.ts` import `presentation/local-observations` to decide perception (and so `knows`); `Campaign.told` (`campaign.ts:192`) writes rendered `voiced` text into the authoritative log; `engagement.ts:34` still regex-rewrites English |
| B2 / F-08 / F1 | Module kinds in process-global catalogs | **Open, and now worse** (see N7) | `src/canon/local-catalog.ts:57-110` patches `static readonly` `Canon.items`, `Canon.species` and `ItemCatalog.definitions` through casts |
| F-10 / G1 | Saves have no engine, content or dependency version | **Open**, and see N2 | `campaign.ts:164` `version: 1`; `play-session.ts:13,21,59,72`; no hash or build stamp anywhere |
| F-15 | Presentation and semantics keyed to English | **Open** | `'goblins'` as the opposing team: 16 occurrences in 10 files; three hard-coded English player messages inside `Campaign.complete` (`campaign.ts:297,304,307`) |
| F-09 / H1 | Realistic tests teleport rather than journey | **Grown**: 56 → **62** files | `grep -rlE 'commit\(.*apply\(\|GeneratedWorld\.put\|\.put\(' test`; 15 files use `Journey` |
| M14 §H "structural" | Make `complete()` an explicit phase pipeline | **Not started** | `complete()` (`campaign.ts:277-327`): `success` reassigned in 6 places; `execute` and `executeAsync` are copy-paste twins (`:225-254`) |

---

## 3. New findings

Ranked by consequence for players and for future development.

### N1 · High · Confirmed · The browser save can be torn, then fails to load, and the player is never told

**What happens.** `ReaderStore.write` (`web/reader/reader-store.ts:25-33`) does three separate `localStorage.setItem`
calls: the **world** first, then the **state**, then the summary. It returns `undefined` on any exception.
`ReaderApp.listen` (`web/reader/reader-app.tsx:85-88`) simply does not update state when that happens. There is no
message to the player.

**Three defects compound:**

1. **Not atomic.** Crossing a march grows the world. If the new world's write succeeds and the state's write then
   hits the quota, storage holds the *new* world beside the *old* state, and a summary naming the *old* world key.
2. **A field-name collision.** The summary is stored as `{ ...summary, world: <key> }`. `read()` returns
   `{ text, ...summary, ...(matched ? { world: <text> } : {}) }`. So when the keys don't match, `SavedGame.world`
   holds the 2-character **key**, and `reader-opening.ts:132` passes it to `resume()` as the packed world **text**.
   `KeptGame.join`'s own clear message ("The world this game was played in is no longer kept…") is never reached.
   `SaveCodec.unpack` gets garbage instead.
3. **Silent.** The player keeps playing, believing the game is kept. It isn't. On reload, the game either resumes far
   behind or does not load at all.

**Evidence.** [`probes/torn-save.ts`](probes/torn-save.ts), run against the real `ReaderStore` with a 5 MB quota
fake (`probes/outputs.txt`):

```
write 1: true
write 2: false
state kept: S1 | world key stored: W2 | summary names world: W1 | world returned to resume: true
back.world = "W1"
```

**Why the quota is realistic.** The ledger records a state of 1.25 MB by step 175 of one game, "grows with the
game"; the 10-25 review measured checkpoints of 4.4–6.6 MB; typical browser quotas are 5–10 MB per origin, and UTF-16
storage doubles the byte cost in some engines.

**Recommendation.**
- **Smallest (a day):**
  - write the state first and the world second;
  - never overwrite the world a stored state still names; keep two world slots and flip a pointer last;
  - rename the summary's `world` to `worldKey`;
  - when `write` fails, post a visible notice ("This game can no longer be kept in this browser; download a save").
- **Proper:** move the kept game to IndexedDB, as one transaction holding state, world and summary. F-10 already
  recommended IndexedDB for size; this makes it a correctness fix as well.
- **Test:** the probe, as a spec, with a quota fake: no sequence of failed writes may leave a stored game that
  `read` + `KeptGame.join` cannot open.

### N2 · Medium-High · Confirmed · "Kept by this engine" means "kept by any build that wrote format v2"

**What happens.**
- `EngineHost.resume` sets `trusted: kept`, where `kept = 'version' in parsed && parsed.version === 2`
  (`web/engine/engine-host.ts:110,113`).
- `Campaign`'s constructor skips `ModuleCompiler.validate` when trusted (`src/campaign/campaign.ts:60`).
- The Pages workflow redeploys on every push to `main`.
- So a game kept in a player's browser by an older build is loaded by the newer build **without validation**, under
  a compiled module the newer compiler may no longer accept or may read differently.

The same constructor already carries an inline migration (`actionFormat !== 'schemas'`, `:56-58`). That is how
unversioned formats accrete shims.

**Consequence.** Old saves fail later and further from the cause (a missing relation at command 3, rather than "this
save is from an older engine"). Each change to the compiled-module shape becomes a silent compatibility break.

**Recommendation.**
- Stamp every save and transcript with `{ build, rules, content, deem, languages }` hashes (the 10-25 review's G1).
- Set `trusted` only when the stamp equals the running build's.
- Keep migrations in one ordered registry keyed by format version, not in constructors.
- Once those exist, the "replay the transcript onto new content" path both earlier reviews proposed becomes possible.

### N3 · Medium-High · Confirmed (pattern) · The generator emits Kyr source as strings and reads its own output back with regexes

**Observation.**
- `src/world` builds modules by string templates: about 310 lines across 29 files emit Kyr keywords (`Initially
  Assert`, `Observe`, `Event`, `Topic`…), with `JSON.stringify` (`q = JSON.stringify`, 48 sites) as the string
  escaper. The generated text is then parsed by Ohm and compiled like an author's file.
- In three places the generator **parses its own emitted Kyr back** with a regex to recover structure it already had:
  - `region-zones.ts:207` (`/between (\S+) and (\S+) taking/`);
  - `region-marvels.ts:54`;
  - `region-riddles.ts:20`.
- `ModuleWriter` exists, but only presentation uses it. No generator does.

**Consequence.**
- **Language evolution is coupled to every generator.** Renaming a keyword or reordering a clause breaks generators
  silently. For the regex readbacks, it changes generated worlds rather than failing.
- **Errors surface far from their cause**: as a parse error in a 1.9 MB generated module, not at the generator line
  that wrote it.
- **Cost**: every crossing pays generate-text → parse → compile. Part of the 1.2–2.1 s crossing (ledger) is parsing
  text the program wrote itself a moment before.
- **Determinism is at the mercy of formatting**: a float or ordering change in a template changes the text, and so
  the content hash and the save's world key.

**Recommendation** (incremental; generated worlds must stay byte-identical at each step, which the existing
eight-seed hash checks can enforce):
1. Replace the three regex readbacks with the structured values the writer already holds.
2. Introduce a typed `ModuleBuilder` (declarations as values: `place()`, `passage()`, `observe()`…) that produces the
   `Module` AST directly, with `ModuleWriter` printing it for `bin/kyrie world` and debugging.
3. Migrate one writer at a time, starting with the largest (`region-zones`, `region-writer`, `world-assembler`).

Authors keep writing Kyr. Only the machine stops writing it.

### N4 · Medium · Confirmed · Generation data has no schema; 83 double casts stand in for one

**Observation.**
- `src/` has 83 `as unknown as` casts, almost all reading JSON from `data/generation` or `data/catalog`.
- `GenerationSetting.tables` (`src/generation-setting.ts:30-34`) merges ten table files, but its declared type is an
  intersection of only five. So 11 files re-declare their own private `Tables` type and cast:
  - `region-ecology`, `region-peoples`, `region-faith`, `place-names` (×2), `settlement-writer` (×2), `livelihoods`…
- `folk.given` is cast to the same shape three times (`region-shops.ts:32`, `region-traffic.ts:44`,
  `community.ts:48`).
- `canon.ts` alone has 14 casts.

**Consequence.**
- A data author's typo or reshaped row compiles, lints clean and fails at runtime, deep inside a generator, possibly
  only for some seeds.
- Seven private `Tables` types can drift from one another and from the data with no error.
- This matters more as `data/generation` grows, and the roadmap (cities, more adventures) grows it.

**Recommendation.**
- One schema per data file, declared once and validated at load or in one spec over every file. A small hand-written
  validator, or types generated from the JSON, both fit the no-dependency style.
- Complete the `GenerationSetting.tables` type so the per-file casts can go.
- Target: `as unknown as` in `src/` → under 10, each one commented.

### N5 · Medium · Confirmed · The layer table is documentation, not a constraint, and it is eroding

**Observation.** `overview.md` declares four layers with fixed responsibilities. Measured cross-directory imports at
HEAD:

| from → to | files | example |
|---|---|---|
| `src/campaign` → `src/presentation` | 4 | `perceptions.ts:1` imports `LocalObservations` to decide what the company perceives (B1) |
| `src/world` (generator) → `src/campaign` | 9 | |
| `src/world` → `src/session` | 1 | `drawn-world.ts:2` imports `PlaySession` |
| `src/world` → `src/presentation`, `src/narrative` | 2, 3 | `region-weather.ts:3` (`Calendar`), `region-news.ts:4` (`Voice`) |
| `src/random-streams.ts` → `src/campaign` | 1 | |

`Frontier`, which installs modules into a live campaign, lives in `src/world`, the generator's directory. Nothing in
`eslint.config.mts` or the tests checks any of this.

**Consequence.** Every review so far has re-measured the boundaries by grep, and each found them slightly worse. A
boundary with no check erodes at the speed of the busiest mission.

**Recommendation.**
- Encode the table as `no-restricted-imports` overrides per directory in `eslint.config.mts`, with today's exceptions
  listed by file, so the list can only shrink.
- Move `Frontier` to `src/session`.
- Move `FictionalTime`, `Calendar` and the perception decision in `LocalObservations` out of `presentation` into the
  layer that owns time and knowledge. That is most of B1.

### N6 · Medium · Confirmed · The shipped engine: 4 MB opaque string, Node polyfills, no source map

**Observation** (built with `bun run web:build`; analysed by [`probes/engine-composition.ts`](probes/engine-composition.ts)):
- `site/mono.js` is **4.28 MB minified, 1.19 MB gzipped**: the reader, plus the engine worker embedded as one
  JSON string literal (`SiteBuild.embed`, `src/cli/site-build.ts:52-56`). The worker is about 3.9 MB of that.
- About **660 KB of Node polyfill source** is in the worker: `node:crypto` 466 KB, `node:stream` 133 KB,
  `node:buffer` 41 KB, plus `events`, `util` and `path`.
  - Cause: Kyrie imports `deem`'s package root, and `deem/index.ts:6` re-exports its CLI (`src/cli.ts`: `randomUUID`
    from `node:crypto`, plus `node:fs` and `node:path`).
  - The engine never calls any of it.
- **The worker is built without a source map** (`SiteBuild.engine`, `:29-39`, sets no `sourcemap`). The page's map
  covers the reader but sees the worker only as the opaque `kyrie:engine` string. All game logic runs in the worker,
  so a player's crash report is a minified stack trace.
- All authored data is inlined (`bundles.generated.json`, 1.6 MB). Each adventure added to `data/adventures` grows
  every player's first download, whether or not their world ever holds it.

**Recommendation.**
- **Cheap:**
  - give `deem` a browser-safe entry point (an `exports` map with a `browser` condition, or import its generator
    module by subpath) to drop the polyfills;
  - emit and publish a source map for the worker.
- **Later:**
  - load the worker from a URL when served over HTTP, and keep the blob only for `file://`;
  - split `bundles.generated.json` per adventure and fetch a country's files when `Frontier.prepare` first needs them.
    That speculative step already exists, so it is a natural seam.

### N7 · Medium · Confirmed · Parsing reads global catalogs but is memoised by text, so one scenario's kinds leak into another's parse

**Observation.**
- `ModuleParser.parse` caches by source text (`src/lang/module-parser.ts:85-96`, 96 entries), and so does
  `ModuleBundle.parses` (`module-bundle.ts`, 400 entries).
- But the parse result reads the process-global `ItemCatalog.definitions`:
  - an item's display name (`module-declarations.ts:38-39`, `world-constructs.ts:85`);
  - whether a shop restocks a kind (`world-constructs.ts:122`);
  - what a change consumes (`world-constructs.ts:183`).
- So parsing is not a function of its text, but it is memoised as if it were.

**Evidence.** [`probes/parse-cache.ts`](probes/parse-cache.ts): scenario 1 declares `Kind gem "red gem"`, scenario 2
(after `LocalKinds.reset()`, as a new campaign does) declares `Kind gem "blue gem"`. The same module text naming a
`gem` item parses as:

```
scenario 1, B:             a red gem
scenario 2, B (cached):    a red gem     ← scenario 1's meaning
scenario 2, B (fresh text): a blue gem
```

CONTRACT §2 says two scenarios that use one name for different things do not see each other's.

**Where it bites.**
- The browser worker keeps both caches across "begin again" and across `warm`/`prepare`.
- The test process keeps them across spec files.
- `Frontier.prepare` parses files ahead of time under whatever catalogs are installed at that moment, interleaved
  (it yields with `setTimeout(0)`) with the player's commands.
- It is correct today mainly because `LocalKinds.aside` happens to be synchronous, and because few files are shared
  verbatim between scenarios with conflicting kinds.

**Recommendation.** This is the strongest argument yet for finishing B2/F-08 properly rather than adding a sixth
verb to `LocalKinds`:
- make the catalog a value owned by the module and passed to the parser, compiler, `Items` and `Content`;
- key any parse cache by (text, catalog identity), or lower kind names after parsing;
- delete `install/aside/claim/activate/reset`.

That also removes the reason `campaign.world` reads have side effects (`committed-world.ts:22`).

### N8 · Medium · Confirmed · The repository carries 217 MiB of packs, mostly images and evidence

**Observation.**
- `git count-objects`: **217 MiB of packs in a shallow clone**. The working tree has `doc/` at 92 MB, against about
  1.5 MB of TypeScript.
- **The 804 paintings are committed three times**:
  - `assets/images/*.jpeg` (57 MB);
  - `web/reader/paintings/large/*.webp` (29 MB);
  - `web/reader/paintings/*.webp` (13 MB).
  - The WebP sets are derived by `scripts/paintings.ts`.
- `doc/` holds **690 images** of playtest and review evidence.
- CI checks the repository out three times per push, and Pages a fourth.
- `web/bundles.generated.json` (1.6 MB) is a committed build artefact that the README asks people to regenerate by
  hand "after any .kyr or data change". It is in sync today ([`probes/bundle-drift.ts`](probes/bundle-drift.ts): 206
  files, 0 differ), but no spec checks that, and every web build rewrites it in the tree.

**Consequence.**
- Clone and CI time.
- History that only grows.
- A future contributor or agent pays the cost on every fresh checkout, and every review session clones it again.

**Recommendation.**
- Keep source JPEGs in Git LFS or an external bucket, and generate the WebP sets in the Pages build.
- Keep playtest evidence as CI or release artefacts linked from the reports, not in the tree.
- Either stop committing `bundles.generated.json` (the build writes it anyway), or add a one-line spec that fails
  when it differs from `AssetCatalog.files()`.
- History rewriting is the owner's call; stopping the growth isn't.

### N9 · Low-Medium · Confirmed · Classes as namespaces: hidden singletons and import-time work

**Observation.**
- The lint's `no-restricted-syntax` forbids free functions ("Prefer methods inside a class"). The result is **2,241
  `static` members against about 172 constructions of the project's own classes**.
- `static readonly` initialisers run at import: JSON merges and casts, `Canon.merge`, `ItemCatalog.definitions`.
- Process state hides in statics:
  - `Campaign.loads`;
  - `World.writes` and `World.lines`;
  - `Content.checked`;
  - `Composition.vocabularies`;
  - the whole of `LocalKinds`;
  - the parse caches.
- `this: void` annotations appear 36 times to make static methods passable as callbacks.

**Consequence.** No seams for injection. That is part of why tests reach state by casting (`as unknown as`: 77 in
`test/`) and teleporting (F-09), and why N7 and B2 exist at all: the natural owner of "the catalog for this game" is
an instance, and the style resists instances.

**Recommendation.** CONTRACT §6 makes lint limits the owner's, so this is a suggestion. Allow module-level instances
for *stateful services*: a `Catalog`, a `ParseCache`, a `Session`, each constructed and passed. Keep static-only
classes for pure functions, where they are harmless.

### N10 · Low-Medium · Confirmed · The record is hard to search: literary commit subjects and poetic identifiers

**Observation.**
- Commit subjects describe the fiction rather than the change. For example: "A checkpoint is the game between
  commands: refused during one, and the page's download waits"; "What someone says is said only while they can
  speak".
- Many identifiers are evocative rather than descriptive: `widen`, `ahead`, `told`, `kept`, `Telling`, `Attending`,
  `Mercy`, `Aftermath`, `Engagement`, `cameFrom`. `this.session.extend({ expand: this.widen })` means "install the
  frontier hook".

**Consequence.**
- `git log --grep save` or `--grep localStorage` finds nothing about N1's file.
- Bisecting or auditing a subsystem means reading prose.
- For a solo author with agents this works. For a second human contributor, or a reviewer, it is a standing
  onboarding tax, and it pushes knowledge into the long reports instead of the code.

**Recommendation.**
- Keep the voice, and add a technical handle: a scope prefix or second line in commits (`save: write state before
  world`).
- Add a short glossary in `overview.md` mapping each evocative class name to its responsibility and layer.

### N11 · Low · Confirmed · Smaller items

- **Dependency hygiene:**
  - `eslint` is a runtime `dependency`, not a dev one;
  - `@types/bun` is `latest`, so the typecheck can change with no commit;
  - TypeScript is only a peer `^5` (5.9.3 installed), while `deem` declares a peer `typescript >=6 <8`.
- **GitHub-tarball pins are fragile outside a developer's network** (N12 below). Consider `git+https` URLs, or
  publishing `deem` and `languages` as packages (GitHub Packages works with private repositories).
- **Test output noise:** specs that expect Deem errors print full stack traces to the log, which hides real failures
  in a 367 s run. Capture or silence the expected ones.
- **`World.writes`/`World.lines` are process-global counters** (also noted at M14). They are harmless, but they are
  more state with no owner.

### N12 · Process · Review saturation and a scattered findings record

**Observation.**
- Four architecture reviews in three days, plus an independent audit, a cold playtest and per-mission reports.
- Their findings use four ID schemes (F-xx, Fx, A1…H1, and now Nx) across five documents on three branches. One
  report (`review/architecture-2026-10-25`) is not on `main`.
- The ledger tracks the latest of them well, but no single register says "every open finding, from every review,
  with its status and the spec that pins it".
- This review spent its first hour reconciling that before it could add anything.

**Recommendation.**
- One living `doc/architecture/findings.md`: stable IDs, carried across reviews, with status, owner, and the spec
  that proves closure.
- Each new review appends to it rather than writing a new taxonomy.
- And, candidly, **commission the next review only after the register's top five are closed.** The marginal review
  (this one included) finds less than the marginal fix delivers.

---

## 4. Where to focus engineering effort

In order, with the reasoning for the order.

1. **Persistence integrity (N1, N2, F-10/G1): one to three days.**
   - Players' progress is the product, Pages deploys every push, and both defects are invisible until a player loses
     a game.
   - Do these in order:
     - atomic or ordered writes, the renamed field and a visible failure notice;
     - a build/content stamp in saves and transcripts, with `trusted` only on a stamp match;
     - a migrations registry;
     - IndexedDB.
   - Pin each with the probe-as-spec.
2. **Make the catalog a value (B2/F-08, N7).**
   - It removes the `LocalKinds` lifecycle, makes the parse caches sound and makes `Frontier.prepare` safe.
   - It lets two campaigns coexist in one process (tests, lint of many modules, a future multi-campaign world), and
     it ends side-effecting reads of `campaign.world`.
   - It is the single change that retires the most findings across all four reviews.
3. **A typed generation boundary (N3, N4).**
   - Schemas for `data/generation`, then a `ModuleBuilder` that hands the AST to the compiler, migrated writer by
     writer under the existing world-hash oracles.
   - It decouples Kyr's syntax from the generator, makes generator errors local, and removes a parse from every
     crossing.
   - It matters before cities, which multiply generated declarations.
4. **Enforce the layers (N5, B1).**
   - Lint rules first, so the boundary stops eroding.
   - Then the B1 moves: perception and time out of `presentation`, `voiced` out of the authoritative log, `Frontier`
     into `session`.
5. **Bundle diet and debuggability (N6).**
   - Drop the Deem CLI polyfills and ship a worker source map now; both are small.
   - Load country data on demand once authored adventures multiply.
6. **Repository hygiene (N8) and a findings register (N12).**
   - Cheap, and they lower the cost of every future session.
7. **The coordinator as named phases** (M14 §H), when someone next has to change `complete()`. Not before.

---

## 5. What I would leave alone

The earlier reviews' §I list stands, and I endorse it:
- `World`;
- the checkpoint/rollback coordinator;
- `PlaySession` + transcript + `canonical()`;
- identity-keyed randomness;
- `Operators` grounding;
- the Kyr surface and its lowering;
- module namespacing and `ModuleShadow`;
- `KeptGame`'s split of world and state, which is the right design. N1 is in the layer above it.

To that I add:
- the **zero-suppression lint discipline**;
- **CI that fails on skips** in the long and browser tiers;
- the **ledger** as a working document.

Don't event-source. Don't rewrite the fact store. Don't adopt a framework for the reader's state.

---

## 6. Limitations

- **Not run:** the browser (`KYRIE_BROWSER`) and long (`KYRIE_LONG`) tiers, the Orsino registry spec (32 skips), and
  `deem-choice-space`.
- **Probed with fakes, not in a browser:**
  - N1 used a quota-enforcing `localStorage` fake, not a real browser quota. The code path is the production one.
  - N7 used the production parser and `LocalKinds` in one process. I did not reproduce it through two real
    adventures that share a file verbatim.
- **N2 by code reading:** I did not build two engine versions to show a stale save loading unvalidated.
- **N6 sizes:** polyfill sizes are pre-minification source from the source map, and their minified share is smaller.
  The 4.28 MB and 1.19 MB gzip figures are of the real built `mono.js`.
- **Dependencies:** installed from public clones at the pinned SHAs, because the GitHub tarball route returned 403 in
  this sandbox.
