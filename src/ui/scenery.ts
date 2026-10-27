import type { Screen } from './screen-types';

// A painting of country of the kind the company has come into, for the page to open a chapter with: a settlement by
// its river or its frost, or a village's lane and fields; wild country by the land it is (a river's vale, a lake, a
// peak or a pass, a wood) or its region's terrain; a ruin, a tower or standing stones for a site; a fire or a moon at
// night. Each kind has a few, and a place is given the same one each time (by its id). Chosen by looking at the
// paintings (data/paintings/seen.json): wide country, with a way into it, never a figure who could be taken for
// someone met.
export class Scenery {
  static readonly views: Record<string, string[]> = {
    'settlement:river': ['bridge', 'mill'], 'settlement:frost': ['wintre', 'ice-cutter'],
    settlement: ['herd', 'fair', 'bridge'],
    'wild:river': ['indolence', 'bridge'], 'wild:lake': ['bear', 'party'], 'wild:peak': ['idyll', 'avalanche'],
    'wild:pass': ['idyll', 'bridge'], 'wild:wood': ['grove', 'gale'],
    forest: ['grove', 'gale'], marsh: ['grove', 'trapper'], mountain: ['idyll', 'bear'], frost: ['ice-cutter', 'wintre'],
    desert: ['encampment'], hills: ['herd', 'idyll'], wild: ['indolence', 'idyll', 'arch'],
    site: ['arch', 'ruin', 'trilith', 'tower'], night: ['camp', 'moon', 'aurora'],
  };
  static of(screen: Screen): string | undefined {
    const kinds = screen.path.map(p => p.kind), area = screen.region?.areas.find(a => a.here);
    const form = area?.form?.replace(/^land_/, ''), terrain = screen.region?.terrain?.replace(/^.*__/, '');
    const where = kinds.includes('site') ? 'site' : kinds.includes('settlement') ? 'settlement' : 'wild';
    const keys = screen.dark ? ['night'] : where === 'site' ? ['site']
      : [form && `${where}:${form}`, terrain && where === 'settlement' && `settlement:${terrain}`,
        where === 'wild' ? terrain : undefined, where].filter((k): k is string => !!k);
    const views = keys.map(k => this.views[k]).find(v => v?.length);
    return views && views[this.hash(screen.place.id) % views.length];
  }
  private static hash(text: string): number {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h = Math.imul(h ^ text.charCodeAt(i), 16777619); }
    return h >>> 0;
  }
}
