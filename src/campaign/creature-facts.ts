import { ItemCatalog } from '../item-catalog';
import { Content } from '../content';
import { FieldUse } from './field-use';
import { CreatureStore } from '../creature-store';
import { Effects } from '../effects';
import { ModuleWriter } from '../lang/module-writer';
import type { Change } from '../lang/module';
import { World } from '../lang/world';
import type { CampaignActor } from './definition';
import { PartyCapabilities } from './party-capabilities';

// A materialized planning view. CreatureStore remains authoritative for health and personal currency.
export class CreatureFacts {
  static project(world: World, actors: CampaignActor[], store: CreatureStore): World {
    const changes: Change[] = [];
    const declaredAbilities = Content.abilities.filter(a => world.module.entities.some(e =>
      e.type === 'ability' && e.id === a.id));
    const fieldAbilities = declaredAbilities.filter(a => FieldUse.safe(a.id));
    for (const actor of actors) {
      const members = actor.members.map(id => store.get(id));
      if (world.module.relations.some(r => r.name === 'capable')) {
        for (const capability of world.module.entities.filter(e => e.type === 'capability')) {
          changes.push({ kind: PartyCapabilities.has(capability.id, members) ? 'assert' : 'retract',
            call: ModuleWriter.call('capable', actor.id, capability.id) });
        }
      }
      if (world.module.relations.some(r => r.name === 'memberOf')) {
        for (const c of members) {
          const reference = world.module.entities.find(e => e.creatureId === c.id)?.id;
          if (!reference) { throw new Error(`Missing canonical member binding for ${c.id}`); }
          const ready = c.state.hp > 0 && !c.state.conditions.some(s => Effects.status(s.id).skip);
          changes.push({ kind: 'assert', call: ModuleWriter.call('memberOf', reference, actor.id) });
          changes.push({ kind: ready ? 'assert' : 'retract', call: ModuleWriter.call('awake', reference) });
          changes.push({ kind: c.state.hp < c.base.maxHp || c.state.conditions.length ? 'assert' : 'retract',
            call: ModuleWriter.call('needsCare', reference) });
          if (world.module.relations.some(r => r.name === 'ownedItem')) {
            for (const item of world.module.entities.filter(e => e.type === 'item')) {
              const owned = c.state.inventory?.find(i => i.id === item.id);
              changes.push({ kind: owned ? 'assert' : 'retract', call: ModuleWriter.call('ownedItem', item.id, reference) });
              changes.push({ kind: owned?.equipped ? 'assert' : 'retract', call: ModuleWriter.call('wearing', item.id, reference) });
            }
          }
          if (world.module.relations.some(r => r.name === 'canTrain')) {
            for (const a of declaredAbilities) {
              const eligible = ready && c.state.experience >= 20
                && ![...c.base.abilities, ...c.state.learnedAbilities].includes(a.id);
              changes.push({ kind: eligible ? 'assert' : 'retract', call: ModuleWriter.call('canTrain', reference, a.id) });
            }
          }
          for (const item of c.state.inventory ?? []) { ItemCatalog.get(item.definition); }
          for (const a of fieldAbilities) {
            const useful = a.effects.some(e => (e.kind === 'heal' && c.state.hp < c.base.maxHp)
              || (e.kind === 'remove' && c.state.conditions.some(s => s.id === e.status))
              || (e.kind === 'apply' && !c.state.conditions.some(s => s.id === e.status)));
            changes.push({ kind: useful ? 'assert' : 'retract', call: ModuleWriter.call('treatable', reference, a.id) });
            const known = [...c.base.abilities, ...c.state.learnedAbilities, ...Object.keys(ItemCatalog.abilities(c))];
            const usable = ready && known.includes(a.id)
              && c.state.mana >= (a.cost ?? 0);
            changes.push({ kind: usable ? 'assert' : 'retract', call: ModuleWriter.call('canCast', reference, a.id) });
          }
        }
      }
      const alive = members.some(c => c.state.hp > 0);
      const able = members.some(c => c.state.hp > 0 && !c.state.conditions.some(s => Effects.status(s.id).skip));
      for (const [name, active] of [['able', able], ['dead', !alive]] as const) {
        changes.push({ kind: active ? 'assert' : 'retract', call: ModuleWriter.call(name, actor.id) });
      }
      changes.push({ kind: 'set', call: ModuleWriter.call('quantity', actor.id, 'gold'),
        value: ModuleWriter.number(members.reduce((sum, c) => sum + c.state.gold, 0)) });
    }
    const snapshot = world.snapshot;
    const facts = new Set(snapshot.relations.map(World.key));
    const measures = new Map(snapshot.measures.map(m => [World.key(m.call), m.value]));
    const different = changes.filter(c => c.kind === 'assert' ? !facts.has(World.key(c.call)) :
      c.kind === 'retract' ? facts.has(World.key(c.call)) :
        'value' in c && c.value.kind !== 'call' && World.literal(c.value) !== (measures.get(World.key(c.call)) ?? 0));
    return different.length ? world.apply(different) : world;
  }
  static initialize(world: World, actors: CampaignActor[], store: CreatureStore) {
    for (const actor of actors) {
      const lease = store.acquire(actor.members);
      try {
        const amount = world.number(ModuleWriter.call('quantity', actor.id, 'gold'));
        lease.creatures[0]!.state.gold += amount;
        lease.commit(lease.creatures);
      } finally { lease.release(); }
    }
  }
  static commitMoney(before: World, after: World, actors: CampaignActor[], store: CreatureStore) {
    const changed = actors.map(actor => ({ actor,
      delta: after.number(ModuleWriter.call('quantity', actor.id, 'gold'))
        - before.number(ModuleWriter.call('quantity', actor.id, 'gold')),
    })).filter(change => change.delta !== 0);
    if (!changed.length) { return; }
    const lease = store.acquire(changed.flatMap(c => c.actor.members));
    try {
      for (const { actor, delta } of changed) {
        const members = actor.members.map(id => lease.creatures.find(c => c.id === id)!);
        if (delta > 0) { members[0]!.state.gold += delta; }
        else {
          let remaining = -delta;
          for (const c of members) {
            const amount = Math.min(c.state.gold, remaining);
            c.state.gold -= amount; remaining -= amount;
          }
          if (remaining) { throw new Error('Insufficient canonical currency'); }
        }
      }
      lease.commit(lease.creatures);
    } finally { lease.release(); }
  }
}
