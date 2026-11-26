import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner, type Said } from '../../src/cli/runner';

// The things lens and the pack say what the company carries, as the page's pack shows it (OR-688, cold plays 1, 3
// and 4: the things lens at the first turn had been empty, and a newcomer bought leather armour not knowing it wore
// scale).
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Goal false.`;
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('the company\'s own gear', () => {
  it('is said through the things lens and the pack', async () => {
    const t = await Tiny.start(yard, { party: [{ name: 'Wat', raceId: 'human', classId: 'warrior' }] });
    const r = new Runner(t.session), worn = t.screen.items.filter(i => i.stow === 'worn').map(i => i.name);
    expect(worn.length).toBeGreaterThan(0);
    for (const lens of ['things', 'pack']) {
      const lines = said(await r.ask(JSON.stringify({ lens }))).scene.lines.join(' ');
      expect(lines).toMatch(/^Wat wears or holds /);
      for (const w of worn) { expect(lines).toContain(w); }
    }
  });
});
