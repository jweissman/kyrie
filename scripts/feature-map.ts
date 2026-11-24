#!/usr/bin/env bun
// The feature map (the owner, 23 and 24 November: "a behavioural map of the product, read top-down and run like a
// test", one with the feature pins, "to flush out negative space in the design"). One tree, generated from the record:
// the aspects (I Gameplay … VI Platform) and their features (doc/architecture/features.json), each feature's
// architectural layers (read from its paths, never kept by hand), its pins (test/features, each describe placed on a
// feature by features.json's pins), and its live rows of the register by kind. Then the negative space: features no
// pin holds; requests (requirements and directions) no pin answers, each with the pin nearest it in words, if any;
// pins no row of the register asks for; and the unwritten and missing pins.
// A pin's state is as its file declares it (it: met; it.failing, "missing:": a proof of what cannot yet be done;
// it.todo, "unwritten:"): scripts/feature-pins.ts runs them, and says which broke.
//   bun scripts/feature-map.ts            the tree, printed
//   bun scripts/feature-map.ts --list     the features as a grouped list, without the tree's pins
//   bun scripts/feature-map.ts --write    the tree written to doc/architecture/feature-map.md
//   bun scripts/feature-map.ts --json     all of it composed, as data (for a page drawn from it)
import { readFileSync, writeFileSync } from 'node:fs';
import { Glob } from 'bun';
import { PlanningInstruments } from './planning-instruments';
import { RegisterTickets } from './register-tickets';

type PinState = 'met' | 'missing' | 'unwritten';
// A pin of a feature (test/features), or of an experience family (the experiential pins: AGENTS.md, the register's
// §41), with its family.
interface Pin { file: string; describe: string; name: string; state: PinState; feature: string; family?: string }
interface Feature { id: string; name: string; paths: string[] }
interface Aspect { n: string; name: string; about: string; features: string[] }
interface Family { n: number; name: string; about: string; specs: Record<string, string> }
interface Atlas { aspects: Aspect[]; features: Feature[]; experience: Family[]; pins: { files: Record<string, string>;
  describes: Record<string, string> } }
interface Behaviour { describe: string; feature: string; family?: string; pins: Pin[]; words: Set<string> }
type Placed = ReturnType<typeof PlanningInstruments.placed>[number];

