# Westernesse as a headless RPG

11 November 2026. Independent investigation and bounded experiment on `investigate/headless-rpg`, based on
`c1996d6c`. Findings, implemented experiment, and proposals are labelled separately. No Mission 20 browser,
opportunity, guidance, or navigation source was changed.

## Answer

**Finding.** Yes: Westernesse already has most of a self-contained game beneath React. `PlaySession` is a
host-neutral command loop; `PlayerView` is a player-safe projection and public-command resolver; `ScreenModel`,
`Narrator`, and `Glance` are renderer-independent; `Campaign`, `World`, and `Battle` own transition authority. A
terminal and the browser can therefore play the same session without either interpreting the other's controls.

The qualification is important. The browser's worker currently assembles the complete `Screen`/`Leaf`/`Glance`
contract, while the smallest public contract (`PlayerSnapshot`) does not carry all promotion, provenance,
availability, restriction, and combat detail in one object. Several meanings are inferred in generic TypeScript
projection code, and a few React components still classify rows by labels. Generated-world startup and projection
are also expensive enough to make the engine feel unlike the compact campaign benchmark.

## 1. Architecture map

The current authoritative path is:

```
Kyr + Deem -> WorldAssembler / ModuleBundle -> Campaign(World + CreatureStore)
                                                  |
player command -> PlayerView.resolve -> PlaySession -> Campaign.executeAsync -> Battle
                                                  |
                              PlayerView -> ScreenModel -> Narrator / Glance
                                                  |
                                      browser renderer OR terminal renderer
                                                  |
                                      SessionCheckpoint + transcript digest
```

| Concern | Current authority | Projection/client role | Assessment |
|---|---|---|---|
| generated definitions | Deem data and `WorldAssembler`/region writers | show progress | Correct split in principle; much assembly policy remains TypeScript |
| authored situations, prose, consequences | Kyr modules/templates and catalogs | typography and layout | Correct; some generic prose remains in TS |
| legal campaign actions | grounded `Campaign.offered()` operators | `PlayerView.choices` hides, aliases, labels, and deduplicates | Authoritative and shared |
| command execution | `PlaySession` -> `Campaign.executeAsync`; `Battle` for encounters | submit public id; select a legal combat command | Authoritative and shared |
| world truth | immutable `World`, `CreatureStore`, campaign clock/history | no mutation | Correct |
| player knowledge/perception | `PlayerView`, `LocalObservations`, `CompanyKnowledge`, aliases | render only | Correct, but observability is a conservative policy because Kyr lacks a full declaration contract |
| action meaning | `PublicChoice.category/interaction/targets/movement`; `ScreenModel` rows | arrange groups | Mostly correct; categories and several semantics are generic TS inference |
| foreground rank/facets | `Affordances` + `Promotion` -> `Glance` | browser decides visual treatment | Correct execution boundary; authority lives in a presentation-named package |
| narration/feedback | authored observations/events plus `Telling`, `ActionFeedbackView`, `Narrator` | typography | Shared and renderer-independent |
| persistence/recovery | `PlaySession.checkpoint`, transcript digests, campaign save/restore | storage/download path | Correct; legacy CLI formerly saved only a bare campaign |

### Representative actions end to end

| Player activity | Definition and rule | Legal/public choice | Perception and prose | Execution/persistence |
|---|---|---|---|---|
| create a character/start | catalogs, creation rules, Deem-generated country/origin | browser `Creation`; prototype `--as race/calling/name` | creation catalog and generated opening | `DrawnWorld.start` -> `PlaySession` |
| generate/load world | Deem definitions + `WorldAssembler` + scenario composition | start request, not an in-world action | generated module observations/prologue | assembled bundle loaded into `Campaign`; seed/drawn options in transcript |
| look/investigate | Kyr observation/source/change schemas; searching rule | grounded search/look command | `PlayerView.observations`, `ScreenModel`, authored text | normal session command; discoveries in history/save |
| local/cross-hex movement | Kyr passages plus generic crossing/travel rules | public movement id or `travel:<place>` | player-known exits and map only | `PlaySession.leg`/`Travel.go`; crossing context enforced |
| speak/choose dialogue | Kyr speakers/topics/actions | public speaker/topic commands | authored speech and feedback | normal command; knowledge/objectives persist |
| item/spell | catalog effects, inventory/invoke resolvers | choices carry `interaction`, targets and ids | mechanics text and authored result | campaign resolver; creature/inventory state committed |
| trap | Kyr hazard/risk plus generic typed effects | risk/movement choice with warning where known | mark, observed trigger, feedback | atomic action/encounter; failed crossing remains failed |
| combat | `Battle`, effects, tactics, creature lease | `CombatModel`/`CombatChoices` legal commands | shared combat presenters/models | commands recorded on transcript; atomic commit |
| undertaking/free exploration | Kyr objectives plus `Undertakings` | every legal choice remains available; `Glance` promotes a few | aim, novelty, recall and route facets | following is campaign state; travel is ordinary play |
| recruit companion | Kyr dialogue/consequences plus generic companion projection | recruit/talk choices | `Companions`, character/recruit preview | relations and creature party state persist |
| save/resume | session checkpoint and digest | client chooses storage/path | recap is projection, not saved shadow truth | checkpoint contains save + transcript; resume verifies trusted digest |

