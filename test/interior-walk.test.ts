import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';
import { SceneModel } from '../src/ui/scene';
import { Attending } from '../src/ui/attention';
import type { Lens } from '../src/presentation/glance-types';
import { Glanced } from './support/glanced';
import { GeneratedWorld } from './support/generated';

// The interior walk, headless (the owner, 14 November: CN-08, the fast half of the acceptance; the aesthetic line walks
// it in the browser). In a1's undertown at Millholm: down the churchyard's stair into the crypt, a light, the lenses
// switched (each one's acts the scene's own, and no time passing), the next place by the compass, a thing looked
// at, the raiser talked to, the dead fought with the target changed, the place as it was after the fight, the way out
// by the compass, and the town again, where the country is offered once more.
type Fight = { state: { combatants: { id: string; team: string; hp: number }[] };
  legalCommands(): { target?: string }[] };
const lenses: Lens[] = ['things', 'people', 'places', 'time'];
class Walk {
  static async start(): Promise<Glanced> {
    const s = await DrawnWorld.start('a1', { origin: 'kin', party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior',
      level: 4 }, { name: 'Odo', raceId: 'human', classId: 'cleric', level: 4 }] }, NodeBundleSource.shared);
    GeneratedWorld.put(s, 's2_u_yard');
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    const lock = 'region__s2_u_crypt_lock';
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('state', lock, 'locked') },
      { kind: 'assert', call: ModuleWriter.call('state', lock, 'open') }]));
    return Glanced.of(s);
  }
  // Every act the scene draws, and every legal command.
  static acts(g: Glanced): Set<string> {
    const scene = Attending.place(SceneModel.build(g.screen));
    return new Set([...[...scene.subjects.flatMap(x => Attending.all(x.choices)), ...Attending.all([...scene.near,
      ...scene.far, ...scene.you])].map(x => x.id), ...g.legal()]);
  }
  // After something done outside the glance's own telling (a fight), the place drawn again.
  static look(g: Glanced) {
    g.screen = ScreenModel.build(g.campaign);
    g.leaf = Narrator.leaf(g.campaign, g.screen);
  }
}

describe('the interior walk', () => {
  it('goes in, looks about by lens, follows the compass in and out, talks, fights, and comes back to the town', async () => {
    const g = await Walk.start(), c = g.campaign;
    await g.to('region__s2_u_crypt');
    expect(g.glance.enclosed).toBe(true);
    // In the dark nothing is known to be left: not exhausted; the way out is known and walkable.
    expect(g.glance.compass!.exhausted).toBe(false);
    expect(g.glance.compass!.out).toMatchObject({ to: 'region__s2_u_yard', command: 'travel:region__s2_u_yard' });
    await g.choose(/^light_item/);
    // The lenses: each one's acts are the scene's own; switching takes no time and does nothing.
    const before = { world: c.world, elapsed: c.readout.elapsed, done: c.history.length }, acts = Walk.acts(g);
    for (const lens of lenses) {
      for (const a of [...g.glance.lenses[lens].promoted, ...g.glance.lenses[lens].rest]) {
        expect([lens, a.choice, acts.has(a.choice) || acts.has(a.command ?? '')]).toEqual([lens, a.choice, true]);
      }
    }
    expect({ world: c.world, elapsed: c.readout.elapsed, done: c.history.length }).toEqual(before);
    // The time lens: the waiting acts, by their own commands.
    expect([...g.glance.lenses.time.promoted, ...g.glance.lenses.time.rest].map(a => a.command)).toContain('wait');
    // The compass's next: the ossuary, not yet been to; taken by its own way.
    const next = g.glance.compass!.next!;
    expect(next.to).toBe('region__s2_u_ossuary');
    await g.perform(next.command!);
    expect(g.screen.place.id).toBe('region__s2_u_ossuary');
    // A thing looked at, by the things lens.
    const things = g.glance.lenses.things.promoted;
    expect(things.map(a => a.subject)).toContain('region__s2_u_candle');
    // Someone talked to.
    await g.perform('talk_to(region__s2_u_raiser)');
    const talk = Attending.talk(SceneModel.build(g.screen), 'region__s2_u_raiser');
    expect(talk?.replies.map(r => r.label)).toContainEqual(expect.stringMatching(/black candle/));
    // The dead fought, the target changed from one turn to the next.
    const targets: string[] = [];
    const fought = await g.s.leg('attack(region__s2_u_dead)', async (battle: unknown) => {
      const b = battle as Fight, standing = new Set(b.state.combatants.filter(f => f.team !== 'fighters' && f.hp > 0)
        .map(f => f.id));
      const legal = b.legalCommands(), at = legal.filter(x => x.target && standing.has(x.target));
      const pick = at.find(x => x.target !== targets.at(-1)) ?? at[0] ?? legal[0]!;
      targets.push(pick.target ?? '');
      return pick as never;
    });
    expect(fought.result).toBe('success');
    expect(new Set(targets.filter(Boolean)).size).toBeGreaterThan(1);
    // The place as it was: still the ossuary, enclosed, its lenses and its compass, the way out walkable.
    Walk.look(g);
    expect([g.screen.place.id, g.glance.enclosed]).toEqual(['region__s2_u_ossuary', true]);
    expect(g.glance.lenses.things.promoted.length + g.glance.lenses.things.rest.length).toBeGreaterThan(0);
    const out = g.glance.compass!.out!;
    expect([out.to, out.ways.length]).toEqual(['region__s2_u_yard', 2]);
    // Out by the compass, walked: time passes, and the churchyard is outside.
    const clock = () => ({ watches: c.readout.elapsed, minutes: c.readout.minutes ?? 0 }), was = clock();
    await g.perform(out.command!);
    expect(g.screen.place.id).toBe('region__s2_u_yard');
    expect(g.glance.enclosed).toBeUndefined();
    expect(clock()).not.toEqual(was);
    // And the town again, where the country is offered once more.
    expect([...g.screen.destinations ?? [], ...g.screen.roads ?? []].length).toBeGreaterThan(0);
  }, 120000);
});
