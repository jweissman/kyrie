import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import { KyrLint } from '../src/cli/kyr-lint';

// A change that uses up a thing of the adventure's own kind: Thrume's sockets, which take the keepers' ring, the
// Smith-Master's hammer and the Abbess's Eye and keep them (its friction report, B2, B4 and F8).
describe('a change consuming a thing of the adventure\'s own kind', () => {
  const campaign = 'test/fixtures/socket/campaign.json';
  it('is lint-clean, as it is playable', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);
  it('is offered by the thing\'s own name, with who carries it beside it, and uses it up', async () => {
    const s = await PlaySession.start(campaign, 'socket', NodeBundleSource.shared);
    await s.perform('take_item(world__idol,world__member_party_1)');
    const altar = ScreenModel.build(s.campaign).things.find(t => t.id === 'world__altar')!;
    const set = altar.acts.find(a => a.label === 'Set the idol in the altar')!.children!.find(a => a.command)!;
    expect([set.label, set.by]).toEqual(['using the Idol of Ash', ['Nell']]);
    await s.perform(set.command!);
    const holds = (name: string, ...args: string[]) => s.campaign.world.test(ModuleWriter.call(name, ...args));
    expect(holds('state', 'world__altar', 'world__filled')).toBe(true);
    expect(holds('ownedItem', 'world__idol', 'world__member_party_1')).toBe(false);
  }, 60000);
});
