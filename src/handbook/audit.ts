import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HandbookStatus, Statuses, type Status } from './model';
import type { Coverage } from './handbooks';

export interface Family {
  // The handbook sections that hold its entries, and any entries it names one by one.
  id: string; title: string; sections: string[]; entries?: string[];
  orsino: string; faithful: string; adapted: string; dataOnly: string;
  missing: string; abstractions: string; browser: string;
}
export interface Deficiency { rank: number; title: string; unlocks: string; cycle: number }
export interface Audit { about: string; families: Family[]; deficiencies: Deficiency[] }

// The capability audit: judgements written by hand in doc/architecture/capabilities.json, counts read from the books.
export class CapabilityAudit {
  static readonly questions: [keyof Family, string][] = [['orsino', 'What Orsino defines'],
    ['faithful', 'What Kyr implements faithfully'], ['adapted', 'What Kyr deliberately adapts'],
    ['dataOnly', 'What is data only'], ['missing', 'What is missing or wrong'], ['abstractions', 'What abstractions are needed'],
    ['browser', 'Whether the browser makes it understandable']];
  static read(root: string): Audit {
    return JSON.parse(readFileSync(join(root, 'doc/architecture/capabilities.json'), 'utf8')) as Audit;
  }
  // A family's entries: those in the book sections it names (a section path within a book, "phb:magic").
  static counts(family: Family, coverage: Coverage): Record<Status, number> {
    const counts = Object.fromEntries(Statuses.map(s => [s, 0])) as Record<Status, number>;
    const seen = new Set<string>();
    for (const e of coverage.entries) {
      const at = `${e.book}:${e.section}`;
      const named = family.entries?.includes(e.id) || family.sections.some(s => at === s || at.startsWith(`${s}/`));
      if (named && !seen.has(e.id)) { seen.add(e.id); counts[e.status]++; }
    }
    return counts;
  }
  static line(counts: Record<Status, number>): string {
    return Statuses.filter(s => counts[s]).map(s => `${counts[s]} ${HandbookStatus.label(s).toLowerCase()}`).join(', ') || 'no entries';
  }
  static markdown(audit: Audit, coverage: Coverage): string {
    const families = audit.families.flatMap(f => [`## ${f.title}`, '', `Entries: ${this.line(this.counts(f, coverage))}.`, '',
      ...this.questions.flatMap(([k, q]) => [`**${q}.** ${f[k] as string}`, '']), `Handbook sections: ${f.sections
        .map(s => `\`${s}\``).join(', ')}.`, '']);
    return ['# Capability audit', '', audit.about, '',
      '| Family | Entries |', '|---|---|', ...audit.families.map(f => `| ${f.title} | ${this.line(this.counts(f, coverage))} |`), '',
      ...families, '## Deficiencies, ranked by what fixing them unlocks', '',
      '| Rank | Deficiency | Unlocks | Cycle |', '|---:|---|---|---:|',
      ...audit.deficiencies.map(d => `| ${d.rank} | ${d.title} | ${d.unlocks} | ${d.cycle} |`), ''].join('\n');
  }
}
