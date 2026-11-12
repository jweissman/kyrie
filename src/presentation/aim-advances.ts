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
  static of(campaign: Campaign, rows: ReturnType<typeof PlayerView.choices>): Set<string> {
    const def = Undertakings.followed(campaign); if (!def) { return new Set(); }
    // Not what the world holds already (more herbs for a mother keeping feverwort, led as the aim's: round 7, L 25).
    // An assert advances what does not hold yet, a retract what does: the letter given to the priest is the brothers'
    // expecting no longer, and the filter on what holds had lost the order's thread at the shrine (the owner, 12
    // November).
    const calls = this.waits(campaign.module, def), coin = this.short(def);
    if (!calls.length && !coin) { return new Set(); }
    // An aim short of coin is advanced by selling (the debtor home with the hold's music box, at Tuck's, who buys such
    // things, had been led to ask him every question he knew: Mission 20); the purse is otherwise never waited on.
    // Nor ever by spending (what the debt carries would sell; a ten-foot pole bought is not that).
    return new Set(rows.filter(r => !r.action.movement && !/^buy_/.test(r.action.schema ?? '')
      && (this.brings(r.action).some(c => calls.some(x => this.match(c, x) && this.held(campaign, x) === (c.kind === 'retract')))
        || (coin && /^sell_/.test(r.action.schema ?? '')))).map(r => r.choice.id));
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
    return find ? [...made, { kind: 'assert', thing: find,
      call: ModuleWriter.call('carries', action.actor ?? action.bindings?.actor ?? '?a', find) }] : made;
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
  private static waits(module: Module, def: Objective): Call[] {
    const kept = this.waiting.get(module) ?? this.waiting.set(module, new Map()).get(module)!;
    if (kept.has(def.id)) { return kept.get(def.id)!; }
    const wanted: Call[] = [], made: Call[] = [];
    this.reads(def.when, wanted);
    for (const rule of module.rules ?? []) {
      if (rule.effects.some(c => !!c.call && wanted.some(w => this.meets(c.call!, w)))) { this.reads(rule.when, made); }
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
