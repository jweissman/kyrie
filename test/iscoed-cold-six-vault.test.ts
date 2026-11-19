import { beforeAll, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { BeforeRooms } from './support/before-rooms';

// The sixth cold play of the golden route (mission-22/cold/cold-6-report.md), replayed by its own lines to the sealed
// vault under Porthalen. CL-52: "Attack the keeper of the vault" had been offered with only a danger mark, and a fresh
// warrior alone died of it in four rounds; the row now says the odds and the help that can be had, and is not the
// place's lead. CL-53: after the death the offer was empty and a look was never answered; every line after an ending
// is answered with it, and the ending's own "begun again" is offered and done.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-6-lines.txt', 'utf8').split('\n').filter(Boolean);
function said(x: Said | { error: string }): Said { if ('error' in x) { throw new Error(x.error); } return x; }
describe('the sealed vault, after the sixth cold play', () => {
  let runner: Runner, vault: Said, first: Said;
  beforeAll(async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    runner = new Runner(BeforeRooms.set(journey.session));
    first = runner.said();
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
  it('answers every line after the death with the ending, and offers to begin again', async () => {
    expect(said(await runner.ask('{"act":"attack(region__s1_u_keeper)"}')).end).toBe(true);
    const look = said(await runner.ask('{"look":true}'));
    expect([look.end, look.ending?.title]).toEqual([true, 'Wenna is dead']);
    expect(look.offer.primary.map(o => [o.id, o.label]))
      .toEqual([['again', 'Begin again in this country, from its first day']]);
    expect(said(await runner.ask('{"act":"search(region__s1_u_vault)"}')).end).toBe(true);
  }, 120000);
  it('begins again in the same country from its first day', async () => {
    const again = said(await runner.ask('{"act":"again"}'));
    expect([again.end, again.moment, again.at, again.you]).toEqual([undefined, 'arrive', first.at, first.you]);
    expect(again.offer.primary.map(o => o.id)).toEqual(first.offer.primary.map(o => o.id));
  }, 120000);
});
