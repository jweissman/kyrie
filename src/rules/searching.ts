import type { Creature } from '../creature';
import { Fighting } from './fighting';
import { Perks, type PerkContext } from './perks';

// Orsino's search: one member rolls d20 + Wisdom modifier + search bonus against 15, and on a success finds the
// room's hidden stash, with a loot bonus's extra common consumables. Kyr does not roll a search; it takes 10, so the
// company's best searcher either finds what is hidden or does not, every time. Search bonuses are perks: an elf's
// keen senses, a free fellowship's geas, an oligarchy's corruption in a city.
export class Searching {
  static readonly difficulty = 15;
  static score(c: Creature, at: PerkContext = {}): number {
    return 10 + Fighting.statMod(c.base.wisdom) + Perks.bonus(c.traits, 'search', at);
  }
  // Whether this member, searching, finds what would otherwise take a skill to notice.
  static finds(c: Creature, at: PerkContext = {}): boolean {
    return c.state.hp > 0 && this.score(c, at) >= this.difficulty;
  }
  // The member who searches: the living one with the best eye.
  static searcher(members: Creature[], at: PerkContext = {}): Creature | undefined {
    return members.filter(c => c.state.hp > 0).sort((a, b) => this.score(b, at) - this.score(a, at))[0];
  }
}
