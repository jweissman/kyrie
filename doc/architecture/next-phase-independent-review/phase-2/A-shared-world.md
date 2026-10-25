# A. Shared-world architecture study

Phase II of the independent review. It uses the same snapshot as Phase I: `483e3af`.

This is a prospective study, not a specification. Each proposal is tagged:
- **[R]** a requirement the stated goals impose;
- **[O]** one of the options for meeting it;
- **[Rec]** what I recommend;
- **[S]** speculative.

Claims about today's system cite code, or the probes in `phase-2/probes/` and Phase I's `probes/`.

---

## 1. What exists today

Kyrie already has **four placement mechanisms**. They were written at different times, and each is a partial version
of the same idea.

| mechanism | where | what it places | how it is found by a player |
|---|---|---|---|
| Campaign manifest | `data/campaigns/*.campaign.json`, `ModuleBundle.campaign` | an adventure as the whole game, with its own company, calendar, pitch and party | title page (`?dev` only for authored ones; Phase I E1) |
| Scenario library | `data/scenarios/library.json`, `*.scenario.json`, `WorldAssembler` | goings-on into a generated region: `places: { town: { settlement: "any" } }`, `instances`, `weight` | **hooks**: an exported fact carried by rumour **channels** (`tavern`, `road`, `temple`, `market`; `RegionWriter.carriers`), and `opens` reveals the way in |
| Kits | `data/kits/*/kit.json`, `src/world/compose/*` | powers and their works, against an append-only **ledger** of assembly facts (`data/assembly/vocabulary.kyr`): `slots` (Kyr predicates), `provides`, `claims` (exclusive), Deem `proposals`, `hooks`, and a `trace` of every decision | the same hooks |
| Authored countries | `data/adventures/countries.json`, `Frontier.fits` | an adventure as a region beyond a march, with a `placed.json` variant whose company is imported (`the-long-man/placed.kyr`) | only the march-stone's text; and that can name the wrong country (Phase I E2) |

**Under all four sit the strong primitives:**
- Module namespacing and shadowing (`ModuleNamespace`, `ModuleShadow`).
- Typed imports and exports, with role contracts (`RoleRequirements`: an import must be of a type and satisfy Kyr conditions).
- Installation between commands, undone whole on failure (`Campaign.install`, `Campaign.undo`).
- `ClockShift`, which moves an adventure's absolute clock tests forward by the time already passed when it is installed.
- Determinism keyed by installation id (`RandomStreams.key(seed, 'module', id, …)`).

**The feasibility probe** (`phase-2/probes/all-in-one-world.probe.ts`, output beside it). Into a live generated world (seed a1: 16 modules, 16,003 facts), I installed three standalone campaigns. Each was unchanged except for an overlay that replaced its `Company party … at X` with an import of the world's company.
- **Thrume** installed in 0.33 s, with its road in 0.09 s.
- **Let One Remember** installed in 0.60 s, with its road in 0.12 s. The world was then 37,801 facts in 20 modules.
- **The House That Grows was refused:** "Module initialization cannot reset imported or campaign-owned state". Its premise asserts `stareTrained(party)` (`cobble-ring.kyr:43`). The admission rule refuses a one-argument assert on an imported entity (`ModuleInstallations.admit`).
- A `wait` in the joined world took 88 ms, and the checkpoint was 7.3 MB.
- The company then walked six offered steps (57 watches) to `thrume__salt_road`. It saw Thrume's opening observation, and was offered Thrume's choices alongside the world's.

**So the mechanical half of "all campaigns in one world" already works** for two of the three standalone adventures. It took no engine change, and I wrote a placement variant for them only as an overlay. What is missing is everything that makes it *coherent*:
- where it goes;
- why anyone tells the company about it;
- what the company has to be for the premise to hold;
- what happens when two adventures disagree;
- what installation order means for a save.

These are composition questions, not engine questions.

---

## 2. What each adventure assumes, and where those assumptions break

Taken from the four shipped adventures (`data/campaigns/*.campaign.json`, their `company.kyr`, and `grep` of their clocks).

