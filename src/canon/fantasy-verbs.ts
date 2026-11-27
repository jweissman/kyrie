import core from '../../data/rules/core.kyr' with { type: 'text' };
import care from '../../data/rules/care.kyr' with { type: 'text' };
import belongings from '../../data/rules/belongings.kyr' with { type: 'text' };
import fantasy from '../../data/rules/fantasy.kyr' with { type: 'text' };
import { ModuleParser, SymbolTable, TextHash, VerbIndex, VocabularyContext, type Effect, type VerbOperand,
  type VerbResolver, type SymbolSource }
  from '../lang/index';

interface BoundVerbs { resolve: VerbResolver; key: string }
export class FantasyVerbs {
  private static readonly targets = ['dead ally', 'random enemy', 'enemies', 'allies', 'party', 'enemy', 'ally',
    'self', 'all', 'it', 'here'] as const;
  private static readonly standard = this.fromSources([
    ...[core, care, belongings, fantasy].map((text, i) => ({
      file: ['core.kyr', 'care.kyr', 'belongings.kyr', 'fantasy.kyr'][i]!, module: ModuleParser.parse(text),
    })),
  ], VocabularyContext.none.fork());
  static forRules(sources: SymbolSource[], context: VocabularyContext): BoundVerbs {
    return FantasyVerbs.fromSources(sources, context);
  }
  private static fromSources(sources: SymbolSource[], context: VocabularyContext): BoundVerbs {
    const symbols = SymbolTable.of(context, { shared: sources, modules: [] });
    const units = [...new Set(symbols.declarations().filter(d => d.namespace === 'verb').map(d => d.unit))];
    const operands = new Map<string, VerbOperand>();
    for (const unit of units) {
      for (const [name, syntax] of [['ability', { kind: 'identifier' } as const],
        ['member', { kind: 'choice', values: this.targets } as const]] as const) {
        const binding = symbols.resolve(unit, name, 'kind');
        if (binding.status === 'bound') { operands.set(binding.to.id, syntax); }
      }
    }
    const index = VerbIndex.of(symbols, units, operands);
    const key = TextHash.of([context.fingerprint(), ...sources.flatMap(s => [s.file, s.module.id,
      JSON.stringify([s.module.kinds, s.module.relations, s.module.measures, s.module.verbs])])].join('\u0000'));
    return { key, resolve: FantasyVerbs.effect.bind(null, index) };
  }
  static effect(index: VerbIndex, text: string): Effect {
    const { relation, change } = index.match(text);
    if (relation.name !== 'learned' || change.kind !== 'assert') {
      throw new Error(`Fantasy rules cannot execute verb ${text}`);
    }
    const target = FantasyVerbs.targets.find(t => t === change.call.args[0]), ability = change.call.args[1];
    if (!target || !ability) { throw new Error(`Invalid teaching operands in ${text}`); }
    return { kind: 'learn', ability, target, lowering: change };
  }
  static resolve(text: string): Effect { return FantasyVerbs.standard.resolve(text); }
  static get key(): string { return FantasyVerbs.standard.key; }
}
