import core from '../../data/rules/core.kyr' with { type: 'text' };
import care from '../../data/rules/care.kyr' with { type: 'text' };
import belongings from '../../data/rules/belongings.kyr' with { type: 'text' };
import fantasy from '../../data/rules/fantasy.kyr' with { type: 'text' };
import { ModuleParser, SymbolTable, TextHash, VerbIndex, VocabularyContext, type Effect, type VerbOperand }
  from '../lang/index';

export class FantasyVerbs {
  private static index?: VerbIndex;
  private static readonly targets = ['dead ally', 'random enemy', 'enemies', 'allies', 'party', 'enemy', 'ally',
    'self', 'all', 'it', 'here'] as const;
  private static verbs(): VerbIndex {
    if (this.index) { return this.index; }
    const shared = [core, care, belongings].map((text, i) => ({
      file: ['core.kyr', 'care.kyr', 'belongings.kyr'][i]!, module: ModuleParser.parse(text),
    }));
    const own = ModuleParser.parse(fantasy);
    const symbols = SymbolTable.of(VocabularyContext.none.fork(), { shared,
      modules: [{ id: 'fantasy_rules', files: [{ file: 'fantasy.kyr', module: own }] }] });
    const operands = new Map<string, VerbOperand>([
      ['care:kind:ability', { kind: 'identifier' }],
      ['world_core:kind:member', { kind: 'choice', values: this.targets }],
    ]);
    return this.index = VerbIndex.of(symbols, ['fantasy_rules'], operands);
  }
  static resolve(text: string): Effect {
    const { relation, change } = FantasyVerbs.verbs().match(text);
    if (relation.id !== 'belongings:relation:learned' || change.kind !== 'assert') {
      throw new Error(`Fantasy rules cannot execute verb ${text}`);
    }
    const target = FantasyVerbs.targets.find(t => t === change.call.args[0]), ability = change.call.args[1];
    if (!target || !ability) { throw new Error(`Invalid teaching operands in ${text}`); }
    return { kind: 'learn', ability, target, lowering: change };
  }
  static readonly key = TextHash.of([core, care, belongings, fantasy].join('\u0000'));
}
