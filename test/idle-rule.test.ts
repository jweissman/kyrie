import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { World } from '../src/lang/world';
import { CampaignTick } from '../src/campaign/campaign-tick';

// A rule found idle is asked again once its world is joined to more: an installation brings entities its condition
// ranges over (the architecture review's A21, from its probe lang-runtime-semantics R4: the same rule went on
// reporting nothing to do once a thing it would light had joined the world).
describe('a rule found idle', () => {
  it('is asked again in a world joined to more', () => {
    const m1 = ModuleParser.parse(`Module p "P" { Kind thing. Relation marked(thing). Relation lit(thing).
      Query unmarked(t: thing) means not marked(t).
      Rule light when unmarked(?t) and not lit(?t) { Assert lit(?t). } }`);
    const w1 = new World(m1).apply(m1.initial), rule = m1.rules![0]!;
    expect(CampaignTick.instances(rule, w1).length).toBe(0);
    const w2 = w1.withModule({ ...m1, entities: [...m1.entities, { id: 'cup', type: 'thing', name: 'cup' }] });
    expect(CampaignTick.instances(rule, w2).length).toBe(1);
  });
});
