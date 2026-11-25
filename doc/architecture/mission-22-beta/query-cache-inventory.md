# Cache inventory for the query research

This is the working inventory for [the query research](query-research.md), at `528ca30`. Rows describe what was
inspected, not proof that all source caches have been found. A trailing ellipsis in a location marks a declaration
whose full implementation was not traced; do not use that row as proof of the complete key or lifetime.

## Counting rule

For a reproducible count, a **cross-world validation family** reuses a derived result in a different `World` and
tests recorded semantic dependencies or changed inputs before reuse. Count a result family once, not its individual
maps or the shared `KeptReading` implementation. Exclude same-world identity keys, length checks and eviction.
The inventory identifies **at least seven**, not seven independent revision engines:

1. `KeptGroundings` — world line, module, and read-name stamps.
2. `KeptParts` — world read stamps/picks, `from`, module shape, and names asked.
3. `PassageModel` — read stamps/picks and whether the ways’ names still match.
4. `Projection` — world line/module, creature-store version and actor inputs.
5. `Agency` — verifies module and stamps of the world names read by a failed plan.
6. `ObservationText.presented` — verifies entity-list length and stamps or recorded world reads.
7. `CampaignTick.idle` — verifies module, lineage and condition-name stamps before reusing an idle rule.

Four use `KeptReading`; Agency and CampaignTick use `World.agrees` directly, and Projection compares changes and
actor/store inputs. These are **metadata/dependency checks, not independent fresh computations**.
The narrower count is not a complete count of all hand-maintained validity schemes: `CheckedActions` validates
compilation lookups, `GatheredModifiers` checks mutable fighter inputs, and `CompanyKnowledge` incrementally checks
its log. `PlayerFrame`, `PlayerView.observe`, `Knowing`, `CampaignGrounding` and `Membership` also guard different
combinations of identities and other state. How many to call "revision schemes" depends on whether these are
included; the incomplete census cannot establish an exact total. PlayerFrame deliberately guards only its rows,
not a complete player revision. Length-only invalidation is not a robust semantic revision check.

## Independent checks

The hit checks in the tables are distinct from tests against a fresh computation. Known examples:

- `test/groundings-incremental.test.ts` re-grounds every schema on three walks and compares ordered action IDs;
  it does not compare the full operator structures.
- `test/projection-equals-full.test.ts` exercises `KeptReading`, `KeptParts` and fresh-vs-kept page behavior on
  selected scenarios. `test/small/ways-kept.test.ts` checks way invalidation and read propagation, not a general
  fresh oracle for all passages.
- `test/small/checked-actions.test.ts` compares reused and fresh compiler checks after changed definitions.
  `test/small/idle-held.test.ts` checks rule wake-up cases, not a full-watch equivalence oracle.

These are examples, not an exhaustive audit of every cache's test coverage.

## Presentation caches and memos

