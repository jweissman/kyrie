# World construction, measured, and progressive commitment sketched (Mission 21, Experiment B)

The owner's commission: profile world construction and sketch progressive commitment. Establish what is built
eagerly, what is truly global, what only local play needs, and what can already be deferred or cached; then one
bounded demonstration, a small region with an adjacent unrealised one, crossed in different orders and restored from
a save, showing whether facts, identities and consequential events stay consistent.

Measured on 12–13 November on this machine (WSL, one process at a time, after `wait-quiet.sh`; another agent's specs
were running between mine, so **totals are noisy and components are the measurement**). Every figure below comes from
a script in `tools/` (see the last section); nothing is estimated unless it says *hypothesis*.

## 0. In short

- **A generated start is 7.2–7.8 s cold, 6.7 s warm (a1, kin); 12.8 s for a seed never seen (kahitude, debt)**, of
  which Ohm parsing the freshly written region is 4.4 s. A first country holds **11,671 entities, 230,474 facts and
  618 creatures**; its six standing scenarios cost 1.6 s of the start and hold 3,296 entities.
- **Three quarters of all facts are `proficient`** (176,026 of 230,474 in a1; 184,092 of 241,729 in kahitude): every
  creature in the world × every item kind it could wield, though only the company's `equip_item` reads it.
- **T24-11 is explained.** Each province's install (an adventure and the road to it: two installs) re-projects every
  creature's facts in the world twice, and the road's install checks the whole joined world once; the next command
  projects everyone a third time. Each of these grows with the world, and the projection grows faster, because every
  installation brings its own copies of the shared rules' calling and ancestry kinds, so every creature gains facts at
  every install (`hasCalling` from 12,597 to 54,103 over ten provinces), and item kinds grow too. Per install: 1.5 s
  for the first, 5–6 s by the tenth, 10–18 s past the twentieth; 181 s for 25.
- **Fixed here, its quadratic part:** `Discovery.validate` read every installation's initial facts once per source
  (207–522 ms of each of the first twelve installs, 7–12 ms now; the world identical at every step). The rest is
  structural and is ranked below, not changed in this pass.
