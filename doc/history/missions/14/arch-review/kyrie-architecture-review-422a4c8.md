# Kyrie architecture review: snapshot `422a4c8`

An independent, read-only review of the Kyrie runtime, the Kyr authoring language and the procedural world assembler.

---

## 0. Snapshot and method

| | |
|---|---|
| Repository | `jweissman/kyrie` |
| Reviewed commit | `422a4c8aff4ffdf7cffb4b9a9d74e4260a37ce16` ("A rest eats one ration, though the day's meal fell due as it began"), 2026-10-24 12:00 −0400 |
| Branch | `main` (also the local `claude/wonderful-heisenberg-efmqlz`; both at 422a4c8 when the review began) |
| Review started | 2026-10-24 16:39 UTC |
| Builder activity | Active. `origin/main` moved to `4ecc0e8` during the review. I did not chase it (see §J). |
| Isolation | A detached worktree at 422a4c8 in the session scratchpad. The working tree at `/home/user/kyrie` was not modified and was clean at the start. |
| Sibling dependencies | `deem` cloned at `967deac` (2026-10-21) and `languages` at `30d36c6` (2026-10-20), both at their remote HEAD. **Kyrie does not pin these** (see F-11). |
| Environment | Linux, 4 cores, Bun 1.4.4, Node 22. Load was high: four review agents and the suite shared the machine. |
| Evidence | Code reading of the kernel paths; **three diagnostic probe scripts** run against production entry points (kept outside the repo, in `scratchpad/probes/`); per-file test runs; an authoring exercise outside the repo; analysis of the `adventure/thrume` (9076108) and `house-that-grows-authoring` (199db32) branches. |

Confidence labels follow the brief: **Confirmed** (reproduced or read directly), **Strongly supported** (a code path read end to end but not executed), **Plausible**, **Unverified**.

---

## A. Executive verdict

**Kyrie has a sound kernel and an honest architecture for most of its surface. It is not an event-sourced engine, and it does not need to be.** The model it actually implements is coherent: an immutable fact store (`World`) with copy-on-write `apply`; one coordinator (`Campaign`); checkpoint and rollback around every command; identity-keyed randomness; and **command-transcript replay** as the reproducibility mechanism.

I verified that model directly on a generated world (seed `thorn`, 40 random offered commands):
- observing, listing choices, building the screen and narrating did not mutate the save;
- a rejected command left the save byte-identical;
- every offered choice executed;
- a fresh replay of the transcript reproduced `canonical()` exactly;
- a mid-run checkpoint, resumed and continued, reproduced the final save byte for byte.

That is a strong foundation, and better than most hobby engines of this size.

**Where it only appears to honour its architecture:**

1. **The transcript is not the whole causal record.** The browser host draws new countries at march-stones (`Frontier.expand`, `web/engine/engine-host.ts:127`) **outside** `PlaySession.perform`, so that step is never recorded. Confirmed:
   - the same transcript, replayed, gives 16 installed modules instead of 25, and a different `canonical()`;
   - `bin/kyrie replay` therefore cannot reproduce a generated-world game once the company crosses a border;
   - the terminal front-ends never expand the frontier at all.

   This is the one place where two systems independently decide what is true.
2. **Three state owners, one coordinator.** World facts, `CreatureStore` bodies and inventory, and `CampaignState` (party membership, inhabitants, minutes, deadline) are kept consistent by projection (`CreatureFacts.project`) and back-sync (`commitMoney`). Thirteen sub-services write through `host.commitWorld`. It works, because the checkpoint covers all three, but:
   - the "transition model" is the body of `Campaign.complete` plus `WatchLoop.pass`, roughly 15 ordered steps;
   - it is not a declared contract;
   - the ordering has already produced one real inconsistency: resolvers run before success is known (F-04).
3. **Fiction is maintained by prose discipline, not by semantics.** The independent player review's contradictions (the crowbar, the lift, the routed deserters, the dead sergeant's farewell) were each repaired **locally**: one template line, one kit's three rules, one narrative filter. Their general cause is untouched:
   - authored `when true` prose can name mobile entities;
   - rules keep firing for groups that have left the story;
   - knowledge is one binary `knows(party, fact)` token whose journal text states conclusions.

   Expect the same classes again with every new template.
4. **Kyr is the real authoring medium, with one significant privileged exception.** Two independent authors built large adventures (Thrume, about 1,150 lines; The House That Grows, about 820) with **zero `src/` changes**. That is the most important positive finding in this review. Against it:
   - `src/world/deep/deep-argument.ts` is a complete authored scene (a priest, a dead brother, six argument moves, a promise and a curse) that exists only in TypeScript;
   - its mine-specific dialogue ("for the ore", "take the noon", "the brothers' lamp") is emitted for barrows, waterworks and singing halls too;
   - neither independent adventure loads on 422a4c8 any more, because later shared-rule additions (`guest`, `confided`, `light_lamp`) collide with names the modules had declared.

**Risks that most threaten the next missions:** replay divergence in the default play mode; the absence of module namespacing against shared-rule growth; prose and state drift recurring per template; and a test suite whose most realistic tests teleport the party by writing to `World` directly (56 files), which proves the destination but not the journey.

---

## B. Architecture map

```
                         ┌──────────────────────────── web/reader (React) ────────────────────────────┐
                         │  renders Frame; sends {perform command-id} / {fight ability>target}        │
                         └──────────────┬─────────────────────────────────────────────────────────────┘
                                        │ postMessage (worker)
┌──────────────────────── web/engine/engine-host.ts ─────────────────────────┐
│ EngineHost: one PlaySession, the page log, autosave (KeptGame/SaveCodec)  │
│   perform → session.perform → ✱ Frontier.expand(campaign) ✱  (unrecorded) │──┐
└──────────────┬─────────────────────────────────────────────────────────────┘  │
               │                                       src/cli (terminal, playtext, replay) ──┐ (no Frontier)
               ▼                                                                               ▼
       src/session/PlaySession ── transcript {command, combat[]} ── replay() ── canonical()
               │ PlayerView.resolve(id) → Campaign.executeAsync(id, controller)
               ▼
  ┌──────────────────────────── src/campaign/Campaign (coordinator) ───────────────────────────┐
  │ checkpoint → Battle? → complete(): settle(resolvers) → apply success|failure → Journey →    │
  │ Aftermath → WatchLoop.pass (advanceWatch, CampaignTick.npcs/rules, Consequences, Engagement)│
  │ → Perceptions.settle (knows) → log.push(CampaignEvent) ; rollback on throw                  │
  │      │                 │                    │                       │                       │
  │      ▼                 ▼                    ▼                       ▼                       │
  │  World (immutable   CreatureStore        CampaignState           CampaignEvent log          │
  │  facts; apply)      (bodies, items;      (partyIds, inhabitants, (diff strings, combat,     │
  │      ▲               leases)              minutes, elapsed)       perceptions, voiced ✱)    │
  │      └── CreatureFacts.project (store→world) / commitMoney (world→store) ──┘                │
  └────────────────────────────────────────────────────────────────────────────────────────────┘
               ▲ compiled Module (facts, schemas, rules, observations)       ▲ global ✱ Canon/ItemCatalog
               │                                                             │ mutated by LocalKinds
  src/lang (Kyr.ohm, ModuleParser, ModuleCompiler, Operators/planner)  ──────┘
               ▲
  src/campaign/module-bundle + module-installations (namespacing  m__id, role imports)
               ▲
  src/world (RegionWriter, WorldAssembler, deep/*, history/*, community/*)  ── writes Kyr source ──┐
       uses: deem (../deem, unpinned ✱) tables in data/generation; languages (../languages) names │
       ✱ deep-argument.ts emits a fixed authored scene ✱                                           │
                                                                                                   ▼
                                                                         data/**/*.kyr, *.kyrt, *.json
  src/presentation, src/narrative, src/ui  ── read Campaign.readout/world/history ──► Frame
       ✱ Telling writes `voiced` into the authoritative log (Campaign.told) ✱
       ✱ Telling.silent reads hp from CreatureStore, not able() from World ✱
```

