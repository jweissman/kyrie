import { describe, expect, it } from 'bun:test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { Canon } from '../src/canon/canon';

// A class an ancestry may not take cannot be cast: a dwarf thief, a gnome warrior. Deem draws the ancestry from a folk
// table by the terrain and the module fixes the calling in its own Kyr, so the two meet only here: every ancestry
// every table can draw, in every terrain it has a group for (and its default), must allow the calling its person has.
const dir = 'data/goings-on';
const modules = readdirSync(dir).filter(m => existsSync(`${dir}/${m}/tables.json`));
type Entry = string | { __value: string; __weight?: number };
const value = (e: Entry) => typeof e === 'string' ? e : e.__value;
const classes = (race: string) => Canon.ancestries[race]?.classes as string[] | undefined;

describe('every folk table casts only ancestries that may take the calling it is cast for', () => {
  it('knows every ancestry a table can draw', () => {
    for (const m of modules) {
      const tables = JSON.parse(readFileSync(`${dir}/${m}/tables.json`, 'utf8')) as Record<string, { discriminator: string; groups: Record<string, Entry[]> }>;
      for (const [name, t] of Object.entries(tables)) {
        if (t.discriminator === 'folk') { continue; }
        for (const [terrain, group] of Object.entries(t.groups)) {
          for (const e of group) { expect([m, name, terrain, value(e), !!classes(value(e))]).toEqual([m, name, terrain, value(e), true]); }
        }
      }
    }
  });

  it('casts the Ring\'s lieutenant, Principal, hired men and cell only as ancestries that may be what the Ring says they are', () => {
    const tables = JSON.parse(readFileSync(`${dir}/factors/tables.json`, 'utf8')) as Record<string, { groups: Record<string, Entry[]> }>;
    const templates = JSON.parse(readFileSync(`${dir}/factors/templates.json`, 'utf8')) as Record<string, Record<string, unknown>>;
    const kyr = ['ring.kyr', 'situation.kyr'].map(f => readFileSync(`${dir}/factors/${f}`, 'utf8')).join('\n');
    // Each cast person's table is the one its template looks up for its race; its calling is the Person's own Calling.
    const cast: [string, string, string][] = [];
    for (const [key, t] of Object.entries(templates)) {
      const id = /^factors_(.+)$/.exec(key)?.[1];
      const race = [t._folk, t.raceId].find(x => typeof x === 'string' && x.includes('lookup(')) as string | undefined ?? '';
      const table = /lookup\((\w+),/.exec(race)?.[1];
      if (!id || !table || !tables[table]) { continue; }
      const person = new RegExp(`Person ${id}\\b[^{]*\\{([^]*?)\\n  \\}`).exec(kyr)?.[1] ?? '';
      cast.push([id, table, /Calling (\w+)/.exec(person)?.[1] ?? 'commoner']);
    }
    // The ring's ranks are in it, each with the calling the module gives them.
    const named = new Map(cast.map(c => [c[0], c[2]]));
    expect(named.get('lieutenant')).toBe('thief');
    expect(named.get('principal')).toBe('warrior');
    expect(named.get('bravos')).toBe('warrior');
    expect(named.get('cell')).toBe('commoner');
    for (const [id, table, calling] of cast) {
      for (const [terrain, group] of Object.entries(tables[table]!.groups)) {
        for (const e of group) {
          const race = value(e);
          expect([id, terrain, race, classes(race)?.includes(calling)]).toEqual([id, terrain, race, true]);
        }
      }
    }
  });

  it('keeps the dwarf out of the lieutenant\'s table, where a dwarf thief cannot be cast', () => {
    const tables = JSON.parse(readFileSync(`${dir}/factors/tables.json`, 'utf8')) as Record<string, { groups: Record<string, Entry[]> }>;
    expect(classes('dwarf')).not.toContain('thief');
    for (const group of Object.values(tables.lieutenantFolk!.groups)) { expect(group.map(value)).not.toContain('dwarf'); }
  });

  it('checks the folk-keyed tables of the other goings-on, where each ancestry draws a calling', () => {
    for (const m of modules) {
      const tables = JSON.parse(readFileSync(`${dir}/${m}/tables.json`, 'utf8')) as Record<string, { discriminator: string; groups: Record<string, Entry[]> }>;
      for (const [name, t] of Object.entries(tables)) {
        if (t.discriminator !== 'folk') { continue; }
        for (const [race, group] of Object.entries(t.groups)) {
          for (const e of group) {
            const calling = value(e);
            if (!Object.keys(Canon.classes ?? {}).includes(calling) && !['warrior', 'mage', 'thief', 'cleric', 'bard', 'ranger', 'monk', 'commoner'].includes(calling)) { continue; }
            expect([m, name, race, calling, classes(race)?.includes(calling)]).toEqual([m, name, race, calling, true]);
          }
        }
      }
    }
  });
});
