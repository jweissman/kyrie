import { PlayTool } from '../../src/cli/play-tool';
import { Journey } from '../../src/session/journey';
import type { PlaySession } from '../../src/session/play-session';
import type { CampaignEvent } from '../../src/campaign/campaign';
import { HonestPlayer } from '../../test/support/honest-player';
import { QuantityPlaces } from './places';
import { DangerSense } from '../../src/presentation/danger-sense';
import type { Battle } from '../../src/arena';
import { Tactics } from '../../src/tactics';

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
  moves: Record<Kind, number>; coin: number; items: string[]; fell: boolean;
  changed: { options: number; world: number; learned: number; risk: number; memory: number };
}
export class QuantityExpeditions {
  static readonly seed = 's0';
  static readonly steps = 30;
  static readonly kept = /^(torch|candle|rations|oil_firebomb|longsword|chainmail|pole|rope|lamp_oil|lantern)$/;
  static kind(id: string): Kind {
    if (/^(go\(|travel:)/.test(id)) { return 'traversal'; }
    if (/^(wait|take_lodging|work_keep|camp\(|rest|bed|.*_heal)/.test(id)) { return 'recovery'; }
    if (/^(light_item|douse|put_item|take_item|take_out|equip_item|give_item|buy_item|buy_goods|haggle)/.test(id)) {
      return 'administration';
    }
    if (/^(sell_ware|sell_)/.test(id) || /_paid\b|_reward/.test(id)) { return 'consequence'; }
    if (/^(talk_to|look_closely|listen|read|search|study|examine|ask\()/.test(id) || !id.includes('(')) {
      return 'exposition';
    }
    return 'decision';
  }
  static policy: Policy = { grammar: true };
  static async run(trips = 5, policy: Policy = { grammar: true }): Promise<Trip[]> {
    this.policy = policy;
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', this.seed, '--as', 'human/warrior/Wenna',
      '--opening', 'none', '--origin', 'wanderer']));
    const s = journey.session, out: Trip[] = [];
    let last = this.snapshot(s);
    const seen = new Map<string, Set<string>>();
    for (let n = 1; n <= trips && s.campaign.running && this.standing(s); n++) {
      const trip = await this.trip(s, n, seen), now = this.snapshot(s);
      trip.changed = { ...trip.changed, ...this.compare(last, now) };
      out.push(trip);
      last = now;
    }
    return out;
  }
  // One expedition, from the town and back to it.
  private static async trip(s: PlaySession, n: number, seen: Map<string, Set<string>>): Promise<Trip> {
    const from = s.campaign.history.length, before = this.items(s), trip: Trip = { n, prepared: [], approach:
      { attacks: 0, traps: 0, risked: 0, avoided: 0, deepest: 0, turned: '' }, answers: [], moves: this.zero(), coin: 0, items: [], fell: false,
      changed: { options: 0, world: 0, learned: 0, risk: 0, memory: 0 } };
    let options = 0;
    if (n === 1) {
      const h = new HonestPlayer(s);
      for (let i = 0; i < 80 && s.campaign.running && this.here(s) !== 'region__s1_ud'; i++) {
        if (!await h.step().catch(() => false)) { break; }
      }
    } else {
      options += this.offered(s, seen, 'region__s1_green');
      await this.prepare(s);
      options += this.offered(s, seen, 'region__s1_shop');
      await this.walk(s, 'region__s1_ud');
    }
    options += this.offered(s, seen, 'region__s1_ud');
    trip.prepared = this.items(s).filter(k => !before.includes(k));
    await this.delve(s, trip, n - 1);
    await this.walk(s, 'region__s1_shop');
    await this.sell(s);
    for (const e of s.campaign.history.slice(from)) { trip.moves[this.kind(e.action)]++; }
    trip.coin = this.coin(s);
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
    const been = new Set<string>(), tried = new Set<string>();
    const place = QuantityPlaces.place(s.campaign, 'region__s1_ud');
    for (let i = 0; i < this.steps; i++) {
      if (!s.campaign.running || !this.standing(s)) { trip.approach.turned = 'fell'; return; }
      if (this.hurt(s, 0.6)) { trip.approach.turned = 'hurt'; return; }
      const here = this.here(s);
      been.add(here);
      trip.approach.deepest = Math.max(trip.approach.deepest, this.depth(s, here));
      const next = this.next(s, { place, been, tried, most, avoided });
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
    at: { place?: string; been: Set<string>; tried: Set<string>; most: number; avoided: string[] }) {
    // Whoever is there is fought where the company's own reckoning says it would not fall (slight, fair or hard, and
    // not mortal); one it says could end a life is gone round.
    const ids = this.ids(s), c = s.campaign, attacks = ids.filter(id => id.startsWith('attack('));
    const beyond = new Set(attacks.filter(id => this.mortal(s, /^attack\(([^,)]+)/.exec(id)?.[1] ?? '')));
    at.avoided.push(...[...beyond].filter(id => !at.avoided.includes(id)));
    const fight = attacks.find(id => !beyond.has(id));
    if (fight) { return fight; }
    const words = this.policy.grammar ? this.words(Journey.of(s).choices(), at.tried) : undefined;
    if (words) { return words; }
    // What lies about is taken up (a thing found, the coins gathered), once each.
    const loot = Journey.of(s).choices().find(x => /^(Collect|Gather up)/.test(x.label) && !at.tried.has(x.command)
      && !this.kept.test(x.label.replace(/^Collect (an? )?/, '').replace(/ for \w+$/, '').replace(/ /g, '_')));
    if (loot) { return loot.command; }
    // A way the page says is grave (it could be lost, what lies in wait there) is gone round, not into.
    const grave = new Set(Journey.of(s).choices().filter(x => x.grave).map(x => x.command));
    at.avoided.push(...ids.filter(id => grave.has(id) && id.startsWith('go(') && !at.avoided.includes(id)));
    const ways = ids.filter(id => id.startsWith('go(') && !grave.has(id))
      .map(id => ({ id, to: /,([^,)]+)\)$/.exec(id)?.[1] ?? '' }))
      .filter(w => QuantityPlaces.place(c, w.to) === at.place && w.to !== 'region__s1_ud' && this.depth(s, w.to) <= at.most);
    const unseen = ways.filter(w => !at.been.has(w.to))
      .sort((a, b) => this.depth(s, b.to) - this.depth(s, a.to));
    // Listened for first where a way can be listened at (the halls' sounds): one that tells of what lies in wait is
    // gone round by the grave branch above, once heard.
    const listen = this.policy.grammar ? ids.find(id => id.startsWith('listen(') && !at.tried.has(id)) : undefined;
    if (unseen[0] && listen) { return listen; }
    if (unseen[0]) { return unseen[0].id; }
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
        ?? ids.find(id => /^sell_ware\(region__party_1__/.test(id) && !this.kept.test(this.kindOf(s, id)));
      if (!sell || !await this.act(s, sell)) { return; }
    }
  }
  private static async walk(s: PlaySession, to: string) {
    for (const [passage, room] of Journey.way(s.campaign.world, this.here(s), to)) {
      if (!s.campaign.running || !this.standing(s)) { return; }
      if (!await this.act(s, `go(${passage},${room})`)) { return; }
      if (this.here(s) !== room) { return; }
    }
  }
  private static async act(s: PlaySession, id?: string): Promise<CampaignEvent | undefined> {
    if (!id) { return undefined; }
    try {
      return await s.leg(id, b => Promise.resolve(this.fight(b)));
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
  private static coin(s: PlaySession): number {
    return s.campaign.world.number({ kind: 'call', name: 'quantity', args: ['party', 'gold'] });
  }
  private static items(s: PlaySession): string[] {
    const w = s.campaign.world;
    return w.related('ownedItem').filter(r => /region__member_party|region__party/.test(r.args[1]!) || r.args[1] === 'party')
      .map(r => w.one('itemKind', r.args[0]!) ?? r.args[0]!).sort();
  }
  private static count(s: PlaySession, kind: string): number { return this.items(s).filter(k => k === kind).length; }
  private static kindOf(s: PlaySession, sell: string): string {
    const item = /^sell_ware\(([^,]+),/.exec(sell)?.[1] ?? '';
    return s.campaign.world.one('itemKind', item) ?? item.replace(/^.*__/, '');
  }
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
  private static hurt(s: PlaySession, below = 1): boolean {
    const c = s.campaign;
    return c.readout.creatures.some(k => c.readout.partyIds.includes(k.id) && k.state.hp < k.base.maxHp * below);
  }
  private static zero(): Record<Kind, number> {
    return { decision: 0, consequence: 0, traversal: 0, recovery: 0, administration: 0, exposition: 0 };
  }
}

if (import.meta.main) {
  const grammar = !process.argv.includes('--before');
  for (const t of await QuantityExpeditions.run(5, { grammar })) { console.log(JSON.stringify(t)); }
}
