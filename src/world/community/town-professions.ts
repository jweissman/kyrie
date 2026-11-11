import { BackgroundCatalog } from '../../canon/background-catalog';
import { Likeness } from '../../paintings/likeness';
import { Draw } from '../land/draw';
import { Canon } from '../../canon/canon';
import type { Region, Settlement } from '../region-writer';
import type { Occupation } from './community';
import kindsOfLife from '../../../data/generation/scenes/kinds-of-life.json';

// The professions the portraits show, in the settlements of the world (the owner, 3 November: hundreds of trades,
// "well represented in the world"): beside its authored work, a settlement keeps a few people of other professions,
// of the kinds of life a place of its size and water has (a town its scholars and officers and sharpers, a hamlet on a
// river its boatmen), each seen at and speaking of their own trade in the words of its kind, with its own likeness.
export class TownProfessions {
  static readonly lines = (kindsOfLife as unknown as
    { kinds: Record<string, { seen: string[]; talk: string[] }> }).kinds;
  static readonly extra: Record<string, number> = { hamlet: 1, village: 2, town: 3 };
  // The kinds of life a settlement has room for.
  static kinds(s: Settlement, water: boolean): string[] {
    return ['trade', 'faith', 'healing', 'margins', ...s.size !== 'hamlet' ? ['roads', 'stage', 'arms'] : ['wild'],
      ...s.size === 'town' ? ['learning', 'court', 'mechanisms', 'shadows'] : ['earth'], ...water ? ['water'] : []];
  }
  static pick(region: Region, s: Settlement, water: boolean, taken: Set<string>): [string, Occupation][] {
    const draw = new Draw(`${region.name}:${s.id}:professions`), kinds = new Set(this.kinds(s, water));
    const classes = Canon.ancestries[s.folk ?? region.ancestry]?.classes;
    const open = Object.entries(Canon.backgrounds).filter(([id, b]) => b.painting && kinds.has(b.kind)
      && !taken.has(id) && this.lines[b.kind] && (!b.requiredClass || !classes || classes.includes(b.requiredClass)));
    return draw.shuffle(open).slice(0, this.extra[s.size] ?? 1).map(([id, b]) => [id, this.occupation(id, b)]);
  }
  // Whoever does it is of the sex of the one in its painting, and called by it: the abbess in her portrait is a woman
  // and an abbess, never a man called an abbess under a woman's likeness (the owner's play of 10 November).
  private static occupation(id: string, b: (typeof Canon.backgrounds)[string]): Occupation {
    const sex = Likeness.sitters.get(b.painting!)?.sex;
    const pronoun = sex === 'woman' ? 'she' : sex === 'man' ? 'he' : undefined;
    const trade = BackgroundCatalog.called(b, pronoun).toLowerCase(), lines = this.lines[b.kind]!;
    return { name: trade, background: id, painting: b.painting!, ...pronoun ? { sitter: pronoun } : {},
      seen: lines.seen.map(t => this.fill(t, trade)), talk: lines.talk.map(t => this.fill(t, trade)) };
  }
  private static fill(text: string, trade: string): string { return text.replace(/\{trade\}/g, trade); }
}
