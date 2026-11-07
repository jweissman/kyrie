import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Endings } from '../src/lang/endings';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/sallowfield/journey.json';

// Three Nights at Sallowfield, played by the labels a player sees (see Journey for the steps it takes): a coach with a
// cracked axle, sixty villagers, and a captain with forty unpaid men. Each ending is a different way of spending the
// two days, played from the road; none is entered by a teleport. The dawn of the third day is about 05:00 on day 4.
describe("Three Nights at Sallowfield", () => {
  const campaign = 'data/campaigns/sallowfield.campaign.json';
  const start = async (forced = true) => {
    const j = await Journey.start(campaign, "sallowfield");
    if (forced) { j.roll('pass'); }
    return j;
  };
  const ending = (j: Journey) => Endings.reached(j.campaign.world)?.title;
  const held = (j: Journey, relation: string, ...args: string[]) => j.holds(relation, ...args);
  const argue = 'Argue with the picked men that there is nothing here worth their dying';
  const yielded = 'Tell the picked men they may have the granary, and go';
  // The picked men come to the company at the end of the fourth movement (midnight) and give it a moment: the long
  // wait stops short of that and the last hours are waited by the hour, so the stand at the end is played, not slept
  // through. `stand` is what the company does when they come.
  const toDawn = async (j: Journey, stand = yielded) => {
    if (j.watch() < 378) { await j.play('=day 3 23:00'); }
    for (let i = 0; i < 24 && ending(j) === undefined && j.campaign.running; i++) {
      await j.play(j.choices().some(c => c.label.startsWith(stand)) ? stand : 'Wait › An hour');
    }
  };

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('opens on the east road with a coach and a clock that has not struck', async () => {
    const j = await start(false);
    expect(j.at('party')).toBe('sallowfield__east_road');
    expect(j.choices().map(c => c.label)).toContain('Talk to Ned Teasdale');
    expect(ending(j)).toBeUndefined();
    await j.play('To the ford stones');
    expect(j.at('party')).toBe('sallowfield__ford_stones');
  }, 60000);

  it('is held at a cost: every work, the scout, the stone refused, the ford held by the company, the picked men argued off', async () => {
    const j = await start();
    await j.play(...steps.muster, ...steps.works, 'To Sallowfield green', ...steps.reeds, ...steps.sendTruth, ...steps.parley, ...steps.refuse,
      ...steps.hobToTheMill);
    await toDawn(j, argue);
    expect(held(j, 'heldScout', 'lowes')).toBe(true);
    expect(held(j, 'barricadeUp', 'party')).toBe(true);
    expect(held(j, 'bridgeCut', 'party')).toBe(true);
    expect(held(j, 'evacuated', 'party')).toBe(true);
    expect(j.measure('overrunCount', 'party')).toBeLessThanOrEqual(1);
    expect(held(j, 'overrun', 'ford_stones')).toBe(false);
    expect(held(j, 'picksWithdrawn', 'party')).toBe(true);
    expect(ending(j)).toBe('Held, at a Cost');
  }, 300000);

  it('the same play, saved at the stone and brought back, ends the same way', async () => {
    const j = await start();
    await j.play(...steps.muster, ...steps.works, 'To Sallowfield green', ...steps.reeds, ...steps.sendTruth, ...steps.parley, ...steps.refuse);
    const again = Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint()))));
    again.roll('pass');
    expect(again.at('party')).toBe('sallowfield__ford_stones');
    expect(held(again, 'bridgeCut', 'party')).toBe(true);
    expect(held(again, 'heldScout', 'lowes')).toBe(true);
    await again.play(...steps.hobToTheMill);
    await toDawn(again, argue);
    expect(ending(again)).toBe('Held, at a Cost');
  }, 300000);

  // What Wyre does depends on what the boy saw, or was told to say; and he saw what stood when he left, no later.
  describe('the captain reads the works', () => {
    const thrust = (j: Journey) => ['ford_stones', 'bridge', 'mill_yard'].map(p => j.measure('thrust', p));
    const built = ['To the ford meadow', 'To Sallowfield green', 'To the packhorse bridge', 'Prise out the keystone of the near arch', 'To Sallowfield green'];
    const toReeds = ['To the ford meadow', 'To the reed marsh', '=day 2 17:40'];
    const held = ['Take the boy in the reeds before he sees you', 'To the ford meadow', 'To Sallowfield green', 'Into the Ploughshare',
      'Ask the boy what he was doing in the reeds', 'Tell the boy he will be fed and sent home when it is over'];
    const run = async (before: string[], after: string[]) => {
      const j = await start();
      await j.play(...steps.muster, ...steps.toTheFord, ...before, ...after, '=day 3 08:00');
      return j;
    };
    it('leans on the mill when the boy sees the wall and the cut and goes loose', async () => {
      const j = await run([...steps.wall, ...built, ...toReeds], ['=day 2 19:00']);
      expect(thrust(j)).toEqual([6, 2, 12]);
    }, 300000);
    it('leans on the ford when the boy is held and sent back with a lie', async () => {
      const j = await run([...steps.wall, ...built, ...toReeds], [...held, 'Send the boy back to Wyre with a lie']);
      expect(thrust(j)).toEqual([14, 2, 0]);
    }, 300000);
    it('does not know what is built after the boy has gone', async () => {
      const j = await run(toReeds, ['=day 2 19:00', 'To the ford meadow', 'To the ford stones', ...steps.wall, ...built]);
      expect(thrust(j)).toEqual([12, 7, 3]);
    }, 300000);
  });

  it('is half saved when the ford is walled, the helpless sent up the fold, and the grain given', async () => {
    const j = await start();
    await j.play(...steps.muster, ...steps.evacuate, ...steps.toTheFord, ...steps.wall);
    await toDawn(j);
    expect(held(j, 'greenBurns', 'party')).toBe(true);
    expect(held(j, 'evacuated', 'party')).toBe(true);
    expect(held(j, 'grainGiven', 'party')).toBe(true);
    expect(ending(j)).toBe('Half Saved');
  }, 300000);

  it('is ash when the ford is walled and the helpless are left in their beds', async () => {
    const j = await start();
    await j.play(...steps.muster, ...steps.toTheFord, ...steps.wall);
    await toDawn(j);
    expect(held(j, 'greenBurns', 'party')).toBe(true);
    expect(held(j, 'evacuated', 'party')).toBe(false);
    expect(ending(j)).toBe('Ash');
  }, 300000);

  it('falls to the picked men when the company stands and fights them, and the book closes on it', async () => {
    const j = await start();
    await j.play(...steps.muster, ...steps.toTheFord, ...steps.wall);
    await toDawn(j, 'Attack');
    expect(held(j, 'p4done', 'party')).toBe(true);
    expect(ending(j)).toBe('What the Steel Said');
  }, 300000);

  it('buys a peace that rots: the reeve\'s sixty, the plate Mowbray gave, and the grain', async () => {
    const j = await start();
    await j.play(...steps.muster, ...steps.payTheCaptain);
    expect(held(j, 'plateGiven', 'party')).toBe(true);
    expect(ending(j)).toBe('A Peace of Sixty Coin');
  }, 300000);

  it('ends in the next granary when the grain is fouled and the boy carries the word', async () => {
    const j = await start();
    await j.play(...steps.muster, ...steps.foulTheGrain);
    await toDawn(j);
    expect(held(j, 'grainSpoiled', 'party')).toBe(true);
    expect(held(j, 'wyreKnowsSpoiled', 'party')).toBe(true);
    expect(ending(j)).toBe('The Next Granary');
  }, 300000);

  it('turns the lieutenant on his captain', async () => {
    const j = await start();
    await j.play(...steps.muster, ...steps.toTheFord, '=day 1 22:00', ...steps.reeds);
    await j.play(...steps.buyTheLieutenant);
    await toDawn(j);
    expect(held(j, 'fothergillTurned', 'party')).toBe(true);
    expect(ending(j)).toBe("The Captain's Own");
  }, 300000);

  it('walks on south at once, and leaves it', async () => {
    const j = await start();
    await j.play(...steps.muster, ...steps.walkOn);
    expect(ending(j)).toBe('The Road South');
  }, 300000);

  it('takes the coach on when the smith mends the axle instead', async () => {
    const j = await start();
    await j.play(...steps.mendTheAxle, ...steps.walkOnLate);
    expect(held(j, 'coachMended', 'party')).toBe(true);
    expect(ending(j)).toBe('The Coach Goes On');
  }, 120000);
});
