import { describe, expect, it } from 'bun:test';
import { FightStage } from '../web/reader/stage/fight-stage';

// A fight decided is pressed on to its end at once (the cold review's REV-16: a mud elemental at one hit point
// clicked at for a dozen turns): offered only when every foe standing is at half its strength or less and every one
// of the company above half.
describe('pressing a fight on', () => {
  const f = (hp: number, maxHp = 10) => ({ hp, maxHp });
  it('is offered when the foes are worn down and the company is not', () => {
    expect(FightStage.decided({ foes: [f(2), f(0)], allies: [f(9)] })).toBe(true);
  });
  it('is not offered while a foe is strong, someone of the company is hurt, or no foe stands', () => {
    expect(FightStage.decided({ foes: [f(6)], allies: [f(9)] })).toBe(false);
    expect(FightStage.decided({ foes: [f(2)], allies: [f(9), f(4)] })).toBe(false);
    expect(FightStage.decided({ foes: [f(0)], allies: [f(9)] })).toBe(false);
  });
});
