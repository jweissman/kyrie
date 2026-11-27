import { CanonRuntime } from '../../src/canon/canon-runtime';
import type { Amount, Effect, Save } from '../../src/lang';

// An effect printed as the sentence the effect language (src/lang/Abilities.ohm) reads, or why it cannot be: the field
// or form the grammar has no word for. The printer is the census's instrument (OR-1098), not the product's: what it
// cannot print is what the language cannot yet say (OR-1105's round trip).
export type Printed = { sentence: string } | { lacks: string };

export class EffectSentences {
  // The modifiers the grammar has no word for, each named as the census counts it.
  private static readonly modifiers = ['targetTrait', 'count', 'hitDice', 'chain', 'touch', 'triggers'] as const;
  private static readonly targets = new Set(['dead ally', 'random enemy', 'enemies', 'allies', 'party', 'enemy', 'ally',
    'self', 'all', 'it', 'here']);

  static amount(a: Amount): string { return a.kind === 'literal' ? String(a.value) : `(${a.expression})`; }

  static print(effects: Effect[]): Printed {
    if (!effects.length) { return { lacks: 'no effects' }; }
    const sentences: string[] = [];
    for (const effect of effects) {
      const one = this.statement(effect);
      if ('lacks' in one) { return one; }
      sentences.push(one.sentence);
    }
    return { sentence: sentences.join(' ') };
  }

  static statement(effect: Effect): Printed {
    const modifier = this.modifiers.find(m => effect[m] !== undefined);
    if (modifier) { return { lacks: modifier }; }
    if (!this.targets.has(effect.target)) { return { lacks: `the target ${effect.target}` }; }
    const save = effect.save ? this.save(effect.save) : { sentence: '' };
    if ('lacks' in save) { return save; }
    const action = this.action(effect);
    if ('lacks' in action) { return action; }
    const when = effect.when ? `If (${effect.when}), ` : '';
    const resisted = effect.onResist ? `; resisting ${this.verdict(effect.onResist)} it` : '';
    return { sentence: `${when}${action.sentence}${save.sentence}${resisted}.` };
  }

  private static save(save: Save): Printed {
    if (save.again) { return { lacks: 'save.again' }; }
    if (save.lesser !== undefined) { return { lacks: 'save.lesser' }; }
    const name = save.stat ?? save.kind;
    if (!name) { return { lacks: 'save.name' }; }
    if (save.success) { return { sentence: `; a ${name} save against ${this.amount(save.difficulty)} ${this.verdict(save.success)} it` }; }
    return { sentence: ` unless ${name} save against ${this.amount(save.difficulty)}` };
  }
  private static verdict(v: 'half' | 'negate'): string { return v === 'half' ? 'halves' : 'negates';
  }

  private static action(e: Effect): Printed {
    const a = (x: Amount) => this.amount(x);
    switch (e.kind) {
      case 'damage': return { sentence: `Deal ${a(e.amount)} ${e.damageType} damage to ${e.target}` };
      case 'heal': return { sentence: `Heal ${a(e.amount)} health to ${e.target}` };
      case 'defend': return { sentence: 'Defend' };
      case 'flee': return { sentence: 'Flee' };
      case 'apply': return this.apply(e);
      case 'remove': return e.pattern !== undefined ? { lacks: 'remove.pattern' }
        : { sentence: `Remove ${e.status} from ${e.target}` };
      case 'drain': return e.damageType !== undefined ? { lacks: 'drain.damageType' }
        : { sentence: `Drain ${a(e.amount)} health from ${e.target}` };
      case 'enervate': return { sentence: `Drain ${a(e.amount)} levels from ${e.target}` };
      case 'revive': return e.percent !== undefined || e.traits ? { lacks: 'revive.percent' }
        : { sentence: `Revive ${e.target} with ${a(e.amount)} health` };
      case 'kill': return { sentence: `Kill ${e.target}` };
      case 'gain': return { sentence: `Grant ${a(e.amount)} ${e.resource} to ${e.target}` };
      case 'learn': return { sentence: `Teach ${e.ability} to ${e.target}` };
      case 'summon': return e.from || e.byAncestry || e.amount || e.level !== undefined ? { lacks: 'summon.from' }
        : { sentence: `Summon ${e.creature} for ${e.target}` };
      case 'travel': return { sentence: `Travel to ${e.location}` };
      case 'cast': return { sentence: `Cast ${e.ability} on ${e.target}` };
      case 'try': return { sentence: e.target === 'here' ? `Try ${e.verb} here` : `Try ${e.verb} on ${e.target}` };
      default: return { lacks: e.kind };
    }
  }

  private static apply(e: Extract<Effect, { kind: 'apply' }>): Printed {
    if (e.amount) { return { lacks: 'apply.amount' }; }
    if (typeof e.duration !== 'number') { return { lacks: 'apply.duration' }; }
    if (e.clock === 'world-time' && e.duration % 6 === 0) {
      const hours = e.duration / 6;
      return { sentence: `Apply ${e.status} to ${e.target} for ${hours} ${hours === 1 ? 'hour' : 'hours'}` };
    }
    if (e.clock) { return { lacks: `apply.clock ${e.clock}` }; }
    return { sentence: `Apply ${e.status} to ${e.target} for ${e.duration} ${e.duration === 1 ? 'turn' : 'turns'}` };
  }

  // A sentence read as the catalog reads one (CanonRuntime.ability, by the effect language's parser).
  static parse(id: string, sentence: string): Effect[] {
    return CanonRuntime.ability(id, { name: id, kind: 'spell', effect: sentence }).effects;
  }
  // A value with its keys sorted, so two effects are compared by what they say, not the order it was said in.
  static canonical(value: unknown): unknown {
    if (Array.isArray(value)) { return value.map(v => this.canonical(v)); }
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)
        .sort(([x], [y]) => x.localeCompare(y)).map(([k, v]) => [k, this.canonical(v)]));
    }
    return value;
  }

  // Printed and read back: equal, unprintable (with what it lacks), or a disagreement (printed but failed to parse, or
  // came back different), which would be the printer's or the language's fault.
  static roundTrip(id: string, effects: Effect[]): 'equal' | { lacks: string } | { differs: string } {
    const printed = this.print(effects);
    if ('lacks' in printed) { return printed; }
    try {
      const back = this.parse(id, printed.sentence);
      return JSON.stringify(this.canonical(back)) === JSON.stringify(this.canonical(effects)) ? 'equal'
        : { differs: printed.sentence };
    } catch (error) { return { differs: `${printed.sentence} (${(error as Error).message.split('\n')[0]})` }; }
  }
}
