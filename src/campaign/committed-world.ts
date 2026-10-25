import { World } from '../lang/world';
import type { Module, WorldState } from '../lang/module';
import { LocalKinds } from '../canon/local-catalog';

// A campaign's world as last committed, kept as itself. It is written into the campaign's state as its facts only when
// the state is read whole (a save, the state, an install), not at every commit: Mission 15's profile found the list
// of every fact built again at every commit. Worlds are immutable; one is built per distinct state object (and
// module) rather than per access, and the state kept is the world's own view of itself, not a copy.
export class CommittedWorld {
  private viewed?: { state: WorldState; module: Module; world: World };
  private stale = false;
  commit(current: { world: WorldState }, module: Module, world: World) {
    this.viewed = { state: current.world, module, world }; this.stale = true;
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