export class FeatureMap {
  static readonly out = 'doc/architecture/feature-map.md';
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
  // Every pin, as its file declares it: the feature pins on the feature their describe (or else their file) is placed
  // on, then the experience pins, each family's specs on the feature features.json places them on.
  static pins(atlas: Atlas): Pin[] {
    const out: Pin[] = [];
    for (const path of [...new Glob('test/features/*/*.pin.test.ts').scanSync('.')].sort()) {
      const file = path.replace(/^test\/features\//, '').replace(/\.pin\.test\.ts$/, '');
      out.push(...this.declared(path).map(d => ({ ...d, file,
        feature: atlas.pins.describes[d.describe] ?? atlas.pins.files[file] ?? '' })));
    }
    for (const family of atlas.experience) {
      for (const [file, feature] of Object.entries(family.specs)) {
        out.push(...this.declared(`${file}.test.ts`).map(d => ({ ...d, file, feature, family: family.name })));
      }
    }
    return out;
  }
  // A spec's describes and its cases, each as it is declared (it: met; it.failing: missing; it.todo: unwritten).
  static declared(path: string): { describe: string; name: string; state: PinState }[] {
    const out: { describe: string; name: string; state: PinState }[] = [];
    let describe = '';
    for (const m of readFileSync(path, 'utf8').matchAll(/\b(describe|it|it\.todo|it\.failing)\((['"`])((?:\\.|(?!\2).)*)\2/g)) {
      const words = m[3]!.replace(/\\(.)/g, '$1');
      if (m[1] === 'describe') { describe = words; continue; }
      const state: PinState = m[1] === 'it.todo' ? 'unwritten' : m[1] === 'it.failing' ? 'missing' : 'met';
      out.push({ describe, name: words.replace(/^(missing|unwritten): /, ''), state });
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
  static short(text: string, n = 120): string {
    const one = text.replace(/\s+/g, ' ').trim();
    return one.length > n ? `${one.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : one;
  }
  // A pinned behaviour (a describe) and the words of all its pins.
  static behaviours(pins: Pin[]): Behaviour[] {
    return [...new Set(pins.map(p => `${p.file}\u0000${p.describe}`))].map(key => {
      const of = pins.filter(p => `${p.file}\u0000${p.describe}` === key), first = of[0]!;
      return { describe: first.describe, feature: first.feature, ...first.family ? { family: first.family } : {},
        pins: of, words: this.words(`${first.describe} ${of.map(p => p.name).join(' ')}`) };
    });
  }
  // Everything composed: the tree, and the negative space (the owner: "flush out negative space in the design"),
  // with the stories the pins imply that no row of the register has asked for.
  static data() {
    const atlas = this.read(), pins = this.pins(atlas), rows = PlanningInstruments.placed();
    const all = RegisterTickets.rows(RegisterTickets.text()), behaviours = this.behaviours(pins);
    const features = atlas.features.map(f => {
      const live = rows.filter(r => r.feature === f.id), defects = live.filter(r => r.kind === 'defect');
      return { id: f.id, name: f.name, layers: this.layers(f),
        behaviours: behaviours.filter(b => b.feature === f.id).map(b => ({ describe: b.describe, family: b.family,
          pins: b.pins.map(p => ({ name: p.name, state: p.state })) })),
        defects: { live: defects.length, high: defects.filter(r => PlanningInstruments.high(r)).map(r => this.row(r)) },
        asks: live.filter(r => r.kind !== 'defect').map(r => this.row(r)) };
    });
    const implied = behaviours.filter(b => !all.some(r => this.close(this.near(this.words(r.what), b.words))))
      .map(b => ({ feature: b.feature, family: b.family,
      story: this.story(b.describe), from: b.describe, acceptance: b.pins.map(p => `${this.mark(p.state)} ${p.name}`) }));
    const requests = rows.filter(r => r.kind !== 'defect').map(r => ({ ...this.row(r), feature: r.feature,
      near: this.nearest(r, pins)?.describe }));
    return { aspects: atlas.aspects.map(a => ({ n: a.n, name: a.name, about: a.about,
      features: a.features.map(id => features.find(f => f.id === id)!) })),
      families: atlas.experience.map(e => ({ n: e.n, name: e.name, about: e.about,
        specs: behaviours.filter(b => b.family === e.name).length })),
      counts: { pins: pins.length, met: pins.filter(p => p.state === 'met').length,
        missing: pins.filter(p => p.state === 'missing').length, unwritten: pins.filter(p => p.state === 'unwritten').length,
        experience: pins.filter(p => p.family).length, rows: rows.length,
        defects: rows.filter(r => r.kind === 'defect').length },
      negative: { unpinned: atlas.features.filter(f => !pins.some(p => p.feature === f.id)).map(f => f.id),
        unanswered: requests.filter(r => !r.near), answered: requests.filter(r => r.near), implied,
        open: pins.filter(p => p.state !== 'met').map(p => ({ ...p })) } };
  }
  static row(r: Placed) {
    return { id: r.id, pri: r.pri, kind: r.kind, slice: r.slice, what: this.short(r.what, 160) };
  }
  // A behaviour said as a request: what the pin proves or wants, as something asked for of the game.
  static story(describe: string): string {
    const said = describe.replace(/^[^›]+›\s*/, '');
    return `${said.charAt(0).toUpperCase()}${said.slice(1)}`;
  }
  static page(): string {
    const d = this.data(), c = d.counts, out = ['# Feature map', '',
      'Generated by `bun scripts/feature-map.ts --write` from doc/architecture/features.json (aspects, features, the',
      'feature pins\' places and the experience families), test/features, the experience pins and the register. Do not',
      'edit. (The Atlas is the design\'s own: the colours and opportunities of the page, doc/design/ATLAS.md.)', '',
      `${d.aspects.length} aspects, ${d.aspects.flatMap(a => a.features).length} features; ${c.pins} pins (${c.met} met, `
      + `${c.missing} missing, ${c.unwritten} unwritten; ${c.experience} of them experience pins, in ${d.families.length}`
      + ` families); ${c.rows} live rows, ${c.defects} of them defects. ✓ met · ✗ missing · ○ unwritten.`, ''];
    for (const a of d.aspects) {
      out.push(`## ${a.n}. ${a.name}: ${a.about}`, '');
      for (const f of a.features) {
        out.push(`### ${f.name} \`${f.id}\` · ${f.layers.join(', ')}`, '', `Pins: ${f.behaviours.flatMap(b => b.pins).length}`
          + ` · defects: ${f.defects.live} live, ${f.defects.high.length} P0/P1`, '');
        for (const b of f.behaviours) {
          out.push(`- ${b.family ? `[${b.family}] ` : ''}${b.describe}`, ...b.pins.map(p => `  - ${this.mark(p.state)} ${p.name}`));
        }
        out.push(...f.defects.high.map(r => `- defect ${r.id} ${r.pri}: ${this.short(r.what)}`),
          ...f.asks.map(r => `- ${r.kind} ${r.id} ${r.pri}: ${this.short(r.what)}`), '');
      }
    }
    const n = d.negative;
    return [...out, '## Negative space', '', `### Features no pin holds (${n.unpinned.length})`, '',
      ...n.unpinned.map(id => `- \`${id}\``), '',
      `### Stories the pins imply, not yet asked for (${n.implied.length})`, '',
      'Each a request to file, its acceptance the pins that already prove or want it.', '',
      ...n.implied.flatMap(i => [`- **${i.story}** \`${i.feature}\`${i.family ? ` [${i.family}]` : ''}`,
        ...i.acceptance.map(a => `  - ${a}`)]), '',
      `### Requests no pin answers (${n.unanswered.length} of ${n.unanswered.length + n.answered.length})`, '',
      ...n.unanswered.map(r => `- ${r.id} ${r.pri} ${r.kind} \`${r.feature}\`: ${this.short(r.what, 100)}`), '',
      'Requests with a pin near them in words (a candidate to extend, never a claim that it is met):', '',
      ...n.answered.map(r => `- ${r.id} \`${r.feature}\` → *${r.near}*`), '',
      `### Pins not yet met (${n.open.length})`, '',
      ...n.open.map(p => `- ${this.mark(p.state)} ${p.describe}: ${p.name} \`${p.feature}\``), ''].join('\n');
  }
  // The features as a grouped list, by aspect, with their counts only.
  static list(): string {
    return this.data().aspects.flatMap(a => [`${a.n}. ${a.name}`, ...a.features.map(f =>
      `  ${f.id.padEnd(14)} pins ${String(f.behaviours.flatMap(b => b.pins).length).padStart(3)} · defects `
      + `${String(f.defects.live).padStart(3)} · asks ${f.asks.length}`)]).join('\n');
  }
  static run(args: string[]): number {
    if (args.includes('--list')) { console.log(this.list()); return 0; }
    if (args.includes('--json')) { console.log(JSON.stringify(this.data())); return 0; }
    const page = this.page();
    if (args.includes('--write')) { writeFileSync(this.out, `${page}\n`); console.log(`wrote ${this.out}`); return 0; }
    console.log(page);
    return 0;
  }
}

if (import.meta.main) { process.exit(FeatureMap.run(process.argv.slice(2))); }
