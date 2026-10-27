// `kyrie inspect`: why a choice is or is not on offer where a game stands. The campaign is played there by the labels
// a player sees, as `kyrie play` plays it; then each action of the rules whose id, label or grounded name matches is
// told: offered, and how the page words it (or why the page leaves it off); or not, and, for the bindings nearest to
// being offered, which of its conditions fail, in Kyr with the bindings put in, and what holds instead.
//   bin/kyrie inspect <campaign.json> "<pattern>" [--seed s] [--steps steps.json] [step ...]
//   bin/kyrie inspect --world <seed> [--origin o] [--as race/calling/Name] "<pattern>" [step ...]
import { PlayTool } from './play-tool';
import { ActionSchemas } from '../campaign/action-schemas';
import { ModuleWriter } from '../lang/module-writer';
import { World } from '../lang/world';
import { PlayerView } from '../presentation/player-view';
import type { Campaign } from '../campaign/campaign';
import type { Operator, Predicate, Query, Value } from '../lang/module';

type Binding = Record<string, string>;
// A binding of an action not on offer, by the name it would have, and the conditions it fails.
interface Near { binding: Binding; name: string; failing: Predicate[] }

export class InspectTool {
  // How many bindings are weighed for one action at most.
  private static readonly most = 4000;
  static async main(args: string[], print: (line: string) => void = console.log): Promise<number> {
    const o = PlayTool.parse(args), [pattern, ...steps] = o.steps;
    if ((!o.campaign && !o.world && !o.part) || !pattern) {
      print('usage: kyrie inspect <campaign.json> | --world <seed> "<pattern>" [--seed s] [--steps steps.json] [step ...]');
      return 1;
    }
    const { journey: j, lead } = await PlayTool.start(o);
    for (const step of [...lead, ...await PlayTool.steps(o.file), ...steps]) {
      try { await j.step(step); } catch (e) { print(`! ${(e as Error).message}`); return 1; }
    }
    print(`-- watch ${j.watch()}, at ${j.at(j.campaign.playerActor ?? 'party') ?? 'nowhere'}`);
    const lines = this.report(j.campaign, pattern);
    for (const line of lines.length ? lines : [`Nothing in the rules is called /${pattern}/.`]) { print(line); }
    return lines.length ? 0 : 1;
  }
  // What is to be said of the actions of the rules the pattern names: each on offer, and how the page shows it; or,
  // when none is, the bindings nearest to being offered of any of them (by the name they would have, if that is
  // what the pattern names), and which of their conditions fail.
  static report(campaign: Campaign, pattern: string): string[] {
    const re = new RegExp(pattern, 'i'), page = PlayerView.choices(campaign), labels = ActionSchemas.labels(campaign.module);
    const schemas = new Map(campaign.module.actions.map(x => [x.id, x]));
    const open = campaign.offered().filter(a => re.test(a.name) || this.named(schemas.get(a.schema ?? a.id) ?? a, re));
    if (open.length) { return open.map(a => this.shown(page, a)); }
    const near = campaign.module.actions.filter(schema => this.named(schema, re) || this.may(schema.name, pattern))
      .flatMap(schema => this.nearest(campaign, schema, labels).map(n => ({ ...n, schema })));
    const meant = near.filter(n => re.test(n.name));
    const all = meant.length ? meant : near.filter(n => this.named(n.schema, re));
    if (!all.length) { return []; }
    const exact = all.filter(n => n.name.toLowerCase() === pattern.toLowerCase()), ranked = exact.length ? exact : all;
    const fewest = Math.min(...ranked.map(n => n.failing.length));
    const best = ranked.filter(n => n.failing.length === fewest).slice(0, 3);
    return best.flatMap((n, i) => [...best.findIndex(m => m.schema === n.schema) === i
      ? [`${n.schema.id} ${JSON.stringify(n.schema.name)}: not offered`] : [], ...this.told(campaign, n)]);
  }
  private static named(schema: Operator, re: RegExp): boolean { return re.test(schema.id) || re.test(schema.name); }
  // An action on offer, and how the page shows it: as a choice of its own, as one with another alike, or not at all
  // (something it is done to is not seen).
  private static shown(page: ReturnType<typeof PlayerView.choices>, a: Operator): string {
    const own = page.find(c => c.action.id === a.id), alike = page.find(c => c.action.schema === a.schema
      && c.choice.name === a.name);
    const how = own ? `on the page as "${own.choice.name}"` : alike ? `on the page as one with "${alike.choice.name}"`
      : 'not on the page: something it is done to is not seen';
    return `offered: ${a.name} (${a.id}), ${how}`;
  }
  // Whether a pattern might name an action grounded from this label: the words before its first blank are in it, or
  // it begins with one (a thing's change is named as the change is: "Wind the sluice up").
  private static may(label: string, pattern: string): boolean {
    const head = label.split('{')[0]!.trim().toLowerCase();
    return !head || pattern.toLowerCase().replace(/[\^$\\]/g, '').includes(head);
  }
  // The bindings of an action nearest to being offered: those its required facts propose, fewest conditions failed
  // first.
  static nearest(campaign: Campaign, schema: Operator, labels: Map<string, string>): Near[] {
    const world = campaign.world, groups = this.groups(schema.requires);
    return this.bindings(campaign, schema).map(binding => ({ binding,
      name: ActionSchemas.instance(schema, binding, labels).name,
      failing: groups.filter(g => !this.holds(world, g, binding)) }))
      .sort((a, b) => a.failing.length - b.failing.length);
  }
  private static holds(world: World, p: Predicate, binding: Binding): boolean {
    try { return world.test(p, binding); } catch { return false; }
  }
  // Candidate bindings, as the campaign grounds them (see Operators) but going on past a fact that proposes nothing:
  // the company as the actor, the required facts joined most-bound first, and what they leave open over the entities
  // of its type.
  private static bindings(campaign: Campaign, schema: Operator): Binding[] {
    const world = campaign.world, params = schema.parameters ?? [], names = new Set(params.map(p => p.name));
    const actor: Binding = params.some(p => p.name === 'actor') && campaign.playerActor ? { actor: campaign.playerActor } : {};
    let rows: Binding[] = [actor];
    const pending = this.conjuncts(schema.requires)
      .filter((c): c is Extract<Predicate, { kind: 'call' }> => c.kind === 'call' && world.relates(c.name));
    while (pending.length) {
      const row = rows[0]!;
      const c = pending.reduce((best, x) => this.known(x, names, row) > this.known(best, names, row) ? x : best);
      pending.splice(pending.indexOf(c), 1);
      if (!c.args.some(a => names.has(a) && rows[0]![a] === undefined)) { continue; }
      const joined = rows.flatMap(row => this.join(world, c, row, names));
      if (joined.length) { rows = joined.slice(0, this.most); }
    }
    for (const p of params) {
      const ids = world.module.entities.filter(e => p.type === 'entity' || e.type === p.type).map(e => e.id);
      rows = rows.flatMap(row => row[p.name] !== undefined ? [row] : ids.map(id => ({ ...row, [p.name]: id })))
        .slice(0, this.most);
    }
    return rows;
  }
  // How many of a call's arguments a row knows.
  private static known(c: { args: string[] }, names: Set<string>, row: Binding): number {
    return c.args.filter(a => !names.has(a) || row[a] !== undefined).length;
  }
  // A row extended by each fact of a relation its call matches.
  private static join(world: World, c: { name: string; args: string[] }, row: Binding, names: Set<string>): Binding[] {
    return world.related(c.name).filter(f => c.args.every((a, i) => a.startsWith('?')
      || (names.has(a) ? row[a] === undefined || row[a] === f.args[i] : a === f.args[i])))
      .map(f => ({ ...row, ...Object.fromEntries(c.args.flatMap((a, i) => names.has(a) && row[a] === undefined
        ? [[a, f.args[i]!]] : [])) }));
  }
  // A binding near to being offered: its name, what it binds, each condition it fails, and what holds instead.
  private static told(campaign: Campaign, n: Near): string[] {
    const world = campaign.world, binds = Object.entries(n.binding).map(([k, v]) => `${k}=${v}`).join(', ');
    const lines = [`  nearest: "${n.name}" (${binds})`];
    if (!n.failing.length) { lines.push('    every condition holds: the company may not take it, or what it does could not be done'); }
    for (const p of n.failing) {
      const bound = this.bound(p, n.binding);
      lines.push(`    fails: ${ModuleWriter.predicate(bound)}${this.instead(world, bound)}`);
    }
    return lines;
  }
  // What holds instead of a fact that fails (the company is somewhere else), and what a query that fails means.
  private static instead(world: World, p: Predicate): string {
    if (p.kind === 'not') { return ', which holds'; }
    if (p.kind !== 'call') { return ''; }
    const query = world.module.queries.find(q => q.name === p.name);
    if (query) { return this.meant(world, query, p); }
    const facts = world.relates(p.name) ? world.related(p.name, p.args[0]).slice(0, 3) : [];
    return facts.length ? `; instead ${facts.map(f => World.format(f)).join(', ')}` : '';
  }
  // What a query means, which of its conditions fail with its arguments put in, and the facts its open ones find.
  private static meant(world: World, query: Query, p: Extract<Predicate, { kind: 'call' }>): string {
    const body = this.bound(query.body, Object.fromEntries(query.parameters.map((x, i) => [x.name, p.args[i]!])));
    const failing = this.groups(body).filter(g => !this.holds(world, g, {})).map(g => ModuleWriter.predicate(g));
    const found = this.opening(body).filter(c => world.relates(c.name))
      .flatMap(c => world.related(c.name, c.args[0]).slice(0, 2)).map(f => World.format(f));
    return `: ${query.name} means ${ModuleWriter.predicate(query.body)}; here ${failing.join(', ')} does not hold`
      + (found.length ? `, though ${[...new Set(found)].join(', ')}` : '');
  }
  // The calls that first ask for each open value (revealedBy(x, ?f), not knows(a, ?f) after it), of something known.
  private static opening(p: Predicate): Extract<Predicate, { kind: 'call' }>[] {
    const seen = new Set<string>();
    return this.calls(p).filter(c => {
      const fresh = c.args.filter(a => a.startsWith('?') && !seen.has(a));
      for (const a of fresh) { seen.add(a); }
      return fresh.length > 0 && !c.args[0]!.startsWith('?');
    });
  }
  private static calls(p: Predicate): Extract<Predicate, { kind: 'call' }>[] {
    if (p.kind === 'call') { return [p]; }
    if (p.kind === 'not') { return this.calls(p.value); }
    return p.kind === 'and' || p.kind === 'or' ? [...this.calls(p.left), ...this.calls(p.right)] : [];
  }
  // A condition with the binding's values put in for its parameters.
  private static bound(p: Predicate, b: Binding): Predicate {
    switch (p.kind) {
      case 'call': return { ...p, args: p.args.map(a => b[a] ?? a) };
      case 'not': return { ...p, value: this.bound(p.value, b) };
      case 'and': case 'or': return { ...p, left: this.bound(p.left, b), right: this.bound(p.right, b) };
      case 'compare': return { ...p, left: this.value(p.left, b), right: this.value(p.right, b) };
      default: return p;
    }
  }
  private static value(v: Value, b: Binding): Value {
    if (v.kind === 'call') { return { ...v, args: v.args.map(a => b[a] ?? a) }; }
    return v.kind === 'arith' ? { ...v, left: this.value(v.left, b), right: this.value(v.right, b) } : v;
  }
  // The top-level conditions of a precondition, those that share a variable (?m) asked together.
  private static groups(p: Predicate): Predicate[] {
    let groups: { parts: Predicate[]; vars: Set<string> }[] = [];
    for (const c of this.conjuncts(p)) {
      const vars = this.vars(c), mine = groups.filter(g => [...vars].some(v => g.vars.has(v)));
      groups = [...groups.filter(g => !mine.includes(g)), { parts: [...mine.flatMap(g => g.parts), c],
        vars: new Set([...mine.flatMap(g => [...g.vars]), ...vars]) }];
    }
    return groups.map(g => g.parts.reduce((left, right) => ({ kind: 'and', left, right })));
  }
  private static conjuncts(p: Predicate): Predicate[] {
    return p.kind === 'and' ? [...this.conjuncts(p.left), ...this.conjuncts(p.right)] : [p];
  }
  private static vars(p: Predicate | Value, out = new Set<string>()): Set<string> {
    if (p.kind === 'call') { for (const a of p.args) { if (a.startsWith('?')) { out.add(a); } } }
    else if (p.kind === 'not') { this.vars(p.value, out); }
    else if (p.kind === 'and' || p.kind === 'or' || p.kind === 'compare' || p.kind === 'arith') {
      this.vars(p.left, out); this.vars(p.right, out);
    }
    return out;
  }
}
