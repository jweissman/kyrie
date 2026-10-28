import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';

// Work at the inn, and a song for the supper: there had been no work at the inn, and no performance for a bard (the
// play-structure investigation's PT-14). An evening's work earns the night's bed and supper on the house; one who can
// hold a room sings, once an evening, for what the room throws.
class Inn {
  static async at(classId: string) {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Aud', raceId: 'human', classId }] });
    const s = await PlaySession.start(w.path, 'kite', w.source);
    GeneratedWorld.put(s, 's1_taproom');
    return s;
  }
  static find(s: PlaySession, pattern: RegExp) {
    return PlayerView.choices(s.campaign).find(c => pattern.test(c.choice.name));
  }
  static gold(s: PlaySession) { return s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')); }
}

describe('at the inn', () => {
  it('lets the company work for its keep, and then sleep on the house', async () => {
    const s = await Inn.at('warrior');
    const work = Inn.find(s, /^Work for .+ for your keep$/)!;
    await s.perform(work.choice.id);
    expect(Inn.find(s, /, on the house$/)).toBeDefined();
    expect(Inn.find(s, /^Sing for your supper/)).toBeUndefined();
  }, 120000);
  it('lets a bard sing for the supper, for coin, once an evening', async () => {
    const s = await Inn.at('bard'), before = Inn.gold(s);
    await s.perform(Inn.find(s, /^Sing for your supper at /)!.choice.id);
    expect([1, 5]).toContain(Inn.gold(s) - before);
    expect(Inn.find(s, /^Sing for your supper at /)).toBeUndefined();
  }, 120000);
});
