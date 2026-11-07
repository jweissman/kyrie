import { describe, expect, it } from 'bun:test';
import { Sennet } from './support/sennet';

// The Grand Tour, what the company is for (doc/imbar/adventures/the-grand-tour.md): the shipped bard, Tamsin, alone,
// played by the labels a player sees, on the same fixture route as test/the-grand-tour.test.ts. Nothing here is given,
// put or asserted.
const upToCloudgate = ['fire', 'fabian_earth', 'whelm', 'cloudgate'];
const toDrawingRoom = ['=day 3 11:00', '>sennet__winch_floor', 'Go up in the basket|Pay five coin', '>sennet__balustrade',
  '=day 3 13:00', '>sennet__drawing_room'];
const toEyrie = ['now that her son is let down', '>sennet__wind_court', '>sennet__air_threshold', '>sennet__gallery',
  'Talk to the sylphs', 'about the Air petal', 'how you might be received', 'one true thing', '>sennet__eyrie',
  'Talk to Tramontane', 'the hill is still there'];

describe('The Grand Tour, the bard', () => {
  it('has the shipped bard hear the Quay, the Roll, the drowned street and the rail, once each', async () => {
    const g = await Sennet.start();
    await g.fixture('tour', ...upToCloudgate);
    await g.play('>sennet__quay', '>sennet__hall_of_doors', '=day 3 11:00', '>sennet__winch_floor', 'Go up in the basket|Pay five coin',
      '>sennet__balustrade');
    for (const heard of ['heardQuayCries', 'heardRoll', 'heardDrownedStreet', 'heardBalustrade']) {
      expect(g.holds(heard, 'party')).toBe(true);
    }
    expect(g.page.match(/Always the same four notes/g)?.length).toBe(1);
  }, 600000);
  it('lets the bard, alone, give the North Wind his answer without the letter, the Dowager, or the petal back', async () => {
    const g = await Sennet.start();
    await g.fixture('tour', ...upToCloudgate);
    await g.play('>sennet__quay');
    expect(g.knows('ysabeau_ballad')).toBe(false);
    await g.play('Ask Old Bethan for the last verse');
    expect(g.knows('ysabeau_ballad')).toBe(true);
    await g.play(...toDrawingRoom);
    expect(g.knows('casement_known')).toBe(true);
    await g.play(...toEyrie);
    expect(g.holds('tramontaneHeard', 'tramontane')).toBe(true);
    // The song is offered where the North Wind stands, and only to one who has the verse and has seen the casement.
    expect(g.j.offers('Sing the North Wind the last verse')).toBe(true);
    expect(g.carries('ysabeau_letter')).toBe(false);
    expect(g.holds('imogenSorry', 'imogen')).toBe(false);
    await g.play('Sing the North Wind the last verse');
    expect(g.holds('giftRenewed', 'sennet_bay')).toBe(true);
    expect(g.holds('airHome', 'sennet_bay')).toBe(false);
    expect(g.page).toMatch(/Latched to nothing/);
  }, 600000);
  it('does not offer the verse to a company without a bard', async () => {
    const t = await Sennet.start(undefined, 'thief-bethan', Sennet.one('thief', 'burglar'));
    await t.play('>sennet__quay');
    expect(t.j.offers('Ask Old Bethan for the last verse')).toBe(false);
    expect(t.page).not.toMatch(/Always the same four notes/);
    expect(t.knows('ysabeau_ballad')).toBe(false);
  }, 300000);
});
