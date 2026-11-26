# SRD catalog: friction

## Playable reach and social magic: 26 November

**The catalog is ahead of the game.** The 404 creature routines and twenty spell recipes below are spec-only
prototypes, not installed encounters or learned spells. We have not made an installed-encounter census or measured
their effect on the world. Counting them as playable migrations would be misleading.

### SRD source extraction corrections

The pinned monster pages use two armor-class forms the extractor missed: the pit fiend labels the row `AC:`, and
the harpy archer prefixes its value with `AC`. The parser now accepts both, restoring AC 40 (including +23 natural)
and AC 23 respectively. Iterative full-attack bonuses such as `+7/+2` were also truncated, while some blows after
`, and` were skipped. Extraction now preserves those bonuses in order and handles that separator; regeneration
changes 22 source records. Focused source-page tests cover the alternate AC forms, the harpy and athach routines.
These are reference-data corrections only: they add no playable bodies or encounters and make no claim that every
alternative routine or attack mode is extracted.

There are real placed examples. The generated first town's corn-store has an old buck using `rat/midden`, the adapted
dire rat from case 64; `test/undertown.test.ts` follows the town's job through the nest to the merchant's reward.
The same generated site offers a mage who knows Sleep a named act against the rats in the run. It spends a slot,
rolls saves and persists sleeping creatures into the world; survivors attack, and killing sleepers is a separate act.
`test/small/sleep-band.test.ts` now also exercises that actual generated template with all saves, mixed saves and no
saves, and checks that its words agree. The group-level result says whether any rats still move, not exactly how many
fell asleep. This is a deliberately adapted spell: ten combat rounds become ten world watches in this field route,
not the SRD's minute.

The nest's clearance rule currently uses `not able` for the buck, not `dead`. A temporary incapacitation would not
be a durable clearance, but whether an ordinary playable route can leave this particular buck temporarily unable
after a fight has not been established. Reproduce that route before changing the rule; the run's distinct field
Sleep action targets the other band.

**Charm does not yet charm a guard socially.** The current `charmed` condition changes combat allegiance
(`test/turn-structure.test.ts`); it is an Orsino adaptation, not SRD Charm Person's attitude toward the caster.
`FieldUse.hostile` only accepts conditions that stop actions, so the existing field invocation does not offer Charm;
`CreatureFacts` projects no source-linked charmed-by relationship for guard or conversation rules. A named spell in a
spellbook therefore does not establish a social route, passage, or a friendly dialogue. It must not be presented as
automatic obedience or as a completed SRD migration.

The smallest useful end-to-end slice needs all of these, not just another condition label:

1. A named, eligible humanoid guard and caster, with ordinary learning and a spent slot; the actual ability path must
   apply the correct save and resistance and leave an ineligible or resisting target unchanged.
2. A source-linked, temporary friendly attitude in authoritative creature/world state, surviving reload and expiring
   on world time. Define what hostile acts do to it against the SRD, and avoid reusing combat side-switch as friendship.
3. One authored guard encounter whose conversation or passage reads that relationship, including a refused or checked
   unreasonable request. Show normal, saved, charmed, expired and attacked outcomes through the ordinary engine
   questions, with truthful narration and no client-only controls.
4. Compare seeded player and installed caster picks and encounter outcomes before placement. Then extend the shared
   contract to more social effects; do not bulk-import spells on the strength of the guard fixture alone.

## Pass of 26 November

The source lists in `data/sources/srd35/` contain 605 spell records and 440 creature stat blocks. This pass compared
every source key with `concordance.json` and the merged catalog at main `1bd39d8`, then examined the variant families
and the old `srd-7` and `srd-draw` branches. This is a **mapping inventory**, not a manual proof of every spell or
creature: an unmapped record may have an indirect or differently named representation, and a mapped record may still
be wrong. The source lists are reference data, not the whole SRD rules corpus.

The catalog has 286 spell records, including unsupported entries. The concordance maps 119 spell IDs to 119 distinct
source records, leaving 486 source records without a direct map. For creatures, 79 modeled IDs map to 70 distinct
source records, leaving 370 source records without a direct map. Multiple creature IDs can map to one stat block;
the 79 are not 79 distinct SRD monsters. `mission-21/rules/srd-fidelity.md` grades mapped rows, not coverage of all
source records. Before this slice, 45 spells passed its structural checks, 37 resolution and 36 play identity; 8
creatures passed structure, 7 resolution and 3 play identity. These grades check selected fields, not every rule.

