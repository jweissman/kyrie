import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';

// Low Water in a world that goes on: the Bowl of Ammerlin lies beyond the south march of a country of hills, woods or
// fen, reached by the road across the march, and its own six days run from when it is reached. It is one of the
// independent adventures, of which a world holds the one its seed chooses: "mere" chooses it for a fen country.
describe('the Bowl of Ammerlin beyond a march', () => {
  it('is held beyond the south march of a fen country, and its Hearing falls six days after it is reached', async () => {
    const w = await WorldAssembler.assemble('mere', NodeBundleSource.shared, { region: { terrain: 'marsh' } });
    expect(w.report.region.beyond!.south!.name).toBe('the Bowl of Ammerlin');
    const s = await PlaySession.start(w.path, 'mere', w.source), frontier = new Frontier('mere', NodeBundleSource.shared);
    await GeneratedWorld.travel(s, 'edge_south');
    const elapsed = s.campaign.state.elapsed, drawn = await frontier.expand(s.campaign);
    expect(drawn!.region).toBeUndefined();
    const rid = drawn!.rid;
    expect(s.campaign.module.entities.some(e => e.id === `${rid}__deep_gate`)).toBe(true);
    const c = PlayerView.choices(s.campaign).find(x => /road across the march/.test(x.choice.name))!;
    await s.perform(c.choice.id);
    expect(s.campaign.world.one('at', 'party')).toBe(`${rid}__rim_road`);
    expect(s.campaign.world.number({ kind: 'call', name: `${rid}__hearingAt`, args: [`${rid}__bowl`] })).toBe(888 + elapsed);
    // Isaura waits at the head of the Stair for the Assessor; the Office's commission is the country's own.
    const head = PlayerView.choices(s.campaign).find(x => /head of the Stair/.test(x.choice.name))!;
    await s.perform(head.choice.id);
    expect(PlayerView.choices(s.campaign).some(x => /waiting for you/.test(x.choice.name))).toBe(true);
    // Gone back over the march for the best part of ten days, the company comes back to a Bowl that went on without it.
    const go = async (re: RegExp) =>
      s.perform(PlayerView.choices(s.campaign).find(x => re.test(x.choice.name))!.choice.id);
    await go(/north road, at the Rim/);
    await go(/road across the march/);
    while (s.campaign.state.elapsed < elapsed + 1300) { await go(/^Wait an hour|An hour/); }
    await go(/road across the march/);
    await go(/head of the Stair/);
    const L = (x: string) => `${rid}__${x}`;
    expect(s.campaign.world.test({ kind: 'call', name: L('complete'), args: [L('reckoner')] })).toBe(true);
    expect(s.campaign.world.test({ kind: 'call', name: L('registrarsFinding'), args: [L('ammerlin')] })).toBe(true);
    expect(s.campaign.world.one('at', L('isaura'))).toBe(L('office_hall'));
  }, 300000);
});
