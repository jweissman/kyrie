import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// A Winter in Carth's 10 (CTH-10): persuading Will, lying to Raistrick and talking the Row out were actions among the
// actions, not in the talk, so the conversation felt thinner than the design. An action said to someone (its Speaker)
// stands in the talk with them, among what can be asked, and may roll: the page says the odds, and their answer is
// its Result or its Otherwise.
describe('a word said to someone that may not come off', () => {
  it('is offered in the talk with them, with its odds, and answered by how it went', async () => {
    const j = await Journey.start('test/fixtures/probes/spoken-roll/probe.campaign.json');
    await j.play('Talk to Will');
    const ask = j.find('Will Scaife, a farmer keeping a vigil: Ask Will to light the hearth');
    expect(ask?.label).toMatch(/an even chance$/);
    const told = await j.play('Ask Will to light the hearth');
    expect(told).toMatch(/gets up, and you hear him at the mantel|hears you out in the dark, and does not move/);
    expect(j.holds('p__consented', 'p__will') || j.holds('p__tried', 'party')).toBe(true);
  }, 30000);
});
