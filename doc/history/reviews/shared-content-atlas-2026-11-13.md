# Shared content migration atlas

**Reviewed:** 13 November 2026  
**Scope:** `data/catalog`, `data/generation`, their resolved canon, the Orsino inventory, and the Revised 3.5 SRD
concordance. This is a migration atlas, not a claim of rules or licence compliance.

## Executive map

There are two different migrations hiding under “SRD compliance”. The Orsino migration is nearly complete as an
inventory: 1,614 of 2,651 source entries are integrated, 174 represented, 745 deliberately reference-only, and 118
blocked. The SRD migration is early: no placed encounter is faithful; none of the 119 concordanced spells is exact in
all seven measured fields; and there is no SRD item corpus or item concordance at all.

The highest-value early work is therefore not bulk import. It is:

1. finish small shared-content holes which already affect creation and provisioning;
2. migrate the spells already one or two data fields from the SRD;
3. introduce SRD creature *variants* for the common generated animals and undead, without replacing their balanced
   Orsino kinds in place;
4. add one small reusable rule only when it unlocks several named targets;
5. build an item concordance before making any percentage claim about SRD equipment.

### Readiness scale

| Mark | Meaning | Expected work |
|---|---|---|
| **A** | data-only | one or a few catalog records plus focused fidelity tests |
| **B** | composition | existing primitives, but several records or generation/placement wiring |
| **C** | small rule | one reusable schema/runtime addition with events and tests |
| **D** | subsystem | persistent/world state, projections, targeting, or action-economy work |

## Migration waves

### Wave 0 — close misleading inventory gaps

These are small, player-visible, and should precede claims about broader coverage.

| Target | Readiness | Why early | Work and acceptance |
|---|---:|---|---|
| `gear:rations` | A | the only Orsino equipment entry with no Kyr definition; already named by the ranger kit | add the shared item, source record and ordinary provisioning meaning; it is found by catalog and treasure tests |
| monk `alms_bowl` | A/policy | named by Orsino's class kit but absent from Orsino's own gear corpus | either add a declared Kyr repair or explicitly omit/substitute it; do not leave a dangling kit reference |
| seven class starting kits | B | all seven classes are only “represented”; most named kinds already exist | grant the catalogued gear at creation, validate every reference, and test exact per-class contents |
| class gold policy | A/policy | every class differs for the same reason | record background-only coin as an adaptation, or import class gold; stop reporting it as an accidental omission |
| consumable proficiency | C or omit | every class differs, but it has little present play value | either attach/check a source item kind on use, or explicitly reject this Orsino rule; do not add inert metadata |

`torch`, `spellbook`, `holy_symbol`, `musical_instrument`, `robe`, and `rations` are already named by classes; all but
`rations` exist as Kyr items. The old inventory wording “starting kit … is not catalogued” now conflates missing items
with missing kit assembly and should be corrected when the inventory generator is next touched.

### Wave 1 — spells one measured field away

These have executable effects and only one of the seven census fields differs. They are the cheapest credible SRD
fidelity gains. “Exact” here is the census's Westernesse conversion, not textual identity.

| Spell | Readiness | Remaining mismatch | Recommendation |
|---|---:|---|---|
| `magic_missile` | A | damage scaling | highest value: iconic, low-level, and no save/area/lifecycle dependency; declare projectile/caster scaling |
| `charm` | A | duration | use the existing executable allegiance change; choose and document the long-duration conversion |
| `mirror_image` | A | duration | retain the existing executable condition and adopt the conversion policy |
| `paralyzing_touch` | A | duration | already has the right level, school, save, target and condition; useful to ghoul work |
| `augury` | A/B | duration | numerically close, but verify that its actual play procedure reveals a typed fact before calling it migrated |
| `flesh_to_stone` | A/B | duration | combat condition is close; decide whether permanence beyond battle is required for the milestone |
| `prismatic_spray` | A | spell level | cheap census win, but low early-play value; do after the low-level list |

