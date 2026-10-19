import { ObservationText } from '../lang/observation-text';
import type { Anchor, Predicate } from '../lang/module';
import type { World } from '../lang/world';
import { ModuleWriter } from '../lang/module-writer';

// Explicitly authored local claims. Reading a description does not grant formal knowledge. A claim is anchored at a
// place, near an entity wherever it now is, or beside a passage (perceived from either end).
export class LocalObservations {
  static perceives(world: World, actor: string, place: string, anchor: Anchor = 'at'): boolean {
    if (anchor === 'at') { return world.test(ModuleWriter.call('at', actor, place)); }
    const here: Predicate = ModuleWriter.call('at', actor, '?here');
    const there: Predicate = anchor === 'near' ? ModuleWriter.call('at', place, '?here')
      : ModuleWriter.call('connects', place, '?here', '?there');
    return world.test({ kind: 'and', left: here, right: there });
  }
  static read(world: World, actor: string): { id: string; text: string }[] {
    return (world.module.observations ?? []).filter(o => this.perceives(world, actor, o.place, o.anchor)
      && world.test(o.when)).map(o => ({ id: o.id, text: ObservationText.render(o.text, world) }));
  }
}
