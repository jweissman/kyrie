#!/usr/bin/env bun
// The feature atlas (the owner, 23 and 24 November: "a behavioural map of the product, read top-down and run like a
// test", one with the feature pins, "to flush out negative space in the design"). One tree, generated from the record:
// the aspects (I Gameplay … VI Platform) and their features (doc/architecture/features.json), each feature's
// architectural layers (read from its paths, never kept by hand), its pins (test/features, each describe placed on a
// feature by features.json's pins), and its live rows of the register by kind. Then the negative space: features no
// pin holds; requests (requirements and directions) no pin answers, each with the pin nearest it in words, if any;
// pins no row of the register asks for; and the unwritten and missing pins.
// A pin's state is as its file declares it (it: met; it.failing, "missing:": a proof of what cannot yet be done;
// it.todo, "unwritten:"): scripts/feature-pins.ts runs them, and says which broke.
//   bun scripts/feature-atlas.ts            the tree, printed
//   bun scripts/feature-atlas.ts --list     the features as a grouped list, without the tree's pins
//   bun scripts/feature-atlas.ts --write    the tree written to doc/architecture/feature-atlas.md
import { readFileSync, writeFileSync } from 'node:fs';
import { Glob } from 'bun';
import { PlanningInstruments } from './planning-instruments';
import { RegisterTickets } from './register-tickets';

type PinState = 'met' | 'missing' | 'unwritten';
interface Pin { file: string; describe: string; name: string; state: PinState; feature: string }
interface Feature { id: string; name: string; paths: string[] }
interface Aspect { n: string; name: string; about: string; features: string[] }
interface Atlas { aspects: Aspect[]; features: Feature[]; pins: { files: Record<string, string>;
  describes: Record<string, string> } }
type Placed = ReturnType<typeof PlanningInstruments.placed>[number];

