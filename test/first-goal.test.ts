import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame, Member, Setting } from '../web/engine/protocol';
import { Origins } from '../src/world/origins';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// Every reason for having come that a country holds sets a life going with a first goal, said plainly once at the end
// of the opening ("Your first goal: …") and held in the notes, that names a place the map shows: the company can set
// out for it from where it begins, or is there (the owner, 7 November: six to eight origins, each playable from Set
// out, the opening leading naturally into its first aim). Kite holds all eight: the five there were, and a dead man's
// map, a sister gone under and a sealed letter, which go to a lesser work of the makers and to the next town on.
class Begun {
  static readonly party: Member[] = [{ name: 'Aud', raceId: 'human', classId: 'warrior' }];
  static readonly seed = 'kite';
  static async origins(): Promise<string[]> {
    const setting = await new EngineHost(() => undefined).handle({ kind: 'world', seed: this.seed }) as Setting;
    return (setting.origins ?? []).map(o => o.id);
  }
  static async begin(origin: string): Promise<Frame> {
    return await new EngineHost(() => undefined).handle({ kind: 'begin', campaign: 'world', seed: this.seed,
      party: this.party, origin, apart: true }) as Frame;
  }
  // Where the company could set out for from here, or is.
  static reachable(frame: Frame): Set<string> {
    const s = frame.screen;
    return new Set([s.place.id, ...[...s.destinations ?? [], ...s.mapped ?? [], ...s.roads ?? [], ...s.around ?? []]
      .map(d => d.id)]);
  }
}

describe('the first goal of every reason for having come', () => {
  it('is offered in a country that holds them all: eight', async () => {
    const all = (await Origins.load(NodeBundleSource.shared)).map(o => o.manifest.id);
    expect(all.length).toBe(8);
    expect((await Begun.origins()).sort()).toEqual([...all].sort());
  }, 120000);
  it.each(['kin', 'order', 'debt', 'herbs', 'wanderer', 'map', 'lost', 'courier'])(
    'of %s is held from the first, said at the end of the opening, and names a place the map shows', async origin => {
      const frame = await Begun.begin(origin), aim = frame.screen.aims?.[0];
      expect(aim?.text.length).toBeGreaterThan(0);
      expect(frame.leaf.prologue?.aim?.length).toBeGreaterThan(0);
      const reach = Begun.reachable(frame);
      expect(aim!.places?.some(p => reach.has(p))).toBe(true);
    }, 120000);
});

describe('the three new origins', () => {
  // Each begins on the way into the first town, where someone is met on the road, and its aim is the place it names.
  it.each([['map', /dead man.s map marks/], ['lost', /Your sister went into/], ['courier', /Carry the sealed letter to/]])(
    '%s begins on the road in, with its aim', async (origin, said) => {
      const frame = await Begun.begin(origin as string);
      expect(frame.screen.place.id).toMatch(/_approach$/);
      expect(frame.leaf.prologue?.meeting).toBeDefined();
      expect(frame.screen.objectives[0]).toMatch(said as RegExp);
    }, 120000);
  it('a dead man\'s map is seen through by going there, searching, and taking what is under the door-stone',
    async () => {
      const host = new EngineHost(() => undefined);
      let f = await host.handle({ kind: 'begin', campaign: 'world', seed: Begun.seed, party: Begun.party,
        origin: 'map' }) as Frame;
      const to = f.screen.aims![0]!.places!.find(p => Begun.reachable(f).has(p))!;
      f = await host.handle({ kind: 'travel', destination: to }) as Frame;
      expect(f.screen.place.id).toBe(to);
      f = await host.handle({ kind: 'perform', command: `search(${to})` }) as Frame;
      const take = f.screen.things.find(t => t.id === 'origin__cache')?.acts.find(a => a.command)?.command;
      f = await host.handle({ kind: 'perform', command: take! }) as Frame;
      expect(f.screen.items.map(i => i.name)).toContain('the dead man\'s box');
      expect(f.screen.objectives.join(' ')).not.toMatch(/dead man.s map/);
    }, 180000);
});
