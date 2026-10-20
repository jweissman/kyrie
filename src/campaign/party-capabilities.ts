import { Canon } from '../canon/canon';
import { ItemCatalog } from '../item-catalog';
import type { Creature } from '../creature';
import { Overlays } from '../overlays';
import { Effects } from '../effects';

// Who in a company can bring a skill to bear: a living, acting member whose background, class or equipped item
// grants it. Each grant is declared on the granting entry in the catalog.
export class PartyCapabilities {
  static has(id: string, creatures: Creature[]): boolean { return this.providers(id, creatures).length > 0; }
  static providers(id: string, creatures: Creature[]): Creature[] {
    const alive = creatures.filter(c => c.state.hp > 0 && !c.state.conditions.some(s => Effects.skips(s.id)));
    const trained = alive.find(c => Overlays.skills(c).includes(id));
    if (trained) { return [trained]; }
    const specialist = alive.find(c => (c.state.inventory ?? []).some(i => i.equipped
      && ItemCatalog.get(i.definition).capability === id) || (Canon.classes[c.classId ?? '']?.skills ?? []).includes(id));
    return specialist ? [specialist] : [];
  }
}
