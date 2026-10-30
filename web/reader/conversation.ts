import type { Choice } from '../../src/ui/choice-list';
import { Attending, type Attention } from '../../src/ui/attention';
import { SceneModel } from '../../src/ui/scene';
import type { Frame } from '../engine/protocol';
import { Words } from './words';

// One line of a conversation as it is kept on the page: what the company said, what was said back or done, what it
// came to know, and what it paid or was given.
export interface TalkLine {
  kind: 'you' | 'speech' | 'telling' | 'event' | 'change' | 'fight' | 'roll' | 'opening' | 'learned' | 'aim' | 'tally';
  text: string;
  // What a note is, said before it ("A new aim", "The aim now", "You know now").
  label?: string;
}

// Where the player's attention goes, and what a conversation keeps. Turning to someone, to a thing, away from a thing
// or taking leave are choices like any other, known by their ids; whether attention holds after something is done is
// the world's to say: it holds while the one spoken with (or the thing looked at) is still there, and the company has
// not gone anywhere, come to blows, or slept the night (or half a day) away.
export class Conversation {
  static readonly place: Attention = { kind: 'place' };
  // Ten-minute turns: past six hours, whatever was being said is over.
  static readonly night = 36;
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
  static lines(frame: Frame, choice: Choice, said: string): TalkLine[] {
    const exchange = frame.leaf.exchange, words = exchange?.said ?? said.split(' › ').at(-1)!;
    const restated = Words.restates(Words.echo(words), exchange?.lines[0]?.text);
    const you: TalkLine[] = /#talk$/.test(choice.id) || restated ? [] : [{ kind: 'you', text: words }];
    return [...you, ...(exchange?.lines ?? []).map(l => ({ kind: l.kind, text: l.text })),
      ...(exchange?.notes ?? []).map(text => ({ kind: /^(Noted|Borne out): /.test(text) ? 'learned' as const
        : /^Aim( now)?: /.test(text) ? 'aim' as const : 'tally' as const, text: text.replace(Words.noted, ''),
        ...Words.label(text) ? { label: Words.label(text) } : {} }))];
  }
}
