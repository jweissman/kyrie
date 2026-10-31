import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Countries } from '../src/world/countries';
import { ProvincePlay } from './support/province-play';
import { Pellam, home, steps } from './support/pellam';

// Pellam in a world that goes on, a province of its first country (Gate B: one country, every adventure in it). Its
// folk speak of the Frost Fair; the road to its way in comes down the North Road into the snow; its three days run
// from the morning it is reached; and after the ice goes out the city goes on, with no ending to close the book.
describe('Pellam in the one country', () => {
  it('is a province of every first country, its way in on the country\'s own land', () => {
    expect(Countries.provinces.some(c => c.id === 'pellam')).toBe(true);
    expect(Countries.marches.some(c => c.id === 'pellam')).toBe(false);
  });

  it('an innkeeper tells of the Frost Fair, the company walks the road in, and the Fair\'s days begin', async () => {
    const { s, told, rid } = await ProvincePlay.enter('rime', 'pellam', { region: { terrain: 'frost' } });
    expect(told).toContain('a handshake\'s the Court\'s');
    expect(PlayerView.observe(s.campaign).knowledge.some(k => k.id === 'region__gate_pellam_beyond')).toBe(true);
    const j = Journey.of(s), L = (x: string) => `${rid}__${x}`;
    expect(s.campaign.installations.find(m => m.id === rid)?.chapter).toBe(true);
    // No ending of the book is reached by itself in a world that goes on: endings close only the chapter.
    expect(s.campaign.world.one('at', 'party')).toBe(L('north_road'));
    const arrived = j.watch();
    const seen = await j.play('To the North Bar', 'To the Cheaping', 'To Swan Lane');
    expect(seen).toContain('A penny a stair');
    // The shepherd from Hawsfold comes in at the first noon after the company does, on the Fair's own days.
    await j.play(`=${arrived + 150}`);
    expect(s.campaign.world.test({ kind: 'call', name: L('abelCame'), args: [L('abel')] })).toBe(true);
    // Left alone, the three days go by; the chapter closes on the morning after the ice goes out; the world goes on.
    while (!s.campaign.world.related('reached').length && j.watch() < arrived + 640) { await j.play(`=${j.watch() + 12}`); }
    expect(s.campaign.world.related('reached').map(r => r.args[0])).toEqual([L('landed')]);
    expect(s.campaign.running).toBe(true);
    await j.play('To the Cheaping', 'To the North Bar', 'North Road', 'way into');
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
