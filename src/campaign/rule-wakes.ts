import type { Module, World, WorldRule } from '../lang/index';

// Of a world: its line, and the rules filed in it that a name written since has woken.
interface Asleep { line: number; woken: ReadonlySet<WorldRule> }
interface Held { line: number; names: readonly string[]; stamps: readonly number[] }
// The world's rules held idle (see CampaignTick.instances), filed by what would wake them: each by the world line it
// was found idle in and, for every name it is held on, that name's stamp then. A watch asks only the rules that some
// write has woken, not every rule of the country whether it is still idle (AX-10: a thousand rules asked a watch, a
// handful of them firing). Which rules are awake is read off the names written since, not off the rules: a name
// whose stamp is still the one a rule was filed under has not been written, and a rule none of whose names has been is
// idle still. Kept for each module, as a rule's idleness is (a world joined to more is a new module).
export class RuleWakes {
  private static readonly modules = new WeakMap<Module, RuleWakes>();
  static of(module: Module): RuleWakes {
    let wakes = this.modules.get(module);
    if (!wakes) { wakes = new RuleWakes(); this.modules.set(module, wakes); }
    return wakes;
  }
  // line → name → stamp → the rules filed under it.
  private readonly lines = new Map<number, Map<string, Map<number, Set<WorldRule>>>>();
  private readonly held = new Map<WorldRule, Held>();
  // A rule found idle on these names, at these stamps (World.stamped: the line first).
  // One that reads nothing (an Ending when false) is idle for good: held, and filed under no name, so no line is kept
  // for it alone (a line left empty by every other rule freed had been deleted under it, and freeing it then threw:
  // the author's path's Wellspring, its first step's rules stopped by 'byName.size').
  hold(rule: WorldRule, names: readonly string[], stamped: readonly number[]) {
    this.free(rule);
    const line = stamped[0]!, held = { line, names, stamps: stamped.slice(1) };
    this.held.set(rule, held);
    if (!names.length) { return; }
    let byName = this.lines.get(line);
    if (!byName) { byName = new Map(); this.lines.set(line, byName); }
    for (const [i, name] of names.entries()) {
      let byStamp = byName.get(name);
      if (!byStamp) { byStamp = new Map(); byName.set(name, byStamp); }
      const stamp = held.stamps[i]!, rules = byStamp.get(stamp);
      if (rules) { rules.add(rule); } else { byStamp.set(stamp, new Set([rule])); }
    }
  }
  // A rule no longer idle here: found to hold, or held idle elsewhere.
  free(rule: WorldRule) {
    const held = this.held.get(rule);
    if (!held) { return; }
    this.held.delete(rule);
    if (!held.names.length) { return; }
    const byName = this.lines.get(held.line)!;
    for (const [i, name] of held.names.entries()) {
      const byStamp = byName.get(name)!, stamp = held.stamps[i]!, rules = byStamp.get(stamp)!;
      rules.delete(rule);
      if (!rules.size) { byStamp.delete(stamp); }
      if (!byStamp.size) { byName.delete(name); }
    }
    if (!byName.size) { this.lines.delete(held.line); }
  }
  // The rules idle still in this world: filed in its line, and no name they are held on written since.
  asleep(world: World): Asleep {
    const line = world.stamped([])[0]!, byName = this.lines.get(line), woken = new Set<WorldRule>();
    for (const [name, byStamp] of byName ?? []) {
      const now = world.stamp(name);
      for (const [stamp, rules] of byStamp) { if (stamp !== now) { for (const r of rules) { woken.add(r); } } }
    }
    return { line, woken };
  }
  sleeps(asleep: Asleep, rule: WorldRule): boolean {
    return this.held.get(rule)?.line === asleep.line && !asleep.woken.has(rule);
  }
}
