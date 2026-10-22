import { ModuleWriter } from '../lang/module-writer';
import type { World } from '../lang/world';

// Who in the company takes something it picks up or buys, so that taking is one choice rather than a list of hands:
// a companion already carrying something of the same kind, else whoever carries least. The pack can hand it on.
export class Carriers {
  static carrier(world: World, actor: string, item: string): string | undefined {
    const rel = world.view.relations;
    const kind = rel.find(r => r.name === 'itemKind' && r.args[0] === item)?.args[1];
    const loads = rel.filter(r => r.name === 'memberOf' && r.args[1] === actor && world.test(ModuleWriter.call('awake', r.args[0]!)))
      .map(r => ({ member: r.args[0]!, items: rel.filter(o => o.name === 'ownedItem' && o.args[1] === r.args[0]).map(o => o.args[0]!) }));
    const same = loads.find(l => l.items.some(i => rel.some(r => r.name === 'itemKind' && r.args[0] === i && r.args[1] === kind)));
    return (same ?? [...loads].sort((a, b) => a.items.length - b.items.length)[0])?.member;
  }
}
