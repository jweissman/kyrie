import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { DrawerTruth } from '../../support/drawer-truth';
import type { Frame } from '../../../src/creation/protocol';
import { MenuTree } from '../../../src/frame/menu-tree';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Interface › A likeness and its drawer agree (OR-201,
// OR-178): six people on a green, each with something to tell the company, more than the glance leads with; the talk
// drawer drawn for each as the page draws it. A likeness blue has a blue question on the drawer's first page or its
// More…, and a drawer with a blue question is a blue likeness: the likeness had been only what the glance led with,
// and those it did not lead with were plain over drawers of blue questions (the warrior's walk, every turn).
const green = `
  Place green "the green" is room at 0, 0 outdoors.
  Company party "You" of 1 at green.
  ${['ana', 'bel', 'cai', 'dun', 'eda', 'fen'].map((p, i) => `
  Person ${p} "${p.toUpperCase()}" at green { Role "a neighbour". Ancestry human. Peaceable. Pronouns she. }
  Entity ${p}_news: fact "${p.toUpperCase()} has news of the ford ${i + 1}.".
  Topic ${p}_ask with ${p} "Ask ${p.toUpperCase()} about the ford" when true once {
    Says "'The ford,' says ${p.toUpperCase()}.".
    On discuss { Assert knows(actor, ${p}_news). }
  }
  Topic ${p}_chat with ${p} "Pass the time of day with ${p.toUpperCase()}" when true once { Says "A nod.". }`).join('')}
  Goal false.`;
describe('Interface › A likeness and its drawer agree', () => {
  it('draws blue on a likeness exactly where its drawer has a blue question', async () => {
    const t = await Tiny.start(green);
    const frame = MenuTree.framed({ title: '', screen: t.screen, entries: [], leaf: t.leaf, opening: [], chronicle: [],
      transcript: { steps: [] } } as unknown as Frame);
    // Each of the six teaches; the glance leads with fewer than six of them.
    expect(t.glance.acts.filter(a => a.subject).length).toBeLessThan(6);
    expect(DrawerTruth.of(frame)).toEqual([]);
    expect(Object.values(t.glance.likenesses ?? {}).filter(l => l.aspects.includes('knowledge')).length).toBe(6);
  });
});
