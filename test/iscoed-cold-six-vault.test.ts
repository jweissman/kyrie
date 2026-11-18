import { beforeAll, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';

// The sixth cold play of the golden route (mission-22/cold/cold-6-report.md), replayed by its own lines to the sealed
// vault under Porthalen. CL-52: "Attack the keeper of the vault" had been offered with only a danger mark, and a fresh
// warrior alone died of it in four rounds; the row now says the odds and the help that can be had, and is not the
// place's lead.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-6-lines.txt', 'utf8').split('\n').filter(Boolean);
describe('the sealed vault, after the sixth cold play', () => {
  let runner: Runner, vault: Said;
  beforeAll(async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    runner = new Runner(journey.session);
    for (const line of lines.slice(0, lines.indexOf('{"act":"attack(region__s1_u_keeper)"}'))) {
      const s = await runner.ask(line);
      if (!('error' in s)) { vault = s; }
    }
  }, 240000);
  it('says the odds of the keeper and what would help, and does not lead with it', () => {
    const attack = vault.offer.primary.find(o => o.id === 'attack(region__s1_u_keeper)');
    expect(attack?.aside).toMatch(/^Beyond you: It is more than you can take\. What would help: /);
    expect(attack?.aside).toContain('a companion (');
    expect(attack?.aside).toContain('the way back to the undercroft');
    expect(vault.offer.primary[0]?.id).not.toBe(attack?.id);
  });
});
