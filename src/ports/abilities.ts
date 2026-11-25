import type { Ability } from '../rules/catalog-schema';

// What the rules ask of an ability, through a domain a setting installs (as src/ports/conditions.ts, the platform's
// stage 4): by its id, and all of them; the fantasy canon installs itself where it loads. Asked of with none installed,
// it says so rather than answering that there is no such ability.
export interface AbilityDomain {
  ability(id: string): Ability | undefined;
  all(): [string, Ability][];
}
export class Abilities {
  private static domain?: AbilityDomain;
  static install(domain: AbilityDomain): void { this.domain = domain; }
  static of(id: string): Ability | undefined { return this.installed().ability(id); }
  static all(): [string, Ability][] { return this.installed().all(); }
  private static installed(): AbilityDomain {
    if (!this.domain) { throw new Error('No abilities installed: a setting installs its rules\' abilities'); }
    return this.domain;
  }
}
