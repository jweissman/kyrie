import { FantasyRules } from '../fantasy-rules';
import { Canon } from '../canon/canon';
import type { Fighter } from '../model';

// A fixed stat block's saves and the bonus its blows are struck at (Statistics.saves, attackBonus: proof-slices.md,
// step 2), as Westernesse rolls them. A save is a d20, the modifier of the score its kind reads, the level, and its
// bonuses (Effects.save); a blow needs thac0(level) less the mark's armour class less its to-hit (Fighting.attack).
// A kind with a fixed stat block (Hit Dice, which no level grows) makes each at the block's number, whatever its
// scores and the level it is met at: no level bonus is added again. A save's family is its score's: Constitution
// and Strength (poison, disease, paralysis) Fortitude, Dexterity Reflex, the rest Will. A blow at the SRD's bonus B
// hits SRD AC A on d20 + B ≥ A; Westernesse's AC is 21 − A, so its to-hit is B − 1 − ⌊level / 2⌋. Ordinary
// creatures keep the saves and blows their level and scores give them.
type Saves = { fortitude: number; reflex: number; will: number };
interface Block { saves?: Saves; attackBonus?: number }
export class FixedStatBlock {
  static readonly families: Record<string, keyof Saves> = { constitution: 'fortitude', strength: 'fortitude',
    dexterity: 'reflex', wisdom: 'will', intelligence: 'will', charisma: 'will' };
  private static readonly blocks = new WeakMap<object, Block | undefined>();
  static of(fighter: Pick<Fighter, 'equipment'>): Block | undefined {
    const body = fighter.equipment?.body;
    if (body === undefined) { throw new Error('A fighter requires its catalog body projection (null for no body)'); }
    if (!body) { return undefined; }
    if (!this.blocks.has(body)) {
      const fixed = body.hitDice && (body.saves || body.attackBonus !== undefined);
      this.blocks.set(body, fixed ? { ...body.saves ? { saves: body.saves } : {},
        ...body.attackBonus !== undefined ? { attackBonus: body.attackBonus } : {} } : undefined);
    }
    return this.blocks.get(body);
  }
  private static fixed(f: Pick<Fighter, 'classId' | 'equipment'>): Block | undefined {
    const block = this.of(f);
    return f.classId ? undefined : block;
  }
  // The bonus to a save of this kind that makes it the block's: none for a creature of a calling, or of a kind without.
  static save(f: Pick<Fighter, 'classId' | 'equipment' | 'level'>, kind: string, scores: Record<string, number>) {
    const block = this.fixed(f)?.saves, attribute = Canon.rules.saveKinds[kind];
    if (!block || !attribute) { return 0; }
    return block[this.families[attribute]!] - FantasyRules.statMod(scores[attribute]!) - f.level;
  }
  // A blow's to-hit from the block's bonus, in place of its score's modifier; undefined for any other creature.
  static toHit(f: Pick<Fighter, 'classId' | 'equipment' | 'level'>): number | undefined {
    const bonus = this.fixed(f)?.attackBonus;
    return bonus === undefined ? undefined : bonus - 1 - Math.floor(f.level / 2);
  }
}
