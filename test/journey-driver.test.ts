import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlayTool } from '../src/cli/play-tool';

// The shared driver every adventure's journeys play by (Thrume, The House That Grows, The Road the Star Came Down,
// The Patient Star each wrote their own first), and `kyrie play`, which plays the same steps from the terminal.
describe('a journey played by the labels a player sees', () => {
  const socket = 'test/fixtures/socket/campaign.json';
  it('takes a choice by its label or by the heading it is under, waits by the watch, and passes over what is not offered', async () => {
    const j = await Journey.start(socket, 'socket');
    expect(await j.play('?Nothing like this', '^Take')).toContain('Nell takes the Idol of Ash');
    expect(j.find('the altar: Set the idol')?.label).toBe('Set the idol in the altar using the Idol of Ash');
    await j.play('the altar: Set the idol');
    expect(j.holds('state', 'world__altar', 'world__filled')).toBe(true);
    expect(j.taken.at(-1)?.page).toContain('The Idol of Ash is used up.');
    await j.play('=3', '=+2', '@wait');
    expect(j.watch()).toBeGreaterThanOrEqual(5);
    await expect(j.play('Nothing like this')).rejects.toThrow(/No \/Nothing like this\/ at watch/);
  }, 60000);
  it('is played from the terminal, each step as the page told it, and the world asked after', async () => {
    const lines: string[] = [];
    const code = await PlayTool.main([socket, '--seed', 'socket', '--probe', 'state world__altar world__filled',
      '--probe', '#watch clock', '^Take', 'the altar: Set the idol'], l => lines.push(l));
    expect(code).toBe(0);
    expect(lines).toContain('[Set the idol in the altar using the Idol of Ash] The Idol of Ash is used up. '
      + 'The Idol of Ash stands in the altar’s socket.');
    expect(lines.slice(-2)).toEqual(['state world__altar world__filled: yes', '#watch clock: 0']);
  }, 60000);
});