Order within the wave: `magic_missile`, `charm`, `mirror_image`, `paralyzing_touch`; then the others. A spell is not
accepted merely because the seven cells turn green: its command must be offered in the intended context, its event
trace must explain the result, and save/reload must preserve any consequence claimed to outlast combat.

### Wave 2 — simple harm, healing and save-negates spells

These need two or three catalog changes and use mechanics already present. Most are better value than adding absent
high-level names.

| Group | Targets | Readiness | Common work |
|---|---|---:|---|
| rays/touch | `ray_of_frost`, `shocking_grasp`, `acid_arrow` | A, except faithful ray attacks | level and scaling; `acid_arrow` also needs repeated harm/duration; defer attack-roll fidelity until the unified pipeline |
| elemental harm | `burning_hands`, `fireball`, `cone_of_cold` | A | spell level, capped caster scaling, Reflex/Dexterity half; areas already map to zones |
| restoration | `cure`, `cure_minor`, `cure_moderate`, `cure_serious`, `cure_critical` | A | levels, school, capped `+level`, and the explicit undead/save policy |
| disabling | `cause_blindness`, `hold_person`, `sleep`, `silence` | A/B | level plus a common long-duration conversion; verify their conditions are executable and defining |
| death/recovery | `raise_dead`, `resurrect`, `finger_of_death`, `harm` | A/B | mostly level/school/dice/save; decide persistent death costs and post-combat consequences before claiming full fidelity |

The enabling data feature with the best return is a declared scaling expression/profile: dice per caster level, a cap,
and capped flat `+level`. The runtime can evaluate level expressions now; the migration needs a single reviewed policy
so authors do not hand-invent 119 conversions.

Do **not** start with `lightning_bolt`, `chain_lightning`, `blade_barrier`, or `cloudkill`: their apparent damage-table
similarity hides line/secondary targeting, persistent areas, or empty unsupported effects. `fireball` and
`burning_hands` prove the simpler area/scaling path first.

### Wave 3 — common generated creatures as opt-in SRD variants

Demand is the number of hostile groups in the kept a1 placement plus six generated-country samples. Existing base
kinds must not be replaced in place: the ghoul experiment proved that faithful numbers can invalidate authored
fights. Add an unplaced or explicitly drawn variation, measure it, then review placements.

| Candidate | Demand | Readiness | Why / migration boundary |
|---|---:|---:|---|
| `spider/great/cave` | 38 | B/C | attack already matches; author fixed Hit Dice, AC and saves, then add poison as a natural attack rider if the chosen SRD block needs it |
| `rat` | 35 | B | attack and defenses match; fixed stat block plus AC/saves gives a high-frequency, low-special-case proof |
| `wolf` | 19 | B/C | attack matches; fixed block first, trip later if held/prone is not yet available |
| `bat` | 16 | B | simple fixed block, though the SRD bat has no damaging attack; check whether a noncombat animal belongs in hostile ecology |
| `hound` | 10 | B | simple fixed dog/riding-dog analogue; clarify which source block the setting intends |
| `boar` | 7 | B/C | attack already matches; ferocity can be a later lifecycle rule rather than blocking the stat block |
| `bear` | 6 | B/C | common natural routine; defer improved grab until a reusable held rule exists |
| `wraith` | 5 | B/C | attack and defenses match; valuable undead slice, but incorporeality and level drain must be reviewed as defining semantics |

`ghoul` (demand 61) and `zombie` (46) are higher-frequency but poor *first* replacements. The existing ghoul is an
Orsino encounter chassis; `ghoul/barrow` already provides the opt-in SRD direction and still differs in AC, claws,
specials and saves. Zombie needs typed slashing DR as well as fixed stats. Finish the barrow variant and place it
deliberately rather than changing the base ghoul.

Defer mummy despite demand 12: its recognisable identity includes despair and mummy rot, and the placed level-12
mummy is also the clearest example of encounter rank, Hit Dice and damage scale being conflated.

