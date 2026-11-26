# SRD catalog: friction

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
