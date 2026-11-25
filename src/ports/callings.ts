import { Installed } from './installed';
import type { CharacterClass } from '../rules/catalog-schema';

// What the rules ask of a calling, through a domain a setting installs (as src/ports/conditions.ts, the platform's
// stage 4): one by its id, and the whole table; from the installation in scope (src/ports/installed.ts). Asked of with
// none installed, it says so rather than answering that there is none.
export interface CallingsDomain {
  one(id: string): CharacterClass | undefined;
  table(): Readonly<Record<string, CharacterClass>>;
}
export class Callings {
  static of(id: string): CharacterClass | undefined { return this.installed().one(id); }
  static table(): Readonly<Record<string, CharacterClass>> { return this.installed().table(); }
  private static installed(): CallingsDomain { return Installed.need('callings'); }
}
