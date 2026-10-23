import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { VoiceContext } from '../src/narrative/voice-context';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';

// The brothers' errand in Palewold (heron), as a newcomer met it in Mission 13's first playthrough: the priest has
// never seen you and does not greet you as a friend; the bed the letter asks for is given; the way to the tower is told
// landmark by landmark and the tower is on the map from then on; the tablets under it are the old writing, and copying
// them sends you home, where the priest pays for them.
class Errand {
  static async start(seed = 'heron') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'order', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return PlaySession.start(w.path, seed, w.source);
  }
  static async act(s: PlaySession, name: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => name.test(x.choice.name));
    if (!c) { throw new Error(`Nothing like ${name}: ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
    return s.perform(c.choice.id);
  }
  // The site whose way the company has been told: the place its revealed track leads to.
  static told(s: PlaySession): string {
    const world = s.campaign.world;
    const way = world.related('revealedBy').find(r => world.test(ModuleWriter.call('knows', 'party', r.args[1]!)))!;
    return way.args[0]!.replace(/_track$/, '');
  }
}

describe('the brothers\' errand', () => {
  it('is met as a stranger expected, given a bed and the way, and finished by copying the tablets', async () => {
    const s = await Errand.start(), shrine = s.campaign.world.one('at', 'party')!;
    const priest = shrine.replace(/_shrine$/, '_priest');
    expect(VoiceContext.bond(s.campaign, priest, 'party')).toBe('expected');
    await Errand.act(s, /the brothers' letter/);
    expect(VoiceContext.bond(s.campaign, priest, 'party')).toBe('stranger');
    expect(PlayerView.choices(s.campaign).some(c => /^take_lodging\(.*_bed,/.test(c.choice.id))).toBe(true);
    // The way, as it was told: into the wild country and on from landmark to landmark, to where the track starts.
    const way = ScreenModel.build(s.campaign).knowledge.find(k => k.text.startsWith('The way to '))!;
    expect(way.kind).toBe('reported');
    expect(way.text).toMatch(/: into .+ and on to the .+, where the track to it starts\.$/);
    const work = Errand.told(s);
    expect(ScreenModel.build(s.campaign).region?.land?.marks.some(m => m.id === work)).toBe(true);
    // The tablets under the tower are the old writing: read, they send you home with it.
    GeneratedWorld.put(s, work.replace(/^region__/, ''));
    await GeneratedWorld.travel(s, `${work.replace(/^region__/, '')}_undercroft`);
    await Errand.act(s, /^Light a torch/);
    await Errand.act(s, /^Read the tablets/);
    expect(ScreenModel.build(s.campaign).objectives.join(' ')).toMatch(/You have copied the old writing at .+ should see it\./);
    GeneratedWorld.put(s, shrine.replace(/^region__/, ''));
    const before = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    await Errand.act(s, /^Show .+ what you copied at /);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(before + 40);
    expect(ScreenModel.build(s.campaign).objectives.join(' ')).not.toMatch(/old writing/);
  }, 90000);
});
