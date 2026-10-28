import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';

// Someone the world's own stories write as "he" or "she" says so, or the words of the voice tables call them "they":
// play 9 read "Garth leans on his crook" and then "Garth … does not seem to like what they see".
describe('the people of the generated stories', () => {
  it('declare the pronouns their own lines give them', () => {
    const unsaid: string[] = [];
    for (const file of new Glob('data/{situations,goings-on,kits}/**/*.kyr').scanSync('.')) {
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(/Person (\w+) "[^"]*" at \w+ \{([\s\S]*?)\n {2}\}/g)) {
        const [, id, body] = m as unknown as [string, string, string];
        const lines = [...text.matchAll(new RegExp(`"([^"]*\\{${id}\\}[^"]*)"`, 'g'))].map(x => x[1]!);
        if (!/Pronouns/.test(body) && lines.some(l => /\b(he|him|his|she|her)\b/.test(l))) { unsaid.push(`${file}: ${id}`); }
      }
    }
    expect(unsaid).toEqual([]);
  });
});
