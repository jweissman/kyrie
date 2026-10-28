import { describe, expect, it } from 'bun:test';
import { CombatTelling } from '../src/ui/combat-telling';

// "The second of the agile cave spiders's bite misses Naivara." (play 9).
describe('whose a blow is', () => {
  it('is said as one of a band, a plural or a name has it', () => {
    expect(CombatTelling.whose('The second of the agile cave spiders', 'bite')).toBe('the bite of the second of the agile cave spiders');
    expect(CombatTelling.whose('the wolves', 'bite')).toBe("the wolves' bite");
    expect(CombatTelling.whose('Naivara', 'dagger')).toBe("Naivara's dagger");
    expect(CombatTelling.whose('the portcullis', 'teeth')).toBe("the portcullis's teeth");
  });
});
