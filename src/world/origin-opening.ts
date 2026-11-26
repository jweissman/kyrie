import { ModuleParser } from '../lang/module-parser';
import type { VocabularyContext } from '../lang';

// An origin's opening, as its own module tells it, before any world is read (OR-23: the prologue as the loading
// screen): the chapter it names and its first beats, why the company came and how it came in, filled with the words
// the country binds it to. The same beats the opening's pages tell once the world is made (Prologue.of), so that the
// page shown while the world is made becomes the first page of the story without a cut. Nothing that needs the world
// (who is met on the road, what the aim is) is said here.
export interface OriginOpening { title: string; beats: string[] }
export class OriginOpenings {
  static readonly arrival = 'arrival';
  static of(source: string, title: string, vocabulary: VocabularyContext): OriginOpening | undefined {
    let module;
    try { module = ModuleParser.parseWithin(vocabulary.fork(), source); } catch { return undefined; }
    const said = module.observations ?? [];
    // Why: the first of its features said where it begins, not near anyone, nor the meeting; then the arrival.
    const why = said.find(o => o.aspect === 'feature' && o.anchor !== 'near' && o.id !== 'meeting' && o.id !== this.arrival);
    if (!why) { return undefined; }
    const way = said.find(o => o.id === this.arrival);
    // A word the world has yet to give (someone's name, read from it) is not said before it is.
    const beats = [why.text, ...way ? [way.text] : []].filter(b => !/\{\w+\}/.test(b));
    return beats.length ? { title, beats } : undefined;
  }
}
