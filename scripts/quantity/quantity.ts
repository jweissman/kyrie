#!/usr/bin/env bun
// The quantity gate (the owner, 24 November: "for symmetry [with scripts/quality], a script/quantity which asserts
// similar conditions but over the world"): the world's numbers, read over generated countries and walked runs, each
// held as a band (between a floor and a ceiling) or a ratchet (allowed only to fall, or only to rise), or said and not
// yet held. The quality gate reads the experience's numbers; this one reads what the world gives it to be made of:
// how often there is a fight and whether a deadly one is asked, what money there is against what it buys, how dense
// the Atlas's marks are, what is near the first town, how varied and how far the first hour's aims, the first
// dungeon, and what authored content no world reaches. Each composes the instruments that already read it
// (doc/architecture/quantity.md).
//   bun scripts/quantity/quantity.ts [--update | --rebase] [--only walks,delve,expeditions,countries,stranded]
//     [--seeds iscoed,a1,thorn]
// Bands are written by hand in baseline.json, each with its reason in measures.ts. --update writes a ratchet where it
// has moved the right way (or has no baseline yet), so the ratchet holds the gain; --rebase writes every ratchet as
// read, for when a change is meant to move one the wrong way (say why in the commit).
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ActivationCensus } from '../activation-census';
import { QuantityCountry } from './country';
import { QuantityMeasures, type Measure, type Reading, type Readings } from './measures';
import { QuantityWalks } from './walks';
import { QuantityDelver } from './delver';
import { QuantityExpeditions } from './expeditions';
import { Reckon } from './reckon';

type Group = 'walks' | 'delve' | 'expeditions' | 'countries' | 'stranded';
export interface Baseline {
  bands: Record<string, { floor?: number; ceiling?: number }>; ratchets: Record<string, number>;
}

