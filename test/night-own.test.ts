import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';

// Night was nine in the evening until six in the morning in every season and country: A Winter in Carth's February
// in the north is dark at five, and its every rule for night asked a nightfall() of its own (its friction 1); the
// Liberty of the Ice's winter fair is dusk at four (its 15). A campaign may keep its own hours.
describe('a campaign\'s own night', () => {
  it('falls and lifts when the campaign says', async () => {
    const own = await Journey.start('test/fixtures/probes/give/night.campaign.json', 'k');
    const plain = await Journey.start('test/fixtures/probes/give/probe.campaign.json', 'k');
    expect([own.measure('untilDark', 'clock'), plain.measure('untilDark', 'clock')]).toEqual([54, 78]);
    await own.play('=55');
    await plain.play('=55');
    expect([own.holds('dark'), plain.holds('dark')]).toEqual([true, false]);
    // Until seven in the morning, not six.
    expect(own.measure('untilLight', 'clock')).toBe(14 * 6 - 1);
  }, 60000);
  it('is refused when it keeps hours a night cannot', async () => {
    const source = new MemoryBundleSource({ 'c.json': JSON.stringify({ version: 1, name: 'C', night: { falls: 5, lifts: 20 },
      modules: [{ id: 'p', bundle: 'm.json' }] }) });
    await expect(ModuleBundle.campaign('c.json', source)).rejects.toThrow('Invalid campaign manifest');
  });
});
