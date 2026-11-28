import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Journey } from '../src/session/journey';
import { Tiny } from './support/tiny';

// The Grand Tour's W2 (GTR-X08): the stairs down into the Whelm needed breath, and so a company whose breath had run
// out could not climb back up; each such way was two one-way passages and a rule to lift a drowning company. A way
// can need something going to one of its ends only (test/fixtures/probes/one-way-need).
describe('a way that needs something one way only', () => {
  it('is climbed out of without it, and not gone down into until it is had', async () => {
    const kyr = readFileSync(join(import.meta.dir, 'fixtures/probes/one-way-need/site.kyr'), 'utf8');
    const t = await Tiny.start(kyr, { horizon: ['belongings', 'canon'], seed: 'n',
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
    const j = Journey.of(t.session);
    const exit = (to: string) => j.screen().exits.find(e => e.destination?.name === to);
    expect(exit('the brink of the stairs')?.blocked).toBeUndefined();
    await j.play('Up to the brink');
    expect(j.at('party')).toBe('onewayneed__brink');
    expect(j.offers('Down to the Whelm')).toBe(false);
    expect(exit('the Whelm')?.blocked).toBe('You would need a coil of rope.');
    await j.play('Take');
    await j.play('Down to the Whelm');
    expect(j.at('party')).toBe('onewayneed__whelm');
  }, 30000);
});