| assumption | Thrume | House That Grows | Let One Remember | Long Man |
|---|---|---|---|---|
| company | 3, at `salt_road`, 30 gold | **1, a named stare-student of Kezu, `stareTrained`**, at Kezu's kitchen | 3, at `eighth_bend`, 60 gold | 3, at `road_end` (placed: imported) |
| calendar | 1312-11-03 | **3640-08-28** | campaign's own | 1312-08-17 ("the autumn storm is three days off") |
| geography | two regions (`fells`, and "the Between") | one region (`strewnfield`) and a **city in the sky overhead** | a **plane** ("the Margin") and several regions | one region |
| absolute clocks | `watch(clock) >= 216`, `>= 1296` | `>= 312` | `>= 1440`, `2592`, `3024` | `< 132`, `< 144`, `< 192` |
| polities named | Margravine of Ebb, Duke of Harle | the floating city | its own | the steward of the Hall |

Kyrie's adventures are **not all compatible** with one world, and they do not need to be.

**The House That Grows** is set two millennia after the others (calendar year 3640), in a country with a city in the sky, and its protagonist is a specific person. Forcing it into a 1312 frontier would sacrifice the adventure to the world. The architecture needs a way to say so.
- **[R]** An adventure declares its **compatibility**: era, cosmology tags, and the protagonist premise. The world refuses to place it, or places a variant the author wrote, rather than placing it wrongly.
- **[O] HTG, option 1:** HTG stays a separate world, and is offered as a separate game on the title page.
- **[O] HTG, option 2:** its author writes a placed variant. For example, the company *arrives* at Cobble Ring and Kezu takes a new student. The premise is then something the world can grant, through an `Arrival` that asserts `stareTrained` after an apprenticeship scene.
- **[Rec]** Option 1 by default. Option 2 only when the author wants it.

**Absolute clocks:**
- They are handled by `ClockShift` for watch comparisons and timers. That is a good, existing invariant.
- **Calendar seasons are not handled.** "The autumn storm three days off" read in a world where it is spring is a contradiction the engine cannot detect.
- **[R]** An adventure may declare the seasons or dates its premise needs, as an entry condition.

**Polities:**
- Thrume's Margravine and Duke are prose and local entities. A generated world beside it has its own kingdom (`Histories`).
- Nothing reconciles the two, so nothing is contradicted mechanically. But the player may read of the Duke of Harle in Thrume and never hear of him anywhere else.
- **[O]** Leave it: places can be local.
- **[O]** Let an adventure **export** a polity as a world-level actor, as a role others may reference (doc C).
- **[Rec]** Export only what the author chooses. An unexported polity is local colour, and that is fine.

---

## 3. Two overall architectures, and a third

### 3.1 Eager global installation (E)

- At the start, every compatible contribution is placed in a world plan *and installed* into the campaign.
- **For:**
  - simplest semantics;
  - every rule sees everything from watch 0;
  - nothing is installed during play, so A1-class (Phase I) mid-play validation problems vanish;
  - replay needs nothing new.
- **Against** (measured or traced):
  - Thrume and Let One Remember alone add 21,800 facts to one generated region's 16,000.
  - Every rule of every module is asked every watch (`CampaignTick.rules`). `time.md` measures 3.1 ms of rules a watch at 1,496 rules, linear in modules.
  - The checkpoint grows with every module: the compiled module is embedded (Phase I G1).
  - Absolute clocks start at watch 0 for adventures the player reaches in month six. `ClockShift` exists precisely because this is wrong.
  - Every adventure's timed disaster (Long Man's storm, Thrume's 1296-watch deadline) runs whether or not the player ever comes. Most adventures would be "over" before they are found.
  - Startup cost grows with the library.
  - **Verdict:** wrong for authored adventures with clocks; acceptable for small, clockless colour.

### 3.2 A registry of world contributions, instantiated on demand (R)

- At the start, the world reads a **registry**: what each contribution is, what it needs, where it can attach, and how it is heard of. It writes a **world plan**: an append-only ledger, as the kit ledger already is. The plan records where each contribution *will be* and who knows of it.
- Modules are **installed when first needed**: the company comes within a horizon of the entry (as the frontier does today), or an event elsewhere touches the contribution's exported actors.
- **For:**
  - the cost follows the player;
  - clocks start when the adventure is reached (`ClockShift` already implements this);
  - adventures stay unspoilt until found;
  - it matches the frontier, which already does exactly this for regions.
- **Against:**
  - mid-play installation is the path where Phase I found A1 (critical), A2 and C1;
  - installation order becomes play order, which affects identity, saves and replay;
  - a contribution that is placed but not installed cannot take part in rules. A not-yet-installed academy cannot answer a court wizard's letter.

### 3.3 Hybrid: plan eagerly, install lazily, project the uninstalled (H) **[Rec]**

