import type { Read } from './country';
import type { Reading, Readings } from './measures';
import type { Walked } from './walks';

// How each quantity is worked out from what was read (see QuantityMeasures for what each is held to).
export class Reckon {
  static median(xs: number[]): number {
    const s = [...xs].sort((a, b) => a - b);
    return s.length ? s[Math.floor(s.length / 2)]! : 0;
  }
  static round(x: number, by = 100): number { return Math.round(x * by) / by; }
  static pct(k: number, n: number): number { return n ? Math.round((100 * k) / n) : 0; }
  static walks(r: Readings): Walked[] { return [...r.golden ? [r.golden] : [], ...r.gold]; }
  static each<T>(xs: T[], name: (x: T) => string, f: (x: T) => number): Record<string, number> {
    return Object.fromEntries(xs.map(x => [name(x), f(x)]));
  }
  static said(each: Record<string, number>): string {
    return Object.entries(each).map(([k, v]) => `${k} ${v}`).join(', ');
  }
  static of(each: Record<string, number>, value = this.median(Object.values(each)), note = this.said(each)): Reading {
    return Object.keys(each).length ? { value, each, note } : { value: null, note: 'not read' };
  }
  // Fights begun per game hour on each walk.
  static fights(r: Readings): Reading {
    const ws = this.walks(r);
    const each = this.each(ws, w => w.name, w => this.round(w.fights / Math.max(1 / 60, w.minutes / 60)));
    return this.of(each, this.median(Object.values(each)), ws.map(w => `${w.name} ${w.fights} in `
      + `${this.round(w.minutes / 60, 10)} h`).join(', '));
  }
  // Of the bands in the first hour's reach that felled the one who plays in a trial, those the game asks before.
  static fair(r: Readings): Reading {
    const killing = r.countries.flatMap(c => c.fair.filter(f => f.fell > 0).map(f => ({ ...f, seed: c.seed })));
    const unasked = killing.filter(f => !f.warned);
    return { value: killing.length ? this.pct(killing.length - unasked.length, killing.length) : null,
      each: this.each(r.countries, c => c.seed, c => {
        const k = c.fair.filter(f => f.fell > 0);
        return this.pct(k.filter(f => f.warned).length, k.length);
      }),
      note: `${killing.length - unasked.length} of ${killing.length}; unasked: ${unasked.slice(0, 4)
        .map(f => `${f.seed} ${f.band} (${f.said}, fell ${f.fell})`).join('; ')}` };
  }
  static economy(r: Readings): Reading {
    const each = this.each(r.countries, c => c.seed, c => c.economy.ratio);
    return this.of(each, this.median(Object.values(each)), r.countries.map(c => `${c.seed} ${c.economy.day} coin `
      + `(${c.economy.outing ?? ''} ${c.economy.haul ?? ''}, a job ${c.economy.job ?? ''}) against kit ${c.economy.kit} + `
      + `${c.economy.dearest}${c.economy.missing.length ? ` (no ${c.economy.missing.join(', ')})` : ''}`).join(', '));
  }
  // Rows coloured per turn outside a fight's frame, and by tone over every walk.
  static marks(r: Readings): Reading {
    const ws = this.walks(r), tones: Record<string, number> = {};
    const each = this.each(ws, w => w.name, w => {
      const turns = w.turns.filter(t => !t.fight);
      const n = turns.reduce((t, x) => t + Object.values(x.tones).reduce((a, b) => a + b, 0), 0);
      for (const t of turns) { for (const [k, v] of Object.entries(t.tones)) { tones[k] = (tones[k] ?? 0) + v; } }
      return this.round(n / Math.max(1, turns.length), 10);
    });
    const turns = ws.reduce((t, w) => t + w.turns.filter(x => !x.fight).length, 0);
    return this.of(each, this.median(Object.values(each)), `${this.said(each)}; per turn by tone: ${Object.entries(tones)
      .sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${this.round(v / Math.max(1, turns), 10)}`).join(', ')}`);
  }
  // The aims of each seed's first hour (the gold-follower's), by structural kind and by template.
  static variety(r: Readings): Reading {
    const kinds = new Map<string, number>();
    for (const a of r.gold.flatMap(w => w.aims)) { kinds.set(a.kind, (kinds.get(a.kind) ?? 0) + 1); }
    if (!r.gold.length) { return { value: null, note: 'not read' }; }
    return { value: kinds.size, each: this.each(r.gold, w => w.seed, w => new Set(w.aims.map(a => a.kind)).size),
      note: [...kinds].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ') };
  }
  static recurrence(r: Readings): Reading {
    if (r.gold.length < 2) { return { value: null, note: 'fewer than two seeds' }; }
    const sets = r.gold.map(w => new Set(w.aims.map(a => a.key))), all = new Set(sets.flatMap(s => [...s]));
    const everywhere = [...all].filter(k => sets.every(s => s.has(k)));
    return { value: this.pct(everywhere.length, all.size), note: `${everywhere.length} of ${all.size}`
      + `${everywhere.length ? `: ${everywhere.slice(0, 5).join(', ')}` : ''}` };
  }
  static errand(r: Readings): Reading {
    const ws = this.walks(r), done = ws.flatMap(w => w.aims.filter(a => a.done));
    const each = this.each(ws, w => w.name, w => this.median(w.aims.filter(a => a.done).map(a => a.travelled)));
    return this.of(each, this.median(done.map(a => a.travelled)), `${this.said(each)}; ${done.length} aims seen through`);
  }
  static nowhere(r: Readings): Reading {
    const done = this.walks(r).flatMap(w => w.aims.filter(a => a.done)), alone = done.filter(a => a.arrived);
    return { value: done.length ? this.pct(alone.length, done.length) : null, note: `${alone.length} of ${done.length}`
      + `${alone.length ? `: ${alone.slice(0, 3).map(a => a.key).join(', ')}` : ''}` };
  }
  // Of the aims taken up in the first town on the gold-follower's walks, those handed out, not uncovered (%).
  static handed(r: Readings): Reading {
    const town = r.gold.flatMap(w => w.aims.filter(a => a.town).map(a => ({ ...a, seed: w.seed })));
    const handed = town.filter(a => a.town === 'handed');
    return { value: town.length ? this.pct(handed.length, town.length) : null,
      each: this.each(r.gold, w => w.seed, w => this.pct(w.aims.filter(a => a.town === 'handed').length,
        w.aims.filter(a => a.town).length)),
      note: `${handed.length} of ${town.length}${handed.length ? `: ${handed.slice(0, 4).map(a => `${a.seed} ${a.key}`)
        .join(', ')}` : ''}` };
  }
  static minutes(r: Readings): Reading { return this.dungeon(r, d => d.minutes); }
  static hexes(r: Readings): Reading { return this.dungeon(r, d => d.hexes); }
  static ready(r: Readings): Reading {
    return this.dungeon(r, d => Number(d.companion) + Number(d.light) + Number(d.provisions));
  }
  static levels(r: Readings): Reading { return this.dungeon(r, d => d.levels); }
  // At the dungeon itself: someone to hire there, and a light, provisions and gear found by searching near its way in.
  static outfit(r: Readings): Reading {
    return this.dungeon(r, d => [d.at.companion, d.at.light, d.at.provisions, d.at.gear].filter(Boolean).length);
  }
  static bands(r: Readings): Reading { return this.of(this.each(r.countries, c => c.seed, c => c.near)); }
  static treasure(r: Readings): Reading {
    const each = this.each(r.countries, c => c.seed, c => this.round(c.economy.worth / Math.max(1, c.economy.stock)));
    return this.of(each, this.median(Object.values(each)), `${this.said(each)}; ${r.countries
      .map(c => `${c.seed} ${c.economy.worth} lying, ${c.economy.stock} sold`).join(', ')}`);
  }
  static blank(r: Readings): Reading {
    return this.of(this.each(this.walks(r), w => w.name, w => {
      const turns = w.turns.filter(t => !t.fight);
      return this.pct(turns.filter(t => t.none).length, turns.length);
    }));
  }
  static unwitnessed(r: Readings): Reading {
    const ws = this.walks(r), all = ws.flatMap(w => w.turns.flatMap(t => t.unwitnessed.map(u => `${w.name}: ${u}`)));
    return ws.length ? { value: all.length, note: all.slice(0, 3).join('; ') || 'none' } : { value: null, note: 'not read' };
  }
  static reach(r: Readings): Reading {
    const each = this.each(r.countries, c => c.seed, c => c.reach.things.length);
    return this.of(each, Math.min(...Object.values(each)), `${this.said(each)}; ${r.countries.slice(0, 1)
      .map(c => `${c.seed}: ${c.reach.things.join(', ')}`).join('')}`);
  }
  static stranded(r: Readings): Reading {
    const s = r.stranded;
    if (!s) { return { value: null, note: 'not read' }; }
    return { value: Object.values(s).reduce((t, xs) => t + xs.length, 0),
      note: Object.entries(s).map(([k, xs]) => `${k} ${xs.length}${xs.length ? ` (${xs.slice(0, 4).join(', ')})` : ''}`)
        .join('; ') };
  }
  static dungeon(r: Readings, f: (d: NonNullable<Read['dungeon']>) => number): Reading {
    const each = this.each(r.countries, c => c.seed, c => c.dungeon ? f(c.dungeon) : Infinity);
    return this.of(each, this.median(Object.values(each)), r.countries.map(c => `${c.seed} ${c.dungeon?.name ?? 'none'} `
      + `${c.dungeon ? f(c.dungeon) : '—'}`).join(', '));
  }
  // Those who joined, and those an aim was about, with a name of their own (not "the boy", not "a drover").
  static named(name: string): boolean {
    const first = name.split(', ')[0]!.trim();
    return /^[A-Z]/.test(first) && !/^(The|A|An|Some|Someone)\b/.test(first);
  }
  static identity(r: Readings): Reading {
    const people = [...new Map(this.walks(r).flatMap(w => w.people.map(p => [`${w.seed}:${p.id}`, p]))).values()];
    const unnamed = people.filter(p => !this.named(p.name));
    return { value: people.length ? this.pct(people.length - unnamed.length, people.length) : null,
      note: `${people.length - unnamed.length} of ${people.length}${unnamed.length ? `; unnamed: ${unnamed.slice(0, 4)
        .map(p => `${p.name} (${p.why})`).join('; ')}` : ''}` };
  }
}
