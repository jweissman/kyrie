import { readFileSync } from 'node:fs';
import hand from '../../data/catalog/abilities.json';
import orsino from '../../data/catalog/orsino/abilities.json';
import { FieldUse } from '../../src/campaign/field-use';
import { Content } from '../../src/content';
import type { ArenaAbility, Effect } from '../../src/lang';
import { EffectSentences } from './effect-sentences';

type Entry = { name: string; effect?: string; effects?: Effect[] };

// The abilities measured against the world (OR-1098; doc/design/research-abilities-and-the-world-2026-11-26.md, §2):
// how many of the catalog's entries the effect language can say, and how many playable abilities the world can read
// outside a fight, or that change what the world lets the company do.
export class AbilityCensus {
  // Every entry of both catalog files, the generated and the hand-written (a hand entry replacing a generated one is
  // counted as each), as the research counted them: 411 on 26 November.
  static entries(): [string, Entry][] {
    return [...Object.entries(orsino.abilities), ...Object.entries(hand.abilities)] as [string, Entry][];
  }
  static roundTrip(): { total: number; equal: number; lacks: Record<string, number>; differs: string[] } {
    const lacks: Record<string, number> = {}, differs: string[] = [];
    let equal = 0;
    const all = this.entries();
    for (const [id, a] of all) {
      if (a.effect) {
        try { EffectSentences.parse(id, a.effect); equal++; } catch (error) { differs.push(`${id}: ${String(error)}`); }
        continue;
      }
      const r = EffectSentences.roundTrip(id, a.effects ?? []);
      if (r === 'equal') { equal++; } else if ('lacks' in r) { lacks[r.lacks] = (lacks[r.lacks] ?? 0) + 1; } else {
        differs.push(`${id}: ${r.differs}`);
      }
    }
    return { total: all.length, equal, lacks, differs };
  }

  // The elements the kernel's rules let loose in a place (data/rules/elements.kyr), by their declarations there (the
  // language's module parser is not loaded beside the catalog here: its entry meets the language's inner cycle).
  static elements(): Set<string> {
    const text = readFileSync(new URL('../../data/rules/elements.kyr', import.meta.url), 'utf8');
    return new Set([...text.matchAll(/Entity (\w+): element\b/g)].map(m => m[1]!));
  }
  private static readonly area = new Set(['enemies', 'allies', 'party', 'all']);
  // An ability whose harm lets an element loose in the room it is used in (Exposure).
  static exposes(a: ArenaAbility, elements: Set<string>): boolean {
    return a.effects.some(e => e.kind === 'damage' && this.area.has(e.target) && elements.has(e.damageType));
  }
  // An ability that lays a condition granting a capability (Light's lit, Knock's unbarring): what the world then lets
  // the company do.
  static enables(a: ArenaAbility): boolean {
    return a.effects.some(e => e.kind === 'apply' && !!Content.statuses[e.status]?.grants?.length);
  }
  static reach(): { playable: number; reading: string[]; enabling: string[] } {
    const elements = this.elements();
    const reading = Content.abilities.filter(a => FieldUse.safe(a.id) || FieldUse.hostile(a.id)
      || FieldUse.carries(a.id) || this.exposes(a, elements) || this.enables(a)).map(a => a.id);
    return { playable: Content.abilities.length, reading, enabling: Content.abilities.filter(a => this.enables(a))
      .map(a => a.id) };
  }
}
