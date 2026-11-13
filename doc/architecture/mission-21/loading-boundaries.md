# Loading and execution boundaries: what each scale costs, and what it drags in

The owner, 14 November: how much of Kyrie can be exercised without loading Westernesse, and how much of Westernesse
without composing a campaign? The costs of parsing, imports, Deem, world construction and sessions should be
explicit, measurable, and paid only where an operation needs them. This page is the measured answer for Mission 21.
Its numbers can be taken again: `bun scripts/load-costs.ts [scale…]` gives every scale cold, warm and again in one
process. `Costs` (`src/costs.ts`) is the tally each boundary keeps as it is crossed.

Measured on the lead's machine (WSL2, bun 1.4.3) at `m21`, 14 November, nothing else heavy running.

## 1. The measured map

Each scale runs in a fresh process three ways:
- **cold:** nothing kept on disk;
- **warm:** the disk's parse store full, as on CI after its cache step and locally after one run;
- **again:** the same start twice in one process, which is what a spec's second case pays.

The import column is the time to load the code it needs.

| scale | import | cold | warm | again | what the run crosses (warm) |
|---|---|---|---|---|---|
| a rule on facts: one module parsed, compiled, its actions grounded and tested | 0.30 s | 9 ms | 8 ms | 1 ms | 1 parse |
| the shared rules (`data/rules`, 18 files, 116 KB) parsed | 0.29 s | 278 ms | — | 4 ms | 18 parses |
| a tiny Kyr world (`Tiny.start`): one module on the shared rules, started, first page | 0.37 s | 592 ms | 215 ms | 98 ms | 29 texts kept (163 KB); 2 installs (the canon and its module); 1 creature by Deem |
| one authored adventure (Low Water) alone, started, first page | 0.39 s | 2.1 s | 0.69 s | 91 ms | 53 texts kept (601 KB); 2 installs; 57 creatures |
| Deem drawing one country, nothing written | 0.37 s | 165 ms | 147 ms | 38 ms | 1 region |
| **full Westernesse** (a1 drawn, composed, started, first page) | 0.37 s | **15.1 s** | **6.5 s** | 6.2 s | 187 texts kept (4.9 MB); **39 installs, 2.5 s**; 627 creatures (0.2 s); world composition 0.54 s; screen 0.38 s |

What this establishes:
- **Parsing dominates only cold.** In a full start it is 8.6 s of 15.1 s cold, and 0 warm: every text is kept.
- **Warm, the full world's cost is installation and construction, not parsing.** A CPU profile of one warm start
  (7.8 s sampled) shows:
  - **`structuredClone`: 1.5 s of self time, a fifth of the start.** It is defensive copying of parsed and compiled
    modules: compile 353 ms, module load 204 ms, namespacing 290 ms, the parse caches' returns 280 ms, composition
    139 ms, the campaign's fork 70 ms.
  - **Compiling and checking 39 modules: about 0.75 s** (`ModuleCompiler.validate`/`check`).
  - **Projecting creatures' facts: 0.65 s** (`CreatureFacts.project`).
  - **The geography's distance tables: 0.57 s** (`compose/geography.ts`).
  - **Deem's templates: 0.35 s.**
  - **The first screen: 0.5 s.**
  - **ohm building its grammars at import: 0.2 s.**
- **A tiny world is not a world of one module.** It parses and installs the canon (Imbar, nine outer and six inner
  planes, the House of Doors) and every shared rule module, and generates its member by Deem. That is about 0.1 s in
  process and 0.2–0.6 s a process, which is small enough not to hurt yet. But it means no scale between "facts alone"
  and "the whole canon and rules" exists.
- **A second case in the same process is cheap at every scale but the full world.** A situation alone pays 0.4 s; a
  full world pays 6.2 s again, because a drawn world's start is not shared within a file unless the spec uses
  `Kept`/`Keep.at`.

## 2. What drags in what

Import graphs, by `bun build --metafile` (inputs, and the bytes of `data/` the code imports at load):

| entry | inputs | data at import |
|---|---|---|
| `src/lang/world.ts` | 8 | none |
| `src/lang/module-parser.ts` | 146 | **1.06 MB**: the whole catalog |
| `src/campaign/campaign.ts` | 288 | 1.35 MB: the catalog, paintings 177 KB, Deem tables 109 KB |
| `src/session/play-session.ts` | 517 → **375** (repaired, below) | 2.35 MB → **1.42 MB** |
| `src/ui/screen-model.ts` | 505 | 2.41 MB |

