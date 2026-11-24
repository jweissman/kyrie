import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { HonestPlayer } from './support/honest-player';

// A riddle on the way the aim goes (Redkeep's speaking door, iscoed), followed as the page leads it (OR-192): the gold
// rests on the look at the door, and within it on the next safe try not yet made, push, then listen, then none, for
// what is left is the riddle's words, a guess the gold never makes (Leaves.tries). It had stayed on "Push and pull at
// it", pushed and pushed again, and the gold-follower stopped at the gate (the continuity census's gold walk, 14
// turns). A player who knows only the page reads the riddle and answers it, guessing in order, and goes in.
describe('a riddle on the way, as the gold leads it', () => {
  it('moves the gold off each try once made, and the gold-follower goes in past the door', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const s = journey.session, p = new HonestPlayer(s), within: string[][] = [];
    for (let i = 0; i < 30 && s.campaign.world.one('at', 'party') !== 'region__w5_bailey'; i++) {
      const lead = p.glanced.glance.acts[0];
      if (lead?.choice === 'exit:region__w5_gate/0:Look at the speaking door') {
        within.push(lead.inside?.map(x => x.command) ?? []);
      }
      if (!await p.step()) { break; }
    }
    // The gold within, turn by turn at the door: the first safe try, the next, then none (the riddle's words left).
    expect(within.slice(0, 3)).toEqual([['push(region__w5_riddle)'], ['listen(region__w5_riddle)'], []]);
    expect(p.log.join('\n')).toMatch(/tries: region__w5_riddle_word2/);
    expect(s.campaign.world.one('at', 'party')).toBe('region__w5_bailey');
  }, 300000);
});
