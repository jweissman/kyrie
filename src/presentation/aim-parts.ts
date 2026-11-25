// Layer: the generic player (presentation). Reads the language's types through src/lang only (its values come in by
// the caller, so that no import of the language's is added within the folders' cycle); knows no setting. An aim's
// parts as the Notes tell them (OR-468).
import type { Campaign } from '../campaign/campaign';
import type { Objective, Predicate } from '../lang';

export interface AimPart { text: string; done: boolean }

// What an aim is made of, and which of it is done: an aim held until a milestone is achieved (its condition says
// `not achieved(M)`) is made of what that milestone's own rule asks be achieved first, each a milestone of its own,
// told in its own words and done or not as the world has it (the First Aims: the workings explored, someone to go
// with, Dun Rìerdan learnt of). Read from the rules as written, never a list kept beside them; an aim with no such
// milestone has no parts.
export class AimParts {
  static of(campaign: Campaign, aim: Objective, render: (text: string) => string): AimPart[] {
    const rules = campaign.module.rules ?? [];
    for (const m of this.negated(aim.when)) {
      const rule = rules.find(r => r.effects.some(e => e.kind === 'assert' && e.call.name === 'achieved'
        && e.call.args[0] === m));
      const parts = rule ? this.achieved(rule.when).filter(p => p !== m) : [];
      const done = parts.length ? this.done(campaign) : undefined;
      if (done) { return parts.map(p => this.part(campaign, p, { done, render })); }
    }
    return [];
  }
  private static part(campaign: Campaign, id: string, at: { done: Set<string>; render: (text: string) => string })
    : AimPart {
    const name = campaign.module.entities.find(e => e.id === id)?.name ?? id;
    return { text: at.render(name), done: at.done.has(id) };
  }
  // The milestones achieved (Milestones.achieved, read as the world has them).
  private static done(campaign: Campaign): Set<string> {
    const w = campaign.world;
    return new Set(w.relates('achieved') ? w.related('achieved').map(r => r.args[0]!) : []);
  }
  // The milestones a condition holds only while they are not achieved.
  private static negated(p: Predicate): string[] {
    if (p.kind === 'and' || p.kind === 'or') { return [...this.negated(p.left), ...this.negated(p.right)]; }
    return p.kind === 'not' && p.value.kind === 'call' && p.value.name === 'achieved' ? [p.value.args[0]!] : [];
  }
  // The milestones a condition asks be achieved.
  private static achieved(p: Predicate): string[] {
    if (p.kind === 'and' || p.kind === 'or') { return [...this.achieved(p.left), ...this.achieved(p.right)]; }
    return p.kind === 'call' && p.name === 'achieved' ? [p.args[0]!] : [];
  }
}