1. **Plan eagerly.**
   - At world creation, every compatible contribution is placed in the **world plan**: a ledger in the assembly vocabulary, extended (§5).
   - The plan is a pure function of: the seed, the registry contents (pinned by content hash), and the company's origin.
   - It is cheap: no Kyr is parsed beyond the contribution's manifest. Kit placement with ledger and trace is already this.
2. **Install lazily.**
   - A contribution's modules are installed inside the command that first brings the company within its **horizon**: the region it is in, or one step from its entry. This is the same rule `Frontier.prepare` and `Frontier.expand` already use.
   - Its clocks shift to that moment.
3. **Project the uninstalled.**
   - Each contribution's manifest declares a small **public face**, readable by the world before installation:
     - the rumours it seeds (hooks);
     - the entry's name and kind;
     - exported actors and institutions, with their public stance, if it chooses.
   - The world writes the public face into the region where it is planned, as the scenario hooks already do.
   - A strategic actor of an uninstalled contribution exists in the world plan as a **summary** (doc C §2). It is instantiated with its module.
4. **Install order is recorded, not implied.** An installation is a recorded consequence of a command: today it already lands inside `PlaySession.perform`. Its id is the plan's id, not the order of arrival, so two players who reach Thrume at different times get the same Thrume.

**Why the hybrid over pure R:** pure R has no answer to "can the academy be heard of before it is installed?". The public face answers it without installing anything.

**Why the hybrid over E:** cost, clocks and spoilers, all measured or traced above.

**[R] Preconditions from Phase I** (without them H is unsafe):
- A1: installation validates only what it installs.
- A2: no checkpoint mid-installation.
- C1: kind ids namespaced.
- C2: actions scoped to the module.
- G1: saves stamped with the registry's content hash, since the plan depends on it.

---

## 4. The diagram

```
 AUTHORING                         COMPOSITION                         SIMULATION                 PRESENTATION
 ─────────                         ───────────                         ──────────                 ────────────
 adventure/                      ┌──────────────────────┐
  contribution.json ──read──►    │ Registry             │  content-hashed list of contributions
   (needs, attach, face,         │  (manifests only)    │
    owns, exports, preserve,     └─────────┬────────────┘
    may-vary, compat)                      │ seed, origin
  *.kyr (private)                          ▼
                                 ┌──────────────────────┐   append-only, traced; refuses on conflict
 Deem tables, kits ─────────►    │ World plan (ledger)  │◄── generated regions, city plan, routes
                                 │  where · who knows · │
                                 │  public faces        │──► public faces written as facts ──┐
                                 └─────────┬────────────┘                                     │
                                           │ horizon reached (inside a command)               ▼
                                           ▼                                            ┌────────────┐   PlayerView,
                                 ┌──────────────────────┐  install(request) ─────────►   │ Campaign   │── ScreenModel,
                                 │ Instantiator         │  (ModuleBundle → Namespace →   │ World      │   Narrator
                                 │ (Frontier, generalized)│   Shadow → Installations,    │ (one)      │   (reads only)
                                 └──────────────────────┘   ClockShift, undo on fail)    └─────┬──────┘
                                                                                               │ transcript +
                                                                                               ▼ plan hash
                                                                                         save / replay
```

**The principal interfaces:**

| interface | from → to | exists? |
|---|---|---|
| contribution manifest | author → registry | **partly**: `scenario.json`, `kit.json`, `countries.json` are three dialects of it |
| plan ledger | composition → instantiator | **yes**, for kits (`Ledger`, vocabulary.kyr, `Trace`) |
| public face as facts | plan → world | **partly**: scenario hooks and carriers |
| install request | instantiator → campaign | **yes**: `BundleRequest` with imports |
| horizon trigger | campaign → instantiator | **yes, for regions** (`Frontier.prepare`, `Frontier.expand`, inside `perform`) |
| plan hash in save and transcript | composition → persistence | **no** (Phase I G1) |

---

## 5. The contribution manifest (the unifying interface)

**[Rec]** One manifest dialect replaces the scenario, kit and country dialects. It is small. Everything not listed stays
private Kyr.

