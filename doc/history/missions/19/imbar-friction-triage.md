# Imbar adventure friction: triage for the Mission 19 register

Inputs: the 24 `doc/imbar/adventures/*-friction.md` files and `doc/imbar/friction.md`, deduped against
`doc/history/missions/19/register.md` (M19-01..174), `inherited.md` and `doc/authoring/forms.md`; checked against
the code in the `/var/tmp/kyrie/wt-merge` worktree (main, 8 November).

**Counts.** About 95 friction entries read. **32 new rows** (23 Open, two of them only in part; 6 Fixed; 3 Not reproduced).
**28 groups covered** by existing rows. About 15 entries not carried: process incidents (stash,
overwritten files, re-indented JSON), design-as-intended notes (a lit source for `capable(light)`, the burners'
interruption, `Retract at(x, ?p)` needing a binding), or "worked, no repair" records.

## New rows

| kind | text | source | priority | status |
|---|---|---|---|---|
| C | A module that reads a canonical world event (`befell(x)`) must name that event in its manifest `canon`; the refusal "Invalid argument x in befell(x)" does not say so, and no authoring doc mentions it | book-of-faces 2; gosses-company (world event row); hessel 1; hollins 2; liberty-of-the-ice 2; parliament-of-books 1; quittance 1; thrume 1 | P2 | **Open**: `src/lang/module-compiler.ts` l.246 gives no canon hint and `doc/authoring/` has no `befell`/canon line; add both |
| R | A standalone module could not read a canonical world event without pulling the canonical world into its campaign | the-lull 1; let-one-remember 4 | P2 | **Fixed** (verified: `CanonInstall` installs data/imbar first in every world, `src/campaign/campaign.ts` l.111-112; `data/adventures/the-lull/module.json` canon `["imbar","remainder_kept"]` and `lore.kyr` l.5 reads `befell(remainder_kept)`) |
| C | Lint warns "action … has no possible target in this world" on every reader of a canonical event no module in the world asserts: permanent noise | gosses-company (lint row); lore-sweep 4; low-water 5; quittance 6 | P3 | **Open**: `src/cli/campaign-lint.ts` l.230-239 warns for every ungrounded schema; exempt or soften when the only gate is a `befell` |
| A | `Give` does not clear an item's owner: after a gift the former owner says "That is mine" as if it were stolen | gosses-company (owned by row); wrayford (owned by row) | P2 | **Open**: `owns` is asserted from `owned by` (`src/lang/world-constructs.ts` l.157) and nothing in Give (`src/campaign/consequences.ts`) retracts it; retract the giver's `owns` on Give |
| C | Company size is fixed by `Company … of N` in the module; a fixture or test needing a larger party needs its own module directory | half-the-hive 3; liberty-of-the-ice 1; the-lull 3; the-quiet-in-the-sky 2; quittance 4; book-of-faces 1; ring R15 | P3 | **Open**: M19-105 gave the lone stories `of 1 to 3`, but a party of five still needs a fixture module; let a campaign's or `PlaySession.start`'s party set the size within a test |
| C | A Topic cannot name or speak through a party member (actions can, by a member parameter), so companion talk is written as actions | half-the-hive 4; the-lull 5; the-quiet-in-the-sky 4 | P3 | **Open**: `Topic` in `src/lang/Kyr.ohm` l.136 has no member parameter |
| C | No per-member background or ancestry fact: "the dwarf sees the stonework", "the messenger", "the locksmith" cannot be keyed; only the calling is | half-the-hive 5; parliament-of-books 5; thrume 9; friction.md 12 | P2 | **Open**: `src/campaign/creature-facts.ts` l.161-166 projects only a company-level `craft(actor, craft_x)` from backgrounds; no `hasBackground`/`hasAncestry` per member |
| C | No way to ask "has the company a cleric?" in a `Requires`; authors wrote a rule asserting `companyHasCleric` | half-the-hive 8; the-quiet-in-the-sky 6 | P3 | **Fixed** (verified: `count(Predicate)` is a Value, `src/lang/Kyr.ohm` l.272, used as `count(memberOf(?m, party)) == 1` in `data/adventures/the-dorothea/lamp.kyr` l.27; the `count(… and hasCalling(…)) == 0` form not run, and not in forms.md) |
| C | `hasCalling` is projected only for members, so a hired companion's (`travelsWith`) calling cannot key a beat | let-one-remember 1; patient-star 1 | P2 | **Open**: `CreatureFacts` writes `memberOf`/`hasCalling` for members only (`creature-facts.ts` l.192, l.255-258); project callings for hirelings too |
| R | Test fixtures list module sources by path, so every new `.kyr` must be added to each fixture's `module.json` | let-one-remember 5; wrayford (fixtures row) | P3 | **Open**: e.g. `test/fixtures/corrow/act2/module.json` lists 12 paths; `BundleManifest` (`src/campaign/module-bundle.ts` l.44-60) has no extends/base |
| R | Journey ids were inconsistent: relations and measures wanted the module prefix, kinds and shared relations did not | book-of-faces 3; low-water 1, 2; quittance 3; what-tessary-owes 3; the-dorothea-archipelago A12; let-one-remember 2 | P3 | **Open** in part: `holds`/`measure` now resolve `region__` and installed prefixes (`src/session/journey.ts` l.256-262), but `at()` (l.291) still takes only the full id; resolve it the same way |
| R | No Journey helper for a fight: `choices()` is empty on the fight screen and authors read `engagement.ts` to drive `session.perform(command, runner)` | house-that-grows (riggers row); parliament-of-books 4; thrume 3 | P2 | **Open**: no fight method in `src/session/journey.ts` |
| R | An `Observe` is told on the screen's prose (arrival, the room), not in the step's page, so tests checking it need a hand-made `seen()` | liberty-of-the-ice 3; winter-in-carth 4 | P3 | **Open**: no `seen` in `src/session/journey.ts`; add `Journey.seen()` |
| R | The page curls quotes, so test patterns containing an apostrophe failed | low-water 3; the-long-man 3; winter-in-carth 5 | P3 | **Fixed** (verified: `Journey.straight` matches straight against curled quotes, `src/session/journey.ts` l.50, l.141) |
| C | An `Observe` or condition holding a catalog kind (`holding(actor, old_glossary)`) was refused at load though the same call in `Requires` loaded | parliament-of-books 2; thrume 6 | P2 | **Not reproduced**: `data/adventures/the-lull/lore.kyr` l.9 loads a Topic `when holding(actor, old_glossary)` on main (catalog kinds bound by `Cast.itemKinds`, `src/campaign/cast.ts` l.129); an `Observe` itself not re-run |
| A | Two `says` rules true in the same turn: only the first printed, the second set its flag silently | wrayford (two says row) | P2 | **Not reproduced** by reading: the tick pushes one happening per heard rule (`src/campaign/campaign-tick.ts` l.200-203); not re-run; the likelier cause is hearing/anchoring (M19-126) |
| A | Two `Give <kind> to actor.` in one effect list gave one item | the-dorothea-archipelago A11 | P3 | **Fixed** (verified: `Give 2 lamp_oil to actor` in `src/lang/Kyr.ohm` l.241-243; `consequences.ts` "Two of a kind given at once are two") |
| C | `tried(x, verb)` accepts only a closed list of verbs (`picking` refused) | house-that-grows (tried row) | P3 | **Fixed** (verified: `Tries <verb>, ….` on a Thing, `src/lang/Kyr.ohm` l.43-45, read by `world-constructs.ts` l.316) |
| C | A won fight pays a fixed-formula experience (542 each for a weak construct), so a fight out-earns the authored ways round | book-of-faces 4 | P3 | **Fixed** (verified: an authored `encounterXp(opponent)` measure overrides the award, `src/campaign/field-use.ts` l.27-29); the generic formula is M19-117's |
| A | `routed` is undone at dawn for anyone with a `Refuge` (`temper_rallies`), and authors cannot set a rout or refuge that lasts the night or for good | ring R8; winter-in-carth 1 | P2 | **Open**: `data/rules/inhabitants.kyr` l.107-109 retracts `routed` at first light; add a lasting rout (authored `routed … for good`, or a night-long Refuge) |
| C | A warned group's patience is one watch; a longer grace needs a module rule setting `patience(g)` | thrume 2 | P3 | **Open**: `patience` is a shared measure (`inhabitants.kyr` l.85) with no Person field (`Kyr.ohm` l.106); add `Patience N.` |
| C | A passage `opening when` shuts at both ends: a failed act that closed a door trapped the company inside | the-dorothea-archipelago A3 | P3 | **Open**: `"opening" "when" Predicate` (`Kyr.ohm` l.29) has no side; add an optional "shuts behind" |
| D | Resetting for a second voyage is a long list of `Retract`s; no `Reset <relations>` | the-dorothea-archipelago A8 | P3 | **Open**: no Reset change in `Kyr.ohm` l.232 |
| C | A condition cannot ask "is the company within <area>": every island keeps a hand list of its rooms in a Query | the-dorothea-archipelago A16 | P3 | **Open**: `within` is an anchor for rules and events only (`Kyr.ohm` l.63), not a predicate |
| D | A Pursuit never takes a `hidden until` way, even one whose fact the pursuer's side knows | ring R1a | P3 | **Open**: pursuit planning skips hidden ways (measured in ring R1); a hidden-for-the-company-only way would fix it (beside M19-129) |
| D | An adversary cannot know what the company did without a hand-made trace per act; no `Notices when …` | ring R3 | P3 | **Open**: no such form in `Kyr.ohm` |
| C | A herald binds an export name to the same import name, so a second module's `principal` had to be exported as `ring_head` | ring R6 | P3 | **Not reproduced** for the exporter: `exports` maps export name to local id (`module-bundle.ts` l.53; `data/goings-on/factors/module.json` `"ring_head": "principal"`); importers cannot alias (imports is `string[]`) |
| C | Deem draws template keys in order, so adding a draw re-rolled every world's Exchange; undocumented | ring R17 | P3 | **Open**: add the line (draws go last, `>` keys, `*` merge) to the Deem trail (`doc/authoring/trail/05-variations-with-deem.md`) |
| C | The `>` router refuses a way with a hazard note, a timed way, or a person's name, and says only "No way", so tests fall back on labels | skeel 1, 2; the-grand-tour 3; the-long-man 2; liberty-of-the-ice 4 | P3 | **Open**: say why a way was refused (hazard, timed, not a place) in `Journey.way` (`journey.ts` l.372) |
| C | No catalog item grants `flame` to a starting company, and no sea chart kind (only `celestial_chart`), so adventures make local kinds or drop the beat | winter-in-carth 2; hollins (chart row) | P3 | **Open**: no flame grant in `data/catalog/items/`; add a torch-like flame source and a chart kind |
| A | `search_stair` latches `searchedStair` on failure and never clears it, so reaching the Sitters is seed-dependent | the-quiet-in-the-sky 1 | P2 | **Open**: `data/adventures/quiet-in-the-sky/old-ice.kyr` l.18-22 has no Retract; clear it at midnight |
| C | The licence's start in `test/support/gaunt.ts` (watch 330) disagrees with `clock.kyr` (19:00 on the eve, nearer 354 by the author) | winter-in-carth 6 | P3 | **Open** (not verified by arithmetic): check the comment at `test/support/gaunt.ts` l.7 against `winter-in-carth/clock.kyr` l.21-22 |

