import type { Module, Predicate, WorldRule } from '../lang/module';
import { EndingOrder } from '../lang/ending-order';
import { ModuleWriter } from '../lang/module-writer';
import type { CampaignLint } from './campaign-lint';

// A conjunct of a condition: an atom (its JSON) and whether it is to hold.
type Literal = [string, boolean];
// A step: its fact, its rules, each rule's literals, what every one of them asks (shared), and what of that holds.
interface Step { fact: string; rules: string[]; lits: Literal[][]; shared: Set<string>; atoms: Map<string, Predicate>;
  asked: string[] }

// A chain of fates that can leave its ending unreached (AU-37, The Warm Wall's friction, 20 November: a fate branch
// with no case for a variant stopped the book from closing, and nothing said so). A step of the chain is the rules
// that each assert one fact the step asks not to hold (`Rule fate_osric_plain when … and not fatedOsric(party) {
// Assert fatedOsric(party). }`), and the chain is the steps the module's endings come to: an ending asking a step's
// fact, a step asking another's. Each step's cases (and the endings that ask its fact) should between them hold in
// every state: where none holds, the fact is never asserted and every step after it, and the ending, waits for ever.
// A case is what a rule asks beyond the step's gate: what all its cases ask, what every case of the fate before it
// asks (the Warm Wall's soakOver()), and the chain's own facts. What a case asks beyond that is read as so many
// facts, each free to hold or not, so a case the author knows cannot come (two facts that never hold together) is
// still said: write the plain case last, asking nothing more, as the Warm Wall's fates each do. Of the language
// review's processes (MT-30) this is the one not yet a form: when it is, it is a process that can end in no phase.
export class FateChainLint {
  // So many facts, beyond which the cases are not tried state by state (2^12 states).
  private static readonly most = 12;
  static run(lint: CampaignLint) {
    // Advice, said for every campaign and failing none: the states are read as so many free facts, and one no case
    // holds in may be one play never comes to (Sallowfield's picks withdrawn before they come). Made an error when
    // the record of a fate chain as a form (MT-30) can say which states are reached.
    // Said in the module's own names (fatedOsric(party), not warmwall__fatedOsric(party)).
    const own = new RegExp(`\\b(${lint.session.campaign.installed.join('|')})__`, 'g');
    for (const f of this.findings(lint.module)) { lint.add('advice', 'fate', f.replace(own, '')); }
  }
  static findings(module: Module): string[] {
    const rules = module.rules ?? [], steps = this.steps(rules), ends = rules.filter(r => EndingOrder.shuts(r));
    const chained = this.fates(steps, this.chained(steps, ends)), only = this.only(module, steps);
    // A fate told one way or another (two cases or more) is held to have a case for every state; a single event of the
    // close may wait on its own occasion (Liberty's flock lands, or its squire is exposed: two facts, one each).
    const told = [...chained].filter(f => only.has(f) && steps.get(f)!.rules.length > 1)
      .flatMap(fact => this.unmet(steps.get(fact)!, this.gate(steps.get(fact)!, steps, chained), 'its fates'));
    const ending = [...chained].filter(fact => this.last(fact, steps, chained)).flatMap(fact => {
      const asking = ends.filter(e => this.asks(e).has(fact));
      if (!asking.length) { return []; }
      const step = this.step(fact, asking);
      return this.unmet(step, new Set([...this.gate(step, steps, chained), ...steps.get(fact)!.shared]),
        'the endings asking it');
    });
    return [...told, ...ending];
  }
  // The facts their fates alone assert: one an act or another rule asserts too comes that way as well (Hollins'
  // sulphur, bought by Mrs Pyecroft or brought by the carrier on the seventh day).
  private static only(module: Module, steps: Map<string, Step>): Set<string> {
    const mine = new Set([...steps.values()].flatMap(s => s.rules)), elsewhere = new Set<string>();
    const changes = [...module.actions.flatMap(a => [...a.success, ...a.failure]),
      ...(module.rules ?? []).filter(r => !mine.has(r.id)).flatMap(r => r.effects)];
    for (const c of changes) { if (c.kind === 'assert') { elsewhere.add(JSON.stringify(c.call)); } }
    for (const s of steps.values()) {
      for (const r of (module.rules ?? []).filter(x => s.rules.includes(x.id) === false && mine.has(x.id))) {
        if (r.effects.some(c => c.kind === 'assert' && JSON.stringify(c.call) === s.fact)) { elsewhere.add(s.fact); }
      }
    }
    return new Set([...steps.keys()].filter(f => !elsewhere.has(f)));
  }
  // What a step's cases need not tell apart: what they all ask, what every case of a fate it asks asks, the chain's
  // facts, and its own fact not yet held. A fate of one rule after another is held to what the one before shares (its
  // own is all it asks); the chain's first, to its own (where the chain begins is not the lint's to say).
  private static gate(step: Step, steps: Map<string, Step>, chained: Set<string>): Set<string> {
    const before = step.asked.filter(a => a !== step.fact && chained.has(a)).flatMap(a => [...steps.get(a)!.shared]);
    return new Set([...step.rules.length > 1 || !before.length ? step.shared : [], ...before,
      ...[...chained].map(f => this.key([f, true])), this.key([step.fact, false])]);
  }
  // A chain's last fate: one that comes of another (asks a fate's fact) and that no fate after it asks. A latch the
  // endings ask that comes of no fate (the company come, once) is a gate of the book, not the end of a chain.
  private static last(fact: string, steps: Map<string, Step>, chained: Set<string>): boolean {
    const step = steps.get(fact)!;
    return step.asked.some(a => a !== fact && chained.has(a))
      && ![...chained].some(other => other !== fact && steps.get(other)!.asked.includes(fact));
  }
  // The rules by the fact each asserts and asks not to hold.
  private static steps(rules: WorldRule[]): Map<string, Step> {
    const by = new Map<string, WorldRule[]>();
    for (const r of rules) {
      const own = r.effects.flatMap(c => c.kind === 'assert' ? [JSON.stringify(c.call)] : []);
      const fact = own.find(f => this.literals(r.when).some(([a, held]) => !held && a === f));
      if (fact && !EndingOrder.shuts(r)) { by.set(fact, [...by.get(fact) ?? [], r]); }
    }
    return new Map([...by].map(([fact, rs]) => [fact, this.step(fact, rs)]));
  }
  // The steps an ending comes to, and the steps those ask, and so on.
  private static chained(steps: Map<string, Step>, ends: WorldRule[]): Set<string> {
    const seen = new Set<string>(), asked = ends.flatMap(e => [...this.asks(e)]);
    for (let fact = asked.pop(); fact !== undefined; fact = asked.pop()) {
      if (seen.has(fact) || !steps.has(fact)) { continue; }
      seen.add(fact);
      asked.push(...steps.get(fact)!.asked);
    }
    return seen;
  }
  // Of those, the chains of fates: two steps or more told at one moment (each asks the one condition of the close:
  // the Warm Wall's soakOver()), each asking the one before, at least one with cases (a fate told one way or
  // another). A chain of the story's own events, each come of its own occasion, may never come (a patent won only on
  // three votes); the close's fates must each come for the book to close.
  private static fates(steps: Map<string, Step>, chained: Set<string>): Set<string> {
    const out = new Set<string>(), all = [...chained].map(f => steps.get(f)!);
    // A time of day is no close: two events each at three in the afternoon are not told together (Hollins' plots).
    const moments = new Set(all.filter(s => s.rules.length > 1)
      .flatMap(s => s.asked.filter(a => !chained.has(a) && !a.includes('"clock"'))));
    for (const moment of moments) {
      const told = all.filter(s => s.asked.includes(moment)), facts = new Set(told.map(s => s.fact));
      const group = new Map(told.map(s => [s.fact, s.fact]));
      for (const s of told) {
        for (const a of s.asked.filter(x => x !== s.fact && facts.has(x))) {
          group.set(this.root(group, s.fact), this.root(group, a));
        }
      }
      const sizes = new Map<string, number>();
      told.forEach(s => sizes.set(this.root(group, s.fact), (sizes.get(this.root(group, s.fact)) ?? 0) + 1));
      const fateful = new Set(told.filter(s => s.rules.length > 1).map(s => this.root(group, s.fact)));
      told.filter(s => fateful.has(this.root(group, s.fact)) && sizes.get(this.root(group, s.fact))! > 1)
        .forEach(s => out.add(s.fact));
    }
    return out;
  }
  private static root(group: Map<string, string>, f: string): string {
    for (let g = group.get(f)!; g !== f; g = group.get(f)!) { f = g; }
    return f;
  }
  // What a rule asks to hold, its latch aside (an ending's).
  private static asks(rule: WorldRule): Set<string> {
    const when = EndingOrder.shuts(rule) && rule.when.kind === 'and' ? rule.when.left : rule.when;
    return new Set(this.literals(when).filter(([, held]) => held).map(([a]) => a));
  }
  // A step's rules read: each one's literals, and those every one of them asks.
  private static step(fact: string, rules: WorldRule[]): Step {
    const lits = rules.map(r => this.literals(EndingOrder.shuts(r) && r.when.kind === 'and' ? r.when.left : r.when));
    const shared = new Set(lits[0]!.map(l => this.key(l)));
    for (const l of lits.slice(1)) {
      const own = new Set(l.map(x => this.key(x)));
      shared.forEach(g => own.has(g) || shared.delete(g));
    }
    const atoms = new Map<string, Predicate>();
    rules.forEach(r => this.atoms(r.when, atoms));
    // The chain goes on through what every case asks (the fate before), never through what one case asks (a deed:
    // the Warm Wall's thirdPart, which only fate_song asks).
    return { fact, rules: rules.map(r => r.id), atoms, lits, shared,
      asked: lits[0]!.filter(l => l[1] && shared.has(this.key(l))).map(([a]) => a) };
  }
  // The first state no case holds in, said; nothing when every state has one, or there are too many to try.
  private static unmet(step: Step, gate: Set<string>, whose: string): string[] {
    // Something somewhere (at(party, ?r)) is asked of the world, not told apart by the cases.
    const cases = step.lits.map(l => l.filter(x => !gate.has(this.key(x)) && !x[0].includes('"?')));
    // Each case's conjuncts read over the facts they are made of (an or is its two sides, not a fact of its own).
    const leaves = new Map<string, Predicate>();
    cases.flat().forEach(([a]) => this.leaves(JSON.parse(a) as Predicate, leaves));
    const atoms = [...leaves.keys()];
    if (atoms.length > this.most) { return []; }
    for (let state = 0; state < 2 ** atoms.length; state++) {
      const held = new Set(atoms.filter((_, i) => state >> i & 1));
      if (cases.some(c => c.every(([a, is]) => this.holds(JSON.parse(a) as Predicate, held) === is))) { continue; }
      const said = atoms.map(a => `${held.has(a) ? '' : 'not '}${this.said(step, a)}`).join(' and ');
      return [`${this.said(step, step.fact)} is never asserted where ${said}: no case of ${whose} (${step.rules
        .join(', ')}) holds there, and the chain stops short of its ending; write a last case asking nothing more`];
    }
    return [];
  }
  private static key(l: Literal): string { return `${l[1]}${l[0]}`; }
  private static leaves(p: Predicate, into: Map<string, Predicate>) {
    if (p.kind === 'and' || p.kind === 'or') { this.leaves(p.left, into); this.leaves(p.right, into); return; }
    if (p.kind === 'not') { this.leaves(p.value, into); return; }
    into.set(JSON.stringify(p), p);
  }
  private static holds(p: Predicate, held: Set<string>): boolean {
    if (p.kind === 'and') { return this.holds(p.left, held) && this.holds(p.right, held); }
    if (p.kind === 'or') { return this.holds(p.left, held) || this.holds(p.right, held); }
    if (p.kind === 'not') { return !this.holds(p.value, held); }
    return held.has(JSON.stringify(p));
  }
  private static said(step: Step, atom: string): string {
    const p = step.atoms.get(atom);
    return p ? ModuleWriter.predicate(p) : ModuleWriter.predicate(JSON.parse(atom) as Predicate);
  }
  // A condition's conjuncts as literals: an atom (its JSON) and whether it is to hold.
  private static literals(p: Predicate): Literal[] {
    if (p.kind === 'and') { return [...this.literals(p.left), ...this.literals(p.right)]; }
    if (p.kind === 'not') { return [[JSON.stringify(p.value), false]]; }
    return [[JSON.stringify(p), true]];
  }
  private static atoms(p: Predicate, into: Map<string, Predicate>) {
    if (p.kind === 'and') { this.atoms(p.left, into); this.atoms(p.right, into); return; }
    const atom = p.kind === 'not' ? p.value : p;
    into.set(JSON.stringify(atom), atom);
  }
}
