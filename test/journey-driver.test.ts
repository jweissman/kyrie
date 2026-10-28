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

// Low Water's 22, 24 and 25 (AUT-12), the journey driver as an author found it: an action's Result and a rule's words
// were only in the page; a step typed with a straight apostrophe missed the page's curled one; ?=+6 was read as a
// label and passed over; waits until something held were loops written by hand; and "what the Reckoner counts", meant
// for the census exhibit, asked the clerk who had a topic of the same words, and nothing said so.
const probe = 'test/fixtures/probes/journey-driver/probe.campaign.json';
describe('the journey driver', () => {
  it('tells what an action and a rule said, and matches quotes straight or curled', async () => {
    const j = await Journey.start(probe);
    const told = await j.play('Turn the wheel');
    expect(told).toContain('You lean on the spoke, and the wheel turns.');
    expect(told).toContain('Across the yard, the gate groans open.');
    await j.play("Reckoner's ledger");
    expect(j.holds('state', 'p__ledger', 'p__opened')).toBe(true);
    await j.play('Talk to Quill', 'census exhibit: Read what the Reckoner counts', 'Ask Quill what the Reckoner counts');
    expect(j.taken.at(-1)!.told).toContain("'Everything,' says Quill.");
    expect(j.taken.at(-1)!.page).toContain('‘Everything,’ says Quill.');
    expect(j.ambiguous).toEqual([]);
  }, 30000);
  it('says when a step matched choices that do different things, and strict, fails there', async () => {
    const j = await Journey.start(probe);
    await j.play('what the Reckoner counts');
    expect(j.ambiguous).toEqual(['/what the Reckoner counts/ matches Quill, a clerk: Ask Quill what the Reckoner counts'
      + ' | the census exhibit: Read what the Reckoner counts']);
    const strict = await Journey.start(probe, 'journey', { strict: true });
    await expect(strict.play('what the Reckoner counts')).rejects.toThrow(/name the one meant by its heading/);
  }, 30000);
  it('waits until a condition holds, takes ?=+3 as a wait, and stops waiting where the book closes', async () => {
    const j = await Journey.start(probe);
    expect(await j.play('=until rung(party)')).toContain('A bell rings in the gate-house.');
    expect(j.watch()).toBe(4);
    await j.play('?=+3');
    expect(j.watch()).toBe(7);
    await expect(j.play('=until rang(party)')).rejects.toThrow(/nothing is called rang/);
    expect(await j.play('=40')).toContain('the water closes over');
    expect(j.holds('reached', 'p__drowning')).toBe(true);
    expect(await j.play('=60', '=until creaked(party)', '?Turn the wheel')).toBe('');
  }, 30000);
});