For spells, merge `data/catalog/orsino/abilities.json` with the hand entries in `data/catalog/abilities.json`, with
hand entries replacing the same IDs; select `kind: spell`. Compare those IDs with the `spells` object in the
concordance, and its values with the keys in `spells.json`. Count distinct source keys as well as mapped IDs. The
creature count likewise uses the concordance and source stat-block keys, with the catalog's body filter used by the
fidelity report. Repeating the comparison by the source-key suffixes `-mass`, `-greater` and `-lesser` finds 22, 18
and 6 records respectively; 2, 1 and 2 have direct mappings. Suffixes are a useful family inventory, not a complete
classification of every variant.

To reproduce the inventory from the repository root:

```sh
bun -e '
import spells from "./data/sources/srd35/spells.json";
import monsters from "./data/sources/srd35/monsters.json";
import concordance from "./data/sources/srd35/concordance.json";
import generated from "./data/catalog/orsino/abilities.json";
import hand from "./data/catalog/abilities.json";
import { Canon } from "./src/canon/canon";
const catalog = { ...generated.abilities, ...hand.abilities };
const ids = Object.keys(catalog).filter(id => catalog[id].kind === "spell");
const spellRefs = new Set(ids.flatMap(id => concordance.spells[id] ? [concordance.spells[id]] : []));
const bodyIds = Object.keys(concordance.creatures).filter(id => Canon.isBody(id));
const bodyRefs = new Set(bodyIds.map(id => concordance.creatures[id].srd));
console.log("spells: source, catalog, mapped IDs, distinct source keys, unmapped source keys",
  Object.keys(spells.spells).length, ids.length, ids.filter(id => concordance.spells[id]).length,
  spellRefs.size, Object.keys(spells.spells).filter(id => !spellRefs.has(id)).length);
console.log("creatures: source, mapped bodies, distinct source keys, unmapped source keys",
  Object.keys(monsters.monsters).length, bodyIds.length, bodyRefs.size,
  Object.keys(monsters.monsters).filter(id => !bodyRefs.has(id)).length);
for (const suffix of ["mass", "greater", "lesser"]) {
  const keys = Object.keys(spells.spells).filter(id => id.endsWith("-" + suffix));
  console.log(suffix, keys.length, keys.filter(id => spellRefs.has(id)).length);
}
'
```

## Blockers and next slices

| Friction | Evidence and consequence | Smallest next proof |
| --- | --- | --- |
| **One version family is not yet a shared contract** | OR-157 remains open. Creatures have `variantOf` and composable overlays (`src/canon/canon.ts`); item and ability records do not have an equivalent family/version link. Aliases identify names, not distinct versions with their own effects. | Prove family and concrete-version lookup, inheritance and independent effects across representative spell, item and creature versions before generalizing. |
| **Mass cures are not mapped** | All four mass Cure Wounds source records lack a concordance mapping. A renamed single-target cure would not prove the SRD's selection and limits for multiple targets, or its effect on undead. | Prove one mass cure through ordinary targeting and slot use, including target limits and affected allies; record any deliberate conversion before adding the family. |
| **Cures do not harm undead** | The single-target cure family heals living allies; case 16 explicitly omits its undead touch attack, Will save and spell resistance. Its census resolution pass is a named conversion, not full SRD behavior. | Prove the hostile touch, save, resistance and healing routes together without breaking the existing field cure. |
| **Some named variants are already modeled but substantially different** | `major_restoration` maps to Greater Restoration but is level 9 rather than 7 and has other differences in the fidelity report; Lesser Restoration is a separate mapped record. Correcting a level alone would not prove either spell's defining restoration behavior. | Trace the actual restoration and duration effects against the source, then migrate a complete playable slice. |
| **Creature variants need more than a new alias** | Small and medium monstrous spiders are mapped; `spider/great` and `spider/great/cave` both map to medium, not separate SRD sizes. Tiny, large, huge, gargantuan and colossal have no direct mapping. | Choose a size encountered in play, model its own statistics and defining attacks, and measure its generation and combat impact. |
| **Ferocity needs an ability-to-act rule** | The wild boar's variation explicitly omits fighting while disabled or dying. The current positive-HP ability checks do not prove that behavior; adding a trait name would not implement it. | Prove a creature acting while dying, its subsequent harm and death, and its interaction with combat and world state. |
| **Long-running disease is not a bite label** | The barrow ghoul case explicitly omits Ghoul Fever's disease over days. Existing immediate attack riders alone do not prove that clock. | Prove onset, progression and treatment across world time and save/reload before adding the disease. |
| **Generation and balance move with fidelity** | Changing the three stronger cures changes seeded cleric spellbooks; case 16 records the before/after sample and the preset's loss of Lesser Restoration. An installed-encounter census and world-balance walk were not run for this slice. | Measure affected installed casters and exercise the world gate in CI before relying on first-hour balance. |
| **Handbook regeneration includes unrelated drift** | `bin/kyrie handbook` also adds eleven fine armours and the Going Bank and Windfall campaigns, and reorders a kit; those changes predate this slice. The command reports four problems. Only the cure entries are carried here. | Regenerate and review the unrelated handbook changes as their own housekeeping slice. |

