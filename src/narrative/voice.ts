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
  values?: Record<string, string> }

// The voice tables (data/voice): for each kind of happening, the lines it may be told in, by the circumstances that
// call for each. Editors change the tables; bin/voice.ts shows every line in the moments it would be chosen in.
export class Voice {
  static readonly tables: VoiceTable[] = [join, part, greet, pet, turn, thank, combat, journey, address, farewell] as
    VoiceTable[];
  private static readonly byKind = new Map(Voice.tables.flatMap(t => t.kinds.map(k => [k, t] as const)));
  static table(kind: string): VoiceTable | undefined { return this.byKind.get(kind); }
  // The lines of a kind that fit a moment: every key a line names must be one of the moment's values for it; a line
  // that names more of the moment is the better fit, and is chosen over those that fit only loosely.
  static fitting(kind: string, context: Record<string, string>): VoiceLine[] {
    const lines = (this.table(kind)?.lines ?? []).filter(l => l.id.startsWith(`${kind}.`) || this.table(kind)?.kinds.length === 1)
      .filter(l => this.matches(l, context));
    const best = Math.max(0, ...lines.map(l => Object.keys(l.when ?? {}).length));
    return lines.filter(l => Object.keys(l.when ?? {}).length === best);
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
    return text.replace(/\{(\w+)\}/g, (all, key: string) => {
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
