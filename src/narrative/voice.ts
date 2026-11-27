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
import feat from '../../data/voice/feat.json';
import day from '../../data/voice/day.json';
import answer from '../../data/voice/answer.json';
import { VoiceWords, type Speaking } from '../shared/voice-words';

export type { Speaking } from '../shared/voice-words';

// One line of a voice table: what is said or told, in which circumstances (each key of when must match the moment's
// context: one value, or any of several), how often against the others, and where it came from.
export interface VoiceLine {
  id: string; text: string; when?: Record<string, string | string[]>; weight?: number;
  source?: { kyr?: true; orsino?: string; notes?: string };
}
export interface VoiceTable { about: string; kinds: string[]; lines: VoiceLine[] }

// The voice tables (data/voice): for each kind of happening, the lines it may be told in, by the circumstances that
// call for each. Editors change the tables; bin/kyrie voice shows every line in the moments it would be chosen in.
export class Voice {
  static readonly tables: VoiceTable[] = [join, part, greet, pet, turn, thank, combat, journey, address, farewell,
    feat, day, answer] as VoiceTable[];
  // What is told in a place of its own, not among the lines told after a command: a fight's barks with its blows (see
  // CombatTelling.barks), the day's turn as what a wait came to (see Days), a journey as it goes (see Journeys), the
  // world's own words as it said them (see RuleWords), an answer as what was asked (see Answers).
  static apart(kind: string): boolean { return ['bark', 'rule'].includes(kind) || /^(day|journey|answer)\b/.test(kind); }
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
  // Whether a line can be said only of many: it speaks of one of them ("'We want no trouble,' one of {them} says"),
  // which of a lone grave-robber had been "one of him says" (round 12, B: T24-19).
  static ofMany(line: VoiceLine): boolean { return /\bone of \{(them|actor|Actor)\}/.test(line.text); }
  // Whether a line fits the speakers as they are: of many, what agrees with many; of one (or not known to be many),
  // nothing said of one of them.
  static fits(line: VoiceLine, many?: boolean): boolean { return many ? this.agrees(line) : !this.ofMany(line); }
  static tiers(kind: string, context: Record<string, string>): VoiceLine[][] {
    const lines = (this.table(kind)?.lines ?? []).filter(l => l.id.startsWith(`${kind}.`) || this.table(kind)?.kinds.length === 1)
      .filter(l => this.matches(l, context));
    const sizes = [...new Set(lines.map(l => this.closeness(l)))].sort((a, b) => b - a);
    return sizes.map(n => lines.filter(l => this.closeness(l) === n));
  }
  static readonly weights: Record<string, number> = { bond: 2, temper: 3, mood: 3, owing: 3 };
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
    return VoiceWords.render(text, s);
  }
  // A verb agrees with the speaker, one or many, where the speaker is its subject, not with the pronoun said of them
  // ("'You,' say the woman in black": the cold evaluation): next to the name, before it or after it, and after it in
  // the same line until {they} takes over as the subject. Only the verb beside the name had agreed, so that "{Actor}
  // [wince|winces], and still [look|looks] round" was told "Wenna winces, and still look round" (cold play 2, CL-11).
  static agreeing(text: string, many: boolean): string {
    return VoiceWords.agreeing(text, many);
  }
  static readonly pronouns = VoiceWords.pronouns;
}
