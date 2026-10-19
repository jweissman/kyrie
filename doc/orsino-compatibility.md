# Orsino corpus: inventory and explicit compatibility boundary

Inspected the actual local Orsino source at revision `4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3`, including `settings/fantasy`, `src/orsino/{Ability,Status,Combat,Trait,Generator,Template,Inventory}.ts`, `src/orsino/rules/{Commands,Fighting,CharacterRecord}.ts`, `src/orsino/types/{SaveKind,DamageKind}.ts` and `src/deem/stdlib.ts`. Counts describe this checkout, not the website's current publication. No whole-corpus conversion was performed.

## Upstream verification — 18 October 2026

Verified the intended local checkout `/home/jweissman/work/orsino` and upstream refs, rather than assuming the previous inventory was current. Local main and upstream HEAD remain `4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3`. The newest available review branch, `claude/code-review-feedback-xmObx`, is `7b76ce37d4081620b536bfecdd48e8cb7a58d97d`; its only difference from main is an added `package-lock.json`. There are **no material corpus/rules changes** from the previous audit. Both revisions were inspected using an isolated bare checkout; the user's Orsino working tree was untouched.

Rechecked character generation, classes/ancestries, traits, equipment, spell/status execution, save mappings, combat and recovery in the implementation. Important boundaries:

- Orsino `Fighting.statMod` uses `Math.round((score - 10) / 2)`. Kyr currently retains its pinned `/3` rule. This is a deliberate ruleset divergence, not a faithful port.
- Orsino has category saves (death, poison, disease, breath, stun, bleed, fortitude, magic, will, fear, charm, sleep, paralyze, insanity, reflex), associated attributes and further modifiers/immunities. Kyr's six attribute saves do not reproduce that system.
- Signed fractional damage resistance before flat reduction is reused for the supported subset. Automatic hits and flat armor are adaptations; Orsino AC/proficiency/hit resolution is unsupported.
- Orsino's three-ancestry Fellowship grants +5 examine/search/gather-information. Kyr's institutional passage benefit is an adaptation. Ranger wildlife approach is not Orsino's Natural Bond extra companion.
- Recovery is not uniform even within Orsino: `Dungeoneer.rest` includes a 30% encounter chance and system-shock stabilization of unconscious, non-dead characters; `ModuleRunner` checkpoints have separate dry-path restoration and slot/effect resets. Kyr's safe six-hour ration-based HP/mana recovery is an adaptation. It never revives, preserves poison, and does not claim those Orsino rest semantics.

### Newly executable representative material

| Feature | Classification | Implemented evidence / remaining gap |
|---|---|---|
| Named ancestry/class party creation | Adaptation | Existing compositional creature constructor; raw scores preserved; no full Orsino restrictions or advancement |
| Healing/removing poison in the field | Shared supported semantics | Same ability executor and canonical projection/commit as battle; only bounded safe ally effects exposed |
| Permanent learned fire invocation | Kyr-native content | Actual consumed seal, learned ability and mana/cooldown rules; not an Orsino spell port |
| Altered frost wolf | Kyr-native composite | Cold damage, Con-save weakening, Wis-save stun, physical/cold resistance and fire vulnerability; not a flattened generic attack |
| Recovery and useful second expedition | Adaptation | Rest advances NPCs/deadlines; dead companion stays dead; fire reward matters against wolf |
| Equipment, feats/perks, triggered party traits, planes | Unsupported | No claim of compatibility from inventory alone |

## Inventory