**Suspicious dependencies (✱):**
- `EngineHost` → `Frontier` → `Campaign.install` (an authoritative mutation from the host);
- `narrative` → `Campaign.told` (presentation writing into the log);
- `LocalKinds` → global `Canon` (module isolation done with a process-global);
- `Engagement.cameFrom` regex-parses diff strings in the log to find where to flee;
- an unpinned `deem`.

Dependency direction is otherwise clean: `lang` does not import `campaign`, and `ui`/`presentation` do not call writers. A grep of `commitWorld|applyAction|execute|perform` outside `src/campaign` finds only the session, the CLI, scripts, `Frontier` and `InformationView`.

---

## C. Command-to-event audit (centrepiece)

**Terminology.** Kyrie has no event reducer. "Events" are `CampaignEvent` receipts, written *after* mutation:
- `changes` holds diff lines `"+ fact"` / `"- fact"`;
- `combat` holds combat events;
- `perceptions` holds what the company perceived;
- an optional `resolution` holds the receipt with body before/after (`command-resolution.ts`).

Authoritative transitions are `World.apply(changes)` (a pure function returning a new world), `CreatureStore` commits through leases, and in-place edits of `CampaignState`. **Replay re-executes commands; it does not reduce events.** I judge this a legitimate design choice (command sourcing plus snapshot saves), *provided* every causal input enters the command stream. Section §C.7 shows where one does not.

### C.1 Common skeleton (every command)

```
UI choice (id) ─► EngineHost.perform / CLI ─► PlaySession.perform           play-session.ts:59
   busy guard (double submit → throws)                                      :60
   PlayerView.resolve(campaign, id)                       legality: must be in Campaign.offered()
   Campaign.executeAsync(id, controller)                                    campaign.ts:259
     action(id): structuredClone(offered().find(id)) else throw             :239   ← rejection: no state touched ✔
     checkpoint(): creatures snapshot, current (clone), observations, log length   :274
     [combat] encounterBattle → Battle (lease) → controller per player turn
     complete(action, checkpoint, battle)                                   :286
        settle(): Mercy.spare | FieldUse.award | Membership.enlist/release | FieldResolver (resolver)  :338
        success := held && Checks.passed && survived
        apply(success ? action.success : action.failure)  (unless deferred)  :399  World.apply + commitMoney
        Journey.depart / Aftermath.record / refresh (CreatureFacts.project)
        WatchLoop.pass: per watch → advanceWatch (clock facts; FieldUse.advance light/conditions)
                        → CampaignTick.npcs (planner) → CampaignTick.rules (authored order, single pass)
                        → Consequences.strike → settleWatch (Progression) → Engagement.foe/halt
                        → Interruption.check                                  watch-loop.ts:27
        deferred apply, shelter() for rest, standing check
        receipt (if witnessedAttack declared) ; Perceptions.settle (asserts knows/witnessed)  :331
        log.push(event)
     Engagement.assault? → second battle + complete → Engagement.after → amend(last)  :266
   catch → rollback(checkpoint) ; rethrow                                   :271   ← atomic ✔
   steps.push({command, combat}) ; Telling.tell → campaign.told(voiced)     play-session.ts:79-82
EngineHost: PlayTranscript.entry (page log) ; Frontier.expand ✱ ; ScreenModel.build ; autosave (setTimeout)
```

### C.2 Moving between places, `go(passage, place)`
- **Origin:** a choice id from `PlayerView.choices` → `Campaign.offered()`.
- **Legality:** the schema `go` in `data/rules/passages.kyr` (`connects`, unopened, guards, benighted…), grounded on demand by `Operators.applicable` (`operators.ts`), the same test used for NPC planning.
- **Costs:** `ActionTime.of`, plus `Journey.of` turning a multi-watch passage into a *leg*.
- **Transitions:**
  - `Journey.depart` commits `enRoute`;
  - per watch, `Journey.open` is checked and `Journey.back` turns the company around if the way closes (`watch-loop.ts:59-61`);
  - `journey.arrive()` on the last watch calls `host.commitWorld(arrived)`, then `host.applyAction(action, true)`, then `refreshProjection()` (`journey.ts:72-74`).
- **Narration:** `Perceptions.after` uses `LocalObservations.read(after, player)` and the place's `Observe … when …` texts. **Persistence:** the diff lines plus the transcript step.
- **Verdict:** clean. Arrival is applied inside the watch loop rather than at "success". That is deliberate, and documented in `campaign.ts:295-296`.

### C.3 Taking an object, `take_item(actor, find, form, recipient, site)`
- **Legality:** `belongings.kyr:56-63` (`Requires … at(find, site) and noticed(find, actor) and not benighted(actor)`).
- **Transition:** in two stores, in this order:
  1. `settle` → `FieldResolver.take` (resolver `acquire`) moves the item into the recipient's inventory in `CreatureStore`;
  2. `apply(success)` retracts `at(find, site)` in `World`;
  3. `refresh` re-projects `ownedItem(item, member)` into `World`.
- **Narration:** `Result "{recipient} takes {find}."`. Place prose is whatever `Observe` texts still hold. The crowbar defect was a `when true` sentence naming the item. At 422a4c8 that one template line is now `when at({w}_crowbar, {w}_adit)` (`galleries.kyrt:46-47`, fixed in 75d6c9a). **The general cause persists (F-06).**
- **Persistence:** the item moves in the store snapshot, and the receipt carries the body diff.

### C.4 Opening, repairing and operating a mechanism
Examples are the lift-cage `Change free … from jammed to working needing brawn` and the steam valve.
- **Legality:** one generic schema, `change_thing` (`passages.kyr`), grounded against `changeOf` and `needs` facts lowered from `Thing { State … Change … }`.
- **Transition:** the schema's success changes in `World`, then rules and `Event`s in `CampaignTick.rules` (authored order, one pass per watch, or a zero-watch pass at `watch-loop.ts:35-36`).
- **Hazards:** `Hurts with … when leaking then vented` resolves through `Items.expose` → `AbilityUse` → `CreatureStore`.
- **Narration:** state sentences and `Event` texts. The lift's direction is prose in two places, the `State working` text and the `Event cage_wound` text, with nothing tying either to a direction fact.
- **UI:** the nested actions on a way are produced by `choice-tree.ts` grouping (fixed in ee8f74a and c4ace6b). They come from `offered()`, so the UI cannot invent illegal actions; it can only fail to show legal ones (see the missing test in §G).

### C.5 Speaking, recruiting, dismissing, relationships
- **Talk:** `talk_to` requires `talks(person) and able(person)` (`people.kyr:73`). `addressed(person, actor)` opens a conversation. Since c4acb22, `Rule conversation_falls when addressed(?p, ?c) and not able(?p)` and `conversation_breaks … hostile` retract it generically. **Good: the semantic fix is in Kyr.**
- **The narrative also filters independently.** `Telling.silent` (`src/narrative/telling.ts`) drops voiced lines from actors whose creatures all have `hp <= 0`, reading `CreatureStore` rather than `able()`. The same fact ("is this person able to speak?") is decided in two places by two predicates. That is harmless today; it diverges for sleeping, captured or senseless people.
- **Recruit:** `Resolve enlist(recruit, company)` → `Membership.enlist` (`membership.ts:25-38`) **mutates `CampaignState` in place**: `partyIds.push`, `inhabitants`, `enlisted`. It then returns a World with `memberOf` retracted and `joinedAs` asserted. This is covered by the checkpoint, so it is atomic, but it is a third state owner with no receipt type of its own. **Dismiss/inter:** `Membership.release`.
- **Relationships:** ordinary facts and measures (`believes`, `conviction`, `scorns`, `refusesService`).