### Consequential boundary violations

**Findings.** These are architectural issues rather than styling:

1. There are two nested public contracts. `PlayerSnapshot` owns legal choices and player-safe facts, but the browser
   actually depends on the much richer `Screen` + `Leaf` + `Glance`. A new client must discover and compose all four
   classes to obtain parity. This is not duplicated state, but it is a discoverability and versioning problem.
2. `PublicChoice` has stable ids, targets, category, movement, and time, but not typed availability/exhaustion,
   restriction reasons, rank/facet provenance, or a public argument map. Some of this exists later in `Act`,
   `Promoted`, and `Mark`, so consumers must join contracts by id.
3. Opportunity meaning is authoritative but implemented under `src/ui`/`src/presentation`: `Affordances`,
   `Promotion`, `Glance`, `DangerSense`, and `Perception` make semantic decisions. They run in the engine worker and
   are shared by the prototype, so React is not the authority; their package names obscure the boundary.
4. Generated-world startup eagerly installs enough distant content to produce 130,826 facts, 30 modules, a 23.8 MB
   raw checkpoint, and roughly 500 MB RSS before the first choice on the measured `wren` game. This is an engine
   composition/state-size problem, not a graphics problem.
5. The old interactive CLI used `Campaign` directly, printed `InformationView` JSON, drove combats outside
   `PlaySession`, and wrote a bare campaign save. It was a useful debug shell, not a second first-class client.

**Harmless presentation logic.** React's columns, truncation, keyboard focus, typography, paintings, animation,
map camera, and grouping of already-typed rows are proper client concerns. Label shortening such as removing `To`
for a way's compact caption also changes no meaning or legality.

**Residual browser heuristics.** They do not manufacture legal commands, but should gradually consume typed data:
`AtHand` detects gather/read/look groups from labels or id suffixes; `GlanceStage` detects buying and rewrites some
look labels; `TalkStage` recognizes repeated topics and aim wording. These are low-to-medium boundary smells because
they affect grouping/emphasis, not state transitions. Add typed `does`, subject, and display-role fields before
removing them; do not move CSS-level decisions into Kyr.

## 2. Verified Orsino comparison

Source was inspected directly at pinned revision `4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3`, the same revision recorded
by Westernesse's Orsino registry.

### Structure and purity

Orsino's useful seam was `Driver`: output, selection, confirmation, input, pause, and key reading were injected
(`src/orsino/Driver.ts:11-21`). `NullDriver` selected enabled choices without I/O (`:160-185`), which let the same
combat/dungeon/module loops autoplay. This is worth reviving as a principle: hosts provide choices; they do not own
rules.

It was not otherwise pure. `ModuleRunner` owned generation, I/O, journal, mutable game state, town feature dispatch,
dungeon transitions, and day/weather loops together (`src/orsino/ModuleRunner.ts:88-150` and onward). Random choice
in `NullDriver`, template ids made with `Math.random`, globally mutable unique-pick sets, direct mutation of PC and
inventory objects, and event logfile side effects made exact replay and forked tests difficult. Westernesse's
immutable world, keyed randomness, public command ids, atomic combat, and digested transcript should not be traded
for that simplicity.

### Deem breadth

Orsino's templates expressed compositions Westernesse should learn from: nested towns with deity/tavern/hall/shops
(`settings/fantasy/templates.json:94-104`); people with noble houses, personality, hometown, language-derived names,
background and calling (`:139-180`); shrines, riddles and traps (`:420-453`); rooms with encounter/puzzle/treasure/
trap/features/aura/shrine/wonder (`:465-497`); multi-room dungeons and a generated objective/rumour (`:521-547`);
and whole modules (`:549-563`). Overlays (`*`/`^`), nested `gen`, `mapGenList`, lookup conditions, intermediate
fields, and removals made substantial variation concise.