- **The demonstration's verdict:** a game kept and opened between two crossings is exactly the game played on, and
  ids are canonical; but **a country beyond a march is not the same country in every order of crossing**: its draw
  reads what was drawn before it (scenarios placed anywhere, paintings people hold, works' names), so the country
  drawn second lacks what the first took, and some of its places are called otherwise. That is the first thing progressive commitment has to change.

## 1. What a start builds

### 1a. The phases (a1, origin kin, party of one; `tools/start-world.ts`, `bun --cpu-prof`)

| Phase | Cold (fresh process, parse store on) | Warm (same process) | Very cold (store empty) |
|---|---|---|---|
| imports | 0.37–0.42 s | — | 0.37 s |
| `WorldAssembler.assemble` (Deem draws the region; written as Kyr text) | 0.49–0.56 s | 0.27 s | 0.84 s |
| canon (Imbar) + manifest + the frontier framework's kits composed against the region | 0.77 s | 0.67 s | 5.5 s |
| the region module (one module of several files: the whole first country) | 2.04 s | 1.83 s | 2.5 s |
| six standing scenarios (circus 0.53, walk 0.33, howe 0.25, keep 0.23, arcology 0.16, fellowship 0.10) | 1.60 s | 1.45 s | — |
| eight drawn scenarios (factors, players, tower, den, den2, quarrel, drover, oxen) | 0.55 s | 0.47 s | — |
| thirteen word modules (what the folk tell of each) | 0.56 s | 0.53 s | — |
| origin, arrival, seven kit modules (raiders ×6, toll-keepers) | 0.45 s | 0.45 s | — |
| the last module, everyone's facts projected, the joined whole checked | 1.22 s | 1.36 s | 2.2 s |
| **`PlaySession.start`** | **7.2–7.8 s** | **6.7 s** | **20.9 s** |

kahitude (debt), a seed whose texts the parse store had never held: assemble 0.78 s, start **12.8 s**; the first step
(canon, kits) 5.0 s and the region 3.0 s, because **Ohm parsed the freshly written region, 2.8 s, and its topics'
predicates, 0.7 s** (`Composition.region` → `ModuleParser.parse`). A real player's new world is always this case: the
parse store makes tests cheap, not first starts.

Across all phases (a1 cold, profile 9.0 s with the sampler's overhead): `ModuleBundle.load` 3.5 s inclusive, of which
`structuredClone` 1.6 s self (cached parses copied for each caller 0.4 s, the instantiated module 0.3 s, the
LoadCache's fork 0.3 s, the namespace's drafts 0.2 s), **`ModuleAssembly.readOnly` 1.0 s** (1.7 s in kahitude), and
`instantiate` 0.7 s; `Campaign.install` 1.7 s; `CreatureFacts.project` 1.1 s (the final refresh 0.6 s, populations
0.5 s); `Geography.distances` 0.6 s (the kits' composition); Deem generation 0.4 s; the final check 0.4 s.
`readOnly` is worth naming: it validates the whole module once for every pressure, outcome and goal predicate
(`compiler.validate({ ...module, goal: p })`), so a scenario with a hundred people validates itself hundreds of times.

### 1b. The structures

What a started a1 holds, by the installation its ids are prefixed with (`tools/start-world.ts`): the region 4,672
entities (1,141 items, 955 passages, 726 facts, 563 places, 318 scenery, 244 members); the canon and shared rules 954
(330 abilities, 291 item kinds); circus 937, howe 614, keep 612, walk 546, arcology 455, fellowship 132; every other
module 70–190, of which **about 25 are copies of the shared rules' entities that are not on the canonical list** (8
calling kinds, 5 ancestry kinds, 5 land kinds, 4 trade classes, 3 degrees: `ModuleNamespace.canonical` leaves them
per installation). Facts: `proficient` 176,026, `hasCalling` 12,168, `hasAncestry` 10,413, then `relieves`/`treatable`
3,708 each, `connects` 2,316, `itemKind` 2,276. A kept start is 29–39 MB serialized.

Reach, from the M20 census: a1 has 531 rooms, kahitude 565, all reachable from the start; three countries composed
2,062 places; a first hour touches dozens.

| Structure | Built by | Cost (cold) | Global or local | Deferrable / cacheable now? | Coupled by |
|---|---|---|---|---|---|
| Shared rules (`data/rules/*.kyr`), parsed and compiled | `ModuleBundle.load` per module, `ParseStore` | in every module's load; ~35–40 ms fixed per module | global | **cached**: parse store on disk (not on CI), `ModuleBundle.parsed` in process | each module composes the rules with itself again (`ModuleAssembly.compose`), and copies the parse (`structuredClone`) |
| Canon (Imbar's planes, thresholds, names) | `CanonInstall.first` | part of 0.77 s | **global**, the same in every world | cacheable in principle (seed-independent); not kept across worlds today | — |
| Geography: land, atlas, settlements, roads, march-stones, provinces' gates, calendar | `WorldAssembler.region` (Deem), `RegionWriter` | 0.3–0.5 s | **global** | cheap already; deterministic from the seed and the cell | written as Kyr text and parsed (4.4 s for a new seed) |
| Identities of settlements, sites, people (ids, names) | `RegionWriter`, `StoryPeople`, `RegionPeoples` | in the above | **global** | deterministic from the seed for the first country; **not** for a country beyond (§4) | `apart`/`taken`/`held`: drawn apart from what is already in the world |
| Rooms, scenery, items of towns and sites | the region module | most of 2.0 s; 1,141 items, 318 scenery, ~560 places | **local** | no: the region is one module, composed whole | one module per country; `Composition.region` reads it whole again for the kits; `Geography.distances` over every place (0.6 s) |
| Inhabitants' full records (creatures, actors, goals) | each module's `people`, `ModuleInstallations.populate` | 618 creatures | identity global, record **local** | no | `CreatureFacts.project` over every actor whenever the module changes (`Projection`: all dirty on a new module); `proficient` for all |
| Standing scenarios (six) | `WorldAssembler.settle` → modules | 1.6 s, 3,296 entities | **local** (their sites); the circus's circuit touches every town | **omittable** (`Drawn.standing`, for specs); deferral to a gate is machinery that exists (`Frontier.province`) | their word modules are told at start; the circus's people move through the towns |
| Drawn scenarios (eight), kits (seven) | `settle`, `Composition.expand` | 0.55 s, 0.45 s | local | the kits' composition needs the region's geography read whole | — |
| Word modules (thirteen) | `ScenarioWord` | 0.56 s | **global** (what is told) | tiny modules, each paying the fixed per-module cost | — |
| Projections (creature facts) | `CreatureFacts.project`, `Projection` | 1.1 s at start; 1.3–3.6 s per province later | the company's global; everyone else's local | no | the whole world, each install and each command after a module change |
| The joined whole's check | `ModuleInstallations.check` (`ModuleCompiler.validate`, `Discovery.validate`) | 0.4 s at start; 0.5–2.3 s per crossing later | global, once | no | the whole joined module each crossing |
| A started world | `PlaySession.checkpoint` / `resume` | resume 1.0 s in a fresh process | — | **cacheable**: kept checkpoints (test-loop item 4) | — |
| Countries beyond the marches, provinces | `Frontier.expand`, `Frontier.province`, `prepare` | 2–6 s per country, 1.5–18 s per province | local | **deferred already**, drawn ahead while the player reads | §2 (cost grows with the world) and §4 (content depends on order) |

## 2. T24-11: why each install costs more the more are installed

Bed: thorn in the mountains, 25 provinces, the company set at each gate and `Frontier.expand` called
(`tools/t24-11.ts`, `tools/provinces-deep.ts`).

**Measured** (before the fix below; install, and the next command's refresh): 1.5 s and 0.4 s for the first;
3.1 s and 0.7 s by the seventh; 5.4 s and 1.1 s by the twelfth; 10.6 s by the sixteenth; 17.8 s and 3.6 s at the
twenty-first (Ombra); 181 s for 25. Creatures 640 → 2,149; facts 252,078 → 1,824,205.

Inside one install, at the tenth province (Pentrice, 6.0 s, `provinces-deep.ts`):

| Part | First province | Tenth |
|---|---|---|
| `CreatureFacts.project`, two calls, each over **every** actor in the world (`cf.member` called 2 × creatures) | 0.94 s | 3.05 s |
| `ModuleInstallations.check` at the road (the joined whole): compiler 0.32 → 1.63 s, `Discovery.validate` 0.18 → 0.52 s | 0.48 s | 2.03 s |
| `ModuleBundle.load` (the adventure's own size; not growing with the world) | 0.15 s | 0.67 s |
| everything else | < 0.1 s | < 0.3 s |

The code path: `Frontier.author` installs the adventure with `everyone = true` and then its road
(`linkp<id>`) with the defaults, `checked = true` and so `everyone = true`; `Campaign.install` →
`ModuleInstallations.populate` → `CreatureFacts.project(joined, live, store)` over all live actors; the road's install
then runs `ModuleInstallations.check` over the whole joined module. After the install, `Projection.refresh` sees a
module it has not seen and marks every actor dirty, so the next command projects everyone a third time (the "next
refresh" column).

Why the projection grows faster than the world: **each install genuinely changes every creature's facts.** I expected
the road's projection to write nothing (a road brings two places and a passage, and no people) and probed it: it
wrote **636 changes at the first province and 3,164 at the twenty-fifth, about one per creature** in the world
(`PROBE=1`). A road module is composed on the shared rules like any other, and `core.kyr`'s calling and ancestry kinds
are not canonical types, so the road brings its own `linkp…__calling_*` and `linkp…__ancestry_*`; `CreatureFacts`
gives every member a `hasCalling`/`hasAncestry` fact for every copy (`callings` maps a class to all of them). Over ten
provinces calling kinds went 312 → 472 and `hasCalling` 12,597 → 54,103; item kinds 307 → 439 and `proficient`
187,156 → 575,285 (creatures × item kinds). So the projection is O(creatures × (item kinds + installations)) per
install, and so is what it writes: the world's facts grow as the square of what is installed.

**Is a fix local?** In part:

- `Discovery.validate`'s scan was local and quadratic in itself (each source read every installation's initial facts):
  **fixed** (§3).
- Dropping the road's everyone-projection is *not* the free change it looks like: it writes real facts, so it would
  move them to the next command's refresh, change what the world holds between, and with it the transcript's digests
  at that step. Not done.
- The structural fixes, each with a measured gain, are steps 1–3 of §6: calling and ancestry kinds made canonical (no
  per-installation copies, so a new module changes no one's facts unless it brings people or kinds), `proficient`
  projected for the company alone, and the projection told which declarations changed rather than "the module is new,
  everyone is dirty". With those, an install would cost what it brings, and the check (linear, 0.5–2.3 s) would be
  what is left to make incremental.

`test/all-in-one-world.test.ts` is unchanged and still meaningful: it installs every province and asks only that they
load together (it runs under `KYRIE_LONG`, about 2.4 minutes locally).

## 3. Fixed in this pass

`Discovery.validate` reads where every source is in one pass over the initial facts (`src/information/discovery.ts`).
Measured on twelve installs, same world: **207–522 ms → 7–12 ms per install**, the world's key identical at each
step before and after. At a start it was 128 ms of the final check. Spec: `test/discovery-scale.test.ts`, a ratio
rather than a budget (eight times the sources among 50,000 facts may not take three times as long): 0.18 s; with the
fault put back the ratio is 10.4 and it fails. Commit b6563c24.

## 4. The demonstration

Two halves, because the existing machinery supports two different honest beds.

**Short (`test/small/lazy-neighbours.test.ts`, three worlds in 1.1 s).** A tiny home country with a chandler, and two
neighbours not yet realised, each installed by `Campaign.install` the first time the company stands at its
march-stone (as `Frontier` installs a country beyond a march): east then north, north then east, and east, the game
kept and opened (`trusted: false`, so checked again), then north. A torch bought at home, a rope bought in the east.
**Result: the same.** Each country's entities and every fact about them are equal in all three orders, the ids are
the countries' own (`east__osric`), and both purchases and their coin are so in every country after every crossing.
This proves the install contract (canonical ids, no reset of what is held, saves that round-trip) and that **a
country committed as text, not drawn, is order-independent.** It cannot show a draw's dependence: its neighbours are
authored.

**Long (`test/crossing-order.test.ts`, `KYRIE_LONG`, about a minute: one generated start and six countries drawn).**
a1's first country, and Fencarr (west, `xm1y0`) and Cloudreach (north, `x0ym1`) beyond its marches; something bought
from a seller at home first; then west, north / north, west / west, kept and opened, north.

- **Kept and opened between crossings: the same**, every entity and fact of all three countries (home 4,820 entities
  and 114,454 facts, west 4,357 and 88,748, north 3,685 and 83,920) and every creature.
- **What the company did at home is so** after both crossings in every order: the thing bought is the company's and
  off the shelf, and the coin is the same.
- **Identities are canonical:** each country's places, ways and people have the same ids in either order. **Their
  names are not all the same:** two of Fencarr's works are named otherwise when it is drawn second (its barrow
  Lacrimerecs or Tenebrerechies, a ruin Nocswigil or Silentumwigil, and the ghoul who moved into it said accordingly),
  because a country's works are named apart from the works drawn already (`taken`).
- **But the countries are not the same in either order** (inverted, as `it.failing`, until it is fixed):
  - **the fever** (a scenario of one instance in a world) is placed in whichever country is drawn first: west first,
    Fencarr has `xm1y0fever` and its word module and Cloudreach has none; north first, the reverse. 153 entities, two
    people (Edith and Edda, the fever's mother and sister) and ~2,900 facts move between countries with the order;
  - **people's likenesses differ**: 55 in Fencarr and 69 in Cloudreach are given other paintings (a chandler a
    revolutionary or a logician), because a country's people are painted apart from the paintings the world's people
    already hold (`Sittings.held`);
  - **what the folk tell differs**: Cloudreach's word of the stranger who pays in old coin names other informants;
  - and home gains `hasAncestry` facts to whichever modules exist (the per-installation copies of §2).

The cause is in `Frontier.drawn` → `WorldAssembler.beyond`: the draw takes `exclude` (scenarios placed anywhere
already), `held` (paintings held), `taken` (works' names already used), `named` (the neighbours' real names), and
`ModuleBundle.apart` names a story's generated people apart from everyone present. Each is a greedy, first-come
constraint over the whole world, so **a country is a function of the seed and the history of crossings, not of the
seed and the cell.** Reproduction: `KYRIE_LONG=1 bun test --no-isolate test/crossing-order.test.ts` (the inverted
test), or `bun doc/architecture/mission-21/world/tools/orders.ts` for the differences listed.

Not established: whether a country *saved* and *replayed* from its transcript is drawn the same (it should be: the
replay crosses in the same order, `frontier-replay.test.ts`); and whether the provinces, which are authored, differ
by order in their generated people's names (`apart`); I did not measure that.

## 5. Progressive commitment, sketched

What the evidence supports committing, and when (*hypotheses* where marked):

**At creation (cheap, global, from the seed alone):**
- the world's grid of countries, their terrains and names (`WorldGrid`, already), and each country's settlements and
  sites as identities: ids, names, kinds, cells (Deem's draw of a region is 0.3–0.5 s; the country's text is not
  needed for it);
- **a world-level allocation of every limited thing**: which country holds each scenario of limited instances, each
  painting, each work's name. Today these are taken greedily at draw time (§4). Allocated once from the seed (as
  `Countries.plan` already allocates the authored countries), a country's draw would read its allocation and nothing
  of the history, and §4's inverted test would pass. *Hypothesis:* the allocation is cheap (a few thousand ids) and
  can be made lazily per cell from a seeded order without a whole-world pass;
- the calendar, the canon, the shared rules (cached).

**On approach (local, when the company's horizon reaches it):**
- a country's rooms, items and scenery, its scenarios' modules, its inhabitants' full records: as `Frontier` already
  does for countries beyond, and could do for the first country's standing scenarios and distant towns (the province
  mechanism: installed at a gate);
- inhabitants' projections only for those in reach (step 2 below).

**What it would save, by the measurements:**
- the six standing scenarios at start: **1.6 s of 7.2 s**, 3,296 entities, ~119,000 facts (counted with their members'
  `proficient` facts);
- the first country's distant towns and sites: *hypothesis*, not measured: most of the region module's 2.0 s and
  4,672 entities, if the region were split by settlement (it is one module now; this is the expensive change);
- the projection's world-wide cost at every module change (1.1 s at start, 1.3–3.6 s per province install later).

**What it would not save by itself:** lazy installation moves cost to the crossing, and the crossing's cost grows with
the world (§2). Steps 1–3 below come first; without them progressive commitment only reschedules the quadratic.

## 6. Next steps, ranked by gain against risk

1. **`ModuleAssembly.readOnly`: check the module once and each predicate alone** (low risk, contained). Validate the
   module whole once, then each pressure's measure, outcome and goal predicate against the same lookups, instead of
   validating the whole module once per predicate. Gain: **1.0 s of a1's start, 1.7 s of kahitude's** (13–14 %), every
   generated start and every install. The errors it raises are the same.
2. **Calling and ancestry kinds canonical** (`ModuleNamespace.canonical` gains `callingkind`, `ancestrykind`; medium
   risk: ids in saves). Removes the per-installation copies, so a new module stops changing every creature's facts;
   `hasCalling`/`hasAncestry` fall from ~40 per creature to one, and the road's projection from ~1 write per creature
   to none. A save from before holds the namespaced ids: restore must map them (and `Campaign.restore` compares the
   projection with the saved facts: "Inconsistent saved creature facts").
3. **`proficient` for the company only** (medium risk: saves again). 76 % of a world's facts, read by one action of
   the company's. Gain: facts 230,474 → ~55,000 at start, most of the projection's per-member work, a kept start well
   under half its 29–39 MB; and the per-install growth by item kinds goes. Restore must drop the saved others'
   facts before comparing.
4. **Allocate limited things at world level from the seed** (medium risk: changes what every country beyond holds, so
   every replay past a march differs). Makes a country a function of seed and cell: §4's inverted test passes, and
   countries become cacheable by cell (drawn once per seed, kept, installed anywhere).
5. **Incremental projection and grounding** (higher risk: `World`): `Projection` told which declarations changed, not
   "new module, everyone dirty", and, as the fast-loop's measured negative found for grounding (4.5 % reuse because
   townsfolk move hourly and nearly every action reads `at`), stamps per relation *and argument*, so that what is read
   about the company and its place can be told apart from what is read about everyone. Gain: the third projection per
   crossing, and the per-command projection over the whole world; not measured beyond §2's "next refresh" column
   (0.4 → 4.1 s).

Then, and only then, the standing scenarios installed at their gates (1.6 s of a start) and the region split by
settlement.

## 7. What I could not establish

- Totals under load: another agent's specs ran between mine, and two runs of the same twelve installs differed by 20 %
  in total; I quote components, which agree between runs.
- The region module's split cost by settlement: not measured (it would need the split).
- Province order-dependence (`apart`): not measured.
- How much of `structuredClone`'s 1.6 s could go: copy-on-write sharing of cached parses is plausible but untried.

## Tools (`tools/`)

Run from a worktree's root (they import from `$W`, default the current directory, and the parse store opens only
there).

| Script | Measures |
|---|---|
| `start-world.ts` | a start, module by module (`SEED`, `ORIGIN`, `TWICE=1` for warm), and the inventory by installation and relation |
| `prof-sum.ts`, `prof-callers.ts` | a `.cpuprofile`'s self and inclusive time; the callers of a frame |
| `provinces-deep.ts` | each province's install by part (`N`), and the facts each relation holds after it |
| `t24-11.ts` | each province's install and the next refresh (`N`); `PROBE=1`: what the road's projection writes |
| `orders.ts` | a1's countries beyond west and north in three orders, the differences listed |
