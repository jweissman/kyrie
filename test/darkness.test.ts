import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import companies from '../data/campaigns/companies.json';
import type { CreatureGenerationContext } from '../src/content';

class Dark {
  static readonly toStores = ['go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)',
    'go(hill__yard_track,hill__yard)', 'go(hill__arch,hill__vestibule)', 'go(hill__workshop_door,hill__workshop)'];
  static async play(party: string, ...commands: string[]) {
    const members = companies.companies.find(c => c.id === party)!.members as CreatureGenerationContext[];
    const s = await PlaySession.start('data/campaigns/serewater-march.campaign.json', 'serewater', NodeBundleSource.shared,
      members);
    for (const c of commands) { await s.perform(c); }
    return s;
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static benighted(s: PlaySession) { return s.campaign.world.test(ModuleWriter.call('benighted', 'party')); }
}

describe('light and the dark', () => {
  it('under the hill nothing can be seen or handled without a light; a torch burns an hour, then gutters out', async () => {
    const s = await Dark.play('fellowship', 'go(march__shop_door,march__shop_floor)',
      'buy_item(march__nera_torch_1,march__member_party_1)', 'go(march__shop_door,march__quay)', ...Dark.toStores,
      'change_thing(hill__padlock_pick)', 'go(hill__stores_door,hill__stores)', 'go(hill__dry_stair,hill__hall)',
      'go(hill__kitchen_door,hill__kitchen)');
    expect(Dark.benighted(s)).toBe(true);
    expect(PlayerView.observe(s.campaign).observations.map(o => o.id)).toEqual(['darkness']);
    // The kitchen's crock warning cannot be read in the dark; with the torch lit it can.
    expect(Dark.legal(s)).not.toContain('examine(hill__crock_label)');
    await s.perform('use_item(march__nera_torch_1,march__member_party_1)');
    expect(Dark.benighted(s)).toBe(false);
    expect(Dark.legal(s)).toContain('examine(hill__crock_label)');
    for (let i = 0; i < 6; i++) { await s.perform('wait'); }
    expect(Dark.benighted(s)).toBe(true);
    expect(s.campaign.events.flatMap(e => e.combat).some(e => e.type === 'expire' && e.detail === 'torchlit')).toBe(true);
  }, 60000);
  it('a mage can conjure a light for two hours instead', async () => {
    // Every mage learns Light as an apprentice; Ivo starts the day with it prepared.
    const s = await Dark.play('delvers', ...Dark.toStores);
    await s.perform('field_spell(march__member_party_3,conjure_light,march__member_party_3)');
    expect(s.campaign.world.test(ModuleWriter.call('capable', 'party', 'light'))).toBe(true);
    // Twelve watches of ten minutes, the first spent in the casting.
    for (let i = 0; i < 10; i++) { await s.perform('wait'); }
    expect(s.campaign.world.test(ModuleWriter.call('capable', 'party', 'light'))).toBe(true);
    for (let i = 0; i < 2; i++) { await s.perform('wait'); }
    expect(s.campaign.world.test(ModuleWriter.call('capable', 'party', 'light'))).toBe(false);
  }, 60000);
});
