import { Canon } from '../canon/canon';
import type { Book, Entry, Section } from './model';
import { CompanyChapters } from './phb-company';
import { PlayChapters } from './phb-play';
import { OrsinoAppendix } from './orsino-appendix';

// The Player's Handbook: forming a company, what its members can be and carry, and how fights, magic and advancement
// go. Orsino's ancestries and skills that Kyr has not taken in close it.
export class PlayersHandbook {
  constructor(readonly appendix: OrsinoAppendix) {}
  book(): Book {
    return { id: 'phb', title: 'Player\'s Handbook', intro: [
      'A company is three companions. Each has an ancestry, a calling and a background; together they may make a '
        + 'formation. This book is made from the definitions the game plays from. Each entry says how far the game '
        + 'plays it: Faithful to Orsino, Adapted from it with a stated difference, Kyr\'s own, Represented by something '
        + 'smaller, Not playable (defined, but never offered), or Unreachable (playable, but nothing in the game yet '
        + 'reaches it).'],
    sections: [CompanyChapters.ancestries(), CompanyChapters.callings(), CompanyChapters.backgrounds(),
      CompanyChapters.skills(), this.traits(), CompanyChapters.formations(), CompanyChapters.equipment(),
      PlayChapters.combat(), PlayChapters.magic(), PlayChapters.techniques(), PlayChapters.advancement(),
      PlayChapters.feats(), PlayChapters.conditions(), this.orsino()] };
  }
  traits(): Section {
    return { id: 'traits', title: 'Traits', intro: ['What a companion is born with or has become. An ancestry gives its '
      + 'lineage traits; some backgrounds and feats give character traits.'],
    sections: [{ id: 'traits-lineage', title: 'Lineage', entries: PlayersHandbook.category('lineage') },
      { id: 'traits-character', title: 'Character', entries: PlayersHandbook.category('character') }] };
  }
  static category(category: string): Entry[] {
    return Object.entries(Canon.traits).filter(([, t]) => t.category === category)
      .map(([id, t]) => CompanyChapters.trait(id, t.name, `${category} trait`));
  }
  orsino(): Section {
    return { id: 'orsino-company', title: 'Appendix: Orsino\'s peoples and skills', intro: ['Orsino\'s ancestries and '
      + 'skills, with how much of each Kyr holds.'],
    sections: [this.appendix.table('ancestry', 'Ancestries', [['Qualities', PlayersHandbook.racial]]),
      this.appendix.table('ability', 'Skills and techniques', [['Does', PlayersHandbook.does]])] };
  }
  static racial(this: void, d: Record<string, unknown>): string {
    return OrsinoAppendix.scores((d.racialModifier ?? d) as Record<string, unknown>) || '—';
  }
  static does(this: void, d: Record<string, unknown>): string {
    return String(d.description ?? '') || OrsinoAppendix.effects(d.effects);
  }
}
