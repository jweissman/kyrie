import { HandbookCreationReferences } from '../../src/client/creation-references';
import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import type { Setting } from '../../src/creation/protocol';

// Creation's preview and its choice are told apart (OR-255, the first blind cold play's P2, P4): a row come to (the
// pointer, the arrow keys, a finger going down) is read of beside the question, and a press chooses it, which was said
// nowhere, so that the careful reader pressed Catfolk to read of it, and it was chosen. The engine says so once, at the
// first step, for the page to set under its rows.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'flow', names)] };
describe('creation\'s first step', () => {
  it('says that coming to a row reads it and a press chooses it, and no later step says it again', () => {
    const flow = new CreationFlow(setting, Creation.catalog(), new HandbookCreationReferences());
    const [first, ...rest] = flow.steps();
    expect([first!.id, first!.how]).toEqual(['you',
      'Come to one to read of it. A press chooses it; Back undoes the choice.']);
    flow.choose('you', 'human'); flow.choose('presenting', 'she');
    expect([...rest, ...flow.steps().slice(1)].filter(s => s.how).map(s => s.id)).toEqual([]);
  });
});
