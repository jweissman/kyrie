import { ItemNames } from './lang/item-names';
import { Callings } from './ports/callings';
import { Canon } from './canon/canon';
import { ItemCatalog, type ItemDefinition } from './item-catalog';
import { ItemTraits } from './campaign/item-traits';
import type { Attribute, Creature } from './creature';
import type { Instance } from './lang/module';
import type { CampaignInstance } from './campaign/definition';
import { ModuleWriter } from './lang/module-writer';

export interface Overlay {
  role: 'background' | 'profession'; name: string;
  attributes: Partial<Record<Attribute, number>>; gold: number; requiredClass?: string;
  skills?: string[]; gear?: string[]; offers?: { kind: string; text: string; fee: number }[]; routine?: string;
  contact?: { channel: 'tavern' | 'temple' | 'market' | 'road'; text: string };
}
export interface Contribution { kind: 'skill' | 'gear' | 'gold' | 'attribute' | 'offer'; value: string; source: string }

// Professions and backgrounds adapted from Orsino's backgroundModifier table. An overlay contributes typed effects to
// one canonical character, each tagged with its source; it never defines a second kind of actor.
export class Overlays {
  static readonly catalog: Record<string, Overlay> = Object.fromEntries(Object.entries(Canon.backgrounds)
    .map(([id, b]) => [id, { role: b.use, name: b.name, attributes: b.attributes, gold: b.gold,
      ...b.requiredClass ? { requiredClass: b.requiredClass } : {}, ...b.skills ? { skills: b.skills } : {},
      ...b.gear ? { gear: b.gear } : {}, ...b.offers ? { offers: b.offers } : {},
      ...b.routine ? { routine: b.routine } : {}, ...b.contact ? { contact: b.contact } : {} }]));
  static has(id: string, role?: Overlay['role']): boolean {
    const o = this.catalog[id];
    return !!o && (!role || o.role === role);
  }
  static get(id: string): Overlay {
    const o = this.catalog[id];
    if (!o) { throw new Error(`Unknown overlay ${id}`); }
    return o;
  }
  static of(c: { backgroundId?: string; professionId?: string }): [string, Overlay][] {
    return [c.backgroundId, c.professionId].filter((id): id is string => !!id && this.has(id))
      .map(id => [id, this.get(id)]);
  }
  static gearId(creatureId: string, kind: string): string { return `${creatureId}__${kind}`; }
  // A coin for every ten of Orsino's gold pieces (Canon.coins).
  static readonly coinScale = Canon.coinScale;
  static coins(o: Overlay): number { return Canon.coins(o.gold); }
  // Conflicts are errors: wrong role, a class requirement the character lacks, unknown gear.
  static validate(context: { classId?: string; backgroundId?: string; professionId?: string }, who: string,
    catalog: ItemCatalog) {
    for (const [field, role] of [['backgroundId', 'background'], ['professionId', 'profession']] as const) {
      const id = context[field];
      if (id && this.catalog[id] && this.catalog[id].role !== role) { throw new Error(`${who}: ${id} is a ${this.catalog[id].role}, not a ${role}`); }
      if (field === 'professionId' && id && !this.has(id, 'profession')) { throw new Error(`${who}: unknown profession ${id}`); }
    }
    for (const [id, o] of this.of(context)) {
      const cls = context.classId ?? '';
      if (o.requiredClass && cls !== o.requiredClass && !cls.includes(o.requiredClass)) {
        throw new Error(`${who}: the ${id} overlay requires the ${o.requiredClass} class`);
      }
      for (const kind of o.gear ?? []) { catalog.get(kind); }
    }
  }
  static apply(creature: Creature) {
    for (const [, o] of this.of(creature)) {
      for (const [k, v] of Object.entries(o.attributes)) {
        creature.base[k as Attribute] = Math.max(1, creature.base[k as Attribute] + v);
      }
      creature.state.gold += this.coins(o);
      for (const kind of o.gear ?? []) {
        const id = this.gearId(creature.id, kind);
        const inventory = creature.state.inventory ??= [];
        if (!inventory.some(i => i.id === id)) { inventory.push({ id, definition: kind }); }
      }
    }
  }
  // Equipment a person is authored to carry: one instance of each kind, equipped where its slot is free.
  static carry(catalog: ItemCatalog, creature: Creature, kinds: string[]) {
    if (!kinds.length) { return; }
    const inventory = creature.state.inventory ??= [];
    for (const kind of kinds.map(k => catalog.itemId(k))) {
      const slot = catalog.get(kind).slot, id = this.gearId(creature.id, kind);
      if (inventory.some(i => i.id === id)) { continue; }
      const free = slot && !inventory.some(i => i.equipped && catalog.get(i.definition).slot === slot);
      inventory.push({ id, definition: kind, ...free ? { equipped: true } : {} });
    }
  }
  // What a person of a class carries from the start besides arms and armour, as Orsino's classes do (a warrior's
  // torch and pole, a thief's tools): those the item catalog has. Whoever sets out on the road carries a light, a
  // candle that weighs nothing (a ranger went down into a pitch-dark barrow with none, and found none to buy: the
  // cold evaluation); a torch too was a load that slowed a companion carrying weight-stones.
  static classGear(catalog: ItemCatalog, c: { raceId?: string; classId?: string; outfit?: 'own' }): string[] {
    if (!c.classId || c.outfit === 'own' || (c.raceId && catalog.isBody(c.raceId))) { return []; }
    const klass = Callings.of(Canon.resolve('classes', c.classId));
    const light = klass && klass.adventuring !== false ? ['candle'] : [];
    return [...new Set([...klass?.startingGear ?? [], ...light])].filter(k => catalog.has(k));
  }
  // The weapons and armour a person might start with: Orsino draws them from the class's tables during creation, so
  // every candidate is declared and only the drawn ones are ever owned.
  static startingCandidates(
    catalog: ItemCatalog, c: { raceId?: string; classId?: string; weapon?: string; armor?: string },
  ): string[] {
    if (c.raceId && catalog.isBody(c.raceId)) { return []; }
    const named = c.classId ? Callings.of(Canon.resolve('classes', c.classId)) : undefined;
    if (c.classId && !named) { throw new Error(`No calling ${c.classId}: it is none of ${Object.keys(Callings.table()).join(', ')}`); }
    const classes = named ? [named] : Object.values(Callings.table()).filter(k => k.adventuring !== false);
    const tables = [...c.weapon ? [c.weapon] : classes.flatMap(k => k.weapons),
      ...c.armor ? [c.armor] : classes.flatMap(k => k.armor)];
    return [...new Set(tables.filter(k => catalog.find(k) && !catalog.find(k)!.weapon?.natural))];
  }
  static contributions(c: { backgroundId?: string; professionId?: string }): Contribution[] {
    return this.of(c).flatMap(([id, o]) => [
      ...(o.skills ?? []).map(value => ({ kind: 'skill' as const, value, source: id })),
      ...(o.gear ?? []).map(value => ({ kind: 'gear' as const, value, source: id })),
      ...(o.offers ?? []).map(value => ({ kind: 'offer' as const, value: value.kind, source: id })),
      ...Object.entries(o.attributes).map(([k, v]) => ({ kind: 'attribute' as const, value: `${k} ${v > 0 ? '+' : ''}${v}`, source: id })),
      { kind: 'gold' as const, value: String(this.coins(o)), source: id }]);
  }
  static skills(c: { backgroundId?: string; professionId?: string }): string[] {
    return this.contributions(c).filter(x => x.kind === 'skill').map(x => x.value);
  }
  // Gear exists in the world as item entities so that rules can see who holds what.
  // What each kind of thing a module knows of is worth (its catalog value), so that whoever deals in it will pay:
  // set once, by the module that first names the kind. A treasure is any dealer's in valuables; anything else is
  // the trade's that sells its like (data/rules/belongings.kyr, sell_ware), and a wonder the dealer's in rare things.
  static declareWorth(instance: Instance, catalog: ItemCatalog) {
    const module = instance.module, measured = new Set(module.measures.map(m => m.name)), set = Overlays.set;
    if (!measured.has('worth')) { return; }
    // A trade by whatever name the rules were installed under (rules__trade_arms), under each if more than once.
    const classes = module.entities.filter(x => x.type === 'tradeclass').map(x => x.id);
    const traded = module.relations.some(r => r.name === 'tradeOf') && classes.length > 0;
    for (const e of module.entities.filter(x => x.type === 'itemkind')) {
      const item = catalog.find(e.id), trades = item?.category === 'treasure' ? [] : this.trades(e.id, item);
      if (!item?.value || item.category !== 'treasure' && !(traded && trades.length)) { continue; }
      module.initial.push(set('worth', e.id, item.value),
        ...item.category === 'treasure' ? [Overlays.fact('valuable', e.id)] : [],
        ...classes.filter(c => trades.some(t => c === t || c.endsWith(`__${t}`)))
          .map(t => Overlays.fact('tradeOf', e.id, t)),
        // What a dealer pays: half its worth, at least one.
        ...measured.has('dealerPays') ? [set('dealerPays', e.id, Math.max(1, Math.floor(item.value / 2)))] : []);
    }
  }
  // What a world is made with (its constants), not what play writes.
  private static fact(name: string, ...args: string[]) {
    return { kind: 'assert' as const, call: ModuleWriter.call(name, ...args) };
  }
  private static set(name: string, id: string, value: number) {
    return { kind: 'set' as const, call: ModuleWriter.call(name, id), value: { kind: 'number' as const, value } };
  }
  // The trades that buy a kind of thing back: what it is, and a wonder (data/catalog/items/wonders.json) the dealer's
  // in rare things besides. What a body fights with is no one's to buy.
  static trades(id: string, item?: ItemDefinition): string[] {
    if (!item || item.weapon?.natural) { return []; }
    const by: Record<string, string> = { weapon: 'trade_arms', armor: 'trade_arms', gear: 'trade_gear',
      tool: 'trade_gear', equipment: 'trade_gear', consumable: 'trade_remedies' }, wonder = Canon.wonders.has(id),
      category = item.category ?? '';
    // A magic sword is a smith's to buy as well; a ring or a wand only the rare dealer's.
    const own = wonder && ['equipment', 'consumable'].includes(category) ? undefined : by[category];
    return [...own ? [own] : [], ...wonder ? ['trade_rare'] : []];
  }
  // Among its campaign's kinds (see ItemCatalog.among).
  static declareGear(instance: CampaignInstance, catalog: ItemCatalog) {
    const module = instance.module;
    for (const c of instance.campaign?.creatures ?? []) {
      const carried = (c.context.gear ?? []).map(k => catalog.itemId(k));
      const gear = c.context.outfit === 'own' ? [carried] : [...this.of(c.context).map(([, o]) => o.gear ?? []),
        carried, this.startingCandidates(catalog, c.context), this.classGear(catalog, c.context)];
      for (const kinds of gear) {
        for (const kind of kinds) {
          const id = this.gearId(c.id, kind);
          if (module.entities.some(e => e.id === id)) { continue; }
          if (!module.entities.some(e => e.id === kind)) {
            module.entities.push({ id: kind, type: 'itemkind', name: catalog.get(kind).name });
          }
          module.entities.push({ id, type: 'item', name: ItemNames.called(catalog.get(kind).name) });
          module.initial.push({ kind: 'assert', call: { kind: 'call', name: 'itemKind', args: [id, kind] } });
        }
      }
    }
    ItemTraits.assert(module, catalog);
  }
}