## Old branches

`srd-draw`'s Burning Hands, Fireball and Lightning Bolt work and `srd-7`'s concealment, healing, condition amounts and
skeletal defenses have landed independently on main. The later global level-gated skeletal hold on `srd-7` did not:
main holds the first den specifically. That branch reported substantially different encounter danger, so its general
hold should be evaluated as a balance decision with a test and census, not merged wholesale.

## What this slice changes

Cure Moderate, Serious and Critical Wounds now use their SRD second, third and fourth spell levels. Their existing
healing mechanics are retained; the focused spec casts them at the newly reachable cleric levels and checks the slot
spent. The preset cleric's valid spell picks change, as described in case 16. The SRD census's structural passes
increase from 45 to 48; resolution and identity counts do not change. This does not close OR-157, SR-01 or SR-02.

## What the numbers can and cannot say

The inventory asks whether a **direct mapping** exists. The fidelity census asks whether **selected fields on mapped
rows**, read from resolved canon, match or have a recorded conversion. Neither asks whether every SRD behavior is
playable. A catalog entry can be unsupported, a mapping can represent an intentional adaptation, and a source record
without a direct mapping can have a differently named representation. Do not divide structural passes by all source
records and call the answer the percentage migrated, or call mapped records lore-accurate on the strength of the
mapping alone.

For example, the living-healing half of a cure is exercised and its save is recorded as a conversion, while its
hostile undead route remains absent. A census resolution pass does not make that omitted route work. Likewise,
creature mappings include multiple Kyr bodies pointing to one SRD block: an ID count is not a count of distinct
creatures.

The generated report and its implementation are `doc/architecture/mission-21/rules/srd-fidelity.md`,
`src/cli/srd-spell-fidelity.ts`, `src/cli/srd-creature-fidelity.ts`, and `src/cli/srd-spell-resolution.ts`.
The comparison has useful limits:

- A named conversion is accepted as converted, not demonstrated equivalent. It needs a description of the changed
  contract and a test of the actual behavior, including the boundary or counterexample that distinguishes it.
- A field marked `n/a` can be legitimately inapplicable or simply not measured. Those are different things; do not
  assume either that every `n/a` is a bug or that it proves equivalence. Report the reason for each.
- Spell damage is sampled at four caster levels, duration and targeting are classified coarsely, and creature hit
  chance uses one armor class and the first attack. A match can hide a missed scaling boundary, different recipients,
  or a different multiattack. Add boundary and full-routine tests against observed resolution, not more labels alone.
- The identity grade uses concordance test references. `test/srd-fidelity.test.ts` checks that references exist, but
  their existence does not establish that the tests exercise each defining behavior. Tie each claimed behavior to an
  assertion and an ordinary player or encounter route. Preserve intentional conversions as conversions.
- The encounter percentages describe the kept a1 groups and six fixed-seed den samples, not all play. A change to a
  source or placement also needs a fresh encounter measurement rather than an unchanged saved census.

