import { Content } from './content';
import { Effects, type EffectContext } from './effects';
import { Defenses, type Defense, type Mitigated } from './rules/defenses';
import { Fighting } from './rules/fighting';
import { FighterBody } from './fighter-body';
import variations from '../data/catalog/variations.json';
import type { Fighter } from './model';
import type { Effect } from './lang/parse';

// What a kind is, as one who knows it would tell it (FoeLore, OR-1432): its type as it is met (one a variation makes of
// the dead is of the dead), the harm it takes none of, takes half of, or is the worse for; whether every blow is halved
// on it, or some of each turned (and by what not); and its mending, with what stops it.
export interface KindTold {
  type?: string; immune: string[]; halved: string[]; blows: boolean; worse: string[];
  turned?: { amount: number | string; unless: string[] }; mends?: { stoppedBy: string[] };
}
// A blow as Effects.damage takes it: its amount and kind, what a critical added, and what its weapon carries.
// triggers: false, its kind sets off none of the conditions it triggers (the SRD's harm: see Effect's).
export interface Hit { amount: number; type: string; critical?: number; tags?: string[]; triggers?: false }

// A fighter's kind's typed defenses as a fight meets them (the SRD adaptation briefing, §3): what a blow carries to
// them, and its kind's regeneration at the end of its turn. Its kind's fractions are summed into its modifiers with
// every other source's (Effects.modifiers); the rest are read here.
export class KindDefenses {
  // Its kind's fractions (its typed defenses', Canon.defended) and those of what varies it (the frost's proof against
  // cold, what the dead are hurt by), as modifiers to be summed with every other source's.
  static fractions(fighter: Fighter): { resistances: Record<string, number> }[] {
    const body = FighterBody.of(fighter), kind = body ? Defenses.fractions(body.defenses) : {};
    const varied = (fighter.variations ?? []).flatMap(id => {
      const r = (variations.variations as Record<string, { resistances?: Record<string, number> }>)[id]?.resistances;
      return r ? [{ resistances: r }] : [];
    });
    return [...Object.keys(kind).length ? [{ resistances: kind }] : [], ...varied];
  }
  static told(fighter: Fighter): KindTold {
    const fractions = Effects.modifiers(fighter).resistances ?? {}, defenses = this.of(fighter);
    const physical = Content.rules.physicalDamage.filter(k => k !== 'physical');
    const immune = defenses.flatMap(d => d.kind === 'immunity' ? d.to : []);
    const halved = Object.entries(fractions).filter(([k, v]) => v >= 0.5 && k !== 'all' && !immune.includes(k))
      .map(([k]) => k);
    const blows = halved.includes('physical') || physical.every(k => halved.includes(k));
    const turned = blows ? undefined : defenses.find(d => d.kind === 'reduction'
      && (d.to ?? ['physical']).some(k => k === 'physical' || physical.includes(k)));
    const mends = defenses.find(d => d.kind === 'regeneration');
    const type = (fighter.variations ?? []).map(id => (variations.variations as Record<string, { type?: string }>)[id]
      ?.type).find(Boolean);
    return { ...type ? { type } : {}, immune, blows, halved: halved.filter(k => k !== 'physical' && !physical.includes(k)),
      worse: Object.entries(fractions).filter(([k, v]) => v < 0 && k !== 'all').map(([k]) => k),
      ...turned?.kind === 'reduction' ? { turned: { amount: turned.amount, unless: turned.unless ?? [] } } : {},
      ...mends?.kind === 'regeneration' ? { mends: { stoppedBy: mends.stoppedBy ?? [] } } : {} };
  }
  // A harm's blow: its amount and kind, and whether its kind sets off what it triggers (see Effect's triggers).
  static blow(e: Extract<Effect, { kind: 'damage' | 'drain' }>, amount: number, otherwise = 'physical'): Hit {
    return { amount, type: e.damageType ?? otherwise, triggers: e.triggers };
  }
  // What its defenses did to a blow, for the event's account: what held, and what a tag passed.
  static account(m: Mitigated): Pick<Mitigated, 'guarded' | 'bypassed'> {
    return { ...m.guarded ? { guarded: m.guarded } : {}, ...m.bypassed ? { bypassed: m.bypassed } : {} };
  }
  // Its kind's defenses beside those fractions: immunity, flat resistance, reduction, regeneration.
  static of(fighter: Fighter): Defense[] {
    const own = FighterBody.of(fighter)?.defenses ?? [];
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
