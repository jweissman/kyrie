import { describe, expect, it } from 'bun:test';
import { EmptyWords } from '../../scripts/empty-words';

// Empty words in what every first hour meets (DN-06, the owner's "garlands of whatever is in flower": attention
// economy). Three ratchets over the first hour's tables, held at their honest baselines (15 November) and lowered as
// each is edited, never met with filler: narration that names nothing, the "as if" tic, and a sentence said word for
// word in more than one table. Speech is the speaker's; a deliberate exception is declared in its data ("_literary").
describe('empty words', () => {
  it('finds narration that names nothing, and passes over what is spoken', () => {
    expect(EmptyWords.indeterminate.test('Garlands of whatever is in flower hang on it.')).toBe(true);
    expect(EmptyWords.indeterminate.test('A wreath of ivy hangs on it, cut fresh at each new moon.')).toBe(false);
    const said = EmptyWords.said('data/generation/scenes/fellows.json').map(s => s.sentence);
    expect(said.some(s => s.includes('Somebody has burned here this year'))).toBe(false);
  });
  it('passes over what its data declares literary', () => {
    const said = EmptyWords.said('data/generation/scenes/snares.json').map(s => s.sentence);
    expect(said.some(s => s.includes('an ordinary-looking thing that hums'))).toBe(false);
    expect(said.some(s => s.startsWith('A wire catches the light'))).toBe(true);
  });
  it('is no worse in what every first hour meets than it was', () => {
    const held = { indeterminate: 304, similes: 85, stock: 9 }, c = EmptyWords.count();
    expect(c.indeterminate.length).toBeLessThanOrEqual(held.indeterminate);
    expect(c.similes.length).toBeLessThanOrEqual(held.similes);
    expect(c.stock.length).toBeLessThanOrEqual(held.stock);
  });
});
