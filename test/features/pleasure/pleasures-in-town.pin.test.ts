import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { GeneratedWorld } from '../../support/generated';
import { RunnerFind } from '../../support/runner-find';

// Pleasant things to do in a town that is not the first (data/generation/town/pleasures.kyrt), sixteen of them drawn
// apart across the country (the difference census's third proposal): Iscoed's third town, Edderwick, draws three of
// the new ones, the old man's needle, the box of puppies and the washing song at the trough, none of them drawn by
// any other town of the country. Each is played through by the rows a player sees, on its green: an invitation, two
// steps, nothing paid and no aim; and on coming back, the green shows what was done.
class Green {
  static text(s: Said): string { return s.scene.lines.join(' ').replace(/[‘’]/g, "'"); }
  static async take(r: Runner, label: RegExp): Promise<string> {
    return Green.text(await RunnerFind.act(r, r.said(), label));
  }
}
describe('three pleasant things on Edderwick\'s green', () => {
  it('are each played through, and remembered on coming back', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    GeneratedWorld.put(journey.session, 's3_green');
    const r = new Runner(journey.session), c = journey.session.campaign;
    const region = c.module.entities.find(e => e.id === 'region__s3')!;
    expect(region.name).toBe('Edderwick');
    const gold = () => c.world.number({ kind: 'call', name: 'quantity', args: ['party', 'gold'] } as never);
    const coin = gold();
    const look = Green.text(r.said('look'));
    expect(look).toContain('holds a needle up to the light, and misses the eye again');
    await Green.take(r, /^Thread the old man's needle for him/);
    expect(await Green.take(r, /^Watch him sew/)).toContain('Good as it was, nearly');
    await Green.take(r, /^Pick up the smallest puppy/);
    expect(await Green.take(r, /^Let it fall asleep/)).toContain('it does not wake');
    await Green.take(r, /^Help wring out a sheet/);
    expect(await Green.take(r, /^Sing the chorus with them/)).toContain('sing it your way');
    // Nothing paid, and no aim made of any of it.
    expect(gold()).toBe(coin);
    expect((r.said().aims ?? []).filter(a => /needle|pupp|wash|sing/i.test(a.text))).toEqual([]);
    // Away and back: the green remembers each.
    GeneratedWorld.put(journey.session, 's3_taproom');
    await Green.take(r, /^Wait a while/);
    GeneratedWorld.put(journey.session, 's3_green');
    const back = Green.text(r.said('look'));
    for (const after of ['It is threaded already', 'stops climbing when it sees you', 'hums your way of the chorus']) {
      expect(back).toContain(after);
    }
  }, 180000);
});
