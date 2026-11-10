import type { Choice } from './choice-list';
import type { Scene, SceneSubject } from './scene';

// What the player's attention is on: the place as a whole, one person being spoken with, or one thing being looked
// at. The engine says what can be done; this says which of it belongs to the present attention, and in what order.
export type Attention = { kind: 'place' } | { kind: 'person'; id: string } | { kind: 'thing'; id: string };
export interface Talk { subject: SceneSubject; replies: Choice[]; leave: Choice }
export interface Examined { subject: SceneSubject; groups: { title: string; choices: Choice[] }[]; back: Choice }

export class Attending {
  // Each choice by the kind of act it is (Choice.does), never by its command's words (the architecture review's P0).
  static talking(c: Choice): boolean { return c.does === 'talk_to'; }
  static leaving(c: Choice): boolean { return c.does === 'take_leave'; }
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
      return s.asked ? s : { ...s, choices: s.choices.filter(c => !this.talking(c)) };
    }
    if (['person', 'companion'].includes(s.kind) && s.choices.length) {
      const talk = this.all(s.choices).find(c => this.talking(c));
      // What is done about them, not said to them, stands beside talking to them (Behind the Wainscot's F3).
      const deeds = s.choices.filter(c => c.deed && !c.children);
      const rest = this.replies(s.choices.filter(c => !deeds.includes(c)));
      // Someone with nothing to be said to them but goodbye is there, not someone to talk to (the owner, 9 November:
      // a likeness clicked, a conversation opened, and only "Take your leave" in it). What is done about them stays.
      if (!rest.length) { return { ...s, choices: deeds }; }
      return { ...s, choices: [{ id: `${s.id}#talk`, label: `Talk to ${this.called(s)}`, tone: 'person',
        ...talk?.command ? { command: talk.command, does: 'talk_to' } : {}, children: rest.length ? rest : [] }, ...deeds] };
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
    const leave = this.all(subject.choices).find(c => this.leaving(c));
    return { subject, replies: this.replies(subject.choices),
      leave: { id: `${id}#leave`, label: 'Take your leave', tone: 'person',
        ...leave?.command ? { command: leave.command, does: 'take_leave' } : {} } };
  }
  private static replies(choices: Choice[]): Choice[] {
    return choices.filter(c => !this.talking(c) && !this.leaving(c));
  }
  // A thing looked at: what can be done with it, by kind of doing. What it is for comes first (reading what is cut
  // on it, setting it, opening it: anything its author gave it is that), then what can be taken from it, then the
  // trying anything might be given (looking closer, listening, prodding), and going through it anyway, last.
  static readonly kinds: [string, Set<string>][] = [
    ['Take', new Set(['take_item', 'take_out', 'gather', 'collect', 'salvage_coin', 'forage', 'put_in'])],
    ['Look', new Set(['look_closely', 'listen', 'examine'])],
    ['Handle', new Set(['push', 'prod', 'pry', 'burn'])],
    ['Go through it anyway', new Set(['risk', 'attack', 'destroy_source'])]];
  // A thing looked at stays looked at when nothing is left to do with it (a notebook, read), until it is left.
  static thing(scene: Scene, id: string): Examined | undefined {
    const subject = [...scene.subjects, ...scene.still ?? []].find(s => s.id === id);
    if (!subject) { return undefined; }
    // A group of acts on one part of it (examining the lock: looking, listening) is its acts, each in its kind.
    const choices = subject.choices.flatMap(c => c.children && !c.command && !c.children.some(k => k.children)
      && c.children.every(k => Attending.kinds.some(([t, of]) => t === 'Look' && of.has(k.does ?? ''))) ? c.children : [c]);
    // What is in it is taken from it here, by name: "Take a dowsing rod" from the casket's own page.
    const inside = scene.subjects.filter(x => x.note?.split(' · ').includes(`in ${subject.name}`))
      .flatMap(x => x.choices.filter(c => this.kindOf(c) === 'Take').map(c => ({ ...c, label: `Take ${x.name}` })));
    const titles = ['Work it', ...this.kinds.map(([t]) => t)];
    return { subject, back: { id: `${id}#back`, label: 'Back', tone: 'thing' },
      groups: titles.map(title => ({ title, choices: [...title === 'Take' ? inside : [],
        ...choices.filter(c => this.kindOf(c) === title)] })).filter(g => g.choices.length) };
  }
  private static kindOf(c: Choice): string {
    const does = c.does ?? this.all(c.children ?? []).find(k => k.does)?.does ?? '';
    return this.kinds.find(([, of]) => of.has(does))?.[0] ?? 'Work it';
  }
  static all(choices: Choice[]): Choice[] {
    return choices.flatMap(c => [c, ...this.all(c.children ?? [])]);
  }
}
