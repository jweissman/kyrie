#!/usr/bin/env bun
// The scenes still to paint, from the scene census (scripts/scene-census.ts), never kept by hand (the owner, 24
// November: "many things that are in the ask list are now in backgrounds and clearly named but still being asked for").
// For each kind of place blank under some sky in the worlds read, how many places and under which skies; and where one
// of the owner's paintings is named for that kind and painted for a missing sky but not yet bound to it
// (data/paintings/scenery.json), that painting, to bind rather than to paint.
//   bun scripts/scene-census.ts iscoed iscoed.json; bun scripts/scene-census.ts a1 a1.json
//   bun scripts/scene-asks.ts iscoed.json a1.json [--write]   --write puts it in doc/design/paintings-needed.md
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import scenery from '../data/paintings/scenery.json';
import seen from '../data/paintings/seen.json';
import sources from '../data/paintings/sources.json';

interface Row { id: string; name: string; kind: string; blank: string[] }
interface Kind { kind: string; words: string[]; ground?: string[]; room?: string[]; parts?: Record<string, string[]> }
interface Seen { light?: string; weather?: string }
export class SceneAsks {
  static readonly list = join(import.meta.dir, '../doc/design/paintings-needed.md');
  static readonly skies = ['fair day', 'rain by day', 'fair evening', 'fair night', 'rain by night'];
  // A painting's light and weather against a sky, as the fit rules read them (src/ui/painted-sky.ts), roughly: for
  // naming a painting that could serve, not for judging it.
  static serves(p: Seen, sky: string): boolean {
    const wet = p.weather === 'rain' || p.weather === 'storm', dark = /night|lamplit|dim|moon/.test(p.light ?? '');
    if (sky === 'fair day') { return !wet && /sunlit|daylight|bright|overcast/.test(p.light ?? ''); }
    if (sky === 'rain by day') { return wet && !dark; }
    if (sky === 'fair evening') { return !wet && /dusk|lamplit/.test(p.light ?? ''); }
    if (sky === 'fair night') { return !wet && dark; }
    return wet && dark || p.light === 'lamplit';
  }
  // Paintings held back from their kinds, and why (paintings-needed.md, Held back): named so, never suggested to bind.
  static readonly held: [RegExp, string][] = [[/^scene-(road|country-lane)\b/, 'held back for OR-182']];
  // Paintings looked at for a kind and refused (the lead, 24 November, by contact sheet): named for it, not of it.
  static readonly refused: Record<string, string[]> = {
    home: ['scene-counting-house', 'scene-mint-house', 'scene-oast-house', 'scene-desert-house', 'scene-woodland-house',
      // Bound to the named Houses by place (scenery.json places): a House in rain is still to paint.
      'scene-great-house'],
    mine: ['scene-mine-face', 'scene-mine-furnace-hall', 'scene-mine-ore-pass', 'scene-mine-pump-room',
      'scene-mine-sump', 'scene-mine-winze'],
    tower: ['scene-tower-roof'],
    ruin: ['scene-ruins-keep-overlook', 'scene-desert-ruins-dusk', 'scene-ruins-elevator-station', 'scene-ruins-elevator',
      'scene-ruins-flooded', 'scene-ruins-hall', 'scene-ruins-terrace', 'scene-ruins-tribunal'],
    overlook: ['scene-city-overlook', 'scene-floating-isle-overlook', 'scene-ruins-keep-overlook', 'scene-desert-overlook',
      'scene-alpine-overlook'],
    woodwork: ['scene-toymaker-workshop'],
    sea: ['scene-sea-cliffs', 'scene-seacoast'],
    fort: ['scene-gate-yard-rain', 'scene-keep-bailey-rain', 'scene-ruins-keep-tower-rain', 'scene-ruins-gates'],
  };
  static bound(k: Kind): Set<string> {
    return new Set([...k.ground ?? [], ...k.room ?? [], ...Object.values(k.parts ?? {}).flat()]);
  }
  static table(rows: Row[]): string[] {
    const kinds = (scenery as unknown as { kinds: Kind[] }).kinds;
    const looked = (seen as unknown as { paintings: Record<string, Seen> }).paintings;
    const own = Object.keys((sources as unknown as { sources: object }).sources);
    const by = new Map<string, Row[]>();
    for (const r of rows.filter(x => x.blank.length)) { by.set(r.kind, [...by.get(r.kind) ?? [], r]); }
    const out = [...by].sort((a, b) => b[1].length - a[1].length).map(([kind, places]) => {
      const missing = this.skies.filter(s => places.some(p => p.blank.includes(s)));
      const k = kinds.find(x => x.kind === kind), bound = k ? this.bound(k) : new Set<string>();
      const words = k?.words ?? [kind];
      // Named for the kind: a whole part of its id is one of the kind's words (oast is no part of coast).
      const named = own.filter(id => !bound.has(id) && !this.refused[kind]?.includes(id)
        && id.split('-').some(part => words.includes(part)))
        .filter(id => missing.some(s => looked[id] && this.serves(looked[id]!, s)));
      const names = [...new Set(places.map(p => p.name))].slice(0, 3).join('; ');
      return `| ${kind} | ${places.length} | ${missing.map(s => `${s} (${places.filter(p => p.blank.includes(s)).length})`)
        .join(', ')} | ${this.painted(named)} | ${names} |`;
    });
    return ['| Kind | Places blank | Under which sky (places) | Painted already? | For example |',
      '|---|---|---|---|---|', ...out];
  }
  // What to do about a kind's blanks: bind the paintings named for it, or say they are held back, or paint.
  static painted(named: string[]): string {
    const held = named.filter(n => this.held.some(([r]) => r.test(n))), free = named.filter(n => !held.includes(n));
    const why = held.length ? `${held.map(n => `\`${n}\``).join(', ')} (${this.held.find(([r]) => r.test(held[0]!))![1]})`
      : '';
    return free.length ? `**bind:** ${free.map(n => `\`${n}\``).join(', ')}${why ? `; ${why}` : ''}` : why || 'paint';
  }
  static write(lines: string[], worlds: string): void {
    const text = readFileSync(this.list, 'utf8'), begin = '<!-- scene-asks -->', end = '<!-- /scene-asks -->';
    const at = text.indexOf(begin), to = text.indexOf(end);
    if (at < 0 || to < at) { throw new Error(`${this.list} has no ${begin} … ${end}`); }
    writeFileSync(this.list, `${text.slice(0, at + begin.length)}\nMeasured ${new Date().toISOString().slice(0, 10)} `
      + `over ${worlds}.\n\n${lines.join('\n')}\n${text.slice(to)}`);
  }
  static main(args: string[]): number {
    const files = args.filter(a => a.endsWith('.json'));
    const rows = files.flatMap(f => JSON.parse(readFileSync(f, 'utf8')) as Row[]);
    const lines = this.table(rows);
    if (args.includes('--write')) { this.write(lines, files.map(f => f.split('/').pop()!.replace(/\.json$/, ''))
      .join(' and ')); }
    console.log(lines.join('\n'));
    return 0;
  }
}

if (import.meta.main) { process.exit(SceneAsks.main(process.argv.slice(2))); }
