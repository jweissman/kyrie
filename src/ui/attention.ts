import type { Choice } from './choice-list';
import type { Scene, SceneSubject } from './scene';

// What the player's attention is on: the place as a whole, one person being spoken with, or one thing being looked
// at. The engine says what can be done; this says which of it belongs to the present attention, and in what order.
export type Attention = { kind: 'place' } | { kind: 'person'; id: string } | { kind: 'thing'; id: string };
export interface Talk { subject: SceneSubject; replies: Choice[]; leave: Choice }
export interface Examined { subject: SceneSubject; groups: { title: string; choices: Choice[] }[]; back: Choice }

export class Attending {
  static readonly talking = /^talk_to\(/;
  static readonly leaving = /^take_leave\(/;
  // The place: someone who can be spoken with is one choice, to speak with them (what can be put to them is put in
  // the conversation); something with things to do with it is one choice, to look at it. Beasts, animals and the
  // ways are as they are.
  static place(scene: Scene): Scene {
    return { ...scene, subjects: scene.subjects.map(s => this.opener(s)) };
  }
  private static opener(s: SceneSubject): SceneSubject {
    // A danger is met where it stands: fighting it, talking it round and warning it off are all said at once, not
    // behind a conversation that may never be opened. Talking to it is offered only where something is written to be
    // asked of it: grave-robbers talked to had drawn back and said nothing, and nothing could be put to them (the cold
    // evaluation's 14; play 13).
    if (s.danger && s.kind !== 'companion') {
      return s.asked ? s : { ...s, choices: s.choices.filter(c => !this.talking.test(c.command ?? '')) };
    }
    if (['person', 'companion'].includes(s.kind) && s.choices.length) {
      const talk = this.all(s.choices).find(c => this.talking.test(c.command ?? ''));
      const rest = this.replies(s.choices);
      return { ...s, choices: [{ id: `${s.id}#talk`, label: `Talk to ${this.called(s)}`, tone: 'person',
        ...talk?.command ? { command: talk.command } : {}, children: rest.length ? rest : [] }] };
    }
    if (s.kind === 'thing' && s.choices.length) {
      return { ...s, choices: [{ id: `${s.id}#look`, label: s.name, tone: 'thing', children: s.choices }] };
    }
    return s;
  }
  // One's own family by what they are to you ("Talk to your mother", not "Talk to Jassin Galanodel": M17-93).
  private static called(s: SceneSubject): string {
    const kin = s.note?.split(' · ')[0];
    return s.stake && kin?.startsWith('your ') ? kin : s.name;
  }
  // A conversation: what can be said to them, and taking leave.
  static talk(scene: Scene, id: string): Talk | undefined {
    const subject = scene.subjects.find(s => s.id === id);
    if (!subject) { return undefined; }
    const leave = this.all(subject.choices).find(c => this.leaving.test(c.command ?? ''));
    return { subject, replies: this.replies(subject.choices),
      leave: { id: `${id}#leave`, label: 'Take your leave', tone: 'person', ...leave?.command ? { command: leave.command } : {} } };
  }
  private static replies(choices: Choice[]): Choice[] {
    return choices.filter(c => !this.talking.test(c.command ?? '') && !this.leaving.test(c.command ?? ''));
  }
  // A thing looked at: what can be done with it, by kind of doing. What it is for comes first (reading what is cut
  // on it, setting it, opening it: anything its author gave it is that), then what can be taken from it, then the
  // trying anything might be given (looking closer, listening, prodding), and going through it anyway, last.
  static readonly kinds: [string, RegExp][] = [
    ['Take', /^(take_item|take_out|gather|collect|salvage_coin|forage|put_in)\(/],
    ['Look', /^(look_closely|listen|examine)\(/],
    ['Handle', /^(push|prod|pry|burn)\(/],
    ['Go through it anyway', /^(risk|attack|destroy_source)\(/]];
  // A thing looked at stays looked at when nothing is left to do with it (a notebook, read), until it is left.
  static thing(scene: Scene, id: string): Examined | undefined {
    const subject = [...scene.subjects, ...scene.still ?? []].find(s => s.id === id);
    if (!subject) { return undefined; }
    const choices = subject.choices.flatMap(c => c.children && !c.command && !c.children.some(k => k.children)
      && /^(Examine|Look at)/.test(c.label) ? c.children : [c]);
    // What is in it is taken from it here, by name: "Take a dowsing rod" from the casket's own page.
    const inside = scene.subjects.filter(x => x.note?.split(' · ').includes(`in ${subject.name}`))
      .flatMap(x => x.choices.filter(c => this.kindOf(c) === 'Take').map(c => ({ ...c, label: `Take ${x.name}` })));
    const titles = ['Work it', ...this.kinds.map(([t]) => t)];
    return { subject, back: { id: `${id}#back`, label: 'Back', tone: 'thing' },
      groups: titles.map(title => ({ title, choices: [...title === 'Take' ? inside : [],
        ...choices.filter(c => this.kindOf(c) === title)] })).filter(g => g.choices.length) };
  }
  private static kindOf(c: Choice): string {
    const command = c.command ?? this.all(c.children ?? []).find(k => k.command)?.command ?? '';
    return this.kinds.find(([, re]) => re.test(command))?.[0] ?? 'Work it';
  }
  static all(choices: Choice[]): Choice[] {
    return choices.flatMap(c => [c, ...this.all(c.children ?? [])]);
  }
}
