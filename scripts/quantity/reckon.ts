import type { Read } from './country';
import type { Reading, Readings } from './measures';
import type { Walked } from './walks';
import { QuantityBestiary } from './bestiary';
import { QuantityLadder } from './ladder';

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
  // Fights begun per game hour at combat places, on each walk that spent half an hour or more at one.
  static places(r: Readings): Reading { return this.ground(r, 'place'); }
  // And on the roads, on each walk that spent an hour or more on them.
  static roads(r: Readings): Reading { return this.ground(r, 'road'); }
  private static ground(r: Readings, g: 'place' | 'road'): Reading {
    const ws = this.walks(r).filter(w => (w.grounds?.[g].minutes ?? 0) >= (g === 'place' ? 30 : 60));
    const each = this.each(ws, w => w.name, w => this.round(w.grounds![g].fights / (w.grounds![g].minutes / 60)));
    return this.of(each, this.median(Object.values(each)), ws.map(w => `${w.name} ${w.grounds![g].fights} in `
      + `${this.round(w.grounds![g].minutes / 60, 10)} h`).join(', '));
  }
  // The combat places within four hours of each first town that two aims or more send a company to.
  static returned(r: Readings): Reading {
    const each = this.each(r.countries, c => c.seed, c => c.returned?.length ?? 0);
    return this.of(each, Math.min(...Object.values(each)), r.countries.map(c => `${c.seed}: ${(c.returned ?? [])
      .join(', ')}`).join('; '));
  }
  // Expeditions back to a combat place, the second or later, that still met a fight and brought something home, over
  // every walk.
  static again(r: Readings): Reading {
    const ws = this.walks(r), again = ws.flatMap(w => (w.grounds?.expeditions ?? []).filter((x, i, all) =>
      all.slice(0, i).some(y => y.place === x.place) && x.fights > 0 && x.reward).map(x => `${w.name}: ${x.place}`));
    return ws.length ? { value: again.length, note: again.slice(0, 4).join('; ') || 'none' }
      : { value: null, note: 'not read' };
  }
  // Fights begun per game hour on each walk.
  static fights(r: Readings): Reading {
    const ws = this.walks(r);
    const each = this.each(ws, w => w.name, w => this.round(w.fights / Math.max(1 / 60, w.minutes / 60)));
    return this.of(each, this.median(Object.values(each)), ws.map(w => `${w.name} ${w.fights} in `
      + `${this.round(w.minutes / 60, 10)} h`).join(', '));
  }
  // Of the bands in the first hour's reach that can fell the one who plays, those the game asks before. Can kill is
  // judged once, by the company's own reckoning (its fights felled the one who plays: Fair.mortal), the fights the game
  // plays to decide what it says; the census's own twelve trials, seeded and fought apart, had found deaths the
  // reckoning's fights had not, and so called a band deadly that the game, by its own fights, had no reason to ask of
  // (OR-322). Those its trials alone found are said, not held.
  static fair(r: Readings): Reading {
    const all = r.countries.flatMap(c => c.fair.map(f => ({ ...f, seed: c.seed })));
    const killing = all.filter(f => f.mortal), unasked = killing.filter(f => !f.warned);
    const apart = all.filter(f => !f.mortal && f.fell > 0);
    return { value: killing.length ? this.pct(killing.length - unasked.length, killing.length) : null,
      each: this.each(r.countries, c => c.seed, c => {
        const k = c.fair.filter(f => f.mortal);
        return this.pct(k.filter(f => f.warned).length, k.length);
      }),
      note: `${killing.length - unasked.length} of ${killing.length}; unasked: ${unasked.slice(0, 4)
        .map(f => `${f.seed} ${f.band} (${f.said})`).join('; ') || 'none'}; felled in the census's trials alone: `
        + `${apart.length}${apart.length ? ` (${apart.slice(0, 3).map(f => `${f.seed} ${f.band}, ${f.said}, fell `
        + `${f.fell}`).join('; ')})` : ''}` };
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
      .map(c => `${c.seed} ${c.economy.worth} lying at what it fetches (${c.economy.listed ?? '?'} listed), `
        + `${c.economy.stock} sold`).join(', ')}`);
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
  // The five expeditions (QuantityExpeditions): those after the first that opened an option and changed the world of
  // the loop; how many preparations differ; and traversal and administration's share of the moves after the first.
  static renewed(r: Readings): Reading {
    const later = (r.expeditions ?? []).slice(1);
    if (!r.expeditions) { return { value: null, note: 'not read' }; }
    return { value: later.filter(t => t.changed.options > 0 && t.changed.world > 0).length, note: later.map(t =>
      `${t.n}: ${t.changed.options} new options, ${t.changed.world} changes, ${t.changed.learned} learned, risk `
      + `${t.changed.risk}, memory ${t.changed.memory}`).join('; ') };
  }
  static prepared(r: Readings): Reading {
    const ts = r.expeditions;
    if (!ts) { return { value: null, note: 'not read' }; }
    const kinds = new Set(ts.map(t => t.prepared.join(',')));
    return { value: kinds.size, note: ts.map(t => `${t.n}: ${t.prepared.join(' ') || 'nothing'}, `
      + `${t.approach.attacks} attacks, ${t.approach.avoided} gone round, turned ${t.approach.turned}, coin ${t.coin}`)
      .join('; ') };
  }
  // The kinds of answer the five expeditions gave what they met below, and each one's own (OR-1392).
  static answered(r: Readings): Reading {
    const ts = r.expeditions;
    if (!ts) { return { value: null, note: 'not read' }; }
    return { value: new Set(ts.flatMap(t => t.answers)).size,
      note: ts.map(t => `${t.n}: ${t.answers.join(' ') || 'none'}`).join('; ') };
  }
  static routine(r: Readings): Reading {
    const ts = (r.expeditions ?? []).slice(1);
    if (!r.expeditions) { return { value: null, note: 'not read' }; }
    const all = ts.reduce((n, t) => n + Object.values(t.moves).reduce((a, b) => a + b, 0), 0);
    const routine = ts.reduce((n, t) => n + t.moves.traversal + t.moves.administration, 0);
    const below = ts.reduce((n, t) => n + (t.routine?.below ?? 0), 0);
    return { value: this.pct(routine, all), note: `${routine} of ${all} moves, ${below} of them below` };
  }
  static kept(r: Readings): Reading {
    const ts = (r.expeditions ?? []).slice(1);
    if (!r.expeditions) { return { value: null, note: 'not read' }; }
    return { value: ts.reduce((n, t) => n + t.watches, 0),
      note: ts.map(t => `${t.n}: ${t.watches} watches, ${t.rooms} rooms known, coin ${t.coin}`).join('; ') };
  }
  // The economy's ladder (QuantityLadder): its rungs held, the expeditions to each, a rung bought out.
  static rungs(r: Readings): Reading { return QuantityLadder.rungsHeld(r.ladder); }
  static rung1(r: Readings): Reading { return QuantityLadder.rung(r.ladder, 1); }
  static rung2(r: Readings): Reading { return QuantityLadder.rung(r.ladder, 2); }
  static bought(r: Readings): Reading { return QuantityLadder.bought(r.ladder); }
  // What a level of the reference dungeon holds to carry home, coin and sold (QuantityDungeon.takes).
  static take1(r: Readings): Reading { return this.take(r, 0); }
  static take2(r: Readings): Reading { return this.take(r, 1); }
  private static take(r: Readings, n: number): Reading {
    const level = r.takes?.[n];
    return level ? { value: level.take, note: (r.takes ?? []).map(l => `${l.id.replace(/^region__s1_ud_/, '')} ${l.take}`)
      .join(', ') } : { value: null, note: 'not read' };
  }
  // Fights begun per game hour by the delver in each seed's first dungeon (QuantityDelver).
  static delved(r: Readings): Reading {
    const ds = (r.delved ?? []).filter(d => d.minutes > 0);
    const each = this.each(ds, d => d.seed, d => this.round(d.fights / (d.minutes / 60)));
    return this.of(each, this.median(Object.values(each)), ds.map(d => `${d.seed} ${d.fights} in ${this.round(d.minutes
      / 60, 10)} h, ${d.rooms} rooms on ${d.levels} levels of ${d.site}`).join('; '));
  }
  // The bestiary's kinds the deep can field (OR-1230), and beside it how many some generated placement can.
  static bestiary(): Reading {
    const unplaced = QuantityBestiary.unplaced();
    return { value: QuantityBestiary.fielded().size, note: `placed ${QuantityBestiary.placed().size}; never placed `
      + `${unplaced.length} (${unplaced.slice(0, 6).join(', ')})` };
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
  // The reference game's first hour, fifteen lives (QuantityLeads): each reading said by life.
  static mouth(r: Readings): Reading {
    if (!r.leads) { return { value: null, note: 'not read' }; }
    const led = r.leads.map(l => l.mouth ?? Infinity);
    return { value: this.median(led), note: r.leads.map(l => `${l.name} ${l.mouth ?? '—'}`).join(', ') };
  }
  static strayed(r: Readings): Reading {
    if (!r.leads) { return { value: null, note: 'not read' }; }
    return { value: r.leads.filter(l => l.wandered === null).length, note: `of ${r.leads.length}; wandered to it in `
      + r.leads.map(l => `${l.name} ${l.wandered ?? '—'}`).join(', ') };
  }
  static colours(r: Readings): Reading {
    if (!r.leads) { return { value: null, note: 'not read' }; }
    return { value: this.median(r.leads.map(l => l.above.length)), note: r.leads.map(l => `${l.name} `
      + `${l.above.join(' ') || 'none'}`).join(', ') };
  }
  static connected(r: Readings): Reading {
    if (!r.leads) { return { value: null, note: 'not read' }; }
    const jobs = [...new Map(r.leads.flatMap(l => l.jobs.map(j => [`${l.name}:${j.id}`, j]))).values()];
    const open = jobs.filter(j => j.opens.length), shut = jobs.filter(j => !j.opens.length);
    return { value: this.pct(open.length, jobs.length), note: `${open.length} of ${jobs.length}; opening nothing: `
      + [...new Set(shut.map(j => j.id))].join(', ') };
  }
  static aimless(r: Readings): Reading {
    if (!r.leads) { return { value: null, note: 'not read' }; }
    const where: Record<string, number> = {};
    for (const l of r.leads) { for (const [k, n] of Object.entries(l.blanks)) { where[k] = (where[k] ?? 0) + n; } }
    return { value: this.median(r.leads.map(l => l.blank.led + l.blank.wandered)), note: Object.entries(where)
      .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, n]) => `${k.replace(/^region__/, '')} ${n}`).join(', ') };
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