The edges that do it:
- **Parsing any Kyr loads the whole catalog.** `module-parser` → `catalog-parser` → `canon/local-catalog` →
  `canon/canon.ts`, which imports 32 catalog JSON files as process-wide statics. So does compiling.
- **A campaign loads Deem and the paintings at import.** `campaign.ts` → `content.ts` → `generation-setting.ts` (Deem
  tables), and `canon-validation.ts` (nine paintings files) runs in `Content.validate`.
- **A session loaded world generation for two ids.** `session/travel` → `ui/itinerary` → `world/region-writer` and
  `world/provinces`, for `RegionWriter.id` and `Provinces.room`. That was 144 files and 0.93 MB of tables.
  **Repaired here**: the ids are in `src/world/region-ids.ts`, and `journey.ts` uses them too. Twenty `src/world`
  files remain in a session's graph, through `narrative/journeys`, `ui/chart-model` and `ui/headings`.
- **The presentation imports Deem and the setting.** `ScreenModel` imports `Content` (Deem), `Canon`, the paintings
  and the Encyclopedia's entries.

Which stages are independently usable today:

| stage | usable alone? | what it drags in |
|---|---|---|
| parsing one Kyr file | yes (`ModuleParser.parse`) | the whole catalog at import (0.3 s) |
| compiling, a `World`, grounding actions, applying effects | yes: `ModuleCompiler`, `World`, `ActionSchemas`, as `test/grounding` does | the same |
| the watch (rules and events firing, people acting) | **no**: only a `Campaign` runs it | a campaign: the canon, the shared rules, Deem for the company |
| the shared rules without the canon | no: `SingleModule` takes `rules`, but every campaign installs the canon first | — |
| one situation without a country | **yes, now**: `test/support/alone.ts` (below) | the canon, the shared rules, its own Deem tables |
| Deem drawing one country | yes (`WorldAssembler.region`) | Deem, its tables |
| the screen and the glance | yes, given a campaign | Deem, the catalog and the paintings at import |
| rendering (terminal) | yes, given a screen and a leaf | nothing more |

## 3. The demonstration: a situation alone

`test/silent-lord-malice` was the suite's dearest file: 1,156 s on CI for ten cases. Each drew a1's country, waited
in it, and set the company down in the keep. Yet its cases are about the silent-lord situation's own rules
(`data/situations/silent-lord/malice.kyr`, `feast.kyr`, `town.kyr`):
- the quiet watch;
- the swordsman taken for the king's champion;
- the bitter cup;
- what a cleric or a warrior reads;
- the keep falling on the feast day if nobody enters.

`test/support/alone.ts` installs one situation module as the world installs it. It runs on the shared rules, with
its imports bound to a host of a dozen lines of Kyr (the land, the keep's outside, a green, a taproom, a shrine, an
innkeeper, a priest, a merchant, a far green) instead of a generated country. Its ids are the ones Westernesse gives
it (`keep__ansel`), so a case reads exactly as it did.

`test/silent-lord-alone` has eight of the ten cases:
- **Cost:** they run in 43 s locally, and each start costs 0.42 s: 3 installs, 43 creatures, no country drawn, no
  world composed. Each case asserts that cost, so a regression that drags the country in fails.
- **The same semantics:** they exercise the same Kyr the generated world installs.
- **Mutation-checked:** making the keep's default reckoning hushed instead of usurped fails the case of the keep that
  falls without the company.
- **What stays in the generated-world spec:** the two cases whose subject is the generated site itself, the wicket of
  its gate and the rider's tracks at its foot.

The rest of each case's time is the clock, not the loading: a case that waits ten days to the keep's feast pays for
ten days of watches (about 5 s). `Kept` shares that wait across a file's cases for drawn worlds; `Alone` could do the
same.

Also landed, for observability:
- `Tiny` records what its start crossed (`t.costs`).
- `test/small/tiny-costs` holds that a tiny world draws no country, composes no world, installs only its module and
  the canon, generates one creature, and reads under 200 KB of Kyr.

## 4. Proposal, by priority

**In Mission 21: small, measured, high leverage.**
1. **More situations alone.** The audit's dearest generated-world files are mostly one situation's or adventure's
   rules: silent-lord-turns and -ways, arcology-rivals, the-slack, ring-hierarchy and -responds, ties-forms,
   exchange-responds. Port their local cases to `Alone`, with a host per situation in `test/support`. Each port is
   about an hour and saves minutes of CI.
