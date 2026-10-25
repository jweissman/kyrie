# D. Independent risks and dissent

Phase III, snapshot `483e3af`. This document argues against my own sequence, lists what should be decided by
experiment rather than by argument, and sets provisional budgets.

---

## 1. The strongest case against building general systems

### Could a strong hand-authored city and several curated adventures give the experience without a shared-world compositor?

**Probably yes, for the next year.**

The evidence is in the probes:
- **Placement.** Two adventures installed into a live world with an import overlay. The Long Man is already placed by a ten-line `placed.kyr`.
- **Building onto another's place.** The tower added a stair onto the academy's place with plain imports.
- **Cross-author interaction.** Two institutions interacted through five lines of shared vocabulary.
- **Curation does the rest.** A curator who places each adventure by hand (one `countries.json`-style entry each), writes the city, and owns the shared vocabulary gets most of the coherence a compositor would.

**What a compositor adds is scale and independence from the curator.** Neither is the bottleneck while there are fewer than about ten adventures.

**My sequence already leans this way** (DR8 (a), K1 as `countries.json` plus hooks). The risk is the next implementer
reading Phase II and building its machinery anyway.

### Are we underestimating the burden of making campaigns compatible?

**Yes, probably.**
- The House That Grows is incompatible by era and premise.
- Thrume needs a placed variant and an Arrival.
- Let One Remember spans a plane and several regions.
- The Long Man's storm assumes a season.

