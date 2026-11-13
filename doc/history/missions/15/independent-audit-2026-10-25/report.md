# Independent technical audit of Kyrie

25 October 2026. Audit of a pinned, intermediate build; **not Mission 14 or Mission 15 acceptance**. No engine repairs were made. Reproduction programs, imported adventure files, builds, and installation changes were confined to `/tmp/kyrie-review-20261025`; this directory in the builder's checkout contains only review artifacts.

## 1. Assessment

**The underlying architecture is viable, but its public fictional semantics remain fragile.** Independent authors can already make distinctive worlds, rather than just reskin engine adventures. Deterministic composition, immutable worlds, typed imports, ordinary actions and rules, and command replay are useful foundations. A rewrite to event sourcing or a new simulation kernel is not justified by this audit.

The principal question has a qualified answer: **distinctive authorship is demonstrated; safe composition and sustained trust are not yet established generally.** The three independent adventures preserve very different premises: Thrume's sleeping giant and dream houses; the House's architecture governed by attention; the Patient Star's held moments, light, memory, and slow people. The current runtime runs substantial parts of the first and third. The House artifact does not load unchanged on this build. There are reproduced failures below that ordinary independent modules can trigger, even when their declarations compile.

**The single greatest future risk is multiple competing representations of the same fictional truth without one public lifecycle contract.** A companion can leave in relations while their body remains in the party; a visible teaching observation can fail to convey its fact; a declared speaker can answer while dead; a campaign's local item definitions can disappear when another game starts. These are more consequential than whether a generator is written in TypeScript. Adding institutions and enduring companions before resolving these contracts would multiply the exceptions.

The highest urgency defects are campaign catalog isolation, query correctness, and command/expansion failure atomicity. The most useful authoring work after those is shared eligibility, a public companion transition, consistent observation instances, and content/rules versioning. Performance has substantial headroom compared with the earlier documented baseline, but I independently verified only this revision's costs and output hashes, not the historical speedup.

## 2. Snapshot, provenance, and limits

| Component | Exact inspected revision |
|---|---|
| Kyrie | `ab9055a2a2f832330c2ad80e0217444b51dfc8d3` |
| Deem | `967deac5b8411a921b85ba9ef630d503081ce21e` |
| Languages | `30d36c624e6a604b5ed9296dad5127b23aeb2285` |
| Thrume, `origin/adventure/thrume` | `9076108ff75f20516a178a07c935ea0806503c9f` |
| The House That Grows, `origin/house-that-grows-authoring` | `199db3285690bf8a231686d948bcfc3c958ede95` |
| Hold One Season / The Patient Star, `origin/hold-one-season-authoring` | `64e8a5d3e3a804fb936d964c303db3423cb672f5` |

The audit used a detached local clone, with separate sibling clones of Deem and Languages. Adventure **content, documentation, tests and necessary fixtures** were extracted at the revisions above into the audit clone; their old engine implementations were not substituted. This tests compatibility of those exact content artifacts against the pinned current runtime. No adventure prose or mechanics were simplified to pass tests. The third branch was identified by the user during the review.

The builder was active. At capture, its checkout had untracked `.github/workflows/ci.yml` and `scripts/test-summary.ts`; later it also had dependency, CI and documentation edits. Those are **excluded from the pinned verdict**, not treated as delivered failures or completed repairs. The committed workflow at the snapshot is `.github/workflows/pages.yml`.

Environment: Bun **1.4.3**, Linux/WSL2, Intel i9-9900K, 16 logical CPUs. Browser: locally installed Playwright Chromium 1140, 820 × 1180, touch enabled, CPU throttle 1. Chromium needed available shared libraries via `LD_LIBRARY_PATH=/tmp/kyr-browser-deps/unpack/usr/lib/x86_64-linux-gnu` and execution outside the process sandbox. No public deployment was used. Browser journey commands went through the built page's existing automation interface; this is execution/rendering verification, not usability research.

The machine was shared with builder work. Load averages ranged roughly 6–26; some measurements overlapped focused audit tests, frontier play, or a builder parallel suite. Later A/B timings are expressly **contention measurements**, not clean hardware comparisons. Raw step records and logs are retained in [evidence](evidence/summary.json). Percentiles use the existing profiler's `floor(p × n)` index convention. There is no claimed Safari, mobile hardware, or network-latency result.

Lockfile SHA-256 values before any builder changes:

```
Kyrie    c6ee9d7e253dbc7f1d4398b0cde7420266cee7787b4461415becf7cbe346dc0d
Deem     4d9e852352f3686c91b01a3d18d377aae4e6a8e6fbddfe813e8ccc4c64d18653
Languages a54541760fedc694231a1088e90ae8afecf524a0a62fae9247f9383abeccd4e0
```

This is executable review, not exhaustive proof. In particular: all module orders, all source-content combinations, long-lived actor economies and every prior play-review defect are not assumed correct from passing tests. A prior review was read for hypotheses; its old findings were not counted as fresh reproductions.

## 3. Boundary map and concrete traces

All locations below refer to the pinned Kyrie tree, available at `/tmp/kyrie-review-20261025/kyrie`.