export class Quantity {
  static readonly file = join(import.meta.dir, 'baseline.json');
  static readonly seeds = ['iscoed', 'a1', 'thorn'];
  static option(args: string[], name: string): string | undefined {
    const at = args.findIndex(a => a === `--${name}` || a.startsWith(`--${name}=`));
    if (at < 0) { return undefined; }
    return args[at]!.includes('=') ? args[at]!.split('=')[1] : args[at + 1];
  }
  static async gather(seeds: string[], groups: Group[]): Promise<Readings> {
    const r: Readings = { gold: [], countries: [] };
    if (groups.includes('walks')) {
      r.golden = await QuantityWalks.golden();
      for (const seed of seeds) { r.gold.push(await QuantityWalks.gold(seed)); console.error(`walked ${seed}`); }
    }
    if (groups.includes('delve')) {
      r.delved = [];
      for (const seed of seeds) { r.delved.push(await QuantityDelver.walk(seed)); console.error(`delved ${seed}`); }
    }
    if (groups.includes('expeditions')) { r.expeditions = await QuantityExpeditions.run(); console.error('expeditions'); }
    if (groups.includes('countries')) {
      for (const seed of seeds) { r.countries.push(await QuantityCountry.read(seed)); console.error(`read ${seed}`); }
    }
    if (groups.includes('stranded')) { r.stranded = await ActivationCensus.stranded(seeds); }
    return r;
  }
  // Whether a reading holds: a band, every value read within it (each seed's or walk's); a ratchet, against its
  // baseline the right way; a report always.
  static holds(m: Measure, read: Reading, base: Baseline): boolean {
    if (read.value === null) { return true; }
    if (m.kind === 'band') {
      const band = base.bands[m.id] ?? {}, values = read.each ? Object.values(read.each) : [read.value];
      return values.every(v => (band.floor === undefined || v >= band.floor) && (band.ceiling === undefined
        || v <= band.ceiling));
    }
    const was = base.ratchets[m.id];
    if (m.kind === 'report' || was === undefined) { return true; }
    return m.kind === 'down' ? read.value <= was : read.value >= was;
  }
  static held(m: Measure, base: Baseline): string {
    if (m.kind === 'band') {
      const b = base.bands[m.id] ?? {};
      return `${b.floor ?? '…'} to ${b.ceiling ?? '…'}`;
    }
    const was = base.ratchets[m.id];
    return m.kind === 'report' ? 'said' : `${m.kind === 'down' ? '≤' : '≥'} ${was ?? '—'}`;
  }
  static baseline(): Baseline {
    const read = existsSync(this.file) ? JSON.parse(readFileSync(this.file, 'utf8')) as Partial<Baseline> : {};
    const bands = { ...Object.fromEntries(QuantityMeasures.all.filter(m => m.kind === 'band')
      .map(m => [m.id, { ...m.floor !== undefined ? { floor: m.floor } : {}, ...m.ceiling !== undefined
        ? { ceiling: m.ceiling } : {} }])), ...read.bands ?? {} };
    return { bands, ratchets: read.ratchets ?? {} };
  }
  // A ratchet written where it moved the right way or was never written; every one, rebased.
  static update(base: Baseline, m: Measure, read: Reading, rebase: boolean): void {
    if (read.value === null || (m.kind !== 'up' && m.kind !== 'down')) { return; }
    const was = base.ratchets[m.id];
    if (rebase || was === undefined || (m.kind === 'down' ? read.value < was : read.value > was)) {
      base.ratchets[m.id] = read.value;
    }
  }
  static table(rows: { m: Measure; read: Reading; ok: boolean; held: string }[]): string[] {
    return ['| Measure | Kind | Now | Held | Holds | Note |', '|---|---|---|---|---|---|',
      ...rows.map(({ m, read, ok, held }) => `| ${m.label} | ${m.kind === 'band' ? 'band' : m.kind === 'report'
        ? 'report' : `ratchet ${m.kind}`} | ${read.value ?? '—'}${read.each ? ` (${Object.values(read.each).join(' / ')})`
        : ''} | ${held} | ${ok ? 'yes' : '**no**'} | ${read.note.replace(/\|/g, '/')} |`)];
  }
  // The reading kept where `kyrie suggest adventure` reads it (not in the tree: a cache, as the parse store is).
  static readonly kept = join(import.meta.dir, '../../node_modules/.cache/kyrie-quantity/last.json');
  static keep(rows: { m: Measure; read: Reading; ok: boolean }[]): void {
    try {
      mkdirSync(dirname(this.kept), { recursive: true });
      writeFileSync(this.kept, JSON.stringify({ at: new Date().toISOString(), rows: rows.map(({ m, read, ok }) =>
        ({ id: m.id, label: m.label, value: read.value, ok })) }));
    } catch { /* A reading not kept is only not said. */ }
  }
  static async run(args: string[]): Promise<number> {
    const groups = (this.option(args, 'only')?.split(',') ?? ['walks', 'delve', 'expeditions', 'countries', 'stranded']) as Group[];
    const seeds = this.option(args, 'seeds')?.split(',') ?? this.seeds;
    const readings = await this.gather(seeds, groups), base = this.baseline(), rebase = args.includes('--rebase');
    const rows = QuantityMeasures.all.map(m => {
      const read = Reckon[m.read](readings);
      return { m, read, ok: this.holds(m, read, base), held: this.held(m, base) };
    }).filter(x => x.read.value !== null || x.read.note !== 'not read');
    const out = this.table(rows);
    console.log(out.join('\n'));
    this.keep(rows);
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Quantity\n\n${out.join('\n')}\n`);
    }
    if (args.includes('--update') || rebase) {
      for (const x of rows) { this.update(base, x.m, x.read, rebase); }
      writeFileSync(this.file, `${JSON.stringify(base, null, 1)}\n`);
      return 0;
    }
    return rows.some(x => !x.ok) ? 1 : 0;
  }
}

if (import.meta.main) { process.exit(await Quantity.run(process.argv.slice(2))); }
