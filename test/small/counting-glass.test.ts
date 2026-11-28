import { expect, it } from 'bun:test';
import senses from '../../data/situations/arcology/senses.kyr' with { type: 'text' };
import { Tiny } from '../support/tiny';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';
import { Consequence } from '../../src/lang';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';

it('installs the counting glass in the actual generated Numbered House bundle', async () => {
  const base = NodeBundleSource.shared;
  const source = new OverlayBundleSource(base, {
    'glass-test/region.kyr': `Module region "The approaches" {
      Place land "the country" is region.
      Place outside "the approach" is site within land at 0, 0.
      Place village "the town" is settlement within land at 1, 0.
      Place shrine "the shrine" is room within village at 1, 0 indoors.
      Place taproom "the taproom" is room within village at 0, 0 indoors.
      Company party "You" of 1 at outside.
      Person keeper "the keeper" at outside { Role "a keeper". Species human. Level 1. Peaceable. }
    }`,
    'glass-test/region.json': JSON.stringify({ version: 1, source: 'region.kyr', rules: ['world'],
      globals: ['party'], exports: { party: 'party', land: 'land', outside: 'outside', shrine: 'shrine',
        keeper: 'keeper', taproom: 'taproom' } }),
    'glass-test/test.campaign.json': JSON.stringify({ version: 1, name: 'The Numbered House',
      modules: [{ id: 'region', bundle: 'region.json' },
        { id: 'arcology', bundle: base.resolve('data/situations/arcology/module.json'),
          imports: { party: 'region.party', land: 'region.land', outside: 'region.outside',
            gossip: 'region.taproom', shrine: 'region.shrine', keeper: 'region.keeper',
            first_taproom: 'region.taproom', first_keeper: 'region.keeper' } }],
      party: [{ name: 'Elen', raceId: 'human', classId: 'warrior', level: 1, perk: 'mathematician' }] }),
  });
  const session = await PlaySession.start(base.resolve('glass-test/test.campaign.json'), 'numbered-proof', source);
  expect(session.campaign.world.one('at', 'arcology__counting_glass')).toBe('arcology__quiet');
});

it('earns a permanent structural sense at a true wonder, then discovers a real maintenance way without the glass', async () => {
  const t = await Tiny.start(`Place quiet "the Quiet Floor" is room at 0, 0 indoors.
    Place cliff "the cliff chamber" is room at 1, 0 outdoors.
    Place refuge "the maintenance refuge" is room at 2, 0 indoors.
    Company party "You" of 1 at quiet.
    Person steward "the Host" at quiet { Role "a steward". Species automaton. Level 1. Peaceable. }
    Entity house: thing "the House". Measure hum(entity). Measure humAt(entity).
    Passage hall "the service way to the cliff chamber" is path between quiet and cliff.
    Discovery slab_known "A maintenance way runs beneath the slab.".
    Passage under "the maintenance way" is crawl between cliff and refuge hidden until slab_known.
    ${senses.slice(senses.indexOf('{') + 1, senses.lastIndexOf('}'))}`, { party: [
      { name: 'Elen', raceId: 'human', classId: 'warrior', level: 1, perk: 'mathematician' }] });
  expect(t.journey.holds('capable', 'party', 'mathematics')).toBe(true);
  expect(Consequence.census(t.campaign.module).filter(a =>
    ['t__host_glass', 't__attend_glass'].includes(a.id))).toEqual([]);
  expect(t.journey.holds('benighted', 'party')).toBe(false);
  const act = t.glance.acts.find(a => a.subject === 't__counting_glass');
  expect(act?.aspects).toContain('wonder');
  await t.play('Follow the second door through the counting glass', 'To the cliff chamber');
  expect(t.journey.holds('granted', 'party', 'structural_sense')).toBe(true);
  expect(t.journey.holds('knows', 'party', 'slab_known')).toBe(true);
  const again = Journey.of(PlaySession.fromSave(t.campaign.save(), 'tiny'), true);
  expect(again.holds('granted', 'party', 'structural_sense')).toBe(true);
  await again.play('Wait an hour');
  expect(again.holds('granted', 'party', 'structural_sense')).toBe(true);
  await t.play('To the maintenance refuge');
  expect(t.where()).toBe('t__refuge');
});
