import { describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { BackgroundCatalog } from '../src/canon/background-catalog';
import { SettlementWriter } from '../src/world/settlement-writer';

// A trade is called as the one who has it is (the owner's play of 10 November: a man could be made an abbess): one
// meaning, the man's word, the woman's, and a word for one who is neither, from one table (data/catalog/forms.json).
describe('a trade, by who has it', () => {
  it('is called by their pronouns', () => {
    const called = (id: string, p?: string) => BackgroundCatalog.called(Canon.backgrounds[id]!, p);
    expect(['he', 'she', 'they', undefined].map(p => called('abbess', p))).toEqual(['Abbot', 'Abbess', 'Abbot', 'Abbess']);
    expect(called('herdsman', 'she')).toBe('Herdswoman');
    expect(called('queen', 'he')).toBe('King');
    expect(called('carpenter', 'she')).toBe(Canon.backgrounds.carpenter!.name);
  });
  it('has a word for each where its name says a sex', () => {
    const plain = new Set(['assessor', 'impressionist', 'professor', 'witness', 'mistress', 'midwife', 'diamantaire',
      'mendicant', 'messenger', 'quartermaster', 'warlord', 'parchment_maker', 'experimental_subject']);
    const sexed = Object.entries(Canon.backgrounds).filter(([id, b]) => !plain.has(id)
      && /(ess|(?<!wo)man|woman|maid|girl|wife|^(king|queen|lord|lady|monk|nun|priest|prince|duke)$)$/i.test(b.name.replace(/ .*$/, '')));
    expect(sexed.filter(([, b]) => !b.forms).map(([id]) => id)).toEqual([]);
  });
  it('names a town\'s own folk by theirs (round 5 met "Indira, priest of Cernunnos")', () => {
    expect(['she', 'he', 'they', undefined].map(p => SettlementWriter.titled('priest of Lugh', p)))
      .toEqual(['priestess of Lugh', 'priest of Lugh', 'priest of Lugh', 'priest of Lugh']);
    expect(SettlementWriter.titled('keeper of the wayside shrine', 'she')).toBe('keeper of the wayside shrine');
  });
});
