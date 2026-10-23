import type { RegistryEntry } from './orsino-extract';

type Raw = Record<string, unknown>;
// One Orsino world entry made ready for generation: its words, its effect in the Kyr effect language (what a hazard
// means), and anything of it Kyr cannot do, said, never silently dropped.
export interface WorldPiece {
  name: string; text: string; effect?: string; omits?: Record<string, string>; source: string;
}
export interface WorldTables {
  wonders: Record<string, WorldPiece>; traps: Record<string, WorldPiece & { mechanism: string; sign: string }>;
  // What each shop sells: its kinds of item, and the Kyr items of those kinds it stocks, with their prices.
  shops: Record<string, { name: string; text: string; sells: string[]; source: string; stock: [string, number][] }>;
  riddles: Record<string, { question: string; answer: string; kind: string; level: string; source: string }[]>;
  // The answers a riddle is offered among, by kind of answer: the right one is one of them.
  riddleAnswers: Record<string, string[]>;
  dungeon: DungeonTables;
}
// Orsino's dungeon design (roomSequences, roomOverlays, specialRooms, treasure tiers, trap difficulties): how a run of
// rooms is paced, what each kind of room is likely to hold, the set pieces, and the treasure of each tier that Kyr has.
export interface DungeonTables {
  sequences: Record<string, string[][]>;
  overlays: Record<string, { encounter: number; puzzle: number; trap: number; treasure: number; wonder: number;
    challenging?: boolean }>;
  specials: Record<string, { npcs: string[]; treasure: string[]; text: string; source: string }>;
  treasure: Record<string, string[]>;
  trapDc: Record<string, { alert: number; disable: number }>;
}

