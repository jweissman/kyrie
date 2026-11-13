import { Canon } from './canon/canon';
import { Content } from './content';
import { Effects, type EffectContext } from './effects';
import { Defenses, type Defense, type Mitigated } from './rules/defenses';
import { Fighting } from './rules/fighting';
import variations from '../data/catalog/variations.json';
import type { Fighter } from './model';

// A blow as Effects.damage takes it: its amount and kind, what a critical added, and what its weapon carries.
export interface Hit { amount: number; type: string; critical?: number; tags?: string[] }

// A fighter's kind's typed defenses as a fight meets them (the SRD adaptation briefing, §3): what a blow carries to
// them, and its kind's regeneration at the end of its turn. Its kind's fractions are summed into its modifiers with
// every other source's (Effects.modifiers); the rest are read here.
export class KindDefenses {
  // Its kind's fractions (its typed defenses', Canon.defended) and those of what varies it (the frost's proof against
  // cold, what the dead are hurt by), as modifiers to be summed with every other source's.
  static fractions(fighter: Fighter): { resistances: Record<string, number> }[] {
    const kind = Canon.isBody(fighter.raceId) ? Defenses.fractions(Canon.creature(fighter.raceId).defenses) : {};
    const varied = (fighter.variations ?? []).flatMap(id => {
      const r = (variations.variations as Record<string, { resistances?: Record<string, number> }>)[id]?.resistances;
      return r ? [{ resistances: r }] : [];
    });
    return [...Object.keys(kind).length ? [{ resistances: kind }] : [], ...varied];
  }
  // What its defenses did to a blow, for the event's account: what held, and what a tag passed.
  static account(m: Mitigated): Pick<Mitigated, 'guarded' | 'bypassed'> {
    return { ...m.guarded ? { guarded: m.guarded } : {}, ...m.bypassed ? { bypassed: m.bypassed } : {} };
  }
  // Its kind's defenses beside those fractions: immunity, flat resistance, reduction, regeneration.
  static of(fighter: Fighter): Defense[] {
    const own = Canon.isBody(fighter.raceId) ? Canon.creature(fighter.raceId).defenses ?? [] : [];
    return own.filter(d => !(d.kind === 'resistance' && d.mode === 'fraction'));
  }
  // A blow, after the attacker's bonus, through the defender's defenses: it carries its damage type, the weapon's
  // tags, and a spell's (spell, magic). Harm of a kind its regeneration cannot mend stops it at the turn's end.
  static mitigate(target: Fighter, hit: { amount: number; bonus: number; type: string; tags?: string[] },
    context: EffectContext): Mitigated {
    const defenses = KindDefenses.of(target), physical = Content.rules.physicalDamage;
    const expressions = context.expressions;
    const mitigated = Fighting.mitigate(hit.amount, hit.type, { bonus: hit.bonus, defender: Effects.modifiers(target),
      physical, defenses, tags: [hit.type, ...hit.tags ?? [], ...context.spell ? ['spell', 'magic'] : []],
      ...expressions ? { evaluate: expressions.number.bind(expressions) } : {} });
    if (mitigated.amount > 0 && Defenses.stops(defenses, hit.type, physical)) { target.unmended = hit.type; }
    return mitigated;
  }
  // It mends at the end of its turn, unless harm of a kind it cannot mend struck it since the last, which is said
  // (the briefing's "fire stopped regeneration"): a heal of nothing, naming what stopped it.
  static regenerate(actor: Fighter, context: EffectContext) {
    const stopped = actor.unmended;
    delete actor.unmended;
    for (const d of KindDefenses.of(actor)) {
      if (d.kind !== 'regeneration' || actor.hp === 0) { continue; }
      if (stopped && Defenses.selects(d.stoppedBy ?? [], stopped, Content.rules.physicalDamage)) {
        context.events.push({ type: 'heal', turn: context.turn, actor: actor.id, target: actor.id, rolled: 0, amount: 0,
          hp: actor.hp, stoppedBy: stopped });
        continue;
      }
      Effects.periodicOf(actor, [{ kind: 'heal', amount: String(d.amount) }], 'regeneration', context);
    }
  }
}
