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

// The Lull in a generated world (doc/adventures/the-lull): an ordinary wanderer, beginning in a forest country, walks
// east into a country drawn from the seed, hears of the Lull from whoever keeps travellers there, and goes on over its
// north march to the march road at Sixways. Seed l127 puts the Lull north of x1y0.
describe('The Lull in the world', () => {
  it('lies north of a forest, mountain or fen country drawn from the seed, and moves no other country', () => {
    for (const seed of ['s1', 'thorn', 'wren', 'g1', 'kite', 'a1', 'h2', 'l127']) {
      const first = WorldGrid.drawn(seed, 0, 0).terrain as string;
      const plan = Countries.plan(seed, first);
      const at = [...plan].find(([, c]) => c.id === 'lull')?.[0];
      expect(at, `${seed} ${first}`).toBeDefined();
      // Never on the first ring: Merrowdale holds every first country's north march.
      expect(['x0ym1', 'x1y0', 'xm1y0', 'x0y1']).not.toContain(at);
    }
    expect([...Countries.plan('l127', 'forest')].find(([, c]) => c.id === 'lull')?.[0]).toBe('x1ym1');
  });

  it('is heard of in the country next to it, and walked into over the north march, and keeps its own sennight', async () => {
    const seed = 'l127';
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', region: { terrain: 'forest' }, party: [{ name: 'Morwen', raceId: 'human', classId: 'warrior' }] });
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
    for (const side of ['east']) {
      await GeneratedWorld.travel(s, rid ? `${rid}__edge_${side}` : `edge_${side}`);
      const drawn = await frontier.expand(c);
      await cross(drawn!.rid); rid = drawn!.rid;
    }
    expect(rid).toBe('x1y0');
    // Whoever keeps travellers there tells of the valley over the north march.
    expect(await ask(new RegExp(`^${rid}__edge_north_beyond_told_`))).toContain('one day in seven');
    await GeneratedWorld.travel(s, `${rid}__edge_north`);
    const drawn = await frontier.expand(c);
    expect(c.installations.find(m => m.id === drawn!.rid)?.chapter).toBe(true);
    const lull = drawn!.rid, k = (id: string) => `${lull}__${id}`;
    const j = Journey.of(s);
    await j.play('march road');
    expect(c.world.one('at', 'party')).toBe(k('march_road'));
    expect(j.page).toMatch(/a hamlet of one street/);
    // The board by the pump counts the days to the Lull; the stone waits for it; the road goes down at six.
    await j.play('Sixways street$');
    expect(j.page).toMatch(/LULL IN \d/);
    await j.play('To the Fold-stone$');
    expect(j.matches("To the Tump's shoulder").length).toBe(0);
    await j.play('Sit down by the Fold-stone');
    expect(j.matches("To the Tump's shoulder").length).toBe(1);
    expect(j.page).toMatch(/another road, going down/);
    await j.play("To the Tump's shoulder", 'To Linger green');
    expect(c.world.test({ kind: 'call', name: k('cameIn'), args: ['party'] })).toBe(true);
    expect(j.page).toMatch(/Long Table/);
  }, 900000);

  it('played through to the Seventh Day in the world, closes its chapter and not the book, and is changed when walked back into', async () => {
    const seed = 'l127';
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', region: { terrain: 'forest' }, party: [{ name: 'Morwen', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, seed, w.source), c = s.campaign;
    const frontier = new Frontier(seed, NodeBundleSource.shared);
    await GeneratedWorld.travel(s, 'edge_east');
    const east = await frontier.expand(c);
    await s.perform(PlayerView.choices(c).find(x => x.choice.id.startsWith('go(link') && x.choice.id.includes(`,${east!.rid}__`))!.choice.id);
    await GeneratedWorld.travel(s, `${east!.rid}__edge_north`);
    const lull = (await frontier.expand(c))!.rid, k = (id: string) => `${lull}__${id}`;
    const holds = (name: string, ...args: string[]) => c.world.test({ kind: 'call', name: k(name), args: args.map(a => a === 'party' ? a : k(a)) });
    const j = Journey.of(s);
    await j.play('march road');
    const file = await Bun.file('test/fixtures/the-lull/seventh.json').json() as Record<string, string[]>;
    for (const steps of Object.values(file)) { await j.play(...steps); }
    expect(holds('outcomeSeventh', 'lull_country')).toBe(true);
    expect(c.world.related('reached').map(r => r.args[0])).toEqual([k('seventh_day')]);
    expect(c.running).toBe(true);
    // The word in the country behind it is old news now.
    expect(c.world.related('stale').length).toBeGreaterThan(0);
    // Come back to it a day later: the bridge stands, the road is open on an ordinary day, the stone says so.
    await j.play('=+60', 'To Linger green', "To the Tump's shoulder", 'To the Fold-stone');
    expect(j.page).toMatch(/AND THEN MONDAY/);
    await j.play("To the Tump's shoulder", 'To Linger green', 'To the end of the Shift Bridge');
    expect(j.page).toMatch(/goes over the mill-leat again/);
    expect(j.page).toMatch(/Monday, and After|weighbridge house/);
  }, 900000);
});
