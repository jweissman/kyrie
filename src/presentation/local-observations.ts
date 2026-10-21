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
  // Near an entity: where it is; across a way it guards, from the far end while it stands at this one; and inside an
  // open container, where the container is.
  private static near(world: World, entity: string): Predicate {
    let near: Predicate = ModuleWriter.call('at', entity, '?here');
    if (world.module.relations.some(r => r.name === 'guards')) {
      near = { kind: 'or', left: near, right: { kind: 'and', left: ModuleWriter.call('guards', entity, '?way'),
        right: { kind: 'and', left: ModuleWriter.call('connects', '?way', '?here', '?there'),
          right: ModuleWriter.call('at', entity, '?there') } } };
    }
    if (world.module.relations.some(r => r.name === 'inside')) {
      near = { kind: 'or', left: near, right: { kind: 'and', left: ModuleWriter.call('inside', entity, '?box'),
        right: { kind: 'and', left: ModuleWriter.call('at', '?box', '?here'),
          right: { kind: 'not', value: ModuleWriter.call('shut', '?box') } } } };
    }
    return near;
  }
  // Whether something is perceived at all: what is hidden until a fact is known is not, until then.
  static noticed(world: World, entity: string | undefined, actor: string): boolean {
    if (!entity || !world.module.queries.some(q => q.name === 'noticed')) { return true; }
    return world.test(ModuleWriter.call('noticed', entity, actor));
  }
  // Inside an open container that stands at the place.
  static within(world: World, entity: string, place: string): boolean {
    if (!world.module.relations.some(r => r.name === 'inside')) { return false; }
    return world.test({ kind: 'and', left: ModuleWriter.call('inside', entity, '?box'),
      right: { kind: 'and', left: ModuleWriter.call('at', '?box', place),
        right: { kind: 'not', value: ModuleWriter.call('shut', '?box') } } });
  }
  // What the place itself is like comes first, then who and what is about in it.
  static read(world: World, actor: string): { id: string; text: string }[] {
    const seen = (world.module.observations ?? []).filter(o => this.perceives(world, actor, o.place, o.anchor)
      && world.test(o.when) && this.noticed(world, o.about ?? (o.anchor === 'near' ? o.place : undefined), actor));
    return [...seen.filter(o => (o.anchor ?? 'at') === 'at'), ...seen.filter(o => (o.anchor ?? 'at') !== 'at')]
      .map(o => ({ id: o.id, text: ObservationText.render(o.text, world) }));
  }
}
