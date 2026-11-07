import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleParser } from '../src/lang/module-parser';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';

// The Imbar author's friction 3 (M19-95): a thing off stage needed a place of the module's own, and seven adventures
// each declared one (`Place nowhere`, `offstage`). A Thing or an Item may be `nowhere`, as a person may: in no place,
// nor inside anything, until something puts it somewhere.
const site = `Module tn "Off stage" { Place hill "the Hill" is settlement.
  Place yard "the yard" is room within hill at 0, 0 outdoors. Company party "You" of 1 at yard.
  Thing ledger "the Jarl's ledger" nowhere { State shut "A ledger bound in grey calf lies on the mounting-block.". }
  Thing screen "a painted screen" nowhere is scenery { }
  Item token "a brass token" is lantern nowhere.
  Item hidden_token "a second token" is lantern nowhere hidden until token_known.
  Entity token_known: fact "Where the second token is.".
  Relation laid(group).
  Rule laid_out when hour(clock) >= 9 and not laid(party) { Assert laid(party). Assert at(ledger, yard).
    Assert at(token, yard). }
  Observe yard_scene at yard when true "A yard of cobbles.".
  Goal false. }`;
describe('a thing nowhere', () => {
  it('lies in no place, and is a thing of the module all the same', () => {
    const module = ModuleParser.parse(site), facts = (name: string, id: string) => module.initial
      .filter(c => c.kind === 'assert' && c.call.name === name && c.call.args[0] === id).map(c => c.call.args[1]);
    expect(['ledger', 'screen', 'token', 'hidden_token'].map(id => module.entities.find(e => e.id === id)?.type))
      .toEqual(['thing', 'scenery', 'item', 'item']);
    for (const id of ['ledger', 'screen', 'token', 'hidden_token']) {
      expect(['at', 'inside', 'on'].flatMap(name => facts(name, id))).toEqual([]);
    }
    expect([facts('state', 'ledger'), facts('itemKind', 'token'), facts('revealedBy', 'hidden_token')])
      .toEqual([['shut'], ['lantern'], ['token_known']]);
  });
  it('is not seen until something puts it somewhere, and then is', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, { 'tn/site.kyr': site,
      'tn/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'tn.campaign.json': JSON.stringify({ version: 1, name: 'tn', modules: [{ id: 'p', bundle: 'tn/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const j = await Journey.start(source.resolve('tn.campaign.json'), 'tn', { source });
    const shown = () => ScreenModel.build(j.campaign).things.map(t => t.id).filter(id => /ledger|token/.test(id));
    expect([j.at('p__ledger'), j.at('p__token'), shown()]).toEqual([undefined, undefined, []]);
    await j.play('=9:10');
    expect([j.at('p__ledger'), j.at('p__token'), j.at('p__hidden_token')]).toEqual(['p__yard', 'p__yard', undefined]);
    expect(shown()).toContain('p__ledger');
  }, 60000);
});