Westernesse has migrated much more than a catalog comparison suggests: its generated scenes, settlements, people,
shops, works, wild meetings, ecology, treasures, faiths, deep rooms, and Kyr templates cover the same territory with
stronger identities and executable authored meaning. Concrete Orsino patterns not equivalently authorable through
one public path are: a generated multi-room circumstance carrying its objective and rumour as one composition;
conditional overlays across a whole generated dossier; author-defined generated stock created during play; and
compact paired variation of a person, household/house, hometown, speech/personality, and scenario role. Westernesse
often achieves these through TypeScript region writers plus several data/Kyr files rather than one inspectable
composition.

Do not revive Orsino's free-form JSON object as executable truth. Deem should produce typed dossiers and role
bindings; Kyr should declare the actions, observations, conditions, and consequences that give them meaning.

### Terminal and tests

Orsino's ordinary numbered `select` loop was fluid and dependency-light. The same interface served town menus,
equipment, dungeon decisions, and combat. It became cumbersome because nested menus cleared/reprinted frequently,
choices carried arbitrary values rather than stable public ids, and presentation was called from stateful runners.

The tests generated PCs/rooms, ran combat to completion, killed each room's monsters to traverse a dungeon, and ran
whole modules with a noninteractive driver (`test/orsino.test.ts:90-140`, `:179` onward). This provided broad smoke
coverage but weak reproduction: contemporary `Math.random` decided runs and assertions mostly checked shape or an
eventual winner. Westernesse's recorded command streams, deterministic seeds, checkpoints, digest comparisons, and
canonical player-view traces are the stronger continuation. The reusable Orsino idea is cheap injected control;
Westernesse already has it in `CombatController` and should extend that style to a small session host API.

## 3. Smallest authoritative headless contract

**Proposal.** Evolve, do not replace, the existing types. Make one exported `PlayerFrame` whose fields are references
to the existing contracts:

```ts
interface PlayerFrame {
  revision: 1;
  view: PlayerSnapshot;       // safe facts, observations, knowledge, map, all legal public choices
  screen: Screen;             // typed scene, party, inventory, combat-independent interaction tree
  telling: Leaf;              // current narration and feedback
  foreground: Promoted[];     // normally <= 4; exact public command/choice ids
  combat?: CombatScreen;      // only while an encounter awaits player control
  trace?: never;              // developer truth is a separate endpoint/type
}

interface PlayerHost {
  frame(): PlayerFrame;
  perform(command: string, combat: CombatController): Promise<PlayerFrame>;
  travel(destination: string, combat: CombatController): Promise<PlayerFrame>;
  checkpoint(): SessionCheckpoint;
}
```

Minimal additions to existing leaf types:

- `PublicChoice.args: Record<string,string>` for public bindings (not hidden variables), plus `available` and an
  optional player-safe `restriction`; retain `id` as the executable stable id.
- `Promoted.provenance`, a list of typed facts such as authored aspect, perceived sign, followed aim, recall/newness,
  distance, danger estimate, and ranking rule. Existing `why`, `facets`, `aspects`, `tier`, `marks`, and `continues`
  already cover most of the value.
- A typed lifecycle (`new | useful | exhausted | unavailable`) rather than asking clients to infer it from recall,
  disabled text, or labels. Unavailable actions should be present only when the player is entitled to know them.
- Keep `Sensed.far` for bounded distance/uncertainty. Never include omniscient entity state. Put internal operator
  bindings, planner scores, hidden facts, and generation trace in a separately named `DeveloperTrace`.

`Screen` and `Glance` already demonstrate that the browser need not invent semantic opportunities. The integration
change is to make their composition a supported runtime facade and have both clients consume it.

## 4. Working CLI prototype

**Implemented.** `bin/kyrie adventure --world <seed> --as race/calling/name` now starts a generated game through
`DrawnWorld` and `PlaySession`. It renders shared `ScreenModel`/`Narrator` prose; offers the shared `Glance`
foreground on numpad **7/9/1/3** and ordinary **1-4**; lists every legal `PlayerView` interaction with `all`; accepts
an exact public label or id; renders map and character dossier; exposes pack/item/spell interactions through the
complete legal list; drives combat with `Battle.legalCommands`/`CombatChoices`; and saves/resumes a full
`SessionCheckpoint`.

