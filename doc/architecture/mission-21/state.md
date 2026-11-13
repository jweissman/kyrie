# Mission 21: where it stands (14 November 2026)

An honest account against the brief (`brief.md`), written at the owner's request after a human play attempt still broke
down quickly. It is the record to resume from. The measures can be taken again: `bun scripts/register-state.ts
[revision]`, `bun scripts/register-held.ts`, `bun scripts/terminal-walks.ts`, and the CI runs. The short verdict: the
mission has built better instruments and fixed many specific defects. It has not yet delivered the four outcomes it was
set.

## The four outcomes

| Outcome | Verdict | Evidence |
|---|---|---|
| 1. The development loop is substantially cheaper | **partly** | quick lane ≈ 15 s locally (788 tests); push CI 1–4 min a shard; the whole suite ≈ 27 min wall, 246 job-minutes (was 35–45 min): only ~25 % cheaper |
| 2. The game is dependable for fifteen minutes | **not met** | the owner's play of 14 November broke down quickly; on main as it stood, round 13 failed in two of three starts and in the page until fixed; FH-01 (no person has accepted the first hour) open |
| 3. The presentation is significantly better | **not met** | real steps (one action atom; the fight's stable composition; the narration budget; no person pip; the terminal's colour) but the scene is still pages; lenses, compass and hold not yet in the page |
| 4. Inherited obligations materially discharged | **not met** | since M20: fixed rows 40 → 70 (mostly M21's own PL list); P0 open 1 → 6 (the continuity rows are new P0s), P1 open 22 → 24; fixed rows held by a spec 5 → 49 of 68 |

## Tests: what changed, and what was only moved

What is real:
- **The quick lane.** `test/small` (tiny Kyr worlds, 0.1–0.4 s a spec) and `check:fast` at about 15 s. A change to the
  terminal, the narrator, gold, lenses or creation is now proven in seconds, and most M21 fixes came with such a spec,
  each mutation-checked.
- **CI's own costs.** The parse store is cached between runs: a cold library parse is about 30 s against 3 s warm, in
  every worker. Every lane has a 30 s default timeout: bun's 5 s had made slow-but-sound specs red.
- **The register.** 49 of its 68 fixed rows now name a spec that holds them.

What was only moved: **the owner is right that the heavy suite was brushed under the rug.** The push lane runs 524
of the suite's files. The rest (generated-world journeys, browser journeys, long descents) runs nightly or on demand.
That stopped the bleeding, but:
- the whole suite is about 25 % cheaper, not 10×;
- push CI was red for most of 13–14 November: five of the last twelve push runs passed, on timeouts and lint slips,
  not regressions, and that red went unread for a day;
- a full run caught regressions twice (the SRD ghoul, a near-dead guard) only because one was dispatched.

What it would take to run every test every time, fast: the cost is in drawing whole countries. A generated-world spec
spends seconds composing a world (`Composing the world` is 5.4 s of a 6.0 s terminal start) before testing anything.
- **Share worlds.** A spec reads a kept checkpoint per seed, drawn once per run (the `Kept` prefixes were −17 % on one
  file), not its own `DrawnWorld.start`.
- **Port to tiny worlds.** Move the generated-world specs that test one rule onto a tiny Kyr world. About 90 such
  ports were made; hundreds remain.
- **Make composition cheaper.** Parse cache, lazy installation, per-argument stamps: Experiment B steps 4–5, not built.

A realistic M22 target: the whole suite on every push in under 10 minutes wall. Only evidence-gathering walks and long
descents stay nightly, and stay green.

## Playability and aesthetics

The owner's continuity report (`owner-continuity.md`, register §26) names what is wrong: the game is still a
collection of pages (Look, Explore, Map, Talk, Combat), not one scene.

| Row | Engine | Page | Shown in play |
|---|---|---|---|
| CN-01 lenses | `Glance.lenses` landed (and the terminal's `things`/`people`/`places`/`time`) | in progress (rail sets the lens in place) | no |
| CN-02/03 interiors, compass | `enclosed`, no overland from inside, `Compass` landed | not started | no |
| CN-04 one action system | contract for the fight's pace | the census; every act through one atom with `data-act` | partly |
| CN-05 time lens | waiting acts as a lens; the company's own acts ruled into it (pending) | in progress | no |
| CN-06 combat | — | one composition, stable geometry (browser spec at two sizes) | the fight only |
| CN-07 colour | no aspect for being a person | no pink person pip | yes |
| CN-08 the interior walk | headless walk pending | browser walk pending | no |
| hold experiment | `Choice.hold` | an option of the atom and creation's cards, behind `?hold` | becoming default |

Round 13's cold plays (playability batch 10) found and fixed four P0s on the way. With the fixes, all three starts held
headless. The page still showed a wrong pip (PL-32), and the debt's chain still stops at its second place (PL-27).
Earlier batches fixed PL-01..24, most of them gold's thread. **No person has yet played the first hour and accepted
it.** The owner's guide for that is `acceptance-guide.md`.

## SRD accuracy

What is real:
- hit dice as Deem expressions with exact means;
- typed defences (immunity, resistance, reduction with bypasses, regeneration);
- variations carrying hit dice and defences;
- attack riders (the barrow ghoul's paralysis);
- only a wound triggers a condition;
- one chance for a venom;
- healing cantrips once between rests;
- a placement report that re-balanced a1's dens without retuning a stat block (18/13/8 → 11/20/8 trivial/fair/lethal).

But **only one SRD stat block is placed in play**: the barrow ghoul in the vault. Every other creature a player meets is
still Orsino's. The blockers are the engine's, written up in `rules/engine-pressure.md` (in progress):
- numbers fixed when a country is written;
- stat blocks as fixed numbers;
- items not composed of form and material;
- riders only on single hits, and no spell resistance;
- recharge undeclared;
- challenge measured too coarsely to watch.

The enablers that change no world are being built now (Deem stats over level, weapon materials, declared recharge,
placement invariants). Making the bestiary SRD-faithful is M22's work on top of them.

## The terminal

The terminal is now:
- one presentation with the page's glance and emphasis;
- in true colour;
- free of repeated context;
- able to take lenses;
- timed at start-up, with `--profile`;
- walkable by a measured walker (four real walks: 2.7–3.0 sentences an arrival);
- given character creation, from one engine flow (`web/engine/creation-flow.ts`, which the page is to adopt).

The owner still finds it "a mess and not really playable", and that is the measure. Start-up is 6 s. The aim's title is
a crude cut of its first clause: a real short title needs authored data. And a walk's three sentences are still three
long ones.

## Why the outcomes were not met (and what to change)

- **Breadth over closure.** The mission ran four lines (tests, playability, aesthetics, rules) plus terminal work in
  parallel. Each produced real increments, and none was carried to the owner's acceptance. The owner keeps adding
  well-founded requests (continuity, terminal, hold, SRD), and each was taken up at once. The cost is that nothing is
  finished end to end.
- **Green specs are not acceptance.** Every batch passed its gates, and the game still broke down in human hands
  within minutes. The cold rounds find P0s each time. The engine contracts land quickly; the page that shows them lags
  by a batch or two.
- **Red CI went unread.** Push runs failed for a day on timeouts and a lint slip, while only full runs were watched.
  Since 14 November every push run is watched to its end.

## Next, in order

1. **Close continuity (CN-01..08) in the page and in play**, the walk shown at desktop and iPad. This is the owner's
   central concern. Make the hold the default with it.
2. **Make the whole suite the push gate.** Shared kept worlds per seed; port single-rule generated-world specs to tiny
   worlds; measure job-minutes each week. Target: under 10 minutes wall.
3. **One human acceptance session of the first hour** (FH-01), with `acceptance-guide.md`, and its failures as P0s.
4. **SRD:** land the enablers, then place SRD stat blocks one creature at a time, each fought where it is placed.
5. **The terminal:** authored short titles for aims; cheaper start-up; the page adopts `CreationFlow`.

## State to resume from

- **Main:** `/var/tmp/kyrie/wt-m21`, branch `m21`, pushed to `main`; the owner's checkout fast-forwarded after each push.
- **Agents, each on its own branch and worktree:**
  - playability: `m21-play`, `wt-m21-play`; CN-08 headless walk; Lens fill rule; the company's acts in the time lens;
    PL-32.
  - aesthetic: `m21-look`, `wt-m21-look`; lenses in the scene, then the hold as default, then the compass and creation
    from `CreationFlow`.
  - rules: `m21-rules`, `wt-m21-rules`; engine-pressure note and the enablers. T24-20 (Common names) is paused, with its
    switch-over saved at `/var/tmp/kyrie/steps/t24-20-rest.patch` (`rules/common-names.md`).
- **Measures:** `scripts/register-state.ts`, `scripts/register-held.ts`, `scripts/terminal-walks.ts` (transcripts in
  `terminal/`).
- **Records:** `progress.md` (the log), `debt.md`, `fast-loop.md`, `continuity-plan.md`, `owner-continuity.md`,
  `owner-terminal.md`, `playability.md`, `aesthetic/census.md`, `rules/*.md`.
