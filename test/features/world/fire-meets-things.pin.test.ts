import { describe, expect, it } from 'bun:test';
import { Embalmers } from '../../support/embalmers';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › Fire meets things (OR-1100; the research of
// 26 November, doc/design/research-abilities-and-the-world-2026-11-26.md, slice 2): the reference game's dungeon has
// one thing fire takes, the embalmers' resined linen on the halls' level, and its author answers the try
// (`tried(linen, burning)`), never what made it. A warrior holds a torch to it, and a mage casts Fire Bolt at it from
// the thing's own row: either way it burns, the room is let fire loose in, and its light keeps the room lit.
const burns = async (as: string, light: RegExp, burn: RegExp, setUp?: Parameters<typeof Embalmers.enter>[2]) => {
  const at = await Embalmers.enter(as, light, setUp), w = at.campaign.world;
  expect(w.test({ kind: 'call', name: 'unlit', args: [at.room] })).toBe(true);
  await Embalmers.act(at, burn);
  const after = at.campaign.world;
  return { linen: /burnt$/.test(after.one('state', at.linen) ?? ''),
    lit: !after.test({ kind: 'call', name: 'unlit', args: [at.room] }),
    exposed: after.test({ kind: 'call', name: 'exposedTo', args: [at.room, 'fire'] }),
    told: at.said.scene.lines.join(' ') };
};
describe('World › Fire meets things', () => {
  it('burns the embalmers\' linen by a torch held to it', async () => {
    const torch = await burns('human/warrior/Wenna', /light a torch$/i, /^Hold a flame to the embalmers' linen/);
    expect(torch).toMatchObject({ linen: true, lit: true, exposed: true });
    expect(torch.told).toMatch(/resined linen catches at once/);
  }, 60000);
  it('burns it alike by Fire Bolt cast at it, from its own row', async () => {
    const spell = await burns('human/mage/Wenna', /light a candle$/i, /^Have Wenna cast Firebolt at the embalmers' linen/,
      j => Embalmers.firebolt(j));
    expect(spell).toMatchObject({ linen: true, lit: true, exposed: true });
    expect(spell.told).toMatch(/resined linen catches at once/);
  }, 60000);
});
