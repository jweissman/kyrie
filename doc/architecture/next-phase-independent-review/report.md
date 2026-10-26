# Independent architecture review: Kyrie before its next phase

**Snapshot reviewed:** `main` at `69125e50a9108bae503556eba21b3dc219dce5c8`, committed 2026-10-26T09:38:46-04:00
("Small truths kept: a wait broken off told as begun, …"). It was fetched at the start of the review and held fixed.
Nothing after it was considered.

**Branch:** `review/architecture-2026-10-26-next-phase` (the name `review/architecture-2026-10-26` was already
taken on the remote by an earlier review; see section 6), cut from that exact commit in a separate worktree. The only change on it is
this directory. No product code was modified, and nothing was merged, opened as a PR, or commented on.

**Date:** 2026-10-26.

**Evidence:** [`evidence/`](evidence/), with an index of the reproducible probes and their logs in
[`evidence/README.md`](evidence/README.md). Every "Confirmed" finding below has either a probe or a direct code
citation that was read during the review.

> Provenance note. While this review was being set up, `origin/main` was force-pushed: the previous tip `422a4c8`
> is not an ancestor of `69125e5`. Earlier reviews pinned SHAs that may no longer exist on `main`. See L4.

---

## 1. Verdict

Kyrie has a genuinely good kernel idea:
- an immutable fact world;
- demand-grounded action schemas whose one precondition serves the player, the NPC planner and the UI;
- a command transaction with rollback;
- identity-keyed randomness at the campaign level;
- the browser engine isolated in a worker.

The core files under `src/lang` and `src/rules` are, on the whole, free of story nouns. The mission-15 audit's
expansion-atomicity defect (F3) has been repaired properly.

**The architecture is not yet bounded enough to carry a much richer RPG without compounding debt.** The problem is
not code volume. It is that **the declared layers are not the real layers**:

1. **The Kyr "standard library" is the engine's private ABI.** 115 of the 168 relation, measure and query names
   declared in `data/rules/*.kyr` are hard-coded as string literals in TypeScript. 54 sites switch behaviour on
   whether a module happens to declare a given name, and fail silently if it doesn't. Resolver names (`combat`,
   `expose`, `recover` …) are a closed string vocabulary tested in about 20 places across runtime, presentation and
   narration. Authors cannot safely change, extend or replace the rules. (H3)
2. **Presentation is a co-owner of truth.**
   - The runtime imports presentation for night, hours and perception.
   - The session resolves every command, including every replayed command, through `PlayerView.choices`, which
     filters and deduplicates by display wording.
   - The screen model reads omniscient state, re-derives passage legality with clauses missing, and shows enemy HP
     the company cannot see. (H2, H5)
3. **Generation authors plots in TypeScript.** About 300–420 lines of Kyr are emitted by string templates across
   27–29 files in `src/world`: the priest's argument, the rival delvers, the deep-site set pieces, the fever cure in
   every village, origins bound to the `drover` and `fever` scenarios. They sit beside a data template format
   (`.kyrt`) that exists precisely to avoid this. (H4)
4. **"Same seed and choices, same history" is asserted, not verified.**
   - Combat AI tie-breaks depend on the host locale.
   - Item-kind and parse caches carry meaning between campaigns in one process.
   - Resume and replay never compare state, and a build change is not detected.

   (H6, H7)
5. **Some generated countries do not load.** 2 of 41 sampled seeds, and 1 of 100 new games started the way Begin
   starts them, fail with `Unknown export wN`, because the
   assembler ignores a failed placement and a hand-maintained export list goes on naming the site. (H1)

None of this is fatal. But each new adventure, generator and screen today has to touch several of these seams, and
every seam is a list of strings maintained by hand. Section 5 says what I would insist on fixing first.

---

## 2. What is sound and should be preserved

- **`World` as an immutable, indexed fact store** with an incremental 64-bit content key (`src/lang/world.ts:357`)
  and a full `sameAs` comparison. Demand grounding in `Operators` (`src/campaign/operators.ts`) with a bounded
  operator cache.
- **The command transaction**: `Campaign.checkpoint/rollback/undo` (`src/campaign/campaign.ts:256-276`), now
  extended over frontier expansion and telling (`src/session/play-session.ts:93-102`). I re-checked mission-15's F3
  and it is fixed.
- **Identity-keyed campaign randomness** (`RandomStreams`, `World.die`).
- **The browser boundary.** A transitive import trace from `web/reader/reader-main.tsx` reaches no value import from
  `src/campaign`, `src/lang`, `src/battle` or `src/canon`. Runtime code is confined to `web/engine/*`, in the worker.
- **One mechanical meaning for abilities.** The typed effect language (`src/lang/Abilities.ohm`) feeds both combat and
  `MechanicsText`.
- **Strict generation** (Deem `select` fails rather than falls back) and the author-facing lint (`bin/kyrie lint`).
- **The `Thing`/`State`/`Change` idiom** for doors and obstacles is used consistently across content.
- **General rest, lodging, buying, selling and appraising actions** live once in `data/rules`; no adventure reimplements them.

---

## 3. Findings

Severity rates the likely impact on gameplay, authoring or replay. Confidence says how it was established:
- **Confirmed**: a probe reproduces it, or the code path was read end to end.
- **Strongly supported**: the code reading is unambiguous, but there is no runtime demonstration.
- **Plausible** and **unverified** are used as the words say.

Findings marked "carried forward" were reported by an earlier audit and are still present.

| ID | Severity | Title |
|---|---|---|
| H1 | High | Some generated countries fail to load (silent placement failure, hand-listed exports) |
| H2 | High | Command legality, replay and world time are routed through the presentation layer |
| H3 | High | The Kyr rule library is the engine's hidden ABI: names, feature detection and resolver vocabulary |
| H4 | High | Generators author plots in TypeScript that emits Kyr text |
| H5 | High | Presentation reads omniscient truth and re-derives rules, incompletely |
| H6 | High | Determinism is asserted, not verified: locale-dependent AI, order-dependent combat RNG, unchecked replay |
| H7 | High | Process-global caches make game meaning depend on process history |
| M1 | Medium | The engine-written relation list is hand-kept and wrong in both directions |
| M2 | Medium | Kyr is too large at the leaves and too small in the middle |
| M3 | Medium | Five composition mechanisms and three meanings of `{x}`; unfilled placeholders pass silently |
| M4 | Medium | Closed English word lists and name regexes classify content in general code |
| M5 | Medium | The combat model has exactly two teams, `'fighters'` and `'goblins'` |
| M6 | Medium | Hidden registries and central edit points for every new generator, work, rule module or site kind |
| M7 | Medium | Party membership has no public lifecycle; two companion systems; generated ids in authored text |
| M8 | Medium | Exceptions are swallowed where failures change the game or hide from lint |
| L1 | Low | The command transaction overwrites authored outcome text with fixed English |
| L2 | Low | Identity encoded in id strings (`__` surgery, role-by-suffix) |
| L3 | Low | Performance figures and generation docs are stale; per-command frontier work |
| L4 | Low | Reproducibility of installs and history |

