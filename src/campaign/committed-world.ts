import { World } from '../lang/world';
import type { Module, WorldState } from '../lang/module';
import { LocalKinds } from '../canon/local-catalog';
import { ModuleWriter } from '../lang/module-writer';

// A campaign's world as last committed, kept as itself. It is written into the campaign's state as its facts only when
// the state is read whole (a save, the state, an install), not at every commit: Mission 15's profile found the list
// of every fact built again at every commit. Worlds are immutable; one is built per distinct state object (and
// module) rather than per access, and the state kept is the world's own view of itself, not a copy.
export class CommittedWorld {
  private viewed?: { state: WorldState; module: Module; world: World };
  private stale = false;
  commit(current: { world: WorldState }, module: Module, world: World) {
    this.viewed = { state: current.world, module, world: CommittedWorld.been(world) }; this.stale = true;
  }
  // Where a company has stood, the engine writes as it comes to stand there, however it came: a rule's pass had
  // recorded it only where one found the company standing, so a door that opens on anywhere the company has stood
  // knew neither the green it set out from nor the rooms a road passes (the Grand Tour's 13, GTR-13).
  private static been(world: World): World {
    if (!world.relates('been')) { return world; }
    const due = world.related('company').map(c => c.args[0]!).flatMap(c => {
      const at = world.one('at', c);
      return at && !world.test(ModuleWriter.call('been', c, at)) ? [ModuleWriter.call('been', c, at)] : [];
    });
    return due.length ? world.apply(due.map(call => ({ kind: 'assert' as const, call }))) : world;
  }
  // The world's facts, written into the state if they are not there already.
  keep(current: { world: WorldState }) {
    if (!this.stale || !this.viewed) { return; }
    current.world = this.viewed.world.view as WorldState; this.viewed.state = current.world; this.stale = false;
  }
  // Read, its campaign (owner) makes its kinds the catalogs' if another campaign's are (see LocalKinds.claim).
  of(current: { world: WorldState }, module: Module, owner?: object): World {
    if (owner) { LocalKinds.claim(owner, module.catalog); }
    const v = this.viewed;
    if (v && v.module === module && (this.stale || v.state === current.world)) { return v.world; }
    this.keep(current);
    const world = new World(module, current.world);
    this.viewed = { state: current.world, module, world };
    return world;
  }
}
