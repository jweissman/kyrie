import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { WorldAudit } from '../src/world/world-audit';
import { ModuleWriter } from '../src/lang/module-writer';

// Every story in a generated world can be found and finished: its places walked to, what its people want got
// somewhere, its word heard from someone reachable, its ending something the world can bring about. Read off the
// world, for many seeds; and a world with a story that cannot be finished is caught (a fever with no herbs anywhere).
class Audited {
  static async world(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return { w, s: await PlaySession.start(w.path, seed, w.source) };
  }
}

describe('a generated world\'s stories', () => {
  it.each(['thorn', 'a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8', 'i9'])('can all be found and finished in %s', async seed => {
    const { w, s } = await Audited.world(seed);
    expect(WorldAudit.audit(s.campaign, w.report.placements)).toEqual([]);
  }, 60000);
  it('catches one that cannot: a fever when there are no herbs to be had anywhere', async () => {
    const { w, s } = await Audited.world('thorn');
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    const herbs = s.campaign.world.related('itemKind').filter(r => r.args[1] === 'herbs');
    c.commit(c.world.apply(herbs.map(r => ({ kind: 'retract', call: ModuleWriter.call('itemKind', ...r.args) }))));
    expect(WorldAudit.audit(s.campaign, w.report.placements)).toEqual([expect.objectContaining({ kind: 'resource',
      subject: 'fever__mother' })]);
  }, 60000);
});
