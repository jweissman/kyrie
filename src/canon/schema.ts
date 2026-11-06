import type { Effect } from '../lang/parse';
import type { Modifiers } from '../rules/modifiers';
export type { Modifiers } from '../rules/modifiers';

// The canonical fantasy domain. Each family has one catalog in data/catalog; see doc/architecture/domain-model.md.
export type Attribute = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
export interface Source { orsino?: string; kyr?: true; fidelity?: 'faithful' | 'adapted'; notes?: string }
// Orsino mechanics an entry does not execute, keyed by the Orsino field, each with the reason.
export type Omissions = Record<string, string>;
// Status hooks: Orsino effect lists that run when the holder attacks, hits, is attacked or is missed.
export interface Hooks {
  onAttack?: Effect[]; onAttackHit?: Effect[]; onAttacked?: Effect[]; onMissReceived?: Effect[];
  // The holder's own moments: the fight beginning, this condition lapsing, its casting of an offensive spell.
  onCombatStart?: Effect[]; onExpire?: Effect[]; onOffensiveCasting?: Effect[]; onHeal?: Effect[];
  // Answers to what a creature on the other side does, by Orsino's key (onEnemyMelee, onEnemyAttack, onEnemyCasting).
  reactions?: Record<string, Effect[]>;
}
export type HookKey = Exclude<keyof Hooks, 'reactions'>;
export interface Condition {
  name: string; description: string; lifetime: 'persistent' | 'encounter'; modifiers: Modifiers; hooks?: Hooks;
  // Orsino's trigger: non-lethal damage of this kind makes the target save (DC 15) or gain the condition.
  trigger?: string;
  // The duration a triggered condition lasts (Orsino's status-level duration; abilities name their own).
  duration?: number;
  // The save category a debuff applying this condition uses when the ability names none.
  saveKind?: string;
  // A place's law, held by everyone in a fight there (a plane's): told once for the fight, not worn by each.
  law?: true;
  // Orsino's compelNextMove and forceTarget: the holder must use that ability, or target whoever applied it.
  compel?: string; forceTarget?: true;
  // Whoever applied it stands in front of its holder: a blow aimed at the holder strikes them instead.
  guard?: true;
  stacking?: 'source-refresh'; omits?: Omissions; unsupported?: Omissions; source?: Source;
  // A capability its holder brings to the company while it lasts (a lit torch brings light), and what is said
  // when it runs out.
  grants?: string[]; begins?: string; ends?: string;
  // What it grants it brings whether or not its holder is up: a conjured light hangs on over one who has fallen,
  // where a torch falls with them.
  unheld?: true;
}
export type TraitCategory = 'lineage' | 'nature' | 'affinity' | 'character' | 'feat' | 'party' | 'specialization' | 'calling';
// What happens when something occurs to a perk's holder: Orsino's onKill, onLevelUp and onOffensiveCasting.
export interface Triggers {
  onKill?: { gold?: string; experience?: string; status?: string }[];
  onLevelUp?: { maxHp: number }[];
  onOffensiveCasting?: { amount: string; damageType: string }[];
}
// Standing bonuses a perk gives outside the modifier vocabulary: longer statuses the holder applies, more gold from
// every source, extra finds when searching, more damage from one ability, sharper searching.
export interface Bonuses {
  spellDuration?: number; goldMultiplier?: number; loot?: number; abilityDamage?: Record<string, number>;
  search?: number;
}
// One of a trait's statuses (Orsino's trait.statuses): its modifiers, triggers and bonuses, and where or with what it
// holds (Orsino's whileEnvironment and condition.weapon).
export interface Perk {
  name: string; description: string; modifiers: Modifiers; triggers?: Triggers; bonuses?: Bonuses;
  environment?: string; weapon?: { type?: string; weight?: string };
}
export interface Trait {
  name: string; category: TraitCategory; description?: string; modifiers: Modifiers;
  requires?: { ancestry?: string; class?: string; classes?: string[]; level?: number; ancestries?: string[];
    // A party trait's formation: the classes, or the ancestries, a company must count among its members.
    company?: { classes?: string[]; ancestries?: string[] } };
  // The trait's statuses, when any is conditional or does more than modify (a party trait always lists them).
  perks?: Perk[];
  // Traits a creature holding this one may not also take (Orsino's incompatibleWith: a knight is no barbarian).
  excludes?: string[];
  spellAccess?: { tradition: 'arcane' | 'divine'; school?: string; domain?: string };
  grants?: { abilities?: string[] }; omits?: Omissions; unsupported?: Omissions; source: Source;
}
export type AbilityKind = 'technique' | 'spell' | 'natural';
export interface Ability {
  name: string; kind: AbilityKind; description?: string; effect?: string; effects?: Effect[];
  // A spell spends one slot; Kyr techniques may still cost mana where they are Kyr's own.
  cost?: number; recharge?: number;
  // A big blow a creature must wind up for a turn first ("rears up on its hind legs"); stun it and it is lost.
  windup?: string;
  spell?: { tradition: 'arcane' | 'divine'; level: number; school?: string; domain?: string };
  // Orsino's ability level gate for a technique (a level-2 skill such as Meditate).
  level?: number;
  // Orsino's spell save: offensive spells whose damage halves or negates give each target a save first.
  resist?: { kind: string; difficulty: string };
  // A status the user must hold (Charge needs Preparing to Charge), or must not (a countdown not already ticking).
  requires?: { status?: string; notStatus?: string; interceptWeapon?: true };
  unsupported?: Omissions; source?: Source;
}
export interface Ancestry {
  name: string; description: string; nameGroup: string; classes: string[]; playable?: boolean;
  attributes: Partial<Record<Attribute, number>>; traits: string[]; forbiddenTraits?: string[];
  techniques?: string[]; feature?: string; source: Source;
}
export interface Statistics {
  attributes: 'rolled' | Record<Attribute, number>; hitPoints?: number; hitDie?: number;
  level?: number; weapon: string; armor?: string; primary: Attribute;
  // Actions a turn (Orsino's monsterAttacksPerTurn); one when unstated.
  actions?: number;
  // Its natural attacks in a round, in order, each a natural weapon of the catalog (a dragon's claws, claws, bite):
  // its plain blow is all of them, a roll each, as one action. Its weapon alone when unstated.
  attacks?: string[];
  // Orsino's template growth for a creature made above first level: every fixed attribute rises by round(level / 8),
  // and a monster's hit points are base + Constitution modifier + perLevel × level (an animal's stay fixed).
  growth?: { hitPoints?: { base: number; perLevel: number } };
}
// What a variation says of itself in the canon (data/catalog/variations.json; CreatureVariants reads the rest): its
// axis, its word, what is seen of it, the kinds and types it is for, and where a kind made with it lives and how
// commonly.
export interface Overlay {
  axis: string; word: string; says: string; kinds: string[]; types?: string[]; habitats?: string[]; abundance?: number;
  // The temper and the type a kind made with it has (a great kind stands its ground; the skeletal are undead).
  temperament?: string; type?: string;
}
export interface Species {
  name: string; description: string; variantOf?: string; type?: string; kind?: 'animal' | 'monster' | 'spirit' | 'device';
  // What it looks like, for whoever paints it; and what it is made of (data/catalog/materials.json), for a device.
  looks?: string; material?: string;
  // The axis of variation it is never made without (an elemental is always of an element): its kinds that name one
  // are what is called up and met, never it bare.
  requires?: string;
  // How common it is where it lives, as a weight among what dens there (see RegionEcology.recorded): a creature with
  // one dens in its habitats by its record alone.
  abundance?: number;
  // A kind met one at a time, never in a band (a lich, a vampire, a dragon): what composes an encounter (Parties) never
  // makes more than one of it.
  alone?: boolean;
  statistics?: Statistics; abilities?: string[]; traits?: string[]; resistances?: Record<string, number>;
  temperament?: string; habitats?: string[];
  // A kind named for what varies it (a great rat, a cave spider): its base (variantOf) with these variations
  // (variations.json), which every creature of it is made with, as an author's Variant would make it.
  variations?: string[];
  // The painting it is shown by (a concept of data/paintings/registry.json), if it has one (see CreaturePortraits).
  portrait?: string;
  // Experience for defeating one (Orsino's monsterXp + 50 × level, an animal's 10 × level); else by type.
  worth?: { base: number; perLevel: number };
  omits?: Omissions; source: Source;
}
export interface Proficiencies { all?: true; kinds?: string[]; weights?: string[] }
export interface CharacterClass {
  name: string; description: string; hitDie: number; attributes: Partial<Record<Attribute, number>>; gold: number;
  abilities: string[]; playable?: boolean; adventuring?: false; skills?: string[];
  // The skills the calling can take up with a level's development, beyond those it starts with: what a warrior or
  // a thief might learn on the road, each opening acts in the world (see Advancement.teachable).
  learns?: string[];
  // What the calling means in play, in a sentence or two for the player choosing it.
  practice?: string;
  specializations?: string[]; weapons: string[]; armor: string[]; startingGear?: string[];
  // What the calling brings at later levels: techniques learned and calling traits taken (Kyr's own progression).
  features?: CallingFeature[];
  proficiencies: {
    weapons: Proficiencies; armor: Proficiencies; items?: Proficiencies & { withoutTradition?: string };
  };
  // Orsino's maxSpellSlotsForCombatant: base plus 2 + level, plus a multiple of a positive attribute modifier.
  slots: { base: number; attribute?: Attribute; multiplier?: number };
  // Spell slots by spell level for each character level (row 0 is level 1); a casting attribute of 14 or more adds a
  // first-level slot. Cantrips need no slot.
  spellcasting?: { attribute: Attribute; slots: number[][] };
  omits?: Omissions; source: Source;
}
export interface CallingFeature { level: number; abilities?: string[]; traits?: string[] }
export interface Background {
  name: string; use: 'background' | 'profession'; attributes: Partial<Record<Attribute, number>>; gold: number;
  requiredClass?: string; skills?: string[]; gear?: string[]; offers?: { kind: string; text: string; fee: number }[];
  routine?: string; contact?: { channel: 'tavern' | 'temple' | 'market' | 'road'; text: string }; source: Source;
  // The kind of background it is (wild country, the roads, a trade), and Orsino gear Kyr does not have.
  kind?: string; omits?: Omissions;
}
// The quality a check of it rests on (a d20 and that quality's modifier: see Checks), for a skill that is tried.
export interface Skill { name: string; description: string; source: Source; rests?: Attribute }
export interface WeaponStats {
  damage: string; type: string; kind?: string; weight?: string; missile?: true; intercept?: true; natural?: true;
}
export interface ArmorStats { ac: number; weight: string; type: string }
export interface ItemKind {
  name: string; category: 'weapon' | 'armor' | 'tool' | 'gear' | 'consumable' | 'equipment' | 'treasure' | 'document';
  description: string; value?: number; slot?: string; use?: string; modifiers?: Modifiers;
  weapon?: WeaponStats; armor?: ArmorStats; hooks?: Hooks;
  // What it burns, lit (a lantern burns lamp oil): an item kind whose use is the light it gives.
  fuel?: string;
  // How many times it can be used before it is spent (a wand of magic missile's twenty); once, unless it says.
  charges?: number;
  grants?: { ability?: string; skill?: string }; unsupported?: Omissions; source: Source;
  // What of the source a generated item leaves out, and why (a container's capacity: Kyr does not count it).
  omits?: Omissions;
}
export interface Domain {
  name: string; alignment: 'good' | 'neutral' | 'evil'; description?: string; spellDomain?: string;
  blessing?: { modifiers: Modifiers; omits?: Omissions; unsupported?: Omissions }; source: Source;
}
export interface Deity {
  name: string; domains: string[]; gender?: string; observance?: string;
  blessing?: { id: string; name: string; effect: string }; source: Source;
}
// A material (data/catalog/materials.json): what it is called, what kind of stuff, how hard (1 soft to 10), and how it
// looks, for whoever paints or says it.
export interface Material { name: string; kind: string; hardness: number; looks: string; source: Source }
export interface Plant {
  name: string; looks: string; habitats: string[]; source: Source;
  // What it is good for (medicine, food, poison, material), and how common it is where it grows: a plant with an
  // abundance is set wherever its habitat is, after the plants written before it (see RegionGrowth).
  uses?: string[]; abundance?: number;
  // A plant that can be gathered: what a stand of it looks like where it grows, what is gathered from it (an item of
  // the kind it yields), and how much a stand gives before it is stripped.
  stand?: string; yields?: string; gathered?: string; count?: number;
  // And anything else cut from it that is not what it yields (a long pole from the willows), and how many.
  cut?: { yields: string; gathered: string; count?: number };
  // The rock it does best on (data/catalog/geology.json's formations: heather on granite and peat, selfheal on the
  // limestone), where it is twice as common (see RegionGrowth).
  grounds?: string[];
}
// A kind of country (data/catalog/habitats.json): what it is on the land — the land covers, region terrains, kinds of
// site and road forms that are it, and whether it is the ground beside water — and Orsino's terrain.
export interface Habitat {
  name: string; orsino?: string; covers?: string[]; terrains?: string[]; sites?: string[]; forms?: string[];
  water?: boolean;
  // A habitat of the ground beside the sea (what lives in the sea is seen from its shore).
  shore?: boolean;
}
export interface Procedure { name: string; effect: string; description: string }
// The numbers and ids the rules of a fight turn on (data/catalog/vocabulary.json's combat): see its about.
export interface Combat {
  deathSave: number; triggerSave: number; triggerTurns: number; summons: { base: number; perLevels: number };
  flee: { die: string; atMost: number }[]; systemShock: number; recharge: { technique: number; free: string[] };
  fist: { id: string; name: string; damage: string; type: string; natural: boolean };
  ids: { slain: string; raising: string; roughRest: string; shelteredRest: string };
}
