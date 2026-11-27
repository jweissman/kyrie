# SRD hit points and ability modifiers: OR-1396

27 November 2026. Proving slice against main `125fa163`, not a claim that the combat system or every monster is SRD-faithful.

## Rules and scope

Ability modifiers are now `floor((score - 10) / 2)` in both expression hosts and the creation descriptions.
Constitution 7, 9, 11 and 15 give -2, -1, 0 and +2. First-level calling HP is the maximum die plus
Constitution, at least one. A character created above first level gets `floor(die / 2) + 1` plus Constitution
at **each** later level, at least one per level. This deliberately chooses half-plus-one as the fixed,
rounded-up average rather than adding Constitution only once or rounding the final total.
For example, a d10 warrior with Constitution 15 has 12 HP at level one and 36 at level four;
with Constitution 7, 8 and 20. A d4 mage with Constitution 1 has one HP per level, not one HP in total.

Actual advancement still rolls a hit die, adds Constitution and applies the per-level minimum.
`Advancement.train` already keys every draw by seed, character id and attained level; no new random stream or
changed draw ordering was introduced. This slice does not change ability-score generation, class overlays,
the save progression, attack progression, damage-penalty policy, spell-slot tables or retroactive HP adjustment
when Constitution changes. Correct modifiers do not make those other policies SRD-faithful.

