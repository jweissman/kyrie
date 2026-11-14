import { describe, expect, it } from 'bun:test';
import { CastingAudit } from '../../scripts/casting-audit';

// The casting-fiction invariant, held at what it is today (the owner, 15 November: every authored action that changes
// the world by magic resolves through a named ability, item, ritual, environmental mechanism or canonical technique;
// see doc/architecture/mission-21/casting-fiction.md). The audit begins from the consequence (an action that slays or
// restores). Two undertown actions are known debt: a calling alone, free, slaying outright where a sleep or a fire
// should run the ordinary rules. The debt may shrink and may not grow: a new consequential action gated on a calling
// alone fails here, and wants a named capability (an ability invoked, or an item held and spent).
const found = CastingAudit.all();
const known = ['{t}_u_rats_slept', '{t}_u_brood_spelled'];
describe('the casting-fiction audit', () => {
  it('finds the consequential actions, each by its means', () => {
    expect(found.length).toBeGreaterThanOrEqual(14);
    expect(found.find(f => f.name === '{t}_u_nest_burned')).toMatchObject({ means: 'item', cost: ['spend', 'time'] });
    expect(found.find(f => f.name === '{t}_u_rats_slept')).toMatchObject({ means: 'calling', cost: ['time'] });
  });
  it('lets no new action slay or restore on a calling alone', () => {
    const alone = found.filter(f => f.means === 'calling').map(f => f.name);
    expect(alone.filter(name => !known.includes(name))).toEqual([]);
  });
  it('lets no new action slay or restore with no named means at all', () => {
    expect(found.filter(f => f.means === 'bare').length).toBeLessThanOrEqual(8);
  });
});
