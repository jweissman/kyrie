import table from '../../data/paintings/scenery.json';
import type { Screen } from './screen-types';
import { SceneKinds, type Named } from './scene-kinds';
import { Fits } from './fits';
import { Commissioned } from './commissioned';

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
  // Only the owner's commissioned paintings, never an old master (Commissioned: the owner, 25 November).
  static readonly views: Record<string, string[]> = Commissioned.lists(table.views);
  static readonly within: Record<string, string[]> = Commissioned.lists(table.within);
  // A country by its terrain alone, as it is seen before it is entered (the page that asks who comes to it).
  static country(terrain: string | undefined, key: string): string | undefined {
    const views = Commissioned.first(this.views[terrain ?? ''], this.views.wild);
    return views.length ? views[this.hash(key) % views.length] : undefined;
  }
  // The way into a town, as a new game's opening paints it (OWN-17): by the land its arrival is told in (the approach
  // lines of data/origins/tables.json, by terrain, the road out from under the trees where a terrain has none of its
  // own), never a sight the words deny (a frost town's way in, told by its snow-fences, turf roofs and peat, had opened
  // on boats drawn up in a pale bay: the opening's critique). The country the life was chosen over, where it is one of
  // these, so that the painting behind the choice sharpens into the way in.
  static readonly approaches: Record<string, string[]> = Commissioned.lists(table.approaches);
  static approach(screen: Screen, country?: string): string | undefined {
    const terrain = screen.region?.terrain?.replace(/^.*__/, '') ?? '';
    const season = /; (\w+)$/.exec(screen.date?.long ?? '')?.[1];
    // Where the approaches of its land are only old masters, the land's own country (Commissioned); and where none of
    // a list fits the sky it opens under, the next (a marsh's one dusk bog in rain by day had opened on nothing, with
    // the country's own rain to hand: the painting misses of 27 November, OR-1760).
    const lists = [this.approaches[terrain] ?? this.approaches.forest, this.views[terrain], this.views.wild];
    for (const own of lists.filter(l => l?.length).map(l => [...l!])) {
      const all = season === 'winter' && !own.some(v => this.winter.has(v)) && this.winterOpen.length ? this.winterOpen
        : this.seasonal(own, season);
      // Never against the sky it opens under (BRIEF §3.4): a sunlit way in had been free to open a storm.
      const views = this.own(screen, all.filter(v => Fits.fits(screen, v)));
      if (!views.length) { continue; }
      return country && views.includes(country) ? country : views[this.hash(screen.place.id) % views.length];
    }
    return undefined;
  }
  // What is painted in winter is shown only in winter (a frozen river with skaters was shown on 23 Midsummer); and in
  // winter, where a kind has a winter painting, one of those (a cold country's town in summer is a grey northern bay,
  // in winter its frozen river: a fresh play had a leafy fair for a town of snow-fences and turf roofs).
  static readonly winter = new Set(table.winter);
  // In winter, the way in through a country whose own paintings are all of leaf: a calm winter's open country instead
  // (M22's second review, OR-46: "snowy, Deepwinter" over a summer wood after an opening of sheep in leaf).
  static readonly winterOpen: string[] = Commissioned.only(table.winterOpen);
  // An author's own painting for a place of theirs, kept before any kind's (data/paintings/scenery.json, places); or
  // several, the first that fits the place as it now is (Palla's waterfront in the sun of the dry, and in the rains).
  static readonly places: Record<string, string | string[]> = Commissioned.places(table.places);
  // That painting, where it fits the place as it now is: the camp in the lee had been its campfire by night at noon,
  // and the Arcology's sunlit terraces stood in the rain (BRIEF §3.4); where it does not, the kind's choice, or none.
  // A stock opening's room is the opening's own, by its id within it (region__s1_adit_mouth is adit__mouth); and one
  // place's paintings of its seasons are one family, the season's shown (OR-447: the valley below the adit's mouth).
  static authored(screen: Screen): string | undefined {
    const id = screen.place.id, own = this.places[id] ?? this.places[id.replace(/^region__s\d+_([a-z]+)_(\w+)$/, '$1__$2')];
    const season = /; (\w+)$/.exec(screen.date?.long ?? '')?.[1];
    return this.seasonal([own ?? []].flat(), season).find(p => Fits.fits(screen, p));
  }
  // Under a roof (a room of a building, anywhere within a level of a site not said to be open, or a room whose kind
  // is seen from within: a shop off the market-place), no country is painted: the Hall cellar at Merrow had opened on
  // a sunlit wood (Mission 18's first walk), and a picture that contradicts the place is worse than none.
  static of(screen: Screen): string | undefined {
    const roofed = this.roofed(screen), season = /; (\w+)$/.exec(screen.date?.long ?? '')?.[1];
    const own = this.authored(screen);
    if (roofed && !own) { return undefined; }
    // A town by night is a town's night, its windows lit, not the wild's moon over dark country.
    const night = Commissioned.first(this.views[`night:${this.where(screen)}`], this.views.night);
    if (screen.dark) { return this.pick(this.seasonal(night, season), screen.place.id, screen); }
    if (own) { return own; }
    const where = this.where(screen), named = SceneKinds.of(screen);
    const known = named && SceneKinds.views(named, { roofed: false, underground: false });
    // A kind seen from within (a taproom, a cellar) is not painted as the country, nor is one with nothing to show.
    if (known && (!named!.kind.ground || !known.length)) { return undefined; }
    // A kind none of whose paintings fits the sky now (a sunlit market-place in rain, a garden at night) gives way to
    // what it lies in, painted for that sky (the town's own rain, its lit windows): never one against it, and never
    // none while one fits (the painting misses of a new life's first steps, 27 November, OR-1760).
    const kind = known && this.pick(this.seasonal(known, season), screen.place.id, screen);
    if (kind) { return kind; }
    // A site's ground, named by a name and no kind (Seolforfyrd), by the kind the map knows it for (a ruin): the
    // toll-house of dressed stone on the water had been a sunny glade with stags in it (Mission 20's first cold round).
    const mark = screen.region?.land?.marks.find(m => m.id === screen.place.id);
    const sited = mark && SceneKinds.kinds.find(k => k.kind === mark.kind)?.ground;
    const site = sited?.length ? this.pick(this.seasonal(sited, season), screen.place.id, screen) : undefined;
    return site ?? this.land(screen, where, season);
  }
  // What a place is painted by where its kind is not: its land's form, its settlement's land, its terrain, its kind
  // of where; the first of these with a painting that fits the sky now, and after dark its where's night (a town's
  // lit windows, the wild's moon), which the hour's own rule keeps from the day.
  private static land(screen: Screen, where: 'site' | 'settlement' | 'wild', season?: string): string | undefined {
    const area = screen.region?.areas.find(a => a.here);
    const form = area?.form?.replace(/^land_/, ''), terrain = screen.region?.terrain?.replace(/^.*__/, '');
    // A site whose own paintings were only old masters is painted by its land (Commissioned).
    const keys = where === 'site' ? ['site', terrain, 'wild'].filter((k): k is string => !!k)
      : [form && `${where}:${form}`, terrain && where === 'settlement' && `settlement:${terrain}`,
        where === 'wild' ? terrain : undefined, where].filter((k): k is string => !!k);
    const night = screen.expedition?.daylight && screen.expedition.daylight !== 'day'
      ? [`night:${where}`, 'night'] : [];
    for (const k of [...keys, ...night]) {
      const view = this.pick(this.seasonal(this.views[k] ?? [], season), screen.place.id, screen);
      if (view) { return view; }
    }
    return undefined;
  }
  // Under a roof or under the ground, a painting of a room of the kind, not of the country (the owner, 4 November:
  // the cellar's page had only words where a picture should be): a taproom by a tankard on its shelf, a crypt by a
  // skull, a tower's hall by its stair; none where nothing in the corpus is of the kind (a forge, the rat-runs, a
  // spiders' brood), which the page draws as a dim ground (the owner, 7 November: a dark room is better than a
  // cathedral for a taproom). With no kind, a site's deep rooms are its vaults and stairs; elsewhere, nothing.
  static inside(screen: Screen): string | undefined {
    const own = this.authored(screen);
    if (own) { return own; }
    const at = { roofed: this.roofed(screen), underground: !!screen.place.underground };
    const named = SceneKinds.of(screen, k => !!SceneKinds.painted(k, at));
    // A room's paintings keep to the season as the country's do (a tower's top in frost had stood for a summer room).
    const season = /; (\w+)$/.exec(screen.date?.long ?? '')?.[1];
    const known = named && SceneKinds.views(named, at);
    const site = screen.path.some(p => p.kind === 'site');
    const kind = known && this.varied(this.seasonal(known, season), screen, named!);
    // Deep in a site, a kind whose commissioned rooms do not fit the place (a scrivener's window four levels down) is
    // the site's vaults and passages, as one of no kind is (the old masters had fitted: Commissioned).
    if (known && (kind || !(at.underground && site))) { return kind; }
    const views = at.underground ? this.within[site ? 'underground:site' : 'underground'] : this.within.indoors;
    return this.pick(views ?? [], screen.place.id, screen);
  }
  // What the scene shows: the country, or a room of its kind; in the dark the same room, which the page draws barely
  // seen (SceneSurface); or nothing, where nothing fits, and the page shows a dim ground in its place.
  // One place's paintings at other lights, seasons or weather are one family (OR-446): a base and its suffix
  // (harbor and harbor-rain, keep-tower and keep-tower-winter), named so by the painter. The page dissolves one into
  // another of its family over a few seconds, where the sky turns over the place, and cuts to another place's.
  static readonly variants: readonly string[] = ['dawn', 'dusk', 'night', 'spring', 'summer', 'autumn', 'winter',
    'rain', 'fog', 'mist', 'snow', 'storm'];
  static family(painting: string): string {
    const m = /^(.+)-([a-z]+)$/.exec(painting);
    return m && this.variants.includes(m[2]!) ? m[1]! : painting;
  }
  // Whether going from one painting to another, at one place, is a dissolve: two of one family, not the same one.
  static dissolves(from: string | undefined, to: string | undefined): boolean {
    return !!from && !!to && from !== to && this.family(from) === this.family(to);
  }
  static seen(screen: Screen): string | undefined {
    const lit = screen.dark ? { ...screen, dark: false } : screen;
    return (screen.dark && !this.roofed(screen) ? this.of(screen) : undefined) ?? this.of(lit) ?? this.inside(lit);
  }
  // Or said itself to be indoors: the old corn-store, in the town's open, had been shown as the granary from outside.
  static roofed(screen: Screen): boolean {
    return !!screen.place.underground || !!screen.place.indoors
      || (!screen.place.open && screen.path.some(p => p.kind === 'building' || p.kind === 'level'));
  }
  private static where(screen: Screen): 'site' | 'settlement' | 'wild' {
    const kinds = screen.path.map(p => p.kind);
    return kinds.includes('site') ? 'site' : kinds.includes('settlement') ? 'settlement' : 'wild';
  }
  // A room's painting, unlike its neighbours' (the owner and two playtests, 7 November: every barrow room had one
  // painting): within one site or settlement, the rooms its words name differently (the crypt, the ossuary, the vault)
  // are given the kind's paintings in turn from one the site is given; any other, by its own id.
  private static varied(all: string[], screen: Screen, named: Named): string | undefined {
    const views = all.filter(v => Fits.fits(screen, v));
    const within = [...screen.path].reverse().find(p => p.kind === 'site' || p.kind === 'settlement');
    const turn = named.word ? named.kind.words.indexOf(named.word) : -1;
    if (!views.length || !within || turn < 0) { return this.pick(views, screen.place.id); }
    return views[(this.hash(within.id) + turn) % views.length];
  }
  // One of a kind's paintings, the same for a place each time; none from an empty list.
  // Where the place is given, only those that do not show what it denies (see Fits): none, if none fits.
  private static pick(all: string[], id: string, screen?: Screen): string | undefined {
    const views = screen ? this.own(screen, all.filter(v => Fits.fits(screen, v))) : all;
    return views.length ? views[this.spread(id) % views.length] : undefined;
  }
  // Of those that fit, the ones painted in the sky's own weather where there are any (rain in the rain, fog in the
  // fog): a town's lane in fog had stood for its market-place in rain with the lane in rain beside it.
  static own(screen: Pick<Screen, 'weather'>, views: string[]): string[] {
    const sky = this.weathers.find(([said]) => said.test(screen.weather ?? ''))?.[1];
    const own = sky ? views.filter(v => sky.test(Fits.looked(v)?.weather ?? '')) : [];
    return own.length ? own : views;
  }
  private static readonly weathers: [RegExp, RegExp][] = [[/rain|storm|drizzle|squall|sleet|gale/, /rain|storm/],
    [/fog|mist/, /fog|mist/], [/snow/, /snow/]];
  // A painting of a season (data/paintings/scenery.json: spring, summer, autumn, winter) is shown only in it: an autumn
  // lake had nothing to keep it from a spring morning. Only winter's are preferred in their season.
  private static seasonal(views: string[], season?: string): string[] {
    const cold = views.filter(v => this.winter.has(v));
    if (season === 'winter' && cold.length) { return cold; }
    return views.filter(v => !Object.entries(this.seasons).some(([s, own]) => s !== season && own.has(v)));
  }
  private static readonly seasons: Record<string, ReadonlySet<string>> = { winter: this.winter,
    spring: new Set(table.spring), summer: new Set(table.summer), autumn: new Set(table.autumn) };
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
