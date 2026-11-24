import { describe, expect, it } from 'bun:test';
import { Journey } from '../../../src/session/journey';
import { KyrLint } from '../../../src/cli/kyr-lint';
import { Scenery } from '../../../src/ui/scenery';

// Fun Friday (24 November; doc/design/fun-fridays.md): a village at the end of the dry, a walk to the falls, an old
// woman's custom kept for her, and the rain (#4 a trip to the countryside, #12 the beach, #174 doing favours, #187
// swimming, #231 a nature walk, #103 the sounds of nature). On Lantana Cay (data/adventures/raingourd, the tropics
// paintings), Oyelle Marre has carried Palla's rain-gourd up to the falls for fifty years, and this year her hip will
// not. Carried for her, filled where the water first comes over (with Tobi along the ledge he is not allowed on, or
// by one's own climbing, or from the goats' pool), and poured on the rain-stone, the rains come: the waterfront is
// painted in rain, the turtle comes into the cove, and supper goes round under the eaves. Nothing is paid.
const campaign = 'data/campaigns/raingourd.campaign.json';
const start = () => Journey.start(campaign, 'raingourd');
const painted = (j: Journey) => Scenery.of(j.screen());
const ended = (j: Journey) => j.campaign.world.related('reached').map(r => r.args[0]);
describe('the rain-gourd at Palla', () => {
  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 60000);
  it('is carried up for Oyelle, filled behind the falls with Tobi, and poured with her, and the rain comes', async () => {
    const j = await start();
    await j.play('To the waterfront at Palla');
    expect(painted(j)).toBe('scene-tropics-village');
    await j.play("To Oyelle's door", 'Ask Oyelle about the gourd', 'Offer to carry the gourd',
      'Ask Oyelle whether she would come down');
    expect(j.screen().items.map(i => i.name)).toContain("Oyelle's rain-gourd");
    await j.play('To the waterfront at Palla', 'To the bathing cove', 'Ask Tobi about his turtle', 'Ask Tobi about the ledge', 'Ask him to come with you',
      'To the waterfront at Palla', 'To the long beach', 'To the cane valley', 'To the path through the cane',
      'To the pool under the falls');
    expect(painted(j)).toBe('scene-tropics-waterfall');
    expect(await j.play('Follow Tobi in along the ledge')).toMatch(/clean as glass/);
    await j.play('To the path through the cane', 'To the cane valley', 'To the long beach', 'To the waterfront at Palla',
      "To Oyelle's door", 'Help Oyelle down the goat-track');
    expect(await j.play('Hold the gourd for Oyelle')).toMatch(/Fifty-one/);
    expect(await j.play('Wait and watch')).toMatch(/The first drop hits the rain-stone/);
    expect(painted(j)).toBe('scene-tropics-village-rain');
    await j.play('To the bathing cove');
    expect(j.screen().prose.join(' ')).toMatch(/Tobi's turtle, come in on the rain as he said she would/);
    await j.play('To the waterfront at Palla', 'Sit under the net-shed');
    expect(ended(j)).toContain('raingourd__her_rain');
  }, 120000);
  it('takes water from the goats\' pool too, and the waterfront knows it', async () => {
    const j = await start();
    await j.play('To the waterfront at Palla', "To Oyelle's door", 'Ask Oyelle about the gourd', 'Offer to carry the gourd',
      'To the waterfront at Palla', 'To the long beach', 'To the cane valley', 'To the path through the cane',
      'To the pool under the falls', 'Fill the gourd from the pool', 'To the path through the cane', 'To the cane valley',
      'To the long beach', 'To the waterfront at Palla');
    expect(await j.play('Pour the gourd out on the rain-stone')).toMatch(/the whole black face of the stone shines/);
    expect(await j.play('Wait and watch')).toMatch(/'Goat,' she says/);
    expect(await j.play('Wait and watch')).toMatch(/The first drop hits the rain-stone/);
    await j.play('Sit under the net-shed');
    expect(ended(j)).toContain('raingourd__the_rain');
  }, 120000);
});
