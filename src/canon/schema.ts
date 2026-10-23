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
  // Orsino's template growth for a creature made above first level: every fixed attribute rises by round(level / 8),
  // and a monster's hit points are base + Constitution modifier + perLevel × level (an animal's stay fixed).
  growth?: { hitPoints?: { base: number; perLevel: number } };
}
export interface Species {
  name: string; description: string; variantOf?: string; type?: string; kind?: 'animal' | 'monster' | 'spirit';
  statistics?: Statistics; abilities?: string[]; traits?: string[]; resistances?: Record<string, number>;
  temperament?: string; habitats?: string[];
  // Experience for defeating one (Orsino's monsterXp + 50 × level, an animal's 10 × level); else by type.
  worth?: { base: number; perLevel: number };
  omits?: Omissions; source: Source;
}
export interface Proficiencies { all?: true; kinds?: string[]; weights?: string[] }
export interface CharacterClass {
  name: string; description: string; hitDie: number; attributes: Partial<Record<Attribute, number>>; gold: number;
  abilities: string[]; playable?: boolean; adventuring?: false; skills?: string[];
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
export interface Skill { name: string; description: string; source: Source }
export interface WeaponStats {
  damage: string; type: string; kind?: string; weight?: string; missile?: true; intercept?: true; natural?: true;
}
export interface ArmorStats { ac: number; weight: string; type: string }
export interface ItemKind {
  name: string; category: 'weapon' | 'armor' | 'tool' | 'gear' | 'consumable' | 'equipment' | 'treasure';
  description: string; value?: number; slot?: string; use?: string; modifiers?: Modifiers;
  weapon?: WeaponStats; armor?: ArmorStats; hooks?: Hooks;
  // What it burns, lit (a lantern burns lamp oil): an item kind whose use is the light it gives.
  fuel?: string;
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
export interface Organism {
  name: string; kind: 'plant' | 'animal'; habitats: string[]; signs: string; species?: string; yields?: string;
  receptive?: boolean; source: Source;
  // A plant that can be gathered: what a stand of it looks like where it grows, what is gathered from it (an item of
  // the kind it yields), and how much a stand gives before it is stripped.
  stand?: string; gathered?: string; count?: number;
}
export interface Procedure { name: string; effect: string; description: string }
