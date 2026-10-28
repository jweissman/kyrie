import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

// What a raiders' hold speaks of (the smoke going up the cavern's roof as if it had somewhere to go) is a thing to
// look at closely, and looking finds the back way, as searching does (PT-08: it was found only by "Search here").
describe("a raiders' cave", () => {
  it('lets the smoke-hole its cavern speaks of be looked at, and looking finds the chimney', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const kept = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    const there = c.world.related('at').filter(r => r.args[1] === 'raidersHold__cavern').map(r => r.args[0]!);
    kept.commit(kept.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'raidersHold__cavern') },
      ...there.map(g => ({ kind: 'assert', call: ModuleWriter.call('tolerates', g, 'party') }))]));
    const look = PlayerView.choices(c).find(x => x.choice.id === 'look_closely(raidersHold__smoke_hole)')!;
    const event = await s.perform(look.choice.id);
    expect(c.world.test(ModuleWriter.call('knows', 'party', 'raidersHold__backway_known'))).toBe(true);
    expect(event.perceptions?.map(p => p.text))
      .toContainEqual(expect.stringMatching(/^Up the smoke-hole there is daylight/));
  }, 120000);
});