Every creature slice must pass four gates:

1. exact or explicitly converted stat-block fields in the census;
2. a fresh challenge measure with at least 48 fights per tested level;
3. generation samples showing where it enters ecology;
4. replay of each authored placement whose resolved kind changes.

### Wave 4 — easy ancestry content

Eleven Orsino ancestries are blocked only because no Kyr row translates them, while the inventory says all of their
features are executable: `bugbear`, `draconic`, `duergar`, `giant`, `gnoll`, `insectoid`, `kobold`, `ogre`, `orc`,
`tiefling`, and `troll`.

This is A/B work, but should be split by actual use:

1. ancestries already emitted as people or required by formations;
2. ancestries needed for an SRD creature/NPC variant;
3. player-facing options only after names, portraits, class combinations and creation text exist.

Do not equate “mechanically translatable” with “playable ancestry”. A non-player people row can close generation and
formation gaps without broadening character creation.

### Wave 5 — small reusable rules with several beneficiaries

| Rule | Readiness | Immediate beneficiaries | Boundary |
|---|---:|---|---|
| capped spell scaling | C | missiles, elemental harm, cures, rays | one declarative representation, census reads it, no bespoke per-spell code |
| field `createItem` procedure | C | `goodberry`, `create_poison`, relevant scrolls/wands | creates ordinary inventory, observes pack/use/expiry rules, survives save/reload |
| unified attack → save → resistance pipeline | C/D | rays, `disintegrate`, spell resistance, `dispel_magic`, turning rings | one roll per declared stage and a typed event for every result |
| condition lifecycle/source dependency | C/D | concentration, domination, sustained auras, antimagic | source identity, expiry/suppression and clock semantics live on the condition instance |
| held/grab and multi-hit riders | C | bear, crocodile, wolf trip, rend creatures | legal targeting and release; no narration-only grab |
| world reveal/location procedure | C | `augury`, divinations, `dun_rierdan_waystone` | reveals typed known facts without leaking unavailable information |

The first two are reasonably bounded. The pipeline and lifecycle rules are the point where “easy-to-model” ends and
a rules increment begins.

## Items atlas

### Unblocked or policy-only

| Target | Status | Next move |
|---|---|---|
| `rations` | absent Kyr translation | add now; one source item, ordinary field use |
| `alms_bowl` | dangling source reference | explicit Kyr repair or explicit kit substitution |
| class kits | catalog kinds mostly exist | assemble and grant; validate exact references |
| torch | represented, different duration semantics | declare the adaptation; its current one-hour `torchlit` use is meaningful even if Orsino's depletion model differs |

### Blocked by the item’s payload, not its shell

| Items | Blocker | Migrate with |
|---|---|---|
| `scroll_of_shapechange`, `wand_of_polymorph` | transformation is not executable | reversible transformation projection |
| `deck_of_multiplicity`, `wand_of_wonder` | random `use` payload is not executable | reviewed random/cycle item procedure and every possible outcome |
| `ring_of_perfect_turning`, `ring_of_spell_turning` | spell reflection/save hooks | unified spell pipeline |
| `dun_rierdan_waystone` | location revelation | typed world reveal procedure |

Silvered weapons are mechanically understood—the bypass tag works—but not a catalog-only migration. A silver blade
would enter loot and markets through value/make rules. It needs an economy and generation decision about availability,
then a generation regression, before it should be added.

### Missing measurement

No `data/sources/srd35/items.json` or item section in `concordance.json` exists. Build it before importing a broad item
list. At minimum record source id, Kyr id, category, price conversion, mass/capacity, attack or armour statistics,
charges/consumption, granted ability, and whether its defining use is executable. Report shell coverage separately
from payload coverage: a wand row with an uncastable spell is represented, not integrated.

## Generator atlas

