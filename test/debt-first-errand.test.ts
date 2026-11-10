import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Glanced } from './support/glanced';

const debtor = async () => Journey.of(await DrawnWorld.start('kahitude', { origin: 'debt',
  party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));

// The landing at Thornhaven, the debt's way to the inn: the page had led with Lapisrecs' mound beside it, "further
// in", where the mummy that kills a newcomer waits; the inn no longer told of deep halls, but the town led there. A
// site's ground is not "further in" from a town's street (Glance.inward).
describe('the landing, on the way to the inn', () => {
  it('does not lead out to the king-barrow', async () => {
    const j = await debtor();
    await j.play('Tell Tuck', 'To the landing');
    const acts = Glanced.of(j.session).glance.acts;
    expect(acts[0]?.label).toMatch(/Stormy Horn/);
    expect(acts.map(a => a.label).join(' | ')).not.toMatch(/mound/);
  }, 120000);
});

// The debt's first errand, in the reference world: told of Seolforfyrd at the inn, set out for from the map, the hobs
// called to for a parley ("Don't touch nothing"), and their store gone into with a light. The page had led with the
// rings off the dead in it, the Gaffer's own, and taking them brought the raiding party down on a lone newcomer
// (register M19-233). What is someone else's is not spoils to be led to, and says whose it is.
describe('the hobs’ store, after a parley', () => {
  it('does not lead with what is theirs, and says whose it is', async () => {
    const j = await debtor();
    await j.play('Tell Tuck', 'To the landing', 'Into the Stormy Horn', 'Ask Aiden what is out', 'map:Seolforfyrd',
      'Call to the hobs', 'Into the cave mouth', 'To the smoky cavern', 'To a dry side-cave', 'light a torch');
    const g = Glanced.of(j.session), rings = g.screen.things.find(t => /rings off the dead/.test(t.name));
    expect(rings?.note).toBe("the Gaffer's");
    expect(rings?.valuable).toBeUndefined();
    expect(g.glance.acts.map(a => a.label).join(' | ')).not.toMatch(/rings/);
  }, 120000);
  // The bell the hobs took is led to where it lies (the aim names it); taken under their eyes it raises the hold, and
  // rung it sends them out of the back way, where they stay (they had been put back by the fire they ran from).
  it('leads to the stolen bell, and rung, the hobs run and do not come back to the fire', async () => {
    const j = await debtor();
    await j.play('Tell Tuck', 'To the landing', 'Into the Stormy Horn', 'Ask Aiden what is out', 'map:Seolforfyrd',
      'Call to the hobs', 'Into the cave mouth', 'To the smoky cavern', 'To a dry side-cave', 'light a torch');
    expect(Glanced.of(j.session).glance.acts.map(a => a.label)).toContain('a chapel handbell');
    await j.play('handbell: Take', 'Ring the bell', 'To the smoky cavern');
    const cavern = Glanced.of(j.session);
    expect(cavern.screen.people.some(p => /raiding party/.test(p.name))).toBe(false);
    expect(cavern.glance.acts.map(a => a.label).join(' | ')).toMatch(/captives/);
  }, 120000);
});
