import { describe, expect, it } from 'bun:test';

// Commands piped into the terminal all at once are each played, and the end of the input leaves the game as q does:
// only the first had been played, and the next prompt threw ERR_USE_AFTER_CLOSE (round 12, B: T24-19). The household,
// by bin/kyrie itself: the yard gate, the back door, and the end of the input.
describe('the terminal, its commands piped in at once', () => {
  it('plays each, echoes it after its prompt, and leaves at the end of the input', async () => {
    const run = Bun.spawn(['bin/kyrie', 'campaign', 'test/fixtures/household/household.campaign.json'],
      { stdin: new TextEncoder().encode('1\n1\n'), stdout: 'pipe', stderr: 'pipe' });
    const [out, err, code] = await Promise.all([new Response(run.stdout).text(), new Response(run.stderr).text(),
      run.exited]);
    expect(out.match(/^\S.* · Day 1, [^\n]*$/gm)).toEqual(['the lane · Day 1, 8:00 a.m.', 'the yard · Day 1, 8:01 a.m.',
      'the kitchen · Day 1, 8:02 a.m.']);
    expect(out).toContain('> 1\n');
    expect(err).not.toMatch(/ERR_USE_AFTER_CLOSE|Error/);
    expect(code).toBe(0);
  }, 30000);
  // A choice typed as it is printed, minutes and all, or without them, in any case (round 12, B: T10).
  it('takes a choice typed as printed, or without its notes', async () => {
    const run = Bun.spawn(['bin/kyrie', 'campaign', 'test/fixtures/household/household.campaign.json'],
      { stdin: new TextEncoder().encode('Take the yard gate to the yard · 1 min\ntake the back door to the kitchen\n'),
        stdout: 'pipe', stderr: 'pipe' });
    const out = await new Response(run.stdout).text();
    await run.exited;
    expect(out).toContain('the kitchen · Day 1, 8:02 a.m.');
  }, 30000);
  // Who each of the company is, as the page draws them: an elf thief had been "level 1, Drifter" (round 12, B).
  it('says who each of the company is, people and calling, on character', async () => {
    const run = Bun.spawn(['bin/kyrie', 'campaign', 'test/fixtures/household/household.campaign.json'],
      { stdin: new TextEncoder().encode('character\n'), stdout: 'pipe', stderr: 'pipe' });
    const out = await new Response(run.stdout).text();
    await run.exited;
    expect(out).toContain('Ama — human warrior, level 1');
  }, 30000);
});
