import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { WorldAssembler } from '../src/world/world-assembler';

// What each settlement has to do with its nearest place, and what the place says back (ties.kyrt): the same situation
// told from both ends, drawn as one of several shapes for each town. Followed from the town's ask to the place's trace
// and back to the town's thanks, whatever shape a seed draws.
describe('a settlement and its nearest place', () => {
  it('is tied in every settlement of a country, by a shape drawn for each', async () => {
    const w = await WorldAssembler.assemble('kahitude', NodeBundleSource.shared, {});
    const text = [...(w.source as unknown as { files: Map<string, string> }).files.values()].join('\n');
    for (const t of ['s1', 's2', 's3', 's4', 's5']) { expect(text).toMatch(new RegExp(`Relation ${t}_tie_done`)); }
  }, 120000);
  it('sends a company from the town to the trace and back, and pays it and changes the town (kahitude, Thornhaven)', async () => {
    const w = await WorldAssembler.assemble('kahitude', NodeBundleSource.shared, {});
    const text = [...(w.source as unknown as { files: Map<string, string> }).files.values()].join('\n');
    const site = /Thing s1_tie_cairn "[^"]*" at (w\d+)/.exec(text)?.[1];
    expect(site).toBeDefined();
    const j = Journey.of(await DrawnWorld.start('kahitude', { origin: 'debt',
      party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    Placed.at(j, 'region__s1_shrine');
    await j.play('about the bread that is carried out of');
    expect(Placed.holds(j, 'knows', 'party', `region__${site}_named`)).toBe(true);
    Placed.at(j, `region__${site}`);
    await j.play('Build the cairn up again');
    Placed.at(j, 'region__s1_shrine');
    await j.play('the cairn at');
    expect(Placed.holds(j, 'region__s1_tie_done', 'party')).toBe(true);
  }, 180000);
});
