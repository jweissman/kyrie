import type { Campaign } from '../campaign/campaign';
import { ObservationText } from '../lang/observation-text';
import type { VoiceLine } from './voice';

// How the narrator chooses among lines that fit a moment, and names those it speaks of.
export class Editor {
  // One of the lines that fit, not yet said if any are left, drawn by the moment so the same moment draws the same.
  // A line not yet said, drawn by the key; when every one has been said, the one said longest ago (used is in the
  // order lines were last said: see said).
  static choose(lines: VoiceLine[], key: string, used: Set<string>): VoiceLine | undefined {
    const fresh = lines.filter(l => !used.has(l.id)), order = [...used];
    if (!fresh.length) { return [...lines].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))[0]; }
    const pool = fresh;
    const total = pool.reduce((sum, l) => sum + (l.weight ?? 1), 0);
    let hash = 2166136261;
    for (let i = 0; i < key.length; i++) { hash = Math.imul(hash ^ key.charCodeAt(i), 16777619); }
    let roll = ((hash >>> 0) % 1000) / 1000 * total;
    for (const l of pool) { roll -= l.weight ?? 1; if (roll < 0) { return l; } }
    return pool.at(-1);
  }
  // A line said now goes to the end of what has been said, so the one said longest ago is first.
  static said(used: Set<string>, id: string) { used.delete(id); used.add(id); }
  // The lines said so far, in the order each was last said.
  static recency(ids: string[]): Set<string> {
    return new Set(ids.filter((id, i) => ids.lastIndexOf(id) === i));
  }
  // Someone as a sentence names them: "Tobu", not "Tobu, Kezu's sister's boy"; "the hall dog".
  // As the company would name it: what a place looks like until the fact naming it is known ("You leave Grimwater
  // Keep" was told of a keep the company knew as a ruined tower: the architecture review's A13).
  static called(campaign: Campaign, id: string): string { return ObservationText.label(campaign.world, id); }
}
