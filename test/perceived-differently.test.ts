import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Glanced } from './support/glanced';

// The same place, two companies (amendment 6's addendum: different characters see different possibilities in the same
// world): its facts are one, and what each perceives of it, and what each is led to, is its own. An elf's eye
// catches smoke going up inside the broken keep's walls (a sign noticed by perception); a human ranger walks up
// unseeing. At the king-barrow a mage reads the bound-marks on the seal-stone, where a ranger is led only to look.
class Two {
  static async at(suffix: string, raceId: string, classId: string) {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'X', raceId, classId }] },
      NodeBundleSource.shared);
    const c = s.campaign, sign = (c.module.observations ?? []).find(o => o.id.endsWith(suffix))!;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', sign.place) }]));
    const g = Glanced.of(s);
    return { signs: g.screen.observed.filter(o => o.id === sign.id).length,
      leads: g.glance.acts.map(a => `${a.label} [${a.aspects.join(',')}]`) };
  }
}
describe('one place, two pairs of eyes', () => {
  it('shows each company what it can perceive, and leads each by it, the place the same', async () => {
    const [ranger, mage] = [await Two.at('_smoke', 'human', 'ranger'), await Two.at('_smoke', 'elf', 'mage')];
    expect([ranger.signs, mage.signs]).toEqual([0, 1]);
    const [r, m] = [await Two.at('_trodden', 'human', 'ranger'), await Two.at('_trodden', 'elf', 'mage')];
    expect(m.leads.join(' | ')).toMatch(/bound-marks on the seal-stone \[exploration\]/);
    expect(r.leads.join(' | ')).not.toMatch(/bound-marks/);
    expect(r.leads.join(' | ')).toMatch(/look at the seal-stone \[knowledge\]/);
  }, 240000);
});
