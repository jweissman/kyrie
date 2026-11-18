import { Indicator, type Icon } from './indicator';
import type { Tone } from './emphasis';
import type { Aspect, Glance } from './glance-types';

// What a semantic indicator is made of, and nothing else (the owner's trust contracts, 18 November: "no semantic pip
// can be constructed without an authoritative witness"). A witness is issued here alone, from the glance the engine
// projected for this world, this place, this knowledge and this aim followed: an act it leads with or a lens holds
// (direct: it can be done through the control that shows it), a likeness it draws, a way or journey the followed aim
// goes by, or something perceived off along a way (directional: a justified step, its distance kept). An indicator
// (Attested) is made only of witnesses, its tone by the one precedence every client reads (Indicator). Where no
// witness stands, there is no indicator; and a page cannot make one of a colour of its own: Pip.View and ChoiceRow
// take an Attested, never a fill.
declare const issued: unique symbol;
export type WitnessKind = 'direct' | 'directional';
export interface Witness {
  // The choice, subject, way or journey it stands for, as the glance names it.
  readonly id: string; readonly aspects: readonly Aspect[]; readonly kind: WitnessKind;
  // How far off along a way it is perceived (directional only): kept, never rounded to "here".
  readonly far?: number;
  readonly [issued]: true;
}
export interface Attested {
  readonly tone?: Tone; readonly icons: readonly Icon[]; readonly words: string; readonly companion: boolean;
  // Perceived only, off along a way: drawn faint.
  readonly faint: boolean;
  readonly witnesses: readonly Witness[];
  readonly [issued]: true;
}
type Projected = Pick<Glance, 'acts' | 'lenses' | 'likenesses' | 'sensed' | 'following' | 'lead'>;

export class Attest {
  // Read once for each glance (a glance is drawn again whenever the world, what the company knows or the aim followed
  // changes): what it attests, by id.
  private static readonly issued = new WeakMap<object, Map<string, Witness>>();
  private static make(id: string, aspects: readonly Aspect[], kind: WitnessKind, far?: number): Witness {
    return { id, aspects: [...new Set(aspects)], kind, ...far !== undefined ? { far } : {} } as unknown as Witness;
  }
  static index(g: Projected): Map<string, Witness> {
    const kept = this.issued.get(g);
    if (kept) { return kept; }
    const out = new Map<string, Witness>();
    const add = this.adder(out);
    for (const a of [...g.acts, ...Object.values(g.lenses).flatMap(l => l.promoted)]) {
      add(this.make(a.choice, a.aspects, 'direct'));
      // An opener (a talk) attests each act inside it that it is led for, and its subject is attested by them.
      for (const i of a.inside ?? []) { add(this.make(i.command, i.aspects, 'direct')); }
      if (a.subject) { add(this.make(`subject:${a.subject}`, a.aspects, 'direct')); }
    }
    for (const [who, l] of Object.entries(g.likenesses ?? {})) { add(this.make(`subject:${who}`, l.aspects, 'direct')); }
    // The followed aim's ways and journeys: a step toward it, gold, never more than that.
    for (const id of g.following ?? []) { add(this.make(id, ['undertaking'], 'directional')); }
    for (const s of g.sensed ?? []) { add(this.make(`sensed:${s.to}`, [s.aspect], 'directional', s.far)); }
    this.issued.set(g, out);
    return out;
  }
  // One witness an id: two for one id are one, its aspects both's, direct if either is.
  private static adder(out: Map<string, Witness>): (w: Witness) => void {
    return Attest.put.bind(Attest, out);
  }
  private static put(out: Map<string, Witness>, w: Witness): void {
    const had = out.get(w.id);
    out.set(w.id, had ? this.make(w.id, [...had.aspects, ...w.aspects], had.kind === 'direct' ? 'direct' : w.kind,
      had.far ?? w.far) : w);
  }
  // The witness the glance gives for an id, or none.
  static witness(g: Projected | undefined, id: string | undefined): Witness | undefined {
    return g && id ? this.index(g).get(id) : undefined;
  }
  static subject(g: Projected | undefined, who: string | undefined): Witness | undefined {
    return who ? this.witness(g, `subject:${who}`) : undefined;
  }
  static sensed(g: Projected | undefined, to: string | undefined): Witness | undefined {
    return to ? this.witness(g, `sensed:${to}`) : undefined;
  }
  // The indicator these witnesses make: none where there is none, or nothing among them is drawn (a need, the way
  // back: no aspect). gilded: whether gold is shown at all (the player's Guidance).
  static of(witnesses: readonly (Witness | undefined)[], gilded: boolean): Attested | undefined {
    const ws = witnesses.filter((w): w is Witness => !!w);
    const direct = ws.filter(w => w.kind === 'direct'), aspects = [...new Set(ws.flatMap(w => w.aspects))];
    const shown = Indicator.of({ aspects, gilded }), companion = aspects.includes('companionship');
    if (!shown.tone && !companion) { return undefined; }
    // Faint only where all it stands on is perceived off along a way.
    const faint = !direct.length && ws.every(w => w.far !== undefined);
    return { ...shown.tone ? { tone: shown.tone } : {}, icons: shown.icons, companion, faint, witnesses: ws,
      words: Indicator.words(aspects, gilded).join(', ') } as unknown as Attested;
  }
  // Several controls' indicators as one (a lens over the rows it opens): the union of their witnesses.
  static join(marks: readonly (Attested | undefined)[], gilded: boolean): Attested | undefined {
    return this.of(marks.flatMap(m => m?.witnesses ?? []), gilded);
  }
  // Why an id has no indicator, for development and the contracts' tests.
  static why(g: Projected | undefined, id: string): string {
    if (!g) { return 'no glance'; }
    const w = this.index(g).get(id);
    return !w ? `${id}: the glance attests nothing by this id` : !Indicator.of({ aspects: w.aspects }).tone
      ? `${id}: attested, with no aspect drawn (${w.aspects.join(', ') || 'none'})` : `${id}: attested`;
  }
}
