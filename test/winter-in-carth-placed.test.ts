import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { WorldAssembler } from '../src/world/world-assembler';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { GeneratedWorld } from './support/generated';

// A Winter in Carth in a generated world: an ordinary wanderer, beginning in a frost country, walks east across two
// marches and north across a third, hears of Gaunt from whoever keeps travellers there, and goes on north over the
// march to the Penitent's Cross, where a beadle sits with his foot in his hat. Seed g5 puts Gaunt north of the
// country two east and one north of the first (Countries.plan).
describe('A Winter in Carth in the world', () => {
  it('is placed north of a frost or forest country drawn from the seed, never on the first ring', () => {
    for (const seed of ['g1', 'g26', 'g40']) {
      for (const first of ['frost', 'forest']) {
        const at = [...Countries.plan(seed, first)].find(([, c]) => c.id === 'gaunt')?.[0];
        expect(at).toBeDefined();
        expect(['x0ym1', 'x1y0', 'xm1y0', 'x0y1']).not.toContain(at);
      }
    }
    expect([...Countries.plan('g5', 'frost')].find(([, c]) => c.id === 'gaunt')?.[0]).toBe('x2ym2');
  });

  it('heard of in the country it is entered from, and walked into over the north march as a chapter of the world', async () => {
    const seed = 'g5';
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', region: { terrain: 'frost' }, party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, seed, w.source), c = s.campaign;
    const frontier = new Frontier(seed, NodeBundleSource.shared);
    const ask = async (pattern: RegExp) => {
      const topic = c.module.actions.find(a => pattern.test(a.id))!;
      await GeneratedWorld.travel(s, c.world.one('at', topic.speaker!)!);
      const choice = PlayerView.choices(c).find(x => x.choice.id.includes(topic.id))!;
      return (await s.perform(choice.choice.id)).response ?? '';
    };
    // Over a march: the way across it into the country just drawn.
    const cross = async (rid: string) => {
      await s.perform(PlayerView.choices(c).find(x => x.choice.id.startsWith('go(link') && x.choice.id.includes(`,${rid}__`))!.choice.id);
    };
    // East over the first march, east again, and north, through countries drawn from the seed.
    let rid = '';
    for (const side of ['east', 'east', 'north']) {
      await GeneratedWorld.travel(s, rid ? `${rid}__edge_${side}` : `edge_${side}`);
      const drawn = await frontier.expand(c);
      await cross(drawn!.rid); rid = drawn!.rid;
    }
    const next = { rid };
    // Whoever keeps travellers there tells of Gaunt and its heretic.
    expect(await ask(new RegExp(`^${next!.rid}__edge_north_beyond_told_`))).toContain("where they'll sell you somebody else's penance by the day");
    await GeneratedWorld.travel(s, `${next!.rid}__edge_north`);
    const drawn = await frontier.expand(c);
    expect(c.installations.find(m => m.id === drawn!.rid)?.chapter).toBe(true);
    const j = Journey.of(s);
    await j.play('Penitent');
    expect(c.world.one('at', 'party')).toBe(`${drawn!.rid}__cross_road`);
    expect(j.page).toMatch(/FOR THE FAULTS OF ANOTHER/);
    await j.play('Talk to Beadle', 'Ask the beadle what the commission', 'Take Ninian Hern into your custody');
    expect(j.page).toMatch(/My custodian/);
    // Left to itself, Ash Day comes; the chapter closes on an ending, and the world goes on.
    for (let i = 0; i < 120 && !c.world.related('reached').length; i++) { await j.play('^Wait › An hour'); }
    expect(c.world.related('reached').map(r => r.args[0])).toEqual([`${drawn!.rid}__put_out`]);
    expect(c.running).toBe(true);
  }, 600000);
});
