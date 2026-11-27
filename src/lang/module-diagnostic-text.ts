import type { Module, Signature } from './module';
import type { VocabularyContext } from './vocabulary';

export class ModuleDiagnosticText {
  static shape(s: Signature): string {
    return `${s.name}(${s.types.map((t, i) => s.roles?.[i] ? `${s.roles[i]}: ${t}` : t).join(', ')})`;
  }
  static known(module: Module, kind: string | undefined): string {
    const of = module.entities.filter(e => e.type === kind).map(e => e.name);
    return of.length && of.length <= 12 ? `: no ${kind} of that name; the ${kind}s are ${of.join(', ')}` : '';
  }
  static unrun(vocabulary: VocabularyContext, arg: string, kind: string | undefined): string | undefined {
    const ability = kind === 'ability' ? vocabulary.ability(arg) : undefined;
    return ability?.unsupported ? `: ${ability.name} is Orsino's, and Kyr cannot run it (${Object.values(ability.unsupported)
      .join(' ')})` : undefined;
  }
}
