import type { Content } from './content';
import type { Expressions } from './expressions';
import type { Area, Effect } from './lang';
import type { CombatEvent, Fighter } from './model';
import type { HookKey } from './rules/catalog-schema';
import type { Recovery } from './rules/daily-uses';

export interface EffectContext {
  source?: { id: string; kind: 'ability' | 'trap' | 'item' | 'shrine'; name?: string };
  actor?: Fighter; recipients?: Fighter[]; values?: Record<string, number>;
  // A nested cast from a scroll may use a fixed caster level below its reader's level.
  castingLevel?: number;
  fighters: Fighter[]; turn: number; events: CombatEvent[];
  content: Content; abilities: string[]; retreat: boolean; location: string | null;
  // The seeded stream dice bonuses (bonusDamage "1d4") and temporary hit points are rolled from.
  expressions?: Expressions;
  // A blow sent back by a reflection, which is not reflected again.
  reflected?: boolean;
  // Runs a creature's status or item hooks (set by AbilityUse); hooking marks effects already inside a hook.
  hook?: (holder: Fighter, key: HookKey, subject: Fighter, context: EffectContext) => void;
  hooking?: boolean;
  // Whether what is being done is a spell, whose harm its caster's bonusSpellDamage adds to.
  spell?: boolean;
  // The conditions what is being done lays on by itself (a venomous bite's poison): its harm's kind does not also
  // trigger them, so it has one chance to, not two (CB-14, the lead's ruling).
  applies?: ReadonlySet<string>;
  // What recovery this is, for what recharges only by night or by day (see DailyUses.restore).
  recovery?: Recovery;
  // The creatures an ability drew at random, drawn once for all its effects and its resist saves.
  drawn?: Fighter[];
  // Where an area is let loose, and its shape: whoever stands there is caught (see Positions).
  aim?: { area: Area; at: string };
  // An ability another one casts (Orsino's cast effect) costs nothing.
  free?: boolean;
  // A spell that allows spell resistance being cast: whom it has got past, or not, checked once each (SpellResistance).
  resisting?: Map<string, boolean>;
  // Outside a fight (a hazard met, a shrine's touch, a thing used in the field): what lasts a fight does not begin.
  field?: boolean;
  // Runs a lapsing condition's effects (set by the battle, which knows how to resolve them).
  lapse?: (holder: Fighter, effects: Effect[], context: EffectContext) => void;
  // How the company would fare running now (set by the battle): sure, in the moment before a fight that came at it
  // closes; and how many times it has tried and been held, each surer than the last.
  sure?: boolean; tries?: number;
}
