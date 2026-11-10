import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Journey } from '../src/session/journey';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';

// The owner, 6 November: the runtime owns the company, and a preset party is no evidence. Begun alone in a drawn
// world, a protagonist takes on someone met there, goes with them to an authored adventure's country, and a save
// taken there comes back as it was: the same company, where it stood, the adventure's country still drawn.
describe('a company made in play', () => {
  it('goes from the first town to an authored adventure and survives a save', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { origin: 'kin',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }], region: { terrain: 'mountain' } });
    const s = await PlaySession.start(w.path, 'thorn', w.source), c = s.campaign;
    expect(c.readout.partyIds).toHaveLength(1);
    const brother = 'drover__son', at = () => c.world.one('at', 'party')!;
    for (const [passage, to] of Journey.way(c.world, at(), c.world.one('at', brother)!)) {
      await s.leg(`go(${passage},${to})`);
    }
    const offered = () => PlayerView.choices(c).map(r => r.choice.id);
    if (offered().includes(`talk_to(${brother})`)) { await s.leg(`talk_to(${brother})`); }
    // He says he will come, asked what he means to do; then he is asked to.
    await s.leg('drover__son_plan');
    expect(offered()).toContain(`recruit(${brother})`);
    await s.leg(`recruit(${brother})`);
    expect(c.readout.partyIds).toHaveLength(2);
    await GeneratedWorld.travel(s, 'gate_longman');
    const before = new Set(c.module.entities.map(e => e.id));
    await new Frontier('thorn', NodeBundleSource.shared).expand(c);
    const there = at(), drawn = c.module.entities.map(e => e.id).filter(id => !before.has(id));
    expect(drawn.length).toBeGreaterThan(0);
    const back = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint()))).campaign;
    expect(back.readout.partyIds).toEqual(c.readout.partyIds);
    expect(back.world.one('at', 'party')).toBe(there);
    const kept = new Set(back.module.entities.map(e => e.id));
    expect(drawn.filter(id => !kept.has(id))).toEqual([]);
  }, 240000);
});
