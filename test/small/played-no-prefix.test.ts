import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Undertakings } from '../../src/presentation/undertakings';

// A played row says what it is in its own words, with no prefix (OR-132, split from OR-72: "Follow: Look along the road
// between Mistshaw" had read as following a road): the aim to be taken up is offered by the aim's own short words, its
// being a decision said in its note; taken up, it is followed, and no row the glance leads with or offers begins with
// a label of a kind ("Follow:", "Talk:", "Go:").
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 1, 0 outdoors.
  Passage gate "the gate" is path between yard and lane.
  Company party "You" of 1 at yard.
  Person wat "Wat" at yard { Role "a carter". Ancestry human. Peaceable. Pronouns he. }
  Objective father when true toward lane "Look along the road between Mistshaw and Millholm for your father, who went out by it.".
  Goal false.`;
const prefixed = /^(Follow|Talk|Go|Look|Wait|Take up)\s*:/;
class Played {
  static labels(t: Tiny): string[] {
    const offer = t.glance.offer;
    return [...t.glance.acts, ...offer?.primary ?? [], ...offer?.rest ?? []].map(r => r.label);
  }
}

describe('a played row', () => {
  it('offers an aim to take up by its own words, and plays it, with no prefix anywhere', async () => {
    const t = await Tiny.start(yard);
    const take = t.glance.acts.find(a => a.command === 'follow:t__father');
    expect(take).toMatchObject({ label: 'Look for your father', note: 'take it up as your aim' });
    expect(Played.labels(t).filter(l => prefixed.test(l))).toEqual([]);
    await t.perform(take!.command!);
    expect(Undertakings.followed(t.campaign)?.id).toBe('t__father');
    expect(Played.labels(t).filter(l => prefixed.test(l))).toEqual([]);
  });
});
