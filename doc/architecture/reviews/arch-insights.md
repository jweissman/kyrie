Below is a deep-dive architectural review organized into **seven concrete interventions**. Each pairs line-level code and profiling evidence from the repository with a specific, invariants-preserving design and verification strategy.

---

### Intervention 1: Eliminate Spurious Relation Stamp Churn & Reorder Blowups in `World.change`

#### The Problem
Kyrie’s entire incremental engine—`RuleWakes` (tick rules), `KeptGroundings` (operator grounding), `KeptParts` (screen sections), and `Outcome.carriedBy` (Atlas blue marks)—depends on monotonic relation write stamps (`World.stamps`) and insertion-order stability in `World.byName`. Right now, **no-op relation writes unconditionally advance stamps, clone maps, and scramble insertion order**, silently defeating incrementality every watch.

#### Evidence
- **Asymmetry between measures and relations:** In `world.ts:344`, `World.changeMeasure` explicitly short-circuits when the new value equals the current value (`if ((this.measuresByName.get(change.call.name)?.get(key)?.value ?? 0) === value) { return; }`), added for OR-183 so unchanged clock measures do not wake rules.
- **Unconditional stamp bump & copy-on-write on relations:** Just above it, `World.change` (`world.ts:317-334`) has **no** idempotence guard:
  1. On a **no-op `retract`** of a fact that does not hold, lines 321–325 still increment `++World.writes`, overwrite `this.stamps`, clone the entire relation `Map` via `this.named(...)`, and flush `RelationViews.forget(named)`.
  2. On a **redundant `assert`** of a non-exclusive fact that already holds, lines 326–332 delete `key` and re-insert it at the tail of the `Map`. That mutates iteration order without changing truth, forcing `KeptReading.reordered` (`kept-reading.ts:85-89`) to return `'all'` and invalidating *every* pick-level cache on that relation.
- **Concrete per-watch trigger:** `CampaignTick.clock` (`campaign-tick.ts:54-55`) runs on **every watch** and emits `{ kind: FictionalTime.dark(elapsed, hours) ? 'assert' : 'retract', call: ModuleWriter.call('dark') }`. Across 90 daytime watches in a row, `dark()` is retracted 90 times while already absent; across every night watch, `dark()` is asserted while already present. Every watch therefore bumps `dark`'s stamp and wakes every rule in `RuleWakes.asleep` (`rule-wakes.ts:50-57`) and every `KeptReading` touching `dark`.
- **Measured impact:** In `performance-map.md:38-41`, `rules asked and fired` still consumes **50 ms median** and `what may be done` consumes **65 ms median** on journey turns despite `RuleWakes` and `KeptGroundings` being installed.

#### Suggested Enhancement
1. **Make `World.change` strictly idempotent on truth:**
   - Before touching `memoSnapshot`, `stamps`, or `this.named(...)`, inspect the read-only map `const current = this.byName.get(change.call.name)`:
     - If `change.kind === 'retract' && !current?.has(key)`, `return` immediately.
     - If `change.kind === 'assert' && current?.has(key)`: if `!relation.exclusive` (or if `displaced.take(current, change.call)` is empty—meaning no sibling exclusive fact needs eviction and no pending displacement in the same `apply` batch is affected), `return` immediately without deleting/re-appending `key`.
2. **Stabilize `World` ordering independent of retract/re-assert history:**
   - Where `World.one` (`world.ts:74`) is called on non-exclusive relations, audit callers: relations that mean $1:1$ mapping should be declared `exclusive` in `.kyr` so `World.one` is order-invariant; for genuinely multi-valued relations, keep canonical entity-index order in `RelationViews` rather than raw `Map` insertion order, allowing `KeptReading.reordered` ($O(|R|)$ scan per diff) to be retired.
3. **Verification:** Hold under existing `RuleWakes` and `KeptGroundings` specs plus a new property test in `small` proving `world.apply([retract(absent)]) === world` (same stamps) and `world.apply([assert(present)])` preserves stamps and `RelationViews` identity.

---

### Intervention 2: Decouple Uninterrupted Journey Legs from Full-Turn Observation, Grounding & Narration

#### The Problem
A journey leg has a 5 ms budget (`BRIEF.md` §4), yet currently runs at **74 ms median (14.9× over budget)** in `performance-map.md:12` (**53 ms CI / 95.9 ms local** in `baseline.json:11-28`). Even though `Travel.step` was recently narrowed to `PlayerFrame.only(ways)` for choosing `go(...)`, **executing** each leg still pays for full-world grounding, dual `PlayerView.observe` deep-freezes, narration synthesis, and arrival-attention frame builds.

#### Evidence
Trace a single uninterrupted intermediate leg inside `EngineHost.travel` → `Travel.go` → `Travel.step`:
1. **`EngineHost.leg` calls `EngineHost.act`** (`engine-host.ts:287-291` → `engine-host.ts:207-228`):
   - Line 209 calls `before = PlayerView.observe(campaign)`.
   - `PlayerView.perceive` (`player-view.ts:254`) calls `PlayerFrame.of(campaign).rows`, which calls `campaign.offered()`—**grounding all ~2,000 schemas and wording all choices**—and also computes `CompanyMap.of`, `PartyCapabilities`, `Agency.explain` for every present NPC (`player-view.ts:367-374`), and recursively freezes the entire object graph via `Frozen.deep` (`frozen.ts:4-9`).
   - Line 214 calls `PlayerFrame.of(campaign).row(command)` again just to get `doing`.
   - Line 218 calls `after = PlayerView.observe(campaign)` a **second time** on the post-move world—again grounding all ~2,000 schemas, running `Agency.explain` on roadside NPCs, building `CompanyMap`, and deep-freezing!
2. **Inside `PlaySession.perform`** (`play-session.ts:164-240`):
   - `resolving(command)` calls `Undertakings.held(campaign)` before the leg, then `RuleWords.tell` + `Telling.tell`, then `Undertakings.after(campaign, aims)`, then `Digest.of(campaign)`, and `finally` calls `Undertakings.resume(campaign)` (`play-session.ts:232`)—which inspects the **full frame** after *every single leg* even when no aim was set aside.
3. **Inside `Travel.attention`** (`travel.ts:220-237`):
   - Whenever `heard.why` is truthy (e.g. any roadside observation/event fires), line 226 calls `ArrivalAttention.asks(campaign)` (`arrival-attention.ts:37-40`), which again forces `PlayerFrame.of(campaign)` if not already built.
   - `Travel.fresh` (`travel.ts:186-191`) rescans the **entire** `campaign.history` flatMapping `perceptions` on every staged check ($O(H)$ per leg).