---

### H1 — Some generated countries fail to load

- **Severity:** High.
- **Category:** Correctness, authorability (generator).
- **Confidence:** Confirmed by probe.

**Observation.** `WorldAssembler` places a scenario's site with
`this.situate(region, site, key)` (`src/world/world-assembler.ts:314`) and ignores its boolean result. The site is
pushed and bound anyway:

```ts
this.situate(region, site, RandomStreams.key(seed, 'world', 'spot', instance, role));
region.sites.push(site); generated.push(site.id);
```

`RegionSites` writes only sites that have a cell (`RegionGeography.seats()` filters `cell === undefined`). But
`RegionWriter.manifest` (`src/world/region-writer.ts:186` onward) exports every `region.sites` id from a hand-written
list. Loading then fails with `Unknown export w12`.

**Expected invariant.** Every exported id exists in the written module. A placement that cannot be situated is
either retried, dropped with its scenario, or reported at generation time, never deferred to the loader.

**Evidence.**
- [`evidence/unloadable-seeds.ts`](evidence/unloadable-seeds.ts) → [`log`](evidence/unloadable-seeds.log): seeds
  `s0`–`s39` and `alpha`. **2 of 41 fail** (`s24`: `Unknown export w8`, sites `w8,w9` without a cell; `alpha`:
  `Unknown export w12`).
- `bin/kyrie world alpha` reproduces it from the CLI.
- [`evidence/begin-seeds.ts`](evidence/begin-seeds.ts) → [`log`](evidence/begin-seeds.log) runs the title page's
  Begin path (`DrawnWorld.start` with a person and an origin) over 100 deterministic seeds: **1 of 100 new games
  fails to start** (`juvesese`: `Unknown export w11`). So the defect is reachable from the title page's Begin.
- The fast test suite is green at this snapshot (857 pass, 36 skip, 0 fail), so nothing in it catches this.
- `Frontier.expand` installs countries beyond the march-stones with the whole-world check off
  (`campaign.install(request, beyond.source, false, true)`).
- `WorldAudit` runs only in `test/world-audit.test.ts`.

**Scope.** Local defect, but its root cause is systemic: see M6 for the hand-listed exports and M8 for the
generation failures that become "nothing".

**Consequence.**
- New games draw a random seed (`web/reader/reader-opening.ts:125`), so some fraction of "Begin" presses can fail
  before play.
- A country drawn mid-game at a march-stone fails deterministically for that seed and side. The command is undone
  (good), but the player can never cross there.

**Recommendation.**
- **Smallest fix:** honour `situate`'s result (choose another kind or spot, or drop the scenario placement with a
  recorded reason). Derive `manifest` exports from the declarations actually written, not from a parallel list.
- **Longer term:** generation should produce a typed module (`ModuleWriter.write` already exists and has no callers
  in `src`), validated by the same compiler before any text is produced.

**Suggested regression test.** A property test over N seeds per terrain and origin: assemble, load, and assert that
`WorldAudit.audit` is empty. It belongs in the fast tier, with a small N and a rotating seed window.

---

### H2 — Command legality, replay and world time are routed through the presentation layer

- **Severity:** High.
- **Category:** Architectural boundary, deterministic execution.
- **Confidence:** Confirmed (code path read end to end).

**Observation.**
- `PlaySession.perform` resolves every command via `PlayerView.resolve` (`src/session/play-session.ts:76`), which
  searches `PlayerView.choices` (`src/presentation/player-view.ts:151-155`). Those choices are:
  - filtered by visibility (`:115`);
  - **renamed** by string replacement of unlearned place names (`:119`);
  - re-worded by `ChoiceWording` (`:120`);
  - **deduplicated by a key that includes the display wording**: `${schema}|${choice.name}|${bindings}`
    (`:129-134`).

  A legal operator that the presentation folds away cannot be executed by the session API.
- Replay (`play-session.ts:118-127`) goes through the same path, so transcripts are coupled to the wording and
  grouping code of the build that recorded them.
- The runtime imports presentation for its own rules:
  - `src/campaign/campaign-tick.ts:2-3,12` (`FictionalTime`, `Calendar`, `LocalObservations`). `dark()`,
    `untilLight`, `hour` and `day` are set from `FictionalTime` (`campaign-tick.ts:44-56`; "Night, for the world"
    is defined in `src/presentation/fictional-time.ts:12`).
  - `src/campaign/interruption.ts:3` and `perceptions.ts:1` (what the player perceives).
  - `src/session/journey.ts:7-11` imports `ui/screen-model`, `ui/choice-list`, the narrator and the feedback view.
- The client authors part of the record. `perform` carries `said`/`move` from the reader
  (`web/engine/protocol.ts:85`). `engine-host.ts:155` writes the reader's label into what is told and kept.

**Expected invariant.** The runtime exposes a presentation-independent set of legal command identities. Presentation
selects among them and may group them, but never decides legality. World time and perception rules live in the
runtime (or in Kyr). The record of what was done is authored by the engine.

**Scope.** Systemic.

**Consequence.**
- Any change to choice wording or grouping can make an old transcript fail with `Unavailable command`, or execute a
  different concrete operator (the first of a folded group).
- A headless agent, an NPC or a test cannot issue a legal command the page doesn't show.
- Day length, night and perception cannot be changed by an author, and changing them in presentation silently
  changes rules.
- The reader's label for `rest_unfed` ("Rest six hours (no rations)") is kept as the story of a one-minute no-op
  (see H5).

**Recommendation.**
- **Smallest fix:**
  - Let `PlaySession.perform` accept any operator id that `campaign.offered()` contains. Keep `PlayerView` for
    display only.
  - Move `FictionalTime`'s rule half (dark, hour boundaries) and `LocalObservations.noticed` into `src/campaign`, or
    better into Kyr `core.kyr` measures.
  - Make the engine word `said`.
- **Longer term:** a `CommandSurface` type owned by the runtime (`{ id, schema, bindings, actor }`). Presentation
  consumes it, and transcripts record it.

**Suggested regression tests.**
- An import-direction lint (no `src/campaign|lang|session|world|rules → src/presentation|ui|narrative`).
- A test that every `campaign.offered()` id is executable through `PlaySession`.
- A golden transcript replayed after a deliberate wording change.

---

### H3 — The Kyr rule library is the engine's hidden ABI

- **Severity:** High.
- **Category:** Authorability, architectural boundary, maintainability.
- **Confidence:** Confirmed (counted).

