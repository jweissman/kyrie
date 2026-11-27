import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ScreenModel } from '../../src/ui/screen-model';

// A knowledge boundary (US-08): an aim held toward a place the company has not learned the name of names it nowhere,
// not in the aims, the choices, the screen nor what the page leads with; it is said as it is seen ("a low door in the
// bank"), and by its name once learned. The aim's target is still the place (the map and gold can find it).
const bank = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Entity vault_named: fact "The vault's name".
  Place vault "the Drowned Vault" is room at 1, 0 seen as "a low door in the bank" until vault_named.
  Passage door "the door" is path between yard and vault.
  Company party "You" of 1 at yard.
  Objective find when true toward vault "Find what lies behind {vault}.".`;
describe('an aim toward a place not yet named', () => {
  it('names it nowhere until it is learned, and then by its name', async () => {
    const t = await Tiny.start(bank, { horizon: [], party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
    const shown = () => JSON.stringify([ScreenModel.build(t.campaign), t.leaf]);
    const aim = () => (ScreenModel.build(t.campaign).aims ?? []).find(a => a.id === 't__find')!;
    expect(aim()).toMatchObject({ text: 'Find what lies behind a low door in the bank.', places: ['t__vault'] });
    expect(shown()).not.toContain('Drowned');
    t.journey.assert('knows', 'party', 'vault_named');
    t.campaign.refreshProjection();
    expect(aim().text).toBe('Find what lies behind the Drowned Vault.');
  });
});
