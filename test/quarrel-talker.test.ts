import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';
import { Glanced } from './support/glanced';

// The boundary stones, for a talker (Mission 20's fourth round, E 140–144): three accounts of the moved stones were
// gathered and there was nothing to do with them; the aim said only that there was a quarrel. Now it says where the
// stones are, and the priest who knows where they stood can be talked round to say so to the merchant's face.
describe('the boundary stones', () => {
  it('lead to the garden, and are settled by talking the priest round', async () => {
    const j = Journey.of(await DrawnWorld.start('a1', { origin: 'wanderer',
      party: [{ name: 'Wynn', raceId: 'human', classId: 'bard' }] }, NodeBundleSource.shared));
    const aim = Glanced.of(j.session).screen.aims?.find(a => /boundary stones/.test(a.text));
    expect(aim?.text).toMatch(/inn's back garden/);
    await j.play('>region__s1_shrine', 'what the matter is', 'about the stones');
    // What is known is of the priest by name, not "the priest" of a shrine kept by a priestess (OR-30).
    const knows = Glanced.of(j.session).screen.knowledge.map(k => k.text).find(t => /boundary stones stood/.test(t));
    expect(knows).toMatch(/ knows where the boundary stones stood, and will not say it to .+'s face/);
    expect(knows).not.toMatch(/^The priest |the merchant's/);
    await j.play('round to say where the stones stood');
    const left = Glanced.of(j.session).screen.aims?.filter(a => /boundary stones/.test(a.text)) ?? [];
    expect(left).toEqual([]);
    // And the word of the quarrel is old: nobody tells of it as if it stood (E 79, of the players).
    expect(j.session.campaign.world.test(ModuleWriter.call('stale', 'quarrel__feud'))).toBe(true);
  }, 120000);
});
