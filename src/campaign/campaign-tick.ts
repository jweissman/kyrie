import type { Operators } from './operators';
import { FictionalTime, type Night } from './fictional-time';
import { Calendar, type CalendarStart } from './calendar';
import { Expressions } from '../expressions';
import { RandomStreams } from '../random-streams';
import { Agency } from './agency';
import { ActionTime } from './action-time';
import { CreatureFacts } from './creature-facts';
import { Planner } from './planner';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { LocalObservations } from './local-observations';
import { World } from '../lang/world';
import { ComputedRelations, Reads, Stamps } from '../lang/index';
import { EndingOrder } from '../lang/ending-order';
import { Journey } from './journey';
import { Consequences } from './consequences';
import { RuleWakes } from './rule-wakes';
import type { Call, Change, Module, Operator, Predicate, WorldRule, WorldState } from '../lang/module';
import type { CampaignDefinition } from './definition';
import type { CreatureStore } from '../creature-store';

export interface PendingAction { action: string; until: number }
// What a rule found idle is held to (see CampaignTick.instances): all its condition reads; the names it is held idle
// by, and their stamps where it was found so; the module it was found idle in.
interface Idle { reads: string[]; held?: string[]; stamped?: number[]; module?: Module }
export interface TickHost {
  readonly world: World; readonly module: Module; readonly playerActor: string | undefined;
  readonly operators: Operators;
  readonly tickState: { definition: CampaignDefinition; creatures: CreatureStore;
    current: { seed: string; elapsed: number; minutes?: number; world: WorldState;
      pending?: Record<string, PendingAction>; waiting?: Record<string, number>; told?: string[] } };
  applyAction(action: Operator, success?: boolean): void; refreshProjection(): void; recordObservations(): void;
  commitWorld(world: World): void;
}
// seen: whether the company perceived it as it happened (it was where the company was, or came or went from there,
// and the company noticed them in the light).
export interface TickDecision {
  actor: string; goal: string; action: string; plan: string[]; elapsed: number; changes: string[]; seen?: boolean;
}
// rivals: for an ending, the others that held as it was reached and could have been reached instead (see
// EndingOrder.rivals).
export type Happening = { id: string; text: string; kind: 'event'; rivals?: string[] };