The following Orsino tables are deliberate references, not accidental omissions: 100 room decorations, 100 trap
rolls, 80 wonder rolls, 25 templates, 10 terrain rolls, 9 room overlays and 4 room sequences. Kyr generates these
concepts through terrain construction, work plans and runnable trap/wonder pools. Porting their rows literally would
create two competing generators.

The valuable migration targets are instead the seams where shared catalog fidelity changes generated play:

| Seam | Present risk | Early target |
|---|---|---|
| ecology → creature kind | faithful variants may silently replace balanced bodies | make SRD variants opt-in and visible in table rows |
| challenge → encounter composition | current measures were made under changing wound rules and low samples | remeasure affected kinds at 48+ fights per level before changing weights |
| class/background → starting gear | rows name kinds but creation does not grant source kits | validate and assemble class kits from canonical item ids |
| shops/loot → new item | a catalog row can alter every generated market or hoard | require a reachability diff for each new shared item |
| wonders/traps → ability | shell may be drawn although payload is unsupported | draw only abilities/items executable in the context; keep the honesty ratchet |
| ancestry → peoples/formations | a translated ancestry can broaden generated populations | add generation weights deliberately; do not infer them from catalog presence |

## Explicit deferrals

The following are poor early migration targets even when their names are prominent:

- `polymorph`, `shapechange`: require reversible projection of statistics, attacks, equipment and actions;
- `time_stop`: changes action economy and targetability;
- `plane_shift`, `knock`, broad divinations: require typed campaign/world procedures;
- `dispel_magic`, spell turning and spell resistance: require the unified resolution pipeline;
- persistent walls, clouds and `blade_barrier`: require placed, lasting areas and movement interaction;
- `chain_lightning`: needs secondary target selection and a real executable effect, not merely corrected dice;
- high-level outsiders and dragons: their full attacks, defenses, spell-like abilities and encounter envelopes make
  them poor proofs of the basic conversion profile;
- bulk import of the roughly 486 SRD spell records without a concordanced Kyr counterpart: first complete the
  executable 119-name surface and decide which absent spells the setting actually needs.

## Where the present census is not yet enough

The fidelity report is valuable, but its seven spell fields and six creature fields are an intentionally narrow
projection. A green row is evidence about those fields only. It is not yet a sufficient definition of “SRD-faithful”.

### Spell blind spots

The census does **not** currently compare:

- save or spell DC values, only save category and half/negates outcome;
- attack rolls, touch attacks, critical behaviour, or whether a spell should require an attack at all;
- spell resistance applicability or caster-level checks;
- components, casting time, preparation/list membership, domains, or material/XP costs;
- exact target eligibility, willingness, creature/HD limits, object targeting, or target allocation;
- exact shape, range or distance—reach is reduced to self/one/many;
- concentration, dismissibility, suppression, dispelling, or the source of a lasting effect;
- non-damage clauses beside the one harm/heal effect selected by the report;
- world persistence and save/reload behaviour.

The damage comparison also compares expected means at four levels. Two different distributions can have the same
mean, and a spell with several projectiles or conditional dice may look closer than it plays. School is easy metadata
and currently has little mechanical consequence; it should not carry the same confidence as correct targeting or
resolution.

The 119-entry concordance is curated, not exhaustive or self-evident. Some mappings deliberately match an Orsino
analogue to the nearest SRD name (`armor` to Mage Armor, `paralyzing_touch` to Ghoul Touch). Concordance review and
mechanical fidelity are separate decisions. The other roughly 486 SRD spell records are not necessarily “missing
Kyr spells”: many may be out of setting, duplicate list variants, or require a subsystem Kyrie does not want.

### Creature blind spots

The creature census compares natural attack dice but not attack bonuses, Strength bonuses, criticals, reach, size or
expected hit rate. It compares the three save bonuses but currently derives Kyr's from level and scores, which makes
fixed SRD stat blocks structurally unlikely to match. Specials are counted only where the concordance explicitly says
what the conversion carries; an incomplete `carries` record can make absence look like a deliberate omission.

