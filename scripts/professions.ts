// The professions the portraits show that Orsino's backgrounds do not name (the owner, 3 November: hundreds of trades,
// Orsino's two hundred and the portraits' more, unified, their details built out where missing). Each painting of a
// person (data/paintings/registry.json) is of a calling of life, and the census put it in one of the fourteen kinds;
// one not already Orsino's becomes a profession of that kind, its scores those most of its kind's Orsino rows give,
// its purse the kind's middle purse by its station (a high one more, a low one less), its likeness its painting.
// Written to data/catalog/professions.json, with where each came from; run again after the census changes.
//   bun scripts/professions.ts
import { readFileSync, writeFileSync } from 'node:fs';

interface Painting { id: string; title?: string; seen?: { station?: string; shows?: string; sex?: string };
  concept?: { kind?: string; family?: string } }
interface Row { attributes: Record<string, number>; gold: number }
class Professions {
  // The one portrait the census left without a kind, and the kind its calling is of.
  static readonly kindless: Record<string, string> = { reeve: 'court' };
  static run() {
    const paintings = (JSON.parse(readFileSync('data/paintings/registry.json', 'utf8')) as { paintings: Painting[] })
      .paintings.filter(p => p.concept?.kind === 'person');
    const orsino = (JSON.parse(readFileSync('data/catalog/orsino/backgrounds.json', 'utf8')) as
      { backgrounds: Record<string, Row> }).backgrounds;
    const kinds = (JSON.parse(readFileSync('data/catalog/backgrounds.json', 'utf8')) as
      { backgroundKind: { groups: Record<string, string[]> } }).backgroundKind.groups;
    const out: Record<string, unknown> = {};
    for (const p of paintings) {
      const id = p.id.replace(/-/g, '_'), kind = p.concept?.family ?? this.kindless[p.id];
      if (orsino[id] || !kind || !kinds[kind]) { continue; }
      const rows = kinds[kind]!.map(k => orsino[k]!).filter(Boolean);
      out[id] = { name: this.title(p.id), kind, attributes: this.usual(rows), gold: this.purse(rows, p.seen?.station),
        painting: p.id, ...p.seen?.station ? { station: p.seen.station } : {},
        source: { kyr: true, notes: `The portrait ${p.id} (${p.title ?? 'untitled'}): a profession of ${kind}, its scores `
          + `those most of its kind's give, its purse its kind's by its station.` } };
    }
    writeFileSync('data/catalog/professions.json', `${JSON.stringify({ about: 'The professions the portraits show '
      + 'beyond Orsino\'s backgrounds, each of a kind of life, written by scripts/professions.ts from the paintings\' '
      + 'census (data/paintings/registry.json): its scores and purse derived from its kind\'s Orsino rows.',
    professions: out }, null, 1)}\n`);
    console.log(`${Object.keys(out).length} professions`);
  }
  // The scores most of a kind's rows give, as given (a kind of the faith is wisdom and charisma).
  private static usual(rows: Row[]): Record<string, number> {
    const counts = new Map<string, number>();
    for (const r of rows) { const key = JSON.stringify(r.attributes); counts.set(key, (counts.get(key) ?? 0) + 1); }
    const [best] = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return best ? JSON.parse(best[0]) as Record<string, number> : {};
  }
  // The middle purse of the kind, half again for a high station and half as much for a low one.
  private static purse(rows: Row[], station?: string): number {
    const golds = rows.map(r => r.gold).sort((a, b) => a - b), mid = golds[Math.floor(golds.length / 2)] ?? 20;
    return Math.max(1, Math.round(station === 'high' ? mid * 1.5 : station === 'low' ? mid / 2 : mid));
  }
  private static title(id: string): string { const s = id.replace(/-/g, ' '); return s.charAt(0).toUpperCase() + s.slice(1); }
}
Professions.run();
