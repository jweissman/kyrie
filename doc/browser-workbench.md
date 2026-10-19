# Browser workbench: review, implementation, playtest

This is an independent review of Kyrie from a player-experience perspective. It covers a static browser
workbench that runs the real Kyr runtime in the page, and findings from playing several histories through it.

"Verified" means reproduced by a command, test or browser session listed here. "Assessed" means a judgment
from reading code.

## Run it

```sh
bun install
bun run web:build                 # writes site/ (static). Open site/index.html directly, or publish site/.
bun run web:dev                   # same build plus a local static preview on :8080 (files only)
bun test test/play-session.test.ts test/player-view.test.ts test/browser-parity.test.ts
KYRIE_CHROMIUM=/path/to/chrome bun test test/browser-parity.test.ts   # adds the real-browser parity leg
bun run kyrie replay transcript.json   # CLI replay of a transcript exported from the browser
```

The site uses one classic script with relative URLs. It works from `file://`, from a domain root, and from a
GitHub Pages subpath. `.github/workflows/pages.yml` publishes it. DEEM is a sibling `file:` dependency, so set
the `DEEM_REPOSITORY` variable.

## Phase 1 — cold review

### What a player can perceive and do (verified)

- **Crossing** (`kyrie adventure slice`): the CLI prints the module description, then every quantity,
  including the guard's hidden `mercy` threshold and the carrier's urgency watch. It also prints all outcome
  predicates (`guard_dead`, `supplied`…), every `at()` fact, and the actions with raw IDs, e.g.
  `Travel (party, village, bank)` with empty descriptions. `inspect` dumps the omniscient world. After each
  command it prints NPC goal names (`carrier pursues wages`). The player sees *everything*; there is no player
  view for this module.
- **Glass Orchard** (`kyrie campaign data/discovery/orchard.campaign.json glass`): prints a JSON
  `InformationView` that is actually player-safe. But Orris vanishes from the location after one `wait`, and
  nothing reports that he left or where he went.
- `hint` in the crossing always answers "No plan before the deadline" after about 1.6 s. The player's planner
  excludes other actors' actions, so it can never plan past the guard (`src/campaign/campaign.ts:214`). The
  hint is technically correct but useless to a player.
- The CLI drops lines piped to readline (`printf '1\n2\nq\n' | kyrie campaign …` stalls after the first
  command), so the terminal cannot be scripted. The browser transcript and `kyrie replay` now fill that role.

### Generic versus crossing-specific (assessed)

| Genuinely generic | Convention or ruleset-specific baked into "core" |
| --- | --- |
| Kyr typed relations/measures/queries, `World` apply/validate, `ModuleCompiler` | `Campaign` hardcodes `gold`, `watch(clock)`, `able`/`dead`, `recorded`/`deficit` (`CreatureFacts`, `Progression`, `ModuleInstallations`) |
| `ActionSchemas` grounding, `Planner`, `Agency` goal selection | Pressures are one shape: a threshold on one measure at one watch |
| Bundle manifests, namespacing, imports and late installation | Combat teams are literally `'fighters' \| 'goblins'`; whoever is attacked joins team "goblins" |
| `CreatureStore` leases, `Battle` | `InformationView` (before this work) switched on five schema names and their binding names |
| DEEM composition | Location is the ruleset's `at` relation, which presentation has to assume |

The crossing's *decisions* are authored as data (goal tables, `releaseAllowed`), not as TypeScript. That
claim in `doc/playable-campaign.md` holds up.

### Structured state versus presentation or convention (assessed)

- **Structured:** location, routes, inventory, money (canonical in creatures), hostility, release,
  knowledge and false assumptions, NPC goals and priorities, deadlines and their deficits.
