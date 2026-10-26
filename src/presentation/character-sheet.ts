import { Canon } from '../canon/canon';
import { Content } from '../content';
import { CombatProjection } from '../combat-projection';
import { Effects } from '../effects';
import { Fighting } from '../rules/fighting';
import { Checks } from '../rules/checks';
import { Advancement } from '../rules/advancement';
import { PartyCapabilities } from '../campaign/party-capabilities';
import { Overlays } from '../overlays';
import { CreatureSchema, type Attribute, type Creature } from '../creature';

export interface QualityRow {
  id: Attribute; name: string; score: number; base: number;
  // What a fight reads (Orsino's rounding) and what a check reads (rounded down): the same score, two rules.
  fight: number; check: number;
  rests: string;
}
export interface SkillRow { id: string; name: string; text: string; from: string; check?: number }
export interface Bearing { label: string; value: string }
// What a member is, worked out by the rules the game plays by, never written beside them: their qualities as they
// stand (equipment, wounds and conditions counted), how they fight and are fought, their saves, and their skills.
export interface CharacterSheet {
  qualities: QualityRow[]; fighting: Bearing[]; saves: Bearing[]; skills: SkillRow[];
  // A specialist's school or domain, which its first spells are of (Orsino's specialists).
  specialty?: { name: string; about: string; of: string; prayers: boolean };
}
// One way to spend a level's development, with what it would change, worked out by doing it to a copy.
export interface DevelopmentOption {
  kind: 'quality' | 'skill'; id: string; name: string; text?: string; changes: string[];
  // What it would open that the company has come to and cannot do now (see Openings): "the gauge shaft, to the
  // gauge stone".
  opens?: string[];
  // The command that spends it, when the engine offers it now (awake, and somewhere it can be taken in).
  command?: string;
}
export interface Development { left: number; options: DevelopmentOption[] }

