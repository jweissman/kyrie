// Names and pronouns in a line, shared by generated world writing and the player's narration.
export interface Speaking {
  actor?: string; target?: string; pronoun?: string; place?: string;
  values?: Record<string, string>;
  many?: boolean;
}

export class VoiceWords {
  static render(text: string, s: Speaking): string {
    const words = this.pronouns[s.pronoun ?? 'they'] ?? this.pronouns.they!;
    const named = s.many === undefined ? text : VoiceWords.agreeing(text, s.many);
    return named.replace(/\{(\w+)\}/g, (all, key: string) => {
      const lower = key.toLowerCase(), upper = key !== lower;
      const word = words[lower as keyof typeof words];
      const value = lower === 'actor' ? s.actor : lower === 'target' ? s.target : lower === 'place' ? s.place
        : s.values?.[lower] ?? (typeof word === 'string' ? word : undefined);
      if (value === undefined) { return all; }
      return upper ? value.charAt(0).toUpperCase() + value.slice(1) : value;
    }).replace(/\[([^|\]]*)\|([^\]]*)\]/g, (_, plural: string, singular: string) => words.plural ? plural : singular);
  }
  static agreeing(text: string, many: boolean): string {
    let subject: 'actor' | 'pronoun' = 'pronoun';
    return text.replace(/\{(\w+)\}|\[([^|\]]*)\|([^\]]*)\](?=( \{[Aa]ctor\})?)/g, (all: string, ...m: unknown[]) => {
      const [key, plural, singular, before] = m as (string | undefined)[];
      if (key !== undefined) {
        if (/^actor$/i.test(key)) { subject = 'actor'; } else if (/^they$/i.test(key)) { subject = 'pronoun'; }
        return all;
      }
      return before || subject === 'actor' ? many ? plural! : singular! : all;
    });
  }
  static readonly pronouns: Record<string, { they: string; them: string; their: string; theirs: string;
    themself: string; plural: boolean }> = {
      they: { they: 'they', them: 'them', their: 'their', theirs: 'theirs', themself: 'themself', plural: true },
      he: { they: 'he', them: 'him', their: 'his', theirs: 'his', themself: 'himself', plural: false },
      she: { they: 'she', them: 'her', their: 'her', theirs: 'hers', themself: 'herself', plural: false },
      it: { they: 'it', them: 'it', their: 'its', theirs: 'its', themself: 'itself', plural: false },
    };
}
