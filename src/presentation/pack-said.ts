import type { Screen } from '../ui/screen-types';

// What the company carries, said as the page's pack draws it: each of the company, what they wear or hold, what they
// carry, and the supplies a journey uses up (OR-688, cold plays 1, 3 and 4: the things lens had said nothing of the
// company's own gear, a planner learned its armour only from a chest's "Put in…" rows, and a newcomer bought leather
// armour not knowing it wore scale).
export class PackSaid {
  static lines(screen: Pick<Screen, 'items' | 'party'>): string[] {
    const owners = [...new Set(screen.items.map(i => i.owner))];
    return owners.flatMap(owner => {
      const of = screen.items.filter(i => i.owner === owner);
      const parts = ([['wears or holds', 'worn'], ['carries', 'carried'], ['has for the road', 'supplies']] as const)
        .map(([how, stow]) => [how, PackSaid.list(of.filter(i => i.stow === stow).map(i => i.name))] as const)
        .filter(([, l]) => l).map(([how, l]) => `${how} ${l}`);
      return parts.length ? [`${of[0]!.ownerName} ${parts.join('; ')}.`] : [];
    });
  }
  // Like things counted once ("2 torches" said as "a torch ×2").
  private static list(names: string[]): string {
    const counts = new Map<string, number>();
    for (const n of names) { counts.set(n, (counts.get(n) ?? 0) + 1); }
    return [...counts].map(([n, k]) => k > 1 ? `${n} ×${k}` : n).join(', ');
  }
}
