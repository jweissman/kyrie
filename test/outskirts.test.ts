import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';
import { Scenery } from '../src/ui/scenery';
import { Glanced } from './support/glanced';

const debtor = async () => Journey.of(await DrawnWorld.start('kahitude', { origin: 'debt',
  party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));

// Two places a walk from the town the company begins in (the owner, 10 November): the Hall, lived in and safe, and the
// first makers' stones on the hill. Each a few rooms, each room painted as itself, each with something to find; neither
// an aim, nor led to from the town ahead of its own people.
describe('the outskirts of the starting town', () => {
  it('are a walk from the landing, painted as themselves, and not led to', async () => {
    const j = await debtor();
    await j.play('Tell Tuck', 'To the landing');
    const g = Glanced.of(j.session);
    const ways = g.screen.exits.map(e => e.destination.id);
    expect(ways).toEqual(expect.arrayContaining(['region__s1_manor_front', 'region__s1_stones_top']));
    expect(g.glance.acts.map(a => a.label).join(' | ')).not.toMatch(/Hall|stones|hill/);
    const painted: string[] = [];
    for (const step of ['>s1_manor_front', '>s1_manor_hall', '>s1_manor_loggia', '>s1_stones_top', '>s1_stones_hall',
      '>s1_stones_dome', '>s1_stones_tree']) {
      await j.play(step);
      painted.push(Scenery.seen(Glanced.of(j.session).screen) ?? 'none');
    }
    expect(painted).toEqual(['scene-manor', 'scene-great-hall', 'scene-portico', 'scene-ruins-hill',
      'scene-ruins-tribunal', 'scene-ruins-cenotaph', 'scene-ancient-tree']);
  }, 120000);
  it('show from the hill the nearest of the country’s works', async () => {
    const j = await debtor();
    await j.play('>s1_stones_top');
    expect(j.session.campaign.world.test(ModuleWriter.call('knows', 'party', 'region__w7_found'))).toBe(true);
  }, 120000);
  // What is the household's is theirs: taken in front of the steward, it is resented, and the Hall is shut to the
  // company after (round 3's D: taking what was not his had changed nothing).
  it('shut the Hall to whoever carries its silver past the steward', async () => {
    const j = await debtor();
    await j.play('>s1_manor_library', 'Take', '>s1_manor_hall');
    const g = Glanced.of(j.session);
    expect(g.screen.place.id).toBe('region__s1_manor_front');
    expect(g.screen.exits.find(e => e.destination.id === 'region__s1_manor_hall')?.blocked).toBeTruthy();
  }, 120000);
});
