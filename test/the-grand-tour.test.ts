import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { KyrLint } from '../src/cli/kyr-lint';
import { Sennet, home } from './support/sennet';

// The Grand Tour (doc/adventures/the-grand-tour): the principal approaches to the Door of Doors, played by the labels a
// player sees from the steps in test/fixtures/sennet.
describe('The Grand Tour', () => {
  it('lints clean', async () => {
    const findings = await KyrLint.campaign(home, new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 120000);

  it('the Grand Tour, for a bard: four petals by four courts\' own games, a petal made in Lamp Street, the Door opened', async () => {
    const g = await Sennet.start();
    await g.fixture('tour', 'fire');
    expect(g.holds('everCrowned', 'party')).toBe(true);
    expect(g.carries('fire_petal')).toBe(true);
    await g.fixture('tour', 'fabian_earth');
    expect(g.holds('travelsWith', 'fabian', 'party')).toBe(true);
    expect(g.holds('travelsWith', 'chert', 'party')).toBe(true);
    expect(g.carries('earth_petal')).toBe(true);
    await g.fixture('tour', 'whelm');
    expect(g.holds('admittanceLaughed', 'admittance')).toBe(true);
    expect(g.carries('water_petal')).toBe(true);
    expect(g.knows('perrin_alive')).toBe(true);
    expect(g.knows('keel_petal')).toBe(true);
    await g.fixture('tour', 'cloudgate');
    expect(g.holds('aubreyFriend', 'aubrey')).toBe(true);
    expect(g.knows('keel_ladder_known')).toBe(true);
    await g.fixture('tour', 'air', 'made');
    expect(g.holds('furnaceCold', 'glasshouse')).toBe(false);
    expect(g.holds('madeReady', 'prue')).toBe(true);
    await g.fixture('tour', 'door');
    expect(g.holds('madeSet', 'sennet_bay')).toBe(true);
    expect(g.holds('cloudgateFell', 'sennet_bay')).toBe(false);
    expect(g.holds('doorward', 'party')).toBe(true);
    expect(g.ending()).toEqual(['sennet__end_made_petal']);
  }, 600000);
});
