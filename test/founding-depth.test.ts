import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';

// A town's founding has a place of its own (the makers' well, a fortress's gate-tower), and something to do there
// besides its work: a fresh play of Mission 17 stood at the makers' well at Naedltun, where "steps spiral down the
// inside of it to the water a long way below", and could do nothing but leave.
class Town {
  static async start(seed: string, classId: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Aud', raceId: 'elf', classId }] });
    return PlaySession.start(w.path, seed, w.source);
  }
  static async act(s: PlaySession, name: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => name.test(x.choice.name))!;
    return (await s.perform(c.choice.id)).perceptions?.filter(p => p.kind === 'observation').map(p => p.text) ?? [];
  }
}

describe('a founding\'s own place', () => {
  it('goes down the makers\' well to the words on its last step, which one with lore can read', async () => {
    const s = await Town.start('ember', 'mage');
    await GeneratedWorld.travel(s, 's5_well');
    expect(ScreenModel.build(s.campaign).exits.map(e => e.destination.name)).toContain('the foot of the makers\' well');
    await GeneratedWorld.travel(s, 's5_well_foot');
    const seen = await Town.act(s, /^Look closely at the words cut in the last step/);
    expect(seen).toContain('The letters are the makers\': deep, square, every one the same height, cut by someone who meant'
      + ' them to last as long as the well.');
    expect(seen.some(l => /WATER FOR THOSE AFTER US/.test(l))).toBe(true);
  }, 120000);
  it('climbs a fortress\'s gate-tower and sees the country from it', async () => {
    const s = await Town.start('wren', 'ranger');
    await GeneratedWorld.travel(s, 's1_gate');
    const seen = await Town.act(s, /^Climb to the top of the gate-tower/);
    expect(seen).toContain('On the roof of the gate-tower the wind is cold, and the country lies open all round, the road'
      + ' running out of it both ways.');
    expect(seen.filter(l => /^To the [a-z-]+, /.test(l)).length).toBeGreaterThan(3);
  }, 120000);
});
