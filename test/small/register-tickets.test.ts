import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RegisterTickets } from '../../scripts/register-tickets';

// The register is read as tickets and its rows placed on features (the owner, 15 November: register items as specific
// issues, and a formal feature map from the defects, reports and requests). The map is held to the register and to the
// code: a new row must be placeable (by its id, its words or its prefix), a feature's files must exist, and a changed
// file finds its feature. An unplaced row is a failure with the fix named, not a silent gap.
const root = RegisterTickets.root, map = RegisterTickets.map();
const rows = RegisterTickets.rows(readFileSync(join(root, 'doc/architecture/open-register.md'), 'utf8'), map);
describe('the register as tickets', () => {
  it('reads both of its table layouts, each id once', () => {
    expect(rows.length).toBeGreaterThan(540);
    expect(rows.find(r => r.id === 'HP-01')).toMatchObject({ pri: 'P1', feature: 'undertakings' });
    expect(rows.find(r => r.id === 'FH-01')).toMatchObject({ pri: 'P0', feature: 'opening' });
    expect(new Set(rows.map(r => r.id)).size).toBe(rows.length);
  });
  it('places every row on a feature that exists', () => {
    const known = new Set(map.features.map(f => f.id));
    const unplaced = rows.filter(r => !known.has(r.feature)).map(r => r.id);
    expect(unplaced).toEqual([]);
    const targets = [...Object.values(map.byPrefix), ...Object.values(map.rows), ...map.byText.map(([, f]) => f)];
    expect(targets.filter(f => !known.has(f))).toEqual([]);
  });
  it('holds every feature to files that exist', () => {
    const gone = map.features.flatMap(f => f.paths.filter(p => !existsSync(join(root, p))).map(p => `${f.id}: ${p}`));
    expect(gone).toEqual([]);
  });
  it('says what a changed file could touch, and what is live there', () => {
    expect(RegisterTickets.touching('web/reader/stage/fight-moves.tsx', map).map(f => f.id)).toContain('fight');
    expect(RegisterTickets.touching('src/rules/spellcasting.ts', map).map(f => f.id)).toContain('spells');
    expect(RegisterTickets.list(rows, 'spells').length).toBeGreaterThan(0);
  });
  it('reads a status by its first words, and a closed row that still says open', () => {
    expect(RegisterTickets.state('**fixed (15 Nov):** it works. Open: the rest')).toEqual({ state: 'closed', loose: true });
    expect(RegisterTickets.state('partly (11 Nov)').state).toBe('partly');
    expect(RegisterTickets.state('duplicate of cb-01').state).toBe('duplicate');
  });
});
