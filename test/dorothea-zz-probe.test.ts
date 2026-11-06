import { it, expect } from 'bun:test';
import { Journey } from '../src/session/journey';
it('probe', async () => {
  const j = await Journey.start('data/campaigns/the-dorothea.campaign.json', 's1');
  j.assert('dorothea__seaQuiet', 'dorothea__hull');
  await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at Mangrow');
  console.log(j.measure('dorothea__bound', 'dorothea__hull'));
  expect(j.measure('dorothea__bound', 'dorothea__hull')).toBe(5);
}, 120000);
