import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner } from '../../src/cli/runner';
import { DeepSounds } from '../../src/world/deep/deep-sounds';
import type { DeepLayout } from '../../src/world/deep/deep-layout';

// The way into an ambush (OR-12; register SI-08): what lies in wait makes no sound, and its only warning is the sign
// at the way's mouth (DeepSounds' ambush:seen); the generator says so as a fact (lurks), and the page marks the way
// red, a danger, to a company that can see the sign. In the dark it cannot, and nothing is marked: nothing reveals
// what the character does not know (the indicator appendix). The sign and the fact are the generator's own lines.
const layout: DeepLayout = { site: 's', levels: [], links: [{ id: 'arch', a: 'hall', b: 'lair', kind: 'passage',
  name: 'the arch', minutes: 2 }] };
const lines = DeepSounds.lines(layout, { id: 'spiders', room: 'lair', temperament: 'ambush' }).join('\n');
const world = (lit: boolean) => `
  Place hall "the hall" is room at 0, 0 underground.
  Place lair "the side chamber" is room at 1, 0 underground.
  Passage arch "the arch" is passage between hall and lair.
  ${lit ? '' : 'Initially Assert unlit(hall).'}
  Person spiders "the spiders" at lair { Role "spiders". Species spider. Numbers 2. Level 1. Temperament ambush. Lair lair. }
  Company party "You" of 1 at hall.
${lines}
  Goal false.`;
const way = async (lit: boolean) => {
  const t = await Tiny.start(world(lit), { horizon: ['inhabitants', 'canon'],
    party: [{ name: 'Wynn', raceId: 'human', classId: 'warrior' }] });
  const said = new Runner(t.session).said();
  return [...said.offer.primary, ...said.offer.rest].find(o => o.id.includes('t__lair'));
};
describe('the way into an ambush', () => {
  it('is red to a company that can see the sign at its mouth', async () => {
    expect(lines).toContain('Initially Assert lurks(spiders, lair).');
    expect((await way(true))?.aspects).toContain('danger');
  });
  it('is not marked in the dark, where the sign cannot be seen', async () => {
    const dark = await way(false);
    expect(dark).toBeDefined();
    expect(dark!.aspects).not.toContain('danger');
  });
});
