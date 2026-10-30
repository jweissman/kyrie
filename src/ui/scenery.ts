import type { Screen } from './screen-types';

// A painting of country of the kind the company has come into, for the page to open a chapter with: a settlement by
// its river or its frost, or a village's lane and fields; wild country by the land it is (a river's vale, a lake, a
// peak or a pass, a wood) or its region's terrain; a ruin, a tower or standing stones for a site; a fire or a moon at
// night. Each kind has a few, and a place is given the same one each time (by its id). Chosen by looking at the
// paintings (data/paintings/seen.json): wide country, with a way into it, never a figure who could be taken for
// someone met (a village fair's crowd under a church tower had opened a shrine's page and a road through a forest
// clearing: Mission 17's plays). A town in the woods is a clearing in them; one in the fens a mill on its bluff, or
// boats drawn up (a fen salt-house had opened on sheep in a wooded lane: play 13).
export class Scenery {
  static readonly views: Record<string, string[]> = {
    'settlement:river': ['bridge', 'mill'], 'settlement:frost': ['wintre', 'ice-cutter', 'trapper', 'idyll'],
    'settlement:forest': ['forest', 'herd', 'chapel'], 'settlement:marsh': ['mill', 'trapper'],
    settlement: ['herd', 'chapel', 'arcadia', 'bridge'],
    'wild:river': ['indolence', 'bridge'], 'wild:lake': ['bear', 'party'], 'wild:peak': ['idyll', 'avalanche'],
    'wild:pass': ['idyll', 'bridge'], 'wild:wood': ['grove', 'gale'],
    forest: ['grove', 'gale', 'forest'], marsh: ['grove', 'trapper'], mountain: ['idyll', 'bear'],
    frost: ['ice-cutter', 'wintre', 'trapper', 'idyll'],
    desert: ['encampment'], hills: ['herd', 'idyll'], wild: ['indolence', 'idyll', 'arch'],
    site: ['arch', 'ruin', 'trilith', 'tower'], night: ['camp', 'moon', 'aurora'],
  };
  // A country by its terrain alone, as it is seen before it is entered (the page that asks who comes to it).
  static country(terrain: string | undefined, key: string): string | undefined {
    const views = this.views[terrain ?? ''] ?? this.views.wild!;
    return views[this.hash(key) % views.length];
  }
  // The way into a town, as a new game's opening paints it (OWN-17): by the land its arrival is told in (the approach
  // lines of data/origins/tables.json, by terrain, the road out from under the trees where a terrain has none of its
  // own), never a sight the words deny (a frost town's way in, told by its snow-fences, turf roofs and peat, had opened
  // on boats drawn up in a pale bay: the opening's critique). The country the life was chosen over, where it is one of
  // these, so that the painting behind the choice sharpens into the way in.
  static readonly approaches: Record<string, string[]> = { forest: ['forest', 'herd', 'chapel'], marsh: ['mill'],
    mountain: ['idyll', 'bridge'], frost: ['idyll', 'wintre'] };
  static approach(screen: Screen, country?: string): string | undefined {
    const terrain = screen.region?.terrain?.replace(/^.*__/, '') ?? '';
    const season = /; (\w+)$/.exec(screen.date?.long ?? '')?.[1];
    const views = this.seasonal(this.approaches[terrain] ?? this.approaches.forest!, season);
    return country && views.includes(country) ? country : views[this.hash(screen.place.id) % views.length];
  }
  // What is painted in winter is shown only in winter (a frozen river with skaters was shown on 23 Midsummer); and in
  // winter, where a kind has a winter painting, one of those (a cold country's town in summer is a grey northern bay,
  // in winter its frozen river: a fresh play had a leafy fair for a town of snow-fences and turf roofs).
  static readonly winter = new Set(['wintre', 'ice-cutter', 'avalanche']);
  // Under a roof (a room of a building, or anywhere within a level of a site), no country is painted: the Hall cellar
  // at Merrow had opened on a sunlit wood (Mission 18's first walk), and a picture that contradicts the place is worse
  // than none.
  static of(screen: Screen): string | undefined {
    if (screen.path.some(p => p.kind === 'building' || p.kind === 'level')) { return undefined; }
    const kinds = screen.path.map(p => p.kind), area = screen.region?.areas.find(a => a.here);
    const season = /; (\w+)$/.exec(screen.date?.long ?? '')?.[1];
    const form = area?.form?.replace(/^land_/, ''), terrain = screen.region?.terrain?.replace(/^.*__/, '');
    const where = kinds.includes('site') ? 'site' : kinds.includes('settlement') ? 'settlement' : 'wild';
    const keys = screen.dark ? ['night'] : where === 'site' ? ['site']
      : [form && `${where}:${form}`, terrain && where === 'settlement' && `settlement:${terrain}`,
        where === 'wild' ? terrain : undefined, where].filter((k): k is string => !!k);
    const views = keys.map(k => this.seasonal(this.views[k] ?? [], season)).find(v => v.length);
    return views && views[this.hash(screen.place.id) % views.length];
  }
  private static seasonal(views: string[], season?: string): string[] {
    const cold = views.filter(v => this.winter.has(v));
    return season === 'winter' && cold.length ? cold : views.filter(v => season === 'winter' || !this.winter.has(v));
  }
  private static hash(text: string): number {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h = Math.imul(h ^ text.charCodeAt(i), 16777619); }
    return h >>> 0;
  }
}
