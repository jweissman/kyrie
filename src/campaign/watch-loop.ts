import { ActionTime } from './action-time';
import { CampaignTick, type Happening, type TickDecision, type TickHost } from './campaign-tick';
import { Consequences } from './consequences';
import { Engagement } from './engagement';
import { Interruption } from './interruption';
import type { Operator } from '../lang/module';
import type { World } from '../lang/world';
import type { CombatEvent } from '../model';

// What the campaign gives the loop: one watch's bookkeeping before the world moves and after it has.
export interface WatchHost extends TickHost {
  readonly persistent: boolean;
  advanceWatch(combat: CombatEvent[]): void;
  settleWatch(combat: CombatEvent[]): void;
}
// A command's time passes a watch at a time: conditions run out, people act, rules fire, what the world turns on
// the company happens to it, modules progress; an activity that can be interrupted stops when something does.
export class WatchLoop {
  static pass(host: WatchHost, action: Operator, before: World, combat: CombatEvent[]) {
    const npc: TickDecision[] = [], happenings: Happening[] = [];
    const player = host.playerActor;
    const watch = Interruption.begin(host.world, action, player, host.tickState.current.elapsed);
    let why: string | undefined;
    for (let tick = 0; tick < ActionTime.of(action, before) && !why; tick++) {
      host.advanceWatch(combat);
      if (host.persistent) {
        CampaignTick.npcs(host, npc);
        CampaignTick.rules(host, happenings);
        Consequences.strike(host, combat);
        host.settleWatch(combat);
        // Someone falling on the company stops whatever it was doing, interruptible or not.
        const foe = Engagement.foe(host), halted = foe ? undefined : Engagement.halt(host);
        if (foe) { return { npc, happenings, interrupted: Engagement.told(host, foe) }; }
        if (halted) { return { npc, happenings, interrupted: happenings.at(-1)?.text ?? halted }; }
      }
      why = watch && Interruption.check(watch, host.world, player!, happenings);
    }
    const interrupted = watch && why ? Interruption.told(watch, why, host.tickState.current.elapsed) : undefined;
    return { npc, happenings, interrupted };
  }
}
