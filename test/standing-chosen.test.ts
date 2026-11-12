import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// A spec of something else can say which of the scenarios every first country holds its world holds, so that what
// stands in every country does not move under it (the register's AB-13, the authors' R88).
describe('the standing scenarios a world holds', () => {
  it('are all of them, unless the drawing says which', async () => {
    const placed = async (standing?: string[]) => (await WorldAssembler.assemble('kahitude', NodeBundleSource.shared,
      { origin: 'debt', party: [{ name: 'X', raceId: 'human', classId: 'warrior' }], ...standing ? { standing } : {} }))
      .report.placements.map(p => p.scenario);
    expect(await placed()).toContain('circus');
    expect(await placed([])).not.toContain('circus');
  }, 180000);
});
