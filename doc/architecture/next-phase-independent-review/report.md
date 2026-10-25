# Kyrie: independent architectural review, next-phase readiness

Written for the project owner, who will decide what (if anything) to pass to the builder. This review has not been
shared with the builder, and it does not comment on the builder's work anywhere else.

---

## 0. Snapshot, isolation and method

| | |
|---|---|
| Repository | `jweissman/kyrie` |
| Reviewed commit | `483e3af58171e19418b292d013b388c30d93b14f`: "What only the engine writes is one list, so lint no longer calls an action waiting on a recruit impossible", 2026-10-25 15:54:22 −04:00 |
| How `main` was established | `git fetch origin main` at the start of the review. `origin/main` was force-updated from `422a4c8` to `483e3af` at that fetch. I did not chase any later commits. |
| Review branch | The session can push only to `claude/youthful-cori-a0rqup`, so the review is committed and pushed there. That branch was created from `483e3af` and carries only review artifacts. A local branch, `review/next-phase-architecture-2026-10-25`, points at the same base, but it is not pushed: the session is not authorised to push other branch names. Nothing was merged. No PR, issue or comment was made. `main` was not touched. |
| Dependencies | `deem` at `967deac` and `languages` at `30d36c6`, which are the pins in `package.json` and also each repository's HEAD. They were cloned anonymously, because this sandbox's proxy refuses GitHub's tarball API (403), so `bun install` from the pins failed. They were linked by a temporary `file:` edit to `package.json` that I reverted before committing. `package.json` and `bun.lock` are unchanged. |
| Environment | Linux, 4 cores, 15 GB, Bun 1.4.4. The builder's documents were measured with Bun 1.4.3 on WSL2. |
| Evidence | Code reading of the execution paths. Five probe programs of my own (`probes/*.probe.ts`), plus probes by three delegated read-only investigators (`probes/agents/`), each finding re-checked as noted. The full suite, two bounded benchmarks, and a save-growth measurement. Raw outputs are in `evidence/`. |

**Confidence labels:**
- **reproduced**: I ran a program that shows it.
- **code-path verified**: I traced the path end to end but did not execute it.
- **strongly supported**: inferred from code and data.
- **speculative**: a reasoned expectation only.

Where a finding comes from a delegated investigator and I did not re-run it, I say so.

**The prior evidence.**
- I read `doc/architecture/mission-14/arch-review/kyrie-architecture-review-422a4c8.md` (F-01 to F-15), the Mission 15 ledger, `performance.md` and `time.md`.
- The ledger's table of F1 to F9 cites `doc/architecture/mission-15/independent-audit-2026-10-25/report.md`. **That file does not exist at 483e3af, and no commit ever added it** (`git log --all -- '*independent-audit*'` is empty). So I reconciled F1 to F9 against the ledger's own one-line descriptions and the code. That audit's own evidence could not be checked.

---

## 1. Executive review

**Verdict.**
- The kernel is sound and getting sounder.
- The architecture can carry a much richer RPG without a rewrite.
- It cannot do so safely in its present state. Two kinds of problem stand in the way:
  1. **Whole-world validation at installation time.** It turns ordinary play into permanent dead ends.
  2. **A small number of semantic boundaries** that every new feature in the next phase will lean on:
     - who knows what, per member and per source;
     - what one module's actions apply to;
     - which state counts as the game and which as its telling;
     - what a save is compatible with.

**What is genuinely good, and should be preserved:**
- **An honest execution model.**
  - Immutable copy-on-write `World` facts.
  - One coordinator (`Campaign`) with a checkpoint that covers the world, creatures, state, module and definition.
  - Commands are legal only if offered, and command-transcript replay is the reproducibility mechanism.
  - This is command sourcing with snapshot saves, not event sourcing, and it does not need to be event sourcing.
- **Replay has been made real since the last review.**
  - Frontier expansion now runs inside `PlaySession.perform` (`src/session/play-session.ts:96`), and a failure after execution undoes the command whole (`:99`, `Campaign.undo`).
  - The wren journey reproduced the documented canonical, facts and told hashes exactly, on a different machine and Bun version: `5eae0f91…`, `2693c779…`, `6926d284…` (evidence/journey-wren.txt). That is cross-process, cross-machine determinism, **reproduced**.
- **Kyr really is the authoring medium.**
  - Four substantial adventures ship in `data/adventures/` with no adventure-specific TypeScript: Thrume, The House That Grows, Let One Remember, and The Long Man.
  - Module-local relations, measures, queries, actions and rule ids are namespaced (`ModuleNamespace`).
  - A shadowing pass (`ModuleShadow`) now protects modules when the shared rules later grow a name they already used. My hostile probe confirmed local names are isolated in both installation orders (§3, C1).
- **Performance work has been real and measured, not cosmetic.**
  - wren headless: 80 commands a second for the simulation alone and 30 for the session.
  - Through the engine: p50 49 ms, p99 274 ms, worst 402 ms (evidence).
  - The prior review's per-firing world snapshot (F-13) is gone.

**What is unsafe or structurally limiting** (each covered in §3):
1. **Learning a fact can permanently block later border crossings** (A1, critical, reproduced).
   - Every mid-play installation re-validates the *whole* world's knowledge.
   - Every generated world I checked has 9–10 facts that an ordinary observation teaches without their being `established`.
   - Once the company has learned one of them, every later march crossing fails: "Invalid initial knowledge". The step is offered, refused, and undone, every time. Long-range travel, the frontier and every future mid-play installation (a campaign joining a world in play) depend on this path.
