import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// With nothing to see by, the way into the dark is not the aim's next step, and the company is told why: a lone
// ranger whose candle had burned down was led down into the dark cellar and back up four times over (the laboratory's
// lost turns, Gate 1).
const store = `
  Place store "the corn-store" is room at 0, 0 indoors.
  Place cellar "the cellar" is room at 0, 1 underground.
  Passage trapdoor "the trapdoor" is stair between store and cellar.
  Initially Assert unlit(cellar).
  Company party "You" of 1 at store.
  Objective rats when true toward cellar "Clear the rats out of {cellar}.".
  Goal false.`;

// The lights burned down or lost.
class Dark {
  static out(t: Tiny) {
    const lights = new Set(t.world.related('lightsUp').map(r => r.args[0]!));
    const c = t.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(t.world.related('ownedItem').filter(r => lights.has(t.world.one('itemKind', r.args[0]!) ?? ''))
      .map(r => ({ kind: 'retract', call: { kind: 'call', name: 'ownedItem', args: r.args } }))));
  }
}
describe('the way into the dark, with nothing to see by', () => {
  it('is not gold, and the need says why', async () => {
    const t = await Tiny.start(store);
    Dark.out(t);
    t.follow('rats');
    expect(t.gold).toEqual([]);
    expect(t.glance.need ?? []).toContain('No light');
    expect([t.costs.region, t.costs.world]).toEqual([undefined, undefined]);
  });
  it('is gold with a light to hand', async () => {
    const t = await Tiny.start(store);
    t.follow('rats');
    expect(t.gold.map(a => a.label)).toEqual([expect.stringMatching(/cellar/)]);
  });
  it('leads by whoever sells a light', async () => {
    const t = await Tiny.start(`${store.replace('Goal false.', '')}
      Place shop "the chandler's" is room at 1, 0 indoors.
      Passage shop_door "the chandler's door" is door between store and shop.
      Person nell "Nell" at shop { Role "a chandler". Ancestry human. Peaceable. Pronouns she. Sells candle for 1 coin from 9. }
      Goal false.`);
    // Been in the chandler's already, doing nothing there: still the way to a light (a monk in the laboratory).
    for (let n = 0; n < 2; n++) {
      await t.perform('go(t__shop_door,t__shop)');
      await t.perform('go(t__shop_door,t__store)');
    }
    Dark.out(t);
    t.follow('rats');
    expect(t.gold.map(a => a.label)).toEqual([expect.stringMatching(/chandler/)]);
  });
  // In the dark already, the way out is through it: fled to the undercroft with the candle gone, the way up toward
  // the one the aim names had not been gold (the laboratory).
  it('leads out through the dark, from the dark', async () => {
    const t = await Tiny.start(`
      Place town "Lowmouth" is settlement.
      Place green "the landing" is room within town at 1, 0 outdoors.
      Place shop "Mik's salt-house" is room within town at 0, 0 indoors.
      Place cellar "the cellar" is room within town at 1, 1 underground 1 down.
      Place under "the undercroft" is room within town at 1, 2 underground 2 down.
      Passage shop_door "the shop door" is door between green and shop.
      Passage stair "the stair" is stair between green and cellar.
      Passage arch "the arch" is passage between cellar and under.
      Initially Assert unlit(cellar). Initially Assert unlit(under).
      Company party "You" of 1 at green.
      Person mik "Mik" at shop { Role "a salter". Ancestry human. Peaceable. Pronouns he. }
      Objective job when true toward mik "Ask Mik about the rats.".
      Goal false.`);
    await t.perform('go(t__stair,t__cellar)');
    await t.perform('go(t__arch,t__under)');
    Dark.out(t);
    t.follow('job');
    expect(t.gold.map(a => a.label)).toEqual([expect.stringMatching(/cellar/)]);
  });
});
