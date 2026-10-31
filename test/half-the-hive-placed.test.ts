import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlayerView } from '../src/presentation/player-view';
import { Countries } from '../src/world/countries';
import { GeneratedWorld } from './support/generated';
import { ProvincePlay } from './support/province-play';

// Half the Hive in a generated world, a province of its first country (Gate B: one country, every adventure in it):
// an ordinary wanderer hears of the Wold of Hume from whoever keeps travellers in a town of the country, walks the road
// to its way in, and comes to the drove road, where the turf is full of thyme and smoke stands up out of a gorge.
describe('Half the Hive in the world', () => {
  it('is a province of every first country, its way in on the country\'s own land', () => {
    expect(Countries.provinces.some(c => c.id === 'hume')).toBe(true);
    expect(Countries.marches.some(c => c.id === 'hume')).toBe(false);
  });

  it('heard of in the country, walked into by its road, and the Comb reached and scented', async () => {
    const { s, c, told, came, rid } = await ProvincePlay.enter('g2', 'hume',
      { origin: 'wanderer', region: { terrain: 'frost' }, party: [{ name: 'Aud', raceId: 'elf', classId: 'ranger' }] });
    expect(told).toContain('lives inside a honeycomb under a cliff');
    expect(c.installations.find(m => m.id === rid)?.chapter).toBe(true);
    const j = Journey.of(s);
    expect(c.world.one('at', 'party')).toBe(`${rid}__drove_end`);
    expect(came).toMatch(/smoke standing up out of its mouth/);
    await j.play(`>${rid}__scenting_room`, 'Ask Elspet to scent you', `>${rid}__mothers_chamber`, 'Talk to Linnet');
    expect(c.world.one('at', 'party')).toBe(`${rid}__mothers_chamber`);
    expect(j.page).toMatch(/I keep her/);
    expect(j.page).not.toMatch(/The Sisters come for you/);
    expect(c.running).toBe(true);
    // Left to itself the week goes on: the squire's flask, the Leaving to Larkhill, the Turning-out; the chapter
    // closes on its ending and the world goes on, with the Wold in it.
    for (let i = 0; i < 200 && !c.world.related('reached').length; i++) { await j.play('^Wait › An hour'); }
    expect(c.world.related('reached').map(r => r.args[0])).toEqual([`${rid}__lark_owned`]);
    expect(c.running).toBe(true);
    expect(c.world.test({ kind: 'call', name: 'stale', args: ['region__gate_hume_beyond'] } as never)).toBe(true);
    // The Leaving is where it went, and its people have their own news.
    await j.play(`>${rid}__chantry_yard`, 'Talk to Kestrel', 'Ask Kestrel how the Leaving does at Larkhill');
    expect(j.page).toMatch(/Rent/);
    // And down the road, whoever keeps travellers has heard, and says so.
    const back = c.module.actions.find(a => a.id.startsWith('region__gate_hume_beyond_back_'))!;
    await GeneratedWorld.travel(s, c.world.one('at', back.speaker!)!.replace(/^region__/, ''));
    const heard = (await s.perform(PlayerView.choices(c).find(x => x.choice.id.includes(back.id))!.choice.id)).response ?? '';
    expect(heard).toContain('You smell of honey');
  }, 900000);
});
