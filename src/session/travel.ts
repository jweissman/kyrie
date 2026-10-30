import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { ModuleWriter } from '../lang/module-writer';
import { FictionalTime } from '../campaign/fictional-time';
import { ObservationText } from '../lang/observation-text';
import { EntityIndex } from '../lang/entity-index';
import { PlayerView } from '../presentation/player-view';
import { Itineraries, type Leg } from '../ui/itinerary';
import { PassageModel } from '../ui/passage-model';

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
      if (!plan) {
        done.arrived = this.at(t.campaign, destination);
        // Toward a place whose way is not known, as far as the edge of the country it is said to lie in.
        const name = this.named(t.campaign, destination);
        if (!done.arrived) { done.stopped = `You know no way ${name ? `on to ${name}` : 'there'}`; }
        break;
      }
      const leg = plan.legs[0]!, choice = PlayerView.choices(t.campaign)
        .find(c => /^go\(/.test(c.choice.id) && c.choice.id.startsWith(`go(${leg.passage},`));
      if (!choice) { done.stopped = this.barred(t.campaign, leg); break; }
      // A way that goes one way only is the player's to take, asked about, not the journey's (PT-17).
      if (this.oneWay(t.campaign, leg)) { done.stopped = `There is no coming back by ${leg.way}`; break; }
      const before = this.condition(t.campaign);
      const event = await t.perform(choice.choice.id, choice.choice.name);
      done.legs.push({ command: choice.choice.id, said: choice.choice.name, event });
      const why = this.interrupted(t.campaign, event, before, leg);
      if (this.at(t.campaign, destination)) { done.arrived = true; break; }
      if (why) { done.stopped = why; break; }
    }
    return done;
  }
  // Why a leg cannot simply be taken, in the words of what stands in the way: the river in spate, a rope wanted, a
  // watcher. Before, a ford in spate was said only to "not let you by" (mere, in a newcomer's night).
  private static barred(campaign: Campaign, leg: Leg): string {
    const entities = new Map(campaign.module.entities.map(e => [e.id, e]));
    const way = new PassageModel(campaign.world, campaign.playerActor!, entities).ways(leg.from)
      .find(w => w.passage === leg.passage && w.to === leg.to);
    return way?.reason ? way.reason.replace(/\.$/, '') : `${leg.way} will not let you by from here`;
  }
  // A place set out for, as the company knows it; nothing, where it is no place of the world (the map's sea had been
  // "region__t177": the navigation review).
  static named(campaign: Campaign, destination: string): string | undefined {
    return EntityIndex.of(campaign.module.entities).byId.has(destination)
      ? ObservationText.label(campaign.world, destination) : undefined;
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
      dark: this.dark(campaign) };
  }
  // Whether it is night, as the world has it (its dark, at the hours the campaign keeps), else by the world's clock:
  // a journey had stopped for night at eight while the world stayed light until nine, and walked on into A Winter in
  // Carth's dark from five (the navigation review).
  static dark(campaign: Campaign): boolean {
    const world = campaign.world;
    return world.relates('dark') ? world.test(ModuleWriter.call('dark')) : FictionalTime.dark(campaign.readout.elapsed);
  }
  // Danger is someone here who could be fought and does not tolerate the company: hobs parleyed with stopped every
  // journey past them (the play-structure investigation's PT-16).
  private static danger(campaign: Campaign): boolean {
    const world = campaign.world, company = campaign.playerActor!, tolerates = world.relates('tolerates');
    return PlayerView.choices(campaign).some(c => /^attack\(/.test(c.choice.id)
      && !(tolerates && world.test(ModuleWriter.call('tolerates', c.action.bindings?.opponent ?? '', company))));
  }
  // Whether the company saw something here it had not seen before: a drover's cattle at a ford stopped one journey four
  // times, the last after the cattle had gone.
  private static fresh(campaign: Campaign, event: CampaignEvent): boolean {
    const seen = new Set(campaign.history.filter(e => e !== event).flatMap(e => (e.perceptions ?? []).map(p => p.id)));
    return (event.perceptions ?? []).some(p => p.kind !== 'discovery' && !seen.has(p.id));
  }
  // Whether something said is said by one who goes with the company: an Event near them.
  private static aside(campaign: Campaign, id: string): boolean {
    const rule = (campaign.module.rules ?? []).find(r => r.id === id), by = rule?.anchor === 'near' ? rule.place : undefined;
    const world = campaign.world, company = campaign.playerActor!;
    return !!by && ['travelsWith', 'following'].some(n => world.relates(n) && world.test(ModuleWriter.call(n, by, company)));
  }
  // What was said, as the stop says it: the words spoken where it begins with them, else its first sentence.
  private static gist(said: string): string {
    return /^['‘](.+?)[,.!?]?['’](?:\s|$)/.exec(said)?.[1] ?? /^[^.!?]*/.exec(said)![0];
  }
  // Whether a leg's way goes one way only.
  private static oneWay(campaign: Campaign, leg: Leg): boolean {
    return campaign.world.relates('connects')
      && !campaign.world.test(ModuleWriter.call('connects', leg.passage, leg.to, leg.from));
  }
  // Why a journey stops after a leg, if it does: in the words the page will show under where it stopped.
  private static interrupted(campaign: Campaign, event: CampaignEvent, before: ReturnType<typeof Travel.condition>,
    leg: Leg): string | undefined {
    const now = this.condition(campaign), here = campaign.world.one('at', campaign.playerActor!);
    // Set upon is a fight fought, not anything in the fight's log (a light going out stopped a journey for nothing).
    if (event.prelude || event.combat.some(e => e.type === 'end')) { return 'You were set upon on the way'; }
    if (event.result === 'failure' || here !== leg.to) { return `You did not get by ${leg.way}`; }
    if (now.hp < before.hp) { return 'Someone was hurt on the way'; }
    // Something said to the company where it comes, by what is going on there: a toll asked at a bar across the road
    // (mere's newcomer walked on past it, and so ran the lord's toll, having been told only "There is danger here").
    // A word from whoever goes with the company (a fellow's remark on coming to a fold) does not stop it: play 11's
    // journey stopped at a shieling for "'Summer huts,' says Taklinn", and said so as "Summer huts,’ says Taklinn".
    const said = event.perceptions?.find(p => p.kind === 'event' && !this.aside(campaign, p.id))?.text;
    if (said) { return this.gist(said) || 'Something is said to you here'; }
    if (this.danger(campaign)) { return 'There is danger here'; }
    if (campaign.world.relates('staged') && campaign.world.related('staged').some(r => r.args[0] === here)
      && this.fresh(campaign, event)) { return 'Something is going on here'; }
    if (now.dark && !before.dark) { return 'Night has come on'; }
    if (now.weary && !before.weary) { return 'You are weary'; }
    if (now.hungry && !before.hungry) { return 'You are hungry'; }
    return undefined;
  }
}
