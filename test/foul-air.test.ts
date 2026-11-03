import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Quittance's bg 7 (QTC-A08): `Hurts … when foul then foul`, a danger met on every crossing, had turned back every
// company that braved it, the way being as dangerous after the risk as before. A risk taken carries the company over,
// and the next crossing is a risk again.
describe('a danger on every crossing', () => {
  it('lets the company over each time, and is risked again each time', async () => {
    const j = await Journey.start('test/fixtures/probes/foul-air/probe.campaign.json');
    await j.play('To the sump — risk foul air › Ama goes first');
    expect(j.at('party')).toBe('p__sump');
    expect(j.latest).not.toMatch(/turn back/);
    await j.play('To the cradle — risk foul air › Ama goes first');
    expect(j.at('party')).toBe('p__cradle');
    expect(j.latest).toMatch(/constitution/);
    expect(j.holds('state', 'air', 'foul')).toBe(true);
  }, 60000);
});