| Layer | Actual ownership today | Boundary assessment |
|---|---|---|
| Kyr syntax/compiler | Entities and types; facts/measures/queries; places/passages; people/topics; state machines; actions, rules, events, observations, pursuits. Sugars lower into shared facts and operators. | A substantial public authoring language. Body projection and discovery writes are restricted, but some neighboring mutable facts still permit inconsistent transitions. |
| Deem | Seeded values, table selection, templates and generated manifests/casting. | Proposal/generation layer, not runtime truth authority. Custom bundle tables/templates are public through `BundleManifest.generation`. |
| Composition | Kit slots, hard requirements, preferences, claims, proposals, installation imports, trace/refusal explanations. | `Binder` has a deterministic check budget (600); `Proposer` retries bounded rows. Ordering is intentionally meaningful, not commutative composition. |
| Runtime | Immutable `World`; action grounding; creatures/inventory; checks and combat; clocks; NPC planning/pending actions; hazards; knowledge settlement; module installation; transactional campaign execution. | Command-sourced foundation is sound in tested normal paths. Catalogs and the session's post-command expansion are exceptions to isolation/atomicity. |
| Standard library | Shared Kyr rules under `data/rules`: movement, people, needs, services, belongings, discovery, care, dominion, belief and ambitions. | Correct place for common fictional policies. `ModuleShadow` now protects local relation/action names against library growth. |
| Authored content | Handwritten modules and kits, local laws, relations, scenes, commitments and puzzles. | Can be highly distinctive. Generic `On success` is a flat change list; many conditional consequences require additional state/rules. |
| World generators | Terrain/topology algorithms plus `.kyrt`, JSON purpose data, and TypeScript that writes Kyr. | Generic topology algorithms are legitimate engine code. Scene-specific priest arguments, promises, bans and grief in `DeepArgument` are content embedded in the generator implementation. |
| Browser | `EngineHost` → session, worker protocol, screen/narrative projection, React page, persistence and focus. | Uses host-neutral mechanics, but still owns presentation policy and save scheduling. UI command deduplication can discard distinct authored interactions. |
| CLI | Compile/lint/test, terminal campaign play, generated playtext, replay and inspection. | Generated transcript replay now shares `DrawnWorld` and `PlaySession`; interactive `Terminal.play` still drives `Campaign` directly and writes bare campaign saves. |

### Deep site, dialogue and commitment

`RegionWorks.lines` selects the historical work/purpose; `DeepSites.lines` calls layout/pacing and emits ordinary Kyr places, passages, mechanisms, inhabitants and observations. `DeepMechanisms` writes changes and hazards; `DeepTime` and site rules make time matter. Output is installed through normal module compilation and namespacing. The runtime is not specially recognizing a mine room to resolve its lever.

`src/world/deep/deep-argument.ts:43` is different: it authors a particular priest whose brother disappeared, six argumentative approaches, a promise, shrine exclusion, and their prose in TypeScript. The emitted actions use `Resolve check`, ordinary success/failure changes and `refusesService`. `Membership`, `FieldResolver`, and `Campaign.complete` need not know that story. **The privileged part is access to this generator/content library through a fixed internal purpose registry**, not a novel runtime power unavailable in Kyr. Independent authors can write the resulting deep site by hand; they cannot select/extend the same deep-purpose/layout pipeline merely by supplying a bundle's own purpose file. The existing purpose-specific bane dialogue tests pass, so the earlier report that every purpose says the mine's words must not be repeated as a present defect.

### Contract and directions

The Long Man's concrete contract is `data/adventures/the-long-man/dale.kyr:132`, `:249`, `:265`: a readable forty-crown notice; Venn's topic tells where the Mower lies by day and which key opens the Hollow Door; discussion records knowledge, lending and key state; presenting an owned keeper mask pays once. Topic lowering adds speaker/party locality and `toldBy`; `ModuleNamespace` scopes local facts and exports; shared movement consumes the actual graph, not the prose directions; runtime money is synchronized to creatures. The directions are **authored prose tied to named entities**, not a public structured route contract whose validity is checked by the compiler.

The compositional example is `data/kits/bounty/kit.json`: it binds a raiding power, its chief/band, and the raided settlement from the earlier assembly ledger, proposes widow versus elders from its own Deem table, and imports those identities into the chosen patron module. In `widow/patron.kyr`, offer → known price; chief gone/routed → `met(price)`; claim → 15 coins and a revealed ring. Elders ask for the whole band instead and grant continued hospitality. Those are distinct mechanisms, not a single engine quest enum. Neither patron establishes a generic causal proof that this company caused the victory; offscreen defeat can satisfy its condition. That is an authored reward-policy concern, not proof of interrupted-action corruption.

### Scheduled action

`test/fixtures/march/conflicts/register-of-names/conflict.kyr` gives the necromancer, digger and keepers named pursuits and allowed actions. `Agency.choose` plans only allowed non-resolver actions, with a 2,000-node limit and authored horizon. `CampaignTick.npcs:65` starts a multi-watch action, stores its operator id and due watch, and **rechecks its requirements at completion**; obstruction uses the action's failure branch. `WatchLoop` advances the clock and bodies, then actors, authored rules, consequences and progression in a defined sequence. This is a useful foundation to preserve. Continued eligibility is as strong as the authored predicate: there is no universal automatic requirement that every custom actor action requires its actor alive/awake or still committed to that goal.

### Procedural generator and identity

`BundleManifest.generation` accepts a bundle-relative tables/templates path, type and context; `ModuleBundle.generated` builds a local Deem setting and generates an adventure manifest. Kit `Proposer` draws weighted rows under constraints and records rejected reasons. Installation namespaces ordinary entities as `installation__entity`, maps typed imports to exported identities, and derives creature seeds from installation seed plus local id. Catalog-backed types deliberately keep canonical ids; that choice is incorrect for genuinely local kinds (F1). Seeded land `Draw` is a generic fast PRNG and is not an architectural violation.

### Command lifecycle

