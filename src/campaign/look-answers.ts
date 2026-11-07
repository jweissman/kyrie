import type { Instance } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';

// What a close look can find (the owner, 6 November: "Look closely" offered where it could only say a thing is what
// it seems, on a page of its own, broke the scene for nothing). A thing answers a look when anything in the world reads
// its being looked at (`tried(it, looking)` in a rule, an observation, an act or a query); where something reads any
// thing's being looked at, every thing does. A thing's states and what it holds no longer answer a look of themselves
// (the owner's own play, 7 November: Look… had "never shown anything but 'it is what it seems'"; a ditched cart, a
// barred lockup door and a playbill each offered a close look that found nothing, since what a state is is told with
// the place, and nothing in a hold is seen by looking at it shut).
export class LookAnswers {
  // A module says it of the things it reads the looking of, its own or another's (the relation has two places, so an
  // imported thing may be given it).
  static declare(draft: { instance: Instance }) {
    const instance = draft.instance;
    LookAnswers.searches(instance);
    const module = instance.module;
    if (!module.relations.some(r => r.name === 'answers')) { return; }
    const suits = module.initial.filter(c => c.kind === 'assert' && LookAnswers.is(c.call.name, 'suits')
      && LookAnswers.is(c.call.args[1] ?? '', 'looking')).map(c => c.call.args[0]!);
    const read = new Set<string>(), any = { read: false };
    for (const p of LookAnswers.definitions(module)) { LookAnswers.reads(p, read, any, 'tried'); }
    for (const thing of new Set([...suits, ...read])) {
      if (any.read || read.has(thing)) {
        module.initial.push({ kind: 'assert', call: ModuleWriter.call('answers', thing, LookAnswers.verb(module, 'looking')) });
      }
    }
  }
  // Where a search can find something (the owner, 6 November: offered everywhere, it found nothing out of doors):
  // a place something reads the searching of; anywhere, where something reads a search of any place. Indoors a search
  // is offered as before.
  static searches(instance: Instance) {
    const module = instance.module;
    if (!module.relations.some(r => r.name === 'answers')) { return; }
    const read = new Set<string>(), any = { read: false };
    for (const p of LookAnswers.definitions(module)) { LookAnswers.reads(p, read, any, 'searched'); }
    if (any.read) { module.initial.push({ kind: 'assert', call: ModuleWriter.call('searchedAnywhere') }); }
    for (const place of read) {
      module.initial.push({ kind: 'assert', call: ModuleWriter.call('answers', place, LookAnswers.verb(module, 'rummaging')) });
    }
  }
  // Every definition that may read a fact, each with the names it binds as parameters (an act's `site` is no place).
  private static definitions(module: Instance['module']): { node: unknown; own: Set<string> }[] {
    return [...[...module.rules ?? [], ...module.observations ?? []].map(node => ({ node, own: new Set<string>() })),
      ...module.actions.map(a => ({ node: a, own: new Set((a.parameters ?? []).map(p => p.name)) })),
      ...module.queries.map(q => ({ node: q, own: new Set(q.parameters.map(p => p.name)) }))];
  }
  // A verb by whatever name the rules were installed under (rules__looking).
  private static verb(module: Instance['module'], bare: string): string {
    return module.entities.find(e => e.type === 'verb' && LookAnswers.is(e.id, bare))?.id ?? bare;
  }
  private static is(name: string, bare: string): boolean { return name === bare || name.endsWith(`__${bare}`); }
  // Every `tried(x, looking)` anywhere in a definition: its thing, or that any thing is read where x is a variable.
  // Every `tried(x, looking)` anywhere in a definition (or `searched(_, x)`): its thing or place, or that any is read
  // where x is a variable.
  private static reads(def: { node: unknown; own: Set<string> }, read: Set<string>, any: { read: boolean },
    of: 'tried' | 'searched') {
    const node = def.node;
    if (Array.isArray(node)) {
      for (const n of node) { LookAnswers.reads({ ...def, node: n }, read, any, of); }
      return;
    }
    if (!node || typeof node !== 'object') { return; }
    const call = node as { kind?: string; name?: string; args?: string[] };
    if (call.kind === 'call' && call.name && LookAnswers.is(call.name, of) && call.args?.length === 2) {
      const [x, y] = call.args as [string, string];
      const read1 = of === 'tried' ? (LookAnswers.is(y, 'looking') || y.startsWith('?')) && x : y;
      if (read1 && !def.own.has(read1)) { if (read1.startsWith('?')) { any.read = true; } else { read.add(read1); } }
    }
    for (const v of Object.values(node)) {
      if (v && typeof v === 'object') { LookAnswers.reads({ ...def, node: v }, read, any, of); }
    }
  }
}
