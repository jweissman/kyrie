import source from '../../data/sources/srd35/monsters.json';
import { Fighting, type Combatant, type WeaponProfile } from '../../src/rules/fighting';

export interface SourceStrike { name: string; count: number; dice: string; plus: number; bonus: number }
export interface SourceBody {
  name: string; hp: number; ac: number; hitDice: string;
  scores: { strength: number | null; dexterity: number | null };
  attacks: SourceStrike[]; specialAttacks: string[]; specialQualities: string[];
}

// Staged numeric routines only: attack modes, riders, defenses, criticals and placements remain unproved.
export class SrdRoutinePrototype {
  static readonly bodies: Record<string, SourceBody> = source.monsters;
  static problem(id: string): string | undefined {
    const body = this.bodies[id];
    if (!body) { return `Unknown SRD body ${id}`; }
    if (!body.attacks.length) { return `No extracted routine for ${id}`; }
    if (![body.scores.strength, body.scores.dexterity].every(n => n !== null && Number.isSafeInteger(n) && n >= 1)) {
      return `Unsupported absent ability score for ${id}`;
    }
    if (body.attacks.some(a => !Number.isSafeInteger(a.count) || a.count < 1 || !Number.isSafeInteger(a.bonus)
      || !Number.isSafeInteger(a.plus) || !/^\d+d\d+$/.test(a.dice))) {
      return `Incomplete SRD strike for ${id}`;
    }
    return undefined;
  }
  static routine(id: string): WeaponProfile[] {
    const problem = this.problem(id);
    if (problem) { throw new Error(problem); }
    const body = this.bodies[id]!;
    return body.attacks.flatMap((attack, index) => {
      return Array.from({ length: attack.count }, (_, n) => ({
        id: `${id}:${index}:${n}`, name: attack.name, damage: attack.dice, type: 'bludgeoning',
        attackBonus: attack.bonus, damageBonus: attack.plus,
      }));
    });
  }
  static combatant(id: string, weapon: WeaponProfile, rank: number): Combatant {
    const body = this.bodies[id];
    if (!body || !Number.isSafeInteger(rank) || rank < 1) { throw new Error(`Invalid staged body or rank ${id}`); }
    if (body.scores.strength === null || body.scores.dexterity === null) {
      throw new Error(`Unsupported absent ability score for ${id}`);
    }
    const armor = body.ac - 11 - Fighting.statMod(body.scores.dexterity);
    return { level: rank, strength: body.scores.strength, dexterity: body.scores.dexterity,
      armorAc: Math.max(0, armor), weapon, modifiers: { ac: Math.max(0, -armor) } };
  }
  static blockers(id: string): string[] {
    const body = this.bodies[id];
    if (!body) { throw new Error(`Unknown SRD body ${id}`); }
    return [...this.problem(id) ? [this.problem(id)!] : [],
      ...body.specialAttacks.map(s => `attack: ${s}`), ...body.specialQualities.map(s => `quality: ${s}`),
      'attack mode and damage type absent from structured extraction', 'critical policy not imported',
      'generation, reach and balance unproved'];
  }
}
