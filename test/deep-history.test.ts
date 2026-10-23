import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Region } from '../src/world/region-writer';

// A deep site is its makers' first and its successors' after: what the kingdom that followed did with it, and what
// its fall left there, is in its rooms, by the world's own history. Wren's kingdom was an order of monks, who made
// a chapel of the Delvers' hall, and it fell to plague, which filled the old stope with the dead; otter's was
// warlords, who held the adit and barricaded the way from below, and raiders came after them.
class After {
  static async world(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const region = w.report.region as Region, deep = region.sites.find(s => s.work?.deep)!;
    return { s: await PlaySession.start(w.path, seed, w.source), region, deep: `region__${deep.id}` };
  }
  static said(s: PlaySession, deep: string, role: string) {
    return (s.campaign.module.observations ?? []).filter(o => o.place === `${deep}_${role}`).map(o => o.text).join(' ');
  }
}

describe('a deep site after its makers', () => {
  it('shows what the kingdom after them did with it, and what its fall left', async () => {
    const { s, region, deep } = await After.world('wren');
    expect([region.history!.successors.kind, region.history!.successors.fallen]).toEqual(['abbots', 'plague']);
    expect(After.said(s, deep, 'haulage_hall')).toContain('made a chapel of their hall');
    expect(After.said(s, deep, 'adit_stope')).toContain('the town shut its sick in the old stope');
    // In the hall, with light to read by: the brothers' tablet, which tells of their kingdom, and their cup.
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('unlit', `${deep}_haulage_hall`) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', `${deep}_haulage_hall`) }]));
    const names = PlayerView.choices(s.campaign).map(x => x.choice.name);
    expect(names).toEqual(expect.arrayContaining(['Read the brothers\' tablet',
      'Collect a chapel cup of pewter and star-iron for Wenna']));
  }, 60000);
  it('in another world, after other successors, is other: a warlords\' gate and barricade, a raiders\' post', async () => {
    const { s, region, deep } = await After.world('otter');
    expect([region.history!.successors.kind, region.history!.successors.fallen]).toEqual(['warlords', 'raiders']);
    expect(After.said(s, deep, 'adit_adit')).toContain('a gate of squared timbers across the adit');
    expect(After.said(s, deep, 'adit_mouth')).toContain('Raiders from over the sea');
    const barricade = s.campaign.module.entities.find(e => e.name === 'the warlords\' barricade')!;
    expect(s.campaign.world.test(ModuleWriter.call('state', barricade.id, 'region__standing'))).toBe(true);
    expect(s.campaign.world.one('on', barricade.id)).toBeDefined();
  }, 60000);
});
