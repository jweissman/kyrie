import type { PlaySession } from '../session/play-session';
import type { Aspect, Glance, Promoted } from '../presentation/glance-types';

// Whether each facet a glance draws is kept by what its act does (promise fidelity: the owner, 15 November). The act
// is done in a fresh copy of the world, and an opener's facet by the act within it that it is for; what came of it is
// read from the event's changes, by relation, never from anything said. Instruments only: nothing here is shown.
// traces: for each promise broken, what the act was drawn for (its why), what it does, and what it changed. chance:
// what a check did not bring on the one roll a copy of the world replays (its promise is its success's, not judged).
export interface Fidelity { drawn: Aspect[]; broken: string[]; traces: string[]; chance: string[] }
export class RunnerFidelity {
  // What each facet promises, as a change the act makes: something come to the company (an item now a member's,
  // coin), a fact known, someone willing to come or come, a hostile met (its standing or wakefulness changed); and
  // what is worth a look, somewhere been for the first time, something found out (a tower climbed shows the country),
  // or the thing it is done to changed (see seen). The aim's gold is the golden thread's (test/small/gold-*).
  static readonly brings: Partial<Record<Aspect, RegExp>> = {
    payoff: /^[+-] (at\(\w+, \w*member_|ownedItem\(|quantity\(party, gold\))/,
    // Or a try at a thing (push, listen): how its working is found out, which the next look answers (pick it, wrench
    // it, it gave).
    knowledge: /^\+ (knows|tried)\(/,
    companionship: /^\+ (willing|companion|memberOf)\(/,
    // (Or its standing toward the company: let be, warned off, coming at it: a band talked round or not.)
    danger: /^[+-] (able|awake|hostile|fighting|engaged|tolerates|warned|assails)\(/,
    exploration: /^\+ (been|knows)\(party, /,
  };
  // fork: the world as the glance was drawn from it, afresh for each act. as: facets to read an act's commands as
  // drawn with, where a spec would have the drawing wrong.
  static async of(glance: Glance, fork: () => PlaySession | Promise<PlaySession>,
    as: Partial<Record<Aspect, string[]>> = {}): Promise<Fidelity> {
    const broken: string[] = [], drawn = new Set<Aspect>(), traces: string[] = [], chance: string[] = [];
    for (const act of glance.acts.filter(a => a.command)) {
      const aspects = [...act.aspects, ...Object.entries(as).filter(([, c]) => c.includes(act.command!))
        .map(([a]) => a as Aspect)];
      for (const aspect of aspects.filter(a => this.brings[a])) {
        drawn.add(aspect);
        const session = await fork(), checked = this.checked(session, act, aspect);
        const changes = await this.done(session, act, aspect);
        if (!changes.some(c => this.brings[aspect]!.test(c) || (aspect === 'exploration' && this.seen(c, act)))) {
          if (checked) { chance.push(`${act.label}: drawn ${aspect}, not on this roll`); continue; }
          broken.push(`${act.label}: drawn ${aspect}, brought none`);
          traces.push(`${act.why} ${act.command} ${JSON.stringify(act.inside ?? [])}\n${changes.join('  ')}`);
        }
      }
    }
    return { drawn: [...drawn], broken, traces, chance };
  }
  // Whether what the facet is for is a check (its action resolves by one), as against an act that does what it does.
  private static checked(session: PlaySession, act: Promoted, aspect: Aspect): boolean {
    const command = act.inside?.find(i => i.aspects.includes(aspect))?.command ?? act.command;
    return session.campaign.offered().find(o => o.id === command)?.resolve?.name === 'check';
  }
  // A change to what the act is done to (its command's own arguments): its state, or a try at it.
  private static seen(change: string, act: Promoted): boolean {
    const on = /\((.*)\)/.exec(act.command ?? '')?.[1]?.split(',').map(a => a.trim()) ?? [];
    return on.some(a => change.startsWith(`+ state(${a},`) || change.startsWith(`+ tried(${a},`));
  }
  // The act done, and, where it opens onto others, the one within it that the facet is for.
  private static async done(session: PlaySession, act: Promoted, aspect: Aspect): Promise<string[]> {
    const first = await session.leg(act.command!);
    const inside = act.inside?.find(i => i.aspects.includes(aspect) && i.command !== act.command);
    return inside ? [...first.changes, ...(await session.leg(inside.command)).changes] : first.changes;
  }
}
