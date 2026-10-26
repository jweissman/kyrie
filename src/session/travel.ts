import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { ModuleWriter } from '../lang/module-writer';
import { PlayerView } from '../presentation/player-view';
import { Itineraries, type Leg } from '../ui/itinerary';

// A journey made: each leg as it was done (its command and what came of it), and why it stopped where it did.
export interface Journeyed {
  legs: { command: string; said: string; event: CampaignEvent }[];
  arrived: boolean; stopped?: string;
}
// What a journey does to the campaign: one ordinary command at a time, as the page would do it.
export interface Traveller {
  campaign: Campaign; perform(command: string, said: string): Promise<CampaignEvent>;
}

// Travel along known ways: going somewhere the company knows how to reach without choosing every leg of it. The way
// is planned over the ways the company knows (those it has walked from, been told of, or, with wayfinding, knows of
// the country itself), and made one leg at a time, each leg the ordinary command the page offers for it, so time,
// weather, hazards and what is met on the way all happen as they would. It stops for anything that wants a decision:
// a fight, something dangerous where it arrives, a way that will not let it by, a hurt, nightfall, weariness or
// hunger, or something staged where it comes; and when it has arrived.
export class Travel {
  // Makes the journey, leg by leg, and stops where something wants the player.
  static async go(t: Traveller, destination: string): Promise<Journeyed> {
    const done: Journeyed = { legs: [], arrived: false };
    for (let guard = 0; guard < 40; guard++) {
      const plan = Itineraries.plan(t.campaign, destination);
      if (!plan) { done.arrived = this.at(t.campaign, destination); break; }
      const leg = plan.legs[0]!, choice = PlayerView.choices(t.campaign)
        .find(c => /^go\(/.test(c.choice.id) && c.choice.id.startsWith(`go(${leg.passage},`));
      if (!choice) { done.stopped = `${leg.way} will not let you by from here`; break; }
      const before = this.condition(t.campaign);
      const event = await t.perform(choice.choice.id, choice.choice.name);
      done.legs.push({ command: choice.choice.id, said: choice.choice.name, event });
      const why = this.interrupted(t.campaign, event, before, leg);
      if (this.at(t.campaign, destination)) { done.arrived = true; break; }
      if (why) { done.stopped = why; break; }
    }
    return done;
  }
  private static at(campaign: Campaign, destination: string): boolean {
    const here = campaign.world.one('at', campaign.playerActor!);
    return !!here && Itineraries.within(new Map(campaign.module.entities.map(e => [e.id, e])), here, destination);
  }
  // How the company stands before a leg: its hurts, and whether it is weary, hungry or out at night.
  private static condition(campaign: Campaign): { hp: number; weary: boolean; hungry: boolean; dark: boolean } {
    const actor = campaign.playerActor!, world = campaign.world, ids = campaign.readout.partyIds;
    return { hp: campaign.readout.creatures.filter(c => ids.includes(c.id)).reduce((s, c) => s + c.state.hp, 0),
      weary: world.relates('weary') && world.test(ModuleWriter.call('weary', actor)),
      hungry: world.relates('hungry') && world.test(ModuleWriter.call('hungry', actor)),
      dark: this.night(campaign.readout.elapsed) };
  }
  static night(elapsed: number): boolean {
    const hour = (8 + Math.floor(elapsed / 6)) % 24;
    return hour >= 20 || hour < 6;
  }
  // Why a journey stops after a leg, if it does: in the words the page will show under where it stopped.
  private static interrupted(campaign: Campaign, event: CampaignEvent, before: ReturnType<typeof Travel.condition>,
    leg: Leg): string | undefined {
    const now = this.condition(campaign), here = campaign.world.one('at', campaign.playerActor!);
    if (event.combat.length || event.prelude) { return 'You were set upon on the way'; }
    if (event.result === 'failure' || here !== leg.to) { return `You did not get by ${leg.way}`; }
    if (now.hp < before.hp) { return 'Someone was hurt on the way'; }
    if (PlayerView.choices(campaign).some(c => /^attack\(/.test(c.choice.id))) { return 'There is danger here'; }
    if (campaign.world.relates('staged') && campaign.world.related('staged').some(r => r.args[0] === here)) {
      return 'Something is going on here';
    }
    if (now.dark && !before.dark) { return 'Night has come on'; }
    if (now.weary && !before.weary) { return 'You are weary'; }
    if (now.hungry && !before.hungry) { return 'You are hungry'; }
    return undefined;
  }
}
