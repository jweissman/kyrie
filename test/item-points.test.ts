import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { ModuleParser } from '../src/lang/module-parser';
import { Canon } from '../src/canon/canon';

// What a thing points toward is one of the canon's identities (the owner, 6 November: the Dun Rìerdan waystone points
// its bearer to Dun Rì, the City of Seven Towers, a metropolis of Imbar; no coordinates, and no second city made for
// it), so that it resolves to wherever a world builds that one.
describe('what a thing points toward', () => {
  it('is an identity the canon holds: the waystone, Dun Rì', () => {
    const canon = ModuleParser.parse(readFileSync('data/imbar/house.kyr', 'utf8'));
    const identities = new Set(canon.entities.filter(e => e.type === 'identity').map(e => e.id));
    const pointing = Object.entries(Canon.items).filter(([, i]) => i.points);
    expect(pointing.map(([id, i]) => [id, i.points])).toContainEqual(['dun_rierdan_waystone', 'dun_ri']);
    expect(pointing.filter(([, i]) => !identities.has(i.points!)).map(([id]) => id)).toEqual([]);
  });
});
