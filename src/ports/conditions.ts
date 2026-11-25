import { Installed } from './installed';
import type { Condition } from '../rules/catalog-schema';

// What the rules ask of a condition, through a domain a setting installs (the platform's root blocker,
// platform-separation.md: the runtime declares what it needs; the setting's rules implement it; another setting
// installs its own or none). The runtime had read Canon's catalog of conditions directly; it asks here instead, and
// answers from the installation in scope: a campaign's own, else the composition root's (src/ports/installed.ts; the
// fantasy rules', src/canon/canon.ts). Asked of with none installed, it says so rather than answering that there is no
// such condition.
export interface ConditionDomain {
  // The condition by its own id or any name it is also known by; none where there is no such condition.
  condition(id: string): Condition | undefined;
  // The condition by its own id only.
  exact(id: string): Condition | undefined;
}
export class Conditions {
  static of(id: string): Condition | undefined { return this.installed().condition(id); }
  static exact(id: string): Condition | undefined { return this.installed().exact(id); }
  private static installed(): ConditionDomain { return Installed.need('conditions'); }
}
