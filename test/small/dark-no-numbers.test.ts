import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ScreenModel } from '../../src/ui/screen-model';

// In the dark nothing is seen of how many are hurt, how seasoned or how hardy they are (the architecture review's H5,
// AP-15: a foe's exact hit points had been shown in pitch dark). The same room lit tells them. A hall with a rat in it.
const hall = (lit: boolean) => `
  Place hall "the hall" is room at 0, 0 indoors.
  ${lit ? '' : 'Initially Assert unlit(hall).'}
  Company party "You" of 1 at hall.
  Person rat "a rat" at hall { Role "a rat in the straw". Species rat. Numbers 1. Level 1. }
  Goal false.`;
const look = async (lit: boolean) => {
  const t = await Tiny.start(hall(lit), { horizon: ['inhabitants'] });
  return ScreenModel.build(t.campaign).people.find(p => /rat/.test(p.name))?.look;
};
describe('the dark', () => {
  it('shows a foe\'s numbers only where the company can see', async () => {
    expect(await look(false)).toBeUndefined();
    expect(await look(true)).toMatch(/HP/);
  });
});
