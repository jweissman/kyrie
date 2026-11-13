import { Amounts } from './amounts';
import type { Modifiers } from './modifiers';

// What harm a defense answers: damage types, `physical` (every blow's kind: slashing, piercing, bludgeoning) or `all`.
export type DamageSelector = string;
// A creature's typed defenses (the SRD adaptation briefing, §3): immunity to some harm; resistance to it, a flat amount
// off each blow (fire 10) or a fraction of it (Orsino's 0.5); reduction of blows, unless the attack carries one of the
// tags that pass it (silver, magic, adamantine: 10/magic); and regeneration, healing each turn's end unless harm of a
// kind that stops it (fire, acid) struck since. Amounts are numbers or dice, as everywhere a number is wanted.
export type Defense =
  | { kind: 'immunity'; to: DamageSelector[] }
  | { kind: 'resistance'; to: DamageSelector[]; amount: number | string; mode: 'flat' | 'fraction' }
  | { kind: 'reduction'; amount: number | string; unless?: string[]; to?: DamageSelector[] }
  | { kind: 'regeneration'; amount: number | string; stoppedBy?: DamageSelector[] };
// What a defense did to one blow, for the account: what it kept off, or which tag passed it.
export interface Guarded { defense: 'immunity' | 'resistance' | 'reduction'; amount: number; to?: string; by?: string }
export interface Mitigated {
  amount: number; bonus: number; resistance: number; reduction: number; guarded?: Guarded[]; bypassed?: Guarded[];
}
// A blow as its defender's defenses meet it: its amount and the attacker's bonus, its kind, the tags it carries, the
// kinds that are blows, and how a defense's dice are thrown.
interface Blow {
  amount: number; bonus: number; type: string; tags?: string[]; physical: string[];
  evaluate?: (amount: string) => number;
}

