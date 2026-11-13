import { Canon } from '../canon/canon';
import { FantasyRules } from '../fantasy-rules';

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
  private static readonly blocks = new Map<string, Block | undefined>();
  static of(raceId: string): Block | undefined {
    if (!this.blocks.has(raceId)) {
      const st = Canon.isBody(raceId) ? Canon.creature(raceId).statistics : undefined;
      const fixed = st?.hitDice && (st.saves || st.attackBonus !== undefined);
      this.blocks.set(raceId, fixed ? { ...st.saves ? { saves: st.saves } : {},
        ...st.attackBonus !== undefined ? { attackBonus: st.attackBonus } : {} } : undefined);
    }
    return this.blocks.get(raceId);
  }
  private static fixed(f: { raceId: string; classId?: string }): Block | undefined {
    return f.classId ? undefined : this.of(f.raceId);
  }
  // The bonus to a save of this kind that makes it the block's: none for a creature of a calling, or of a kind without.
  static save(f: { raceId: string; classId?: string; level: number }, kind: string, scores: Record<string, number>) {
    const block = this.fixed(f)?.saves, attribute = Canon.rules.saveKinds[kind];
    if (!block || !attribute) { return 0; }
    return block[this.families[attribute]!] - FantasyRules.statMod(scores[attribute]!) - f.level;
  }
  // A blow's to-hit from the block's bonus, in place of its score's modifier; undefined for any other creature.
  static toHit(f: { raceId: string; classId?: string; level: number }): number | undefined {
    const bonus = this.fixed(f)?.attackBonus;
    return bonus === undefined ? undefined : bonus - 1 - Math.floor(f.level / 2);
  }
}
