import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { Advancement } from '../src/rules/advancement';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

describe('advancement', () => {
  it('follows Orsino\'s experience curve and values creatures by kind and level', () => {
    expect([2, 3, 4].map(l => Advancement.threshold(l))).toEqual([1000, 3000, 6200]);
    const content = new Content('worth');
    expect(Advancement.worth(content.createCreature('w', { raceId: 'wolf' }))).toBe(150);
    expect(Advancement.worth(content.createCreature('r', { raceId: 'revenant' }))).toBe(300);
    expect(Advancement.worth(content.createCreature('h', { raceId: 'human', classId: 'warrior', level: 2 }))).toBe(60);
  });
  it('a level rolls the hit die, adds Constitution, and moves a caster\'s slot table on, the same way every time', () => {
    const make = () => new Content('train').createCreature('dori', { raceId: 'dwarf', classId: 'cleric', traits: ['vitalist'],
      spells: ['cure', 'bless', 'anoint', 'prayer', 'minor_restoration', 'cure_moderate'], wisdom: 14 });
    const dori = make(), hp = dori.base.maxHp;
    dori.state.experience = 3000; dori.state.slots = [0];
    const events = Advancement.train(dori, 'seed');
    expect(events.map(e => e.type === 'gain' && e.detail)).toEqual(['level 2', 'level 3']);
    expect(dori.base.level).toBe(3);
    expect(dori.base.maxHp).toBeGreaterThan(hp + 1);
    expect([dori.base.maxSlots, dori.state.slots]).toEqual([[3, 1], [1, 1]]);
    const again = make(); again.state.experience = 3000; again.state.slots = [0];
    Advancement.train(again, 'seed');
    expect(again.base.maxHp).toBe(dori.base.maxHp);
  });
  it('resolving a module is worth its declared experience, once; a night under a roof brings the level', async () => {
    const s = await PlaySession.start('data/campaigns/silkholme.campaign.json', 'advance', NodeBundleSource.shared);
    for (const c of ['go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)',
      'take_item(brood__spare_torch,march__member_party_2)', 'go(sink__sink_path,sink__lip)', 'go(sink__shaft,sink__cave)']) {
      await s.perform(c);
    }
    const burn = await s.perform('change_thing(brood__webs_burn)');
    expect(burn.combat.filter(e => e.type === 'gain' && e.detail === 'experience').map(e => 'amount' in e && e.amount))
      .toEqual([500, 500, 500]);
    const xp = () => s.campaign.state.creatures.filter(c => c.id.includes('party')).map(c => c.state.experience);
    await s.perform('wait');
    expect(xp()).toEqual([500, 500, 500]);
  }, 120000);
});
