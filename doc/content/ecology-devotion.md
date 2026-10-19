# Ecology, healing and devotion increment

Implemented shared definitions:

| Content | Executable semantics | Provenance |
|---|---|---|
| Luminous Touch | `Heal (1d2 + #level) health to ally.` Ally selection includes self. | Exact Orsino `abilities/divine.json:luminous_touch` amount and target domain. One mana is an explicit Kyr cost adaptation. |
| Cure Minor Wounds | `Heal (1d4) health to ally.` | Exact Orsino `cure_minor` amount. One mana is a Kyr adaptation. |
| Fireproof | A status supplies 0.5 fire resistance to the ordinary damage reducer. | Exact `statuses.json:fireproof` numerical resistance. Ten owner-combat-turn boundaries, persistent between encounters, are explicit Kyr duration policy. |
| Life cleric / Abjurer | Separate selectable class IDs with the above abilities. | Kyr chassis and spell selection, not wholesale Orsino class ports. Existing classes are unchanged. |
| Yarrow preparation | Finite item removes bleeding and heals 1d3; consumed atomically. | Kyr fantasy remedy. No claim of botanical medicine simulation. |
| Veyra's observance | Spend one ration, once per company/shrine, to grant a companion +2 saves for three owner-combat-turn boundaries. | Kyr original religion and effect. Not an Orsino deity, domain or blessing port. |

The source inspected is the actual Orsino checkout at `4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3`. It remains the upstream main revision previously audited. This increment does not claim another upstream revision or port unrelated save categories, hit rolls, triggers, temporary HP, initiative modifiers or animal stat blocks.

`Effects.context` now supplies level, so the scaling expression is evaluated by the same DEEM expression runtime as other ability amounts. Combat, field use, salves, hazards and shrine blessings still invoke `AbilityUse` and `Effects`; no ecology or religion effect interpreter was introduced. The shrine catalog maps stable deity identity to an ordinary ability definition. An unknown tradition rejects without committing.

Shrine and ward attachments retain the exact source ID. Refreshing the same source replaces its remaining duration; another source retains its separate attachment and clock. Identical status bonuses do not stack: +2 from two Veyra shrines remains +2. The stronger numerical resistance wins against racial resistance or other wards; this is an explicit bounded Kyr stacking rule. Travel and rest do not tick these durations. Existing statuses retain their old refresh policy. Removing a status, including antidotes, removes every source of that named status. Equipment exposes source-keyed attachment records while effective totals remain derived from canonical inventory; generated characteristics are never rewritten.

## Author-facing pieces

`data/rulesets/ecology.kyr` supplies identification and finite gathering. A source declares `habitatSpecies`, `signsOf`, an item at the site, its `itemKind`, and `harvestable`. A capable woodcraft companion can identify the signs, then collect the preparation through the same canonical acquire service as other objects. The existing receptive-wildlife action can use the same species context, but hostile animals do not become pacified just because the company has a ranger.

`data/ecology.json` records habitat constraints, visible signs, interactions and provenance for yarrow, alder, red deer, otter and grey wolf. `data/ecology/deem.templates.json` composes one independently drawn plant and animal through inherited biome context. Its tables weight riverbank species; they do not select a complete regional profile. The taxonomy is a construction palette, not a food-web simulation. Gathering never silently regrows a patch. Plant growth, weather, tracking movement, animal breeding and hunting yields are unsupported.

`data/rulesets/devotion.kyr` supplies one bounded observance rather than an open-ended prayer command. An author supplies an altar's location and `shrineOf(altar, veyra)`. The deity identity must be imported globally when modules are namespaced. Another shrine can reuse that identity without copying a deity definition or effect.

Remaining friction: a herb instance still needs both placement and item-kind facts; its species identity and the regional habitat must be bound during assembly. The type system does not yet automatically prove every ecology table entry belongs in the selected biome; deterministic corpus tests currently validate that invariant. The rules do not simulate unrestricted naturalism, divine intentions or general religious reputation.

## Evidence

`test/ecology-devotion.test.ts` checks exact healing rolls and mana costs, item consumption and cleansing, fire resistance from item and ability sources against the same seeded hazard, shrine refresh and nonstacking, save bonuses with equipment, projection persistence, and owner-turn duration consumption. `test/ecological-generation.test.ts` checks eighty generated habitat contexts, seed repeatability, species suitability and independent riverbank plant/animal variation. Existing item/effect and Orsino compatibility tests continue to pass.

## Historical save compatibility

The creature-fact projection now iterates only ability entities declared in the saved module. Adding a catalog ability previously caused `canTrain`, `canCast` or `treatable` facts referring to undeclared abilities to appear during restore, incorrectly rejecting valid historical saves. The correction respects the frozen module catalog; it does not accept arbitrary inconsistent creature state or regenerate fixtures.

The original `field_spell` action and existing recovery event source format are preserved. Prepared persistent wards use a separate `field_ward` schema in the new devotion library, still calling the common `invoke` resolver. This avoids changing the old healing action's requirements or giving healthy parties a new legacy healing-menu action.

The historical Serewater replay test now compares authoritative physical world facts, creature/inventory/base state, resources, NPC goals, pressures, outcomes and complete combat/event records. It excludes new catalog-derived projection facts (and matching event change lines) for abilities absent from the historical module. Whole compiled source and current presentation are deliberately excluded from cross-version comparison: both now contain additional definitions. Current-build checkpoint canonical equality remains strict, and browser/CLI canonical parity remains unchanged. A separate restore test checks frozen projection equality and verifies that a corrupted creature state still rejects. No recorded save or transcript was regenerated for this migration.
