# 11. Technical report: what the architecture permitted, and exactly where it did not

*Findings from building the Dorothea, the Slack and the Exchange on `adventure/imbar-deep-time`. Each is marked
**tested**, **read** (from source, not exercised) or **blocked**. Shared runtime changes are listed in §11.9; there is
one, of three lines.*

## 11.1 Kyr

| Finding | Status | Detail |
|---|---|---|
| A rule cannot assert discovery knowledge | tested | `Assert established(fact-entity)` is refused: *"cannot change canonical projections, clocks, records or discovery knowledge"*. Cross-module signals must use places, custody or a canonical relation. |
| A company's members are addressable by **calling** in plain Kyr | tested | `memberOf(?m, party) and hasCalling(?m, calling_cleric) … says "{?m} …"` prints the member's own name and fires for any party with that calling. Rule/Observe must be `at <place>`; `near <place>` is for people. Used in `the-long-man/voices.kyr`, `the-dorothea/voices.kyr`. |
| An optional import must not be declared under `roles` | tested | listing it there made it required (*"Unbound required role"*). |
| An item `at nowhere` needs a place called `nowhere` in the module | tested | Hollins declares one. Every module that wants to give a thing by a topic must declare its own. |
| Local `Kind`/`Species` names are **global** in a world | tested | two modules declaring `conger_kind` (Sennet, Tessary) or `brock_kind` (The Hive, The Lull) differently made a world unplayable the moment a company visited both. Fixed by renaming. `test/all-in-one-world.test.ts` now installs every province in one world. |
| Person names are a global namespace (lint) | tested | `bin/kyrie lint` refuses a second Pellow, Treloar, Voss, Pip, Wick, Marl, Tarrant. Fine; a cost of a shared world. |
| An action's `Time` cannot be a measure | **blocked** | I did not find a way to make a climb take as many watches as the company had spent below. The Slack's "interest" is announced and not charged. Smallest capability: `Time <expression>` on actions (the waits already take `untilLight(clock)`). |

## 11.2 Deem and module-local generation

| Finding | Status | Detail |
|---|---|---|
| A town-level module can bring its own Deem tables and templates | tested | `generation: {type, templates, tables}` in `module.json`: ancestry by terrain, names with `apart()`, dice, measures as `initial` facts (`run`, `stock`, `muscle`). Different seeds make different houses. |
| An **adventure** module's own generation | read | accepted by the same field, never exercised: nothing here required it. |
| Kits | **blocked** from adventures | a kit is requested only in a campaign or framework manifest. An adventure's `placed.json`/`countries.json` entry has no `kits:` key. Smallest capability: that key. |
| Sea-event tables | not done | would be a `generation` table of events a voyage draws from (fog, a squall, a hail), which is possible and which the Dorothea would profit from. |
| Spells and effects | blocked | Kyr cannot define one; the Slack is states and rules. |
| Languages | blocked | Aenean is Latin in a pinned package; the charters are prose. |

## 11.3 Vessel travel and mobile locations

See `07-voyage.md`. In short: **no vessel, no mobile location, no interruptible passage.** All three are expressible
without engine change as *a thing that is at a station, rooms that are joined to the stations by gangways that
open when it is there, and a counter that a trouble stops*. This is used twice (the ketch, the Remainder).
Not built: a `sea` passage kind, the chart's drawing of a voyage, the world map's idea of an island.

Known gap I did not close: **a company aboard a ship that reaches its destination while the company is ashore is
left behind correctly, but the ship's return is not seen by the company's map.** The module-local map shows rooms;
there is no "vessel in transit" marker.

## 11.4 Strategic action

The Exchange (§10) reacts by rules with conditions drawn from what it knows and has. It does not plan.
`Pursuit … seeks` exists and works for a person within an installed module (`Caught Below`); it cannot be used
for an agent whose destination is not yet installed. **Smallest general capability:** an agent route to a named,
not-yet-installed region (`byway`, as `dominion.kyr` has between known places), so that a carter can be *somewhere on
the road to Corran* whichever country is installed later. Not built. A second: a way to declare, once, what a person
perceives (`Notices when …`), so responses read `perceived(person, act)` and not a per-act trace.