#### Suggested Enhancement
1. **Introduce a lightweight `LegContext` / `StepObserver` path for intermediate legs in `EngineHost` and `PlaySession`:**
   - Replace `before = PlayerView.observe(campaign)` / `after = PlayerView.observe(campaign)` inside `EngineHost.leg` with a narrow `ActionFeedbackView.legRead(campaign, event, priorPlace)` helper that reads *only* what `LegTold` and `PlayTranscript.entry` require on a transit step (origin/destination label, elapsed clock, lapses, combat summary, and rule words), deferring `PlayerView.observe` and `PlayerFrame.of` until the journey **terminates** (arrival or `requiresDecision === true`).
2. **Guard `Undertakings.resume` and `HeldLead.taken` on `go(...)` legs:**
   - In [src/session/play-session.ts](src/session/play-session.ts#L225-L233), `HeldLead.taken` cannot trigger on a movement schema (`AimAdvances` explicitly excludes `r.action.movement` at [src/presentation/aim-advances.ts](src/presentation/aim-advances.ts#L36)), and `Undertakings.resume` is a no-op whenever `campaign.tickState.current.following?.aside` is empty—skip it in $O(1)$ without touching `PlayerFrame`.
3. **Maintain an incremental `seenPerceptions: Set<string>` on `Campaign`:**
   - Populate it on restore and append as events record perceptions, turning `Travel.fresh` (`travel.ts:186-191`) and `ScreenModel.scene`'s history scan (`screen-model.ts:176`) from $O(|H|)$ per turn/leg into $O(1)$ lookups.
4. **Verification:** Keep `EngineHost.wholeLegs = true` (`engine-host.ts:286`) as the exact equivalence oracle in `test/journey-receipt`: assert that a multi-hex journey with ambushes, tolls, darkness, companion barks, and water detours produces byte-identical `Frame`, `Entry[]`, and `Digest` under fast legs vs. `wholeLegs`.

---

### Intervention 3: Decompose `ScreenModel.build` (47% of Non-Journey Turn Time) into Lazy / Incremental Sub-Projections

#### The Problem
On non-journey turns, `ScreenModel.build` is the single largest bottleneck: **47% of total turn time** (**30 ms** median on ordinary turns, **76 ms** median on place turns in `performance-map.md:40`). It eagerly computes backstage folio data, town plans, overland itineraries, recruitment character sheets, and NPC goal explanations on *every single action*, even when the player stays in the resting scene and those surfaces are closed or unearned.

#### Evidence
- **Eager multi-surface computation in `ScreenModel.built`** (`screen-model.ts:48-115`):
  - Line 99 calls `Itineraries.shown(campaign, entities, charted.region)` (**22 ms median** on place turns in `performance-map.md:41`), running shortest-path tree searches (`KnownWays.tree` in `itinerary.ts:102-133`) even when the map is closed or not yet earned under compactification (`Surfaces.has(screen, 'the_map') === false`).
  - Line 68 calls `CharacterSheets.recruit(...)` and `FightHelp.reckoning(...)` for every entity in `view.present` on every turn, and line 106 runs `TownPlan.of(...)`.
  - Line 60 computes `fees(campaign)` (`screen-model.ts:125-135`) unconditionally across all `service` entities and 5 measure tables (`goodsPrice`, `pays`, `hire`, `dealerPays`/`worth`) without `KeptParts` caching (unlike `prices` right above it).
- **Hidden NPC planner invocations inside `PlayerView.observe`:**
  - `PlayerView.entity` calls `PlayerView.activity` (`player-view.ts:367-374`) for every co-located NPC `group`, which invokes `Agency.explain(world, actor, campaign.operators, ...)`—running planner goal evaluation/search during *observation* just to render a status string!
- **Redundant row cloning:**
  - `PlayerView.choices` (`player-view.ts:108`) shallow-clones every row and `choice` on every call (`rows.map(row => ({ ...row, choice: { ...row.choice } }))`), and `PlayerFrame.of` (`player-frame.ts:31-32`) clones and freezes them again; `performance-map.md:45` shows `rows asked` still taking **14 ms** on place turns across 4 asks.

#### Suggested Enhancement
1. **Gate cross-hex `Itineraries.shown` and `ChartModel` on map visibility / demand:**
   - Under the 25–26 November rulings (cross-hex travel lives only on the map; map hidden until earned), an enclosed or unmapped resting scene only needs local `around` town steps and a boolean `hasOverlandExit` check ($O(\text{exits from here})$), not global Dijkstra trees across the region. Compute full `Itineraries.destinations` only when the map is opened or `Runner` requests `charted` (`runner.ts:107`).
2. **Cache `fees`, `present` entity cards, and NPC `activity` via `KeptParts`:**
   - Wrap `ScreenModel.fees` in `KeptParts.of(world, 'fees', ...)`.
   - Record each NPC's last chosen `goal` id in `CampaignTick.npcs` (`campaign-tick.ts:88-96`) on `current` tick state rather than re-running `Agency.explain` inside `PlayerView.perceive`!
3. **Return frozen canonical rows from `PlayerView.choices`:**
   - Freeze rows once when cached in `PlayerView.listed` (`player-view.ts:103-109`) and return the `readonly` array directly without `.map(...)` allocation on every caller.
4. **Verification:** `test/screen-oracle` (`KeptParts.keeping = false` vs `true`) already exists as the structural pattern—extend it so cached `fees`, recorded NPC `goal` labels, and lazy map itineraries must agree 1:1 with uncached builds.

---

### Intervention 4: Fix Quadratic $O(M^2)$ & $O(C^2)$ Loops in Cold World Assembly (3.7 s → <1.5 s Target)

#### The Problem
Starting a world headless takes **3,732 ms** even with a warm parse cache (`performance-map.md:54-66`), and cold browser start (`first` / `start` in `baseline.json:5-8`) sits at **5.1–5.5 seconds** against the **1.5 s** target in `BRIEF.md` §3.1. Nearly a full second of `CampaignAssembly.assemble` (`install: 40` taking `909 ms` + `creature: 386` taking `133 ms`) comes from hidden quadratic validation loops across incremental module installations.

#### Evidence
- **Quadratic goal & outcome evaluation across 40 module installs:**
  - `CampaignAssembly.assemble` (`campaign-assembly.ts:22-26`) loops over `manifest.modules` (~40 modules) calling `campaign.install(request, source, false, i === manifest.modules.length - 1)`.
  - Even with `checked = false`, `campaign.install` calls `ModuleInstallations.populate` (`module-installations.ts:48-65`).
  - Lines 57–63 of `ModuleInstallations.populate` run:
    1. `Progression.outcomes(world, next.campaign!)`—evaluating **every outcome of every previously installed module** against `world` and discarding the return value ($1 + 2 + \dots + 40 = 820$ module-outcome passes).
    2. `for (const actor of next.campaign!.actors)`—iterating **all accumulated actors in the campaign** (rather than `actors`, the newly added slice computed on line 51!) and running `world.test(goal.when)` and `world.test(goal.target)` on every goal 40 times over.
- **Quadratic item-uniqueness scan on every creature insert:**
  - `CreatureStore.insert` (`creature-store.ts:30-38`) rebuilds `const existingItems = new Set([...this.records.values()].flatMap(c => (c.state.inventory ?? []).map(i => i.id)))` on **every single creature insertion**. Across 386 creatures inserted during assembly, `CreatureStore` allocates 386 `Set`s and scans ~74,000 creature records, plus `creatures.with(...)` (`creature-store.ts:43-48`) re-clones and re-validates added creatures via `SkyGifts.borne(Spellcasting.equip(structuredClone(creature)))` even when freshly generated by `ModuleInstallations.creature`.
- **Duplicate `world` generation during startup (`world: 2, 1135 ms`):**
  - `performance-map.md:60` shows `world` invoked **twice** (1,135 ms) during a single PlayTool start.

#### Suggested Enhancement
1. **Defer whole-campaign outcome & goal validation during unchecked batch assembly:**
   - Pass `checked` into `ModuleInstallations.populate` (or validate only `actors`—the newly installed slice, plus any `extended` actors—when `checked === false`), running the full `Progression.outcomes` and cross-module goal check **once** at line 36 of `campaign-assembly.ts:36` alongside `ModuleInstallations.check`.
2. **Maintain a persistent `ownedItemIds: Set<string>` index on `CreatureStore`:**
   - Update `ownedItemIds` incrementally in `insert` and `commit` in $O(|\text{inventory}|)$ instead of scanning `this.records.values()` in $O(|C|)$ per insert, and copy `ownedItemIds` in `CreatureStore.with`.
3. **Audit and deduplicate the second `world` draw in `PlayTool.start`:**
   - Key `DrawnWorld` memoization on `(seed, terrain, origin, opening, standing)` identically between creation preview/origin resolution and session start (mirroring `EngineStarts.drawnFor` in `engine-starts.ts:90-97`).
4. **Verification:** Measure directly with `bun scripts/performance/map.ts` (`world` count drops $2 \to 1$; `install` drops sharply from 909 ms) while `ModuleInstallations.check` at the end of assembly preserves identical error detection for malformed modules.

---

### Intervention 5: Promote `SemanticRecord` & Authoritative Focus to Retire Heuristic Presentation Scanning & Client UI State

#### The Problem
Currently, high-level Kyr constructs (`Situation`, `Occasion`, `Promise`) lower to flat relations, and `SemanticRecords` (`semantic-record.ts:7-11`) are stripped from saves and explicitly unused by the runtime/presentation. Consequently:
1. Presentation classes (`AimAdvances`, `Undertakings`, `ArrivalAttention`) have to **reverse-engineer authorial intent** by pattern-matching raw lowered AST predicates and entity ID prefixes.
2. Conversation, examination, paging, and lens state live split across client React state (`AppState` in `reader-app.tsx:49-140`) and `MenuModel` parameters (`menu-model.ts:45-47`), causing the continuity and focus defects (`OR-149`, `OR-177`, `OR-178`, `OR-179`) highlighted in `STATUS.md:39-44`.

#### Evidence
- **Fragile reverse-inference in `AimAdvances` & `Undertakings`:**
  - `aim-advances.ts:16-120` contains ~120 lines of special-case heuristics trying to deduce which actions advance an `Objective`: excluding `hold_here|call_on` by regex, guessing whether an aim is "short of coin" by scanning `def.when` for `quantity(..., gold)`, walking one hop backward through `revealedBy` and `observations` (`hidden`, `taught`), and synthesizing pseudo-facts for `resolve: acquire` and `resolve: combat`. Every comment in `aim-advances.ts` cites a playtest bug (`PL-11`, `PL-21`, `PL-25`, `PL-28`, `PB-16`) where heuristic AST inspection either over-gilded flowers or lost the golden thread.
  - `undertakings.ts:48-54` and `player-view.ts:288` detect the protagonist's own errand via regex `/^origin__/`.
  - `menu-tree.ts:106` suppresses marks on repeated replies via regex `/_again(\(|$)/`.
- **Client-owned interaction state in `ReaderApp` & `MenuModel`:**
  - `ReaderApp`'s `AppState` (`reader-app.tsx:91-135`) holds **over 20 interaction-mode fields** (`view`, `outdoors`, `charted`, `mapPage`, `exploring`, `focused`, `open`, `attention`, `talk`, `asked`, `heard`, `trading`, `turned`, `talking`, `rail`, `confirming`, `acted`).
  - Meanwhile `Runner` (`runner.ts:98`) maintains its own separate `private with?: string` conversation tracker! Any divergence between `ReaderApp`'s `attention`/`asked`/`trading` transitions and `Runner`'s `with` violates the "one projection / client keeps no step machine" ruling.

#### Suggested Enhancement
1. **Keep `SemanticRecord` live on compiled `Module`s at runtime (still reconstructed from source, not serialized in saves):**
   - Extend `SemanticRecord.serves` (`semantic-record.ts:31-32`) during compilation of `Situation`, `Occasion`, `Promise`, and `Objective` so the compiler records explicit causal links (`advances`, `resolvesIncident`, `opensPhase`, `originOwned`) on the lowered `Objective` and `Operator` schemas.
   - `AimAdvances` then reads compiler-emitted `serves` metadata first and falls back to predicate matching only for raw low-level `Objective` declarations—eliminating regexes (`/^origin__/`, `/_again(\(|$)/`, `/^(hold_here|call_on)$/`).
2. **Move `SituationFocus` (place | talk(person, mode, page) | examine(thing) | map(selected) | occasion(id)) into `PlaySession`:**
   - Represent opening a conversation, toggling wares (`trading`), examining an object, or opening/putting away the map as lightweight session-level focus transitions in `PlaySession` (included in `PlayerRevision` or a sibling `SessionRevision`), producing a single authoritative `Question` / `MenuNode` inside `Frame`.
   - Both `ReaderApp` and `Runner` then send identical focus commands (`focus:talk:wat`, `focus:leave`, `view:map`) and render `frame.menu` directly without passing `{ attention, asked, heard, trading }` back into `MenuModel.build` (`menu-model.ts:45-53`).
3. **Verification:** Extend `test/client-parity` to cover multi-turn conversations (including paging, `heard`/`asked` dimming, and `trading`) and thing examination, proving browser and `Runner` produce identical `MenuMarks` and active choices at every step.

---

### Intervention 6: Scope Static Process-Global Caches to `Campaign` / `Module` to Bound Walk Heap & Guarantee Coexistence

#### The Problem
Walk heap retention sits at **`heap: 921` KB/turn** (~90 MB growth over 100 turns; `baseline.json` ratchets `heap: 921` in `baseline.json:4`), and process-global static `Map`s and `Canon.installed` state violate strict multi-campaign isolation when two worlds or settings run in the same process.

#### Evidence
- **Process-global mutable catalog state in `Canon`:**
  - `Canon.installed = new Set<string>()` (`canon.ts:106`) and `LocalKinds` (`module-installations.ts:1`) mutate static state on `Canon` when modules install local species/kinds, noted in `platform-separation.md:166-170` as "correctness by whichever campaign installed last".
- **Process-global static `Map` caches holding `World` map references (`Held`):**
  - `Outcome.carriedBy` (`outcome.ts:56-57`) is a `static readonly Map<string, Kept<...>>` keyed by `${actor}|${action.id}|...`. Each entry holds `was: Map<string, Held>`, which pins references to internal `World` `byName` maps from past turns; if two campaigns share actor ID `'party'` and action IDs like `'look_closely(...)'`, they collide and evict each other's `Outcome` cache on every alternating turn!
  - `LoadCache` on `Campaign.loads` (`campaign.ts:74`) caches full assembled `Campaign` instances statically across the process lifetime.
  - `EngineHost.log` (`engine-host.ts:52`) and `Campaign.log` (`campaign.ts:34`) accumulate unbounded `CampaignEvent[]` (including full `changes: string[]` and `perceptions` arrays for every watch of every turn) in memory for the entire session.

#### Suggested Enhancement
1. **Anchor `Outcome.carriedBy` to `WeakMap<Module, Map<string, ...>>` (like `KeptParts.by` in `kept-parts.ts:18`):**
   - Keying by `world.module` (or `Campaign`) guarantees automatic GC reclamation when a campaign is dropped and prevents cache-key collisions (`party|look_closely(...)`) between concurrent campaigns in tests or workers.
2. **Eliminate `Canon.installed` mutation:**
   - Move installed species/kinds tracking exclusively onto `Campaign`'s `ItemCatalog` / `KindsMade` (`this.compiled.catalog`), leaving `Canon` completely immutable after module load.
3. **Compact historical `CampaignEvent` payloads past the active undo window:**
   - Once a command is committed and narrated (`PlaySession.perform` settled), older `CampaignEvent` entries only need semantic summary fields (`action`, `elapsed`, `result`, perception IDs, `voiced`)—not unreferenced transient combat/change arrays—cutting per-turn heap growth (`WalkTimings.kept` in `walk-timings.ts:69-73`).
4. **Verification:** Run an alternating two-campaign coexistence spec (Westernesse `iscoed` + a canonless civic/allotment module interleaving turns in one process) asserting identical digests whether run interleaved or solo, and ratchet `heap` downward in `baseline.json:4`.

---

### Intervention 7: Collapse the 131 Layer-Violation Edges via Three Targeted Ports Instead of Piecemeal Wrappers

#### The Problem
`layers-baseline.json:3-7` records **131 wrong-way dependency edges** (`49 runtime -> setting`, `69 player -> setting`, `13 setting -> player`). Looking closely at the edge list reveals that they are **not** 131 independent couplings—nearly 90% cluster around just **three missing seams**.

#### Evidence
Inspecting every edge in `layers-baseline.json:9-130`:
1. **Cluster 1 — Direct `src/canon/canon` & `condition-sense` reads (~62 edges across `runtime` and `player`):**
   - `src/rules/*` (12 edges), `src/campaign/*` (13 edges), root combat files (`ability-use`, `creature`, `effects`, `item-catalog`, `overlays`, `quarry`, `summoning`, `tactics`), and `src/ui/combat-*` + `src/presentation/*` import `Canon` directly, even though `InstalledDomain` (`installed.ts:10-17`) already defines `conditions`, `abilities`, `traits`, `callings`, and `effects` ports!
2. **Cluster 2 — Voice, Painting & Editorial JSON tables in `player` (~31 edges):**
   - `voice.ts` alone accounts for **13 edges** (`data/voice/*.json`); `src/presentation/*` and `src/ui/*` account for ~18 more (`emblems.json`, `fit.json`, `seen.json`, `src/paintings/*`, `prose-lint.json`).
3. **Cluster 3 — Inverse `setting -> player` edges in `src/handbook/*` (13 edges):**
   - All **13** `setting -> player` edges (`layers-baseline.json:39-48`) come from `src/handbook/*` (`encyclopedia-html.ts`, `phb-company.ts`, `phb-play.ts`, `render-html.ts`, `text.ts`) importing `mechanics-text`, `perk-text`, `identity`, `emblems`, and `spell-schools` from `src/presentation/*`—and then `src/creation/*` and `character-sheet.ts` importing `src/handbook/*` right back, forming a **layer cycle** (`player -> setting (handbook) -> player (presentation)`).

#### Suggested Enhancement
1. **Break the `player <-> handbook` cycle immediately (-17 edges in one move):**
   - Pure rules-to-prose formatters (`mechanics-text`, `perk-text`, `spell-schools`) format `InstalledDomain` ability/trait schemas; `text.ts` and `phb-company.ts` are presentation builders over a catalog, not setting data. Splitting `handbook` into setting data vs. a `player`-layer catalog-doc renderer eliminates **all 13** `setting -> player` edges plus the 4 `player -> handbook` edges in `creation-entries.ts`, `creation-flow.ts`, and `character-sheet.ts`.
2. **Introduce a `PresentationResources` port on `InstalledDomain` (-31 edges):**
   - Provide `voice(tableId)`, `emblems()`, `paintingFit()`, and `portraitOf(subject)` through the installed setting context rather than static JSON imports in `voice.ts` and `src/ui/*`. A minimal non-Westernesse scenario can supply empty/default tables without touching Imbar's voice or painting files.
3. **Finish routing `src/rules/*` and `src/campaign/*` reads through `Installed.need(...)` (-49 `runtime -> setting` edges):**
   - Add `species` / `items` / `rulesVocabulary` accessors to the fantasy domain port so `src/rules/*` never imports `src/canon/canon`, bringing `runtime -> setting` to **0** and unlocking physical package extraction (`kyr-lang`, `kyrie-runtime`, `kyrie-player`).
4. **Verification:** Enforce mechanically via `bun `layers.ts` --write` and `test/small/layers`, ratcheting `setting -> player` to `0` first, then `runtime -> setting` to `0`.

---

### Recommended Execution Order (Maximizing Dividend per Change)

| Priority | Intervention | Primary Dividend | Gate / Proof |
|---|---|---|---|
| **1** | **Intervention 1** (`World.change` no-op guard) | Eliminates per-watch `dark` stamp churn & accidental reorder cache flushes in ~15 lines | `small` stamp invariance + `performance-map.md` rule/grounding ms |
| **2** | **Intervention 2** (Fast transit legs without `observe`/`PlayerFrame`) | Cuts journey leg median from ~74 ms toward the 5 ms target | `test/journey-receipt` (`wholeLegs` oracle) + `walk-timings.ts` `leg` |
| **3** | **Intervention 3** (Lazy map itineraries, cached `fees`, recorded NPC goals) | Cuts non-journey `screen` cost (47% of turn) toward <30 ms turn target | `test/screen-oracle` + `walk-timings.ts` `still` |
| **4** | **Intervention 4** ($O(1)$ `CreatureStore` item set + deferred assembly checks) | Shaves ~1 s+ off cold campaign assembly toward 1.5 s opening | `performance-map.md` `install`/`creature`/`world` stages |
| **5** | **Intervention 6** (Module-scoped caches & immutable `Canon`) | Bounds per-turn heap retention & prevents cross-campaign cache collisions | Two-setting interleaved coexistence spec + `heap` ratchet |
| **6** | **Intervention 5** (Runtime `SemanticRecord.serves` + engine-owned `SituationFocus`) | Retires AST/ID regex heuristics; unifies browser & runner talk/examine/map state | `test/client-parity` + continuity census |
| **7** | **Intervention 7** (`handbook` cycle break + `PresentationResources` + `Installed` ports) | Drains the 131 layer violations to 0 cleanly before directory moves | `layers.ts` ratchet at 0 |

I have completed a read-only deep architectural review detailing seven concrete interventions with code-level evidence, profiling metrics, and verification strategies. 



Below is a deep, code-grounded architectural review organized into **seven concrete interventions**, ordered from highest immediate runtime/correctness leverage to structural platform maturity. Every finding cites the exact code paths and profiling numbers currently in the repository.

---

### Intervention 1: Guard No-Op Relation Writes & Re-Assertions in `World.change`

#### The Problem
`World` relies on monotonic per-relation write `stamps` and map insertion stability so `RuleWakes`, `KeptReading`, and `KeptGroundings` can skip unchanged rules and action schemas. While `World.changeMeasure` guards against no-op writes, `World.change` (for `assert` and `retract`) mutates stamps, clones relation maps, and alters insertion order even when the relation's extension does not change.

#### Evidence
- **Asymmetric no-op handling in `world.ts:318-353`:**
  - In `World.changeMeasure` (`world.ts:344`), if the computed measure equals the existing value, it returns immediately *before* touching `this.stamps` or calling `this.namedMeasures(name)`.
  - In `World.change` (`world.ts:321-334`), `this.stamps.set(change.call.name, ++World.writes)` and `const named = this.named(change.call.name)` execute **unconditionally** at the top of the method:
    1. **No-op `retract`:** Retracting a fact that does not hold still increments `stamps`, copy-on-write clones the relation `Map`, and invalidates `RelationViews`.
    2. **No-op `assert` + spurious reordering:** Asserting an already-present fact deletes `key` (`world.ts:327`) and re-inserts it at the tail (`world.ts:332`). That mutates `Map` iteration order, forcing `KeptReading.reordered` (`kept-reading.ts:85-89`) to return `'all'` and invalidating *every* pick-level cache on that relation.
- **Concrete per-watch trigger in `campaign-tick.ts:54-55`:**
  - `CampaignTick.clock` emits `{ kind: FictionalTime.dark(elapsed, hours) ? 'assert' : 'retract', call: ModuleWriter.call('dark') }` on **every single watch**. During all ~90 daytime watches, `retract dark()` runs when `dark()` is already absent; during night watches, `assert dark()` runs when `dark()` already holds. Every watch therefore falsely wakes every rule in `RuleWakes` (`rule-wakes.ts:50-59`) and invalidates every `KeptReading` / `KeptGroundings` entry that reads `dark`.
  - In `performance-map.md:39-41`, journey turns still spend **50 ms median** in rules and **65 ms median** in legal-action grounding across multi-watch travel.

#### Suggested Enhancement
1. Short-circuit `World.change` before `stamps.set` and `this.named(...)`:
   - Grab `const current = this.byName.get(change.call.name);`.
   - For `change.kind === 'retract'`: if `!current?.has(key)`, `return;` immediately.
   - For `change.kind === 'assert'`: if `current?.has(key)` (and, for `relation.exclusive`, no *other* displaced tuple exists, which holds whenever `(a, b)` is already the unique tuple for `a`), `return;` immediately without deleting and re-appending `key` (preserving map order and `displaced` tracking only when needed within a multi-change batch).
2. **Verification:** Hold equivalence under existing `RuleWakes` and `KeptGroundings` oracle checks (`CampaignGrounding.checking = true` in `campaign-grounding.ts:36-43`) and assert in a unit spec under `small` that applying `CampaignTick.clock` across two consecutive daytime watches leaves `world.stamp('dark')` unchanged.

---

### Intervention 2: Decouple Uninterrupted Journey Legs from Full `PlayerFrame` & `Observe` Passes

#### The Problem
A journey leg has a **5 ms** median budget (`BRIEF.md` §4), yet currently measures **53 ms CI / 95.9 ms local** (`baseline.json:12-28`) and **74 ms** (14.9× target) in `performance-map.md:13`. Although `Travel.step` was partially optimized to use `PlayerFrame.only` for `go`/`lie_still`, three per-leg paths still force full-world grounding, perception, and cloning on uneventful intermediate hexes.

#### Evidence
1. **Per-leg `ArrivalAttention.asks` forces full `PlayerFrame` grounding whenever anything is said or staged (`travel.ts:225-234` → `arrival-attention.ts:35-38`):**
   - Whenever `heard.why` is truthy (e.g., an ambient road event or fresh `staged` marker), `Travel.attention` calls `ArrivalAttention.asks(campaign)`, which calls `PlayerFrame.of(campaign)` → `Campaign.offered()` → full grounding and wording of all ~2,000 schemas plus `Knowing.perceived`.
2. **Browser worker `EngineHost.leg` runs two full `PlayerView.observe` passes per leg (`engine-host.ts:211-231` and `engine-host.ts:287-291`):**
   - `EngineHost.leg` delegates to `this.act(...)`, which calls `PlayerView.observe(campaign)` *before* the leg, `PlayerFrame.of(campaign).row(command)` (forcing full `PlayerFrame`!), and `PlayerView.observe(campaign)` *after* the leg—each running `perceive()` (`player-view.ts:243-295`), `CompanyMap.of`, `PartyCapabilities`, and recursive `Frozen.deep` (`frozen.ts:3-11`) over the entire snapshot.
3. **Per-leg full-log scans & transcript cloning:**
   - `Travel.fresh` (`travel.ts:194-199`) flattens `campaign.history` on every staged check ($O(H)$ per leg).
   - `PlaySession.resolving` ([src/session/play-session.ts](src/session/play-session.ts#L228-L233)) and `PlaySession.resumed` ([src/session/play-session.ts](src/session/play-session.ts#L235)) evaluate `Undertakings.held` and `Undertakings.resume` (which reads `PlayerFrame`!) after **every individual leg** via the `finally` block ([src/session/play-session.ts](src/session/play-session.ts#L225)), even when the traveller is mid-journey.

#### Suggested Enhancement
1. **Introduce a `midJourney` execution mode between `Travel.go`, `PlaySession.perform`, and `EngineHost.leg`:**
   - When `Travel.step` executes a `go(...)` leg, resolve it through `PlayerView.only(campaign, new Set(['go']))` (already supported in [src/presentation/player-view.ts](src/presentation/player-view.ts#L186-L189)) and skip `PlayerFrame.of(campaign).row(command)` in `EngineHost.act` (passing `said` directly from `Travel.step`, which already worded the `go` row).
   - Defer `Undertakings.resume(this.campaign)` in `PlaySession.perform` until either a single non-journey act finishes or `Travel.go` terminates (on arrival or interruption).
   - Replace `before = PlayerView.observe(campaign)` / `after = PlayerView.observe(campaign)` inside `EngineHost.leg` with a lightweight `LegDelta` reader (location before/after, party HP/conditions, and event perceptions) when `LegTold` handles the leg, building `PlayerView.observe` and `ScreenModel.build` **only once** at `EngineHost.ended` ([web/engine/engine-host.ts](web/engine/engine-host.ts#L311-L316)).
2. **Maintain an incremental `seenPerceptions: Set<string>` on `Campaign`** updated as events append to `log`, turning `Travel.fresh` and `ScreenModel.scene` ([src/ui/screen-model.ts](src/ui/screen-model.ts#L173)) from $O(\text{history})$ flatMaps into $O(1)$ lookups.
3. **Verification:** `EngineHost.wholeLegs = true` ([web/engine/engine-host.ts](web/engine/engine-host.ts#L286)) already exists as the exact oracle comparing receipt-based legs against full-frame legs (`test/journey-receipt`). Extend that oracle to assert identical final `Frame`, `log`, and `Digest` with `midJourney` fast-path enabled.

---

### Intervention 3: Eliminate $O(N)$ / $O(M^2)$ Scans in `ScreenModel.build` and `CampaignAssembly`

#### The Problem
Two hot paths—building a stationary turn's `Screen` (**47% of a non-journey turn**, 30–76 ms median in [doc/architecture/performance-map.md](doc/architecture/performance-map.md#L42)) and assembling a new country's 40 modules (**909 ms** for `install` + **133 ms** for `creature` in [doc/architecture/performance-map.md](doc/architecture/performance-map.md#L56-L58))—contain avoidable linear-per-entity or quadratic loops that bypass `World` and `KeptParts` indexes.

#### Evidence
- **In `ScreenModel.build` ([src/ui/screen-model.ts](src/ui/screen-model.ts#L53-L250)) and `PlayerView.perceive` ([src/presentation/player-view.ts](src/presentation/player-view.ts#L243-L398)):**
  1. `ScreenModel.fees` ([src/ui/screen-model.ts](src/ui/screen-model.ts#L120-L129)) rebuilds all `service`, `goodsPrice`, `pays`, `hire`, and `dealerPays`/`worth` entries across the whole world on **every screen build**, unlike `ScreenModel.prices` ([src/ui/screen-model.ts](src/ui/screen-model.ts#L113-L117)) right above it, which is wrapped in `KeptParts.of`.
  2. `ScreenModel.passageOf` ([src/ui/screen-model.ts](src/ui/screen-model.ts#L214-L221)) and `PlayerView.nearby` ([src/presentation/player-view.ts](src/presentation/player-view.ts#L204-L212)) scan **every** `on`, `guards`, `inside`, and `door` entity in the entire country (`world.related('on')`, `world.related('guards')`, `world.related('inside')`, `typed('door')`) rather than indexing backwards from passages connected to `here` (`world.relatedTo('connects', here)` / `world.related('connects', ...)`).
  3. `PlayerView.activity` ([src/presentation/player-view.ts](src/presentation/player-view.ts#L390-L398)) invokes `Agency.explain(world, actor, campaign.operators, ...)`—running NPC goal/planner evaluation synchronously inside `PlayerView.observe`—for every co-located NPC actor.
  4. `ScreenModel.marks` ([src/ui/screen-model.ts](src/ui/screen-model.ts#L134-L138)) calls `campaign.offered().some(a => a.speaker === id)` inside `.map(...)` for every present entity instead of precomputing `speakers = new Set(...)` once from `frame.spoken`.
- **In `ModuleInstallations.populate` ([src/campaign/module-installations.ts](src/campaign/module-installations.ts#L49-L64)) and `CreatureStore.insert` ([src/creature-store.ts](src/creature-store.ts#L29-L38)) during cold start:**
  1. `CampaignAssembly.assemble` ([src/campaign/campaign-assembly.ts](src/campaign/campaign-assembly.ts#L27-L37)) loops over 40 modules calling `campaign.install(request, source, false, i === manifest.modules.length - 1)`. Even when `checked === false`, `ModuleInstallations.populate` runs `Progression.outcomes(world, next.campaign!)` (discarding its return value!) and iterates `for (const actor of next.campaign!.actors)`—testing `goal.when`, `goal.target`, and `goal.urgent.when` across **all actors accumulated so far** on each of the 40 installs ($O(M^2)$).
  2. `CreatureStore.insert` (`creature-store.ts:34-35`) rebuilds `existingItems = new Set([...this.records.values()].flatMap(...))` from scratch on **every single creature insertion** ($O(C^2)$ across 386 creatures during world start).

#### Suggested Enhancement
1. **Localize `ScreenModel` & `PlayerView` spatial queries and memoize `fees`:**
   - Wrap `ScreenModel.fees` in `KeptParts.of(world, 'fees', '', ...)`.
   - Rewrite `ScreenModel.passageOf` and `PlayerView.nearby` to start from exits touching `here` (via `RelationViews.by` on `connects` arg1/arg2) and entities `at(?, here)` (then `inside(?, containerAtHere)`), turning $O(|E_{\text{world}}|)$ scans into $O(|E_{\text{room}}|)$.
   - Precompute `const speakers = new Set(frame.spoken.map(r => r.action.speaker));` once in `ScreenModel.built`.
2. **Make `CampaignAssembly` linear ($O(M + C)$):**
   - Gate `Progression.outcomes` and actor goal validation in `ModuleInstallations.populate` on `checked` (or validate only newcomer `actors` per install and run global validation once in `ModuleInstallations.check` at the end of `CampaignAssembly.assemble`).
   - Maintain a persistent `private ownedItems = new Set<string>()` on `CreatureStore` updated on `insert` and `commit`, eliminating the $O(C^2)$ inventory scan.
3. **Verification:** Protected directly by `test/screen-oracle` (`KeptParts.keeping = false` vs `true`) and measured immediately via `bun scripts/performance/map.ts`.

---

### Intervention 4: Promote `SemanticRecord` from Offline Lint Metadata to Runtime Focus & Undertaking Authority

#### The Problem
Kyr compiles high-level narrative constructs (`Situation`, `Occasion`, `Promise`, `Objective`) down into flat Datalog relations and rules. Because `SemanticRecords` are discarded at runtime/save boundaries, the presentation layer (`Undertakings`, `AimAdvances`, `Outcome`, `MenuTree`) has to **reverse-engineer authorial intent** by statically walking AST predicates, regex-matching namespaced IDs, and one-step simulating rules—creating recurring edge-case bugs (e.g., false-positive gold guidance, missed multi-hop payoffs, regex fragility).

#### Evidence
- **Runtime discards `SemanticRecord` (`semantic-record.ts:8-11` and `campaign.ts:168`):**
  - `SemanticRecords` explicitly notes *"never by the runtime... a save does not keep it"*, and `Campaign.save` strips it via `SemanticRecords.unwritten(this.module)`.
- **Presentation reverse-engineers causal graphs with ad-hoc heuristics:**
  - `AimAdvances` (`aim-advances.ts:19-148`) manually inspects AST predicates one rule hop deep (`waits`, `hidden`, `taught`), hardcoding special cases for `acquire`, `combat`, `buy_item`, `sell*`, `hold_here`, `call_on`, and `quantity(actor, gold)` to guess which action advances an `Objective`. Any two-hop causal chain or custom `Resolve` effect requires another bespoke patch in `AimAdvances`.
  - String/regex conventions leak across presentation:
    - `^origin__` tested in both `undertakings.ts:53` and `player-view.ts:298`.
    - `/_again(\(|$)/` tested on command IDs in `menu-tree.ts:106` to suppress repeat reply marks.
    - `name.replace(/^.*__/, '') === 'willing'` tested on raw success AST clauses in `arrival-attention.ts:90-91`.

#### Suggested Enhancement
1. **Keep compact `SemanticRecord` descriptors on compiled `Module` in memory (rehydrated from compiled module definitions on load, not bloated in save diffs):**
   - Extend `Situation` (`situations.ts:71-91`), `Occasion`, and `Promise` lowering so that actions/topics serving an `Incident`, `OccasionMatter`, or `Promise` emit explicit `serves` links on the `SemanticRecord` (and structured metadata flags like `repeat: true` on `Operator` instead of `/_again/`).
2. **Drive `AimAdvances` and `Engaged`/`Occasion` focus from `SemanticRecord` phases:**
   - When an active `Undertaking` corresponds to a `Situation` or `Promise`, its active phase (`r.phases.find(p => world.test(p.holds))`) directly names the unresolved `Core` / `Incident` predicates and participant entities, giving `AimAdvances` exact authorial targets without guessing whether flower-picking advances a debt.
   - Replace `^origin__`, `/_again/`, and `willing` string-scraping with typed fields on `Objective` (`provenance: 'origin' | 'scenario'`) and `Operator` (`revisited?: boolean`, `recruits?: string`).
3. **Verification:** Add a static lint rule/census (alongside the AR-05 text-as-protocol ratchet noted in `platform-separation.md:58-60`) forbidding `__` namespace regexes and command-ID substring parsing in `presentation`, `ui`, and `frame`.

---

### Intervention 5: Collapse Client-Held Attention State into an Engine-Owned Session Question

#### The Problem
Although `MenuTree` (`menu-tree.ts:11-55`) recently unified resting-scene row/mark folding in the engine, **active player attention** (talking to a person, examining an object, paging dialogue, opening/closing the hex map, and tracking `asked`/`heard` topics) is still owned independently by each client rather than by `PlaySession`.

#### Evidence
- **Large parallel state machine in the React client (`reader-app.tsx:39-148`):**
  - `ReaderApp`'s `AppState` holds **35+ fields** of interaction state (`attention`, `talk`, `asked`, `heard`, `trading`, `turned`, `talking`, `exploring`, `focused`, `outdoors`, `charted`, `mapPage`, `prologue`, `beat`, `open`, `confirming`, `acted`).
  - When `attention.kind !== 'place'`, `MenuModel.build` (`menu-model.ts:50-54`) **bypasses the engine's `frame.menu`** and rebuilds the scene on the client via `this.attending(SceneModel.build(frame.screen), opened, { attention, asked, heard, trading }, frame)`.
- **Duplicated attention tracking in the headless `Runner` (`runner.ts:106-108`):**
  - `Runner` maintains its own `private with?: string` conversation state (`RunnerTalks`) to mimic `ReaderApp`'s `Conversation` state. Any divergence between `RunnerTalks` and `conversation.ts` creates parity gaps where cold-play runner specs pass while the browser UI misbehaves (the root cause of M22-alpha's CN/OR-149 conversation continuity defects).

#### Suggested Enhancement
1. **Move `Focus` (`place` | `talk(person, page, trading)` | `examine(thing)` | `map(selectedHex)` | `combat` | `prologue(beat)`) into `PlaySession`:**
   - Make `focus` transitions lightweight session commands (zero watch-ticks unless an underlying Kyr `talk_to` / `take_leave` operator has world effects, just as `follow:<aim>` already works in `play-session.ts:166-171`).
   - Track `asked` and `heard` per conversation engagement in `PlaySession`, included in `SessionCheckpoint` so reloading mid-conversation restores the exact speaker portrait, dialogue scroll, and unasked emphasis marks instead of dropping the player back into the room.
2. **Emit one authoritative `Question` on `Frame`:**
   - `MenuTree.of` produces the active menu for *every* focus state (including `talk`, `examine`, `map`, and `combat`), shrinking `ReaderApp` to pure viewport/cursor/animation state (`cursor`, `hovered`, `keyed`, `walking`) and deleting `RunnerTalks`'s parallel state machine.
3. **Verification:** Extend `test/client-parity` so a transcript containing talk entry, topic paging, ware inspection, map opening, and `take_leave` produces byte-identical offered choice IDs and Atlas marks across `EngineHost` (browser worker), `Terminal`, and `Runner`.

---

### Intervention 6: Scope Static LRU Caches to Campaign/Module Lifecycles & Bound Walk Heap

#### The Problem
Over a 59-turn walk, heap retention grows by **~921 KB/turn** (`baseline.json:4` & `walk-timings.ts:78-82`), while several presentation and grounding caches live in **process-global static `Map`s** rather than scoped `WeakMap`s or instance fields—risking both memory retention of detached `Module`/`World` graphs and cross-campaign cache thrashing.

#### Evidence
- **Process-global static `Map`s holding `Module` and `Held` (`World` map) references (`outcome.ts:56-74`):**
  - `Outcome.carriedBy` is a `static readonly Map<string, Kept<readonly string[]> & { sight: string; shape: string; module: Module }>()` capped at 64 entries. Every entry retains `module: Module` **and** `was: Map<string, Held>` (references to internal `World` relation maps from `KeptReading`). Even after a `Campaign` or test finishes, `Outcome.carriedBy` pins the last 64 `Module`s and their `Held` relation maps in global memory until evicted. Furthermore, because its key is `${actor}|${action.id}|...` (with no campaign ID), two interleaved campaigns (such as the planned Westernesse + allotment coexistence proof in `BRIEF.md` §5D) will collide and evict each other's entries on every turn.
- **Unbounded monotonically growing WeakMap keys & RuleWakes lines:**
  - `RuleWakes.lines` (`rule-wakes.ts:20`) maps `lineage -> name -> stamp -> Set<WorldRule>` inside a `WeakMap<Module, RuleWakes>`. When `Campaign.fork()` (`campaign.ts:86-100`) or `PlaySession.copy()` creates new `World` lineages sharing the same `Module`, `RuleWakes` accumulates entries under old `line` numbers that are never pruned unless every rule in that line happens to wake and call `free(rule)`.
  - `KeptReading.diffs` (`kept-reading.ts:49`) nests **four WeakMaps plus a `Map<string, ...>`** per `World` visited.

#### Suggested Enhancement
1. **Re-root `Outcome.carriedBy` under `WeakMap<Module, Map<string, ...>>` (matching `KeptParts.by` in `kept-parts.ts:19`):**
   - As soon as a `Campaign` (and its `Module`) becomes unreachable, GC reclaims all carried `Outcome` readings and `Held` fact maps automatically, and two coexisting campaigns never collide on `${actor}|${action.id}`.
2. **Scope `RuleWakes` per `World` lineage (or `Campaign` instance) rather than per `Module`:**
   - Key `RuleWakes` on `Campaign` (or prune any `line !== currentLine` in `RuleWakes.asleep`), preventing forked what-if sessions (`PlaySession.copy()`) from leaking rule-wake tables onto the shared `Module`.
3. **Audit retained per-turn allocations in `WalkTimings`:**
   - `Campaign.log` (`CampaignEvent[]` in `campaign.ts:34`) stores full `changes: string[]`, `npc: TickDecision[]` (each with its own `changes: string[]` diff), `perceptions`, and `voiced` on every turn. Interning or lazily formatting `changes` diffs when `CampaignTick.witness` is unset will cut steady-state per-turn heap growth (`heap` in `baseline.json:4`).

---

### Intervention 7: Drain the 131 Upward Layer Edges via Focused Domain & Presentation Ports

#### The Problem
`Layers` (`layers.ts:14-95`) and `Installed` (`installed.ts:10-71`) establish a clean architectural target, but **131 upward dependency violations** remain in `layers-baseline.json:1-8` (`49 runtime -> setting`, `69 player -> setting`, `13 setting -> player`), plus mutable global catalog state (`Canon.installed` in `canon.ts:118`).

#### Evidence
- **Mutable static `Canon.installed` violates campaign isolation:**
  - `Canon` (`canon.ts:118`) holds `static readonly installed = new Set<string>()` and mutates `Canon.species` / `LocalKinds` when modules install local species/kinds. If a non-Westernesse scenario and a Westernesse campaign coexist in one process (`BRIEF.md` §5D), ambient reads of `Canon.*` bypass `Campaign.installation` (`campaign.ts:42-43`).
- **Three concentrated clusters account for >85% of the 131 edges in `layers-baseline.json:9-135`:**
  1. **Direct `src/canon/canon` & `condition-sense` reads (~62 edges)** across `src/rules/*`, `src/campaign/*`, `src/ui/*`, and `src/presentation/*`—even though `src/ports/{abilities,callings,conditions,effects,traits}.ts` already exist!
  2. **Direct JSON voice/painting table imports (~24 edges)** in `voice.ts` (13 edges to `data/voice/*.json`), `src/presentation/{emblems,signs,fight-help,instruments,outmatched,prose-lint}.ts`, and `fits.ts`.
  3. **Inverted `handbook -> presentation` edges (9 edges)** where `src/handbook/*` (classified as `setting` in `layers.ts:28`) imports `mechanics-text`, `perk-text`, `emblems`, `identity`, and `spell-schools` from `src/presentation/*` (`player`).

#### Suggested Enhancement
1. **Eliminate the 13 `setting -> player` edges immediately (zero runtime risk):**
   - `mechanics-text` and `perk-text` format `InstalledDomain` rules data, not Westernesse setting lore; keep them in `player` (or a `fantasy-rules` formatter module) and reclassify `handbook` as a `client`/tool consumer over `player` + `setting` (or pass a text-formatter port into handbook generation). That drops `setting -> player` from 13 to **0** in one step.
2. **Introduce a `PresentationResources` port on `InstalledDomain` for voice, emblems, and likenesses:**
   - Replace the 24 static `data/voice/*.json` and `data/paintings/*.json` imports in `narrative` and `presentation` with a typed `VoiceTables` / `ArtManifest` provider registered on `InstalledDomain` (defaulting to empty/plain fallbacks when a minimal scenario like the allotment society installs no voice or painting tables).
3. **Finish routing `Canon.*` reads through `Installed.need(...)` and delete `Canon.installed`:**
   - Scope local module species/traits/abilities to `Campaign.catalog` / `Campaign.installation` (just as `ItemCatalog.among` in `creature-store.ts:15-17` already scopes local item kinds!), removing the last ambient global mutation in `Canon`.
4. **Verification:** Ratchet `layers-baseline.json` downward after each slice (`bun `layers.ts` --write` + `test/small/layers`), culminating in a dual-campaign interleaving spec in `small` where a canonless non-Westernesse `PlaySession` and an Imbar `PlaySession` alternate `perform()` calls in the same process with verified `Digest` invariance.

---

### Summary Overview

| # | Intervention | Primary Target Metric / Contract | Expected Payoff |
|---|---|---|---|
| **1** | Guard no-op `assert`/`retract` in `World.change` | Decision (<15 ms) & Journey Rules (AX-10) | Stops `dark()` clock ticks from falsely waking rules and invalidating `KeptReading` every watch |
| **2** | `midJourney` fast-path in `Travel`, `PlaySession` & `EngineHost` | Journey leg (<5 ms, currently 53–96 ms) | Eliminates per-leg full `PlayerFrame`, `PlayerView.observe`, `Frozen.deep`, and `Undertakings.resume` |
| **3** | Localize `ScreenModel` spatial scans & linearize `CampaignAssembly` | Still turn (<30 ms) & Cold Start (<1.5 s) | Cuts $O(|E_{\text{world}}|)$ room queries to $O(|E_{\text{room}}|)$ and removes $O(M^2)$ / $O(C^2)$ startup loops |
| **4** | Retain `SemanticRecord` phases & retire ID/AST heuristics | Authority & Continuity (BRIEF §5A, §6) | Replaces `AimAdvances` 1-hop guesswork and `__`/`_again` regexes with authored causal phase tracking |
| **5** | Move `Attention`/`Focus` into `PlaySession` & unified `Question` | Single-workflow parity (TB-09, OR-149) | Collapses 35+ `ReaderApp` state fields and `RunnerTalks` duplication into engine-owned focus |
| **6** | Scope `Outcome.carriedBy` & `RuleWakes` to instance lifecycles | Walk heap (`921` KB/turn) & Isolation | Frees detached `Module`/`World` maps on GC and prevents multi-campaign cache collisions |
| **7** | Drain 131 layer edges via `PresentationResources` & `Installed` ports | Platform separation (BRIEF §5D) | Enables zero-Imbar scenarios and safe multi-domain coexistence in one process |