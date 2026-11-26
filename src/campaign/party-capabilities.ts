import { Canon } from '../canon/canon';
import { Traits } from '../ports/traits';
import { Callings } from '../ports/callings';
import { Conditions } from '../ports/conditions';
import type { ItemCatalog } from '../item-catalog';
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
  static has(catalog: ItemCatalog, id: string, creatures: Creature[], at: PerkContext = {}): boolean {
    return this.providers(catalog, id, creatures, at).length > 0;
  }
  // Whether this one companion brings the skill: by background, class, an equipped item, a condition or a perk held, or
  // an ordinary thing carried whose use it is (a shovel digs, whoever holds it).
  static brings(catalog: ItemCatalog, id: string, c: Creature, at: PerkContext = {}): boolean {
    return this.skilled(catalog, id, c, at) || (this.up(c) && !!this.aid(catalog, id, c));
  }
  // Whether they bring it as one who knows how: by training, calling, a condition or a magic thing, and not by an
  // ordinary thing in their hands (the owner, 7 November: tools enable tasks; they don't grant expertise).
  static skilled(catalog: ItemCatalog, id: string, c: Creature, at: PerkContext = {}): boolean {
    if (!this.up(c)) { return this.unheld(id, c); }
    return this.trained(id, c) || (Callings.of(c.classId ?? '')?.skills ?? []).includes(id)
      || (c.state.inventory ?? []).some(i => this.lends(catalog, i, id))
      || c.state.conditions.some(s => Conditions.of(s.id)?.grants?.includes(id))
      || (id === this.keen && Searching.finds(c, at));
  }
  // The thing a companion carries that helps them at a skill's checks: an ordinary thing whose use it is, for anyone
  // (pitons, for a climb); a professional's tool, only for one skilled in it (thieves' tools, for a lock).
  static tool(catalog: ItemCatalog, id: string, c: Creature, at: PerkContext = {}): string | undefined {
    if (!this.up(c)) { return undefined; }
    const tooled = this.carried(catalog, c).find(i => catalog.get(i.definition).tool?.includes(id));
    return this.aid(catalog, id, c) ?? (tooled && this.skilled(catalog, id, c, at) ? tooled.definition : undefined);
  }
  static providers(catalog: ItemCatalog, id: string, creatures: Creature[], at: PerkContext = {}): Creature[] {
    if (id === this.keen) {
      const searcher = Searching.searcher(creatures, at);
      return searcher && this.brings(catalog, id, searcher, at) ? [searcher] : [];
    }
    const alive = creatures.filter(c => c.state.hp > 0 && !c.state.conditions.some(s => Effects.skips(s.id)));
    const trained = alive.find(c => this.trained(id, c));
    if (trained) { return [trained]; }
    const specialist = alive.find(c => (c.state.inventory ?? []).some(i => this.lends(catalog, i, id))
      || (Callings.of(c.classId ?? '')?.skills ?? []).includes(id)) ?? alive.find(c => this.aid(catalog, id, c));
    if (specialist) { return [specialist]; }
    // A condition can bring a capability while it lasts: whoever holds the lit torch brings light.
    const holder = alive.find(c => c.state.conditions.some(s => Conditions.of(s.id)?.grants?.includes(id)));
    const hung = holder ? undefined : creatures.find(c => this.unheld(id, c));
    return holder ? [holder] : hung ? [hung] : [];
  }
  // An item that brings a skill: worn, or carried if it is not a thing to wear (a feather that keeps whoever carries it
  // from falling, a playbill that grants what it says; one `is gear granting climbing` had brought nothing).
  private static lends(catalog: ItemCatalog, i: { definition: string; equipped?: boolean }, id: string): boolean {
    return catalog.get(i.definition).capability === id && this.ready(catalog, i);
  }
  // An ordinary thing a companion carries whose direct use is the skill's (a ladder, for a climb).
  private static aid(catalog: ItemCatalog, id: string, c: Creature): string | undefined {
    return this.carried(catalog, c).find(i => catalog.get(i.definition).aids?.includes(id))?.definition;
  }
  // What is to hand: worn, or carried if it is not a thing to wear.
  private static carried(catalog: ItemCatalog, c: Creature): { definition: string; equipped?: boolean }[] {
    return (c.state.inventory ?? []).filter(i => this.ready(catalog, i));
  }
  private static ready(catalog: ItemCatalog, i: { definition: string; equipped?: boolean }): boolean {
    return !!i.equipped || !catalog.get(i.definition).slot;
  }
  private static up(c: Creature): boolean {
    return c.state.hp > 0 && !c.state.conditions.some(s => Effects.skips(s.id));
  }
  // Trained in a skill: by background or profession, by having taken it up with a level's development, or by a trait
  // held that brings it (a sign's gift: one born under the Fox goes unseen).
  private static trained(id: string, c: Creature): boolean {
    return Overlays.skills(c).includes(id) || (c.state.skills ?? []).includes(id) || this.gifted(id, c);
  }
  static gifted(id: string, c: Pick<Creature, 'traits'>): boolean {
    return (c.traits ?? []).some(t => Traits.of(Canon.resolve('traits', t))?.skills?.includes(id));
  }
  // A condition that brings what it grants though its holder has fallen (a conjured light).
  private static unheld(id: string, c: Creature): boolean {
    return c.state.conditions.some(s => {
      const condition = Conditions.of(s.id);
      return !!condition?.unheld && !!condition.grants?.includes(id);
    });
  }
}
