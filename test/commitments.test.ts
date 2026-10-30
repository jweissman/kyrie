import { describe, expect, it } from 'bun:test';
import { CampaignLint } from '../src/cli/campaign-lint';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { WorldAssembler } from '../src/world/world-assembler';

// One-way and irreversible choices had been marked case by case, with no guarantee (the audit's SLIP-09). A way that
// goes one way only says so of itself; an action that puts the company where nothing leads back out of says so in its
// Grave, and the lint walks the library and generated countries for one that does not.
class Committed {
  static async findings(path: string, session?: PlaySession): Promise<string[]> {
    const lint = new CampaignLint(path, session ?? await PlaySession.start(path, 'lint', NodeBundleSource.shared));
    lint.commitments();
    return lint.findings.map(f => `${f.where}: ${f.message}`);
  }
}

describe('a choice that cannot be taken back', () => {
  it('is found when it puts the company where nothing leads out and says nothing of it', async () => {
    const found = await Committed.findings('test/fixtures/probes/drop/probe.campaign.json');
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(/drop_shaft puts the company in p__shaft, and nothing leads out of it/);
  }, 60000);
  it('is said first everywhere in the library', async () => {
    const found: string[] = [];
    for (const path of KyrLint.campaigns()) { found.push(...await Committed.findings(path)); }
    expect(found).toEqual([]);
  }, 300000);
  it('is said first in a generated country and its sites', async () => {
    const found: string[] = [];
    for (const seed of ['s1', 's2']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
        { origin: 'debt', party: [{ name: 'Wenna', raceId: 'human', classId: 'mage' }] });
      found.push(...await Committed.findings(w.path, await PlaySession.start(w.path, seed, w.source)));
    }
    expect(found).toEqual([]);
  }, 300000);
});
