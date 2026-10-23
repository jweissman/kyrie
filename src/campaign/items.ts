import { Canon } from '../canon/canon';
import { ItemCatalog } from '../item-catalog';
import { Creation } from '../rules/creation';
import { AbilityUse } from '../ability-use';
import { CombatProjection } from '../combat-projection';
import { Content } from '../content';
import { Expressions } from '../expressions';
import { Perks, type PerkContext } from '../rules/perks';
import { Searching } from '../rules/searching';
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
  // A search by a company with a perk for finds (a foundry's jury-rigging) turns up an extra consumable for whichever
  // living member carries least: Orsino's lootBonus.
  // Orsino's loot bonus: a search that finds what is hidden also turns up that many common consumables, which the
  // searcher keeps. Kyr's searcher is the member with the best eye, and finds only if its check, taken at 10, passes.
  static rummage(store: CreatureStore, members: string[], options: { seed: string; at?: PerkContext }): CombatEvent[] {
    const searcher = Searching.searcher(members.map(id => store.get(id)), options.at);
    const finds = searcher && Searching.finds(searcher, options.at) ? Perks.bonus(searcher.traits, 'loot', options.at) : 0;
    if (!finds) { return []; }
    const pool = Object.entries(Canon.items).filter(([, d]) => d.category === 'consumable').map(([k]) => k).sort();
    const roll = new Expressions(options.seed), events: CombatEvent[] = [];
    for (let n = 0; n < finds; n++) {
      const definition = pool[roll.number(`1d${pool.length}`) - 1]!;
      events.push(...this.take(store, searcher!.id, { id: `${searcher!.id}__found_${roll.number('1d1000000')}`, definition }));
    }
    return events;
  }
  static equip(store: CreatureStore, owner: string, id: string, label?: string): CombatEvent[] {
    const lease = store.acquire([owner]);
    try {
      const creature = lease.creatures[0]!, item = creature.state.inventory?.find(i => i.id === id);
      if (!creature.state.hp || !item) { throw new Error('Item is not owned by a living wearer'); }
      const definition = ItemCatalog.get(item.definition);
      if (!definition.slot) { throw new Error('Item cannot be equipped'); }
      if (!Creation.canEquip(creature.classId, item.definition)) {
        throw new Error(`${creature.name} is not proficient with ${definition.name}`);
      }
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
    return hazard?.effect ? parseAbility(hazard.id, hazard.name, hazard.effect)
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
  // A shrine's blessing, as Orsino's shrine gives it: a good god's heals a little and another's hurts a little (Orsino
  // draws necrotic or radiant; Kyr gives the dark gods necrotic and the rest radiant), and the god's favour, the
  // blessing of its faith's domain, goes with the one it was asked for into their next ten turns of fighting.
  static bless(store: CreatureStore, options: { target: string; source: string; faith: string; seed: string;
    name?: string }): CombatEvent[] {
    const id = options.faith.replace(/^.*__/, '').replace(/^faith_/, ''), domain = Canon.domains[id];
    if (!domain?.blessing) { throw new Error(`The faith of ${id} has no shrine blessing`); }
    const touch = domain.alignment === 'good' ? 'Heal (1d3) health to ally.'
      : `Deal (1d2) ${domain.alignment === 'evil' ? 'necrotic' : 'radiant'} damage to ally.`;
    const ability = parseAbility(`favor_${id}`, `Favour of ${domain.name.toLowerCase()}`, `${touch} Apply favor_${id} to ally for 10 turns.`);
    return this.resolve(store, { ids: [options.target], ability, actorId: options.source,
      targetId: options.target, seed: options.seed,
      source: { id: options.source, kind: 'shrine', name: options.name ?? domain.name } });
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
      if (actor && (!actor.hp || actor.statuses.some(s => Effects.skips(s.id)))) {
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
      // Outside a fight there are no turns. What takes someone out of it (asleep, held, stunned) lasts as many
      // watches of the world's clock as it would have lasted turns, and wears off as time passes; what only matters
      // blow by blow (a bleed, a sting's poison) ends with the moment, as at the end of a fight.
      next.forEach(c => {
        c.state.conditions = c.state.conditions.filter(s => Effects.lasting(s) || Effects.skips(s.id))
          .map(s => Effects.lasting(s) ? s : { ...s, clock: 'world-time' as const });
      });
      lease.commit(next);
      return context.events;
    } finally { lease.release(); }
  }
}
