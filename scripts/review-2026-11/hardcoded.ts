#!/usr/bin/env bun
// The architecture review of November 2026: how much of the setting the TypeScript names by hand. Every string
// literal in src/ and web/ (read with the TypeScript compiler's own parser, not a regex: string literals, template
// text, literal types), matched whole against the ids the data declares: the catalog's (data/catalog: ancestries,
// callings, backgrounds, professions, abilities, traits, conditions, skills, species, variations, items, deities), the
// shared rules' relations and actions (data/rules), the canon's entities (data/imbar), and the scenarios' and
// adventures' ids (data/scenarios, data/adventures). And literals of six words or more, a measure of prose written in
// code; Kyr written as strings; and, strictly, relations read by name (the first argument of world.one, related,
// relatedTo, measured, relates, declares, stamp, ModuleWriter.call). Counted by layer.
//   bun scripts/review-2026-11/hardcoded.ts [--json] [--examples=<category>] [--names=<category>]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { ModuleParser } from '../../src/lang/module-parser';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import type { Module } from '../../src/lang/module';

interface Hit { file: string; line: number; text: string }
class Hardcoded {
  static readonly layers = ['src/lang', 'src/canon', 'src/rules', 'src/campaign', 'src/world', 'src/session',
    'src/presentation', 'src/narrative', 'src/ui', 'src/cli', 'src/(root)', 'src/other', 'web/engine', 'web/reader',
    'web/other'];
  // Ids too generic to tell from ordinary words in code are left out ('at', 'name', 'fire' would count everything).
  static readonly generic = new Set(['at', 'in', 'on', 'of', 'to', 'name', 'id', 'kind', 'type', 'level', 'all', 'none',
    'any', 'party', 'place', 'group', 'entity', 'item', 'room', 'region', 'site', 'self', 'open', 'closed', 'value',
    'text']);
  static readonly reads = new Set(['related', 'relatedTo', 'one', 'measured', 'relates', 'declares', 'stamp', 'call']);
  static readonly kyr = new RegExp('^\\s*(Module|Place|Person|Thing|Item|Passage|Action|Rule|Topic|Kind|Relation|'
    + 'Entity|Initially|Company|Observation|Exit|Event|Hazard|Information)\\s+[A-Za-z_{$]');
  readonly counts = new Map<string, Map<string, number>>();
  readonly byFile = new Map<string, Map<string, number>>();
  readonly examples = new Map<string, Hit[]>();
  readonly distinct = new Map<string, Set<string>>();
  readonly owner = new Map<string, string>();
  literals = 0;
  constructor(readonly categories: Record<string, string[]>, readonly relations: Set<string>) {
    for (const [c, list] of Object.entries(categories)) {
      for (const id of list) {
        if (id.length > 2 && !Hardcoded.generic.has(id) && !this.owner.has(id)) { this.owner.set(id, c); }
      }
    }
  }
  static read(p: string): Record<string, unknown> { return JSON.parse(readFileSync(p, 'utf8')) as Record<string, unknown>; }
  static ids(v: unknown): string[] {
    return Array.isArray(v) ? v.map(x => (x as { id?: string }).id ?? '').filter(Boolean)
      : v && typeof v === 'object' ? Object.keys(v) : [];
  }
  static catalog(f: string, key: string): string[] { return Hardcoded.ids(Hardcoded.read(`data/catalog/${f}.json`)[key]); }
  static layerOf(p: string): string {
    const [top, second] = p.split('/');
    if (top === 'web') { return ['engine', 'reader'].includes(second!) ? `web/${second}` : 'web/other'; }
    if (p.split('/').length === 2) { return 'src/(root)'; }
    return Hardcoded.layers.includes(`src/${second}`) ? `src/${second}` : 'src/other';
  }
  static files(dir: string): string[] {
    return readdirSync(dir).flatMap(n => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? (n === 'node_modules' || n === 'dist' ? [] : Hardcoded.files(p))
        : /\.tsx?$/.test(n) && !n.endsWith('.d.ts') ? [p] : [];
    });
  }
  static rules(): Module {
    const names = [...ModuleBundle.world, 'elements', 'devotion'];
    return (ModuleBundle as unknown as { shared(f: { path: string; text: string }[]): Module }).shared(
      names.map(n => ({ path: n, text: readFileSync(`data/rules/${n}.kyr`, 'utf8') })));
  }
  static setting(): { categories: Record<string, string[]>; relations: Set<string> } {
    const c = Hardcoded.catalog.bind(Hardcoded), items = readdirSync('data/catalog/items')
      .flatMap(f => Hardcoded.ids(Hardcoded.read(`data/catalog/items/${f}`).items));
    const rules = Hardcoded.rules(), imbar = readdirSync('data/imbar').filter(f => f.endsWith('.kyr'))
      .flatMap(f => ModuleParser.parse(readFileSync(`data/imbar/${f}`, 'utf8')).entities.map(e => e.id));
    const scenarios = [...readdirSync('data/scenarios').filter(f => f.endsWith('.scenario.json'))
      .map(f => (Hardcoded.read(`data/scenarios/${f}`).id as string) ?? f.replace('.scenario.json', '')),
    ...readdirSync('data/adventures'), ...readdirSync('data/situations')];
    const religion = Hardcoded.read('data/catalog/religion.json');
    const relations = new Set([...rules.relations.map(r => r.name), ...rules.measures.map(m => m.name)]);
    return { relations, categories: {
      'ancestry/calling/background/profession': [...c('ancestries', 'ancestries'), ...c('classes', 'classes'),
        ...c('backgrounds', 'backgroundOverlay'), ...c('professions', 'professions')],
      'ability/trait/condition/skill': [...c('abilities', 'abilities'), ...c('traits', 'traits'),
        ...c('conditions', 'conditions'), ...c('skills', 'skills')],
      'species/variation/plant': [...c('animals', 'species'), ...c('monsters', 'species'), ...c('variations', 'variations'),
        ...c('plants', 'plants')],
      'item': items,
      'deity/domain': [...Hardcoded.ids(religion.deities), ...Hardcoded.ids(religion.domains)],
      'rules relation/action/entity': [...rules.relations.map(r => r.name), ...rules.actions.map(a => a.id),
        ...rules.entities.map(e => e.id)],
      'canon (data/imbar) entity': imbar,
      'scenario/adventure id': scenarios } };
  }
  note(category: string, hit: Hit) {
    const layer = Hardcoded.layerOf(hit.file), row = this.counts.get(category) ?? new Map<string, number>();
    row.set(layer, (row.get(layer) ?? 0) + 1); this.counts.set(category, row);
    const f = this.byFile.get(category) ?? new Map<string, number>();
    f.set(hit.file, (f.get(hit.file) ?? 0) + 1); this.byFile.set(category, f);
    this.examples.set(category, [...this.examples.get(category) ?? [], hit]);
    this.distinct.set(category, (this.distinct.get(category) ?? new Set<string>()).add(hit.text));
  }
  literal(node: ts.Node, source: ts.SourceFile, file: string) {
    let text: string | undefined;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) { text = node.text; }
    else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) { text = node.text; }
    if (text === undefined || (ts.isStringLiteral(node) && ts.isExternalModuleReference(node.parent))) { return; }
    this.literals++;
    const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1, hit = { file, line, text };
    const category = this.owner.get(text);
    if (category) { this.note(category, hit); }
    if (text.trim().split(/\s+/).length >= 6 && /[a-z]/.test(text)) { this.note('prose (6+ words)', hit); }
    if (Hardcoded.kyr.test(text)) { this.note('Kyr source written in TS', hit); }
    const call = node.parent;
    if (ts.isCallExpression(call) && call.arguments[0] === node && ts.isPropertyAccessExpression(call.expression)
      && Hardcoded.reads.has(call.expression.name.text)) {
      this.note(this.relations.has(text) ? 'fact read by name: a data/rules relation' : 'fact read by name: any other', hit);
    }
  }
  visit(node: ts.Node, source: ts.SourceFile, file: string) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) { return; }
    this.literal(node, source, file);
    ts.forEachChild(node, child => this.visit(child, source, file));
  }
  table() {
    const shown = Hardcoded.layers.filter(l => [...this.counts.values()].some(r => r.get(l)));
    console.log(`${this.literals} string literals read in src/ and web/`);
    console.log(`| category | ids declared | distinct named | ${shown.join(' | ')} | total |`);
    console.log(`|---|---:|---:|${shown.map(() => '---:').join('|')}|---:|`);
    for (const [c, r] of this.counts) {
      const ids = this.categories[c], total = [...r.values()].reduce((a, b) => a + b, 0);
      console.log(`| ${c} | ${ids ? new Set(ids).size : ''} | ${c.startsWith('prose') ? '' : this.distinct.get(c)!.size} | `
        + `${shown.map(l => r.get(l) ?? 0).join(' | ')} | ${total} |`);
    }
    for (const [c, f] of this.byFile) {
      const most = [...f].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([p, n]) => `${p} (${n})`);
      console.log(`\n${c}: most in ${most.join(', ')}`);
    }
  }
  print(args: string[]) {
    if (args.includes('--json')) {
      console.log(JSON.stringify(Object.fromEntries([...this.counts].map(([c, r]) => [c, Object.fromEntries(r)]))));
      return;
    }
    this.table();
    const asked = args.find(a => a.startsWith('--examples='))?.slice(11);
    for (const h of (asked && this.examples.get(asked) || []).slice(0, 80)) {
      console.log(`${h.file}:${h.line}  ${JSON.stringify(h.text).slice(0, 110)}`);
    }
    const names = args.find(a => a.startsWith('--names='))?.slice(8);
    if (names) {
      const n = new Map<string, number>();
      for (const h of this.examples.get(names) ?? []) { n.set(h.text, (n.get(h.text) ?? 0) + 1); }
      console.log([...n].sort((a, b) => b[1] - a[1]).slice(0, 80).map(([k, v]) => `${k} ${v}`).join(', '));
    }
  }
  static main(args: string[]) {
    const { categories, relations } = Hardcoded.setting(), inventory = new Hardcoded(categories, relations);
    for (const file of [...Hardcoded.files('src'), ...Hardcoded.files('web')]) {
      const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      inventory.visit(source, source, file);
    }
    inventory.print(args);
  }
}
Hardcoded.main(process.argv.slice(2));
