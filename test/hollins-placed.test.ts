import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { WorldAssembler } from '../src/world/world-assembler';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { WorldGrid } from '../src/world/world-grid';
import { GeneratedWorld } from './support/generated';

// Behind the Wainscot in a generated world (doc/adventures/behind-the-wainscot): an ordinary wanderer, beginning in
// the world's first country, walks out through the countries drawn from the seed, hears of Hollins from whoever keeps
// travellers in the country next to it, sees the ratcatcher's notice nailed up there, and goes over its north march
// down the moor road into Bootscrape. Seed kite puts Hollins north of x2ym1.
describe('Behind the Wainscot in the world', () => {
  it('lies north of a mountain, forest or frost country beyond the first ring, and moves no other country', () => {
    for (const seed of ['wren', 'thorn', 'a1', 'b2', 'g7', 'kin', 'mere', 'cov13', 'kite']) {
      const first = WorldGrid.drawn(seed, 0, 0).terrain as string;
      const plan = Countries.plan(seed, first);
      const at = [...plan].find(([, c]) => c.id === 'hollins')?.[0];
      expect(at, `${seed} ${first}`).toBeDefined();
      expect(['x0ym1', 'x1y0', 'xm1y0', 'x0y1']).not.toContain(at);
    }
    expect([...Countries.plan('kite', WorldGrid.drawn('kite', 0, 0).terrain as string)].find(([, c]) => c.id === 'hollins')?.[0]).toBe('x2ym2');
  }, 30000);

  it('is heard of in the country next to it, and walked into over the north march, where the Lady has come home', async () => {
    const seed = 'kite';
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Morwen', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, seed, w.source), c = s.campaign;
    const frontier = new Frontier(seed, NodeBundleSource.shared);
    const ask = async (pattern: RegExp) => {
      const topic = c.module.actions.find(a => pattern.test(a.id));
      if (!topic) { return ''; }
      await GeneratedWorld.travel(s, c.world.one('at', topic.speaker!)!);
      const choice = PlayerView.choices(c).find(x => x.choice.id.includes(topic.id));
      return choice ? (await s.perform(choice.choice.id)).response ?? '' : '';
    };
    const cross = async (rid: string) => {
      await s.perform(PlayerView.choices(c).find(x => x.choice.id.startsWith('go(link') && x.choice.id.includes(`,${rid}__`))!.choice.id);
    };
    let rid = '';
    for (const side of ['east', 'north', 'east']) {
      await GeneratedWorld.travel(s, rid ? `${rid}__edge_${side}` : `edge_${side}`);
      const drawn = await frontier.expand(c);
      await cross(drawn!.rid); rid = drawn!.rid;
    }
    expect(rid).toBe('x2ym1');
    // Whoever keeps travellers there tells of the house over the north march.
    expect(await ask(new RegExp(`^${rid}__edge_north_beyond_told_`))).toContain('ratcatcher');
    await GeneratedWorld.travel(s, `${rid}__edge_north`);
    const drawn = await frontier.expand(c);
    expect(c.installations.find(m => m.id === drawn!.rid)?.chapter).toBe(true);
    const h = drawn!.rid, k = (id: string) => `${h}__${id}`;
    const j = Journey.of(s);
    await j.play('moor road');
    expect(c.world.one('at', 'party')).toBe(k('march_road'));
    expect(j.page).toMatch(/windows in it, each window as tall as a church/);
    await j.play('To Bootscrape street');
    expect(j.page).toMatch(/WANTED, A RATCATCHER/);
    await j.play('To the top of the doorstep', 'by the Slot', 'To the Letterdrift');
    expect(j.page).toMatch(/three hundred years of letters/);
  }, 900000);
});
