import { Canon } from '../canon/canon';
import { ItemCatalog } from '../item-catalog';
import type { Creature } from '../creature';
import { Overlays } from '../overlays';
import { Effects } from '../effects';

// Who in a company can bring a skill to bear: a living, acting member whose background, class or equipped item
// grants it. Each grant is declared on the granting entry in the catalog.
export class PartyCapabilities {
  static has(id: string, creatures: Creature[]): boolean { return this.providers(id, creatures).length > 0; }
  // Whether this one companion brings the skill: by background, class, an equipped item or a condition held.
  static brings(id: string, c: Creature): boolean {
    if (c.state.hp === 0 || c.state.conditions.some(s => Effects.skips(s.id))) { return false; }
    return Overlays.skills(c).includes(id) || (Canon.classes[c.classId ?? '']?.skills ?? []).includes(id)
      || (c.state.inventory ?? []).some(i => i.equipped && ItemCatalog.get(i.definition).capability === id)
      || c.state.conditions.some(s => Canon.conditions[Canon.resolve('conditions', s.id)]?.grants?.includes(id));
  }
  static providers(id: string, creatures: Creature[]): Creature[] {
    const alive = creatures.filter(c => c.state.hp > 0 && !c.state.conditions.some(s => Effects.skips(s.id)));
    const trained = alive.find(c => Overlays.skills(c).includes(id));
    if (trained) { return [trained]; }
    const specialist = alive.find(c => (c.state.inventory ?? []).some(i => i.equipped
      && ItemCatalog.get(i.definition).capability === id) || (Canon.classes[c.classId ?? '']?.skills ?? []).includes(id));
    if (specialist) { return [specialist]; }
    // A condition can bring a capability while it lasts: whoever holds the lit torch brings light.
    const holder = alive.find(c => c.state.conditions.some(s => Canon.conditions[Canon.resolve('conditions', s.id)]?.grants?.includes(id)));
    return holder ? [holder] : [];
  }
}