export class CharacterSheets {
  static readonly names: Record<Attribute, string> = { strength: 'Strength', dexterity: 'Dexterity',
    constitution: 'Constitution', intelligence: 'Intelligence', wisdom: 'Wisdom', charisma: 'Charisma' };
  static readonly rests: Record<Attribute, string> = {
    strength: 'blows struck with a weapon in hand, and what they do; lifting and climbing',
    dexterity: 'how hard you are to hit; shots from a bow or a sling; locks, traps and going unseen',
    constitution: 'hit points at each level; holding out against poison, bleeding and stunning',
    intelligence: 'old histories, scripts and the workings of magic; a mage\'s spells',
    wisdom: 'reading people and country; tending wounds; holding out against fear and charms; a cleric\'s prayers',
    charisma: 'talking people round, or down; a lie that holds; a bard\'s songs' };
  static sheet(c: Creature): CharacterSheet {
    const f = CombatProjection.fighter(c, 'fighters'), scores = Effects.scores(f);
    return {
      qualities: CreatureSchema.attributes.map(id => ({ id, name: this.names[id], score: scores[id], base: c.base[id],
        fight: Fighting.statMod(scores[id]), check: Math.floor((c.base[id] - 10) / 2), rests: this.rests[id] })),
      fighting: this.fighting(c), saves: this.saves(c), skills: this.skills(c), ...this.specialty(c) };
  }
  // What a specialist is, by its school or domain: a cleric of the death domain prays curses and drains, which the
  // Bushweald play met under nothing but the calling's "Prayers that heal and protect".
  private static specialty(c: Creature): Pick<CharacterSheet, 'specialty'> {
    const t = (c.traits ?? []).map(id => Canon.traits[Canon.resolve('traits', id)]).find(x => x?.spellAccess);
    const access = t?.spellAccess, of = access?.domain ?? access?.school;
    return t && access && of && of !== 'all' ? { specialty: { name: t.name, about: t.description ?? '', of,
      prayers: access.tradition === 'divine' } } : {};
  }
  // How the member fights and is fought: what they strike with and what a blow does, what they need on the die to
  // land one, and what a common foe needs to land one on them.
  static fighting(c: Creature): Bearing[] {
    const f = CombatProjection.fighter(c, 'fighters'), combatant = Effects.combatant(f), weapon = combatant.weapon;
    const missile = weapon.missile === true, stat = missile ? combatant.dexterity : combatant.strength;
    const toHit = Fighting.statMod(stat) + (combatant.modifiers.toHit ?? 0);
    const bonus = Math.max(0, Fighting.statMod(stat));
    const unarmoured = Fighting.thac0(c.base.level) - 10 - toHit, ac = Fighting.armorClass(combatant);
    const worn = (c.state.inventory ?? []).find(i => i.equipped && Canon.items[i.definition]?.armor);
    return [
      { label: 'Strikes with', value: `${weapon.name.toLowerCase()}: ${weapon.damage}${bonus ? ` + ${bonus}` : ''} ${weapon.type}` },
      { label: 'To land a blow', value: `${Math.max(2, unarmoured)} or more on the die against someone unarmoured` },
      { label: 'Armour', value: worn ? Canon.items[worn.definition]!.name : 'none' },
      { label: 'To be struck', value: `a common foe needs ${Math.min(20, Math.max(2, Fighting.thac0(1) - ac))} or more` },
      { label: 'Hit points', value: `${c.state.hp} of ${c.base.maxHp}` },
      { label: 'Each level adds', value: `1d${Canon.classes[c.classId ?? '']?.hitDie ?? 6}`
        + `${Fighting.statMod(c.base.constitution) ? ` ${this.signed(Fighting.statMod(c.base.constitution))}` : ''}`
        + ' hit points' }];
  }
  // The saves, by the quality each rests on: the die, and the quality's modifier and the member's level added.
  static saves(c: Creature): Bearing[] {
    const f = CombatProjection.fighter(c, 'fighters'), scores = Effects.scores(f);
    const kinds = Content.rules.saveKinds as Record<string, Attribute>, by = new Map<Attribute, string[]>();
    for (const [kind, quality] of Object.entries(kinds)) {
      const word = this.harms[kind];
      if (word) { by.set(quality, [...by.get(quality) ?? [], word]); }
    }
    return [...by].map(([quality, list]) => ({ label: `Against ${this.list(list)} (${this.names[quality]})`,
      value: this.signed(Fighting.statMod(scores[quality]) + c.base.level + Effects.saveModifier(f)) }));
  }
  // What each kind of save holds out against, in words; the categories (fortitude, will) are said by their harms.
  static readonly harms: Record<string, string> = { poison: 'poison', disease: 'disease', death: 'death', stun: 'stunning',
    breath: 'breath', bleed: 'bleeding', magic: 'magic', charm: 'charms', fear: 'fear', sleep: 'sleep',
    insanity: 'madness', paralyze: 'paralysis', reflex: 'what can be dodged' };
  // The skills the member brings, where each comes from, and what a check on it adds.
  static skills(c: Creature): SkillRow[] {
    return Object.entries(Canon.skills).filter(([id]) => PartyCapabilities.brings(id, c))
      .map(([id, s]) => ({ id, name: s.name, text: s.description, from: this.from(c, id),
        ...Checks.qualities[id] ? { check: Checks.total(c, id) } : {} }));
  }
  private static from(c: Creature, id: string): string {
    if ((c.state.skills ?? []).includes(id)) { return 'taken up'; }
    if (Overlays.skills(c).includes(id)) { return 'background'; }
    return (Canon.classes[c.classId ?? '']?.skills ?? []).includes(id) ? 'calling' : 'gear';
  }
  // A level's development: what is left to spend, and each way of spending it with what it would change and, where
  // the engine offers it now, the command that spends it (`offered`: the member's commands, by id).
  static development(c: Creature, ref?: string, offered: Set<string> = new Set(),
    opens: Map<string, string[]> = new Map()): Development | undefined {
    const left = c.state.advances?.qualities ?? 0;
    if (!left || c.state.hp === 0) { return undefined; }
    const options = [...CreatureSchema.attributes.map(q => this.quality(c, q)),
      ...Advancement.teachable(c).map(s => ({ ...this.skill(c, s), ...opens.get(s) ? { opens: opens.get(s)! } : {} }))];
    return { left, options: options.map(o => {
      const command = `${o.kind === 'quality' ? 'raise_quality' : 'learn_skill'}(${ref},${o.id})`;
      return ref && offered.has(command) ? { ...o, command } : o;
    }) };
  }
  private static quality(c: Creature, q: Attribute): DevelopmentOption {
    const after = structuredClone(c);
    after.base[q]++;
    const changes = this.compare(c, after);
    // Every check resting on the quality moves together: its modifier, before any training.
    const resting = Object.entries(Checks.qualities).filter(([id, at]) => at === q && Canon.skills[id])
      .map(([id]) => id);
    const [was, now] = [c.base[q], after.base[q]].map(score => Math.floor((score - 10) / 2));
    if (resting.length && was !== now) {
      changes.push(`Checks on ${this.list(resting.map(id => Canon.skills[id]!.name.toLowerCase()))}: `
        + `${this.signed(was!)} → ${this.signed(now!)}`);
    }
    return { kind: 'quality', id: q, name: this.names[q], text: `${c.base[q]} → ${c.base[q] + 1}`,
      changes: changes.length ? changes : ['Nothing yet: the next point after it will tell'] };
  }
  private static skill(c: Creature, id: string): DevelopmentOption {
    const after = structuredClone(c), skill = Canon.skills[id]!;
    after.state.skills = [...after.state.skills ?? [], id];
    return { kind: 'skill', id, name: skill.name, text: skill.description,
      changes: [`A check on it: ${this.signed(Checks.total(c, id))} → ${this.signed(Checks.total(after, id))}`] };
  }
  // What differs between two sheets, said as the player would want it: "To land a blow: 9 → 8 or more".
  private static compare(before: Creature, after: Creature): string[] {
    const [a, b] = [this.sheet(before), this.sheet(after)], out: string[] = [];
    for (const [i, row] of a.fighting.entries()) {
      if (row.value !== b.fighting[i]!.value) { out.push(`${row.label}: ${row.value} → ${b.fighting[i]!.value}`); }
    }
    for (const [i, row] of a.saves.entries()) {
      if (row.value !== b.saves[i]!.value) { out.push(`${row.label}: ${row.value} → ${b.saves[i]!.value}`); }
    }
    return out;
  }
  static signed(n: number): string { return n >= 0 ? `+${n}` : `−${-n}`; }
  static list(items: string[]): string {
    return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)!}`;
  }
}
