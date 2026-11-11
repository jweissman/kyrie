import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { GeneratedWorld } from './support/generated';
import { ModuleWriter } from '../src/lang/module-writer';

// The last castellan's question can be answered: "Who comes to the lord's hall?", and a bard could only fight him or
// go (round 7, L 147). In the lord's name, to see what he is owed, he lets the company be; one who knows the old lords'
// story can tell him they are gone.
describe('the last castellan', () => {
  it('can be answered, and told the keep is given up by one who knows its story', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'herbs', party: [{ name: 'Merle', raceId: 'birdfolk',
      classId: 'bard' }] }, NodeBundleSource.shared);
    const c = s.campaign, castellan = c.module.entities.find(e => /_castellan$/.test(e.id) && e.type === 'group')!;
    const hall = c.world.one('at', castellan.id)!;
    GeneratedWorld.put(s, hall.replace(/^region__/, ''));
    const answers = PlayerView.choices(c).map(x => x.choice.id).filter(id => /_(answered|released)\(/.test(id));
    expect(answers.length).toBe(2);
    const e = await s.leg(answers.find(id => /_released\(/.test(id))!);
    const told = [...(e.perceptions ?? []).map(p => p.text), e.response ?? ''].join(' ');
    // Told the lords are gone he sits and is bones; not believed, he is still there and has said so.
    const gone = c.world.one('at', castellan.id) !== hall;
    expect([gone, c.world.test(ModuleWriter.call('tolerates', castellan.id, 'party')), /only bones/.test(told)])
      .toEqual(gone ? [true, true, true] : [false, false, false]);
    if (!gone) { expect(told).toMatch(/You were not here/); }
  }, 120000);
});
