import { ObservationText } from '../lang/observation-text';
import type { Anchor, Predicate } from '../lang/module';
import type { World } from '../lang/world';
import { ModuleWriter } from '../lang/module-writer';

// Explicitly authored local claims. Reading a description does not grant formal knowledge. A claim is anchored at a
// place, near an entity wherever it now is (or across a way it guards), or beside a passage (perceived from either
// end).
export class LocalObservations {
  static perceives(world: World, actor: string, place: string, anchor: Anchor = 'at'): boolean {
    if (anchor === 'at') { return world.test(ModuleWriter.call('at', actor, place)); }
    const here: Predicate = ModuleWriter.call('at', actor, '?here');
    const there: Predicate = anchor === 'near' ? this.near(world, place)
      : ModuleWriter.call('connects', place, '?here', '?there');
    return world.test({ kind: 'and', left: here, right: there });
  }
  private static near(world: World, entity: string): Predicate {
    const at = ModuleWriter.call('at', entity, '?here');
    if (!world.module.relations.some(r => r.name === 'guards')) { return at; }
    return { kind: 'or', left: at, right: { kind: 'and', left: ModuleWriter.call('guards', entity, '?way'),
      right: ModuleWriter.call('connects', '?way', '?here', '?there') } };
  }
  // What the place itself is like comes first, then who and what is about in it.
  static read(world: World, actor: string): { id: string; text: string }[] {
    const seen = (world.module.observations ?? []).filter(o => this.perceives(world, actor, o.place, o.anchor)
      && world.test(o.when));
    return [...seen.filter(o => (o.anchor ?? 'at') === 'at'), ...seen.filter(o => (o.anchor ?? 'at') !== 'at')]
      .map(o => ({ id: o.id, text: ObservationText.render(o.text, world) }));
  }
}
