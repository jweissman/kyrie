import { describe, expect, it } from 'bun:test';
import { QuantityCaution } from '../../scripts/quantity/caution';
import { QuantityStaging } from '../../scripts/quantity/staging';
import { ItemCatalog } from '../../src/item-catalog';
import { Battle } from '../../src/battle';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { DangerSense } from '../../src/presentation/danger-sense';
import { Tactics } from '../../src/tactics';

// The five expeditions' careful company (OR-1860, scripts/quantity/caution.ts): what it does with what the page says of
// a danger. The reference seeds had lost a company on every life by lingering where the page said it could die.
const f = (team: 'fighters' | 'goblins', hp: number, maxHp: number) => ({ team, hp, maxHp });
// The adit's lineup (s4's first expedition): two warriors of the first level against three goblins, fought by the
// company's own tactics and broken off as the careful company breaks it off; whether it was broken off, and won.
const lineup = (seed: string) => {
  const content = new Content('adit'), catalog = ItemCatalog.canon;
  const ours = ['wenna', 'rolen'].map(id => content.createCreature(catalog, id, { raceId: 'human', classId: 'warrior' }));
  const foes = [0, 1, 2].map(i => content.createCreature(catalog, `g${i}`, { raceId: 'goblin' }));
  return Battle.encounter(new CreatureStore(catalog, [...ours, ...foes]), [...ours.map(c => ({ creatureId: c.id,
    team: 'fighters' as const })), ...foes.map(c => ({ creatureId: c.id, team: 'goblins' as const }))], { seed });
};
const adit = (seed: string, careful = true) => {
  const b = lineup(seed);
  let broke = false;
  for (let legal = b.legalCommands(); legal.length; legal = b.legalCommands()) {
    const flee = legal.find(c => c.ability === 'flee');
    if (careful && flee && QuantityCaution.flees(b.state.combatants, b.events)) {
      broke = true; b.step(flee); continue;
    }
    b.step(Tactics.choose(b.view, b.plain(legal)));
  }
  const ours = b.state.combatants.filter(c => c.team === 'fighters');
  return { broke, won: b.state.outcome === 'fighters', near: ours.some(c => c.hp <= c.maxHp / 3) };
};
describe('the expeditions\' caution', () => {
  it('breaks off a fight going badly: anyone at a third, or at half with the foes still strong', () => {
    // s4's adit: Wenna at 6 of 14, two of three robbers unhurt, fell the next blow.
    expect(QuantityCaution.flees([f('fighters', 6, 14), f('fighters', 8, 12), f('goblins', 7, 7), f('goblins', 0, 6),
      f('goblins', 6, 6)])).toBe(true);
    expect(QuantityCaution.flees([f('fighters', 4, 14), f('goblins', 1, 7)])).toBe(true);
    // At half with the foes mostly down, or hurt but above half, fought on.
    expect(QuantityCaution.flees([f('fighters', 7, 14), f('goblins', 1, 7), f('goblins', 0, 6)])).toBe(false);
    expect(QuantityCaution.flees([f('fighters', 9, 14), f('goblins', 7, 7)])).toBe(false);
    // The fallen are not who it flees for.
    expect(QuantityCaution.flees([f('fighters', 0, 14), f('fighters', 12, 12), f('goblins', 7, 7)])).toBe(false);
  });
  it('draws out what is heard in a room before going in, once (s7: the long passage\'s dead)', () => {
    const ids = ['go(p,passage)', 'draw_out(passage)', 'go(q,robbers)'];
    expect(QuantityCaution.ahead(ids, new Set(), 'go(p,passage)')).toBe('draw_out(passage)');
    expect(QuantityCaution.ahead(ids, new Set(['draw_out(passage)']), 'go(p,passage)')).toBe('go(p,passage)');
    expect(QuantityCaution.ahead(ids, new Set(), 'go(q,robbers)')).toBe('go(q,robbers)');
    expect(QuantityCaution.ahead(ids, new Set(), 'search(here)')).toBe('search(here)');
    expect(QuantityCaution.ahead(ids, new Set(), undefined)).toBeUndefined();
  });
  it('draws out nothing unseen while hurt, nor goes in on it (OR-1890: s7\'s fifth, the embalmers\' mummy)', () => {
    const ids = ['go(p,passage)', 'draw_out(passage)', 'go(q,robbers)'];
    expect(QuantityCaution.ahead(ids, new Set(), 'go(p,passage)', false)).toBeUndefined();
    expect(QuantityCaution.ahead(ids, new Set(), 'go(q,robbers)', false)).toBe('go(q,robbers)');
  });
  it('takes the way out a fight offers once its blows barely bite and it costs the company (OR-1858)', () => {
    const fighters = [{ ...f('fighters', 9, 14), id: 'w' }, { ...f('goblins', 11, 11), id: 'b0' },
      { ...f('goblins', 11, 11), id: 'b1' }] as unknown as Parameters<typeof QuantityCaution.flees>[0];
    const blunted = (n: number) => ({ type: 'damage' as const, turn: n, actor: 'w', target: 'b0', rolled: 4, amount: 2,
      hp: 9, modifiers: { bonus: 0, resistance: 0.5, reduction: 0 } });
    const round = (n: number) => ({ type: 'initiative' as const, turn: n, order: [] });
    const events = [round(1), blunted(1), round(2), blunted(2), round(3)];
    expect(QuantityCaution.flees(fighters, events)).toBe(true);
    expect(QuantityCaution.flees(fighters, events.slice(0, 4))).toBe(false);
    expect(QuantityCaution.flees(fighters)).toBe(false);
  });
  it('makes the stair below the woods ready: a light to search by, the ledge searched, the one waiting taken on (OR-1920)',
    () => {
      const ids = ['light_item(region__party_1__torch)', 'search(region__s1_ud)', 'region__s1_ud_waiting_ask',
        'recruit(region__s1_ud_waiting)', 'recruit(region__s1_other)', 'go(region__s1_ud_in,region__s1_ud_barrow_mouth)'];
      expect(QuantityStaging.staged(ids, true)).toBe('light_item(region__party_1__torch)');
      expect(QuantityStaging.staged(ids, false)).toBe('search(region__s1_ud)');
      expect(QuantityStaging.staged(ids.slice(2), false)).toBe('region__s1_ud_waiting_ask');
      expect(QuantityStaging.staged(ids.slice(3), false)).toBe('recruit(region__s1_ud_waiting)');
      expect(QuantityStaging.staged(ids.slice(4), false)).toBeUndefined();
      // The bandages bought are gear, never sold at home.
      expect(QuantityStaging.kept.test('bandages')).toBe(true);
      expect(QuantityStaging.buys.some(([, kind]) => kind === 'bandages')).toBe(true);
    });
  it('binds the worst hurt with what it carries, where no cure is ready (OR-1920: s0, without a healer)', () => {
    const ids = ['use_item(b1,bandages,region__member_party_1,region__member_s1_traveller_person)',
      'use_item(b1,bandages,region__member_party_1,region__member_party_1)'];
    expect(QuantityStaging.dose(ids, 's1_traveller_person')).toBe(ids[0]);
    expect(QuantityStaging.dose(ids, 'party_1')).toBe(ids[1]);
    expect(QuantityStaging.dose(ids.slice(1), 's1_traveller_person')).toBeUndefined();
  });
  it('says of the adit\'s goblins what such fights come to, over many draws (OR-1921)', () => {
    // The reckoning plays the fight the company fights (the same fighters, the same place, the same engine), so what it
    // says holds over draws: s4's two losses there were its first two draws, both in the tail. Two warriors of the
    // first level against three goblins: not reckoned grave; fought through, won nearly always; broken off by the
    // careful company's rule, near death in fewer than one in five.
    const seeds = Array.from({ length: 40 }, (_, i) => `adit:${i}`);
    expect(DangerSense.grave.has(DangerSense.of(lineup('reckoned')).danger)).toBe(false);
    const through = seeds.map(seed => adit(seed, false)), careful = seeds.map(seed => adit(seed));
    expect(through.filter(x => x.won).length).toBeGreaterThanOrEqual(36);
    expect(careful.filter(x => x.broke && x.near).length).toBeLessThan(seeds.length / 5);
  });
});
