import { ObservationText } from '../lang/observation-text';
import type { Anchor, Predicate } from '../lang/module';
import type { World } from '../lang/world';
import { ModuleWriter } from '../lang/module-writer';
import { KeptPredicates } from '../lang/kept-predicates';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../spatial';

// Explicitly authored local claims. Reading a description does not grant formal knowledge. A claim is anchored at a
// place, near an entity wherever it now is (or across a way it guards), beside a passage (perceived from either
// end), or, for what is said, within an area.
export class LocalObservations {
  static perceives(world: World, actor: string, place: string, anchor: Anchor = 'at'): boolean {
    if (anchor === 'at') { return world.test(ModuleWriter.call('at', actor, place)); }
    if (anchor === 'within') { return this.inArea(world, actor, place); }
    const relations = `${world.relates('guards')}${world.relates('inside')}${world.relates('travelsWith')}`;
    return world.test(KeptPredicates.of(`perceives:${actor}:${place}:${anchor}:${relations}`, () => {
      const here: Predicate = ModuleWriter.call('at', actor, '?here');
      const there: Predicate = anchor === 'near' ? this.near(world, place)
        : ModuleWriter.call('connects', place, '?here', '?there');
      return { kind: 'and', left: here, right: there };
    }));
  }
  // Whether one stands anywhere inside an area: the city, and not under the sea beneath it.
  static inArea(world: World, actor: string, area: string): boolean {
    const here = world.one('at', actor);
    return !!here && Spatial.ancestry(EntityIndex.of(world.module.entities).byId, here).some(e => e.id === area);
  }
  // Near an entity: where it is; across a way it guards, from the far end while it stands at this one; inside an open
  // container, where the container is; and travelling with a company, where the company is (one who has joined it
  // stands nowhere of their own: Tessary's W4, the drover's son's words at the grave, never heard on the road).
  private static near(world: World, entity: string): Predicate {
    let near: Predicate = ModuleWriter.call('at', entity, '?here');
    if (world.relates('travelsWith')) {
      near = { kind: 'or', left: near, right: { kind: 'and', left: ModuleWriter.call('travelsWith', entity, '?with'),
        right: ModuleWriter.call('at', '?with', '?here') } };
    }
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
  // Whether something is perceived at all: what is hidden until a fact is known is not, until then; and someone seen
  // only by some is not, by anyone else.
  static noticed(world: World, entity: string | undefined, actor: string): boolean {
    if (!entity) { return true; }
    const seen = world.module.seen?.[entity];
    if (seen && !world.test(seen, { '?viewer': actor })) { return false; }
    if (!world.module.queries.some(q => q.name === 'noticed')) { return true; }
    return world.test(ModuleWriter.call('noticed', entity, actor));
  }
  // Whether the company brings what it takes to notice something (the old script, an eye for stone).
  static brings(world: World, actor: string, capability: string | undefined): boolean {
    return !capability || (world.relates('capable') && world.test(ModuleWriter.call('capable', actor, capability)));
  }
  // Inside an open container that stands at the place.
  static within(world: World, entity: string, place: string): boolean {
    if (!world.relates('inside')) { return false; }
    return world.related('inside', entity).some(r => world.test(ModuleWriter.call('at', r.args[1]!, place))
      && !world.test(ModuleWriter.call('shut', r.args[1]!)));
  }
  // What the place itself is like comes first, then who and what is about in it. An observation near a variable is
  // one observation for each entity its condition binds that the company is near, known as id@entity. In the dark,
  // only what is heard or felt (`as sound`, `as felt`: the Patient Star's 4 and the Road's F5, a shore with every light
  // out told nothing, and a man waking in the same small vault).
  static read(world: World, actor: string, dark = false): { id: string; text: string }[] {
    // Most observations are of a place: only this one's need a closer look.
    const here = world.one('at', actor), all = (world.module.observations ?? [])
      .filter(o => !dark || ['sound', 'felt'].includes(o.aspect ?? ''));
    const seen = all.filter(o => !o.place.startsWith('?') && ((o.anchor ?? 'at') !== 'at' || o.place === here)
      && this.perceives(world, actor, o.place, o.anchor)
      && world.test(o.when) && this.noticed(world, o.about ?? (o.anchor === 'near' ? o.place : undefined), actor)
      && this.brings(world, actor, o.by));
    const told = [...seen.filter(o => (o.anchor ?? 'at') === 'at'), ...seen.filter(o => (o.anchor ?? 'at') !== 'at')]
      .map(o => ({ id: o.id, text: ObservationText.render(o.text, world, true, this.found(world, o)) }))
      .concat(all.filter(o => o.place.startsWith('?') && this.brings(world, actor, o.by)).flatMap(o => this.each(world, actor, o)));
    // What two things say alike is said once: the follow-up review read "The Nûrrant runs knee-deep and clear over
    // the ford stones" twice over, at a town with a ford of it on each of two roads.
    return told.filter((o, i) => told.findIndex(x => x.text === o.text) === i);
  }
  // Whoever a variable the text names stands for ("{?m}'s own footsteps sound late"): the first its condition finds.
  // Unfilled, the probe of the stilling read "?m's own footsteps".
  private static found(world: World, o: NonNullable<World['module']['observations']>[number]): Record<string, string> {
    if (!ObservationText.variables(o.text).length) { return {}; }
    for (const b of world.solve(o.when, {})) { return b; }
    return {};
  }
  private static each(world: World, actor: string, o: NonNullable<World['module']['observations']>[number]) {
    const out = new Map<string, string>();
    for (const b of world.solve(o.when, {})) {
      const entity = b[o.place];
      if (!entity || out.has(entity) || !this.perceives(world, actor, entity, 'near') || !this.noticed(world, entity, actor)) {
        continue;
      }
      out.set(entity, ObservationText.render(o.text, world, true, b));
    }
    return [...out].map(([entity, text]) => ({ id: `${o.id}@${entity}`, text }));
  }
}
