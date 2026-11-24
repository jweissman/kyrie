import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Doable, type Row } from '../../src/presentation/doable';
import { Runner } from '../../src/cli/runner';

// One resolution from the offer to rows that can be done (mission-22/doable-design.md, TB-12). A door on the way into
// a hall, with a word that opens it: the scene offers the tries at the speaking door, each a row of its own.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place hall "the hall" is room at 1, 0 indoors.
  Passage gate "the gate" is door between yard and hall.
  Company party "You" of 1 at yard.
  Thing door "the speaking door" on gate { State shut blocking "A door of dark wood, with a mouth carved in it.".
    State open "The door stands open.". Change speak "Say the word to the speaking door" from shut to open. }
  Thing bell "the bell" at yard { State still "A bell on a post.". Change ring "Ring the bell" from still to still. }
  Goal false.`;
const flat = (rows: readonly Row[]): Row[] => rows.flatMap(r => [r, ...flat(r.opens ?? [])]);
describe('the offer, as rows that can be done', () => {
  // Only a fight, a store and creation unfold (PB-29): the tries at the door are rows of their own, each done by its
  // own command, where a look at the door had opened on them; none is done by a guess.
  it('lays out a look at a thing on a way, each try a row doing its own command', async () => {
    const t = await Tiny.start(yard);
    const rows = flat(Doable.of(t.glance, t.screen)).filter(r => /t__door\b/.test(r.does ?? '') || /speaking door/.test(r.label));
    expect(rows.filter(r => r.opens?.length)).toEqual([]);
    expect(rows.map(r => r.does)).toEqual(expect.arrayContaining(['push(t__door)', 'listen(t__door)']));
    expect(flat(Doable.of(t.glance, t.screen)).find(r => r.label === 'Light a torch')?.does)
      .toBe('light_item(t__party_1__torch)');
  });
  // A look with a single act under it is that act, called by its words: there is nothing to choose in opening it (the
  // sea-gate's pawl, gold at the gate-well, is collecting it: cold play 5, CL-33).
  it('does the one act under a look that holds only one', async () => {
    const t = await Tiny.start(yard);
    const bell = flat(Doable.of(t.glance, t.screen)).find(r => r.id === 't__bell#look');
    expect([bell?.opens, bell?.does]).toEqual([undefined, 'change_thing(t__bell_ring)']);
  });
  // The runner reads it (RunnerOffer): an opener is listed with its rows, never done by its first, as the speaking
  // door's gold had been done as "Push and pull" (cold play 5, CL-34).
  it('is what the runner offers, row for row', async () => {
    const t = await Tiny.start(yard);
    const rows = Doable.of(t.glance, t.screen), said = new Runner(t.session).said();
    const runner = [...said.offer.primary, ...said.offer.rest].map(o => o.id);
    expect(runner.filter(id => !flat(rows).some(r => r.does === id || r.id === id || r.for === id))).toEqual([]);
    expect(flat(rows).filter(r => r.opens).map(r => r.id).filter(id => runner.includes(id))).toEqual(
      flat(rows).filter(r => r.opens && r.led).map(r => r.id));
  });
});
