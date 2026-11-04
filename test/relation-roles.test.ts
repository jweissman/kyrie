import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { KyrDoc } from '../src/handbook/kyr-doc';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';

// Wapshott's Circus's friction 7 (WPC-07): addressed(person, company) takes the person first, and written the other way
// round the circus's metCircus never held, and nothing warned, both arguments being groups. A relation's arguments
// may be named for the part each plays; the handbook shows them, and a call refused says them.
class Roles {
  static source(body: string): OverlayBundleSource {
    return new OverlayBundleSource(NodeBundleSource.shared, {
      'rr/site.kyr': `Module rr "Roles" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard. ${body} }`,
      'rr/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'rr.campaign.json': JSON.stringify({ version: 1, name: 'rr', modules: [{ id: 'p', bundle: 'rr/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
  }
  static async refusal(body: string): Promise<string> {
    const source = this.source(body);
    return PlaySession.start(source.resolve('rr.campaign.json'), 'rr', source).then(() => '', (e: Error) => e.message);
  }
}

describe('a relation whose arguments are named', () => {
  it('is read with its names, written back with them, and shown with them in the handbook', () => {
    const module = ModuleParser.parse('Module m "M" { Kind group. Relation owes(debtor: group, creditor: group). Relation plain(group). }');
    expect(module.relations.map(r => [r.name, r.types, r.roles])).toEqual([['owes', ['group', 'group'], ['debtor', 'creditor']],
      ['plain', ['group'], undefined]]);
    expect(ModuleWriter.write(module)).toContain('Relation owes(debtor: group, creditor: group).');
    const people = KyrDoc.declarations(readFileSync('data/rules/people.kyr', 'utf8')).find(d => d.name === 'addressed');
    expect(people?.signature).toBe('(person: group, company: group)');
  });
  it('says its names when a call to it is refused', async () => {
    expect(await Roles.refusal('Relation owes(debtor: group, creditor: group). Rule r when owes(party) { }'))
      .toMatch(/^Unknown function or arity: .*owes\(party\); it is .*owes\(debtor: group, creditor: group\)/);
  }, 60000);
});
