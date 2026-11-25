import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Candidate } from '../ui/promotion';
import type { Promoted, Why } from './glance-types';
import { CompanyRecall } from './company-recall';
import { VisitedPlaces } from './visited-places';

// What the page led with, what of it the company did where, and how much of its story had happened when it did
// (OR-417: no lead goes round). A lead taken here twice, for the same reason, with nothing happened since, is never
// led again, wherever the lead comes from: a way, an onward or advance step, one of the place's own acts, a talk led
// for a question. The owner's playtest of main had bounced between two adjacent hexes endlessly; over fifteen seeds
// seven walks by the page's own lead went round (the quarry pit and the green, Stonehold and its gate-passage, the
// same questions to Honoria Bulstrode again and again). This is OR-416's rule for a question asked again, made general.
// Once round is allowed: fled back up from the rats, the way down to face them is still the aim's
// (test/small/idle-aim); fled again, the way down is not led a third time, and what else there is to do leads.
//
// The story's mark counts the commands that changed something: anything but where the company stands and the
// attention a place pays it on the way (warned, patience), or the clock; and for a step from one place to another,
// only what it brought the company itself (somewhere first been, something learnt, someone met), so that the world
// going about its hours (a cook gone to the larder) is no reason to walk the same way again. Only what was led counts:
// what the company chose for itself is its own (and a need new since, a light lost, is a reason of its own).
// Each act led, by the command it was led as, with every reason it was led for (Done.whys).
interface Done { mark: number; times: number; whys: Set<Why> }
interface Read { actor: string; read: number; last?: CampaignEvent; mark: number; at: Map<string, string>;
  done: Map<string, Map<string, Done>> }
