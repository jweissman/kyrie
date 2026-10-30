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

// Fair Weather in a generated world: an ordinary wanderer, beginning in a mountain country, walks east, north, north
// and east through countries drawn from the seed, hears of the Gannet Reach from whoever keeps travellers there, and
// goes on north over the march to the coast road above Skeel. Seed wren puts the Reach north of the country at x2ym2.
describe('Fair Weather in the world', () => {
  it('lies north of a fen, forest or frost country drawn from the seed, and moves no other country', () => {
    for (const seed of ['thorn', 'wren', 'g1', 'g5', 'g26', 'kite', 'a1', 'h2']) {
      const first = WorldGrid.drawn(seed, 0, 0).terrain as string;
      const at = [...Countries.plan(seed, first)].find(([, c]) => c.id === 'skeel')?.[0];
      expect(at, `${seed} ${first}`).toBeDefined();
      // Never on the first ring: Merrowdale holds every first country's north march the Reach may lie beside.
      expect(['x0ym1', 'x1y0', 'xm1y0', 'x0y1']).not.toContain(at);
    }
    expect([...Countries.plan('wren', 'mountain')].find(([, c]) => c.id === 'skeel')?.[0]).toBe('x2ym3');
  });

  it('heard of in the country it is entered from, and walked into over the north march as a chapter of the world', async () => {
    const seed = 'wren';
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', region: { terrain: 'mountain' }, party: [{ name: 'Morwen', raceId: 'human', classId: 'warrior' }] });
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
    for (const side of ['east', 'north', 'north', 'east']) {
      await GeneratedWorld.travel(s, rid ? `${rid}__edge_${side}` : `edge_${side}`);
      const drawn = await frontier.expand(c);
      await cross(drawn!.rid); rid = drawn!.rid;
    }
    expect(rid).toBe('x2ym2');
    // Whoever keeps travellers there tells of the Reach, its wreck, and the dog.
    expect(await ask(new RegExp(`^${rid}__edge_north_beyond_told_`))).toContain("They say there's a dog");
    await GeneratedWorld.travel(s, `${rid}__edge_north`);
    const drawn = await frontier.expand(c);
    expect(c.installations.find(m => m.id === drawn!.rid)?.chapter).toBe(true);
    const j = Journey.of(s);
    await j.play('coast road');
    expect(c.world.one('at', 'party')).toBe(`${drawn!.rid}__coast_road`);
    expect(j.page).toMatch(/nine miles of shining water, or of shining sand/);
    // Its clock begins the next morning: the tide-board and the Court run from then, and the Court rises without the
    // company, closing the Reach's chapter and not the book.
    await j.play('^To Fore Street', '^Into the Admiral', 'Talk to Mother Jago', 'about the wreck');
    expect(j.page).toMatch(/walks straight onto Scarth Bank like a cow onto a cart/);
    for (let i = 0; i < 120 && !c.world.related('reached').length; i++) { await j.play('^Wait › An hour'); }
    expect(c.world.related('reached').map(r => r.args[0])).toEqual([`${drawn!.rid}__wreck`]);
    expect(c.running).toBe(true);
    // Coming back up Fore Street after: the Constancy's saint is on the Reeve's gable, and the Holm is Jack Cawse's.
    await j.play('^Out to Fore Street');
    expect(j.page).toMatch(/CONSTANT AND TRUE/);
    expect(c.world.one('at', `${drawn!.rid}__cawse`)).toBe(`${drawn!.rid}__lamp_room`);
  }, 900000);
});
