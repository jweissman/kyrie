import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';

// The weir life's own errand (OR-247, the first blind cold play: aunt Tegwen's lease was in the pack and never an aim,
// and the sea-gate's story took the life over): the weir is the company's own aim, held from the first page beside the
// gate's, followed or set aside like any, and kept Nest's way: its trap lifted, its eels sold to her.
const aims = (j: Journey) => (j.screen().aims ?? []).map(a => `${a.id}${a.own ? ' own' : ''}${a.followed ? ' followed' : ''}`);
describe('the weir life', () => {
  it('holds the weir as its own aim, and follows it from the trap to Nest', async () => {
    const j = Journey.of(await DrawnWorld.start('iscoed', { origin: 'weir',
      party: [{ name: 'Wren', raceId: 'human', classId: 'bard' }] }, NodeBundleSource.shared));
    expect(aims(j)).toEqual(['origin__weir_lift own', 'gate__gate_aim']);
    expect(j.screen().aims?.[0]?.text).toMatch(/^Lift the trap at Tegwen's eel-weir\. It is below Gatesend/);
    await j.perform('follow:origin__weir_lift');
    await j.play('To Tegwen\'s eel-weir', 'Lift the weir\'s trap', '?a creel of eels: Take');
    expect(aims(j)).toEqual(['origin__weir_sell own followed', 'gate__gate_aim']);
    await j.play(`>${j.at('origin__nest')}`, 'Sell Nest the creel of eels', '?^Take your leave');
    expect(aims(j)).toEqual(['gate__gate_aim']);
  }, 120000);
});
