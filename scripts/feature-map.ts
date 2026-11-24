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

type PinState = 'met' | 'missing' | 'unwritten';
// A pin of a feature (test/features), or of an experience family (the experiential pins: AGENTS.md, the register's
// §41), with its family.
interface Pin { file: string; describe: string; name: string; state: PinState; feature: string; family?: string }
interface Feature { id: string; name: string; paths: string[] }
interface Capability { id: string; title: string; feature: string; pins?: string[]; words?: string[]; default?: boolean;
  about?: string }
interface Section { name: string; about?: string; capabilities: Capability[] }
interface Aspect { n: string; name: string; about: string; sections: Section[] }
interface Family { n: number; name: string; about: string; specs: Record<string, string> }
interface Atlas { features: Feature[]; experience: Family[]; pins: { files: Record<string, string>;
  describes: Record<string, string> } }
interface Behaviour { describe: string; feature: string; family?: string; pins: Pin[]; words: Set<string> }
type Placed = ReturnType<typeof PlanningInstruments.placed>[number];

export class FeatureMap {
  static readonly out = 'doc/architecture/feature-map.md';
  static read(): Atlas {
    return JSON.parse(readFileSync('doc/architecture/features.json', 'utf8')) as Atlas;
  }
  // The tree: aspects, their sections, each section's capabilities (doc/architecture/feature-map.json).
  static tree(): Aspect[] {
    return (JSON.parse(readFileSync('doc/architecture/feature-map.json', 'utf8')) as { aspects: Aspect[] }).aspects;
  }
  static capabilities(): Capability[] { return this.tree().flatMap(a => a.sections.flatMap(s => s.capabilities)); }
  // The capability a row of the register is on: of its feature's, the first whose words it says, else the default.
  static placed(row: { what: string; feature: string }, caps: Capability[]): Capability | undefined {
    const of = caps.filter(c => c.feature === row.feature), text = row.what.toLowerCase();
    return of.find(c => (c.words ?? []).some(w => text.includes(w))) ?? of.find(c => c.default);
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
  // Everything composed, capability by capability, and the negative space (the owner: "flush out negative space in
  // the design"): capabilities named and neither built nor asked for, those pinned that no row asks for (a request to
  // file, under the capability's own title), those asked for that no pin proves, and the pins not yet met.
  static data() {
    const atlas = this.read(), pins = this.pins(atlas), rows = PlanningInstruments.placed(), caps = this.capabilities();
    const behaviours = this.behaviours(pins), byId = new Map(atlas.features.map(f => [f.id, f]));
    const ctx = { rows, behaviours, byId, at: new Map(rows.map(r => [r.id, this.placed(r, caps)?.id])) };
    const tree = this.tree().map(a => ({ n: a.n, name: a.name, about: a.about, sections: a.sections.map(s => ({
      name: s.name, about: s.about, capabilities: s.capabilities.map(c => this.composed(c, ctx)) })) }));
    const all = tree.flatMap(a => a.sections.flatMap(s => s.capabilities.map(c => ({ ...c, aspect: a.n,
      section: s.name }))));
    return { aspects: tree,
      families: atlas.experience.map(e => ({ n: e.n, name: e.name, about: e.about,
        specs: behaviours.filter(b => b.family === e.name).length })),
      counts: { capabilities: all.length, pins: pins.length, met: pins.filter(p => p.state === 'met').length,
        missing: pins.filter(p => p.state === 'missing').length, unwritten: pins.filter(p => p.state === 'unwritten').length,
        experience: pins.filter(p => p.family).length, rows: rows.length,
        defects: rows.filter(r => r.kind === 'defect').length },
      negative: {
        unbuilt: all.filter(c => !c.behaviours.length && !c.asks.length && !c.defects.live)
          .map(c => ({ id: c.id, title: c.title,
          section: c.section })),
        unasked: all.filter(c => c.behaviours.length && !c.asks.length)
          .map(c => ({ id: c.id, title: c.title, section: c.section,
          acceptance: c.behaviours.flatMap(b => b.pins.map(p => `${this.mark(p.state)} ${p.name}`)) })),
        unpinned: all.filter(c => !c.behaviours.length && c.asks.length)
          .map(c => ({ id: c.id, title: c.title, section: c.section,
          asks: c.asks })),
        unplaced: behaviours.filter(b => !caps.some(c => (c.pins ?? []).includes(b.describe))).map(b => b.describe),
        open: pins.filter(p => p.state !== 'met').map(p => ({ ...p })) } };
  }
  // One capability composed: the pins it holds, and the live rows placed on it, by kind.
  static composed(c: Capability, ctx: { rows: Placed[]; behaviours: Behaviour[]; byId: Map<string, Feature>;
    at: Map<string, string | undefined> }) {
    const live = ctx.rows.filter(r => ctx.at.get(r.id) === c.id), defects = live.filter(r => r.kind === 'defect');
    const held = ctx.behaviours.filter(b => (c.pins ?? []).includes(b.describe)), f = ctx.byId.get(c.feature);
    return { id: c.id, title: c.title, feature: c.feature, layers: f ? this.layers(f) : [],
      behaviours: held.map(b => ({ describe: b.describe, family: b.family,
        pins: b.pins.map(p => ({ name: p.name, state: p.state })) })),
      defects: { live: defects.length, high: defects.filter(r => PlanningInstruments.high(r)).map(r => this.row(r)) },
      asks: live.filter(r => r.kind !== 'defect').map(r => this.row(r)) };
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
      'Generated by `bun scripts/feature-map.ts --write` from doc/architecture/feature-map.json (the tree: aspects,',
      'sections, capabilities), doc/architecture/features.json (each row\'s feature, the pins\' places, the experience',
      'families), test/features, the experience pins and the register. Do not edit. (The Atlas is the design\'s own: the',
      'page\'s colours and opportunities.)', '',
      `${d.aspects.length} aspects, ${c.capabilities} capabilities; ${c.pins} pins (${c.met} met, ${c.missing} missing, `
      + `${c.unwritten} unwritten; ${c.experience} experience pins in ${d.families.length} families); ${c.rows} live `
      + `rows, ${c.defects} of them defects. ✓ met · ✗ missing · ○ unwritten.`, ''];
    for (const a of d.aspects) {
      out.push(`## ${a.n}. ${a.name}: ${a.about}`, '');
      for (const s of a.sections) {
        out.push(`### ${s.name}`, '');
        for (const k of s.capabilities) {
          out.push(`- **${k.title}** · ${k.behaviours.flatMap(b => b.pins).length} pins · ${k.defects.live} defects`
            + ` · ${k.asks.length} asks`, ...k.behaviours.flatMap(b => b.pins.map(p => `  - ${this.mark(p.state)} ${p.name}`)),
          ...k.asks.map(r => `  - ${r.kind} ${r.id} ${r.pri}: ${this.short(r.what, 100)}`));
        }
        out.push('');
      }
    }
    const n = d.negative;
    return [...out, '## Negative space', '',
      `### Capabilities neither built nor asked for (${n.unbuilt.length})`, '', ...n.unbuilt.map(k => `- ${k.title} (${k.section})`), '',
      `### Capabilities pinned that no request asks for (${n.unasked.length})`, '',
      'Each a request to file under its title, its acceptance the pins that prove or want it.', '',
      ...n.unasked.flatMap(k => [`- **${k.title}** (${k.section})`, ...k.acceptance.map(a => `  - ${a}`)]), '',
      `### Capabilities asked for that no pin proves (${n.unpinned.length})`, '',
      ...n.unpinned.map(k => `- **${k.title}** (${k.section}): ${k.asks.map(r => r.id).join(', ')}`), '',
      `### Pins not yet met (${n.open.length})`, '',
      ...n.open.map(p => `- ${this.mark(p.state)} ${p.name} (${p.describe})`), ''].join('\n');
  }
  // The capabilities as a grouped list, by aspect and section, with their counts only.
  static list(): string {
    return this.data().aspects.flatMap(a => [`${a.n}. ${a.name}`, ...a.sections.flatMap(s => [`  ${s.name}`,
      ...s.capabilities.map(k => `    ${k.title.slice(0, 44).padEnd(45)} pins ${String(k.behaviours.flatMap(b => b.pins)
        .length).padStart(3)} · defects ${String(k.defects.live).padStart(3)} · asks ${k.asks.length}`)])]).join('\n');
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
