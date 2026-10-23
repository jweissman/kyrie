import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { RegionGeography } from '../src/world/region-geography';
import { GeneratedWorld } from './support/generated';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Region } from '../src/world/region-writer';

// Who is on the roads. Thorn's country has a traveller on each road, out from nine to three one way and the next day
// back; met on the road they say where they are going, and news of where they came from in that place's own gossip;
// the day they pass, the road shows which way they went; and a cart in the ditch is a thing a company can help with.
class Roads {
  static async start(seed = 'thorn') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return { region: w.report.region as Region, s: await PlaySession.start(w.path, seed, w.source) };
  }
  static hour(s: PlaySession) { return Math.floor((8 * 60 + s.campaign.state.elapsed * 10) / 60) % 24; }
  // Waits until an hour: a little at a time, or (in the dark, where a company can only wait for light) until light.
  static async until(s: PlaySession, hour: number) {
    while (this.hour(s) !== hour) {
      const ids = PlayerView.choices(s.campaign).map(c => c.choice.id);
      await s.perform(ids.includes('wait') ? 'wait' : ids.find(id => /^wait/.test(id))!);
    }
  }
  static at(s: PlaySession, id: string) { return s.campaign.world.one('at', `region__${id}`); }
  // Where the company is, as the generated region names it.
  static where(s: PlaySession) { return s.campaign.world.one('at', 'party')!.replace(/^region__/, ''); }
}

describe('who is on the roads', () => {
  it('goes one way by day and the other the next, and is met on the road with news of where they came from', async () => {
    const { region, s } = await Roads.start(), road = RegionGeography.roads(region)[0]!, t = `${road.way}_t`;
    const safe = Roads.where(s);
    expect(Roads.at(s, t)).not.toBe(`region__${road.way}`);
    await Roads.until(s, 10);
    expect(Roads.at(s, t)).toBe(`region__${road.way}`);
    // Met on the road: going to the far end, with news of the near one in its own gossip.
    GeneratedWorld.put(s, road.way);
    const screen = ScreenModel.build(s.campaign), here = screen.people.find(p => p.id === `region__${t}`)!;
    expect(here.says?.join(' ')).toContain(road.to.name);
    const news = PlayerView.choices(s.campaign).find(c => / for news of /.test(c.choice.name))!;
    expect(news.choice.name).toContain(road.from.name);
    expect((await s.perform(news.choice.id)).response).toContain(road.from.name);
    // By evening (a cart in the ditch sorted, if it went in) they are at the other end, and the road shows which way
    // they went.
    GeneratedWorld.put(s, safe);
    await Roads.until(s, 18);
    expect(Roads.at(s, t)).toMatch(new RegExp(`^region__${road.to.id}_(taproom|green)$`));
    GeneratedWorld.put(s, road.way);
    expect(ScreenModel.build(s.campaign).observed.some(o => o.id === `region__${t}_tracks0`)).toBe(true);
    // And the next day, back.
    GeneratedWorld.put(s, safe);
    await Roads.until(s, 11);
    expect(Roads.at(s, t)).toBe(`region__${road.way}`);
    expect(s.campaign.world.related('region__journeysTo').find(r => r.args[0] === `region__${t}`)?.args[1])
      .toBe(`region__${road.from.id}_green`);
    // A trouble on the road, if one came today, is theirs to be helped with, and they are grateful.
    GeneratedWorld.put(s, road.way);
    const help = PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith(`region__${t}_help(`));
    if (s.campaign.world.test(ModuleWriter.call('region__inTrouble', `region__${t}`))) {
      const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
      await s.perform(help!.choice.id);
      expect(s.campaign.world.test(ModuleWriter.call('grateful', `region__${t}`, 'party'))).toBe(true);
      expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBeGreaterThan(gold);
    } else { expect(help).toBeUndefined(); }
  }, 120000);
});
