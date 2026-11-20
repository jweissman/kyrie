import type { Names } from './known-names';

// Names asked through, each noted with what it was: a part kept from one world to the next that words its rows by
// the names the company knows (KeptParts.named) holds while each is still what it was (a member's own name is the
// company's, not the world's: see KnownNames).
export class AskedNames implements Names {
  readonly asked = new Map<string, string | undefined>();
  constructor(private readonly names: Names) {}
  get(id: string): string | undefined {
    const name = this.names.get(id);
    this.asked.set(id, name);
    return name;
  }
  static same(asked: ReadonlyMap<string, string | undefined>, names: Names): boolean {
    for (const [id, name] of asked) { if (names.get(id) !== name) { return false; } }
    return true;
  }
}
