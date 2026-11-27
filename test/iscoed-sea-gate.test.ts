import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';

// Iscoed's sea-gate and its lower works (mission-22/world/slice.md, step 3): under the gate-well the Water-Wardens'
// gallery, where eels hunt the running water and lie stranded at the ebb; their tide-room, with the key and the slate
// that says when the lower sluice door has no sea behind it; a smugglers' store found behind the chain, whose tally the
// reeve will read; and what the country remembers of it all: the gate shut, or the fen drowned at the spring tide.
class Gate {
  static async begin(): Promise<Journey> {
    const j = Journey.of(await DrawnWorld.start('iscoed', { origin: 'weir',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    j.roll('pass');
    return j;
  }
  static told(j: Journey): string { return j.screen().prose.join(' '); }
}
describe('the sea-gate at Gatesend', () => {
  it('opens its lower works to the wardens\' key at low water, the eels stranded, the smugglers\' store found',
    async () => {
      const j = await Gate.begin();
      await j.play('To the sea-bank', 'To the Wardens\' gatehouse', 'Pack › A torch › Light', 'To the gate-well',
        'To the sluice gallery', 'To the wardens\' tide-room', 'the wardens\' tide-table: Take',
        'the wardens\' sluice-key: Take', 'To the sluice gallery');
      expect(j.matches('To the wardens\' undercroft')).toEqual([]);
      // The eels warn the company off the gallery while the water runs (OR-163: only answering them is offered, not a
      // search): it waits out the flood in the dry tide-room, and comes back down at the ebb by a candle (the torch
      // burned down), the eels stranded.
      await j.play('To the wardens\' tide-room', '=16:10', 'Pack › A candle › Light',
        'To the sluice gallery');
      expect(j.holds('state', 'gate__eels', 'gate__stranded')).toBe(true);
      await j.play('Search', 'To the smugglers\' store', 'a smuggler\'s tally: Take', 'To the sluice gallery');
      await j.play('To the wardens\' undercroft');
      expect(j.screen().place.name).toBe('the wardens\' undercroft');
      expect(`${j.latest} ${Gate.told(j)}`).toMatch(/bargained with, a tide at a time/);
    }, 180000);
  it('is remembered drowned where nobody shut it: the fen under water, and Gatesend\'s people in the town', async () => {
    const j = await Gate.begin();
    await j.play('=day 7 09:00');
    expect(Gate.told(j)).toMatch(/Water stands a foot deep in the lanes/);
    await j.play('map:Porthalen', '?map:Porthalen', '?map:Porthalen');
    expect(Gate.told(j)).toMatch(/sleeping in the shrine at Porthalen/);
    expect((j.screen().aims ?? []).map(a => a.text).join(' ')).not.toMatch(/sea-gate/);
  }, 180000);
  it('comes round for one without the arms for it, at low water, to the pawl and the wardens\' slate', async () => {
    const j = Journey.of(await DrawnWorld.start('iscoed', { origin: 'weir',
      party: [{ name: 'Wenna', raceId: 'elf', classId: 'mage' }] }, NodeBundleSource.shared));
    await j.play('To the sea-bank', 'To the Wardens\' gatehouse', 'Search', 'To the gate-well', 'Wenna: cast Light', 'Search',
      'the sea-gate\'s pawl: Take', 'To the sluice gallery', 'To the wardens\' tide-room', 'the wardens\' tide-table: Take',
      'the wardens\' tide-table: Read', 'To the sluice gallery', 'To the gate-well', 'To the Wardens\' gatehouse', '=16:10',
      'Wind the sea-gate shut at low water');
    expect(j.latest).toMatch(/the drum comes round as easily as a well-winch/);
  }, 180000);
  it('is remembered shut where it was shut, by Gatesend and by the town', async () => {
    const j = await Gate.begin();
    await j.play('To the sea-bank', 'To the Wardens\' gatehouse', 'Search', 'Pack › A torch › Light', 'To the gate-well',
      'Search', 'the sea-gate\'s pawl: Take', 'To the Wardens\' gatehouse',
      'Set the pawl in its socket and wind the sea-gate shut', 'To the sea-bank', 'To the gate-yard');
    expect(Gate.told(j)).toMatch(/runs the right way: out/);
    await j.play('map:Porthalen', '?map:Porthalen', '?map:Porthalen');
    expect(Gate.told(j)).toMatch(/shut the night before the spring tide/);
  }, 180000);
});
