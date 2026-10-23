import { ModuleParser } from '../lang/module-parser';
import { ModuleCompiler } from '../lang/module-compiler';
import type { Module, Predicate, Value } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { World } from '../lang/world';

export interface RoleContract { type: string; conditions?: string[] }
export interface BoundRole { role: string; entity: string; type: string; conditions: Predicate[] }
export class RoleRequirements {
  static bind(roles: Record<string, RoleContract>, imports: Record<string, string>): BoundRole[] {
    return Object.entries(roles).map(([role, spec]) => {
      if (!imports[role] || typeof spec.type !== 'string') { throw new Error(`Unbound required role ${role}`); }
      return { role, entity: imports[role]!, type: spec.type,
        conditions: (spec.conditions ?? []).map(text => this.predicate(ModuleParser.predicate(text), imports)) };
    });
  }
  private static value(value: Value, imports: Record<string, string>): Value {
    return ModuleWriter.calls(value, c => ({ ...c, args: c.args.map(id => imports[id] ?? id) }));
  }
  private static predicate(p: Predicate, imports: Record<string, string>): Predicate {
    if (p.kind === 'call') { return { ...p, args: p.args.map(id => imports[id] ?? id) }; }
    if (p.kind === 'not') { return { ...p, value: this.predicate(p.value, imports) }; }
    if (p.kind === 'and' || p.kind === 'or') {
      return { ...p, left: this.predicate(p.left, imports), right: this.predicate(p.right, imports) };
    }
    if (p.kind === 'compare') { return { ...p, left: this.value(p.left, imports), right: this.value(p.right, imports) }; }
    return p;
  }
  static validate(roles: BoundRole[], module: Module, world: World) {
    for (const role of roles) {
      if (!module.entities.some(e => e.id === role.entity && e.type === role.type)) {
        throw new Error(`Role ${role.role} requires ${role.type}: ${role.entity}`);
      }
      for (const condition of role.conditions) {
        new ModuleCompiler().validate({ ...module, actions: [], goal: condition });
        if (!world.test(condition)) { throw new Error(`Unsatisfied requirement for role ${role.role}: ${role.entity}`); }
      }
    }
  }
}