**Instrument slice:** first make the report distinguish inapplicable, unmeasured, unsupported, exact and converted
fields; retain the per-field evidence rather than treating an aggregate as a full-fidelity verdict. Validate identity
claims against behavior assertions, not only reference existence. Add fixtures where a coarse sample would pass
despite a wrong cap, duration, target set, or secondary attack; then compare actual engine outcomes at the relevant
boundaries. This is separate from changing the census baseline: a stricter reading may honestly lower the count.

### Verdict breakdown at this slice

These are field comparisons, not counts of individual spells or creatures that are fully faithful. A row contributes
to every field. The census accepts exact, converted and `n/a` fields when grading; `orsino` means the creature
comparison uses the procedural Orsino body rather than a fixed SRD block.

| Spell field (119 mapped rows) | Exact | Converted | Differs | n/a |
| --- | ---: | ---: | ---: | ---: |
| Level | 58 | 1 | 60 | 0 |
| School | 83 | 1 | 35 | 0 |
| Dice | 14 | 0 | 23 | 82 |
| Type | 13 | 0 | 1 | 105 |
| Save | 27 | 11 | 39 | 42 |
| DC | 6 | 20 | 54 | 39 |
| Attack | 110 | 0 | 9 | 0 |
| Resistance | 19 | 0 | 35 | 65 |
| Target | 73 | 3 | 43 | 0 |
| Duration | 52 | 6 | 61 | 0 |

| Creature field (79 mapped rows) | Exact | Differs | n/a | Orsino |
| --- | ---: | ---: | ---: | ---: |
| Hit Dice | 9 | 0 | 0 | 70 |
| Armour | 10 | 69 | 0 | 0 |
| Attacks | 27 | 52 | 0 | 0 |
| Hit | 13 | 60 | 6 | 0 |
| Saves | 8 | 71 | 0 | 0 |
| Defences | 5 | 19 | 55 | 0 |
| Specials | 2 | 19 | 18 | 40 |

| Grade | Spells | Creatures |
| --- | --- | --- |
| Structural | 48 pass; 71 fail | 8 pass; 71 fail |
| Resolution | 37 pass; 68 fail; 14 unsupported | 7 pass; 72 fail |
| Identity | 36 proved; 83 unassessed | 3 proved; 76 unassessed |

The 14 unsupported spell *resolution grades* are not the same population as the 30 catalog spell entries carrying
an `unsupported` field: the former is over mapped rows and applies the grader's rules. An `n/a` is legitimate when
both compared values are absent: Magic Missile's DC, for instance, is `n/a` because there is no save
(`test/srd-fidelity.test.ts`). It does not by itself establish whether the underlying source or modeled data were
complete. `unassessed` is an identity grade, not another field verdict.

Recompute directly from the same resolved rows; the generated ledger combines exact and converted in its summary:

```sh
bun -e '
import { SpellFidelity, spellFields } from "./src/cli/srd-spell-fidelity.ts";
import { CreatureFidelity, creatureFields } from "./src/cli/srd-creature-fidelity.ts";
for (const [label, rows, fields] of [
  ["spells", SpellFidelity.rows(), spellFields],
  ["creatures", CreatureFidelity.rows(), creatureFields],
] as const) {
  console.log(label, "rows", rows.length);
  for (const f of fields) {
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r[f].verdict] = (counts[r[f].verdict] ?? 0) + 1;
    console.log(f, JSON.stringify(counts));
  }
  for (const g of ["structural", "resolution", "identity"] as const) {
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.grades[g]] = (counts[r.grades[g]] ?? 0) + 1;
    console.log(g, JSON.stringify(counts));
  }
}'
```

## Candidate slices for the rules builder

The order favors a small shared proof before a wider catalog change. All differences below refer to the current
worktree's resolved rows and source records, not an assertion that the source extracts contain all rules text.
Existing engine primitives reduce the work but do not prove their combination is wired into the particular spell.

