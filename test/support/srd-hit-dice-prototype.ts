import source from '../../data/sources/srd35/monsters.json';
import { Amounts } from '../../src/rules/amounts';

type Source = { hitDice: string; hp: number };
const monsters: Record<string, Source> = source.monsters;

// A source-only staging check: no catalog body or encounter is created.
export class SrdHitDicePrototype {
  static read(id: string) {
    const record = monsters[id];
    if (!record) { throw new Error(`Unknown SRD creature ${id}`); }
    const expression = record.hitDice.replace(/plus/g, '+').replace(/(\d+)\/(\d+)d(\d+)/g, '$1d$3/$2');
    if (!/^\d+d\d+(?:\/[1-9]\d*)?(?:[+-](?:\d+d\d+(?:\/[1-9]\d*)?|\d+))*$/.test(expression)) {
      throw new Error(`Unsupported Hit Dice for ${id}: ${record.hitDice}`);
    }
    const average = Amounts.listed(expression);
    if (!Number.isFinite(average) || !Number.isSafeInteger(record.hp) || record.hp < 1) {
      throw new Error(`Invalid hit points for ${id}: ${record.hp}`);
    }
    return { id, source: record.hitDice, expression, average, printed: record.hp, agrees: average === record.hp };
  }
}