Every adventure so far has needed *authorial* work to be placed. None could be placed by mechanism alone. If that holds,
the cost of the shared world is per-adventure writing, not engineering, and it should be budgeted as such: perhaps a
day of author time per adventure (Slice 1 will measure Thrume's).

**A shared world might be better as a curated anthology:**
- adventures that fit are placed;
- adventures that do not are separate games;
- and that is not a failure.

### Could strategic actors be convincing as authored events rather than autonomous planning?

**Yes, and the probe suggests that is the right first form.** The academy's interest in the tower was three authored
rules over shared vocabulary and an ambition's stages. No planner was involved.

**Autonomous planning** (`Agency` and `Planner` over institutions) **adds unpredictability authors cannot read.**
- The case *for* it appears only when institutions must choose among many possible undertakings in situations no author enumerated.
- That is not the next phase.

### Might a simpler route interface be better than a transport simulation?

**Yes.** Slice 3 asks for:
- a list of known destinations with times;
- "go on toward X";
- boarding a fixed-schedule service.

Nothing in the player requirements needs capacity, prices that move, or vehicle routing. A simulation would mostly add
ways for the ship to be absent when the player needs it.

### Are we solving problems of craft with software?

**Partly, yes.** Companions' depth, whether philosophy emerges from drama, and tonal range are craft.

The architecture's job is narrower:
- do not contradict what the player saw (K5, K7);
- do not overwrite authored text (the literary diff);
- let an author's line name what was found (0.4);
- let a companion's author write a stance once and have it apply to others' content (K3).

**Everything beyond that is writing and editing.** Slice 5's acceptance includes a human judgement on purpose.

### Could procedural integration undermine authored individuality?

**Yes, in two ways:**
1. Generated surroundings that are blander than the adventure, making it feel like an island in porridge.
2. Shared vocabulary that pulls authors toward the same terms and so the same stories.

**Mitigations:**
- the literary diff;
- a deliberately small vocabulary;
- refusing incompatible adventures rather than adapting them.

The first risk may be real regardless: the generated country is the weakest prose in the game by the reviews' own reading. **Improving generated prose may matter more to the shared-world experience than any compositor.**

### The smallest credible Kyrie that keeps its artistic promise

- **One hand-authored city of three wards.**
- **Four or five curated adventures placed around it,** each reached by a known road or a ship, and each heard of in the city.
- **Two companions written in depth,** whose authored stances apply to shared-vocabulary facts.
- **A generated countryside between them for travel and small goings-on.**

No compositor, no strategic layer, no sockets. Every slice in document A is a step toward this version, and none
requires going beyond it. **I would ship this first.**

---

## 2. Ways the plan could be wrong

| risk | what would show it | decide by |
|---|---|---|
| the journey policy finds things a human never would (or the reverse) | Slice 1 passes; the Slice 4 stranger fails to find the adventure | Slice 4's stranger, not more policy work |
| per-member knowledge (DR7) makes authoring harder than it helps | Slice 4 writers misuse member and company conditions | a Slice 4 variant with and without it |
| lazy installation keeps producing A1-class bugs | defects in Slice 1 at crossings | the eager variant of Slice 1 (DR2) |
| shared vocabulary does not stay small | Slice 2 authors each want new terms | count requests in Slice 4; the curator refuses most |
| path-dependent worlds (DR1) are fine for players | no Slice 1 tester notices | the Slice 1 human session; if nobody notices, keep (a) |
| a ward-and-landmark city feels like a menu, not a city | the Slice 2 human reading says "it is a list" | the Slice 2 reading; then consider a richer local street layer inside wards only |
| assisted travel removes the texture of travel | testers stop reading travel text | the Slice 3 session; give roads authored waypoints rather than automating fewer of them |
| the literary diff is too strict (a legitimate Arrival changes the first scene) | the diff fails on intended changes | an allow-list per Arrival, reviewed by the author |
| install times grow with the library | crossings over 2.5 s | the Slice 1 measurements; parse-ahead exists (`ModuleBundle.prepare`) |

**Things I did not verify in Phase III:**
- lint's behaviour on `{?x}` in Topics;
- Let One Remember's play inside a joined world beyond installation;
- whether Thrume's off-grid "Between" region causes any map or chart problem in a joined world;
- browser behaviour of any of this.

---

## 3. Performance and scale budgets (provisional)

**Measured** (Phases I–III, this machine: 4 cores, Bun 1.4.4):

| measure | value |
|---|---|
| wren engine command (`journey-profile`) | p50 28 ms, p99 260 ms, max 379 ms |
| wren total command (with screen and telling) | p50 49 ms, p99 274 ms |
| wren simulation alone | 80 commands/s |
| wren headless session | 30 commands/s |
| installation (adventure) | 0.33–0.60 s each into a 16k-fact world |
| joined world (2 adventures, 37.8k facts) | a wait took 88 ms |
| checkpoint | 4.4 MB at start of wren to 6.6 MB after 334 commands; 7.3 MB for the joined world |
| suite | 337 s |
| `journey-profile wren` | 33 s |
| `sim-bench wren` | 24 s |
| probe programs | 5–60 s each |

**Builder's figures** (not re-measured): crossings 1.2–2.1 s; frontier engine p50 133 ms at 104k facts; 7.8–10.3 ms a watch.

**Budgets:**

| demand | budget | assumption | slice that reveals it first |
|---|---|---|---|
| loading Begin | ≤ 4 s to the first frame | today about 2.7–2.9 s for a generated region | 1, 2 |
| installation at a crossing | ≤ 2.5 s, shown as progress | parse-ahead holds | 1 |
| command (engine) | p50 ≤ 60 ms, p99 ≤ 400 ms, at ≤ 60k facts | linear growth from the measured 16–38k | 1, 2 |
| assisted leg | ≤ 5 s for a two-day road | about 10 ms a watch (`time.md`) | 3 |
| choices and screen | screen p99 ≤ 150 ms | today screen max 226 ms in wren: **already over**; watch it | 2 (city density) |
| save | ≤ 10 MB uncompressed checkpoint after 500 commands | about 6.3 kB per command of log today; module embedded | 1 |
| replay | ≤ 50 ms a command headless | sim-bench B 33 ms | every slice |
| memory | ≤ 150 MB after a 500-command journey | 66–77 MB measured in wren | 1 |
| authoring turnaround | lint ≤ 5 s; a module's own scripted playtest ≤ 30 s | lint-outside spec timings; not measured here | 4 |

**Early-warning experiments, to run before committing to any of the above:**
- **The joined-world wander:** Slice 1's harness for 500 commands, profiled with `journey-profile`. This shows rule breadth and grounding growth.
- **A city with 30 named townspeople:** grounding is one schema per townsperson per conversation (the builder's notes). This shows the screen and choices cost.

**Do not optimise** horizon advancement, log compaction or incremental saves until one of these misses its budget.

---

## 4. What remains uncertain

**Decide these by experiment, not analysis:**
- whether path-dependent worlds matter to players (DR1);
- whether eager or lazy installation produces fewer defects (DR2);
- whether a ward-and-landmark city reads as a city (DR8);
- whether per-member knowledge is worth its authoring cost (DR7);
- whether an independent writer can do Slice 4 at all without help;
- whether generated prose between authored adventures is good enough that the shared world feels like a world.

**I cannot settle the last one, and it may matter most.**
