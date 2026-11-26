import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { Journey } from '../src/session/journey';

describe('The Rose of Orlane', () => {
  const campaign = 'data/campaigns/romance.campaign.json';

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level !== 'advice')).toEqual([]);
  }, 60000);

  it('repays the bridge inscription by opening the way to the prisoners', async () => {
    const j = await Journey.start(campaign, 'romance-inscription', { strict: true });
    await j.play(
      'Ask Maelin Vale about the red light on the hill',
      '>romance__bridge',
      'Climb down and read the letters under the bridge',
      '>romance__nave',
      "Lay an open hand in Saint Arda's stone hand",
      '>romance__undercroft',
      'Lead the prisoners out of the undercroft',
    );
    expect(j.holds('prisonersFreed', 'party')).toBe(true);
    expect(j.at('prisoners')).toBe('romance__rose_road');
  }, 60000);
});