`PlaySession.perform` resolves the public command, guards concurrent commands, collects player combat choices, and invokes transactional `Campaign.executeAsync`. Campaign resolution settles body effects, decides success, applies immediate/deferred world effects, departs/arrives on journeys, advances watches, applies NPC/rule/consequence work, verifies shelter/survival, updates outcomes, settles perceptions and appends the campaign event. The session then expands the frontier, appends its transcript step and stores voiced telling. Save/checkpoint contains module definitions, bodies, world, campaign bookkeeping, events and transcript; replay regenerates a drawn world from seed plus recorded origin/party options.

The three state stores are not by themselves a reason to rewrite the kernel. They need defined public transitions and invariant tests. F3 shows the remaining gap in the outer transaction. Interactive CLI play still omits the session-level frontier/telling/transcript path; it should be adapted to that coordinator rather than becoming another interpretation.

## 4. Reproduced findings

Severity describes likely impact, not whether the builder has claimed completion. Each item separates observed behavior from inference.

### F1 — High: catalogs are process-global, and failed declarations can poison them

**Category:** demonstrated correctness/composition defect. **Locations:** `src/canon/local-catalog.ts:57,78,89,91,98`; `src/lang/catalog-parser.ts:51`; `src/campaign/campaign.ts:55,97,115`; `src/campaign/module-namespace.ts:20`.

**Evidence:** [probes.ts](evidence/probes.ts), [output](evidence/probes.log), [catalog-poison.ts](evidence/catalog-poison.ts), [output](evidence/catalog-poison.log). Start the local-kind fixture and retain it; start the ordinary fixture in the same process; execute the first game's already offered `take_item(p__ox,p__member_party_1)`. It now throws `Unknown item definition dreg_ox`. A second probe installs two modules whose source `Module` labels are both `shared` and whose `audit_coin` has different values. The campaign accepts both, and the catalog value becomes **99**. A third parses a forbidden local `Kind dagger`; rejection is correct, but the next `LocalKinds.reset()` removes both built-in dagger definitions.

**Cause:** activation resets mutable singleton catalogs rather than selecting a campaign-owned environment. Local itemkind ids stay canonical; same-owner checking uses an authored module label; `merge` overwrites by object assignment. `install` records an id for later deletion **before** checking whether it is an allowed addition.

**Impact:** interleaved games and lint/preview sessions can invalidate one another; two independent authors can accidentally share an item kind; an invalid module can damage subsequent ordinary games in the same process. Campaign checkpoints do not restore these globals.

**Narrow correction:** immutable base catalog plus campaign/load-context overlay, explicit local-kind qualification and import/export mapping; transactional validation before any publication. Move `installed.add` after validation as a bounded immediate containment, but that alone does not fix simultaneous games.

**Regression:** retain two sessions with differently defined same local kind, interleave inventory/combat/save/restore, test both installation orders and a failing parse, and assert base catalog identity/content unchanged. **Uncertainty:** the browser normally has one game per worker, reducing frequency there; it does not repair the public in-process API or preview/lint behavior. The accepted-conflict probe shares a source module label deliberately; differently labeled conflicting kinds are often rejected.

### F2 — High: query answering is inconsistent and can return impossible bindings

**Category:** demonstrated semantic correctness defect. **Locations:** `src/lang/world.ts:153` and `:181`; `src/campaign/campaign-tick.ts:123`; `src/lang/candidates.ts` is a partial safeguard for grounding, not a solver repair.

**Evidence:** [probes](evidence/probes.log). With candidates A/B and only B marked, `clear(t) means not marked(t) and candidate(t)` gives `clear(A) = true`, but solving `clear(?t)` returns no bindings. A rule `when clear(?t)` therefore produces no awards. With only `pair(A,B)`, the query `diagonal(x,y) means pair(x,y)` accepts `diagonal(?t,?t)` and returns `?t = B`.

**Cause:** left-to-right negation-as-failure executes before its variable is bound; query parameter remapping gives repeated external variables independent internal names and overwrites their back-mapping instead of unifying them.

**Impact:** independently written rules silently miss eligible actors/objects or affect an actor that cannot satisfy the closed query. Scene, eligibility, institution and composition logic all rely on this foundation. The first problem is acknowledged in the pinned mission ledger, so it is **known unfinished work**, not evidence the builder represented it as fixed.

**Narrow correction:** define range-restricted negation and dependency-aware binding, or reject unsafe query modes with source diagnostics; unify query arguments, including repeated and already-bound variables. Preserve the candidate optimization only if differential tests establish its superset guarantee.

**Regression:** for each query and finite typed domain, enumerate closed answers and compare with all open/mixed/repeated-argument solve modes, including nested queries, conjunction permutations and negation. Test rule effects against that enumeration. **Uncertainty:** no exhaustive audit of production rules was performed; the minimal counterexamples prove semantics, not prevalence.

### F3 — High: failed expansion can commit a command without recording it

**Category:** demonstrated persistence/replay failure path. **Locations:** `src/session/play-session.ts:71,91,92`; `src/world/frontier.ts:35`.

**Evidence:** [lifecycle.ts](evidence/lifecycle.ts), [output](evidence/lifecycle.log). Attach an expander that throws, then perform `wait`. The call rejects, elapsed becomes 1, campaign events become 1, transcript steps remain 0, and canonical state changes. Normal multi-region replay passes in the same program.

**Cause:** Campaign's transaction ends before the session awaits expansion and appends its transcript. Real frontier expansion can await generation, source reads and several installations; a failure can occur after earlier work has committed.

**Impact:** a rejected browser command may have advanced time and fictional state without its causal command in replay. Retry may advance it again. This is narrower than saying the normal command-sourced model is broken.

