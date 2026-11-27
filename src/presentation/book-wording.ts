import { MechanicsText } from './mechanics-text';
import { PerkText } from './perk-text';
import type { MechanicsWording } from '../shared/mechanics-wording';

export class BookWording {
  static flight() { return MechanicsText.flight(); }
  static conditionName(...args: Parameters<MechanicsWording['conditionName']>) { return MechanicsText.conditionName(...args); }
  static modifiers(...args: Parameters<MechanicsWording['modifiers']>) { return MechanicsText.modifiers(...args); }
  static full(...args: Parameters<MechanicsWording['full']>) { return MechanicsText.full(...args); }
  static ability(...args: Parameters<MechanicsWording['ability']>) { return MechanicsText.ability(...args); }
  static perk(...args: Parameters<MechanicsWording['perk']>) { return PerkText.of(...args); }
}