```jsonc
{
  "version": 1, "id": "thrume", "name": "Thrume",
  "compat": { "era": "1300s", "cosmology": ["dream-world"], "premise": "any-company" },   // §2
  "modules": [ { "id": "thrume", "bundle": "placed.json" } ],
  "attach": {                         // where it can be encountered: one or more entries
    "entry": "salt_road",             // an exported place of its own
    "into": { "is": "region(?r) and terrain(?r, mountain)", "prefers": [ { "when": "near(?r, start)", "weight": 1 } ] },
    "by": "road"                      // how it is joined: a road, a ward slot, an institution's door (doc B)
  },
  "face": {                           // what the world may know before it is installed
    "hooks": [ { "fact": "giants_down", "topic": "the giants come down off Thrume", "channels": ["road", "tavern"], "opens": true } ],
    "actors": [ { "id": "margravine", "role": "ruler", "stance": "pays for the thane's head" } ]
  },
  "needs": [ "season(autumn) or season(winter)" ],    // entry conditions on the world (§2)
  "owns": [ "*" ],                    // default: everything it declares is its own
  "exports": { "party": "party", "region": "fells", "saltgrave": "market" },          // as today
  "preserve": [ "saltgrave", "tomb" ],                // places generation may not alter or decorate
  "mayVary": [ "the road in" ],                       // what the compositor may choose
  "worldMay": [ "margravine.relations" ]              // what other actors may change after installation (doc C)
}
```

**Each field is something that exists today in some dialect:**
- `attach.into` is a kit slot (`SlotSpec`: `is`, `requires`, `prefers`).
- `face.hooks` is a scenario hook.
- `exports` is unchanged.
- `compat`, `needs`, `preserve`, `mayVary` and `worldMay` are **new**: the contract half of composition.

---

## 6. The questions of §2 of the brief, answered

- **Eager or lazy loading?** Manifests eagerly; modules lazily (§3.3). Parsing is the expensive part: the builder measured 381 kB of generated Kyr at about 1 s (`performance.md`). Parse-ahead (`ModuleBundle.prepare`) already exists and can serve any contribution within the horizon.
- **A stable location and entry:** the plan places it once, from the seed and the registry hash, and the placement is a ledger fact. Today `Frontier.fits` re-derives an authored country's place from the world on every crossing, and the stone's text from another function (Phase I E2). The plan makes it one fact read by both.
- **Reachable without distorting geography:**
  - An adventure attaches by a **join** (a road, a ward slot, a door), not by being drawn into the generated land.
  - Its internal geography stays its own. Thrume's `fells` region is a region on the world grid, and its "Between" is a region **off** the grid.
  - **[R]** Regions an adventure declares as `elsewhere` (dream, plane, the Margin) are not placed on the grid. They are reached only by the adventure's own passages.
- **Authored starting conditions become world conditions when encountered later.** An adventure declares an **Arrival**: what is true when the company first enters, replacing what its company declaration asserted. The Long Man's `placed.kyr` is exactly this, done by hand. Generalise it:
  - `Arrival { Grant quantity(party, rations) at least 2. Require level(party) >= 2 or warn. }`
  - **The HTG case shows the limit:** some premises cannot be granted (who the protagonist *is*). Those set `compat.premise` and are not placed.
- **Two campaigns with incompatible assumptions:**
  - The plan checks `compat` and `needs` (a refusal, traced, as kits are).
  - A conflict over a slot is a ledger contradiction, already refused (`Ledger`: "a later placement builds on it or is refused").
  - **[R]** Refusals are visible to authors (the kit `trace`). They are never silent at play time.
- **Campaigns becoming unavailable, transforming, or resolved elsewhere:**
  - **[Rec]** Only through the adventure's own exported controls (`worldMay`), plus a world-level policy (doc C §3).
  - An uninstalled adventure's clocks do not run, so it cannot "end" unseen unless its author exports a lever for that.
- **Installation order, identity, determinism, saves and replay:**
  - Identity is the plan id (`thrume`), not order.
  - Determinism needs:
    - the plan to be a pure function of the seed, the registry hash and the origin;
    - installation inside a command (true today).
  - Saves record the plan hash. A save made under another registry is refused, or migrated by replaying its transcript onto the new plan. The transcript then holds the causal record, which Phase I confirmed it now does.
  - **[R]** Adding a contribution to the registry changes the plan for new games only.
- **Installed but undiscoverable content:**
  - **[R]** Every placed contribution has at least one **hook** reachable from the start by ordinary play.
  - Lint checks it: the world audit (`src/world/world-audit.ts`) already reasons about what no story can wait on, and can be extended to "no hook reaches this".
  - **[R]** The journey test tier (Phase I §6.1) plays from Begin to each placed contribution's entry, for a sample of seeds.

---

## 7. Design exercise: one character, three adventures, one game

