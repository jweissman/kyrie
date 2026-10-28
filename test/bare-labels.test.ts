import { describe, expect, it } from 'bun:test';
import { SceneModel } from '../src/ui/scene';

// A choice said beside whom or what it is done to need not name them again; but what is told someone, or asked of
// them, still says whom (play 8: "Tell the dead can rest", "Tell to leave and never come back").
describe('a choice beside its subject', () => {
  const bare = (label: string, name: string) => SceneModel.bare({ id: 'x', label, tone: 'person' }, name).label;
  it('leaves out the name it stands beside', () => {
    expect(bare('Ask Wat about Father', 'Wat')).toBe('Ask about Father');
    expect(bare('Take a coil of rope', 'a coil of rope')).toBe('Take');
    expect(bare('Pay Sel what you owe', 'Sel')).toBe('Pay what you owe');
    expect(bare('Talk to Leoric', 'Leoric')).toBe('Talk to Leoric');
  });
  it('keeps whom something is told, or asked to do', () => {
    expect(bare('Tell Selene the dead can rest', 'Selene')).toBe('Tell Selene the dead can rest');
    expect(bare('Tell Leoric to leave and never come back', 'Leoric')).toBe('Tell Leoric to leave and never come back');
    expect(bare('Ask Ghokarn to come with you', 'Ghokarn')).toBe('Ask Ghokarn to come with you');
    expect(bare('Warn Tulan that the dead walk', 'Tulan')).toBe('Warn Tulan that the dead walk');
  });
});