// Orsino's wonders, traps, shops and riddles (settings/fantasy/tables.json) as tables a generated region draws from
// (data/generation/scenes/orsino-world.json): each wonder a thing that does what Orsino says it does, in Kyr's own
// effect language; each trap a mechanism on a way, with the save to escape it at the difficulty Orsino gives.
export class OrsinoWorld {
  static readonly mechanical = /acid|blade|dart|rock|pit|spike|gas|cloud|jet|vine|electrified|flame_burst|net|boulder/;
  static readonly worked = /plate|tripwire|switch/;
  constructor(private readonly entries: RegistryEntry[], private readonly known: { statuses: Set<string>;
    abilities: Set<string>; damage: Set<string>; items: Set<string>;
    // Kyr's items, with the Orsino entry each translates and its worth: what a shop can stock.
    catalog?: Record<string, { source?: { orsino?: string }; value?: number }> }) {}
  generate(): WorldTables {
    return { wonders: this.wonders(), traps: this.traps(), shops: this.shops(), riddles: this.riddles(),
      riddleAnswers: this.riddleAnswers(), dungeon: this.dungeon() };
  }
  private family(name: string): RegistryEntry[] { return this.entries.filter(e => e.family === name); }
  private wonders(): WorldTables['wonders'] {
    return Object.fromEntries(this.family('wonder').map(e => {
      const d = e.definition as Raw, groups = (d.wonderEffects as Raw[][] | undefined) ?? [];
      const { effect, omits } = this.effects(groups.flat(), 'ally');
      const text = String(d.wonderDescriptions ?? '').replace(/\.$/, '');
      return [e.key, { name: e.key.replace(/_/g, ' '), text, ...effect ? { effect } : {}, ...omits ? { omits } : {},
        source: `wonder:${e.key}` }];
    }));
  }
  private traps(): WorldTables['traps'] {
    const mechanisms = this.family('trapMechanism');
    const medium = this.family('trapDc').find(e => e.key === 'medium')?.definition as Raw | undefined;
    const dc = medium?.alert ?? 14;
    // Orsino draws a trap's mechanism at random; here a blade, a dart or a gas is worked by a plate, a wire or a
    // switch, and a spell by a glyph, a rune or a charged thing, each in turn.
    const made = mechanisms.filter(m => OrsinoWorld.worked.test(m.key));
    const cast = mechanisms.filter(m => !OrsinoWorld.worked.test(m.key));
    const counts = { made: 0, cast: 0 };
    return Object.fromEntries(this.family('trap').map(e => {
      const d = e.definition as Raw, groups = (d.trapEffects as Raw[][] | undefined) ?? [];
      const { effect, omits } = this.effects(groups.flat(), 'ally', Number(dc));
      const kind = OrsinoWorld.mechanical.test(e.key) ? 'made' : 'cast', from = kind === 'made' ? made : cast;
      const m = from[counts[kind]++ % from.length]!;
      return [e.key, { name: e.key.replace(/_/g, ' '), text: String(d.trapPunishmentDescriptions ?? ''), mechanism: m.key.replace(/_/g, ' '),
        sign: String(m.definition).replace(/^"|"$/g, ''), ...effect ? { effect } : {}, ...omits ? { omits } : {},
        source: `trap:${e.key}` }];
    }));
  }
  private shops(): WorldTables['shops'] {
    return Object.fromEntries(this.family('shop').map(e => {
      const d = e.definition as Raw, sells = (d.itemTypes as string[] | undefined) ?? [];
      return [e.key, { name: String(d.type ?? e.key), text: String(d.description ?? ''), sells, source: `shop:${e.key}`,
        stock: this.stock(sells, (d.itemRestrictions as Record<string, string[]> | null) ?? {}) }];
    }));
  }
  // The Kyr items a shop stocks: those of its kinds whose Orsino entries meet its restrictions (kind, rarity, type),
  // worth no more than a country's market sees (300 coin), cheapest first, at most eight.
  private stock(sells: string[], restrictions: Record<string, string[]>): [string, number][] {
    const by = new Map(this.entries.map(e => [e.id, e]));
    return Object.entries(this.known.catalog ?? {}).flatMap(([id, item]) => {
      const source = item.source?.orsino, entry = source ? by.get(source) : undefined;
      if (!entry || !sells.includes(entry.family) || !item.value || item.value > 300) { return []; }
      const def: Raw = { rarity: 'common', ...(entry.definition as Raw) };
      const fits = Object.entries(restrictions).every(([field, allowed]) => allowed.includes(String(def[field])));
      return fits ? [[id, Math.max(1, Math.round(item.value))] as [string, number]] : [];
    }).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0])).slice(0, 8);
  }
  private riddles(): WorldTables['riddles'] {
    return Object.fromEntries(this.family('riddle').map(e => [e.key, ((e.definition as Raw[]) ?? [])
      .filter(r => /^[\p{L} ,'?.!-]+$/u.test(String(r.question)))
      .map((r, n) => ({ question: String(r.question), answer: String(r.answer), kind: String(r.answer_type),
        level: e.key,
        source: `riddle:${e.key}#${n}` }))]));
  }
  private dungeon(): DungeonTables {
    const overlays = Object.fromEntries(this.family('roomOverlay').map(e => {
      const d = e.definition as Raw;
      return [e.key, { encounter: Number(d._encounterChance ?? 0), puzzle: Number(d._puzzleChance ?? 0),
        trap: Number(d._trapChance ?? 0), treasure: Number(d._treasureChance ?? 0),
        wonder: Number(d._wonderChance ?? 0),
        ...d.challenging ? { challenging: true } : {} }];
    }));
    const specials = Object.fromEntries(this.family('specialRoom').map(e => {
      const d = e.definition as Raw, text = String(d.narrative ?? '').replace(/^=?"?|"?$/g, '');
      return [e.key, { npcs: (d._npc_types as string[] | undefined) ?? [], text, source: `specialRoom:${e.key}`,
        treasure: ((d._treasureItems as string[] | undefined) ?? []).filter(i => this.known.items.has(i)) }];
    }));
    return { sequences: Object.fromEntries(this.family('roomSequence').map(e => [e.key, e.definition as string[][]])),
      overlays, specials,
      treasure: Object.fromEntries(this.family('treasureTier').map(e => [e.key, [...new Set(
        ((e.definition as Raw).treasure as string[][]).flat().filter(i => this.known.items.has(i)))]])),
      trapDc: Object.fromEntries(this.family('trapDc').map(e => [e.key, e.definition as { alert: number; disable: number }])) };
  }
  // Plain words only (a letter, a word): no rotated letters.
  private riddleAnswers(): WorldTables['riddleAnswers'] {
    return Object.fromEntries(this.family('riddleAnswer').map(e => [e.key, [...new Set(((e.definition as string[][])[0] ?? [])
      .filter(a => /^[A-Za-z][A-Za-z ]*$/.test(a)))]]).filter(([, list]) => (list as string[]).length >= 4));
  }
  // Orsino effects (Ability.ts handleSingleEffect) in the Kyr effect language, for a hazard to mean; what Kyr cannot
  // do is said with why.
  private effects(list: Raw[], target: string, dc?: number): { effect?: string; omits?: Record<string, string> } {
    const out: string[] = [], omits: Record<string, string> = {};
    const save = dc ? ` unless dexterity save against (${dc})` : '';
    for (const e of list) {
      const said = this.effect(e, target, save);
      if (said.startsWith('!')) { omits[String(e.type)] = said.slice(1); } else { out.push(said); }
    }
    return { ...out.length ? { effect: out.join(' ') } : {}, ...Object.keys(omits).length ? { omits } : {} };
  }
  private effect(e: Raw, target: string, save: string): string {
    const amount = String(e.amount ?? '1').replace(/^=/, '').trim(), number = /^\d+$/.test(amount) ? amount : `(${amount})`;
    switch (e.type) {
      case 'heal': return `Heal ${number} health to ${target}.`;
      case 'damage': {
        const kind = String(e.kind ?? 'true');
        return this.known.damage.has(kind) ? `Deal ${number} ${kind} damage to ${target}${save}.`
          : `!Damage of kind ${kind} is not a Kyr damage type.`;
      }
      case 'buff': case 'debuff': {
        const status = String(e.status);
        if (!this.known.statuses.has(status)) { return `!The condition ${status} is not one Kyr can apply.`; }
        const hours = Math.max(1, Math.round(Number(e.duration ?? 10) / 10));
        return `Apply ${status} to ${target} for ${hours} hour${hours === 1 ? '' : 's'}${e.type === 'debuff' ? save : ''}.`;
      }
      case 'learn': return this.known.abilities.has(String(e.abilityName)) ? `Teach ${String(e.abilityName)} to ${target}.`
        : `!The ability ${String(e.abilityName)} is not one Kyr has.`;
      case 'upgrade': return '!A lasting raise of a quality: Kyr raises qualities only by advancement.';
      case 'grantPassive': return '!A trait granted outside advancement: Kyr has no effect that grants one.';
      case 'planeshift': case 'teleport': return '!Travel to another plane or room: a generated country has no planes, and a wonder has no rooms to send anyone to.';
      default: return `!Orsino effect ${String(e.type)} has no Kyr equivalent.`;
    }
  }
}