| Cache | Key; invalidation; retained value/lifetime | Hit validation |
|---|---|---|
| `PlayerView.named`, `src/presentation/player-view.ts:96-101` | Weak key: presented-entities map; retains ID → name map while that map is reachable. | Identity-only. No fresh label computation on hit. |
| `PlayerView.listed`, `src/presentation/player-view.ts:111-120` | Weak key: offered-operator array; retains listed choice rows. No explicit eviction. `choices()` returns copied row/choice objects. | Offered-array identity only; no check of campaign/world changes if the same array is reused. |
| `PlayerView.observed`, `src/presentation/player-view.ts:217-…` | Weak key: world; retained snapshot/chronicle metadata for the world. | Checks campaign, a key from elapsed/minutes/history length/installations/running/following, creature-store identity/version, and last history entry. Snapshot is computed only on miss and frozen. Chronicle is retained on this same record. |
| `PlayerView.descriptions`, `src/presentation/player-view.ts:376-382` | Weak key: module; set of observation IDs. | Module identity only; no recheck of observations. |
| `GlanceLines.worked`, `src/presentation/glance-lines.ts:219-229` | Weak module key; set of things whose opening rules read a `state` call. | Identity-only; no fresh scan. |
| `GlanceLines.cached`, `src/presentation/glance-lines.ts:231-…` | Weak module key; observation definitions by ID. | Identity-only; no fresh map build. |
| `SkillReading.cache`, `src/presentation/skill-reading.ts:28-29, 100-…` | Weak campaign key; retains world identity, action uses and “wanting” rows. | World identity only. A different world recomputes; same-world campaign/readout changes are not separately checked. |
| `SkillReading.shapes`, `src/presentation/skill-reading.ts:41-44` | Weak action-array key; retains schema skill-shape summary. | Checks array length only. Same-length action edits are not detected. |
| `RefusalReading.cache`, `src/presentation/refusal-reading.ts:15, 29-…` | Weak campaign key; retains world identity and refused rows. | World identity only. No fresh grounding/read on hit. |
| `RefusalReading.gating`, `src/presentation/refusal-reading.ts:24-28` | Weak action-array key; retains gated action IDs. | Checks length only; same-length edits can stale it. |
| `CoinReading.cache`, `src/presentation/coin-reading.ts:16, 29-…` | Weak campaign key; retains world identity and unaffordable choices. | World identity only. |
| `CoinReading.pricing`, `src/presentation/coin-reading.ts:44-49` | Weak action-array key; retains IDs with price conditions. | Checks length only. |
| `Knowing.kept`, `src/presentation/knowing.ts:23-35` | Weak campaign key; retains `Knowing` for world and perceived snapshot. | Checks world and perception-object identity; otherwise creates a new projection. Derived sets are lazy and retained on that instance. |
| `Outcome.kept`, `src/presentation/outcome.ts:21, 37-54` | Weak world key, then actor/action/foreseen-mode key; retains immutable teaching-fact arrays. | Exact world/key identity; no fresh teaching calculation on hit. |
| `Outcome.waiting`, `src/presentation/outcome.ts:22, 75-91` | Weak module key; predicate-call key → teachers. | Module identity only; teachers are indexed once. |
| `Narrator.cached`, `src/presentation/narrator.ts:227-…` | Weak module key; map of observations. | Module identity only; no fresh map construction. |
| `Companions.seen`, `Companions.making`, `src/presentation/companions.ts:13-14` | Weak object keys; respectively set of seen IDs and operator array. | Object identity only. |
| `LedAgain.logs`, `LedAgain.leads`, `src/presentation/led-again.ts:26-28` | Weak campaign-event-array keys; retained parsed read and nested lead/explanation indexes. | Array identity only; no check for in-place edits. |
| `CompanyRecall.logs`, `src/presentation/company-recall.ts:32-…` | Weak event-array key; retained read result. | Array identity only. |
| `AimLead.kept`, `AimLead.joined`, `src/presentation/aim-lead.ts:33,216` | Weak object keys; nested maps of lead results (including undefined) and joined strings. | Object identity plus explicit subkey; no recomputation on hit. |
| `AimLeads.kinds`, `AimLeads.answered`, `src/presentation/aim-leads.ts:61,149` | Weak object keys; nested maps for kind sets and answer booleans. | Object identity and subkey only. |
| `AimAdvances.waiting`, `src/presentation/aim-advances.ts:154-…` | Weak module key; nested map of calls. | Module identity only. |
| `Attest.issued`, `src/presentation/attest.ts:37-…` | Weak object key; nested witness map. | Object identity and subkey only. |
| `PlaceFacets.read`, `src/presentation/place-facets.ts:18-…` | Nested weak object keys, then keyed leaf arrays. | Identity/key lookup; no fresh derivation on hit. |
| `VisitedPlaces.travels`, `src/presentation/visited-places.ts:10-…` | Weak event-array key; retained travel-derived data. | Array identity only. |
| `OwnWords.taught`, `src/presentation/own-words.ts:9-…` | Weak module key; set of taught IDs. | Module identity only. |
| `AimPlaced.ruled`, `src/presentation/aim-placed.ts:13-…` | Weak module key; rule arrays by string key. | Module identity only. |
| `CompanyKnowledge.learnt`, `src/presentation/company-knowledge.ts:63-82` | Weak event-array key; actor, read cursor, last event and learned-fact map. Updates the map from appended events. | Resets on actor change, truncated log or changed last-read event; no fresh full-log comparison on hit. |
| `Undertakings.holding`, `Undertakings.origins`, `src/presentation/undertakings.ts:31,53` | Weak object keys; held-objective data and origin booleans. | Identity-only. |
| `Deeds.read`, `src/presentation/deeds.ts:15-…` | Weak event-array key; retained read result. | Array identity only. |
| `Glance.namings`, `src/presentation/glance.ts:45-…` | Weak module key, then keyed name sets. | Identity/key only. |
| `DangerSense.reckoned`, `foreseen`, `src/presentation/danger-sense.ts:40,129` | Static maps keyed by fight state and lineup respectively; `reckoned` clears above 200, `foreseen` evicts its oldest above 200. Retain reckoning results process-wide. | Key-only; eviction bounds lifetime, not semantic freshness. |
| `DangerSense.under`, `verdicts`, `src/presentation/danger-sense.ts:99-100` | Static string-keyed maps; `under`/verdict state is cleared or bounded at 200. | Key-only; no revision validation. |
| `DangerSense.wholes`, `src/presentation/danger-sense.ts:74-81,98` | Static string-keyed set of fights requiring a full reckoning; no eviction is shown. | Key-only; this is a retention risk to measure, not an observed leak. |

