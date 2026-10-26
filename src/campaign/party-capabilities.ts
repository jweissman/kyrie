import { Canon } from '../canon/canon';
import { ItemCatalog } from '../item-catalog';
import type { Creature } from '../creature';
import { Overlays } from '../overlays';
import { Effects } from '../effects';
import type { PerkContext } from '../rules/perks';
import { Searching } from '../rules/searching';

// Who in a company can bring a skill to bear: a living, acting member whose background, class or equipped item
// grants it. Each grant is declared on the granting entry in the catalog.
export class PartyCapabilities {
  // A member with an eye for searching (Orsino's check taken at 10) finds what would otherwise need a skill.
  static readonly keen = 'perception';
  static has(id: string, creatures: Creature[], at: PerkContext = {}): boolean {
    return this.providers(id, creatures, at).length > 0;
  }
  // Whether this one companion brings the skill: by background, class, an equipped item, a condition or a perk held.
  static brings(id: string, c: Creature, at: PerkContext = {}): boolean {
    if (c.state.hp === 0 || c.state.conditions.some(s => Effects.skips(s.id))) { return this.unheld(id, c); }
    return this.trained(id, c) || (Canon.classes[c.classId ?? '']?.skills ?? []).includes(id)
      || (c.state.inventory ?? []).some(i => i.equipped && ItemCatalog.get(i.definition).capability === id)
      || c.state.conditions.some(s => Canon.conditions[Canon.resolve('conditions', s.id)]?.grants?.includes(id))
      || (id === this.keen && Searching.finds(c, at));
  }
  static providers(id: string, creatures: Creature[], at: PerkContext = {}): Creature[] {
    if (id === this.keen) {
      const searcher = Searching.searcher(creatures, at);
      return searcher && this.brings(id, searcher, at) ? [searcher] : [];
    }
    const alive = creatures.filter(c => c.state.hp > 0 && !c.state.conditions.some(s => Effects.skips(s.id)));
    const trained = alive.find(c => this.trained(id, c));
    if (trained) { return [trained]; }
    const specialist = alive.find(c => (c.state.inventory ?? []).some(i => i.equipped
      && ItemCatalog.get(i.definition).capability === id) || (Canon.classes[c.classId ?? '']?.skills ?? []).includes(id));
    if (specialist) { return [specialist]; }
    // A condition can bring a capability while it lasts: whoever holds the lit torch brings light.
    const holder = alive.find(c => c.state.conditions.some(s => Canon.conditions[Canon.resolve('conditions', s.id)]?.grants?.includes(id)));
    const hung = holder ? undefined : creatures.find(c => this.unheld(id, c));
    return holder ? [holder] : hung ? [hung] : [];
  }
  // Trained in a skill: by background or profession, or by having taken it up with a level's development.
  private static trained(id: string, c: Creature): boolean {
    return Overlays.skills(c).includes(id) || (c.state.skills ?? []).includes(id);
  }
  // A condition that brings what it grants though its holder has fallen (a conjured light).
  private static unheld(id: string, c: Creature): boolean {
    return c.state.conditions.some(s => {
      const condition = Canon.conditions[Canon.resolve('conditions', s.id)];
      return !!condition?.unheld && !!condition.grants?.includes(id);
    });
  }
}
