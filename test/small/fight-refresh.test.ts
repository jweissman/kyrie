import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { EngineHost } from '../../web/engine/engine-host';
import { MenuModel } from '../../src/frame/menu-model';
import { FightRefresh } from '../../web/reader/fight-refresh';
import type { Frame } from '../../src/creation/protocol';
import type { PlaySession } from '../../src/session/play-session';
import type { Battle } from '../../src/battle';

// A fight's frame sent again with only its standing reckoned (OR-1351) keeps the keyboard's place: the cursor on the
// same row by its id, the first row only where that row is gone; a new moment (more told, another turn) is no refresh.
const cellar = `
  Place cellar "the cellar" is room at 0, 0 indoors.
  Person rats "the rats" at cellar { Role "rats, fat and bold". Species rat. Numbers 4. Level 1. Lair cellar. }
  Company party "You" of 1 at cellar.`;
describe('a fight\'s frame sent again', () => {
  it('keeps the cursor on its row by id, and is no refresh where the moment moved', async () => {
    const t = await Tiny.start(cellar, { party: [{ name: 'Ilse', raceId: 'human', classId: 'mage' }] });
    const posts: Frame[] = [], host = new EngineHost(m => { if (m.kind === 'frame') { posts.push(m.frame); } });
    (host as unknown as { session: PlaySession }).session = t.session;
    void host.handle({ kind: 'perform', command: 'attack(t__rats)' });
    const turn = () => (host as unknown as { turn?: { battle: Battle } }).turn;
    for (let i = 0; i < 200 && !turn(); i++) { await new Promise(r => setTimeout(r, 0)); }
    const first = posts.at(-1)!, again = { ...first, combat: { ...first.combat!, standing: { text: 'It could go either way.',
      danger: 'even' } } } as unknown as Frame;
    expect(FightRefresh.is(first, again)).toBe(true);
    const at = { view: 'here' as const, open: [] }, rows = MenuModel.build(first, 'here', []).choices;
    expect(rows.length).toBeGreaterThan(1);
    expect(FightRefresh.cursor(first, again, { ...at, cursor: rows.length - 1 })).toBe(rows.length - 1);
    // The row the cursor was on gone: the first row.
    const last = rows.at(-1)!.id, gone = { ...again, combat: { ...again.combat!, abilities: again.combat!.abilities
      .filter(a => a.id !== last && !last.startsWith(a.id)) } } as unknown as Frame;
    if (MenuModel.build(gone, 'here', []).choices.every(c => c.id !== last)) {
      expect(FightRefresh.cursor(first, gone, { ...at, cursor: rows.length - 1 })).toBe(0);
    }
    const told = { ...first, combat: { ...first.combat!, exchanges: [...first.combat!.exchanges,
      { n: 99, text: 'More.', detail: '', round: first.combat!.round }] } } as unknown as Frame;
    expect(FightRefresh.is(first, told)).toBe(false);
  });
});
