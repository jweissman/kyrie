# How Kyrie is built: the map

Written for a builder or an agent new to the code who needs to know where things are, how a command becomes what
the player sees, and where a change belongs. It is reference: when the code it describes changes, change it in the
same commit. For what the project promises to keep true, read [CONTRACT.md](../CONTRACT.md); for which check proves
what, read [verification.md](verification.md); for what is open, read [the register](open-register.md).

## The four layers

| Layer | Owns | Does not own |
|---|---|---|
| **Deem** (the `deem` package, pinned in `package.json`; tables in `data/generation`) | choosing: seeded, weighted, compatible selection of definitions | anything after generation |
| **Kyr** (`data/**/*.kyr`, the catalogs' typed effects) | meaning: what exists, what can be done, what changes, what is said | execution order, persistence, presentation |
| **Kyrie** (`src/lang`, `src/campaign`, `src/rules`, `src/battle.ts`) | truth: the one world state, time, encounters, bodies, history | wording, layout, which choices to lead with |
| **Presentation** (`src/presentation`, `src/ui`, `web/reader`, `src/cli`) | what the player can see, choose and remember | any rule: it offers only legal commands and never changes state |

## From a command to the page

1. **A command** is chosen by its id (a page's act, a terminal's number, a spec's label through `Journey`).
   `PlaySession` (`src/session/play-session.ts`) performs it on the `Campaign` (`src/campaign`). In the browser this
   happens in a worker (`web/engine/engine-worker.ts`, `engine-host.ts`), behind the message protocol in
   `web/engine/protocol.ts`.
2. **The world changes.** `World` (`src/lang/world.ts`) is immutable: every change is a new world from `apply`. The
   campaign runs each watch: people act on their plans, rules and events fire in authored order, and fights resolve
   in `src/battle.ts` with the rules in `src/rules`.
3. **What the player may know** is projected from the omniscient campaign: `PlayerView` (`src/presentation/
   player-view.ts`) gives the legal choices, and `ScreenModel.build` (`src/ui/screen-model.ts`) gives a pure,
   renderer-independent screen.
4. **What is told and led with.** `Narrator.leaf` (`src/presentation/narrator.ts`) tells what came of the command.
   The glance (`src/presentation/glance.ts`, types in `glance-types.ts`) gives the place in at most three sentences:
   - the few acts led with, ranked by `Promotion` (`src/ui/promotion.ts`);
   - the lenses (things, people, places, time);
   - the followed aim's next step, which is the only gold;
   - likenesses, what is sensed along each way, the compass inside an enclosed place, and what pulls next.
5. **Drawn by a client**, from the same projection:
   - **The page** (`web/reader`) draws it on the stage (`web/reader/stage`). `MenuModel` (`web/reader/menu-model.ts`)
     builds its choices from `ChoiceList` (`src/ui/choice-list.ts`).
   - **The terminal** (`src/cli/terminal*.ts`) draws it as lines.
   - Both take their presentation decisions from one place:
     - colour by aspect from `Emphasis` (`src/presentation/emphasis.ts`), the design atlas: gold the followed aim,
       silver worth exploring, green gain, blue knowledge, red danger, violet the uncanny, rose a companion;
     - signs (way arrows, marks, the hold, sensed and idle) and each emblem's character from `Signs`
       (`src/presentation/signs.ts`);
     - how an aim is said from `AimSaid`;
     - character creation from `CreationFlow` (`web/engine/creation-flow.ts`).

     `test/small/signs-shared` and `terminal-colour` hold the two clients to them.

## The source tree

| Where | What lives there |
|---|---|
| `src/lang` | Kyr itself: the grammar (`Kyr.ohm`), parser, module compiler, the `World` and its solver, the parse cache |
| `src/campaign` | a running campaign: installing modules (the canon first, see `canon-install.ts`), grounding actions, watches, encounters, time, environment and planes' laws |
| `src/rules`, `src/battle.ts`, `src/tactics.ts`, `src/*.ts` | the fight and its rules: amounts and dice, defences, conditions, morale, positions, reactions, summoning |
| `src/canon` | the catalogs' schema and runtime (one catalog per family in `data/catalog`) |
| `src/world` | generating a country: `WorldAssembler`, `DrawnWorld`, the region writer, land, names (`PlaceNames`, `CommonNames`, `OldPlaces`), towns, foundings, placements |
| `src/session` | `PlaySession`, `Journey` (play by the labels a player sees), digests, checkpoints, travel |
| `src/presentation` | what the player is told and shown: narrator, glance, aims, perception, `Emphasis`, `Signs` |
| `src/ui` | renderer-independent models: screen, choices, promotion, lenses, maps and routes, combat |
| `src/narrative` | voice tables and how a fight is told |
| `src/paintings` | which painting shows whom or what |
| `src/registry`, `src/handbook` | the Orsino registry and its adaptation; the generated PHB, DMG and MM, and the Encyclopedia |
| `src/autoplay` | the laboratory: invariants every step keeps, failures shrunk |
| `src/cli` | `bin/kyrie` (`kyrie.ts`): the terminal client and every authoring and checking tool |
| `web/engine`, `web/reader` | the browser: the engine in a worker; the page and its stage |
| `data/rules` | the rule modules every world loads (passages, needs, people, elements…) |
| `data/imbar` | the canon: Imbar, its planes and their thresholds, the House of Doors, installed first in every world with the same ids |
| `data/catalog`, `data/generation`, `data/adventures`, `data/campaigns` | catalogs, Deem tables, authored adventures, campaigns; [data/README.md](../../data/README.md) has the rest |
| `test/small`, `test/support/tiny.ts` | rules proved on tiny Kyr worlds; `test/` holds the rest (see [verification.md](verification.md)) |
| `scripts/` | benchmarks, censuses and reports (`register-state`, `spec-audit`, `doc-links`, `terminal-walks`…) |

## Invariants worth defending

- **One world, many views.** The campaign holds one state; `PlayerView`, people's planning, the clients and the
  specs read it, and none keeps its own copy of a fact.
- **Bodies belong to the creature store.** HP, mana, conditions and possessions live in `CreatureStore`. The world
  sees them only through the facts projected from it, which rules may not write. A fight leases creatures and commits
  them all or none.
- **Rules may not write what the engine keeps:** the clock, the dark, projections, records (`src/lang/engine-owned.ts`).
- **One mechanical meaning.** An ability's typed effects are what the fight executes and what the page explains.
- **Randomness is keyed by identity,** not by order of evaluation. The same seed and choices give the same history,
  and giving someone a rope changes nothing else about them.
- **The canon is one.** Imbar, its planes and thresholds have the same ids in every world. A module extends them
  and may not redeclare one or lay a law on it.
- **A client decides layout and input only.** What is legal, known, led with or coloured is the engine's projection
  (above). A client that needs a sign, a colour or a card takes it from the shared table, never its own copy.
- **Selecting is not committing.** A choice shows what it does, what it takes and what it risks, and happens only
  when chosen.

## Where a change belongs

| You want | Put it in |
|---|---|
| a place, person, obstacle, quarrel or adventure | a Kyr module (`data/adventures`, `data/sites`, `data/situations`); start with `bin/kyrie new` |
| something every world needs | a rule module in `data/rules`, or the canon in `data/imbar` for Imbar and the planes |
| a creature, ability, condition, item or spell | its catalog in `data/catalog`, as typed effects; the text is generated |
| a creature's body, lineage or a generated name | Deem tables in `data/generation` |
| a new kind of resolution (a fight, a purchase, a recovery) | `src/campaign`, called from Kyr with `Resolve` |
| what the player is told or led with | `src/presentation` (narrator, glance, promotion), the same for both clients |
| a colour, a sign, an emblem's character | `Emphasis`, `Signs`, `data/paintings/emblems.json` |
| how it is laid out | `web/reader` (the page) or `src/cli` (the terminal) |

Prefer the higher row. An engine change that one module needs is usually a general construct missing.

## Older notes

The subsystem notes written in October (the ontology, the play model, world semantics, composition, generated
worlds, the living world, the command contract, editorial rules) are in
[history/architecture-2026-10/](../history/architecture-2026-10/). They explain the design's intent well, but they
describe the code as it was: check what they say against the code before you act on it.

Kept here, because they are maintained or generated:
- [verification.md](verification.md) and [performance.md](performance.md): the checks and the measures.
- [pages.md](pages.md): publishing the page.
- [domain-model.md](domain-model.md): the catalogs' families (cited by `src/canon/schema.ts`).
- [orsino-coverage.md](orsino-coverage.md) (generated), [orsino-inventory.md](orsino-inventory.md) (generated),
  [capability-audit.md](capability-audit.md) and [orsino-semantics.md](orsino-semantics.md): what of Orsino and the
  SRD Kyr represents.
- [open-register.md](open-register.md): every open row.
