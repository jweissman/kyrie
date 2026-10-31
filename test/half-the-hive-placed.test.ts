import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { WorldAssembler } from '../src/world/world-assembler';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { GeneratedWorld } from './support/generated';

// Half the Hive in a generated world: an ordinary wanderer, beginning in a frost country, walks south across two
// marches, hears of the Wold of Hume from whoever keeps travellers in the mountain country there, and goes on south
// over the march to the drove road, where the turf is full of thyme and smoke stands up out of a gorge. Seed g2 puts
// the Wold three south of the first country (Countries.plan). Offered beside mountain countries only,
// on the south side, where the Vale of the Wray always takes the first ring, it is never on the first ring and moves
// no other country (bin/kyrie countries, compared before and after).
describe('Half the Hive in the world', () => {
  it('is placed south of a mountain country drawn from the seed, never on the first ring', () => {
    for (const seed of ['g1', 'b2', 'wren', 'kin']) {
      for (const first of ['mountain', 'forest', 'marsh']) {
        const at = [...Countries.plan(seed, first)].find(([, c]) => c.id === 'hume')?.[0];
        if (at) { expect(['x0ym1', 'x1y0', 'xm1y0', 'x0y1']).not.toContain(at); }
      }
    }
    expect([...Countries.plan('g2', 'frost')].find(([, c]) => c.id === 'hume')?.[0]).toBe('x0y3');
    }, 30000);

  it('heard of in the country it is entered from, walked into over the south march, and the Comb reached and scented', async () => {
    const seed = 'g2';
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', region: { terrain: 'frost' }, party: [{ name: 'Aud', raceId: 'elf', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, seed, w.source), c = s.campaign;
    const frontier = new Frontier(seed, NodeBundleSource.shared);
    const ask = async (pattern: RegExp) => {
      const topic = c.module.actions.find(a => pattern.test(a.id))!;
      await GeneratedWorld.travel(s, c.world.one('at', topic.speaker!)!);
      const choice = PlayerView.choices(c).find(x => x.choice.id.includes(topic.id))!;
      return (await s.perform(choice.choice.id)).response ?? '';
    };
    const cross = async (rid: string) => {
      await s.perform(PlayerView.choices(c).find(x => x.choice.id.startsWith('go(link') && x.choice.id.includes(`,${rid}__`))!.choice.id);
    };
    let rid = '';
    for (const side of ['south', 'south']) {
      await GeneratedWorld.travel(s, rid ? `${rid}__edge_${side}` : `edge_${side}`);
      const drawn = await frontier.expand(c);
      await cross(drawn!.rid); rid = drawn!.rid;
    }
    expect(await ask(new RegExp(`^${rid}__edge_south_beyond_told_`))).toContain('lives inside a honeycomb under a cliff');
    await GeneratedWorld.travel(s, `${rid}__edge_south`);
    const drawn = await frontier.expand(c);
    expect(c.installations.find(m => m.id === drawn!.rid)?.chapter).toBe(true);
    const j = Journey.of(s);
    await j.play('drove road');
    expect(c.world.one('at', 'party')).toBe(`${drawn!.rid}__drove_end`);
    expect(j.page).toMatch(/smoke standing up out of its mouth/);
    await j.play(`>${drawn!.rid}__scenting_room`, 'Ask Elspet to scent you', `>${drawn!.rid}__mothers_chamber`, 'Talk to Linnet');
    expect(c.world.one('at', 'party')).toBe(`${drawn!.rid}__mothers_chamber`);
    expect(j.page).toMatch(/I keep her/);
    expect(j.page).not.toMatch(/The Sisters come for you/);
    expect(c.running).toBe(true);
    // Left to itself the week goes on: the squire's flask, the Leaving to Larkhill, the Turning-out; the chapter
    // closes on its ending and the world goes on, with the Wold in it.
    for (let i = 0; i < 200 && !c.world.related('reached').length; i++) { await j.play('^Wait › An hour'); }
    expect(c.world.related('reached').map(r => r.args[0])).toEqual([`${drawn!.rid}__lark_owned`]);
    expect(c.running).toBe(true);
    expect(c.world.test({ kind: 'call', name: 'stale', args: [`${rid}__edge_south_beyond`] } as never)).toBe(true);
    // The Leaving is where it went, and its people have their own news.
    await j.play(`>${drawn!.rid}__chantry_yard`, 'Talk to Kestrel', 'Ask Kestrel how the Leaving does at Larkhill');
    expect(j.page).toMatch(/Rent/);
    // And down the road, whoever keeps travellers has heard, and says so.
    const back = c.module.actions.find(a => a.id.startsWith(`${rid}__edge_south_beyond_back_`))!;
    await GeneratedWorld.travel(s, c.world.one('at', back.speaker!)!);
    const told = (await s.perform(PlayerView.choices(c).find(x => x.choice.id.includes(back.id))!.choice.id)).response ?? '';
    expect(told).toContain('You smell of honey');
  }, 900000);
});