**Observation.**
- **Names.** Of the 168 `Relation`/`Measure`/`Query` names declared across `data/rules/*.kyr`, **115** appear as
  quoted literals in `src/` or `web/`. The most-referenced: `at` in 43 files, `knows` 16, `able` 15, `state` 13,
  `connects` 13, `itemKind` 11, `capable` 11. Count script inline in [`evidence/README.md`](evidence/README.md).
- **Silent feature detection.** There are **54** sites of the form
  `module.relations.some(r => r.name === 'X')` over **47** distinct names, in 24 files. Examples: `campaign-tick.ts`
  (`dark`, `season`, `dice`), `witnesses.ts:13`, `exposure.ts:13`, `overlays.ts` (`worth`), and 11 in
  `ui/screen-model.ts`. If a rule module renames or omits a name, behaviour stops **without an error**: night never
  falls, witnesses are never recorded, treasure has no worth.
- **Resolver vocabulary.** `Resolve <name>(…)` dispatches through a 30-arm `if` chain
  (`src/campaign/field-resolver.ts:21-75`), with signatures in `src/campaign/runtime-capabilities.ts`. The resolver
  name is then re-tested by string in about 20 places across layers: `campaign.ts:212,231,246,298,335,343,359`,
  `aftermath.ts:18`, `command-resolution.ts:21,32,34`, `watch-loop.ts:43`, `witnesses.ts:13`, `exposure.ts:13`,
  `random-streams.ts:14`, `obituary.ts:58`, `choice-wording.ts:30-36`, `action-presentation.ts:13,38-42`.
- **Rule module registry.** The set of rule modules is a TS constant (`ModuleBundle.world`/`ruleNames`,
  `src/campaign/module-bundle.ts:46-48`). A new `data/rules/*.kyr` cannot be used without editing TS.

**Expected invariant.** The engine depends on a declared, versioned interface. The relations it reads or writes, and
the resolvers it offers, are declared once, by the engine, and checked against the loaded rules. A missing or
mistyped name is an error at load. A resolver's semantics (does it run combat, is it a rest, who is its target) is
declared metadata, not something callers infer from its name.

**Scope.** Systemic.

**Consequence.**
- `data/rules` looks authorable but isn't. Every rename is a silent behaviour change.
- New resolvers (a ritual, a trial, a chase) require touching campaign, aftermath, receipts, watch loop, random
  streams, presentation and obituary.
- The 54 silent checks are exactly the class of bug the project keeps meeting (see M1).

**Recommendation.**
- **Smallest fix:** a single `EngineContract` module listing every relation, measure and query the engine reads or
  writes, with arity and types. `ModuleInstallations.check` fails when the loaded world lacks one or declares it
  differently. Replace each `relations.some(...)` with a lookup through it, so a missing name throws unless that
  entry is marked optional.
- **Resolvers:** turn the `if` chain into a typed table of `{ name, signature, kind: 'combat'|'rest'|'service'|…,
  target, run }`, and make the ~20 name tests query `kind`.
- **Longer term:** an `engine` Kyr module, generated from that contract, that rule modules import, so the boundary is
  visible to authors.

**Suggested regression test.** Load every campaign with each contract name removed in turn. Every removal must
produce a load error naming the contract entry, never a silent pass.

---

### H4 — Generators author plots in TypeScript that emits Kyr text

- **Severity:** High.
- **Category:** Authorability, architectural boundary.
- **Confidence:** Confirmed.