Legacy `campaign` remains supported, and `resume` accepts both the new session checkpoint and an old bare campaign
save. The prototype deliberately uses ordinary text/readline and adds no TUI dependency.

Verified manually on the wolf-yard fixture: attack via shortcut, choose/auto tactical turns, win, persist death and
XP, save, quit, and resume to the same yard with the first wolf dead. Verified on generated seed `a1` with Wat the
human thief: opening prose, three promoted choices, sixteen legal interactions including dialogue, movement,
equipment/light, and scenario actions; map and dossier are available from the same screen projection.

Known prototype limits: character creation is the existing compact `--as` form rather than the browser's full
guided creator; foreground openers that are containers (for example “Talk to …”) fall back to their legal public
choice rather than opening a nested terminal card; no ANSI grid is required; terminal save files are uncompressed.

## 5. Performance evidence

All measurements are this executor, Bun 1.4.3, 11 November 2026; they are baselines, not cross-machine promises.

### Compact authored fixture (`bun scripts/bench.ts`)

Cold load 1,898 ms; same-input warm load 12 ms; choices 52 ms; observe 16 ms; six-tick causeway 74 ms; one wait 19
ms; six waits 104 ms; camp 85 ms; save+restore 122 ms. Peak RSS was 213 MB and the save 1.68 MB. This confirms the
kernel can be fast on bounded state.

### Generated `wren` (`bun scripts/headless-bench.ts wren`)

| Phase | Wall time | RSS after phase |
|---|---:|---:|
| world assembly (8 scenarios) | 1,069 ms | 141 MB |
| session creation/composition | **11,548 ms** | 499 MB |
| initial player projection (18 choices) | 527 ms | 540 MB |
| screen projection | 490 ms | 518 MB |
| narration + opportunity projection (3 promoted) | 52 ms | 516 MB |
| ordinary `wait` | 678 ms | 586 MB |
| checkpoint object | 377 ms | 634 MB |
| JSON serialization (23,843,751 bytes) | 140 ms | 696 MB |
| parse | 77 ms | 680 MB |
| resume | 1,090 ms | 719 MB |
| warm same-world session creation | 216 ms | 738 MB |

`/usr/bin/time -v` reported 17.1 s wall, 22.4 s user, 2.3 s system, 786 MB peak RSS. The raw checkpoint size and
session composition dominate; Deem itself does not.

### Deem and sustained paths

After repairing the stale public generation type in `scripts/deem-bench.ts`, a cold attributes draw was 7.3 ms,
runtime bootstrap 20 ms, and warm creature creation 0.29-1.00 ms each (25 per family). Trace adds measurable but
small cost. In a 20-command headless `wren` run, median command time was about 161 ms; local median 155 ms and travel
166 ms, with a 756 ms maximum. That run peaked near 803 MB.

The browser-engine profile on the same seed/choice record (5 commands, no React or Chromium) began in 26.5 s. Median
command was 909 ms: engine 442 ms, screen 471 ms, narration 54 ms; save median 55 ms with a 1,645 ms first-save max.
It held 130,826 facts and 30 installed modules; peak RSS was 872 MB. Its canonical/fact/player-telling hashes were
recorded, making later comparisons stable. Browser rendering, IndexedDB, paintings, and image loading were absent.

The profile and sim tools had both drifted across the cross-hex travel contract; the experiment repaired them to
use journey context/travel requests. That itself is evidence for one supported host facade.

### Ranked performance recommendations

1. **High benefit, medium risk:** profile `Campaign.load` composition by module and relation. The 11.5 s session phase,
   not the 1.1 s draw, is first. Reuse immutable compiled module/operator definitions across generated sessions and
   retain copy-on-write mutable state.
2. **High benefit, medium/high risk:** stop instantiating/persisting unrevealed distant scenario runtime state. Keep a
   deterministic placement manifest (seed, kit bindings, stable ids) and materialize on approach. Persist every
   revealed/materialized fact so revisits and previous revelations cannot change. Prove eager/lazy canonical parity
   for a route before adopting.
3. **High benefit, low/medium risk:** cache the combined player frame per campaign/world/store version so
   `PlayerView`, `ScreenModel`, `Narrator`, feedback, and promotion do not repeat overlapping scans for one response.
4. **Medium benefit, low risk:** make the compact save path used by the browser available to terminal files, and
   measure checkpoint copy separately from JSON/codec/storage. The 23.8 MB raw state is still the root issue.