| Priority and mapped spell | Current behavior and friction | Specific mitigation and acceptance | Reach and generation risk |
| --- | --- | --- | --- |
| 1. `cure_minor`, Cure Minor Wounds | A zero-level cure heals one ally for one point; its catalog note omits harm to undead. Dice, save and DC differ in the census. The structured source omits the healing amount, so the dice verdict alone does not disprove the one-point heal. | Preserve one-point living healing without a hostile save. Prove an undead hostile touch, Will save and resistance through resolution, with a missed touch, a saved target and a resisted target. The touch and resistance primitives exist, but the heal effect does not establish this route. Expand the same proof to the stronger cures. | Keep ordinary cantrip use and tending intact. Measure any change in target availability, combat choices and existing spell selection. |
| 2. `conjure_light`, Light | Source: level 0, an object touched, ten minutes per caster level. The current Kyr-authored level-1 spell gives an ally `lit` for two hours. Level, target and duration differ. | First prove a light on an object changes an actual scene's visibility and expires at the right world time, including save/reload and two caster levels; a timed status alone is not object lighting. Decide whether to retain the current spell as an adaptation and introduce a distinct version instead of silently changing it. | Moving to the separate cantrip pool or adding traditions changes learned and prepared spell sets. Measure player creation and installed casters before changing either. |
| 3. `charm`, Charm Person | Source: one humanoid, Will negates, resistance, one hour per level. Current record uses three rounds, a different DC and no resistance flag. The present charmed allegiance is not automatically the SRD's treatment as a friend. | Prove target eligibility, DC, resistance before effects, both save outcomes and expiry across world time. Separately prove what requests and hostile acts mean to the subject; do not make a DC-only pass stand for relationship semantics. | Level and school need not move, but the longer relationship can affect combat, conversation and persisted world state. Compare those outcomes and test reload. |
| 4. `disintegrate` | Source is a sixth-level transmutation ray with ranged touch, caster-scaled damage, Fortitude partial and spell resistance. The current fifth-level evocation is flat 10d6 force with different attack, save and resistance handling. | Connect and prove ranged touch hit/miss, resistance, a failed and successful Fortitude save, scaling at low level and its cap, and creature and object outcomes. Do not equate an existing touch helper with this complete route. | Changing level and school affects selection and specialist pools; count changed player and installed hostile spellbooks. Keeping the current slot is a conversion, not full fidelity. |
| 5. `animate_dead` | Source has different cleric and wizard levels and touches one or more corpses. The current arcane third-level effect revives one dead ally with undead traits; its level and target fail the census, and revival is not corpse animation. | First settle whether the existing record remains an adaptation. For an SRD version, prove one and several valid corpses, invalid targets, created undead, control and persistence. Support different class-list levels only with an explicit representation and selection proof. | New creatures and control affect encounter and world state. Check source caps and resource costs, caster lists, hostile preparation and save/reload before placing the spell. |

## Candidate slices for creatures

The existing examples are adaptations with proofs, not blank implementations. Their historical sample counts are not
the current generated ledger's coverage. Keep the existing behavior and its evidence visible while extending it.

| Candidate | What exists and what remains | Specific mitigation and placement risk |
| --- | --- | --- |
| `boar/wild` | Case 65's fixed-stat breed passes structure and resolution; its ferocity, low-light vision and scent are omitted. `boar` is a separate procedural row and fails those grades. The current ledger records `boar` at 1/9 and `boar/wild` at 0/0; case 65 separately measured 10 boars in 156 open-country meetings across eight countries. | Implement fighting while disabled or dying as a state and action rule, not a trait label. Prove its action, resulting harm or death, combat exit and reload. The breed already replaces one warned wood meeting, while roadstation and den boars remain the old body; measure both avoidance and fought outcomes before widening placement. |
| `rat/midden` | The dire-rat breed already proves a bite, disease save, one-to-three-day incubation and a Fevered condition (`test/midden-rat.test.ts`). Case 64 records one save for both scores, a single toll and day-end recovery as adaptations; low-light vision, scent, Climb and Swim are omitted. The current ledger records 0/0, not proof it is unreachable. | Compare the SRD disease's individual saves, repeated progression, recovery and treatment with the existing clock before changing it. Exercise multiple days, removal during incubation and after harm, and reload; measure any change to the placed encounter. Reuse this clock where appropriate for Ghoul Fever, rather than describing onset as wholly absent. |
| `long_centipede` | `test/long-centipede.test.ts` already proves poison, a delayed second dose, accumulation, Cleanse and placement. Case 63 records the second save at a watch rather than a minute, and full Dexterity recovery at day-end instead of point-by-point. | If exact timing is wanted, prove the second save at the intended time and gradual recovery, including treatment and reload. Assess whether a finer clock advances while the player is not in combat before applying it to other poisons. The kept encounter ledger can be stale after a placement change. |
| `spider/great/cave` | The current row maps to medium monstrous spider and records 3/35 in the kept ledger; attacks match but armor, hit chance and saves differ. Case 28's earlier replacement experiment made every tested pair lethal. It is not a completed SRD replacement. | Keep the placed Orsino spider until a scoped fixed-stat variant has its poison and attack proof, a measured role and warning, and seeded lone/company fights. Case 28's lead decision was to leave it as-is; do not replace all spiders on the basis of a table match. |
| Barrow ghoul | A distinct breed and its combat route already have a proof (case 25). Ghoul Fever, turn resistance and elf immunity remain omitted; the ordinary ghoul is also a separate, widely encountered body. | Prove the disease over world days, turn resistance in the actual turning rule, and an eligible elf's immunity without suppressing effects on other targets. Place the breed selectively and rerun encounter samples instead of replacing all ghouls. |

