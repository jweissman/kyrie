import type { Campaign } from '../campaign/campaign';
import type { Call, Module, Objective, Operator, Predicate } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import type { PlayerView } from './player-view';
import { Undertakings } from './undertakings';

// Which of the acts offered now advance the aim followed (see Glance): what it waits on, made so or unmade by them.
export class AimAdvances {
  // What, done, changes what the aim followed waits on: its effects assert or retract, or change a measure, of a
  // relation its condition reads (telling the drover's wife what was found, told(wife); giving the brothers' letter,
  // expects(priest, party)). Where the company goes is not it: every way asserts at.
  // Matched call by call, not by a relation's name: knows(party, told) is made so by being told what is out in the
  // country round, not by everything that teaches the company anything (a bed at the inn, its talk overheard, had
  // been drawn as the debt's); a rule's own unknowns (?i) stand for anything.
  // (Of another aim held, where one is given: what the talk sets apart as weighty, see TalkWeight.)
  static of(campaign: Campaign, rows: ReturnType<typeof PlayerView.choices>,
    def = Undertakings.followed(campaign)): Set<string> {
    if (!def) { return new Set(); }
    // Not what the world holds already (more herbs for a mother keeping feverwort, led as the aim's: round 7, L 25).
    // An assert advances what does not hold yet, a retract what does: the letter given to the priest is the brothers'
    // expecting no longer, and the filter on what holds had lost the order's thread at the shrine (the owner, 12
    // November).
    const waited = this.waits(campaign.module, def);
    const calls = [...waited, ...this.hidden(campaign, waited), ...this.taught(campaign, waited)];
    const coin = this.short(def);
    if (!calls.length && !coin) { return new Set(); }
    // An aim short of coin is advanced by selling (the debtor home with the hold's music box, at Tuck's, who buys such
    // things, had been led to ask him every question he knew: Mission 20); the purse is otherwise never waited on.
    // Nor ever by spending (what the debt carries would sell; a ten-foot pole bought is not that).
    return new Set(rows.filter(r => !r.action.movement && !/^buy_/.test(r.action.schema ?? '')
      && (this.brings(r.action).some(c => calls.some(x => this.match(c, x) && this.held(campaign, x) === (c.kind === 'retract')))
        || (coin && /^sell_/.test(r.action.schema ?? '')))).map(r => r.choice.id));
  }
  // Where what the aim followed waits on lies hidden, to be searched for: the places, while it is still to be found.
  // From anywhere else the way there is the aim's (see Glance.ways): inside Murkweard, the cross at its door still to
  // be found outside, the gold had gone up onto the wall-walk (round 10, S).
  static sought(campaign: Campaign): string[] {
    const def = Undertakings.followed(campaign);
    if (!def) { return []; }
    return this.hidden(campaign, this.waits(campaign.module, def)).map(c => c.args[1]!);
  }
  // A thing the aim waits on that is hidden until something is found is first searched for where it is found: the
  // dead man's box, under the stone at the keep's door, had left the gold to go on into the keep and be lost there
  // (round 9, P).
  private static hidden(campaign: Campaign, calls: Call[]): Call[] {
    const w = campaign.world, things = calls.filter(c => c.name === 'carries' && !c.args.at(-1)!.startsWith('?'))
      .map(c => c.args.at(-1)!);
    const facts = w.related('revealedBy').filter(r => things.includes(r.args[0]!)).map(r => r.args[1]!)
      .filter(f => !w.test(ModuleWriter.call('knows', 'party', f)));
    return (campaign.module.observations ?? []).filter(o => o.teaches && facts.includes(o.teaches) && o.place)
      .map(o => ModuleWriter.call('searched', '?g', o.place!));
  }
  // A fact the aim waits on that is learned by seeing something come about (the marks on Neblalac's pillar read, and
  // so the Water-Wardens' history known: an observation whose condition is the pillar's state) is waited on through
  // what brings that about: reading the marks had been left unmarked, and the gold gone on to an empty sluice-niche
  // (round 11, T).
  private static taught(campaign: Campaign, calls: Call[]): Call[] {
    const w = campaign.world, facts = calls.filter(c => c.name === 'knows' && !c.args.at(-1)!.startsWith('?'))
      .map(c => c.args.at(-1)!).filter(f => !w.test(ModuleWriter.call('knows', 'party', f)));
    return (campaign.module.observations ?? []).filter(o => o.teaches && facts.includes(o.teaches) && o.when)
      .flatMap(o => this.atoms(o.when!)).filter(c => c.name !== 'knows' && !w.test(c));
  }
  // The calls a condition needs to hold, not under a "not".
  private static atoms(e: Predicate): Call[] {
    if (e.kind === 'call') { return [e]; }
    if (e.kind === 'and') { return [...this.atoms(e.left), ...this.atoms(e.right)]; }
    return [];
  }
  // A thing taken is what the aim waits on only where it names that thing: an aim that reads whatever is carried (the
  // debt, laden or not) was advanced by every flower gathered on a green.
  // Nor is what the aim waits on through a rule's pattern of unknowns alone (inside(?x, ?y), read by the debt's laden):
  // every flower gathered had matched it.
  private static match(c: { call: Call; thing?: string }, x: Call): boolean {
    if (!x.args.some(a => !a.startsWith('?'))) { return false; }
    return c.thing ? x.name === c.call.name && x.args.at(-1) === c.thing : this.meets(c.call, x);
  }
  // What an act brings about: its own changes, and what its resolution makes so. A thing taken is carried, which its
  // changes do not say (they take it from where it lay): the dead man's box, found, had not been led as the aim's next
  // step, and the gold went on into the cave and was lost there (the owner's player report, 12 November).
  private static brings(action: Operator): { kind: string; call: Call; thing?: string }[] {
    const made = (action.success ?? []).flatMap(c => c.call ? [{ kind: c.kind, call: c.call }] : []);
    // Grounded, the resolution names the thing itself.
    const find = action.resolve?.name === 'acquire' ? action.resolve.args[0] : undefined;
    // A fight won leaves the foe unable, and dead: the rats the corn-store job waits on (`Rule … when not
    // able(rats)`), fought in front of the company, had not been the aim's, and the gold went back out to the empty
    // cellar the aim's words name (M21's playability list, PL-11).
    const foe = action.resolve?.name === 'combat' ? action.resolve.args[0] : undefined;
    return [...made, ...find ? [{ kind: 'assert', thing: find,
      call: ModuleWriter.call('carries', action.actor ?? action.bindings?.actor ?? '?a', find) }] : [],
    ...foe ? [{ kind: 'retract', call: ModuleWriter.call('able', foe) }, { kind: 'assert', call: ModuleWriter.call('dead', foe) }]
      : []];
  }
  // Whether the aim followed is short of coin: a find that is spoils (valuable, and nobody's) then pays toward it (see
  // Affordances, opened).
  static wants(campaign: Campaign): boolean {
    const def = Undertakings.followed(campaign);
    return !!def && this.short(def);
  }
  private static short(def: Objective): boolean {
    const read: Call[] = [];
    this.reads(def.when, read);
    return read.some(c => c.name === 'quantity' && c.args[1] === 'gold');
  }
  // What an aim waits on, call by call, and a rule away what makes it so (the herbs given the fever's mother are
  // kept, and a rule doses the child); never where the company is, nor what is in the purse, which every way and
  // every torch changes. Read once for each aim of a module.
  private static readonly waiting = new WeakMap<Module, Map<string, Call[]>>();
  static waits(module: Module, def: Objective): Call[] {
    const kept = this.waiting.get(module) ?? this.waiting.set(module, new Map()).get(module)!;
    if (kept.has(def.id)) { return kept.get(def.id)!; }
    const wanted: Call[] = [], made: Call[] = [];
    this.reads(def.when, wanted);
    // A rule makes so what it asserts, and what it teaches: the ruts followed, a rule tells the cart found (what the
    // father's aim waits on), and following them had been the aim's only by being a thing at the road it names.
    // Not a rule for what it does to the purse or where anyone is, which every way and every reward changes: every rule
    // that pays a coin had been the debt's (the old man brought home pays one), and asking him along had been the
    // debt's gold at the inn (M21's playability list, PL-21).
    const read = wanted.filter(w => !['at', 'quantity'].includes(w.name));
    for (const rule of module.rules ?? []) {
      const taught = rule.teaches ? [ModuleWriter.call('knows', '?k', rule.teaches)] : [];
      const brought = [...rule.effects.flatMap(c => c.call ? [c.call] : []), ...taught];
      if (brought.some(c => read.some(w => this.meets(c, w)))) { this.reads(rule.when, made); }
    }
    const calls = [...wanted, ...made].filter(c => !['at', 'quantity'].includes(c.name));
    kept.set(def.id, calls);
    return calls;
  }
  private static meets(a: Call, b: Call): boolean {
    return a.name === b.name && a.args.length === b.args.length
      && a.args.every((x, i) => x === b.args[i] || x.startsWith('?') || b.args[i]!.startsWith('?'));
  }
  private static reads(p: Predicate, into: Call[]) {
    ModuleWriter.conditionCalls(p, call => { into.push(call); return call; });
  }
  private static held(campaign: Campaign, c: Call): boolean {
    const w = campaign.world;
    return w.relates(c.name) && w.related(c.name).some(r => this.meets(r, c));
  }
}
