import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';

// Low Water in a world that goes on: the Bowl of Ammerlin lies beyond the south march of a country of hills, woods or
// fen, reached by the road across the march, and its own six days run from the morning after it is reached. It is
// one of the independent adventures, of which a world holds the one its seed chooses: "mere" chooses it for a fen
// country.
describe('the Bowl of Ammerlin in the one country', () => {
  it('is a province of a fen country, and its Hearing falls six days on from reaching it', async () => {
    const w = await WorldAssembler.assemble('kin', NodeBundleSource.shared, { region: { terrain: 'marsh' } });
    expect(w.report.region.provinces!.map(p => p.name)).toContain('the Bowl of Ammerlin');
    const s = await PlaySession.start(w.path, 'kin', w.source), frontier = new Frontier('kin', NodeBundleSource.shared);
    await GeneratedWorld.travel(s, 'gate_lowwater');
    const elapsed = s.campaign.state.elapsed;
    await frontier.expand(s.campaign);
    const rid = 'plowwater';
    expect(s.campaign.module.entities.some(e => e.id === `${rid}__deep_gate`)).toBe(true);
    const c = PlayerView.choices(s.campaign).find(x => /road on into the Bowl/.test(x.choice.name))!;
    await s.perform(c.choice.id);
    expect(s.campaign.world.one('at', 'party')).toBe(`${rid}__rim_road`);
    // Its Hearing at its own watch 888, its watch read as the watches since the morning after it was reached.
    expect(s.campaign.world.number({ kind: 'call', name: `${rid}__hearingAt`, args: [`${rid}__bowl`] })).toBe(888);
    expect(JSON.stringify(s.campaign.module.rules!.filter(r => r.id.startsWith(`${rid}__`)).map(r => r.when)))
      .toContain(`"right":{"kind":"number","value":${Math.ceil(elapsed / 144) * 144}}`);
    // Isaura waits at the head of the Stair for the Assessor; the Office's commission is the country's own.
    const head = PlayerView.choices(s.campaign).find(x => /head of the Stair/.test(x.choice.name))!;
    await s.perform(head.choice.id);
    expect(PlayerView.choices(s.campaign).some(x => /waiting for you/.test(x.choice.name))).toBe(true);
    // Gone back out to the country for the best part of ten days, the company comes back to a Bowl gone on without it.
    const go = async (re: RegExp) =>
      s.perform(PlayerView.choices(s.campaign).find(x => re.test(x.choice.name))!.choice.id);
    await go(/north road, at the Rim/);
    await go(/way into the Bowl/);
    while (s.campaign.state.elapsed < elapsed + 1300) { await go(/^Wait an hour|An hour/); }
    await go(/road on into the Bowl/);
    await go(/head of the Stair/);
    const L = (x: string) => `${rid}__${x}`;
    expect(s.campaign.world.test({ kind: 'call', name: L('complete'), args: [L('reckoner')] })).toBe(true);
    expect(s.campaign.world.test({ kind: 'call', name: L('registrarsFinding'), args: [L('ammerlin')] })).toBe(true);
    expect(s.campaign.world.one('at', L('isaura'))).toBe(L('office_hall'));
  }, 300000);
});
