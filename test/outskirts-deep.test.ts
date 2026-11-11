import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const start = async (classId = 'warrior') => Journey.of(await DrawnWorld.start('kahitude', { origin: 'debt',
  party: [{ name: 'Ralf', raceId: 'human', classId }] }, NodeBundleSource.shared));
const r = (id: string) => `region__${id}`;
const key = async (j: Journey) => {
  await j.play('>s1_manor_kitchen', 'Ask Orla Pennick what is the matter with the cellar', '>s1_manor_cellar');
  await j.fight('Attack');
  await j.play('>s1_manor_kitchen', 'Tell Orla Pennick the cellar is clear', 'Ask Orla Pennick about the muniment press',
    'press key: Take', '>s1_manor_library', 'Unlock the press-door');
};

// The Hall below stairs and in its papers, and the old stones below the dome (outskirts-deep.kyrt):
// a cook with a cellar of rats and a key, a boy who hums, a gamekeeper at a chain, a reeve with a grievance, and an
// Imperial grant that settles the quarrel over the road-wood. Played by the page's own words from the Hall's forecourt.
describe('the Hall, below stairs and in its papers', () => {
  it('pays a cook for her rats, gives up the old press key, and opens the muniment room by it', async () => {
    const j = await start();
    await j.play('>s1_manor_kitchen');
    expect(j.offers('Ask Orla Pennick about the muniment press')).toBe(false);
    await key(j);
    expect(Placed.holds(j, 'state', r('s1_manor_press'), 'region__open')).toBe(true);
    expect(j.campaign.world.related('state').some(x => x.args[0] === r('s1_manor_press') && x.args[1] === 'region__open')).toBe(true);
    await j.play('>s1_manor_muniments');
    expect(j.campaign.world.one('at', 'party')).toBe(r('s1_manor_muniments'));
  }, 180000);

  it('lets a thief in without the cook: the press-door is broken, the house notices, and the steward reads it all the same', async () => {
    const j = await start('thief');
    await j.play('>s1_manor_library');
    expect(j.offers('Unlock the press-door with the old key')).toBe(false);
    await j.play('Pick the press-door\'s lock');
    expect(Placed.holds(j, 'state', r('s1_manor_press'), 'region__broken')).toBe(true);
    await j.play('>s1_manor_hall', 'Ask the steward of the Hall to read the parchment in the press');
    expect(Placed.holds(j, 'knows', 'party', r('s1_roadwood_grant'))).toBe(true);
  }, 180000);

  it('settles the road-wood by the Empire’s grant, read aloud by the steward: reeve pays, Hall thanks, keeper joins, town remembers', async () => {
    const j = await start();
    await key(j);
    await j.play('>s1_manor_hall', 'Ask the steward of the Hall to read the parchment in the press');
    expect(Placed.holds(j, 'knows', 'party', r('s1_roadwood_grant'))).toBe(true);
    await j.play('>s1_green', 'Ask Aldous Fenn about the chain at the Hall', 'Tell Aldous Fenn what the grant says');
    expect(Placed.holds(j, 'region__s1_roadwood_shared', 'party')).toBe(true);
    await j.play('>s1_manor_hall', 'Show the steward of the Hall the grant', '>s1_manor_front');
    expect(j.offers('Ask Wystan Hale to join the company')).toBe(true);
    await j.play('Ask Wystan Hale to join the company');
    expect(j.campaign.world.related('travelsWith').some(x => x.args[0] === r('s1_manor_keeper'))).toBe(true);
  }, 240000);

  it('leaves the keeper at his chain, and the reeve sour, if the grant is given to the Hall alone', async () => {
    const j = await start();
    await key(j);
    await j.play('>s1_manor_hall', 'Ask the steward of the Hall to read the parchment in the press',
      'Give the steward of the Hall the grant, and say nothing to the reeve');
    expect(Placed.holds(j, 'region__s1_roadwood_hall', 'party')).toBe(true);
    await j.play('>s1_green');
    expect(j.offers('Tell Aldous Fenn what the grant says')).toBe(false);
    await j.play('>s1_manor_front');
    expect(j.offers('Ask Wystan Hale to join the company')).toBe(false);
  }, 240000);
});

describe('the old stones, below the dome', () => {
  it('has an undercroft whose cup, set back in its niche, mends the boy at the Hall; and a tunnel from the cellar to it', async () => {
    const j = await start();
    await j.play('>s1_manor_cellar').catch(() => '');
    await j.fight('Attack').catch(() => '');
    await j.play('light a torch', 'Search here');
    expect(j.takes('Into the old stones')).toBe(true);
    Placed.at(j, r('s1_stones_under'));
    await j.play('cup of the old stones: Take').catch(() => '');
    await j.fight('Attack').catch(() => '');
    expect(Placed.carried(j, r('s1_stones_cup'))).toBe(true);
    await j.play('Set the bronze cup back in its ring of dust');
    expect(Placed.holds(j, 'region__s1_tam_well', 'party')).toBe(true);
  }, 240000);
});
