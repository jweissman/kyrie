import { readFileSync } from 'node:fs';
import { KyrTemplates } from '../world/kyr-template';
import { WorkbenchSources } from './workbench-sources';
import { WorkbenchStudy } from './workbench-study';

// The Deem workbench (BRIEF §7): browse → sample → compare → inspect provenance → select/reject → revise → replay,
// over the project's Deem templates, its Kyr templates and the world's settlements as a player meets them. Nothing in
// it is a Studio: a study is a folder (study.json, verdicts.json) an author keeps beside a critique, and revising is
// editing the data the samples name (inspect says where), then drawing the same seeds again (replay).
//   bin/kyrie deem browse
//   bin/kyrie deem sample <generator> <study> [--n 50] [--seed bench] [--given name=value ...]
//   bin/kyrie deem show <study> [n]
//   bin/kyrie deem compare <study> [other study]
//   bin/kyrie deem inspect <study> <n> [field]
//   bin/kyrie deem select|reject <study> <n> "why"
//   bin/kyrie deem replay <study> [--write]
export class DeemWorkbench {
  static readonly usage = ['bin/kyrie deem browse                          (every generator, and whether it runs alone)',
    'bin/kyrie deem sample <generator> <study> [--n 50] [--seed bench] [--given name=value ...]',
    'bin/kyrie deem show <study> [n] | compare <study> [other] | inspect <study> <n> [field]',
    'bin/kyrie deem select|reject <study> <n> "why" | replay <study> [--write]'].join('\n');
  static main(args: string[], say: (line: string) => void = console.log): number {
    const [verb, ...rest] = args, valued = ['--n', '--seed', '--given'];
    const words = rest.filter((a, i) => !a.startsWith('--') && !valued.includes(rest[i - 1] ?? ''));
    const lines = (() => {
      switch (verb) {
        case 'browse': return this.browse();
        case 'sample': return this.sample(words[0]!, words[1]!, rest);
        case 'show': return this.show(words[0]!, words[1]);
        case 'compare': return this.compare(words[0]!, words[1]);
        case 'inspect': return this.inspect(words[0]!, words[1]!, words[2]);
        case 'select': case 'reject': return this.judge(words[0]!, words[1]!, verb, words.slice(2).join(' '));
        case 'replay': return this.replay(words[0]!, rest.includes('--write'));
        default: return [this.usage];
      }
    })();
    for (const line of lines) { say(line); }
    return verb && ['browse', 'sample', 'show', 'compare', 'inspect', 'select', 'reject', 'replay'].includes(verb) ? 0 : 1;
  }
  static flag(rest: string[], name: string): string | undefined {
    const i = rest.indexOf(`--${name}`);
    return i >= 0 ? rest[i + 1] : undefined;
  }
  static browse(): string[] {
    const templates = WorkbenchSources.templates();
    return ['The world\'s settlements, as a player meets them:', '  settlement',
      'Deem templates (data/generation/templates), each drawn alone:',
      ...[...templates].map(([name, t]) => `  deem:${name}  ${Object.keys(t.fields).length} fields; `
        + `${WorkbenchSources.blind(name)}`),
      'Kyr templates (data/generation/**/*.kyrt), each group drawn by its options:',
      ...WorkbenchSources.kyrts().map(file => {
        const t = KyrTemplates.parse(readFileSync(file, 'utf8')), drawn = new Map<string, number>();
        for (const s of t.sections.filter(x => x.option !== x.group)) {
          drawn.set(s.group, (drawn.get(s.group) ?? 0) + 1);
        }
        return `  kyrt:${file.slice(WorkbenchSources.root.length + 1)}  ${t.about.slice(0, 60)}; `
          + `${[...drawn].map(([g, n]) => `${g} (${n})`).join(', ') || 'no drawn group'}`;
      })];
  }
  static sample(generator: string, dir: string, rest: string[]): string[] {
    const given = Object.fromEntries(rest.flatMap((a, i) => rest[i - 1] === '--given' ? [a.split('=') as [string, string]]
      : []));
    const study = WorkbenchStudy.draw(dir, { generator, seed: this.flag(rest, 'seed') ?? 'bench',
      n: Number(this.flag(rest, 'n') ?? 50), given });
    return [`${study.samples.length} of ${generator} drawn into ${dir}`, ...study.samples.map(s => this.line(s))];
  }
  static line(s: { n: number; key: string; fields: Record<string, string> }): string {
    return `#${s.n} ${s.key}  ${Object.entries(s.fields).filter(([k]) => !['told', 'came', 'country'].includes(k))
      .map(([k, v]) => `${k}: ${v}`).join(' · ')}`;
  }
  static show(dir: string, which?: string): string[] {
    const study = WorkbenchStudy.load(dir), verdicts = new Map(WorkbenchStudy.verdicts(dir).map(v => [v.key, v]));
    if (!which) { return study.samples.map(s => `${this.line(s)}${this.said(verdicts.get(s.key))}`); }
    const s = WorkbenchStudy.sample(study, which);
    return [`#${s.n} ${s.key}${s.group ? ` (${s.group})` : ''}${this.said(verdicts.get(s.key))}`,
      ...Object.entries(s.fields).map(([k, v]) => `  ${k}: ${v}`)];
  }
  static said(v?: { verdict: string; why: string }): string { return v ? `  [${v.verdict}: ${v.why}]` : ''; }
  static compare(dir: string, other?: string): string[] {
    const a = WorkbenchStudy.load(dir), b = other ? WorkbenchStudy.load(other) : undefined;
    const vb = new Map((b ? WorkbenchStudy.variety(b) : []).map(v => [v.field, v]));
    return [`${a.generator}, ${a.samples.length} samples${b ? `, against ${other}` : ''}: distinct values by field`,
      ...WorkbenchStudy.variety(a).map(v => `  ${v.field}: ${v.distinct} of ${v.of}`
        + `${vb.get(v.field) ? ` (was ${vb.get(v.field)!.distinct} of ${vb.get(v.field)!.of})` : ''}; commonest `
        + v.common.map(([w, n]) => `${w.slice(0, 40)} ×${n}`).join(', ')),
      'Echoes (said twice in one country, or one name for two people):',
      ...WorkbenchStudy.echoes(a).map(e => `  ${e}`)];
  }
  static inspect(dir: string, which: string, field?: string): string[] {
    const study = WorkbenchStudy.load(dir), s = WorkbenchStudy.sample(study, which);
    return (field ? [field] : Object.keys(s.fields)).flatMap(f => {
      const src = WorkbenchSources.source(study.generator, s, f);
      return [`${f}: ${s.fields[f] ?? '(none)'}`,
        ...src.expression ? [`  template ${src.file}: ${src.expression}`] : [],
        ...src.tables.map(t => `  table ${t.table}[${t.group}] (${t.file ?? 'no such table'}), ${t.entries.length} entries`
          + `${t.drawn.length ? `, drawn ${t.drawn.join(', ')}` : ''}: ${t.entries.slice(0, 24).join(', ')}`),
        ...src.options ? [`  ${src.file}: ${src.options.map(o => `${o.drawn ? '*' : ''}${o.option} ${o.weight} `
          + `(line ${o.line})`).join(', ')}`] : [],
        ...src.after ? [`  then ${src.after}`] : []];
    });
  }
  static judge(dir: string, which: string, verdict: 'select' | 'reject', why: string): string[] {
    if (!why) { throw new Error('A verdict says why: bin/kyrie deem reject <study> <n> "why"'); }
    const v = WorkbenchStudy.judge(dir, which, verdict, why);
    return [`#${v.n} ${v.key} ${verdict}ed: ${why}`];
  }
  static replay(dir: string, write: boolean): string[] {
    const { redrawn, gone, added } = WorkbenchStudy.replay(dir, write);
    const moved = redrawn.filter(r => r.changed.length || r.verdict);
    return [`${redrawn.length} drawn again: ${redrawn.filter(r => r.changed.length).length} changed`
      + `${gone.length ? `, ${gone.length} no longer drawn` : ''}${added.length ? `, ${added.length} new` : ''}`,
    ...moved.flatMap(r => [`#${r.n} ${r.key}: ${r.standing}${r.verdict ? ` (${r.verdict.why})` : ''}`,
      ...r.changed.map(([f, was, is]) => `  ${f}: ${was} → ${is}`)]),
    ...write ? ['The study keeps what is drawn now; its verdicts are kept.'] : []];
  }
}
