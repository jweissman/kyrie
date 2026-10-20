import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import type { Battle } from '../src/battle';
import type { CampaignEvent } from '../src/campaign/campaign';
import type { Command } from '../src/model';

export type RedCragHistory = 'fire' | 'theft' | 'tribute';

// Three ways through the Red Crag, played with ordinary session commands. Each step names a choice by the prefix of
// its id; the session resolves it exactly as the client would.
export class RedCragHistories {
  static readonly campaign = 'data/campaigns/red-crag.campaign.json';
  static readonly seed = 'thrale';
  static readonly salves = [1, 2, 3].flatMap(i => [`buy_item(world__ysolde_fireproof_salve_${i},world__member_party_${i})`,
    `use_item(world__ysolde_fireproof_salve_${i},world__member_party_${i})`]);
  static readonly toLedge = ['go(world__gorge_road', 'go(world__rope_bridge'];
  static readonly bellHome = ['go(world__cave_mouth,world__cave_hall)', 'take_item(roost__chapel_bell',
    'go(world__cave_mouth,world__ledge)', 'go(world__rope_bridge', 'go(world__gorge_road', 'put_item(roost__chapel_bell'];
  static readonly scripts: Record<RedCragHistory, string[]> = {
    fire: ['go(world__chandlery_door', ...RedCragHistories.salves, 'go(world__chandlery_door', ...RedCragHistories.toLedge,
      'roost__hail', 'attack(roost__dragon)', 'go(world__goat_path', 'go(world__scree', 'go(world__pasture_track',
      'go(world__hearth_door', 'take_lodging'],
    theft: ['go(world__pasture_track', 'roost__habits', 'wait*dragon-away', 'go(world__pasture_track',
      ...RedCragHistories.toLedge, ...RedCragHistories.bellHome, 'wait*barn-burnt'],
    tribute: [...RedCragHistories.toLedge, 'roost__hail', 'roost__tribute', 'roost__bargain', ...RedCragHistories.bellHome,
      'wait*next-day'],
  };
  static async start(): Promise<PlaySession> {
    return PlaySession.start(this.campaign, this.seed, NodeBundleSource.shared);
  }
  static state(s: PlaySession, id: string): string | undefined {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'state' && r.args[0] === id)?.args[1];
  }
  static where(s: PlaySession, id: string): string | undefined {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === id)?.args[1];
  }
  static watch(s: PlaySession): number {
    return s.campaign.world.snapshot.measures.find(m => m.call.name === 'watch')?.value ?? 0;
  }
  // The company holds its ground until the dragon has breathed, then runs. (Under Orsino's numbers the dragon's armour
  // class is below anything a first-level company can roll, so standing to trade blows only feeds its bite.)
  static fight(this: void, battle: Battle): Promise<Command> {
    const legal = battle.legalCommands();
    const breathed = battle.events.some(e => e.type === 'action' && e.command.ability === 'breathe_fire');
    return Promise.resolve((breathed ? legal.find(c => c.ability === 'flee') : undefined)
      ?? legal.find(c => c.ability === 'melee' || c.ability === 'ranged') ?? legal.find(c => c.ability === 'defend')
      ?? legal[0]!);
  }
  private static waiting(s: PlaySession, until: string): boolean {
    if (until === 'dragon-away') { return this.where(s, 'roost__dragon') !== 'world__sheepfold'; }
    if (until === 'barn-burnt') { return this.state(s, 'roost__barn') !== 'roost__burnt'; }
    return this.watch(s) < 150;
  }
  static async play(history: RedCragHistory, each?: (command: string, event: CampaignEvent) => void) {
    const s = await this.start();
    for (const step of this.scripts[history]) {
      const [prefix, until] = step.split('*') as [string, string | undefined];
      for (let i = 0; i < 200 && (!until || this.waiting(s, until)); i++) {
        const id = PlayerView.choices(s.campaign).map(c => c.choice.id).find(c => c.startsWith(prefix));
        if (!id) { throw new Error(`${history}: no choice ${prefix} at watch ${this.watch(s)}`); }
        const event = await s.perform(id, RedCragHistories.fight);
        each?.(id, event);
        if (!until) { break; }
      }
    }
    return s;
  }
}
