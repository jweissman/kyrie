import { FictionalTime } from '../../src/presentation/fictional-time';

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
  static readonly verbs = new Set(['ask', 'tell', 'pay', 'buy', 'sell', 'take', 'give', 'read', 'search', 'wait',
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
  // What the player chose, as the last of the labels it was chosen by ("Speak with Eamon › Ask about the road").
  static lastSaid(said: string): string { return said.split(' › ').at(-1)!; }
  // "a hunter", "an eel-catcher".
  static article(noun: string): string { return /^(a|an|the) /i.test(noun) ? noun : `${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`; }
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
