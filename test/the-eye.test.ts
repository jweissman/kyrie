import { describe, expect, it } from 'bun:test';
import { Gauntlet, type Bout } from './support/gauntlet';
import { DangerSense } from '../src/presentation/danger-sense';

// The Eye (the owner, 15 November: a pin from a player verb): a mixed party of a warrior, a thief and a mage, against a
// high-danger opponent, a dragon or a discerner. On the real kernel and the game's own tactics, with no world: the
// stakes scale with the party's level (lost below the monster's own, won above it), and the forecast tells the truth
// about each, naming who is frail. Measured, not quota'd: the party of the third rank is lost to the dragon every
// time, and at the sixteenth wins it five times in six (a discerner, at the fifth, is a coin the party wins more
// often than not).
const party = (foe: string, level: number): Bout => ({ calling: 'warrior', mates: ['thief', 'mage'], foe, count: 1, level });
const cells: [string, number][] = [['dragon', 5], ['dragon', 16], ['discerner', 5], ['discerner', 8]];
const seen = cells.map(([foe, level]) => ({ foe, level, danger: DangerSense.of(Gauntlet.encounter(party(foe, level), 'reckon')),
  won: Gauntlet.wins(party(foe, level), 8) }));
describe('the Eye: a mixed party against a high-danger opponent', () => {
  it('is told the truth beforehand, and names who could fall', () => {
    const wrong = seen.filter(s => Gauntlet.contradicts(s.danger.danger, s.won))
      .map(s => `${s.foe} at ${s.level}: said ${s.danger.danger}, won ${Math.round(100 * s.won)}%`);
    expect(wrong).toEqual([]);
    expect(seen.find(s => s.foe === 'dragon' && s.level === 16)?.danger.text).toMatch(/could fall/);
  });
  it('is lost below the monster\'s own level and won above it, the forecast going with it', () => {
    const at = (foe: string, level: number) => seen.find(s => s.foe === foe && s.level === level)!;
    expect(at('dragon', 5).won).toBeLessThanOrEqual(0.2);
    expect(at('dragon', 16).won).toBeGreaterThanOrEqual(0.6);
    expect(['deadly', 'grave']).toContain(at('dragon', 5).danger.danger);
    expect(['deadly', 'grave']).not.toContain(at('dragon', 16).danger.danger);
    expect(at('discerner', 8).won).toBeGreaterThanOrEqual(at('discerner', 5).won);
  });
});
