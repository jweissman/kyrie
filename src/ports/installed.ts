import type { AbilityDomain } from './abilities';
import type { CallingsDomain } from './callings';
import type { ConditionDomain } from './conditions';
import type { TraitsDomain } from './traits';

// What a setting installs for the runtime's rules to ask of (the installed context, OR-520; platform-separation.md,
// the third review): small capabilities, each owned by the layer that asks, held together by one installation. Never a
// current domain chosen by whichever was installed last. A campaign owns its installation and runs its operations
// within it; code with no campaign in scope (a spec's helper, a tool) asks of the one the composition root names, once.
// Two installations' operations interleaving across an await is refused rather than answered from the wrong one.
export interface InstalledDomain {
  readonly id: string;
  readonly conditions?: ConditionDomain;
  readonly abilities?: AbilityDomain;
  readonly traits?: TraitsDomain;
  readonly callings?: CallingsDomain;
}
export class Installed {
  private static root?: InstalledDomain;
  private static readonly scope: InstalledDomain[] = [];
  // How many asynchronous operations are under way within each installation, by its id.
  private static readonly awaiting = new Map<string, number>();
  // The composition root's installation, named once; named again otherwise, it is refused.
  static base(domain: InstalledDomain): void {
    if (this.root && this.root !== domain) {
      throw new Error(`The composition root has installed ${this.root.id}; ${domain.id} cannot replace it`);
    }
    this.root = domain;
  }
  static get rootId(): string | undefined { return this.root?.id; }
  // The installation in scope, else the composition root's.
  static current(): InstalledDomain {
    const domain = this.scope.at(-1) ?? this.root;
    if (!domain) { throw new Error('Nothing installed: a setting installs its rules at the composition root'); }
    return domain;
  }
  // Runs within an installation: synchronously, the scope left as it was however it ends.
  static within<T>(domain: InstalledDomain, run: () => T): T {
    this.scope.push(domain);
    try { return run(); } finally { this.scope.pop(); }
  }
  // Runs an asynchronous operation within an installation. While it awaits, nothing of another installation may run.
  static async during<T>(domain: InstalledDomain, run: () => Promise<T>): Promise<T> {
    const other = [...this.awaiting].find(([id, n]) => n > 0 && id !== domain.id);
    if (other) { throw new Error(`${domain.id} entered while ${other[0]} is under way: two installations interleaved`); }
    this.awaiting.set(domain.id, (this.awaiting.get(domain.id) ?? 0) + 1);
    this.scope.push(domain);
    try { return await run(); } finally {
      this.scope.splice(this.scope.lastIndexOf(domain), 1);
      this.awaiting.set(domain.id, this.awaiting.get(domain.id)! - 1);
    }
  }
  // A capability of the installation in scope, or a plain refusal naming what is missing.
  static need<K extends Exclude<keyof InstalledDomain, 'id'>>(part: K): NonNullable<InstalledDomain[K]> {
    const domain = this.current(), given = domain[part];
    if (!given) { throw new Error(`${domain.id} installs no ${part}`); }
    return given as NonNullable<InstalledDomain[K]>;
  }
}
