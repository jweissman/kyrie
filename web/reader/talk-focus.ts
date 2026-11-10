import { AimAsks } from '../../src/ui/aim-asks';
import type { Choice } from '../../src/ui/choice-list';

// What is said in a conversation, as attention holds it (the owner, 5 November: an innkeeper had stood with
// twenty-five things to talk about at once): an answer owed first; then three things to say at most, the salient ones
// (what the page leads this person with, what an aim of the company's asks of them, what the last answer opened, then
// what has not been asked, as the author
// ordered it); the rest a touch away, not yet asked before those that have been; and what is had of them for coin or
// work (a bed, care, a song for supper, a lesson, a sale) set apart for trading, not among what is said.
export class TalkFocus {
  static readonly most = 3;
  // The kinds of act had of someone for coin or work (Choice.does, never the command's words).
  static readonly services = new Set(['take_lodging', 'take_lodging_guest', 'take_healing', 'work_keep', 'sing_supper',
    'sell', 'sell_valuable', 'sell_ware', 'buy_goods', 'train_member', 'learn_skill', 'learn_spell', 'learn_reward']);
  static of(replies: Choice[],
    at: { led?: string; heard?: string[]; asked: string[]; aims?: string[]; paying?: string[] }) {
    const answers = replies.filter(c => c.answer);
    const services = replies.filter(c => !c.answer && TalkFocus.service(c));
    const said = TalkFocus.beyond(replies.filter(c => !c.answer && !services.includes(c)));
    const spent = said.filter(c => at.asked.includes(c.id) || /_again(\(|$)/.test(c.command ?? ''));
    const fresh = said.filter(c => !spent.includes(c)), heard = new Set(at.heard ?? []);
    // What pays the company first: someone marked as having something for it says what (see Owed).
    const led = [...fresh.filter(c => TalkFocus.pays(c, at.paying)), ...at.led ? fresh.filter(c => c.command === at.led
      || c.id === at.led || !!c.children?.some(k => k.command === at.led)) : [],
    ...fresh.filter(c => TalkFocus.aimed(c, at.aims ?? [])),
    ...fresh.filter(c => TalkFocus.weighty(c))].filter((c, i, all) => all.indexOf(c) === i);
    // New since the last thing said: not offered then (a group, if none of what it holds was).
    const opened = at.heard ? fresh.filter(c => !heard.has(c.id) && !c.children?.some(k => heard.has(k.id))
      && !led.includes(c)) : [];
    const ranked = [...led, ...opened, ...fresh.filter(c => !led.includes(c) && !opened.includes(c))];
    const room = Math.max(1, TalkFocus.most - (answers.length ? 1 : 0));
    return { answers, salient: ranked.slice(0, room), more: [...ranked.slice(room), ...spent], services,
      opened: new Set(opened.map(c => c.id)) };
  }
  // Whether saying it pays the company (see Owed).
  static pays(c: Choice, paying?: string[]): boolean {
    return !!c.command && !!paying?.includes(c.command.replace(/\(.*$/, ''));
  }
  // What the aim followed asks to be asked of them (see AimAsks).
  static aimed(c: Choice, aims: readonly string[]): boolean { return AimAsks.asks(c.label, aims); }
  // What the company has come to say or to settle with them, before what they might tell it: news it brings ("Tell
  // Beak the rats under the corn-store are dead": a job done, reported fifth, under Something else, in the second
  // fresh playtest of 7 November), and taking them on, when they are looking for work (Traubon's "Would you come
  // along?" had stood seventh, though the innkeeper had just pointed him out), and what is out in the country round,
  // the way to the old places near a town for a company that wants something to go to (RegionRumours). And settling
  // up, and asking someone to come along: "Pay Tuck what you owe", the debt's end, and "Ask whether he would come
  // along" had both stood under Something else (both cold players of Mission 20's first round).
  private static weighty(c: Choice): boolean {
    return /^(Tell|Pay) /.test(c.label) || c.does === 'recruit' || / what is out in the country round$/.test(c.label)
      || / would come along\??$/.test(c.label);
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
    return TalkFocus.services.has(c.does ?? '') || (!!c.children?.length && c.children.every(k => TalkFocus.service(k)));
  }
}
