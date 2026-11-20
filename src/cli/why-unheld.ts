import type { Campaign } from '../campaign/campaign';
import type { Change, Operator, Predicate } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { WhyDependents } from './why-dependents';
import type { Asked } from './why-fact';

// `kyrie inspect --why fact` on a fact that does not hold (MT-13's second addition, the AT-09 analysis): each act or
// rule that could write it (WhyDependents.uses), and the first part of its condition that does not hold now. An act is
// asked as the company would do it where it stands (its actor the one who plays, its site where they are; any other
// of its parameters left for the world to find); a rule as it is written. Its parts are asked in order, each with those
// before it, so that what one binds the next is asked of: the first that fails is why it has not been done.
//   read_book: not (knows(actor, found_drowned))      pay_fine: quantity(actor, gold) >= 12
export class WhyUnheld {
  static report(campaign: Campaign, asked: Asked): string[] {
    const m = campaign.module, writers = WhyDependents.uses(m, asked.name).filter(u => u.writes);
    const lines: string[] = [];
    for (const u of writers) {
      const act = u.kind === 'act' ? m.actions.find(a => (a.schema ?? a.id) === u.id) : undefined;
      const rule = u.kind === 'rule' ? (m.rules ?? []).find(r => r.id === u.id) : undefined;
      if (act && this.writes(act.success.concat(act.failure), asked, this.parameters(act))) {
        lines.push(`    ${u.id}: ${this.act(campaign, act)}`);
      } else if (rule && this.writes(rule.effects, asked, [])) {
        lines.push(`    rule ${u.id}: ${this.failing(campaign, rule.when, {}) ?? 'its condition holds now'}`);
      } else if (!act && !rule) { lines.push(`    ${u.kind} ${u.id}: (its condition is not asked)`); }
    }
    return lines.length ? ['  could be written by:', ...lines] : ['  could be written by: nothing in the rules'];
  }
  private static act(campaign: Campaign, act: Operator): string {
    const actor = campaign.playerActor ?? 'party', site = campaign.world.one('at', actor);
    const bound: Record<string, string> = {};
    for (const p of this.parameters(act)) {
      if (p === 'actor') { bound[p] = actor; } else if (p === 'site' && site) { bound[p] = site; }
    }
    const open = this.parameters(act).filter(p => bound[p] === undefined);
    const fails = this.failing(campaign, this.opened(act.requires, open), bound);
    const as = Object.entries(bound).map(([k, v]) => `${k} ${v}`).join(', ');
    return `${fails ?? 'nothing fails: it can be done now'}${as ? ` (as ${as})` : ''}`;
  }
  private static parameters(act: Operator): string[] { return (act.parameters ?? []).map(p => p.name); }
  // The first of a condition's parts that does not hold with those before it, as written; none, where all do.
  private static failing(campaign: Campaign, when: Predicate, bound: Record<string, string>): string | undefined {
    const parts = this.parts(when), world = campaign.world;
    let held: Predicate | undefined;
    for (const part of parts) {
      const asked: Predicate = held ? { kind: 'and', left: held, right: part } : part;
      let holds: boolean;
      try { holds = world.test(asked, bound); } catch (e) { return `${this.said(part)} (not asked: ${(e as Error).message})`; }
      if (!holds) { return this.said(part); }
      held = asked;
    }
    return undefined;
  }
  private static parts(p: Predicate): Predicate[] {
    return p.kind === 'and' ? [...this.parts(p.left), ...this.parts(p.right)] : [p];
  }
  private static said(p: Predicate): string { return ModuleWriter.predicate(p).replace(/\?(\w+)/g, '$1'); }
  // A parameter not bound, asked as a variable the world finds (?other).
  private static opened(p: Predicate, open: string[]): Predicate {
    if (!open.length) { return p; }
    return JSON.parse(JSON.stringify(p), (key, value: unknown) => key === 'args' && Array.isArray(value)
      ? value.map(a => typeof a === 'string' && open.includes(a) ? `?${a}` : a as unknown) : value) as Predicate;
  }
  // Whether a change writes the fact asked: asserts or sets it, its arguments where asked those the change could be.
  private static writes(changes: Change[], asked: Asked, parameters: string[]): boolean {
    return changes.some(c => c.kind !== 'retract' && c.call.name === asked.name && asked.args.every((a, i) => {
      const arg = c.call.args[i];
      return a === undefined || arg === undefined || arg === a || parameters.includes(arg) || arg.startsWith('?');
    }));
  }
}
