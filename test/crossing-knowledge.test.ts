import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';
import type { Change } from '../src/lang/module';

// What the company has learned in play does not stop a later country being joined to the world (the independent
// review's A1, and the owner's "invalid knowledge"): once it had learned a fact an observation teaches without its
// being established, every later march crossing was refused and undone. What a module gives it to know from the
// start must still be so.
describe('knowledge and a country joined later', () => {
  it('crosses a march whatever the company has learned', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const world = s.campaign.world, taught = (s.campaign.module.observations ?? []).map(o => o.teaches)
      .filter((f): f is string => !!f && !world.test(ModuleWriter.call('established', f)));
    expect(taught.length).toBeGreaterThan(0);
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(taught.map(f => ({ kind: 'assert' as const, call: ModuleWriter.call('knows', 'party', f) }))));
    await GeneratedWorld.travel(s, 'edge_east');
    const drawn = await new Frontier('a1', NodeBundleSource.shared).expand(s.campaign);
    const road = PlayerView.choices(s.campaign).find(x => /road across the march/.test(x.choice.name))!;
    expect((await s.perform(road.choice.id)).result).toBe('success');
    expect(s.campaign.world.one('at', 'party')).toStartWith(`${drawn!.rid}__`);
  }, 180000);
  it('still refuses a module that gives the company to know what is not so', async () => {
    await expect(PlaySession.start('test/fixtures/probes/known-false/probe.campaign.json', 'p', NodeBundleSource.shared))
      .rejects.toThrow('Invalid initial knowledge');
  }, 60000);
});
