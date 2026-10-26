import { FictionalTime } from '../../src/campaign/fictional-time';
import { Typography } from '../../src/presentation/typography';

// How the page says small things: the time of day, a choice echoed as what the company did, how hurt someone looks.
export class Words {
  static readonly ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth',
    'tenth', 'eleventh', 'twelfth'];
  static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  // "Morning, the first day"; the exact hour is there for whoever looks closer.
  static daytime(elapsed: number): string {
    const day = Number(/^Day (\d+)/.exec(FictionalTime.at(elapsed))?.[1] ?? 1);
    return `${this.upper(FictionalTime.part(elapsed))}, the ${this.ordinals[day - 1] ?? `${day}th`} day`;
  }
  static readonly verbs = new Set(['begin', 'ask', 'tell', 'pay', 'buy', 'sell', 'take', 'give', 'read', 'search', 'wait',
    'look', 'open', 'close', 'shut', 'pick', 'wrench', 'attack', 'scatter', 'approach', 'toss', 'show', 'address',
    'light', 'use', 'equip', 'make', 'rest', 'speak', 'follow', 'climb', 'examine', 'puzzle', 'turn', 'pin', 'lash',
    'brace', 'set', 'return', 'enter', 'leave', 'hide', 'bribe', 'offer', 'call', 'go', 'walk', 'lift', 'drop',
    'break', 'burn', 'listen', 'pry', 'push', 'prod', 'sleep', 'camp', 'hand', 'put', 'hire', 'eat', 'drink', 'pray',
    'study', 'sneak', 'slip', 'risk', 'swim', 'wade', 'cross', 'dig', 'unlock', 'lock', 'cut', 'free', 'warn',
    'collect', 'get', 'untie', 'tie', 'stake', 'heave', 'fit', 'lever', 'draw', 'ring', 'bury', 'claim', 'try', 'mend',
    'raise', 'lower', 'unbar', 'fill', 'cover', 'uncover', 'strike', 'cast', 'prepare', 'learn', 'advance']);
  // A choice as the page echoes it: "Ask Wren what is wrong" is "You ask Wren what is wrong."
  static echo(label: string): string {
    const first = label.split(/\s/)[0]!.toLowerCase();
    if (!this.verbs.has(first) || label.includes(':')) { return label; }
    const said = `You ${label.charAt(0).toLowerCase()}${label.slice(1)}`;
    return /[.!?]$/.test(said) ? said : `${said}.`;
  }
  // How hurt someone looks, which is what the company can see at a glance.
  static hurt(hp: number, max: number): string {
    if (hp <= 0) { return 'down'; }
    const r = max ? hp / max : 1;
    return r >= 1 ? 'unhurt' : r > 0.6 ? 'hurt' : r > 0.3 ? 'badly hurt' : 'near death';
  }
  // "Rending bite → Elen" is "rending bite at Elen".
  // What a foe means to do, as it would be said: "Sweeping Strike → Wenna" is "sweeping strike on Wenna".
  static intent(text: string): string {
    const [what, at] = text.split(' → ');
    const act = what!.toLowerCase();
    return at ? `${act} on ${at}` : act;
  }
  // Whether a line of what happened says the act again ("Hild lights a torch." after "You light a torch."): its verb
  // among its first words, and the two after it the same. Then the echo of it is not said as well. An act told in
  // another verb counts as its own ("You collect the rod for Aldith." and "Aldith takes the rod.").
  static readonly told: Record<string, string> = { collect: 'take' };
  static restates(echo: string, line?: string): boolean {
    const [you, verb, ...rest] = this.words(echo), said = this.words(line ?? '');
    if (you !== 'you' || !verb) { return false; }
    const forms = [verb, this.told[verb] ?? verb].flatMap(v => [v, `${v}s`, `${v}es`, v.replace(/y$/, 'ies')]);
    const at = said.slice(0, 4).findIndex(w => forms.includes(w));
    return at >= 0 && rest.slice(0, 2).every((w, i) => said[at + 1 + i] === w);
  }
  private static words(t: string): string[] { return t.toLowerCase().replace(/[.!?,;:’']/g, '').split(/\s+/); }
  // The lines not told already in these paragraphs, whole or within one: what a close look found, once it is part of
  // how a thing is told, is not told again as what came of looking (the Bushweald play read the cart's bed twice).
  static untold<T extends { text: string }>(lines: T[], told: string[]): T[] {
    const all = Typography.curl(told.join(' '));
    return lines.filter(l => !all.includes(Typography.curl(l.text)));
  }
  // What the player chose, as the last of the labels it was chosen by ("Speak with Eamon › Ask about the road").
  static lastSaid(said: string): string { return said.split(' › ').at(-1)!; }
  // "a hunter", "an eel-catcher".
  static article(noun: string): string { return /^(a|an|the) /i.test(noun) ? noun : `${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`; }
  // A span of the world's time, as a traveller reckons it: "40 minutes", "about 2 hours", "about 6½ hours".
  static span(minutes: number): string {
    if (minutes < 60) { return `${minutes} minutes`; }
    const halves = Math.round(minutes / 30), hours = Math.floor(halves / 2), half = halves % 2 ? '½' : '';
    return `about ${hours}${half} hour${hours === 1 && !half ? '' : 's'}`;
  }
  // How a choice is shown: a heading of tries with one try under it is that try ("Examine — Look closely" is "Look
  // closely"; "look at the iron grate — Look closely" is "Look closely at the iron grate"). Its label stays as it is
  // for those who name it in a journey.
  static shown(label: string): string {
    const lone = /^Examine — (.+)$/.exec(label)?.[1];
    if (lone) { return lone; }
    const at = /^[Ll]ook at (.+) — Look closely$/.exec(label)?.[1];
    return at ? `Look closely at ${at}` : label;
  }
  // A thing without its article, as a list names it: "a torch" is "torch".
  static bare(name: string): string { return name.replace(/^(a|an|the|some) /i, ''); }
  // How many of a thing, in words: "three torches", "two sacks of bell-teeth".
  static many(n: number, noun: string): string {
    const [head, ...of] = noun.split(' of '), plural = /(s|x|z|ch|sh)$/.test(head!) ? `${head}es`
      : /[^aeiou]y$/.test(head!) ? `${head!.slice(0, -1)}ies` : `${head}s`;
    const said = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][n];
    return `${said ?? n} ${[plural, ...of].join(' of ')}`;
  }
  // The subject of a person or thing named with what they are: "Wren, ferry-keeper" is Wren.
  static short(name: string): string { return name.split(', ')[0]!; }
  // Choices that differ in one part only (four words to press on a casket) are said once, the words apart: what they
  // share before and after, and each one's own part; nothing when they have too little in common to be worth it.
  static shared(labels: string[]): { lead: string; tail: string; parts: string[] } | undefined {
    if (labels.length < 3) { return undefined; }
    const words = labels.map(l => l.split(' ')), n = Math.min(...words.map(w => w.length));
    let a = 0, b = 0;
    while (a < n - 1 && words.every(w => w[a] === words[0]![a])) { a++; }
    while (b < n - 1 - a && words.every(w => w[w.length - 1 - b] === words[0]![words[0]!.length - 1 - b])) { b++; }
    const lead = words[0]!.slice(0, a).join(' '), tail = b ? words[0]!.slice(-b).join(' ') : '';
    if (lead.length + tail.length < 8) { return undefined; }
    return { lead, tail, parts: words.map(w => w.slice(a, w.length - b).join(' ')) };
  }
}
