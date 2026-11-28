import type { Choice } from './choice-list';

// What is said in a conversation, as attention holds it (the owner, 5 November: an innkeeper had stood with
// twenty-five things to talk about at once): an answer owed first; then three things to say at most, the salient ones
// (what the page leads this person with, what an aim of the company's asks of them, what the last answer opened, then
// what has not been asked, as the author
// ordered it); the rest a touch away, not yet asked before those that have been; and what is had of them for coin or
// work (a bed, care, a song for supper, a lesson, a sale) set apart for trading, not among what is said.
export class TalkFocus {
  static readonly most = 3;
  static readonly flat = 3;
  // The kinds of act had of someone for coin or work (Choice.does, never the command's words).
  static readonly services = new Set(['take_lodging', 'take_lodging_guest', 'take_healing', 'work_keep', 'sing_supper',
    'sell', 'sell_valuable', 'sell_ware', 'buy_goods', 'haggle', 'haggle_wares', 'train_member', 'learn_skill', 'learn_spell', 'learn_reward']);
  // Never a compound act (the owner, 17 November): "Ask › about the mill" is one act, drawn as one simple row with the
  // words of both, and an act that opens others is none of them but its parts.
  static simple(replies: Choice[]): Choice[] {
    return replies.flatMap(c => !c.children?.length ? [c]
      : TalkFocus.simple(c.children.map(k => ({ ...k, label: TalkFocus.composed(c.label, k.label) }))));
  }
  private static composed(parent: string, child: string): string {
    return /^(for|to|with|of|about|by)\b/i.test(child) ? `${parent} ${child}` : `${parent}: ${child}`;
  }
  // An order given to someone who has joined is not something to say to them: it stands on their sheet (the company's
  // own acts), and a topic is not displaced by it (the owner's forty-step play, 17 November: "Ask them to stay here"
  // had taken a conversation's second place).
  static readonly orders = new Set(['hold_here']);
  static of(all: Choice[],
    at: { led?: string; marked?: string[]; heard?: string[]; asked: string[]; weighty?: string[]; paying?: string[] }) {
    const replies = TalkFocus.simple(all).filter(c => !TalkFocus.orders.has(c.does ?? ''));
    const answers = replies.filter(c => c.answer);
    const services = replies.filter(c => !c.answer && TalkFocus.service(c));
    // (What is told of the lands beyond is one question already, the engine's: NewsFold.)
    const said = replies.filter(c => !c.answer && !services.includes(c));
    // What is refused (a try spent, a way barred: "Orsik will not serve you") goes with what was asked: it had held a
    // conversation's second place beside topics that could be taken (the owner's play, 17 November).
    const spent = said.filter(c => at.asked.includes(c.id) || /_again(\(|$)/.test(c.command ?? '') || !!c.disabled);
    const fresh = said.filter(c => !spent.includes(c)), heard = new Set(at.heard ?? []);
    // What pays the company first: someone marked as having something for it says what (see Owed).
    const led = [...fresh.filter(c => TalkFocus.pays(c, at.paying)), ...at.led ? fresh.filter(c => c.command === at.led
      || c.id === at.led || !!c.children?.some(k => k.command === at.led)) : [],
    // What the glance found in them, that their likeness is drawn for (see Promoted.inside): never under the fold.
    ...fresh.filter(c => !!at.marked?.some(m => c.command === m || !!c.children?.some(k => k.command === m))),
    ...fresh.filter(c => TalkFocus.weighty(c, at.weighty))].filter((c, i, all) => all.indexOf(c) === i);
    // New since the last thing said: not offered then (a group, if none of what it holds was).
    const opened = at.heard ? fresh.filter(c => !heard.has(c.id) && !c.children?.some(k => heard.has(k.id))
      && !led.includes(c)) : [];
    const ranked = [...led, ...opened, ...fresh.filter(c => !led.includes(c) && !opened.includes(c))];
    // A short list is shown whole, one flat list of what can be said; only a long one keeps its few and a fold (the
    // owner, 15 November: no cluster to open to find the rest; hearsay is one question, NewsFold, so lists are short).
    const most = Math.max(1, TalkFocus.most - (answers.length ? 1 : 0));
    const room = ranked.length <= TalkFocus.flat ? ranked.length : most;
    // What the last answer opened is among the few, but in its written place, after what is led: put first, it had
    // moved every other topic down after each question (round 6, the register's FH-16).
    const few = ranked.slice(0, room), first = few.filter(c => led.includes(c));
    const salient = [...first, ...said.filter(c => few.includes(c) && !first.includes(c))];
    return { answers, salient, more: [...ranked.slice(room), ...spent], services,
      opened: new Set(opened.map(c => c.id)) };
  }
  // A trader's services parted: what the company carries that they would buy, first, and the rest (a bed, care): below
  // six wares and the fold, the sale a trader had promised ("bring me what the old folk buried") was not found for an
  // hour (round 5).
  static parted(services: Choice[]): { sales: Choice[]; rest: Choice[] } {
    // By what is done (sell, sell_valuable, sell_ware), not by the words; a treasure shown to a dealer without the coin
    // for it (appraise, appraise_beyond) is among them, where its sale will be (UI-13).
    const sales = services.filter(c => !!c.does && /^(sell|appraise)(_|$)/.test(c.does));
    return { sales, rest: services.filter(c => !sales.includes(c)) };
  }
  // Whether saying it pays the company (see Owed).
  static pays(c: Choice, paying?: string[]): boolean {
    return !!c.command && !!paying?.includes(c.command.replace(/\(.*$/, ''));
  }
  // What the company has come to say or to settle with them, before what they might tell it (see TalkWeight): news it
  // brings (the rats' report to Beak, fifth under Something else in the second fresh playtest of 7 November), the debt
  // paid, asking someone to come along, being told where something is; and taking on one looking for work. By what
  // saying it does, never by its words: "Tell …" and "Pay …" had been read off the labels (M21's PL-15).
  static weighty(c: Choice, weighty: readonly string[] = []): boolean {
    return c.does === 'recruit' || weighty.includes(c.command ?? '') || !!c.children?.some(k => weighty.includes(k.command ?? ''));
  }
  // Had of them for coin or work: by what it does, or a group of such (a lesson in each skill).
  private static service(c: Choice): boolean {
    return TalkFocus.services.has(c.does ?? '') || (!!c.children?.length && c.children.every(k => TalkFocus.service(k)));
  }
}