## Acceptance and release plan

For each proposed slice, keep five pieces together, following
`doc/architecture/mission-21/rules/proof-slices.md`:

1. Name the precise SRD source, current modeled behavior, omitted or converted behavior, and whether the entry is
   installed, generated, reachable or only catalogued. A reference-only or unmapped row is not a playable migration.
2. Prove the defining rule with a minimal fragment through the same resolution path used by play. Include failure,
   resistance or immunity as applicable, save/reload and replay where the effect persists, and visible causal events.
   Then prove one ordinary character can learn and cast the spell, or one ordinary encounter can produce the
   creature, without inventing a client-only route.
3. Inventory all affected picks and placements before changing them. For spells, compare seeded player and hostile
   spellbooks, available slots, presets and installed casters. For creatures, compare affected ecology rows, warning
   and avoidance, first-hour encounters and fixed-source stats. Keep new variants unplaced until measured.
4. Compare before and after against the **same** seeds and party composition; record both the results and any
   placement or rules conversion. Test a lone novice as well as a company, and distinguish avoided from fought
   meetings. Do not tune a source body's HP merely to conceal a placement problem.
5. Regenerate the fidelity report and relevant handbook, review unrelated drift separately, and record the proving
   spec, actual reach and unresolved omissions. Only call a row exact when the defining behavior and the relevant
   fields have been checked, not merely when the census changes color.

Run the narrow spec and fast gates first; the larger world walks belong in CI, not this machine. In addition to
`bun run test:canary`, run `bun run quantity` on the proposed head and a comparable baseline, keeping the seed,
party and per-encounter results. Its default countries are `iscoed`, `a1` and `thorn`; its fairness reading compares
outcomes with Kyr's own reckoning (`doc/architecture/quantity.md`), so it is a useful regression signal, not an
independent proof of SRD encounter balance. Inspect changed installed encounters and explicitly sample fights and
avoidance at their intended ranks as well. If a band fails, investigate the world or the soundness of the measure;
do not widen it to make an import pass.

**CI friction, 26 November:** PR #2's run for commit `a47ac81` concluded `action_required` without jobs; its cause is
not established here. The local fast and small gates passed for that commit, but this is not a green CI result. No
`quantity` or `test:canary` invocation was found in the repository's workflow YAML. Arrange an explicit CI run of
these measures for content changes that affect placement or draws and keep the output with the slice; until that
exists and runs, do not claim the world gate covered this migration.

## Scale prototypes: 26 November, second pass

**Call:** prove reusable seams before installing a hundred bodies or changing twenty spellbooks. Two spec-only
adapters now execute against the real combat/effect engine. They change no catalog entry, concordance, encounter
placement or generation pool, and they do not increase the fidelity census. The one engine extension is opt-in
per-strike numeric data on `WeaponProfile`; no live catalog assembler sets it yet.

### Creatures: the routine is the first small boundary

The full 440-record source pass now finds 215 records with more than one extracted strike, 143 with different attack bonuses
within their routine, and 28 with negative damage bonuses. A single fixed body attack bonus and automatic positive
Strength damage cannot express those routines faithfully: an ape's claws are +7 with +5 damage, while its bite is
+2 with +2 damage. A secondary attack is not universally "no Strength."

