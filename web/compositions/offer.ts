import { Attending, type Attention } from '../../src/ui/attention';
import { ChoiceList, type Choice } from '../../src/ui/choice-list';
import { SceneModel, type Scene, type SceneSubject } from '../../src/ui/scene';
import type { Frame } from '../engine/protocol';

// What a beat offers, the same for every composition: who and what is here, what is being attended to, and what can
// be done now, in groups, each group about one subject or one kind of doing. Built from the reader's own scene and
// attention, so a composition differs in how it lays these out, never in what they are.
export type GroupKind = 'threat' | 'person' | 'companion' | 'thing' | 'animal' | 'near' | 'far' | 'you' | 'reply'
  | 'work' | 'leave' | 'fight';
export interface Group { kind: GroupKind; title: string; subject?: SceneSubject; about?: string; choices: Choice[] }
export interface Offer {
  scene?: Scene; attention: Attention; subject?: SceneSubject; groups: Group[];
  // The subjects with nothing to be done with them now, still there to be seen (a notebook read).
  still: SceneSubject[];
}

export class Offers {
  static of(frame: Frame, attention: Attention, open: Set<string>): Offer {
    if (frame.combat) { return this.combat(frame); }
    const scene = SceneModel.build(frame.screen);
    const subject = attention.kind === 'place' ? undefined
      : [...scene.subjects, ...scene.still ?? []].find(s => s.id === attention.id);
    if (attention.kind === 'person' && subject) {
      const talk = Attending.talk(scene, subject.id)!;
      return { scene, attention, subject, still: scene.still ?? [], groups: [
        { kind: 'reply', title: `To ${subject.name}`, subject, choices: this.unfold(talk.replies, open) },
        { kind: 'leave', title: '', choices: [talk.leave] }] };
    }
    if (attention.kind === 'thing' && subject) {
      const examined = Attending.thing(scene, subject.id)!;
      return { scene, attention, subject, still: scene.still ?? [], groups: [
        ...examined.groups.map(g => ({ kind: 'work' as const, title: g.title, subject,
          choices: this.unfold(g.choices, open) })), { kind: 'leave', title: '', choices: [examined.back] }] };
    }
    return { scene, attention: { kind: 'place' }, still: scene.still ?? [], groups: this.place(scene, open) };
  }
  // The place: danger first, its ways of meeting it said beside it rather than put in a conversation; then each
  // person as one way into speaking with them, each thing as one way into looking at it; the ways; yourself.
  private static place(scene: Scene, open: Set<string>): Group[] {
    const openers = Attending.place(scene).subjects;
    const threat = scene.subjects.filter(s => s.danger);
    const groups: Group[] = threat.map(s => ({ kind: 'threat', title: s.name, subject: s, about: s.danger,
      choices: this.unfold(Attending.all(s.choices).filter(c => c.command), open) }));
    for (const s of openers.filter(o => !threat.some(t => t.id === o.id))) {
      const kind = s.kind === 'creature' ? 'threat' : s.kind;
      groups.push({ kind, title: s.name, subject: s,
        choices: s.choices.map(c => ({ ...c, children: undefined })).filter(c => c.command || c.id.includes('#')) });
    }
    groups.push({ kind: 'near', title: 'Go', choices: this.unfold(scene.near, open) },
      { kind: 'far', title: 'Set out', choices: this.unfold(scene.far, open) },
      { kind: 'you', title: 'Yourself', choices: this.unfold(scene.you, open) });
    return groups.filter(g => g.choices.length || ['person', 'companion', 'animal'].includes(g.kind));
  }
  private static combat(frame: Frame): Offer {
    const c = frame.combat!, sections = ChoiceList.combat(c);
    const auto: Choice = { id: 'auto', label: `Let ${c.actorName} choose`, tone: 'ability',
      about: `${c.actorName} fights this turn as the company's tactics judge best (the reader's T).` };
    const groups: Group[] = sections.map(s => ({ kind: 'fight', title: s.title, choices: s.choices }));
    return { attention: { kind: 'place' }, still: [],
      groups: c.ours && !c.outcome ? [...groups, { kind: 'fight', title: '', choices: [auto] }] : groups };
  }
  // The order the keys go through a composition's choices: as offered, or (the folio) with the ways first, unless
  // someone or something has the page's attention, or a danger is here.
  static order(composition: 'a' | 'b' | 'c', offer: Offer): Choice[] {
    return (composition === 'c' ? this.waysFirst(offer) : offer.groups).flatMap(g => g.choices);
  }
  static waysFirst(offer: Offer): Group[] {
    const ways = offer.groups.filter(g => g.kind === 'far' || g.kind === 'near');
    if (offer.attention.kind !== 'place' || offer.groups.some(g => g.kind === 'threat' || g.kind === 'fight')) {
      return offer.groups;
    }
    return [...ways, ...offer.groups.filter(g => !ways.includes(g))];
  }
  static unfold(choices: Choice[], open: Set<string>): Choice[] {
    return choices.flatMap(c => [c, ...open.has(c.id) && c.children ? this.unfold(c.children, open) : []]);
  }
  static all(offer: Offer): Choice[] {
    return offer.groups.flatMap(g => g.choices);
  }
  // Whether a choice is one level inside another that is open, for drawing it indented beneath it.
  static depth(offer: Offer, choice: Choice): number {
    const parents = Attending.all(this.all(offer)).filter(c => c.children?.includes(choice));
    return parents.length ? 1 + this.depth(offer, parents[0]!) : 0;
  }
}
