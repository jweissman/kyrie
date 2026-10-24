import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';

// Generated worlds that would not start, found by starting a hundred and ten of them (cov0 to cov109, by each
// origin for the first thirty). In cov2 the town nearest the mine keeps its god at a cross by the way and has no
// shrine, and the priest's word on the walled stair was kept at "s5_shrine" all the same. In cov24 the brothers'
// prior was of the elves of the town, and an elf is no cleric. The shrine's rules now stand where the priest does,
// and a power's head takes their people's calling when theirs is not one of them.
class Start {
  static async of(seed: string, origin = 'wanderer') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin, party: [{ name: 'Wenna', raceId: 'human', classId: 'thief' }] });
    return PlaySession.start(w.path, seed, w.source);
  }
}

describe('generated worlds start', () => {
  it('with a priest who keeps their god at a cross by the way, and keeps the shrine\'s word there', async () => {
    for (const origin of ['wanderer', 'order']) {
      const s = await Start.of('cov2', origin);
      const shut = s.campaign.module.observations?.find(o => o.id === 'region__w8_shut');
      expect(shut?.place).toBe('region__s5_green');
    }
  }, 90000);
  it('with a prior of a people that has no clerics', async () => {
    const s = await Start.of('cov24');
    expect(s.campaign.world.test(ModuleWriter.call('pursues', 'region__w9_head', 'region__w9_rivals'))).toBe(true);
  }, 60000);
});