**Narrow correction:** a session-level transaction encompassing command, generated installations, transcript and telling; alternatively stage expansion and commit all pieces atomically. Keep command sourcing. **Regression:** inject failure before/after each generated installation and road link, assert the entire checkpoint and transcript are unchanged or return a clearly committed recorded outcome; retry must reproduce uninterrupted play. **Uncertainty:** injected I/O failure, not a naturally encountered broken frontier file in this journey.

### F4 — High for companion authoring: a rule can end travel without ending membership

**Category:** demonstrated state contradiction / missing public lifecycle. **Locations:** `src/campaign/membership.ts:14,25,40`; `src/campaign/creature-facts.ts`; imported `test/fixtures/patient/leaves/site.kyr`.

**Evidence:** Patient Star probe P10 passes as a **negative behavior test**; [fiction output](evidence/fiction.log) independently shows party names `[Ama, Mirel]` after Mirel's rule retracts `travelsWith` and sends her home. The branch's test also verifies her member relation remains in the party. My stronger check did **not** reproduce its exact “lies dead” sentence, so that historical symptom is not counted as confirmed here.

**Cause:** recruitment mutates `partyIds`, `inhabitants`, `enlisted` and projected membership through a privileged resolver. A rule can change travel facts but cannot invoke the corresponding living-departure transition. The available `inter` resolver is for releasing a member laid to rest, not a full homecoming/unrecruitment protocol.

**Impact:** authors cannot safely give a companion an independent commitment to leave without bespoke runtime help or incorrect membership. This directly obstructs enduring authored agency.

**Narrow correction:** one typed public join/leave/rejoin transition, callable by authored outcomes and scheduled behavior, preserving group/body identity, inventory disposition and location. Derived membership should have one owner. **Regression:** recruit → author-driven departure → inspect/transfer/combat → save/cold restore → recruit again; compare every representation. **Uncertainty:** the normal player-directed existing dismissal paths were not all independently exercised.

### F5 — Medium/high: observation instances lose their semantics

**Category:** demonstrated knowledge and narration defects. **Locations:** `src/presentation/local-observations.ts:54,62,68`; `src/campaign/perceptions.ts:13,16`; `src/lang/module-compiler.ts:86`.

