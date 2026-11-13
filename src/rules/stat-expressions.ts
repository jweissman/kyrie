import { Deem } from 'deem';
import { Expressions } from '../expressions';
import { Amounts } from './amounts';

// A stat block's numbers as Deem expressions over what the engine binds (engine-pressure.md, §2): its Hit Dice and its
// natural armour's bonus read its level and the company it is made to meet (#level, #company), fixed as it is made; a
// natural weapon's damage reads the fighter's own as each blow is thrown (#level, #strength, #hitDice: see
// Effects.context). The honest catalog refuses an expression that reads anything else, so no name is left unbound.
export class StatExpressions {
  static readonly making = ['level', 'company'];
  static readonly blow = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'hp', 'maxHp',
    'mana', 'level', 'hitDice', 'bonusSpellDC'];
  // Why an expression cannot stand in a stat block, if it cannot: it does not parse, reads a name not bound, or (thrown
  // blow by blow) does not come to a whole number with every bound name at one; one read as it is made (`made`) is
  // taken at its mean, which may be any number.
  static refused(text: string, names: readonly string[], made = false): string | undefined {
    if (typeof text !== 'string' || Deem.parse(text.trim()).failed()) { return `${String(text)} is not an expression`; }
    const context = Object.fromEntries(names.map(n => [n, 1]));
    try {
      if (made) { Amounts.mean(text, context); } else { new Expressions('stat-expressions').integer(text, context); }
      return undefined;
    } catch (error) { return `${text}: ${(error as Error).message.split(' (')[0]!}`; }
  }
  // A natural armour's bonus as it is made: its mean, rounded down; dice have no place in it (it is the same at every
  // blow), and are refused by the catalog.
  static armor(text: string | undefined, at: { level: number; company?: number }): number {
    return text === undefined ? 0 : Math.floor(Amounts.mean(text, { level: at.level, company: at.company ?? 1 }));
  }
}
