import type { Attention } from '../../src/ui/attention';
import type { Choice } from '../../src/ui/choice-list';
import { SceneModel } from '../../src/ui/scene';
import type { Frame } from '../engine/protocol';
import { Moments, type Beat } from './moments';
import { Offers, type Offer } from './offer';

// The recorded journey as the build kept it (see scripts/compositions.ts): every step's choice, and the frames and
// fights of the beats' steps.
export interface Recorded { steps: Record<number, { said: string; id: string }>; frames: Record<number, Frame>;
  fights: Record<number, Frame[]> }
export type Composition = 'a' | 'b' | 'c';
export type Reference = 'notes' | 'company' | 'pack' | 'map';
export interface ProtoState {
  at: number; attention: Attention; open: string[]; focus: number; composition: Composition;
  reference?: Reference; notice?: string; marks: boolean;
}

// The prototype's play: one beat of the record at a time. Attending to someone or something, opening a choice and
// going back are the page's own and work everywhere; doing what the record did next goes on to the next beat; doing
// anything else is said not to be in the record, since no engine runs here.
export class Proto {
  static readonly beats = Moments.beats();
  static beat(s: ProtoState): Beat { return this.beats[s.at]!.beat; }
  static moment(s: ProtoState): number { return this.beats[s.at]!.moment; }
  static frame(r: Recorded, beat: Beat): Frame {
    return beat.fight === undefined ? r.frames[beat.step]! : r.fights[beat.step]![beat.fight]!;
  }
  static offer(r: Recorded, s: ProtoState): Offer {
    return Offers.of(this.frame(r, this.beat(s)), s.attention, new Set(s.open));
  }
  // What the record did next from this beat: its next step's command, or in a fight, letting the company fight on,
  // or, when the fight is over, going on.
  static taken(r: Recorded, beat: Beat): string {
    const frame = this.frame(r, beat);
    if (frame.combat) { return frame.combat.outcome ? 'onward' : 'auto'; }
    return r.steps[beat.step + 1]?.id ?? '';
  }
  // The choice now on the page that leads to what the record did: that choice itself, or the way into the subject it
  // belongs to, or back out of the present one, or the choice it is folded under.
  static toward(r: Recorded, s: ProtoState, offer: Offer): Choice | undefined {
    const taken = this.taken(r, this.beat(s)), shown = Offers.all(offer);
    const direct = shown.find(c => this.same(c, taken));
    if (direct) { return direct; }
    const folded = shown.find(c => this.holds(c, taken));
    if (folded) { return folded; }
    if (s.attention.kind !== 'place') { return offer.groups.find(g => g.kind === 'leave')?.choices[0]; }
    const subject = offer.scene?.subjects.find(x => this.holds({ id: '', label: '', tone: 'way', children: x.choices },
      taken));
    return subject && shown.find(c => c.id.startsWith(`${subject.id}#`));
  }
  private static holds(c: Choice, command: string): boolean {
    return !!c.children?.some(k => this.same(k, command) || this.holds(k, command));
  }
  // The record's act, whoever does it: the page may offer it to another of the company (the flask in the casket is
  // offered to Thoradin, the record gave it to Wenna), and doing it is still doing what the record did.
  static same(c: Choice, command: string): boolean {
    if (c.id === command || c.command === command) { return true; }
    return !!c.command && this.bare(c.command) === this.bare(command);
  }
  private static bare(command: string): string { return command.replace(/,?region__(member|party)_[^,)]*/g, ''); }
  // Whom a beat opens attending to, by the name it gives: a person spoken with, or a thing looked at.
  static attending(frame: Frame, name?: string): Attention {
    if (!name || frame.combat) { return { kind: 'place' }; }
    const scene = SceneModel.build(frame.screen);
    const s = [...scene.subjects, ...scene.still ?? []].find(x => x.name.includes(name));
    if (!s) { return { kind: 'place' }; }
    return ['person', 'companion'].includes(s.kind) ? { kind: 'person', id: s.id } : { kind: 'thing', id: s.id };
  }
  static go(r: Recorded, s: ProtoState, at: number): ProtoState {
    const i = Math.max(0, Math.min(this.beats.length - 1, at)), beat = this.beats[i]!.beat;
    return { ...s, at: i, attention: this.attending(this.frame(r, beat), beat.attend), open: [], focus: 0,
      notice: undefined, reference: undefined };
  }
  static moveTo(r: Recorded, s: ProtoState, moment: number): ProtoState {
    const i = this.beats.findIndex(b => b.moment === Math.max(0, Math.min(Moments.all.length - 1, moment)));
    return this.go(r, s, i);
  }
  // A choice made: the page's own (open it, attend, go back), the record's (the next beat), or neither.
  static choose(r: Recorded, s: ProtoState, c: Choice): ProtoState {
    const [id, how] = c.id.split('#');
    if (how === 'talk') { return this.attend(s, { kind: 'person', id: id! }); }
    if (how === 'look') { return this.attend(s, { kind: 'thing', id: id! }); }
    if (how === 'leave' || how === 'back') { return this.attend(s, { kind: 'place' }); }
    if (this.same(c, this.taken(r, this.beat(s)))) { return this.go(r, s, s.at + 1); }
    if (c.children && !c.command) {
      const open = s.open.includes(c.id) ? s.open.filter(x => x !== c.id) : [...s.open, c.id];
      return { ...s, open, notice: undefined };
    }
    return { ...s, notice: `“${c.label}” is not what the record did here. The prototype follows one recorded journey; `
      + 'the marked choice is the record’s.' };
  }
  static attend(s: ProtoState, attention: Attention): ProtoState {
    return { ...s, attention, open: [], focus: 0, notice: undefined };
  }
  // The state as a query string, so any beat, attention and composition can be opened directly (and screenshotted).
  static query(s: ProtoState): string {
    const q = new URLSearchParams({ c: s.composition, beat: String(s.at) });
    if (s.attention.kind !== 'place') { q.set('attend', `${s.attention.kind}:${s.attention.id}`); }
    if (s.reference) { q.set('ref', s.reference); }
    if (s.focus) { q.set('focus', String(s.focus)); }
    if (!s.marks) { q.set('marks', '0'); }
    return `?${q.toString()}`;
  }
  static parse(r: Recorded, search: string): ProtoState {
    const q = new URLSearchParams(search), c = q.get('c');
    const base: ProtoState = { at: 0, attention: { kind: 'place' }, open: [], focus: 0, marks: q.get('marks') !== '0',
      composition: c === 'b' || c === 'c' ? c : 'a' };
    const s = this.go(r, base, Number(q.get('beat') ?? 0));
    const [kind, id] = (q.get('attend') ?? '').split(':');
    const ref = q.get('ref') as Reference | null;
    return { ...s, ...kind === 'person' || kind === 'thing' ? { attention: { kind, id: id! } } : {},
      ...ref ? { reference: ref } : {}, focus: Number(q.get('focus') ?? 0) };
  }
}
