// The adventure a part of `kyrie new` goes into (see new-parts, new-character): read from its module, and the files
// of it a part writes.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// What a part needs of the adventure it goes into: its module's id and title, the place it is put beside (where the
// company begins, unless it says), what that place is within, and where on the grid the next place along stands.
export interface Home { adventure: string; module: string; title: string; dir: string; from: string; parent: string;
  spot: [number, number]; sources: string[] }
// A part's files, by path, the file the module names among its sources, what to do next, and the steps its test
// plays and what the page tells at the last of them.
export interface Part { files: Record<string, string>; source: string; next: string; steps: string[]; told: string }
// What a part is, before it is written out: its Kyr, what it is said to be, the steps that show it and what is told.
export interface Drafted { kyr: string; what: string; steps: string[]; told: string; next: string }

export class Adventures {
  static read(root: string, adventure: string, from?: string): Home {
    const dir = `data/adventures/${adventure}`, manifest = this.manifest(root, dir);
    const sources = [manifest.source].flat(), text = sources.map(s => readFileSync(join(root, dir, s), 'utf8')).join('\n');
    const head = /Module (\w+) ("(?:[^"\\]|\\.)*")/.exec(text);
    const start = from ?? /Company \w+ "[^"]*" of \d+ at (\w+)/.exec(text)?.[1];
    const room = start && new RegExp(`Place ${start} "[^"]*" is room within (\\w+) at (-?\\d+), (-?\\d+)`).exec(text);
    if (!head || !start || !room) {
      throw new Error(`${dir}: say which place it goes beside (--from <place>): a room within a settlement or wild country, at a spot on its grid`);
    }
    const parent = room[1]!, row = Number(room[3]);
    const xs = [...text.matchAll(new RegExp(`is room within ${parent} at (-?\\d+), ${row}\\b`, 'g'))].map(m => Number(m[1]));
    return { adventure, module: head[1]!, title: JSON.parse(head[2]!) as string, dir, from: start, parent,
      spot: [Math.max(...xs) + 1, row], sources };
  }
  static manifest(root: string, dir: string): { source: string | string[] } & Record<string, unknown> {
    return JSON.parse(readFileSync(join(root, dir, 'module.json'), 'utf8')) as { source: string | string[] };
  }
  // A Kyr file of the adventure's module.
  static file(home: Home, comment: string, lines: string[]): string {
    return [`Module ${home.module} ${JSON.stringify(home.title)} {`, ...comment ? [`  // ${comment}`] : [], ...lines, '}', ''].join('\n');
  }
  // A part written out: its Kyr in a file of its own, and its test.
  static part(home: Home, id: string, d: Drafted): Part {
    return { source: `${id}.kyr`, next: d.next, steps: d.steps, told: d.told, files: { [`${home.dir}/${id}.kyr`]: d.kyr,
      [`test/${home.adventure}-${id}.test.ts`]: this.test(home, { id, what: d.what, steps: d.steps, told: d.told }) } };
  }
  // A test of the part: the adventure's campaign played to it, and the steps that do what it is for.
  static test(home: Home, t: { id: string; what: string; steps: string[]; told: string }): string {
    const q = JSON.stringify, { id, what, steps, told } = t;
    return [`import { describe, expect, it } from 'bun:test';`, `import { Journey } from '../src/session/journey';`, '',
      `// ${what} (bin/kyrie new wrote it: write over it as the part grows).`,
      `describe(${q(`${home.title}: ${id}`)}, () => {`,
      `  it(${q(`is played: ${steps.at(-1)}`)}, async () => {`,
      `    const j = await Journey.start('data/campaigns/${home.adventure}.campaign.json', ${q(id)});`,
      `    await j.play(${steps.map(s => q(s)).join(', ')});`,
      `    expect(j.page).toContain(${q(told)});`, '  }, 60000);', '});', ''].join('\n');
  }
}