5. **High verification benefit, low risk:** keep deterministic checkpoints at journey boundaries and fork them per
   test. Share only immutable definitions; each test owns a restored campaign. Never share a mutable live campaign.
6. **Do not prioritize:** optimizing individual Deem draws, React, paintings, or Ink. The measured budget is elsewhere.

## 6. Kyr/Deem/TypeScript boundary audit

**Findings.** The following are representative, not a request for wholesale migration:

| Current responsibility | Better home | Minimal move |
|---|---|---|
| region/town/site assembly sequences and scenario selection in `src/world` | Deem composition manifest + generic binder | Deem emits typed stable placements/roles; `WorldAssembler` validates/binds only |
| generated person's linked origin, household, trade, manner/speech, local obligation spread across writers/tables | one Deem dossier consumed by Kyr role bindings | add a typed dossier schema and expose fields as kit parameters |
| generic generated local events/traffic prose in TypeScript writers | Deem variation for dossiers; Kyr observations/events for meaning | move one family at a time, retaining generic scheduling in kernel |
| opportunity aspects inferred from schema/id/labels in `ActionPresentation`, `Affordances`, and React fallbacks | Kyr action metadata or composition-kit defaults, with generic engine inference only as fallback | add optional authored `aspects`/display role to action/schema and surface provenance |
| aim advancement inferred by scanning action effects against objective predicates | ideally compiled Kyr objective/action linkage | compiler emits dependency metadata; runtime remains generic |
| weather/scene vocabulary and placement choices embedded in TS | Deem data; Kyr when it changes rules or prose | data-driven vocabulary, typed generated values |

**Exemplary extraction implemented.** The terminal no longer has its own information snapshot, action resolution,
combat loop authority, or bare-save format. It composes the existing player view and renderer-independent narrative
and executes the same public ids through `PlaySession`. This removes duplicated client policy without changing game
rules or authored content.

**Missing authoring contracts, reproduced in existing findings and code:** authored opportunity aspect/provenance;
runtime creation from typed stock; a generated dossier/kit handoff; module-readable weather; initial/time-zero events;
and player-safe restriction reasons. Minimal extensions are metadata and typed binding contracts, not a universal
narrative grammar. Combat resolution, validation, persistence, clocks, identity, atomic transactions, and command
legality should remain TypeScript kernel mechanics.

## 7. Verification and integration

**Implemented evidence.** `PlaySession.canonical()` already serializes transcript, save, player view, and chronicle;
transcript steps include combat choices and per-step digests. Existing tests prove illegal-command atomicity,
combat replay, checkpoint equivalence, and browser bundle/file-source equivalence. This experiment ran 22 relevant
`play-session` and command-contract tests successfully, plus typecheck and targeted lint.

The browser and terminal now share the exact sequence:

```
public id -> PlayerView.resolve -> PlaySession -> Campaign/Battle -> digest -> PlayerView
```

For strict client parity, add one test that starts `DrawnWorld` once for seed `wren` and character Wenna, forks its
checkpoint, drives one fork through the exported player host used by the browser and one through the terminal driver,
then compares after every public command: digest, `PlayerSnapshot`, `Leaf` text, opportunity semantics, and checkpoint
roundtrip. The trace should include local movement, cross-hex travel, dialogue/consequence, item or spell, combat,
and reload. Do not compare screenshots or terminal whitespace.

### Safe after M20

- Land the repaired benchmarks and `headless-bench`.
- Land the terminal client behind `adventure`, plus session-checkpoint resume.
- Export one runtime `PlayerHost` facade assembled from existing classes; add version and parity tests.
- Add typed fields where React currently reads labels; migrate one heuristic at a time.

### M21 architectural work

- Formalize player-frame and developer-trace contracts.
- Move opportunity semantics/provenance to compiled authored metadata plus generic runtime facts.
- Introduce deterministic lazy materialization of distant generated scenarios, proven against eager fixtures.
- Define the Deem dossier -> composition kit -> Kyr role-binding pipeline and migrate a small generated circumstance
  end to end before expanding it.

The governing boundary is therefore achievable and substantially present: Kyr and Deem supply definitions and
authored meaning; the kernel owns truth and transitions; a player-safe runtime projection owns what can be perceived
and done; browser and terminal arrange that projection. The remaining work is to make that projection one explicit,
versioned product of the runtime and to reduce the amount of generated world instantiated before it is needed.