## Covered by existing rows

- Rule cannot assert `knows`; use `says … teaches` (half-the-hive 1; house-that-grows; the-lull 4; the-quiet-in-the-sky 3; wrayford; ring R11; friction.md 5) -> **M19-127** (forms.md names `Rule … teaches`)
- `hasCalling` across modules installed under the last module's prefix (gosses-company row 1; wrayford row 1; friction.md 17, ask 10) -> **M19-100**
- `lends` is not a gift (friction.md 1) -> **M19-93**
- Hazard cannot follow a failed action; `Bring` (friction.md 2) -> **M19-94**
- Off-stage `nowhere` per module (friction.md 3) -> **M19-95**
- `Decrease` below zero hides the action (friction.md 4; the-dorothea-archipelago A4) -> **IFR-02** (raise/lower clamped)
- Hand-made timers, chance tables, dice pinning in Journey, sea draw cap (friction.md 7, 11, 13-15, ask 5, 11; the-dorothea-archipelago A14) -> **M19-98**, **AUT-09**
- `Time` arithmetic (friction.md 8, ask 6) -> **M19-96**
- Adding a province re-seeds worlds (friction.md 9) -> **M19-97**
- Global names: persons, kinds, relations, rule/entity name clash, unprefixed new Kind (friction.md 10; the-dorothea-archipelago A9; ring R7; half-the-hive 2; thrume 7; house-that-grows kinds row; hollins Give/kind row) -> **WPC-14**, **AUT-07**, **IFR-10**
- Duplicate-sounding display names left unrenamed (the-grand-tour 5; the-long-man 6; what-tessary-owes 4; skeel 5; low-water 6; thrume 12; quittance 9) -> **M19-135**
- Terrain kinds, sea distance, coast, vessel, archipelago (friction.md asks 1-4, 16; the-dorothea-archipelago A1, A2) -> **M19-101**, **M19-102**, **M19-103**, **M19-104**
- Agent routes to uninstalled regions, cross-module measures, kits for adventures, Orsett as a place (friction.md asks 7-9, 12; ring R1b, R5; the-dorothea-archipelago A10) -> **M19-99** (remaining author wishes)
- Pursuit planning limits (ring R1c, step count) -> **M19-129**
- Rule voices fire wherever the company is unless `at(party, X)` (ring R9; the-long-man 1; liberty-of-the-ice 6) -> **M19-126**
- Anchor advice noise on member-guarded voices (friction.md 6) -> Fixed in passing: `src/cli/campaign-lint.ts` l.47-50 advises only when the rule's effects reach the company and its condition does not ask where; no row needed
- Danger of a foe against a level-1 company not knowable before play; no gradient between species; no morale for authored bands (parliament-of-books 3; thrume 4; ring R2; the-dorothea-archipelago A15) -> **M19-76** (measured challenge), **M19-122**, **M19-87**, **QTC-A10** (routed vs dead)
- Lone-company locks on calling beats (book-of-faces 7; house-that-grows pick row; liberty-of-the-ice 6b; winter-in-carth 7, 8; the-lull 7; patient-star 7) -> **M19-105**
- Experience too generous in general (book-of-faces 4, beyond `encounterXp`) -> **M19-117**
- A topic re-asked as a real second choice (the-lull 6; low-water 4) -> **BOF-24**
- A failed check free to retry (implicit in several) -> **M19-124**
- Source order decides between rival fate rules (hollins row 1) -> **IFR-05** (rule phases), with `EndingOrder.rivals` reporting rivals
- A role told wherever a moved person is (thrume 8) -> **GTR-21**
- A person "elsewhere but talked of" (lore-sweep 3) -> **IFR-07** (people offstage)
- Tests that teleport or assert instead of play; payoffs not played end to end; negative tests not written; brittle long sequences; a down company makes later waits no-ops (thrume 10; quittance 8; parliament-of-books 8; the-grand-tour 2; house-that-grows back_through row; lore-sweep 8; winter-in-carth 3; patient-star 5) -> **COR-18**, **M19-131**
- `=until` and `?`/`>` steps undocumented (the-dorothea-archipelago A5; hessel peal row) -> **M19-127**
- A `Journey.assert` helper for staging world events (gosses-company) -> already exists: `Journey.assert`, `src/session/journey.ts` l.267
- Cross-adventure meeting of characters who disagree about the calendar (lore-sweep 9) -> **NAR-17** (traces of independent undertakings), broadly

## Not carried

Process incidents (book-of-faces 5; lore-sweep 1, 2; ring R16), intended behaviour recorded by the author (let-one-remember 3; patient-star 2-4, 6; quittance 2's Item vs Kind, which the refusal's shape now names via WPC-07; quittance 5; ring R10, R12, R13, R14; the-dorothea-archipelago A6, A7, A13; liberty-of-the-ice 5; the-quiet-in-the-sky 5; what-tessary-owes 1, 2; hessel rows marked none; thrume 5 starting gold, a doc note), and done content passes (rows marked fixed by their authors). Quittance 7 (no "Auditor has left" event) is a content wish of one adventure.