**Setting.**
- The registry holds Thrume, Let One Remember, The Long Man and The House That Grows.
- HTG declares `compat.era: 3640` and `premise: stare-student`. The plan **does not place it** in a 1312 world. To play HTG as part of one game, its author writes an arrival variant (option 2 of §2), and with it the entry "the Strewnfield, beyond the Keel road".
- For the exercise I assume that variant exists. Its `Arrival` makes the company Kezu's guests, and an apprenticeship scene (authored by the HTG author) grants `stareTrained`.
- The fourth adventure stands for "another independent campaign".

**Start.** A new character with the `order` origin begins in the metropolis (doc B). The origin binds `{home}` and `{work}` (`data/origins/order/origin.json`).

**Discovery, by ordinary means:**
1. **Thrume.**
   - The plan placed its `fells` region two regions north, on a mountain march.
   - Its hook `giants_down` is carried on the `road` and `tavern` channels of every settlement within two regions. The carriers are `RegionWriter.carriers`.
   - The innkeeper in the city's carters' ward says giants have come down off the mountain and the Margravine of Ebb is paying. The topic teaches the hook fact, which is `opens`, so the road north is now **known**: `revealedBy`, as hidden ways already are.
   - The chart shows the north road to the march as a known route (doc B §3). The company takes a carter's wagon to the last town (a transport service), then walks.
   - At the march the plan's fact names Merscfaenn's neighbour: the fells (one truth, fixing Phase I E2).
   - Crossing installs Thrume inside the command. `ClockShift` moves its 1296-watch deadline to start now.
2. **Let One Remember.**
   - Its world includes "the Margin", a plane, so its manifest marks the Margin `elsewhere`. Its entry `eighth_bend` attaches by `river`.
   - The plan places the river bend on the great river below the city. Its hook is carried on the `market` channel ("a boat that came down empty").
   - The company buys passage on a riverboat (doc B §4). The voyage passes the bend, and the boat's route lists it as a landing.
   - Installation happens when the boat's leg *reaches* the landing, within the command that advances the journey.
3. **The House That Grows** (the variant).
   - Its entry attaches by an **institution's door**: the academy precinct's observatory keeps a correspondence with "the watch-keepers of the Strewnfield".
   - Its hook is carried by an institution, not by a tavern. A professor (doc B §2, the academy module) asks the company to carry a lens to Cobble Ring.
   - The road is known because the professor *tells* it: `toldBy`, and the way is revealed.
   - A recruited companion who studied at the academy also knows the way (doc B §5, route knowledge per member, which needs Phase I D1).

**What made each accessible:**
- **Geographically:** a plan placement plus a join (road, river landing, institution door).
- **Narratively:** a hook carried by a channel the player meets in ordinary play.
- **Mechanically:** an Arrival that sets what the premise needs, and installation inside a command at the horizon.

**What is new:**
- the registry and its manifest;
- `compat`, `needs` and `Arrival`;
- `elsewhere` regions;
- institution-carried hooks;
- the river and wagon services.

**What exists:**
- hooks, carriers and `opens`;
- `revealedBy`;
- installation inside `perform` with undo;
- `ClockShift`;
- the placed-company pattern;
- the ledger and trace.

---

## 8. Feasibility summary for this document

| capability | supported now? | central invariants changed? | smallest proof |
|---|---|---|---|
| several authored adventures installed in one generated world | **yes** for Thrume and Let One Remember (probe); no for HTG (premise) | none | `phase-2/probes/all-in-one-world.probe.ts` (done) |
| one contribution manifest | no; three dialects exist | none: a reader that lowers to `BundleRequest`, kit slots and hooks | lower `fever.scenario.json`, `bounty/kit.json` and `countries.json`'s Long Man to the new form; same plan |
| world plan as ledger | yes, for kits | the ledger gains `placed(contribution, place)` and `heard(hook, carrier)` | plan four contributions for 20 seeds; refusals traced; no march-stone disagreement |
| lazy installation at horizon | yes, for regions | generalise `Frontier` to an instantiator | install Thrume at its horizon within a command; replay in a fresh process; hashes equal |
| compat, needs, Arrival | no (Long Man's `placed.kyr` by hand) | `admit` must allow an Arrival to assert a premise on the imported company | HTG variant installs with `stareTrained` granted by its Arrival |
| plan hash in saves | no | save format | a save under a changed registry is refused with a clear message |

**Determinism and performance:**
- The plan is computed once and is pure.
- Installation costs were measured at 0.3–0.6 s for an adventure.
- The A1 class of failure must be fixed first, because lazy installation runs the check mid-play by design.