// The order harm meets a creature's defenses, explicitly: true damage passes all of them; then immunity; then
// resistance as a fraction (summed from every source, as Orsino adds them: its kind, what varies it, its traits, its
// conditions, its gear); then the best flat resistance to the kind; then the best reduction the blow does not pass.
// Temporary hit points, hit points and regeneration's eligibility follow in Effects. Nothing here rolls a die unless a
// defense's amount is dice, and then by the caller's stream.
export class Defenses {
  static readonly kinds = ['immunity', 'resistance', 'reduction', 'regeneration'];
  static readonly modes = ['flat', 'fraction'];
  // Whether a selector names this kind of harm.
  static selects(to: DamageSelector[] | undefined, type: string, physical: string[]): boolean {
    return (to ?? ['physical']).some(s => s === 'all' || s === type || (s === 'physical' && physical.includes(type)));
  }
  // The fraction of a kind of harm a creature's summed modifiers turn: resistAll and the kind's own (or, for a blow,
  // the physical share where the kind has none of its own); positive turns it, negative is a weakness.
  static fraction(modifiers: Modifiers, type: string, physical: string[]): number {
    const r = modifiers.resistances ?? {};
    return (r.all ?? 0) + (r[type] ?? (physical.includes(type) ? r.physical ?? 0 : 0));
  }
  // The fractions of a list of defenses as Orsino's resistance map, to be summed with every other source's.
  static fractions(defenses: readonly Defense[] = []): Record<string, number> {
    const out: Record<string, number> = {};
    for (const d of defenses) {
      if (d.kind !== 'resistance' || d.mode !== 'fraction') { continue; }
      for (const to of d.to) { out[to] = (out[to] ?? 0) + Number(d.amount); }
    }
    return out;
  }
  // An old resistance map (a species' `resistances`) as defenses: one fraction a kind, the same harm turned.
  static translated(resistances: Record<string, number> | undefined): Defense[] {
    return Object.entries(resistances ?? {}).map(([to, amount]) => ({ kind: 'resistance', to: [to], amount,
      mode: 'fraction' }) as Defense);
  }
  static mitigate(blow: Blow, modifiers: Modifiers, defenses: readonly Defense[] = []): Mitigated {
    const bonus = blow.bonus;
    let damage = Math.max(0, blow.amount + bonus);
    const out: Mitigated = { amount: damage, bonus, resistance: 0, reduction: 0 };
    if (blow.type === 'true') { return out; }
    const guarded: Guarded[] = [], bypassed: Guarded[] = [];
    const mitigation = { blow, modifiers, defenses, bypassed };
    if (defenses.some(d => d.kind === 'immunity' && Defenses.selects(d.to, blow.type, blow.physical))) {
      guarded.push({ defense: 'immunity', amount: damage, to: blow.type });
      return { ...out, amount: 0, resistance: 1, guarded };
    }
    const resistance = Defenses.fraction(modifiers, blow.type, blow.physical);
    if (resistance > 0) { damage = Math.floor(damage * (1 - Math.min(1, resistance))); }
    else if (resistance < 0) { damage = Math.floor(damage * (1 + Math.abs(resistance))); }
    const flat = Math.max(0, ...defenses.filter(d => d.kind === 'resistance' && d.mode === 'flat'
      && Defenses.selects(d.to, blow.type, blow.physical))
      .map(d => Defenses.amount((d as { amount: number | string }).amount, blow.evaluate)));
    if (flat > 0 && damage > 0) { guarded.push({ defense: 'resistance', amount: Math.min(flat, damage), to: blow.type }); }
    damage = Math.max(0, damage - flat);
    const { reduction, typed } = Defenses.reduction(mitigation);
    // Orsino's untyped reduction is told as it was (the event's reduction); a typed one is named as what held.
    if (typed && reduction > 0 && damage > 0) {
      guarded.push({ defense: 'reduction', amount: Math.min(reduction, damage) });
    }
    damage = Math.max(0, damage - reduction);
    return { amount: damage, bonus, resistance, reduction, ...guarded.length ? { guarded } : {},
      ...bypassed.length ? { bypassed } : {} };
  }
  // The best reduction a blow does not pass: Orsino's untyped damageReduction (every harm but true), or a typed one
  // over blows (by default) that a tag of the attack's passes. Reductions do not stack; the best holds (the SRD's
  // rule).
  // A reduction better than what held, which a tag passed, is said as passed (silver passed its guard).
  private static reduction({ blow, modifiers, defenses, bypassed }: { blow: Blow; modifiers: Modifiers;
    defenses: readonly Defense[]; bypassed: Guarded[] }):
    { reduction: number; typed: boolean } {
    let best = modifiers.damageReduction ?? 0, typed = false, passed: Guarded | undefined;
    for (const d of defenses) {
      if (d.kind !== 'reduction' || !Defenses.selects(d.to, blow.type, blow.physical)) { continue; }
      const amount = Defenses.amount(d.amount, blow.evaluate);
      const by = (d.unless ?? []).find(tag => blow.tags?.includes(tag));
      if (by) { if (amount > (passed?.amount ?? 0)) { passed = { defense: 'reduction', amount, by }; } continue; }
      if (amount > best) { best = amount; typed = true; }
    }
    if (passed && passed.amount > best) { bypassed.push(passed); }
    return { reduction: best, typed };
  }
  // How a defense's amount is had: a number as it is, dice thrown by the caller's stream (or their mean, without one).
  private static amount(amount: number | string, thrown?: (text: string) => number): number {
    return typeof amount === 'number' ? amount : thrown ? thrown(amount) : Math.floor(Amounts.mean(amount));
  }
  // Whether harm of this kind stops a regeneration (fire stops a troll's).
  static stops(defenses: readonly Defense[], type: string, physical: string[]): boolean {
    return defenses.some(d => d.kind === 'regeneration' && (d.stoppedBy ?? []).length > 0
      && Defenses.selects(d.stoppedBy, type, physical));
  }
}