### C.6 Combat: attack, damage, death, loot, end
```
attack(party, foe, here)  (core.kyr) ─ Resolve combat(foe)
 executeAsync → encounterBattle: Battle.encounter(store.acquire(ids))  seed = RandomStreams.command(seed,'combat', history-occurrence)
   loop: battle.legalCommands(); controller (player) | battle.chosen() (Tactics); PlaySession checks legality; battle.step
         step → AbilityUse.perform → Effects → lease.commit (every step)        battle.ts:207-238
 complete: settle → Mercy.spare (takesPrisoners → hp=1, captured) | FieldUse.award (xp)   campaign.ts:338-346
           success := battle.outcome==='fighters' || foe fled ; apply(success|failure)
           refresh → CreatureFacts.project writes able/dead/fallen/slain from hp
           WatchLoop.pass → Engagement.foe/halt ; Progression.resolutions
 log: combat events (non-private) in CampaignEvent.combat; the transcript keeps the player's Commands only
 death: hp ≤ 0 in the store → projection `dead`/`slain`; rules may react (care.kyr). Loot: realize/acquire on later commands.
```
- **Determinism:** the battle seed is keyed by the action's identity and **how many earlier log events had the same identity** (`random-streams.ts:178-187`). That is O(log length) with an operator lookup per historical event (performance, F-13).
- **The "final blow lost" display defect** was fixed in presentation (632f1a0). The engine always recorded the event.
- **Mid-fight saving is impossible by design:** `save()` throws while leases are active.

### C.7 Light, supplies and time
- `advanceWatch` increments `current.elapsed` (an in-place edit of `CampaignState`).
- `FieldUse.advance` burns light and ticks world-time conditions in `CreatureStore`.
- `CampaignTick.clock` writes the clock measures.
- Rations are rules plus `commitMoney`, which back-syncs `quantity` changes made by rules into the store (`campaign-tick.ts:106`). `quantity` is both a **projection written by `CreatureFacts.project`** (`creature-facts.ts:32-34`) **and writable by rules**. That is a two-way sync of one quantity. It is consistent at 422a4c8 (the save-consistency check in the restore constructor passes), but it is the one projected relation that rules may write, and the most recent commits (`422a4c8`, "a rest eats one ration") show ration bookkeeping is still being tuned.

