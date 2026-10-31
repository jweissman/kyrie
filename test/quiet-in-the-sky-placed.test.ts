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
import { ModuleWriter } from '../src/lang/module-writer';

// The Quiet in the Sky in a generated world (doc/adventures/the-quiet-in-the-sky): an ordinary wanderer, beginning in a
// marsh country, walks west and north into countries drawn from the seed, hears of Larum from whoever keeps
// travellers in the country next to it, and goes on over its west march up the valley road. Seed q335 puts Larum west
// of xm1ym1.
describe('The Quiet in the Sky in the world', () => {
  it('lies west of a frost, mountain or forest country drawn from the seed, and moves no other country', () => {
    const seen: string[] = [];
    for (const seed of ['wren', 'a1', 'b2', 'g7', 'kin', 'mere', 'cov13', 'kite', 'q335']) {
      const first = WorldGrid.drawn(seed, 0, 0).terrain as string;
      const at = [...Countries.plan(seed, first)].find(([, c]) => c.id === 'larum')?.[0];
      if (at) { seen.push(at); }
    }
    expect(seen.length).toBeGreaterThanOrEqual(7);
    expect([...Countries.plan('q335', 'marsh')].find(([, c]) => c.id === 'larum')?.[0]).toBe('xm2ym1');
  }, 30000);

  it('is heard of in the country next to it, walked into up the valley road, and goes on after its chapter closes', async () => {
    const seed = 'q335';
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', region: { terrain: 'marsh' }, party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, seed, w.source), c = s.campaign;
    const frontier = new Frontier(seed, NodeBundleSource.shared);
    const ask = async (pattern: RegExp) => {
      const topic = c.module.actions.find(a => pattern.test(a.id));
      if (!topic) { return ''; }
      await GeneratedWorld.travel(s, c.world.one('at', topic.speaker!)!);
      const choice = PlayerView.choices(c).find(x => x.choice.id.includes(topic.id));
      return choice ? (await s.perform(choice.choice.id)).response ?? '' : '';
    };
    // The generated countries on the way are the world's, not this adventure's, and their roads have their own
    // troubles (a band on the road, a ford in spate); the company is set down at each march rather than walked.
    const put = (place: string) => {
      const cc = c as unknown as { world: { apply(x: unknown[]): unknown }; commit(w: unknown): void };
      cc.commit(cc.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
    };
    const cross = async (rid: string) => {
      await s.perform(PlayerView.choices(c).find(x => x.choice.id.startsWith('go(link') && x.choice.id.includes(`,${rid}__`))!.choice.id);
    };
    let rid = '';
    for (const side of ['west', 'north']) {
      put(rid ? `${rid}__edge_${side}` : `region__edge_${side}`);
      const drawn = await frontier.expand(c);
      await cross(drawn!.rid); rid = drawn!.rid;
    }
    expect(rid).toBe('xm1ym1');
    // Whoever keeps travellers there tells of the hamlet over the west march, and the quiet.
    expect(await ask(new RegExp(`^${rid}__edge_west_beyond_told_`))).toContain("can't sleep for the quiet");
    put(`${rid}__edge_west`);
    const drawn = await frontier.expand(c);
    expect(c.installations.find(m => m.id === drawn!.rid)?.chapter).toBe(true);
    const larum = drawn!.rid, k = (id: string) => `${larum}__${id}`;
    const holds = (name: string, ...args: string[]) => c.world.test({ kind: 'call', name: k(name), args: args.map(a => a === 'party' ? a : k(a)) });
    const j = Journey.of(s);
    await j.play('valley road below Larum');
    expect(c.world.one('at', 'party')).toBe(k('march_road'));
    expect(j.page).toMatch(/turf-roofed houses/);
    // Up to the Field with nothing but what the world gave: the Teller has no column for breathing.
    await j.play('To Larum street', "Into the guide's house", 'Pay Jory Whitlock six coin');
    expect(c.world.one('at', 'party')).toBe(k('snow_gate'));
    expect(j.page).toMatch(/no column for breathing/);
    expect(holds('cameUp', 'party')).toBe(true);
    // Left alone, the Testing is fought without the company, everyone gets up, and the Daily comes back; the chapter
    // closes, the world goes on, and Larum hears the sky again.
    await j.play('Through to the White', 'To the foot of the Pass', 'To Larum street', 'Into the Hark', '=+900');
    expect(holds('outcomeDaily', 'field_country')).toBe(true);
    expect(c.running).toBe(true);
    expect(c.world.related('stale').length).toBeGreaterThan(0);
    expect(j.page).toMatch(/iron on iron/);
    // Walked back up afterwards: the Daily on the Field, and where Halt was, nothing.
    await j.play('Out to Larum street', 'To the foot of the Pass', 'To the White', 'Through to the Coming-in');
    expect(j.page).toMatch(/roar of the Daily/);
    await j.play('To the southern Field', 'To Trophy Row');
    expect(j.page).toMatch(/churned snow/);
    if (process.env.LARUM_TRANSCRIPT) {
      await Bun.write('doc/adventures/the-quiet-in-the-sky/playtest/world-wanderer.txt',
        j.taken.map(t => t.page).join('\n\n').replace(/(\[Wait › An hour\] An hour passes\.\n\n)+/g, '[… waited many hours …]\n\n'));
    }
  }, 900000);
});