## UI caches and memos

| Cache | Key; invalidation; retained value/lifetime | Hit validation |
|---|---|---|
| `Depth.cache`, `src/ui/depth.ts:16-23` | Weak key: module entity array; retains a full ID → depth map. | Identity-only. Depth computation reads world relations, but later world changes do not invalidate if the module entity array remains the same. |
| `SiteScale.read`, `src/ui/site-scale.ts:9,34-48` | Weak entity-array key; map of site room/level sizes. | Identity-only. |
| `SiteScale.doors`, `src/ui/site-scale.ts:10,19-33` | Weak way-call-array key; entry-place → site map; built using both ways and entities. | Keyed by ways-array identity only; replacement of entities with the same ways array is not checked. |
| `PassageModel.read`, `src/ui/passage-model.ts:91-…` | Weak world key, then actor/place; retains ways and dependency metadata. | Same-world hit checks names and notes saved dependencies; later-world reuse checks saved names and `KeptReading.holds`. |
| `PassageModel.lasting`, same file | Weak module key, then actor/place; retains dependency-tracked way results across worlds. | Part of the same family: hit checks names and `KeptReading.holds`. |
| `WaysInto.kept`, `src/ui/ways-into.ts:9-17` | Weak connects-array key; stores by-ID map and “ways into place” index. | Checks `byId` map identity when the connects array hits. No content recomputation otherwise. |
| `Passages.entered`, `src/ui/passages.ts:100-110` | Weak entity-array key; enclosure → count of all entering ways. | Identity-only; count computed lazily once per enclosure. |
| `Services.towns`, `src/ui/services.ts:57-69` | Weak entity-array key; stores entity-list length and town → rooms. | **Length-only** invalidation/rebuild. Same-length edits evade it. |
| `LandModel.going`, `src/ui/land-model.ts:191-202` | Weak chart key; frozen cell → nearest place record. | Chart identity only; no fresh nearest-place calculation on hit. |
| `Stakes.sayings`, `src/ui/stakes.ts:60-75` | Weak module key; objective ID → IDs named in text/condition. | Module identity and objective-ID lookup; no freshness check for edits to a module in place. |
| `KnownWays` tree `within`, `src/ui/known-ways.ts:…` | Stored on the tree; retains `byId` identity and first-descendant map. | Rebuilds if `byId` identity changes. |
| `KnownWays.roadsOf`, same file `:149-…` | Weak module key; set of road IDs from charts. | Module identity only. |
| `ChartModel.within`, `src/ui/chart-model.ts:212-…` | Instance map; keyed results for “within” lookups. | No separate invalidation evident; lifetime is the model instance. |
| `Overland.read`, `src/ui/overland.ts:30` | `WorldMemo`-backed result. | Per-world/key memo; read dependencies are tracked by `WorldMemo`, but it does not validate across revisions because the key includes the world object. |
| `ChartModel.read`, `src/ui/chart-model.ts:50` | `WorldMemo`-backed way info. | Same per-world dependency-tracking behavior. |
| `Waylaid.read`, `src/ui/waylaid.ts:12-…` | Weak module key; lying/way data. | Module identity only. |
| `SiteOutsides.read`, `.joined`, `src/presentation/site-outsides.ts:10,25` | Weak way-call-array keys; indexed and joined derived results. | Identity-keyed, no content freshness check. |

