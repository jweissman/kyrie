import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { Journey } from '../src/session/journey';

// The Book of Faces' hill 12 (BOF-18): a fight lost on the Duelling Stair, and the company carried down it by a rule
// in the same command, had the rule's "Come again" in what was told and not on the page. It is on the page, after the
// fight and before the stair-foot it was carried to.
describe('what a rule says in the command that carries the company elsewhere', () => {
  it('is on the page, between the fight and where the company comes to', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ct/site.kyr': `Module ct "Carried" { Place hill "the Hill" is settlement.
        Place top "the landing" is room within hill at 0, 0 outdoors.
        Place foot "the stair-foot" is room within hill at 0, 1 outdoors.
        Passage st "the stair" is steps between top and foot. Company party "You" of 1 at top.
        Observe foot_scene at foot when true "The foot of the stair, in the rain.".
        Person odo "Odo Sturry" at top { Role "a Second". Ancestry human. Calling warrior. Level 9. }
        Initially Assert takesPrisoners(odo). Initially Assert hostile(odo, party).
        Rule carried when captured(odo, party) and at(party, top) once
          says "'Come again,' says the Second, and they carry you down." { Retract at(party, top). Assert at(party, foot). } }`,
      'ct/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'ct.campaign.json': JSON.stringify({ version: 1, name: 'ct', modules: [{ id: 'p', bundle: 'ct/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const j = await Journey.start(source.resolve('ct.campaign.json'), 'ct', { source });
    await j.play('Attack');
    const page = j.taken.at(-1)!.page;
    expect(j.at('party')).toBe('p__foot');
    expect(page).toMatch(new RegExp('The fight is lost\\. ‘Come again,’ says the Second, and they carry you down\\. '
      + 'The foot of the stair'));
  }, 60000);
});
