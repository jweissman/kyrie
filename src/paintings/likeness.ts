import type { World } from '../lang/world';
import { PaintingConcepts } from './painting-concepts';
import { Installed } from '../ports/installed';
import type { LikenessResources } from '../ports/presentation';

// Who a portrait shows, as recorded by looking at it (data/paintings/seen.json, through bun scripts/paintings.ts).
// What is said of someone a painting is chosen for (see Likeness.of).
export interface Asked { own?: string; background?: string; profession?: string; role?: string; name?: string;
  sex?: 'man' | 'woman' }
export interface Sitter { sex: 'man' | 'woman'; age?: string; station?: string; era: string; face: number }
// Whom a painting is wanted for: as much as the world knows of them.
export interface Wanted { sex?: 'man' | 'woman'; age?: string; stations?: string[]; concept?: string; mourning?: boolean;
  homely?: boolean;
  // Someone's parent, painted by no young sitter (see Likeness.parents).
  elder?: boolean;
  // Said in so many words to be young (a lad, a girl), painted as no one grown (see Likeness.youths).
  youth?: boolean }

// The painting shown beside someone: one of the corpus (data/paintings), chosen by what it shows, not by its file's
// name. It is not a picture of them; it is a painting of someone who could be: of their sex, their station and, where
// one fits, their very work (a fisher beside the painting of a fisherman, if it shows a fisherman of their sex). A
// country gives each of its people a painting of their own (see Portraits). Where the world names one (Likeness
// "fisherman" in Kyr), that is the one.
export class Likeness {
  private static readonly empty: LikenessResources = {
    ids: [], credits: {}, stations: {}, faces: {}, sitters: {}, unfit: [] };
  private static readonly indexes = new WeakMap<LikenessResources, { ids: Set<string>; unfit: Set<string>;
    sitters: Map<string, Sitter> }>();
  private static get resources(): LikenessResources {
    return Installed.current().presentation?.likenesses ?? this.empty;
  }
  private static index(): { ids: Set<string>; unfit: Set<string>; sitters: Map<string, Sitter> } {
    const data = this.resources, cached = this.indexes.get(data);
    if (cached) { return cached; }
    const sitters = new Map(Object.entries(data.sitters).map(([id, s]) => {
      const [sex, age, station, era, face] = s.split('|');
      return [id, { sex: sex as Sitter['sex'], ...age ? { age } : {}, ...station ? { station } : {}, era: era!,
        face: Number(face) }] as [string, Sitter];
    }));
    const index = { ids: new Set(data.ids), unfit: new Set(data.unfit), sitters };
    this.indexes.set(data, index);
    return index;
  }
  static get ids(): Set<string> { return this.index().ids; }
  static get credits(): Record<string, string> { return this.resources.credits; }
  static get stations(): Record<string, string> { return this.resources.stations; }
  static get faces(): Record<string, number> { return this.resources.faces; }
  static get sitters(): Map<string, Sitter> { return this.index().sitters; }
  // Works of the same name, said differently by Orsino's backgrounds and the painters.
  static readonly synonyms: Record<string, string> = { smith: 'blacksmith', woodworker: 'carpenter', herdsman: 'shepherd',
    laborer: 'peasant', beadle: 'reeve', acolyte: 'deacon', stone_mason: 'mason', woodcutter: 'feller', skinner: 'furrier',
    innkeeper: 'tavernkeeper', herbwife: 'midwife', 'herb-wife': 'midwife', pedlar: 'peddler', woodwright: 'carpenter', fisher: 'fisherman', traveller: 'wanderer',
    wayfarer: 'wanderer', tracker: 'hunter', pilgrim: 'penitent', chandler: 'candlemaker', salter: 'merchant',
    steward: 'reeve', bailiff: 'reeve', landlord: 'tavernkeeper', landlady: 'tavernkeeper', foreman: 'mason',
    barge: 'sailor', boatman: 'sailor', ferryman: 'sailor', carter: 'peasant', drover: 'shepherd',
    'alehouse-keeper': 'tavernkeeper', alehouse: 'tavernkeeper', speaks: 'reeve', shrine: 'prayer' };
  // The stations a family of work is painted in, first the likeliest.
  static readonly families: Record<string, string[]> = { trade: ['middling', 'labouring'],
    learning: ['learned', 'middling'], stage: ['player', 'artist'], faith: ['religious'], court: ['high'],
    arms: ['martial'], shadows: ['middling', 'labouring'], wild: ['labouring'], roads: ['labouring', 'middling'],
    healing: ['middling', 'learned'], water: ['labouring'], earth: ['labouring'], mechanisms: ['middling', 'labouring'],
    margins: ['labouring'] };
  // What the game will not cast for someone of its own making (data/paintings/unfit.json): a severed head, another
  // world's saints, a king for an innkeeper.
  static get unfit(): Set<string> { return this.index().unfit; }
  static sitter(id: string): Sitter | undefined { return this.sitters.get(id); }
  // The best painting for someone among those not yet taken: their work's own painting if it shows someone of their
  // sex; else one of their sex and station, of their age if it can be, in an older manner before a newer; ties settled
  // by their own name, so the same person has the same painting. One taken (by someone of their country) is never
  // theirs: a widow in black and a sick child's mother of two villages had been one smiling woman gutting a fish (the
  // cold evaluation's M17-65). One held further off (a country away) is theirs only where nothing else fits as well.
  static choose(who: Wanted, key: string, taken: ReadonlySet<string> = new Set(),
    held: ReadonlySet<string> = new Set()): string | undefined {
    return this.best(who, key, { taken, held });
  }
  // The same among the paintings that are of them (see fits), where `fitting`: the best left that is, not the best
  // left whether or not it is (a lad's painting refused as a greybeard's when a grown man's was there to give).
  private static best(who: Wanted, key: string,
    at: { taken: ReadonlySet<string>; held?: ReadonlySet<string>; fitting?: boolean }): string | undefined {
    const concept = who.concept && this.resolve(who.concept);
    let best: string | undefined, score = -Infinity;
    for (const [id, s] of this.sitters) {
      if ((who.sex && s.sex !== who.sex) || this.unfit.has(id) || at.taken.has(id) || (who.elder && s.age === 'young')
        || (at.fitting && !this.fits(id, who))) {
        continue;
      }
      // For one known only by whose they are, being at home is their station, and their age says which.
      const station = who.homely ? -1 : who.stations?.indexOf(s.station ?? '') ?? -1;
      const value = (id === concept ? 60 : 0) + (station >= 0 ? 20 - station * 6 : 0)
        + (who.age && s.age === who.age ? 6 : 0) + (who.mourning && this.mourning.has(id) ? 30 : 0)
        + (who.homely && this.homely.has(id) ? 25 : 0)
        + Likeness.eras[s.era]! - (at.held?.has(id) ? 80 : 0)
        + this.hash(`${key}:${id}`) / 2 ** 32;
      if (value > score) { score = value; best = id; }
    }
    return best;
  }
  static readonly eras: Record<string, number> = { early: 4, late: 3, modern: 0 };
  // Sitters dressed for grief, quiet and in black, for one who mourns (a widow in black was a smiling woman gutting a
  // fish: the cold evaluation).
  static readonly mourning = new Set(['needleworker', 'midwife', 'brewer', 'conspirator', 'memory']);
  // Sitters at home, not at a trade, for someone known only by whose they are: a sick child's mother had been the
  // woman cutting a fish on a board, one of the two grown women of the working people's paintings (play 9; the cold
  // evaluation's M17-65). A woman in a white cap and collar, seated; a young woman at a window, watching the road.
  static readonly homely = new Set(['opium-eater', 'medium', 'polymath', 'bystander', 'tragedian', 'milkmaid',
    'reminiscence']);
  // A painting for someone the world has not given one, from the words it knows them by: their work, and what they
  // are to others, which says their age (a mother is no girl: the follow-up review saw one younger than her son), and
  // the title they go by (Mother Ysolt is a woman of years). It is a painting of their work, or of someone of their
  // sex and station; where nothing says their station, or no painting is of it, there is none, and they are met in
  // words (Mother Ysolt was a young Samson, an alehouse-keeper a preacher, the inn's dog an auctioneer).
  // The painting of someone's work, where their work has one of its own (a tavernkeeper's), whoever else holds it.
  static work(at: Asked): string | undefined {
    const { concept } = this.read(at);
    return concept && this.sitters.has(concept) && !this.unfit.has(concept) ? concept : undefined;
  }
  // What someone's words say: the words themselves, whose they are, and their work.
  private static read(at: Asked): { words: string[]; kin?: string; concept?: string } {
    // A name that is a description ("the prior", "the woman in black") says what they are as a role does.
    const described = /^the /i.test(at.name ?? '') ? this.words(at.name!) : [];
    const words = [at.profession, at.background, ...this.words(at.role ?? ''), ...described]
      .filter((t): t is string => !!t);
    // Whose someone is comes before anything said after it: "a widow whose son went after the raiders" is no raider.
    const k = words.findIndex(w => Object.hasOwn(this.kin, w)), kin = k < 0 ? undefined : words[k]!;
    const concept = words.slice(0, k < 0 ? undefined : k).map(w => this.resolve(w)).find(Boolean);
    return { words, ...kin ? { kin } : {}, ...concept ? { concept } : {} };
  }
  // `sole`: whether their work's own painting is theirs (CO-03): it is one worker's in a world, and every other of
  // the work is painted by their station, as one whose work has no painting is.
  static of(at: Asked & { key?: string; taken?: ReadonlySet<string>; held?: ReadonlySet<string>; sole?: boolean }):
    string | undefined {
    if (at.own && this.ids.has(at.own)) { return at.own; }
    const { words, kin, concept: read } = this.read(at);
    const concept = at.sole === false && read && this.work(at) ? undefined : read;
    // A work whose own painting is not of one person (a priest's is a shrine) is painted in its family's station.
    // A painting refused (data/paintings/unfit.json) lends nothing: not even the station it shows.
    const own = read && !this.unfit.has(read) ? this.stations[read] : undefined;
    // One of a work whose painting is another's is painted in the work's family's station (the painting's own says
    // none, as a tavernkeeper's does not).
    const family = read && this.families[PaintingConcepts.of(read).family ?? '']?.[0];
    const station = read && (concept === read ? own ?? family : own || family);
    const title = this.titles[(at.name ?? '').split(' ')[0]!.toLowerCase()];
    const sex = at.sex ?? title?.sex ?? (kin && this.kin[kin]);
    const age = words.map(w => this.ages[w]).find(Boolean) ?? title?.age;
    if (!sex && concept && this.sitters.has(concept) && !this.unfit.has(concept) && !at.taken?.has(concept)
      && !at.held?.has(concept)) { return concept; }
    // Someone known only by whose they are (the child's mother, the drover's son) is one of the working people.
    if (!station && !kin) { return undefined; }
    const mourning = /\b(widow|widower|mourning|grieving|bereaved|in black)\b/i.test(`${at.role ?? ''} ${at.name ?? ''}`);
    // Known by nothing but whose they are ("the child's mother"), not by a work said after it ("who cooks at the inn");
    // or someone's parent, whose work is no painting's (the mother of one come home had been the one grown woman of
    // the working people's paintings, stern under a wreath: play 10).
    const parent = words.some(w => this.parents.has(w));
    const homely = !concept && !!kin && (this.clauses(at.role ?? '').length === 1 || parent);
    const painted = station ?? 'labouring', wanted: Wanted = { ...sex ? { sex } : {}, ...concept ? { concept } : {},
      ...age ? { age } : {}, ...mourning ? { mourning } : {}, ...homely ? { homely } : {},
      ...parent ? { elder: true } : {}, ...words.some(w => this.youths.has(w)) ? { youth: true } : {} };
    // Where none of their station is left to them (the country's people hold every grown woman of the working people's
    // paintings), one of the station beside it: a sick child's mother in a middling woman's cap and collar.
    for (const stations of [[painted], ...(this.beside[painted] ?? []).map(s => [s])]) {
      const id = this.best({ ...wanted, stations }, at.key ?? words.join(' '),
        { taken: at.taken ?? new Set(), ...at.held ? { held: at.held } : {}, fitting: true });
      if (id) { return id; }
    }
    return undefined;
  }
  // The stations one of a station may be painted in where none of their own is left.
  static readonly beside: Record<string, string[]> = { labouring: ['middling'], middling: ['labouring'] };
  // Whether a painting is one of them: their work's, one of grief for one who mourns, one at home for one known by
  // whose they are; or one of their station, not a girl for a woman of years, nor a greybeard for a lad.
  private static fits(id: string, who: Wanted): boolean {
    const sitter = this.sitters.get(id), age = who.age;
    const far = !!sitter?.age && ((!!age && Math.abs(this.years.indexOf(age) - this.years.indexOf(sitter.age)) > 1)
      || (!!who.elder && sitter.age === 'young') || (!!who.youth && sitter.age !== 'young'));
    return (!!who.concept && id === this.resolve(who.concept)) || (!!who.mourning && this.mourning.has(id))
      || (!!who.homely && this.homely.has(id)) || (sitter?.station === who.stations?.[0] && !far);
  }
  // The paintings some people are given as their own (a likeness, by the painting's id, which is the name of the
  // entity the likeness names): those taken on a page.
  static owned(world: World, ids: string[], named: ReadonlyMap<string, { name: string }>): Set<string> {
    if (!world.relates('likeness')) { return new Set(); }
    return new Set(ids.flatMap(id => {
      const own = world.one('likeness', id);
      return own ? [named.get(own)?.name ?? own] : [];
    }));
  }
  static readonly years = ['young', 'adult', 'old'];
  static readonly kin: Record<string, 'man' | 'woman'> = { mother: 'woman', father: 'man', sister: 'woman',
    brother: 'man', wife: 'woman', husband: 'man', widow: 'woman', widower: 'man', daughter: 'woman', son: 'man',
    woman: 'woman',
    grandmother: 'woman', grandfather: 'man', uncle: 'man', aunt: 'woman', nephew: 'man', niece: 'woman' };
  static readonly ages: Record<string, string> = { mother: 'adult', father: 'adult', wife: 'adult', husband: 'adult',
    widow: 'adult', widower: 'adult', grandmother: 'old', grandfather: 'old', elder: 'old', crone: 'old',
    sister: 'young', brother: 'young', daughter: 'young', son: 'young', lad: 'young', boy: 'young', youth: 'young',
    girl: 'young', lass: 'young' };
  // Whoever is called a lad or a girl is young and no older: a brother "taller by a head than when you went away" had
  // been a balding man in a ruff (OR-30), a son being any grown man.
  static readonly youths = new Set(['lad', 'boy', 'youth', 'girl', 'lass']);
  // Whoever is someone's parent is no younger than a grown child: a drover's son had been an old man, and the mother
  // of one come home after three years a girl cutting a fish (play 10).
  static readonly parents = new Set(['mother', 'father', 'grandmother', 'grandfather']);
  // The titles a name can begin with, and what each says of whoever bears it.
  static readonly titles: Record<string, { sex: 'man' | 'woman'; age?: string }> = {
    mother: { sex: 'woman', age: 'old' }, sister: { sex: 'woman' }, dame: { sex: 'woman' }, lady: { sex: 'woman' },
    mistress: { sex: 'woman' }, goodwife: { sex: 'woman', age: 'adult' }, gammer: { sex: 'woman', age: 'old' },
    father: { sex: 'man', age: 'old' }, brother: { sex: 'man' }, master: { sex: 'man' }, sir: { sex: 'man' },
    lord: { sex: 'man' }, goodman: { sex: 'man', age: 'adult' }, gaffer: { sex: 'man', age: 'old' } };
  // Words that are in a role without naming a work ("master of the barge Heron" is not a painter).
  static readonly vague = new Set(['master', 'mistress', 'keeper', 'head', 'chief', 'young', 'elder']);
  private static resolve(word: string): string | undefined {
    // A work said as what is done ("who cooks at the inn") is the work; a dyke-reeve is a reeve.
    return [word, this.synonyms[word], word.replace(/_/g, '-'), word.replace(/s$/, ''), word.split('-').at(-1)]
      .find(id => id && !this.vague.has(id) && this.ids.has(id));
  }
  // The words of a role, the work first: what a role is comes before what it is of ("priest of the Chapel of the
  // Ford" is a priest, not a chapel), and in each part the last word is the work ("the old dyke-reeve").
  private static words(role: string): string[] { return this.clauses(role).flatMap(part => part.reverse()); }
  // A role's clauses, each its words: "the drover's wife, who cooks at the inn" is three, "the child's mother" one.
  // Whose someone is says nothing of what they are, nor whose another is: the drover's son, "a lad who wants to go
  // after his father", had been painted as a drover and a parent, a grown man, under "taller by a head than when you
  // went away" (OR-30). Short words are none, but a son's or a lad's.
  private static clauses(role: string): string[][] {
    return role.toLowerCase().replace(/[a-z-]+['’]s\b|\b(?:his|her|their|its)\s+[a-z-]+/g, ' ').replace(/[^a-z\- ]/g, ' ')
      .split(/\b(?:of|at|in|on|from|by|for|to|with|who|whose|that)\b/)
      .map(part => part.split(/\s+/).filter(w => w.length > 3 || this.short.has(w))).filter(part => part.length);
  }
  static readonly short = new Set(['son', 'lad', 'boy']);
  private static hash(text: string): number {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h = Math.imul(h ^ text.charCodeAt(i), 16777619); }
    return h >>> 0;
  }
  static src(id: string): string { return `paintings/${id}.webp`; }
  // A painting as the page shows someone by it: small and large copies, where the face sits, and its credit.
  static portrait(id: string): { src: string; large: string; focus: number; credit?: string } {
    const credit = this.credits[id];
    return { src: this.src(id), large: this.large(id), focus: this.focus(id), ...credit ? { credit } : {} };
  }
  static large(id: string): string { return `paintings/large/${id}.webp`; }
  // Where to hold a painting when it is cropped: at the face, as a percentage of its height.
  static focus(id: string): number { return this.sitters.get(id)?.face ?? this.faces[id] ?? 30; }
}