## 11.5 Interplanar geography

- **There is no Plane of Time in canon** (nothing in `data/imbar`; the Keeping in *The Patient Star* is a
  module-local plane). I added **none**. The Slack is a module-local plane in Sennet.
- **A module can reach a canonical plane's threshold** by naming it in `canon` and passaging to it. The Remainder
  does: `outer_mechanus_threshold`. The canonical Observe is shown; the plane's law applies.
- **World events (`befell`) existed in canon and no adventure asserted any** at the start of this pass. They are now
  asserted four times (`slack_opened`, `remainder_harboured`, `remainder_kept`, `mechanus_seen`). No module reads
  them. The Grand Tour still keeps its own `doorOpen`, and never writes the canonical `door_of_doors_opened`; a
  one-line addition would fix that and I left it.
- **Elapsed time and planar identity**: the engine keeps one clock. A ship that "keeps its own hours" in the Slack
  keeps them in prose. See §11.1 (`Time`).

## 11.6 The companion contract (what the brief asked to be documented)

Preset party members have no declared `Person`; `Remarks`, `Joins`, `Greets` are fields of a `Person`, so they cannot
attach. **What works today:** calling-keyed rules (§11.1). It covers a cleric, ranger, warrior, thief, mage, bard,
monk, commoner; it does not see **race or background** (not projected into the world by `CreatureFacts`), and cannot
address a member **by name** except by printing it. Two repairs, in order of size:

1. **Project `raceId` and `backgroundId`** as `hasKind(ref, …)` / `hasBackground(ref, …)` in
   `src/campaign/creature-facts.ts` so ordinary rules can say "the elf", "the medic".
2. **A construct**: `Companion <calling> at <place> "…"` compiled to the same rule `Remarks` compiles to (`person-parser.ts`),
   with `memberOf(?m, party) and hasCalling(?m, calling_x)` in place of `travelsWith(<id>, ?c)`.

I did neither: (1) is a change to the shared fact projection, and (2) to the parser, and both belong to the
foundational work on `main`. Compatibility requirement for that work: **do not remove `memberOf` / `hasCalling` /
`{?m}` printing**; three adventures now rely on them.

## 11.7 Persistence

| What | Status |
|---|---|
| Save in fog / the Combs / on the island; resume; identical `canonical()` | tested (`the-dorothea`, 3 saves) |
| Resume in a generated world mid-passage; go on to arrive | tested |
| A save after the Exchange retaliates; the inn still refuses service | tested |
| A save across the Slack (stair, quay, deck) | **not exercised** |
| The browser's keep (`CheckpointStore`) | **not exercised** (the same `checkpoint()` is used) |

## 11.8 Where the clash between "independent adventures" and "one world" showed

(a) global kind names (§11.1); (b) global person names; (c) `befell` events only read when someone writes the
reader; (d) one clock; (e) the herald is the **only** channel by which two provinces share an entity, and it is
set up in `countries.json`, so a new meeting-place for two adventures is a new scenario and two data entries.

## 11.9 Shared runtime changes, for the merge

- `src/world/world-assembler.ts`: heralds are placed once per distinct scenario, not once per country (3 lines).
- `data/catalog/items.json`: five new item kinds (`pharos_rubbing`, `prefects_writ`, `tally_rubbing`,
  `collegium_letter`, `surety_terms`). Pure data.
- `data/imbar/events.kyr`, `data/imbar/module.json`: four world events (`slack_opened`, `remainder_harboured`,
  `remainder_kept`, `mechanus_seen`).
- Species renamed in `what-tessary-owes/ways.kyr` and `the-lull/*.kyr`.
**Adding a province re-seeds every drawn world** (any side): a branch that adds one must rebuild the page bundle (`bun run web:build`), re-record `wren-tower-climbed` (`bun scripts/redigest-trace.ts`), and may need to move seeded tests (`wild-meetings`, `exploration` here).
No engine type, no generator and no UI was changed. If `main` changes `herald`, `canon` or `Kind`, the three above
need the same change.