## World generation and authored-world caches

| Cache | Key; invalidation; retained value/lifetime | Hit validation |
|---|---|---|
| `AuthoredLand.drawn`, `src/world/authored-land.ts:25-34` | Weak module key, then region ID; retains chart, including `undefined`. | Module identity + region key; no fresh chart derivation. |
| `Foundings.cached`, `src/world/founding.ts:50,62-69` | Weak region key; retains all settlement foundings. | Region identity only. |
| `RegionZones.drawn`, `src/world/region-zones.ts:59-…` | Weak region key, then zone ID; retains landmarks. | Region identity and zone key; no fresh drawing on hit. |
| `RegionAfoot.drawnIn`, `src/world/region-afoot.ts:16-33` | Weak region key; retains settlement → selected template option. | Region identity only. |
| `RegionPleasures.drawn`, `src/world/region-pleasures.ts:23-48` | Weak region key, then `home`; retains settlement → three selected pleasures. | Region/home key only; no fresh draw. |
| `Countries.plans`, `src/world/countries.ts:78-…` | Weak key: `marches` array; then seed+first-country key; retains country placement maps. | Array identity and string key only. |
| `Communities.given`, `src/world/community/community.ts:145-…` | Weak region key; then settlement ID; retains resident/animal names. | Region identity and settlement key only. |
| `Outfitters.named`, `src/world/outfitters.ts:33-…` | Weak region key; retains all chandlery keepers/names. | Region identity only. |
| `WrittenKyr.read`, `src/world/written-kyr.ts:10-18` | Weak key: exact written-string array; retains parsed module. | Array identity only. |
| `WorldGrid.draws`, `src/world/world-grid.ts:47-…` | Static map keyed by seed/coordinates/salt/given values; retains generated region. Returns a structured clone on lookup. | Key-only; no freshness check. No explicit eviction shown. |
| `WorldDrawings.kept`, `src/world/world-drawings.ts:29-55` | Weak source key, drawing-ask key; four promises retained. Failed promise deleted; `forget(base)` clears all. Returns cloned owned fields, shares library/herald/standing data. | Key-only; no fresh drawing on hit. |
| `Frontier.ahead`, `src/world/frontier.ts:141-153` | Per-instance map keyed by serialized drawing inputs; keeps in-flight promise. Failure deletes; non-kept use clears the map. | Key-only. |
| `Composition.made`, `src/world/compose/composition.ts:37-…` | Weak bundle-source key plus composition key; retains composed result. | Key-only. |
| `RegionNews.told`, `src/world/region-news.ts:16-29` | Weak region key; temporary teller/place → gossip map, initialized at `writing()` and deleted in `finally`. | Within writing, key hit reuses the same gossip. This is scoped consistency state, not cross-revision memoization. |
| `CommunityWriter.portraits`, `src/world/community/community-writer.ts:69-84` | Weak region key; retains `Portraits` selection state. `afresh(region)` explicitly deletes it. | Region identity only; no fresh selection on hit. |
| `CityResidents.read`, `src/world/city-residents.ts:14,39-43` | Weak bundle-source key; retains the library promise while the source lives, including a rejected promise. | Source identity only; no retry or fresh source read on hit. |
| `Histories.plans`, `src/world/history/histories.ts:41-…` | Static string-keyed work-plan map. | Key-only; no invalidation shown. |
| `RegionKey`-adjacent and other region drawing state | `RegionZones`, `RegionPleasures`, `RegionAfoot`, `Foundings`, `Communities.given`, and `Outfitters.named` above all retain derived/generated choices on region identity. The values can retain substantial generated arrays/maps for as long as their region key remains reachable. | These are deterministic generation memos, not checks against changed region contents. |

