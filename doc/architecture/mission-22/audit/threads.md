# Unfinished and unconnected threads (audit, 17 November 2026)

The owner, 17 November: look for "unfinished ideas in the repo, threads that don't really connect to other things,
or tools that aren't integrated or synthesized well; or in general just things that could use a higher-level API to
make them more accessible to other parts of the system".

Read at `99ea0c8d` (origin/main). Nothing was run except grep, git log and the register scripts. Each finding was
checked in the code. Candidates that turned out to be wired after all are listed at the end, so that nobody chases
them again.

**How the graph was read.** Every file in `src/cli/`, `test/support/` and `scripts/` was looked up as an import or a
path in `src`, `web`, `test`, `scripts`, `bin`, `.github` and `package.json`.
- Most of `scripts/` has no importer. That is normal, because a script is an entry point run by hand. A script counts
  as a finding only when something newer replaced it, or it duplicates another.
- Every `src/cli` tool is reachable from `bin/kyrie` (`src/cli/kyrie.ts`, 28 commands) or from the one tool that uses
  it.

**Sizes.** S is under a day, M a few days, L a mission line.

---

## Ranked by leverage

### 1. Each client turns the glance's offer into commands in its own way

**Where.** The engine's projection stops at `Glance.offer` and `Promoted` (src/presentation/glance-types.ts). From
there, each client works out for itself which command a row stands for:

| Client | Resolution | File |
|---|---|---|
| runner | `Runner.offer`, `within` (an opener done by its `inside[0]`), `way` (an exit to its move), `keyed`/`opener`/`first` (a keyed act to its first command), `RunnerLed.of` (which of the four serve the aim's step) | src/cli/runner.ts:94-171, src/cli/runner-led.ts |
| terminal | `Terminal.led`, `Terminal.way`, `Terminal.drawn`, `Terminal.talk` | src/cli/terminal.ts:198-232 |
| autoplay | `AutoplayRun.led`: a talk recognised by slicing `#talk` off the choice id, then `for`, then `ask(`, then `talk_to(...)` | src/autoplay/run.ts:112-126 |
| serve | `Serve.view().led`: the acts as they are, with no resolution | src/cli/serve.ts:27-38 |
| tests | `Journey.find`/`matches`: label patterns over `ChoiceList` leaves | src/session/journey.ts:81-158 |

**What it was for.** The projection audit (mission-21/projection-audit.md) cut the second paths for Follow and roads.
It left "action wording … partly" and the per-client resolution untouched.

**Evidence that it bites.**
- WD-15: the lab's aim-followers "take talk_to and never the topic behind it". Autoplay resolves a talk differently
  from the runner, which goes by `inside`.
- PF-02: the runner had done an opener's first act under the opener's words.
- PB-26/PB-27: walker artefacts.

**What would connect it.** One engine function from a glance to *doable rows*. Each row would carry its command, its
words, its type, its aspects, `continues`/`advances`, the aim it serves, and the lens it lives in. Every client
would read it.

**Recommendation.** Consolidate behind an API (`Doable.of(campaign, screen, glance)` in src/presentation). This is
the resolver the intent runner below is built on. **M**

### 2. Two stdio protocols for agents, and neither is the page's

**Where.**
- `bin/kyrie serve` (src/cli/serve.ts, 71 lines; test/serve.test.ts) has `start`, `act`, `view`, `card`,
  `checkpoint` and `resume`. It is "the forward-design record's second prototype" (doc/history/reviews/
  2026-11-11-forward-design.md, direction C: create/observe/act/checkpoint/replay/fork).
- `bin/kyrie run` (src/cli/runner.ts and 9 `runner-*` modules) has `act`, `lens`, `look`, `more`, `follow` and
  `--create`. It is TB-05, the one the blind agents and every matrix script use.

**The gaps between them.**
- serve has checkpoint, resume and the entity card. The runner has none of them, so a cold agent cannot branch
  from a state (Phase B's "checkpoint-based branching").
- The runner has lenses, fights, creation and the prose budget. serve has none of them.
- Both drive `PlaySession` directly. The page drives `EngineHost` (web/engine/engine-host.ts). Only the runner's
  creation goes through EngineHost (src/cli/runner-creation.ts).

**Recommendation.** Consolidate: give the runner `checkpoint`, `resume` and `card`, then retire serve, moving its
spec's assertions to the runner. Later, put the runner on EngineHost frames (see 3). **M**

### 3. The terminal still plays by the session, not by the engine's frames

**Where.**
- src/cli/terminal.ts imports `Battle`, `Tactics`, `LandCrossing` and `PlaySession` directly. It fights by
  `session.leg(choice.id, async battle => …)` (line 423) and follows by `session.leg('follow:…')` (lines 272, 275).
- mission-21/workflow-parity.md lists both as "what still decides gameplay in one client only" (rows 4 and 5).
- TB-10 is partly: travel, follow and the fight go by the session; talk and the fight hand do not.

**What would connect it.** The terminal draws `EngineHost` frames (`perform`, `travel`, `fight`, `follow`) as text,
as the page draws them as DOM.

**Recommendation.** Integrate, after 1, so the terminal's talk four and fight four come from the engine. **M–L**

### 4. Interaction rules that live only in the page: LensFocus, TalkFocus, the map's interruption

**Where.**
- **web/reader/stage/lens-focus.ts (OR-59, today).** A riddle's words are focused as a thing, so the four become its
  answers. It is used by explorer.tsx, glance.tsx, lens-focused.tsx and test/small/lens-focus. The runner's
  `lensed` (runner.ts:224) and the terminal's lens return the flat ranked list, so a headless riddle still pages.
- **web/reader/talk-focus.ts (the owner, 5 Nov).** A conversation's salience order: the owed answer, the aim's ask,
  what the last answer opened, the unasked. The terminal ranks the same talk by `Attending.talk(...).replies` sliced
  to `4 - leave` (terminal.ts:220-231). test/support/honest-player.ts and signals.ts import the page's file to get
  the rule.
- **web/reader/map-menu.tsx:79-89.** "Something is here: put away the map", the map held when a journey is stopped
  by danger (OR-63). The rule is decided in the component from `app.menu.scene.subjects`.

**What would connect it.** Move each into src/presentation as part of the offer: `Lensed.rows` focused,
`Offers.talk`, `Glance.held`. Clients then draw what the engine says.

**Recommendation.** Consolidate behind the projection. The workflow-parity principle ("presentation stays
client-side: opening a lens, moving focus") still allows the page to *animate* focus. Which rows a focus holds is
game structure. **M**

### 5. Five path-finders over the same `connects` relation

**Where.**

| Path-finder | What it does | File |
|---|---|---|
| `Journey.way`/`route` | BFS with `usable` (known, equipped, unbarred) and a dry-first pass | session/journey.ts:421-453 |
| `AimLead.way` | BFS over every `connects`, usable or not, cached per world | presentation/aim-lead.ts:98-118 |
| `ExpeditionContract.walk` | BFS, undirected | world/expedition-contract.ts:82-99 |
| `Itineraries.plan`/`graph` | the known-ways planner the page and `travel:` use | ui/itinerary.ts:37-110 |
| `Roads.route` | the land's road cost | world/land/roads.ts:63 |

**The trouble.**
- Only `Journey.way` knows usability and spate, and only tests and `bin/kyrie play` reach it (the `>place` step).
- `AimLead.way` can call a barred way "toward".
- An intent "go toward X" today has no engine call that a player is entitled to: `Itineraries.plan` serves known
  places, `Journey.way` is a spec helper.

**Recommendation.** Consolidate. One `Ways.route(campaign, from, to, { known, usable })` in src/ui beside
Itineraries, with Journey and AimLead calling it. The intent runner's `go` needs it. **M**

### 6. Three taxonomies of what an act is, and the intent catalogue sits in scripts/

**Where.**

| Taxonomy | What it holds | File |
|---|---|---|
| `ActType` | 11 kinds, on every offer | src/presentation/offer.ts:12 |
| `AutoPlayer.kinds` | 13 regexes over command names (`/^(talk_to\|ask\|tell…)\w*\(/`) | src/autoplay/player.ts:41-55 |
| `IntentCatalogue.table` | 10 families over 83 library schemas (the owner, 15 Nov; PB-18) | scripts/intent-catalogue.ts |

Only test/small/intent-catalogue imports the catalogue. No runtime code reads it, and nothing ties it to
`ActType`.

**Why it matters.**
- The owner's experience-pins note says "reuse the existing semantics … build no new taxonomy". Three exist anyway.
- The boredom census counts kinds by autoplay's regexes, not by the catalogue's families.
- Phase C §D (17 Nov) asks for "a player-intention verb taxonomy". That would be a fourth.

**Recommendation.** Consolidate.
1. Move the family table into src/presentation (a schema's family), and give `Offered` its `family`.
2. Have `AutoPlayer.kind` and the census read it.
3. The intent runner's vocabulary is these families (see intent-runner.md).

**S–M**

### 7. `kyrie transcripts` was built to replace seven per-adventure scripts, and the seven remain

**Where.**
- src/cli/transcripts-tool.ts (eddf182c, 3 Nov) says: "each adventure had written its own script for it, seven in
  all".
- All seven remain in scripts/: hessel, liberty-of-the-ice, low-water, parliament-of-books, skeel, the-grand-tour,
  winter-in-carth (`*-transcripts.ts`, 32–137 lines each). Their docs still name them (e.g.
  doc/adventures/banns-at-hessel/04-adaptation.md:105).

**Recommendation.** Retire. Write each script's steps as the tool's steps JSON under test/fixtures/<adventure>, point
the adventure's docs at `bin/kyrie transcripts`, and delete the scripts. **S**

### 8. Unused, overlapping and misplaced test drivers in test/support

**Where.**
- **test/support/cold-player.ts** (106 lines, 4bcc957a, 7 Nov) has never been imported by anything (`git log -G`
  shows only its creation). It overlaps `honest-player.ts` (12 Nov; used by a spec) and `RunnerWalk` ("from what
  the runner said alone").
- **test/support/ui-discovery.ts** is a script, with a `main` that builds the site and writes button-data.json
  (closeout.md:114). It sits among the support modules.

**Recommendation.**
- Retire cold-player. Its useful idea (match an aim's words to someone present) is the intent runner's honest
  fallback.
- Move ui-discovery to scripts/.

**S**

### 9. The engine depends on the page for creation's numbers and words

**Where.**
- src/creation/creation-flow.ts:4-5 and web/engine/engine-creation.ts:3 import `CreationRules` and `Words` from
  web/reader/.
- src/cli/terminal-creation.ts imports src/creation/creation-flow.
- test/support/glanced.ts imports web/reader/menu-model.

**History.** workflow-parity.md's third row said the Details numbers should come from "the engine's character
sheet (src/presentation/character-sheet.ts)". 0866e226 (PA-04) removed the reader's copy of the creation *rules*,
but `CreationRules` (weapon choice, quality effects) is still the page's module that the engine imports.

**Recommendation.** Consolidate. Move creation-rules.ts and the words creation uses to src/presentation, and keep the
page importing from src only. A lint `no-restricted-imports` for `web/engine → web/reader` holds it. **S–M**

### 10. The origin pick is gone from the page, but not from the tools or the flow

**Where.**
- src/creation/creation-flow.ts:74 filters the `why` step out ("remove the abstract origin-quest selection": the
  owner, boredom brief). The step is still built (line 125, "Why have you come to …?") and still answered
  (line 190).
- Twelve CLI and script places take `--origin` (src/cli/play-tool.ts, runner, terminal-matrix and the rest).
  Headless walks and cold-play recipes therefore choose a start the page can no longer choose. That repeats PB-06
  ("the browser and the terminal gave different runs of the same seed").

**Recommendation.** Retire the `why` step from CreationFlow. Keep `--origin` as a debug override, said so in each
usage. Have matrix walks default to the circumstance the page gives. **S**

### 11. Promise-keeping is checked only by the runner's walks

**Where.**
- `Promises.broken(screen)` (CO-15, src/presentation/promises.ts) is read by runner.ts, runner-walk.ts,
  terminal-matrix.ts and test/small/promises.
- The autoplay laboratory's per-step invariants (src/autoplay/invariants.ts: creatures, offered, party, told, time,
  roundtrip) do not include it. So the boredom census and matrix walks, which run on autoplay, never see a broken
  promise.

**Recommendation.** Integrate: an `Invariants.promised(s)` in the lab's per-step set. **S**

### 12. Overlapping feature censuses

**Where.** Six censuses keep a list of what the game should be able to do, each with its own probes and report:

| Census | Size | Files |
|---|---|---|
| Capstones | 51 features | test/capstones/features.ts, probes.ts, scripts/capstones.ts, mission-21/capstones.md |
| Feature pins | 26 features, 36 pins | test/features/*, scripts/feature-pins.ts, doc/architecture/feature-pins.md |
| Paragon pins | 6 | test/small/pin-* |
| Verb pins | 5 | mission-21/verb-pins.md, PV-01..05 |
| Intent catalogue pins | 10 | scripts/intent-catalogue.ts `pins` |
| Experience matrix | | scripts/experience-matrix.ts |

The capstones and the feature pins overlap: both list save/load, reputation, crafting and maps.

**The cost.** The verb-pins doc says the Alchemist, Befriender and Commander are pinned (test/small/alchemist,
befriender, commander exist). The register's PV-01, PV-02 and PV-04 still say open (see asks.md §3).

**Recommendation.** Consolidate on feature pins as the one matrix (it is the owner's newest ask). Make capstone
probes, paragon pins, verb pins and the intent families pins in test/features that `import` the existing specs.
Retire capstones.md once the matrix covers it. **M**

### 13. Two families of headless player policy, over different surfaces

**Where.**
- **RunnerWalk** (src/cli/runner-walk.ts): `straight`, `curious` and `seeded`, over what the runner says.
- **AutoPlayer** (src/autoplay/player.ts): ten tempers (`wander`, `intent`, `fight`, `follow`, `silver`, `gold` and
  others) over `PlayerView.choices` (every legal act, not the page's four; run.ts:104). `led` is added only for the
  paged policies.

The boredom census uses AutoPlayer's unguided tempers. They see more than a player does.

**Scripts that wrap one or the other:** journey-wanderer, matrix-walk, terminal-walks, terminal-matrix,
experience-matrix, exploration-sample, promise-fidelity, boredom-census, novice-*, play-at, play-party,
play-transcript and play-howe-week.

**Recommendation.** Consolidate. Policies become choosers over the intent runner's offer (the four plus the lenses),
and the scripts keep their reports. The census then measures what a player meets. **M**

### 14. Address-flag experiments never decided

**Where.**

| Flag | Since | Extent |
|---|---|---|
| `?look=veil\|attend\|plate` | 935e4df8, 12 Nov; "never the default" | web/reader/look.ts, look.css (178 lines), two `Look.is` branches (world-stage.tsx:55, glance.tsx:97) |
| `?face=jost\|lato\|play` | | reader-main.tsx:19 |
| `?sound=1` | | Tone; OR-10 open |
| `?guide=quiet` | | web/reader/guidance.ts |

OR-11 retired `?ix` and `?touch` for the same reason, citing the ruling "old mechanisms are removed rather than
excepted around".

**Recommendation.** Decide each: adopt, or retire with its CSS. **S**

### 15. Smaller loose ends

- **Two `Guidance` classes** (web/reader/guidance.ts, the page's gilding; src/autoplay/guidance.ts, the gold
  walker's following). Rename one. **S**
- **Seven ways to start play:** `kyrie adventure`, `campaign`, `play`, `run`, `serve`, `resume`, `replay`, plus
  scripts/play-at.ts and play-party.ts (a company set down in a place). The play-* scripts duplicate
  `play --world … --as` and `PlayParts`. Fold them into `play --at <place>`. **S**
- **The register's §54 appears twice** (lines 1259 and 1278), and its sections switch between `## n.` and `## §n`.
  Renumber. **S**

---

## Checked and found wired (not findings)

- The `src/cli` tools with a single importer (commitment-lint, new-site, options, play-parts, runner-amid,
  runner-creation, runner-led, runner-payoff, srd-pages, srd-spell-resolution, terminal-books, terminal-human,
  terminal-mode) are each a part of the one command that imports them.
- `bin/kyrie bestiary`, `orsino`, `reach`, `forecast`, `inspect`, `countries` and `prose` are all dispatched
  (kyrie.ts:71-98).
- The per-adventure test drivers (test/support/hessel, gaunt, pellam, calamy, sennet, low-water, skeel, quittance,
  hollins, wrayford, ombra, kp, rivals) all build on `Journey`. They are consolidated already.
- `Promises.broken` is pinned by test/small/promises, so it is tested, even though autoplay doesn't call it.
- The `?ix` and `?touch` press pipelines are gone (OR-11).
- `organisms.json` is retired (M19 natural history).