It also does not compare initiative, speed/movement modes, senses, skills, feats, spell-like ability DCs, spell lists,
CR, treasure, advancement or expected damage per round. Several of those should remain Westernesse conversions, but
the conversion must be named rather than silently falling outside the score.

### A better confidence label

For migration reviews, report three grades rather than one “faithful” bit:

1. **structural:** source, level/HD, school/type and catalog references;
2. **resolution:** legal targets, rolls, saves/DC, resistance, harm, conditions and expiry;
3. **play identity:** the two or three behaviours which make the entry recognisable, plus its encounter/world test.

An entry is migration-complete only when all three have a verdict. The existing field census remains the structural
and partial-resolution instrument; it need not expand into a complete 3.5 simulator.

## Narrow engine changes ranked by content leverage

The source corpus gives a useful upper bound on leverage. Among the 119 mapped spells, 17 have level-scaled damage or
healing, 11 have a cap, 46 have a per-level duration, 68 permit spell resistance, 58 specify a Fortitude/Reflex/Will
save, 23 are area-like, 30 have touch range, and 6 target objects. Among 70 mapped creatures, 26 have multiattack,
50 have special attacks, 15 have damage reduction, 8 have spell resistance and none currently has exact saves in the
census. These counts overlap; they are not promises that one feature completes every entry.

| Rank | Narrow addition | Direct leverage | Why it is genuinely bounded / caveat |
|---:|---|---|---|
| 1 | fixed `saves` on fixed-stat species/variations | potentially all 70 concordanced creature blocks; saves are presently 0/70 exact | three authored bonuses used only when a body has source Hit Dice; avoids importing creature-type BAB/save progression. Must also stop procedural level from double-adding |
| 2 | `castingLevel` distinct from encounter/character level | foundation for 17 scaling harms, 11 caps, 46 level durations, dispel and SR | initially derives from effective class level, but becomes one named input. Small context change; large content review |
| 3 | typed capped/scaled `Amount` and duration | direct authoring path for those 17/11/46 spells | arithmetic is already expressible with `#level`; the unlock is validation, rounding, presentation and consistency, not raw execution. Do not build a second expression engine |
| 4 | authored spell/save DC policy | affects 58 mapped saving-throw spells and many monster riders | current census ignores DC entirely. A narrow spell DC formula and fixed innate DC cover much more honestly than copying Orsino's `15 + #level` expressions |
| 5 | source/magic metadata retained on applied conditions | prerequisite for dispel, suppression, concentration and spell interactions | add ability id, caster id/level and magic tags to the existing condition instance/event; useful even before full dispel exists |
| 6 | `createItem` field procedure | immediately unblocks Goodberry, Create Poison and later item-producing abilities | campaign already has canonical items and custody. Needs count, lifetime, ordinary pack insertion and save/reload; no general scripting language |
| 7 | typed `reveal`/`pointTo` field procedure | augury/divinations and the waystone | resolve only facts/places the world already knows; one operation can serve spells and items without exposing hidden ids in labels |
| 8 | object target kind | six mapped spells plus Knock/wards and item interactions | add canonical field objects/passages separately from fighter targets. It does not require arbitrary geometric points |
| 9 | `line` on the existing rank topology | Lightning Bolt and line breaths | much smaller than grid geometry: a line crosses ranks and catches friend or foe. Persistent walls/clouds remain separate work |
| 10 | chosen target maximum and willing/hostile filter | Haste, multi-creature buffs and many “up to N” spells | command construction already enumerates candidates. UI/AI selection and stable recipient ids are the real work |

### Two especially attractive creature fields

Fixed source saves should be considered together with a fixed `attackBonus` or attack mode on a fixed-stat body. The
current fidelity report does not measure attack bonus, so merely making saves exact could improve the headline while
leaving hit probability wrong. These fields should override procedural progression only on an explicitly fixed SRD
variant; ordinary Orsino creatures continue to grow by Westernesse level.