// One watch of the world after the player's action: every NPC acts or continues what it is doing, then each rule
// fires once in authored order. A rule with ?variables fires once for every binding that satisfies it.
export class CampaignTick {
  // Whoever watches the rules fire, for a review of a journey (src/cli/review-observer.ts): each rule's id, with its
  // binding's instance, and what it changed, in the words of CampaignEvent.changes. Unset in play: nothing is kept.
  static witness?: (rule: string, changes: string[]) => void;
  // The clock after a watch passes: its reading, dark() from nine in the evening until six in the morning, and the
  // watch's die (dice(clock), 1 to 100, drawn from the campaign's seed) for whatever is left to chance: a wandering
  // band on a road, the weather turning.
  static readonly seasons = ['spring', 'summer', 'autumn', 'winter'];
  static clock(world: World, { elapsed, seed, calendar, night: hours }: { elapsed: number; seed: string;
    calendar?: CalendarStart; night?: Night }): Change[] {
    const night: Change[] = world.module.relations.some(r => r.name === 'dark')
      ? [{ kind: FictionalTime.dark(elapsed, hours) ? 'assert' : 'retract', call: ModuleWriter.call('dark') }] : [];
    // How long until the hours a company waits for: first light, a night's sleep, dark, the day's next turn.
    const until: [string, number][] = [['untilLight', FictionalTime.untilLight(elapsed, hours)],
      ['untilMorning', FictionalTime.untilMorning(elapsed)], ['untilDark', FictionalTime.untilDark(elapsed, hours)],
      ['untilTurn', FictionalTime.untilTurn(elapsed)]];
    until.push(['hour', FictionalTime.hour(elapsed)], ['day', FictionalTime.day(elapsed)],
      ['nightCount', FictionalTime.nightOf(elapsed)]);
    for (const [name, watches] of until) {
      if (world.module.measures.some(m => m.name === name)) {
        night.push({ kind: 'set', call: ModuleWriter.call(name, 'clock'), value: ModuleWriter.number(watches) });
      }
    }
    if (calendar && world.module.measures.some(m => m.name === 'season')) {
      night.push({ kind: 'set', call: ModuleWriter.call('season', 'clock'),
        value: ModuleWriter.number(this.seasons.indexOf(Calendar.date(calendar, elapsed).season) + 1) });
    }
    if (world.module.measures.some(m => m.name === 'dayDice')) {
      const day = FictionalTime.day(elapsed);
      night.push({ kind: 'set', call: ModuleWriter.call('dayDice', 'clock'),
        value: ModuleWriter.number(new Expressions(RandomStreams.key(seed, 'dayDice', day)).number('1d100')) });
    }
    if (world.module.measures.some(m => m.name === 'dice')) {
      night.push({ kind: 'set', call: ModuleWriter.call('dice', 'clock'),
        value: ModuleWriter.number(new Expressions(RandomStreams.key(seed, 'dice', elapsed)).number('1d100')) });
    }
    return [{ kind: 'set', call: ModuleWriter.call('watch', 'clock'), value: ModuleWriter.number(elapsed) }, ...night];
  }
  static npcs(host: TickHost, decisions: TickDecision[]) {
    const { definition, current } = host.tickState;
    // The creatures' facts are projected again before anyone chooses after someone has acted, not before everyone.
    let acted = decisions.length + 1;
    for (const actor of definition.actors.filter(a => !a.player)) {
      if (acted !== decisions.length) { host.refreshProjection(); acted = decisions.length; }
      const pending = current.pending?.[actor.id];
      if (pending) {
        if (current.elapsed < pending.until) { continue; }
        delete current.pending![actor.id];
        const action = host.operators.get(pending.action);
        // An undertaking whose conditions no longer hold when its time is up is obstructed: its authored failure
        // (the aftermath of a broken rite, a wasted journey) happens instead.
        if (action && Planner.applicable(host.world, action)) { this.act(host, decisions, { actor: actor.id, goal: 'continuing', action, plan: [] }); }
        else if (action) { this.act(host, decisions, { actor: actor.id, goal: 'obstructed', action, plan: [] }, false); }
        continue;
      }
      const choice = Agency.choose(host.world, actor, host.operators, current);
      if (!choice) { continue; }
      const duration = ActionTime.of(choice.action, host.world);
      if (duration > 1) {
        (current.pending ??= {})[actor.id] = { action: choice.action.id, until: current.elapsed + duration - 1 };
        continue;
      }
      const plan = choice.plan.actions;
      this.act(host, decisions, { actor: actor.id, goal: choice.goal, action: choice.action, plan });
    }
  }
  private static act(host: TickHost, decisions: TickDecision[],
    d: { actor: string; goal: string; action: Operator; plan: string[] }, success = true) {
    const prior = host.world;
    host.applyAction(d.action, success);
    decisions.push({ actor: d.actor, goal: d.goal, action: d.action.id, plan: d.plan,
      elapsed: host.tickState.current.elapsed, changes: this.diff(prior, host.world),
      seen: this.seen(host, d.actor, prior) });
    host.recordObservations();
  }
  // Whether the company perceived an act as it happened: done where the company was (or by one who came or went from
  // there), by one it noticed, and not in the dark. "You witness" was told of acts at the end of a two-hour road, and
  // of one anywhere in the world that named the place (the architecture review's A6).
  private static seen(host: TickHost, actor: string, prior: World): boolean {
    const player = host.playerActor, world = host.world, here = player && world.one('at', player);
    if (!player || !here || (prior.one('at', actor) !== here && world.one('at', actor) !== here)) { return false; }
    const dark = world.module.queries.some(q => q.name === 'benighted')
      && world.test(ModuleWriter.call('benighted', player));
    return !dark && LocalObservations.noticed(world, actor, player);
  }
  // The world's rules, in the order they are declared, but for what follows on from them (late); then a way's opening
  // once more, and what follows on, so that a gate declared
  // before the rule that lets the company through is open as soon as it has (Low Water's 1, the Assayers' gate; What
  // Tessary Owes' W10, the black wall that shut a watch late). began is the world as the watch began, before anyone
  // acted in it: what the company perceived then it heard said in the watch (see heard).
  static rules(host: TickHost, happenings: Happening[], began: World = host.world) {
    const rules = host.module.rules ?? [];
    this.pass(host, rules, false, { happenings, began });
    this.pass(host, rules, true, { happenings, began });
    CampaignTick.ruled?.(host.world);
  }
  // A placement taken up late (see PendingPlacements) caught up: its own rules run through every watch it was held back
  // for, the clock read as at each, as the world would have run them had it been there from the first, what they say
  // said to no one who was not there; and in the last, the shared rules with them (shared: the kernel's, which take up
  // what the placement brings, a lock's lockwork found), as the world installed whole ran them in its first. Its clock
  // is then as it was. A fever that took its child at the second dawn has taken it when the company first comes to its
  // green on the third day, as it had in the world installed whole.
  static caughtUp(host: TickHost, rules: readonly WorldRule[], now: Parameters<typeof CampaignTick.clock>[1],
    shared: readonly WorldRule[] = []) {
    for (let elapsed = 1; elapsed <= now.elapsed; elapsed++) {
      host.commitWorld(host.world.apply(this.clock(host.world, { ...now, elapsed })));
      const began = host.world, these = elapsed < now.elapsed ? rules : shared;
      this.pass(host, these, false, { happenings: [], began });
      this.pass(host, these, true, { happenings: [], began });
    }
  }
  // Whether a rule waits on the company itself (what it knows, carries or is with, where it is), and so cannot fire
  // where the company is not: its words said anywhere are said to the company that did what they answer.
  private static readonly company = new Set(['memberOf', 'travelsWith', 'holding', 'carries', 'carried']);
  static waitsOnCompany(module: Module, rule: WorldRule): boolean {
    return Reads.keyed(module, rule.when).some(k => k.endsWith(`${Stamps.mark}party`) || this.company.has(k));
  }
  // A spec's look at the world as each watch's rules leave it (test/rule-wakes-watches: the oracle, every rule asked
  // afresh, against the rules a write wakes).
  static ruled?: (world: World) => void;
  // One pass over the rules in their order (again: the upkeep and the late), asking only those a write has woken (see
  // RuleWakes): a rule held idle whose names are unwritten since would find nothing. Whatever fires writes the world,
  // and what it wrote may wake a rule after it in the pass, so the rules asleep are read again from the world it left.
  private static pass(host: TickHost, rules: readonly WorldRule[], again: boolean,
    { happenings, began }: { happenings: Happening[]; began: World }) {
    let world = host.world, wakes = RuleWakes.of(world.module), asleep = wakes.asleep(world);
    for (const rule of rules) {
      if (again ? !rule.upkeep && !rule.late : rule.late) { continue; }
      if (!this.afresh && wakes.sleeps(asleep, rule)) { continue; }
      this.fire(host, rule, happenings, { began });
      if (host.world === world) { continue; }
      world = host.world; wakes = RuleWakes.of(world.module); asleep = wakes.asleep(world);
    }
  }
  // The endings alone, read once more after the company has fallen: the cold that killed it struck after the watch's
  // rules had run, and no pass came after, so a module's own ending on dead(party), the dead walking in out of the
  // snow, was never reached and the page closed on the shared words (The Quiet in the Sky's 21, QIS-05).
  static endings(host: TickHost, happenings: Happening[]) {
    const began = host.world;
    for (const rule of host.module.rules ?? []) {
      if (rule.effects.some(c => c.kind === 'assert' && c.call.name === 'reached')) {
        this.fire(host, rule, happenings, { began });
      }
    }
  }
  // What is read again once the rules of the moment have run, read once as a game begins, before anyone acts: a way
  // open by day, or a change made only while nobody watches, is so from the first, not from the first watch (GTR-07:
  // the bureau no one stood over could not be eased open until the company had done something else first).
  static settle(host: TickHost) {
    // Committed once as it begins, so that where the company starts is a place it has stood (see CommittedWorld).
    host.commitWorld(host.world);
    const began = host.world;
    for (const rule of host.module.rules ?? []) { if (rule.upkeep) { this.fire(host, rule, [], { began }); } }
    // A thing a module gives as it begins (Initially Assert handed(...)) is the company's before it does anything:
    // given in the first watch, it was told after whatever came first ("You take Tegwen's lease." on reading a notice,
    // cold play 5's CL-35).
    Consequences.hand(host, []);
    this.prime(host.world, host.module.rules ?? []);
  }
  // Each rule asked once of the world as the game begins, its answer not acted on: what each reads is noted, and one
  // that holds nowhere is stamped idle there (see instances), so that the first act's watches ask again only what that
  // act has written. Unprimed, the first act asked every rule of the country afresh and paid for reading each one's
  // condition (OR-145: 141 ms of the first act's watches into a1's first town, 31 once its rules had been asked).
  private static prime(world: World, rules: readonly WorldRule[]) {
    for (const rule of rules) { this.instances(rule, world); }
  }
  // The world's rules once more, as the company learns something by seeing, reading or hearing it (see
  // Perceptions.settle); since is the world before it was learned. A rule is asked again only if something it reads
  // has changed since then, and fires only where it holds now and did not then: what was learned is answered in the
  // command that taught it, and nothing that held before fires twice. Asked only in the next command's watch, an
  // inference on what had just been read (the Courant's account set against Kittiwake's memory) fired after the
  // company had done something else, and an ending on what it taught later still (the Grand Tour's friction 23).
  static answer(host: TickHost, since: World): Happening[] {
    const happenings: Happening[] = [], rules = host.module.rules ?? [], at = { began: host.world, since };
    for (const rule of rules) {
      if (!rule.late && this.stirred(host.world, rule, since)) { this.fire(host, rule, happenings, at); }
    }
    for (const rule of rules) {
      const again = rule.upkeep || rule.late;
      if (again && this.stirred(host.world, rule, since)) { this.fire(host, rule, happenings, at); }
    }
    return happenings;
  }
  private static stirred(world: World, rule: WorldRule, since: World): boolean {
    const reads = this.idle.get(rule)?.reads ?? Reads.names(world.module, [rule.when]);
    return !world.agrees(reads, since.stamped(reads));
  }
  private static fire(host: TickHost, rule: WorldRule, happenings: Happening[],
    { began, since }: { began: World; since?: World }) {
    // A rule said within an area waits for the company to be there: news of the city is told, and done, when the
    // company comes up from under the sea (What Tessary Owes' W1, the Road's F9). One only heard within it happens
    // regardless: the Sexton goes back up the tower whether or not anyone is under the water (the Grand Tour's 22).
    if (rule.anchor === 'within' && rule.place && !rule.heard
      && !(host.playerActor && LocalObservations.inArea(host.world, host.playerActor, rule.place))) { return; }
    // One held as news waits for the company to hear it: a promise's line, until the company is with the one it was
    // made to (the Grand Tour's friction 5, Perrin's 'as he asked' told wherever the company was).
    if (rule.held && !this.heard(host, rule, [host.world])) { return; }
    for (const [effects, binding] of this.instances(rule, host.world)) {
      // Each instance fires only if its condition still holds after those before it (two powers cannot both seize
      // the one stronghold left vacant).
      if (Object.keys(binding).length && !host.world.test(rule.when, binding)) { continue; }
      // Only what the learning makes hold answers it (see answer): what held before fires in a watch, as it did.
      if (since?.test(rule.when, binding)) { continue; }
      // Whoever follows the company comes along when a rule carries it off (a chair to the downs: the Banns at
      // Hessel's friction 6, which kept its own rule for it).
      const prior = host.world, next = Journey.along(prior, prior.apply(this.yielding(host, rule, effects)),
        host.playerActor);
      // The company's state read only for a rule that fires: of a thousand asked a watch, a handful do (AX-10).
      const { definition, creatures } = host.tickState;
      CreatureFacts.commitMoney(prior, next, definition.actors, creatures);
      // The world itself is kept, not a copy of its facts, which the next reading of the world would build again
      // from every fact (Mission 15's profile: most of a command's time in a country of several regions).
      host.commitWorld(next);
      CampaignTick.witness?.(Object.keys(binding).length ? `${rule.id}@${Object.values(binding).join(',')}` : rule.id,
        next.changes(prior));
      if (rule.say && this.heard(host, rule, [began, prior, next], binding)) {
        // One told for each binding it fires for (each member polled), as an observation near a variable is seen once
        // for each thing it is near: an instance's id is its rule's and the binding's (aye@roll).
        const instance = Object.keys(binding).length ? `${rule.id}@${Object.values(binding).join(',')}` : rule.id;
        // An ending is told with any other that held where it was reached, as it was, for the journeys to warn of.
        const rivals = EndingOrder.rivals(host.module, rule, prior), say = this.telling(host, rule, instance);
        happenings.push({ id: instance, text: ObservationText.render(say, next, true, binding), kind: 'event',
          ...rivals.length ? { rivals } : {} });
      }
    }
  }
  // What a rule says the first time the company hears it (of each it fires for), and after that its words again, where
  // it has them: a nightly show is told in full once (Wapshott's Circus friction 26, WPC-26). Which it has heard is
  // kept with the game, and saved with it.
  // One with lines in turn after its again (`then`) is kept as heard each time, and says the next (QTC-A35).
  private static telling(host: TickHost, rule: WorldRule, instance: string): string {
    if (!rule.again) { return rule.say!; }
    const current = host.tickState.current, heard = current.told?.filter(t => t === instance).length ?? 0;
    if (heard && !rule.then) { return rule.again; }
    (current.told ??= []).push(instance);
    const turns = [rule.again, ...rule.then ?? []];
    return heard ? turns[(heard - 1) % turns.length]! : rule.say!;
  }
  // Whether the company hears what a rule says, as a witness would: it can when the rule has done, and it perceived
  // the rule's anchor as the watch began, or just before the rule's effects, or just after them (the test seen applies
  // to an act). Judged only after them, an event near Quance that carried her to the Nexus went untold to the company
  // beside her, as did one near her in the watch her routine moved her, and its latch spent it unheard (the Grand
  // Tour's friction 2, GTR-02). What the company perceived in none of them it did not hear: that is news, told later.
  // One near a variable (`Rule r near ?who`) is heard near whoever its binding gives (Wapshott's Circus friction 3).
  private static heard(host: TickHost, rule: WorldRule, worlds: World[],
    binding: Record<string, string> = {}): boolean {
    const player = host.playerActor, place = rule.place?.startsWith('?') ? binding[rule.place] : rule.place;
    if (!player || !worlds.at(-1)!.test(ModuleWriter.call('able', player))) { return false; }
    // Nor what is done near someone dead, unless it is told of their death: the Gaffer had come off his fleeces and
    // stretched after he died (WM-01). One who has joined the company has no members of their own, and is read as
    // dead (CreatureFacts): not them (Wat's words on the road had gone unsaid).
    const last = worlds.at(-1)!;
    if (rule.anchor === 'near' && place && last.relates('dead') && last.test(ModuleWriter.call('dead', place))
      && !(last.relates('travelsWith') && last.test(ModuleWriter.call('travelsWith', place, player)))
      && !Reads.names(host.module, [rule.when]).includes('dead')) { return false; }
    return !place || worlds.some(world => LocalObservations.perceives(world, player, place, rule.anchor));
  }
  // One who follows the company goes where it goes: a rule that neither asks nor says who follows whom (an hour's
  // routine: Rupert, asked to come and tell his mother, walked off to the King's Bath at two, the Banns at Hessel's
  // friction 5, whose forty routines each said "and not following") does not take them anywhere else. One that ends
  // the following (Gosse's bear put back in her pen) does.
  private static yielding(host: TickHost, rule: WorldRule, effects: Change[]): Change[] {
    const player = host.playerActor, world = host.world, ties = ['following', 'travelsWith'];
    const held = ties.filter(t => world.relates(t));
    if (!player || !held.length || effects.some(c => ties.includes(c.call.name))) { return effects; }
    // Whoever travels with it too: a recruit hired at the inn had been walked off by a rule placing the inn's folk
    // (WPC-X05).
    const followers = new Set(held.flatMap(t => world.related(t)).filter(r => r.args[1] === player)
      .map(r => r.args[0]!));
    const reads = this.idle.get(rule)?.reads ?? Reads.names(world.module, [rule.when]);
    if (!followers.size || reads.some(n => ties.includes(n))) { return effects; }
    // Away from it, that is: a rule that brings one along where the company is (the Parliament's Almanack) is let be.
    const here = world.one('at', player);
    const moved = new Set(effects.filter(c => c.kind === 'assert' && c.call.name === 'at' && followers.has(c.call.args[0]!)
      && c.call.args[1] !== here).map(c => c.call.args[0]!));
    return moved.size ? effects.filter(c => c.call.name !== 'at' || !moved.has(c.call.args[0]!)) : effects;
  }
  // The effect lists a rule contributes now: none, one, or one per satisfying binding of its ?variables. A rule that
  // held nowhere in a world holds nowhere in a later one of its line that has written nothing its condition reads, so
  // it is not asked again there (Mission 15's profile: every rule of every module asked again on every watch).
  // Held to the module it was found idle in: a world joined to more (an installation, a country drawn) has entities
  // its condition may range over that it had not (the review's A21).
  // And held idle by less than all it reads, where it can be: a part of its condition that asks of no variable and
  // does not hold keeps the whole from holding until something that part reads is written. Of those, the one read
  // longest ago is kept to (a sale cried at the drove, waiting on the reeve being sent, is not asked again every
  // watch because it also asks the hour: AX-10, most of a quiet watch's rules solved again for reading the clock).
  // `reads` stays all the condition reads, for whoever asks what a rule turns on (yielding, stirred).
  private static readonly idle = new WeakMap<WorldRule, Idle>();
  // The oracle (test/rule-wakeups): every rule asked and solved afresh in every pass, nothing held idle.
  static afresh = false;
  static instances(rule: WorldRule, world: World): [Change[], Record<string, string>][] {
    if (this.afresh) { return this.found(rule, world); }
    let idle = this.idle.get(rule);
    if (!idle) { idle = { reads: Reads.names(world.module, [rule.when]) }; this.idle.set(rule, idle); }
    if (idle.module === world.module && world.agrees(idle.held ?? idle.reads, idle.stamped)) { return []; }
    // One with ?variables is first read for a part that keeps it from holding at all, and solved only where none
    // does: of the rules a watch woke, four in five had been solved for every binding only for a part asking of no
    // variable, or a fact of which there is none, to fail them all (AX-10). One with none is asked whole.
    const open = World.variables(rule.when), blocked = open ? this.stays(rule, world) : undefined;
    const found = blocked ? [] : this.found(rule, world);
    idle.held = found.length ? undefined : blocked ?? (open ? undefined : this.stays(rule, world)) ?? idle.reads;
    idle.stamped = idle.held && world.stamped(idle.held);
    if (idle.module && idle.module !== world.module) { RuleWakes.of(idle.module).free(rule); }
    idle.module = world.module;
    const wakes = RuleWakes.of(world.module);
    if (idle.held) { wakes.hold(rule, idle.held, idle.stamped!, world); } else { wakes.free(rule); }
    return found;
  }
  // The names of the part of a rule's condition that keeps it from holding (see idle), read longest ago; none where
  // no part fails alone. A part fails alone where it asks of no variable and does not hold, or where it asks for a fact
  // of a relation, of which the world holds none that fits (granted(?c, ?k), nothing yet granted anyone): no binding
  // of the whole can hold then. A fact compared, or computed (distinct), or a query's, is not read so.
  private static stays(rule: WorldRule, world: World): string[] | undefined {
    let best: { reads: string[]; at: number } | undefined;
    const { closed, atoms } = this.closed(rule);
    for (const part of [...closed, ...atoms]) {
      if (closed.includes(part) ? world.test(part) : !this.none(world, part as Call)) { continue; }
      // Held on what it reads of the one thing it asks of, where it asks of one (Reads.keyed: OR-1438).
      const reads = Reads.keyed(world.module, part), at = Math.max(0, ...reads.map(n => world.stamp(n)));
      if (!best || at < best.at) { best = { reads, at }; }
    }
    return best?.reads;
  }
  // Whether the world holds no fact of a relation that fits a part asking of it with ?variables.
  private static none(world: World, atom: Call): boolean {
    return world.relates(atom.name) && !ComputedRelations.has(atom.name) && !!world.solve(atom, {}).next().done;
  }
  // A condition's parts joined by and that name no variable anywhere in them (not even one compared: price(?ware) > 1,
  // which World.variables does not see), each once a rule; and those that ask a fact with ?variables (see stays).
  private static readonly conjoined = new WeakMap<WorldRule, { closed: Predicate[]; atoms: Predicate[] }>();
  private static closed(rule: WorldRule): { closed: Predicate[]; atoms: Predicate[] } {
    let parts = this.conjoined.get(rule);
    if (!parts) {
      const all = this.conjuncts(rule.when), open = new Set(all.filter(p => JSON.stringify(p).includes('"?')));
      parts = { closed: all.filter(p => !open.has(p)), atoms: all.filter(p => p.kind === 'call' && open.has(p)) };
      this.conjoined.set(rule, parts);
    }
    return parts;
  }
  private static conjuncts(p: Predicate): Predicate[] {
    return p.kind === 'and' ? [...this.conjuncts(p.left), ...this.conjuncts(p.right)] : [p];
  }
  private static found(rule: WorldRule, world: World): [Change[], Record<string, string>][] {
    if (!World.variables(rule.when)) { return world.test(rule.when) ? [[rule.effects, {}]] : []; }
    const seen = new Set<string>(), result: [Change[], Record<string, string>][] = [];
    for (const b of world.solve(rule.when, {})) {
      const key = JSON.stringify(Object.entries(b).sort());
      if (seen.has(key)) { continue; }
      seen.add(key);
      result.push([rule.effects.map(c => 'value' in c
        ? { ...c, call: this.bind(c.call, b), value: ModuleWriter.calls(c.value, v => this.bind(v, b)) }
        : { ...c, call: this.bind(c.call, b) }) as Change[], b]);
    }
    return result;
  }
  private static bind(call: Call, binding: Record<string, string>): Call {
    return { ...call, args: call.args.map(a => binding[a] ?? a) };
  }
  static diff(before: World, after: World): string[] { return after.changes(before); }
}
