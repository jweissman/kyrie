import type { Choice } from '../../src/ui/choice-list';

// What is said in a conversation, as attention holds it (the owner, 5 November: an innkeeper had stood with
// twenty-five things to talk about at once): an answer owed first; then three things to say at most, the salient ones
// (what the page leads this person with, what the last answer opened, then what has not been asked, as the author
// ordered it); the rest a touch away, not yet asked before those that have been; and what is had of them for coin or
// work (a bed, care, a song for supper, a lesson, a sale) set apart for trading, not among what is said.
export class TalkFocus {
  static readonly most = 3;
  static readonly services =
    /^(take_lodging|take_healing|work_keep|sing_supper|sell|buy_goods|train_member|learn_spell|repair)/;
  static of(replies: Choice[], at: { led?: string; heard?: string[]; asked: string[] }) {
    const answers = replies.filter(c => c.answer);
    const services = replies.filter(c => !c.answer && TalkFocus.service(c));
    const said = TalkFocus.beyond(replies.filter(c => !c.answer && !services.includes(c)));
    const spent = said.filter(c => at.asked.includes(c.id) || /_again(\(|$)/.test(c.command ?? ''));
    const fresh = said.filter(c => !spent.includes(c)), heard = new Set(at.heard ?? []);
    const led = at.led ? fresh.filter(c => c.command === at.led || c.id === at.led
      || !!c.children?.some(k => k.command === at.led)) : [];
    // New since the last thing said: not offered then (a group, if none of what it holds was).
    const opened = at.heard ? fresh.filter(c => !heard.has(c.id) && !c.children?.some(k => heard.has(k.id))
      && !led.includes(c)) : [];
    const ranked = [...led, ...opened, ...fresh.filter(c => !led.includes(c) && !opened.includes(c))];
    const room = Math.max(1, TalkFocus.most - (answers.length ? 1 : 0));
    return { answers, salient: ranked.slice(0, room), more: [...ranked.slice(room), ...spent], services,
      opened: new Set(opened.map(c => c.id)) };
  }
  // What is told of the countries beyond this one (twenty and more at an inn), one thing to ask about, opened to them.
  private static beyond(said: Choice[]): Choice[] {
    const far = said.filter(c => /_beyond_told_/.test(c.command ?? c.id));
    if (far.length < 2) { return said; }
    const at = said.indexOf(far[0]!), near = said.filter(c => !far.includes(c));
    const group: Choice = { id: `${far[0]!.id}#beyond`, label: 'Ask about the lands beyond', tone: far[0]!.tone,
      children: far };
    return [...near.slice(0, at), group, ...near.slice(at)].sort((a, b) => Number(a === group) - Number(b === group));
  }
  // Had of them for coin or work: by what it does, or a group of such (a lesson in each skill).
  private static service(c: Choice): boolean {
    // One that cannot be had now has no command, but its id is what it would do.
    const does = c.command ?? c.does ?? c.id;
    return TalkFocus.services.test(does) || (!!c.children?.length && c.children.every(k => TalkFocus.service(k)));
  }
}
