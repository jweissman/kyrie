import type { LensAct, Lensed } from '../../../src/presentation/glance-types';
import type { ReaderApp } from '../reader-app';
import type { Named } from './lens-rows';

// What a lens's openers open, and what the lens gives already (see LensRows.of).
export class Selection {
  private readonly given: Set<string>;
  constructor(private readonly app: ReaderApp, lensed: Lensed, private readonly leaves: Record<string, LensAct[]>,
    private readonly choice: Named) {
    this.given = new Set([...lensed.promoted, ...lensed.rest].filter(a => !this.opens(a))
      .flatMap(a => [a.choice, a.command ?? '']));
  }
  opens(a: { choice: string }): boolean { return !!this.leaves[a.choice]?.length; }
  inside(a: LensAct): LensAct[] {
    return (this.leaves[a.choice] ?? []).filter(l => !this.given.has(l.choice) && !this.given.has(l.command ?? ''))
      .map(l => ({ ...l, subject: l.subject ?? a.subject ?? a.choice }));
  }
  covered(a: { choice: string }): boolean {
    const kids = this.choice(this.app, a.choice)?.children ?? [];
    return kids.length > 0 && kids.every(k => this.given.has(k.id));
  }
}
