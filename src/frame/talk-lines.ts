import type { Choice } from '../ui/choice-list';
import { Attending, type Attention } from '../ui/attention';
import { SceneModel } from '../ui/scene';
import type { Frame } from '../creation/protocol';
import { Words } from '../presentation/words';
import { Noted } from '../presentation/noted';
import type { Typed } from '../presentation/line-moments';

// One line of a conversation as it is kept on the page: what the company said, what was said back or done, what it
// came to know, and what it paid or was given.
// What a line of the telling is besides its words (a moment, a roll), as the engine says it (AR-05).
export interface TalkLine extends Pick<Typed, 'ended' | 'levelled' | 'roll'> {
  kind: 'you' | 'speech' | 'telling' | 'event' | 'change' | 'fight' | 'roll' | 'opening' | 'revelation' | 'learned' | 'aim'
    | 'tally';
  text: string;
  // An aim taken up: its id, by which it is followed.
  aim?: string;
  // What a note is, said before it ("A new aim", "The aim now", "You know now").
  label?: string;
}

// Where the player's attention goes, and what a conversation keeps. Turning to someone, to a thing, away from a thing
// or taking leave are choices like any other, known by their ids; whether attention holds after something is done is
// the world's to say: it holds while the one spoken with (or the thing looked at) is still there, and the company has
// not gone anywhere, come to blows, or slept the night (or half a day) away.
export class TalkLines {
  static readonly place: Attention = { kind: 'place' };
  // Ten-minute turns: past six hours, whatever was being said is over.
  static readonly night = 36;
  static typed({ ended, levelled, roll }: Typed): Typed {
    return { ...ended ? { ended } : {}, ...levelled ? { levelled } : {}, ...roll ? { roll } : {} };
  }
  static turn(choice: Choice): Attention | undefined {
    const m = /^(.+)#(talk|look|leave|back)$/.exec(choice.id);
    if (!m) { return undefined; }
    return m[2] === 'talk' ? { kind: 'person', id: m[1]! } : m[2] === 'look' ? { kind: 'thing', id: m[1]! } : this.place;
  }
  static holds(attention: Attention, before: Frame, after: Frame): Attention {
    if (attention.kind === 'place' || after.combat || !after.screen.running
      || after.screen.place.id !== before.screen.place.id
      || after.screen.elapsed - before.screen.elapsed >= this.night) { return this.place; }
    const scene = SceneModel.build(after.screen);
    const there = attention.kind === 'person' ? Attending.talk(scene, attention.id) : Attending.thing(scene, attention.id);
    return there ? attention : this.place;
  }
  // What a frame adds: the company's words (not for the turning to them, which the greeting answers, nor for an act
  // whose telling says it again: "Give healing herbs to Erevan" over "Aldith gives healing herbs to Erevan"), then
  // what came of them, then what was learned.
  // heard: the conversation's lines so far. What was said back word for word earlier in it is told as said again, its
  // words still above (the second blind playtest, BL-09: "Ask again" replayed the whole speech).
  static readonly again = 'The same answer as before.';
  static lines(frame: Frame, choice: Choice, said: string, heard: readonly TalkLine[] = []): TalkLine[] {
    const exchange = frame.leaf.exchange, words = exchange?.said ?? said.split(' › ').at(-1)!;
    const restated = Words.restates(Words.echo(words), exchange?.lines[0]?.text);
    const you: TalkLine[] = /#talk$/.test(choice.id) || restated ? [] : [{ kind: 'you', text: words }];
    // What it took up is said from the aims themselves, each by its id (see Exchange.aims); the narration's notes of
    // them are the terminal's.
    // Nor a thing learned in the very words of an aim it took up (the second blind playtest, BL-09: one sentence
    // under "You know now" and again under "Noted, further off").
    const aims = exchange?.aims ?? [], aimed = new Set(aims.map(a => a.text));
    const before = new Set(heard.filter(l => l.kind === 'speech').map(l => l.text));
    return [...you, ...(exchange?.lines ?? []).map(l => l.kind === 'speech' && before.has(l.text)
      ? { kind: 'telling' as const, text: this.again } : { kind: l.kind, text: l.text, ...this.typed(l) }),
      ...(exchange?.noted ?? []).filter(n => (!aims.length || !Noted.aim(n)) && !aimed.has(n.text))
        .map(n => ({ kind: Noted.known(n) ? 'learned' as const : Noted.drawn(n) ? 'aim' as const : 'tally' as const,
          text: n.text, ...Noted.labels[n.kind] ? { label: Noted.labels[n.kind] } : {} })),
      ...aims.map(a => ({ kind: 'aim' as const, text: a.text, aim: a.id }))];
  }
}
