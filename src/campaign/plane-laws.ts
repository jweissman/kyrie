import { Conditions } from '../ports/conditions';
import { CombatProjection } from '../combat-projection';
import { Content } from '../content';
import type { CreatureStore } from '../creature-store';
import { Effects } from '../effects';
import { Expressions } from '../expressions';
import { ModuleWriter } from '../lang/module-writer';
import type { World } from '../lang/world';
import type { CombatEvent } from '../model';
import { RandomStreams } from '../random-streams';
import type { CampaignActor } from './definition';
import { Environment } from './environment';

// A place's law outside a fight (GT-01): what it does at the end of each turn in a fight (the Fire's heat, the
// Negative's drain, the Positive's mending: its onTurnEnd) it does to the company each watch it stands under it,
// through the ordinary damage pipeline, so that a ward against its kind of harm stops it. A law that only tilts a
// fight (a spell DC) does nothing between fights. It falls on the player's company alone: a plane's own people live
// under it.
export class PlaneLaws {
  // The laws where the company stands that do something by the watch, as catalog conditions.
  static ticking(world: World, player: string | undefined): string[] {
    if (!player || !world.relates('law')) { return []; }
    return Environment.laws(world, player).filter(id => (Conditions.exact(id)?.modifiers.onTurnEnd ?? []).length);
  }
  // One watch under them: each of the company still up feels each law once. Whether anything changed.
  static watch(store: CreatureStore, events: CombatEvent[],
    scene: { world: World; actors: CampaignActor[]; player?: string; seed?: string; elapsed: number }): boolean {
    const laws = this.ticking(scene.world, scene.player);
    const members = (scene.actors.find(a => a.id === scene.player)?.members ?? [])
      .filter(id => store.get(id).state.hp > 0);
    if (!laws.length || !members.length) { return false; }
    const lease = store.acquire(members);
    try {
      const fighters = lease.creatures.map(c => CombatProjection.fighter(lease.catalog, c, 'fighters'));
      for (const target of fighters) {
        const context = { fighters, turn: scene.elapsed, events, field: true,
          expressions: new Expressions(RandomStreams.key(scene.seed ?? 'field', 'law', scene.elapsed, target.id)),
          content: new Content('law'), abilities: [], retreat: false, location: null };
        for (const law of laws) { Effects.periodic(target, law, law, context); }
      }
      lease.commit(lease.creatures.map(c => CombatProjection.creature(fighters.find(f => f.id === c.id)!, c)));
    } finally { lease.release(); }
    return true;
  }
  // A spell that carries its caster's company (Plane Shift: the kernel's typed travel effect, GT-02) sets the company
  // down where its event says it went.
  static carry(world: World, actors: CampaignActor[], events: CombatEvent[], commit: (world: World) => void) {
    for (const e of events) {
      const actor = e.type === 'travel' ? actors.find(a => a.members.includes(e.actor)) : undefined;
      if (!actor || e.type !== 'travel') { continue; }
      commit(world.apply([{ kind: 'assert', call: ModuleWriter.call('at', actor.id, e.detail) }]));
    }
  }
}
