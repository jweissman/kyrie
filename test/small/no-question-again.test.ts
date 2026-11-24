import { describe, expect, it } from 'bun:test';
import { Affordances, type Reading } from '../../src/ui/affordances';
import type { Scene } from '../../src/ui/scene';
import type { Screen } from '../../src/ui/screen-types';

// A question asked again, which changes nothing, is never the gentle way led with past a danger (OR-416: a walk that
// had taken no job of the dead asked the man with the black candle who he is six times running). The first asking
// is; the asking again stays a row, for one who wants the answer again.
const reading = { schema: new Map([['attack(party,raiser)', 'attack']]), args: new Map(), speakers: new Set(),
  authored: new Set(), named: new Set(), held: new Set(), toward: new Map(), inward: new Set(), here: 'ossuary',
  signs: new Map(), pointed: new Set(), done: new Set(), talked: new Set(),
  needs: { hungry: false, rations: 0, hurt: new Set(), night: false, weary: false, settled: true, open: false },
} as unknown as Reading;
const screen = { people: [{ id: 'raiser', name: 'the man with the black candle',
  reckoning: { danger: 'fair', text: '' } }], exits: [], map: [], around: [], path: [],
  place: { id: 'ossuary', name: 'the ossuary' }, elapsed: 0 } as unknown as Screen;
const scene = (first: string): Scene => ({ subjects: [{ id: 'raiser', kind: 'person', name: 'the man', danger: 'fair',
  choices: [{ id: `raiser/${first}`, label: 'Ask who he is', command: first, tone: 'person', own: true },
    { id: 'raiser/talk_round', label: 'Talk him round', command: 'talk_round(raiser)', tone: 'person', own: true },
    { id: 'raiser#attack', label: 'Attack', command: 'attack(party,raiser)', tone: 'person' }] }], near: [], far: [],
  you: [] });
const gentle = (first: string) => Affordances.of(scene(first), screen, reading)
  .filter(c => c.kind === 'act' && c.whys.includes('danger')).map(c => c.command);
describe('a question asked again', () => {
  it('is not the gentle way led with past a danger; the first asking is', () => {
    expect(gentle('raiser_who')).toEqual(['raiser_who']);
    expect(gentle('raiser_who_again')).toEqual(['talk_round(raiser)']);
  });
});
