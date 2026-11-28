import { PlayTool } from '../../src/cli/play-tool';
import { Journey } from '../../src/session/journey';
import type { PlaySession } from '../../src/session/play-session';
import type { CampaignEvent } from '../../src/campaign/campaign';
import { HonestPlayer } from '../../test/support/honest-player';
import { QuantityPlaces } from './places';
import { DangerSense } from '../../src/presentation/danger-sense';
import type { Battle } from '../../src/arena';
import { Tactics } from '../../src/tactics';
import { QuantityLadder, type Ladder } from './ladder';
import { QuantityDungeon } from './dungeon';
import { QuantityDescents, type Delver } from './descending';

// Five expeditions on the reference seed (OR-1390, the economy review's Priority 0: doc/reviews/conflict-economy-
// boredom-stimulation.md §8, §9): a rung-3 player with an explicit policy, not a search.
// - Each expedition prepares in the town: rests at the shrine when hurt (or works for its keep), spends a level
//   gained, and buys a light, a ration and a firebomb when it can.
// - It goes down into the dead place under the old woods (the first time by the page's gold, as a new life would).
// - It delves room by room as the delver does: whoever is there fought where its reckoning says no one would fall,
//   what lies about taken up, a room not yet been in first and deeper first, a way the page calls grave gone round,
//   a trap looked at, prodded and risked where it would not kill; else back by a way not yet taken from where it
//   stands; no deeper than one level more than the last expedition went.
// - It turns back when anyone is below three fifths or after so many steps, comes home, and sells what it found below.
// Every command is classed (decision, consequence, traversal, recovery, administration, exposition), and each return
// is set against the last: options newly legal where the company prepares and goes down, the world changed, facts
// learned, risk changed, what the town remembers. The review's disconfirming test is read from it: five trips whose
// preparations and approaches are the same.
export type Kind = 'decision' | 'consequence' | 'traversal' | 'recovery' | 'administration' | 'exposition';
// The answers to what is met below (OR-1392's grammars): fought, gone round, listened for, talked round, lied to,
// warned off, asked, searched, a thing worked (a seal, a counterweight), a trap risked.
export type Answer = 'fight' | 'round' | 'listen' | 'talk' | 'lie' | 'threaten' | 'ask' | 'search' | 'work' | 'risk';
// The policy's OR-1392 branches (off, the policy before it): words to a band that talks, a way listened at, a room
// searched.
export interface Policy { grammar: boolean }
export interface Trip {
  n: number; prepared: string[];
  approach: { attacks: number; traps: number; risked: number; avoided: number; deepest: number; turned: string };
  // How it met what it met below, each kind of answer once (Answer), in the order first used.
  answers: Answer[];
  // Where its routine moves (traversal and administration) were made, below or above; the watches it took; and the
  // rooms below the company has been in by its return (OR-1395: routine compressed without a fall in world time or in
  // the sense of where it is).
  routine: { below: number; above: number }; watches: number; rooms: number;
  // moves: the world's events, a journey's every leg one; presses: what was pressed, a journey one (the cold play's
  // count: the review's Wave 2, "record total presses"), and whether it went down by a way made sure (Descents).
  moves: Record<Kind, number>; presses: Record<Kind, number>; descended: boolean; coin: number; items: string[];
  fell: boolean; changed: { options: number; world: number; learned: number; risk: number; memory: number };
}
export class QuantityExpeditions {
  static readonly seed = 's0';
  // The lives the ladder is read over (QuantityLadder.median): the reference seeds whose town is the reference game's.
  static readonly seeds = ['s0', 's4', 's7'];
  static readonly steps = 30;
  // The gear the company goes down with, never sold (the jar of noonlight the halls' bane, OR-1620).
  static readonly kept =
    /^(torch|candle|rations|oil_firebomb|longsword|chainmail|pole|rope|lamp_oil|lantern|noonlight)$/;
  static kind(id: string): Kind {
    if (/^(go\(|travel:)/.test(id)) { return 'traversal'; }
    if (/^(wait|take_lodging|work_keep|camp\(|rest|bed|.*_heal)/.test(id)) { return 'recovery'; }
    if (/^(light_item|douse|put_item|take_item|take_out|take_pile|equip_item|give_item|buy_item|buy_goods|haggle)/
      .test(id)) {
      return 'administration';
    }
    if (/^(sell_ware|sell_)/.test(id) || /_paid\b|_reward/.test(id)) { return 'consequence'; }
    if (/^(talk_to|look_closely|listen|read|search|study|examine|ask\()/.test(id) || !id.includes('(')) {
      return 'exposition';
    }
    return 'decision';
  }
  static policy: Policy = { grammar: true };
  static async run(trips = 5, policy: Policy = { grammar: true }, seed = this.seed): Promise<Trip[]> {
    this.policy = policy;
    this.found = new Set();
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', seed, '--as', 'human/warrior/Wenna',
      '--opening', 'none', '--origin', 'wanderer']));
    const s = journey.session, out: Trip[] = [], start = this.coin(s), wares = QuantityLadder.wares(s.campaign);
    this.takes = QuantityDungeon.takes(s.campaign, 'region__s1_ud_site');
    let last = this.snapshot(s);
    const seen = new Map<string, Set<string>>();
    for (let n = 1; n <= trips && s.campaign.running && this.standing(s); n++) {
      const trip = await this.trip(s, n, seen), now = this.snapshot(s);
      trip.changed = { ...trip.changed, ...this.compare(last, now) };
      out.push(trip);
      last = now;
    }
    this.ladder = QuantityLadder.of(start, wares, out);
    return out;
  }
  // The town's wares and the purse at the start and each return, as the ladder reads them (OR-1125); and what each
  // level of the dungeon held to carry home before the first went down (OR-1129).
  static ladder?: Ladder;
  static takes: { id: string; take: number }[] = [];
  // Five expeditions in each life (the first, the seed's own, whose trips and takes are kept as read), the ladder read
  // over all of them.
  static async lives(seeds = this.seeds): Promise<{ trips: Trip[]; ladder: Ladder;
    takes: { id: string; take: number }[]; lives: Record<string, Trip[]> }> {
    const ladders: Record<string, Ladder> = {}, lives: Record<string, Trip[]> = {};
    let first: { trips: Trip[]; takes: { id: string; take: number }[] } | undefined;
    for (const seed of seeds) {
      const trips = await this.run(5, { grammar: true }, seed);
      first ??= { trips, takes: this.takes };
      ladders[seed] = this.ladder!;
      lives[seed] = trips;
    }
    return { ...first!, ladder: QuantityLadder.median(ladders), lives };
  }
  // One expedition, from the town and back to it.
  private static async trip(s: PlaySession, n: number, seen: Map<string, Set<string>>): Promise<Trip> {
    const from = s.campaign.history.length, before = this.items(s), trip: Trip = { n, prepared: [], approach:
      { attacks: 0, traps: 0, risked: 0, avoided: 0, deepest: 0, turned: '' }, answers: [], routine: { below: 0, above: 0 }, watches: 0, rooms: 0, moves: this.zero(), presses: this.zero(), descended: false, coin: 0, items: [], fell: false,
      changed: { options: 0, world: 0, learned: 0, risk: 0, memory: 0 } };
    let options = 0;
    const began = this.watch(s);
    this.tally = trip.routine; this.pressed = trip.presses;
    if (n === 1) {
      const h = new HonestPlayer(s), at = s.campaign.history.length;
      for (let i = 0; i < 80 && s.campaign.running && this.here(s) !== 'region__s1_ud'; i++) {
        if (!await h.step().catch(() => false)) { break; }
      }
      for (const e of s.campaign.history.slice(at)) { trip.presses[this.kind(e.action)]++; }
    } else {
      options += this.offered(s, seen, 'region__s1_green');
      await this.prepare(s);
      options += this.offered(s, seen, 'region__s1_shop');
      trip.descended = await QuantityDescents.descend(s, n - 1, this as unknown as Delver);
      if (!this.here(s).startsWith('region__s1_ud')) { await this.walk(s, 'region__s1_ud'); }
    }
    options += this.offered(s, seen, 'region__s1_ud');
    trip.prepared = this.items(s).filter(k => !before.includes(k));
    await this.delve(s, trip, n - 1);
    // Home: what was found sold to Trader 1, and the wonders among it to Trader 2, who keeps the chest.
    for (const room of ['region__s1_shop', 'region__s1_taproom']) {
      await this.walk(s, room);
      await this.sell(s);
    }
    for (const e of s.campaign.history.slice(from)) { trip.moves[this.kind(e.action)]++; }
    trip.coin = this.coin(s);
    trip.watches = this.watch(s) - began;
    trip.rooms = s.campaign.world.related('been').filter(r => r.args[0] === 'party' && r.args[1]!.startsWith('region__s1_ud_'))
      .length;
    trip.items = this.items(s);
    trip.fell = !this.standing(s);
    trip.changed.options = options;
    return trip;
  }
  // The town: hurt, a pallet at the shrine; then a light, a ration and a firebomb, as the purse allows.
  private static async prepare(s: PlaySession) {
    if (this.hurt(s)) {
      await this.walk(s, 'region__s1_shrine');
      await this.act(s, this.ids(s).find(id => id.startsWith('take_lodging(')));
      // Without the coin for a pallet, the keep worked for, else a night slept rough (OR-1392's measure: a company
      // come home poor and hurt had turned back at the mouth three times running).
      for (const v of ['work_keep(', 'take_lodging(', 'camp(', 'rest']) {
        if (!this.hurt(s)) { break; }
        await this.act(s, this.ids(s).find(id => id.startsWith(v)));
      }
    }
    // A level gained is spent at once: the protagonist's strength, each companion's constitution.
    for (let i = 0; i < 6; i++) {
      const raise = this.ids(s).find(id => /^raise_quality\(region__member_party_1,strength\)/.test(id))
        ?? this.ids(s).find(id => /^raise_quality\([^,]+,constitution\)/.test(id));
      if (!raise || !await this.act(s, raise)) { break; }
    }
    await this.walk(s, 'region__s1_shop');
    for (const [kind, want] of [['torch', 2], ['rations', 1], ['oil_firebomb', 1]] as const) {
      while (this.count(s, kind) < want) {
        const buy = this.ids(s).find(id => id.startsWith('buy_item(') && id.includes(`_${kind}_`));
        if (!buy || !await this.act(s, buy)) { break; }
      }
    }
  }
  // Down below, as the delver goes: until anyone is down to half, or so many steps.
  private static async delve(s: PlaySession, trip: Trip, most: number) {
    const avoided: string[] = [];
    try { await this.down(s, trip, most, avoided); } finally {
      trip.approach.avoided = avoided.length;
      if (avoided.length && !trip.answers.includes('round')) { trip.answers.push('round'); }
    }
  }
  private static async down(s: PlaySession, trip: Trip, most: number, avoided: string[]) {
    const been = new Set<string>(), tried = new Set<string>(), sought = new Set<string>();
    const place = QuantityPlaces.place(s.campaign, 'region__s1_ud');
    for (let i = 0; i < this.steps; i++) {
      if (!s.campaign.running || !this.standing(s)) { trip.approach.turned = 'fell'; return; }
      if (this.hurt(s, 0.6)) { trip.approach.turned = 'hurt'; return; }
      const here = this.here(s);
      been.add(here);
      trip.approach.deepest = Math.max(trip.approach.deepest, this.depth(s, here));
      const next = this.next(s, { place, been, tried, most, avoided, sought });
      if (!next) { trip.approach.turned = 'nothing on'; return; }
      tried.add(next);
      if (next.startsWith('attack(')) { trip.approach.attacks++; }
      if (/^(look_closely|prod|hook)/.test(next)) { trip.approach.traps++; }
      if (next.startsWith('risk(')) { trip.approach.risked++; }
      const answer = this.answer(next);
      if (answer && !trip.answers.includes(answer)) { trip.answers.push(answer); }
      await this.act(s, next);
    }
    trip.approach.turned = 'steps';
  }
  private static next(s: PlaySession,
    at: { place?: string; been: Set<string>; tried: Set<string>; most: number; avoided: string[];
      sought: Set<string> }) {
    // Whoever is there is fought where the company's own reckoning says it would not fall (slight, fair or hard, and
    // not mortal); one it says could end a life is gone round.
    const ids = this.ids(s), c = s.campaign, attacks = ids.filter(id => id.startsWith('attack('));
    const beyond = new Set(attacks.filter(id => this.mortal(s, /^attack\(([^,)]+)/.exec(id)?.[1] ?? '')));
    at.avoided.push(...[...beyond].filter(id => !at.avoided.includes(id)));
    const fight = attacks.find(id => !beyond.has(id));
    if (fight) { return fight; }
    // In the dark, a light lit before anything else: what lies in a dark room is not seen, and a company that lit a
    // torch only once it had nowhere else to go had walked past the halls' newcomers' things where they fell.
    const light = c.world.test({ kind: 'call', name: 'benighted', args: ['party'] })
      ? ids.find(id => id.startsWith('light_item(')) : undefined;
    if (light) { return light; }
    const words = this.policy.grammar ? this.words(Journey.of(s).choices(), at.tried) : undefined;
    if (words) { return words; }
    // A pile of two finds or more taken up in one act, where the page offers it (OR-1870: never what lies in a lair).
    // (Its command is the same in every room: tried in this one, by where it was taken up.)
    const pile = ids.find(id => id.startsWith('take_pile(') && !at.tried.has(`${this.here(s)}:${id}`));
    if (pile) { at.tried.add(`${this.here(s)}:${pile}`); for (const f of this.pile(s)) { this.found.add(f); } return pile; }
    const loot = this.loot(Journey.of(s).choices(), at.tried, act => this.kindOf(s, act), act => this.guarded(s, act));
    if (loot) { this.found.add(this.itemOf(loot)); return loot; }
    // A way the page says is grave (it could be lost, what lies in wait there) is gone round, not into.
    const grave = new Set(Journey.of(s).choices().filter(x => x.grave).map(x => x.command));
    at.avoided.push(...ids.filter(id => grave.has(id) && id.startsWith('go(') && !at.avoided.includes(id)));
    const ways = ids.filter(id => id.startsWith('go(') && !grave.has(id))
      .map(id => ({ id, to: /,([^,)]+)\)$/.exec(id)?.[1] ?? '' }))
      .filter(w => QuantityPlaces.place(c, w.to) === at.place && w.to !== 'region__s1_ud' && this.depth(s, w.to) <= at.most);
    // Listened for first where a way can be listened at (the halls' sounds): one that tells of what lies in wait is
    // gone round by the grave branch above, once heard.
    const listen = this.policy.grammar ? ids.find(id => id.startsWith('listen(') && !at.tried.has(id)) : undefined;
    const ever = new Set(c.world.related('been').filter(r => r.args[0] === 'party').map(r => r.args[1]!));
    const seek = this.seek(s, { ways, ever, sought: at.sought, depth: this.depth(s, this.here(s)) });
    const on = this.onward(ways, { now: at.been, ever, depth: new Map(ways.map(w => [w.to, this.depth(s, w.to)])),
      ...listen ? { listen } : {}, ...seek ? { seek } : {} });
    if (on) { return on; }
    // A trap is risked only where the page says it would not kill.
    const deadly = new Set(Journey.of(s).choices().filter(x => /could kill/.test(x.label)).map(x => x.command));
    return ['look_closely(', 'prod(', 'hook', 'change_thing(', 'risk(', 'light_item(', ...this.policy.grammar ? ['search('] : []]
      .map(v => ids.find(id => id.startsWith(v) && !at.tried.has(id) && !grave.has(id) && !deadly.has(id)))
      .find(Boolean) ?? this.least(ways, at);
  }
  // A band that talks, which the reckoning says could end a life, is answered with words before it is gone round:
  // the answer the page gives the best odds (talking round, then a lie, then a warning, where they are as good); and
  // one that lets the company be is asked what it knows.
  static readonly odds = ['sure', 'likely', 'an even chance'];
  static words(offered: readonly { command: string; label: string }[], tried: Set<string>): string | undefined {
    const verbs = ['talk_round(', 'pass_off(', 'face_down('];
    const ask = offered.find(c => /_tells$/.test(c.command) && !tried.has(c.command));
    if (ask) { return ask.command; }
    return offered.filter(c => verbs.some(v => c.command.startsWith(v)) && this.rank(c.label) >= 0)
      .sort((a, b) => this.rank(a.label) - this.rank(b.label)
        || verbs.findIndex(v => a.command.startsWith(v)) - verbs.findIndex(v => b.command.startsWith(v)))[0]?.command;
  }
  private static rank(label: string): number { return this.odds.findIndex(o => label.includes(`· ${o}`)); }
  // What lies about is taken up (a thing found, a thing in a pack or a chest, the coins gathered), once each, but the
  // gear the company goes down with: read by the act, not its words (the page draws a find's row as "Take" under the
  // thing's name, and a policy reading "Collect" had taken up nothing but coins: OR-1620).
  // Nor what lies in the lair of one the reckoning says could end a life, while it is able and has not let the company
  // be: the king's crown, lifted from his grave while he kept to his refuge, had brought him out on the fifth
  // expedition, and the company fell.
  static loot(offered: readonly { command: string; label: string }[], tried: Set<string>,
    kind: (act: string) => string, guarded?: (act: string) => boolean): string | undefined {
    return offered.find(x => (/^(take_item|take_out)\(/.test(x.command) || x.label.startsWith('Gather up'))
      && !tried.has(x.command) && !this.kept.test(kind(x.command)) && !guarded?.(x.command))?.command;
  }
  // What a pile taken up here holds: each thing the rules call loose here (data/rules/belongings.kyr).
  private static pile(s: PlaySession): string[] {
    const w = s.campaign.world, here = this.here(s);
    return w.related('at').filter(r => r.args[1] === here
      && w.test({ kind: 'call', name: 'loose', args: [r.args[0]!, 'party', here] })).map(r => r.args[0]!);
  }
  private static guarded(s: PlaySession, act: string): boolean {
    const w = s.campaign.world, item = this.itemOf(act), where = w.one('at', item) ?? w.one('at', w.one('inside', item) ?? '');
    return !!where && w.related('lair').some(r => r.args[1] === where
      && w.test({ kind: 'call', name: 'able', args: [r.args[0]!] })
      && !w.test({ kind: 'call', name: 'tolerates', args: [r.args[0]!, 'party'] }) && this.mortal(s, r.args[0]!));
  }
  // The way on: a room never yet been in, on any expedition, deeper first (the halls' well and mourners' hall lay
  // beside the way through, and a company that took the way through each time never went in: OR-1620); else a level's
  // way through, known and unchanged (DeepKnown, OR-1448), taken in one act, not room by room; else a room not been in
  // on this one, deeper first. Where a way can be listened at, it is listened at before a room is gone into.
  // Else, before the way through, the first step toward a room of this level never been in, by rooms that have
  // (seek): the halls' well, passed by off the long gallery on the way down, had never been gone into (OR-1622).
  static onward(ways: { id: string; to: string }[],
    at: { now: Set<string>; ever: Set<string>; depth: Map<string, number>; listen?: string; seek?: string }):
    string | undefined {
    const fresh = this.deepest(ways.filter(w => !at.now.has(w.to) && !at.ever.has(w.to)), at.depth);
    if (fresh) { return at.listen ?? fresh.id; }
    if (at.seek) { return at.seek; }
    const through = ways.find(w => /^go\([^,]*_through,/.test(w.id) && !at.now.has(w.to));
    if (through) { return through.id; }
    const unseen = this.deepest(ways.filter(w => !at.now.has(w.to)), at.depth);
    return unseen ? at.listen ?? unseen.id : undefined;
  }
  // The first step toward the nearest room of the level the company is on that it has never been in, each sought
  // once an expedition: by a way offered and not grave, and so gone round where the way to it is.
  private static seek(s: PlaySession, at: { ways: { id: string; to: string }[]; ever: Set<string>; sought: Set<string>;
    depth: number }): string | undefined {
    const c = s.campaign, here = this.here(s), level = c.module.entities.find(e => e.id === here)?.space?.parent;
    const rooms = c.module.entities.filter(e => e.space?.parent === level && e.space?.kind === 'room' && !at.ever.has(e.id)
      && !at.sought.has(e.id)).map(e => e.id);
    const routes = rooms.map(r => ({ r, way: this.route(c, here, r) })).filter(x => x.way.length > 0)
      .sort((a, b) => a.way.length - b.way.length);
    for (const { r, way } of routes) {
      const step = at.ways.find(w => w.id === `go(${way[0]![0]},${way[0]![1]})`);
      if (step) { at.sought.add(r); return step.id; }
    }
    return undefined;
  }
  private static route(c: PlaySession['campaign'], from: string, to: string): [string, string][] {
    try { return Journey.way(c.world, from, to); } catch { return []; }
  }
  private static deepest(ways: { id: string; to: string }[], depth: Map<string, number>) {
    return [...ways].sort((a, b) => (depth.get(b.to) ?? 0) - (depth.get(a.to) ?? 0))[0];
  }
  static answer(id: string): Answer | undefined {
    const by: [RegExp, Answer][] = [[/^attack\(/, 'fight'], [/^listen\(/, 'listen'], [/^talk_round\(/, 'talk'],
      [/^pass_off\(/, 'lie'], [/^face_down\(/, 'threaten'], [/_tells$/, 'ask'], [/^search\(/, 'search'],
      [/^change_thing\(/, 'work'], [/^risk\(/, 'risk']];
    return by.find(([re]) => re.test(id))?.[1];
  }
  // Home: everything sold that is not a thing the company goes down with.
  private static async sell(s: PlaySession) {
    for (let i = 0; i < 20; i++) {
      // What was found below, each valuable; and what the protagonist carries that is not gear (a companion's own
      // arms are theirs).
      const ids = this.ids(s), sell = ids.find(id => id.startsWith('sell_valuable('))
        ?? ids.find(id => /^sell_ware\(/.test(id) && (id.startsWith('sell_ware(region__party_1__')
          || this.found.has(this.itemOf(id))) && !this.kept.test(this.kindOf(s, id)));
      if (!sell || !await this.act(s, sell)) { return; }
    }
  }
  // Way by way; but from a place below the company made sure, the way out in one act, and on from where it comes.
  private static async walk(s: PlaySession, to: string): Promise<void> {
    for (const [passage, room] of Journey.way(s.campaign.world, this.here(s), to)) {
      if (!s.campaign.running || !this.standing(s)) { return; }
      const out = QuantityDescents.out(s);
      if (out && await QuantityDescents.journey(s, out, this as unknown as Delver)) { return this.walk(s, to); }
      if (!await this.act(s, `go(${passage},${room})`)) { return; }
      if (this.here(s) !== room) { return; }
    }
  }
  private static async act(s: PlaySession, id?: string): Promise<CampaignEvent | undefined> {
    if (!id) { return undefined; }
    try {
      const below = this.here(s).startsWith('region__s1_ud'), from = s.campaign.history.length;
      const event = await s.leg(id, b => Promise.resolve(this.fight(b)));
      this.pressed[this.kind(id)]++;
      for (const e of s.campaign.history.slice(from)) {
        if (['traversal', 'administration'].includes(this.kind(e.action))) { this.tally[below ? 'below' : 'above']++; }
      }
      return event;
    } catch { return undefined; }
  }
  // A fight fought by the company's own tactics, and run from once one of the company is down to a third.
  static readonly fled = { n: 0 };
  private static fight(b: Battle) {
    const legal = b.legalCommands(), flee = legal.find(c => c.ability === 'flee');
    const low = b.state.combatants.some(f => f.team === 'fighters' && f.hp > 0 && f.hp < f.maxHp / 3);
    if (flee && low) { this.fled.n++; return flee; }
    return Tactics.choose(b.state, b.plain(legal));
  }
  // What the company knows, holds and has done, and the world round it, at a return.
  static snapshot(s: PlaySession) {
    const w = s.campaign.world, facts = new Set<string>();
    for (const name of w.module.relations.map(r => r.name)) {
      for (const r of w.related(name)) { facts.add(`${name}(${r.args.join(',')})`); }
    }
    return { facts, bands: this.bands(s) };
  }
  // What changed between two returns, each by a stated list: the world (who is dead, a thing's state, where a thing
  // or a band is, what is for sale, what is opened or searched, what is stale), facts learned, the risk below (bands
  // able in the deep place), and what people remember of the company (gratitude, tolerance, help, a word said or told).
  static readonly world = /^(dead|state|at|forSale|unopened|searched|stale|peaceable)\(/;
  static readonly memory =
    /^(grateful|tolerates|helpedBy|toldBy|witnessed|hostile|betrayed|paidUp|[\w]+__said_[\w]+|[\w]+__told)\(/;
  static compare(a: ReturnType<typeof QuantityExpeditions.snapshot>, b: typeof a) {
    const changed = [...b.facts].filter(f => !a.facts.has(f)).concat([...a.facts].filter(f => !b.facts.has(f)));
    const company = /\(party\b|region__member_|region__party_|_person\b/;
    // The world of the loop: the reference town and the dead place under its woods (region__s1_), not the country's
    // comings and goings elsewhere.
    return { world: changed.filter(f => this.world.test(f) && !company.test(f) && f.includes('region__s1_')).length,
      learned: [...b.facts].filter(f => f.startsWith('knows(party,') && !a.facts.has(f)).length,
      risk: Math.abs(b.bands - a.bands),
      memory: [...b.facts].filter(f => !a.facts.has(f) && this.memory.test(f)).length };
  }
  // The options newly legal at a place since the company was last there (its commands, item ids aside).
  private static offered(s: PlaySession, seen: Map<string, Set<string>>, place: string): number {
    if (this.here(s) !== place) { return 0; }
    // The company's own things come and go as it carries them: what is offered for them is not a new option.
    // Nor is the hour's (waiting for light or dark), nor the same option again for each member of the company or each
    // of a ware's stock.
    const own = /^(light_item|douse|put_item|take_item|take_out|equip_item|transfer_item|give_item|sell_ware|wait_for)/;
    const now = new Set(this.ids(s).filter(id => !own.test(id))
      .map(id => id.replace(/,?(region|origin)__member_\w+/g, '').replace(/_\d+\b/g, '')));
    const was = seen.get(place);
    seen.set(place, new Set([...was ?? [], ...now]));
    return was ? [...now].filter(id => !was.has(id)).length : 0;
  }
  private static bands(s: PlaySession): number {
    const c = s.campaign;
    return c.module.entities.filter(e => e.type === 'group' && e.id.startsWith('region__s1_ud_')
      && c.world.test({ kind: 'call', name: 'able', args: [e.id] })).length;
  }
  // The rows the page offers, as the page's journey reads them from its screen (never asked for outside the frame).
  private static ids(s: PlaySession): string[] { return Journey.of(s).choices().map(c => c.command); }
  private static here(s: PlaySession): string { return s.campaign.world.one('at', 'party') ?? ''; }
  static tally = { below: 0, above: 0 }; static pressed: Record<Kind, number> = this.zero();
  private static watch(s: PlaySession): number {
    return s.campaign.world.number({ kind: 'call', name: 'watch', args: ['clock'] });
  }
  private static coin(s: PlaySession): number {
    return s.campaign.world.number({ kind: 'call', name: 'quantity', args: ['party', 'gold'] });
  }
  private static items(s: PlaySession): string[] {
    const w = s.campaign.world;
    return w.related('ownedItem').filter(r => /region__member_party|region__party/.test(r.args[1]!) || r.args[1] === 'party')
      .map(r => w.one('itemKind', r.args[0]!) ?? r.args[0]!).sort();
  }
  private static count(s: PlaySession, kind: string): number { return this.items(s).filter(k => k === kind).length; }
  // The thing an act is about (its first argument), and its kind.
  private static itemOf(act: string): string { return /^\w+\(([^,)]+)/.exec(act)?.[1] ?? ''; }
  private static kindOf(s: PlaySession, act: string): string {
    const item = this.itemOf(act);
    return s.campaign.world.one('itemKind', item) ?? (item.includes('__') ? item.replace(/^.*__/, '') : '');
  }
  // What the company took up below, sold at home as its own.
  static found = new Set<string>();
  private static depth(s: PlaySession, room: string): number {
    const level = s.campaign.module.entities.find(e => e.id === room)?.space?.parent;
    const levels = s.campaign.module.entities.filter(e => e.space?.kind === 'level' && e.id.startsWith('region__s1_ud'));
    return Math.max(0, levels.findIndex(e => e.id === level));
  }
  // Else the way to the room of the place been in fewest times, once from each room: back toward what is unseen.
  private static least(ways: { id: string; to: string }[], at: { been: Set<string>; tried: Set<string> }) {
    const way = ways.find(w => !at.tried.has(w.id));
    return way?.id;
  }
  private static mortal(s: PlaySession, group: string): boolean {
    const r = DangerSense.reckon(s.campaign, group);
    return !!r && (r.mortal === true || r.danger === 'grave' || r.danger === 'deadly');
  }
  private static standing(s: PlaySession): boolean {
    const c = s.campaign;
    return c.readout.creatures.some(k => c.readout.partyIds.includes(k.id) && k.state.hp > 0);
  }
  // Whether any of the company still standing is hurt: one fallen below is not hurt, and had held the company at the
  // mouth on every expedition after (s1, the mine's crossing).
  private static hurt(s: PlaySession, below = 1): boolean {
    const c = s.campaign;
    return c.readout.creatures.some(k => c.readout.partyIds.includes(k.id) && k.state.hp > 0
      && k.state.hp < k.base.maxHp * below);
  }
  private static zero(): Record<Kind, number> {
    return { decision: 0, consequence: 0, traversal: 0, recovery: 0, administration: 0, exposition: 0 };
  }
}

if (import.meta.main) {
  const grammar = !process.argv.includes('--before'), at = process.argv.indexOf('--seed');
  const seed = at > 0 ? process.argv[at + 1]! : QuantityExpeditions.seed;
  const n = Number(process.argv[process.argv.indexOf('--trips') + 1]) || 5;
  for (const t of await QuantityExpeditions.run(n, { grammar }, seed)) { console.log(JSON.stringify(t)); }
  console.log(JSON.stringify({ takes: QuantityExpeditions.takes, ladder: QuantityExpeditions.ladder?.coin }));
}
