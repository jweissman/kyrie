import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { RunnerFind } from './support/runner-find';

// The pedlar robbed on the road in (data/origins/prologue.kyrt; OR-146, the owner's playtest of 20 November: a defeat
// had been narrated, "puts you on your back in the road with one shove", no fight offered, no hurt). Stood up to and
// not cowed, the two robbers are fought, as a bout: won, they run and the pedlar gives the lantern; lost, the company
// is hurt by the fight itself and they go with a fistful of the pack. Cowed by the stand, they go. The other answers
// stand as they were.
class Road {
  static async start(as = 'human/warrior/Aud') {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'mere', '--origin', 'wanderer', '--as', as]));
    return { journey, r: new Runner(journey.session), c: journey.session.campaign };
  }
  static text(s: Said): string { return s.scene.lines.join(' ').replace(/[‘’]/g, "'"); }
  static hp(c: Awaited<ReturnType<typeof Road.start>>['c']): number {
    return c.readout.creatures.find(x => x.id === c.readout.partyIds[0])!.state.hp;
  }
  // The fight let go on by the game's own tactics until it ends.
  static async fought(r: Runner, s: Said): Promise<Said> {
    for (let n = 0; s.moment === 'fight' && n < 40; n++) {
      const next = await r.ask('{"act":"fight:auto"}');
      if ('error' in next) { throw new Error(next.error); }
      s = next;
    }
    return s;
  }
}
describe('the pedlar robbed on the road in', () => {
  it('cows the robbers by a stand that comes off, and the lantern is given', async () => {
    const { journey, r, c } = await Road.start();
    journey.roll('pass');
    const s = await RunnerFind.act(r, r.said(), /^Stand up to the robbers/);
    expect(Road.text(s)).toContain("'Keep it. It's the least of what they'd have had.'");
    expect(c.world.one('at', 'origin__robbers')).toBeUndefined();
  }, 120000);
  it.each(['human/warrior/Aud', 'elf/mage/Ilse'])('as %s, comes to a real fight when the stand does not, its end told and felt', async as => {
    const { journey, r, c } = await Road.start(as);
    const whole = Road.hp(c);
    journey.roll('fail');
    let s = await RunnerFind.act(r, r.said(), /^Stand up to the robbers/);
    journey.roll();
    expect(s.moment).toBe('fight');
    s = await Road.fought(r, s);
    const end = `${Road.text(s)} ${Road.text(r.said('look'))}`;
    expect(end).not.toContain('one shove');
    expect(end).toMatch(/break and run over the field|blood in your mouth/);
    // Lost, the company is the worse for it, and alive: a bout, not a killing.
    if (/blood in your mouth/.test(end)) { expect(Road.hp(c)).toBeLessThan(whole); }
    expect(Road.hp(c)).toBeGreaterThan(0);
    expect(c.world.one('at', 'origin__robbers')).toBeUndefined();
  }, 120000);
  // A bout lost (the engine's own: Aftermath.yielded), as a lone novice may lose it: they go, and say so.
  it('lets the robbers go with a fistful of the pack when the bout is lost', async () => {
    const { r, c } = await Road.start();
    c.commitWorld(c.world.apply([{ kind: 'assert', call: { kind: 'call', name: 'yielded', args: ['party', 'origin__robbers'] } },
      { kind: 'retract', call: { kind: 'call', name: 'peaceable', args: ['origin__robbers'] } }]));
    const s = await RunnerFind.act(r, r.said(), /^Wait a while/);
    expect(Road.text(s)).toContain('blood in your mouth');
    expect(c.world.one('at', 'origin__robbers')).toBeUndefined();
  }, 120000);
});

