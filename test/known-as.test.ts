import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Journey } from '../src/session/journey';
import { Tiny } from './support/tiny';

// Someone is called what they are taken for until they are known (the Liberty of the Ice's friction 12: Ursel was
// "Ursel Cobb" before she had said her name; A Winter in Carth's 5 wrote a masked lady as a second person).
describe('a person known as something else', () => {
  it('is called what they look like until they say who they are', async () => {
    const t = await Tiny.start(readFileSync('test/fixtures/probes/known-as/fair.kyr', 'utf8'),
      { horizon: [], seed: 'k', party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
    const j = Journey.of(t.session);
    expect(j.screen().people.map(p => p.name)).toEqual(['a woman in a grey shawl']);
    await j.step('Ask her name');
    expect(j.screen().people.map(p => p.name)).toEqual(['Ursel Cobb, a pedlar']);
  }, 60000);
});
