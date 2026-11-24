import { describe, expect, it } from 'bun:test';
import { ChoiceList } from '../src/ui/choice-list';
import type { Act } from '../src/ui/screen-types';

// Nothing is held (the owner, 23 November, OR-185: "No long presses"; a night's rest, a camp and a journey had been
// held to be done, 16 and 18 November): every act is one press, for every client, and what one spends is said on its
// row by the engine before it is chosen, in the row's note: a rest or a camp until morning, or until the hour it ends;
// a way or a journey how long it takes. By the act's action and its typed times, never its words.
describe('an act that spends hours', () => {
  const act = (does: string, extra: Partial<Act> = {}): Act =>
    ({ key: does, label: 'Do it', command: `${does}(party)`, does, ...extra });
  it('is a rest or a camp at one press, its row saying until when', () => {
    expect(ChoiceList.choice(act('rest', { until: '7:00 a.m.' }), 'x', 'company')).toMatchObject({ note: 'until morning' });
    expect(ChoiceList.choice(act('rest_unfed', { until: '4:10 p.m.' }), 'x', 'company'))
      .toMatchObject({ note: 'until 4:10 p.m.' });
    expect(ChoiceList.choice(act('camp', { label: 'Make camp for the night' }), 'x', 'company'))
      .toMatchObject({ note: 'until morning' });
    for (const does of ['rest', 'rest_unfed', 'camp']) {
      expect(Object.keys(ChoiceList.choice(act(does), 'x', 'company'))).not.toContain('hold');
    }
  });
  it('is a journey at one press, its row saying how long it takes', () => {
    const go: Act = { key: 'travel:region__s5', label: 'Go', command: 'travel:region__s5', does: 'travel', minutes: 150 };
    const row = ChoiceList.choice(go, 'x', 'company');
    expect(Object.keys(row)).not.toContain('hold');
    expect(row.note).toBe(ChoiceList.minutes(150));
  });
});
