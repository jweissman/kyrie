import { describe, expect, it } from 'bun:test';
import { DangerSense } from '../../src/presentation/danger-sense';
import type { Creature } from '../../src/creature';

// "Could fall" said where it is likely enough to matter (the second blind playtest, BL-08: every hob fight said "Ander
// could fall", and every one was won unhurt in two or three rounds). With others beside you, someone falling in one
// won fight in two dozen is not said; in one in five or more, it is. Alone, any fall is said: no one gets you up.
const member = (id: string, name: string, level: number) =>
  ({ id, name, raceId: 'human', base: { level }, state: { experience: 0 } }) as unknown as Creature;
const judge = (fallen: number, ours: Creature[]) => (DangerSense as unknown as {
  judge(f: object, ours: Creature[], foes: Creature[]): { danger: string; text: string } }).judge({ odds: 0.97, fallen,
  hurt: 0.1, frail: 'ander', blunted: 0, hurtBy: [], worst: 0.2, harmed: false, sure: true }, ours,
[member('hob', 'a hob', 1), member('hob2', 'a hob', 1)]);
describe('the danger sense', () => {
  const company = [member('thora', 'Thora', 3), member('ander', 'Ander', 1)];
  it('says someone could fall where it is likely, not where it happened once in two dozen fights', () => {
    expect(judge(1 / 24, company)).toMatchObject({ danger: 'fair', text: expect.stringContaining('though not unhurt') });
    expect(judge(0.3, company)).toMatchObject({ danger: 'hard', text: expect.stringContaining('Ander could fall') });
  });
  it('says it of one alone at any fall', () => {
    expect(judge(1 / 24, [member('thora', 'Thora', 3)]).danger).toBe('hard');
  });
});
