import { describe, expect, it } from 'bun:test';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Identity } from '../src/presentation/identity';

// The game's name and the studio's are each said in one place (src/presentation/identity.ts), so that renaming the
// game is one line: the title's mark, the tab, Options, the encyclopedia's way back and what a stray file is told all
// take it from there. The address may ask for another to compare (?name=, ?studio=), kept to what a mark can carry.
class Pages {
  // What the player is shown of the reader, with the comments taken out: its pages and its one HTML file.
  static async shown(): Promise<Record<string, string>> {
    const root = join(import.meta.dir, '..');
    const files: string[] = ['web/reader/index.html', 'src/handbook/render-html.ts'];
    for (const dir of ['web/reader', 'web/reader/creation', 'web/reader/stage']) {
      const names = await readdir(join(root, dir)).catch(() => [] as string[]);
      files.push(...names.filter(n => /\.tsx$/.test(n)).map(n => `${dir}/${n}`));
    }
    const texts = await Promise.all(files.map(f => readFile(join(root, f), 'utf8')));
    return Object.fromEntries(files.map((f, i) => [f, texts[i]!.replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')]));
  }
}

describe("the game's name and the studio's", () => {
  it('are the game and the studio unless the address asks for others', () => {
    expect(Identity.named(new URLSearchParams(''))).toEqual({ game: Identity.game, studio: Identity.studio });
    expect(Identity.named(new URLSearchParams('?name=lanthorn&studio=freehaven')))
      .toEqual({ game: 'LANTHORN', studio: 'FREEHAVEN' });
    expect(Identity.named(new URLSearchParams('?studio=Seven%20Lamps')).studio).toBe('SEVEN LAMPS');
    expect(Identity.named(new URLSearchParams('?studio=Ivory%20Gate')).studio).toBe('IVORY GATE');
  });
  it('keep an asked name to what a mark can carry', () => {
    expect(Identity.asked('<b>holloway</b>')).toBe('B HOLLOWAY B');
    expect(Identity.asked('  seven   lamps ')).toBe('SEVEN LAMPS');
    expect(Identity.asked('<>')).toBeUndefined();
    expect(Identity.asked('x'.repeat(80))!.length).toBe(Identity.longest);
    // A name that is also a word every object knows is only a name.
    expect(Identity.named(new URLSearchParams('?studio=constructor')).studio).toBe('CONSTRUCTOR');
  });
  it("light the studio mark's seventh light as the name has it", () => {
    const studios = [Identity.studio, 'FREEHAVEN', 'SEVEN LAMPS'];
    expect(studios.map(s => Identity.seventh(s))).toEqual(['star', 'star', 'lamp']);
  });
  it('are said as words where a sentence or a tab has them', () => {
    expect(Identity.spoken('KYRIE')).toBe('Kyrie');
    expect(Identity.spoken('SEVEN LAMPS')).toBe('Seven Lamps');
    expect(Identity.spoken('SEVENTH STAR')).toBe('Seventh Star');
  });
  it('are written nowhere else the player looks', async () => {
    const written = Object.entries(await Pages.shown()).filter(([, text]) => /\b(KYRIE|Kyrie)\b/.test(text));
    expect(written.map(([file]) => file)).toEqual([]);
  });
});
