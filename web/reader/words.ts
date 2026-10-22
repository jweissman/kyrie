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
    'study', 'sneak', 'slip', 'risk', 'swim', 'wade', 'cross', 'dig', 'unlock', 'lock', 'cut', 'free', 'warn']);
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
  static intent(text: string): string {
    const [what, at] = text.split(' → ');
    const act = what!.charAt(0).toLowerCase() + what!.slice(1);
    return at ? `${act}, at ${at}` : act;
  }
  // The subject of a person or thing named with what they are: "Wren, ferry-keeper" is Wren.
  static short(name: string): string { return name.split(', ')[0]!; }
}
