import { beforeAll, describe, expect, it } from 'bun:test';
import { RunnerOffer } from '../src/cli/runner-offer';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { BeforeRooms } from './support/before-rooms';

// The sixth cold play of the golden route (mission-22/cold/cold-6-report.md), replayed with the keeper's corrected
// SRD strike bonuses. A lone first-level warrior is in danger but is not certainly beaten by the first exchange, so
// the offered warning names that uncertainty and the help available without claiming the fight is unwinnable.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-6-lines.txt', 'utf8').split('\n').filter(Boolean);
function said(x: Said | { error: string }): Said { if ('error' in x) { throw new Error(x.error); } return x; }
describe('the sealed vault, after the sixth cold play', () => {
  let runner: Runner, vault: Said;
  beforeAll(async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    runner = new Runner(BeforeRooms.set(journey.session));
    for (const line of lines.slice(0, lines.indexOf('{"act":"attack(region__s1_u_keeper)"}'))) {
      const s = await runner.ask(line);
      if (!('error' in s)) { vault = s; }
    }
  }, 240000);
  it('says the odds of the keeper and what would help, and does not lead with it', () => {
    // Not among the four at all (OR-412: never led into), but there, asked, with what would help.
    const attack = RunnerOffer.flat([...vault.offer.primary, ...vault.offer.rest])
      .find(o => RunnerOffer.act(o) === 'attack(region__s1_u_keeper)');
    expect(vault.offer.primary.some(o => RunnerOffer.act(o) === 'attack(region__s1_u_keeper)')).toBe(false);
    expect(attack?.aside).toMatch(/^Could be lost: A fight with it could be lost\. What would help: /);
    expect(attack?.aside).toContain('a companion (');
    expect(attack?.aside).toContain('the way back to the undercroft');
    expect(vault.offer.primary[0]?.id).not.toBe(attack?.id);
  });
  it('does not call the first exchange a death', async () => {
    const fight = said(await runner.ask('{"act":"attack(region__s1_u_keeper)"}'));
    expect(fight.end).toBeUndefined();
    expect(fight.scene.lines.join(' ')).toContain('Wenna cannot move.');
    const look = said(await runner.ask('{"look":true}'));
    expect([look.end, look.ending]).toEqual([undefined, undefined]);
  }, 120000);
});
