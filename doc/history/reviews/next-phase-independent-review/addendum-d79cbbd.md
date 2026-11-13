# Addendum: fine-toothed comb at `d79cbbd`

- **Snapshot:** `main` at `d79cbbd8c9f3080d8d88579adab24a5d1ca707e5` (2026-10-26T14:40:03-04:00). This is the 36 commits
  pushed after the first review's snapshot `69125e5`, which is an ancestor of it.
- **Branch:** `review/architecture-2026-10-26-d79cbbd`, cut from `d79cbbd` with the first review's two commits
  cherry-picked on top. Only this directory changed.
- **Evidence:**
  - first-review probes re-run at this snapshot: [`evidence/at-d79cbbd/`](evidence/at-d79cbbd/);
  - new probes: [`evidence/r2/`](evidence/r2/).
  - Run every probe from the repository root with `bun`.

**What this pass did.** It re-checked every finding of the [first report](report.md). It then went through the areas
that report sampled least, looking for broken invariants and boundary violations:
- combat and the rules core;
- ownership of campaign state;
- the Kyr compiler and query semantics;
- persistence and the worker;
- knowledge and telling;
- the 36 new commits;
- the full import graph.

**How findings were checked.** Six parallel read-only sweeps did the first pass. I re-ran every probe they wrote
before including a finding, and I give confidence the same way as the first report. **Confirmed** means a probe
reproduces it at `d79cbbd`.

---

## 1. Summary

- **The 36 commits fix none of the first report's findings.** Every first-review probe reproduces unchanged at
  `d79cbbd`:
  - 2 of 41 seeds and 1 of 100 Begin starts still fail to load;
  - the locale probe still diverges in 20 of 20 fights;
  - the kind-cache, parse-cache and concurrent-load probes behave as before;
  - a tampered checkpoint still resumes;
  - lint still calls the probe's actions impossible.
- **Several patterns grew.** The commits are feature work: What Tessary Owes, milestones, chapter endings, the
  character sheet. Measured with the same grep on both commits:
  - feature checks on declared relation names: 56 → 57;
  - static process-wide collections: 50 → 53;
  - runtime → presentation/ui imports: 19 → 20 (`src/session/travel.ts` → `ui/passage-model`);
  - regex literals in `src/presentation`: 51 → 65;
  - self-latching content Rules: 262/731 → 344/909, with Tessary contributing 82 of its 178.
- **One new commit introduced a High defect.** `a02ee33` added a process-global NPC planning cache that makes play
  depend on what the page rendered and on what else the process ran (A1).
- **This pass found 25 new defects or violations.**
  - The most consequential are concurrency in the worker (A2), a stale world paired with a newer state (A3), and four
    ways the combat engine does something other than what its own text says (A5).
  - Together, A5 and A4 falsify one of the strengths the first report credited: "one mechanical meaning for
    abilities".
- **Several things hold up well, and are listed in section 4.** The earlier query-negation defect is fixed (a
  9,000-query differential fuzzer found no mismatches once declared types are respected). Transcript replay equals
  live play, including a frontier crossing. The save codec is lossless. Milestones are awarded exactly once across a
  resume.

---

## 2. Status of the first report's findings at `d79cbbd`

