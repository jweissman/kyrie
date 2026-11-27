import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('the field of the returning', () => {
  it('can fight the returning fighters again after they rise', async () => {
    const started = await Journey.start(campaign, 'long-road');
    const checkpoint = started.session.checkpoint();
    // Isolate repeat encounters from the starting company's ability to survive them.
    for (const member of checkpoint.save.creatures.filter(c => checkpoint.save.state.partyIds.includes(c.id))) {
      member.base.maxHp = 300;
      member.state.hp = 300;
    }
    const j = Journey.of(PlaySession.resume(checkpoint));
    Placed.at(j, 'tallow__lc_ring');
    await j.play('Ask the keeper what is beyond the ring', 'Ask why the keeper watches the field');
    expect(j.offers('Tell the keeper how the fighters fell three times')).toBe(false);
    Placed.at(j, 'tallow__lc_war_door');
    for (let cycle = 0; cycle < 3; cycle++) {
      await j.fight('To the field of the returning');
      expect(j.taken.at(-1)!.event.combat.some(e => e.type === 'initiative')).toBe(true);
      expect(j.holds('able', 'lc_shades')).toBe(false);
      expect(j.measure('lcReturnsOvercome', 'party')).toBe(cycle + 1);
      await j.play('To the door of spears');
      await j.play(`==${j.measure('lcShadesDue', 'lc_shades') + 1}`);
      expect(j.holds('able', 'lc_shades')).toBe(true);
    }
    Placed.at(j, 'tallow__lc_ring');
    const gold = j.measure('quantity', 'party', 'gold');
    await j.play('Tell the keeper how the fighters fell three times');
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold + 5);
    expect(j.offers('Tell the keeper how the fighters fell three times')).toBe(false);
  }, 10000);
});
