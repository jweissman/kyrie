import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';

describe('in the dark, lighting what the company carries', () => {
  // Thrume's B1: "Bran: light a torch" set the torch down, because the choice took the torch's first act, and
  // "Set down here" had come before "Light".
  it('lights it, whatever order the thing\'s acts come in', async () => {
    const s = await PlaySession.start('test/fixtures/march/serewater-march.campaign.json', 'serewater',
      NodeBundleSource.shared);
    const screen = ScreenModel.build(s.campaign);
    const torch = screen.items.find(i => i.light)!;
    expect(torch.acts.map(a => a.command?.split('(')[0])).toEqual(expect.arrayContaining(['light_item', 'put_item']));
    const items = screen.items.map(i => i === torch ? { ...i, acts: [...i.acts].reverse() } : i);
    const lit = ChoiceList.all(ChoiceList.explore({ ...screen, dark: true, items }))
      .find(c => c.id === `light:${torch.id}`);
    expect(lit?.label).toBe(`${torch.ownerName}: light a torch`);
    expect(lit?.command).toMatch(/^light_item\(/);
  }, 60000);
});
