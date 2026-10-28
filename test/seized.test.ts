import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// A temperament that takes whoever stays, with no fight: What Tessary Owes' Weights, bailiffs of bronze who seize the
// forsworn, were two level-eight constructs a level-three cleric took apart, since a fight could not say "you cannot
// win this" (its friction W9). Warned, the company has the rest of the watch; then it is taken, and what follows is the
// module's (captured).
describe('a seizing temperament', () => {
  it('warns, says how long it will wait, and then takes whoever stayed, with no fight', async () => {
    const j = await Journey.start('test/fixtures/probes/seized/probe.campaign.json', 'k');
    await j.play('To the black wall');
    expect(j.taken.at(-1)!.page).toContain('hold out their hands, palm up. Not yet.');
    expect(j.taken.at(-1)!.page).toContain('The Weights will wait 10 minutes more, no longer.');
    // The wait is told after the warning it belongs to (play 9 read it before).
    const page = j.taken.at(-1)!.page;
    expect(page.indexOf('Not yet.')).toBeLessThan(page.indexOf('will wait 10 minutes'));
    await j.play('Wait › A while');
    expect(j.taken.at(-1)!.page).toContain('The Weights take you by the arms');
    expect(j.taken.at(-1)!.event.combat).toEqual([]);
    expect(j.holds('captured', 'p__weights', 'party')).toBe(true);
    expect(j.at('party')).toBe('p__cells');
  }, 60000);
  it('lets one who heeds the warning go', async () => {
    const j = await Journey.start('test/fixtures/probes/seized/probe.campaign.json', 'k');
    await j.play('To the black wall', 'To the quay', 'Wait › An hour');
    expect(j.holds('captured', 'p__weights', 'party')).toBe(false);
    expect(j.at('party')).toBe('p__quay');
  }, 60000);
});
