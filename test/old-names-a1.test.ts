import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { ObservationText } from '../src/lang/observation-text';
import { ModuleWriter } from '../src/lang/module-writer';

// The starting country as play begins in it (a1, as the browser draws it: an origin and one life): its old places are
// called by their Common meaning, as the census says of the written country (test/old-names), and once one is named,
// the page says its Common name; its old name, known, is said with it (T24-20).
describe('a1\'s old places, as play begins', () => {
  it('are called by their Common meaning, and their old names learned at them', async () => {
    const j = (await PlayTool.start(PlayTool.parse(['--world', 'a1', '--as', 'human/warrior/Wat']))).journey;
    const world = j.campaign.world, module = j.campaign.module;
    const learned = (module.observations ?? []).filter(o => /_(old_cut|letters)$/.test(o.id) && o.teaches?.endsWith('_old'));
    expect(learned.length).toBeGreaterThan(3);
    for (const o of learned) {
      const site = o.place!, place = module.entities.find(e => e.id === site)!;
      expect([site, place.name.startsWith('the ')]).toEqual([site, true]);
      // Named, it is said by its Common name.
      const named = world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', `${site}_named`) }]);
      expect(ObservationText.label(named, site)).toBe(place.name);
    }
  }, 120000);
});
