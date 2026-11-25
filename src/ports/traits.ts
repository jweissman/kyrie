import { Installed } from './installed';
import type { Trait } from '../rules/catalog-schema';

// What the rules ask of a trait, through a domain a setting installs (as src/ports/conditions.ts, the platform's stage
// 4): one by its id, and the whole table; from the installation in scope (src/ports/installed.ts). Asked of with none
// installed, it says so rather than answering that there is none.
export interface TraitsDomain {
  one(id: string): Trait | undefined;
  table(): Readonly<Record<string, Trait>>;
}
export class Traits {
  static of(id: string): Trait | undefined { return this.installed().one(id); }
  static table(): Readonly<Record<string, Trait>> { return this.installed().table(); }
  private static installed(): TraitsDomain { return Installed.need('traits'); }
}
