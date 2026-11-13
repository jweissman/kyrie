import { CanonRuntime, type RuntimeItem } from './canon/canon-runtime';
import { Canon } from './canon/canon';
import type { HookKey, Hooks } from './canon/schema';
import { parseAbility, type ArenaAbility, type Effect } from './lang/parse';
import { ModifierSet, type Modifiers } from './rules/modifiers';
import type { WeaponProfile } from './rules/fighting';
import type { Attribute, Creature } from './creature';
import { CreatureVariants } from './creature-variants';
export type ItemDefinition = RuntimeItem;
export interface Equipment {
  modifiers: Modifiers; hooks: Hooks; weapon: WeaponProfile; armorAc: number;
  // A kind's natural attacks in a round, each its own weapon (a dragon's claw, claw and bite; see Species).
  routine?: WeaponProfile[];
}

export class ItemCatalog {
  static readonly definitions: Record<string, ItemDefinition> = CanonRuntime.items();
  static get(id: string): ItemDefinition {
    const result = this.definitions[id];
    if (!result) { throw new Error(`Unknown item definition ${id}`); }
    return result;
  }
  static abilities(creature: Creature): Record<string, { id: string; kind: 'item'; name: string }> {
    return Object.fromEntries((creature.state.inventory ?? []).filter(i => i.equipped)
      .flatMap(i => { const d = this.get(i.definition); return d.ability
        ? [[d.ability, { id: i.id, kind: 'item' as const, name: d.name }]] : []; }));
  }
  // What using a thing of a kind does, as an ability (a healing potion's "Heal (2d4 + 2) health to ally."), kept by
  // the kind and its use (the architecture review's H7); found by the ability's id too ("item-healing_potion").
  private static readonly uses = new Map<string, ArenaAbility | undefined>();
  static use(kind: string): ArenaAbility | undefined {
    const d = this.definitions[kind], key = `${kind}\u0000${d?.use ?? ''}`;
    if (!this.uses.has(key)) { this.uses.set(key, d?.use ? parseAbility(`item-${kind}`, d.name, d.use) : undefined); }
    return this.uses.get(key);
  }
  static used(ability: string): ArenaAbility | undefined {
    return ability.startsWith('item-') ? this.use(ability.slice(5)) : undefined;
  }
  // What a creature carries that it can use up in a fight, by the ability each is used as: a draught, a salve, a flask
  // of fire to throw; not a light, nor anything else whose use runs on the clock for hours (PT-07: a fight offered no
  // use of the alchemist's fire in the pack, though the foe was vulnerable to fire).
  static stock(creature: Creature): Record<string, string[]> {
    const stock: Record<string, string[]> = {};
    for (const i of (creature.state.inventory ?? []).filter(x => !x.equipped)) {
      const use = this.use(i.definition);
      if (use?.effects.length && use.effects.every(e => e.kind !== 'apply' || !e.clock)) { (stock[use.id] ??= []).push(i.id); }
    }
    return stock;
  }
  // How many things a slot holds at once: a ring to each hand, one of anything else (the item audit's G10).
  static holds(slot: string): number { return slot === 'ring' ? 2 : 1; }
  // A quality as its bearer has it with what they wear (a belt of giant strength's six), out of a fight as in one (the
  // item audit's G9: a field check and what one can carry had read the bare quality).
  static quality(creature: Creature, stat: Attribute): number {
    const worn = (creature.state.inventory ?? []).filter(i => i.equipped)
      .reduce((n, i) => n + (this.get(i.definition).modifiers?.attributes?.[stat] ?? 0), 0);
    return creature.base[stat] + worn;
  }
  static weapon(id: string, name?: string): WeaponProfile {
    const w = this.get(id).weapon;
    if (!w) { throw new Error(`${id} is not a weapon`); }
    // A wonder's blade is magic (what the wonders' file holds: a bolt-blade, the sword of ages), and passes a guard
    // that only magic passes (the unicorn's 10/magic: the SRD adaptation briefing, §3); its own tags beside.
    const tags = [...w.tags ?? [], ...Canon.wonders.has(id) && !w.tags?.includes('magic') ? ['magic'] : []];
    return { id, name: name ?? this.get(id).name, damage: w.damage, type: w.type,
      ...w.weight ? { weight: w.weight } : {},
      ...w.missile ? { missile: true } : {}, ...w.intercept ? { intercept: true } : {},
      ...w.natural ? { natural: true } : {}, ...tags.length ? { tags } : {} };
  }
  // What a creature's equipment contributes: the wielded weapon (else its natural weapon, else a fist, as in Orsino's
  // effectiveWeapon), the body armour's ac (else its natural armour), and the modifiers and hooks of equipped items.
  static equipment(creature: Creature): Equipment {
    const equipped = (creature.state.inventory ?? []).filter(i => i.equipped);
    const natural = Canon.isBody(creature.raceId) ? Canon.creature(creature.raceId).statistics : undefined;
    const wielded = equipped.find(i => this.get(i.definition).weapon);
    const worn = equipped.find(i => this.get(i.definition).armor);
    const hooks: Hooks = {};
    for (const i of equipped) {
      for (const [key, effects] of Object.entries(this.get(i.definition).hooks ?? {})) {
        if (key !== 'reactions') { (hooks[key as HookKey] ??= []).push(...effects as Effect[]); }
      }
    }
    // A body's own blows carry its kind's riders (see Statistics.riders); a weapon in hand carries none of them.
    return { modifiers: ModifierSet.sum(equipped.map(i => this.get(i.definition).modifiers ?? {})), hooks,
      weapon: wielded ? this.weapon(wielded.definition) : this.body(CreatureVariants.weapon(creature, natural?.weapon) ?? 'fist', natural?.riders),
      armorAc: worn ? this.get(worn.definition).armor!.ac : natural?.armor ? this.get(natural.armor).armor!.ac : 0,
      ...!wielded && natural?.attacks?.length ? { routine: natural.attacks.map(id => id === natural.weapon
        ? this.body(id, natural.riders) : { ...this.body(id, natural.riders), lesser: true }) } : {} };
  }
  static body(id: string, riders?: Record<string, Effect[]>): WeaponProfile {
    const weapon = this.weapon(id), own = riders?.[id];
    return own?.length ? { ...weapon, onHit: structuredClone(own) } : weapon;
  }
}
