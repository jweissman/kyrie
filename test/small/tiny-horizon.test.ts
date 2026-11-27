import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A fragment proved on a horizon (OR-407; the owner, 24 November: "just testing a tiny rule doesn't pull in the
// universe"): the kernel of the shared rules and the packages named, each with what it declares it reads
// (data/rules/packages.json), no canon unless named. A read beyond it fails, said as one: the name, the package that
// declares it, and the horizon. Unnamed, a tiny world is on the whole set, as it always was.
const yard = (extra = '') => `Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.
  ${extra} Goal false.`;
describe('a tiny world on a horizon', () => {
  it('is the kernel alone where nothing is named: no canon, no fight, no trade, no care', async () => {
    const t = await Tiny.start(yard(), { horizon: [] });
    const relations = new Set(t.campaign.module.relations.map(r => r.name));
    expect(['knows', 'joinedAs', 'assumesFalse', 'passageKind'].filter(r => !relations.has(r))).toEqual([]);
    expect(['hungry', 'soldBy', 'captured', 'canCast', 'seatOf'].filter(r => relations.has(r))).toEqual([]);
    expect(t.campaign.installed).toEqual(['t']);
  });
  it('fails a read beyond it, naming the package that declares what was read', async () => {
    await expect(Tiny.start(yard('Initially Assert hungry(party).'), { horizon: [] }))
      .rejects.toThrow(/Beyond the horizon: hungry is declared by needs, outside the kernel .*name needs in/);
    await expect(Tiny.start(yard('Initially Assert captured(party, party).'), { horizon: ['needs'] }))
      .rejects.toThrow(/captured is declared by dominion, outside the kernel and needs \(core, passages, people/);
  });
  it('holds what the packages named read, and plays it', async () => {
    const t = await Tiny.start(yard('Initially Assert hungry(party).'), { horizon: ['needs'] });
    expect(t.journey.holds('hungry', 'party')).toBe(true);
    const kept = await Tiny.start(yard('Initially Assert keeps(party, yard).'), { horizon: ['inhabitants'] });
    expect(kept.journey.holds('keeps', 'party', 't__yard')).toBe(true);
  });
  it('is the whole of the shared rules and the canon where no horizon is given', async () => {
    const t = await Tiny.start(yard());
    const relations = new Set(t.campaign.module.relations.map(r => r.name));
    expect(['hungry', 'soldBy', 'captured', 'canCast', 'seatOf'].filter(r => !relations.has(r))).toEqual([]);
  });
  it('takes a horizon or its rules, never both', async () => {
    await expect(Tiny.start(yard(), { horizon: [], rules: ['world'] })).rejects.toThrow(/horizon or its rules/);
  });
});
