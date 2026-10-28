// How many of a thing, in words ("three torches", "two sacks of bell-teeth"), and alike things counted together:
// three torches, not a torch three times, what is in use apart (the Third Night's playtest went into the dark with
// eight torches listed as one, and a pack of one row a torch is no better: AUT-22).
export class Counted {
  static readonly words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
    'twelve'];
  static many(n: number, noun: string): string {
    const [head, ...of] = noun.split(' of '), plural = /(s|x|z|ch|sh)$/.test(head!) ? `${head}es`
      : /[^aeiou]y$/.test(head!) ? `${head!.slice(0, -1)}ies` : `${head}s`;
    return `${this.words[n] ?? n} ${[plural, ...of].join(' of ')}`;
  }
  // Alike by name and by what else is said of them (in use, kept for someone), in the order first carried.
  static together<T extends { name: string; equipped?: boolean }>(items: T[], also?: (item: T) => string)
    : { item: T; count: number }[] {
    const out: { item: T; count: number; key: string }[] = [];
    for (const item of items) {
      const key = `${item.name}\u0000${!!item.equipped}\u0000${also?.(item) ?? ''}`, same = out.find(o => o.key === key);
      if (same) { same.count++; } else { out.push({ item, count: 1, key }); }
    }
    return out.map(({ item, count }) => ({ item, count }));
  }
}
