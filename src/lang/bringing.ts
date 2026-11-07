import type { Call, Change, Module, Predicate, WorldRule } from './module';

// "Bring wolves." in what an act or a rule does: whoever it names comes to where the one who acts stands ("Bring
// wolves to party.", where another is named), from wherever they were or from nowhere. A fight that follows a failed
// act had to be someone parked nowhere and moved in by `Assert at(wolves, pantry)`, the room written out again in each
// act that could fail there (the Imbar author's friction 2, M19-94). Lowered to a fact the act writes, and a rule of
// the module's own that moves them as the world's rules are next tried, the act's own changes made (so the company's
// rules, and whoever falls on it, see them come in the same moment).
export class Bringing {
  static readonly relation = 'bringing';
  static readonly rule = 'bringing__comes';
  static change(who: string, to: string): Change { return { kind: 'assert', call: this.call(this.relation, who, to) }; }
  // The relation and the rule, once, in a module that brings anyone: each file of a module lowers its own, and the
  // files joined keep one (see once).
  static lower(module: Module): void {
    const rules = module.rules ?? [];
    const changes = [...module.initial, ...module.actions.flatMap(a => [...a.success, ...a.failure]),
      ...rules.flatMap(r => r.effects)];
    if (!changes.some(c => c.call.name === this.relation)) { return; }
    // A rule has no one who acts: it names whom they come to (Bring wolves to party).
    const loose = rules.find(r => r.effects.some(c => this.toActor(c)))
      ?? (module.initial.some(c => this.toActor(c)) ? { id: 'Initially' } : undefined);
    if (loose && !module.entities.some(e => e.id === 'actor')) {
      throw new Error(`${loose.id} brings someone to where the one who acts stands, and nobody acts in it: say to whom `
        + '(Bring wolves to party)');
    }
    if (!module.relations.some(r => r.name === this.relation)) {
      module.relations.push({ name: this.relation, types: ['entity', 'entity'], exclusive: false });
    }
    if (rules.some(r => r.id === this.rule)) { return; }
    const brought = this.call(this.relation, '?who', '?to');
    const when: Predicate = { kind: 'and', left: brought, right: this.call('at', '?to', '?place') };
    // First of the module's rules, so that its own see them come in the same pass.
    module.rules = [{ id: this.rule, when, effects: [{ kind: 'retract', call: brought },
      { kind: 'assert', call: this.call('at', '?who', '?place') }] }, ...rules];
  }
  // A module's files joined: the rule each file lowered for itself, kept once.
  static once(rules: WorldRule[]): WorldRule[] {
    let seen = false;
    return rules.filter(r => r.id !== this.rule || !seen && (seen = true));
  }
  private static toActor(c: Change): boolean { return c.call.name === this.relation && c.call.args[1] === 'actor'; }
  private static call(name: string, ...args: string[]): Call { return { kind: 'call', name, args }; }
}
