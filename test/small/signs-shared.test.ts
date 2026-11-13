import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import emblems from '../../data/paintings/emblems.json';
import { Signs } from '../../src/presentation/signs';
import { Emblems } from '../../src/presentation/emblems';
import { TerminalColour } from '../../src/cli/terminal-colour';
import { BoardGlyphs } from '../../web/reader/board/board-glyphs';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../web/engine/creation-flow';
import type { Setting } from '../../web/engine/protocol';

// The page and the terminal draw from one shared game definition (the owner, 14 November): each emblem and kind of
// place has its one character for a client drawn in text, each sign beside an act's words is the shared table's
// (Signs) and no client keeps a copy of its own, and the terminal draws every one of them, in colour and without.
const one = (text: string) => [...new Intl.Segmenter().segment(text)].length === 1;
const files = (dir: string): string[] => readdirSync(dir).flatMap(f => statSync(join(dir, f)).isDirectory()
  ? files(join(dir, f)) : /\.tsx?$/.test(f) ? [join(dir, f)] : []);
const sets = emblems.sets as Record<string, { paths: Record<string, string>; text?: Record<string, string> }>;

describe('the signs both clients draw', () => {
  it('give every emblem and every kind of place on the board one character', () => {
    for (const [name, set] of Object.entries(sets)) {
      expect([name, Object.keys(set.text ?? {}).sort()]).toEqual([name, Object.keys(set.paths).sort()]);
      for (const id of Object.keys(set.paths)) { expect([id, one(Signs.emblem(id)!)]).toEqual([id, true]); }
    }
    const kinds = Object.keys((BoardGlyphs as unknown as { paths: Record<string, string> }).paths).sort();
    expect(Object.keys(Signs.places).sort()).toEqual(kinds);
    expect(Object.values(Signs.places).every(one)).toBe(true);
  });
  it('are kept in one table, and no client keeps its own', () => {
    const copies = [/'⊘'/, /Up: '↑'/, /'no way back'/, /'hold to do it'/, /, that way`/, /'cannot be undone'/];
    const kept = [...files('web/reader'), ...files('src/cli')]
      .filter(f => copies.some(c => c.test(readFileSync(f, 'utf8'))));
    expect(kept).toEqual([]);
  });
  it('are each drawn by the terminal, in colour and said without it', () => {
    const row = { tags: [Signs.marks['one-way']], hold: true as const, sensed: 'payoff' as const };
    const plain = TerminalColour.choice(1, 'Search the cellar', row, 'none');
    expect(plain).toBe(`1. Search the cellar ${Signs.hold.sign} · no way back · to gain, that way`);
    // Perceived and not here, its tone faint: the green pip, dimmed.
    expect(TerminalColour.choice(1, 'Down the stair', { sensed: 'payoff' }, 'true'))
      .toStartWith('\x1b[2m\x1b[38;2;95;211;182m▌');
    // A way with nothing new is dim, or said so.
    expect(TerminalColour.choice(2, 'To the mill', { idle: true }, 'true')).toContain('\x1b[2m2. To the mill');
    expect(TerminalColour.choice(2, 'To the mill', { idle: true }, 'none')).toBe(`2. To the mill · ${Signs.idle}`);
  });
  it('carry each creation card\'s emblem, as the page draws it', () => {
    const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
    const setting: Setting = { title: 'Merscfaenn', generated: true, pitch: { heading: '', text: '' },
      origins: [{ id: 'debt', title: 'A debt', choice: 'You owe money' }], names,
      party: [Creation.protagonist('human', 'flow', names)] };
    const steps = new CreationFlow(setting, Creation.catalog()).steps()
      .filter(s => s.id !== 'presenting' && s.cards.length);
    for (const step of steps) {
      const bare = step.cards.filter(c => !c.emblem || !Emblems.has(c.emblem)).map(c => c.id);
      expect([step.id, bare]).toEqual([step.id, []]);
    }
  });
});