**Evidence:** [fiction.ts](evidence/fiction.ts) creates a compiler-accepted `Observe glow near ?lamp ... teaches lit_fact`. After `wait`, the player is told `t__glow@t__lamp: Lamp burns brightly.`, but does not know `t__lit_fact`. Separately, Patient Star P1's actual output contains literal **`?m's own footsteps`** from a fixed-anchor observation whose condition binds a member; see [patient-probes.log](evidence/patient-probes.log).

**Cause:** variable-anchor observations acquire `id@entity`, while teaching looks up exact declaration ids. Fixed-anchor observation evaluation tests existential conditions but discards the satisfying binding before interpolating text. Compile-time variable checks accept this form.

**Impact:** players see evidence without receiving its authored consequences, and modules cannot reliably describe variable actors or objects using the advertised semantic surface.

**Narrow correction:** carry structured observation instances `{declarationId, instanceId, bindings, teaches, subject}` through perception and narration. Render and teach from the same instance; define behavior for multiple satisfying bindings. **Regression:** one and several moving lamps/actors, fixed and variable anchors, repeated observations, acquisition and replay. **Uncertainty:** tests demonstrate these two paths, not every observation aspect. The static-anchor binding problem also suggests testing objective text and other interpolated forms.

### F6 — Medium/high: custom Speaker actions can speak for dead actors

**Category:** demonstrated semantic hole, engine-authored exposure supported by source trace. **Locations:** `src/world/deep/deep-argument.ts:80,81,95,96`; `src/lang/module-parser.ts:284`; `src/presentation/player-view.ts:128`; `src/narrative/telling.ts:50`.

**Evidence:** [fiction.ts](evidence/fiction.ts) authors a `Speaker priest` action with the same basic locality requirements as DeepArgument, kills the priest in an isolated checkpoint and correctly rebuilds body projections, then resumes. The action remains offered and replies **“The priest hears you out and agrees.”** Dead body HP is 0. `Topic` lowering includes more eligibility than explicit `Speaker`; `Telling.silent` only suppresses selected generated social lines and cannot remove the authored action response.

**Cause:** speaker metadata, action eligibility and generated telling have separate notions of who can speak. DeepArgument's custom actions require the company able and the priest present, but omit priest ability/awareness.

**Impact:** repeated dead/senseless dialogue defects and author exceptions. **Narrow correction:** a shared overridable eligibility predicate for deliberate speech, automatically applied by Topic and Speaker and checked at completion; dead spirits and recordings need explicit authored modes rather than a blanket ban on all dead speakers. **Regression:** alive/asleep/dead/moved/recruited speaker across both constructs and delayed actions. **Uncertainty:** the exact generated priest-death journey was not performed; the public construct reproduction and matching generated preconditions are direct evidence of exposure, not browser play verification.

### F7 — Medium: distinct authored interactions can disappear behind wording

**Category:** demonstrated presentation/API defect. **Locations:** `src/presentation/player-view.ts:119`; imported `test/fixtures/patient/collide`; `src/cli/campaign-lint.ts` label checks.

**Evidence:** Patient Star P4 lints clean and offers only the first of two distinct plates' identically worded “Draw a stylus” changes. [Probe log](evidence/patient-probes.log). **Cause:** choices deduplicate on `schema|name`, before subject context can distinguish the acts. **Impact:** a world can contain a mechanism the player cannot operate. **Correction:** deduplicate genuinely interchangeable instances by semantic identity/effect policy; retain different subjects and give their context. **Regression:** two different stateful objects with the same action wording, plus several interchangeable torches. **Uncertainty:** no general proof that every duplicate label loses a meaningful action; identical consumable instances are a legitimate compression.

### F8 — Medium: some event and epistemic forms have narrower meanings than authors expect

**Category:** missing current capability / design boundary, with observed consequences. **Locations:** `src/lang/module-parser.ts:235`; `src/campaign/campaign-tick.ts:98`; `src/information/discovery.ts:39,119`; `data/rules/discovery.kyr`; `src/presentation/company-knowledge.ts:15`.

Patient Star P9 demonstrates that a one-shot event may become spent while offscreen: waiting outside Garret's room then entering never yields his waking line. That is not inherently wrong for an instantaneous event; it is insufficient for “say this when someone first encounters the changed person.” Rules are sequential once-per-pass, not a fixed-point solver, and the guide now documents that order. Do not silently change all rules to saturation to repair one scene.

`Discovery` is explicitly **reliable discovery/trusted reports**: source facts must be established, knowledge is monotonic apart from stale-news policy, and independent source agreement is not modeled as evidence strength. `readIn`, `toldBy`, `learnedFrom`, `witnessed` and source labels improve attribution. They do not provide arbitrary uncertain/false testimony and competing character beliefs as first-class knowledge. Treat this as a bounded capability, not a fresh claim that all current inscription prose asserts omniscient history. Authors can encode beliefs as their own relations, but then must implement their own transfer, inference and presentation. Rules are prohibited from writing `knows`, making ordinary inference require observation machinery.

**Narrow correction:** distinguish occurrence, persistent changed state, and pending communication; add opt-in perceptual channels and witnessed/recipient semantics; eventually separate claim, source, confidence and confirmation. **Regression:** offscreen/seen/unseen/dark/heard events, competing accounts, reading versus corroboration, and revisiting a learned source. **Uncertainty:** all earlier “book disappears” and historic-truth reports were not re-enacted in this audit. No automatic natural-language truth checker is proposed.

### F9 — High for reproducibility at this snapshot: dependency and verification contracts are incomplete

**Category:** demonstrated packaging/configuration limit, not final builder delivery. **Locations:** `package.json`, `bun.lock`, `.github/workflows/pages.yml`, `src/cli/kyr-lint.ts:89`, `src/campaign/node-bundle-source.ts:12`.

Pinned dependencies are recorded by this review, **not enforced by the snapshot's package manifest**: Deem and Languages are sibling `file:` packages. The committed Pages workflow checks them out without refs and runs only three named test files before building. It has no committed pull-request whole-suite gate. A root install succeeded with the exact sibling clones, but tests initially failed because Deem's own `ohm-js` had not been installed; frozen installs in both sibling projects completed the environment. The inspected lockfiles fix registry versions but cannot fix the sibling Git content. The builder was actively working on this area; do not use this item as a verdict on those later edits.

CLI improvements **verified**: malformed external campaign lint exits 1 with file/line/column; compile exits 1; an intentionally failing external spec through `bin/kyrie test` exits 1; absolute campaign lint from `/tmp` resolves the installed shared library and exits 0. An external campaign copied under `audit/path with spaces/` also lints with 0 errors/warnings and exits 0. Logs are retained. Content/schema `version: 1` is not a rules/dependency compatibility protocol.

**Narrow correction:** pin source revisions and publish a clean installation contract; enforce representative content, replay and browser gates on PRs; retain the failing-spec canary. Record engine/library/content identities with replay/save artifacts and fail incompatibility helpfully. **Regression:** fresh checkout with no sibling accidents, frozen install, lint/test/build, foreign cwd and paths with spaces, exact clean replay. **Uncertainty:** a truly independent network-only installation was not executed here; no conclusion about future migration support is inferred from JSON version numbers.

## 5. Determinism, persistence and composition results

The prior frontier replay defect is repaired on normal execution. [Lifecycle program](evidence/lifecycle.ts): generated seed `thorn`, 16 installed modules initially, 25 after reaching the march and waiting, three transcript commands. Observation/choice/screen calls preserve canonical state; an invalid command preserves it; serialized checkpoint/resume is equal; another `wait` on original and resumed sessions is equal; a **fresh CLI process** replay exits 0 and reproduces canonical state after normalizing the expected absolute-versus-relative scenario path. This is stronger than a same-runtime import test.

The existing focused suite also passes: **23 tests, 102 assertions, 26.43 seconds**, including frontier replay, browser-engine generated transcript → CLI parity, save codec, command contracts, candidates and local vocabulary shadowing. Fatal hazards, failed/rejected commands, world-time effects and interrupted recovery have explicit tests. This supports preserving command-sourced architecture and its receipts.

Composition's **24-test continuation/journey/composition/deep-argument group** passes (77.23 seconds under contention). Hard slot requirements, fixed proposals, generated variation, imported raider identities, journey closure and purpose-specific arguments are covered. Some tests move the party directly; those establish a local mechanism, not discoverability or a complete ordinary journey. The sustained wren record supplies a complementary ordinary command path.

Module order has three different meanings and should not be confused:

1. Imports require an exporter already installed; kit proposals see the committed assembly ledger. That dependency order is intentional and traceable.
2. Actors and rules run sequentially in manifest/authored order. Competing effects can therefore be order-dependent by policy. The documented contract should be preserved and tested, with explicit priorities/dependencies if later needed.
3. Local catalog overwriting and cross-game reset (F1) are accidental order dependence and contamination. They must be removed.

No broad claim of permutation independence is made. Typed imports, import initialization restrictions and ordinary namespacing are meaningful safeguards; local function shadowing passes stress tests against every shared relation/measure name. Generated identities and seed keys are explicit. Save restore rebuilds local catalogs before validating creatures, addressing the older cold-local-item issue within a single campaign; F1 shows why that repair is still not sufficient for interleaved campaigns.

## 6. Independent authoring and compatibility

| Artifact at exact branch revision | Current-runtime evidence | Interpretation |
|---|---|---|
| Thrume | Loads and CLI lints with 0 errors/warnings. 5/6 imported journey tests pass. Main dream-houses-to-Mouth test stops at watch 138 looking for `a torch: Light`. | Vocabulary shadowing repaired the old load collision. Current full journey compatibility is not established; absent expected light action can be stale journey/timing/resource assumptions. No automatic classification as engine defect. |
| The House That Grows | All 17 imported journey tests fail to load at `cobble-ring.kyr:116:3`: missing item kind `dreg`. | Branch ledger records putting `dreg`, `ithren_lamp`, `wax_plugs` in shared catalogs. That artifact has not migrated to local declarations on this runtime. Its distinctive world is not evidence of current plug-and-play compatibility. Preserve its content; supply local kinds, not substitute generic objects. |
| Hold One Season / Patient Star | Complete-fixture opening rerun: **14/15 pass**, 27.42 s. The five-tier `patient-star.test.ts` suite: **10/10 pass**, 58.21 s. Negative-behavior probes: 8 pass, 2 fail; one failure is stale expected wording, the other is a genuinely absent fixture path in the branch artifact. | Substantial independent conditional/temporal world behavior runs, including later tiers. Opening J2 still expects a slowed one-minute passage to take two minutes but receives one; the capacity-overwrite workaround is not a stable public pace mechanism. Negative-behavior test passes are evidence of limitations, not successes. |

The first opening run omitted a necessary extracted fixture and reported 13/15. That was an audit setup error, corrected by extracting the complete fixture tree and rerunning; **it is not a repository defect**. The corrected result above supersedes it. The later-tier suite is executable journey evidence, not a claim that every scene was manually reviewed or every strategic consequence tested.

Thrume's catalog stays distinctive (salt hammer, eyelids, dream routes), the House's watcher rules remain unchanged, and the Patient Star's law modules remain its own. Authoring freedom is real: custom relations/types, arithmetic, histories represented as facts/topics, dialogue, multi-room state machines, variable observations, local species/kinds, pursuits, rules and custom generator files. Compiler diagnostics and public CLI work without editing engine source.

The largest exceptions are specific, not evidence the language is useless:

- Local kinds/species are constrained overlays on existing catalog abilities. New skills, equipment slots and new combat resolver semantics are not generally authorable in Kyr. A local cloak cannot independently declare all equipment properties; inheriting a magical cloak can import unwanted mechanics (Patient P2).
- Ordinary conditional action effects require split actions or sequential follow-up rules. This can expose unintended intermediate states and order dependence; a small guarded-effects form would reduce many exceptions.
- `Plans`/`Uses` provide capability control, but a person with a destination and no `Uses go` stays put without an adequate diagnostic (Patient P6). This is a tooling gap rather than evidence an NPC planner must be replaced.
- Runtime spawning of new named entities, body identities and populations is much less public than installing a whole module. Authored histories are possible as a finite network of facts; a growing structured life history and beliefs do not yet have shared semantics.
- Deep site mechanics can be authored normally; reuse of the rich engine deep-site generator/purpose pipeline is not equally public. Expose a stable generator contract or package the content writer as a library, preserving purpose-specific designs.
- A campaign goal describes progress; it is not necessarily a terminal story-ending protocol. That choice should be explicit in tools and presentation.

## 7. Sustained performance and verification economics

### Measured gameplay

The continuous **wren** record executes 334 commands: multiple mine expeditions, ordinary travel and collection, 14 rest/wait/recovery-class commands and seven fight commands. Facts grow from 17,336 to 18,623; installed modules remain 17; final elapsed time is 996 watches. The exact final hashes match the pinned builder record:

```
canonical 5eae0f91a0ce6203
sorted facts 2693c7793aa85ef4
told/view 6926d284f15e9327
```

| Through browser engine, no DOM (C), ms | p50 | p90 | p99 | max |
|---|---:|---:|---:|---:|
| Command: engine + screen + narrative | 75 | 177 | 381 | 684 |
| Engine | 39 | 110 | 356 | 657 |
| Screen construction | 17 | 72 | 194 | 320 |
| Narrative | 7 | 10 | 18 | 108 |
| Save, separately timed | 39 | 111 | 166 | 238 |

Generation plus engine setup: **4,506 ms**. Save is **not included** in the command row. Raw rows show early 50 command median 66 ms versus final 50 median 66 ms; save median rises from 20 to 51 ms. There is no simple monotonic slowdown of simulation within this one region; persistence grows materially despite modest fact growth. Headless collected heap rises from about 79 MB initially to 353 MB at the end. Do not equate that with DOM memory.

| Real built Chromium page (D), ms | p50 | p90 | p99 | max |
|---|---:|---:|---:|---:|
| Choice to painted response | 128 | 228 | 426 | 902 |
| Engine portion | 40 | 83 | 257 | 741 |
| Screen portion | 19 | 85 | 255 | 277 |
| Narrative portion | 6 | 9 | 12 | 15 |
| Rendering portion | 24 | 31 | 33 | 41 |

Page startup including generation: **5,651 ms**. Early 50 choice median 94 ms; last 50 about 144 ms. Render medians stay around 24–26 ms and engine medians around 39 ms, so increasing browser response cannot simply be attributed to DOM growth. Page heap ends around 11 MB, with storage about 701 kB. This measurement does **not include worker heap** in page-heap reporting; it does not refute the headless process growth. All 334 commands complete; no visual-usability judgment is implied.

The separate **audit-frontier** continuous journey executes **284 commands**, grows from 16 to 31 modules and roughly 18,335 to 61,355 facts. It reaches additional regions; ordinary final-50 median command cost is about 143 ms. Aggregate C command p50 129 ms, p99 1,138 ms, maximum **6,079 ms**. Expansion at steps 13 and 62 costs **3,863 ms** and **6,079 ms**; engine accounts for 3,824 and 6,041 ms. Save p50 59 ms, p99 252 ms, max 274 ms. This run deliberately stops when the next offered wander command is unavailable; it is not a claim of an infinite-world endurance pass. Frontier spikes are generation/installation work, not React rendering.

At step 250 that long-lived process reports **217 MB** collected heap. A separate fresh process parses the same 13 MB checkpoint and restores/observes it at **65.6 MB** collected heap: JSON parse 139 ms, restore 1,779 ms under load. This controls for world and event count better than comparing two seeds. It demonstrates process-history overhead, but does not identify a leak: generation caches, parser state, grounded operators, retained worlds and allocator behavior require a heap-retention profile before naming a cause.

The A/B simulation benchmark was run later under much heavier contention. It completes both 334-command passes with the same sorted-fact hash. A: local median 20.4 ms, travel 16.0, time advancement 447, fight 205.6; B: local 134, travel 165.9, time 742.2, fight 463.7. A command-core throughput is 16.4/s, B 4.3/s. Whole invocation: **157.73 seconds**, 76% CPU allocation, maximum RSS **735,988 KiB**. These numbers cannot be compared causally to the earlier C run or the builder's unloaded A/B table. They show why resource contention must be recorded with test/performance claims.

### Dominant costs and scaling

Measured boundaries distinguish simulation, screen, narrative, persistence and paint. Within the engine, source shows watches iterate NPCs/rules; choices visit schemas and ground their candidates; whole-save work serializes world/module/events/transcript; frontier construction installs a large batch. Copy-on-write relation maps, indexed reads, dirty projection, idle-rule stamps with lineage checks, and frozen observation caching already reduce whole-world work. Preserve them and their differential tests. A heap profile and finer engine phase measurements are needed before claiming one function dominates all sessions.

A separate temporary timing wrapper repeated all 334 wren commands, preserving sorted-fact hash `2693c7793aa85ef4`, and measured actual watch/rule/choice/observation calls ([program](evidence/phases.ts), [log](evidence/phases.log), [rows](evidence/phases.jsonl)). Generation and load took 4,284 ms. Across the whole run, 1,209 rule passes consumed 770 ms and 996 NPC passes 455 ms; 1,336 choice calls consumed 7,381 ms and 334 observation calls 8,759 ms. These are **inclusive, overlapping** timings: observation construction can call choices, so the totals must not be added as independent costs. At the command level:

| Headless repeated journey, ms | All-command median | Time-command median | Time-command max |
|---|---:|---:|---:|
| Command plus final observe/choices | 25.91 | 188.10 | 332.04 |
| Rule passes within command | 0.78 | 21.98 | 58.08 |
| NPC passes within command | 0 | 5.91 | 182.09 |
| Explicit observation calls | 17.41 | 15.60 | 39.53 |
| Choice calls, including offered-choice lookup | 14.18 | 12.93 | 70.10 |

This supports looking at grounding/observation in ordinary local play rather than assuming rule evaluation dominates every action. Long waits still multiply NPC/rule work. It does not identify a specific retained-heap owner or replace a caller-level CPU profile.

The controlled evidence supports these bounded actions:

| Change | Expected benefit | Risk / required check |
|---|---|---|
| Coalesce or incrementally encode save work; move durable writes off the critical response path | Reduce growing 20→50 ms local save median and >250 ms frontier tails | Medium: crash durability and ordering. Kill/reload at every command boundary; retain export compatibility. |
| Stage/batch frontier generation/installation with an atomic session commit | Address 3.9–6.1 s expansion pauses; reuse compilation/projection work | Medium/high: F3 rollback and catalog isolation must come first; identical generated ids/facts/transcript. |
| Ground conversation/action schemas by local participants/dependencies | Reduce cost as installed modules and schemas grow | Medium: open-query correctness F2 first; exhaustive grounding parity after moves, death and new installations. |
| Profile retained heap against fresh restores | Identify history-sensitive caches/retention | Low diagnostic risk; do not cap arbitrary histories or delete content without evidence. |
| Scheduled/multiscale advancement for dormant distant institutions | Avoid every actor every watch, especially multi-day travel | Higher semantic risk: compare skip and watch-by-watch execution at interruption, arrival, deadline and information boundaries. |

No recommendation to rewrite React or remove prose is justified by these measurements. No claim is made that every distant strategic actor should run every ten minutes.

### Verification loop

Frozen installs of the pinned three-repository arrangement succeed. Typecheck and web build succeed. Focused correctness: 26.43 s / 23 tests; authoring/dead/prose/guide: 28.84 s / 40 tests; composition/continuation/journey/deep argument: 77.23 s / 24 tests under contention. Save codec alone is milliseconds. A failing CLI spec returns 1 in 15 ms, so the test wrapper does not swallow that failure. Full parallel suite was **stopped at approximately five minutes with no summary** while a builder suite was also running. Its log is not a green result or a coverage claim. No complete `bun run check` success is claimed. General lint over imported adventure data would intentionally include legacy warnings and a missing House kind; that is not proof the pristine baseline lint fails.

The committed Pages job's three-file check is useful but insufficient evidence for authorability, all replays or browser rendering. Imported negative-behavior probes demonstrate why test names and green totals need interpretation: eight passing tests there assert limitations. Better economics means cheap targeted semantic invariants, deterministic natural command journeys, content compatibility fixtures and separately scheduled expensive generated-choice/deep/browser runs, with skipped and unfinished work visible. Do not substitute test count for those layers.

## 8. Persistent agency and cross-campaign growth

This is future analysis, not a demand that the present game already contain a strategy simulator.

Existing useful primitives: installation-scoped identities and typed imports; bodies distinct from groups; arbitrary authored relation/measure state; shared law modules; priority/urgent pursuits with bounded planning; pending timed actions; institutions/resources/obligations represented as facts; module extension of an imported actor's pursuits; composition roles/claims/proposals; provenance-bearing party knowledge; coarse historical generation; memorials across a new journey. `Memorial` currently stores name, place and how someone died and emits a cairn in a regenerated country; it is **not a persistent shared world history**.

For the kingdom/wizard and necromancer/tower thought experiment, neither module has to hardcode the other's id if they agree on a small public law: actor capability, jurisdiction/reach, suspected practice, claim/evidence, contact route, commitments and authorized response. A connecting kit can bind a threatened settlement/institution and a discoverable tower, introduce correspondence or investigation pursuits, and publish consequences to ordinary journeys. Existing generic schema grounding can bind newly installed actors through shared relations. This is feasible without a fundamental kernel redesign.

What it cannot honestly do today is infer what an arbitrary author meant by “necromancy,” invent a ruler's moral commitments, distinguish uncertain reports from truth in every subsystem, or give a foreign module unrestricted control over the wizard's goals without compromising authorship. Shared semantic interoperability must be explicit. Module installation order and agreed vocabulary matter. Static assembly-ledger facts are not automatically an actor's acquired knowledge.

A minimal direction is:

1. Durable identity and public lifecycle for actor/group/body/member changes; histories that survive recruitment, defeat and restoration.
2. Typed claims with source, time, uncertainty and authorized information transfer; beliefs need not equal world truth.
3. Authored policy envelopes: what an actor values, refuses, can afford, can know, can reach and permits extensions to change. New alliances/rivals should be proposed through those policies, not appended as compulsory goals by any importer.
4. Bounded projects with due times, resource reservations, interruption/failure and a public consequence projection. Deterministic ordering and seed keys use stable identity/project/time, not iteration accidents.
5. Coarse activation: schedule institutional decisions at meaningful boundaries, aggregate distant activity, refine when encountered. Avoid an always-running planner for every citizen; preserve exact replay and compare coarse/fine paths where effects become observable.
6. A versioned history exchange for cross-campaign imports, with provenance, conflict policy and opt-in adoption. A creator must be able to reject foreign history that destroys their premise. Imported “canon” is an authored choice, not an automatic merge of contradictory worlds.

Convenient but harmful shortcuts include globally canonical local nouns; unrestricted foreign pursuit injection; treating a single rumor as omniscient truth; making all actors share party knowledge; arbitrary autogenerated characterization changes; and simulating every dormant resident every watch. These are extension risks, not demonstrated current requirements. Existing fact state and command receipts can support incremental improvements; a heavyweight strategy engine is not yet justified.

## 9. Priorities and preservation

**Urgent Mission 15 prerequisites, in dependency order:**

1. Isolate and transactionally validate catalogs (F1), including failed loads; establish public query equivalence/unification tests (F2). These must precede more caching or broad modular agency.
2. Finish session-level command/expansion atomicity and use the same coordinator for interactive CLI play (F3). Keep normal replay behavior, which is now demonstrated.
3. Provide companion lifecycle and shared speaker/action eligibility (F4/F6); pass all three independent content compatibility suites without flattening their worlds. Migrate the House's local kinds explicitly.
4. Repair observation instances and interaction identity (F5/F7). They are public language promises, not individual prose typos.
5. Pin dependency/rules/content revisions and enforce visible verification (F9). Evaluate the builder's in-progress CI changes separately at a new commit; this audit does not pre-approve them.
6. Recheck sustained browser/engine/persistence costs under controlled resource conditions and investigate retained memory before declaring the performance mission complete.

**Medium term authoring:** small guarded effects, temporal state transitions, public local equipment/species schemas, diagnostic action reachability and missing abilities, perception channels/pending speech, reusable deep-generation contracts, and a claim/belief layer. Sequence new caches and scheduling after correctness oracles, not before.

**Longer horizon:** policy-controlled project/relationship interoperability, bounded coarse institutional simulation, opt-in history exchange and compatibility/migration. Build one wizard/tower investigation via public shared laws as a proof, then generalize what it actually needs.

**Preserve:** immutable/copy-on-write `World`; typed fact/query core once corrected; deterministic identity-keyed randomness; compiler lowering into ordinary actions; explicit imports/roles; constrained, traced Deem proposal composition; bounded NPC planning; command checkpoints/rollback and receipts; complete command/combat transcripts; host-neutral session/replay; body projection as a derived layer with differential tests; purpose-specific deep sites; the three adventures' authored mechanisms; indexed reads, dirty projection and dependency stamps; separation between gameplay and presentation. None needs replacement merely for architectural elegance.

The architecture can grow. The next convincing milestone is not more generated territory or an omniscient strategy layer: it is a distinctive independent adventure that composes, preserves its people and knowledge, survives failure and cold restore, and remains responsive through an ordinary extended journey.
