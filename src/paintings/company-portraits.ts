import portraits from '../../data/paintings/pcs.json';
import folk from '../../data/generation/scenes/folk.json';
import { Canon } from '../canon/canon';
import { Likeness } from './likeness';

export type Presentation = 'man' | 'woman';
// One portrait of a player character, as recorded by looking at it (data/paintings/pcs.json): what it shows, not
// what its sheet was labelled.
export interface PcPortrait { id: string; class: string; ancestry: string; presentation: Presentation; usable: boolean;
  file: string; medium: string }
// Whom a portrait is wanted for: their calling, people and background, how they present where anything says, and a
// key that is theirs alone.
export interface Sitting { classId?: string; raceId?: string; backgroundId?: string; presentation?: Presentation;
  key: string }
// A portrait as the page shows it: small on a fighter's card, medium on the company's page.
export interface Face { id: string; src: string; medium: string }

// The portrait of a member of the company: one of the paintings of player characters (data/paintings/pcs.json), of
// their calling, their people and their presentation; one of no calling painted as the aristocrat or the commoner
// their background makes them. The same member has the same portrait in every save, since it is drawn from who they
// are and nothing else. Where nothing painted fits (a halfling, a calling the paintings have no column for, a
// portrait refused on looking) there is none, and the page shows the first letter of their name instead.
export class CompanyPortraits {
  static readonly all = (portraits as { portraits: PcPortrait[] }).portraits;
  static readonly usable = this.all.filter(p => p.usable);
  // Backgrounds of birth or the court, painted as the aristocrat when there is no calling to paint.
  static readonly courtly = new Set(['aristocrat', 'noble', 'royalty', 'courtier']);
  // The general types, painted for those of no calling and never for a calling's own.
  static readonly general = new Set(['aristocrat', 'commoner']);
  // A given name the country's folk give only to men or only to women (data/generation/scenes/folk.json).
  static readonly names = this.given();
  // A member of the company as the game holds them, with what the world says of them: their pronouns (on the entity
  // that stands for them) and the likeness chosen for them at creation, where either is said.
  static member(m: { id: string; name: string; raceId: string; classId?: string; backgroundId?: string },
    said: { pronoun?: string; likeness?: string }): Face | undefined {
    const presentation = this.presentation({ ...said, name: m.name });
    return this.of({ ...m.classId ? { classId: m.classId } : {}, raceId: m.raceId,
      ...m.backgroundId ? { backgroundId: m.backgroundId } : {}, ...presentation ? { presentation } : {},
      key: `${m.name}|${m.id}` });
  }
  static of(who: Sitting): Face | undefined {
    const kind = this.kind(who), ancestry = who.raceId;
    if (!kind || !ancestry) { return undefined; }
    // Unsaid, how they present is drawn from who they are: the same each time, and the other if it is not painted.
    const drawn: Presentation[] = this.hash(who.key) % 2 ? ['woman', 'man'] : ['man', 'woman'];
    for (const as of who.presentation ? [who.presentation] : drawn) {
      const fit = this.usable.filter(p => p.class === kind && p.ancestry === ancestry && p.presentation === as);
      const chosen = fit[this.hash(`${who.key}:${as}`) % Math.max(1, fit.length)];
      if (chosen) { return { id: chosen.id, src: chosen.file, medium: chosen.medium }; }
    }
    return undefined;
  }
  // What they are painted as: their calling, where the paintings have it; with none, or a commoner's, the aristocrat
  // if they were born or bred to the court and the commoner if not.
  static kind(who: Pick<Sitting, 'classId' | 'backgroundId'>): string | undefined {
    const calling = who.classId ? Canon.resolve('classes', who.classId) : 'commoner';
    if (calling !== 'commoner') {
      return !this.general.has(calling) && this.usable.some(p => p.class === calling) ? calling : undefined;
    }
    return this.courtly.has(who.backgroundId ?? '') ? 'aristocrat' : 'commoner';
  }
  // How someone presents, from what the world says of them: their pronouns; else the sitter of a likeness chosen for
  // them at creation; else a given name only men or only women are given. Nothing said, nothing assumed.
  static presentation(said: { pronoun?: string; likeness?: string; name?: string }): Presentation | undefined {
    const pronoun = /pron_(he|she)$/.exec(said.pronoun ?? '')?.[1];
    if (pronoun) { return pronoun === 'he' ? 'man' : 'woman'; }
    const sitter = said.likeness ? Likeness.sitter(said.likeness)?.sex : undefined;
    return sitter ?? this.names.get((said.name ?? '').split(' ')[0]!);
  }
  private static given(): Map<string, Presentation> {
    const lists = Object.values((folk as unknown as { given: Record<string, Record<string, string[]>> }).given);
    const seen = new Map<string, Set<Presentation>>();
    for (const list of lists) {
      for (const [pronoun, as] of [['he', 'man'], ['she', 'woman']] as const) {
        for (const name of list[pronoun] ?? []) { seen.set(name, (seen.get(name) ?? new Set()).add(as)); }
      }
    }
    return new Map([...seen].filter(([, as]) => as.size === 1).map(([name, as]) => [name, [...as][0]!]));
  }
  private static hash(text: string): number {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h = Math.imul(h ^ text.charCodeAt(i), 16777619); }
    // Stirred once more, so that the lowest bit says something of the whole name (alone it is the parity of the
    // letters: "Member 3|party_3" and every other such key drew alike).
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13;
    return h >>> 0;
  }
}
