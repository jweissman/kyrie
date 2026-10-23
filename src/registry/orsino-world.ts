import type { RegistryEntry } from './orsino-extract';

type Raw = Record<string, unknown>;
// One Orsino world entry made ready for generation: its words, its effect in the Kyr effect language (what a hazard
// means), and anything of it Kyr cannot do, said, never silently dropped.
export interface WorldPiece {
  name: string; text: string; effect?: string; omits?: Record<string, string>; source: string;
}
export interface WorldTables {
  wonders: Record<string, WorldPiece>; traps: Record<string, WorldPiece & { mechanism: string; sign: string }>;
  shops: Record<string, { name: string; text: string; sells: string[]; source: string }>;
  riddles: Record<string, { question: string; answer: string; kind: string; level: string; source: string }[]>;
}

// Orsino's wonders, traps, shops and riddles (settings/fantasy/tables.json) as tables a generated region draws from
// (data/generation/scenes/orsino-world.json): each wonder a thing that does what Orsino says it does, in Kyr's own
// effect language; each trap a mechanism on a way, with the save to escape it at the difficulty Orsino gives.
export class OrsinoWorld {
  static readonly mechanical = /acid|blade|dart|rock|pit|spike|gas|cloud|jet|vine|electrified|flame_burst|net|boulder/;
  static readonly worked = /plate|tripwire|switch/;
  constructor(private readonly entries: RegistryEntry[], private readonly known: { statuses: Set<string>;
    abilities: Set<string>; damage: Set<string>; items: Set<string> }) {}
  generate(): WorldTables {
    return { wonders: this.wonders(), traps: this.traps(), shops: this.shops(), riddles: this.riddles() };
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
      const d = e.definition as Raw;
      return [e.key, { name: String(d.type ?? e.key), text: String(d.description ?? ''), sells: (d.itemTypes as string[] | undefined) ?? [],
        source: `shop:${e.key}` }];
    }));
  }
  private riddles(): WorldTables['riddles'] {
    return Object.fromEntries(this.family('riddle').map(e => [e.key, ((e.definition as Raw[]) ?? [])
      .filter(r => /^[\p{L} ,'?.!-]+$/u.test(String(r.question)))
      .map((r, n) => ({ question: String(r.question), answer: String(r.answer), kind: String(r.answer_type),
        level: e.key,
        source: `riddle:${e.key}#${n}` }))]));
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
