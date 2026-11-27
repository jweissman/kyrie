import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';

// What an expedition's gains buy in Iscoed (mission-22/world/slice.md, step 4): the reeve's thirty crowns for the
// shut sea-gate are a fen-boat on Porthalen's landing, and the boat is ways no road goes: down the sluice-cut by water
// into the smugglers' store (the lower works' other way in), and across the drowned fen to the Barrow-Kin's chapel.
class Fen {
  static coin(j: Journey): number { return j.screen().purse.coin; }
  static ways(j: Journey): string { return j.choices().map(c => c.label).join(' | '); }
}
describe('a fen-boat bought with the sea-gate\'s reward', () => {
  it('opens the water ways at Gatesend that no road goes, and the drowned chapel at their end', async () => {
    const j = Journey.of(await DrawnWorld.start('iscoed', { origin: 'weir',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    j.roll('pass');
    await j.play('To the sea-bank');
    expect(Fen.ways(j)).not.toMatch(/sluice-cut|drowned mere/);
    await j.play('To the Wardens\' gatehouse', 'Search', 'Pack › A torch › Light', 'To the gate-well', 'Search',
      'the sea-gate\'s pawl: Take', 'To the Wardens\' gatehouse', 'Set the pawl in its socket and wind the sea-gate shut',
      'To the sea-bank', 'To the gate-yard', 'map:Porthalen', '?map:Porthalen', '?map:Porthalen');
    const before = Fen.coin(j);
    await j.play('Tell the reeve the sea-gate at Gatesend shuts');
    expect(Fen.coin(j)).toBe(before + 30);
    // And the reeve's tally to carry north (step 5): the salt road's reason.
    expect((j.screen().aims ?? []).map(a => a.text).join(' ')).toMatch(/Tower of the Scales in Dun Rìerdan/);
    await j.play('Buy one of Gwil\'s fen-boats');
    expect(Fen.coin(j)).toBe(before);
    await j.play('map:Gatesend', '?map:Gatesend', '?map:Gatesend', 'To the sea-bank');
    expect(Fen.ways(j)).toMatch(/sluice-cut.*drowned mere|drowned mere.*sluice-cut/);
    await j.play('To the sluice-cut', 'To the smugglers\' store');
    expect(j.screen().place.name).toMatch(/smugglers' store/);
    await j.play('To the sluice-cut', 'To the sea-bank', 'To the drowned mere', 'To the drowned chapel',
      'Pack › A candle › Light', 'Ring the chapel\'s bell');
    expect(j.latest).toMatch(/the sea-gate.s chain, moving in its slot/);
  }, 240000);
});
