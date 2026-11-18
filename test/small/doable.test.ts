import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Doable, type Row } from '../../src/presentation/doable';
import { Runner } from '../../src/cli/runner';

// One resolution from the offer to rows that can be done (mission-22/doable-design.md, TB-12). A door on the way into
// a hall, with a word that opens it: the scene offers "Look at the speaking door", an opener, with tries under it.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place hall "the hall" is room at 1, 0 indoors.
  Passage gate "the gate" is door between yard and hall.
  Company party "You" of 1 at yard.
  Thing door "the speaking door" on gate { State shut blocking "A door of dark wood, with a mouth carved in it.".
    State open "The door stands open.". Change speak "Say the word to the speaking door" from shut to open. }
  Goal false.`;
const flat = (rows: readonly Row[]): Row[] => rows.flatMap(r => [r, ...flat(r.opens ?? [])]);
describe('the offer, as rows that can be done', () => {
  it('opens an opener, and never does it by a guess', async () => {
    const t = await Tiny.start(yard);
    const rows = Doable.of(t.glance, t.screen);
    const opener = flat(rows).find(r => r.opens?.length && /speaking door/.test(r.label));
    expect(opener).toBeDefined();
    expect(opener!.does).toBeUndefined();
    // What it opens: what can be done to the door, each by its own command.
    expect(opener!.opens!.every(r => !!r.does)).toBe(true);
    expect(opener!.opens!.map(r => r.does)).toEqual(['push(t__door)', 'listen(t__door)']);
    // And what is offered by its command alone does that command.
    expect(flat(rows).find(r => r.label === 'Light a torch')?.does).toBe('light_item(t__party_1__torch)');
  });
  // The runner still does an opener by its first child (Runner.way); this fails until the runner reads Doable
  // (the design's step 2): it is the speaking door's "Push and pull" for gold (cold play 5, CL-34).
  it.failing('is what the runner offers, row for row', async () => {
    const t = await Tiny.start(yard);
    const rows = Doable.of(t.glance, t.screen), said = new Runner(t.session).said();
    const runner = [...said.offer.primary, ...said.offer.rest].map(o => o.id);
    expect(runner.filter(id => !flat(rows).some(r => r.does === id || r.id === id))).toEqual([]);
    expect(flat(rows).filter(r => r.opens).map(r => r.id).filter(id => runner.includes(id))).toEqual(
      flat(rows).filter(r => r.opens && r.led).map(r => r.id));
  });
});
