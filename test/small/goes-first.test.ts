import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Journey } from '../../src/session/journey';
import type { CreatureStore } from '../../src/creature-store';

// Who goes first, asked only where it matters (OR-1873, the cold-play review's Wave 2): a hazard on a way is risked by
// one row where what it would do is said alike whoever goes first, the most whole of the company named on it; where it
// would do one of them worse than another (it could kill one, and only hurt the other), each is asked.
const arch = (deal: number) => `
  Place fore "the forecourt" is room at 0, 0.
  Place long "the long passage" is room at 1, 0.
  Hazard dart "a poisoned dart" means "Deal (${deal}) physical damage to ally.".
  Passage arch "the low arch" between fore and long.
  Thing rune "the glowing rune" on arch {
    State live dangerous "It glows.". State dark "It is dark.".
    Hurts with dart when live then dark.
  }
  Company party "You" of 2 at fore.
  Goal false.`;
const two = [{ name: 'Odile', raceId: 'human', classId: 'warrior' }, { name: 'Reed', raceId: 'human', classId: 'warrior' }];
const risks = (t: Tiny) => Journey.of(t.session).choices().filter(c => /^risk\(/.test(c.command ?? '')).map(c => c.label);
const hurt = (t: Tiny, who: number, hp: number) => {
  const store = (t.session.campaign as unknown as { creatures: CreatureStore }).creatures;
  const lease = store.acquire(t.session.campaign.state.partyIds);
  try { lease.creatures[who]!.state.hp = hp; lease.commit(lease.creatures); } finally { lease.release(); }
};
describe('who goes first at a hazard', () => {
  it('is asked once where it would do the same to each, the most whole of the company named', async () => {
    const t = await Tiny.start(arch(1), { horizon: ['probing'], party: two });
    const hp = t.session.campaign.readout.creatures.filter(c => t.session.campaign.state.partyIds.includes(c.id))
      .map(c => c.state.hp);
    const whole = hp[0]! >= hp[1]! ? 0 : 1, names = ['Odile', 'Reed'];
    expect(risks(t)).toEqual([`To the long passage — risk the glowing rune — ${names[whole]} goes first`]);
    // The one who was most whole hurt, the other goes first.
    hurt(t, whole, 4);
    expect(risks(t)).toEqual([`To the long passage — risk the glowing rune — ${names[1 - whole]} goes first`]);
  });
  it('is asked of each where it would do one of them worse', async () => {
    const t = await Tiny.start(arch(6), { horizon: ['probing'], party: two });
    hurt(t, 0, 3);
    expect(risks(t).map(l => /(\w+) goes first/.exec(l)?.[1]).sort()).toEqual(['Odile', 'Reed']);
  });
});
