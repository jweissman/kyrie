export interface RawEntry {
  family: string; key: string; concept: string; kind?: string;
  source: { file: string; tables?: string[] }; definition: unknown;
}

// Resolves a reference the way Orsino resolves it at run time: by key within the candidate families in order, and
// for statuses and abilities also by display name, which Orsino's getAbility and status lookup accept.
export class OrsinoIndex {
  private static readonly named = new Set(['status', 'ability', 'arcaneSpell', 'divineSpell']);
  private readonly keys = new Map<string, Set<string>>();
  private readonly names = new Map<string, string>();
  constructor(entries: RawEntry[]) {
    for (const e of entries) {
      (this.keys.get(e.family) ?? this.keys.set(e.family, new Set()).get(e.family)!).add(e.key);
      const name = (e.definition as { name?: unknown } | null)?.name;
      if (OrsinoIndex.named.has(e.family) && typeof name === 'string') {
        this.names.set(`${e.family}|${name.toLowerCase()}`, e.key);
      }
    }
  }
  has(family: string, key: string): boolean { return this.keys.get(family)?.has(key) ?? false; }
  find(families: string[], key: string): string | undefined {
    const byKey = families.find(f => this.has(f, key));
    if (byKey) { return `${byKey}:${key}`; }
    for (const family of families) {
      const byName = this.names.get(`${family}|${key.toLowerCase()}`);
      if (byName) { return `${family}:${byName}`; }
    }
    return undefined;
  }
}
