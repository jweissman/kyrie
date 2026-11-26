import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { TalkTruth } from '../../support/talk-truth';
import type { Frame } from '../../../src/creation/protocol';
import { MenuTree } from '../../../src/frame/menu-tree';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Interface › A conversation held to its focus
// (OR-212, the focus contract of OR-177 for talk; BRIEF §5B): a tinker on a green with seven things to be asked, a
// dog, a lantern to mend and a way off. Turned to, her talk drawer, as the page renders it and every page More… turns
// to, draws her topics and nothing of the green's (the lantern, the dog, the way off recede), her leave-taking on every
// page, and each of her seven topics on one page or another. The continuity census holds the same of every drawer on
// every turn of its walks.
const green = `
  Place green "the green" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 1, 0 outdoors.
  Passage lane_end "the lane's end" is path between green and lane taking 5 minutes.
  Company party "You" of 1 at green.
  Person tinker "the tinker" at green { Role "a tinker". Ancestry human. Peaceable. Pronouns she. }
  Person dog "the dog" at green { Role "a dog". Peaceable. Pronouns he. }
  ${['ford', 'mill', 'fair', 'weather', 'road', 'pans', 'reeve'].map(k => `
  Topic tinker_${k} with tinker "Ask the tinker about the ${k}" when true once { Says "'The ${k},' she says.". }`)
    .join('')}
  Thing lantern "the lantern" at green { State apart "A lantern lies in pieces.". }
  Initially Assert state(lantern, apart).
  Action mend(actor: group, site: place) "Mend the lantern" {
    Requires able(actor) and at(actor, site) and at(actor, green) and state(lantern, apart).
    On success { Retract state(lantern, apart). }
  }
  Goal false.`;
describe('Interface › A conversation held to its focus', () => {
  it('draws her topics alone, every one within reach over its pages, and her leave-taking on each', async () => {
    const t = await Tiny.start(green);
    const frame = MenuTree.framed({ title: '', screen: t.screen, entries: [], leaf: t.leaf, opening: [], chronicle: [],
      transcript: { steps: [] } } as unknown as Frame);
    const pages = TalkTruth.pages(frame, 't__tinker')!;
    expect(pages.length).toBeGreaterThan(1);
    expect(pages.every(p => p.some(a => a.endsWith('#leave')))).toBe(true);
    expect(pages.flat().filter(a => /lantern|mend|lane|dog/.test(a))).toEqual([]);
    const asked = new Set(pages.flat().filter(a => /Ask the tinker about/.test(a)));
    expect(asked.size).toBe(7);
    expect(TalkTruth.of(frame)).toEqual([]);
  });
});
