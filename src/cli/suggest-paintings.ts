import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import seen from '../../data/paintings/seen.json';
import sources from '../../data/paintings/sources.json';

interface Seen { form: string; shows: string; light?: string; weather?: string; season?: string }
export interface Painted { id: string; terrain: string; subject: string; light?: string; weather?: string;
  season?: string; shows: string; used: boolean; filed: boolean }
// The paintings of places, read against where they are used (AU-54, `kyrie suggest paintings`): what no place,
// adventure or scenery list names yet, grouped by the terrain and the subject its words show (the visual atlas's two
// first axes: the owner, 24 November, gamma's OR-454), with its light, weather and season; and for each terrain the
// subjects no painting shows at all. A painting the owner keeps in a terrain's folder is of that terrain
// (data/paintings/sources.json: assets/bg/terrain/<t>/); the rest are sorted by their words. A starting point for a
// human-led setting, not a generator of one.
export class SuggestPaintings {
  static readonly root = resolve(import.meta.dir, '../..');
  static readonly forms = new Set(['landscape', 'exterior', 'scene', 'interior']);
  // By the words of what a painting shows, the first that names it (the more particular first).
  static readonly terrains: [string, RegExp][] = [
    ['desert', /\b(desert|dune|sand|oasis|mesa|salt|caravan|camel)/],
    ['tropics', /\b(palm|tropic|jungle|banana|lagoon)/],
    ['frost', /\b(snow|ice|icy|frozen|winter|glacier|tundra)/],
    ['coast', /\b(sea|coast|harbou?r|beach|shore|cove|ship|port|fishing|island|cliffs? above the)/],
    ['mountain', /\b(mountain|peak|alpine|crag|gorge|cave|cavern|pass)/],
    ['marsh', /\b(marsh|fen|swamp|bog|reed)/],
    ['woodland', /\b(forest|wood|woodland|grove|trees|glade)/],
    ['valley', /\b(river|valley|mill|bridge|stream|lake)/],
    ['plains', /\b(plain|field|harvest|heath|pasture|farm|meadow|hay)/],
    ['waste', /\b(ruin|waste|barren|volcano|ash|blasted)/],
  ];
  // The owner's subjects (the direction of 24 November, §6), read from a painting's id and words: an overview, a
  // shelter (where to rest: a safe house, a campfire), a hamlet or town, a city, the wild, a wonder.
  static readonly subjects: [string, RegExp][] = [
    ['overview', /\b(overview|vista|panorama|basin|overlook|far below|to the horizon|seen from (a|the) height)/],
    ['shelter', /\b(campfire|camp|hut|cabin|tent|room|hearth|kitchen|chamber|cell|interior|safehouse|shelter|inn)\b/],
    ['city', /\b(city|cathedral|palace|square|market|metropolis|walled|towers)/],
    ['town', /\b(village|town|hamlet|street|inn|cottages|houses)/],
    ['wonder', /\b(arch|ruins?|temple|colossus|waterfall|monument|ancient|statue|obelisk|pyramid|tomb)/],
  ];
  // The terrain the owner filed each painting under, by its folder.
  static readonly filed: Record<string, string> = Object.fromEntries(Object.entries(
    (sources as unknown as { sources: Record<string, { terrain?: string }> }).sources)
    .flatMap(([id, src]) => src.terrain ? [[id, src.terrain]] : []));
  static all(): Painted[] {
    const used = this.used(), paintings = (seen as unknown as { paintings: Record<string, Seen> }).paintings;
    return Object.entries(paintings).filter(([, p]) => this.forms.has(p.form)).map(([id, p]) => {
      const words = `${id.replace(/-/g, ' ')} ${p.shows.toLowerCase()}`, filed = this.filed[id];
      return { id, terrain: filed ?? this.terrains.find(([, r]) => r.test(words))?.[0] ?? 'temperate', filed: !!filed,
        subject: p.form === 'interior' ? 'shelter' : this.subjects.find(([, r]) => r.test(words))?.[0] ?? 'wild',
        ...p.light ? { light: p.light } : {}, ...p.weather ? { weather: p.weather } : {},
        ...p.season ? { season: p.season } : {}, shows: p.shows, used: used.has(id) };
    });
  }
  // Every painting id named anywhere a place or adventure could use it: data (but the paintings' own inventory), the
  // engine and the page.
  static used(): Set<string> {
    const own = new Set(['registry.json', 'seen.json', 'likeness.json', 'fit.json', 'unfit.json', 'sources.json']);
    const text = [...this.files('data', own), ...this.files('src', own), ...this.files('web', own)]
      .map(f => readFileSync(f, 'utf8')).join('\n');
    return new Set([...text.matchAll(/["'`]([a-z0-9][a-z0-9-]*)["'`]/g)].map(m => m[1]!));
  }
  private static files(dir: string, skip: Set<string>): string[] {
    const path = join(this.root, dir);
    return readdirSync(path).flatMap(name => {
      const full = join(path, name);
      if (statSync(full).isDirectory()) { return name === 'node_modules' ? [] : this.files(join(dir, name), skip); }
      return /\.(json|kyrt?|tsx?)$/.test(name) && !skip.has(name) ? [full] : [];
    });
  }
  static readonly order = ['shelter', 'overview', 'town', 'city', 'wild', 'wonder'];
  // The paintings wanted, by terrain and subject: how many there are of each, the resting scenes (shelter) first, a
  // subject with none the ask (the owner: "I need to add a safehouse or campfire for the woodlands").
  // The owner's own scene paintings (those in sources.json), by every principal terrain (the direction's eight, the
  // mountain's caves its own folder) and every terrain the owner has a folder for, so that a terrain with none shows.
  static readonly principal = ['plains', 'coast', 'desert', 'valley', 'waste', 'sky', 'mountain', 'cave', 'woodland'];
  static needed(): string[] {
    const own = new Set(Object.keys((sources as unknown as { sources: object }).sources));
    const all = this.all().filter(p => own.has(p.id));
    const terrains = [...new Set([...this.principal, ...Object.values(this.filed), ...all.map(p => p.terrain)])].sort();
    const rows = terrains.map(t => {
      const here = all.filter(p => p.terrain === t), filed = here.filter(p => p.filed).length;
      const cells = this.order.map(s => here.filter(p => p.subject === s).length);
      const asks = this.order.filter((_s, i) => !cells[i]);
      return `| ${t} | ${here.length}${filed ? ` (${filed} filed)` : ''} | ${cells.map(n => n || '**0**').join(' | ')} | `
        + `${asks.length ? asks.join(', ') : '—'} |`;
    });
    return [`| Terrain | Paintings | ${this.order.join(' | ')} | Wanted first |`,
      `|---|---|${this.order.map(() => '---').join('|')}|---|`, ...rows];
  }
  // The table written into the one list of paintings wanted (doc/design/paintings-needed.md), between its markers.
  static readonly list = join(this.root, 'doc/design/paintings-needed.md');
  static write(): void {
    const text = readFileSync(this.list, 'utf8'), begin = '<!-- by-terrain -->', end = '<!-- /by-terrain -->';
    const at = text.indexOf(begin), to = text.indexOf(end);
    if (at < 0 || to < at) { throw new Error(`${this.list} has no ${begin} … ${end} to write between`); }
    writeFileSync(this.list, `${text.slice(0, at + begin.length)}\n${this.needed().join('\n')}\n${text.slice(to)}`);
  }
  // The report: for each terrain, its unused paintings by subject, then the subjects it has no painting of.
  static report(terrain?: string): string[] {
    const all = this.all(), lines: string[] = [], subjects = this.order;
    const terrains = [...new Set(all.map(p => p.terrain))].filter(t => !terrain || t === terrain).sort();
    for (const t of terrains) {
      const here = all.filter(p => p.terrain === t), free = here.filter(p => !p.used);
      lines.push(`${t}: ${here.length} paintings, ${free.length} unused`);
      for (const s of subjects) {
        for (const p of free.filter(x => x.subject === s)) {
          const sky = [p.season, p.weather, p.light].filter(Boolean).join(', ');
          lines.push(`  ${s.padEnd(8)} ${p.id}: ${p.shows}${sky ? ` (${sky})` : ''}`);
        }
      }
      const none = subjects.filter(s => !here.some(p => p.subject === s));
      if (none.length) { lines.push(`  no painting yet of: ${none.join(', ')}`); }
    }
    return lines;
  }
}