- **Convention only:** what the player can observe (no observability declarations at all), what an action
  *means* to a reader (the `description` field exists but no ruleset uses it), who witnessed what, and why an
  NPC acted (goals exist, but the event log lumps all NPC diffs into the player's command).
- **Absent:** dialogue or asking, consequences of `hostile` (no NPC reads it), healing or rest outside
  combat, NPC combat, and any notion of what the party learns by looking at a stock or a person.

### Obstacles to a browser host (verified), and the smallest fixes made

| Obstacle | Fix |
| --- | --- |
| `node:util` `isDeepStrictEqual` in `CreatureStore` blocks `bun build --target browser` outright | `src/equality.ts` |
| `ModuleBundle`/`Campaign.load` read files with `node:fs`/`node:path`. Bun silently stubs these in browser builds, so they fail at runtime | `BundleSource` interface: `NodeBundleSource` for CLI/tests, `MemoryBundleSource` for build-time embedded assets. `Campaign.load/install` take a source |
| DEEM's `buildSetting` lives in `cli.ts`, which imports `node:fs`/`node:path` | **Not changed** (out of scope). Harmless at runtime, but it pulls a path polyfill into the bundle. Recommend moving `buildSetting` out of `cli.ts` |
| Two `ohm-js` copies (Kyrie's and DEEM's) | One copy in the web build via a resolver plugin; parity tests confirm identical behaviour |
| No generic player-facing action description | Label templates (below) |
| No player-safe view outside discovery modules | `PlayerView` (below) |
| Event log could not attribute changes to NPC actions | `NpcDecision` now records `elapsed` and its own `changes` |

`src/` now contains no `node:`, `bun`, `process`, or DOM access except `node-bundle-source.ts`. A test
enforces this, and `web/` has its own tsconfig with DOM types, so the engine cannot accidentally use them.

### Correctness, persistence and authority problems (verified)

1. **Saves carry the rules.** `Campaign.restore` (`campaign.ts:186`) re-validates syntax and types only. A save
   whose `wait(party)` action grants 50 coins and writes `watch(clock)` is accepted. The coins are committed
   to the canonical creature, and the "read-only campaign records" check from `ModuleAssembly` is skipped on
   restore. For local browser play this is cheating, not a security hole. But imported saves are untrusted
   rules, and saves are not a format to share between people.
2. **Exceptions mid-combat corrupted state.** Before this work, an error thrown during an encounter closed the
   battle and kept partial damage, but logged no event and advanced no time. Creatures then diverged from the
   event log, which breaks replay. **Fixed:** `execute`/`executeAsync` now restore a checkpoint (creatures,
   world, observations, log, encounter counter). This is covered by a test.
3. **You can pay a corpse.** `pay`/`give_food` require only the payer to be `able`. Kill the guard, pay three
   coins, and `settled` becomes true alongside `guard_dead`. Repro: `ember` seed, then
   `travel(crossing__bank)`, `attack(crossing__guard)`, then `pay(crossing__guard)` three times. Not
   changed: it is a ruleset fix (`and able(recipient)`) for the authors to decide.
4. **Bundled situations lose their description.** `ModuleInstallations` replaces it with "Installed situations
   share this persistent world." (`module-installations.ts:44`). **Fixed:** `InstalledModule.description`.
5. **No secrecy in the browser.** Play mode hides facts by presentation only. Saves, local storage, and the
   bundle itself contain everything. This is acceptable for a workbench, and stated in the UI.
6. **Grounding cost.** The two-site campaign grounds 2,292 actions, most of them nonsense (for example,
   travel by a stock). Every `available()` call tests all of them. It is fine at this scale (100–300 ms per
   command in Chromium) but will not survive a region.

## Phase 2 — what was built

**Hosts are thin adapters over one engine.** `PlaySession` (`src/session/play-session.ts`) is the
host-neutral play loop. It resolves public commands, executes them through `Campaign`, and steps combat
through `Battle`, with an async controller for the player's side. It records a transcript (public commands
plus the player's combat commands), replays transcripts, and emits a canonical JSON
(save + event log + player view + chronicle). The browser (`web/app.ts`) only maps DOM events to session calls.
`kyrie replay` is the CLI host of the same loop.

**Action labels (generic interface improvement).** A ruleset action's display string may name parameters, e.g.
`Action pay(actor, recipient, site) "Give {recipient} one coin"`. Grounding renders entity names into it. The
referenced parameters define the public command ID (`pay(crossing__guard)`), and unreferenced ones (`site`,
or the hidden `statement` of `examine`) are implied. If a label would merge two distinguishable commands, it
is rejected as ambiguous. This replaced `InformationView`'s hardcoded schema switch, and the discovery tests
pass unchanged with identical public IDs. `adventure.kyr` and `discovery.kyr` gained templates.

**Player view (`src/presentation/player-view.ts`).** Kyr has no observability declarations, so this applies
one conservative, documented locality policy:
- the player's own facts and holdings
- its location and co-located entities, with sources only if `noticeable`
- party creature condition
- legal commands
- the player's own declared effects and combat log
- NPC actions that start or end at the party's location, or involve it
- announced deadlines

It omits other actors' measures (claim, mercy), dispositions (`acceptsFood`), goals and outcome predicates.
The chronicle is rebuilt from the event log, so it is identical after save/restore and in every host.

**Workbench features:**
- scenario picker (crossing, Glass Orchard, crossing + pantry) and seed
- New / Restart (same seed) / Undo (replay all but the last command from the seed)
- autosave, named local slots, export of the Kyr save (CLI-resumable) and of the transcript (CLI-replayable),
  and import of either
- an Inspect tab: authoritative facts with a filter, installed situations, outcome predicates and first
  observation, NPC goal tables, recent decisions with plans, an "explain next decisions" button (runs
  `Agency.explain`, which shares one ranking implementation with `Agency.choose`), creatures, the raw event
  log with per-NPC diffs, the exact player view, the raw save, and pinned-run comparison with replay

**Tests (19 new):**
- `play-session.test.ts`: command legality, rejection without state change, combat transcript recording and
  replay, atomic rollback of an illegal combat command, refusal of overlapping commands, local-storage
  roundtrip continuing identically, bare-save import, bundled assets matching filesystem assets
- `player-view.test.ts`: hidden-fact exclusion, discovery privacy, witnessed-only NPC narration, deadlines,
  ambiguous-label rejection, environment boundary
- `browser-parity.test.ts`: five histories (cooperate, violence with combat, abandon, discovery, two sites).
  Each is replayed in-process, by the browser-targeted bundle, and by the CLI subprocess, with
  byte-identical canonical output. With `KYRIE_CHROMIUM` set, the static `parity.html` is also run in headless
  Chromium. This was verified locally with Chromium headless shell 1194.

Full suite: 107 pass, 1 skip (the opt-in Chromium leg), lint and both typechecks clean.

## Phase 3 — playtest (headless Chromium, clicking the real UI)

**Cooperation (`slice`).** Travel → pay ×3 → *Seen: The unpaid guard: End the blockade* (w4) → cross. On the
road the carrier collects grain (w5) and hauls it past the checkpoint (w6), both witnessed. At w8 the clock
reports the deadline. The player never learns whether the grain arrived; only Inspect shows `supplied`.
- Understandable: paying shows `Increase received(The unpaid guard) by 1` as a declared effect, so the
  player can infer a tally.
- Opaque: nothing says how many coins are owed, so the player pays blind.

**Violence (`slice`).** Under the built-in tactics, the level-1 fighter *loses* to a goblin commoner. It spent
a turn on Second wind for 1 HP at 3 HP. Choosing Wounding blow every turn by hand wins with 3/11 HP. Combat
is the only place a player choice visibly changes outcomes turn by turn, and it is decided by ability
selection, not by the fiction. Afterwards:
- HP never recovers; there is no rest or heal action.
- "Give The unpaid guard one coin" is still offered to the corpse (finding 3).
- `hostile` changes nothing: nobody reacts.

**Abandonment (`slice`).** Walk to the market, wait. The player witnesses the carrier arrive and do its
paid delivery (w2–w3), then sees it leave (w7). The deadline passes; Inspect shows `deficit = 1`. This is the
most "alive" history: the carrier works the job you never see it decide on. Inspect then explains the job
(wages at priority 10 beat provision until urgency at watch 4), but play mode cannot.

**Save/reload.** Save at w3, keep playing to w9, reload the page → the autosave resumes with an identical
chronicle. Load the w3 slot and repeat the same six waits → identical chronicle and transcript. Undo from w9
takes 1.65 s (a replay from the seed).

**Discovery (`glass`).** Examine the mirror → the fact appears under "You know". Follow Orris to the
glasshouse → "Tell Orris: …" appears (offered only when co-located and known). Tell → next watch, *Seen:
Orris: Travel to Orchard yard*. Follow → he is at the loft.
- The causal chain is mechanically real, but a player sees only "he walked off". Nothing connects his
  departure to what they told him, and nothing says what the loft means.
- "Tell Orris" is offered again at the loft and spends a watch to no effect.
- The Stair diagram is visible but can never be examined (`mayExamine` is Orris-only), with no explanation.

### Answers

- **Understandable and engaging:** legal-action menus are honest. Witnessed NPC actions make the world feel
  autonomous. Deadlines and the clock create pressure. Restart, undo and comparison make counterfactuals
  cheap; the compare table immediately shows "settled vs violence vs missed" across pinned runs.
- **Opaque, repetitive, artificial:**
  - You pay a debt you were never told the size of.
  - Waiting is the dominant verb (most histories are 5–9 `wait`s).
  - The guard's mercy threshold silently resolves the crossing at w7 whatever you do.
  - Combat is unrelated to the situation's stakes and has no aftermath besides death.
- **Legal but awkward:**
  - paying or feeding a corpse
  - re-telling a known fact
  - "Cross past The unpaid guard" after he is dead
  - attacking the carrier (always legal, never consequential beyond hostility)
  - "Eat a ration" with no visible benefit
- **Missing player actions:** asking or negotiating (learning the claim or the mercy), examining a person or
  stock, resting or healing, carrying grain yourself past a released guard (legal, but not suggested by
  anything), threatening, following an NPC.
- **What players must learn that the engine cannot reveal:**
  - debts and thresholds (`claim`, `mercy`)
  - whether a remote outcome happened (grain delivered)
  - why an NPC moved
  - which verbs exist for whom (why the diagram can't be examined)
- **Is NPC activity consequential?** Mechanically yes: the carrier's choices decide `supplied`, and Orris's
  goal flips on knowledge. Experientially it is automatic. NPCs act on their own priorities, never toward
  the player, and their reasons are invisible without Inspect.
- **More drama without losing authority:**
  - let NPCs act on `hostile` (the guard fleeing, the carrier refusing to pass)
  - make outcomes observable through authored reports rather than omniscient predicates
  - give pressures intermediate escalations instead of one silent threshold
  - let combat outcomes feed situation facts beyond `able`

## Three highest-leverage next changes (ranked by player benefit)

1. **Declared observability and reports in Kyr.** Authors need a way to say what is perceivable and when.
   For example: "`claim(g)` is visible to anyone at `g`'s location"; "a `report` fact is created when an NPC
   tells or when an outcome becomes true where the party is". This single gap explains most of the opacity
   above: blind payments, unknown deliveries, unexplained NPC moves. Today `PlayerView` has to guess with a
   locality heuristic. Making it declarative would let it stop guessing and let authors design reveals.
2. **Social verbs that expose NPC policy as player-facing choices.** Add "ask about a claim", "negotiate"
   (pay part now, promise the rest), and "examine a person". These are ordinary Kyr actions that reveal or
   change the measures NPC goals already read (`claim`, `mercy`, `acceptsFood`). Waiting stops being the
   dominant verb, and the existing goal planner becomes something the player plays *against*, not beside.
3. **Make consequences react.** NPC goals conditioned on `hostile`, `dead(other)`, and the player's
   knowledge, plus a ruleset-level fix for acting on corpses (`able(recipient)`) and an out-of-combat
   recovery action. Violence would then reshape the world rather than just delete a gate. The three crossing
   histories would diverge in what NPCs *do afterwards*, not only in end-state flags.

## Disagreements with the existing design

- **The "persistent campaign never ends" stance plus omniscient outcome predicates leaves the player without
  closure or knowledge.** Outcomes are good debugging instruments (they power the compare table). They should
  not be the only record of what happened. Recommendation 1 addresses this.
- **Saves as complete rule snapshots** make migration and sharing unsafe (finding 1). A save could reference
  the bundle and seed and store only state, with the rules re-derived and checked on load.
- **Combat as a separate world** (teams "fighters"/"goblins", one watch per encounter, no NPC combat) makes
  violence the most mechanically detailed and the least situationally connected choice. Situation facts
  should drive who fights, and the encounter outcome should write back richer facts than `able`/`dead`.
- **The player planner `hint`** cannot reason about other actors, so in a multi-actor situation it is
  misleading. Hide it, or have it explain which actor's choice blocks the plan.
