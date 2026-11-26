import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';

// What forces a way or a box open in the deep is done by brawn or a crowbar (data/generation/deep/rooms.kyrt: its
// force acts), so its telling names no tool (OR-699, cold play 4, T95: "Prise the strong-box open by main force" was
// done by a warrior's brawn and told as "an hour of the crowbar", no crowbar carried).
describe('a forcing in the deep', () => {
  it('is told by no tool it may be done without', () => {
    const dir = 'data/generation/deep', said: string[] = [];
    for (const f of readdirSync(dir).filter(n => n.endsWith('.json'))) {
      const walk = (x: unknown): void => {
        if (Array.isArray(x)) { x.forEach(walk); return; }
        if (x && typeof x === 'object') {
          for (const [k, v] of Object.entries(x)) {
            if (k === 'force' && typeof v === 'string') { said.push(v); } else { walk(v); }
          }
        }
      };
      walk(JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
    }
    expect(said.length).toBeGreaterThan(4);
    const tools = /\b(crowbar|lever|pick|axe|hammer)\b/i;
    expect(said.filter(s => tools.test(s) && !/hammer of your boots/.test(s))).toEqual([]);
    expect(said.filter(s => /crowbar/i.test(s))).toEqual([]);
  });
});
