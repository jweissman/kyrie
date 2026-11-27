import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../../../src/client/drawn-world';
import { NodeBundleSource } from '../../../src/campaign/node-bundle-source';
import { Journey } from '../../../src/session/journey';
import { WorldAssembler } from '../../../src/world/world-assembler';
import { DebtShapes } from '../../../src/world/debt-shapes';

// The debt's chain drawn from the country (src/world/debt-shapes.ts; the difference census's second proposal): the
// same warrior owing the same fifty coin is set a different chain in each of three worlds, and each is a whole chain
// played to the debt squared. a1: what was lost at the ford is for sale downstream, claimed and carried home; ash: a
// load carried for the creditor's trade, and the purse brought back; thorn: the salvage the inn tells of.
class Debt {
  static async start(seed: string) {
    const j = Journey.of(await DrawnWorld.start(seed, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    const region = WorldAssembler.region(seed, [0, 0]);
    const home = region.settlements.find(t => t.size === 'town') ?? region.settlements[0]!;
    const other = DebtShapes.other(region, home)!;
    return { j, creditor: `region__${home.id}_merchant`, other: `region__${other.id}_merchant` };
  }
  static aims(j: Journey): string { return (j.screen().aims ?? []).map(a => a.text).join(' | '); }
}
describe('the debt, as each country sets it', () => {
  it('a1: what went into the river is for sale downstream, claimed, and carried home', async () => {
    const { j, creditor, other } = await Debt.start('a1');
    await j.play('whether anything was ever found');
    expect(Debt.aims(j)).toContain('claim it from the merchant there');
    await j.play(`>${other}`);
    j.roll('pass');
    await j.play('Tell the merchant at .* is yours');
    j.roll();
    expect(j.holds('origin__lostClaimed', 'party')).toBe(true);
    await j.play(`>${creditor}`, 'back');
    expect(j.holds('origin__squared', 'party')).toBe(true);
  }, 300000);
  it('ash: a load carried for the creditor\'s trade, and the purse brought back square', async () => {
    const { j, creditor, other } = await Debt.start('ash');
    await j.play('to take the debt in work');
    expect(Debt.aims(j)).toContain('and the debt to');
    await j.play(`>${other}`, ' from ');
    expect(Debt.aims(j)).toContain('and you are square');
    await j.play(`>${creditor}`, 'the purse from');
    expect(j.holds('origin__squared', 'party')).toBe(true);
  }, 300000);
  it('thorn: the salvage, sent to the inn to hear what is out in the country round', async () => {
    const { j } = await Debt.start('thorn');
    await j.play('Tell .* you will have it by market day');
    expect(Debt.aims(j)).toContain('what is out in the country round');
  }, 300000);
});
