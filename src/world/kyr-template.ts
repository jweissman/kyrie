import { Draw } from './land/draw';

// A template of Kyr in data (data/generation/…/*.kyrt), for content that a generator places but an author writes:
// a heading ("# id: what it is"), comments ("//"), then sections. A section is "--- group" (always written) or
// "--- group option [weight]" (one option of the group drawn for each place it is written for, by weight). Its lines
// are Kyr with placeholders ("{t}", "{town}") filled from the values given; "{{t}_merchant}" is written
// "{s2_merchant}", Kyr's own reference to a name; "{!x}" is a piece of Kyr put in as it is. A line beginning ">>"
// is not Kyr but something the section says of itself for the generator to gather (the undertown's notice). The
// generator chooses and fills; what is written is the author's (the owner, 2 November: world content authorable, not
// emitted from engine code).
// A section may be written only for places whose values have a name ("--- road station 1 if station") or lack it.
export interface KyrSection { group: string; option: string; weight: number; lines: string[]; said: string[];
  when?: string; unless?: string }
export interface KyrTemplate { id: string; about: string; sections: KyrSection[] }

export class KyrTemplates {
  static parse(text: string): KyrTemplate {
    let id = '', about = '', section: KyrSection | undefined;
    const sections: KyrSection[] = [];
    for (const line of text.split('\n')) {
      const head = /^#\s*([\w-]+):\s*(.*)$/.exec(line);
      const start = /^---\s+(\w+)(?:\s+(\w+))?(?:\s+(\d+))?(?:\s+(if|unless)\s+(\w+))?\s*$/.exec(line);
      if (head && !section) { id = head[1]!; about = head[2]!; }
      else if (start) {
        section = { group: start[1]!, option: start[2] ?? start[1]!, weight: Number(start[3] ?? 1), lines: [],
          said: [], ...start[4] === 'if' ? { when: start[5] } : start[4] === 'unless' ? { unless: start[5] } : {} };
        sections.push(section);
      } else if (section && line.startsWith('>>')) { section.said.push(line.slice(2).trim()); }
      else if (section && line.trim() && !line.trim().startsWith('//')) { section.lines.push(line); }
    }
    if (!id) { throw new Error(`A Kyr template needs a heading: ${text.slice(0, 40)}`); }
    return { id, about, sections };
  }
  // The sections written for one place: every section that is its own group, and one drawn option of each other; of
  // those whose condition the place's values meet (a group left with no option writes nothing).
  static choose(template: KyrTemplate, key: string, values: Record<string, string> = {}): KyrSection[] {
    const draw = new Draw(key), groups = [...new Set(template.sections.map(s => s.group))];
    return groups.flatMap(group => {
      const options = template.sections.filter(s => s.group === group && (!s.when || values[s.when])
        && (!s.unless || !values[s.unless]));
      if (!options.length) { return []; }
      const always = options.filter(s => s.option === s.group);
      return always.length ? always : [draw.weighted(options.map(o => [o, o.weight] as const))];
    });
  }
  // Lines with their placeholders filled; a brace round anything not a value given is left for Kyr. A value is made
  // safe to stand in a Kyr string; "{!name}" puts a value in as it is, a piece of Kyr the generator wrote (a
  // likeness, what someone sells), outside any string.
  static fill(lines: string[], values: Record<string, string>): string[] {
    return lines.map(line => line.replace(/\{(!?)([a-z]+)\}/g, (whole, raw: string, name: string) =>
      (raw ? values[name] : values[name]?.replace(/["\\{}]/g, '\\$&')) ?? whole));
  }
}
