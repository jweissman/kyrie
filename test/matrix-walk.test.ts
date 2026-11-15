import { describe, expect, it } from 'bun:test';
import { Guidance } from '../src/autoplay/guidance';
import { AutoplayRun, type RunSpec } from '../src/autoplay/run';

// The experiential matrix, a sample of it (the owner, 15 November): a class and an ancestry on a1 by each of the lab's
// three players (first act, what is worth exploring, aim followed and its gold). Hard: no run fails any step's
// invariant (the lab's own: sound creatures, something offered, every command told and on time). A baseline, not a
// threshold: the share of followed-aim steps the page guides is printed, with the line that makes the run again.
// About 20 s a run: for the whole suite, not the push lane (scripts/matrix-walk.ts runs the full grid).
class Matrix {
  static readonly cells: [string, string, RunSpec['policy']][] = [['warrior', 'human', 'follow'], ['mage', 'elf', 'silver'],
    ['cleric', 'dwarf', 'gold'], ['thief', 'human', 'gold']];
}
describe('the class × ancestry matrix, walked', () => {
  for (const [classId, raceId, policy] of Matrix.cells) {
    it(`keeps play sound: ${raceId} ${classId}, ${policy}`, async () => {
      const r = await AutoplayRun.run({ seed: 'a1', origin: 'order', policy, steps: 40,
        protagonist: { name: 'Wenna', raceId, classId } });
      const m = r.metrics;
      console.log(`matrix a1 ${raceId} ${classId} ${policy}: ${m.commands} commands, guided ${m.guided}/${m.guided + m.unguided}, A-B-A-B ${Guidance.alternations(r.steps.map(x => x.command))}`
        + ` | again: bun scripts/matrix-walk.ts --classes ${classId} --races ${raceId} --policies ${policy} --steps 40`);
      expect(r.failure).toBeUndefined();
      expect(m.commands).toBeGreaterThanOrEqual(m.steps);
    }, 240000);
  }
});
