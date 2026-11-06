import text from '../../data/origins/prologue.kyrt' with { type: 'text' };
import { Draw } from './land/draw';
import { KyrTemplates } from './kyr-template';

// What is going on on the way into the first town, for a new life to meet before it (the owner, 6 November: a brief
// playable opening, not a told one): one of the situations of data/origins/prologue.kyrt, drawn by the country, written
// into the origin's module at the way in, its people going on into the town and remembering what was done. Only where a
// life begins on a way in; its words are the author's, and an option added there is met with nothing else to write.
export class OriginPrologue {
  static readonly template = KyrTemplates.parse(text);
  // The lines for one country, and what they import (the inn's taproom, where whoever was met goes on to).
  static lines(key: string, values: { approach: string; inn: string; home: string; folk: string }): string[] {
    const options = this.template.sections.filter(s => s.group !== 'base');
    if (!options.length) { return []; }
    const chosen = new Draw(`${key}:prologue`).weighted(options.map(o => [o, o.weight] as const));
    return KyrTemplates.fill([...this.template.sections.filter(s => s.group === 'base'), chosen].flatMap(s => s.lines),
      values);
  }
}
