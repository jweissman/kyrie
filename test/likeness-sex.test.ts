import { describe, expect, it } from 'bun:test';
import { Likeness } from '../src/paintings/likeness';

// A likeness chosen by someone's work is of their sex, as their pronouns say (the Quiet in the Sky's QIS-03: an
// innkeeper who was she was shown as an old bearded man): never a painting of the other, whatever fits the work.
describe('a likeness by occupation', () => {
  it('is of the sex the person is', () => {
    for (const profession of ['innkeeper', 'blacksmith', 'priest', 'fisher', 'merchant']) {
      for (const sex of ['woman', 'man'] as const) {
        const id = Likeness.of({ profession, role: profession, sex, key: `${profession}-${sex}` });
        expect([profession, sex, id && Likeness.sitter(id)?.sex]).toEqual([profession, sex, id ? sex : undefined]);
      }
    }
  });
  // OR-30: the drover's son, "taller by a head than when you went away", had been a balding man in a ruff: painted as
  // the drover (whose he is) and as a parent (his father, whose another is). A lad is young; the mother is not.
  it('is of the age the person is, not of whose they are', () => {
    const age = (role: string, sex: 'man' | 'woman') => Likeness.sitter(Likeness.of({ role, sex, key: role })!)?.age;
    expect(age('the drover\'s son, a lad who wants to go after his father, your brother', 'man')).toBe('young');
    expect(age('the drover\'s wife, who cooks at the inn, your mother', 'woman')).not.toBe('young');
  });
});
