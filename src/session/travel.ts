import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { ModuleWriter } from '../lang/module-writer';
import { FictionalTime } from '../campaign/fictional-time';
import { ObservationText } from '../lang/observation-text';
import { EntityIndex } from '../lang/entity-index';
import { PlayerFrame } from '../presentation/player-frame';
import { Itineraries, type Leg } from '../ui/itinerary';
import { PassageModel } from '../ui/passage-model';
import { Overland } from '../ui/overland';
import { RuleWords } from '../narrative/rule-words';
import { ArrivalAttention, type Attention, type AttentionReason } from '../presentation/arrival-attention';
import { ActionFeedbackView } from '../presentation/action-feedback';
import { SeenPerceptions } from './seen-perceptions';

// A journey made: each leg as it was done (its command and what came of it), and why it stopped where it did.
// passed: what came on a leg that asked nothing of the player and so did not stop it, in the words a stop would
// have said. told: what the leg brought, one line each, in order (a light run out, words said in passing, water gone
// round); own, where the leg's own telling tells it.
export interface Journeyed {
  legs: { command: string; said: string; event: CampaignEvent; passed?: string; told?: Brought[] }[];
  arrived: boolean; stopped?: string;
}
// at: where on the way the world's words were said, for a telling of a leg passed (GR-07).
export interface Brought { text: string; own?: true; at?: string }
// How the company stands before a leg and after it: its hurts, and whether it is weary, hungry or out at night.
export interface Condition { hp: number; weary: boolean; hungry: boolean; dark: boolean }
// What a journey does to the campaign: one ordinary command at a time, as the page would do it.
export interface Traveller {
  // id: the act the way's row is of, as the row it was chosen from has it, so that it is not looked for again.
  campaign: Campaign; perform(command: string, said: string, id: string): Promise<CampaignEvent>;
}

