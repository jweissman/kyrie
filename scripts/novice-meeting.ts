import type { Campaign } from '../src/campaign/campaign';
import { CampaignTick } from '../src/campaign/campaign-tick';
import { Engagement } from '../src/campaign/engagement';
import { LocalObservations } from '../src/campaign/local-observations';
import { PartyCapabilities } from '../src/campaign/party-capabilities';
import type { Creature } from '../src/creature';
import { EntityIndex } from '../src/lang/entity-index';
import type { Change, WorldRule } from '../src/lang/module';
import { ModuleWriter } from '../src/lang/module-writer';
import type { World } from '../src/lang/world';
import type { Moment } from '../src/model';
import type { Band } from './novice-country';

// How a band meets a company that comes where it is: it comes at the company at once, with no turn to back away
// (the cold review's "55% of hostile groups attacked without a warning turn"); it warns first, or stops the company
// where it stands, and gives it a turn; or it lets the company be (it slinks off, keeps to its post, or waits to be
// set on). A band that comes at once is seen as it moves (the company acts first) or springs from hiding (it acts
// after the first blows): Engagement.moment, as the game decides it.
export type Meeting = 'at once' | 'warns' | 'lets be';
// signed: one that lies in wait gives itself away to a company next door first (inhabitants.kyr's temper_betrayed),
// so a company that reads the page is given its turn before it goes in.
export interface Reading { meeting: Meeting; moment?: Moment; tolerated: boolean; signed: boolean; world: World }

// The meeting read from the world's own rules, not from a table of temperaments: the company is put where the band
// stands, with whatever its members bring (a hire's keen eyes spot an ambush: inhabitants.kyr's temper_spotted), and
// the world's rules are run once in their order, as the watch it arrives in runs them (CampaignTick.rules). What
// they say of the band then (assails; warned or halts) is how it met the company. What other actors decide to do in
// that watch (CampaignTick.npcs) is not run; nothing written here is kept.
export class NoviceMeeting {
  static read(campaign: Campaign, band: Band, company: Creature[]): Reading {
    const world = this.arrived(campaign, band, company), at = { world, band: band.id, party: campaign.playerActor! };
    const meeting: Meeting = this.holds(at, 'assails') ? 'at once'
      : this.holds(at, 'warned') || this.holds(at, 'halts') ? 'warns' : 'lets be';
    const moment = meeting === 'at once' ? Engagement.moment(campaign, band.id) : undefined;
    const signed = moment === 'sprung' && world.relates('sign') && world.related('sign', band.id).length > 0;
    return { meeting, ...moment ? { moment } : {}, tolerated: this.holds(at, 'tolerates'), signed, world };
  }
  private static holds(at: { world: World; band: string; party: string }, name: string): boolean {
    return at.world.relates(name) && at.world.test(ModuleWriter.call(name, at.band, at.party));
  }
  // The world the moment the company arrives where the band is.
  private static arrived(campaign: Campaign, band: Band, company: Creature[]): World {
    const party = campaign.playerActor!, before = campaign.world, here = before.one('at', party);
    const left: Change[] = here ? [{ kind: 'retract', call: ModuleWriter.call('at', party, here) }] : [];
    const changes: Change[] = [...left, { kind: 'assert', call: ModuleWriter.call('at', party, band.place) },
      ...this.brought(campaign, company)];
    let world = before.apply(changes);
    const rules = campaign.module.rules ?? [];
    for (const rule of rules) { world = this.fire(world, rule, party); }
    for (const rule of rules.filter(r => r.upkeep)) { world = this.fire(world, rule, party); }
    return world;
  }
  // What the company can do that it could not without its hire: each capability a member brings.
  private static brought(campaign: Campaign, company: Creature[]): Change[] {
    const world = campaign.world, party = campaign.playerActor!;
    return EntityIndex.of(campaign.module.entities).typed('capability')
      .filter(k => company.some(c => PartyCapabilities.brings(k.id, c))
        && !world.test(ModuleWriter.call('capable', party, k.id)))
      .map(k => ({ kind: 'assert' as const, call: ModuleWriter.call('capable', party, k.id) }));
  }
  // One rule, every instance that holds after those before it, as CampaignTick.fire runs it.
  private static fire(world: World, rule: WorldRule, party: string): World {
    if (rule.anchor === 'within' && rule.place && !LocalObservations.inArea(world, party, rule.place)) { return world; }
    let next = world;
    for (const [effects, binding] of CampaignTick.instances(rule, world)) {
      if (Object.keys(binding).length && !next.test(rule.when, binding)) { continue; }
      next = next.apply(effects);
    }
    return next;
  }
}
