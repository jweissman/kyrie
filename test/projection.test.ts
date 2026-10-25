import { describe, expect, it, spyOn } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { CreatureFacts } from '../src/campaign/creature-facts';
import { CreatureStore } from '../src/creature-store';
import type { CampaignActor } from '../src/campaign/definition';

// The creatures' facts are projected again only for the actors whose part has changed (see Projection), and the world
// comes out as if every actor's had been: projecting everyone's afresh changes nothing.
describe('the projection of creatures into the world', () => {
  it('projects again only what has changed, and agrees with projecting everyone', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source), everyone = s.campaign.actors.length;
    const projected: number[] = [], original = CreatureFacts.project.bind(CreatureFacts);
    const project = spyOn(CreatureFacts, 'project').mockImplementation((world, actors, store) => {
      projected.push(actors.length); return original(world, actors, store);
    });
    try {
      for (const name of [/^Wait an hour/, /^Take /, /^Wait an hour/]) {
        const c = PlayerView.choices(s.campaign).find(x => name.test(x.choice.name))!;
        await s.perform(c.choice.id);
      }
    } finally { project.mockRestore(); }
    // Everyone's at first, the campaign's projection being new; after that, only those whose part changed.
    const [first, ...after] = projected;
    expect(first).toBe(everyone);
    expect(after.length).toBeGreaterThan(0);
    expect(Math.max(...after)).toBeLessThan(everyone / 4);
    const save = s.campaign.save(), world = s.campaign.world;
    expect(CreatureFacts.project(world, save.definition!.actors as CampaignActor[], new CreatureStore(save.creatures)))
      .toBe(world);
  }, 60000);
});