// Travel along known ways: going somewhere the company knows how to reach without choosing every leg of it. The way
// is planned over the ways the company knows (those it has walked from, been told of, or, with wayfinding, knows of
// the country itself), and made one leg at a time, each leg the ordinary command the page offers for it, so time,
// weather, hazards and what is met on the way all happen as they would. It stops for anything that wants a decision:
// a fight, something dangerous where it arrives, a way that will not let it by, a hurt, nightfall, weariness or
// hunger, or something staged where it comes; and when it has arrived.
export class Travel {
  // Makes the journey, leg by leg, and stops where something wants the player.
  // The way laid when it sets out is the way it goes, as the map drew it: laid again only where its legs run out short
  // of the place (toward one only heard of, to the edge of its country), and where what lies ahead is seen to be
  // otherwise than it was reckoned (water where open country was reckoned: see Overland), which stops it, saying so.
  // Laid again at every leg, the way had wandered between ways as quick, other than the way drawn (OR-35).
  static async go(t: Traveller, destination: string): Promise<Journeyed> {
    const done: Journeyed = { legs: [], arrived: false };
    let legs: Leg[] = [];
    for (let guard = 0; guard < 120; guard++) {
      const plan = legs.length ? undefined : Itineraries.plan(t.campaign, destination);
      if (!legs.length && !plan?.legs.length) {
        done.arrived = this.at(t.campaign, destination);
        // Toward a place whose way is not known, as far as the edge of the country it is said to lie in.
        const name = this.named(t.campaign, destination);
        if (!done.arrived) { done.stopped = `You know no way ${name ? `on to ${name}` : 'there'}`; }
        break;
      }
      if (plan) { legs = [...plan.legs]; }
      const why = await this.step(t, legs.shift()!, done);
      if (this.at(t.campaign, destination)) { done.arrived = true; break; }
      if (why) { done.stopped = why; break; }
      // Water seen across the way ahead: where a way round is known, it is taken, said in passing on the leg; only
      // where none is known does the journey stop (the owner's trust contracts, G: six of seven stops left on 6–8 hex
      // journeys were the way going round water, nothing for the player to decide).
      if (legs.some(l => Overland.found(t.campaign, l))) {
        const round = Itineraries.plan(t.campaign, destination)?.legs.length;
        if (!round) { done.stopped = this.unforeseen; break; }
        const last = done.legs.at(-1);
        if (last) {
          last.passed = 'Water lies across the way ahead: the way on goes round it';
          last.told = [...last.told ?? [], { text: 'Water lies across the way ahead. The way goes round it.' }];
        }
        legs = [];
      }
    }
    return done;
  }
  // One leg, as the page would take it: why the journey stops there, if it does.
  // Its way, and whether the company is held where it lies, are all a leg asks of what is on offer: those two alone are
  // grounded and worded, not the whole frame (which had been built on every leg only to find the way in it).
  private static readonly ways: ReadonlySet<string> = new Set(['go', 'lie_still']);
  private static async step(t: Traveller, leg: Leg, done: Journeyed): Promise<string | undefined> {
    const offered = PlayerFrame.only(t.campaign, this.ways);
    const choice = offered.find(c => /^go\(/.test(c.choice.id) && c.choice.id.startsWith(`go(${leg.passage},`));
    // A company held where it lies (asleep, stunned) goes nowhere until it can: the map had set out from beside a
    // trap and come back to where the company lay, saying that the way would not let it by (the owner, 11 November).
    if (offered.some(c => c.choice.id === 'lie_still')) { return 'You cannot move until what holds you passes'; }
    if (!choice) { return this.barred(t.campaign, leg); }
    // A way that goes one way only is the player's to take, asked about, not the journey's (PT-17).
    if (this.oneWay(t.campaign, leg)) { return `There is no coming back by ${leg.way}`; }
    // So is a way whose mouth shows that something lies in wait in there, as the page marks it (PassageModel.lurking):
    // the careful walks had died on a deep site's second level by a journey walked past the sign into an ambush
    // (SI-01). The ambush is kept: the way taken by hand still leads into it.
    if (this.lurks(t.campaign, leg)) {
      return `Something lies in wait beyond ${leg.way}`;
    }
    const before = this.condition(t.campaign);
    // The leg is the journey's: it may cross into the next hex, as no command of the page's may (Campaign.bounded).
    const event = await t.campaign.crossing.travelling(leg.to, () => t.perform(choice.choice.id, choice.choice.name,
      choice.action.id));
    const made: Journeyed['legs'][number] = { command: choice.choice.id, said: choice.choice.name, event,
      ...this.brought(t.campaign, event, leg.to) };
    done.legs.push(made);
    return this.interrupted(t.campaign, event, before, { leg, made });
  }
  // What a journey's legs brought, for a telling of its last leg alone (the runner's, the terminal's): every leg's,
  // but what the last one's own telling tells. A Light run out on the second of three legs had been told nowhere
  // (cold play 5's 19, CL-38), nor the pedlar seen far off on a fourth (TR-01).
  // What the world said on a leg passed is said with where it was said: Gatesend's thanks, told as the journey ended on
  // the Reedbridge road, had read as if said there (GR-07, S3-0's warrior step 50).
  static way(done: Journeyed): string[] {
    return done.legs.flatMap((l, i) => i < done.legs.length - 1
      ? (l.told ?? []).map(b => b.at ? `At ${b.at}: ${b.text}` : b.text) : this.found(l));
  }
  // What a leg brought that its own telling does not tell (water gone round): for a telling of every leg's own.
  static found(leg: Journeyed['legs'][number]): string[] { return (leg.told ?? []).filter(b => !b.own).map(b => b.text); }
  // What a leg's own telling tells that it brought: what ran out on it, then the world's words said on it.
  private static brought(campaign: Campaign, event: CampaignEvent, to: string): { told?: Brought[] } {
    const at = this.named(campaign, to);
    const told = [...ActionFeedbackView.lapses(campaign, event).map(text => ({ text, own: true as const })),
      ...RuleWords.said(event).map(p => ({ text: p.text, own: true as const, ...at ? { at } : {} }))];
    return told.length ? { told } : {};
  }
  // Water seen across the way ahead, where open country had been reckoned, and no way round it known.
  private static readonly unforeseen = 'Water lies across the way ahead, and you know no way round it';
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
  static condition(campaign: Campaign): Condition {
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
  // journey past them (the play-structure investigation's PT-16). Not a beast at home with no temper to meet a company
  // with, or one only to slip away from it (temper_wary, temper_tame): the country's animals "let the company be"
  // (data/generation/wild/animals.kyrt), and a monkey, a fox, a hedgehog, a curlew and an otter had each stopped a
  // journey as "There is danger here", nothing to be done but go on (the owner's trust contracts, G).
  // Those who could be fought here: the attack rows alone, not the whole frame.
  private static readonly fights: ReadonlySet<string> = new Set(['attack']);
  private static groups(campaign: Campaign): string[] {
    return PlayerFrame.only(campaign, this.fights).filter(c => /^attack\(/.test(c.choice.id))
      .map(c => c.action.bindings?.opponent ?? '');
  }
  private static hostile(campaign: Campaign, g: string): boolean {
    const world = campaign.world, tolerates = world.relates('tolerates');
    return !(tolerates && world.test(ModuleWriter.call('tolerates', g, campaign.playerActor!))) && !this.lets(world, g);
  }
  private static lets(world: Campaign['world'], group: string): boolean {
    return world.relates('lair') && world.related('lair', group).length > 0 && world.relates('temperament')
      && world.related('temperament', group).every(r => ['temper_wary', 'temper_tame'].includes(r.args[1]!));
  }
  // Whether the company saw something here it had not seen before: a drover's cattle at a ford stopped one journey four
  // times, the last after the cattle had gone.
  // The event is the campaign's copy of its own record, never the record itself, so it is told from the others by
  // when it was and what it did: compared as the same object, every perception had been seen already, in the leg's
  // own record, and nothing staged ever stopped a journey (found by the wild's meetings: OWN-27).
  // Seen in another event of the log: counted as the log grows (SeenPerceptions), less the leg's own (OR-1361: every
  // event of the log had been read again on every leg).
  private static fresh(campaign: Campaign, event: CampaignEvent): boolean {
    const own = campaign.history.findLastIndex(e => e.action === event.action && e.elapsed === event.elapsed);
    const mine = new Set((campaign.history[own]?.perceptions ?? []).map(p => p.id));
    const seen = SeenPerceptions.of(campaign);
    return (event.perceptions ?? [])
      .some(p => p.kind !== 'discovery' && (seen.get(p.id) ?? 0) - Number(mine.has(p.id)) < 1);
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
  // Whether the way a leg takes is marked as the page marks it, something lying in wait where it leads (ExitRow lurks,
  // by the same reading: PassageModel.lurking), read from the world, never from a page built for it.
  private static lurks(campaign: Campaign, leg: Leg): boolean {
    return PassageModel.lurking(campaign.world, campaign.playerActor!, leg.from, leg.to);
  }
  // Whether a leg's way goes one way only.
  private static oneWay(campaign: Campaign, leg: Leg): boolean {
    return campaign.world.relates('connects')
      && !campaign.world.test(ModuleWriter.call('connects', leg.passage, leg.to, leg.from));
  }
  // Why a journey stops after a leg, if it does: in the words the page will show under where it stopped; and what came
  // on the leg and asked nothing, kept as passed on it and told with it.
  private static interrupted(campaign: Campaign, event: CampaignEvent, before: Condition,
    { leg, made }: { leg: Leg; made: Journeyed['legs'][number] }): string | undefined {
    const attention = this.attention(campaign, event, before, leg);
    if (attention.passed) { made.passed = attention.passed; }
    return attention.requiresDecision ? attention.stop : undefined;
  }
  // The engine's account of attention where a leg comes (see ArrivalAttention): why the player is needed there, if
  // they are, read from the leg's event, the company's condition and the frame's rows, never from a page built for it.
  // What is said or going on where a leg comes stops it only where something there asks of the player
  // (ArrivalAttention.asks); else it is passed, and the journey goes on (the owner's trust contracts, G: a pedlar's
  // wave and a hayward's word had stopped journeys every few legs, nothing to be done but go on). Until 25 November a
  // leg with something said built the whole screen and the narrator's leaf to ask its glance (Travel.weighty).
  static attention(campaign: Campaign, event: CampaignEvent, before: Condition, leg: Pick<Leg, 'to' | 'way'>): Attention {
    const now = this.condition(campaign), here = campaign.world.one('at', campaign.playerActor!);
    // Set upon is a fight fought, not anything in the fight's log (a light going out stopped a journey for nothing).
    if (event.prelude || event.combat.some(e => e.type === 'end')) { return this.stops('set-upon', 'You were set upon on the way'); }
    if (event.result === 'failure' || here !== leg.to) { return this.stops('barred', `You did not get by ${leg.way}`); }
    if (now.hp < before.hp) { return this.stops('hurt', 'Someone was hurt on the way'); }
    const heard = this.heard(campaign, event, here), asks = heard.why ? ArrivalAttention.asks(campaign) : [];
    const groups = this.groups(campaign), hostile = groups.some(g => this.hostile(campaign, g));
    const reasons: AttentionReason[] = [...heard.reasons, ...asks,
      ...hostile ? ['hostile' as const] : groups.length ? ['tolerated' as const] : []];
    if (heard.why && asks.length) { return { requiresDecision: true, reasons, stop: heard.why }; }
    if (hostile) { return { requiresDecision: true, reasons, stop: 'There is danger here' }; }
    const passed = heard.why ? { passed: heard.why } : {}, after = this.after(now, before);
    return after ? { requiresDecision: true, reasons: [...reasons, after.reason], stop: after.stop, ...passed }
      : { requiresDecision: false, reasons, ...passed };
  }
  private static stops(reason: AttentionReason, stop: string): Attention {
    return { requiresDecision: true, reasons: [reason], stop };
  }
  // Night, weariness or hunger come on with the leg.
  private static after(now: Condition, before: Condition): { reason: AttentionReason; stop: string } | undefined {
    if (now.dark && !before.dark) { return { reason: 'dark', stop: 'Night has come on' }; }
    if (now.weary && !before.weary) { return { reason: 'weary', stop: 'You are weary' }; }
    if (now.hungry && !before.hungry) { return { reason: 'hungry', stop: 'You are hungry' }; }
    return undefined;
  }
  // Something said to the company where it comes, by what is going on there: a toll asked at a bar across the road
  // (mere's newcomer walked on past it, and so ran the lord's toll, having been told only "There is danger here").
  // A word from whoever goes with the company (a fellow's remark on coming to a fold) does not stop it: play 11's
  // journey stopped at a shieling for "'Summer huts,' says Taklinn", and said so as "Summer huts,’ says Taklinn".
  // Not what the world says that was held back as told lately (see RuleWords).
  private static heard(campaign: Campaign, event: CampaignEvent, here: string | undefined):
    { why?: string; reasons: AttentionReason[] } {
    const all = RuleWords.said(event), said = all.find(p => !this.aside(campaign, p.id))?.text;
    const at = campaign.world.relates('staged') && campaign.world.related('staged').some(r => r.args[0] === here);
    const staged = at && this.fresh(campaign, event);
    const reasons: AttentionReason[] = [...said ? ['said' as const] : [],
      ...all.some(p => this.aside(campaign, p.id)) ? ['aside' as const] : [],
      ...staged ? ['staged' as const] : at ? ['seen' as const] : []];
    const why = said ? this.gist(said) || 'Something is said to you here'
      : staged ? 'Something is going on here' : undefined;
    return { ...why ? { why } : {}, reasons };
  }
  // Whether where a leg has come asks anything of the player (ArrivalAttention.asks).
  static weighty(campaign: Campaign): boolean { return ArrivalAttention.asks(campaign).length > 0; }
}
