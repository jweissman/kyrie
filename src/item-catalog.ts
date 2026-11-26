import { CanonRuntime, type RuntimeItem } from './canon/canon-runtime';
import { Canon } from './canon/canon';
import type { HookKey, Hooks, ItemKind, Statistics } from './rules/catalog-schema';
import { StatExpressions } from './rules/stat-expressions';
import { parseAbility, type ArenaAbility, type Effect } from './lang/parse';
import { ModifierSet, type Modifiers } from './rules/modifiers';
import type { WeaponProfile } from './rules/fighting';
import type { Attribute, Creature } from './creature';
import { CreatureVariants } from './creature-variants';
import type { KindsMade } from './lang/vocabulary';
export type ItemDefinition = RuntimeItem;
export interface Equipment {
  modifiers: Modifiers; hooks: Hooks; weapon: WeaponProfile; armorAc: number;
  // A kind's natural attacks in a round, each its own weapon (a dragon's claw, claw and bite; see Species).
  routine?: WeaponProfile[];
}
type Frozen = Readonly<Record<string, ItemDefinition>>;

// The kinds of thing one campaign knows (the compilation-context review's slice 2, AR-02): the catalog's own, and the
// kinds its modules declared for themselves (module.catalog), made once when the campaign's kinds are known and
// shared by reference, frozen, never copied as they are read. Every reader is handed the campaign's (Campaign.catalog,
// CreatureStore.catalog), or the catalog's alone where nothing of a campaign's is (ItemCatalog.canon: a tool, a spec);
// none asks the process which campaign is in play, so two campaigns that give one name two kinds each read their own.
export class ItemCatalog {
  // The catalog's own, as the setting lowered them, before any module's kind joined them.
  private static readonly base: Frozen = ItemCatalog.frozen(CanonRuntime.items());
  static readonly canon = new ItemCatalog({});
  private static readonly made = new WeakMap<object, ItemCatalog>();
  // A campaign's, from what its modules made of their own kinds: the same made, the same catalog.
  static of(kinds: KindsMade | undefined): ItemCatalog {
    const items = (kinds as { items?: Record<string, ItemKind> } | undefined)?.items;
    if (!kinds || !items || !Object.keys(items).length) { return this.canon; }
    let catalog = this.made.get(kinds);
    if (!catalog) {
      catalog = new ItemCatalog(Object.fromEntries(Object.entries(items).map(([id, i]) => [id, this.runtime(i)])));
      this.made.set(kinds, catalog);
    }
    return catalog;
  }
  // A module's own kinds read among its campaign's (kinds): the campaign's, and the module's in place of any of them
  // it gives another meaning (its installation's own once installed: ModuleNamespace), as the module is assembled.
  static among(kinds: KindsMade | undefined, ...own: (KindsMade | undefined)[]): ItemCatalog {
    const given = [kinds, ...own].filter((k): k is KindsMade => !!k?.items && !!Object.keys(k.items).length);
    if (given.length < 2) { return this.of(given[0]); }
    return this.of({ items: Object.assign({}, ...given.map(k => k.items)) as KindsMade['items'] });
  }
  // Each kind lowered once, whichever catalogs hold it.
  private static readonly lowered = new WeakMap<object, ItemDefinition>();
  // What the executor reads of a module's own kind of thing (see LocalKinds).
  static runtime(item: ItemKind): ItemDefinition {
    let lowered = this.lowered.get(item);
    if (!lowered) { lowered = this.lower(item); this.lowered.set(item, lowered); }
    return lowered;
  }
  private static lower(item: ItemKind): ItemDefinition {
    return { name: item.name, description: item.description,
      ...item.slot ? { slot: item.slot } : {}, ...item.modifiers ? { modifiers: item.modifiers } : {},
      ...item.hooks ? { hooks: item.hooks } : {}, ...item.weapon ? { weapon: item.weapon } : {},
      ...item.armor ? { armor: item.armor } : {}, ...item.use ? { use: item.use } : {},
      ...item.grants?.skill ? { capability: item.grants.skill } : {},
      ...item.grants?.ability ? { ability: item.grants.ability } : {},
      ...item.tool ? { tool: item.tool } : {}, ...item.aids ? { aids: item.aids } : {} } as ItemDefinition;
  }
  // The process's join of the catalog and the kinds of the campaign last activated, as the language reads a module
  // against it (CanonVocabulary.kind) until parsing is given its campaign's catalog too (slice 3): never read in play.
  static readonly ambient: Record<string, ItemDefinition> = { ...ItemCatalog.base };
  private readonly own: Frozen;
  private constructor(own: Record<string, ItemDefinition>) { this.own = ItemCatalog.frozen(own); }
  // Frozen through, so that what is shared by reference is never changed by whoever reads it.
  private static frozen<T>(x: T): T {
    if (x && typeof x === 'object' && !Object.isFrozen(x)) {
      for (const v of Object.values(x)) { ItemCatalog.frozen(v); }
      Object.freeze(x);
    }
    return x;
  }
  // A kind by its id, if it is one.
  find(id: string): ItemDefinition | undefined {
    return Object.hasOwn(this.own, id) ? this.own[id] : Object.hasOwn(ItemCatalog.base,
      id) ? ItemCatalog.base[id] : undefined;
  }
  has(id: string): boolean { return this.find(id) !== undefined; }
  // The campaign's own kinds, by id.
  get local(): readonly string[] { return Object.keys(this.own); }
  get(id: string): ItemDefinition {
    const result = this.find(id);
    if (!result) { throw new Error(`Unknown item definition ${id}`); }
    return result;
  }
  abilities(creature: Creature): Record<string, { id: string; kind: 'item'; name: string }> {
    return Object.fromEntries((creature.state.inventory ?? []).filter(i => i.equipped)
      .flatMap(i => { const d = this.get(i.definition); return d.ability
        ? [[d.ability, { id: i.id, kind: 'item' as const, name: d.name }]] : []; }));
  }
  // What using a thing of a kind does, as an ability (a healing potion's "Heal (2d4 + 2) health to ally."), kept by
  // the kind and its use (the architecture review's H7); found by the ability's id too ("item-healing_potion").
  // Kept by what it is read from, so that two campaigns' kinds of one name are read each as itself.
  private static readonly uses = new Map<string, ArenaAbility | undefined>();
  use(kind: string): ArenaAbility | undefined { return ItemCatalog.using(kind, this.find(kind)); }
  static using(kind: string, d: { name: string; use?: string } | undefined): ArenaAbility | undefined {
    const key = `${kind}\u0000${d?.name ?? ''}\u0000${d?.use ?? ''}`, uses = ItemCatalog.uses;
    if (!uses.has(key)) { uses.set(key, d?.use ? parseAbility(`item-${kind}`, d.name, d.use) : undefined); }
    return uses.get(key);
  }
  used(ability: string): ArenaAbility | undefined {
    return ItemCatalog.carried(ability) ? this.use(ability.slice(5)) : undefined;
  }
  // Whether an ability is a thing's use (item-healing_potion), as a fight's carried things are fought with.
  static carried(ability: string): boolean { return ability.startsWith('item-'); }
  // What one in a fight uses a carried thing as, from what they carried into it (see CombatProjection.made): a fight
  // reads its fighters, never a campaign's catalog.
  static fought(fighter: { abilitySources?: Record<string, { name: string; use?: string }> }, ability: string):
    ArenaAbility | undefined {
    const source = this.carried(ability) ? fighter.abilitySources?.[ability] : undefined;
    return source?.use ? this.using(ability.slice(5), source) : undefined;
  }
  // What a creature carries that it can use up in a fight, by the ability each is used as: a draught, a salve, a flask
  // of fire to throw; not a light, nor anything else whose use runs on the clock for hours (PT-07: a fight offered no
  // use of the alchemist's fire in the pack, though the foe was vulnerable to fire).
  stock(creature: Creature): Record<string, string[]> {
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
  quality(creature: Creature, stat: Attribute): number {
    const worn = (creature.state.inventory ?? []).filter(i => i.equipped)
      .reduce((n, i) => n + (this.get(i.definition).modifiers?.attributes?.[stat] ?? 0), 0);
    return creature.base[stat] + worn;
  }
  weapon(id: string, name?: string, material?: string): WeaponProfile {
    const w = this.get(id).weapon;
    if (!w) { throw new Error(`${id} is not a weapon`); }
    // Made of a material that passes a guard (a longsword of silver), it carries what the material passes.
    const passes = material ? Canon.materials[material]?.passes : undefined;
    // A wonder's blade is magic (what the wonders' file holds: a bolt-blade, the sword of ages), and passes a guard
    // that only magic passes (the unicorn's 10/magic: the SRD adaptation briefing, §3); its own tags beside.
    const tags = [...w.tags ?? [], ...Canon.wonders.has(id) && !w.tags?.includes('magic') ? ['magic'] : [],
      ...passes && !w.tags?.includes(passes) ? [passes] : []];
    return { id, name: name ?? this.get(id).name, damage: w.damage, type: w.type,
      ...w.weight ? { weight: w.weight } : {}, ...w.kind ? { kind: w.kind } : {},
      ...w.missile ? { missile: true } : {}, ...w.intercept ? { intercept: true } : {},
      ...w.natural ? { natural: true } : {}, ...tags.length ? { tags } : {} };
  }
  // What a creature's equipment contributes: the wielded weapon (else its natural weapon, else a fist, as in Orsino's
  // effectiveWeapon), the body armour's ac (else its natural armour), and the modifiers and hooks of equipped items.
  equipment(creature: Creature): Equipment {
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
      weapon: wielded ? this.weapon(wielded.definition, undefined, wielded.material) : this.body(CreatureVariants.weapon(creature, natural?.weapon) ?? 'fist', natural),
      armorAc: worn ? this.get(worn.definition).armor!.ac : natural?.armor ? this.get(natural.armor).armor!.ac
        + StatExpressions.armor(natural.armorBonus, { level: creature.base.level }) : 0,
      ...!wielded && natural?.attacks?.length ? { routine: natural.attacks.map(id => id === natural.weapon
        ? this.body(id, natural) : { ...this.body(id, natural), lesser: true }) } : {} };
  }
  // A body's own blow: the weapon, in its stat block's own damage where it says one (see StatExpressions), with what
  // it carries when it lands (its riders).
  body(id: string, natural?: Pick<Statistics, 'riders' | 'damage'>): WeaponProfile {
    const weapon = this.weapon(id), own = natural?.riders?.[id], damage = natural?.damage?.[id];
    return { ...weapon, ...damage ? { damage } : {}, ...own?.length ? { onHit: structuredClone(own) } : {} };
  }
}
