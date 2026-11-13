import { Canon } from '../canon/canon';
import type { CombatEvent } from '../model';

type Harm = Extract<CombatEvent, { type: 'damage' | 'heal' }>;

// What a creature's defenses did, as the fight is told (the SRD adaptation briefing, §3: "silver passed a defense",
// "fire stopped regeneration"), in the rules' own words (vocabulary.json's combat.defenses.told), read from the event
// that says what each defense kept off or what passed it, never from the numbers.
export class DefenseTelling {
  // A sentence for each thing a defense did to a blow or a mending; a blow it turned entirely is told as no harm
  // already (CombatTelling), and is not said twice.
  static said(e: Harm, target: string): string[] {
    const told = Canon.rules.combat.defenses.told;
    if (e.type === 'heal') { return e.stoppedBy ? [DefenseTelling.fill(told.stopped, { type: e.stoppedBy, target })] : []; }
    const m = e.modifiers, type = e.damageType ?? 'harm';
    return [...(m?.bypassed ?? []).map(b => DefenseTelling.fill(told.passed, { by: (b.by ?? '').replace(/_/g, ' '), target })),
      ...(m?.guarded ?? []).filter(g => g.defense !== 'immunity').map(g => DefenseTelling.fill(
        g.defense === 'resistance' ? told.resisted : told.reduced, { type, amount: String(g.amount), target }))];
  }
  // The dice-side account, for the chronicle: each defense and what it kept off.
  static detail(e: Harm): string[] {
    const m = e.modifiers;
    // A reduction held is the event's own reduction, said already beside it.
    return [...(m?.guarded ?? []).filter(g => g.defense !== 'reduction').map(g => g.defense === 'immunity'
      ? `immune to ${g.to ?? 'it'}` : `${g.defense} ${g.amount}`), ...(m?.bypassed ?? []).map(b => `${(b.by ?? '').replace(/_/g, ' ')} passes reduction ${b.amount}`),
    ...e.stoppedBy ? [`regeneration stopped by ${e.stoppedBy}`] : []];
  }
  // A sentence of the telling, its words put in (the telling begins it with its capital).
  private static fill(template: string, words: Record<string, string>): string {
    return `${template.replace(/\{(\w+)\}/g, (_, key: string) => words[key] ?? '')}.`;
  }
}
