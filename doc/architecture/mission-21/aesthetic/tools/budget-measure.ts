// What the three-sentence budget would tell, over the sample test/scene-sentence-budget.test.ts measures (the opening
// place and every room of the first town, in a1 and kahitude): sentences before and after, what is held, and how many
// held lines carry a clue (an observation that teaches, or is about someone or something, or has an aspect), which the
// budget must never hide. Run from the repository: bun doc/architecture/mission-21/aesthetic/tools/budget-measure.ts
import { DrawnWorld } from '../../../../../src/world/drawn-world';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { ScreenModel } from '../../../../../src/ui/screen-model';
import { Narrator } from '../../../../../src/presentation/narrator';
import { ModuleWriter } from '../../../../../src/lang/module-writer';
import { SceneBudget, type BudgetLine } from '../../../../../src/presentation/scene-budget';
import { FictionalTime } from '../../../../../src/campaign/fictional-time';
import type { Campaign } from '../../../../../src/campaign/campaign';

interface Row { place: string; before: number; after: number; held: number; clues: number; cluesHeld: number; typed: number }
class Measure {
  static row(c: Campaign): Row {
    const screen = ScreenModel.build(c), leaf = Narrator.leaf(c, screen);
    const lines: BudgetLine[] = [...leaf.situation.map((text, i): BudgetLine => ({ text, kind: i ? 'standing' : 'lead' })),
      ...leaf.presence.map((text): BudgetLine => ({ text, kind: 'life' }))];
    const b = SceneBudget.compose(lines), told = b.told.map(t => t.text).join(' ');
    // Clues: what is observed here that teaches, or is about an entity, or carries an aspect (typed, not by words).
    const defs = new Map((c.module.observations ?? []).map(o => [o.id, o]));
    const clues = screen.observed.filter(o => { const d = defs.get(o.id); return !!d && (!!d.teaches || !!d.about || !!d.aspect); })
      .map(o => FictionalTime.prose(o.text));
    const first = (t: string) => t.split(/(?<=[.!?])\s/)[0] ?? t;
    // The typed budget: a paragraph holding a clue's sentence is told always (bearing), as the narrator could mark it.
    const typed = SceneBudget.compose(lines.map(l => l.kind === 'standing' && clues.some(k => l.text.includes(first(k)))
      ? { ...l, kind: 'bearing' as const } : l));
    const cluesHeld = clues.filter(t => !told.includes(first(t)) && leaf.situation.join(' ').includes(first(t))).length;
    return { place: `${screen.place.name}`, before: SceneBudget.count([...leaf.situation, ...leaf.presence].join(' ')),
      after: SceneBudget.count(told), held: b.held.length, clues: clues.length, cluesHeld,
      typed: typed.counted + typed.always };
  }
  static async sample(seed: string, origin: string): Promise<Row[]> {
    const s = await DrawnWorld.start(seed, { origin, party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
    const c = s.campaign, rows = [Measure.row(c)], here = c.world.one('at', 'party')!;
    const town = /^(region__s\d+)_/.exec(here)?.[1] ?? 'region__s1';
    for (const e of c.module.entities.filter(x => x.type === 'place' && x.id.startsWith(`${town}_`) && x.space?.kind === 'room')) {
      c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
        { kind: 'assert', call: ModuleWriter.call('at', 'party', e.id) }]));
      rows.push(Measure.row(c));
    }
    return rows;
  }
}
const rows = [...await Measure.sample('a1', 'kin'), ...await Measure.sample('kahitude', 'debt')];
const avg = (k: 'before' | 'after') => Math.round(rows.reduce((n, r) => n + r[k], 0) / rows.length * 10) / 10;
console.log(`scenes ${rows.length}; sentences before ${avg('before')} (5+: ${rows.filter(r => r.before >= 5).length}),`
  + ` after ${avg('after')} (5+: ${rows.filter(r => r.after >= 5).length})`);
console.log(`typed (facet-bearing paragraphs always told): average ${Math.round(rows.reduce((n, r) => n + r.typed, 0) / rows.length * 10) / 10}`
  + ` (5+: ${rows.filter(r => r.typed >= 5).length})`);
console.log(`clue-bearing observations in view ${rows.reduce((n, r) => n + r.clues, 0)}; held by the budget ${rows.reduce((n, r) => n + r.cluesHeld, 0)}`);
for (const r of rows.filter(x => x.before >= 5 || x.cluesHeld)) {
  console.log(`  ${r.place}: ${r.before} -> ${r.after}, held ${r.held}${r.cluesHeld ? `, CLUES HELD ${r.cluesHeld}/${r.clues}` : ''}`);
}
