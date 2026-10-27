import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { WorldAssembler } from '../src/world/world-assembler';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { GeneratedWorld } from './support/generated';
import { Pellam, home, steps } from './support/pellam';

// Pellam in a world that goes on: an authored country held beyond the west march of a cold or mountain country,
// where the Ghessil Uplands (independent, and held only where the seed chooses them) do not lie. Its folk speak of the
// Frost Fair; the road over the march comes down the North Road into the snow; its three days run from the morning
// it is reached; and after the ice goes out the city goes on, with no ending to close the book.
describe('Pellam beyond a march', () => {
  it('lies west of a cold country unless the Ghessil Uplands do, and changes no other country\'s place', () => {
    expect(Countries.fits('frost', 'west', () => false, 'rime')?.id).toBe('pellam');
    expect(Countries.fits('frost', 'west', () => false, 'b2')?.id).toBe('ghessil');
    // Where the Uplands are chosen, Pellam is still in the world, further out.
    expect([...Countries.plan('b2', 'frost').values()].map(c => c.id)).toContain('pellam');
  });

  it('an innkeeper of a cold country tells of the Frost Fair, the company walks over the west march, and the Fair\'s days begin', async () => {
    const world = await WorldAssembler.assemble('rime', NodeBundleSource.shared, { region: { terrain: 'frost' } });
    expect(world.report.region.beyond!.west!.name).toBe('Pellam on the Lisk');
    const s = await PlaySession.start(world.path, 'rime', world.source), j = Journey.of(s);
    // Asked about the road west, whoever keeps travellers tells of it, by walking there and asking as a player does.
    const told = s.campaign.module.actions.find(a => a.id.startsWith('region__edge_west_beyond_told_'))!;
    await GeneratedWorld.travel(s, s.campaign.world.one('at', told.speaker!)!.replace(/^region__/, ''));
    expect(await j.play('Frost Fair at Pellam')).toContain('a handshake\'s the Court\'s');
    expect(PlayerView.observe(s.campaign).knowledge.some(k => k.id === 'region__edge_west_beyond')).toBe(true);
    await GeneratedWorld.travel(s, 'edge_west');
    const drawn = await new Frontier('rime', NodeBundleSource.shared).expand(s.campaign);
    expect(drawn!.region).toBeUndefined();
    const rid = drawn!.rid, L = (x: string) => `${rid}__${x}`;
    expect(s.campaign.installations.find(m => m.id === rid)?.chapter).toBe(true);
    // No ending of the book is reached by itself in a world that goes on: endings close only the chapter.
    await j.play('North Road, above Pellam');
    expect(s.campaign.world.one('at', 'party')).toBe(L('north_road'));
    const arrived = j.watch();
    const seen = await j.play('To the North Bar', 'To the Cheaping', 'To Swan Lane');
    expect(seen).toContain('A penny a stair');
    // The shepherd from Hawsfold comes in at the first noon after the company does, on the Fair's own days.
    await j.play(`=${arrived + 150}`);
    expect(s.campaign.world.test({ kind: 'call', name: L('abelCame'), args: [L('abel')] })).toBe(true);
    // Left alone, the three days go by; the chapter closes on the morning after the ice goes out, and the world goes on.
    while (!s.campaign.world.related('reached').length && j.watch() < arrived + 640) { await j.play(`=${j.watch() + 12}`); }
    expect(s.campaign.world.related('reached').map(r => r.args[0])).toEqual([L('landed')]);
    expect(s.campaign.running).toBe(true);
    await j.play('To the Cheaping', 'To the North Bar', 'North Road', 'march-stone');
    expect(s.campaign.world.one('at', 'party')).not.toMatch(new RegExp(`^${rid}__`));
  }, 600000);
});

describe('The Liberty of the Ice: kept and replayed', () => {
  it('kept on the second morning and opened again, the world goes on to the same end', async () => {
    const all = steps('long');
    const whole = await Pellam.start(home, 'lisk');
    await whole.play(...all);
    const split = await Pellam.start(home, 'lisk'), at = all.indexOf('go:counting_house');
    await split.play(...all.slice(0, at));
    const back = new Pellam(Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(split.j.session.checkpoint())))));
    await back.play(...all.slice(at));
    expect(back.ending()).toEqual(whole.ending());
    expect(back.j.campaign.state.elapsed).toBe(whole.j.campaign.state.elapsed);
    expect(back.holds('hiredReleased', 'lisk')).toBe(whole.holds('hiredReleased', 'lisk'));
    expect(back.gold()).toBe(whole.gold());
  }, 600000);

  it('played twice from the same seed, the same steps make the same history', async () => {
    const a = await Pellam.start(home, 'lisk'), b = await Pellam.start(home, 'lisk');
    const some = steps('long', 'in', 'court', 'supper');
    await a.play(...some); await b.play(...some);
    expect(a.j.campaign.state.elapsed).toBe(b.j.campaign.state.elapsed);
    expect(a.j.taken.map(x => x.told)).toEqual(b.j.taken.map(x => x.told));
  }, 400000);
});
