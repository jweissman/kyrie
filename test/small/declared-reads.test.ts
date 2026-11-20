import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { DeclaredReads } from '../../src/lang/declared-reads';
import { PlayerView } from '../../src/presentation/player-view';

// A read of a relation no module declares fails where it is asked for (MT-25, the architectural review's Finding D:
// a misspelled or undeclared relation had read as an innocent nothing, `mounted` four times in one short probe), with
// an explicit optional read for one another module may declare. A tiny world played through its acts reads none.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Item coil "a coil of rope" is rope at yard.
  Goal false.`;
describe('a relation read', () => {
  it('is told where the module declares no such relation or measure, unless it is read as optional', async () => {
    const t = await Tiny.start(yard), w = t.world;
    expect(await DeclaredReads.during(async () => { w.related('mounted'); w.one('a', 'b'); })).toEqual(['a', 'mounted']);
    expect(await DeclaredReads.during(async () => {
      DeclaredReads.optional(w, 'mounted'); w.related('at'); w.describe(new Set(['hour', 'at']));
    })).toEqual([]);
  });
  it('names nothing undeclared as a world is played', async () => {
    const t = await Tiny.start(yard);
    const told = await DeclaredReads.during(async () => {
      for (const kind of ['take_item', 'light_item', 'wait']) {
        const c = PlayerView.choices(t.campaign).map(x => x.choice.id).find(id => id.startsWith(kind));
        if (c) { await t.perform(c); }
      }
      t.look();
    });
    expect(told).toEqual([]);
  });
});
