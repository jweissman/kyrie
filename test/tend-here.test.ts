import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { SceneModel } from '../src/ui/scene';
import type { CreatureStore } from '../src/creature-store';
import companies from '../data/campaigns/companies.json';
import type { CreatureGenerationContext } from '../src/content';

// A hurt companion is tended where the company stands, by whatever of the company would mend them (play 9: the bard
// came out of a fight at half her strength, the herbs in the pack's book and the cleric's cure on her sheet, and the
// place offered neither: M17-88).
class Hurt {
  static async start() {
    const members = companies.companies.find(c => c.id === 'fellowship')!.members as CreatureGenerationContext[];
    return PlaySession.start('test/fixtures/march/serewater-march.campaign.json', 'serewater', NodeBundleSource.shared,
      members);
  }
  static wound(s: PlaySession, id: string, hp: number) {
    const lease = (s.campaign as unknown as { creatures: CreatureStore }).creatures.acquire([id]);
    try { lease.creatures[0]!.state.hp = hp; lease.commit(lease.creatures); } finally { lease.release(); }
  }
  static tending(s: PlaySession) {
    return SceneModel.build(ScreenModel.build(s.campaign)).you.filter(c => c.id.startsWith('mend:'));
  }
}

describe('a hurt companion', () => {
  it('is tended from the place: each cure and remedy the company has for them, by whoever would give it', async () => {
    const s = await Hurt.start();
    expect(Hurt.tending(s)).toEqual([]);
    const elen = ScreenModel.build(s.campaign).party.find(m => m.name === 'Elen')!;
    Hurt.wound(s, elen.id, 3);
    await s.perform('wait');
    const [tend, ...others] = Hurt.tending(s);
    expect(others).toEqual([]);
    expect(tend).toMatchObject({ label: 'Tend Elen', note: '3 of 11' });
    expect(tend!.children!.map(c => c.label)).toEqual(['Dori: cast Cure Minor Wounds', 'Dori: use bandages',
      'Dori: use healing herbs']);
    await s.perform(tend!.children![0]!.command!);
    const after = ScreenModel.build(s.campaign).party.find(m => m.name === 'Elen')!;
    expect(after.hp).toBeGreaterThan(3);
    expect(Hurt.tending(s)[0]?.note ?? 'mended').not.toBe('3 of 11');
  }, 60000);
});