2. **Share a waited start in `Alone`,** as `Kept` does for drawn worlds: the clock, not the loading, is what remains.
3. **Canon validation off the load path** (`Content.validate`, 111 KB of paintings): into `bin/kyrie lint` and a spec.
   About 15 lines.
4. **The Encyclopedia's link for a module's own kind.** It now walks the variant chain to the catalogued kind
   (`EncyclopediaEntry`; `test/small/encyclopedia-local-kind`). Done here.
5. **A rule-level harness** for the stage that exists but is used ad hoc: parse, compile, ground, apply, with no
   campaign. It cannot run the watch; say so in its name.

**After Mission 21: redesigns worth weighing.**
1. **Immutable parsed and compiled modules** in place of `structuredClone` at every handoff: 1.5 s of a 6.5 s warm
   start, and something of every spec's start.
2. **Compiled modules kept** by their text, their imports and the rules they are read with, as parses are now: 2.5 s
   of installation warm.
3. **The catalog as a value a world holds**, not process-wide statics that `LocalKinds` mutates. Parsing would no longer
   load the setting, and a world's kinds would be its own.
4. **A smaller rules environment:** the canon optional for a world that needs no planes, and the shared rules split
   into a prelude and Westernesse's own (below).
5. **Lazy materialization and order independence** (SP-02): see
   [order-independent-generation.md](order-independent-generation.md). Its inferred finding, that every generated
   country's module is seeded alike, so `s2_priest` may be rolled alike in every country, wants checking first; it is
   given to the performance investigation ([perf-investigation-brief.md](perf-investigation-brief.md)).

## 5. The platform and the setting: an inventory

From a read of `src/` and `web/`, counting lines with quoted setting literals:

| category | lines |
|---|---|
| ancestries | 25 |
| callings | 47 |
| place kinds | 107 (75 in the generators, where they belong) |
| action ids | 189 (136 in the presentation) |
| damage types | 28 |
| tongues | 18 |
| "Imbar" | 38 |

The consequential ones:
- **The catalog is global state, imported by the parser** (above).
- **The calendar's months, seasons and week are TypeScript** (`src/campaign/calendar.ts`); they belong to Imbar
  (`data/imbar`).
- **`data/rules/core.kyr`, "the rules every world loads", declares Westernesse's callings, ancestries, crafts and
  manners.** It lists 5 of the catalog's 15 ancestries. The pantheon (`devotion.kyr`) and the recipes (`making.kyr`)
  are setting too. The rest (ambitions, belief, discovery, probing, dominion, people, needs, growing, passages,
  inhabitants, belongings, care, canon) is prelude-shaped and names nothing of Westernesse.
- **The presentation decides by action id:** `affordances.ts`, `promotion.ts`, and 97 rules in `choice-grouping.ts`
  key on `camp`, `rest`, `search` and `wait`, which Kyr declares. A category or tag on a Kyr action would replace them.
- **Defaults in kernel code:** `human`, `warrior` and `commoner` (`content.ts`, `person-parser.ts`, `cast.ts`,
  `single-module.ts`); the default damage `necrotic` (`effects.ts`, `tactics.ts`); `Team = 'fighters' | 'goblins'`
  (`model.ts`).
- **Creation hardcodes the setting:** a cleric means a domain, a mage a school (`specialty-step.tsx`); the plurals of
  elf and dwarf (`people-step.tsx`). The page still keeps its own steps rather than `CreationFlow`'s; that move is the
  aesthetic line's look-3.
- **Tongues:** ancestry to tongue is a TS map (`world/place-names.ts`), and who speaks each is hand-written
  (`handbook/publish.ts`).
- **The Encyclopedia's chapters and their ledes** are TypeScript (`handbook/encyclopedia.ts`), and the map's place
  glyph is chosen by a regex on a place's name (`web/reader/hex-land.ts`).

