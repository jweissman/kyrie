import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Glanced } from './support/glanced';

// The debt's first errand, in the reference world: told of Seolforfyrd at the inn, set out for from the map, the hobs
// called to for a parley ("Don't touch nothing"), and their store gone into with a light. The page had led with the
// rings off the dead in it, the Gaffer's own, and taking them brought the raiding party down on a lone newcomer
// (register M19-233). What is someone else's is not spoils to be led to, and says whose it is.
describe('the hobs’ store, after a parley', () => {
  it('does not lead with what is theirs, and says whose it is', async () => {
    const j = Journey.of(await DrawnWorld.start('kahitude', { origin: 'debt',
      party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    await j.play('Tell Tuck', 'To the landing', 'Into the Stormy Horn', 'Ask Aiden what is out', 'map:Seolforfyrd',
      'Call to the hobs', 'Into the cave mouth', 'To the smoky cavern', 'To a dry side-cave', 'light a torch');
    const g = Glanced.of(j.session), rings = g.screen.things.find(t => /rings off the dead/.test(t.name));
    expect(rings?.note).toBe("the Gaffer's");
    expect(rings?.valuable).toBeUndefined();
    expect(g.glance.acts.map(a => a.label).join(' | ')).not.toMatch(/rings/);
  }, 120000);
});