## Other cache/memo families from the earlier compact inventory

| Cache | Key; invalidation; retained value/lifetime | Hit validation |
|---|---|---|
| `ModuleCanon.sources`, `ModuleCanon.parsed`, `src/campaign/module-canon.ts:19-20` | Weak source → promise and static string → parsed canon declarations. | Identity/key only; no content freshness check. |
| `Environment.indexed`, `src/campaign/environment.ts:70-…` | Weak entity-array key; stores length and ID map. | Length-only; same-length changes evade it. |
| `Nearby.kept`, `src/campaign/nearby.ts:16-…` | Weak world key plus nested key; `WorldReads` result retained. | Per-world/read dependency tracking; not cross-revision validation. |
| `SavedSchemas.written`, `src/campaign/saved-schemas.ts:13-…` | Weak definition key; retains action-array identity and written result. | Checks actions identity; rebuilds on replacement. |
| `CampaignTick.idle`, `src/campaign/campaign-tick.ts:288-300` | Weak rule key; retains condition-read names, module, idle names and stamps. | **Cross-world family #7:** checks module and world stamps; recomputes when stale. |
| `CampaignTick.conjoined`, `src/campaign/campaign-tick.ts:311-318` | Weak rule key; retains closed conjuncts while the rule lives. | Rule identity only. |
| `CreatureFacts.worded`, `src/campaign/creature-facts.ts:120-133` | Weak module key; retains word derivation. | Module identity only. |
| `CreatureFacts.declarations`, `src/campaign/creature-facts.ts:137-160` | Weak module key; retains declaration indexes and counts of entities, relations and measures. | Checks those three lengths; same-length edits are not detected. |
| `Operators.proposals`, `src/campaign/operators.ts:…` | `WorldMemo` by world and canonicalized query pattern; retains candidate bindings. | Reuses within world/key; tracks reads for enclosing memo, no cross-world freshness check. |
| `ParseCache.parsed`, `src/lang/parse-cache.ts:8-57` | Text/context key; 12 MiB text-length budget; optional persistent `ParseCache.store`; stores module clone in process and original in store. | Key-based; no parse on hit. |
| `KeptParses`, `src/lang/kept-parses.ts:7-22` | Delegates to parse cache using vocabulary/text/declarations key. | Key-based; installs cached catalog. |
| `DeclarationParses.kept`, `src/lang/declaration-parses.ts:26-27,49-85,118-121` | Vocabulary+declaration text; 40,000-entry bound. | Key-based. |
| `DeclarationShapes.known`, `src/lang/declaration-shapes.ts:22-29,65-85,111-147` | Vocabulary+shape; 30,000-entry bound; periodically persisted. | Fills and checks marks; falls back to parse/learn if fill does not fit. |
| `QueryIndex.kept`, `src/lang/query-index.ts:7-17` | Weak query-array key; name index. | Checks **length only**. |
| `EntityIndex.built`, `src/lang/entity-index.ts:8-35` | Weak entity-array key; by-ID/type/exits/order indexes. | Checks **length only**. |
| `RelationViews.lists`, `.indexes`, `src/lang/relation-views.ts:10-37` | Weak relation-map key; list and argument indexes. Writers must call `forget(held)`. | No validation on hit; explicit invalidation on writes. |
| `WorldMemo.kept`, `src/lang/world-memo.ts:10-25` | Per-instance weak world key, then string key; value plus recorded reads/picks. | World identity; re-notes saved dependencies on hit. |
| `QueryModes` and query helpers, `src/lang/query-modes.ts:13-74`; `src/lang/asking.ts:23-67`; `src/lang/reads.ts:10-…` | Weak module/predicate/list/object keys; derived modes, flattened predicates, risk lists and read indexes. | Object-identity memoization; no fresh semantic validation. |
| `KeptPredicates`, `src/lang/kept-predicates.ts:8-17` | String key → predicate, bounded to 8,192. | Key-only. |
| `TemplatedPredicates.parsed`, `src/lang/templated-predicates.ts:9-20` | Template text → parsed predicate; clears above 32. | Key-only; substitutes the requested ID into retained template. |
| `KeptGroundings`, `src/campaign/kept-groundings.ts:28-119` | Per operators instance; actor LRU 16; schema results and read-name stamps. | **Cross-world family #1.** Checks module, world line and stamps; redoes stale/untracked groundings. |
| `KeptParts`, `src/ui/kept-parts.ts:19-77` | Per-module weak key, 64 recent entries; retains result plus dependencies, `from`, shape and names. | **Cross-world family #2.** Checks current shape/context, asked names and `KeptReading.holds`. |
| `Projection`, `src/campaign/projection.ts:12-70` | Instance retains world, store/version and per-actor inputs. | **Cross-world family #4.** Checks current store/world and changed facts/records/environment to project dirty actors. |
| `PlayerFrame`, `src/presentation/player-frame.ts:22-73` | Weak campaign key; retains frozen rows and derived readings. | Checks current world and offered-array identities. |
| `Agency.fruitless`, `src/campaign/agency.ts:36-62` | Static actor+goal key; module, reads and stamps; cleared above 4,000. | **Cross-world family #5.** Checks module and current read stamps before reusing a negative search result. |
| `WorldDrawings`, `src/world/world-drawings.ts:29-55` | As above: weak source, four entries, failure deletion and explicit forget. | Eviction/key lifetime only; no revision validation. |
| `Frontier.ahead`, `src/world/frontier.ts:141-153` | As above: instance promise cache by serialized inputs. | Key/failure/clear policy only. |
| `CompiledModules.kept`, `.editions`, `src/campaign/compiled-modules.ts:21-63` | Compiled modules bounded to 64; editions clear above 8; optional persistent store. | Key/context and catalog restore; no fresh compilation on hit. |
| `ModuleBundle.parses`, `.rulesets`, `src/campaign/module-bundle.ts:127-157` | Parse map clears above 400; ruleset map above 8. | Text/kind/declaration keys; restores local catalog on hit. |
| `LoadCache`, `src/campaign/load-cache.ts:13-39` | Weak source → key → promise; failed promises deleted; process queue serializes load+use. | Assumes source does not change while process runs. |
| `LocalKinds.worded`, `src/canon/local-catalog.ts:129-139` | Exact text → word/declaration sets; FIFO 400. | Tokenization reused, but matching is rerun against current installed kinds. |
| `HexBoundary`’s `hexes`, `cells`, `marked`, `doors`, `src/hex-boundary.ts:20-79` | Weak module keys; per-ID locations, wilderness-mark set, site-door cells. | Identity-only; no module revision check. |
| `Depth`, `SiteScale`, `WaysInto`, `Passages.entered`, `Services.towns`, `LandModel.going`, `src/ui/` | Individually detailed above. | Identity/length checks only, not cross-revision semantic validation. |
| `Operators.made`, `.atoms`, `src/campaign/operators.ts:28-30,115-135` | Per-instance operator-ID map, 4,096 LRU; schema ID → atom list. | Operator hit only refreshes recency; atom cache has no invalidation within instance. |
| `PresenceGate.gates`, `src/campaign/presence-gate.ts:12-…` | Weak operator key; gate result. | Operator identity only. |
| `CampaignItems.consumables`, `src/campaign/items.ts:22-…`; `ItemCatalog.uses`, `src/item-catalog.ts:31-…` | Static string-keyed ability/usage lookups. | Key-only; no freshness check shown. |
| `FixedStatBlock.blocks`, `src/rules/fixed-stat-block.ts:17-…` | Static string key, including undefined result. | Key-only. |
| `Chain.first`, `src/rules/chain.ts:14-…` | Weak effect-context key; retained first/dealt data. | Context identity only. |
| `GatheredModifiers.kept`, `src/gathered-modifiers.ts:22-35` | Weak fighter key; retained frozen modifiers and their source inputs. | Checks statuses by value and environment, equipment, weapon, worn modifiers, traits, race and variations; no fresh gather on hit. |
| `ModuleCanon`, `Environment`, `Nearby`, `SavedSchemas`, `src/campaign/` | Individually detailed above. | Their identity/length/dependency policies are stated in each row. |
| `WrittenKyr`, `RegionNews`, `CommunityWriter.portraits`, `src/world/` | Individually detailed above. | Identity/scoped-state behavior, not cross-revision validation. |
| `ObservationText.indexes`, `src/lang/observation-text.ts:97` | Weak entity-array key; retains an entity index while the array is reachable. | Checks length, not content. |
| `ObservationText.presentations`, `src/lang/observation-text.ts:137-160` | Weak entity-array key; retains presented entities, length, world stamps and optional kept reads. | **Cross-world family #6:** size and stamps or `KeptReading.holds`; no fresh derivation on hit. |
| `CampaignGrounding.grounded`, `src/campaign/campaign-grounding.ts:12-24` | One Operators and its caches per campaign grounding; module, action/entity counts and actor-array identity. | Checks those inputs; same-length mutation is not detected. |
| `CampaignGrounding.applicable`, `src/campaign/campaign-grounding.ts:14,26-36` | One offered array per campaign grounding, keyed by world and player identity. | No fresh derivation on hit. |
| `Membership.live`, `src/campaign/membership.ts:8-24` | Caller-held actor array, keyed by base actors and joined party IDs. | Compares those keys; no fresh derivation on hit. |
| `ParseStore`, `src/campaign/parse-store.ts:8` | Disk-backed parsed and compiled entries, version and hash keyed; persists between processes. | No fresh parse on hit; backing store, not a second query. |
| `CheckedActions.kept`, `src/lang/checked-actions.ts:13-25` | Weak action/rule/observation key; retains joined mode, capabilities and notes of lookups made by a successful check. | Compares mode, capabilities identity and every lookup answer; otherwise rechecks. Does not independently rerun the full check on a hit. |
| `World.signatures`, `src/lang/world.ts:38,165-180` | Weak module key; retains signature indexes. | Checks relation, measure and query array identities and lengths, not same-length edits. |

