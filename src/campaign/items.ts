import { Canon } from '../canon/canon';
import { ItemCatalog } from '../item-catalog';
import { AbilityUse } from '../ability-use';
import { CombatProjection } from '../combat-projection';
import { Content } from '../content';
import { Expressions } from '../expressions';
import { Effects, type EffectContext } from '../effects';
import { parseAbility, type ArenaAbility } from '../lang/parse';
import type { CreatureStore } from '../creature-store';
import type { Entity } from '../lang/module';
import type { CombatEvent } from '../model';

export interface ItemRef { id: string; label?: string }

// Item ownership is canonical creature state. World predicates are an inspectable planning projection.
export class Items {
  private static readonly consumables = new Map<string, ArenaAbility>();
  // An item is named in events by its world label (an authored instance name) when it has one, else by its kind.
  static take(store: CreatureStore, owner: string, item: ItemRef & { definition: string }): CombatEvent[] {
    const { id, definition, label } = item;
    ItemCatalog.get(definition);
    if (store.snapshot.some(c => c.state.inventory?.some(i => i.id === id))) { throw new Error('Item already owned'); }
    const lease = store.acquire([owner]);
    try {
      const creature = lease.creatures[0]!;
      if (!creature.state.hp) { throw new Error('Dead creatures cannot collect items'); }
      (creature.state.inventory ??= []).push({ id, definition });
      lease.commit(lease.creatures);
      return [{ type: 'gain', turn: 0, actor: owner, target: owner, detail: label ?? ItemCatalog.get(definition).name, amount: 1 }];
    } finally { lease.release(); }
  }
  static equip(store: CreatureStore, owner: string, id: string, label?: string): CombatEvent[] {
    const lease = store.acquire([owner]);
    try {
      const creature = lease.creatures[0]!, item = creature.state.inventory?.find(i => i.id === id);
      if (!creature.state.hp || !item) { throw new Error('Item is not owned by a living wearer'); }
      const definition = ItemCatalog.get(item.definition);
      if (!definition.slot) { throw new Error('Item cannot be equipped'); }
      for (const other of creature.state.inventory!) {
        if (ItemCatalog.get(other.definition).slot === definition.slot) { other.equipped = false; }
      }
      item.equipped = true;
      lease.commit(lease.creatures);
      return [{ type: 'gain', turn: 0, actor: owner, target: owner, detail: `equipped ${label ?? definition.name}` }];
    } finally { lease.release(); }
  }
  static consume(store: CreatureStore, options: { owner: string; target: string; id: string; seed: string
  }): CombatEvent[] {
    const { owner, target, id, seed } = options;
    const item = store.get(owner).state.inventory?.find(i => i.id === id);
    if (!item) { throw new Error('Item is not owned'); }
    const definition = ItemCatalog.get(item.definition);
    if (!definition.use) { throw new Error('Item is not consumable'); }
    const ability = this.consumable(item.definition, definition.name, definition.use);
    return this.resolve(store, { ids: [owner, target], ability, actorId: owner, targetId: target, seed,
      source: { id, kind: 'item', name: definition.name }, consumed: id });
  }
  private static hazard(id: string, entities: Entity[] = []): ArenaAbility | undefined {
    const hazard = entities.find(e => e.id === id && e.type === 'hazard');
    return hazard?.effect ? { ...parseAbility(hazard.id, hazard.name, hazard.effect), damagePolicy: 'typed-v1' }
      : Content.abilities.find(a => a.id === id);
  }
  // A hazard is a mechanism of the installed module, carrying its own effect; legacy modules still name global
  // abilities.
  static expose(store: CreatureStore, options: { target: string; ability: string; source: string; seed: string;
    entities?: Entity[] }): CombatEvent[] {
    const { target, ability, source, seed } = options;
    const definition = this.hazard(ability, options.entities);
    if (!definition) { throw new Error(`Unknown hazard ${ability}`); }
    return this.resolve(store, { ids: [target], ability: definition, actorId: source, targetId: target, seed,
      source: { id: source, kind: 'trap', name: definition.name } });
  }
  static exposeArea(store: CreatureStore, options: { targets: string[]; ability: string; source: string; seed: string;
    entities?: Entity[] }): CombatEvent[] {
    const ability = this.hazard(options.ability, options.entities);
    if (!ability || !options.targets.length || ability.effects.some(e => !['all', 'allies', 'party'].includes(e.target))) {
      throw new Error('Area effects need explicit recipients and plural selectors');
    }
    return this.resolve(store, { ids: options.targets, ability, actorId: options.source,
      targetId: options.targets[0]!, seed: options.seed, source: { id: options.source, kind: 'trap', name: ability.name } });
  }
  static bless(store: CreatureStore, options: { target: string; source: string; deity: string; seed: string
  }): CombatEvent[] {
    const tradition = Canon.deities[options.deity];
    if (!tradition?.blessing) { throw new Error('This deity has no executable shrine blessing'); }
    const ability = Content.abilities.find(a => a.id === tradition.blessing!.id)!;
    return this.resolve(store, { ids: [options.target], ability, actorId: options.source,
      targetId: options.target, seed: options.seed,
      source: { id: options.source, kind: 'shrine', name: tradition.name } });
  }
  static transfer(store: CreatureStore, moved: ItemRef, owner: string, recipient: string): CombatEvent[] {
    const { id, label } = moved;
    if (owner === recipient) { throw new Error('Choose a different recipient'); }
    const lease = store.acquire([owner, recipient]);
    try {
      const from = lease.creatures[0]!, to = lease.creatures[1]!;
      const item = from.state.inventory?.find(i => i.id === id);
      if (!item || !to.state.hp) { throw new Error('Transfer needs an owned item and living recipient'); }
      from.state.inventory = from.state.inventory!.filter(i => i.id !== id);
      (to.state.inventory ??= []).push({ ...item, equipped: false });
      lease.commit(lease.creatures);
      return [{ type: 'gain', turn: 0, actor: owner, target: recipient, detail: label ?? ItemCatalog.get(item.definition).name }];
    } finally { lease.release(); }
  }
  static drop(store: CreatureStore, owner: string, id: string, label?: string): CombatEvent[] {
    const lease = store.acquire([owner]);
    try {
      const creature = lease.creatures[0]!, item = creature.state.inventory?.find(i => i.id === id);
      if (!item || !creature.state.hp) { throw new Error('Cannot release unowned item'); }
      creature.state.inventory = creature.state.inventory!.filter(i => i.id !== id);
      lease.commit(lease.creatures);
      const name = label ?? ItemCatalog.get(item.definition).name;
      return [{ type: 'gain', turn: 0, actor: owner, target: owner, detail: `set down ${name}` }];
    } finally { lease.release(); }
  }
  static train(store: CreatureStore, target: string, ability: string, cost = 20): CombatEvent[] {
    if (!Content.abilities.some(a => a.id === ability)) { throw new Error('Unknown training ability'); }
    const lease = store.acquire([target]);
    try {
      const c = lease.creatures[0]!;
      if (!c.state.hp || c.state.experience < cost
        || [...c.base.abilities, ...c.state.learnedAbilities].includes(ability)) {
        throw new Error('Training requires a living student, unlearned technique and sufficient experience');
      }
      c.state.experience -= cost; c.state.learnedAbilities.push(ability); lease.commit(lease.creatures);
      return [{ type: 'learn', turn: 0, actor: target, target, detail: ability }];
    } finally { lease.release(); }
  }
  private static consumable(kind: string, name: string, source: string): ArenaAbility {
    let ability = this.consumables.get(kind);
    if (!ability) { ability = parseAbility(`item-${kind}`, name, source); this.consumables.set(kind, ability); }
    return { ...ability, name };
  }
  private static resolve(store: CreatureStore, options: { ids: string[]; ability: ArenaAbility; actorId: string;
    targetId: string; seed: string; source: NonNullable<EffectContext['source']>; consumed?: string }): CombatEvent[] {
    const { ids, ability, actorId, targetId, seed, source, consumed } = options;
    ability.effects.forEach(e => Effects.validate(e, Content.abilities.map(a => a.id)));
    const lease = store.acquire([...new Set(ids)]);
    try {
      const fighters = lease.creatures.map(c => CombatProjection.fighter(c, 'fighters'));
      const actor = fighters.find(c => c.id === actorId);
      if (actor && (!actor.hp || actor.statuses.some(s => Effects.status(s.id).skip))) {
        throw new Error('Source cannot act');
      }
      if (!actor && !['trap', 'shrine'].includes(source.kind)) { throw new Error('Missing creature source'); }
      const context: EffectContext = { actor, fighters, turn: 0, events: [], source,
        ...(!actor ? { recipients: fighters } : {}),
        content: new Content(`${seed}:content`), abilities: Content.abilities.map(a => a.id), retreat: false, location: null };
      AbilityUse.perform(ability, targetId, new Expressions(seed), context);
      const next = lease.creatures.map(c => CombatProjection.creature(fighters.find(f => f.id === c.id)!, c));
      if (consumed) {
        const owner = next.find(c => c.id === actorId)!;
        owner.state.inventory = owner.state.inventory!.filter(i => i.id !== consumed);
      }
      // Field durations are not silently counted as elapsed world time: only persistent attachments survive.
      next.forEach(c => { c.state.conditions = c.state.conditions.filter(s => Effects.status(s.id).lifetime === 'persistent'); });
      lease.commit(next);
      return context.events;
    } finally { lease.release(); }
  }
}
