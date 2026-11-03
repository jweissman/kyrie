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
});
