import type { Hooks, ItemKind, Omissions } from '../canon/schema';
import type { Modifiers } from '../rules/modifiers';
import type { Effect } from '../lang/parse';
import type { RegistryEntry } from './orsino-extract';

type Raw = Record<string, unknown>;
// What the goods translation borrows from the main translation: effects as modifiers and hooks, a single effect as
// Kyr's typed effects, and the weapons already translated (a magic dagger is a dagger first).
export interface GoodsHelpers {
  modifiers(effect: Raw, from: string): { modifiers: Modifiers; hooks: Hooks; unsupported: Omissions };
  effect(raw: Raw, from: string): Effect[] | string;
  // The Kyr condition an Orsino status name is ("Poison" is poisoned).
  status(name: unknown, from: string): string | undefined;
  weapons: Record<string, ItemKind>;
}

// Orsino's goods as Kyr item kinds, beside its weapons and armour. Its junk is treasure, worth what Orsino says (and
// Orsino's shops buy it at that); its gems are treasure by tier (Orsino lists them without prices, so each tier is
// valued here). Its gear and consumables say what using them does, where Kyr's effects can say it; its magic
// equipment gives what it gives when worn, in the slot its kind fills.
export class OrsinoGoods {
  static readonly gemValues: Record<string, number> = { common: 15, uncommon: 60, rare: 250, very_rare: 800,
    legendary: 2500 };
  static readonly slots: Record<string, string> = { ring: 'ring', amulet: 'neck', cloak: 'cloak', bracers: 'arms',
    gloves: 'hands', boots: 'feet', helm: 'head', belt: 'waist', shield: 'shield', orbital: 'charm', special: 'charm',
    body: 'body' };
  constructor(private entries: RegistryEntry[], private helpers: GoodsHelpers) {}
  private family(name: string) { return this.entries.filter(e => e.family === name); }
  static name(key: string): string { return key.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()); }
  items(): Record<string, ItemKind> {
    return { ...this.junk(), ...this.gems(), ...this.gear(), ...this.consumables(), ...this.equipment() };
  }
  private junk(): Record<string, ItemKind> {
    return Object.fromEntries(this.family('junk').map(e => {
      const d = e.definition as Raw;
      return [e.key, { name: OrsinoGoods.name(e.key), category: 'treasure' as const, description: String(d.description),
        value: Number(d.value), source: { orsino: e.id, fidelity: 'faithful' } }];
    }));
  }
  private gems(): Record<string, ItemKind> {
    return Object.fromEntries(this.family('gem').flatMap(e => (e.definition as string[]).map(gem => [gem, {
      name: OrsinoGoods.name(gem), category: 'treasure' as const,
      description: `A ${e.key.replace('_', ' ')} gemstone, cut and polished: ${gem.replace(/_/g, ' ')}.`,
      value: OrsinoGoods.gemValues[e.key] ?? 15, source: { orsino: e.id, fidelity: 'adapted',
        notes: 'Orsino lists its gems by tier without a price; each tier is given a worth here.' } }])));
  }
  // What Kyr counts as goods rather than items: a company has some number of rations, not a ration item.
  static readonly goods = ['rations'];
  private gear(): Record<string, ItemKind> {
    return Object.fromEntries(this.family('gear').filter(e => !OrsinoGoods.goods.includes(e.key)).map(e => {
      const d = e.definition as Raw, use = this.use((d.effect ?? []) as Raw[], e.id);
      const category = typeof use === 'string' && d.type === 'consumable' ? 'consumable' as const
        : d.type === 'light source' ? 'equipment' as const : d.type === 'tool' ? 'tool' as const : 'gear' as const;
      // A light source shows the way in the dark when it is carried lit, as Kyr's own lanterns do.
      const light = d.type === 'light source' ? { slot: 'light', grants: { skill: 'light' } } : {};
      const omits = { ...d.capacity ? { 'field:masterGear.capacity': 'Kyr does not count what a container holds.' } : {},
        ...d.duration ? { 'field:masterGear.duration': 'A Kyr light does not burn down by itself.' } : {} };
      return [e.key, { name: OrsinoGoods.name(e.key), category, description: String(d.description), ...light,
        ...typeof d.value === 'number' ? { value: d.value } : {}, ...typeof use === 'string' ? { use } : {},
        ...use && typeof use === 'object' ? { unsupported: use } : {}, ...Object.keys(omits).length ? { omits } : {},
        source: { orsino: e.id, fidelity: (use && typeof use === 'object') || Object.keys(omits).length ? 'adapted'
          : 'faithful' } }];
    }));
  }
  private consumables(): Record<string, ItemKind> {
    return Object.fromEntries(this.family('consumable').map(e => {
      const d = e.definition as Raw, use = this.use((d.effects ?? []) as Raw[], e.id);
      // One Kyr cannot use yet is still a thing to carry, sell and give; what it would do is noted as missing.
      return [e.key, { name: String(d.name ?? OrsinoGoods.name(e.key)),
        category: typeof use === 'string' ? 'consumable' as const : 'gear' as const,
        description: String(d.description), ...typeof d.value === 'number' ? { value: d.value } : {},
        ...typeof use === 'string' ? { use } : { unsupported: use ?? { use: 'Orsino gives it no effect.' } },
        source: { orsino: e.id, fidelity: typeof use === 'string' ? 'faithful' : 'adapted' } }];
    }));
  }
  // What using it does, as Kyr's effect text ("Heal (3d4) health to ally."), or why Kyr cannot say it.
  private use(effects: Raw[], from: string): string | Omissions | undefined {
    if (!effects.length) { return undefined; }
    const said: string[] = [];
    for (const raw of effects) {
      const typed = this.helpers.effect(raw, from);
      if (typeof typed === 'string') { return { use: typed }; }
      for (const effect of typed) {
        const text = this.text(effect, from);
        if (!text) { return { use: `Kyr cannot use a ${effect.kind} effect from an item.` }; }
        said.push(text);
      }
    }
    return said.join(' ');
  }
  private text(effect: Effect, from: string): string | undefined {
    switch (effect.kind) {
      case 'heal': return `Heal (${effect.amount.kind === 'literal' ? effect.amount.value : effect.amount.expression}) health to ally.`;
      case 'apply': return effect.save ? undefined : `Apply ${effect.status} to ally for ${effect.duration} turns.`;
      case 'remove': {
        const status = effect.status || this.helpers.status(effect.pattern, from);
        return status ? `Remove ${status} from ally.` : undefined;
      }
      default: return undefined;
    }
  }
  private equipment(): Record<string, ItemKind> {
    return Object.fromEntries(this.family('equipment').map(e => {
      const d = e.definition as Raw, effect = { ...(d.effect ?? {}) as Raw };
      const t = this.helpers.modifiers(effect, e.id), base = this.base(d);
      const unsupported = Object.keys(t.unsupported).length ? { unsupported: t.unsupported } : {};
      // Magic armour with an armour class of its own is armour; one that only protects is worn in its place.
      const armor = d.kind === 'body' && typeof d.ac === 'number'
        ? { ac: d.ac, weight: String(d.weight ?? 'light'), type: 'magic' } : undefined;
      return [e.key, { name: String(d.name ?? OrsinoGoods.name(e.key)),
        category: base ? 'weapon' as const : armor ? 'armor' as const : 'equipment' as const,
        description: String(d.description), ...typeof d.value === 'number' ? { value: d.value } : {},
        slot: base ? 'weapon' : OrsinoGoods.slots[String(d.kind)] ?? 'charm', ...armor ? { armor } : {},
        ...base?.weapon ? { weapon: { ...base.weapon, ...typeof d.damage === 'string' ? { damage: d.damage } : {} } } : {},
        ...Object.keys(t.modifiers).length ? { modifiers: t.modifiers } : {},
        ...Object.keys(t.hooks).length ? { hooks: t.hooks } : {}, ...unsupported,
        source: { orsino: e.id, fidelity: Object.keys(unsupported).length ? 'adapted' : 'faithful' } }];
    }));
  }
  // A magic weapon's own weapon: a dagger is a dagger, whatever else it is.
  private base(d: Raw): ItemKind | undefined {
    const kind = String(d.kind);
    const weapon = this.helpers.weapons[kind];
    return weapon?.weapon ? weapon : (kind === 'weapon' && typeof d.damage === 'string'
      ? { name: 'weapon', category: 'weapon', description: '', weapon: { damage: d.damage, type: String(d.type ?? 'slashing') },
        source: { orsino: 'equipment' } } : undefined);
  }
}
