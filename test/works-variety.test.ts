import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';

// The makers' works of a country are not one plan stamped again and again: of several of one plan, no two are laid
// out alike (f6's three barrows: a long barrow, a passage grave, a cairn on two levels). And the greatest of them is
// not found only by reading the old script: a lesser work of the same makers shows the way in the makers' own manner.
// a1's Water-Wardens read still water, and their cistern's pool shows the dam; f6's Barrow-Kin spoke with their dead
// through flutes of bone, and the flute kept at a barrow's door quiets the dead and is answered from the great howe.
class Works {
  static async start(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return { w, s: await PlaySession.start(w.path, seed, w.source) };
  }
  static rooms(s: PlaySession, site: string): string[] {
    return s.campaign.module.entities.filter(e => e.id.startsWith(`region__${site}_`) && e.space?.kind === 'room')
      .map(e => e.name).sort();
  }
  // Stands in a room of a work with a light, and does the one thing there that matches.
  static async there(s: PlaySession, room: string, pattern: RegExp) {
    GeneratedWorld.put(s, room);
    await s.perform('wait');
    const torch = PlayerView.choices(s.campaign).find(c => /^Use a torch on Wenna$/.test(c.choice.name));
    if (torch) { await s.perform(torch.choice.id); }
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No choice like ${pattern} at ${room}`); }
    return s.perform(c.choice.id);
  }
  static knows(s: PlaySession, fact: string) { return s.campaign.world.test(ModuleWriter.call('knows', 'party', fact)); }
}

describe('the makers\' works', () => {
  it('are not laid out alike, of one plan in one country', async () => {
    const { w, s } = await Works.start('f6');
    const barrows = w.report.region.sites.filter(x => x.work?.plan === 'barrow');
    expect(barrows.length).toBe(3);
    const plans = barrows.map(b => Works.rooms(s, b.id).filter(r => r !== 'the robbers\' hole').join(' | '));
    expect(new Set(plans).size).toBe(3);
    expect(plans.some(p => p.includes('the lower chamber'))).toBe(true);
  }, 60000);
  it('show the way to the greatest of them in their makers\' own manner: still water', async () => {
    const { w, s } = await Works.start('a1');
    const great = w.report.region.sites.find(x => x.work?.great)!, cistern = w.report.region.sites.find(x => x.work?.plan === 'cistern')!;
    const seen = await Works.there(s, `${cistern.id}_head`, /^Look long into the still water$/);
    expect(seen.perceptions?.map(p => p.text).join(' ')).toContain('a dam of dressed stone across a valley');
    expect(Works.knows(s, `region__${great.id}_found`)).toBe(true);
  }, 60000);
  it('show the way in their makers\' own manner: a flute of bone, which quiets the dead and is answered', async () => {
    const { w, s } = await Works.start('f6');
    const great = w.report.region.sites.find(x => x.work?.great)!, barrow = w.report.region.sites.find(x => x.work?.plan === 'barrow')!;
    await Works.there(s, `${barrow.id}_passage`, /^Play the bone flute$/);
    expect(s.campaign.world.test(ModuleWriter.call('tolerates', `region__${barrow.id}_dead`, 'party'))).toBe(true);
    expect(Works.knows(s, `region__${great.id}_found`)).toBe(true);
  }, 60000);
});
