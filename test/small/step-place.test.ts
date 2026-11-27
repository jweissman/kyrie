import { HandbookCreationReferences } from '../../src/client/creation-references';
import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import type { Setting } from '../../src/creation/protocol';

// Where a step of making a life stands, said by the engine for every client (OR-1136, the third review: the steps had
// looked alike, and nothing said how far through the player was): each step its place among them, setting out the
// last, counted again when a choice changes how many steps there are (a caster has more than a warrior).
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'flow', names)] };
describe('a step of creation, placed', () => {
  it('says where each step stands and how many there are, setting out the last', () => {
    const flow = new CreationFlow(setting, Creation.catalog(), new HandbookCreationReferences());
    for (const calling of ['warrior', 'mage']) {
      flow.choose('calling', calling);
      const steps = flow.steps();
      expect(steps.map(s => s.place)).toEqual(steps.map((_, i) => ({ at: i + 1, of: steps.length + 1 })));
    }
    expect(new Set([['warrior'], ['mage']].map(([c]) => { flow.choose('calling', c!); return flow.steps().length; })).size)
      .toBe(2);
  });
});
