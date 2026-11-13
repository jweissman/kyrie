import type { Call, Operator, Predicate } from '../lang/module';
import type { World } from '../lang/world';
import { ModuleWriter } from '../lang/module-writer';

// Who must be with the actor for an action to be possible at all, read from its precondition (Mission 21: a campaign
// of 1 292 actions, two in three a word with someone, grounded every one at every step, the speakers nearly all
// elsewhere: a third of an hour's waiting in the Book of Faces). An action is gated on someone S where its
// precondition, a conjunction at its top, holds at(actor, site) and, beside it, a part every branch of which holds
// at(S, site) or travelsWith(S, actor); then the action is grounded only where S is where the actor is, or travels
// with it. Nothing else is assumed: an action not of that shape is not gated, and grounded as before.
export class PresenceGate {
  private static readonly gates = new WeakMap<Operator, string | null>();
  // Whether an action may be possible for an actor in this world, by who it needs beside the actor.
  static open(world: World, schema: Operator, actor: string): boolean {
    const who = this.gate(schema);
    if (!who) { return true; }
    const here = world.one('at', actor);
    return (here !== undefined && world.one('at', who) === here)
      || world.test(ModuleWriter.call('travelsWith', who, actor));
  }
  static gate(schema: Operator): string | undefined {
    if (!this.gates.has(schema)) { this.gates.set(schema, this.read(schema) ?? null); }
    return this.gates.get(schema) ?? undefined;
  }
  private static read(schema: Operator): string | undefined {
    const parts = this.conjuncts(schema.requires);
    const site = parts.filter((p): p is Call => p.kind === 'call')
      .find(p => p.name === 'at' && p.args[0] === 'actor')?.args[1];
    if (!site || !(schema.parameters ?? []).some(p => p.name === site)) { return undefined; }
    const names = new Set((schema.parameters ?? []).map(p => p.name));
    for (const part of parts) {
      const who = this.needs(part, site, names);
      if (who) { return who; }
    }
    return undefined;
  }
  // The constant every branch of a part needs beside the actor (at the site, or travelling with it), if one does.
  private static needs(part: Predicate, site: string, names: Set<string>): string | undefined {
    const branches = this.branches(part), found = branches.map(b => this.beside(this.conjuncts(b), site, names));
    const first = found[0];
    return first && found.every(f => f === first) ? first : undefined;
  }
  private static beside(atoms: Predicate[], site: string, names: Set<string>): string | undefined {
    for (const a of atoms) {
      if (a.kind !== 'call') { continue; }
      const c = a as Call, who = c.args[0];
      if (who === undefined || !this.constant(who, names)) { continue; }
      if ((c.name === 'at' && c.args[1] === site) || (c.name === 'travelsWith' && c.args[1] === 'actor')) { return who; }
    }
    return undefined;
  }
  // One named, not a parameter of the action nor an unknown of its rule.
  private static constant(arg: string, names: Set<string>): boolean { return !arg.startsWith('?') && !names.has(arg); }
  private static conjuncts(p: Predicate): Predicate[] {
    return p.kind === 'and' ? [...this.conjuncts(p.left), ...this.conjuncts(p.right)] : [p];
  }
  private static branches(p: Predicate): Predicate[] {
    return p.kind === 'or' ? [...this.branches(p.left), ...this.branches(p.right)] : [p];
  }
}