**Observation.** `src/world` holds roughly **300–420 lines of template literals that emit Kyr declarations** (302 by a
strict count of lines starting `` `Rule|Topic|Observe|Action|… ``; 418 by a looser count) across 27–29 files:
`deep-sites`, `deep-mechanisms`, `community-writer`, `deep-rivals`, `region-zones`, `deep-argument` and others. In
each, the structure of a story beat is fixed in code while only its words are in JSON.

**Representative cases.**
- **The priest's argument** (`src/world/deep/deep-argument.ts:29-88`). The opponent is always the town priest; the
  subject is always the `seal`; there is always a grief fact, a promise to wall the stair up, and a "word broken" rule
  once the heart is raised; the penalty is always `refusesService`. Its moves still check the priest's **presence but
  not that the priest is alive or able** (`:61`, `:72`: `at(${p}, site)` without `able(${p})`). That is mission-15's
  F6, carried forward into generated content.
- **The rival delvers** (`deep-rivals.ts:36-120`). Fixed timings (`first = 132`, `pace = 288`), fixed price formulas,
  and fixed outcomes, plus a fate line in English (`:79`).
- **Deep-site speech** ignores its own data. Wandering monsters always announce "Something is coming along the
  **gallery**" (`deep-sites.ts:78`), although each purpose declares its own `walks` (`barrow.json:4`
  "the passage", `waterworks.json:4` "the walkway"). Barrows and cisterns say "gallery".
- **A scenario's cure is ambient everywhere.** Every generated villager whose work knows `water` or `herbs` gets the
  topic "willow bark breaks a fever" (`src/world/community/community-writer.ts:84-93`). The same fact is authored in
  `data/goings-on/fever/situation.kyr`, which duplicates authority.
- **Origins bind particular scenarios by id.**
  - `src/world/origins.ts:114` is `this.placed(placements, 'drover')` and hard-codes that scenario's imports `wife`,
    `son` and `missing`.
  - `:129` does the same for `'fever'`.
  - A `switch` selects one of five binders.
- The structured writer `ModuleWriter.write` (`src/lang/module-writer.ts`) has **no callers in `src`**. Generators
  concatenate strings and the parser re-reads them. Two writers even read their own output back with regexes
  (`RegionRiddles`/`RegionMarvels`: `written.find(l => l.includes(\`Passage ${way} \`))`).

**Expected invariant.** A story structure (a persuasion contest, a rival expedition, a cure known locally) is
authored once, in Kyr or in data, with roles and parameters. Generators choose and bind; they don't write rules. This
is the overview's own rule: "Deem chooses; Kyr means".

**Scope.** Systemic in `src/world`. The runtime core is mostly clean.

**Consequence.**
- Every new kind of opponent, stake or site requires TS changes by someone who knows the emitted grammar.
- Defects such as the dead priest, "gallery" in a barrow, or the fever cure everywhere are invisible to
  `bin/kyrie lint` until a seed happens to exercise them.
- Authors cannot read, override or test these beats as modules.

**Recommendation.**
- **Smallest fix:** move `DeepArgument` to a parameterised Kyr situation (roles `priest`, `seal`, `shrine`, `bane`;
  moves as data). It is a natural first case for the existing role-binding import mechanism. Make the moves'
  speaker check `able`. Use the purpose's `walks`. Gate the willow topic on the fever scenario's presence, or move it
  into that scenario's hooks.
- **Longer term:** give Kyr a parameterised-module form (H4 and M3 share this remedy). Then deep sites, rivals,
  renewal and community troubles become data, and generation emits only bindings, ideally as typed AST via
  `ModuleWriter`.

**Suggested regression test.** A lint over generated modules that rejects any speaker action without an
eligibility clause. A test asserting that each deep-site purpose's prose uses only words from its own JSON.

---

### H5 — Presentation reads omniscient truth and re-derives rules, incompletely

- **Severity:** High.
- **Category:** Narration/state consistency, architectural boundary.
- **Confidence:** Confirmed (each item below re-read during the review).

**Observation.**
1. **What the company knows leaks.** `PlayerView.present` keeps groups even in the dark
   (`src/presentation/player-view.ts:269-270`: `(!dark || e.type === 'group')`). It also copies every member's `hp`,
   `maxHp`, `level`, `classId` and `backgroundId` (`:316-324`). `ui/screen-model.ts` turns this into
   "goblin ×3; level 1; 7 HP each", and the choice list prints `hp/maxHp` per foe.
   - So the prose says "In the dark you can hear…" while the page lists exact HP.
   - The author-concealed kind of a creature with a role is re-exposed by `look()` (`screen-model.ts:254,
     276-282`).
2. **Passage legality is re-derived with clauses missing.** `ui/passage-model.ts:48-75` re-implements `barred`,
   `watched` and `hazardous`, but omits `not opens(a, ?o)` (keyholders and their servants) and
   `not allied(?g, a) and not tolerates(?g, a)` from `barredFor`/`watchedAgainst` (`data/rules/passages.kyr:43-53`).
   - A keyholder's way, or a way guarded by an ally, is shown "blocked / X bars the way" beside a working Go command.
   - Hidden hazards on a visible way are named, since `noticed` is not checked.
3. **Labels restate rules wrongly.** `ChoiceGrouping` hard-codes `rest_unfed: ['Rest six hours (no rations)']`
   (`src/ui/choice-grouping.ts:137`). In fact `rest_unfed` takes `Time 1 minute` and does nothing
   (`data/rules/care.kyr:86-91`). There are 93 hand-written schema-to-English paths overriding authored action names.
4. **Time of day is computed twice, differently.** `screen-model.ts:214-215` derives `daylight` with its own formula
   (evening from 18:00). `FictionalTime.part` (`src/presentation/fictional-time.ts:25`) says evening starts at 17:00.
5. **Classification by English.** About 245 regex literals across `src/presentation` (93), `src/ui` (68) and
   `web/reader` (85) parse the engine's own English back: "reaches level N", "wins the encounter", `/^You do /`,
   "for sale ×N", change-log lines such as `^\+ knows\(…`. Examples are `web/reader/stage/moments.tsx:10-11` and
   `src/presentation/narration.ts:5-28`.

**Expected invariant.**
- Presentation renders a *knowledge projection*: what the company perceives and knows, produced by the runtime.
- Legality and reasons for unavailability come from the same precondition the runtime uses.
- Structured events, not English, cross the boundary.

**Scope.** Systemic (repeated pattern).

**Consequence.**
- Players see facts the fiction hides, and hidden traps.
- Players are told a way is barred when it isn't, and that they rested when they didn't.
- Every wording change in the narrator can break a regex in the reader, with no type error.
- A richer RPG (stealth, disguise, fog of war, unreliable information) is not possible while the screen reads truth.

**Recommendation.**
- **Smallest fix:**
  - Drop foe stats from `PresentEntity` unless an explicit runtime predicate (`assessed(actor, group)`) holds, and
    never in the dark.
  - Have the passage row call the rule queries (`barredFor`, `watchedAgainst`, `noticed`) instead of re-deriving
    them.
  - Delete the hard-coded `rest`/`rest_unfed` labels.
  - Derive `daylight` from the runtime measure.
- **Longer term:** a runtime-owned `Perceived` view (entities, facts, reasons and why-not explanations, all
  structured), plus typed event records (`LevelGained`, `EncounterEnded`) in place of re-parsed prose.

**Suggested regression tests.**
- A dark-room snapshot test asserting no `hp` reaches the screen model.
- A passage test with a keyholder and an allied guard.
- A property test that every `blocked` row has no legal `go` across it.

---

### H6 — Determinism is asserted, not verified

- **Severity:** High.
- **Category:** Deterministic execution, testing.
- **Confidence:** Confirmed by probes (items 1 and 3); read in code (item 2).

**Observation.**
1. **Combat AI ties are broken by host locale.** `Tactics.choose` sorts by
   `a.command.target.localeCompare(b.command.target)` with no locale argument (`src/tactics.ts:48-50`). In a browser
   that is the reader's locale.
   - [`evidence/det-locale.ts`](evidence/det-locale.ts) → [`log`](evidence/det-locale.log) runs the same seeded fight
     under a simulated Estonian, Czech or Danish default: **20 of 20 seeds pick different targets**, and a different
     enemy dies.
   - NPC combat choices are not recorded in transcripts (`play-session.ts:88` records only the player's).
2. **One combat RNG stream, consumed in order.** `this.expressions = new Expressions(\`${seed}:combat\`)`
   (`src/battle.ts:50`). Any change in the number of draws (a new reaction, an extra combatant, a new check) shifts
   every later roll in the fight. That contradicts "randomness is keyed by identity" inside combat, though it holds at
   the campaign level.
3. **Resume and replay never compare state.**
   - `PlaySession.resume` trusts `checkpoint.save`.
   - `replay` compares only the number of combat commands per step (`play-session.ts:118-127`).
   - `bin/kyrie replay` prints the canonical state and compares nothing.
   - [`evidence/det-replay-verify.ts`](evidence/det-replay-verify.ts) → [`log`](evidence/det-replay-verify.log):
     a checkpoint tampered to `elapsed = 501`, with an added step `never-performed`, resumes without error, while its
     transcript replays to `elapsed = 1`.
   - A save from a different build is re-validated structurally and played on with new rules
     (`web/engine/engine-host.ts:124`). All unbuilt runs report `'dev'`.

**Expected invariant.**
- The same seed, commands and build give the same history on any host.
- A divergence is detected at the step where it happens.
- A save from another build is either replayed from its transcript or flagged.

**Scope.** Systemic.

**Consequence.**
- Bug reports from players in other locales do not reproduce.
- The autoplay "laboratory" and replay tests can pass while histories differ.
- After an engine update, a kept game silently continues from a state the new rules would never have produced.

**Recommendation.**
- **Smallest fix:**
  - Use plain code-unit comparison (`a < b ? -1 : a > b ? 1 : 0`) wherever ordering affects rules, and lint against
    bare `localeCompare` outside `src/ui` and `web`.
  - Store `world.key()` plus a creature-store digest per transcript step, and verify on replay and resume.
- **Longer term:** key combat draws by `(battle, round, actor, purpose)`, as campaign draws are already keyed. Record
  the build identity in transcripts, and replay on mismatch.

**Suggested regression tests.**
- Run the replay suite under a non-English collation (the probe's approach).
- A per-step digest test that fails on any divergence.
- A test adding an irrelevant draw early in a fight, asserting later unrelated rolls are unchanged.

---

### H7 — Process-global caches make game meaning depend on process history

- **Severity:** High. This partly carries forward mission-15's F1.
- **Category:** Deterministic execution, correctness.
- **Confidence:** Confirmed by probes.

**Observation.** `LocalKinds` remains a process-global singleton that mutates the shared catalogs
(`src/canon/local-catalog.ts:57-107`). The code itself notes that interleaved campaigns "would still meet". The
poison-on-refusal bug is fixed (validation now precedes `installed.add`). Three caches keyed by bare id or text sit
outside its reset:

- `Items.consumables` (`src/campaign/items.ts:21`) and `CreatureFacts.uses` (`src/campaign/creature-facts.ts:215`)
  are keyed by item-kind id.
  - [`det-kind-cache`](evidence/det-kind-cache.log): campaign B (`Kind tonic like elixir_of_strength`) offers
    `use_item` alone, and offers **nothing** after campaign A (`Kind tonic like wine`) ran first.
  - In reverse order, A offers a use it shouldn't.
- `ModuleParser.parsed` is keyed by source text (`src/lang/module-parser.ts:89`).
  - [`det-parse-cache`](evidence/det-parse-cache.log): `Kind figurine like dreg_ox` fails in a cold process but
    succeeds after another campaign loaded `dreg_ox`, **and still succeeds after `LocalKinds.reset()`**.
  - `ModuleBundle.prepare` parses ahead in a warm worker (`src/campaign/module-bundle.ts:160-172`), so a frontier
    country can load warm and fail on cold resume or CLI replay.
- Concurrency: [`det-concurrent`](evidence/det-concurrent.log). Two valid campaigns that each declare `Kind token`
  load alone, but fail together under `Promise.all` ("declared differently by two modules").

**Expected invariant.** A campaign's catalogs and caches are values owned by that campaign, or keyed by catalog
identity. Nothing it means depends on what else the process did.

**Scope.** Systemic (a global-state pattern).

**Consequence.**
- The test runner, preview, lint and the browser worker can each see a different game from the same files.
- Cross-campaign persistence (the README's "the country remembers you") will multiply this.

**Recommendation.**
- **Smallest fix:** clear `Items.consumables` and `CreatureFacts.uses` in `LocalKinds.reset/activate`. Key
  `ModuleParser.parsed` by `(text, catalog fingerprint)`. Make `Campaign.assemble` hold a lock across its awaits.
- **Longer term:** a `CatalogContext` passed explicitly (base catalog plus campaign overlay), with the static
  `ItemCatalog.definitions`, `Content.abilities` and `Canon.*` reads routed through it.

**Suggested regression test.** The three probes, as tests: A then B, B then A, and both concurrently, with canonical
digests compared to each run alone.

---

### M1 — The engine-written relation list is hand-kept and wrong in both directions

- **Severity:** Medium.
- **Category:** Testing, authorability.
- **Confidence:** Confirmed by probe.

**Observation.** `EngineWrites.names` (`src/campaign/engine-writes.ts:9-11`) tells lint and the world audit which
relations the engine writes. `ActionSchemas.context` (`src/campaign/action-schemas.ts:51-55`) treats every other
relation that no action or rule writes as a world constant, and prunes against initial facts.

- **Missing:** `exposedTo` (written by `src/campaign/exposure.ts`) and `witnessedAttack` (written by
  `witnesses.ts`).
- **Listed but never written by any engine code:** `defeated` and `ended`.

[`evidence/engine-written.ts`](evidence/engine-written.ts) with fixture
[`probes/engine-written`](evidence/probes/engine-written/) shows:
- `action scorched__sift has no possible target in this world`, for an action waiting on `exposedTo(site, fire)`,
  which the engine writes after any fire area attack;
- the same for `gloat`, which waits on a module-declared `defeated`.

The file's own comment records the same bug for `joinedAs` (The Patient Star's "Let Saro hold on"). It was fixed by
adding one name to the list.

**Expected invariant.** What the engine writes is derived from the code that writes it (the H3 contract), not
restated.

**Scope.** Repeated pattern (the third known instance).

**Consequence.** Lint reports reachable actions as impossible, and the audit misjudges whether stories can end.
Authors learn to ignore lint.

**Recommendation.** Fold into the H3 contract. As an immediate step, add `exposedTo` and `witnessedAttack`, remove
`defeated` and `ended`, and assert in a test that every `ModuleWriter.call('<name>'` in `src/campaign` that is
asserted appears in the list.

**Suggested regression test.** The probe fixture, checked into `test/fixtures/probes`.

---

### M2 — Kyr is too large at the leaves and too small in the middle

- **Severity:** Medium.
- **Category:** Authorability.
- **Confidence:** Confirmed (counts); the latch count uses a heuristic script.

**Observation.**
- **Size.** `Declaration` has 28 alternatives. The grammar has about 169 reserved words. `Person` alone accepts 42
  parts.
- **Dead constructs.** `Exit` and `Budget` appear in **no** `.kyr` file. Several parts are used by one module only
  (`Ending`, `Likeness`, `Grave`, `Refuge`, `Pursuit … using`).
- **Missing middle.** The most common authored needs have no construct, so content works around them:
  - **No once-only Rule.** By the heuristic in [`evidence/latch.py`](evidence/latch.py), **262 of 731** content Rules
    assert a fact their own guard negates. The guide explains why (`doc/authoring/guide.md:704-706`), and it is where
    `told_x`, `thanked`, `asked` and `met` come from. Those flags are declared separately in several modules with
    differing arities.
  - **Money.** 29 hand-written `Decrease quantity(actor|party, gold)` and 45 `Increase quantity(…, gold)` sites
    outside the rules.
  - **No timer or deadline.** There are 26 `*At/*Due/*By` measures and over 100 raw `watch(clock) >=` comparisons.
  - Other missing constructs: a `defeated` query; schedules (paired teleport rules); leaving the party; removal from
    play (four invented `limbo`/`nowhere` places); light tied to a thing's state; a place description slot
    (`Observe X_scene at P when true` written about 479 times).
  - **Five routes to teach one fact:** a Topic `On discuss`, `Known by`, `teaches`, `Source … readable by`, and
    `Found by searching`.
  - `Pursuit stay_close` is copied verbatim into 4 modules.

**Expected invariant.** The common case is one line. Rare cases may be verbose. Unused syntax is removed.

**Scope.** Systemic.

**Consequence.** Content is mostly bookkeeping, and every module re-solves "say this once" and "pay this person"
slightly differently. That is exactly the duplication a richer RPG multiplies.

**Recommendation.**
- **In priority order:** `once` on Rule; `Pays N coin to X` and `Rewards N coin` parts; an `after N hours` timer
  form; a `defeated(g)` query in `core.kyr`; `following` implying staying close; a Place description slot.
- Delete `Exit`, `Budget` and the other unused productions, or give them a test each.

**Suggested regression test.** A grammar coverage test asserting each production is used by at least one fixture;
CI fails on new dead syntax.

---

### M3 — Five composition mechanisms and three meanings of `{x}`

- **Severity:** Medium.
- **Category:** Authorability, correctness.
- **Confidence:** Confirmed.

**Observation.** A parameterised piece of story can be made in at least five ways:

1. Module imports with role binding (scenario manifests in `data/scenarios`, whose `places` use a mini-language:
   `"settlement": "any"`, `"way": "near:town"`).
2. Kits (`data/kits/*/kit.json`), with predicate slots and Deem tables.
3. Goings-on Deem templates (`data/goings-on/*/templates.json`).
4. `.kyrt` text templates with `{w}` substitution and sections (`data/generation/works`).
5. TS string emitters with JSON phrase tables (H4).

`{x}` means three things:
- a generator placeholder (9 separate `fill` functions plus about 25 `.replace('{…}')` chains);
- a Kyr runtime entity reference (`ObservationText.pattern`);
- Deem `#{…}`.

Every `fill` falls back to `?? whole`, so an unfilled `{priest}` passes silently into Kyr as a reference to an
entity named `priest`. At render time `ObservationText.label` returns the bare id. `.kyrt` substitution
(`src/world/history/work-plans.ts:93`) inserts raw values into quoted Kyr strings without escaping.

**Expected invariant.** One parameterisation mechanism, typed parameters, and unfilled parameters as errors.

**Consequence.** Authors must learn five systems. Bugs show up as stray words in prose, found only by playing a seed.

**Recommendation.** Make an unfilled placeholder in any `fill` throw at generation, and escape `.kyrt` values. Then
converge on one parameterised-module form (H4), retiring `.kyrt` and the TS emitters into it.

**Suggested regression test.** Generate N seeds and assert there is no `{identifier}` in any emitted string whose
identifier is not a declared entity.

---

### M4 — Closed English word lists and name regexes classify content in general code

- **Severity:** Medium.
- **Category:** Authorability, maintainability.
- **Confidence:** Confirmed.

**Observation.** The owner's "wine and armor" example (`src/item-names.ts:5-7`, 28 mass nouns used by generation and
presentation) is one of many. The common cause is that the catalog has no field for the fact, so code infers it from
names:

| Fact | Inferred by | Where |
|---|---|---|
| Is a light source | regex over the item's English `use` sentence | `src/campaign/module-assembly.ts:229` |
| Counts as "running the toll" | regex over action names (`/toll\|run/`) | `src/narrative/voice-context.ts:97-100` |
| Combat role (for barks) | `f.name.toLowerCase().includes(role)` | `src/narrative/barks.ts:12,48` |
| Takes "the" rather than "a" | office-word regex | `src/presentation/narrator.ts:207-208` |
| Gatherable plant | fixed list `['willow',…]` | `src/world/region-growth.ts:30`, overriding `organisms.json`'s `stand` |
| A place or a group | id-suffix regex `/_(taproom\|shrine\|shop\|green)$/` | `src/world/scenario-word.ts:63-64` |
| Burning light items, resources | `torch`/`candle`/`lamp_oil` and English plurals | `src/ui/screen-model.ts:225-237` |
| Skills that matter | 11 fixed skill ids from the retired March | `src/presentation/company-preview.ts:31-32,129` |

Site-kind vocabulary is repeated in 5–8 TS tables (`region-sites.ts:17-28`, `region-geography.ts:20`,
`region-ecology.ts:24`, `place-names.ts:29`, `land/atlas.ts:48`, …), and those tables already disagree.

**Expected invariant.** Catalog entries declare grammatical number, light, role and gatherability. Code reads
declared fields.

**Consequence.**
- A new item called "flour" reads "a flour".
- A new lamp is not a light.
- Any action named `run_errand` counts as running the toll.
- A fighter named "Banditha" gets bandit lines.

**Recommendation.** Add `mass`, `light`, `role` and `office` fields to the relevant catalogs and Kyr `Kind`
declarations, and replace each table with a read of them. Move the site-kind tables into
`data/generation/tables/places.json`.

**Suggested regression test.** A test that greps `src` for multi-word English alternations in regex literals, with
an allow-list that should only shrink.

---

### M5 — The combat model has exactly two teams, `'fighters'` and `'goblins'`

- **Severity:** Medium.
- **Category:** Architectural boundary, authorability.
- **Confidence:** Confirmed.

**Observation.** `export type Team = 'fighters' | 'goblins'` (`src/model.ts:7`). The arena's name is used across
battle, campaign, presentation, narrative and autoplay: 49 literal uses of `'fighters'`/`'goblins'` in total, for
example:
- `battle.ts:115` validation;
- `campaign.ts:217,283,331-332`;
- `engagement.ts:100`;
- `aftermath.ts:19`;
- `danger-sense.ts:67`.

Victory is inferred in several places as `outcome === 'fighters' || fled?.team === 'goblins'`.

**Expected invariant.** Sides are values (any number, each with allegiance).

**Consequence.**
- No three-way fights.
- No NPC allies fighting as their own side.
- No NPC-versus-NPC fights, so the "living world" cannot resolve a feud by combat.
- No monsters fighting each other.

These are standard RPG situations.

**Recommendation.** Introduce `SideId` and per-side outcome, and keep `'fighters'` only as the company's side id.
Centralise "who won" in one function.

**Suggested regression test.** A three-sided battle in the arena test, and an NPC-versus-NPC encounter during a
watch.

---

### M6 — Hidden registries and central edit points

- **Severity:** Medium.
- **Category:** Maintainability, authorability.
- **Confidence:** Confirmed.

**Observation.** Adding a kind of content requires editing central TS lists, some of them populated by import side
effect:

- **Work plans.** Each `.kyrt` is imported by name. A static block registers it into the global `Histories`
  (`src/world/region-works.ts:1-13,35-40`). `Histories.make` silently filters unregistered plans.
- **Region generators.** A fixed list in `RegionWriter.body` (`src/world/region-writer.ts:130`). Export ids are
  hand-listed in `manifest` (`:186` onward); this is H1's root cause.
- **Rule modules.** `ModuleBundle.world` (`module-bundle.ts:46-48`).
- **Resolvers.** `FieldResolver` plus `RuntimeCapabilities`, with no registry.
- **Origins.** A `switch` (`origins.ts:79-87`).
- **The title page's campaign list.** Titles, seeds and pitches in `web/scenarios.ts:12-33`, which duplicate (and
  already differ from) each manifest's `name`/`pitch`.
- **The default company.** Elen, Bran and Dori are restated in `world-assembler.ts:69-73`, `src/cli/new-tool.ts:39`,
  `data/campaigns/companies.json` and three manifests.

**Expected invariant.** Content is discovered from data (a directory or a manifest), and declares what it exports.

**Consequence.** Each new work, generator or site kind touches up to 8 files. A forgotten edit fails silently or at
load.

**Recommendation.** Directory-scanned registries with a manifest per item, and exports derived from declarations.
`web/scenarios.ts` should read the manifests.

**Suggested regression test.** Adding a fixture `.kyrt` to a temp directory appears in generation without TS edits.

---

### M7 — Party membership has no public lifecycle

- **Severity:** Medium. This carries forward mission-15's F4.
- **Category:** Correctness, authorability.
- **Confidence:** Strongly supported.

**Observation.** There are two companion systems:
- `willing` → `recruit` → `travelsWith`, used in patient-star, low-water, let-one-remember and disputation;
- `acceptsEscort` → `lead` → `following`, used in house-that-grows and caught-below.

Departure is hand-written per module (`Retract travelsWith`, its own `go_home` pursuit). One kit
(`kits/raider-hold/outlaws/folk.kyr:129`) rewrites `brought_home` by hand while its sibling uses the general one.

Because group and member are split, authors name engine-generated ids in prose and rules: `member_son_person`
(`data/goings-on/drover/situation.kyr:71,118-127`), `member_saro_person`, `member_garret_person`.

**Expected invariant.** One typed join, leave and rejoin transition, callable from authored outcomes, owning
`partyIds`, `inhabitants`, `memberOf` and the travel facts together. Authored text names people, never generated
member ids.

**Consequence.** Companion stories, central to the RPG the README describes, each re-solve membership and can leave
contradictory state (mission-15 F4's probe).

**Recommendation.** A `Resolve depart(member, place)` resolver plus a `Leaves` construct. Expose `personOf(member)`,
so authors write the person's id.

**Suggested regression test.** Recruit → authored departure → save/restore → recruit again, comparing all four
representations.

---

### M8 — Exceptions swallowed where failures change the game or hide from lint

- **Severity:** Medium.
- **Category:** Correctness, testing.
- **Confidence:** Confirmed (read in code).

| Site | Effect |
|---|---|
| `web/engine/engine-host.ts:240` `catch { /* … */ }` | Every autosave failure (encode, pack, quota) is silent. The player is never told the game was not kept |
| `src/lang/world.ts:264` `catch { return false; }` in `admits` | A runtime or authoring bug makes an action quietly unavailable |
| `src/campaign/action-schemas.ts:45` `catch { return true; }` | A grounding error counts as "targeted", hiding it from lint |
| `src/world/world-assembler.ts:283,297`, `src/world/compose/proposer.ts:66` `catch { return undefined; }` around Deem | A generation failure becomes "no scenario" or "no site". The world silently differs |
| `src/session/checkpoint-store.ts:38` `catch { continue; }` | A corrupt save slot vanishes from the list |

**Expected invariant.** Failures are either surfaced or recorded as diagnostics. "Absent" is never an error code.

**Recommendation.** Replace each with a typed result carrying a diagnostic. Show autosave failure in the page. Have
lint report grounding exceptions.

**Suggested regression test.** Inject a throwing measure and a throwing Deem table, and assert a diagnostic is
emitted.

---

### L1 — The command transaction overwrites authored outcome text with fixed English

- **Severity:** Low.
- **Category:** Narration/state consistency.
- **Confidence:** Confirmed.

`src/campaign/campaign.ts:298,305,308`:
- Any failed `expose` is told "The hazard brings down the exposed adventurer. … the injury is permanent until
  treated", whatever the hazard did and whatever the action's `Otherwise` says.
- The shelter and wipe-out lines are similar.

**Recommendation:** make these overridable default texts in `core.kyr` (an `Otherwise` on the schema), and assert
only facts the resolver reports.

**Suggested regression test:** a failed `risk` whose hazard only frightens must not say "injury".

---

### L2 — Identity encoded in id strings

- **Severity:** Low.
- **Category:** Maintainability.
- **Confidence:** Confirmed.

- Canonical ids are recovered by stripping namespaces with `replace(/^.*__/, '')` or `split('__')` in 14 places.
  Examples: `items.ts` (`bless`: `faith.replace(/^.*__/, '').replace(/^faith_/, '')`), `screen-model.ts`,
  `voice-context.ts`, `world-audit.ts:53`.
- Roles are recovered from suffixes: `_green` 56 times, `_taproom` 10 times.
- Operators are parsed back from `name(a,b)` (`operators.ts:43-45`).

**Recommendation:** keep `{ canonical, namespace, role }` on entities.

**Suggested regression test:** none needed beyond H3's contract test.

---

### L3 — Performance figures and generation docs are stale; per-command frontier work

- **Severity:** Low.
- **Category:** Performance.
- **Confidence:** Confirmed for the measurements; plausible for the scaling remarks.

**Measurements.**
- Loading one generated region takes **3.2 s for 2,860 entities** (`bin/kyrie world s1`).
- The parallel generation sweep measured 1.8–2.9 s (2,660–2,860 entities) and 136–441 ms to assemble.
- `doc/architecture/performance.md` still cites 648 entities and 1,340 ms. `generated-worlds.md` describes three
  settlements and three sites.

**Per-command work.**
- `EngineHost.ahead()` calls `Frontier.prepare` after every command, cloning the state to build a cache key.
- `Overlays.declareGear` inserts an item entity for every *candidate* starting weapon and armour of every creature,
  with a linear `entities.some` check inside nested loops.
- `Planner.search` re-sorts its whole frontier array on every pop (`src/campaign/planner.ts:22`).

None of this is a problem at today's 20×14 grid. All of it scales super-linearly with richer worlds.

**Recommendation.**
- Keep the performance doc generated by a benchmark script in CI.
- Use a binary heap in `Planner` (`land/min-heap.ts` already exists).
- Index entities by id in `declareGear`.
- Cache `prepare` keys by location, not by a full state clone.

---

### L4 — Reproducibility of installs and history

- **Severity:** Low.
- **Category:** Maintainability, testing.
- **Confidence:** Confirmed.

- **Install.** `deem` and `languages` are pinned by commit as `github:` dependencies, which bun fetches through
  `api.github.com` tarballs. In this review environment those returned 403, and the review had to install them from
  git clones at the pinned commits.
- **TypeScript ranges conflict.** Kyrie peers on `typescript ^5`, `deem` on `>=6 <8`, and `languages` on `^7`.
- **History.** `main` was force-pushed between reviews (`422a4c8` → `69125e5`), so prior reviews' pinned SHAs may
  not resolve.

**Recommendation:**
- Vendor or publish the two packages as versioned tarballs.
- Align the TypeScript peer range.
- Protect `main` against force-push, or tag every reviewed snapshot.

---

## 4. Cross-cutting observations

- **The same bug classes keep being fixed locally.**
  - The comments cite earlier incidents: `joinedAs` missing from the engine-written list; duplicate-label choices
    (P4/F7); dead speakers (F6); "two tests that had tested nothing" in the head commit.
  - In each case the instance was patched, but the hand-maintained list or re-derivation that produced it remains.
  - The findings above are, almost without exception, *lists of strings that restate something declared elsewhere*.
    Eliminating restatement is the single highest-leverage engineering theme.
- **Scenario knowledge is mostly in comments in the core, and mostly in code in generation.**
  - Proper nouns (Merrowdale, the Long Man, Garth) appear in `src/` only in comments that cite provenance.
  - The leaks that matter are structural: plots in `src/world`, word lists in presentation, the `'goblins'` side.
- **Tests are many (195 files) but mostly example-shaped.**
  - The defects found here (unloadable seeds, locale divergence, cache leakage, presentation re-derivation) are
    all ones that a handful of *property* tests would catch: over seeds, over process orderings, over every offered
    command, over every dark room.
  - The verification budget would be better spent there than on further named journeys.

---

## 5. If I led the next six months

I would insist on five corrections, in this order. Each removes a class of bug rather than an instance, and each makes
the next adventure cheaper.

1. **An engine contract** (H3, M1, L2). One TypeScript module declares every relation, measure, query and resolver
   the engine reads or writes: types, arity, and resolver *kind*. Loading checks the rules against it and fails
   loudly. Lint, audit and presentation query it instead of hard-coding names. `defeated`, `once`, `pays` and timers
   become contract-backed rule constructs (M2).
   - *Exit criterion:* removing any contract name from `data/rules` fails load with a message naming it. There are no
     `relations.some(r => r.name === '…')` sites left.
2. **A runtime-owned perception and command surface** (H2, H5).
   - The session executes any offered operator id.
   - The runtime publishes `Perceived` (what the company knows and sees, with structured reasons) and typed events.
   - Presentation renders those and nothing else, and the import-direction lint is enforced.
   - Night, hours and noticing move into `src/campaign` or Kyr.
   - *Exit criterion:* `src/presentation` and `src/ui` import no `World`. Every "blocked" reason comes from a rule
     query.
3. **Verified determinism** (H6, H7).
   - A per-step state digest in transcripts, checked on replay and resume.
   - Code-unit ordering in all rule-affecting sorts.
   - Combat draws keyed by identity.
   - A campaign-owned catalog context, with no static item or parse caches.
   - *Exit criterion:* the three cache probes and the locale probe pass as tests, and replay fails on the first
     divergent step.
4. **Generation that chooses and binds, never authors** (H1, H4, M3, M6).
   - A parameterised Kyr module form (roles plus parameter tables).
   - Port `DeepArgument` first, then rivals, deep rooms and community troubles.
   - Emit typed AST through `ModuleWriter`, with exports derived.
   - Registries discovered from data.
   - *Exit criterion:* `src/world` contains no Kyr keywords in template literals. A property test loads and audits 200
     seeds per release.
5. **Sides, membership and catalog semantics as data** (M4, M5, M7).
   - N-sided combat.
   - One companion lifecycle.
   - Catalog fields for number, light, role and office.

What I would *not* do: grow the grammar further at the leaves (M2), or add more journey tests before these property
tests exist. I would also not start the persistent cross-campaign memory work before (3) lands, because H7 means a
remembered world would currently remember different things depending on what else the process had loaded.

---

## 6. Relation to the earlier review of `0e066e5`

**Where it is.** A separate review of the earlier snapshot `0e066e5` was pushed to the remote branch
`review/architecture-2026-10-26` (commit `112d61f`, `doc/architecture/review-2026-10-26/report.md`) before this one
began. It is not on `main`. Because that branch name was taken, this review is published on
`review/architecture-2026-10-26-next-phase`.

**Overlap, and status at `69125e5`.**
- **Its N3 (the generator emits Kyr strings and reads them back)** is the mechanism under this report's H4 and M3.
  This review adds the plot-level consequences: fixed story structures, the dead-speaker clause and the fever cure
  everywhere.
- **Its N7 (the parse cache keyed by text)** is still reproducible at this snapshot (H7, `det-parse-cache`). This
  review adds two id-keyed item caches and the concurrent-load failure.
- **Its N5 (the layer table is unenforced)** is consistent with H2. This review adds the runtime's import of
  presentation for night and perception, and command resolution through `PlayerView`.
- **Its N2 (saves trusted by format, not build)** has since been partly addressed: `BuildStamp` now gates `trusted`
  (`web/engine/engine-host.ts:124`). H6 records what remains: no state digest, no replay on build change, and every
  unbuilt run reporting `'dev'`.

**New in this review.** These findings are, to my knowledge, not raised by any earlier review:
- H1: unloadable seeds;
- H3: the rule library as the engine's ABI;
- H5: knowledge leaks and the re-derived passage rules;
- H6: the locale-dependent AI and the single combat stream;
- M1, M2, M4, M5 and M7's companion duplication.

## 7. Method and limits

**Reading.**
- I read `src/lang/world.ts`, `asking.ts`, the campaign transaction, tick, watch loop, operators, action schemas,
  resolvers and witnesses/exposure, the overlay and gear code, `PlayerView`, `PlaySession`, the deep generators and
  `region-works`, plus the earlier audits (mission-14, mission-15) and mission-16's report.

**Parallel sweeps.**
- Five read-only sweeps covered: scenario leakage, duplicated Kyr semantics, determinism, presentation authority and
  the generation pipeline.
- I re-checked their principal claims in code before including them, and re-ran every probe they wrote. Where a
  count came from a sweep's script and was not re-derived, it is described as such.

**Probes.**
- All probes live in `evidence/` and run from the repository root with `bun`.

**Not done.**
- No browser play-through was performed.
- The fast test suite (`bun test --parallel`, everything but the Deem choice-space proof) was run on the snapshot:
  **857 pass, 36 skip, 0 fail across 192 files, in 9 min 38 s** on a machine shared with the probes. Of the skips,
  8 browser suites are gated on `KYRIE_BROWSER`, one on `KYRIE_LONG`, and one on a pinned Orsino corpus. None of the
  defects above is caught by the suite.
- The `deem` and `languages` packages were treated as external and audited only for ambient randomness.
