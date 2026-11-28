import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Journey } from '../src/session/journey';
import { Tiny } from './support/tiny';

const start = async () => {
  const kyr = readFileSync(join(import.meta.dir, 'fixtures/probes/pledges/site.kyr'), 'utf8');
  const t = await Tiny.start(kyr, { horizon: ['belongings'], seed: 'k',
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
  return Journey.of(t.session);
};

// A particular thing an action gives the company is not to be had of it while someone holds it already: the Third
// Night's pledges, picked up off the pawnbroker's floor and then paid for, threw "Item already owned" out of the
// paying (its friction 9, TTN-09).
describe('a thing to be had by an action', () => {
  it('is not offered while the company holds it already', async () => {
    const j = await start();
    expect(j.offers('Pay Mrs Pratt for the pawned clock')).toBe(true);
    await j.play('the pawned clock: Take');
    expect(j.offers('Pay Mrs Pratt for the pawned clock')).toBe(false);
  }, 60000);
  it('is had by it when it lies where it was', async () => {
    const j = await start();
    await j.play('Pay Mrs Pratt for the pawned clock');
    expect(j.screen().items.map(i => i.name)).toContain('the pawned clock');
  }, 60000);
});
