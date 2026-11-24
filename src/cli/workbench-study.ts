import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { WorkbenchSources, type Sample } from './workbench-sources';

// A study of the Deem workbench (see DeemWorkbench): what was drawn (the generator, its seed, how many, what it was
// given, and the samples), kept in study.json in its own folder; and what an author made of them, each verdict on a
// sample by its key with the reason and the fields as they were judged, kept beside it in verdicts.json. The critique
// is creative evidence, not a defect list.
export interface Study { generator: string; seed: string; n: number; given: Record<string, string>; drawn: string;
  samples: Sample[] }
export interface Verdict { key: string; n: number; verdict: 'select' | 'reject'; why: string; judged: string;
  fields: Record<string, string> }
// A sample drawn again: the fields that changed, each from what it was to what it is.
export interface Redrawn { key: string; n: number; changed: [string, string, string][]; verdict?: Verdict;
  standing: string }

export class WorkbenchStudy {
  static file(dir: string): string { return join(dir, 'study.json'); }
  static verdictsFile(dir: string): string { return join(dir, 'verdicts.json'); }
  static draw(dir: string, at: { generator: string; seed: string; n: number; given: Record<string, string> }): Study {
    const study: Study = { ...at, drawn: new Date().toISOString().slice(0, 10),
      samples: WorkbenchSources.sample(at.generator, at.seed, at.n, at.given) };
    mkdirSync(dir, { recursive: true });
    writeFileSync(this.file(dir), `${JSON.stringify(study, null, 1)}\n`);
    return study;
  }
  static load(dir: string): Study {
    if (!existsSync(this.file(dir))) { throw new Error(`No study in ${dir}: bin/kyrie deem sample <generator> ${dir}`); }
    return JSON.parse(readFileSync(this.file(dir), 'utf8')) as Study;
  }
  static verdicts(dir: string): Verdict[] {
    return existsSync(this.verdictsFile(dir)) ? JSON.parse(readFileSync(this.verdictsFile(dir), 'utf8')) as Verdict[] : [];
  }
  static sample(study: Study, which: string): Sample {
    const s = study.samples.find(x => String(x.n) === which.replace(/^#/, '') || x.key === which);
    if (!s) { throw new Error(`No sample ${which} in the study (1 to ${study.samples.length}, or a key)`); }
    return s;
  }
  // A verdict on a sample, kept with why; a later verdict on the same sample takes the place of an earlier.
  static judge(dir: string, which: string, verdict: Verdict['verdict'], why: string): Verdict {
    const s = this.sample(this.load(dir), which);
    const kept: Verdict = { key: s.key, n: s.n, verdict, why, judged: new Date().toISOString().slice(0, 10),
      fields: s.fields };
    const all = [...this.verdicts(dir).filter(v => v.key !== s.key), kept].sort((a, b) => a.n - b.n);
    writeFileSync(this.verdictsFile(dir), `${JSON.stringify(all, null, 1)}\n`);
    return kept;
  }
  // How varied a study is, field by field: how many values of how many samples, the commonest; and the echoes, a
  // value (or the last word of one: three Unicorns) said twice among the samples of one group (a country's towns),
  // or one name given to two of a sample's people.
  static variety(study: Study): { field: string; distinct: number; of: number; common: [string, number][] }[] {
    const fields = [...new Set(study.samples.flatMap(s => Object.keys(s.fields)))];
    return fields.map(field => {
      const counts = new Map<string, number>();
      for (const s of study.samples) {
        const v = s.fields[field];
        if (v !== undefined) { counts.set(v, (counts.get(v) ?? 0) + 1); }
      }
      const common = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 3);
      return { field, distinct: counts.size, of: [...counts.values()].reduce((a, b) => a + b, 0), common };
    });
  }
  static echoes(study: Study): string[] {
    const out: string[] = [], groups = Map.groupBy(study.samples, s => s.group ?? s.key);
    for (const [group, samples] of groups) {
      if (samples.length < 2) { continue; }
      for (const field of ['name', 'inn', 'innkeeper', 'priest', 'merchant', 'traveller', 'came']) {
        const seen = Map.groupBy(samples.filter(s => s.fields[field]), s => field === 'inn' ? this.last(s.fields[field]!)
          : s.fields[field]!.replace(/\s*\(.*\)$/, ''));
        for (const [v, xs] of seen) {
          if (xs.length > 1) { out.push(`${group}: ${field} "${v}" in ${xs.map(x => `#${x.n}`).join(', ')}`); }
        }
      }
    }
    for (const s of study.samples) {
      const names = ['innkeeper', 'priest', 'merchant', 'traveller'].map(r => [r, s.fields[r]?.split(' (')[0]] as const)
        .filter(([, v]) => v);
      const twice = names.filter(([, v], i) => names.findIndex(([, w]) => w === v) !== i);
      for (const [role, v] of twice) { out.push(`#${s.n}: ${v} is ${role} and ${names.find(([, w]) => w === v)![0]}`); }
    }
    return out;
  }
  static last(v: string): string { return v.replace(/\s*\(.*\)$/, '').split(/\s+/).at(-1)!.toLowerCase(); }
  // The study drawn again from the data as it is now, by the same seeds: each sample's changed fields, and how each
  // verdict stands (a rejected sample changed is revised; unchanged, still as rejected; a selected one changed is to
  // be looked at again). write: the study keeps what is drawn now, its verdicts kept.
  static replay(dir: string, write = false): { redrawn: Redrawn[]; gone: string[]; added: string[] } {
    const study = this.load(dir), verdicts = new Map(this.verdicts(dir).map(v => [v.key, v]));
    const now = WorkbenchSources.sample(study.generator, study.seed, study.n, study.given);
    const was = new Map(study.samples.map(s => [s.key, s])), is = new Map(now.map(s => [s.key, s]));
    const redrawn = now.filter(s => was.has(s.key)).map(s => {
      const before = was.get(s.key)!.fields, verdict = verdicts.get(s.key);
      const fields = [...new Set([...Object.keys(before), ...Object.keys(s.fields)])];
      const changed = fields.filter(f => before[f] !== s.fields[f])
        .map(f => [f, before[f] ?? '', s.fields[f] ?? ''] as [string, string, string]);
      const standing = !verdict ? (changed.length ? 'changed' : 'as it was')
        : verdict.verdict === 'reject' ? (changed.length ? 'rejected, revised' : 'rejected, still as it was')
          : changed.length ? 'selected, changed: look again' : 'selected, as it was';
      return { key: s.key, n: s.n, changed, standing, ...verdict ? { verdict } : {} };
    });
    if (write) { writeFileSync(this.file(dir), `${JSON.stringify({ ...study, samples: now }, null, 1)}\n`); }
    return { redrawn, gone: [...was.keys()].filter(k => !is.has(k)), added: [...is.keys()].filter(k => !was.has(k)) };
  }
}