| Source | Definitions | Reusable material |
|---|---:|---|
| `settings/fantasy/templates.json` | 25 templates | pc, animal, monster, dragon, equipment, loot, settlement/site composition |
| `settings/fantasy/tables.json` | 87 tables | 7 class records, 25 ancestry records, 215 backgrounds/perks, 44 animal kinds, 10 monster groups, 10 planar modifiers |
| `settings/fantasy/traits.json` | 100 | 16 party, 14 racial, 10 feat, 20 template, 8 elemental, 9 school, 9 character, 12 domain, 2 divine |
| `settings/fantasy/abilities.json` | 57 | ordinary actions, weapon styles and other non-spell abilities |
| `settings/fantasy/abilities/arcane.json` | 131 | arcane effects, conditions, summons, defensive/casting interactions |
| `settings/fantasy/abilities/divine.json` | 154 | divine damage/healing, domains, turning and other effects |
| `settings/fantasy/statuses.json` | 141 | modifiers, immunities, saves, reactions, duration/expiry behavior |
| `settings/fantasy/tables/items.json` | 10 tables | weapons, armor, gear, consumables, treasure, gems, shops |

These are definition counts, not claims that all entries are independently executable or balanced. The schemas overlap and names can be overridden during composition.

The actual `pc` template selects context-constrained race/class/background, overlays modifiers and composes equipment; `animal` applies a kind overlay and contextual aspects; `monster` composes type, stat base, rank, abilities and natural equipment. This supports continuing Kyr's one creature-construction path with content tables. It does not justify copying their full algorithms into separate goblin/wolf constructors. Kyr's new party selection likewise composes party entries with site inhabitants and preserves generated results.

## Representative coverage

“Existing” means Kyr already executes a related mechanic; “adapted” means deliberate different semantics. Neither means drop-in source compatibility.

| Corpus example | Kyr evidence now | Exact gap |
|---|---|---|
| Warrior/cleric/mage/ranger class records | shared DEEM creature construction; ranger added; two real parties | hit dice, proficiency, spell-slot and full progression systems differ |
| Human/elf/dwarf `racialModifier` | ancestry/class choices, canonical identity, three-ancestry capability | Orsino racial stat modifiers, restrictions and traits are unported |
| `backgroundModifier.explorer`, `pathfinder` | inventory audited | perk stat/gear grants unimplemented |
| `natural_bond` feat | inventory audited; ranger can approach receptive wildlife | original grants **one extra animal summon**, not pacification; not ported |
| `skald` feat | inventory audited | class/level constraints, incompatibilities, granted songs and combat-start cast unimplemented |
| `masterArmor.leather`, weapon proficiency | inventory audited | equipment ownership, slots, proficiency, AC and weapon damage not ported; Kyr ward is flat reduction, not AC |
| Divine `sunmark` | new **Dawn spark** is a Kyr radiant spell | original Sunmark is 1d3 plus `sunmarked`; it is deliberately **not** called Sunmark here |
| `sunmarked` status | inventory audited | original magic-save penalty, fire/radiant vulnerability and on-attacked radiant reaction unported |
| Drain/healing/resurrection effect families | existing effect/lifecycle tests verify clamping, actual loss, death and resource commitment | target/cost/save/trigger details of each individual spell still need mapping |
| Sleep and other saves | actual d20 + statMod vs DC, event shows die/stat/modifier | Orsino has 15 save categories including sleep, poison, death, reflex and fortitude; Kyr has six attribute saves |
| Typed resistances/vulnerabilities | new innate race fractions; weapon-resistant warden, radiant/fire vulnerability | no aggregation from equipment/statuses/planes, no physical subtypes, immunities or reflect effects |
| Wildlife `animalKind.wolf` | Kyr wolf now uses save-resisted persistent bleeding bite; feed/approach/pass | Orsino animal stat overlays, aspects, bodies, weapons and companion summoning are not imported |
| Monster type/traits/abilities | Kyr warden drains, wards, sleeps, resists weapons; alternate entry or oath | authored representative creature, not an Orsino monster port; no CR/rank/aspect generation |
| `fellowship` party trait | same human/elf/dwarf requirement; canonical membership grants local institutional access | original grants +5 examine/search/gather-information, not access; Kyr adaptation explicitly stated |
| `hordeling` party trait | inventory audited | on-kill buff and multiset formation runtime unported |
| `planeModifiers.Arcadia` | inventory audited | spell DC +1, duration ×1.2 and bonus slots unported; Orra pollution is an ordinary world process, not planar compatibility |

## A newly observed ruleset difference

