import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Grand Tour's friction 5 (GTR-05): a promise's kept line was told wherever the company happened to be when its
// condition first held, and keeping was final. Perrin's 'goes on being so, as he asked' was told the minute the Door
// opened, and in one play minutes before the hill came down on him. What is said of a promise is said to the one it
// was made to, or held as news until the company is with them, or told among the closing lines; and a promise kept by
// something lasting is kept only at the close (`kept at the close when …`), and broken there if it does not hold.
const probe = 'test/fixtures/probes/vow/probe.campaign.json';

describe('a promise, as the one it was made to hears of it', () => {
  it('is kept where its condition holds, and its line told only when the company is with them again', async () => {
    const j = await Journey.start(probe);
    await j.play('Promise the hermit to light', '^To the shrine');
    const lit = await j.play('Light the shrine lamp');
    expect(j.holds('promiseKept', 'p__lamp_promise')).toBe(true);
    expect(lit).not.toContain('sees the glow');
    const back = await j.play("^To the hermit's cell");
    expect(back).toContain('The hermit sees the glow at the shrine and nods.');
    // Told once: waiting beside him does not tell it again.
    expect(await j.play('Wait › A while')).not.toContain('sees the glow');
  }, 30000);

  it('is judged at the close when it is kept by something lasting, and told among the closing lines', async () => {
    const j = await Journey.start(probe);
    await j.play('Promise the hermit to leave him', 'Promise the hermit to light', '^To the shrine',
      'Light the shrine lamp', 'Wait › An hour');
    // Its condition has held all along, but it is not kept until the story closes.
    expect(j.holds('promiseKept', 'p__peace_promise')).toBe(false);
    const closing = await j.play('Take the road out of the hollow');
    expect(j.holds('reached', 'p__gone')).toBe(true);
    expect(j.holds('promiseKept', 'p__peace_promise')).toBe(true);
    expect(closing).toContain('Behind you the hermit goes on in his peace, as he asked.');
    // The lamp's line, held as news because the company never went back to him, is told there too.
    expect(closing).toContain('The hermit sees the glow at the shrine and nods.');
  }, 30000);

  it('is broken at the close, not kept, when what it was kept by fails before it', async () => {
    const j = await Journey.start(probe);
    await j.play('Promise the hermit to leave him', '^To the shrine', 'Wait › An hour', 'Ring the shrine bell');
    expect(j.holds('promiseKept', 'p__peace_promise')).toBe(false);
    const closing = await j.play('Take the road out of the hollow');
    expect([j.holds('promiseKept', 'p__peace_promise'), j.holds('promiseBroken', 'p__peace_promise')])
      .toEqual([false, true]);
    expect(closing).toContain("The hermit's peace is broken, and you broke it.");
    expect(closing).not.toContain('as he asked');
  }, 30000);
});
