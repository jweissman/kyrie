import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';

// The coin left in a ruin's rooms is found as each room left it (a cracked pot, a crack in the flags, a burst
// strongbox), not as one purse rotted through in nearly every room of one barrow (the play-structure investigation's
// PT-15). Kite's ruins, every room with coin in it.
describe('coin left in a ruin', () => {
  it('lies as each room left it', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), m = s.campaign.module;
    const lying = m.entities.filter(e => /_coins$/.test(e.id)).map(e => m.observations?.find(o => o.when.kind === 'call'
      && o.when.name === 'state' && o.when.args[0] === e.id && /lying$/.test(o.when.args[1]!))?.text);
    expect(lying.length).toBeGreaterThan(5);
    expect(new Set(lying).size).toBeGreaterThan(3);
  }, 120000);
});
