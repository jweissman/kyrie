import type { Call, Module, Predicate, Pursuit } from './module';
import { SemanticRecords as S } from './semantic-record';
import type { PromiseSpec } from './promises';
import type { OccasionSpec } from './occasions';
import type { RouteSpec } from './routes';

// The record each high-level form leaves beside what it lowered into (MT-30, semantic-tracing.md): its phases are
// said in the author's words over the facts the lowering keeps, so that the tools ask which holds and never read a
// generated rule to find out.
export class SemanticLowering {
  // A promise: not yet made, standing, kept or broken, by its own facts (Promises.lower).
  static promise(module: Module, p: PromiseSpec, facts: { made: Call; stands: Predicate; kept: Call; broken: Call }) {
    const own = new Set(['kept', 'broken', 'unkept', 'kept_told', 'kept_closing', 'broken_told', 'broken_closing']
      .map(s => `${p.id}_${s}`));
    S.add(module, { kind: 'promise', name: p.id, words: p.words, ...p.span ? { span: p.span } : {},
      participants: [{ role: 'made to', id: p.to }],
      phases: [{ id: 'unmade', said: 'not yet made', holds: S.not(facts.made) },
        { id: 'standing', said: `made, and standing: ${p.words}`, holds: facts.stands },
        { id: 'kept', said: 'kept', holds: facts.kept }, { id: 'broken', said: 'broken', holds: facts.broken }],
      requires: [p.kept.when, p.broken.when], effects: [...p.kept.effects ?? [], ...p.broken.effects],
      lowered: { rules: (module.rules ?? []).filter(r => own.has(r.id)).map(r => r.id), pursuits: [],
        objectives: [`${p.id}_aim`], entities: [p.id] },
      serves: [facts.made] });
  }
  // An occasion: waiting, each matter open, between one and the next, over (Occasions.lower).
  static occasion(module: Module, o: OccasionSpec, rules: string[]) {
    const open = o.matters.map(m => S.call('matterOpen', m.id)), over = S.call('occasionOver', o.id);
    const begun = S.call('occasionBegun', o.id);
    S.add(module, { kind: 'occasion', name: o.id, words: o.title, ...o.span ? { span: o.span } : {},
      participants: o.at ? [{ role: 'held at', id: o.at }] : [],
      phases: [{ id: 'waiting', said: 'not yet begun', holds: S.not(begun) },
        ...o.matters.map((m, i) => ({ id: m.id, said: m.text, holds: open[i]! })),
        { id: 'between', said: 'between one matter and the next',
          holds: S.all(begun, S.not(over), ...open.map(c => S.not(c))) },
        { id: 'over', said: o.closes ?? 'over', holds: over }],
      requires: [o.when, ...o.matters.flatMap(m => m.until ? [m.until] : [])], effects: [],
      lowered: { rules, pursuits: [], objectives: [], entities: [o.id, ...o.matters.map(m => m.id)] },
      serves: open });
  }
  // A route: not yet set out, each leg in its window, stood down while its condition fails (Routes.lower).
  static route(module: Module, r: RouteSpec, pursuits: Pursuit[]) {
    const first = r.legs[0]!, before: Predicate = { kind: 'compare', operator: '<', right: { kind: 'number',
      value: first.from }, left: S.call('watch', 'clock') };
    S.add(module, { kind: 'route', name: r.id, words: r.legs.map(l => l.label ?? l.id).join(', then '),
      ...r.span ? { span: r.span } : {},
      participants: [{ role: 'keeps it', id: r.actor }, ...r.legs.map(l => ({ role: `leg ${l.id}`, id: l.place }))],
      phases: [{ id: 'before', said: 'not yet set out', holds: r.when ? S.all(before, r.when) : before },
        ...r.legs.map((l, i) => ({ id: l.id, said: l.label ?? `at ${l.place}`, holds: pursuits[i]!.when })),
        ...r.when ? [{ id: 'stood_down', said: 'stood down', holds: S.not(r.when) }] : []],
      requires: r.when ? [r.when] : [], effects: [],
      lowered: { rules: [], pursuits: pursuits.map(p => p.id), objectives: [], entities: [] }, serves: [] });
  }
}
