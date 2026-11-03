import { describe, expect, it } from 'bun:test';
import { CompanyChoices } from '../src/campaign/company-choices';

// A companion who cannot be played is refused by name, with what can be (the Grand Tour's friction D1 and D2: the
// refusal named neither the ancestry refused nor those allowed, and a background had to be guessed from 215 ids).
describe('a companion refused', () => {
  it('is told which ancestry, calling or background cannot be played, and what can', () => {
    expect(CompanyChoices.refused({ name: 'Chert', raceId: 'gnome', classId: 'warrior' }))
      .toMatch(/^Chert: gnome is no playable ancestry; .*human/);
    expect(CompanyChoices.refused({ name: 'Chert', raceId: 'human', classId: 'warrior', backgroundId: 'pilgrimm' }))
      .toMatch(/^Chert: pilgrimm is no playable background; \w+/);
    expect(CompanyChoices.refused({ name: 'Chert', raceId: 'human', classId: 'warrior', backgroundId: 'laborer' }))
      .toBeUndefined();
  });
});
