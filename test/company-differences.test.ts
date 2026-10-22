import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList, type Choice } from '../src/ui/choice-list';
import companies from '../data/campaigns/companies.json';
import { Content, type CreatureGenerationContext } from '../src/content';

class Companies {
  static party(id: string): CreatureGenerationContext[] {
    return companies.companies.find(c => c.id === id)!.members as CreatureGenerationContext[];
  }
  static async at(id: string, ...commands: string[]) {
    const s = await PlaySession.start('test/fixtures/march/serewater-march.campaign.json', 'serewater', NodeBundleSource.shared,
      this.party(id));
    for (const c of commands) { await s.perform(c); }
    return ChoiceList.all(ChoiceList.explore(ScreenModel.build(s.campaign)));
  }
  static find(choices: Choice[], label: string): Choice | undefined {
    return choices.find(c => c.label.startsWith(label));
  }
}

describe('different companies, different ways through', () => {
  it('at the boar, a ranger reads its posture and a thief slips past; each sees what the other could do', async () => {
    const [fellowship, delvers] = await Promise.all([Companies.at('fellowship', 'go(march__causeway_path,march__causeway)'),
      Companies.at('delvers', 'go(march__causeway_path,march__causeway)')]);
    const read = "Read a reedbank boar's warning posture", slip = 'To Drain mouth — slip past';
    expect(Companies.find(fellowship, read)).toMatchObject({ note: 'Elen' });
    expect(Companies.find(fellowship, slip)?.disabled).toBe('Needs stealth: no one in the company has it.');
    expect(Companies.find(delvers, read)?.disabled).toBe('Needs woodcraft: no one in the company has it.');
    expect(Companies.find(delvers, slip)?.note).toContain('Nell');
    expect(Companies.find(delvers, slip)?.command).toBeDefined();
  }, 60000);
  it('at the stores door, lockwork or brawn opens it; pilgrims have neither and are told so', async () => {
    const way = ['go(march__causeway_path,march__causeway)', 'change_thing_paying(hill__boar_bait)',
      'go(hill__low_path,hill__drain_mouth)', 'go(hill__culvert,hill__workshop)'];
    const [fellowship, pilgrims] = await Promise.all([Companies.at('fellowship', ...way), Companies.at('pilgrims', ...way)]);
    const pick = 'To Dry stores — pick the stores padlock', wrench = 'To Dry stores — wrench the padlock';
    expect(Companies.find(fellowship, pick)?.note).toContain('Bran');
    expect(Companies.find(fellowship, wrench)?.note).toContain('Bran');
    expect(Companies.find(pilgrims, pick)?.disabled).toContain('Needs lockwork');
    expect(Companies.find(pilgrims, wrench)?.disabled).toContain('Needs brawn');
  }, 60000);
});

describe('every ready company', () => {
  it('can be made under any seed: what a background gives and what a calling draws never collide', () => {
    for (const company of companies.companies) {
      for (const seed of ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']) {
        const drawn = new Content(seed);
        for (const m of company.members as CreatureGenerationContext[]) {
          const c = drawn.createCreature(`${company.id}_${m.name!.toLowerCase()}`, m);
          expect(new Set(c.state.inventory!.map(i => i.id)).size).toBe(c.state.inventory!.length);
        }
      }
    }
  });
});