**The Encyclopedia as the diagnostic.** One module's own kind, traced: `Species manticore_kind "a manticore" like
chimera` in the Parliament of Books.
- **Play: no TypeScript special case is needed.** The grammar takes it, `LocalKinds` makes it a variant of the
  chimera in `Canon.species`, and it fights with the chimera's body and shows the chimera's portrait.
- **Where it stops:**
  - **Deem never draws it.** `Canon.catalogued` leaves installed kinds out, and Deem's tables are static JSON merged
    at load, so a module cannot add a table.
  - **The Encyclopedia cannot have its entry.** The book is written with no module installed, from `Canon.catalogued`.
    Until today its link from play named an entry that did not exist.
  - **The language is narrow.** A module's kind may be `like` a catalogued kind only, not like another of its own; it
    takes a temperament, a description and habitats, but no statistics or abilities of its own. There is no local
    ancestry, calling or institution: a new ancestry needs `ancestries.json`, `core.kyr`, `PlaceNames.tongues`, a plural
    in the creation page, and names in `folk.json`.

So the boundary is clean for play and closed for reflection. The platform has no generic way to discover what a
universe declares (its kinds, their relations, their documentation) and project it. The Encyclopedia is written from
the catalogs and TypeScript beside them instead. Making it read the active universe's own declarations is the
design question after Mission 21. It needs no new DSL first: a reflection over `Module.catalog` and the entities a
universe declares, with authored exposition attached by id.

## 6. The working set: a room held constant while the world grows

The owner's invariant: an operation pays for its relevant working set, not for the whole possible universe.

`bun scripts/scale-costs.ts [sizes]` holds one cellar of five things constant, with "Tap the barrel" as its local
act. Around it go N rooms, each with two things and a way to the next, none of them near the cellar. Each size runs
in a fresh process, on the production compiler, runtime and projections (SingleModule, PlaySession, ScreenModel,
Narrator, PlayerView). All times are in ms.

**Before:**

| rooms | facts | start | observe | act | observe again | save | restore | heap MB |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 312 | 169 | 70 | 13 | 17 | 6 | 14 | 22 |
| 100 | 1,308 | 263 | 72 | 12 | 24 | 8 | 25 | 50 |
| 1,000 | 10,308 | 2,023 | 142 | 16 | 72 | 39 | 55 | 48 |
| 4,000 | 40,308 | **35,612** | 491 | 35 | **369** | 283 | 407 | **914** |

Starting grew with the square of the world, and looking again in the unchanged cellar grew with the world. Profiles
of the 2,000- and 4,000-room worlds found three causes:

1. **Exclusive asserts** (`World.change`) went through every fact of their relation to find the one displaced: 3.9 s
   of self time at 2,000 rooms. Now `Displaced` (src/lang/displaced.ts) indexes an exclusive relation by every
   argument but the last, once per `apply`, and keeps the index as the list writes it.
2. **Ohm's `children`** is rebuilt on every access. `ModuleParser.Module` read `declarations.children[i]` once per
   declaration, which is N² for a module of N declarations; it now holds the array once.
3. **The binder's join order** (`Operators.score`). `look_closely` joined `suits(target, looking)` first, a relation
   known only by its constant, and so proposed every thing in the world. It then tested whether the company reached
   each one: 220 ms a look at 4,000 rooms, yielding nothing. An atom joined through an already-bound parameter (the
   actor's `reaches`, `at`) is now preferred. The result is unchanged, since every candidate is still tested against
   the whole precondition, and only the candidates shrink.

**After:**

| rooms | facts | start | observe | act | observe again | save | restore | heap MB |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 312 | 167 | 91 | 15 | 23 | 6 | 29 | 26 |
| 100 | 1,308 | 211 | 83 | 21 | 24 | 8 | 21 | 27 |
| 1,000 | 10,308 | 423 | 129 | 15 | 35 | 45 | 68 | 57 |
| 4,000 | 40,308 | **1,030** | 237 | 21 | **75** | 168 | 247 | **146** |

At 4,000 rooms, starting is 35× cheaper and grows linearly, and looking again is about 5× cheaper.

`test/small/working-set` holds this as ratios between 100 and 3,200 rooms (25× the facts), which a loaded lane
scales alike:
- starting stays under three times the facts ratio (about ×8 now; about ×126 with the index undone);
- looking again stays under ×5 (×3.2 now; ×7.4 with the old join order);
- acting stays under ×5 (×2).

Both mutations were checked.

**Still growing with the world, in order of size:**
- **Save and restore:** a save is the whole world, and that is expected.
- **The first observation** builds the module's `Operators` (46 ms at 4,000 rooms).
- **Looking again still grows about ×3** for ×25 facts, in a long tail of per-entity scans with none dominant:
  - `Withheld.rows`;
  - the skill reading's `near`;
  - the screen's `names` and the player view's `unnamed`;
  - `Glance.inward`;
  - `raise_quality`'s grounding (6 ms).

Each of these reads the module's entities rather than the place's. They are next, measured by the same harness.