`test/support/srd-routine-prototype.ts` stages every numeric routine it can validate, preserving strike order,
count, dice, individual attack bonus and signed damage bonus. `src/rules/fighting.ts` accepts two optional weapon
profile fields:

- `attackBonus`: the individual ascending SRD bonus, converted to the engine's descending AC equation at the
  combatant's current rank. It overrides the body's single fixed bonus, not adds to it. Modifiers still apply.
- `damageBonus`: the signed source bonus, in place of automatic score damage, with a minimum of one before
  mitigation. Zero is a real override, not a missing value.

On that opt-in attack path a natural 20 hits even an otherwise unreachable AC; existing weapons retain their
previous behavior. Touch spells discard these *weapon* values rather than borrowing a claw's bonus. Criticals keep
Kyr's current policy: this prototype does not import the SRD's threat/confirmation/multiplier rules.

**Measured proof:** `test/srd-routine-prototype.test.ts` exercises **404 source bodies, 866 individual extracted strikes**,
including **142 bodies with different bonuses**. For every strike it checks all twenty attack rolls at four ACs
(5, 15, 25 and 60), three ranks (1, 7 and 20), forecast agreement, and minimum/maximum noncritical damage. It also
executes an ape's complete routine through `AttackRoutine` and `AbilityUse`, checking the three distinct attack
thresholds, one action, damage only on hits, and reproducible events.

**36 records are explicitly rejected:** 29 have no extracted routine and seven have an absent or nonpositive
Strength/Dexterity the current numeric adapter cannot accept. They are not filled with invented defaults. The test
prints their IDs and reasons. This includes extraction gaps, not necessarily missing SRD attacks: a balor's empty
routine is a reason to fix the source extraction, not proof that it has no weapon.

These are **404 numeric routine proofs, not 404 creature migrations**. The adapter does not construct persistent
creatures or implement their other scores, saves, HP, movement, defenses or special abilities. Its damage type is a
bludgeoning fixture placeholder, not a claim about the source. The structured attack extraction lacks the complete
attack-mode/damage-type contract, and source qualities and specials stay listed as blockers. Neither mapping
coverage nor the census is promoted by these tests.

**Smallest next implementation:** carry these per-strike values through an explicitly validated fixed-routine
catalog representation, `ItemCatalog` and creature projection; do not use shared weapon IDs as a substitute for
distinct strikes. Prove round-trip projection, worn-weapon overrides, a missed first strike followed by a hit, and
death interrupting the routine. Extend the census to compare every strike's bonus and full damage, rather than the
first hit chance and dice with bonuses stripped. Stage a complete, unplaced body with source attack modes and
defenses before adding any ecology row.

### Spells: a twenty-entry mechanism batch

`test/support/srd-energy-prototype.ts` and `test/srd-energy-prototype.test.ts` exercise:

- the five single cures and five single inflicts, including Minor Wounds;
- four mass cures and four mass inflicts;
- Acid Splash and Ray of Frost through ordinary `AbilityUse.perform`.

The shared family recipe uses each source's cleric level and school, the family's dice and caster-level cap, and
recipient nature rather than team to choose healing or harm. Harmful single touches run before resistance and a
Will save for half. Mass spells do not roll touches; each harmful recipient gets its own resistance/save, while
willing healing does not. The test checks all eighteen family members, all cap boundaries and one beyond, touch
hits and misses, successful and failed resistance, mixed living/undead recipients, deterministic replay and a single
slot spent for a mass cast. The two rays exercise real touch attacks, damage, cantrip slot behavior and absence of
unwanted save/status riders.

**Smallest next engine lift:** a recipient-local branch inside one effect invocation, and an engine-owned explicit
recipient selection contract. Current `when` reads the caster's values, `targetTrait` only filters positively, and
an effect that reaches nobody ends the sequential invocation. Consequently, placing a living heal and an undead
harm in successive effects is not a correct general cure implementation. The prototype chooses the one applicable
effect *before* calling the existing effect resolver; it does not introduce a parallel damage/save engine. Touch,
resistance, damage, healing, caster expressions and slots already exist.

