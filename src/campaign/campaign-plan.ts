import { Planner } from './planner';
import type { Operator } from '../lang/module';
import type { World } from '../lang/world';
import type { Operators } from './operators';
import type { CampaignActor, CampaignDefinition, InstalledModule } from './definition';

// What a campaign could do next toward its goal, or an installed module's: a search over the company's own moves
// (not fights or other resolutions) within the time left.
interface Host {
  persistent: boolean; installations: InstalledModule[]; world: World; module: { goal: World['module']['goal'] };
  operators: Operators;
  tickState: { definition?: CampaignDefinition; current: { outcome: string; deadline: number; elapsed: number } };
}
export class CampaignPlan {
  static plan(host: Host, moduleId?: string) {
    const { current, definition } = host.tickState;
    if (!host.persistent && current.outcome === 'failure') { return null; }
    const player = definition?.actors.find(actor => actor.player);
    const installed = moduleId ? host.installations.find(m => m.id === moduleId)
      : host.installations.find(m => !host.world.test(m.goal));
    if (moduleId && !installed) { throw new Error('Unknown module'); }
    return Planner.search(host.world, installed?.goal ?? host.module.goal, this.moves.bind(this, host, player), {
      maxNodes: 2000, timeRemaining: (installed ? installed.deadline ?? Infinity : current.deadline) - current.elapsed,
    });
  }
  private static moves(host: Host, player: CampaignActor | undefined, world: World): Operator[] {
    return host.operators.applicable(world, player?.id).filter(a => !player || (!a.resolve
      && (player.allActions || player.actions.includes(a.schema ?? a.id))));
  }
}