| ID | Status | Evidence |
|---|---|---|
| H1 | Unchanged | `at-d79cbbd/unloadable-seeds.log` (2/41), `begin-seeds.log` (`juvesese`, 1/100). `RegionWriter.manifest` is hand-listed further (`RegionZones.passages`) |
| H2 | Slightly worse | `src/session/travel.ts` now routes auto-travel by `ui/passage-model`'s re-derived status (the one H5 shows drops clauses) |
| H3 | Worse | +1 name-feature check (coin reading's `quantity`). `relates('…')` checks 17 → 23. New engine-relied names: `milestone`, `achieved`, `merit`, `leadsVia`, `concluded` |
| H4 | Slightly worse | About 6 net new TS-emitted Kyr lines (`leadsTo`/`leadsVia`, `by_*` passages); no new plot structures |
| H5 | Worse | Presentation regex literals 51 → 65. The recruit card shows an NPC's HP and techniques before they join. `CoinReading` lists hypothetical choices outside `PlayerView`'s filters (A20) |
| H6 | Unchanged, and now compounded | `at-d79cbbd/det-locale.log`, `det-replay-verify.log`. A1 and A11 add new continued-versus-restored divergences |
| H7 | Worse | `Agency.fruitless` and the mutable `Planner.last` are new. The old probes reproduce (`at-d79cbbd/det-*.log`) |
| M1 | Unchanged | `at-d79cbbd/engine-written.log` |
| M2 | Worse in content | Tessary adds 82 self-latching rules, 18 hand-written gold transfers, hand-made timers and a night counter, 52 `Retract at(`, and 3 hand-written companion departures. `Milestone` is a welcome new construct. `Exit` and `Budget` are still dead |
| M3–M5, M8, L1 | Unchanged | |
| M4 | Worse | New English classifiers: `WorldConstructs.recall`'s question-word regex (A19); `MechanicsText.holds`'s word-ending list (A19); the `^by_` id regex in `scenario-word.ts` |
| M6 | Worse | `web/scenarios.ts` gains Tessary by hand. Its note already differs from the manifest's pitch |
| M7 | Mixed | Companions are now perceived where the company is (good, and general). Enlisting zeroes the recruit's purse (A22). `member_*_person` references in data: 8 → 16 |
| L2 | Slightly worse | Chapter endings are found by the `${m.id}__` prefix |
| L3 | Mixed | Coin reading re-grounds every priced action per screen. +82 to +101 generated `_again` actions per world. The NPC cache cuts planning cost, but see A1 |

**No Tessary story knowledge entered `src/`.** Its names appear only in comments, in `web/scenarios.ts` and in
`scripts/tessary-pages.ts`.

---

## 3. New findings

| ID | Severity | Category | Title |
|---|---|---|---|
| A1 | High | Determinism | The NPC "fruitless plan" cache is process-global, unsaved, and written by the page |
| A2 | High | Correctness | Worker requests run concurrently on one host: a fight wedges, and a new game inherits the old command |
| A3 | High | Persistence | A new world that failed to store is never re-sent; the old world is paired with the new state and resumed trusted |
| A4 | High | Correctness | A companion raised in a fight stays `slain` forever |
| A5 | High | Mechanical meaning | Cures, stance endings, stuns and drain do something other than what their text says |
| A6 | High | Knowledge | "You witness" tells offscreen acts and obstructed acts as done; unseen arrivals are named |
| A7 | High (latent) | Isolation | A module's rules file can read and write another module's private relations; clashes are dropped silently |
| A8 | Medium-High | Ownership | The engine-write guard is three hand-kept lists; a Topic can set `dark()` and `dice` |
| A9 | Medium | Authorability | The compiler accepts unbound and ill-typed effect variables; binding-check holes; query types depend on asking mode |
| A10 | Medium | Boundary | More layer inversions and cycles: an impure parser, rules → campaign, world → session/runtime, presentation ↔ ui |
| A11 | Medium | Determinism | A restored world is not state-equivalent: the order of emptied names differs |
| A12 | Medium | Correctness | The player's typed name is spliced unescaped into generated Kyr; quotes and braces break Begin |
| A13 | Medium | Knowledge | Real place names leak where the page shows an alias: journeys, the character sheet, the obituary, the CLI |
| A14 | Medium | Correctness | Clock shift for late installs misses timers written through a Query or arithmetic |
| A15 | Medium | Correctness | One foe fleeing ends the whole fight, and it counts as a win for every foe |
| A16 | Medium | Regression | A module with Endings in two source files no longer loads |
| A17 | Medium-Low | Narration | Text with variables renders wrongly (measures read unbound; endings print `?g`) |
| A18 | Medium-Low | Semantics | A count taken past nothing: rule clamps, action refusals and `Set` disagree, and the result depends on order |
| A19 | Low-Medium | Authorability | Generated "Ask … again" copies are often dead, and are chosen by English wording; condition grammar comes from word endings |
| A20 | Low-Medium | Knowledge | Coin reading and the NPC activity suffix reveal what the company cannot see |
| A21 | Medium (plausible) | Correctness | The idle-rule cache misses entities added by an installation |
| A22 | Low | Correctness | Smaller defects: summon id reuse, unchecked revive percent, enlisting zeroes gold, far-off milestones, the `.resolved` key clash, membership disagreement after departure |
| A23 | Low | Authorability | Combat constants and ability or condition ids are hard-coded; field time lacks battle's dice and lapse handling |
| A24 | Low | Persistence | The downloaded save lacks the story log; autosaves re-serialize everything; a frontier country can be drawn twice at once |
| A25 | Low | Authorability | Kyr strings cannot escape `{` or `'`, though the grammar promises any escape |

---

### A1 — The NPC "fruitless plan" cache is process-global, unsaved, and written by the page

- **Severity:** High.
- **Category:** Deterministic execution, architectural boundary.
- **Confidence:** Confirmed by two independent probes.
- **Introduced by:** `a02ee33`.

**Observation.** `src/campaign/agency.ts:34-47`:

```ts
private static readonly fruitless = new Map<string, { reads: string[]; stamped: number[]; until?: number }>();
const waiting = kept?.until !== undefined && watch < kept.until;
if (kept && (waiting || world.agrees(kept.reads, kept.stamped))) { return null; }
```

The cache has four properties that matter:
- it is keyed only by `actor\0goal`;
- its "try again in an hour" gate compares only the watch number;
- it is not saved, not rolled back, and not per campaign;
- `PlayerView.activity` → `Agency.explain` → `plan` writes to it when the page is merely rendered
  (`src/presentation/player-view.ts:343`).

**Evidence.** [`r2/state-agency.log`](evidence/r2/state-agency.log), in which the player opens a gate that makes
the NPC's goal reachable:

| Case | Does the NPC reach home? |
|---|---|
| Continued game | No (blocked until watch 7) |
| Saved and restored | **Yes** |
| Page viewed once before the command | **No** |
| Same, page never viewed | Yes |
| A second campaign started in the same process | **No** (it inherits the first game's entry) |
| A command undone, then the same command | **No** |

[`r2/new-agency-fruitless.log`](evidence/r2/new-agency-fruitless.log) shows the same thing independently.

**Expected invariant.** NPC choices are a function of saved state, seed and commands only. Presentation never affects
the game.

**Consequence.**
- Restored games play differently from continued ones.
- The autoplay lab and the test runner inherit frozen NPCs.
- Rendering the page delays the world.
- This also breaks the H2 invariant from the other side: presentation now *writes* runtime state.

**Recommendation.** Move the cache into campaign state, keyed by world lineage plus stamps, and let rollback restore
it. Or drop the `until` gate and rely on `agrees`. `explain` must not populate it.

**Regression test.** The probe's six cases as a test. All must agree.

---

### A2 — Worker requests run concurrently on one host

- **Severity:** High.
- **Category:** Correctness, persistence.
- **Confidence:** Confirmed.

**Observation.** The worker `await`s each message independently (`web/engine/engine-worker.ts:9-16`). `EngineHost`
holds per-game fields (`log`, `told`, `turn`, `working`, `world`) on itself. There is no queue and no game-generation
token.

**Evidence.**
- [`r2/persist-fight-wedge.log`](evidence/r2/persist-fight-wedge.log): a `perform` sent while a fight awaits the
  player is rejected as busy. But its `finally` clears the running fight's `turn` and replaces `working`
  (`engine-host.ts:68-69,157`). Then:
  - the fight choice returns `null` and the original attack never settles;
  - every later command fails "already in progress";
  - the download is refused at once;
  - autosave stops.

  The page allows this: it clears `pending` when a fight frame arrives (`web/reader/reader-app.tsx:101-104,161`).
- [`r2/persist-begin-during-perform.log`](evidence/r2/persist-begin-during-perform.log): starting a new game
  during a slow command (possible from the Journal's "Back to the title" during a frontier draw) lets the old command
  finish *into the new game*. Thrume's log reads `["→ Merrow green"]`, and its autosave carries it.

**Expected invariant.** One command at a time per game. A finishing command never writes into a different game.

**Consequence.** A wedged game until reload, and corrupted saves. These are ordinary-UI paths, not adversarial
messages.

**Recommendation.**
- Serialize requests in the worker (chain them on one promise).
- Stamp each game with a generation id, which a finishing request checks before touching host state.
- Make the rejected `perform` leave `turn` and `working` alone.

**Regression test.** The two probes as tests.

---

### A3 — A world that failed to store is never re-sent

- **Severity:** High.
- **Category:** Persistence, correctness.
- **Confidence:** Confirmed.

**Observation.** `web/engine/engine-host.ts:237-239` marks the world `kept` as soon as it is *posted*, not when the
page confirms the write. Neither `ReaderStore.read` (`reader-store.ts:26-29`) nor `KeptGame.join`
(`kept-game.ts:133-140`) compares the state's world key with the stored world's.

**Evidence.** [`r2/persist-stale-world.log`](evidence/r2/persist-stale-world.log):
1. After a frontier crossing, the 4.9 MB world write fails, and the "unkept" toast shows.
2. The next autosave sends only the small state, which succeeds.
3. On reload, the state names world `dyev6k1nsc707` but the stored world is `x8qf86spxzk3`.
4. The game resumes **trusted** (no validation) with 16 of 18 modules and 16,042 of 18,820 facts. The next command
   runs.

A second path, two tabs where one releases the other's world slot, is read in code.

**Expected invariant.** A kept state is only ever joined with the world it was diffed against.

**Consequence.** Silent, unvalidated play on a world missing the country the company stands in. This is the
earlier review's N1 class, by a new route.

**Recommendation.** The page acknowledges each world write before the host marks it kept. `read` and `join` compare
keys and refuse on a mismatch.

**Regression test.** The probe.

---

### A4 — A companion raised in a fight stays `slain` forever

- **Severity:** High.
- **Category:** Correctness (state ownership).
- **Confidence:** Confirmed.

**Observation.**
- The in-battle revive (`src/effects.ts:294-300`) sets HP but never clears the `slain` condition ("Dead", which stops
  all action). Commit writes the condition back to the store (`src/combat-projection.ts:278`).
- `FieldUse.raise` returns early when HP is above 0, and nothing else removes `slain`.
- The undead trait Animate Dead grants is dropped at commit, because the original creature's traits win.

**Evidence.** [`r2/combat-revive-commit.log`](evidence/r2/combat-revive-commit.log):
- the store shows `hp: 5, conditions: ["slain"]`;
- the raised companion loses every turn;
- a rest with them listed first throws "Caster cannot use this ability" (`field-resolver.ts:23` picks the first
  living member as caster);
- the shrine raising returns `[]`.

**Expected invariant.** One meaning of "raised". What a fight does is what the store holds.

**Consequence.** A permanently disabled companion, and a rest that throws until the party is reordered. This is
reachable with ordinary spells.

**Recommendation.** One `raise` operation shared by battle and field, which clears `slain` and preserves granted
traits.

**Regression test.** Raise in battle, commit, rest, and fight again.

---

### A5 — Cures, stance endings, stuns and drain do something other than what their text says

- **Severity:** High as a pattern; each case is Medium.
- **Category:** Mechanical meaning.
- **Confidence:** Confirmed.

The first report credited "one mechanical meaning". Four mechanisms contradict it.

1. **Cures match display names.** `src/effects.ts:306-308` builds `new RegExp('^(' + pattern + ')$', 'i')` and tests
   it against the *display name* of each condition. [`r2/combat-remove-pattern.log`](evidence/r2/combat-remove-pattern.log)
   shows the results:
   - `cure_disease` (`/disease/`) removes nothing, because the condition is "Diseased";
   - `remove_fear` removes nothing ("Frightened");
   - `heal`, `cleanse` and the restorations remove "Poison" but not Kyr's lasting "Poisoned";
   - `touch_of_serenity` misses "Severely Distracted" and "Major Weakened".

   Renaming a condition silently changes what spells do.
2. **Stance endings hit the attacker.** Overwatch and Blade Barrier never end. Their "and it ends" step targets
   `enemy`, which `src/reactions.ts:28` resolves to the attacker. [`r2/combat-reaction-ends.log`](evidence/r2/combat-reaction-ends.log)
   shows 4 strikes, 4 reactions and 0 removals.
3. **"Stunned for a turn" often costs nothing.** Durations tick once per round for everyone
   (`src/battle.ts:277-279`), while cooldowns tick on the owner's turns. Across 300 fights, 50 of the 133 stuns that
   landed (38%) expired before the target lost a turn
   ([`r2/combat-stun-round.log`](evidence/r2/combat-stun-round.log)).
4. **Life drain resurrects its user.** `src/effects.ts:283-286` heals the drainer after damage hooks may have killed
   it. In 109 of 113 runs where a shield killed the drainer, it ended alive with no revive event
   ([`r2/combat-drain-dead.log`](evidence/r2/combat-drain-dead.log)).

**Expected invariant.** What `MechanicsText` says is what executes.

**Recommendation.**
- Remove by condition id or tag, never by display text.
- Give reactions an explicit `holder` target.
- Count a condition's duration in its holder's turns, as cooldowns already are.
- Check `hp > 0` before a drain heals.
- **Longer term:** a catalog-wide property test that runs every ability's text claims against its execution on a
  probe battle.

---

### A6 — "You witness" tells offscreen and obstructed acts; unseen arrivals are named

- **Severity:** High.
- **Category:** Knowledge and narration consistency.
- **Confidence:** Confirmed.

**Observation.** `src/presentation/player-view.ts:368-379` decides that an NPC act was seen in three ways that are
all wrong:
- `here` is where the company is at the *end* of the command;
- `bindings.includes(here)` counts any act naming the place, from anywhere in the world;
- there is no `noticed`, `Seen when` or dark test.

It also tells `goal: 'obstructed'` acts (`campaign-tick.ts:79`) with their success text.

`src/campaign/interruption.ts:67-71` names any group arriving, seen or not.

**Evidence.**
- [`r2/know-witness-offscreen.log`](evidence/r2/know-witness-offscreen.log): on a 2-hour road, the page shows "You
  witness: Old Bede sweeps the camp clean." from watch 1. It also shows a hermit's curse from an unconnected place.
- [`r2/know-obstructed-witness.log`](evidence/r2/know-obstructed-witness.log): the necromancer's rite failed (the
  dead still slumber), yet the chronicle reads "Sorgen, necromancer: Read the named dead up out of Founders' gallery".
- [`r2/know-interrupt-unseen.log`](evidence/r2/know-interrupt-unseen.log): "Sister Ysolde comes where you are." is
  shown, though she is not noticed and no choice names her.

**Expected invariant.** The player is told only what the company perceives, and only what happened.

**Recommendation.**
- Record perception per NPC act in the runtime (`Perceptions` already exists) at the watch it happens.
- Tell obstructed acts with the action's failure text, or not at all.
- Filter interruptions by `noticed`.

---

### A7 — A module's rules file can reach another module's private relations; clashes vanish

- **Severity:** High for isolation, but latent: no shipped manifest uses this route.
- **Category:** Architectural boundary.
- **Confidence:** Confirmed.

**Observation.**
- A manifest's `rules` entry that isn't a known rule name is resolved as a path (`module-bundle.ts:192-194`).
  Everything it declares stays unscoped (`module-namespace.ts:30-32,101`).
- Separately, a clash of rule or relation definitions between installations is recorded in a static `drifted` set
  and the second definition is dropped (`module-installations.ts:71-80,113-117`).

**Evidence.** [`r2/state-namespace.log`](evidence/r2/state-namespace.log):
- **Breach.** Module B, installed with checks, declares `Relation a__secret(place)` in its "rules". After one watch,
  A's private `a__secret(a__nook)` is false and `leaked(a__nook)` is true.
- **Arity clash.** An unchecked install (how Frontier installs countries) redeclaring `able(group, place)` is
  accepted. The world keeps `able(group)` while the module's action requires `able(actor, p)`.
- **Rule-id clash.** A *checked* install whose rule `wipe` differs from an existing one has its rule silently
  discarded.

**Expected invariant.** Unexported names are private, and a clash fails loudly.

**Recommendation.** Only named rule modules may be shared. Treat any other rules path as the module's own, and
scope it. Make `drifted` an error.

---

### A8 — The engine-write guard is three hand-kept lists

- **Severity:** Medium-High.
- **Category:** State ownership.
- **Confidence:** Confirmed.

**Observation.** There are three separate guard lists:
- Rules: `module-compiler.ts:83`;
- Actions and Topics: `module-assembly.ts:134`;
- `Initially`: `module-installations.ts:99`.

They differ, and each misses names that `CampaignTick.clock` and `CreatureFacts.written` maintain:
- the Rule list lacks `hour`, `day`, `season`, `untilDark` and `untilTurn`;
- the Action list also lacks `dark`, `dice`, `untilLight` and `untilMorning`.

**Evidence.** [`r2/state-write-guard.log`](evidence/r2/state-write-guard.log): a Topic's
`On discuss { Assert dark(). Set dice(clock) to 1. }` loads. At 8 a.m. the world then says dark, and dice is 1, and
choices are grounded against that. A Rule writing `untilDark` loads, and `wait_for_dark` then uses the forged value.

**Expected invariant.** Content may not write engine-maintained facts, by any construct.

**Recommendation.** One list, derived from the H3 engine contract and applied to every construct's effects.

---

### A9 — Compiler and query-semantics holes

- **Severity:** Medium.
- **Category:** Authorability, correctness.
- **Confidence:** Confirmed.

The cases are in [`r2/lang-compiler-gaps.log`](evidence/r2/lang-compiler-gaps.log) and
[`r2/lang-runtime-semantics.log`](evidence/r2/lang-runtime-semantics.log).

- **Unbound effect variables.** `Rule r1 when at(ann, hall) { Assert marked(?t). }` is accepted and stores the literal
  fact `marked(?t)` forever. A variable bound only under `not` behaves the same. Effect variables are never
  type-checked: a group is written where a thing is expected (`module-compiler.ts:82,211`).
- **Binding-check holes.** The check treats `or` as `and`, ignores arithmetic, and is not applied to Query bodies,
  Action requires, Pursuits or Objectives (`module-compiler.ts:250-265`). So `when gold(?g) + 0 > 5` is accepted and
  never fires (the same rule without `+ 0` is refused). `distinct(ann, ?other)` is accepted, then throws mid-pass.
- **Query types depend on asking mode.** A query parameter's type is enforced only when the body cannot bind it
  (`asking.ts:88,106`; `world.ts:218-221`). `bright(?t)` returns a place for a `t: thing` parameter. Adding a
  conjunct (`at(?x, hall) and dark(?x)`) returns an answer the query alone denies. Shipped content has 16 queries in
  the affected shape ([`r2/lang-ranged-queries.log`](evidence/r2/lang-ranged-queries.log)).

The earlier query-negation defect (mission-15 F2) is fixed. The differential fuzzer
[`r2/lang-query-diff.ts`](evidence/r2/lang-query-diff.ts) found 0 mismatches in 9,000 typed queries; its 821
untyped mismatches are all of the query-type kind above.

**Recommendation.**
- Range-restriction and type checking for every construct's variables.
- Types enforced in every mode.

---

### A10 — More layer inversions and cycles (full import graph)

- **Severity:** Medium.
- **Category:** Architectural boundary.
- **Confidence:** Confirmed.

A complete value-import graph of `src` and `web` turns up edges beyond those in the first report's H2. The script is
[`r2/import-graph.py`](evidence/r2/import-graph.py), with output in
[`r2/import-graph.log`](evidence/r2/import-graph.log).

- **The parser is not pure.** `src/lang/module-parser.ts` → `information/discovery` and `canon/local-catalog`. The
  latter mutates global catalogs during a parse; this is H7's root.
- **Rules depend on the campaign layer.** `rules/advancement.ts` and `rules/checks.ts` → `campaign/party-capabilities`.
- **Generation depends on runtime and session.**
  - `world/drawn-world.ts` → `session/play-session` (the generator constructs sessions);
  - `world/region-weather.ts` → `campaign/campaign-tick` (for the season list) and `presentation/calendar`, so
    season numbering is shared across three layers;
  - `world/world-audit.ts` → `campaign/engine-writes`.
- **Presentation and UI depend on each other.** `presentation/player-view.ts` and `action-feedback.ts` →
  `ui/combat-presenter`, while `ui` → `presentation` has 17 edges. `narrative/journeys.ts` and `voice-context.ts` →
  `presentation/narrator`.
- **A build-time importer depends on generation.** `registry/orsino-inventory.ts` → `world/region-marvels`,
  `world/region-shops`.
- **Asset choice is baked into the world.** `world/community/community-writer.ts` → `paintings/*`. A portrait id is
  written into the generated Kyr as `Likeness "…"`, so the painting catalogue is part of every generated world's
  text.
- **Five strongly connected components.** The largest that matters is `content.ts` ↔ `effects.ts` ↔
  `rules/spellcasting.ts` ↔ `rules/spell-selection.ts` ↔ `canon/trait-grants.ts`, so core, rules and catalog cannot
  be loaded or tested separately. There is also `scenario-word` ↔ `world-assembler`.
- `lang/endings.ts` imports a type from `campaign/definition`.

**Recommendation.** Enforce a layer order in lint (`dependency-cruiser` or an ESLint import rule), with the current
violations listed as debt that may only shrink.

---

### A11 — A restored world is not state-equivalent

- **Severity:** Medium. It blocks H6's remedy.
- **Category:** Deterministic execution.
- **Confidence:** Confirmed.

**Observation.** `World.apply` keeps emptied relation and measure maps in place, so a name that empties and refills
keeps its position. A world rebuilt from a save puts it last. Only `withModule` drops empties
(`src/lang/world.ts:90-96`). The order is observable: `allFacts`, `of()`, `measuresOf` and receipts all read it. The
browser `join` also re-orders `state`'s keys.

**Evidence.** [`r2/persist-world-diverge.log`](evidence/r2/persist-world-diverge.log) and
[`r2/persist-empty-names.log`](evidence/r2/persist-empty-names.log):
- for generated "thorn" saved at step 10 or later, measure order, then receipts, then fact order diverge from the
  uninterrupted game, with the same multiset;
- the-long-man diverges the same way from step 65.

**Consequence.** Any per-step state digest would flag false divergences after every resume. A player's transcript
does not reproduce their saved state byte for byte.

**Recommendation.** Drop empty names in `apply` (or canonicalize order on every read that is exposed), and
canonicalize `canonical()`.

---

### A12 — The player's name is spliced unescaped into generated Kyr

- **Severity:** Medium.
- **Category:** Correctness.
- **Confidence:** Confirmed.

**Observation.** `src/world/origins.ts:60,71-75` substitutes `protagonist` and other values into templates, in two
passes. `src/world/memorial.ts:11` does the same for fallen companions' names. The only input check is
`maxLength={40}`.

**Evidence.** [`r2/persist-name-injection.log`](evidence/r2/persist-name-injection.log) and
[`r2/persist-memorial-braces.log`](evidence/r2/persist-memorial-braces.log):
- `Wen"na` and `Back\slash` with the order origin fail Begin with "Invalid Kyr module" or "JSON Parse error".
- `{creditor}` fails with "unknown entity".
- `{homename}` is re-expanded into a place name.
- A memorial for `{Wenna}` fails "A country begun again".
- A memorial for `Wen"na` truncates the cairn's text to "over Wen\".

**Recommendation.** Escape values for the Kyr string context in one pass. Since Kyr cannot escape `{` (A25), reject
braces in names or add an escape.

---

### A13 — Real place names leak where the page shows an alias

- **Severity:** Medium.
- **Category:** Knowledge.
- **Confidence:** Confirmed.

**Observation.** Several narration paths skip `ObservationText.label` and read raw `.name`:
- `narrative/journeys.ts:28` (the "You leave {from}…" lines);
- `presentation/openings.ts:29` (character-sheet developments);
- `narrative/obituary.ts:26,31`;
- `campaign/journey.ts:91`;
- the whole CLI surface, `information/information-view.ts:23-43`, which also skips `PlayerView.sees` and has its
  own command resolution.

**Evidence.** [`r2/know-alias-leaks.log`](evidence/r2/know-alias-leaks.log): the company is at a keep it knows as "a
ruined tower".
- The choices correctly say "Make camp at a ruined tower".
- The journey line says "You leave Grimwater Keep…".
- The character sheet names "the Eyrie of Saint Hollis".
- The obituary says "It is over, at Grimwater Keep."
- The CLI offers "Search Grimwater Keep".
- `keep_named` is still false afterwards.

**Scope.** Every generated site is aliased, so this reaches normal play.

**Recommendation.** One `Named` service for every player-facing name, and a lint that forbids `.name` reads of
entities in `src/presentation`, `src/narrative` and `src/information`.

---

### A14 — Clock shift for late installs misses some timers

- **Severity:** Medium.
- **Category:** Correctness.
- **Confidence:** Confirmed.

**Observation.** `src/campaign/clock-shift.ts:13-41` shifts only `watch(clock) <op> N` and bare measure comparisons,
in Rules, Observations, Objectives and Actions. These are not shifted:
- Query bodies;
- pursuits and goals;
- outcomes and milestones;
- timers used inside arithmetic (`watch(clock) >= dueAt(x) - 72`).

**Evidence.** [`r2/state-clockshift.log`](evidence/r2/state-clockshift.log): a module installed at elapsed 300
should treat 452 as its 152. Its Query-based and arithmetic timers fire one watch after install.

**Scope.** Low Water (`bowl.kyr:134`, a frontier country) has the Query-plus-arithmetic shape. It works only because
another rule happens to compare the same measure bare.

**Recommendation.** Express module-local time as a measure (`since(module)`), not by rewriting predicates.

---

### A15 — One foe fleeing ends the fight and counts as a win over all

- **Severity:** Medium.
- **Category:** Correctness.
- **Confidence:** Confirmed for the fight; the reward path is read in code.

**Observation.**
- A successful Flee by any combatant ends the battle for everyone (`src/effects.ts:276-280`, `battle.ts:239`).
- The campaign treats an enemy flight as victory and awards experience for the whole opposing group
  (`campaign.ts:283,331-337`).

**Evidence.** [`r2/combat-foe-flees.log`](evidence/r2/combat-foe-flees.log): with confused wolves, 131 of 400 fights
ended by one wolf fleeing. 282 of the remaining wolves were at full HP.

**Recommendation.** Remove only the fleeing creature. End the fight when one side has no one able, and award per foe
defeated.

---

### A16 — A module with Endings in two source files no longer loads

- **Severity:** Medium.
- **Category:** Authoring regression.
- **Confidence:** Confirmed.

`src/lang/endings.ts:30-31` declares `concluded` once per parsed file, and the files are then merged. The result is
"Duplicate function concluded". The same endings in one file load. Evidence:
[`r2/new-endings-split.log`](evidence/r2/new-endings-split.log).

A related problem: an author's own `Relation concluded()` is silently merged with the desugaring's, and the Ending can
never fire (`lang-compiler-gaps.log` G15). `reached`, `achieved`, `merit` and `unopened` are written by desugaring
but not reserved.

---

### A17 — Text with variables renders wrongly

- **Severity:** Medium-Low.
- **Category:** Narration and state consistency.
- **Confidence:** Confirmed (`lang-compiler-gaps.log` G6–G8 and G11).

- `{gold(?g)}` ignores the binding, so the text reads "Ann counts 0 coins" when she has 7
  (`observation-text.ts:75`).
- An Ending's closing page re-renders without the binding it fired with, so it prints "?g leaves rich."
  (`endings.ts:49`).
- `Observe … "{?who} waits here."` is accepted and prints `?who`.

---

### A18 — Counts taken past nothing

- **Severity:** Medium-Low.
- **Category:** Semantics.
- **Confidence:** Confirmed (`lang-runtime-semantics.log` R2).

- A Rule's `Decrease` clamps at 0.
- An Action with the same effect is refused (`admits`).
- `Set … to 0 - 5` stores −5.
- `[−5, +5]` gives 5, but `[+5, −5]` gives 3, from the same net change.
- `admits` reads `dice(x)` as a stored measure (0).

**Recommendation.** One documented rule (refuse, or clamp at the end of the effect list), applied by `apply`,
`admits` and `Set` alike.

---

### A19 — Dead "again" questions and English-chosen grammar

- **Severity:** Low-Medium.
- **Category:** Authorability.
- **Confidence:** Confirmed.

- **Repeat questions.** `WorldConstructs.recall` (`world-constructs.ts:229-234`) makes a repeat question only for
  titles matching an English question-word regex. The copy keeps the original guard, so where that guard negates the
  topic's own effect, the copy can never be offered. [`r2/new-topic-again.log`](evidence/r2/new-topic-again.log):
  - Tessary: 10 dead copies out of 82, and 29 once-topics with no copy;
  - generated `s0`: 12 dead of 101, and 65 with no copy.
- **Condition grammar.** `MechanicsText.holds` (`mechanics-text.ts:118-122`) decides from word endings whether a
  condition is a state. It produces "You are poisoning blade" and "You are warding glyph"
  ([`r2/new-condition-wording.log`](evidence/r2/new-condition-wording.log)). Both are M4's pattern.

---

### A20 — Coin reading and the NPC activity suffix reveal the unseen

- **Severity:** Low-Medium.
- **Category:** Knowledge.
- **Confidence:** Strongly supported (read in code).

- `presentation/coin-reading.ts:33-34` grounds priced actions in a hypothetical rich world and lists them through
  `ActionPresentation`. It bypasses `PlayerView.sees`, place aliasing and wording.
- `player-view.ts:340-348` appends ", but no way is open to them" to an NPC's activity. That suffix reports the
  result of the NPC's full plan search over facts the company cannot observe.

---

### A21 — The idle-rule cache misses entities added by an installation

- **Severity:** Medium if reached in play; confirmed at unit level only.
- **Category:** Correctness.
- **Confidence:** Confirmed at unit level; plausible in play.

A rule held idle is re-asked only when the stamps of the names it reads change (`campaign-tick.ts:128`).
`withModule` keeps the world's lineage (`world.ts:90-96`). So entities added by an installation, which are the very
domain a query ranges over, don't wake it.

[`r2/lang-runtime-semantics.log`](evidence/r2/lang-runtime-semantics.log) R4: the same rule object reports 0
instances where a fresh one reports 1. Whether a real frontier install triggers this was not demonstrated.

---

### A22 — Smaller defects

- **Severity:** Low.
- **Category:** Correctness.

| Defect | Evidence | Confidence |
|---|---|---|
| Summon ids can repeat after the oldest summon is dismissed (`summoning.ts:106,117`) | `r2/combat-summon-ids.log` | Confirmed at unit level |
| A revive with `percent: 150` passes validation, sets HP 22 of 15, and the store commit then throws | `r2/combat-bounds.log` | Confirmed |
| Enlisting sets the recruit's gold to 0 (`membership.ts:41`); the comment says the coin "stays theirs" | Code | Strongly supported |
| Milestones met by the world far from the company still award experience | `r2/new-milestone-once.log` | Confirmed |
| Outcome observations and module resolutions share the key space `<mod>.resolved` (`progression.ts:46-48`) | Code | Plausible |
| After a recruit leaves, `inhabitants` and `Membership.live` disagree about a buried member (`membership.ts:21-22,70`) | Code | Plausible |
| NPCs and rules from different installations contend in install order, not by any in-world rule | Code | Read |

---

### A23 — Combat constants and ids in TypeScript; field time lacks battle machinery

- **Severity:** Low.
- **Category:** Authorability.
- **Confidence:** Read in code.

**Hard-coded constants and ids:**
- the death save (DC 25), the damage-type trigger saves (DC 15, 3 turns), the summon cap (`3 + level/3`), Flee on
  1d2, and system shock (DC 10);
- ability and condition ids `'raise_dead'`, `'slain'`, `'rough_rest'` and `'camp_recovery'`, and a fist weapon;
- these live in `effects.ts:73,212,224,227,277`, `summoning.ts:99`, `field-use.ts:47-48,62-69` and
  `field-resolver.ts:24-25`.

**Field time is missing battle's machinery.** `field-use.ts:105-107` gives field time no dice stream and no `lapse`
handler. Dice ticks would crash there and death saves would be skipped. No current condition triggers this.

---

### A24 — Download, growth and double drawing

- **Severity:** Low.
- **Category:** Persistence, performance.
- **Confidence:** Confirmed for the sizes; read in code otherwise.

- **The downloaded checkpoint omits the story log and the build stamp** (`engine-host.ts:79`), so a game opened from
  a file has an empty Story page.
- **Every autosave re-serializes all events,** about 2.3 kB per command raw ([`r2/persist-growth.log`](evidence/r2/persist-growth.log)).
  Every frame also posts the full transcript.
- **A country can be drawn twice at once.** `Frontier.ahead` caches only resolved drawings, so a crossing during
  `prepare` draws the country twice concurrently. That is a realistic in-worker trigger for H7's concurrent-load
  failure.
- **Migrations are scattered** across six files, and `SessionCheckpoint`/`Transcript` are still `version: 1` though
  `drawn` was added.

---

### A25 — Kyr strings cannot escape `{` or `'`

- **Severity:** Low.
- **Category:** Authorability.
- **Confidence:** Confirmed.

The grammar's `escaped = "\\" any` promises any escape, but strings are decoded with `JSON.parse`
(`statement-parser.ts:62`). So `"it\'s"`, `"\{closed\}"` and `"\x41"` all fail, and there is no way to write a
literal brace ([`r2/lang-escapes.log`](evidence/r2/lang-escapes.log)). This is the root of A12's brace case.

---

## 4. Checked and found sound at `d79cbbd`

- **Query negation and repeated variables (mission-15 F2) are fixed.** 9,000 typed differential queries found 0
  mismatches, and `Candidates` was always a superset of the true answers.
- **Transcript replay equals live play byte for byte,** for the-long-man (120 commands) and for generated "thorn"
  with an origin, including a frontier crossing.
- **`SaveCodec` is lossless** for quotes, backslashes, astral characters and a 42 MB log.
- **The torn browser save the earlier review reported (its N1) is fixed:** A/B slots, the summary written last, and a
  toast. Its N2 (build trust) is partly fixed by `BuildStamp`.
- **Rollback restores everything in `current`,** plus observations, the store, the module, the definition and
  LocalKinds. The projection and grounding caches are keyed by identity and rebuild correctly.
- **Milestones are awarded once,** and identically in continued and resumed games.
- **The battle lease is sound in the main.** It clones fighter state, summons never escape it, and the turn cap ends
  in a draw that the campaign treats as failure.
- **`knows` is monotonic.** No `Retract knows` exists, and taught facts are exactly those authored. Voiced lines are
  told once across save and restore.
- **Commit `79f650c`** (a companion hears what is said near the company) is correct for its purpose.
- **No Tessary story knowledge entered `src/`.**

---

## 5. Revised priorities

The first report's five priorities stand. These findings add three things to do now, ahead of them, because each is
small and stops active harm:

1. **Serialize the worker and acknowledge stored worlds** (A2, A3). This is a few dozen lines that end wedged games
   and silently truncated worlds.
2. **Take the agency cache out of process memory** (A1), and keep presentation from calling the planner. Until then,
   every NPC-behaviour bug report is unreproducible.
3. **Raise, cure and flee by id, through one code path** (A4, A5, A15), with a catalog-wide property test that checks
   each ability's text against its execution.

They also sharpen the first report's priorities 1–3:

- **Priority 1, the engine contract,** must also own the write guard (A8), reserved desugaring names (A16), and rule
  module scope (A7).
- **Priority 2, the runtime-owned perception surface,** must cover NPC acts per watch (A6), every player-facing name
  (A13), the CLI surface, and coin reading (A20).
- **Priority 3, verified determinism,** must first make restore state-equivalent (A11), or the per-step digest will
  report false divergences. It must also cover the agency cache (A1) and late-install time (A14).

Finally, **the compiler should reject what can never work** (A9, A17): unbound or ill-typed effect variables,
variables in text that the condition doesn't bind, and queries asked outside their declared types. Each of these
today fails silently in play, where only a playtest finds it.
