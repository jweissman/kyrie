import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Going on under the ground was told "by the light you carry" when nothing was lit (play 9, down into Silkholme sink).
describe('a way under the ground', () => {
  const ridge = ['@go(march__shop_door,march__shop_floor)', '@buy_item(march__nera_torch_1,march__member_party_1)',
    '@go(march__shop_door,march__quay)', '@go(march__causeway_path,march__causeway)', '@go(march__ridge_track,march__ridge)',
    '@go(sink__sink_path,sink__lip)', '@go(sink__terrace_steps,sink__frames)'];
  const told = async (light: boolean) => {
    const j = await Journey.start('test/fixtures/march/silkholme.campaign.json', 'silk');
    await j.play(...ridge, ...light ? ['@light_item(march__nera_torch_1)'] : [], '@go(sink__seep,sink__cave)');
    return j.taken.at(-1)!.page;
  };
  it('is told by the light carried, or with none', async () => {
    const dark = await told(false), lit = await told(true);
    expect([/by the light you carry/.test(dark), /with no light/.test(dark)]).toEqual([false, true]);
    expect([/by the light you carry/.test(lit), /with no light/.test(lit)]).toEqual([true, false]);
  }, 120000);
});
