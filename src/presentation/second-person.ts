// The protagonist's own acts, told to them: one who has come alone is "you", and "Ilse pays Dain, and takes a torch."
// is "You pay Dain, and take a torch." (the shared rules tell what a member does by their name, as a company's member
// is told; Mission 17's fresh play heard its protagonist bought for in the third person). Only a sentence that begins
// with their name is turned, its first verb and any verb joined to it by "and" with it, and only a verb known to be
// one: what is said of anyone else, and anything not plainly a verb ("and his son"), stands as it was.
export class SecondPerson {
  static readonly irregular: Record<string, string> = { is: 'are', has: 'have', does: 'do', goes: 'go', was: 'were' };
  static readonly verbs = new Set(['pay', 'take', 'buy', 'sell', 'give', 'put', 'ready', 'light', 'eat', 'drink',
    'rest', 'sleep', 'wait', 'find', 'pick', 'open', 'close', 'shut', 'lift', 'drop', 'carry', 'bring', 'read',
    'search', 'look', 'listen', 'climb', 'cross', 'wade', 'swim', 'go', 'come', 'walk', 'set', 'tie', 'untie', 'cut',
    'fill', 'pour', 'mend', 'bind', 'tend', 'learn', 'study', 'pray', 'prepare', 'cast', 'strike', 'hit', 'miss',
    'make', 'fit', 'pull', 'push', 'turn', 'try', 'hand', 'show', 'tell', 'ask', 'thank', 'wear', 'equip', 'stow',
    'pack', 'unpack', 'gather', 'collect', 'keep', 'leave', 'stand', 'sit', 'kneel', 'hold', 'raise', 'lower', 'reach',
    'feel', 'see', 'hear', 'notice', 'watch', 'wake', 'camp', 'shelter', 'spend', 'count', 'trade', 'hire', 'join',
    'follow', 'lead', 'free', 'help', 'warn', 'call', 'follow', 'return', 'enter', 'step', 'stop', 'start', 'begin',
    'finish', 'win', 'lose', 'fall', 'rise', 'get', 'grow', 'know', 'remember', 'forget', 'have', 'do', 'be', 'meet',
    'greet', 'answer', 'agree', 'refuse', 'offer', 'promise', 'lend', 'borrow', 'owe', 'earn', 'buy', 'barter',
    'run', 'flee', 'hide', 'sneak', 'creep', 'crawl', 'jump', 'leap', 'throw', 'catch', 'draw', 'aim', 'shoot',
    'parry', 'dodge', 'block', 'guard', 'brace', 'heal', 'bandage', 'cure', 'tie', 'knot', 'lash', 'dig', 'bury',
    'break', 'smash', 'force', 'pry', 'unlock', 'lock', 'bar', 'unbar', 'kindle', 'burn', 'douse', 'quench', 'cook',
    'share', 'sing', 'play', 'dance', 'laugh', 'smile', 'nod', 'shrug', 'sigh', 'wave', 'point', 'beckon', 'whisper',
    'shout', 'speak', 'say', 'write', 'copy', 'sign', 'seal', 'mark', 'note', 'map', 'track', 'scout', 'stalk']);
  static turn(text: string, name: string): string {
    if (!name) { return text; }
    return text.split(/(?<=[.!?])\s+/).map(s => this.sentence(s, name)).join(' ');
  }
  private static sentence(s: string, name: string): string {
    if (!s.startsWith(`${name} `)) { return s; }
    const rest = s.slice(name.length + 1), first = /^(\w+)/.exec(rest)?.[1];
    const verb = first && this.base(first);
    if (!verb) { return s; }
    const after = rest.slice(first.length).replace(/(,? and )(\w+)\b/g, (all, and: string, v: string) => {
      const b = this.base(v);
      return b ? `${and}${b}` : all;
    });
    return `You ${verb}${after}`;
  }
  // A verb of the third person singular, as its first person has it, if it is one.
  private static base(v: string): string | undefined {
    const b = this.irregular[v] ?? (/ies$/.test(v) ? v.replace(/ies$/, 'y') : /(sh|ch|ss|x|z|o)es$/.test(v)
      ? v.replace(/es$/, '') : /[^s]s$/.test(v) ? v.slice(0, -1) : undefined);
    return b && (this.verbs.has(b) || Object.values(this.irregular).includes(b)) ? b : undefined;
  }
}
