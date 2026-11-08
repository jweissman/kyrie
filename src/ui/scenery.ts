import table from '../../data/paintings/scenery.json';
import type { Screen } from './screen-types';
import { SceneKinds, type Named } from './scene-kinds';

// A painting of country of the kind the company has come into, for the page to open a chapter with: a settlement by
// its river or its frost, or a village's lane and fields; wild country by the land it is (a river's vale, a lake, a
// peak or a pass, a wood) or its region's terrain; a ruin, a tower or standing stones for a site; a fire or a moon at
// night. Each kind has a few, and a place is given the same one each time (by its id). Chosen by looking at the
// paintings (data/paintings/seen.json): wide country, with a way into it, never a figure who could be taken for
// someone met (a village fair's crowd under a church tower had opened a shrine's page and a road through a forest
// clearing: Mission 17's plays). A town in the woods is a clearing in them; one in the fens a mill on its bluff, or
// boats drawn up (a fen salt-house had opened on sheep in a wooded lane: play 13).
export class Scenery {
  // Which painting for which kind of place: the author's, in data/paintings/scenery.json.
  static readonly views: Record<string, string[]> = table.views;
  static readonly within: Record<string, string[]> = table.within;
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
  static readonly approaches: Record<string, string[]> = table.approaches;
  static approach(screen: Screen, country?: string): string | undefined {
    const terrain = screen.region?.terrain?.replace(/^.*__/, '') ?? '';
    const season = /; (\w+)$/.exec(screen.date?.long ?? '')?.[1];
    const views = this.seasonal(this.approaches[terrain] ?? this.approaches.forest!, season);
    return country && views.includes(country) ? country : views[this.hash(screen.place.id) % views.length];
  }
  // What is painted in winter is shown only in winter (a frozen river with skaters was shown on 23 Midsummer); and in
  // winter, where a kind has a winter painting, one of those (a cold country's town in summer is a grey northern bay,
  // in winter its frozen river: a fresh play had a leafy fair for a town of snow-fences and turf roofs).
  static readonly winter = new Set(table.winter);
  // An author's own painting for a place of theirs, kept before any kind's (data/paintings/scenery.json, places).
  static readonly places: Record<string, string> = table.places;
  // Under a roof (a room of a building, anywhere within a level of a site not said to be open, or a room whose kind
  // is seen from within: a shop off the market-place), no country is painted: the Hall cellar at Merrow had opened on
  // a sunlit wood (Mission 18's first walk), and a picture that contradicts the place is worse than none.
  static of(screen: Screen): string | undefined {
    const roofed = this.roofed(screen), season = /; (\w+)$/.exec(screen.date?.long ?? '')?.[1];
    if (roofed && !this.places[screen.place.id]) { return undefined; }
    if (screen.dark) { return this.pick(this.seasonal(this.views.night ?? [], season), screen.place.id); }
    if (this.places[screen.place.id]) { return this.places[screen.place.id]; }
    const where = this.where(screen), named = SceneKinds.of(screen);
    const known = named && SceneKinds.painted(named.kind, { roofed: false, underground: false });
    // A kind seen from within (a taproom, a cellar) is not painted as the country, nor is one with nothing to show.
    if (known && (!named!.kind.ground || !known.length)) { return undefined; }
    if (known) { return this.pick(this.seasonal(known, season), screen.place.id); }
    const area = screen.region?.areas.find(a => a.here);
    const form = area?.form?.replace(/^land_/, ''), terrain = screen.region?.terrain?.replace(/^.*__/, '');
    const keys = where === 'site' ? ['site']
      : [form && `${where}:${form}`, terrain && where === 'settlement' && `settlement:${terrain}`,
        where === 'wild' ? terrain : undefined, where].filter((k): k is string => !!k);
    const views = keys.map(k => this.seasonal(this.views[k] ?? [], season)).find(v => v.length);
    return views && this.pick(views, screen.place.id);
  }
  // Under a roof or under the ground, a painting of a room of the kind, not of the country (the owner, 4 November:
  // the cellar's page had only words where a picture should be): a taproom by a tankard on its shelf, a crypt by a
  // skull, a tower's hall by its stair; none where nothing in the corpus is of the kind (a forge, the rat-runs, a
  // spiders' brood), which the page draws as a dim ground (the owner, 7 November: a dark room is better than a
  // cathedral for a taproom). With no kind, a site's deep rooms are its vaults and stairs; elsewhere, nothing.
  static inside(screen: Screen): string | undefined {
    if (this.places[screen.place.id]) { return this.places[screen.place.id]; }
    const at = { roofed: this.roofed(screen), underground: !!screen.place.underground };
    const named = SceneKinds.of(screen, k => !!SceneKinds.painted(k, at));
    const known = named && SceneKinds.painted(named.kind, at);
    if (known) { return this.varied(known, screen, named!); }
    const site = screen.path.some(p => p.kind === 'site');
    const views = at.underground ? this.within[site ? 'underground:site' : 'underground'] : this.within.indoors;
    return this.pick(views ?? [], screen.place.id);
  }
  // What the scene shows: the country, or a room of its kind; in the dark the same room, which the page draws barely
  // seen (SceneSurface); or nothing, where nothing fits, and the page shows a dim ground in its place.
  static seen(screen: Screen): string | undefined {
    const lit = screen.dark ? { ...screen, dark: false } : screen;
    return (screen.dark && !this.roofed(screen) ? this.of(screen) : undefined) ?? this.of(lit) ?? this.inside(lit);
  }
  static roofed(screen: Screen): boolean {
    return !!screen.place.underground
      || (!screen.place.open && screen.path.some(p => p.kind === 'building' || p.kind === 'level'));
  }
  private static where(screen: Screen): 'site' | 'settlement' | 'wild' {
    const kinds = screen.path.map(p => p.kind);
    return kinds.includes('site') ? 'site' : kinds.includes('settlement') ? 'settlement' : 'wild';
  }
  // A room's painting, unlike its neighbours' (the owner and two playtests, 7 November: every barrow room had one
  // painting): within one site or settlement, the rooms its words name differently (the crypt, the ossuary, the vault)
  // are given the kind's paintings in turn from one the site is given; any other, by its own id.
  private static varied(views: string[], screen: Screen, named: Named): string | undefined {
    const within = [...screen.path].reverse().find(p => p.kind === 'site' || p.kind === 'settlement');
    const turn = named.word ? named.kind.words.indexOf(named.word) : -1;
    if (!views.length || !within || turn < 0) { return this.pick(views, screen.place.id); }
    return views[(this.hash(within.id) + turn) % views.length];
  }
  // One of a kind's paintings, the same for a place each time; none from an empty list.
  private static pick(views: string[], id: string): string | undefined {
    return views.length ? views[this.spread(id) % views.length] : undefined;
  }
  private static seasonal(views: string[], season?: string): string[] {
    const cold = views.filter(v => this.winter.has(v));
    return season === 'winter' && cold.length ? cold : views.filter(v => season === 'winter' || !this.winter.has(v));
  }
  // The hash, its bits mixed, so that a few ids alike but for their ends (a barrow's rooms) fall apart.
  private static spread(text: string): number {
    return Math.imul(this.hash(text), 2654435761) >>> 16;
  }
  static hash(text: string): number {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h = Math.imul(h ^ text.charCodeAt(i), 16777619); }
    return h >>> 0;
  }
}
