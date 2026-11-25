import { Installed } from './installed';
import type { Ability } from '../rules/catalog-schema';

// What the rules ask of an ability, through a domain a setting installs (as src/ports/conditions.ts, the platform's
// stage 4): by its id, and all of them; from the installation in scope (src/ports/installed.ts). Asked of with none
// installed, it says so rather than answering that there is no such ability.
export interface AbilityDomain {
  ability(id: string): Ability | undefined;
  all(): [string, Ability][];
}
export class Abilities {
  static of(id: string): Ability | undefined { return this.installed().ability(id); }
  static all(): [string, Ability][] { return this.installed().all(); }
  private static installed(): AbilityDomain { return Installed.need('abilities'); }
}
