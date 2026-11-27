import type { Change, Module, VerbDeclaration } from './module';

export class VerbDeclarations {
  static check(module: Module, kind: (name: string) => void,
    change: (change: Change, bindings: Record<string, string>) => void): void {
    const seen = new Set<string>();
    for (const verb of module.verbs ?? []) {
      if (seen.has(verb.name)) { throw new Error(`Duplicate verb ${verb.name}`); }
      seen.add(verb.name);
      this.phrase(verb);
      for (const parameter of verb.parameters) {
        if (parameter.type === 'number') { throw new Error(`Unsupported operand kind number in verb ${verb.name}`); }
        kind(parameter.type);
      }
      if (verb.lowering.kind !== 'assert'
        || verb.lowering.call.args.some(arg => !verb.parameters.some(parameter => parameter.name === arg))) {
        throw new Error(`Unsupported or unbound lowering in verb ${verb.name}`);
      }
      change(verb.lowering, Object.fromEntries(verb.parameters.map(p => [p.name, p.type])));
    }
  }
  private static phrase(verb: VerbDeclaration): void {
    const names = verb.parameters.map(p => p.name);
    if (new Set(names).size !== names.length) { throw new Error(`Duplicate parameter in verb ${verb.name}`); }
    const slots = [...verb.phrase.matchAll(/\{([A-Za-z][\w-]*)\}/g)].map(m => m[1]!);
    const remainder = verb.phrase.replace(/\{[A-Za-z][\w-]*\}/g, '');
    if (/[{}]/.test(remainder) || slots.length !== names.length || new Set(slots).size !== slots.length
      || slots.some(slot => !names.includes(slot)) || verb.phrase.trim().split(/\s+/).some(word =>
        /[{}]/.test(word) && !/^\{[A-Za-z][\w-]*\}$/.test(word)) || verb.phrase.trim().startsWith('{')) {
      throw new Error(`Invalid phrase slots in verb ${verb.name}`);
    }
  }
}
