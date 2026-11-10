import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { SceneModel } from '../src/ui/scene';
import { Canon } from '../src/canon/canon';
import { RegionShops } from '../src/world/region-shops';

// What the place at rest shows of the wagoner on the causeway, as the owner's own play of 7 November met him: a close
// look at his ditched cart had found "it is just as it seems", and once the cart was out of the ditch nothing showed
// that telling him so would pay two coin. A look is offered only where something reads it (LookAnswers); someone
// whose words would pay the company now is owed (Owed), and only while they would; and a jeweller keeps stones.
class Causeway {
  static async start() {
    // Kite, where the wagoner is who is met on the way in (data/origins/prologue.kyrt draws one meeting a country:
    // Mere's, since the meetings were three, is a pedlar).
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Maud', raceId: 'human', classId: 'warrior' }] });
    return PlaySession.start(w.path, 'kite', w.source);
  }
  static async act(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.id));
    if (!c) { throw new Error(`No ${pattern}: ${PlayerView.choices(s.campaign).map(x => x.choice.id).join(' | ')}`); }
    return s.leg(c.choice.id);
  }
  static carter(s: PlaySession) {
    return SceneModel.build(ScreenModel.build(s.campaign)).subjects.find(x => x.id === 'origin__carter');
  }
  static looks(s: PlaySession): string[] {
    return s.campaign.offered().filter(o => o.schema === 'look_closely' || /look_closely/.test(o.id)).map(o => o.id);
  }
}

describe('the wagoner on the causeway', () => {
  it('offers no close look that finds nothing, and badges the wagoner while his thanks would pay', async () => {
    const s = await Causeway.start();
    expect(Causeway.looks(s).filter(id => id.includes('cart'))).toEqual([]);
    expect(Causeway.carter(s)?.owed).toBeUndefined();
    await Causeway.act(s, /carter_lead/);
    expect(Causeway.carter(s)?.owed).toBe(true);
    // Told, he has paid, and owes nothing more.
    const coin = ScreenModel.build(s.campaign).purse.coin;
    await Causeway.act(s, /carter_thanks/);
    expect(ScreenModel.build(s.campaign).purse.coin).toBe(coin + 2);
    expect(Causeway.carter(s)?.owed).toBeUndefined();
  }, 120000);
});

describe('a jeweller', () => {
  it('keeps stones of the catalog besides rings and amulets, within what the town can afford', () => {
    const stones = RegionShops.stones('jewelry', { means: 300, key: 'spec' });
    expect(stones.length).toBe(3);
    expect(stones.every(([id, fee]) => Canon.items[id]?.category === 'treasure' && fee <= 300)).toBe(true);
    expect(RegionShops.stones('weapons', { means: 300, key: 'spec' })).toEqual([]);
  });
});
