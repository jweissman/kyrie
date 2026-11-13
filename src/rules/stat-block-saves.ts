import { Canon } from '../canon/canon';
import { Fighting } from './fighting';

// A stat block's saves (Statistics.saves: the SRD's Fortitude, Reflex and Will), as Westernesse rolls a save: a d20,
// the modifier of the score the save's kind reads, the level, and its bonuses (Effects.save). A kind with a stat
// block's saves makes every save of a family at the block's number, whatever its scores and level: a bonus of the
// block's save less the score's modifier and the level. The family is the score's: Constitution and Strength (poison,
// disease, paralysis) are Fortitude, Dexterity is Reflex, the rest Will.
export class StatBlockSaves {
  static readonly families: Record<string, 'fortitude' | 'reflex' | 'will'> = { constitution: 'fortitude',
    strength: 'fortitude', dexterity: 'reflex', wisdom: 'will', intelligence: 'will', charisma: 'will' };
  private static readonly blocks = new Map<string, { fortitude: number; reflex: number; will: number } | undefined>();
  static of(raceId: string) {
    if (!this.blocks.has(raceId)) {
      this.blocks.set(raceId, Canon.isBody(raceId) ? Canon.creature(raceId).statistics?.saves : undefined);
    }
    return this.blocks.get(raceId);
  }
  // The bonus to a save of this kind that makes it the block's: none for a creature of a calling, or of a kind without.
  static bonus(f: { raceId: string; classId?: string; level: number }, kind: string, scores: Record<string, number>) {
    const block = f.classId ? undefined : this.of(f.raceId);
    const attribute = Canon.rules.saveKinds[kind];
    if (!block || !attribute) { return 0; }
    return block[this.families[attribute]!] - Fighting.statMod(scores[attribute]!) - f.level;
  }
}
