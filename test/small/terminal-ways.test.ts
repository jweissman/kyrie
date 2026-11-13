import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Terminal } from '../../src/cli/terminal';
import { PlayerView } from '../../src/presentation/player-view';

// The terminal leads with what the page does, the quiet row of ways among it, by the command each is done by: the
// glance's ways are by exit, which no command is, and a way in once gone through dropped from the foreground (round
// 13, a1 debt: back at Ísencepan, only the cairn, and "Take the gate to the gate-passage" only under `all`: PL-26).
// A keep's door, its gate-passage, and the cairn at its foot.
const keep = `
  Place keep "the keep" is site.
  Place door "the keep's door" is room at 0, 0 outdoors.
  Place passage "the gate-passage" is room within keep at 0, 0 indoors.
  Passage gate "the gate" is door between door and passage.
  Company party "You" of 1 at door.
  Thing cairn "the cairn of offerings" at door { State fallen "A cairn lies tumbled.". State built "The cairn stands.".
    Change build "Build the cairn up again" from fallen to built. }
  Goal false.`;

describe('the terminal\'s foreground', () => {
  it('has the glance\'s ways in it, by their commands, a way in once gone through among them', async () => {
    const t = await Tiny.start(keep);
    await t.play('Into the keep');
    await t.play('^Out|the keep\'s door');
    const ways = t.glance.ways.filter(id => !t.glance.acts.some(a => a.choice === id));
    expect(ways.length).toBeGreaterThan(0);
    const commands = new Set(PlayerView.observe(t.campaign).choices.map(c => c.id));
    const led = Terminal.led(t.glance, t.screen);
    expect(led.filter(id => commands.has(id))).toEqual(expect.arrayContaining([expect.stringMatching(/^go\(t__gate/)]));
  });
});
