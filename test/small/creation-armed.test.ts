import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationRules } from '../../web/reader/creation-rules';
import { ReaderOpening } from '../../web/reader/reader-opening';
import type { Member } from '../../web/engine/protocol';
import type { ReaderApp } from '../../web/reader/reader-app';

// The one made sets out with the weapon creation showed them with (the second blind playtest, 15 November: "A battleaxe
// in hand" of a dwarf warrior who set out with the calling's longsword, because her origin brought a bard along and
// the weapon she was shown was given only to one who came alone). Whoever comes with them is left as they are.
describe('setting out', () => {
  it('arms the one made as creation showed, with a companion beside them', () => {
    const catalog = Creation.catalog(), calling = catalog.callings.find(c => c.id === 'warrior')!;
    const made = { name: 'Thora', raceId: 'dwarf', classId: 'warrior', rolled: { strength: 16, dexterity: 9,
      constitution: 14, intelligence: 10, wisdom: 11, charisma: 8 } } as unknown as Member;
    const bard = { name: 'Ander', raceId: 'human', classId: 'bard' } as unknown as Member;
    const app = { state: { setting: { generated: true }, catalog, party: [made, bard], campaign: 'world', seed: 'kite' },
      props: { query: new URLSearchParams() } } as unknown as ReaderApp;
    const party = (new ReaderOpening(app) as unknown as { starting(): { party: Member[] } }).starting().party;
    expect(party[0]!.weapon).toBe(CreationRules.best(calling.weapons, made, catalog)!.id);
    expect(party[1]).toEqual(bard);
  });
});