The mass prototype validates distinct, present, standing recipients, at most one per caster level, close-range
distance, and the thirty-foot pairwise separation. It rejects invalid sets before spending a slot or changing HP;
the exact range/separation boundaries are also tested. Its positions are **spec-supplied feet**, not the game's
three combat zones. Its aggregate action's comma-separated target IDs are prototype evidence, not a new production
command protocol. A real selection belongs to the authoritative engine question and must survive clients/replay;
do not wire this adapter into a page or reinterpret all allies as the chosen subset.

**Still not exact migrated spells:** the recipes isolate the HP/target mechanism. They do not prove class-list
availability outside the cleric list, learning or prepared spell draws, hostile AI selection, material components,
holding a missed touch charge, unwilling recipients of a beneficial spell, dying targets, or all source prose.
Saves still use Kyr's existing saving procedure, including its fourth-success rule, rather than replacing the SRD
rules domain. Radiant/necrotic are explicit engine energy conversions. Source extracts for inherited variants can
omit their headers; the family rules here are explicit, not guessed from blank source fields.

### What stands between this and a hundred complete creatures

Of the 404 numeric candidates, **91 have no listed special attack**. Even these can have senses, traits, movement
and defenses that must affect play. So this pass does not justify a hundred complete imports with only the numeric
extension. The next shared contracts are prioritized by the actual source population, not a new catalog target:

| Shared contract | Candidate records affected | Smallest next proof |
| --- | ---: | --- |
| Source attack extraction | 29 rejected empty routines | Preserve melee/ranged/touch mode, count, individual bonus, full damage and critical data on a known missing weaponed creature; fail explicitly on unresolved alternate routines. |
| Perception/senses | 257 list darkvision 60 ft.; 157 low-light vision; 122 scent | A typed sense read by actual visibility/detection, with darkness, range and obstruction cases; do not add decorative trait labels. Check existing sight rules before extending them. |
| Coupled grapple state | 72 list improved grab; 30 constrict | An on-hit grab creates a relation between two creatures; escape, movement, permitted attacks, death and combat exit read/clear it consistently. Constriction occurs on the stated successful check, not every arbitrary attack. Prove a simple grabber before swallow-whole. |
| Attack riders and clocks | 54 have a special attack mentioning poison | Reuse the existing poison save/rider and delayed-dose mechanism, then prove exact per-dose timing, recovery and treatment. Missing onset is not the general blocker; source-specific values and conversion policies are. |
| Innate casting contract | 60 list spell-like abilities | Parse the actual named abilities, caster level, per-day limits, DC and resistance policy; run them through the ordinary invocation path with no unintended class slots. A label alone supplies none of this. |
| Movement-linked attack routines | 18 pounce; 19 rake | A legal charge/pounce establishes the movement/engagement state that permits a full routine; rake is enabled only by its stated condition. Prove legality, forecast and resolution together. |

Counts overlap and are over numeric candidates only. Sense counts use the normalized exact source labels; poison,
grab, constrict, pounce and rake counts use case-insensitive mentions in each record's special-attack list. They
are estimates of **shared obligations**, not disjoint completed batches or a guarantee that one helper retires every
listed record. Existing typed defenses and spell resistance should be reused, with each source's immunity,
reduction bypass and regeneration behavior proved separately.

**Recommendation to the main builder:** land the per-strike boundary independently of placement, then make the
recipient-local branching and selection contract a rules/player slice. These are bounded lifts, not an Augury-sized
world system. Sense and grapple contracts are the next high-leverage creature work. Do not globally replace the
placed spiders, boars or ghouls to make the count reach a hundred.

Reproduce the mechanism proofs:

```sh
bun test test/srd-routine-prototype.test.ts test/srd-energy-prototype.test.ts
```

No world walk or installed-encounter balance measure is claimed for these uninstalled prototypes.

**Local evidence:** the final fast gate passed (2,053 tests), the small gate passed (999), and the focused prototype,
fixed-stat, touch, forecast, concealment and resistance specs passed (38). The first fast run caught one new deep
language import in the prototype; it now uses Kyr's public type entry and the ratchet passes unchanged. Handbook
generation was directed to session artifacts to avoid carrying unrelated generated drift; it still reports the
four previously noted unreachable ancestry traits. CI and playable placement acceptance remain outstanding.
