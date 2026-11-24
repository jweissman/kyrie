import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import seen from '../../data/paintings/seen.json';

interface Seen { form: string; shows: string; light?: string; weather?: string; season?: string }
export interface Painted { id: string; terrain: string; subject: string; light?: string; weather?: string;
  season?: string; shows: string; used: boolean }
// The paintings of places, read against where they are used (AU-54, `kyrie suggest paintings`): what no place,
// adventure or scenery list names yet, grouped by the terrain and the subject its words show (the visual atlas's two
// first axes: the owner, 24 November, gamma's OR-454), with its light, weather and season; and for each terrain the
// subjects no painting shows at all. A starting point for a human-led setting, not a generator of one.
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
  static readonly subjects: [string, RegExp][] = [
    ['city', /\b(city|cathedral|palace|square|market|metropolis|walled|towers)/],
    ['town', /\b(village|town|hamlet|street|inn|cottages|houses)/],
    ['shelter', /\b(hut|cabin|tent|camp|room|hearth|kitchen|chamber|cell|interior)/],
    ['wonder', /\b(arch|ruins?|temple|colossus|waterfall|monument|ancient|statue|obelisk|pyramid|tomb)/],
  ];
  static all(): Painted[] {
    const used = this.used(), paintings = (seen as unknown as { paintings: Record<string, Seen> }).paintings;
    return Object.entries(paintings).filter(([, p]) => this.forms.has(p.form)).map(([id, p]) => {
      const words = p.shows.toLowerCase();
      return { id, terrain: this.terrains.find(([, r]) => r.test(words))?.[0] ?? 'temperate',
        subject: p.form === 'interior' ? 'shelter' : this.subjects.find(([, r]) => r.test(words))?.[0] ?? 'wild',
        ...p.light ? { light: p.light } : {}, ...p.weather ? { weather: p.weather } : {},
        ...p.season ? { season: p.season } : {}, shows: p.shows, used: used.has(id) };
    });
  }
  // Every painting id named anywhere a place or adventure could use it: data (but the paintings' own inventory), the
  // engine and the page.
  static used(): Set<string> {
    const own = new Set(['registry.json', 'seen.json', 'likeness.json', 'fit.json', 'unfit.json']);
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
  // The report: for each terrain, its unused paintings by subject, then the subjects it has no painting of.
  static report(terrain?: string): string[] {
    const all = this.all(), lines: string[] = [], subjects = [...this.subjects.map(([s]) => s), 'wild'];
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
