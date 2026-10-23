import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { Origins } from '../src/world/origins';

// One person comes into a generated country with a reason of their own, and the country knows them by it. a1 holds
// the drover who did not come home, so a protagonist may be his child: his wife is their mother, his son their brother,
// and they say other things to one of their own. A protagonist may instead owe a merchant thirty coin by market day,
// and be refused when the day passes; or carry a letter to a priest.
class Opening {
  static readonly wenna = { name: 'Wenna', raceId: 'human' as const, classId: 'warrior' as const };
  static async start(origin: string, seed = 'a1') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin, party: [this.wenna] });
    return PlaySession.start(w.path, seed, w.source);
  }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No choice like ${pattern}`); }
    return s.perform(c.choice.id);
  }
}

describe('an origin', () => {
  it('is offered only where the country holds what it needs', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared);
    const offered = Origins.choices(await Origins.load(NodeBundleSource.shared), w.report.region, w.report.placements);
    expect(offered.map(o => o.id)).toEqual(['kin', 'order', 'debt', 'wanderer']);
    expect(offered[0]!.choice).toContain('Your father, a drover of Murkstede');
  }, 60000);
  it('begins with one person, on the way in, told who they are and why they came', async () => {
    const s = await Opening.start('kin'), screen = ScreenModel.build(s.campaign);
    expect(screen.party.map(m => m.name)).toEqual(['Wenna']);
    expect(screen.place.name).toBe('the causeway into Murkstede');
    expect(Narrator.leaf(s.campaign, screen).situation.join(' ')).toContain('Your father went out on the road with the cart');
  }, 60000);
  it('makes the drover\'s family the protagonist\'s own', async () => {
    const s = await Opening.start('kin');
    await Opening.take(s, /Murkstede green$/);
    const screen = ScreenModel.build(s.campaign);
    expect(screen.people.find(p => p.id === 'drover__son')?.says?.join(' ')).toContain('Your brother is sitting on the rail');
    expect(PlayerView.choices(s.campaign).some(c => /^Ask Amrod about his father/.test(c.choice.name))).toBe(false);
    const told = await Opening.take(s, /^Ask Amrod what he means to do/);
    expect(told.response).toContain('If you are going, I am coming with you');
    expect(s.campaign.world.test(ModuleWriter.call('willing', 'drover__son', 'party'))).toBe(true);
  }, 60000);
  it('holds a debt that comes due', async () => {
    const s = await Opening.start('debt');
    expect(ScreenModel.build(s.campaign).objectives.join(' ')).toContain('You owe Mik at Murkstede 30 coin, by market day');
    for (let n = 0; n < 30 && !s.campaign.world.test(ModuleWriter.call('origin__called', 'party')); n++) {
      const until = PlayerView.choices(s.campaign).find(c => ['wait_for_dark', 'wait_for_light'].includes(c.choice.id));
      await s.perform(until?.choice.id ?? 'wait_hour');
    }
    expect(s.campaign.world.test(ModuleWriter.call('refusesService', 'region__s1_merchant', 'party'))).toBe(true);
  }, 120000);
});
