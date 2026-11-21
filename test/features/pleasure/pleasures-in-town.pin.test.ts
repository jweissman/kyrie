import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { GeneratedWorld } from '../../support/generated';
import { RunnerFind } from '../../support/runner-find';

// Pleasant things to do in a town that is not the first (data/generation/town/pleasures.kyrt): Iscoed's second town,
// Wrackham, draws the old dog in the sun, the old man's fiddle, and the children's game of tag (not the pump with the
// woman at it: Wrackham's pump is Elfred the tinker's, the tinker kit's resident). Each is played through by the rows
// a player sees, on its green: an invitation, two or three steps, nothing paid and no aim; and on coming back, the
// green shows what was done.
class Green {
  static text(s: Said): string { return s.scene.lines.join(' ').replace(/[‘’]/g, "'"); }
  static async take(r: Runner, label: RegExp): Promise<string> {
    return Green.text(await RunnerFind.act(r, r.said(), label));
  }
}
describe('three pleasant things on Wrackham\'s green', () => {
  it('are each played through, and remembered on coming back', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    GeneratedWorld.put(journey.session, 's2_green');
    const r = new Runner(journey.session), c = journey.session.campaign;
    const region = c.module.entities.find(e => e.id === 'region__s2')!;
    expect(region.name).toBe('Wrackham');
    const gold = () => c.world.number({ kind: 'call', name: 'quantity', args: ['party', 'gold'] } as never);
    const coin = gold();
    const look = Green.text(r.said('look'));
    expect(look).toContain('An old dog lies in the sun by the wall');
    expect(look).not.toContain('swearing at it, quietly');
    await Green.take(r, /^Sit down by the old dog/);
    expect(await Green.take(r, /^Scratch the old dog behind the ears/)).toContain('goes to sleep against your leg');
    await Green.take(r, /^Take the old man's fiddle/);
    expect(await Green.take(r, /^Try a tune on it/)).toContain('like a gate in the wind');
    expect(await Green.take(r, /^Try the tune again, slower/)).toContain('two children stop to listen');
    await Green.take(r, /^Give chase/);
    expect(await Green.take(r, /^Catch one of them/)).toContain('you are it again');
    // Nothing paid, and no aim made of any of it.
    expect(gold()).toBe(coin);
    expect((r.said().aims ?? []).filter(a => /dog|fiddle|tag|chase/i.test(a.text))).toEqual([]);
    // Away and back: the green remembers each.
    await Green.take(r, /^Wait a while/);
    GeneratedWorld.put(journey.session, 's2_taproom');
    await Green.take(r, /^Wait a while/);
    GeneratedWorld.put(journey.session, 's2_green');
    const back = Green.text(r.said('look'));
    for (const after of ['thumps its tail twice', 'humming your tune, sharp note and all', "'You're it!'"]) {
      expect(back).toContain(after);
    }
  }, 180000);
});
