import { describe, expect, it } from 'bun:test';
import { ReaderOpening } from '../../web/reader/reader-opening';
import type { CreationState } from '../../web/engine/engine-creation';
import type { ReaderApp } from '../../web/reader/reader-app';

// The page's choices of a life and the engine's answers, in the order sent (naming-browser on a loaded runner, 19 and
// 20 November: a name written and Enter pressed, the page went on to setting out, and then the name's own answer,
// late, set it back on "Choose your name"). A reply to a choice older than the last one sent is dropped; the last
// one's answer stands.
class Making {
  readonly asked: { step: string; value: string; answer: (s: CreationState) => void }[] = [];
  state: Record<string, unknown>;
  readonly app: ReaderApp;
  constructor() {
    const steps = [{ id: 'name', ask: 'Choose your name', present: 'list', cards: [] }];
    this.state = { phase: 'creating', party: [{ name: '' }], creation: { at: 'name', on: 'go', back: 'trade', steps,
      member: { name: '' } } };
    this.app = { get state() { return making.state; }, setState: (p: Record<string, unknown>) => {
      making.state = { ...making.state, ...p }; },
    props: { query: new URLSearchParams() },
    engine: { request: (r: { step: string; value: string }) => new Promise(answer =>
      making.asked.push({ step: r.step, value: r.value, answer })) } } as unknown as ReaderApp;
    const making = this;
  }
  answer(i: number, at: string, name: string) {
    this.asked[i]!.answer({ at, on: at === 'name' ? 'go' : 'go', steps: (this.state.creation as CreationState).steps,
      member: { name } } as unknown as CreationState);
    return new Promise(done => setTimeout(done, 0));
  }
  at() { return (this.state.creation as CreationState).at; }
}

describe('the answers to creation\'s choices', () => {
  it('drops an answer older than the last choice sent, so a late one cannot set the page back', async () => {
    const m = new Making(), opening = new ReaderOpening(m.app);
    opening.edit(0, 'name', 'Halloran');
    opening.move('onward');
    expect([m.asked.map(a => a.step), m.at()]).toEqual([['name', 'onward'], 'go']);
    // The name's answer, the engine still on the name step: dropped, the page stays where it went.
    await m.answer(0, 'name', 'Halloran');
    expect(m.at()).toBe('go');
    // Going on's answer stands.
    await m.answer(1, 'go', 'Halloran');
    expect([m.at(), (m.state.party as { name: string }[])[0]!.name]).toEqual(['go', 'Halloran']);
  });
  it('takes the answer to the one choice sent', async () => {
    const m = new Making(), opening = new ReaderOpening(m.app);
    opening.move('back');
    await m.answer(0, 'trade', '');
    expect(m.at()).toBe('trade');
  });
});
