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
  // From Tuck's yard, before any way to the inn is known, the aim's way is the heart of the quarter the inn is in: it
  // had been led only as somewhere not yet been (Glance.toward).
  it('is led to from Tuck’s yard as the way toward the aim', async () => {
    const j = await debtor();
    await j.play('Tell Tuck');
    const first = Glanced.of(j.session).glance.acts[0];
    expect([first?.label, first?.why]).toEqual(['To the landing at Thornhaven', 'toward']);
  }, 120000);
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
  // Called in, the way in is a step from the doorstep, not a journey: the cave and the toll-house's own hall had stood
  // in their wild country's middle cell, a hex from Seolforfyrd, and the page left them to the map (HexBoundary.door).
  it('lets the company in from the doorstep once the hobs have called it in', async () => {
    const j = await debtor();
    await j.play('Tell Tuck', 'To the landing', 'Into the Stormy Horn', 'Ask Aiden what is out', 'map:Seolforfyrd',
      'Call to the hobs');
    const ways = Glanced.of(j.session).screen.exits;
    for (const into of ['the cave mouth', 'the toll-hall']) {
      expect(ways.find(e => e.destination.name === into)?.crosses).toBeFalsy();
    }
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
  // A thief's own way past the gate-hobs is led with them, as their gentle way: it had been only under Look…, the page
  // offering Parley and Attack (Mission 20's second round, B 88). A warrior is not offered it.
  it('leads a thief to slip past the hobs on the gate, and not a warrior', async () => {
    const steps = ['Tell Tuck', 'To the landing', 'Into the Stormy Horn', 'Ask Aiden what is out', 'map:Seolforfyrd'];
    const leads = async (raceId: string, classId: string) => {
      const j = Journey.of(await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Mialee', raceId, classId }] },
        NodeBundleSource.shared));
      await j.play(...steps);
      return Glanced.of(j.session).glance.acts.map(a => a.label).join(' | ');
    };
    expect(await leads('elf', 'thief')).toMatch(/slip past the hobs/);
    expect(await leads('human', 'warrior')).not.toMatch(/slip past/);
  }, 200000);
});
