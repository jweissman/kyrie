import type { PlaySession } from '../../src/session/play-session';
import type { Placement } from '../../src/world/world-assembler';
import { ModuleWriter } from '../../src/lang/module-writer';
import { PlayerView } from '../../src/presentation/player-view';

// Generated worlds are laid out by their seed, and a new dimension in the generator lays them out differently. A
// test about what happens in one reads where things are from the world's report instead of walking a fixed route.
export class GeneratedWorld {
  static put(s: PlaySession, place: string) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', `region__${place}`) }]));
  }
  // Walks the company to a place by the shortest way the world joins them, taking each way as the company can (a
  // place of the first region by its own name; of another, by its id: x0y1__edge_east).
  static async travel(s: PlaySession, place: string) {
    const world = s.campaign.world, target = place.includes('__') ? place : `region__${place}`;
    const links = world.related('connects');
    const start = world.one('at', 'party')!, came = new Map<string, [string, string]>([[start, ['', '']]]);
    for (const queue = [start]; queue.length && !came.has(target);) {
      const here = queue.shift()!;
      for (const l of links.filter(r => r.args[1] === here && !came.has(r.args[2]!))) {
        came.set(l.args[2]!, [here, l.args[0]!]); queue.push(l.args[2]!);
      }
    }
    if (!came.has(target)) { throw new Error(`No way from ${start} to ${target}`); }
    const steps: [string, string][] = [];
    for (let at = target; at !== start; at = came.get(at)![0]) { steps.unshift([came.get(at)![1], at]); }
    for (const [passage, to] of steps) { await s.perform(`go(${passage},${to})`); }
  }
  // The first person who carries word of a placement, and the room they are found in (an innkeeper in a taproom, or
  // whoever speaks for a hamlet on its green).
  static carrier(s: PlaySession, placement: Placement): { id: string; room: string } {
    const id = Object.values(placement.carriers).flat()[0]!;
    return { id, room: s.campaign.world.one('at', `region__${id}`)!.replace(/^region__/, '') };
  }
  // Goes to whoever carries word of the n-th placement and asks them about it.
  static async hear(s: PlaySession, placement: Placement, n: number) {
    const { id, room } = this.carrier(s, placement);
    this.put(s, room);
    await s.perform('wait');
    const ask = PlayerView.choices(s.campaign).map(c => c.choice.id)
      .find(c => c.startsWith(`ask(region__${id},word${n}__`));
    if (!ask) { throw new Error(`No one at ${room} to ask about ${placement.scenario}`); }
    return s.perform(ask);
  }
}
