import { Charted } from './support/charted';
import { Heard } from './support/heard';
import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { PlayerView } from '../src/presentation/player-view';
import { HexBoundary } from '../src/hex-boundary';
import { Crossing } from '../src/campaign/crossing';
import { CrossingRefused } from '../src/campaign/crossing-refused';
import { Travel } from '../src/session/travel';
import type { Campaign } from '../src/campaign/campaign';

// Cross-hex travel only as travel (TR-20; the owner, 19 November: "I got from my quest destination back to town
// without the map"): on walks through the drawn worlds, every act the engine offers that is not its travel leaves the
// company in the hex it stands in, and a way into another hex offered for the map is refused when sent as a command.
// Each act is done and undone where it is offered, read by what it is (its action), never by where a page draws it.
// Two worlds, so that the file is held under thirty seconds: kite is held to it by the lint (bin/kyrie lint --world).
// The cold pans' staithe is the owner's case: poling Ianto's boat down the cut had put the company in the town's
// boiling-house, hexes off, with no journey.
class Walk {
  static drawn(seed: string, origin: string) {
    return DrawnWorld.start(seed, { origin, party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared).then(s => Journey.of(s));
  }
  // What crossed: each offered act done (and undone) here, one of each kind, said where it took the company.
  static crossed(c: Campaign): string[] {
    const here = c.world.one('at', 'party')!, hex = HexBoundary.hex(c.module, here), kinds = new Set<string>();
    const out: string[] = [];
    for (const r of PlayerView.choices(c)) {
      const kind = r.action.schema ?? r.action.id, to = Crossing.whither(r.action);
      if (kinds.has(kind) && !to) { continue; }
      kinds.add(kind);
      if (to && HexBoundary.crosses(c.module, here, to)) {
        try { c.execute(r.action.id); c.undo(); out.push(`${r.action.id}: a way into another hex, not refused`); }
        catch (e) { if (!(e instanceof CrossingRefused)) { throw e; } }
        continue;
      }
      try { c.execute(r.action.id); } catch { continue; }
      const now = c.world.one('at', 'party')!, there = HexBoundary.hex(c.module, now);
      if (hex && there && there !== hex) { out.push(`${r.action.id}: ${here} (${hex}) to ${now} (${there})`); }
      c.undo();
    }
    return out;
  }
  // On by the engine's own travel to the first place known the way to, and looked at again there.
  // Told of the country's towns first: the map draws what the company knows, and a fresh life knows no further than
  // the ways from where it stands (OR-810).
  static async onward(j: Journey): Promise<string[]> {
    const c = j.session.campaign;
    Heard.towns(c);
    const screen = Charted.screen(c);
    const d = [...screen.destinations ?? [], ...screen.roads ?? []][0];
    expect(d).toBeDefined();
    await Travel.go({ campaign: c, perform: (x: string) => j.session.perform(x) }, d!.id);
    return this.crossed(c);
  }
}
describe('another hex is gone into only by the engine\'s travel', () => {
  it('at the cold pans\' staithe, where the boat had carried the company to the town', async () => {
    const j = await Walk.drawn('iscoed', 'pans');
    j.roll('pass');
    expect(Walk.crossed(j.session.campaign)).toEqual([]);
    await j.play('To the landing at Porthalen');
    const fuel = /at (\w+): the salt-pans/.exec((j.screen().aims ?? []).map(a => a.text).join(' | '))![1]!;
    await j.play(`map:${fuel}`, `?map:${fuel}`, `?map:${fuel}`, 'To the staithe', 'Ask Ianto about the fuel boat');
    expect(PlayerView.choices(j.session.campaign).some(r => r.action.schema === 'pans__pole_boat')).toBe(true);
    expect(Walk.crossed(j.session.campaign)).toEqual([]);
  }, 60000);
  it('in a1, where play begins and a journey on', async () => {
    const j = await Walk.drawn('a1', 'kin');
    expect(Walk.crossed(j.session.campaign)).toEqual([]);
    expect(await Walk.onward(j)).toEqual([]);
  }, 60000);
});
