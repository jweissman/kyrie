import type { Module } from '../lang/module';

// The names a module declares that the shared rules declare too.
export interface Shadowed { functions: string[]; actions: string[] }

// A module's own names for what the shared rules also name (a relation, a measure, a query, an action): within the
// module they are the module's own, and the shared rules keep theirs. Found by an architecture review: the shared
// rules growing a name an adventure already had (guest, confided, light_lamp) made it fail to load. Each such name is
// the module's own (own_confided) wherever its author wrote it, which its installation then scopes like any of its
// names; what the language's own constructs say (a place within another, a company at a place) keeps the shared
// meaning. Lint says which names were taken so.
export class ModuleShadow {
  static shared(own: Module, rules: Module): Shadowed {
    const theirs = new Set(this.functions(rules)), acts = new Set(rules.actions.map(a => a.id));
    return { functions: this.functions(own).filter(n => theirs.has(n)),
      actions: own.actions.map(a => a.id).filter(id => acts.has(id)) };
  }
  static local(name: string): string { return `own_${name}`; }
  // What lint says of each.
  static told(s: Shadowed): string[] {
    return [...s.functions.map(n => `${n} is a name of the shared rules too; in this module it is the module's own`),
      ...s.actions.map(a => `action ${a} is one of the shared rules' too; in this module it is the module's own`)];
  }
  // The module's text with each such name its own where it is declared or called: in its Kyr, and in its prose only
  // where a call is in braces ("{confided(party)}"); its comments as they were.
  static text(source: string, s: Shadowed): string {
    if (!s.functions.length) { return source; }
    const call = new RegExp(`\\b(${s.functions.join('|')})\\(`, 'g');
    return source.replace(/"(?:[^"\\]|\\.)*"|\/\/[^\n]*|[^"/]+|[/"]/g, token => token.startsWith('//') ? token
      : token.startsWith('"') ? token.replace(/\{[^}]*\}/g, braces => this.rename(braces, call))
        : this.rename(token, call));
  }
  // The module with each such action its own: declared, and given to whoever it names as doing it.
  static apart(own: Module, s: Shadowed): Module {
    if (!s.actions.length) { return own; }
    const actions = new Set(s.actions);
    return { ...own, actions: own.actions.map(a => ({ ...a, id: this.act(a.id, actions) })),
      ...own.people ? { people: own.people.map(p => ({ ...p, actions: p.actions.map(id => this.act(id, actions)) })) }
        : {},
      ...own.pursuits ? { pursuits: own.pursuits.map(p => p.using
        ? { ...p, using: p.using.map(id => this.act(id, actions)) } : p) } : {} };
  }
  private static functions(m: Module): string[] {
    return [...m.relations, ...m.measures, ...m.queries].map(f => f.name);
  }
  private static rename(code: string, call: RegExp): string {
    return code.replace(call, (_whole, name: string) => `${this.local(name)}(`);
  }
  private static act(id: string, actions: Set<string>): string { return actions.has(id) ? this.local(id) : id; }
}
