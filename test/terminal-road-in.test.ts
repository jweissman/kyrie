import { describe, expect, it } from 'bun:test';

// The road in describes the ditched cart once: the meeting and the cart's own state had both described it, nearly
// word for word (headless terminal, 12 November: T24-13); the cart's state says only the sacks. As bin/kyrie itself
// opens kite's road for a wanderer, and tells the whole of the place on look.
describe('the road in, in the terminal', () => {
  it('describes the cart in the ditch once, the whole of the place told', async () => {
    const run = Bun.spawn(['bin/kyrie', 'adventure', '--world', 'kite', '--origin', 'wanderer', '--as', 'human/warrior/Aud'],
      { stdin: new TextEncoder().encode('look\n'), stdout: 'pipe', stderr: 'pipe' });
    const out = await new Response(run.stdout).text();
    await run.exited;
    const told = out.split(/^> look$/m)[1]!.split('Foreground')[0]!;
    expect(told.match(/canted|wheel down in the ditch/g)).toEqual(['canted', 'wheel down in the ditch']);
    expect(told).toContain('Sacks of meal are roped');
  }, 120000);
});
