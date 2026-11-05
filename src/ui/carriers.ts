import { ModuleWriter } from '../lang/module-writer';
import type { World } from '../lang/world';

// Who in the company takes something it picks up or buys, so that taking is one choice rather than a list of hands:
// a companion already carrying something of the same kind, else whoever carries least. The pack can hand it on.
export class Carriers {
  // Read by the world's indexes (it had gone through every fact the world held, for each thing that could be taken).
  static carrier(world: World, actor: string, item: string): string | undefined {
    const kind = world.one('itemKind', item);
    const loads = world.relatedTo('memberOf', actor).filter(r => world.test(ModuleWriter.call('awake', r.args[0]!)))
      .map(r => ({ member: r.args[0]!, items: world.relatedTo('ownedItem', r.args[0]!).map(o => o.args[0]!) }));
    const same = loads.find(l => l.items.some(i => world.one('itemKind', i) === kind));
    return (same ?? [...loads].sort((a, b) => a.items.length - b.items.length)[0])?.member;
  }
}
