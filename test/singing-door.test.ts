import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';

// The singing hall's door of notes has two keys (the expedition diagnosis of 30 October, change 2): lore reads the
// notes cut on it, and the page says where lore is to be had; and a company without it can listen at the door and hum
// back the note it hears. In kite, the default warrior at Gaudumport.
describe('the door of notes at Gaudumport', () => {
  it('says where lore is had, and opens to a note heard and hummed back', async () => {
    const s = await DrawnWorld.start('kite', { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }],
      origin: 'kin' }, NodeBundleSource.shared);
    const j = Journey.of(s);
    await j.play('^To the bridge-foot', '>w1', 'Piano', '>w1_porch', 'Prod it with the pole', 'risk the hidden switch',
      '^Wenna: light a torch');
    expect(JSON.stringify(j.screen())).toContain('Needs lore: no one in the company has it. Carmine, priest of Lugh, '
      + 'at the shrine of Lugh, sells a glossary of the old script.');
    expect(j.offers('hum back the note')).toBe(false);
    await j.step('door of notes › Listen at it');
    expect(j.taken.at(-1)!.told).toContain('one long note, very low');
    // Hummed, the door rolls back; the stone that moves takes its time noticing, and comes then.
    await j.step('hum back the note the door holds');
    expect(j.campaign.world.one('state', 'region__w1_door')).toBe('region__open');
  }, 120000);
});
