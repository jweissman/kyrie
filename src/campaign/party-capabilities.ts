import { Canon } from '../canon/canon';
import { ItemCatalog } from '../item-catalog';
import type { Creature } from '../creature';
import { Overlays } from '../overlays';
import { Effects } from '../effects';

export class PartyCapabilities {
  static has(id: string, creatures: Creature[]): boolean { return this.providers(id, creatures).length > 0; }
  static providers(id: string, creatures: Creature[]): Creature[] {
    // Legacy grants are Serewater-era keys; canonical classes declare their own skills.
    const definition = Canon.legacy.grants[id] ?? { classes: [], races: [], backgrounds: [] };
    const alive = creatures.filter(c => c.state.hp > 0 && !c.state.conditions.some(s => Effects.status(s.id).skip));
    const trained = alive.find(c => Overlays.skills(c).includes(id));
    if (trained) { return [trained]; }
    const specialist = alive.find(c => (c.state.inventory ?? []).some(i => i.equipped
      && ItemCatalog.get(i.definition).capability === id) || definition.classes.some(id => id === c.classId)
      || (Canon.classes[c.classId]?.skills ?? []).includes(id)
      || definition.backgrounds.some(id => id === c.backgroundId));
    if (specialist) { return [specialist]; }
    if (!definition.races.length) { return []; }
    const remaining = [...alive], selected: Creature[] = [];
    for (const id of definition.races) {
      const i = remaining.findIndex(c => c.raceId === id);
      if (i < 0) { return []; }
      selected.push(remaining.splice(i, 1)[0]!);
    }
    return selected;
  }
}
