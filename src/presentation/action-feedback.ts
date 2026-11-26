import { Undertakings } from './undertakings';
import { Sentences } from './sentences';
import { BandNames } from '../narrative/band-names';
import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { PlayerView, type PlayerSnapshot } from './player-view';
import { CombatPresenter } from '../ui/combat-presenter';
import { CombatProjection } from '../combat-projection';
import { Fought } from './fought';
import { Outmatched } from './outmatched';
import { Stories } from './stories';
import { FictionalTime } from '../campaign/fictional-time';
import type { Operator, Predicate } from '../lang/module';
import { PartyCapabilities } from '../campaign/party-capabilities';
import { Canon } from '../canon/canon';
import { ObservationText } from '../lang/observation-text';
import { Itineraries } from '../ui/itinerary';
import { Telling } from '../narrative/telling'; import { Days } from '../narrative/days'; import { Answers } from '../narrative/answers';
import { RuleWords } from '../narrative/rule-words';

export interface ActionFeedback {
  attempt: string; result: string; resources: string[]; time: string; immediate: string[]; discoveries: string[];
  // Of the immediate, those that tell a roll made outside a fight (a check): what was rolled, against what.
  rolls: string[];
  observations: string[]; available: string[]; unavailable: string[]; events: string[];
  // Of the events, what came with the purse changing (RuleWords.paying): told as a change, never held for room.
  paid?: string[];
  // Whether the result is how a fight ended, which is told after its blows.
  ended?: boolean;
  // Of the immediate, what lasting conditions ran out while it was done (a torch guttering out in the middle of a
  // search): told as what happened, not as a blow of a fight it fell beside (round 7: "the torch died silently").
  lapsed?: string[];
  // What the legs of a journey before its last brought, one line each, told before where it came (see Travel.way).
  way?: string[];
  // Aims taken up or come to by it: reading the makers' marks made the brothers' errand "You have copied the old
  // writing at Riwustagn. Ruven at Faennsīe should see it.", and only the notes said so (play 7).
  aims?: string[];
  // Aims that arose and were not taken up: neither the company's own nor now followed (see Noted: OR-248).
  offered?: string[];
  // Aims that take up one just gone, told as it stands now: a quarrel heard from its other side (play 9 was told "A new
  // aim" of the brood's when only what Odile said had been added to it).
  amended?: string[];
  // The same aims, each by its id with its words: what the page follows and counts by (the owner, 11 November: an
  // undertaking known by the game's state, never by its sentence).
  // begins: the title of the story it begins, where no aim of that story was held before (see Stories).
  taken?: { id: string; text: string; now?: true; begins?: string }[];
  // Places something learned leads to that nothing said where they are, now somewhere to set out for.
  leads?: string[];
  // What the company was told and has now seen for itself (come to the place, or the thing in its hands), and who told
  // it: following the innkeeper's word to the mound, it is borne out where it is come to (Friday's surprise).
  borne?: { text: string; from?: string }[];
  // The ids of the choices it opened, where the company stayed: what it has made possible (see DecisionFrame).
  opened?: string[];
  // The aim followed, by its id, seen through by it with nothing to follow on into (see Succession, PL-06).
  closed?: string;
}
export class ActionFeedbackView {
  // An aim is new when it was not one before: the same aim told again with its count gone up (graves opened, five,
  // six, seven) is not "A new aim" (the cold evaluation); one that takes up an aim just gone, opening as it did, is
  // that aim as it stands now.
  // One that arose is taken where it is the company's own errand or is now followed (the next part of the one
  // followed); any other is offered, to be taken up by the player's choice (OR-248), and is not among those taken.
  static aims(before: PlayerSnapshot, after: PlayerSnapshot, own: ReadonlySet<string> = new Set()): {
    aims: string[]; offered: string[]; amended: string[]; taken: { id: string; text: string; now?: true }[];
    arisen: { id: string }[] } {
    const had = before.objectives ?? [], now = after.objectives ?? [];
    const gone = new Set(had.filter(b => !now.some(o => o.id === b.id)).map(b => this.opening(b.text)));
    const fresh = now.filter(o => !had.some(b => b.id === o.id));
    const arisen = fresh.filter(o => !gone.has(this.opening(o.text)));
    const taken = arisen.filter(o => own.has(o.id) || o.id === after.followed);
    const aims = taken.map(o => this.told(o));
    const offered = arisen.filter(o => !taken.includes(o)).map(o => this.told(o).text);
    const amended = [...fresh.filter(o => gone.has(this.opening(o.text))), ...this.resumed(before, after)]
      .map(o => this.told(o));
    return { aims: aims.map(a => a.text), offered, amended: amended.map(a => a.text),
      taken: [...aims, ...amended.map(a => ({ ...a, now: true as const }))], arisen };
  }
  // The company's own errands, by id (see Undertakings.errand): what arises of them is taken, not offered. And, where
  // the act answered a lead (its knowing let go by asking the one it named: the reeve asked about the sea-gate the
  // well-post's notice told of), every aim that arose of it: that was asked for (HP-01: seen, a story is a lead with
  // who to ask; asked, it begins). Gek, asked what the old workings are worth, answered no lead (OR-248).
  static errands(campaign: Campaign, before?: PlayerSnapshot, after?: PlayerSnapshot): Set<string> {
    const own = (campaign.module.objectives ?? []).filter(o => Undertakings.errand(campaign, o)).map(o => o.id);
    return new Set([...own, ...before && after && this.answered(campaign, before, after)
      ? (after.objectives ?? []).map(o => o.id) : []]);
  }
  // Whether an act let go of a lead the company knew (Undertakings.leads): it asked the one the lead names.
  private static answered(campaign: Campaign, before: PlayerSnapshot, after: PlayerSnapshot): boolean {
    const w = campaign.world;
    if (!w.relates('askedOf')) { return false; }
    const leads = new Set(w.related('askedOf').map(r => r.args[0]!)), now = new Set(after.knowledge.map(k => k.id));
    return before.knowledge.some(k => leads.has(k.id) && !now.has(k.id));
  }
  // A story begun by it: an aim taken up of a story none of whose aims was held before, told as the story's beginning
  // (the owner, 18 November, OR-74: onboarding to an adventure proper made plain, not a seventh aim among six).
  static begun(campaign: Campaign, before: PlayerSnapshot, taken: { id: string; text: string; now?: true }[]) {
    const had = new Set((before.objectives ?? []).map(o => Stories.of(campaign, o.id)?.id));
    return taken.map(t => {
      const story = t.now ? undefined : Stories.of(campaign, t.id);
      return story && !had.has(story.id) ? { ...t, begins: story.title } : t;
    });
  }
  // The aim followed again when the one followed has ended: the company's own errand taken up once more, said as the
  // aim now (round 4's talker saw the aim followed go back to a dungeon on its own, with nothing to say so).
  private static resumed(before: PlayerSnapshot, after: PlayerSnapshot): { id: string; text: string }[] {
    const had = before.objectives ?? [], now = after.objectives ?? [];
    const was = before.followed;
    if (!was || was === after.followed || now.some(o => o.id === was)) { return []; }
    return now.filter(o => o.id === after.followed && had.some(b => b.id === o.id));
  }
  private static told(o: { id: string; text: string }): { id: string; text: string } {
    return { id: o.id, text: FictionalTime.prose(o.text) };
  }
  // An aim's first sentence, which says what it is about.
  static opening(text: string): string { return Sentences.first(text); }
  static readonly probes = ['look_closely', 'prod', 'pry', 'burn', 'push', 'listen', 'search'];
  // What a try that finds nothing says, in the words of the try (the cold playtest heard "Nothing comes of it." from
  // a speaking door, a mural and a casket alike, and stopped looking at things).
  static readonly nothing: Record<string, string> = { look_closely: 'Looked at closely, it is just as it seems.',
    listen: 'There is nothing to hear from it.', prod: 'Nothing gives, and nothing answers.',
    pry: 'The bar finds no purchase, and nothing gives.', push: 'It does not shift, either way.',
    // A search that finds nothing is told so by its own result (discovery.kyr), once: said here too, it had read
    // "Nothing is put away or hidden here. You have been over the whole of it, and nothing is hidden here." (cold play
    // 3, CL-18).
    burn: 'It does not take the flame.' };
  // Where something learned leads, when nothing said where it is: somewhere to set out for now, and how far (the lone
  // tower joined the journeys unsaid, after the opened graves: play 7, M17-42).
  private static leads(campaign: Campaign, learned: { id: string; text: string }[],
    known: Set<string>): { leads?: string[] } {
    const world = campaign.world;
    if (!learned.length || !world.relates('leadsTo')) { return {}; }
    const said = learned.map(k => k.text).join(' ').toLowerCase(), told = world.related('leadsTo');
    // A sight from somewhere high says itself where the place lies and how far ("To the north, not far off: …").
    const placed = new Set(learned.filter(k => /^To the [a-z-]+, /.test(k.text)).map(k => k.id));
    const places = [...new Set(told.filter(r => learned.some(k => k.id === r.args[0]) && !placed.has(r.args[0]!))
      .map(r => r.args[1]!))].filter(place => !told.some(r => r.args[1] === place && known.has(r.args[0]!)));
    const leads = places.flatMap(place => {
      const name = ObservationText.label(world, place), plan = Itineraries.plan(campaign, place);
      if (!plan || said.includes(`way to ${name.toLowerCase()}`)) { return []; }
      const hours = Math.round(plan.minutes / 30) / 2, half = hours % 1 ? '½' : '', whole = Math.floor(hours);
      const far = hours < 1 ? 'under an hour off' : hours === 1 ? 'about an hour off' : `about ${whole}${half} hours off`;
      return [`${name.charAt(0).toUpperCase()}${name.slice(1)}: somewhere to set out for now, ${far}`];
    });
    return leads.length ? { leads } : {};
  }
  // What was heard and not yet seen before, and is borne out now: told once, when it is (a fact heard after its place
  // was already come to is borne out as it is learned, and is noted as learned, not as borne out).
  // Of several borne out by coming to one place (a site's name, and the way to it, both told by the innkeeper), the
  // first is said for it.
  private static borne(campaign: Campaign, before: PlayerSnapshot, after: PlayerSnapshot):
    Pick<ActionFeedback, 'borne'> {
    const heard = new Set(before.knowledge.filter(k => k.source === 'heard' && !k.confirmed).map(k => k.id));
    const world = campaign.world, leads = world.relates('leadsTo') ? world.related('leadsTo') : [];
    const said = new Set<string>();
    const borne = after.knowledge.filter(k => k.confirmed && heard.has(k.id)).filter(k => {
      const to = leads.filter(r => r.args[0] === k.id).map(r => r.args[1]!);
      const fresh = !to.length || to.some(p => !said.has(p));
      to.forEach(p => said.add(p));
      return fresh;
    }).map(k => ({ text: k.text, ...k.from ? { from: k.from } : {} }));
    return borne.length ? { borne } : {};
  }
  // A recovery that removes a status the member never had is not news.
  private static lacked(before: PlayerSnapshot, target: string, status: string): boolean {
    const member = before.party.find(p => p.id === target);
    return !!member && !member.conditions.includes(status);
  }
  private static taught(campaign: Campaign, event: CampaignEvent): { id: string; text: string }[] {
    const observations = campaign.module.observations ?? [];
    // Whatever the command taught, a mark with no words included (the brother kneeling by the cart, seen once).
    const learned = new Set(event.changes.flatMap(c => /^\+ knows\([^,]+, ([^)]+)\)$/.exec(c)?.[1] ?? []));
    return (event.perceptions ?? []).filter(p => p.kind === 'observation').flatMap(p => {
      const o = observations.find(x => x.id === p.id.split('@')[0]);
      if (!o?.teaches || !learned.has(o.teaches)) { return []; }
      const credit = this.credit(campaign, o.when);
      return [{ id: p.id, text: p.text }, ...credit ? [{ id: `${p.id}:credit`, text: credit }] : []];
    });
  }
  // What was seen and taught the company something says it: the cuts in the turf are told, and what they mean is
  // noted in the margin, not said before them as well (see PlayTranscript). Of those, a fact learned in the very words
  // that taught it (a sight from a tower, "To the north, not far off: …") is said once, as it was seen: not noted
  // again by the name it goes by once learned.
  private static shown(campaign: Campaign, taught: { id: string; text: string }[]): Map<string, string | undefined> {
    const observations = campaign.module.observations ?? [], entities = campaign.module.entities;
    return new Map(taught.flatMap(t => {
      const o = observations.find(x => x.id === t.id.split('@')[0]);
      const fact = o?.teaches ? entities.find(e => e.id === o.teaches) : undefined;
      return o && fact ? [[fact.id, fact.name === o.text ? t.text : undefined] as const] : [];
    }));
  }
  // What was found only with a skill says whose it was (the free play of M16 read the Mower's breastplate by a
  // scribe's lore, and nothing said so): "It is Hild's lore that makes it out." One who has come alone is told it is
  // theirs (see SecondPerson).
  private static credit(campaign: Campaign, when: Predicate): string | undefined {
    const skills = this.capabilities(when), live = campaign.readout;
    const members = live.creatures.filter(c => live.partyIds.includes(c.id));
    for (const skill of skills) {
      const who = PartyCapabilities.providers(campaign.catalog, skill, members).map(c => c.name);
      const name = Canon.skills[skill]?.name.toLowerCase(), whose = members.length === 1 ? ['your'] : who.map(n => `${n}'s`);
      if (who.length && name) { return `It is ${this.list(whose)} ${name} that makes it out.`; }
    }
    return undefined;
  }
  private static capabilities(p: Predicate): string[] {
    if (p.kind === 'call') { return p.name === 'capable' && p.args[1] ? [p.args[1]] : []; }
    return p.kind === 'and' || p.kind === 'or' ? [...this.capabilities(p.left), ...this.capabilities(p.right)] : [];
  }
  private static list(items: string[]): string {
    return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)!}`;
  }
  // Whether an observation shows because the company has come to know something it knows now: its condition holds
  // that the company knows it (not that it does not).
  private static follows(campaign: Campaign, id: string, known: Set<string>): boolean {
    const o = (campaign.module.observations ?? []).find(x => x.id === id.split('@')[0]);
    return !!o && this.knowing(o.when).some(f => known.has(f));
  }
  private static knowing(p: Predicate): string[] {
    if (p.kind === 'call') { return p.name === 'knows' ? [p.args[1]!] : []; }
    return p.kind === 'and' || p.kind === 'or' ? [...this.knowing(p.left), ...this.knowing(p.right)] : [];
  }
  // What came to be seen, in the order it was seen: the town below from the top of the tower, then what lies each way.
  // What shows only because of what was just learned is the short of what was just said ("Her coat is stiff with
  // ditch-mud"): the place shows it from now on, and it is not told again; nor is what was seen, by the name the
  // seeing taught (the doorway a ruin known for what it is).
  private static changed(campaign: Campaign, event: CampaignEvent, { before, after, taught, known }: { before:
    PlayerSnapshot; after: PlayerSnapshot; taught: { id: string; text: string }[]; known: Set<string> }) {
    const fresh = after.observations.filter(o => !taught.some(t => t.text === o.text || t.id === o.id)
      && !before.observations.some(b => b.id === o.id && b.text === o.text) && !this.follows(campaign, o.id, known));
    return [...taught, ...fresh].map((o, i) => ({ o, i, at: this.seenAt(event, o.id) }))
      .sort((a, b) => a.at - b.at || a.i - b.i).map(x => x.o);
  }
  // Where among what was seen something was (a skill's credit with what it made out), or after it all.
  private static seenAt(event: CampaignEvent, id: string): number {
    const i = (event.perceptions ?? []).findIndex(p => p.id === id.replace(/:credit$/, ''));
    return i < 0 ? Number.MAX_SAFE_INTEGER : i;
  }
  // How long it took, and the time it is now, to the minute.
  private static time(before: PlayerSnapshot, after: { elapsed: number; minutes?: number }): string {
    const spent = (after.elapsed - before.elapsed) * FictionalTime.minutesPerTick + (after.minutes ?? 0)
      - (before.minutes ?? 0);
    return `${FictionalTime.duration(0, spent)} · ${FictionalTime.at(after.elapsed, after.minutes)}`;
  }
  // How a fight went, blow by blow; set upon after a fight of its own, that fight, then who came at the company ("The
  // bone hounds come at you."), then theirs.
  private static fights(event: CampaignEvent, before: PlayerSnapshot,
    names: Parameters<typeof CombatPresenter.format>[1]): string[] {
    // Set upon in the midst of something done with no fight of its own (a firebomb thrown through a crack), what came
    // of it is told before the fight, not lost (two cold players learned the brood was burned only from the reward).
    const split = event.prelude?.fought ?? 0, onset = event.prelude?.response;
    if (!event.prelude) { return this.blows(event.combat, before, names); }
    // And the roll of what was done, before what came of it: a warning-off failed into a fight told no roll (CL-10).
    const rolled = event.combat.slice(0, split).filter(e => e.type === 'check')
      .map(e => CombatPresenter.format(e, names));
    return [...this.blows(event.combat.slice(0, split), before, names), ...rolled, ...onset ? [onset] : [],
      ...this.blows(event.combat.slice(split), before, names)];
  }
  private static blows(events: CampaignEvent['combat'], before: PlayerSnapshot,
    names: Parameters<typeof CombatPresenter.format>[1]): string[] {
    // Without who moved first nor a blow's dice: a flight had been told "Initiative: the third wolf 14, … The third
    // wolf misses Wynn (rolled 5, needed 14)" (the laboratory's matrix: 33 arrivals past six sentences, all retreats).
    const told = events.filter(e => e.type !== 'action' && e.type !== 'initiative'
      && !('amount' in e && e.amount === 0 && e.type !== 'damage')
      && !(e.type === 'remove' && ActionFeedbackView.lacked(before, e.target, e.detail)));
    // Out of a fight only: in one, each turn's heat is told as the turn's.
    return events.some(e => e.type === 'initiative') ? told.map(e => CombatPresenter.format(e, names, false))
      : this.laws(told, names);
  }
  // A place's law felt watch after watch (the Fire's heat, the Positive's mending) is told once for whoever felt it,
  // in all (a change in the telling, not the rules): an hour in the Fire had told "Ama takes 1 fire damage" six times
  // over.
  private static laws(events: CampaignEvent['combat'], names: Parameters<typeof CombatPresenter.format>[1]):
    string[] {
    const lines: string[] = [];
    for (let i = 0; i < events.length; i++) {
      const e = events[i]!, run = [e];
      while (this.felt(e, events[i + run.length])) { run.push(events[i + run.length]!); }
      i += run.length - 1;
      const last = run.at(-1)!;
      if (run.length < 2 || (last.type !== 'damage' && last.type !== 'heal')) {
        lines.push(CombatPresenter.format(e, names, false)); continue;
      }
      const sum = run.reduce((n, x) => n + (x.type === 'damage' || x.type === 'heal' ? x.amount : 0), 0);
      lines.push(CombatPresenter.format({ ...last, amount: sum, rolled: sum }, names, false)
        .replace(/; roll \d+\)\.$/, ').').replace(/ (damage|HP) \(/, ' $1 in all, a watch at a time ('));
    }
    return lines;
  }
  // Whether the next event is the same law felt again by the same one, in the same way.
  private static felt(e: CampaignEvent['combat'][number], next: CampaignEvent['combat'][number] | undefined): boolean {
    if (!next || (e.type !== 'damage' && e.type !== 'heal') || next.type !== e.type) { return false; }
    return !!Canon.conditions[e.actor]?.law && next.actor === e.actor && next.target === e.target
      && next.damageType === e.damageType && !next.stoppedBy;
  }
  // What lasting conditions ran out in an event, in the words they are told by (a leg of a journey: see Travel).
  static lapses(campaign: Campaign, event: CampaignEvent): string[] {
    if (!event.combat.length) { return []; }
    const names = CombatProjection.told(campaign.catalog, Fought.of(campaign, [event]), campaign.readout.partyIds,
      BandNames.of(campaign));
    return this.lapsed(event, names).lapsed ?? [];
  }
  // What ran out in it, and what a journey's legs before it brought, where it is a journey's last (see Travel.way).
  // What of the world's words came with the purse changing (see RuleWords.paying).
  private static paid(campaign: Campaign, event: CampaignEvent): Pick<ActionFeedback, 'paid'> {
    const paying = RuleWords.paying(campaign), paid = RuleWords.said(event)
      .filter(p => paying.has(p.id.split('@')[0]!)).map(p => p.text);
    return paid.length ? { paid } : {};
  }
  private static ran(event: CampaignEvent, names: Parameters<typeof CombatPresenter.format>[1]): Pick<ActionFeedback,
    'lapsed' | 'way'> {
    return { ...this.lapsed(event, names), ...event.way?.length ? { way: [...event.way] } : {} };
  }
  // What lasting conditions ran out (a light, a ward): by the event, and the condition's lifetime.
  private static lapsed(event: CampaignEvent, names: Parameters<typeof CombatPresenter.format>[1]):
    { lapsed?: string[] } {
    const lapsed = event.combat.filter(e => e.type === 'expire'
      && Canon.conditions[Canon.resolve('conditions', e.detail)]?.lifetime === 'persistent')
      .map(e => CombatPresenter.format(e, names)).filter(Boolean);
    return lapsed.length ? { lapsed } : {};
  }
  // How a fight ended, and who in the company fell in it.
  private static ended(event: CampaignEvent, before: PlayerSnapshot, after: PlayerSnapshot): string | undefined {
    const ended = event.combat.find(e => e.type === 'end');
    if (ended?.type !== 'end') { return undefined; }
    const fallen = after.party.filter(p => p.hp === 0 && before.party.some(b => b.id === p.id && b.hp > 0));
    return `${ended.outcome === 'fighters' ? 'The fight is won.' : ended.outcome === 'escaped' ? ended.fled?.team === 'goblins'
      ? 'Your opponent flees, and the ground is yours.' : 'You are clear of the fight.'
      : ended.outcome === 'goblins' ? ended.reason === 'yielded' ? 'You are beaten, and yield.' : 'The fight is lost.'
        : 'The fight ends with neither side the better.'}`
      + `${fallen.length ? ` ${fallen.map(p => p.name).join(', ')} ${fallen.length === 1 ? 'is' : 'are'} down.` : ''}`;
  }
  // What was learned from words said in the moment (a rule that says and teaches): those words stand for it, and the
  // fact's own text is the journal's (the page read the fact before the rule's words: the register's NAR-10).
  private static spoken(campaign: Campaign, event: CampaignEvent): Set<string> {
    const heard = new Set((event.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.id.split('@')[0]!));
    return new Set((campaign.module.rules ?? []).filter(r => r.teaches && heard.has(r.id)).map(r => r.teaches!));
  }
  private static session(event: CampaignEvent, after: PlayerSnapshot, before: PlayerSnapshot): ActionFeedback {
    return { attempt: event.response ?? event.action, result: event.response ?? '', resources: [], time: '',
      immediate: [], discoveries: [], rolls: [], observations: [], events: [],
      available: after.choices.filter(c => !before.choices.some(b => b.id === c.id)).map(c => c.name),
      unavailable: [] };
  }
  // A fought act, its fight told turn by turn on its own page (or the runner's turns): told by the fight's own lines
  // where they are given, then only what was witnessed meanwhile, and what ran out in it, a light above all: the
  // torch gone out in the fight in the bone hall had been told nowhere, and the dark came on with no word (cold play 4,
  // CL-42). keep: what else is told (how it ended). opened: what the fight opened on (FightBegun), told as it began and
  // not again after it is won (GR-05: "The fight is won." and then "The conger comes at you out of the silt").
  static fought(feedback: ActionFeedback, told: string[] = [], keep: string[] = [], opened: string[] = [])
    : ActionFeedback {
    const lapsed = new Set(feedback.lapsed ?? []), said = new Set(opened);
    return { ...feedback, immediate: [...told, ...feedback.immediate.filter(t => t.startsWith('You witness: ')
      || lapsed.has(t) || keep.includes(t))], events: feedback.events.filter(t => !said.has(t)),
    observations: feedback.observations.filter(t => !said.has(t)) };
  }
  // A fight told after it names a band's members by the band (see BandNames), not by their numbers in it: drawn only
  // where something of a fight is told (every creature the world holds had been drawn as a fighter for each act).
  private static named(campaign: Campaign, event: CampaignEvent): Parameters<typeof CombatPresenter.format>[1] {
    const fought = event.combat.length > 0;
    return CombatProjection.told(campaign.catalog, Fought.of(campaign, [event]), campaign.readout.partyIds,
      fought ? BandNames.of(campaign) : undefined);
  }
  static read(campaign: Campaign, event: CampaignEvent, before: PlayerSnapshot): ActionFeedback {
    const after = PlayerView.observe(campaign);
    const action = campaign.operator(event.action);
    // A command of the session that is no act of the world (an aim chosen to follow): said as it was.
    if (!action) { return this.session(event, after, before); }
    const names = this.named(campaign, event);
    const combat = this.fights(event, before, names), split = event.prelude?.fought;
    const rolls = event.combat.filter(e => e.type === 'check' || (e.type === 'save' && !event.combat.some(x => x.type === 'initiative')))
      .map(e => CombatPresenter.format(e, names));
    const learned = after.knowledge.filter(k => !before.knowledge.some(b => b.id === k.id));
    // What taught the company something is what it saw, though once it knows, the place no longer shows it so.
    const taught = ActionFeedbackView.taught(campaign, event)
      .filter(t => !before.observations.some(b => b.text === t.text));
    const shown = ActionFeedbackView.shown(campaign, taught), spoken = ActionFeedbackView.spoken(campaign, event);
    const unsaid = learned.filter(k => !spoken.has(k.id) && !shown.has(k.id));
    const changed = this.changed(campaign, event, { before, after, taught, known: new Set(learned.map(k => k.id)) });
    const old = new Set(before.choices.map(c => c.id)), now = new Set(after.choices.map(c => c.id));
    const arose = ActionFeedbackView.aims(before, after, ActionFeedbackView.errands(campaign, before, after));
    const { aims, offered, amended } = arose, taken = ActionFeedbackView.begun(campaign, before, arose.taken);
    const battleResult = ActionFeedbackView.ended(event, before, after);
    // A try or a search that turns up nothing says so, rather than leaving the player to wonder.
    const quiet = ActionFeedbackView.probes.includes(action.schema ?? '') && action.schema !== 'search' && !learned.length && !changed.length
      && !combat.length && !RuleWords.said(event).length;
    const nothing = quiet ? ` ${ActionFeedbackView.nothing[action.schema ?? ''] ?? 'Nothing comes of it.'}` : '';
    // Who came at the company is told between the fights, not before the first.
    // A wait's first light or dark is told as the voice tables told it this time (see Days).
    // And an answer given again word for word, as given again (see Answers).
    const response = split ? undefined : Days.told(event) ?? Answers.told(event) ?? event.response;
    const result = response ? `${response}${nothing}` : battleResult ?? (event.result === 'failure' ? 'Your attempt did not succeed.' :
      unsaid.length ? unsaid.map(k => k.text).join(' ') :
        before.location?.id !== after.location?.id ? `You arrive at ${after.location?.name}.` :
          combat.length ? '' :
            action.schema === 'wait' ? 'Time passes.' :
              changed[0] ? FictionalTime.prose(changed[0].text)
                // What happened is told by what came of it, when something did; otherwise the act said is enough
                // (the Story read "You carry out the action." under every greeting).
                : '');
    const resources = [...new Set([...(before.resources ?? []).map(r => r.id),
      ...(after.resources ?? []).map(r => r.id)])]
      .flatMap(id => {
        const a = before.resources?.find(r => r.id === id), b = after.resources?.find(r => r.id === id);
        return (a?.amount ?? 0) === (b?.amount ?? 0) ? [] :
          [`${a?.name ?? b?.name}: ${a?.amount ?? 0} → ${b?.amount ?? 0}`];
      });
    // An aim given whose fight is beyond a company alone is said so by whoever gave it (OR-64; see Outmatched), taken
    // or offered to take up (OR-248): Eamon warns a lone mage of the quarry as he tells of it.
    const warned = Outmatched.warning(campaign, event, [...taken, ...arose.arisen]);
    return { resources, attempt: this.attempt(campaign, event, before),
      result: FictionalTime.prose(warned ? `${result} ${warned}`.trim() : result),
      time: this.time(before, { elapsed: event.elapsed, minutes: after.minutes }),
      immediate: [...combat, ...PlayerView.chronicle(campaign).filter(e => e.kind === 'npc'
        && e.at > before.elapsed && e.at <= event.elapsed).map(e => `You witness: ${e.text}`)],
      rolls, ...this.ran(event, names), discoveries: learned.map(k => shown.get(k.id) ?? k.text),
      ...this.leads(campaign, learned, new Set(before.knowledge.map(k => k.id))),
      ...!response && battleResult ? { ended: true } : {}, ...aims.length ? { aims } : {},
      ...offered.length ? { offered } : {},
      ...amended.length ? { amended } : {}, ...taken.length ? { taken } : {}, ...this.borne(campaign, before, after),
      // Not the world's words held back as told lately (see RuleWords).
      events: RuleWords.said(event).map(p => p.text), ...this.paid(campaign, event),
      observations: changed.map(o => FictionalTime.prose(o.text)),
      available: before.location?.id === after.location?.id ?
        after.choices.filter(c => !old.has(c.id)).map(c => c.name) : [],
      unavailable: before.location?.id === after.location?.id ?
        before.choices.filter(c => !now.has(c.id)).map(c => c.name) : [],
      ...this.opened(before, after, old), ...this.closed(before, after) };
  }
  private static closed(before: PlayerSnapshot, after: PlayerSnapshot): { closed?: string } {
    const was = before.followed;
    return was && !after.followed && !(after.objectives ?? []).some(o => o.id === was) ? { closed: was } : {};
  }
  private static opened(before: PlayerSnapshot, after: PlayerSnapshot, old: Set<string>): { opened?: string[] } {
    const opened = before.location?.id === after.location?.id ? after.choices.filter(c => !old.has(c.id)) : [];
    return opened.length ? { opened: opened.map(c => c.id) } : {};
  }
  // What the company did, in the words it was offered in (a name it learns by doing it is not echoed back), where
  // the offer was one; several offered under one id (buy it for one of the company or another) say it as done. One's
  // own mother or father is "your mother" in it, as in what is said of her (see Telling.called): talked to as "your
  // mother", she had been left with "You take your leave of Jassin Galanodel" (M17-93).
  private static attempt(campaign: Campaign, event: CampaignEvent, before: PlayerSnapshot): string {
    const action = campaign.operator(event.action)!, offered = before.choices.filter(c => c.id === event.action);
    const said = offered.length === 1 ? offered[0]!.name
      : PlayerView.aliased(campaign.world, action.name, new Set(before.knowledge.map(k => k.id)));
    const kin = Object.values(action.bindings ?? {})
      .map(id => [ObservationText.label(campaign.world, id), Telling.called(campaign, id)] as const)
      .filter(([name, word]) => name !== word);
    const told = this.own(campaign, action, kin.reduce((t, [name, word]) => t.replaceAll(name, word), said));
    return told === said ? said : `${told.charAt(0).toUpperCase()}${told.slice(1)}`;
  }
  // Done by one who came alone, what is done for them is not said to be for them: the one the act is for, bound by
  // name, is the only one there is (the cold playtest's "You collect a garnet for Hild", Hild being the one
  // collecting it: CO-10).
  private static own(campaign: Campaign, action: Operator, said: string): string {
    const w = campaign.world, actor = campaign.playerActor ?? 'party';
    const members = w.related('memberOf').filter(r => r.args[1] === actor).map(r => r.args[0]!);
    const self = members.length === 1 && Object.values(action.bindings ?? {}).includes(members[0]!)
      ? members[0] : undefined;
    return self ? said.replace(` for ${ObservationText.label(w, self)}`, '') : said;
  }
}