export class FeatureAtlas {
  static readonly out = 'doc/architecture/feature-atlas.md';
  static read(): Atlas {
    return JSON.parse(readFileSync('doc/architecture/features.json', 'utf8')) as Atlas;
  }
  // The architectural layers a feature's paths are in (AGENTS.md: Kyr the language; the runtime; the generic player;
  // the setting), read from where they are.
  static layers(f: Feature): string[] {
    return [...new Set(f.paths.map(p => this.layer(p)))].sort();
  }
  static layer(p: string): string {
    return /^src\/lang\b/.test(p) ? 'language' : /^src\/(campaign|rules)\b/.test(p) ? 'runtime'
      : /^(src\/(world|canon|imbar)|data)\b/.test(p) ? 'setting'
        : /^(src\/(session|presentation|creation|ui|narrative|paintings)|web)\b/.test(p) ? 'player'
          : /^(test|scripts|bin|doc)\b/.test(p) ? 'instruments' : 'other';
  }
  // Every pin, as its file declares it, on the feature its describe (or else its file) is placed on.
  static pins(atlas: Atlas): Pin[] {
    const out: Pin[] = [];
    for (const path of [...new Glob('test/features/*/*.pin.test.ts').scanSync('.')].sort()) {
      const file = path.replace(/^test\/features\//, '').replace(/\.pin\.test\.ts$/, '');
      let describe = '';
      for (const m of readFileSync(path, 'utf8').matchAll(/\b(describe|it|it\.todo|it\.failing)\((['"`])((?:\\.|(?!\2).)*)\2/g)) {
        const words = m[3]!.replace(/\\(.)/g, '$1');
        if (m[1] === 'describe') { describe = words; continue; }
        const state: PinState = m[1] === 'it.todo' ? 'unwritten' : m[1] === 'it.failing' ? 'missing' : 'met';
        const feature = atlas.pins.describes[describe] ?? atlas.pins.files[file] ?? '';
        out.push({ file, describe, name: words.replace(/^(missing|unwritten): /, ''), state, feature });
      }
    }
    return out;
  }
  // The words that carry a phrase's meaning, for finding a pin near a request: none of four letters or fewer.
  private static readonly stop = new Set(['their', 'there', 'which', 'where', 'what', 'that', 'this', 'with', 'from',
    'into', 'when', 'than', 'then', 'each', 'every', 'company', 'player', 'would', 'should', 'about', 'other', 'still',
    'before', 'after', 'being', 'them', 'they', 'were', 'have', 'does', 'said', 'says', 'once', 'only', 'more', 'some']);
  static words(text: string): Set<string> {
    return new Set(text.toLowerCase().replace(/[^\p{L}\s-]/gu, ' ').split(/\s+/)
      .filter(w => w.length > 4 && !this.stop.has(w)).map(w => w.replace(/(ing|ed|es|s)$/, '')));
  }
  // How near two phrases are: the share of the shorter's words the other has too (0 to 1), and how many. Near is three
  // words or more, and a third of the shorter's: a short row had seemed near anything for one word in common.
  static near(a: Set<string>, b: Set<string>): { score: number; shared: number } {
    const shared = [...a].filter(w => b.has(w)).length;
    return { score: shared / Math.max(1, Math.min(a.size, b.size)), shared };
  }
  static close(n: { score: number; shared: number }): boolean { return n.shared >= 3 && n.score >= 0.3; }
  // The pin feature (a describe) nearest a row in words, on the row's own feature first: a candidate, never a claim.
  static nearest(row: { what: string; feature: string }, pins: Pin[]): { describe: string; score: number } | undefined {
    const w = this.words(row.what);
    const by = [...new Set(pins.map(p => p.describe))].map(d => {
      const of = pins.filter(p => p.describe === d), text = `${d} ${of.map(p => p.name).join(' ')}`;
      const { score, shared } = this.near(w, this.words(text));
      return { describe: d, score: score + (of[0]!.feature === row.feature ? 0.05 : 0), shared };
    }).filter(x => this.close(x)).sort((a, b) => b.score - a.score);
    return by[0];
  }
  static mark(state: PinState): string { return state === 'met' ? '✓' : state === 'missing' ? '✗' : '○'; }
  // One feature's part of the tree: its layers, pins by describe, and live rows by kind.
  static feature(f: Feature, pins: Pin[], rows: Placed[]): string[] {
    const mine = pins.filter(p => p.feature === f.id), live = rows.filter(r => r.feature === f.id);
    const defects = live.filter(r => r.kind === 'defect'), high = defects.filter(r => PlanningInstruments.high(r));
    const out = [`### ${f.name} \`${f.id}\` · ${this.layers(f).join(', ')}`, ''];
    const counts = (['met', 'missing', 'unwritten'] as PinState[]).map(s => `${mine.filter(p => p.state === s).length} ${s}`);
    out.push(`Pins: ${mine.length ? counts.join(', ') : '**none**'} · defects: ${defects.length} live (${high.length} `
      + `P0/P1${high.some(r => r.slice) ? `, ${high.filter(r => r.slice).length} in the slice` : ''})`, '');
    for (const d of [...new Set(mine.map(p => p.describe))]) {
      out.push(`- ${d}`, ...mine.filter(p => p.describe === d).map(p => `  - ${this.mark(p.state)} ${p.name}`));
    }
    for (const r of high) { out.push(`- defect ${r.id} ${r.pri}: ${this.short(r.what)}`); }
    for (const kind of ['requirement', 'direction'] as const) {
      for (const r of live.filter(x => x.kind === kind)) { out.push(`- ${kind} ${r.id} ${r.pri}: ${this.short(r.what)}`); }
    }
    return [...out, ''];
  }
  static short(text: string, n = 120): string {
    const one = text.replace(/\s+/g, ' ').trim();
    return one.length > n ? `${one.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : one;
  }
  static tree(atlas: Atlas, pins: Pin[], rows: Placed[]): string[] {
    const byId = new Map(atlas.features.map(f => [f.id, f]));
    const out: string[] = [];
    for (const a of atlas.aspects) {
      out.push(`## ${a.n}. ${a.name}: ${a.about}`, '');
      for (const id of a.features) { out.push(...this.feature(byId.get(id)!, pins, rows)); }
    }
    return out;
  }
  // What the design has not yet said or proved (the owner: "flush out negative space").
  static negative(atlas: Atlas, pins: Pin[], rows: Placed[]): string[] {
    const asks = rows.filter(r => r.kind !== 'defect');
    const unpinned = atlas.features.filter(f => !pins.some(p => p.feature === f.id));
    const unanswered = asks.map(r => ({ r, near: this.nearest(r, pins) }));
    const all = RegisterTickets.rows(RegisterTickets.text()), describes = [...new Set(pins.map(p => p.describe))];
    const unasked = describes.filter(d => !all.some(r => {
      const of = pins.filter(p => p.describe === d), pin = this.words(`${d} ${of.map(p => p.name).join(' ')}`);
      return this.close(this.near(this.words(r.what), pin));
    }));
    const open = pins.filter(p => p.state !== 'met');
    return ['## Negative space', '',
      `### Features no pin holds (${unpinned.length})`, '', ...unpinned.map(f => `- ${f.name} \`${f.id}\``), '',
      `### Requests no pin answers (${unanswered.filter(x => !x.near).length} of ${asks.length})`, '',
      'Each open requirement and direction, with the pin nearest it in words where there is one (a candidate to write or',
      'extend, never a claim that it is met).', '',
      ...unanswered.map(({ r, near }) => `- ${r.id} ${r.pri} ${r.kind} \`${r.feature}\`: ${this.short(r.what, 90)}`
        + (near ? ` → *${near.describe}*` : ' → **none**')), '',
      `### Pins no row asks for (${unasked.length} of ${describes.length})`, '',
      'Behaviours proved or wanted that no row of the register, open or closed, is near in words.', '',
      ...unasked.map(d => `- ${d} \`${pins.find(p => p.describe === d)!.feature}\``), '',
      `### Pins not yet met (${open.length})`, '',
      ...open.map(p => `- ${this.mark(p.state)} ${p.describe}: ${p.name} \`${p.feature}\``), ''];
  }
  static page(): string {
    const atlas = this.read(), pins = this.pins(atlas), rows = PlanningInstruments.placed();
    const met = pins.filter(p => p.state === 'met').length;
    return ['# Feature atlas', '',
      'Generated by `bun scripts/feature-atlas.ts --write` from doc/architecture/features.json (aspects, features,',
      'pins placed), test/features and the register. Do not edit.', '',
      `${atlas.aspects.length} aspects, ${atlas.features.length} features; ${new Set(pins.map(p => p.describe)).size} `
      + `pinned behaviours, ${pins.length} pins (${met} met, ${pins.filter(p => p.state === 'missing').length} missing, `
      + `${pins.filter(p => p.state === 'unwritten').length} unwritten); ${rows.length} live rows `
      + `(${rows.filter(r => r.kind === 'defect').length} defects, ${rows.filter(r => r.kind === 'requirement').length}`
      + ` requirements, ${rows.filter(r => r.kind === 'direction').length} directions). ✓ met · ✗ missing · ○ unwritten.`,
      '', ...this.tree(atlas, pins, rows), ...this.negative(atlas, pins, rows)].join('\n');
  }
  // The features as a grouped list, by aspect, with their counts only.
  static list(): string {
    const atlas = this.read(), pins = this.pins(atlas), rows = PlanningInstruments.placed();
    return atlas.aspects.flatMap(a => [`${a.n}. ${a.name}`, ...a.features.map(id => {
      const live = rows.filter(r => r.feature === id), n = pins.filter(p => p.feature === id).length;
      return `  ${id.padEnd(14)} pins ${String(n).padStart(3)} · defects ${String(live.filter(r => r.kind === 'defect')
        .length).padStart(3)} · asks ${live.filter(r => r.kind !== 'defect').length}`;
    })]).join('\n');
  }
  static run(args: string[]): number {
    if (args.includes('--list')) { console.log(this.list()); return 0; }
    const page = this.page();
    if (args.includes('--write')) { writeFileSync(this.out, `${page}\n`); console.log(`wrote ${this.out}`); return 0; }
    console.log(page);
    return 0;
  }
}

if (import.meta.main) { process.exit(FeatureAtlas.run(process.argv.slice(2))); }
