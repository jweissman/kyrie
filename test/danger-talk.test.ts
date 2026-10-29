import { describe, expect, it } from 'bun:test';
import { Attending } from '../src/ui/attention';
import type { Scene, SceneSubject } from '../src/ui/scene';

// Grave-robbers in a barrow's forecourt were offered to be talked to, drew back and said nothing, and nothing could
// be put to them (the cold evaluation's 14; play 13). A danger is offered to be talked to only where something is
// written to be asked of it; talking it round, warning it off and fighting it stay where it stands.
describe('a danger', () => {
  const robbers = (asked: boolean): Scene => ({ near: [], far: [], you: [], subjects: [{
    id: 'r', kind: 'person', name: 'the grave-robbers', danger: 'beyond you', ...asked ? { asked: true } : {},
    choices: [{ id: 'a', label: 'Talk to the grave-robbers', command: 'talk_to(party,r,f)', tone: 'person' },
      { id: 'b', label: 'Ask the grave-robbers to let you by', command: 'talk_round(party,r,f)', tone: 'person' },
      { id: 'c', label: 'Attack', command: 'attack(party,r)', tone: 'person' }] } as SceneSubject] });
  it('is offered to be talked to only where something is written to be asked of it', () => {
    const labels = (s: Scene) => Attending.place(s).subjects[0]!.choices.map(c => c.label);
    expect(labels(robbers(false))).toEqual(['Ask the grave-robbers to let you by', 'Attack']);
    expect(labels(robbers(true))).toEqual(['Talk to the grave-robbers', 'Ask the grave-robbers to let you by', 'Attack']);
  });
});

// One's own mother was "Talk to Jassin Galanodel" (M17-93): family is called by what they are to you.
describe('one of the family', () => {
  it('is talked to as what they are to you', () => {
    const mother: SceneSubject = { id: 'm', kind: 'person', name: 'Jassin Galanodel', note: 'your mother', stake: true,
      choices: [{ id: 't', label: 'Talk to Jassin Galanodel', command: 'talk_to(party,m,inn)', tone: 'person' }] };
    const [talk] = Attending.place({ near: [], far: [], you: [], subjects: [mother] }).subjects[0]!.choices;
    expect(talk!.label).toBe('Talk to your mother');
  });
});
