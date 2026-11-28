import type { Call, Change, Module, Operator, Predicate } from '../lang/module';
import { World } from '../lang/world';
import { ModuleWriter } from '../lang/module-writer';
import { EntityIndex } from '../lang/entity-index';
import { KeptReading, type Kept } from '../lang/kept-reading';
import { EffectShadows } from '../ports/effects';

// What the company would know after an act that it does not know now (OR-206; BRIEF §5A: one Outcome per drawn row,
// the first slice of it, knowledge): read once from the act itself, by the cheap step (outcome-cost-study.md), never
// by trying it. Its success's effects applied to the world as it stands (World.apply: the world is immutable, so
// nothing of the campaign is touched and nothing is kept), and then the world's teaching read once over the world
// they make: a fact its success asserts the company knows, that it does not make so itself (knowing what it has just
// done is its record, not learning: PL-03); and a fact an observation or a rule teaches (`Observe … teaches`, `Rule …
// says "…" teaches`) whose condition the act's effects make hold where it did not, where the company would perceive
// it. No roll is made: an act with a check is read on its success, the contingency its row says ("an even chance ·
// one try"); no time passes (what an hour brings anyway is the hour's, not the act's: the old woman's riddle, ten
// minutes on the green, had been counted as teaching what the town's dogs taught meanwhile); and nothing the rules
// would then do is followed further than the one pass. Kept for each world and act.
// It had been two readings (ChoiceGrouping.teaches, a `knows` asserted; Teaching.shows, an observation waited on, by
// its calls), neither of which read a rule's teaching: the harbour lantern made whole, which Eluned Cadwgan's rule
// answers with where her trade is to be learned, was taught and never blue (the census, the mage's walk, five turns).
export class Outcome {
  private static readonly kept = new WeakMap<World, Map<string, readonly string[]>>();
  private static readonly waiting = new WeakMap<Module, Map<string, Teacher[]>>();
  // The facts the act would teach the actor, in the order the world's teaching gives them; none where nothing would.
  static taught(module: Module, world: World, action: Operator, actor: string): readonly string[] {
    return this.read(module, world, action, { actor, foresees: this.everything });
  }
  // As the company could foresee it (Knowing.taught, the knowledge boundary's door: OR-527): a teaching woken by the
  // act counts only where everything else its condition reads is the company's to tell (Knowing.foresees). Lifting a
  // chest's lid had been "to learn" where a letter lay inside it unseen, and plain where none did, so that the row
  // told what the chest held (test/small/knowledge-noninterference).
  static foreseen(world: World, action: Operator, company: Foreseeing): readonly string[] {
    return this.read(world.module, world, action, company);
  }
  // What the world holds, foreseen whole: the authoritative prediction, which the diagnostic tools check after.
  private static readonly everything = () => true;
  private static read(module: Module, world: World, action: Operator, company: Foreseeing): readonly string[] {
    const memo = this.kept.get(world) ?? new Map<string, readonly string[]>();
    this.kept.set(world, memo);
    const actor = action.bindings?.actor ?? company.actor;
    const key = `${actor}|${action.id}|${company.foresees === this.everything ? 'all' : 'foreseen'}`;
    const had = this.carrying ? memo.get(key) : undefined;
    if (had) { return had; }
    // Only what the company would be told it knows: a fact with words (one without is a mark an author keeps, the
    // brother knelt by the cart: CompanyKnowledge).
    const byId = EntityIndex.of(module.entities).byId;
    const read = this.told.bind(this, world, action, { actor, company, byId });
    // Off (the screen's oracle), worked out afresh at every ask, neither kept for the world nor carried.
    if (!this.carrying) { return read(); }
    const out = company.sight === undefined ? read() : this.carried(world, key, company.sight, read);
    memo.set(key, out);
    return out;
  }
  // What an act would teach as the company foresees it, carried from one world of its line to the next while nothing it
  // read has been written (see KeptReading: the world as it stands and as the act would leave it, both of one line)
  // and the company sees and has been where it saw and had been (sight): about fifty acts a turn were read again for
  // every world, though an act writes what few of them read (OR-864). The last `lately` are kept, a turn's acts and
  // more (each holds what of the world it picked: 512 had kept some 48 KB a turn more on the golden walk).
  static carrying = true;
  static readonly lately = 64;
  private static readonly carriedBy = new Map<string, Kept<readonly string[]> & { sight: string; shape: string;
    module: Module; }>();
  private static carried(world: World, key: string, sight: string, read: () => readonly string[]): readonly string[] {
    const m = world.module, shape = `${m.entities.length}.${m.rules?.length ?? 0}.${m.observations?.length ?? 0}`;
    const was = this.carriedBy.get(key);
    this.carriedBy.delete(key);
    if (was && was.sight === sight && was.shape === shape && was.module === m && KeptReading.holds(world, was)) {
      this.carriedBy.set(key, was);
      return was.value;
    }
    const now = KeptReading.read(world, read);
    if (now.kept) {
      this.carriedBy.set(key, { ...now.kept, sight, shape, module: m });
      if (this.carriedBy.size > this.lately) { this.carriedBy.delete(this.carriedBy.keys().next().value!); }
    }
    return now.value;
  }
  private static told(world: World, action: Operator, at: { actor: string; company: Foreseeing;
    byId: ReadonlyMap<string, { name?: string }> }): readonly string[] {
    // A spell's world changes, given ahead by the rules domain's lowering, as its success's are (OR-1101).
    // What of it is due as the world stands, each guarded change by its guard (World.due).
    const success = world.due([...action.success ?? [], ...this.lowered(world, action)]);
    return this.teaching(world, success, at.actor, at.company).filter(f => !!at.byId.get(f)?.name);
  }
  private static teaching(world: World, success: readonly Change[], actor: string, company: Foreseeing):
    readonly string[] {
    const made = new Set(success.filter(c => c.kind === 'assert' && !this.learnt.has(c.call.name)).flatMap(c => c.call.args));
    const told = success.flatMap(c => c.kind === 'assert' && c.call.name === 'knows' && c.call.args[0] === actor
      && !made.has(c.call.args[1] ?? '') && !this.known(world, actor, c.call.args[1] ?? '') ? [c.call.args[1]!] : []);
    const { teachers, keys } = this.woken(world.module, success, actor);
    if (!teachers.length) { return told; }
    let after: World;
    try { after = world.apply([...success]); } catch { return told; }
    const shown = teachers.filter(t => !this.known(world, actor, t.fact) && (!t.place || after.test(ModuleWriter.call('at', actor, t.place)))
      && this.calls(t.when).every(c => keys.has(this.key(c)) || company.foresees(c))
      && after.test(t.when) && !world.test(t.when)).map(t => t.fact);
    return [...new Set([...told, ...shown])];
  }
  // What an act that invokes an ability (Resolve invoke: a spell cast between fights, at one of the company or at a
  // thing) would write to the world, ahead of it, as the rules domain lowers its effects (the effects port: OR-1101).
  static lowered(world: World, action: Operator): Change[] {
    const resolve = action.resolve, actor = resolve?.name === 'invoke'
      ? resolve.args[1] : action.bindings?.actor ?? action.actor;
    return resolve?.name === 'invoke' && actor
      ? EffectShadows.lower(resolve.args[0]!, { world, actor, target: resolve.args[2] ?? '' }) : [];
  }
  // Who it was learned from, or heard of, or read in: the learning's own record (see WorldConstructs.learnt; reading
  // a notice, `learnedFrom`, had stopped counting as learning when PL-03 began reading the record: PL-16). What an act
  // asserts of these is not something it makes.
  static readonly learnt: ReadonlySet<string> = new Set(['knows', 'toldBy', 'heard', 'learnedFrom', 'readIn']);
  private static known(world: World, actor: string, fact: string): boolean {
    return world.test(ModuleWriter.call('knows', actor, fact));
  }
  // The teaching an act's effects could wake: those whose condition reads a fact the act asserts or retracts, and
  // whose condition is a plain one (no variable to bind: those are read as the world's tick reads them, not here).
  // Not by where the company would then stand: a way taken is read for what it says it teaches, not for what arriving
  // shows, which is the place's, met there (the way's own colour is the route's: the cost study's moves, the most of a
  // turn's acts and two thirds of this reading's time when they were read so).
  private static woken(module: Module, success: readonly Change[], actor: string):
    { teachers: Teacher[]; keys: Set<string> } {
    const index = this.index(module), moved = `at(${actor})`;
    const keys = new Set(success.flatMap(c => c.kind === 'assert' || c.kind === 'retract' ? [this.key(c.call)] : [])
      .filter(k => k !== moved));
    return { teachers: [...new Set([...keys].flatMap(n => index.get(n) ?? []))], keys };
  }
  private static index(module: Module): Map<string, Teacher[]> {
    const had = this.waiting.get(module);
    if (had) { return had; }
    const out = new Map<string, Teacher[]>();
    const teachers: Teacher[] = [
      ...(module.observations ?? []).flatMap(o => o.teaches ? [{ when: o.when, fact: o.teaches, place: o.place }] : []),
      ...(module.rules ?? []).flatMap(r => r.teaches ? [{ when: r.when, fact: r.teaches,
        ...r.place ? { place: r.place } : {} }] : [])].filter(t => !this.variable(t.when));
    for (const t of teachers) {
      for (const key of new Set(this.calls(t.when).map(c => this.key(c)))) { out.set(key, [...out.get(key) ?? [], t]); }
    }
    this.waiting.set(module, out);
    return out;
  }
  // A call by its relation and what it is about (its first argument): state(lantern), not every state in the world, so
  // that an act wakes only the teaching that reads what it changes.
  private static key(c: Call): string { return `${c.name}(${c.args[0] ?? ''})`; }
  // Every call a condition reads, under a not as well (what an act retracts can make a `not` hold).
  private static calls(p: Predicate): Call[] {
    return p.kind === 'call' ? [p] : p.kind === 'not' ? this.calls(p.value)
      : p.kind === 'and' || p.kind === 'or' ? [...this.calls(p.left), ...this.calls(p.right)] : [];
  }
  private static variable(p: Predicate): boolean { return World.variables(p); }
}
interface Teacher { when: Predicate; fact: string; place?: string }
// Who would learn, and what of a condition it could tell (see Knowing).
// sight: what the company sees and has been, said in words, by which what it would learn is carried from one world to
// the next (see Outcome.carried); none, never carried.
export interface Foreseeing { actor: string; foresees(call: Call): boolean; readonly sight?: string }
