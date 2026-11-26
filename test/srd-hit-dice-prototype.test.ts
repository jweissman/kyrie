import { describe, expect, it } from 'bun:test';
import source from '../data/sources/srd35/monsters.json';
import { Amounts } from '../src/rules/amounts';
import { SrdHitDicePrototype } from './support/srd-hit-dice-prototype';

describe('the SRD Hit Dice staging prototype', () => {
  it('reads every source body without placing or changing a creature', () => {
    const rows = Object.keys(source.monsters).map(id => SrdHitDicePrototype.read(id));
    expect(rows.every(r => Amounts.valid(r.expression) && r.average >= 1 && r.printed >= 1)).toBe(true);
    expect(rows.find(r => r.id === 'rat')).toMatchObject({ source: '1/4d8', expression: '1d8/4',
      average: 1, printed: 1, agrees: true });
    expect(rows.find(r => r.id === 'grig')).toMatchObject({ source: '1/2d6+1', expression: '1d6/2+1',
      average: 2, printed: 2, agrees: true });
  });
  it('keeps mixed dice and exposes a printed hit-point discrepancy instead of silently adopting it', () => {
    const jarl = SrdHitDicePrototype.read('frost-giant-jarl-8th-level-blackguard');
    expect(jarl).toMatchObject({ expression: '14d8+84+8d10+48', average: 239, printed: 231, agrees: false });
    expect(Amounts.dice(jarl.expression).map(d => [d.count, d.sides])).toEqual([[14, 8], [8, 10]]);
    expect(SrdHitDicePrototype.read('gorgon')).toMatchObject({ average: 84, printed: 85, agrees: false });
    expect(() => SrdHitDicePrototype.read('not-an-srd-monster')).toThrow('Unknown SRD creature');
  });
});
