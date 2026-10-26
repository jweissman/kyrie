import { Canon } from '../canon/canon';
import { Spellcasting } from '../rules/spellcasting';
import { ItemCatalog } from '../item-catalog';
import { Fighting } from '../rules/fighting';
import { Creation } from '../rules/creation';
import { Content } from '../content';
import { FieldUse } from './field-use';
import { CreatureStore } from '../creature-store';
import { Effects } from '../effects';
import { ModuleWriter } from '../lang/module-writer';
import { Burden } from '../rules/burden';
import type { Change, Module } from '../lang/module';
import { parseAbility, type ArenaAbility } from '../lang/parse';
import { World } from '../lang/world';
import type { CampaignActor } from './definition';
import type { Creature } from '../creature';
import { PartyCapabilities } from './party-capabilities';
import { Advancement } from '../rules/advancement';
import { Perks, type PerkContext } from '../rules/perks';
import { Environment } from './environment';

type Entity = Module['entities'][number];
interface Declared {
  has: Set<string>; measures: Set<string>; abilityIds: Set<string>; declared: ArenaAbility[]; field: ArenaAbility[];
  capabilities: Entity[]; items: Entity[]; kinds: Entity[]; references: Map<string, string>; itemIds: Set<string>;
}
// What the module declares, with the world the projection reads what holds now from (see `set`).
interface Scope extends Declared { world: World; at?: PerkContext }
// A materialized planning view. CreatureStore remains authoritative for health and personal currency.
export class CreatureFacts {
  // Every relation or measure `project` writes.
  static readonly written = ['capable', 'memberOf', 'awake', 'needsCare', 'ownedItem', 'wearing', 'proficient', 'canTrain',
    'treatable', 'relieves', 'canCast', 'able', 'dead', 'quantity', 'swappable', 'company', 'improvable', 'learnable',
    'brings', 'featOpen', 'skillOpen', 'temperament', 'fallen', 'slain', 'craft', 'levelOf'];
  static readonly crafts = ['wild', 'roads', 'mechanisms', 'shadows', 'healing', 'faith', 'learning', 'earth', 'arms',
    'water', 'stage', 'trade', 'court', 'margins'];
  // Every relation or measure a projection writes or reads besides the creatures (see Projection).
  static readonly reads = [...CreatureFacts.written, 'carried', 'capacity', 'peaceable', 'state', 'warning', 'onslaught',
    'flinch'];
  static project(world: World, actors: CampaignActor[], store: CreatureStore): World {
    const scope = this.scope(world), changes: Change[] = [];
    for (const actor of actors) {
      const members = actor.members.map(id => store.peek(id)), environment = Environment.of(world, actor.id);
      changes.push(...this.group(actor, members, { ...scope, ...environment ? { at: { environment } } : {} }));
      if (scope.has.has('memberOf')) { for (const c of members) { changes.push(...this.member(c, actor.id, scope)); } }
      if (scope.has.has('swappable')) { changes.push(...this.swaps(world, members, scope.references, scope.abilityIds)); }
      if (scope.has.has('learnable')) { changes.push(...this.lessons(world, members, scope.references)); }
      if (scope.has.has('featOpen')) { changes.push(...this.feats(world, members, scope.references)); }
      if (scope.has.has('skillOpen')) { changes.push(...this.schooling(world, members, scope)); }
      if (scope.has.has('temperament')) { changes.push(...this.temperament(world, actor.id, members)); }
    }
    const different = changes.filter(c => c.kind === 'assert' ? !world.holds(World.key(c.call)) :
      c.kind === 'retract' ? world.holds(World.key(c.call)) :
        'value' in c && (c.value.kind === 'number' || c.value.kind === 'deem')
          && World.literal(c.value) !== world.number(c.call));
    return different.length ? world.apply(different) : world;
  }
  // A group of one species takes its species' temperament, unless the place has given it one; and a group the place
  // has given no words of its own (and whose meeting with the company it has not scripted in states) speaks in the
  // plain words of its temperament.
  private static temperament(world: World, group: string, members: Creature[]): Change[] {
    const kinds = new Set(members.map(c => Canon.temperament(c.raceId)));
    const kind = [...kinds][0] ? `temper_${[...kinds][0]!}` : undefined, words = this.words(world.module);
    const given = world.one('temperament', group);
    // One the place has made peaceable keeps the peace, whatever its kind would do; a tame kind is peaceable anyway.
    const peaceable = world.holds(World.key(ModuleWriter.call('peaceable', group))) && kind !== 'temper_tame';
    const own = kinds.size === 1 && kind && words.has(kind) && !peaceable;
    const temper = given ?? (own ? kind : undefined);
    if (!temper) { return []; }
    const scripted = world.related('state', group).length > 0, many = members.length > 1;
    // One who is of a people is someone, not something: not "it stands its ground" (a robbers' captain).
    const person = !many && members.some(c => !!Canon.ancestries[c.raceId]);
    const said = scripted ? [] : (['warning', 'onslaught', 'flinch'] as const).flatMap(name => {
      // The shared words live in whichever installation joined the inhabitants rules first. A band of more than one
      // is spoken of as many ("the wolves come at you"), where the words differ.
      const plain = `${temper.replace(/^temper_/, 'temper_words_')}_${name}`;
      const entity = (many ? words.get(`${plain}_many`) : person ? words.get(`${plain}_person`) : undefined)
        ?? words.get(plain);
      return world.related(name, group).length || !entity ? [] : [ModuleWriter.call(name, group, entity)];
    });
    return [...given ? [] : [ModuleWriter.call('temperament', group, temper)], ...said]
      .map(call => ({ kind: 'assert' as const, call }));
  }
  // The temperaments a module declares, and the plain words of each, by their unprefixed ids.
  private static readonly worded = new WeakMap<Module, Map<string, string>>();
  private static words(module: Module): Map<string, string> {
    let words = this.worded.get(module);
    if (!words) {
      words = new Map();
      for (const e of module.entities) {
        const plain = e.id.replace(/^.*__/, '');
        if (e.type === 'temperament' && e.id === plain) { words.set(e.id, e.id); }
        if (plain.startsWith('temper_words_') && !words.has(plain)) { words.set(plain, e.id); }
      }
      this.worded.set(module, words);
    }
    return words;
  }
  // What the world declares that the projection writes about: which relations it has, and its capabilities,
  // items, item kinds, member bindings and abilities. Read once for a module while its lists are as long as they were
  // (a frontier adds to them).
  private static readonly declarations = new WeakMap<Module, { lengths: string; declared: Declared }>();
  static declared(module: Module): Declared {
    const { entities, relations, measures } = module, lengths = `${entities.length}:${relations.length}:${measures.length}`;
    const kept = this.declarations.get(module);
    if (kept?.lengths === lengths) { return kept.declared; }
    const abilityIds = new Set(entities.filter(e => e.type === 'ability').map(e => e.id));
    const declared = Content.abilities.filter(a => abilityIds.has(a.id)), items = entities.filter(e => e.type === 'item');
    const made = { has: new Set(relations.map(r => r.name)), measures: new Set(measures.map(m => m.name)),
      abilityIds, declared, field: declared.filter(a => FieldUse.safe(a.id)),
      capabilities: entities.filter(e => e.type === 'capability'), items, itemIds: new Set(items.map(e => e.id)),
      kinds: entities.filter(e => e.type === 'itemkind'),
      references: new Map(entities.filter(e => e.creatureId).map(e => [e.creatureId!, e.id])) };
    this.declarations.set(module, { lengths, declared: made });
    return made;
  }
  private static scope(world: World): Scope { return { ...this.declared(world.module), world }; }
  // What the company as a whole can do and is: its skills, who brings each, whether it can act, and its coin.
  private static group(actor: CampaignActor, members: Creature[], scope: Scope): Change[] {
    const changes: Change[] = [], { has, capabilities, references, at } = scope;
    if (has.has('capable')) {
      for (const capability of capabilities) {
        changes.push({ kind: PartyCapabilities.has(capability.id, members, at) ? 'assert' : 'retract',
          call: ModuleWriter.call('capable', actor.id, capability.id) });
      }
    }
    for (const c of has.has('brings') ? members : []) {
      for (const capability of capabilities) {
        changes.push({ kind: PartyCapabilities.brings(capability.id, c, at) ? 'assert' : 'retract',
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
    // The kinds of work the company's people have done, for those who do the same work to know them by.
    if (has.has('craft') && actor.player) {
      const done = new Set(members.map(c => c.backgroundId && Canon.backgrounds[c.backgroundId]?.kind).filter(Boolean));
      for (const kind of CreatureFacts.crafts) {
        changes.push({ kind: done.has(kind) ? 'assert' : 'retract', call: ModuleWriter.call('craft', actor.id, `craft_${kind}`) });
      }
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
    const { has, kinds, references } = scope, changes: Change[] = [];
    const reference = references.get(c.id);
    if (!reference) { throw new Error(`Missing canonical member binding for ${c.id}`); }
    const ready = c.state.hp > 0 && !c.state.conditions.some(s => Effects.skips(s.id));
    changes.push({ kind: 'assert', call: ModuleWriter.call('memberOf', reference, actor) });
    changes.push({ kind: ready ? 'assert' : 'retract', call: ModuleWriter.call('awake', reference) });
    if (scope.measures.has('levelOf')) {
      changes.push({ kind: 'set', call: ModuleWriter.call('levelOf', reference), value: ModuleWriter.number(c.base.level) });
    }
    changes.push({ kind: c.state.hp < c.base.maxHp || c.state.conditions.length ? 'assert' : 'retract',
      call: ModuleWriter.call('needsCare', reference) });
    if (has.has('fallen')) { changes.push({ kind: c.state.hp === 0 ? 'assert' : 'retract', call: ModuleWriter.call('fallen', reference) }); }
    if (has.has('slain')) {
      const slain = c.state.hp === 0 && c.state.conditions.some(s => s.id === 'slain');
      changes.push({ kind: slain ? 'assert' : 'retract', call: ModuleWriter.call('slain', reference) });
    }
    // What a member owns and wears; the kinds they can use; what they could be taught; what they could treat, and
    // cast now. Each is written as the whole set: what holds now, and the end of what held and no longer does.
    if (has.has('ownedItem')) {
      const mine = (c.state.inventory ?? []).filter(i => scope.itemIds.has(i.id));
      changes.push(...this.set(scope, 'ownedItem', reference, mine.map(i => i.id)),
        ...this.set(scope, 'wearing', reference, mine.filter(i => i.equipped).map(i => i.id)));
    }
    if (has.has('proficient')) {
      changes.push(...this.set(scope, 'proficient', reference, kinds.filter(k => Creation.canEquip(c.classId, k.id))
        .map(k => k.id)));
    }
    const learned = [...c.base.abilities, ...c.state.learnedAbilities];
    if (has.has('canTrain')) {
      changes.push(...this.set(scope, 'canTrain', reference, ready && c.state.experience >= 20
        ? scope.declared.filter(a => !learned.includes(a.id)).map(a => a.id) : []));
    }
    for (const item of c.state.inventory ?? []) { ItemCatalog.get(item.definition); }
    // What they carry against what they can (see Burden).
    if (scope.measures.has('carried')) {
      changes.push({ kind: 'set', call: ModuleWriter.call('carried', reference), value: ModuleWriter.number(Burden.load(c)) },
        { kind: 'set', call: ModuleWriter.call('capacity', reference), value: ModuleWriter.number(Burden.capacity(c)) });
    }
    const known = new Set([...learned, ...Object.keys(ItemCatalog.abilities(c))]);
    const useful = scope.field.filter(a => CreatureFacts.helps(a, c));
    if (has.has('relieves')) {
      changes.push(...this.set(scope, 'relieves', reference, kinds.filter(k => this.relieves(k.id, c)).map(k => k.id)));
    }
    // Orsino's gate outside combat too: a spell or levelled skill above ⌈level / 2⌉ cannot be used yet.
    const usable = scope.field.filter(a => ready && known.has(a.id) && Spellcasting.affordable(c.state, a)
      && (a.spell?.level ?? a.level ?? 0) <= Fighting.maxSpellLevel(c.base.level));
    changes.push(...this.set(scope, 'treatable', reference, useful.map(a => a.id)),
      ...this.set(scope, 'canCast', reference, usable.map(a => a.id)));
    return changes;
  }
  // Whether an ability would do anything for someone: heal a hurt, lift something they have, or lay on something
  // they have not, or renew it once half of it is spent (a lantern topped up before going down).
  private static helps(a: ArenaAbility, c: Creature): boolean {
    return a.effects.some(e => (e.kind === 'heal' && c.state.hp < c.base.maxHp)
      || (e.kind === 'remove' && c.state.conditions.some(s => s.id === e.status))
      || (e.kind === 'apply' && !c.state.conditions.some(s => s.id === e.status && s.remaining * 2 > e.duration)));
  }
  // A kind of thing used up on someone relieves them if it would help them; one that is no remedy (it does what it
  // does, whoever takes it) always does.
  private static readonly uses = new Map<string, ArenaAbility | undefined>();
  private static relieves(kind: string, c: Creature): boolean {
    if (!this.uses.has(kind)) {
      const use = ItemCatalog.definitions[kind]?.use;
      this.uses.set(kind, use ? parseAbility(`item-${kind}`, kind, use) : undefined);
    }
    const ability = this.uses.get(kind);
    if (!ability) { return false; }
    const remedy = ability.effects.some(e => ['heal', 'remove', 'apply'].includes(e.kind));
    return !remedy || this.helps(ability, c);
  }
  // The relations the projection writes from a member to many things: item first for what a member owns or wears,
  // the member first for the rest.
  static readonly sets: Record<string, 0 | 1> = { ownedItem: 1, wearing: 1, proficient: 0, canTrain: 0, treatable: 0,
    relieves: 0,
    canCast: 0 };
  private static set(scope: Scope, name: string, reference: string, now: string[]): Change[] {
    const want = new Set(now), item = this.sets[name]!;
    // What holds now of this member, read by the member's place among the relation's arguments.
    const held = item ? scope.world.relatedTo(name, reference) : scope.world.related(name, reference);
    return [...[...want].map(x => ({ kind: 'assert' as const, call: this.pair(name, reference, x) })),
      ...[...new Set(held.map(r => r.args[1 - item]!))].filter(x => !want.has(x))
        .map(x => ({ kind: 'retract' as const, call: this.pair(name, reference, x) }))];
  }
  private static pair(name: string, reference: string, other: string) {
    return this.sets[name] ? ModuleWriter.call(name, other, reference) : ModuleWriter.call(name, reference, other);
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
    const present = [...refs].flatMap(ref => world.related('swappable', ref));
    return [...present.filter(r => !desired.has(r.args.join('|')))
      .map(r => ({ kind: 'retract' as const, call: ModuleWriter.call('swappable', ...r.args) })),
    ...[...desired.values()].map(args => ({ kind: 'assert' as const, call: ModuleWriter.call('swappable', ...args) }))];
  }
  // The spells each caster with a level's spell to spend may learn, written as the whole set.
  private static lessons(world: World, members: Creature[], references: Map<string, string>): Change[] {
    return this.choices(world, 'learnable', members.map(c => [references.get(c.id)!, Advancement.learnable(c)]));
  }
  // The feats each companion with one to take may choose.
  private static feats(world: World, members: Creature[], references: Map<string, string>): Change[] {
    return this.choices(world, 'featOpen', members.map(c => [references.get(c.id)!, Advancement.feats(c)]));
  }
  // The skills each companion with a development to spend could take up, of those the world names.
  private static schooling(world: World, members: Creature[], scope: Scope): Change[] {
    const named = new Set(scope.capabilities.map(e => e.id));
    return this.choices(world, 'skillOpen', members.map(c => [scope.references.get(c.id)!,
      Advancement.teachable(c).filter(id => named.has(id))]));
  }
  private static choices(world: World, relation: string, open: [string, string[]][]): Change[] {
    const refs = new Set(open.map(([ref]) => ref));
    const desired = new Set(open.flatMap(([ref, ids]) => ids.map(id => `${ref}|${id}`)));
    const present = [...refs].flatMap(ref => world.related(relation, ref));
    return [...present.filter(r => !desired.has(r.args.join('|')))
      .map(r => ({ kind: 'retract' as const, call: ModuleWriter.call(relation, ...r.args) })),
    ...[...desired].map(key => ({ kind: 'assert' as const, call: ModuleWriter.call(relation, ...key.split('|')) }))];
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
  // Only the actors whose gold the world has written are read (a rule's firing writes none, most often).
  static commitMoney(before: World, after: World, actors: CampaignActor[], store: CreatureStore) {
    const written = new Set(after.differing(before, ['quantity']).filter(c => c.args[1] === 'gold').map(c => c.args[0]));
    if (!written.size) { return; }
    const changed = actors.filter(actor => written.has(actor.id)).map(actor => ({ actor,
      delta: after.number(ModuleWriter.call('quantity', actor.id, 'gold'))
        - before.number(ModuleWriter.call('quantity', actor.id, 'gold')),
    })).filter(change => change.delta !== 0);
    if (!changed.length) { return; }
    const lease = store.acquire(changed.flatMap(c => c.actor.members));
    try {
      for (const { actor, delta } of changed) {
        const members = actor.members.map(id => lease.creatures.find(c => c.id === id)!);
        // More gold from every source for a company with a perk for it (a thieves' guild's).
        if (delta > 0) { members[0]!.state.gold += Math.floor(delta * Perks.bonus(members[0]!.traits, 'goldMultiplier')); }
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