The current Orsino `Fighting.statMod` is `Math.round((score - 10) / 2)`. Kyr retains the previously reviewed `Math.round((score - 10) / 3)`, shared by its own generation and runtime. At score 18 these produce +4 and +3. The older attribute audit described a different Orsino version; it must not be read as evidence of current exact compatibility. This increment deliberately does not migrate existing creatures, golden histories or all damage/DC/HP calculations. Selecting a new modifier convention requires an explicit ruleset/content migration decision.

## Shared model, implemented subset and smallest next step

Continue using the existing parsed effect union, DEEM expression runtime, canonical CreatureStore, Battle executor and ordinary world action schemas. Innate resistance is now race data read during resolution, without cached fighter-specific copies. `Commands.damage` in Orsino applies signed fractional resistance with floor rounding before flat reduction; Kyr now preserves that ordering. Its armor still means flat mitigation, whereas Orsino AC affects hitting. The compatibility test verifies fixed physical/fire/radiant/poison amounts and observable modifiers, not just successful parsing.

For future equipment/feat/perk/plane coverage, use attachments that **grant** effects, capabilities and modifiers to canonical entities; compute derived values with source provenance. Durations must identify encounter turns versus persistent/world recovery. Reactions should eventually subscribe to existing typed events and execute the same effect union, with ordering and recursion limits specified first. This is a proposed boundary, **not an implemented attachment or trigger system**.

Field use must select an actual persistent caster and target and share cost/target/effect resolution with Battle. Current ranger affinity is a world capability; it does not prove that arbitrary combat spells work in exploration. A member-targeted healing/rest reward is the smallest useful experiment before expanding the corpus. Category saves and AC conversion require a ruleset decision; silently mapping every Orsino save to wisdom would destroy mechanical distinctions.

Focused executable evidence is in `test/orsino-compatibility.test.ts`, `test/orra.test.ts`, and the existing effects/creature lifecycle suites. Feats, perks, equipment, party reaction traits and planar effects remain explicit compatibility gaps, not passing placeholders.


For the expanded world-generation, treasure, religion, wonder, plane and ecology review, see [the Milestone A corpus audit](design/orsino-generative-audit.md). It rechecks the upstream revisions and proposes a source-independent effect stress suite; it does not claim additional ports were implemented.

## Serewater implementation boundary

The shared execution bridge now supports real owned/equipped item instances and source-tagged consumable/trap effects through the existing `AbilityUse`/`Effects` pipeline. The [Serewater report](serewater-campaign.md) and [playtest evidence](playtests/serewater/README.md) replace the previous “unsupported bridge” status for this bounded subset.

| Definition/pattern | Classification in this increment |
|---|---|
| Orsino `minor_healing_potion` | Faithful 2d4+2 heal amount and living ally/self use; Kyr price/ownership/consumption policy is adapted |
| Orsino `antidote` removeStatus `Poison` | Reused removal mechanic; explicit mapping to Kyr `poisoned`; no claim to preserve every Orsino poison category |
| Equipment-sourced modifiers | Implemented source-scoped slot attachments; flat armor/power/save bonuses are Kyr adaptations, **not** Orsino AC/proficiency |
| Trap effect arrays | Reused shared-effect pattern; Censer hazards add explicitly authored saves, physical/poison damage and persistent conditions; they are **not** faithful `poisoned_spikes` (2d6 piercing +1d6 poison) ports |
| Classes/ancestries/backgrounds | Canonical compositional generation; new ancestry techniques and three exploration backgrounds are Kyr adaptations |
| Mortuary Custodian, warded names lantern | Kyr-native content; not renamed mechanically flattened Orsino monsters/items |
| Party identities/religion/ecology | Bounded capability/permission/generation rules, not full Orsino party-trait, divine or planar parity |

World-time disease scheduling, general reactions, hit/AC/proficiency, spell slots, equipment durability/encumbrance, planar transitions and full progression remain unsupported. Permanent training is now an actual learned capability; stored XP alone is no longer the only advancement path in Serewater.