export class LedAgain {
  private static readonly logs = new WeakMap<readonly CampaignEvent[], Read>();
  // What the page led with before each command, by the command's place in the log: each act and its reasons.
  private static readonly leads = new WeakMap<readonly CampaignEvent[], Map<number, Map<string, Set<Why>>>>();
  // Where the company stands, the attention paid it in passing, and its body's own hours (hungry, weary, slept): no
  // part of its story (a need come on is a reason of its own, see again).
  static readonly passing = new Set(['at', 'stoodAt', 'tookWay', 'arrivedAt', 'lingered', 'warned', 'patience',
    'hungry', 'weary', 'lastSlept']);
  // What is led for the time it takes (a wait for the day, a night's camp): its time is what changes.
  private static readonly timed = new Set(['wait', 'rest', 'camp', 'study']);
  // A command that lets time pass and does nothing else.
  private static readonly idle = /^(wait|rest|camp)\w*\(/;
  private constructor(private readonly r: Read) {}
  // What the page leads with now, kept against the next command (see Glance): each act, what it is led for, and every
  // reason its candidate had.
  static led(campaign: Campaign, acts: readonly Promoted[], cands: readonly Candidate[]) {
    const log = campaign.history, by = this.leads.get(log) ?? this.leads.set(log, new Map()).get(log)!;
    // Every candidate's reasons for one choice: a keeper's warning is answered by an act that is a candidate of its own
    // too (OR-482: the word to the man with the black candle, led for the danger and for the warning, kept only one).
    const whys = new Map<string, Why[]>();
    for (const c of cands) { whys.set(c.choice, [...whys.get(c.choice) ?? [], ...c.whys]); }
    by.set(log.length, new Map(acts.flatMap(a => [a.for, a.command].filter((c): c is string => !!c)
      .map(c => [c, new Set([a.why, ...whys.get(a.choice) ?? []])] as const))));
  }
  static of(campaign: Campaign): LedAgain {
    const actor = campaign.playerActor ?? 'party', log = campaign.history;
    let r = this.logs.get(log);
    if (!r || r.actor !== actor || log.length < r.read || (r.read > 0 && log[r.read - 1] !== r.last)) {
      r = { actor, read: 0, mark: 0, at: new Map(), done: new Map() };
      for (const c of campaign.module.initial) {
        if (c.kind === 'assert' && c.call.name === 'at') { r.at.set(c.call.args[0]!, c.call.args[1]!); }
      }
      this.logs.set(log, r);
    }
    const company = this.company(campaign, actor), leads = this.leads.get(log);
    for (; r.read < log.length; r.read++) {
      const event = log[r.read]!;
      this.take(r, event, { company, whom: CompanyRecall.whom(campaign, event.action), led: leads?.get(r.read) });
    }
    r.last = log[r.read - 1];
    return new LedAgain(r);
  }
  // How much of the story has happened: the commands that changed something.
  get mark(): number { return this.r.mark; }
  // Whether this was led and done here twice, come off or not, with nothing happened since, and no reason to lead it
  // now that it was not led for then.
  again(place: string, command: string, whys: readonly Why[]): boolean {
    return [...this.r.done.get(place) ?? []].some(([led, d]) => d.mark === this.r.mark && d.times >= 2
      && whys.every(w => d.whys.has(w)) && CompanyRecall.same(command, led));
  }
  // Whether a candidate has gone round here: what it is led for, or a talk, itself or all that it could be led for.
  private round(place: string, c: Candidate): boolean {
    const leaves = Object.values(c.leaves ?? {});
    if (c.for) { return this.again(place, c.for, c.whys); }
    return (!!c.command && this.again(place, c.command, c.whys))
      || (!!leaves.length && leaves.every(a => this.again(place, a, c.whys)));
  }
  // The candidates, those led round held: never led, not even bare, though each is still where it is drawn (Go…, the
  // lenses). What a talk is led for is what is done again, not the talk: held when all it could be led for is.
  static hold(campaign: Campaign, place: string, cands: Candidate[]): Candidate[] {
    if (!campaign.history.length) { return cands; }
    const led = this.of(campaign);
    return cands.map(c => led.round(place, c) && !this.timed.has(c.kind) ? { ...c, held: true } : c);
  }
  private static company(campaign: Campaign, actor: string): Set<string> {
    const w = campaign.world;
    return new Set([actor, ...['memberOf', 'travelsWith'].flatMap(n => w.related(n)
      .filter(f => f.args[1] === actor).map(f => f.args[0]!))]);
  }
  private static take(r: Read, event: CampaignEvent,
    at: { company: Set<string>; whom?: string; led?: Map<string, Set<Why>> }) {
    const here = r.at.get(r.actor);
    VisitedPlaces.moves(event.changes, r.at);
    // A step, or time let pass (a wait, a rest): only what it brought the company is its story, not the world going
    // about its hours meanwhile (a walker waited after each journey, and the town's comings and goings had hidden a
    // round of Brockminster, the road and Windtower).
    const moved = r.at.get(r.actor) !== here, passed = moved || this.idle.test(event.action);
    if (event.changes.some(c => this.story(c, passed, at.company))) { r.mark++; }
    // The act as it was led: by its command; a talk led for nothing in it, by whatever was said to them in it (b2's
    // Honoria asked how the larder stands again and again, the talk led each time); or a journey led about the town
    // or across the country (travel:) whose first leg this is.
    const led = [...at.led ?? []], to = r.at.get(r.actor), who = at.whom;
    const as = led.find(([c]) => CompanyRecall.same(c, event.action))
      ?? (who ? led.find(([c]) => c === `talk_to(${who})`) : undefined)
      ?? (moved ? led.find(([c]) => c === `travel:${to}`) ?? led.find(([c]) => c.startsWith('travel:')) : undefined);
    // A try that failed is done as one that came off: led again with nothing changed, it would only fail again (OR-482:
    // "Tell the man with the black candle the town knows what he has done", failed, led a second and a third time).
    if (!here || !as) { return; }
    const done = r.done.get(here) ?? r.done.set(here, new Map()).get(here)!, was = done.get(as[0]);
    const again = was?.mark === r.mark, whys = new Set([...again ? was.whys : [], ...as[1]]);
    done.set(as[0], { mark: r.mark, times: again ? was.times + 1 : 1, whys });
  }
  // Whether one change is part of the story (see the mark).
  private static story(change: string, moved: boolean, company: Set<string>): boolean {
    const m = /^[+-] (\w+)\(([^)]*)\)/.exec(change);
    if (!m) { return !moved; }
    const args = m[2]!.split(',').map(a => a.trim());
    if (this.passing.has(m[1]!) || args.includes('clock')) { return false; }
    return !moved || args.some(a => company.has(a));
  }
}
