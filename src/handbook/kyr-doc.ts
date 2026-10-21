import { ModuleParser } from '../lang/module-parser';
import { ModuleWriter } from '../lang/module-writer';
import type { Module, Predicate } from '../lang/module';
import { FictionalTime } from '../presentation/fictional-time';
import type { Entry, Section } from './model';

export interface Declaration { kind: string; name: string; signature: string; comment: string[] }

// What a Kyr rules module declares, each declaration with the comment written above it. The comments are the
// authors' statement of the rule; the declarations are what the engine runs.
export class KyrDoc {
  static readonly pattern = /(?:^|\.\s+)(Kind|Relation|Measure|Query|Rule|Action)\s+([A-Za-z_][\w]*)(\([^)]*\))?/g;
  static declarations(text: string): Declaration[] {
    const found: Declaration[] = [];
    let comment: string[] = [];
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (line.startsWith('//')) { comment.push(line.replace(/^\/\/\s?/, '')); continue; }
      const matches = [...line.matchAll(this.pattern)];
      for (const m of matches) {
        found.push({ kind: m[1]!, name: m[2]!, signature: m[3] ?? '', comment: [comment.join(' ')].filter(Boolean) });
      }
      if (matches.length || !line) { comment = []; }
    }
    return found;
  }
  static section(file: string, text: string): Section {
    const module = ModuleParser.parse(text);
    const groups = new Map<string, Declaration[]>();
    for (const d of this.declarations(text)) {
      const key = d.comment[0] ?? (['Rule', 'Action'].includes(d.kind) ? `${d.kind} ${d.name}` : '');
      if (key) { (groups.get(key) ?? groups.set(key, []).get(key)!).push(d); }
    }
    const said = new Set([...groups.values()].flat().map(d => d.name));
    const rest = [...module.relations, ...module.measures].map(r => r.name).filter(n => !said.has(n));
    return { id: `rules-${file}`, title: module.name, intro: [module.description,
      ...rest.length ? [`Also kept, without comment: ${rest.join(', ')}.`] : []].filter(Boolean),
    table: { head: ['Kinds', 'Relations', 'Measures', 'Queries', 'Rules', 'Actions'],
      rows: [[module.kinds.length, module.relations.length, module.measures.length, module.queries.length,
        module.rules?.length ?? 0, module.actions.length].map(String)] },
    entries: [...groups.values()].map(g => this.entry(module, g)) };
  }
  static entry(module: Module, group: Declaration[]): Entry {
    const first = group[0]!;
    const action = first.kind === 'Action' ? module.actions.find(a => a.id === first.name) : undefined;
    const rule = first.kind === 'Rule' ? module.rules?.find(r => r.id === first.name) : undefined;
    const code = action ? [`Needs: ${this.condition(action.requires)}`,
      `Then: ${action.success.map(c => ModuleWriter.change(c)).join(' ') || 'nothing changes'}`]
      : rule ? [`When: ${this.condition(rule.when)}`, `Then: ${rule.effects.map(c => ModuleWriter.change(c)).join(' ')}`] : [];
    return { id: `rule:${module.id}.${first.name}`, title: action ? first.name.replace(/_/g, ' ') : group.map(d => d.name).join(', '),
      status: 'kyr', kind: action ? `action (${(action.parameters ?? []).map(p => p.type).join(', ')})`
        : group.map(d => `${d.kind.toLowerCase()}${d.signature}`).join('; '),
      facts: action ? [['Shown as', action.name], ['Takes', action.duration ? `the ${action.duration.name} of the way` : `${action.time * FictionalTime.minutesPerTick} minutes`],
        ...action.cost ? [['Costs', String(action.cost)] as [string, string]] : []] : [],
      rules: [...first.comment, ...action?.description ? [action.description] : [], ...rule?.say ? [`Says: "${rule.say}"`] : []],
      text: code };
  }
  // A conjunction read as a list ("a; b; not c"), each part as the module writes it.
  static condition(p: Predicate): string {
    const parts: Predicate[] = [], stack = [p];
    while (stack.length) {
      const q = stack.shift()!;
      if (q.kind === 'and') { stack.unshift(q.left, q.right); } else { parts.push(q); }
    }
    return parts.map(q => ModuleWriter.predicate(q).replace(/^\((.*)\)$/, '$1')).join('; ');
  }
}
