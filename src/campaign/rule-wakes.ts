import { Stamps, type Module, type World, type WorldRule } from '../lang/index';

// Of a world: its line, and the rules filed in it that a name written since has woken.
interface Asleep { line: number; woken: Set<WorldRule>; world: World }
interface Held { line: number; names: readonly string[]; stamps: readonly number[] }
// The rules held on one relation or measure: under its name alone (''), or under one thing it is asked of (Stamps),
// each by the stamp it was filed at; and the least and greatest of the name's own stamps when they were filed (since,
// until): where those are one and the world's stamp for the name is it, every one of them was filed at the write the
// world holds, and none is woken, so that a watch reads the names written, not every thing some rule is held on
// (OR-1438). A stamp is one write's anywhere, so a world of another branch of the line (the world put back as it was
// when a command failed in its watches) is never taken for one that wrote nothing.
interface Group { since: number; until: number; byArg: Map<string, Map<number, Set<WorldRule>>> }
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
  // line → name → (thing, or '' for the whole name) → stamp → the rules filed under it.
  private readonly lines = new Map<number, Map<string, Group>>();
  private readonly held = new Map<WorldRule, Held>();
  // A rule found idle on these names, at these stamps (World.stamped: the line first), in this world.
  // One that reads nothing (an Ending when false) is idle for good: held, and filed under no name, so no line is kept
  // for it alone (a line left empty by every other rule freed had been deleted under it, and freeing it then threw:
  // the author's path's Wellspring, its first step's rules stopped by 'byName.size').
  hold(rule: WorldRule, names: readonly string[], stamped: readonly number[], world: World) {
    this.free(rule);
    const line = stamped[0]!, held = { line, names, stamps: stamped.slice(1) };
    this.held.set(rule, held); this.filed(rule, world);
    if (!names.length) { return; }
    let byName = this.lines.get(line);
    if (!byName) { byName = new Map(); this.lines.set(line, byName); }
    for (const [i, key] of names.entries()) {
      const [name, arg] = RuleWakes.apart(key), now = world.stamping.of(name);
      let group = byName.get(name);
      if (!group) { group = { since: now, until: now, byArg: new Map() }; byName.set(name, group); }
      group.since = Math.min(group.since, now); group.until = Math.max(group.until, now);
      let byStamp = group.byArg.get(arg);
      if (!byStamp) { byStamp = new Map(); group.byArg.set(arg, byStamp); }
      const stamp = held.stamps[i]!, rules = byStamp.get(stamp);
      if (rules) { rules.add(rule); } else { byStamp.set(stamp, new Set([rule])); }
    }
  }
  private filed(rule: WorldRule, world: World) {
    if (this.last?.world === world) { this.last.woken.delete(rule); } else { this.last?.woken.add(rule); }
  }
  // A rule no longer idle here: found to hold, or held idle elsewhere.
  free(rule: WorldRule) {
    const held = this.held.get(rule);
    if (!held) { return; }
    this.held.delete(rule);
    if (!held.names.length) { return; }
    const byName = this.lines.get(held.line)!;
    for (const [i, key] of held.names.entries()) {
      const [name, arg] = RuleWakes.apart(key), group = byName.get(name)!, byStamp = group.byArg.get(arg)!;
      const stamp = held.stamps[i]!, rules = byStamp.get(stamp)!;
      rules.delete(rule);
      if (!rules.size) { byStamp.delete(stamp); }
      if (!byStamp.size) { group.byArg.delete(arg); }
      if (!group.byArg.size) { byName.delete(name); }
    }
    if (!byName.size) { this.lines.delete(held.line); }
  }
  // What it last said, kept as rules are filed since: a rule filed in that world is asleep in it again; one filed in
  // another is counted woken, to be asked again, as it may be.
  private last?: Asleep;
  // The rules idle still in this world: filed in its line, and no name they are held on written since. A name all of
  // whose rules were filed at the write this world holds of it is passed over whole; and where it last said what is
  // asleep in a world of this line, only the names that world and this one hold differently are read again, written
  // since in either (a world put back after a failed command is a branch, not a later world: test/command-faults).
  // OR-1438: every watch had read every name every rule is held on, after every rule that fired.
  asleep(world: World): Asleep {
    const line = world.stamped([])[0]!, byName = this.lines.get(line), last = this.last;
    const since = last?.line === line ? world.stamping.written(last.world.stamping, true) : undefined;
    const woken = since ? last!.woken : new Set<WorldRule>();
    for (const name of since ?? byName?.keys() ?? []) {
      const group = byName?.get(name);
      const now = world.stamping.of(name);
      if (!group || (now === group.since && now === group.until)) { continue; }
      for (const [arg, byStamp] of group.byArg) {
        const now = world.stamping.of(name, arg || undefined);
        for (const [stamp, rules] of byStamp) { if (stamp !== now) { for (const r of rules) { woken.add(r); } } }
      }
    }
    this.last = { line, woken, world };
    return this.last;
  }
  sleeps(asleep: Asleep, rule: WorldRule): boolean {
    return this.held.get(rule)?.line === asleep.line && !asleep.woken.has(rule);
  }
  // A name held on, and the thing it is asked of ('' for none).
  private static apart(key: string): [string, string] {
    const at = key.indexOf(Stamps.mark);
    return at < 0 ? [key, ''] : [key.slice(0, at), key.slice(at + 1)];
  }
}
