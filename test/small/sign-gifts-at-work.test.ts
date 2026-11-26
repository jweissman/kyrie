import { ItemCatalog } from '../../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import sky from '../../data/imbar/sky.json';
import { Canon } from '../../src/canon/canon';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { PartyCapabilities } from '../../src/campaign/party-capabilities';
import { Checks } from '../../src/rules/checks';
import { Items } from '../../src/campaign/items';
import { Perks } from '../../src/rules/perks';

// Every sign gives something beyond a number on a roll (the owner, 18 November, OR-118: "at least one 'unusual' perk
// benefit per sign that isn't just stat-bump but some global effect"). Most bring a skill, as one trained in it: the
// company is capable of it wherever the world asks (the Ship's wayfinding draws every road of the country; the Fox's
// stealth slips past a watcher), and a check on it adds the training. The Lantern's lights burn an hour longer; the
// Sower's coin and the Sheaf's finds were already the world's. Shown on a mage, whose calling brings none of them.
const content = new Content('sign-gifts');
const born = (sign: string, gear: string[] = []) => content.createCreature(ItemCatalog.canon, `pc_${sign}`, { raceId: 'human',
  classId: 'mage', sign, gear });
const skills: Record<string, string> = { sign_bear: 'brawn', sign_hart: 'woodcraft', sign_crown: 'persuasion',
  sign_scythe: 'digging', sign_fox: 'stealth', sign_hearth: 'mending', sign_swan: 'insight', sign_ship: 'wayfinding',
  sign_wolf: 'intimidation' };

describe('the gifts of the sky at work', () => {
  it('give every sign one gift that is more than a number on a roll', () => {
    const more = (g: string) => !!Canon.traits[g]?.skills?.length || Canon.traits[g]?.perks?.some(p => p.bonuses);
    expect(sky.signs.filter(s => !s.gifts.some(more)).map(s => s.id)).toEqual([]);
  });

  it('bring a skill: the company is capable of it, and a check on it is made as one trained', () => {
    for (const [sign, skill] of Object.entries(skills)) {
      const under = born(sign), other = born('sign_sower');
      expect([sign, PartyCapabilities.has(ItemCatalog.canon, skill, [under]),
        PartyCapabilities.has(ItemCatalog.canon, skill, [other])])
        .toEqual([sign, true, false]);
      expect([sign, Checks.bonus(ItemCatalog.canon, under, skill).trained, Checks.bonus(ItemCatalog.canon, other,
        skill).trained]).toEqual([sign, 2, 0]);
      const check = Checks.make(ItemCatalog.canon, [under], { skill, difficulty: 'dc_fair', seed: 'gift' })[0]!;
      expect([sign, check.type === 'check' && check.trained]).toEqual([sign, 2]);
    }
  });

  it('burn a torch the Lantern\'s child lights an hour longer', () => {
    const burns = (sign: string) => {
      const c = born(sign, ['torch']), store = new CreatureStore(ItemCatalog.canon, [c]);
      const torch = store.get(c.id).state.inventory!.find(i => i.definition === 'torch')!;
      Items.consume(store, { owner: c.id, target: c.id, id: torch.id, seed: 'torch' });
      return store.get(c.id).state.conditions.find(s => s.id === 'torchlit')?.remaining;
    };
    // Six watches to the hour: a torch burns an hour, the Lantern's two.
    expect([burns('sign_lantern'), burns('sign_sower')]).toEqual([12, 6]);
  });

  it('leave the Sower more coin and the Sheaf more found, as they did', () => {
    expect([Perks.bonus(born('sign_sower').traits, 'goldMultiplier'), Perks.bonus(born('sign_sheaf').traits, 'loot')])
      .toEqual([1.1, 1]);
  });
});
