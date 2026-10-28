import join from '../../data/voice/join.json';
import part from '../../data/voice/part.json';
import greet from '../../data/voice/greet.json';
import pet from '../../data/voice/pet.json';
import turn from '../../data/voice/turn.json';
import thank from '../../data/voice/thank.json';
import combat from '../../data/voice/combat.json';
import journey from '../../data/voice/journey.json';
import address from '../../data/voice/address.json';
import farewell from '../../data/voice/farewell.json';

// One line of a voice table: what is said or told, in which circumstances (each key of when must match the moment's
// context: one value, or any of several), how often against the others, and where it came from.
export interface VoiceLine {
  id: string; text: string; when?: Record<string, string | string[]>; weight?: number;
  source?: { kyr?: true; orsino?: string; notes?: string };
}
export interface VoiceTable { about: string; kinds: string[]; lines: VoiceLine[] }
// What a line is told about: the names, and the words the actor is spoken of in.
export interface Speaking { actor?: string; target?: string; pronoun?: string; place?: string;
  // Any other names a line is filled with ({from}, {to}).
  values?: Record<string, string>;
  // Whether the actor is a band of many (the bats) or one (the reeve, though spoken of as they): a verb that follows
  // the actor's name agrees with that; one that follows {they}, with the pronoun.
  many?: boolean }

// The voice tables (data/voice): for each kind of happening, the lines it may be told in, by the circumstances that
// call for each. Editors change the tables; bin/kyrie voice shows every line in the moments it would be chosen in.
export class Voice {
  static readonly tables: VoiceTable[] = [join, part, greet, pet, turn, thank, combat, journey, address, farewell] as
    VoiceTable[];
  private static readonly byKind = new Map(Voice.tables.flatMap(t => t.kinds.map(k => [k, t] as const)));
  static table(kind: string): VoiceTable | undefined { return this.byKind.get(kind); }
  // The lines of a kind that fit a moment: every key a line names must be one of the moment's values for it; a line
  // that names more of the moment is the better fit, and is chosen over those that fit only loosely (see tiers).
  static fitting(kind: string, context: Record<string, string>): VoiceLine[] {
    return this.tiers(kind, context)[0] ?? [];
  }
  // Every line of a kind that fits a moment, closest fits first: those naming the most of it, then fewer. Who the
  // company is to someone counts for more than anything else a line names: a mother greets her child as a mother,
  // whatever her manner; and a temper (goblins wary of a stranger's light), or how they are now (fretting, grieving),
  // counts for more again.
  // Whether a line can be said of many (the elders) as of one: no verb after the actor's name but one that agrees
  // ("{Actor} [break|breaks] off"), where "{Actor} looks up" is said only of one.
  // Whether a line can be said of many: no verb fixed to one, before them or after ("says {actor}" of the elders).
  static agrees(line: VoiceLine): boolean {
    return !/\{[Aa]ctor\} (?!\[)[a-z]+s\b/.test(line.text)
      && !/(?<![[|])\b(says|asks|calls|shouts) \{[Aa]ctor\}/.test(line.text);
  }
  static tiers(kind: string, context: Record<string, string>): VoiceLine[][] {
    const lines = (this.table(kind)?.lines ?? []).filter(l => l.id.startsWith(`${kind}.`) || this.table(kind)?.kinds.length === 1)
      .filter(l => this.matches(l, context));
    const sizes = [...new Set(lines.map(l => this.closeness(l)))].sort((a, b) => b - a);
    return sizes.map(n => lines.filter(l => this.closeness(l) === n));
  }
  static readonly weights: Record<string, number> = { bond: 2, temper: 3, mood: 3 };
  private static closeness(line: VoiceLine): number {
    return Object.keys(line.when ?? {}).reduce((n, key) => n + (this.weights[key] ?? 1), 0);
  }
  static matches(line: VoiceLine, context: Record<string, string>): boolean {
    return Object.entries(line.when ?? {}).every(([key, want]) => {
      const have = context[key];
      return have !== undefined && (Array.isArray(want) ? want.includes(have) : want === have);
    });
  }
  // A line with its names put in: {actor}, {Actor}, {target}; the actor's words, {they} {them} {their}, and a verb
  // that agrees with them, [walk|walks].
  static render(text: string, s: Speaking): string {
    const words = this.pronouns[s.pronoun ?? 'they'] ?? this.pronouns.they!;
    // A verb next to the speaker's name agrees with the speaker, one or many, before the name or after it, not with
    // the pronoun said of them ("'You,' say the woman in black": the cold evaluation).
    const named = s.many === undefined ? text : text.replace(/(\{[Aa]ctor\} )\[([^|\]]*)\|([^\]]*)\]/g,
      (_, actor: string, plural: string, singular: string) => `${actor}${s.many ? plural : singular}`)
      .replace(/\[([^|\]]*)\|([^\]]*)\]( \{[Aa]ctor\})/g,
        (_, plural: string, singular: string, actor: string) => `${s.many ? plural : singular}${actor}`);
    return named.replace(/\{(\w+)\}/g, (all, key: string) => {
      const lower = key.toLowerCase(), upper = key !== lower;
      const word = words[lower as keyof typeof words];
      const value = lower === 'actor' ? s.actor : lower === 'target' ? s.target : lower === 'place' ? s.place
        : s.values?.[lower] ?? (typeof word === 'string' ? word : undefined);
      if (value === undefined) { return all; }
      return upper ? value.charAt(0).toUpperCase() + value.slice(1) : value;
    }).replace(/\[([^|\]]*)\|([^\]]*)\]/g, (_, plural: string, singular: string) => words.plural ? plural : singular);
  }
  static readonly pronouns: Record<string, { they: string; them: string; their: string; theirs: string;
    themself: string; plural: boolean }> = {
      they: { they: 'they', them: 'them', their: 'their', theirs: 'theirs', themself: 'themself', plural: true },
      he: { they: 'he', them: 'him', their: 'his', theirs: 'his', themself: 'himself', plural: false },
      she: { they: 'she', them: 'her', their: 'her', theirs: 'hers', themself: 'herself', plural: false },
      it: { they: 'it', them: 'it', their: 'its', theirs: 'its', themself: 'itself', plural: false },
    };
}
