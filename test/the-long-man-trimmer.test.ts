import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Long Man's lamp-trimmer (data/adventures/the-long-man/trimmer.kyr): a person the company meets in the chapel, who
// trims a lamp that is lit for no one living, tells gossip that gives a thread to Skeel and to the Pharos at Skerrow,
// and in a second beat (told what the notches count) lights a second wick. Played by the labels a player sees.
const home = 'data/campaigns/the-long-man.campaign.json';
const told = (j: Journey) => j.taken.map(x => `${x.page} ${x.told}`).join('\n');

describe('The Long Man, the lamp-trimmer', () => {
  it('is met in the chapel as a person, sells oil, and gives the gossip once as a thread to Skeel and to Skerrow', async () => {
    const j = await Journey.start(home, 'trimmer');
    await j.play('>taproom', '>green', '>nave');
    expect(j.at('longman__wethered')).toBe('longman__nave');
    expect(told(j)).toMatch(/Osmund Wethered, the lamp-trimmer/);
    expect(j.offers('Ask Osmund Wethered whom the lamp by the font is lit for')).toBe(true);
    expect(j.holds('knows', 'party', 'longman__wethered_gossip')).toBe(false);
    await j.play('Ask Osmund Wethered whom the lamp by the font is lit for');
    expect(told(j)).toMatch(/Holm at Skeel/);
    expect(told(j)).toMatch(/Skerrow, where the Pharos is/);
    expect(j.holds('knows', 'party', 'longman__wethered_gossip')).toBe(true);
    expect(j.offers('Ask Osmund Wethered whom the lamp by the font is lit for')).toBe(false);
    expect(j.offers('Tell Osmund Wethered what the notches')).toBe(false);
  }, 240000);

  it('has a second beat once the company knows what the notches count: a second wick, and the lamp burns with two flames', async () => {
    const j = await Journey.start(home, 'trimmer-two');
    j.assert('knows', 'party', 'longman__notches_known');
    j.put('party', 'longman__nave');
    await j.play('=+1');
    // The second beat is not offered before the first.
    expect(j.offers('Tell Osmund Wethered what the notches')).toBe(false);
    await j.play('Ask Osmund Wethered whom the lamp by the font is lit for');
    expect(j.offers('Tell Osmund Wethered what the notches')).toBe(true);
    await j.play('Tell Osmund Wethered what the notches');
    expect(told(j)).toMatch(/Light it for him until he does/);
    expect(j.holds('twoWicks', 'party')).toBe(true);
    await j.play('=+1');
    expect(told(j)).toMatch(/burns with two flames/);
  }, 240000);
});
