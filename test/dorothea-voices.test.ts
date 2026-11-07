import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Calling-keyed voices on the archipelago: the thief at the strongbox, the ranger at the nests and the tide, the
// warrior at the ladder. Each points at a way through that another calling does not have.
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;

describe('The archipelago, by what the company is', () => {
  it('has the thief see the second lever, the ranger read the tide and the nests, the warrior distrust the ladder', async () => {
    const n = await Journey.start(campaign, 's1');
    n.assert(k('seaQuiet'), k('hull'));
    await n.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at Port Ness',
      'Pay Captain Bascom four', "^To the Dorothea's waist", '=until at(hull, ness_quay)', '^To Port Ness pier', '^To Salt Row', '^Into the House');
    expect(n.page).toContain('The second one is set back under the first');
    await n.play('^Out to', '^To the salt pans', '^To the Ness strand');
    expect(n.page).toContain('five hours of road');
    const a = await Journey.start(campaign, 's1');
    a.assert(k('seaQuiet'), k('hull'));
    await a.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at the Antlers',
      'Walk Fenwick Pelham', 'Pay Captain Bascom eight', "^To the Dorothea's waist", '=200', "^To the Antlers' ledge", '^To the harvest hut', '^To the foot of the Great Stack');
    expect(a.page).toContain('I will go in the basket');
    await a.play('Ask Hob Sedge to take you up', '^To the top of the Great Stack');
    expect(a.page).toContain('A fire on the lee side would not put these off');
  }, 600000);
});
