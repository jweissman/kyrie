import { it } from 'bun:test';
import { Journey } from '../src/session/journey';
const k = (id: string) => `dorothea__${id}`;
it('probe', async () => {
  for (const seed of ['s1', 'a', 'b', 'c', 'd', 'e']) {
    const j = await Journey.start('data/campaigns/the-dorothea.campaign.json', seed);
    j.assert(k('seaQuiet'), k('hull'));
    await j.play('^To Tolleth quay', '^Into the Anchor', 'Ask Corwin Latch about the black lugger', '^Out to', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at Port Ness', 'Pay Captain Bascom four', "^To the Dorothea's waist", '=until at(hull, ness_quay)'.replace('hull', 'dorothea__hull').replace('ness_quay', 'dorothea__ness_quay'), '^To Port Ness pier');
    await j.play('=until at(dorothea__raiders, dorothea__ness_quay)');
    await j.play('Attack');
    console.log('SEED', seed, j.holds(k('raidTurned'), 'party'), j.campaign.readout.creatures.filter(c => ['Hale','Mirel','Tam'].includes(c.name)).map(c => c.name+':'+c.state.hp).join(' '), j.page.slice(-300));
  }
}, 600000);