Calling audit against the v3.5 class hit dice (Kyr's names mapped to their SRD counterparts):

| Calling | SRD counterpart | Before | After |
|---|---|---:|---:|
| warrior | fighter | d12 | d10 |
| ranger | ranger | d10 | d8 |
| mage | wizard | d4 | d4 |
| thief | rogue | d6 | d6 |
| cleric | cleric | d8 | d8 |
| bard | bard | d6 | d6 |
| monk | monk | d8 | d8 |
| commoner | NPC commoner | d4 | d4 |

Reference locations: Revised 3.5 SRD, Basics (ability modifiers), Classes (hit dice and first-level hit points),
and Improving Monsters (racial Hit Dice). The source site could not be fetched in this environment
(DNS lookup failed); the task's supplied SRD rules and the checked-in creature source records were used.

## Modifier consumers

Searched `src`, `web`, `data/generation` and `data/rules` for every `statMod` reference, plus independent
`round((score - 10) / 2)` forms. `Fighting.statMod` delegates to `FantasyRules.statMod`; both Expressions and
Deem register that shared function. Consumers now inherit floor rounding:

| Consumer | What reads the modifier |
|---|---|
| `rules/fighting`, `battle`, `content` | attacks, ordinary damage, AC, initiative and generated speed |
| `effects`, `ability-use` | saves and ability resistance |
| `rules/fixed-stat-block`, `cli/srd-creature-fidelity` | fixed-save compensation and fidelity measurements |
| `rules/creation`, `rules/advancement`, `rules/level-drain` | initial HP, rolled gains, fixed level-drain HP and legacy mana pool |
| `rules/spellcasting` | bonus first-level slots; an odd 13 no longer qualifies as modifier +2 |
| `rules/searching`, `rules/morale`, `quarry`, `campaign/field-use` | searches, morale, force and Constitution checks |
| `presentation/character-sheet`, `presentation/mechanics-text` | displayed combat qualities, damage, HP and specialized expressions |
| `web/engine/creation`, `creation/creation-rules` | creation's modifier table, explanations, weapon estimates and suggestions |
| `rules/checks` and creation checks | already rounded down; unchanged |

The only half-up formula left is **source archaeology**, not a gameplay modifier:
`registry/orsino-monsters.ts` reconstructs what upstream Orsino's template produced for its audit and catalog
extractor. `data/sources/orsino/registry.json` likewise retains upstream source verbatim.
Changing those would falsify the audit; neither supplies a live character's ability modifier.
The bestiary importer uses the reconstructed scores but writes a growth definition, whose runtime modifier is
the corrected `Creation.grown`. No caller in a fight, generation host or creation card retains half-up rounding.

## Monster boundary and coupled conversions

The concordance's ten fixed bodies have explicit Hit Dice: boar/wild, centipede/long, dog/drove, ghoul/barrow,
golem/flesh, mummy/royal, owlbear/fell, rat/cellar, rat/midden and unicorn. None retains a growth definition.
`Creation.health` reads Hit Dice first, with their listed mean (rounded down), or the existing identity-keyed
rolled mode. It must not add Constitution a second time: the expression already includes the block's bonus.
The spec also supplies both growth and Hit Dice to prove that even such a chassis cannot grow a fixed block.

Six fixed-body AC conversions had depended on the old rounded Dexterity: dog/drove, ghoul/barrow,
centipede/long, rat/cellar, rat/midden and golem/flesh. Each now has one point of natural armor in the
conversion, keeping its SRD AC rather than weakening it when the modifier is corrected. The other four need
no adjustment. Fixed attack bonuses, strike bonuses, saves and Hit Dice are unchanged.

There are still 74 base kinds with legacy growth, including 39 concordance entries without fixed Hit Dice:
badger, balor, bat, beetle, centipede, centipede/great, chimera, deva, dryad, eagle, the four elemental breeds,
frog, ghoul, golem/clay, golem/iron, golem/stone, hawk, lizard, marilith, mummy, nightmare, nymph, ooze, owl,
mouther, owlbear, pixie, pony, pseudodragon, raven, satyr, snake, solar, titan, wraith and wyvern.
Their legacy template is **not** an SRD racial-HD formula; only its modifier now follows the SRD.
Inventing HD for them would bypass the existing per-creature proof slices. That migration remains the
[catalog friction account's](../mission-22/srd-catalog/friction.md) work, not a balance fix in this slice.

## World measurements

Both full `bun run quantity` runs used the same main base, seeds and unchanged baselines. Both exit 1;
the row-by-row comparison matters. Per-seed values are ordered iscoed / a1 / thorn unless noted.

| Measure | Main | SRD slice | Result |
|---|---|---|---|
| Fights/hour at combat places | a1 1.45; thorn 0.68 | iscoed 1.76; a1 1.45; thorn 0.67 | All within 0.5-4 |
| Delver fights/hour | 3.23 / 3.67 / 3.70 | 3.23 / 3.96 / 3.70 | Median 3.67 to 3.70; floor 3.33 holds |
| Subsequent expeditions changing options and loop | 3 of 4 | 3 of 4 | Report |
| Distinct preparations | 2 | 2 | Report |
| Kinds of dungeon answer | 8 | 8 | Holds |
| Traversal/administration after first expedition | 77% | 75% | Already red on main; ceiling 74 unchanged |
| Watches after first expedition | 282 | 506 | Report; different trips, not a performance timing |
| Road fights/hour | 0 / 0 / 0 | 0 / 0 / 0 | Report |
| Combat places quests return to | 2 / 2 / 2 | 2 / 2 / 2 | Holds |
| Return expeditions with fight and reward | 1 | 1 | Holds |
| Bands within four hours | 32 / 38 / 35 | 32 / 38 / 35 | Holds |
| Potentially lethal bands warned beforehand | 55 of 55, 100% | 63 of 63, 100% | Fairness ratchet holds |
| Day's coin / kit and dearest ware | 1.77 / 2.19 / 1.45 | Same | Holds |
| Treasure / market stock | 2.04 / 2.09 / 1.55 | Same | Holds |
| Atlas marks/turn, golden then three followers | 2.3 / 2 / 1.9 / 2 | 2.3 / 1.6 / 1.9 / 2.1 | Holds |
| Turns with no mark, golden then followers | 0 / 4 / 0 / 24% | 0 / 28 / 0 / 21% | **New failure:** iscoed exceeds 25% |
| Marks without witness | 0 | 0 | Holds |
| Nearby things worth doing | 10 / 7 / 11 | Same | Holds |
| Structural kinds of aim | 6 | 6 | Holds |
| First-hour aims shared by all seeds | 0% | 0% | Holds |
| Median minutes travelled/aim | 12 | 12 | Holds |
| Aims completed by arrival alone | 8 of 36, 22% | 8 of 35, 23% | Already red; ceiling 20 unchanged |
| First-town aims handed out | 2 of 16, 13% | 2 of 11, 18% | **New failure:** ceiling 14 unchanged |
| First dungeon minutes | 22 / 32 / 32 | Same | Holds |
| First dungeon levels with boss/cache | 4 / 4 / 2 | Same | Holds |
| First dungeon hex distance | 0 / 0 / 0 | Same | Holds |
| Companion/light/provisions in reach | 3 / 3 / 3 | Same | Holds |
| Companion/light/provisions/gear at entry | 4 / 4 / 4 | Same | Holds |
| Kinds the deep can field | 49 | 49 | Holds |
| Stranded authored content | 16 | 16 | Holds |
| Consequential people named | 88% | 93% | Report |

The two handed-out aims are unchanged: iscoed's `sought` and thorn's `u_onward_sought_pit`; the denominator
changed because the walks reached different aims. This is OR-370, not a reason to widen the ratchet.
The unmarked-turn regression is OR-1397. Recommend integrating the SRD rules as rules, with the World/Game
builders reviewing those paths, not compensating with incorrect HP or an easier gate.

The delver is explicitly given 300 HP to measure dungeon density, not first-level survivability.
On a1, main dies after 11 fights, 14 rooms and three levels (180 game minutes), at the haulage winze's snare.
The slice dies after six fights, six rooms and two levels (91 minutes), crossing from the adit winze-head to
the haulage winze-foot. Higher fights/hour here **does not mean a better or safer expedition**.

## Which fights changed

Replayed `FirstHourBands.bands(campaign, 12)` on each side, with identical semantic trial seeds and the same
normal first-town hire. The starting warrior's HP changes 14 to 12 on iscoed, 13 to 11 on a1, and 14 to 11 on thorn.
Odd scores also lose one attack, save, initiative or AC modifier; legacy monsters with odd Constitution can lose
one HP. Higher-level humanoids instead gain Constitution each level and the higher fixed die average.
Accordingly this is not uniformly a nerf to either side. The twelve-trial samples are comparisons, not exact odds.

| Seed, encounter | Company wins before/after (of 12) | Player falls before/after |
|---|---|---|
| iscoed, Holyking mound's dead | 11 / 12 | 1 / 0 |
| iscoed, Holyking robbers' captain | 10 / 9 | 2 / 3 |
| iscoed, Holyking mourners' ghouls | 6 / 11 | 6 / 1 |
| iscoed, Holyking ossuary spiders | 11 / 8 | 2 / 5 |
| iscoed, Holyking embalmer's blessed great hound | 7 / 9 | 5 / 3 |
| iscoed, ring-fort gate hobs | 11 / 12 | 1 / 0 |
| iscoed, Redkeep bone hounds | 12 / 10 | 0 / 2 |
| iscoed, Numbered House Usher | 3 / 6 | 9 / 6 |
| iscoed, Numbered House slump | 7 / 3 | 5 / 9 |
| a1, circus shore-brooder | 12 / 9 | 0 / 3 |
| a1, Ironkeep wolves | 11 / 8 | 1 / 5 |
| a1, circus tyrant | 8 / 1 | 4 / 11 |
| a1, Stonemound grave-robbers | 8 / 5 | 5 / 7 |
| a1, Stonemound mourners' restless dead | 12 / 8 | 0 / 4 |
| a1, Stonemound shades | 5 / 2 | 7 / 10 |
| a1, Stonemound blessed hollow-stalker | 11 / 7 | 3 / 5 |
| a1, Numbered House eels | 9 / 6 | 4 / 6 |
| a1, Numbered House beetles | 7 / 3 | 6 / 9 |
| thorn, Numbered House owlbear | 8 / 6 | 7 / 8 |
| thorn, circus hook-claws | 6 / 2 | 8 / 11 |
| thorn, circus sail-wings | 6 / 2 | 9 / 11 |
| thorn, keep door-ward | 12 / 11 | 0 / 2 |
| thorn, Whitelake alpha otters | 3 / 1 | 11 / 12 |

These are representative material changes; every band was included in the fairness census.
No dungeon encounter tables, challenge ratings or fairness bands were retuned.

The stored world-budget challenge table therefore predates this rules change. For the barrow ghoul, the existing
twelve-trial tool now measures 2 at both creature ranks rather than the stored 1: a first-level warrior wins
5/12, a second-level warrior 7/12. Its fight spec now proves that actual level boundary with the same majority
threshold, not an easier creature or a looser threshold. OR-1398 asks World to remeasure the affected table and
compare encounter generation before retuning; the stored rating is not presented as a fresh measurement.

## Timing measurements

`bun run quality --only=start,first,turn,still,still95,decision,decision95,leg,leg95,page,page95,heap`.
One sequential, warm-cache walk per side on this shared machine; all existing timing ratchets hold.
This is not a controlled benchmark or browser latency measurement.

| Quality walk reading | Main | Slice |
|---|---:|---:|
| Start to first frame, ms | 3841 | 3864 |
| Start to first answered act, ms | 3981 | 4017 |
| Median turn, ms | 97 | 87 |
| Median non-journey turn, ms | 88 | 85 |
| p95 non-journey turn, ms | 173 | 185 |
| Median decision, ms | 29 | 28 |
| p95 decision, ms | 76 | 77 |
| Median journey leg, ms | 33 | 30.6 |
| p95 journey leg, ms | 119.8 | 113.5 |
| Median page-host journey leg, ms | 54.7 | 43.3 |
| p95 page-host journey leg, ms | 113.8 | 111.5 |
| Heap retained/turn, KB | 1158 | 1235 |

Storage filled during the work. Only this session's old dependency/parse caches and generated site were removed.
An intermediate after-run, following cache eviction, measured a 7178 ms start; it is not hidden as a rule regression
or compared as warm-cache performance. The final warmed run above restores comparable cache conditions.

## Proof and limitations

`test/srd-hit-dice` proves negative/odd Constitution, per-level minima, higher-level creation, all installed calling
hit dice, and fixed Hit Dice taking precedence over growth. `test/attributes` proves both expression hosts;
`test/creation-rules` holds the descriptions to the actual fighting and skill modifiers.
Existing per-creature specs keep their SRD AC claims; the data conversions, not the assertions, were corrected.

Presentation-only fixtures now explicitly provide placed rolls or an experienced character where their subject
requires a fight to last or be won. They do not purport to prove a first-level challenge. The lifecycle test keeps
its living-but-wounded assertions on a seed whose first hit does not kill. The bringing test checks that the brought
band actually initiates a fight, rather than relying on the last narration after an automatically resolved fight.

The spell-over-blow test's old 65/100 survival floor depended on the old modifiers: the corrected mage wins 59.
Instead of lowering that floor or strengthening the mage, the spec now compares tactics with staff-only decisions
against the same 100 seeded pairs of rats. Casting must improve survival over that counterfactual. The three
direct decision assertions still require the sure spell at a rat of one, prefer it to a touch that can miss, and
keep the slot against a foe it would only scratch. No tactics code or balance threshold was changed.

The catalog change invalidated Wren's three per-step byte digests. `redigest-trace.ts wren-tower-climbed` reported
"it comes where it came"; only those digests changed. Its kept commands, place, watch and words remain immutable,
and the complete kept-traces spec passes.

Browser visual acceptance and the whole CI lane remain for the pull request. No claim is made of human acceptance,
complete SRD class fidelity, or a wholly green quantity gate.

Final local gates all exit zero: `check:fast` (typecheck, lint, then 2,319 quick tests passing),
`test:small` (1,245 passing), `test:honest` (four passing), and the combined required/changed-spec batch
(193 passing, four browser skips across 40 files). The batch includes every `srd-*` and `fight*` spec,
`cure-wounds`, `spell-over-blow`, kept traces and every changed spec. Optional disk parsing was disabled for
these gates after the shared filesystem filled.

Main advanced by three engine-owned conversation-focus commits during the runs. The measured comparison and
local gates remain on the recorded `125fa163` base; the pull request's merged result still needs CI.