Natural armour is also narrow and honest, but lower numerical leverage: armour already matches 3 of 70 and can be
made numerically close with a worn-shell surrogate. Its value is semantic—disarm, equipment removal and narration
stop treating hide/scales as worn gear—not the census count. Add it when the first migrated body actually exposes
that distinction rather than as a speculative field.

### Narrow changes which look broader than they are

- **Spell resistance** touches 68 mapped spells and 8 mapped monsters, but is not a single defense number. Correct SR
  needs a spell tag, caster level, one check in an ordered pipeline, bypass rules and an event. Build the metadata and
  pipeline first; do not add an inert `sr` field.
- **Concentration** appears on only 6 mapped spells in the extracted source, but source-dependent lifecycle also
  serves domination, auras, antimagic and suppression. Its value is qualitative, not row count.
- **Touch range** occurs on 30 mapped spells, but friendly healing touch is not an attack. An `attackMode` belongs on
  the spell/effect, not inferred from range.
- **Area support** is not one feature. A one-shot line is narrow; a persistent cloud or wall requires a placed area,
  movement triggers, duration and save/reload.
- **HD-budget targeting** would make Sleep and related spells more recognisable, but Westernesse level is not SRD Hit
  Dice for ordinary people. It needs an explicit conversion label and should follow, not precede, simpler target caps.

## Revised engine/content sequence

The narrowest useful sequence is now:

1. improve the audit first: save/DC and attack-mode columns, plus the three confidence grades above;
2. add fixed source saves (and, if needed by the slice, attack bonus) only to fixed-stat variants;
3. add `castingLevel` and a typed/validated cap over the existing amount evaluator;
4. migrate the Wave 1 and simple harm/heal spells, now including DC in acceptance;
5. retain source/magic metadata on conditions, then build the ordered spell pipeline and SR;
6. add `createItem`, `reveal/pointTo` and object targets as three small field operations;
7. add line and bounded chosen-target selectors before persistent areas;
8. take lifecycle/concentration, held/grab and transformations only with a placed target that proves each rule.

This order deliberately separates narrow data-shape improvements from systems which change action economy or world
state. It should unlock a useful low-level SRD surface before Kyrie attempts the spectacular edge cases.

## First bounded migration package

A useful first package is small enough to review as one content migration:

1. `rations`; an explicit `alms_bowl` decision; exact class-kit reference validation;
2. audit columns for save/DC and attack mode; fixed source saves for one fixed-stat creature variant;
3. `castingLevel` plus a declared capped spell-scaling representation and conversion note;
4. `magic_missile`, `charm`, `mirror_image`, `paralyzing_touch`, `ray_of_frost`, `shocking_grasp`,
   `burning_hands`, `fireball`, `cone_of_cold`, and the five cure spells;
5. one unplaced fixed-stat animal variant (`rat` is the cleanest), with authored saves and a 48-sample challenge measure;
6. an item-concordance schema and an initial census of mundane arms, armour and adventuring gear—no magic-item
   payload migration yet.

Success is not a larger row count. It is: every migrated entry executable; every departure recorded; the fidelity
census improved for the promised fields; generated reachability reviewed; no unsupported-ledger growth; and no
existing encounter changed without a placement-specific fight.

## Evidence and reproducibility

Primary generated evidence:

- `doc/architecture/mission-21/rules/srd-fidelity.md` — field-by-field spell and creature census, weighted by play;
- `doc/architecture/orsino-inventory.md` and `data/sources/orsino/inventory.json` — destination and blocker census;
- `doc/architecture/orsino-coverage.md` — feasibility and unsupported-feature census;
- `data/sources/srd35/encounters.json` — kept placement/generation demand sample;
- `data/sources/srd35/{spells,monsters,concordance}.json` — source values and mappings.

Review verification on 13 November: 31 focused tests passed across SRD fidelity/envelope, Orsino inventory/current
catalog, item catalog, honest catalog, creature generation and authorable generation (1,377 expectations, no failure).
