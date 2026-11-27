import type { Change, VerbDeclaration } from './module';
import { ModulePositions } from './module-positions';
import { SymbolTable, type SymbolDeclaration } from './symbol-table';
import { TextHash } from './text-hash';

type Token = string | null;
interface Pattern {
  declaration: SymbolDeclaration; verb: VerbDeclaration; relation: SymbolDeclaration;
  expression: RegExp; slots: string[]; forms: Token[][]; kinds: string[];
}
export interface BoundVerb { declaration: SymbolDeclaration; relation: SymbolDeclaration; change: Change }
export type VerbOperand = { kind: 'identifier' } | { kind: 'choice'; values: readonly string[] };

// Each installation compiles its own phrases against its own declarations.
export class VerbIndex {
  private readonly heads = new Map<string, Pattern[]>();
  static of(symbols: SymbolTable, units: readonly string[], operands: ReadonlyMap<string, VerbOperand>): VerbIndex {
    const index = new VerbIndex();
    for (const unit of units) {
      for (const declaration of symbols.declarations(unit).filter(d => d.namespace === 'verb')) {
        index.add(symbols, declaration, operands);
      }
    }
    return index;
  }
  key(): string {
    return TextHash.of(JSON.stringify([...this.heads.values()].flat().map(p => [
      p.declaration.id, p.verb, p.kinds, p.relation.id, p.relation.scope, p.relation.types, p.expression.source,
    ])));
  }
  private add(symbols: SymbolTable, declaration: SymbolDeclaration, operands: ReadonlyMap<string, VerbOperand>): void {
    const verb = declaration.verb!;
    const binding = symbols.resolve(declaration.unit, verb.lowering.call.name, 'function');
    if (binding.status !== 'bound' || binding.to.namespace !== 'relation') {
      throw new Error(ModulePositions.message(declaration.span, `Verb ${verb.name} has no bound relation`));
    }
    const types = this.types(symbols, declaration, binding.to, operands);
    const words = verb.phrase.trim().split(/\s+/), slots: string[] = [], forms: Token[][] = [[]];
    let expression = '';
    for (const word of words) {
      const slot = /^\{([A-Za-z][\w-]*)\}$/.exec(word)?.[1];
      expression += expression ? '\\s+' : '';
      if (!slot) {
        if (/[{}]/.test(word)) { throw new Error(`Unsupported phrase in verb ${verb.name}`); }
        expression += VerbIndex.escape(word);
        for (const form of forms) { form.push(word); }
        continue;
      }
      const parameter = verb.parameters.find(p => p.name === slot);
      if (!parameter || slots.includes(slot)) { throw new Error(`Invalid phrase slots in verb ${verb.name}`); }
      slots.push(slot);
      const syntax = types.get(slot)!;
      if (syntax.kind === 'identifier') {
        expression += '([\\p{L}][\\p{L}\\p{N}_-]*)';
        for (const form of forms) { form.push(null); }
      } else {
        expression += `(${syntax.values.map(VerbIndex.escape).join('|').replaceAll(' ', '\\s+')})`;
        const previous = forms.splice(0);
        for (const form of previous) {
          for (const target of syntax.values) { forms.push([...form, ...target.split(' ')]); }
        }
      }
    }
    if (slots.length !== verb.parameters.length || !words[0] || words[0].startsWith('{')) {
      throw new Error(`Invalid phrase slots in verb ${verb.name}`);
    }
    const kinds = verb.parameters.map(parameter => {
      const kind = symbols.resolve(declaration.unit, parameter.type, 'kind');
      if (kind.status !== 'bound') { throw new Error(`Unbound operand kind ${parameter.type} in verb ${verb.name}`); }
      return kind.to.id;
    });
    const pattern = { declaration, verb, relation: binding.to, expression: new RegExp(`^${expression}$`, 'u'),
      slots, forms, kinds };
    const head = words[0], others = this.heads.get(head) ?? [];
    if (others.some(other => VerbIndex.overlaps(pattern, other))) {
      throw new Error(`Ambiguous verb phrase ${verb.phrase}`);
    }
    others.push(pattern); this.heads.set(head, others);
  }
  private types(symbols: SymbolTable, declaration: SymbolDeclaration, relation: SymbolDeclaration,
    operands: ReadonlyMap<string, VerbOperand>): Map<string, VerbOperand> {
    const verb = declaration.verb!, call = verb.lowering.call;
    if (verb.lowering.kind !== 'assert' || call.args.length !== relation.types?.length) {
      throw new Error(`Invalid lowering in verb ${verb.name}`);
    }
    const types = new Map<string, VerbOperand>();
    for (const parameter of verb.parameters) {
      const binding = symbols.resolve(declaration.unit, parameter.type, 'kind');
      const syntax = binding.status === 'bound' && operands.get(binding.to.id);
      if (!syntax || (syntax.kind === 'choice' && !syntax.values.length)) {
        throw new Error(`Unsupported operand kind ${parameter.type} in verb ${verb.name}`);
      }
      types.set(parameter.name, syntax);
    }
    call.args.forEach((arg, i) => {
      const parameter = verb.parameters.find(p => p.name === arg), wanted = relation.types?.[i];
      const actual = parameter && symbols.resolve(declaration.unit, parameter.type, 'kind');
      const expected = wanted && symbols.resolve(relation.unit, wanted, 'kind');
      if (!actual || actual.status !== 'bound' || !expected || expected.status !== 'bound'
        || actual.to.id !== expected.to.id) {
        throw new Error(`Incompatible lowering argument ${arg} in verb ${verb.name}`);
      }
    });
    if (verb.parameters.some(parameter => !call.args.includes(parameter.name))) {
      throw new Error(`Unbound lowering parameter in verb ${verb.name}`);
    }
    return types;
  }
  match(text: string): BoundVerb {
    const head = text.trim().split(/\s+/, 1)[0]!;
    for (const pattern of this.heads.get(head) ?? []) {
      const match = pattern.expression.exec(text.trim());
      if (!match) { continue; }
      const bindings = Object.fromEntries(pattern.slots.map((slot, i) => [slot, match[i + 1]!]));
      const original = pattern.verb.lowering;
      const name = pattern.relation.scope === 'shared' ? pattern.relation.name
        : `${pattern.relation.unit}__${pattern.relation.name}`;
      const call = { ...original.call, name, args: original.call.args.map(a => bindings[a] ?? a) };
      return { declaration: pattern.declaration, relation: pattern.relation, change: { ...original, call } };
    }
    throw new Error(`No declared verb matches ${text}`);
  }
  private static overlaps(a: Pattern, b: Pattern): boolean {
    return a.forms.some(left => b.forms.some(right => left.length === right.length
      && left.every((word, i) => word === null || right[i] === null || word === right[i])));
  }
  private static escape(text: string): string { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
}
