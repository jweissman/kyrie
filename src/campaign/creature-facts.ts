import { Spellcasting } from '../rules/spellcasting';
import { ItemCatalog } from '../item-catalog';
import { Fighting } from '../rules/fighting';
import { Creation } from '../rules/creation';
import { Content } from '../content';
import { FieldUse } from './field-use';
import { CreatureStore } from '../creature-store';
import { Effects } from '../effects';
import { ModuleWriter } from '../lang/module-writer';
import type { Change, Module } from '../lang/module';
import type { ArenaAbility } from '../lang/parse';
import { World } from '../lang/world';
import type { CampaignActor } from './definition';
import type { Creature } from '../creature';
import { PartyCapabilities } from './party-capabilities';
import { Advancement } from '../rules/advancement';

type Entity = Module['entities'][number];
interface Scope {
  has: Set<string>; abilityIds: Set<string>; declared: ArenaAbility[]; field: ArenaAbility[];
  capabilities: Entity[]; items: Entity[]; kinds: Entity[]; references: Map<string, string>;
}
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
    const scope = this.scope(world), changes: Change[] = [];
    for (const actor of actors) {
      const members = actor.members.map(id => store.get(id));
      changes.push(...this.group(actor, members, scope));
      if (scope.has.has('memberOf')) { for (const c of members) { changes.push(...this.member(c, actor.id, scope)); } }
      if (scope.has.has('swappable')) { changes.push(...this.swaps(world, members, scope.references, scope.abilityIds)); }
      if (scope.has.has('learnable')) { changes.push(...this.lessons(world, members, scope.references)); }
    }
    const different = changes.filter(c => c.kind === 'assert' ? !world.test(c.call) :
      c.kind === 'retract' ? world.test(c.call) :
        'value' in c && c.value.kind !== 'call' && World.literal(c.value) !== world.number(c.call));
    return different.length ? world.apply(different) : world;
  }
  // What the world declares that the projection writes about: which relations it has, and its capabilities,
  // items, item kinds, member bindings and abilities.
  private static scope(world: World): Scope {
    const { entities, relations } = world.module;
    const abilityIds = new Set(entities.filter(e => e.type === 'ability').map(e => e.id));
    const declared = Content.abilities.filter(a => abilityIds.has(a.id));
    return { has: new Set(relations.map(r => r.name)), abilityIds, declared,
      field: declared.filter(a => FieldUse.safe(a.id)),
      capabilities: entities.filter(e => e.type === 'capability'), items: entities.filter(e => e.type === 'item'),
      kinds: entities.filter(e => e.type === 'itemkind'),
      references: new Map(entities.filter(e => e.creatureId).map(e => [e.creatureId!, e.id])) };
  }
  // What the company as a whole can do and is: its skills, who brings each, whether it can act, and its coin.
  private static group(actor: CampaignActor, members: Creature[], scope: Scope): Change[] {
    const changes: Change[] = [], { has, capabilities, references } = scope;
    if (has.has('capable')) {
      for (const capability of capabilities) {
        changes.push({ kind: PartyCapabilities.has(capability.id, members) ? 'assert' : 'retract',
          call: ModuleWriter.call('capable', actor.id, capability.id) });
      }
    }
    for (const c of has.has('brings') ? members : []) {
      for (const capability of capabilities) {
        changes.push({ kind: PartyCapabilities.brings(capability.id, c) ? 'assert' : 'retract',
          call: ModuleWriter.call('brings', references.get(c.id)!, capability.id) });
      }
    }
    for (const c of has.has('improvable') ? members : []) {
      const open = c.state.hp > 0 && (c.state.advances?.qualities ?? 0) > 0;
      changes.push({ kind: open ? 'assert' : 'retract', call: ModuleWriter.call('improvable', references.get(c.id)!) });
    }
    if (has.has('company')) {
      changes.push({ kind: actor.player ? 'assert' : 'retract', call: ModuleWriter.call('company', actor.id) });
    }
    const alive = members.some(c => c.state.hp > 0);
    const able = members.some(c => c.state.hp > 0 && !c.state.conditions.some(s => Effects.skips(s.id)));
    for (const [name, active] of [['able', able], ['dead', !alive]] as const) {
      changes.push({ kind: active ? 'assert' : 'retract', call: ModuleWriter.call(name, actor.id) });
    }
    changes.push({ kind: 'set', call: ModuleWriter.call('quantity', actor.id, 'gold'),
      value: ModuleWriter.number(members.reduce((sum, c) => sum + c.state.gold, 0)) });
    return changes;
  }
  // One companion: whose they are, whether awake or hurt, what they own and wear and can wield, and what they could
  // be taught, could treat, and could cast now.
  private static member(c: Creature, actor: string, scope: Scope): Change[] {
    const { has, items, kinds, references } = scope, changes: Change[] = [];
    const reference = references.get(c.id);
    if (!reference) { throw new Error(`Missing canonical member binding for ${c.id}`); }
    const ready = c.state.hp > 0 && !c.state.conditions.some(s => Effects.skips(s.id));
    changes.push({ kind: 'assert', call: ModuleWriter.call('memberOf', reference, actor) });
    changes.push({ kind: ready ? 'assert' : 'retract', call: ModuleWriter.call('awake', reference) });
    changes.push({ kind: c.state.hp < c.base.maxHp || c.state.conditions.length ? 'assert' : 'retract',
      call: ModuleWriter.call('needsCare', reference) });
    for (const item of has.has('ownedItem') ? items : []) {
      const owned = c.state.inventory?.find(i => i.id === item.id);
      changes.push({ kind: owned ? 'assert' : 'retract', call: ModuleWriter.call('ownedItem', item.id, reference) });
      changes.push({ kind: owned?.equipped ? 'assert' : 'retract', call: ModuleWriter.call('wearing', item.id, reference) });
    }
    for (const kind of has.has('proficient') ? kinds : []) {
      changes.push({ kind: Creation.canEquip(c.classId, kind.id) ? 'assert' : 'retract',
        call: ModuleWriter.call('proficient', reference, kind.id) });
    }
    for (const a of has.has('canTrain') ? scope.declared : []) {
      const eligible = ready && c.state.experience >= 20
        && ![...c.base.abilities, ...c.state.learnedAbilities].includes(a.id);
      changes.push({ kind: eligible ? 'assert' : 'retract', call: ModuleWriter.call('canTrain', reference, a.id) });
    }
    for (const item of c.state.inventory ?? []) { ItemCatalog.get(item.definition); }
    const known = new Set([...c.base.abilities, ...c.state.learnedAbilities, ...Object.keys(ItemCatalog.abilities(c))]);
    for (const a of scope.field) {
      const useful = a.effects.some(e => (e.kind === 'heal' && c.state.hp < c.base.maxHp)
        || (e.kind === 'remove' && c.state.conditions.some(s => s.id === e.status))
        || (e.kind === 'apply' && !c.state.conditions.some(s => s.id === e.status)));
      changes.push({ kind: useful ? 'assert' : 'retract', call: ModuleWriter.call('treatable', reference, a.id) });
      // Orsino's gate outside combat too: a spell or levelled skill above ⌈level / 2⌉ cannot be used yet.
      const usable = ready && known.has(a.id) && Spellcasting.affordable(c.state, a)
        && (a.spell?.level ?? a.level ?? 0) <= Fighting.maxSpellLevel(c.base.level);
      changes.push({ kind: usable ? 'assert' : 'retract', call: ModuleWriter.call('canCast', reference, a.id) });
    }
    return changes;
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
