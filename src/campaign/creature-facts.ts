import { Spellcasting } from '../rules/spellcasting';
import { ItemCatalog } from '../item-catalog';
import { Fighting } from '../rules/fighting';
import { Creation } from '../rules/creation';
import { Content } from '../content';
import { FieldUse } from './field-use';
import { CreatureStore } from '../creature-store';
import { Effects } from '../effects';
import { ModuleWriter } from '../lang/module-writer';
import type { Change } from '../lang/module';
import { World } from '../lang/world';
import type { CampaignActor } from './definition';
import type { Creature } from '../creature';
import { PartyCapabilities } from './party-capabilities';
import { Advancement } from '../rules/advancement';

// A materialized planning view. CreatureStore remains authoritative for health and personal currency.
export class CreatureFacts {
  // Every relation or measure `project` writes.
  static readonly written = ['capable', 'memberOf', 'awake', 'needsCare', 'ownedItem', 'wearing', 'proficient', 'canTrain',
    'treatable', 'canCast', 'able', 'dead', 'quantity', 'swappable', 'company', 'improvable', 'learnable', 'brings'];
  // Changes whenever the store or a relation `project` writes has changed.
  static stamp(world: World, store: CreatureStore): string {
    return `${store.version}:${CreatureFacts.written.map(name => world.stamp(name)).join()}`;
  }
  static project(world: World, actors: CampaignActor[], store: CreatureStore): World {
    const changes: Change[] = [];
    const abilityIds = new Set(world.module.entities.filter(e => e.type === 'ability').map(e => e.id));
    const declaredAbilities = Content.abilities.filter(a => abilityIds.has(a.id));
    const fieldAbilities = declaredAbilities.filter(a => FieldUse.safe(a.id));
    const { entities, relations } = world.module, has = new Set(relations.map(r => r.name));
    const capabilities = entities.filter(e => e.type === 'capability'), items = entities.filter(e => e.type === 'item');
    const kinds = entities.filter(e => e.type === 'itemkind');
    const references = new Map(entities.filter(e => e.creatureId).map(e => [e.creatureId!, e.id]));
    for (const actor of actors) {
      const members = actor.members.map(id => store.get(id));
      if (has.has('capable')) {
        for (const capability of capabilities) {
          changes.push({ kind: PartyCapabilities.has(capability.id, members) ? 'assert' : 'retract',
            call: ModuleWriter.call('capable', actor.id, capability.id) });
        }
      }
      if (has.has('brings')) {
        for (const c of members) {
          for (const capability of capabilities) {
            changes.push({ kind: PartyCapabilities.brings(capability.id, c) ? 'assert' : 'retract',
              call: ModuleWriter.call('brings', references.get(c.id)!, capability.id) });
          }
        }
      }
      if (has.has('memberOf')) {
        for (const c of members) {
          const reference = references.get(c.id);
          if (!reference) { throw new Error(`Missing canonical member binding for ${c.id}`); }
          const ready = c.state.hp > 0 && !c.state.conditions.some(s => Effects.skips(s.id));
          changes.push({ kind: 'assert', call: ModuleWriter.call('memberOf', reference, actor.id) });
          changes.push({ kind: ready ? 'assert' : 'retract', call: ModuleWriter.call('awake', reference) });
          changes.push({ kind: c.state.hp < c.base.maxHp || c.state.conditions.length ? 'assert' : 'retract',
            call: ModuleWriter.call('needsCare', reference) });
          if (has.has('ownedItem')) {
            for (const item of items) {
              const owned = c.state.inventory?.find(i => i.id === item.id);
              changes.push({ kind: owned ? 'assert' : 'retract', call: ModuleWriter.call('ownedItem', item.id, reference) });
              changes.push({ kind: owned?.equipped ? 'assert' : 'retract', call: ModuleWriter.call('wearing', item.id, reference) });
            }
          }
          if (has.has('proficient')) {
            for (const kind of kinds) {
              changes.push({ kind: Creation.canEquip(c.classId, kind.id) ? 'assert' : 'retract',
                call: ModuleWriter.call('proficient', reference, kind.id) });
            }
          }
          if (has.has('canTrain')) {
            for (const a of declaredAbilities) {
              const eligible = ready && c.state.experience >= 20
                && ![...c.base.abilities, ...c.state.learnedAbilities].includes(a.id);
              changes.push({ kind: eligible ? 'assert' : 'retract', call: ModuleWriter.call('canTrain', reference, a.id) });
            }
          }
          for (const item of c.state.inventory ?? []) { ItemCatalog.get(item.definition); }
          const known = new Set([...c.base.abilities, ...c.state.learnedAbilities,
            ...Object.keys(ItemCatalog.abilities(c))]);
          for (const a of fieldAbilities) {
            const useful = a.effects.some(e => (e.kind === 'heal' && c.state.hp < c.base.maxHp)
              || (e.kind === 'remove' && c.state.conditions.some(s => s.id === e.status))
              || (e.kind === 'apply' && !c.state.conditions.some(s => s.id === e.status)));
            changes.push({ kind: useful ? 'assert' : 'retract', call: ModuleWriter.call('treatable', reference, a.id) });
            // Orsino's gate outside combat too: a spell or levelled skill above ⌈level / 2⌉ cannot be used yet.
            const usable = ready && known.has(a.id) && Spellcasting.affordable(c.state, a)
              && (a.spell?.level ?? a.level ?? 0) <= Fighting.maxSpellLevel(c.base.level);
            changes.push({ kind: usable ? 'assert' : 'retract', call: ModuleWriter.call('canCast', reference, a.id) });
          }
        }
      }
      if (has.has('swappable')) { changes.push(...this.swaps(world, members, references, abilityIds)); }
      if (has.has('learnable')) { changes.push(...this.lessons(world, members, references)); }
      if (has.has('improvable')) {
        for (const c of members) {
          const open = c.state.hp > 0 && (c.state.advances?.qualities ?? 0) > 0;
          changes.push({ kind: open ? 'assert' : 'retract', call: ModuleWriter.call('improvable', references.get(c.id)!) });
        }
      }
      if (has.has('company')) { changes.push({ kind: actor.player ? 'assert' : 'retract', call: ModuleWriter.call('company', actor.id) }); }
      const alive = members.some(c => c.state.hp > 0);
      const able = members.some(c => c.state.hp > 0 && !c.state.conditions.some(s => Effects.skips(s.id)));
      for (const [name, active] of [['able', able], ['dead', !alive]] as const) {
        changes.push({ kind: active ? 'assert' : 'retract', call: ModuleWriter.call(name, actor.id) });
      }
      changes.push({ kind: 'set', call: ModuleWriter.call('quantity', actor.id, 'gold'),
        value: ModuleWriter.number(members.reduce((sum, c) => sum + c.state.gold, 0)) });
    }
    const different = changes.filter(c => c.kind === 'assert' ? !world.test(c.call) :
      c.kind === 'retract' ? world.test(c.call) :
        'value' in c && c.value.kind !== 'call' && World.literal(c.value) !== world.number(c.call));
    return different.length ? world.apply(different) : world;
  }
  // The spells each caster could prepare in place of one it has prepared: a known spell, castable at its level,
  // of the slot's level or lower. Written as the whole set, so a swap no longer possible is retracted.
  private static swaps(world: World, members: Creature[], references: Map<string, string>,
    abilities: Set<string>): Change[] {
    const refs = new Set(members.map(c => references.get(c.id)!)), desired = new Map<string, string[]>();
    for (const c of members) {
      const reference = references.get(c.id)!;
      const known = Spellcasting.known(c).filter(id => abilities.has(id)
        && Spellcasting.levelOf(id) <= Fighting.maxSpellLevel(c.base.level));
      (c.state.prepared ?? []).forEach((slots, i) => {
        for (const outgoing of new Set(slots)) {
          for (const incoming of known.filter(id => id !== outgoing && Spellcasting.levelOf(id) <= i + 1)) {
            const args = [reference, `circle_${i + 1}`, outgoing, incoming];
            desired.set(args.join('|'), args);
          }
        }
      });
    }
    const present = world.snapshot.relations.filter(r => r.name === 'swappable' && refs.has(r.args[0]!));
    return [...present.filter(r => !desired.has(r.args.join('|')))
      .map(r => ({ kind: 'retract' as const, call: ModuleWriter.call('swappable', ...r.args) })),
    ...[...desired.values()].map(args => ({ kind: 'assert' as const, call: ModuleWriter.call('swappable', ...args) }))];
  }
  // The spells each caster with a level's spell to spend may learn, written as the whole set.
  private static lessons(world: World, members: Creature[], references: Map<string, string>): Change[] {
    const refs = new Set(members.map(c => references.get(c.id)!));
    const desired = new Set(members.flatMap(c => Advancement.learnable(c).map(id => `${references.get(c.id)!}|${id}`)));
    const present = world.snapshot.relations.filter(r => r.name === 'learnable' && refs.has(r.args[0]!));
    return [...present.filter(r => !desired.has(r.args.join('|')))
      .map(r => ({ kind: 'retract' as const, call: ModuleWriter.call('learnable', ...r.args) })),
    ...[...desired].map(key => ({ kind: 'assert' as const, call: ModuleWriter.call('learnable', ...key.split('|')) }))];
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