2. **A module's actions apply to the whole world, not to the module's own places** (C2, high, reproduced).
   - Composition isolates *names* but not *scope*.
   - With two modules installed, each module's "Ring the bell" was offered in the other's yard. The player saw two identically worded choices (the audit's F7, still present).
3. **Knowledge is one bit per company** (D1, high).
   - A recruited companion's knowledge is stranded.
   - Topics teach facts their speaker does not know.
   - Observations near a variable never teach (the audit's F5, still present).
   - This is the main obstacle to deep companions and investigation.
4. **Presentation is inside the authority boundary in both directions** (B1, medium–high).
   - The simulation imports presentation code to decide perception, and therefore `knows`, and to read the clock.
   - The authoritative log stores rendered prose, which telling later reads back.
5. **Module-local kinds of thing still live in process-global catalogs**, swapped on every `campaign.world` read (B2, medium).
   - Kind ids, and canonical entity ids such as goods, are one world-wide namespace.
   - Two independent authors who pick the same kind id cannot be installed together. This surfaces as a runtime installation failure, not a lint error.
6. **Saves carry no engine, content, rules or dependency version**, and embed the compiled module, 2.1 MB in wren (G1, medium).
   - The event log grows about 6.3 kB per command, 62% of it receipts.
   - Content fixes never reach a game in progress, and nothing detects a transcript replayed against changed content.
7. **A new player cannot find three of the four authored adventures** (E1, high for product).
   - The title page's Begin starts a generated world, and only The Long Man is placed in one.
   - The others are under `?dev`.
   - Where an authored country *is* placed, the march-stone that should point to it can name a different country (E2, reproduced by the navigation investigator).

**Next-phase readiness in one line.** Fix A1 and settle four boundaries before building cities, companions and
multi-campaign worlds:
- what a module's action ranges over;
- knowledge per member and per source;
- the game record versus its telling;
- save compatibility.

None of these is a rewrite. Each is a local change to an interface that is already almost right.

---

## 2. Current architecture map (as executed at 483e3af)

```
 web/reader (React page) ──postMessage──► web/engine/engine-worker.ts (onmessage = async receive; NOT serialized)
                                              │
                                    EngineHost.handle(request)
       perform ─► PlaySession.perform ─────────┤   checkpoint ─► session.checkpoint(true)  (no acting guard ✱)
                    │ busy guard                    keep() after each frame (setTimeout) ; ahead(): Frontier.prepare
                    ▼                                                (parse-ahead with LocalKinds.aside ✱global)
             PlayerView.resolve(id ∈ Campaign.offered())
             Campaign.executeAsync ── checkpoint{world, creatures, current, compiled, definition, log length}
                    │  Battle (leases; controller awaits page) → complete():
                    │   settle (Mercy, award, Membership.enlist/inter ✱ mutates CampaignState in place, field resolvers)
                    │   apply success|failure (World.apply + commitMoney back-sync) | Journey.depart (deferred)
                    │   refresh → Projection (CreatureStore → creature facts)
                    │   WatchLoop.pass: advanceWatch → clock facts (✱ imports presentation/FictionalTime, Calendar)
                    │                   CampaignTick.npcs (planner) → CampaignTick.rules (authored order, one pass,
                    │                   idle rules skipped by World stamps) → hazards, pressures, Engagement, Interruption
                    │   shelter (deferred resolvers: rest, interruptible search) ; receipt (if causal)
                    │   Perceptions.settle → knows/witnessed (✱ uses presentation/LocalObservations)
                    │   log.push(CampaignEvent)                         catch → rollback (all five parts)
                    ▼
             expander.expand (Frontier: WorldAssembler.beyond → Campaign.install ×N → road link)
                    │   install → ModuleBundle.load → ModuleShadow → ModuleNamespace → ModuleInstallations.prepare
                    │            → validate whole joined module ; Discovery.validate(WHOLE WORLD knows) ✱ A1
                    │   failure → Campaign.undo (whole command)
             Telling.tell → campaign.told(voiced) ✱ presentation text written into authoritative log
             steps.push({command, combat})       ← transcript = the causal record
                    ▼
 EngineHost: PlayTranscript entry (page log), ScreenModel.build, Narrator.leaf, KeptGame.split → SaveCodec.pack
```

**True state owners:**

| state | owner | written by |
|---|---|---|
| facts and measures | `World`, immutable; held by `CommittedWorld` in `Campaign` | `Campaign.commit` (all sub-services through `commitWorld`), projection |
| bodies, inventory, hp, conditions | `CreatureStore` (leases in combat) | `Battle`, `FieldResolver`, `FieldUse`, `Mercy`; back-synced from `quantity` by `commitMoney` |
| company membership, inhabitants, elapsed, pending NPC undertakings | `CampaignState` (`current`) | edited in place by `Membership`, `advanceWatch`, `CampaignTick.npcs` |
| compiled module and campaign definition | `Campaign.compiled` / `definition` | `install` only (between commands, or inside the expander window) |
| item and species kinds | **process-global** `Canon` / `ItemCatalog`, swapped per campaign | `LocalKinds` (from parser, bundle, campaign read) |
| event log, receipts, perceptions as text, voiced lines | `Campaign.log` | `complete`, `Telling` through `told` |
| transcript | `PlaySession.steps` | `perform` only |
| page log (last 80 entries), summary | `EngineHost` | after each frame |

**Dependency directions** (import counts between areas: evidence/deps.txt):
- Healthy:
  - `lang` does not import `campaign`;
  - `ui` and `presentation` do not call writers;
  - `world` (the generator) writes Kyr source and calls `Campaign.install` only through `Frontier`.
- Inverted:
  - `campaign → presentation` (6 imports: `LocalObservations`, `FictionalTime`, `Calendar`);
  - `lang → canon/LocalKinds` (the parser installs into global catalogs);
  - `rules → campaign` (`Checks → PartyCapabilities`).
- Engine-wide reserved vocabulary is still four lists, not one:
  - `module-compiler.ts:80`;
  - `module-installations.ts:93`;
  - `module-assembly.ts:52`;
  - `engine-writes.ts`.

---

## 3. Ranked findings

These are ranked by architectural significance and next-phase risk. Each entry gives severity, confidence, location,
a failure scenario, the violated invariant or missing capability, the smallest repair, the regression risk, and
whether it blocks the next phase.

### A1 · Critical · reproduced · A fact once learned blocks every later installation

- **Where:**
  - `src/information/discovery.ts:95-113`: `Discovery.validate` throws "Invalid initial knowledge" for any `knows` in the world whose fact is not `established`.
  - It is called from `ModuleInstallations.check` (`src/campaign/module-installations.ts:123-125`), which runs when an installation is checked.
  - The frontier checks the road link with `checked = true` (`src/world/frontier.ts`, the final `campaign.install` of `expand`).
- **Scenario** (`probes/crossing-knowledge.probe.ts`, evidence/crossing-knowledge.out):
  1. Seed a1, frontier attached as the browser attaches it, walking only by offered `go` choices.
  2. The company crosses east (25 modules), then notices the Flow philosopher's glance in the disputation going-on. The observation `teaches glance` (`data/goings-on/disputation/situation.kyr:36`), and `glance` is never `established`.
  3. The offered step onto the north march-stone then throws "Invalid initial knowledge". The command is undone; this is correct, F3 having been repaired.
  4. A second attempt fails identically. **The player is permanently unable to cross that march.** In this world it leads to The Long Man's country.
- **How common** (`probes/taught-unestablished.probe.ts`, evidence/teach.out):
  - Per world, 9 facts (a1), 9 (thorn) and 10 (wren) are taught by observations but not established. Among them are the zone-mapping facts (`region__z2_mapped`…), the deep-site rival and bane facts, and `drover__dog_mud`.
  - Learning any one of them poisons every later checked installation.
- **Invariant:**
  - What the company learns in play must never invalidate the world for later composition.
  - Validation of a new module should be about what the module brings.
- **Repair:**
  - Validate only the incoming module's sources and initial knowledge (pass `imported` or the module's own ids), not the whole world's `knows`.
  - Then decide the real rule: either `teaches` requires `established` at compile time (lint and compiler) or it does not; and enforce it at the point of teaching.
  - Add a spec: learn each taught fact class, then cross a march.
- **Regression risk:** low. The repair narrows a check. The decision about the established rule may surface authored facts that need `established`.
- **Blocks the next phase:** **yes.** Long travel, new entry points, and every future "a campaign joins a world in play" path go through mid-play installation.
- **Note on the investigator's report:** it called the Long Man "half-installed". That was an artefact of calling `Frontier.expand` outside `PlaySession.perform`. Through the session the undo is whole; I verified this: `installed` stays at 25.

### C2 · High · reproduced · Module actions range over the whole world; distinct actions share one wording

- **Where:** `ModuleNamespace.action` (`src/campaign/module-namespace.ts`) scopes an action's id and its constants, but a typed parameter (`site: place`) is grounded over every entity of that type in the joined world (`CampaignGrounding`, `Operators`).
- **Scenario** (`probes/composition.probe.ts`, evidence/composition.out):
  - Two independently written modules each declare `Relation rung(place)`, an `Action ring(actor, site: place) "Ring the bell"`, and a rule `answered`.
  - Local relations stay apart in both orders (`bells__rung` and `chimes__rung`), and each module's rule fires only on its own facts.
  - But at the bells yard the player is offered both `bells__ring(party,bells__yard)` and `chimes__ring(party,bells__yard)`, both reading "Ring the bell".
  - Choosing the second writes `chimes__rung(bells__yard)`: one module's mechanic now operates in another module's place.
- **Today's content:**
  - Every action in the authored adventures' files that parse on their own pins a module constant in `Requires`, checked by a script; none is unconstrained. Three House That Grows files (`annex`, `attention`, `keel`) could not be parsed alone (see B2), so they were not checked. So the leak is latent in today's content.
  - It becomes live as soon as authors write reusable mechanics (pray at any shrine, search any shelf), or two campaigns share a city.
- **Invariant:** a module's authored behaviour applies within its own scope unless it exports it. Two distinct offered actions are distinguishable to the player.
- **Repair:**
  - Give each installed module an implicit scope: places within its own entities, plus places it imports. Typed parameters of a module's own actions range over that scope by default.
  - Add an explicit `Action … anywhere` (or an export) for the deliberately global case.
  - Lint and runtime: two offered choices with identical wording at once is an error, or is disambiguated by the module's name.
- **Regression risk:** medium. The generated kits may rely on world-wide actions. Run the descents and the four adventures' full plays as the oracle.
- **Blocks the next phase:** yes, for a shared starter city and multi-campaign worlds. It does not block single-campaign play.

### D1 · High · reproduced (investigator), re-checked by code · Knowledge is one bit per company; companions cannot hold, share or be asked for it

- **Where:**
  - `knows(group, fact)` has no member argument.
  - `Membership.enlist` empties the recruit's group (`src/campaign/membership.ts:35-45`). The generic `ask` and `tell` actions need an `able`, present informant (`data/rules/discovery.kyr:37-62`), so a companion can never be asked.
  - Topics add `toldBy` but never require `knows(speaker, F)` (`src/lang/module-parser.ts:282-307`).
  - An observation near a variable is perceived under an id like `obs@entity` (`src/presentation/local-observations.ts:72-81`). `Perceptions.witness` matches the bare id (`src/campaign/perceptions.ts:15-17`), so its `teaches` is silently dropped (the audit's F5). A fixed-place observation with an unbound `{?x}` passes compile and lint and prints "?x".
  - Provenance (`readIn`, `witnessed`) is recorded only for facts not already known, so corroboration is unrepresentable.
- **Scenario** (`probes/agents/knowledge/probe-dialogue.ts` with `fx/`): Ola teaches `murder_fact` while `knows(ola, murder_fact)` is false, and the company records it as told by Ola. A clue observation on a lamp never teaches. A recruited witness can never be asked what they saw.
- **What is now fixed:** the prior F-05 symptom is gone. A deep document re-read after its fact is known now shows its text (`src/world/deep/deep-history.ts:52-54`).
- **Missing capability:**
  - knowledge per member;
  - testimony bound to what the speaker knows;
  - claims as distinct from established facts (`belief.kyr` exists for NPCs but is used by one going-on only);
  - provenance per source.
- **Smallest repair, in order:**
  1. Fix the `@`-id match in `witness` and reject unbound `{?x}`. These are bugs.
  2. Have enlisting copy the recruit's `knows` to the company. Let `ask` reach a member through `joinedAs` and `awake`.
  3. Have Topics that teach F implicitly require `knows(speaker, F)` (or warn in lint).
  4. Record `heard(group, claim, source)` alongside `knows`, using `belief.kyr`'s claim kind. Do not build a full epistemic logic.
- **Regression risk:**
  - Step 1: low.
  - Step 3: will surface authored topics whose speakers were never given the fact. That is the point.
- **Blocks the next phase:** yes, for deep companions and investigation. It does not block travel.

### B1 · Medium–High · code-path verified · Presentation inside the authority boundary, both directions

- **Where:**
  - `src/campaign/campaign-tick.ts:2-3,12`, `perceptions.ts:1` and `interruption.ts:3` import `presentation/LocalObservations`, `FictionalTime` and `Calendar`. What the company perceives (`LocalObservations.perceives`) decides `knows` and `witnessed`: authoritative facts.
  - In the other direction, `PlaySession.perform` writes `Telling` output into the last log event (`campaign.ts:196`, `play-session.ts:98-101`). Perceptions are logged as rendered text. Telling's "not said again" and the narrator's "seen before" read that text back.
- **Scenario:**
  - An edit to `LocalObservations`, made for presentation reasons (for example, whether a room's darkness hides a line), changes `knows`, and therefore replay, without touching any rule.
  - Editing the voice tables changes what a resumed game will repeat.
- **Invariant:** what the company is told is derived from the game record; the game record is not derived from what was told.
- **Repair:**
  - Move perception (who perceives what, from where) into `campaign/` as a rules-side module. Presentation keeps only rendering.
  - Log `(line id, bindings)` instead of rendered text, and render at view time.
- **Regression risk:** low to medium. The hashes from `journey-profile` are the oracle.
- **Blocks the next phase:** should be fixed while building richer dialogue, because every dialogue feature will add to both directions.

### A2 · Medium · reproduced · A checkpoint taken during a crossing is internally inconsistent

- **Where:**
  - `PlaySession.perform` awaits the expander after `executeAsync` returns and before the step is pushed (`play-session.ts:96-100`). In that window `Campaign.save` is permitted, because `executing` is false and no leases are held.
  - `EngineHost.handle('checkpoint')` (`web/engine/engine-host.ts:62`, the page's Download) does not consult `session.acting`.
  - The worker does not serialize requests (`engine-worker.ts`: `onmessage = async receive`).
- **Scenario** (`probes/checkpoint-race.probe.ts`, evidence/checkpoint-race.out):
  - A checkpoint taken in the window holds 1 event but 0 transcript steps. The resumed save stands in the hall; a replay of its transcript stands on the rim.
  - If the expansion then fails, the command is undone, but the checkpoint taken in the window keeps it (2 events against the session's 1).
  - The window is a whole march crossing (1.2–2.1 s by the builder's measure).
- **Repair:** `PlaySession.checkpoint` refuses (or waits) while `busy`. Serialize the worker's requests through one promise chain.
- **Regression risk:** negligible.
- **Blocks the next phase:** no. Fix it in passing; it gets worse as more async work enters a command (strategic actors, streamed generation).

### E1 · High (product) · code-path verified (investigator), re-checked · Authored adventures are not reachable by a new player; entry points are not a concept

- **Where:**
  - The title page offers Continue and Begin; Begin starts a generated world (`web/reader/title-page.tsx:20-22`, `reader-opening.ts:118`).
  - Named campaigns are listed only under `?dev` (`title-page.tsx:31,37-45`).
  - `data/adventures/countries.json` places only The Long Man, beyond a north march of mountain or forest.
  - Thrume, The House That Grows and Let One Remember have no placement and no rumour carrier.
- **Product verdict:** the experience the brief describes (discover an adventure and travel to it) exists for exactly one adventure, and no test exercises it.
- **Missing capability:** an *entry point*. An adventure says where it can attach (a march side, a settlement, an institution), its pitch, and who tells of it. `Countries` is a narrow special case of this.
- **Repair:**
  - Generalize `Country` to `EntryPoint { attach, pitch, carriers }`.
  - Use the existing rumour machinery (`RegionWriter.carriers`) to tell of it.
  - Add one test that plays from Begin, by offered choices only, to an authored adventure's first scene.
- **Blocks the next phase:** yes, for "campaign entry points in a starter city".

### E2 · High · reproduced (investigator; not re-run by me) · March-stones can name the wrong country

- **Where:**
  - `WorldAssembler.beyond` rewrites what lies beyond only for region (0,0) (`src/world/world-assembler.ts:143`: `at[0] === 0 && at[1] === 0 ? … Countries.beyond(region)`).
  - `Frontier.fits` places an authored country beyond a march of *any* region.
- **Scenario** (`probes/agents/navigation/probe3.ts`): seed a1. Region x1y0's north stone reads "…into Loxorloew, fen country", but the country installed beyond it is Merrowdale.
- **Invariant:** one answer to "what lies beyond (region, side)".
- **Repair:** one function, used by both the stone's text and the frontier.
- **Regression risk:** changes generated text for affected seeds.
- **Blocks the next phase:** yes, for any directional affordance.
- I verified the line in `world-assembler.ts:143` myself. The probe's walk was done outside the session; its conclusion does not depend on that.

### C1 · Medium · reproduced · Kinds and canonical entities are one world-wide namespace; collisions are runtime failures

- **Where:**
  - `LocalKinds.merge` and `same` (`src/canon/local-catalog.ts`) refuse a kind id declared differently by two modules.
  - `ModuleInstallations.admit` refuses a canonical-type entity (`good`, `itemkind`…) declared differently ("Duplicate entity").
  - Module-local relations, actions and rules *are* namespaced, and the probe shows that works in both orders.
- **Scenario** (`probes/composition.probe.ts`):
  - Two authors each declare `Kind brass_bell` with a different worth: "declared differently by two modules", and the campaign does not start.
  - Two authors each declare `Entity salt: good` with different names: "Duplicate entity salt".
  - In a frontier world, the same collision would surface as a failed crossing, undone: a dead end like A1.
- **Invariant:** independently authored modules can coexist unless they explicitly share.
- **Repair:**
  - Namespace local kind ids like relations (`bells__brass_bell`), with an explicit `exports kind` for shared ones.
  - Lint the whole library together in CI: every authored adventure, plus a sample of generated worlds, installed into one campaign.
- **Blocks the next phase:** before multi-campaign worlds. It does not block one campaign.

### B2 · Medium · code-path verified · Module kinds still live in process-global catalogs, swapped by reads

- **Where:**
  - `LocalKinds.claim` is called from `CommittedWorld.of` (`src/campaign/committed-world.ts:20-22`), so *reading* `campaign.world` can rewrite `Canon.items`, `Canon.species` and `ItemCatalog.definitions`.
  - 31 source files read those globals directly.
  - The parser itself installs kinds (`catalog-parser.ts:65`, `module-parser.ts:90`). Whether a file parses depends on what was parsed before: HTG's `annex.kyr` alone fails "ithren_lamp, which is no kind of item", and the parse cache is keyed by text alone.
- **Status:** the audit's F1 is partly fixed, as the ledger itself says. Sequential games no longer steal each other's kinds (`test/campaign-isolation.test.ts`, `test/local-isolation.test.ts`).
- **Scenario** (strongly supported, not reproduced): two campaigns in one process with interleaved async commands (a test harness, a future server, or two campaigns sharing a world). A resolver in A reads `ItemCatalog` after B's world was read during A's combat await.
- **Repair:** resolve kinds through the compiled module (`module.catalog`, which exists) and pass a catalog view to `Content`, `Items`, the screen and the handbook. Make parsing pure, with kinds resolved at compile time.
- **Blocks the next phase:** design it before strategic actors or a shared world. It can wait for a single-campaign phase.

### G1 · Medium · reproduced (sizes) · Saves have no compatibility story and grow with the log

- **Where:** `Campaign.save` (`src/campaign/campaign.ts`, `version: 1`). It embeds `module` and `definition`, and records no engine, content, rules or dependency version. `KeptGame` adds its own `version: 2` envelope, also without content hashes.
- **Measured** (`probes/save-growth.probe.ts`, evidence/save-growth.out; wren, 334 commands):
  - The checkpoint grows from 4.36 to 6.62 MB:
    - module 2.1 MB, fixed;
    - world 1.6–1.8 MB;
    - events 0 to 2.1 MB, about 6.3 kB a command, of which receipts are 1.3 MB;
    - transcript 34 kB.
  - Taking and stringifying it: 24 to 45 ms. `journey-profile`'s save: p50 21, worst 150 ms.
- **Scenario:**
  - A content fix to Thrume never reaches a game in progress.
  - A transcript saved before a content change replays to a different game, silently, or fails mid-way.
  - A three-thousand-command campaign carries about 20 MB of log.
- **Invariant:** a save and a transcript say what they are compatible with. The causal record (transcript) is small, and derived records are bounded.
- **Repair:**
  - Stamp saves and transcripts with engine, rules and content hashes plus the dependency pins, and refuse or warn on mismatch.
  - Keep receipts out of the save, or keep only the last N; they can be re-derived by replay.
  - Later, a "replay this transcript onto new content" path, now possible because F-01 is fixed.
- **Blocks the next phase:** the stamping should come before more campaigns are shipped. The size can be deferred.

### D2 · Medium · reproduced / code-path verified · Companion lifecycle has gaps

- **Recruited companions cannot be dismissed alive.**
  - `Membership` knows only `enlist` and `inter` (`membership.ts:26-57`).
  - `part_ways` and `send_off` act on *escorts* (`following`), a second, unrelated companion concept (`data/rules/people.kyr:45-64`).
- **A rule can retract `travelsWith` without changing `partyIds`** (the audit's F4, open per the ledger; the compiler's rule-write ban at `module-compiler.ts:80` omits it).
- **Burial does not retract `travelsWith` or `joinedAs`**, so a kin topic still speaks of the dead companion as present (`src/world/region-fellows.ts:153`, investigator). This is the audit's F6, partly fixed: dead speakers' own topics now disappear.
- **Repair:**
  - One companion lifecycle in `Membership`: enlist, part (alive), inter. Each writes and retracts the same facts.
  - Rules may not write `travelsWith` or `joinedAs`; they request a part through an action that resolves to `Membership`.
- **Blocks the next phase:** yes, for substantial companions with enduring commitments. It is small.

### E3 · Medium · code-path verified (investigator) · No travel over known routes; no transport services

- **Where:**
  - Every move is a single `go` to an adjacent place.
  - The only pathfinders are a test helper and a generation-time Dijkstra (`src/world/compose/geography.ts:114-125`).
  - `passage_fare` is declared (`data/rules/services.kyr:3`) and unused.
  - `enRoute` is written by `Journey` and read by no rule.
  - Let One Remember's voyage is hand-built from clocks.
  - March roads are a fixed "taking 2 hours".
- **What already exists:**
  - a place hierarchy with grid coordinates;
  - known versus visible ways (`visibleTo`, `revealedBy`, `seen as … until … named`);
  - the chart's known-ways graph (`ChartModel.ways`);
  - multi-watch `Journey`s that can be turned back.
- **Repair** (incremental, see §6):
  - "Travel to a known place": a command that plans over the known-ways graph and runs the legs as Journeys, stopping at any interruption.
  - A passage service: fare, schedule, and `enRoute` readable by rules.
- **Blocks the next phase:** yes, for a dense city and long roads. The base is right, so this is additive.

### H1 · Medium · reproduced (investigator), spot-checked · Tests prove scenes more than journeys

- **Counts** (`probes/agents/tests/*.txt`):
  - 58 test files write `at(party, …)` straight into a live session. The prior review counted 56.
  - About 75 files, holding about half the cases, inject state in some way.
  - 70 `as unknown as` casts across 50 files.
- **Still true from the prior review:**
  - Generated worlds are checked on 2–4 seeds.
  - `narration-audit` runs 2 seeds and excludes attacks, equipping and spells.
  - No test performs every offered choice.
- **Two vacuous passes:** `community.test.ts:151` and `wild-country.test.ts:103` return before asserting for their seeds.
- **No test:**
  - plays from Begin to an authored adventure;
  - completes The House That Grows;
  - lints the shipped adventures;
  - replays a long transcript through `bin/kyrie replay` (it is run for 3 steps only, in `drawn-replay.test.ts`).
- **Why it matters here:** A1, C2, E1 and E2 all coexist with a green suite (730 pass, 29 skip, 0 fail, 337 s here). A1 in particular needs only a journey that learns a fact and then crosses, which is exactly the kind of test the suite does not have.
- **Repair:** see §6, step 1.
- **Blocks the next phase:** the journey tier should exist before the next phase, because its features are cross-cutting.

### Lower findings (low, or deferrable)

- **L1. Reserved vocabulary in four lists** (`module-compiler.ts:80`, `module-installations.ts:93`, `module-assembly.ts:52`, `engine-writes.ts`). `EngineWrites` was consolidated for lint and audit (483e3af), but the compiler's ban differs from it. For example, `travelsWith` is "engine-written" to lint but writable by rules. **Repair:** generate all four from one table. The prior review's F-12, partly fixed.
- **L2. The ledger cites an audit report that is not in the repository** (§0). That is an evidentiary gap, not a code defect.
- **L3. The authored deep argument is still TypeScript** (`src/world/deep/deep-argument.ts:20-112`), emitted for every sealed purpose with the same grieving-brother content. The prior F-07, unchanged. It should become Kyr data over `belief.kyr` when investigation work begins.
- **L4. Two movement models.** `Spatial.lowerExit` and `validateMode` support exit modes that no data uses. Fold or delete them before districts are built.
- **L5. Map shows live truth about places left behind** (`company-map.ts:28-29`). Defer; memory of places belongs with D1.

---

## 4. Old-to-new reconciliation

**The 422a4c8 review (F-01 to F-15):**

| prior | now | evidence |
|---|---|---|
| F-01 frontier outside the command record | **Fixed.** The expander runs inside `perform`; replay draws the same country; failures undo whole. | `play-session.ts:96-99`; `drawn-replay`, `frontier-replay` specs; wren hashes reproduced cross-machine |
| F-02 shared-rule growth breaks modules | **Fixed** for relations, measures, queries and actions (`ModuleShadow`). Not for kinds or canonical entities (C1). | `module-shadow.ts`; composition probe |
| F-03 prose can describe state the world does not hold | **Partly.** Observations recompute each turn. Authored `when true` prose naming mobile things is still unlinted. | code; investigator K8 |
| F-04 resolvers before success | **Fixed.** Interruptible activities resolve in `shelter` after the loop. | `campaign.ts` `settle` and `shelter`; `interrupted-search.test.ts` |
| F-05 one-bit knowledge; silenced document | **Symptom fixed** (document text shows); **model unchanged** (D1). | `deep-history.ts:52-54`; investigator K4 |
| F-06 groups that leave keep satisfying rules | **Partly.** Conversation breaks generically; no `acting(group)` predicate; companion lifecycle gaps (D2). | `people.kyr`; D2 |
| F-07 `deep-argument.ts` | **Still present** (L3). | |
| F-08 global catalogs | **Partly** (B2). | `local-catalog.ts`, `committed-world.ts` |
| F-09 realistic tests bypass the journey | **Still present, slightly grown** (H1). | counts |
| F-10 saves embed the module, no evolution | **Still present** (G1). | save probe |
| F-11 unpinned dependencies | **Fixed.** Pinned by commit, with lockfile integrity. | `package.json` |
| F-12 reserved vocabulary undeclared | **Partly** (L1). | |
| F-13 O(state) per rule firing, O(history) per command | **Fixed** for the rule-firing snapshot (`CampaignTick.rules` commits the world itself). `RandomStreams.command` still scans history; its effect is small at measured lengths. | `campaign-tick.ts`; bench |
| F-14 CLI, cross-process and property gaps | **Partly.** `bin/kyrie replay` is run for 3 steps; cross-process hashes match; still no every-choice property test. | H1 |
| F-15 presentation keyed to labels and English; `voiced` in the log | **Still present** (B1). | |

**Mission 15 audit (F1–F9), as described by the ledger:**

| audit | ledger says | I find |
|---|---|---|
| F1 global catalogs | partly | **Partly.** Agrees with the ledger (B2), plus the new observation that reads swap globals and parsing depends on global state. |
| F2 open questions answered wrongly | done | Not re-probed. `test/query-answers.test.ts` passes. I found no counter-example; not independently verified. |
| F3 failed expansion commits | done | **Confirmed fixed:** undo is whole. A2 is a new adjacent window. |
| F4 rule ends travel, not membership | open | **Still open** (D2). |
| F5 observation instances lose teaching and binding | open | **Still open, reproduced** (D1). |
| F6 a dead speaker answers | open | **Mostly fixed**; kin-topic and burial gap remains (D2). |
| F7 distinct actions behind one wording | open | **Still open, reproduced** in the composition probe (C2). |
| F8 event and epistemic forms narrow | design boundary | Agrees; see D1 for the smallest extension. |
| F9 dependencies and verification | done | **Confirmed:** pins, CI with visible skips. |

**New since both:** A1 (critical), A2, C2's scoping half, E1, E2, G1's growth measurement, and B1's first direction (the
simulation importing presentation).

---

## 5. Next-phase blocker assessment

**Must fix before substantial new development:**
1. **A1.** Scope `Discovery.validate` to the incoming module, and settle the established-or-not rule for taught facts.
2. **C2.** A module's actions range over its own scope by default; no two offered choices may share one wording.
3. **E2.** One answer to what lies beyond each border.
4. **A journey test tier** (H1) that would have caught A1. Without it, the next phase's features will reproduce this class of bug.

**Should fix while building the next phase:**
- **D1.** Knowledge per member and per source; Topic speakers must know what they teach; the `witness` id bug.
- **D2.** One companion lifecycle.
- **B1.** Perception out of `presentation/`; the log stores line ids, not prose.
- **G1** (stamping only). Content, engine and dependency hashes in saves and transcripts.
- **E1.** Entry points as a concept, starting with the three unplaced adventures.
- **E3.** Travel to a known place; a passage service.
- **A2.** Refuse checkpoints while busy; serialize the worker.

**Worth designing for, not yet implementing:**
- **C1, B2.** Namespaced kinds and per-module catalogs, before more than one authored campaign shares a world.
- **Strategic actors** (§7): horizon-based scheduling over the existing watch loop. `time.md` already has the right proposal.
- **Log compaction:** receipts out of saves, a log in immutable pieces.

**Explicitly defer:**
- A general epistemic logic (belief revision, misremembering).
- Economic or geopolitical simulation.
- Bulk population aggregation.
- Event sourcing.
- Localisation.
- Safari measurement, until a tablet build is a goal.

---

## 6. Recommended sequence (dependency-ordered, with acceptance tests)

1. **The journey tier** (about a day). Specs that start from Begin (a generated seed) and act only through `PlayerView.choices`:
   1. learn every fact class taught in a region, then cross two marches;
   2. reach The Long Man's first scene from the start;
   3. save, restore and replay in a fresh process, with hashes equal;
   4. for 10 seeds, every offered choice of the first 30 places executes without throwing.

   *Acceptance:* (1) fails today with "Invalid initial knowledge".
2. **Installation validates what it installs** (A1). *Acceptance:* step 1's spec passes. Lint fails on an observation that `teaches` a fact which is neither established nor declared as hearsay.
3. **Module scope for actions** (C2), plus the identical-wording check. *Acceptance:* the composition probe offers one "Ring the bell" per yard. The four adventures' full plays and the descents keep their hashes, or differ only where a cross-module grounding was removed (diff reviewed).
4. **One border truth** (E2), then **entry points** (E1). *Acceptance:* every march-stone's text names the country the frontier installs, for 20 seeds; Thrume is reachable from Begin in at least one seed family.
5. **Knowledge per member and per source** (D1), with the companion lifecycle (D2). *Acceptance:*
   - a recruited witness can be asked what they saw;
   - a Topic whose speaker does not know its fact fails lint;
   - a variable-anchored clue teaches;
   - a dismissed living companion leaves `partyIds` and every company fact.
6. **Game record and telling apart** (B1), and **save stamps** (G1). *Acceptance:*
   - the wren hashes are unchanged after moving perception into `campaign/`;
   - a voice-table edit changes no `canonical()` hash;
   - a save from different content is refused with a clear message.
7. **Travel to a known place and a passage service** (E3). *Acceptance:*
   - "travel to the Guildhall" in a 100-room settlement runs as N journeys, interrupted correctly by a threat;
   - a ferry charges a fare, takes its scheduled time, and lets a rule fire while `enRoute`.

Steps 1–3 are small and should come first. Steps 4–7 are each one feature's worth of foundation, built as their features
need them.

---

## 7. Strategic actors and persistence beyond campaign boundaries (assessment only)

**Can they be additive?** Mostly yes, if C2, B2 and A1 are fixed first.

**What already exists:**
- Actors exist with goals, pursuits and horizons (`CampaignActor`, `Agency`, `Planner`).
- Pressures fall due on the clock.
- `ModuleInstallations.extended` lets one installation give goals to another's actor: a primitive form of cross-module relationship.
- Randomness is keyed by identity, so scheduling can be deterministic.
- `time.md`'s horizon proposal is the right execution model. Go to the next watch at which anything can happen, and use the watch-by-watch run as the oracle.

**The obstacles, in order:**
1. **Scope.** An institution's actions, written once, must not ground over every place in a shared world (C2).
2. **Identity and ownership.** Actors are module-scoped ids (`thrume__abbess`) with no exported role an unrelated module can refer to. They are referenced by import, and imports require a hard-coded `owner.export` path at installation (`ModuleBundle.imports`). A cross-module reference without hard dependency needs **role-based lookup**: "any installed `academy`" bound at install time, or late.
3. **Breadth cost.** Every actor and every rule of every module is asked every watch. That costs about 10 ms a watch at 104,000 facts today (`time.md`), and it grows linearly with modules. Strategic actors at their own temporal scale need the horizon scheduler, not more actors in the watch loop.
4. **Information propagation** needs D1's claims with provenance. Otherwise one institution's knowledge is either everyone's (`knows(party, …)`) or nobody's.
5. **Authored adventures must be protected from emergent change.** There is no declared boundary today saying which of a module's facts other actors may change. A module-level `exports` of relations (what others may read or write) would be the smallest such boundary. It mirrors the existing entity exports.

**What not to generalise yet:** do not build a diplomacy or economy simulation, and do not let strategic actors write
into authored modules' private relations at all. Start with exported relations and horizon-scheduled actors.

---

## 8. Performance and iteration (measured versus predicted)

**Measured here** (evidence/):

| measure | result |
|---|---|
| `bun scripts/sim-bench.ts wren`, layer A (simulation alone) | p50 5.5, p99 135, max 268 ms; 80 commands/s |
| `sim-bench`, layer B (headless session) | p50 26.7, p99 160, max 241 ms; 30 commands/s; heap 66–72 MB |
| `bun scripts/journey-profile.ts wren --every 400` | total p50 49, p90 105, p99 274, max 402 ms; engine p50 28; screen p50 13 (max 226); save p50 21 (max 150) |
| journey hashes | identical to the documented ones |
| checkpoint size over wren | 4.4 → 6.6 MB; take and stringify 24 → 45 ms |
| full suite, 4 cores | 337 s (730 pass, 29 skip, 0 fail) |
| the builder's tier table | "4 minutes" on their machine; consistent |

**Not measured here** (the builder's figures, not re-run): march crossings of 1.2–2.1 s; the frontier segment at 104,000 facts.

**Predictions** (speculative, labelled):

1. **First limit for a dense city:**
   - choice grounding (1,199 schemas in the frontier, mostly one per townsperson per conversation, per the builder's notes);
   - then the screen model (max 226 ms here, unprofiled since the first pass).
2. **First limit for more campaigns:** rule breadth per watch, and each installation re-validating the whole joined module (`ModuleInstallations.check`). The check is O(world) per installed module; A1 makes that scope a correctness issue too.
3. **First limit for long sessions:** the save, which grows with the log (G1). It is not urgent at a player's pace.

**Development feedback:** the inner loop is good.
- Single specs take seconds.
- `journey-profile` gives hash oracles in 33 s.
- `sim-bench` takes 24 s.

The gap is not speed but the absence of a journey tier (H1).

---

## 9. Answers to the specific boundary questions

**What should remain stable:**
- `World`: immutable facts, copy-on-write, stamps and lineage for derived caches.
- Offered-only commands, with `PlaySession` as the single host-neutral loop.
- Checkpoint and undo of the whole command, including installation.
- Command-transcript replay with identity-keyed randomness.
- The Kyr surface: Place, Passage, Thing, Person, Topic, Observe, Rule, Action, Pursuit, Discovery.
- `ModuleNamespace` and `ModuleShadow` for names.
- The rule that rules may not write `knows` or `established`.
- Observations recomputed from the live world each turn.

**What is too coupled:**
- `campaign` ↔ `presentation`, through perception and the clock text (B1).
- The parser ↔ global catalogs (B2).
- `ModuleInstallations.check` ↔ the whole world's discovery state (A1).
- The UI's label regexes ↔ the English of action names (the prior F-15).

**What is too implicit:**
- Which places a module's action applies to (C2).
- Rule order as meaning: one authored-order pass per watch, documented only in code comments.
- Four reserved-vocabulary lists (L1).
- `campaign.world` reads swapping global catalogs (B2).
- The worker's unserialized requests (A2).
- What lies beyond a border being decided in two places (E2).

**What is missing:**
- Knowledge per member and per source, with testimony bound to the speaker (D1).
- Module scope for actions (C2).
- Entry points (E1).
- Travel over known routes, and transport services (E3).
- Save and content compatibility (G1).
- A living-companion departure (D2).
- Cross-module references by role rather than by path (§7).

**What should not be generalised yet:**
- A full epistemic logic.
- Population aggregation.
- A transport *simulation* (a fare and a timed journey are enough).
- A plugin system for TypeScript mechanics: keep pushing mechanics into Kyr.
- Event sourcing.
- Cross-module rule writing.

**The smallest credible next-phase architecture:** §6's steps 1–3 now, then four foundations, each built as its feature needs it:
- entry points (E1, E2);
- knowledge per member and per source (D1, D2);
- the game record apart from its telling, plus save stamps (B1, G1);
- known-route travel with a passage service (E3).

---

## 10. Evidence index

All commands were run from the repository root at 483e3af, with the dependencies linked as described in §0.

| what | command | output |
|---|---|---|
| suite | `bun test --parallel` | evidence/suite-summary.txt: 730 pass, 29 skip, 0 fail, 337 s |
| simulation bench | `bun scripts/sim-bench.ts wren` | evidence/sim-bench-wren.txt |
| engine journey | `bun scripts/journey-profile.ts wren --every 400` | evidence/journey-wren.txt (hashes) |
| A1 | `bun doc/architecture/next-phase-independent-review/probes/crossing-knowledge.probe.ts` | evidence/crossing-knowledge.out |
| A1 prevalence | `bun …/probes/taught-unestablished.probe.ts` | evidence/teach.out |
| C1, C2 | `bun …/probes/composition.probe.ts` | evidence/composition.out |
| A2 | `bun …/probes/checkpoint-race.probe.ts` | evidence/checkpoint-race.out |
| G1 | `bun …/probes/save-growth.probe.ts` | evidence/save-growth.out |
| dependency directions | an import scan of `src/` and `web/` (script not kept; output kept) | evidence/deps.txt |
| navigation (investigator) | `probes/agents/navigation/probe{1..5}.ts` (`bun <probe> [seed] [terrain]`) | quoted in E1–E3 |
| knowledge (investigator) | `probes/agents/knowledge/probe-dialogue.ts fx/probe.campaign.json`, `probe-f05.ts` | quoted in D1 |
| test credibility (investigator) | grep lists in `probes/agents/tests/*.txt`; the vacuous-pass checks are kept as `.txt` so the suite does not run them | quoted in H1 |

**Note on paths:** the investigators' probes were written against absolute paths in the session and have been rewritten
to relative imports. They are kept as evidence and may need small path adjustments to run.

The probes are `*.probe.ts` and live under `doc/`, which lint and typecheck exclude and `bun test` does not match. They
change no production code. Each prints its demonstration rather than asserting, so a fixed defect shows as changed
output, not as a red suite.

**Unverified questions:**
- The audit's F2: open-query answering was not independently probed.
- Two campaigns interleaving through global catalogs (B2) was not reproduced.
- March-crossing latency and the frontier segment were not re-measured.
- CI logs for 483e3af could not be read (proxy 403).
- Browser specs and the long descents were not run here: no Chromium libraries were set up, and the long descents were out of budget.
- E2 was reproduced by the investigator only.

---

## 11. Dissenting perspective

- **I may be over-weighting composition.** C2 and C1 are latent in today's content: every authored action pins its own constants, and only one authored country shares a world. If the next phase is *one* rich campaign with a starter city rather than many campaigns in one world, C1, C2 and B2 can wait, and the sequence shrinks to A1, the journey tier, D1/D2 and E3.
- **D1 could be over-engineered.** Much of what reads as "deep characterisation" can be authored as Topics gated on companion facts, which works today (`module-parser.ts:288`). Per-member knowledge is the principled fix, but a company-level `heard(…, source)` plus the Topic-speaker guard might buy 80% of investigation play for 20% of the cost.
- **B1 is a boundary argument, not a reproduced bug.** I have no case where a presentation edit changed a canonical hash; I have only the dependency direction. The builder's hash discipline (`journey-profile`) would catch most such drift.
- **A1's severity depends on how often players learn those facts before a second crossing.** I reproduced it on one natural route in seed a1, and counted 9–10 such facts per world. The builder's 120-command, five-march wander did not hit it. If teaching those facts is rare in real play, this is "high" rather than "critical". I kept "critical" because the failure is permanent, silent until it happens, and sits on the default mode's central path.
- **Evidence limits.**
  - Three tracks (navigation, knowledge, tests) were investigated by delegated read-only agents. I re-checked their headline claims in code and re-ran A1 independently, but not every count.
  - I did not exercise the browser.
  - The missing audit report means my reconciliation of F1–F9 rests on the ledger's summaries.

---

## 12. Phase II: prospective study (same snapshot, 483e3af)

Phase II asks what architecture would let Kyrie become one coherent, persistent world composed from independently
authored and generated material. It is four documents in [`phase-2/`](phase-2/):

- [A. Shared-world architecture](phase-2/A-shared-world.md): the four existing placement mechanisms; what the shipped adventures assume; eager versus registry versus hybrid assembly (hybrid recommended); the contribution manifest; and the design exercise of one character reaching Thrume, Let One Remember and a placed variant of The House That Grows.
- [B. Metropolis and travel](phase-2/B-metropolis-and-travel.md): lot, ward and overlay composition models (the ward model plus lots plus overlays, recommended); the academy, quayside and secret-society exercise; routes, services and assisted travel as additive layers; a worked journey from the city to three adventures.
- [C. Characters, institutions and history](phase-2/C-characters-institutions-history.md): strategic actors as public faces plus stratagems over `ambitions.kyr`; deep companions as knowledge per member plus authored Remarks over exported tags; history as facts, with reading levels.
- [D. Decision memorandum](phase-2/D-decision-memo.md): design-now, incremental, authored-only and deferred lists; three vertical slices; the open decisions; and the final answer.

**New evidence:** [`phase-2/probes/all-in-one-world.probe.ts`](phase-2/probes/all-in-one-world.probe.ts), with its output beside it.
- In one live generated world (seed a1):
  - Thrume installed in 0.33 s and Let One Remember in 0.60 s, each unchanged except for an overlay importing the world's company;
  - The House That Grows was refused, because its premise asserts `stareTrained(party)` on the imported company;
  - the company walked six offered steps into Thrume's opening.
- The joined world held 37,801 facts in 20 modules. A wait took 88 ms, and the checkpoint was 7.3 MB.

**The one investment** (memorandum §9): the world contribution contract and world plan. That is, one small manifest
(contributes, attaches, heard of, owns, exports, preserves, world may change), an append-only, traced, content-hashed
plan generalising the kit ledger, the scenario hooks and the frontier, and installation inside the commands that bring
the company to each contribution.

---

## 13. Phase III: adversarial critique of Phases I and II

Phase III re-read both earlier phases looking for weaknesses, and ran three new probes on the same snapshot. The
probes are in `phase-3/probes/`, each with its output beside it.

1. **Two institutions** (`two-institutions.probe.ts`).
   - An academy and a tower, neither naming the other, written against the shared rules plus a five-line shared `lore` vocabulary file.
   - With both installed, the academy's rule found the tower's circle as the keeper of a forbidden codex. Its ambition advanced in stages and spent 15 gold. A companion-to-be (Ferrand) then had a new topic about the result.
   - The live, restored and replayed games had equal fact hashes.
   - With the academy alone, nothing happened.
2. **Companion reaction** (`companion-reaction.probe.ts`).
   - The tower adds a back stair onto the academy's *exported* stair without editing it.
   - Reading the codex teaches a fact the tower marked `forbidden`. Ferrand's author wrote only "when the company knows something forbidden", and Ferrand's line was offered and spoken.
   - **But** a `{?f}` in that line printed literally as "?f", accepted by the compiler; I did not run lint on it (`phase-3/probes/companion-name-variant.out`). The companion can react to another author's content but cannot name it.
3. **Frontier identity** (code-path verified).
   - `Frontier.drawn` keys the country beyond on what is already installed: `exclude: placed(installed)`, `taken: works(campaign)`, `named` (`src/world/frontier.ts:77-78`).
   - So the same seed draws a different x1y0 depending on the route taken to it. Replay stays deterministic, but **the world is path-dependent**.

### Revisions to my own conclusions

| earlier claim | revision | why |
|---|---|---|
| Phase I C2: a module's actions should range over its own scope by default (*must fix*) | **Downgraded to "should fix", and narrowed** to a lint warning for unconstrained *player-offered* actions, plus disambiguating identical wordings. No scope by default. | Probe 1: world-wide rule reach *is* the mechanism of cross-campaign interaction. Scoping it by default would forbid the very thing the shared world wants. The defect is two identical labels, and an unconstrained offered action; not reach as such. |
| Phase II C §2: strategic actors need public faces, stratagems, horizon scheduling and `worldMay` | **Not needed for a first strategic slice.** Rules, `ambitions.kyr` and a shared vocabulary file work today (probe 1). The missing piece is **information discipline**. | The academy learned of the tower *instantly*: rules read the world as an omniscient narrator would. Making actors act on claims carried by channels is the requirement; a strategic layer is not. |
| Phase II C §3.3: a new Remark abstraction over exported tags | **Withdrawn for now.** A Topic whose condition has a variable over a shared vocabulary relation *is* a remark, and a shared relation (`forbidden`) *is* a tag (probe 2). | What is missing: variables rendered in Topic text (probe 2's "?f"); per-member witnessing (Phase I D1); volunteered rather than asked lines. |
| Phase II A §5: a contribution manifest of about 10 fields (`compat`, `needs`, `face`, `owns`, `preserve`, `mayVary`, `worldMay`, …) | **Over-general.** Keep `attach` (entry plus join), `hooks` (they exist), and `compat` / `Arrival`. Defer `preserve`, `mayVary`, `owns` and `worldMay` until a concrete case appears. | Generation never alters an authored module today: they are separate installations. Probe 2 added a door to another author's place through the existing import model. No case yet needs the deferred fields. |
| Phase II B §2: ward sockets, lots, `admits: overlay`, singular civic roles | **Over-general for a first city.** A hand-authored city module exporting its landmarks and wards, with contributions importing them (as probe 2 does), is enough to test the city hypothesis. Singular roles and sockets wait for a second competing contributor. | The import model already does "my building in your ward". Conflicts at three contributions are curation, not mechanism. |
| Phase II A §6: "identity is the plan id, not the order of arrival" | **False of today's frontier** (probe 3). It is a real decision, not a given. | A pre-computed plan would make it true; path dependence may also be acceptable (DR1 in `phase-3/B-contracts-and-decisions.md`). |
| Phase II A §3: eager installation dismissed | **Re-opened as an experiment.** The clock objection stands for adventures with absolute deadlines. Eager installation avoids the mid-play installation path where A1 and A2 live. Measured cost: a wait of 88 ms in a world of 37,800 facts with two adventures installed. | That is a measurement, not a projection. |
| Phase I C1: namespace local kinds | **Tension noted.** Shared items across modules (a lens carried from the academy to Cobble Ring, a city's currency) need *shared* kinds. Namespacing by default would need kind exports. | Decide with DR3; do not namespace blindly. |
| Phase I B1: presentation inside the authority boundary | **Kept at medium, confidence lowered** for the first direction (perception code in `presentation/`). The second direction is code-path verified: voiced lines are stored in the log, and the log is in `canonical()`, so a voice-table edit changes replay output. | No case was reproduced where the first direction changed a hash. |

### Where the reviews underestimated existing infrastructure

- **The hook pipeline is complete and tested, not partial:** carriers, channels, `opens` revealing a hidden way, and `test/way-in.test.ts`.
- **Shared vocabulary files work as a medium for authors to interact:** a module lists `rules: ['world', '../lore/lore.kyr']`, and its relations stay unscoped.
- **Imports of exported places let one author build onto another's place** without touching it.
- **Role contracts with Kyr conditions already exist** (`RoleRequirements`).
- **`ClockShift`, and installation inside a command with whole undo.**

The earlier phases treated several of these as gaps to be built. They are tools to be used.

### Phase III deliverables

- [A. Validation plan](phase-3/A-validation-plan.md): six vertical slices, each with its hypothesis, acceptance and failure criteria, and performance implications. It also covers literary depth as an acceptance criterion: the literary diff, an editorial reading, and demanding test material.
- [B. Contracts and decision records](phase-3/B-contracts-and-decisions.md): seven contracts (K1–K7), each justified by two or more concrete uses, and nine decision records (DR1–DR9).
- [C. Implementation sequence](phase-3/C-implementation-sequence.md): what must precede the next phase, the order of the slices, the potential dead ends, and migration.
- [D. Risks and dissent](phase-3/D-risks-and-dissent.md): the case against general systems, provisional budgets (measured against projected), and what remains uncertain.
- [E. Executive recommendation](phase-3/E-executive-recommendation.md).

---

## 14. Final synthesis

The three phases are reconciled in [`synthesis/A-final-architecture-synthesis.md`](synthesis/A-final-architecture-synthesis.md).
That document has a recommendation ledger (verified blockers, retained, simplified, deferred, rejected, open), and it
supersedes earlier sections where they disagree. Mission 16 readiness, the M15 handoff checklist, the split into M16A
and M16B, five owner decisions and the decisive player journey are in
[`synthesis/B-mission-16-readiness.md`](synthesis/B-mission-16-readiness.md). Supporting probe:
`synthesis/prose-repetition.probe.ts`, with its output beside it.
