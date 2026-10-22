import { describe, expect, it } from 'bun:test';
import { Campaign } from '../src/campaign/campaign';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { ModuleWriter } from '../src/lang/module-writer';

// Someone met in play can join the company: once willing, for their hire, they are one of the company from then on,
// counted, fed and fought beside, and their own group is empty.
const inn = `Module inn "An inn" {
  Place vale "The vale" is region.
  Place town "The town" is settlement within vale.
  Place taproom "the taproom" is room within town.
  Place yard "the yard" is room within town.
  Passage door "the yard door" is door between taproom and yard.
  Company party "Your company" of 1 at taproom.
  Person tam "Tam" at taproom { Role "a drover out of work". Ancestry human. Calling warrior. Level 1. Peaceable. }
  Person rook "Rook" at yard { Role "a fence". Ancestry human. Calling thief. Level 1. }
  Initially Assert willing(tam, party). Initially Set hire(tam) to 3. Initially Set quantity(party, gold) to 5.
  Goal false.
}`;
class Inn {
  static async load() {
    const rules = await Promise.all(ModuleBundle.world.map(async name => [
      `data/rules/${name}.kyr`, await Bun.file(`data/rules/${name}.kyr`).text()]));
    return Campaign.load('campaign.json', 'inn', new MemoryBundleSource({ ...Object.fromEntries(rules),
      'campaign.json': JSON.stringify({ version: 1, name: 'Inn', modules: [{ id: 'inn', bundle: 'module.json' }] }),
      'module.json': JSON.stringify({ version: 1, source: 'inn.kyr', rules: ['world'], globals: ['party'] }),
      'inn.kyr': inn }));
  }
}

describe('a company that takes on someone it meets', () => {
  it('takes on someone willing, for their hire, as one of the company from then on', async () => {
    const c = await Inn.load();
    expect(c.available().some(a => a.name === 'Ask Rook to join the company')).toBe(false);
    const ask = c.available().find(a => a.name === 'Ask Tam to join the company')!;
    const e = c.execute(ask.id);
    expect(e.response).toBe('Tam shakes on it, and is one of you.');
    expect(c.state.party.map(m => m.name)).toEqual([expect.any(String), 'Tam']);
    expect(c.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(2);
    expect(c.world.test(ModuleWriter.call('memberOf', 'inn__member_tam_person', 'party'))).toBe(true);
    expect(c.world.test(ModuleWriter.call('able', 'inn__tam'))).toBe(false);
    // Tam goes where the company goes.
    c.execute(c.available().find(a => a.name.startsWith('Take the yard door'))!.id);
    expect(c.state.party).toHaveLength(2);
    // A save keeps who has joined.
    const restored = Campaign.restore(c.save());
    expect(restored.state.party.map(m => m.name)).toContain('Tam');
  });
});
