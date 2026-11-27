import type { Modifiers } from '../rules/modifiers';
import type { Perk } from '../rules/catalog-schema';
import type { ArenaAbility } from '../lang/index';

export interface MechanicsWording {
  flight(): string;
  conditionName(id: string): string;
  modifiers(modifiers: Modifiers): string[];
  full(ability: ArenaAbility): string;
  ability(ability: ArenaAbility): { summary: string };
  perk(perk: Perk): string;
}
