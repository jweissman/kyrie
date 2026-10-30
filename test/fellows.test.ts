import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { ModuleParser } from '../src/lang/module-parser';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';

// Whoever joins a company is somebody. a1's Cyril, a pedlar met at the inn at Lowmouth, comes from Mistshaw,
// where a cousin keeps the inn: talked to on the road, Cyril says so, and has news of a place nobody likes to talk
// about, which the company then knows; on quiet nights Cyril tells a story of their own, a part a night; brought
// home, Cyril is welcomed and the company fed. In e5, Wynd, a charcoal-burner, finds the way through a wood for a
// company that has lost it.
class Fellowship {
  static readonly wenna = { name: 'Wenna', raceId: 'human' as const, classId: 'warrior' as const };
  static async start(seed = 'a1') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'wanderer', party: [this.wenna] });
    return { w, s: await PlaySession.start(w.path, seed, w.source) };
  }
  static ways(s: PlaySession): string[] { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No choice like ${pattern}: ${this.ways(s).join(' | ')}`); }
    return s.perform(c.choice.id);
  }
  // Meets the traveller at a settlement's inn and takes them on.
  static async hire(s: PlaySession, town: string, name: string) {
    GeneratedWorld.put(s, `${town}_taproom`);
    await s.perform('wait');
    await this.take(s, new RegExp(`^Ask ${name} whether (he|she|they) would come along`));
    await this.take(s, new RegExp(`^Ask ${name} to join the company`));
  }
  static async night(s: PlaySession) {
    for (let n = 0; n < 4 && !s.campaign.world.test(ModuleWriter.call('dark')); n++) {
      await this.take(s, /^Wait until (dark|first light)$/);
    }
  }
}

describe('a fellow traveller', () => {
  it('is talked to anywhere the company is, of home and of what their calling taught them', async () => {
    const { s } = await Fellowship.start();
    await Fellowship.hire(s, 's1', 'Cyril');
    GeneratedWorld.put(s, 's1_green');
    await s.perform('wait');
    expect(ScreenModel.build(s.campaign).people.find(p => p.companion)?.name).toBe('Cyril, pedlar');
    expect((await Fellowship.take(s, /^Ask Cyril about home$/)).response).toContain('Mistshaw. My cousin');
    const news = await Fellowship.take(s, /^Ask Cyril for the news$/);
    expect(news.response).toContain('Folk go quiet when it comes up');
    expect(s.campaign.world.related('knows').some(r => r.args[0] === 'party' && /^region__w\d+_named$/.test(r.args[1]!))).toBe(true);
    // Neither is said twice.
    expect(Fellowship.ways(s).filter(w => /^Ask Cyril (about home|for the news)$/.test(w))).toEqual([]);
  }, 60000);
  it('tells a story of their own on quiet nights, a part a night', async () => {
    const { s } = await Fellowship.start();
    await Fellowship.hire(s, 's1', 'Cyril');
    const told: string[] = [];
    for (let night = 0; night < 4; night++) {
      await Fellowship.night(s);
      if (!Fellowship.ways(s).includes('Sit up late with Cyril')) { break; }
      told.push((await Fellowship.take(s, /^Sit up late with Cyril$/)).response ?? '');
      expect(Fellowship.ways(s)).not.toContain('Sit up late with Cyril');
      await Fellowship.take(s, /^Wait until first light$/);
    }
    expect(told.length).toBe(3);
    expect(new Set(told).size).toBe(3);
  }, 120000);
  it('is welcomed home by their own, and the company is fed for the road', async () => {
    const { s } = await Fellowship.start();
    await Fellowship.hire(s, 's1', 'Cyril');
    const before = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'rations'));
    // Where Osborn is: behind the counter of an inn, or on the green of a hamlet that has none.
    GeneratedWorld.put(s, s.campaign.world.one('at', 'region__s4_innkeeper')!.replace(/^region__/, ''));
    await s.perform('wait');
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'rations'))).toBeGreaterThanOrEqual(before + 2);
    expect((await Fellowship.take(s, /^Ask Osborn about Cyril$/)).response).toContain('Cyril');
  }, 60000);
  it('finds the way through wild country for a company that has lost it', async () => {
    const { w, s } = await Fellowship.start('e5');
    const town = w.report.region.settlements.find(x => x.calling === 'charcoal-burner')!;
    await Fellowship.hire(s, town.id, town.traveller);
    const zone = w.report.region.atlas!.zones.find(z => z.wild === 'wood')!, goal = `region__${zone.id}_edge`;
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', `region__${zone.id}_lost`) },
      { kind: 'assert', call: ModuleWriter.call(`region__${zone.id}_heading`, 'party', goal) }]));
    const event = await s.perform('wait');
    expect(s.campaign.world.one('at', 'party')).toBe(goal);
    expect(event.perceptions?.map(p => p.text).join(' ')).toContain(town.traveller);
  }, 60000);
  it('is a topic put to someone travelling with the company, wherever it is', () => {
    const m = ModuleParser.parse(`Module t "T" { Kind place. Relation travelsWith(group, group). Entity x: group "X".
      Topic t_home with x travelling "Ask X about home" when true once { Says "Over the hills.". } Goal false. }`);
    const requires = JSON.stringify(m.actions.find(a => a.id === 't_home')!.requires);
    expect(requires).toContain('travelsWith');
    expect(requires).not.toContain('"at","args":["x"');
  });
});
