import { describe, expect, it } from 'bun:test';
import { Alone } from '../support/alone';
import type { Journey } from '../../src/session/journey';

// The deserters' sergeant knows a company he has stopped before (WM-09, split from WM-01): his whole speech at the
// first stop, and a line of his own each time after, the toll asked the same. The toll-road kit's deserters alone on a
// road of two rooms and a bar (see Alone); what the country binds stays in test/generated-economy.
const host = `
  Place town "Hythe" is settlement.
  Place green "the green" is room within town at 0, 0 outdoors.
  Place bar "the bar on the road" is room within town at 1, 0 outdoors.
  Place far "the far end of the road" is room within town at 2, 0 outdoors.
  Passage near_road "the road to the bar" is road between green and bar taking 10 minutes.
  Passage far_road "the road on" is road between bar and far taking 10 minutes.
  Person innkeeper "Mag" at green { Role "who keeps the inn". Ancestry human. Peaceable. Pronouns she. }
  Company party "You" of 1 at green.`;
const first = 'Four coin, the lot of you', again = 'Same as before';
class Toll {
  static async start(): Promise<Journey> {
    const a = await Alone.start({ id: 'toll', bundle: '../../data/kits/toll-road/deserters/module.json', host,
      exports: ['green', 'bar', 'far', 'innkeeper'], imports: { post: 'bar', market: 'green', provider: 'innkeeper' } });
    a.journey.coin(20);
    return a.journey;
  }
}

describe('the deserters\' sergeant at his bar', () => {
  it('says his whole speech only the first time he stops a company, and asks the toll again in a line of his own', async () => {
    const j = await Toll.start();
    const stopped = await j.play('To the bar on the road');
    expect(stopped).toContain(first);
    expect(j.offers('Pay the deserters\' toll')).toBe(true);
    await j.play('To the green');
    const back = await j.play('To the bar on the road');
    expect(back).not.toContain(first);
    expect(back).toContain(again);
    expect(j.offers('Pay the deserters\' toll')).toBe(true);
  });
  it('waves a company through that has paid, the same day, with nothing said', async () => {
    const j = await Toll.start();
    await j.play('To the bar on the road', 'Pay the deserters\' toll, four coin', 'To the far end of the road');
    const back = await j.play('To the bar on the road');
    expect(back).not.toContain(first);
    expect(back).not.toContain(again);
  });
});
