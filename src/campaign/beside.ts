import type { World } from '../lang/world';

// What a fight is drawn from: who is in each group, and the creatures as they stand.
interface Read {
  inhabitants: Record<string, readonly string[]>; creatures: readonly { id: string; state: { hp: number } }[];
}

// A party of several groups that fight as one (data/rules/inhabitants.kyr, beside): a goblin chief's guards, his
// shaman and his wolf, each a group of its own kind, as Orsino's encounters were parties of several. A fight with any
// of them, where they stand together, is a fight with all that stand there with it; one away from the rest is not in
// it.
export class Beside {
  static groups(world: World, group: string): string[] {
    if (!world.relates('beside')) { return [group]; }
    const here = world.one('at', group), pairs = world.related('beside').map(r => [r.args[0]!, r.args[1]!] as const);
    const out = new Set([group]);
    for (let grew = true; grew;) {
      grew = false;
      for (const [a, b] of pairs) {
        if (out.has(a) === out.has(b)) { continue; }
        const other = out.has(a) ? b : a;
        if (world.one('at', other) === here) { out.add(other); grew = true; }
      }
    }
    return [...out];
  }
  // Whom a fight with a group is fought against: its own, and any beside it there still standing.
  static foes(world: World, read: Read, group: string): string[] {
    const own = read.inhabitants[group]!;
    return [...own, ...this.members(world, read.inhabitants, group)
      .filter(id => !own.includes(id) && this.hp(read, id) > 0)];
  }
  // Those of a party a fight with it left down: what the fight won is worth.
  static fallen(world: World, read: Read, group: string): string[] {
    return this.members(world, read.inhabitants, group).filter(id => this.hp(read, id) === 0);
  }
  private static hp(read: Read, id: string): number { return read.creatures.find(c => c.id === id)?.state.hp ?? 0; }
  // The creatures of a group and of everyone beside it there, the group's own first.
  static members(world: World, inhabitants: Read['inhabitants'], group: string): string[] {
    return this.groups(world, group).flatMap(g => inhabitants[g] ?? []);
  }
}