## Isolation and global state

- **Process-global static maps:** parsing, compiled modules, agency fruitless results, danger-sense state, fixed-stat-blocks, item-use/consumable lookups, and several predicate caches are shared process-wide. Many use text/object keys; some validate other inputs or dependencies. Static maps with no bound or clear path can retain their values for process lifetime.
- **Weak-key caches:** weak keys permit collection when the key object becomes unreachable, but do **not** detect in-place mutation. This matters for module-, region-, world-, event-array-, and entity-array-keyed caches.
- **Length-only freshness:** `QueryIndex`, `EntityIndex`, `Services.towns`, `SkillReading.shapes`, `RefusalReading.gating`, `CoinReading.pricing`, `CreatureFacts.declarations`, and `Environment.indexed` can miss same-length in-place edits. Whether such mutation is permitted must be established before treating this as a defect.
- **Catalog isolation:** `LocalCatalog` is static mutable state. Its `claim`/`reclaim` flow restores a campaign’s kinds when ownership changes; its source comment explicitly notes that two campaigns’ commands interleaved within one command can still meet in the process (`src/canon/local-catalog.ts:183-…`). `LoadCache.take()` serializes load through use to avoid catalog collisions during overlapping loads (`src/campaign/load-cache.ts:17-26`).
- **Intentional sharing:** `WorldDrawings` clones region-owned mutable data but shares library/herald/standing arrays, documented read-only (`src/world/world-drawings.ts:13-18,45-52`). `PlayerFrame` freezes rows and choices (`src/presentation/player-frame.ts:33-45`).
- **Retained mutable results:** several generation/presentation memos return arrays, maps, or sets directly (for example `Foundings.all`, `RegionAfoot.drawn`, `RegionPleasures.of`, `Stakes.said`, and many nested presentation caches). Their validity assumes callers do not mutate the cached result; no defensive copy is evident in the inspected methods.

### Scope note

The rows above expand the previously named compact groups into individual entries and add the other cache fields surfaced by the targeted source inventory. A few rows cite the declaration line and describe the apparent cache contract; where the prior inspection did not read the method body (marked with `…`), I do not infer finer key semantics than the declaration establishes.