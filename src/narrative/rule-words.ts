import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import { FictionalTime } from '../campaign/fictional-time';
import type { Voiced } from './telling';
import type { Module } from '../lang/index';

type Line = { text: string; kind: 'event' | 'change' };

// What the world's rules say where the company hears them, against the record of what has been told: a rule's words
// told are kept (CampaignEvent.voiced, kind rule), and the same words of the same rule are not told again within a few
// days of the last time, but held back as heard already (CampaignEvent.unsaid). The bell on the east point had been
// told every first light, nine times in eight walks (the boredom census, BO-09). A rule with lines of its own for
// each time after the first (`again`, `then`) says them as its author wrote them, and is not held back; nor are words
// that broke off what the company was doing, which are what it is told of why.
export class RuleWords {
  static readonly rested = 3 * 24 * 60 / FictionalTime.minutesPerTick;
  static tell(campaign: Campaign, event: CampaignEvent): { told: Voiced[]; unsaid: string[] } {
    const rules = new Map((campaign.module.rules ?? []).filter(r => r.say && !r.again).map(r => [r.id, r]));
    const heard = (event.perceptions ?? []).filter(p => p.kind === 'event' && rules.has(p.id.split('@')[0]!));
    if (!heard.length) { return { told: [], unsaid: [] }; }
    const told: Voiced[] = [], unsaid: string[] = [];
    for (const p of heard) {
      const id = `rule.${p.id}`;
      const last = campaign.history.findLast(e => e !== event && e.elapsed < event.elapsed
        && (e.voiced ?? []).some(v => v.kind === 'rule' && v.id === id && v.text === p.text));
      if (last && !event.cut && event.elapsed - last.elapsed < this.rested) { unsaid.push(p.id); }
      else { told.push({ id, kind: 'rule', text: p.text }); }
    }
    return { told, unsaid };
  }
  // The rules whose words teach something (an event that teaches: a wonder met), by id.
  static teaching(campaign: Campaign): Set<string> {
    const module = campaign.module, kept = this.taught.get(module);
    if (kept) { return kept; }
    const made = new Set((module.rules ?? []).filter(r => r.teaches && r.say).map(r => r.id));
    this.taught.set(module, made);
    return made;
  }
  private static readonly taught = new WeakMap<object, Set<string>>();
  // The rules whose words come with what the company has changing (its coin, its rations: quantity), by id: what came
  // to the purse is said with it, never held back for room (OR-696, cold play 3: six coin picked up where rats warned,
  // the purse 6 → 12 with no line).
  static paying(campaign: Campaign): Set<string> {
    const module = campaign.module, kept = this.paid.get(module);
    if (kept) { return kept; }
    const made = new Set((module.rules ?? []).filter(r => r.say && r.effects.some(c => c.call.name === 'quantity'))
      .map(r => r.id));
    this.paid.set(module, made);
    return made;
  }
  private static readonly paid = new WeakMap<object, Set<string>>();
  // The world's words a command is told in: not those held back as heard lately.
  static said(event: CampaignEvent): NonNullable<CampaignEvent['perceptions']> {
    const unsaid = new Set(event.unsaid ?? []);
    return (event.perceptions ?? []).filter(p => p.kind === 'event' && !unsaid.has(p.id));
  }
  // A question put by someone (src/campaign/put-questions.ts) is the line of a rule `<question>_put`, said by the
  // question's speaker: told after their greeting, and in place of the tables'.
  // Who put a question among what was perceived, by the rule that put it: each line's words and the one who said it.
  static askers(module: Module, perceived: readonly { id: string; text: string }[] = []): Map<string, string> {
    const out = new Map<string, string>();
    for (const p of perceived) {
      const id = p.id.split('@')[0]!, rule = id.endsWith('_put') ? module.rules?.find(r => r.id === id) : undefined;
      const q = rule && module.actions.find(a => a.id === id.slice(0, -'_put'.length));
      if (q?.topic && q.speaker && q.speaker === rule!.place) { out.set(p.text, q.speaker); }
    }
    return out;
  }
  // What was told, as event lines: the questions put, and the rest; what came to the purse with the world's words is a
  // change among the rest, said whatever the room (OR-696).
  static parted(module: Module, perceived: readonly { id: string; text: string }[] | undefined, all: string[],
    told: { besides?: string; paid?: readonly string[] } = {}): [Line[], Line[]] {
    const asked = RuleWords.askers(module, perceived), said = all.filter(t => t !== told.besides);
    const paid = new Set(told.paid ?? []);
    return [said.filter(t => asked.has(t)).map(text => ({ text, kind: 'event' })),
      said.filter(t => !asked.has(t)).map(text => ({ text, kind: paid.has(text) ? 'change' : 'event' }))];
  }
}
