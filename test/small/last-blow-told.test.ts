import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner } from '../../src/cli/runner';
import { Obituary } from '../../src/narrative/obituary';
import { BlowWeight } from '../../src/blows/blow-weight';
import type { CombatEvent } from '../../src/model';

// The ending tells the last blow as the fight told it (OR-691, cold play 1, T113: the fight's last blow "for 6", the
// ending's "for 2"): a blow that lays its mark low is told whole, not by what the mark had left to lose (BlowWeight).
const den = `
  Place den "the den" is room at 0, 0 outdoors.
  Company party "You" of 1 at den.
  Person bear "the barrow-king" at den { Role "the last king of the barrow". Species revenant. Level 5. Temperament territorial. Lair den. }
  Goal false.`;
describe('the last blow of a fight lost', () => {
  it('is told by the ending as the fight told it', async () => {
    let tried = 0;
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const t = await Tiny.start(den,
        { seed, party: [{ name: 'Ama', raceId: 'human', classId: 'mage' }], horizon: ['inhabitants'] });
      const r = new Runner(t.session); r.said();
      await r.ask(JSON.stringify({ act: 'attack(t__bear)' }));
      await r.ask(JSON.stringify({ act: 'fight:through' }));
      if (t.campaign.running) { continue; }
      const last = [...t.campaign.history].reverse().find(e => e.combat.some(c => c.type === 'death'))!;
      const blow = [...last.combat].reverse().find((c): c is Extract<CombatEvent, { type: 'damage' | 'heal' }> =>
        c.type === 'damage' && c.target === t.campaign.readout.partyIds[0]);
      if (!blow?.amount) { continue; }
      tried++;
      const said = Obituary.of(t.campaign).lines.find(l => /struck the last blow/.test(l))!;
      expect(said).toContain(`, for ${BlowWeight.of(blow)}.`);
      if (blow.hp === 0 && (blow.rolled ?? 0) > blow.amount) { return; }
    }
    expect(tried).toBeGreaterThan(0);
  });
});