### C.8 A scenario rule or timed event
Example: the deserters' `Rule broken when (not able(chief) or routed(chief)) and tolls(keepers, post) says "…" { … Assert routed(keepers). Retract at(keepers, post). }`.
- **Evaluation:** `CampaignTick.rules` (`campaign-tick.ts:98-115`) iterates rules in authored order. Each binding instance is re-tested against the world as it stands, then applied.
- **Bypasses the coordinator's commit:** `current.world = next.snapshot` (line 107) writes the state directly, taking a **full copy of every fact per firing** (F-13).
- **Not a fixpoint:** a rule enabled by a later rule fires next watch. That is bounded, so it terminates, but order is meaning (HTG finding #10, still documented-only).
- **Narration:** `say` texts become happenings if the player perceives the anchor.
- **Timed events:** `untilLight(clock) == 1`, `watch(clock)`. There is no period or modulo primitive (Thrume F9).

### C.9 Learning or communicating information
- **Via observations:** `Perceptions.witness` (`perceptions.ts:13-24`). "Seeing is knowing": any perceived `Observe … teaches F` asserts `knows(party, F)` and `witnessed(party, F)`, and tells the fact's *name* as a discovery.
- **Via topics:** `Topic … teaches F`.
- Rules are forbidden to write `knows` (`module-compiler.ts:80`).
- **There is one epistemic level per company:** no "a source claims", no "suspects", no per-member knowledge. This is the general cause of "the inscription confers broad conclusions". Concretely:
  - `history_successors` is a single fact whose `Discovery` text is a full summary ("After X came the kingdom of Y… It fell to Z", `region-works.ts:155`);
  - it is taught by any of a tollhouse tariff, an abbey chronicle, a keep's roll, a deep-site document or a song (`region-fellows.ts:115`);
  - the deep-site document's own text is conditioned `not knows(party, history_successors)` (`deep-history.ts:43`), so once the company has heard the song, reading the document shows only "X, read." and its unique words are never shown (**strongly supported**).

### C.10 Generation and instantiation during play
- **At start:** `WorldAssembler.assemble` writes Kyr source into an overlay source; `Campaign.load` compiles and installs it; the transcript records the scenario path and seed.
- **During play:**
  - `Items.rummage` (search) instantiates goods in `CreatureStore` from the command's seeded stream. It is inside the command, so it is recorded.
  - **`Frontier.expand` is not inside a command** (`engine-host.ts:126-127`). It calls `campaign.install(...)` up to four times after `session.perform` has returned and the step has been recorded.
- **Probe 2 (confirmed):**
  1. walk seed `thorn` to `region__edge_north`, calling `Frontier.expand` after each command as the host does;
  2. installed modules: 25;
  3. a fresh session, replaying the same transcript, ends with 16 installed and `canonical()` unequal.
- **Save/restore is unaffected,** because the save embeds the compiled module. **Replay, bug reports and CLI/browser parity are affected.**

### C.11 Invariant scorecard

| Invariant | Status |
|---|---|
| Queries, observation and rendering do not mutate | **Holds.** Probe 1, 40 steps, seed thorn: `PlayerView.choices/observe/chronicle`, `ScreenModel.build` and `Narrator.leaf` left the save byte-identical. Caches (`World` memo, `liveCache`, `applicable`) are harmless derived state. |
| Command handlers mutate only via the coordinator | **Mostly.** Exceptions: `Frontier` (host); `Telling` → `Campaign.told` (writes presentation text into the log; deterministic, so replay agrees); `CampaignTick.rules` assigns `current.world` directly; `Membership` edits `CampaignState` in place. |
| Reducers pure, no unrecorded randomness | **Holds** for `World.apply`. `dice()` is a hash of the clock and the entity id (`world.ts:120-125`). No `Math.random`/`Date` in engine paths (grep). `Tactics` tie-breaks with `localeCompare` (`tactics.ts:50`), which is locale-sensitive (Low). |
| Rejected commands leave the world unchanged | **Holds.** Probe 1: a rejected id left the save identical. Exceptions roll back. |
| Atomic commands | **Holds**, via a checkpoint of all three stores plus log truncation. |
| Deterministic cascade order | **Holds** (authored order, single pass, bounded). Not documented to authors. |
| Replay = original | **Holds** inside a region (Probe 1). **Fails** across a frontier (Probe 2). Never tested via `bin/kyrie replay` or cross-process. |
| Save/load preserves causality | **Holds** (Probe 1 resume equals the uninterrupted run). Saves embed the module, so there is no migration story (F-10). |
| Runtime instantiation in the event model | **Partly.** Rummage yes; Frontier no. |
| UI double submit / stale state | **Guarded** by `PlaySession.busy` (throws) and `executing` (`offered()` returns `[]` while executing). The combat `fight` request validates against current `legalCommands()`. |
| Front-end equivalence | **No.** The browser expands frontiers, the CLI does not, and `playtext` uses its own random policy over choices. |

**Answer to the critical question.** Within one region, yes: authoritative state is reconstructible and reasoned about through one coordinator, and I could not make observation or rejection leak. Across the generated world's edges, no: the host decides what exists, and the record does not know it.

---

## D. Scenario-content boundary inventory

Production TypeScript only. Classes: (a) generic, (c) declared data, (d) scenario content in implementation, (e) missing capability, (f) ambiguous.

### Confirmed violations

| # | File | What | Class |
|---|---|---|---|
| D1 | `src/world/deep/deep-argument.ts:1-108` | A whole scene: a priest whose brother "went down … and did not come back up", six argument moves with fixed DCs and success and failure lines, a promise and a curse rule. About 28 authored strings, 21 prose lines; it emits about 86 Kyr lines. **Confirmed by running it for all four purposes:** "for the ore", "take the noon" and "brothers' lamp" are emitted for the barrow, waterworks and singing hall, where the bane is `noonlight`, `wardens_oath` or `dirge_bell` and there is no ore. `test/deep-argument.test.ts` pins only the mine. | **d** |
| D2 | `src/world/origins.ts:78-135` | Origin binders hardwired to scenario ids and those scenarios' internal entities: `'kin'` binds to `drover` (`wife`, `son`, `missing`), `'herbs'` to `fever` (`mother`). Renaming `wife` in `data/goings-on/drover` breaks it silently. The `wanderer` binder in the same file is already data-driven (`arrivals.json`). | **d/e** |
| D3 | `web/scenarios.ts:12-16` | The campaign registry with a pitch duplicated from `the-long-man.campaign.json`. Publishing a campaign needs TypeScript (HTG #20, still open). | **d** (low) |
| D4 | `src/world/world-assembler.ts:67-71` | A default named company (Elen, Bran, Dori) duplicating `data/campaigns/companies.json`, and **already drifted**: the TS Dori has spells, the JSON Dori does not. | **d/f** (low) |
| D5 | `src/campaign/campaign.ts:306,313,316` | English outcome sentences inside the coordinator, e.g. "The hazard brings down the exposed adventurer…". They are generic, but they are narrative output from the kernel, not localisable or overridable. | **a/f** (low) |

### Missing capability (TypeScript exists because Kyr cannot say it)

| # | Where | Gap |
|---|---|---|
| E1 | `campaign.ts:365-372` (`shelter`) | Rest re-checks `restful(site)` and `not closed(site)` at completion, branching on `action.schema === 'rest'`. Kyr has `Interrupted when`, but no "must still hold at completion". |
| E2 | `world-assembler.ts:320-324` | Every `way` role prefers a riverbank because drover and fever need willows. There are no manifest placement qualifiers. |
| E3 | `community/community-writer.ts:76-87` | Willow and fever lore hardcoded. There is no per-organism lore or `knownBy`. |
| E4 | `ui/choice-grouping.ts:32-130` | 89 entries mapping shared action ids to menu paths and labels; an author's new action lands in "Other". Plus label regexes in `choice-list.ts:27,53,118,173` and `attention.ts:54`, in tension with CONTRACT §4 ("a choice is known by its command, never by its label"). |
| E5 | `deep-purposes.ts:100-103`, `region-works.ts:1-13` | Static TypeScript registries of generator data: a new deep purpose or work template requires a TS import. |

### Ambiguous or undocumented: the engine's reserved vocabulary (f)
Engine code gives behaviour to names declared in `data/rules`:
- `witnessedAttack` (`witnesses.ts`, `campaign.ts:294`)
- `exposedTo`
- `takesPrisoners` (`mercy.ts`)
- `assails`, `halts` (`engagement.ts`)
- `offers`, `eats` (`cast.ts`)
- `weary`, `law`, `unlit`, `terrain` (`environment.ts`)
- `benighted`, `watched`, `informedPassage` (`player-view.ts`)
- `restful`, `closed`, `party`, `company`
- the hardcoded list of 22 projection names in `module-compiler.ts:79`, which is not derived from `CreatureFacts.written`.

**This is legitimate engine/stdlib coupling, but it is an undeclared language.** Authors discover it by collision; Thrume's F3 was five collisions over five loads.

### Defensible (a/c)
- **The rest of `src/world/deep/`:** layout, mechanisms, rivals, time, pacing. It is a generic expander; its fiction is in `data/generation/deep/*.json` (about 113 KB). 47 of its 1,069 lines are prose, 21 of them in `deep-argument.ts`.
- **`RegionWriter` and `WorldAssembler` writing Kyr** is explicitly sanctioned (`generated-worlds.md:22`, `mission-12/architecture.md` §2) and is sound: the Kyr it writes runs under the same rules as authored Kyr.
- **Smaller generic prose tables in TS** (`region-roads.ts:75-101`, `region-recruits.ts:15-25`, `deep-rooms.ts:251-293`, `deep-sounds.ts:132-137`) should migrate to `data/generation` per CONTRACT §2, but they are setting content, not stories. Measured: about 229 long English literals in `src/`, 81 of them in the handbook generator.
- **No scenario id** from `data/scenarios`, `data/situations` or `data/goings-on` appears in campaign, lang, presentation, ui or narrative logic. Hits are in comments only.

### Migration order (behaviour-preserving)
1. **D3 and D4** to JSON, with snapshot tests.
2. **D1** to a per-purpose `argument` template in `data/generation/deep/<art>`, using the existing `.kyrt` machinery (`history/work-plans.ts`).
   - First emit byte-identical output for `deep`, so `test/deep-argument.test.ts` stays green.
   - Then write correct text for bone, water and stone. That is an intended behaviour change, and it fixes the leak.
3. **Generator prose tables** to `data/generation/tables`. Gate each move with a hash of emitted Kyr over N seeds.
4. **D2:** a declarative `binds` block in `origin.json`.
5. **E2 and E3:** manifest qualifiers and organism lore.
6. **E1:** a Kyr "holds through" clause.
7. **Reserved vocabulary and E4:** a declared engine-provided relation list, and a `Menu` annotation on `Action`.

---

## E. Authorability gap assessment

**What an independent author can do today, without TypeScript (confirmed by Thrume and HTG):**
- places, passages, things with states and changes, items, people with topics and pursuits, rules and events;
- hazards with typed effects, module-local `Kind`/`Species` (since HTG #1);
- role imports and exports with namespacing (`m__id`), `dice(?thing)`, `+ - *` arithmetic, conditional `Seen when`, `opening when` passages, scenario manifests the assembler can place.

**What forces workarounds, ranked by how often it recurs in the two independent adventures:**

| Rank | Gap | Evidence | Kernel component |
|---|---|---|---|
| 1 | **No module namespace against the shared rules.** Shared-rule growth silently breaks modules. | Both branches fail on 422a4c8: `guest` (Thrume), `confided` and `light_lamp` (HTG). Thrume F3. | `module-bundle`/`module-installations` name resolution; the compiler's "redefines canonical" check. |
| 2 | **Knowledge is binary and cannot be produced by rules.** | Thrume F1 (two clicks for one revelation), F5 ("three constructs for one door"). The inscription defect. | `module-compiler.ts:80`, `perceptions.ts`. |
| 3 | **People and things fixed at load:** no spawning, renaming or hiding of a person. | HTG #14 (open), #17. Thrume F4 ("the crowned figure for ever"). | `Module.entities` is static; `Called` is static. |
| 4 | **No tables or generators inside Kyr.** | HTG #8: hand-partitioned die bands `bandLo`/`bandHi`; the growth table became a fixed sequence. | Kyr has no `Table`; `.kyrt` is generator-side only, so module-local runtime tables do not exist. |
| 5 | **No conditional effects, periodic time or endings.** | HTG #10, Thrume F9, F12; author comments about rule order (`annex.kyr:239-241`). | Grammar: `arithOp = "+" \| "-" \| "*"`; no `Ending`, no `Every`. |
| 6 | **Lint and runtime disagree.** | Thrume B2 (`consuming` a module-local kind fails lint, plays at runtime; reported at the wrong line), reproduced on 422a4c8. Thrume F7: fake passages "for the linter". | `ModuleCompiler` signature checks versus `LocalKinds`; the lint reachability check ignores rule-written `at`. |
| 7 | **No action-to-menu metadata.** | E4 above. | `ui/choice-grouping.ts`. |

**Distinguishing tooling from language:**
- **Fundamental to the language as designed:** gaps 2, 3 and 5. They need grammar and runtime semantics.
- **Fixable in tooling and compiler:** gaps 1, 6 and 7.
- **Gap 4** is a design decision: either Deem tables become importable by modules at runtime, or Kyr gains a `Table` construct that lowers to `dice`.

### E-bis. Authoring exercise and CLI audit

An external module was written outside the repo and driven through production `PlaySession`, with 25 deliberate-error variants. All of it is confirmed by running.

**What worked, in pure Kyr:**
- **A mechanism:** a winch with `slack`/`wound` states, `Change wind … needing winch_handle` (a local `Kind … like crowbar`), a `Passage … opening when state(winch, wound)`, and an `Event` asserting a fact. It is gated correctly, narrated, and opens the way.
- **A variant:** `Species well_rat like rat`.
- **A parameterised mechanism:** works only by installing the same module twice under different ids, with role imports. There is no template construct below module level.

**What did not work:**
- **Tables can choose, not create.** A weighted Deem table in `module.json` `generation` drove the kind and label of a pre-declared `Entity trinket` (8 ropes and 2 bars over 10 seeds). `ModuleAssembly.compose` rejects any generated entity that is not already declared, so a table cannot become N new entities without a kernel change (`ModuleAssembly` and `SituationManifest`, or a Kyr `Table` construct).
- **A `Change` has no effects, time or result text of its own,** and its needs are OR only. Anything richer must be a raw `Action`, which loses the Thing grouping in the UI.

**Tooling defects (confirmed):**
- **`bin/kyrie lint` exits 0 when a non-`data/` campaign has errors.** Only "recommended" campaigns set `failed`; others are tagged `[legacy]`, and their warnings are hidden without `--verbose`. All 25 error variants returned exit 0. For an independent author, lint is unusable as a CI gate. **High for authorability.**
- **Lint and play resolve `data/rules` against the working directory.** Run from outside the repo root, they fail with ENOENT.
- **Errors stop at the first.** Locations are recovered by regex over the message (`Diagnostics.explain`), so some are on the wrong line: an error on line 25 is reported at the declaration on line 14, and others have no file or line ("Unknown function or arity: glinting(trinket)"). The messages describe lowered facts ("Invalid argument handle in connects(…)"), not what the author wrote.
- **Accepted by lint, crashes in play:** `Hazard … means "Apply nonexistent_condition…"` and `"… fyre damage"`. The effect is checked only syntactically and looked up at strike time.
- **Accepted by lint, silently inert:** an `Event` whose condition names a state the thing does not have (`state(winch, open)`) never fires.
- **Placeholders are not validated** in Change labels, Person words, `Description` or `Discovery` text: "Let {winchh} run out" reaches the player as "Let winchh run out".
- **State ids are module-wide `condition` entities.** `State slack` collides with `Place slack`, and two Things share a state entity by name.
- **Shared-rule names leak into author ids:** `Discovery lore` → "'lore' is already declared by the shared rules".
- **No scaffolding, no text play.** There is no `new` command and no `play --text`. `bin/kyrie campaign` prints a JSON `InformationView` with **no authored prose at all**. `playtext` walks only fresh generated countries. Per-subcommand `--help` is ignored, crashes, or is taken as a seed.
- **Docs drift:** `data/README.md` describes campaigns and directories (serewater-march, silkholme, `regions/`, …) that are not in `data/`.

**Language observations:**
- `Kind` and `Species` each have two unrelated meanings.
- Time has three dialects (watches, minutes, passage `taking`).
- Terminators are inconsistent.
- Imports, exports and roles exist only in `module.json`, so an imported placeholder looks identical to a definition in the `.kyr` source.
- Several semantics live only in TypeScript: Topic lowering, try-verbs, passage kinds, person "words", the observation aspect enum, and the read-only relation list, which is hard-coded twice (`ModuleCompiler`, `ModuleAssembly.readOnly`).

**Lowest-cost, highest-leverage tooling fixes:**
1. Make lint's exit code honest for any campaign path.
2. Carry source spans through lowering, and report all errors.
3. Resolve rules relative to the install, not the cwd.
4. Add `kyrie play <campaign> --script steps.txt` printing the Narrator page, with transcripts by label (`ChoiceList` + `Narrator` already exist: the exercise's 60-line driver is the implementation).
5. Validate hazard effect strings and all placeholder sites.
6. `kyrie new module|campaign` on `ModuleWriter`.

**Answer to the critical question:** for the shapes it was designed for (places, things with states, people, rules), Kyr is clearly easier than TypeScript. Both independent adventures prove it. Where the shape is not supported (tables that create, templates, conditional effects, knowledge from rules, runtime entities), authors do not escape to TypeScript; they **escape into contortions** (places standing in for conditions, fake passages for the linter, die bands). That is the healthier failure mode, but it is a strong signal of which constructs to add next.

---

## F. Top fifteen engineering risks

Ranked by severity and architectural reach, not by ease of repair.

### F-01 · High · Deterministic execution · Frontier expansion is outside the command record
- **Observation:** `EngineHost.perform` calls `Frontier.expand(campaign)` after `session.perform` has returned and the step has been recorded (`web/engine/engine-host.ts:117-127`). That installs up to four modules via `Campaign.install` (`src/world/frontier.ts:26-53`). `PlaySession.replay` and `bin/kyrie replay` (`src/cli/kyrie.ts:57-63`) never call it, and nor does the CLI terminal or `playtext`.
- **Expected invariant:** CONTRACT §3, "The same seed, the same choices and the same code give the same world and the same play". The transcript is the replay unit.
- **Evidence (Probe 2):** seed `thorn`; walk to `region__edge_north` calling `expand` after each step: 25 installed modules. A fresh session replaying the same transcript: 16 installed, `canonical()` different.
- **Scope:** systemic for generated worlds, which are the default play mode.
- **Consequence:**
  - browser transcripts of any multi-region game cannot be replayed or used as bug reports;
  - CLI and browser diverge;
  - a future "replay to verify a save" step would fail.
- **Recommendation:**
  - **Smallest:** make expansion a consequence of the command. Run it inside `PlaySession.perform`, after `executeAsync` and before the step is pushed, with an `expanded` marker recorded in the step, or simply re-run it deterministically on replay. Then share one `Frontier` call between the browser and the CLI.
  - **Longer term:** treat `install` as a first-class command or effect (`Resolve install(...)`) so it lands in the receipt.
- **Confidence:** Confirmed.
- **Regression test:** generated seed → walk to an edge through `PlaySession` with the host's expansion → `replay` in a fresh process → `canonical()` equal.

### F-02 · High · Authorability · No isolation of author modules from shared-rule growth
- **Observation:** a module's relation and action names share one namespace with `data/rules`. Adding `Relation guest(group, group)` to `services.kyr` (c44ace6) made Thrume's own `Relation guest(group)` a load error. `confided` and `light_lamp` do the same to HTG.
- **Expected invariant:** CONTRACT §2, "Two scenarios that use the same name for different things do not see each other's". The same should hold between a scenario and later stdlib additions.
- **Evidence:** both independent branches fail to load on 422a4c8. They lint clean after a scratch-only rename.
- **Scope:** systemic. Every stdlib addition is a potential breaking change for every module.
- **Consequence:** at hundreds of curated adventures, the shared rules freeze, or every mission breaks third-party content.
- **Recommendation:**
  - module-local declarations shadow stdlib names within the module, with a warning;
  - modules declare a rules version (`rules: ['world@14']`);
  - lint all known external modules in CI (keep the branches' modules as fixtures).
- **Confidence:** Confirmed.
- **Regression test:** a fixture module declaring every stdlib relation name locally must still load, with warnings.

### F-03 · High · Narration/state consistency · Prose can describe state the world does not hold
- **Observation:** `Observe … when true "…"` texts, including generator templates (`deep-history.ts:23`, `.kyrt` works), may mention mobile entities (items, people, mechanisms' positions) in free text. Nothing links the words to the facts. The crowbar was fixed by rewriting one line of `galleries.kyrt` (75d6c9a). The lift's direction is only prose, in a `State` text and an `Event` text.
- **Expected invariant:** CONTRACT §4, "What the page says is what the company could know", and the review's "authored observations remain valid when entities change location, ownership, condition".
- **Evidence:** the 75d6c9a diff, and the `said-as-it-is.test.ts` regressions, which are single-seed and string-matched.
- **Scope:** repeated pattern, across every template and module.
- **Consequence:** each new template adds new instances; the independent reviewer's "brittle relationship to its own fiction" will recur.
- **Recommendation:**
  - **Lint:** a `when true` observation whose text contains the name of an `Item`, `Person` or movable `Thing` in the same module is a warning, unless it references the entity as `{id}` and its condition mentions that entity's location or state;
  - **Engine:** generate presence lines for items and people from facts, and discourage authored presence prose;
  - **Test:** a property test over K seeds: for each takeable item, take it, then no observation at the old place may contain its name.
- **Confidence:** Confirmed (mechanism); the specific instances are fixed.

### F-04 · Medium-High · Correctness · Resolvers run before success is decided
- **Observation:** `Campaign.complete` runs `settle()`, and therefore `FieldResolver.resolve`, which mutates `CreatureStore` (`campaign.ts:289, 353-355`), before deciding `success`. For interruptible actions the World branch is deferred, and `success &&= !interrupted` (`:310`).
- **Consequence:** `search` (`discovery.kyr`: `Resolve rummage(actor). Interrupted when threatened(actor)`) gives its goods to the company immediately. If the search is then interrupted, the World takes the failure branch but the goods are kept. More generally, the body and the world can disagree about whether an action happened.
- **Expected invariant:** an action's consequences commit on one outcome.
- **Scope:** local to resolvers combined with interruptible or deferred actions (today, `rummage`). The rest/camp resolvers are correctly deferred via `shelter()`.
- **Recommendation:** run resolvers for deferred actions after the watch loop (as `shelter` does), or give resolvers an outcome parameter.
- **Confidence:** Strongly supported (code path read end to end; not executed, because staging an interruption needs a threat).
- **Regression test:** search in a place where an assailant arrives in watch 1; assert inventory unchanged and `failure`.

### F-05 · Medium-High · Narration/state consistency · Knowledge is one level, and one fact can stand for a whole history
- **Observation:** `Perceptions.witness` asserts `knows(party, F)` for every perceived observation that teaches F (`perceptions.ts:13-24`). `history_successors` is one fact with a summary text (`region-works.ts:155`), taught by tariffs, chronicles, rolls, deep documents and songs. The deep document's own words are gated `not knows(party, history_successors)` (`deep-history.ts:43`).
- **Consequence:**
  - an inscription makes the journal state the kingdom's whole history as established;
  - a document read after the song shows only "X, read.";
  - there is no way to represent "the tariff claims…" or "the priest believes…" for the company, although `belief.kyr` models that for NPCs.
- **Expected invariant:** source claims ≠ established knowledge; the journal reflects what was actually learnt and from whom.
- **Scope:** systemic in the information model.
- **Recommendation:**
  - **Smallest:** split `teaches` into `tells` (a claim attributed to a source: `heard(party, claim, source)`) and `teaches` (established);
  - make document text unconditional on read, and keep the knowledge gate only on the *discovery note*;
  - **longer term:** reuse the `believes`/`conviction` machinery for the company.
- **Confidence:** Confirmed (model); strongly supported (the silenced document).
- **Regression test:** learn `history_successors` by song, then read a deep document; its text must appear.

### F-06 · Medium · Correctness · Groups that leave the story keep satisfying rules
- **Observation:** the deserters kept buying bread after being routed, because their three rules tested `able(keepers)`. The fix added `and not routed(keepers)` to each rule by hand (75d6c9a). `Telling.silent` independently decides who may speak, from hit points.
- **Expected invariant:** a group that is routed, dead, captured or departed is out of scheduled agency without every author remembering.
- **Scope:** repeated pattern, in every kit with routines.
- **Recommendation:** a stdlib query `present(group)` / `acting(group)` (able, not routed, not captured, at a place) used by `CampaignTick.npcs` and recommended in rules. Lint: warn on a rule that tests `able(g)` without `acting(g)` for groups with routines. Make `Telling` use `able()` from World instead of hp.
- **Confidence:** Confirmed (diff).

### F-07 · Medium · Architectural boundary · `deep-argument.ts` is privileged authoring, and wrong outside the mine
See D1. **Confidence:** Confirmed (run for all four purposes). **Regression test:** for each deep purpose, the generated argument text contains no string from another purpose's data.

### F-08 · Medium · Authorability/isolation · Module-local kinds are implemented by mutating global catalogs
- **Observation:** `LocalKinds.install/activate/reset` (`src/canon/local-catalog.ts:57-89`) write into the process-global `Canon.items`, `Canon.species` and `ItemCatalog.definitions`. They are called from `Campaign.load`, from `restore` (`campaign.ts:54, 93, 110`), from `ModuleBundle` (`module-bundle.ts:186`) and **from the parser** (`catalog-parser.ts:65`).
- **Consequence:** isolation means "the last campaign activated wins". Two live campaigns in one process (tests, a handbook render beside play, `Campaign.load`'s cache forks, lint of several modules) see each other's kinds, or lose their own.
- **Scope:** systemic for isolation; latent in the browser, which holds one session.
- **Recommendation:** make the catalog a value owned by the compiled module (`module.catalog`, which already exists). Pass a resolved catalog to `Content`, `Items` and the handbook instead of reading `Canon` globally.
- **Confidence:** Strongly supported (code); not exercised with two concurrent campaigns.

### F-09 · Medium · Testing · The most realistic tests bypass the journey
- **Observation:** 56 test files move the party or change the world through `campaign.commit(world.apply([...]))` (via `GeneratedWorld.put`, `test/support/generated.ts:9-12`) with `as unknown as` casts. Four edit saves to set `hp = 0`. `rout.test.ts:30` calls `executeAsync` directly, skipping the transcript.
- **Consequence:**
  - teleport tests prove a scene once you are standing in it, not that a player can reach it;
  - deaths written in rather than fought skip `Mercy`, `award` and `Engagement`;
  - the `the-dead` regression would pass even if combat death never produced `not able`.
- **Recommendation:** keep the teleports for scene unit tests, but add (a) a reachability or journey tier that walks by `PlayerView.choices` only, and (b) a lint rule banning `commit` casts outside `test/scene/`.
- **Confidence:** Confirmed.

### F-10 · Medium · Data integrity · Saves embed the compiled module and have no schema evolution
- **Observation:** `CampaignSave` is `{ version: 1, module, definition, state, creatures, events, … }` (`campaign.ts:157-163`). It is about 4 MB of JSON for one region and 7.75 MB for two (Probe 3: module 1.87 MB, definition 0.54 MB, state 1.53 MB). Restoring a game continues it under the module it was saved with, so content fixes never reach running games, and there is no migration path. `KeptGame` splits the world part for browser storage and gzip packs it, which is sensible, but `localStorage` quotas (about 5-10 MB) are within reach of a three or four region game (inference).
- **Recommendation:**
  - record engine, rules and content hashes, plus the deem and languages commits, in every save and transcript;
  - give the browser an explicit "content changed: replay transcript onto new content" path, which is possible once F-01 is fixed;
  - move browser saves to IndexedDB.
- **Confidence:** Confirmed (sizes); plausible (the quota risk).

### F-11 · Medium · Reproducibility · Deem and languages are unpinned sibling checkouts
- **Observation:** `package.json` has `"deem": "file:../deem"`, and `bun.lock` records no revision. Generation output depends on Deem's evaluator.
- **Consequence:** a seed's world can change with no Kyrie commit; bug reports are not reproducible across machines. I could only review against Deem's remote HEAD.
- **Recommendation:** pin by git SHA (a workspace or git dependency), and record it in `canonical()` and saves.
- **Confidence:** Confirmed.

### F-12 · Medium · Architectural boundary · The engine's reserved vocabulary is undeclared
See §D (f). Authors find reserved names by collision; the compiler's list of 22 protected names (`module-compiler.ts:79`) is hand-maintained apart from `CreatureFacts.written`.
- **Recommendation:** one `EngineVocabulary` table generating the compiler check, the documentation and the handbook.
- **Confidence:** Confirmed.

### F-13 · Medium · Performance · O(state) work per rule firing and O(history) per command
- **Observations:**
  - `CampaignTick.rules` assigns `current.world = next.snapshot` per firing (`campaign-tick.ts:107`). `snapshot` copies every fact (about 15,500 in one generated region, Probe 3), and the next `campaign.world` access re-indexes them.
  - `RandomStreams.command` filters the entire log and grounds an operator per past event (`random-streams.ts:178-187`).
  - `Engagement.cameFrom` scans the log in reverse with a regex built from an unescaped id (`engagement.ts:152-158`).
- **Evidence (Probe 3, thorn, contended machine):**
  - load 5.9 s;
  - `perform` median 152 ms, maximum 8.6 s (a long rest);
  - choices plus screen median 104 ms;
  - transcript replay about 1 s per command in Probe 1.
- **Consequence:** cost grows with world size and with session length. Long campaigns and multi-region worlds get slower per command.
- **Recommendation:**
  - commit through `World.apply` without `snapshot` (`commit(next)` keeps the view);
  - keep an occurrence counter map in the state instead of scanning the log;
  - record `cameFrom` as a fact.
- **Confidence:** Confirmed (code and measurements); the attribution of the 8.6 s maximum is plausible.

### F-14 · Medium · Testing · Evidence gaps at the CLI, cross-process and property level
- **Observation:**
  - `bin/kyrie replay` is never run by a test;
  - committed playtest transcripts are never replayed;
  - `world-starts` runs 2 seeds while its header claims 110;
  - `narration-audit` runs 2 seeds and excludes combat, items and rest;
  - no test checks that every offered choice executes, or that UI menu leaves equal `offered()`;
  - `orsino-registry` is silently skipped unless `../orsino` is present, and `paintings.test.ts:21` silently passes without `assets/`;
  - the documented performance tiers (18 s fast suite on 16 cores) do not hold here: the fast suite took 947 s (602 pass, 22 skip, 0 fail), and single heavy files took 20 to 106 s each under load. `narration-audit` spends about 106 s on 2 `expect()` calls.
  - A green suite does not exercise F-01 to F-08: every one of them coexists with 0 failures.
- **Recommendation:** §G.
- **Confidence:** Confirmed.

### F-15 · Low-Medium · Maintainability · Presentation semantics keyed to labels and English
- **Observation:** label regexes in the UI (`choice-list.ts:27,53,118,173`, `attention.ts:54`); a regex rewrite of English in `Engagement.halt` (`.replace(/ (comes|come) at you!$/…)`); `Telling` writing into the authoritative log; `team: 'goblins'` as the name for the opposing side.
- **Consequence:** wording changes break behaviour; localisation is impossible; CONTRACT §4 is violated in letter.
- **Recommendation:** keep presentation keyed by schema id and typed outcome; move `voiced` into a presentation-side log keyed by event sequence.
- **Confidence:** Confirmed.

**Also noted, Low:**
- `World.admits` and `World.apply` disagree on negative `set` values and on arithmetic that reads earlier changes in the same list (`world.ts:237-255` versus `:295-304`), so `admits` can reject what `apply` would accept.
- `localeCompare` tie-breaks in `Tactics`.
- `World.writes` is a process-global stamp counter. It is harmless, but it is global.

---

## G. Minimum regression and verification programme

Each tier is independent, and each runs from production entry points unless it says otherwise.

| Tier | Test | Catches | Cost |
|---|---|---|---|
| **1 Kernel invariants** | `World` property tests: `apply` is pure (input unchanged); `admits(c) ⇔ apply(c)` does not throw; exclusive relations; `key()` order-independent. | `admits`/`apply` drift | ms |
| | **The command contract on random walks:** at each step of a walk over N generated seeds, snapshot `canonical()`; for a fabricated id and for an id offered one step earlier, expect a throw and `canonical()` unchanged; every `offered()` id executes on a fork without throwing. | Illegal or meaningless UI actions, partial commits | ~1 s/step; run 3 seeds × 30 in CI, more nightly |
| | View purity: before and after `PlayerView.*`, `ScreenModel.build`, `Narrator.leaf`, `Telling.tell` on a fork, the save JSON is equal. | Rendering that mutates | cheap; reuse Probe 1 |
| **2 Language and modules** | Compile every module in `data/**` plus the two independent branches' modules as fixtures. Assert lint and runtime agree (Thrume B2). Module shadowing of stdlib names. | F-02, B2 | seconds |
| | Golden negative fixtures: unknown entity, misspelled state, duplicate id, unbound `{?var}`, and `when true` naming an item. The error must name file:line. | Silent or misplaced errors | seconds |
| **3 Deterministic execution** | **Cross-process replay:** `bin/kyrie replay` on committed transcripts (red-crag, plus one multi-region generated transcript) → `canonical()` matches a stored hash. | F-01, unpinned deps (F-11) | tens of s |
| | Save at random steps, JSON round-trip, resume, continue, equal to the uninterrupted run, over 3 seeds. Include one step just after a frontier crossing. | Save causality | |
| | Interrupted `search` leaves inventory unchanged. | F-04 | |
| **4 Generation properties** | Over 30 seeds, nightly: every place reachable by **player-walkable** ways from the start; every `take_item` target, once taken, is absent from all observation texts at its old place; every deep purpose's emitted text references only its own data; every observation `when true` text mentions no mobile entity name; generated Kyr hash stable per seed. | F-03, F-07, generator regressions | minutes |
| **5 Browser and focus** | Every `PlayerView.choices` id is a leaf of the rendered menu tree (`ChoiceList.all(ChoiceList.explore(ScreenModel.build))`), and the reverse; the last combat event appears in the explore log after a fight; export a browser transcript, replay it headless, compare `canonical()`. | Hidden nested actions, lost blow, browser/CLI parity | `KYRIE_BROWSER`, nightly |
| **6 Non-privileged journeys** | A driver that sees only rendered text and choice labels: no `/eval`, no ids, no generator report. Given a goal phrase ("find the willow bark"), it must reach the outcome within a step budget on fresh seeds. A transcript is kept for replay. | Discoverability; also the playtest-infrastructure privilege (`play-server.ts:122` `/eval`; `inspect()` exposes internal ids) | nightly |

**Specific missing regressions for the independent review's defects (all generalised):**
1. Kill an NPC **through combat** mid-conversation, across seeds: no `talk_to`, `ask`, `take_leave` or `tell` for that group remains, and no voiced line.
2. Take every takeable item: no observation names it at its old place.
3. Operate every two-state mechanism both ways: no text mentions a direction contradicting the resulting state. This needs an authored direction fact, or a lint that `State` texts do not narrate motion.
4. Rout or kill every group with routines: no rule with a `say` text fires for it afterwards, and no observation places it at its post.
5. Menu leaves equal `offered()` (Tier 5).
6. Reading an inscription asserts only facts the observation declares, and the journal line for a `tells` claim is attributed.
7. The last combat event is present in the post-fight entry.

---

## H. Mission 15 recommendations

**Immediate correctness repairs (essential, small):**
1. Put frontier expansion inside the recorded command (F-01), share it with the CLI, and add the cross-process replay test.
2. Defer resolvers of deferred actions (F-04).
3. Fix `deep-argument.ts`'s cross-purpose leak (F-07). Even before migration, select text by purpose.
4. Ungate deep-document text from `knows(history_successors)` (F-05, smallest part).
5. `Telling.silent` should read `able()` (F-06).
6. Pin Deem and languages, and stamp versions into saves and transcripts (F-10, F-11).
7. Make `bin/kyrie lint` exit non-zero for errors in any campaign, and resolve `data/rules` independently of the cwd (§E-bis). These are one-line-class fixes that unblock CI for every external author.
8. Validate hazard effect strings against the catalog at lint (§E-bis: they currently lint clean and crash in play).

**Architectural boundary corrections:**
1. Module namespacing and shadowing against the stdlib, with a rules version (F-02). Make the two independent adventures permanent CI fixtures.
2. A declared engine vocabulary (F-12).
3. Move `deep-argument`, the origin binders, the campaign registry and the default party into data (§D order).
4. A catalog owned by the module rather than global `Canon` (F-08).

**Authoring language and CLI:**
1. A `tells`/`teaches` split for knowledge; rules allowed to teach (Thrume F1, F5) through a sanctioned `Learn` effect that goes through `Perceptions`.
2. Conditional effects (`If … { } Else { }` inside effects), `Every N watches`, `Ending`.
3. Lint: mobile entity names in unconditional prose; `able` without `acting`; reachability that counts rule-written `at`.
4. `kyrie new module|situation|item-kind|table` scaffolds that write a manifest, a `.kyr` skeleton and a playable test. They can be built cleanly on `ModuleWriter` (`src/lang/module-writer.ts`) and the bundle layout; nothing in the kernel prevents them.
5. `kyrie play --text <module>` against a minimal harness campaign, so an author can play a module in isolation.

**Structural work to undertake carefully:**
1. Make the transition model an explicit, ordered pipeline object, `complete()` → named phases with typed outputs, so its 15 steps are documented and testable phase by phase. **Do not** convert it to an event-sourced reducer; command sourcing is adequate once F-01 is fixed.
2. Collapse the `quantity` two-way sync into one owner.
3. Runtime entity creation (HTG #14, Thrume F4): design first, since it touches namespacing, saves and the planner.

**Defer explicitly:**
- a universal reaction bus;
- positional combat;
- full Orsino parity;
- a rewrite of the World/fact store;
- any React-side state model;
- historical simulation beyond turning `history_*` into structured facts.

---

## I. What should not be rewritten

- **`World`** (`src/lang/world.ts`): immutable, copy-on-write per relation, memoised, an existential solver with negation. Small, fast, correct in every probe. Keep it.
- **The checkpoint/rollback coordinator** (`Campaign.execute*`): atomicity across three stores works. Refactor it into named phases; do not replace it.
- **`PlaySession` plus transcript plus `canonical()`:** the right abstraction for parity and replay. Extend it to cover installs rather than adding a second mechanism.
- **Identity-keyed randomness** (`RandomStreams`, `dice()` by hash): genuinely good design. "Giving someone rope changes nothing else" is real. Only the occurrence counting needs a cheaper implementation.
- **On-demand grounding** (`Operators`): one applicability test for the player, NPCs and the UI. This is why the UI cannot offer illegal actions.
- **The Kyr surface and its lowering** (`Thing/State/Change` → `change_thing`; `Hazard`; typed effects in the catalog). Two independent adventures were built on it without engine edits.
- **The module bundle, imports and roles, namespacing** (`m__id`), and `WorldAssembler`'s scenario-manifest placement. These are the right shape for hundreds of adventures. Add stdlib shadowing; keep the rest.
- **Mission 14's deep-site expander** (`deep-layout`, `deep-mechanisms`, `deep-rivals`, `deep-time`, `deep-pacing`), with its data in `data/generation/deep/*.json`: generic machinery with declared data. Only `deep-argument.ts` needs to move.
- **`KeptGame` and `SaveCodec`** (the world kept once by content key, state as a diff, gzip): a sound browser persistence design.
- **The repaired Kyr rules** from the player review (`conversation_falls`, `conversation_breaks`): the right kind of fix, in the stdlib. Generalise them; don't revert them.

---

## J. Limitations and uncertainty

- **Reviewed commit:** 422a4c8 only. `origin/main` advanced to `4ecc0e8` during the review. I did **not** re-check that state, so every finding is marked against 422a4c8, and anything later is **unverified**.
- **Dependencies:** Deem and languages were taken at their remote HEAD (967deac, 30d36c6). The builder's local checkouts may differ (F-11), so generation results may not match the builder's.
- **Test result at 422a4c8:** `bun test --parallel --path-ignore-patterns='test/deem-choice-space.test.ts'` (that is, `test:fast`) gave **602 pass, 22 skip, 0 fail, 14,111 `expect()` calls, 624 tests in 129 files, 947.5 s**, on 4 cores shared with the probes and agents.
  - The 22 skips are the environment-gated suites (`KYRIE_BROWSER`, `KYRIE_LONG`, the Orsino pin).
  - The Deem "Error evaluating expression" traces in the log come from tests that expect generation errors.
  - The 608-process `deem-choice-space` proof was not run.
  - The documented 18 s tier was measured on 16 cores on 2026-10-20. Even allowing for 4 cores and contention, 947 s is far from it.
- **Not executed:**
  - the browser suites (`KYRIE_BROWSER`) and `KYRIE_LONG`;
  - two concurrent campaigns (F-08);
  - an interrupted search (F-04);
  - the silenced deep document after a song (F-05, second half).
- **Independent-review defects** were checked against source and fix commits, not replayed in the browser.
- **Probes** used production classes from a script outside the repo (`scratchpad/probes/probe1-3.ts`). Probe 2 imitates the host's expansion call rather than running the worker.
- **Mission 14 execution logs** were not available, so I make no claim about how the builder's day divided between runtime and agent orchestration. The measurements in F-13 and F-14 are process costs only.

---

## Final question: what I would insist on now

1. **One record of causality.** Everything that changes what exists goes through `PlaySession.perform`: the frontier, installs, and anything a host does. It is proven by a cross-process `bin/kyrie replay` test on a multi-region transcript, and every save and transcript is stamped with the engine, rules, content, Deem and languages versions. This turns every bug report into a reproducible artifact, and it makes "content changed: replay onto new content" possible.
2. **Modules that survive the standard library growing.** Local names shadow stdlib names, modules declare a rules version, the engine's reserved vocabulary is a declared table, and Thrume and The House That Grows are permanent CI fixtures. Without this, every mission silently breaks the only independent evidence that Kyr works.
3. **Fiction maintained by semantics, not by edits.** Three general constructs make whole defect classes lint- or property-testable instead of fixed one sentence at a time:
   - `acting(group)` as the stdlib's definition of who is still in the story;
   - prose that names a mobile entity must be conditioned on it;
   - a `tells`/`teaches` split, so sources make claims and the company establishes facts.
4. **Honest tooling for outsiders.** A lint exit code that fails on errors, all errors reported with true source spans, rules resolved from the install, and a narrated `kyrie play --script` (the authoring exercise's 60-line driver).
5. **Move the one privileged story into data** (`deep-argument.ts`), with byte-identical output first, then correct per-purpose text.

Everything else (tables that create entities, runtime people, conditional effects, endings) is the next language work. The five items above make each of those cheaper and safer to add. None of them requires rewriting `World`, the coordinator, the grounding planner or the Kyr surface, which are the parts of this codebase that are already right.
