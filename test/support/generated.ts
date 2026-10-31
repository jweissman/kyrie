import type { PlaySession } from '../../src/session/play-session';
import type { Placement } from '../../src/world/world-assembler';
import { ModuleWriter } from '../../src/lang/module-writer';
import { PlayerView } from '../../src/presentation/player-view';
import { Journey } from '../../src/session/journey';

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
    for (const [passage, to] of this.path(s, place)) { await s.perform(`go(${passage},${to})`); }
  }
  // The ways to take, passage by passage, from where the company stands to a place.
  static path(s: PlaySession, place: string): [string, string][] {
    const target = place.includes('__') ? place : `region__${place}`;
    return Journey.way(s.campaign.world, s.campaign.world.one('at', 'party')!, target);
  }
  // The first person who carries word of a placement, and the room they are found in (an innkeeper in a taproom, or
  // whoever speaks for a hamlet on its green).
  static carrier(s: PlaySession, placement: Placement): { id: string; room: string } {
    const id = Object.values(placement.carriers).flat()[0]!;
    return { id, room: s.campaign.world.one('at', `region__${id}`)!.replace(/^region__/, '') };
  }
  // Goes to whoever carries word of a placement and asks them about it: the word whose topic tells of one of the
  // placement's own facts (word modules are numbered in the order placements carry word, which the heralds placed
  // first shift; n, the number expected, is the first tried).
  static async hear(s: PlaySession, placement: Placement, n: number) {
    const { id, room } = this.carrier(s, placement), c = s.campaign;
    this.put(s, room);
    await s.perform('wait');
    const asks = PlayerView.choices(c).map(x => x.choice.id).filter(x => x.startsWith(`ask(region__${id},word`));
    const ours = (x: string) => c.world.related('reveals', /,(.+)\)$/.exec(x)?.[1] ?? '')
      .some(r => placement.modules.some(m => r.args[1]!.startsWith(`${m}__`)));
    const ask = asks.find(x => x.startsWith(`ask(region__${id},word${n}__`) && ours(x)) ?? asks.find(ours);
    if (!ask) { throw new Error(`No one at ${room} to ask about ${placement.scenario}`); }
    return s.perform(ask);
  }
}
