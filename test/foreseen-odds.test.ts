import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { DangerSense } from '../src/presentation/danger-sense';

// The fresh playtest of 7 November was told "Easily won: Sable reckons it is no match for you" over the attack on a
// great centipede, and then, the fight begun and no blow yet struck, "Traubon reckons you would likely beat it, but
// Sable could fall": two reckonings of one fight, each a few fights played out, a breath apart. A fight joined is
// reckoned as it was foreseen until something in it changes; then it is reckoned afresh, from where everyone stands.
describe('the odds of a fight, before it and in it', () => {
  it('agree until something in the fight has changed', async () => {
    const s = await PlaySession.start('test/fixtures/march/silkholme.campaign.json', 'silk', NodeBundleSource.shared);
    for (const c of ['go(march__shop_door,march__shop_floor)', 'buy_item(march__nera_torch_1,march__member_party_1)',
      'go(march__shop_door,march__quay)', 'go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)',
      'go(sink__sink_path,sink__lip)', 'go(sink__shaft,sink__cave)', 'light_item(march__nera_torch_1)',
      'change_thing(brood__webs_hack)', 'go(sink__web_gallery,sink__nest)']) { await s.leg(c); }
    const foreseen = DangerSense.reckon(s.campaign, 'brood__brood')!;
    const battle = s.campaign.encounterBattle(PlayerView.resolve(s.campaign, 'attack(brood__brood)'));
    expect(DangerSense.of(battle)).toBe(foreseen);
    // Blows struck and taken, it is the fight as it stands now.
    while (!battle.state.outcome && battle.state.combatants.every(f => f.hp === f.maxHp)) {
      battle.step(battle.chosen());
    }
    if (!battle.state.outcome) { expect(DangerSense.of(battle)).not.toBe(foreseen); }
    battle.close();
  }, 120000);
});
