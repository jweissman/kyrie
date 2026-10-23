import type { Campaign } from '../campaign/campaign';
import type { VoiceLine } from './voice';

// How the narrator chooses among lines that fit a moment, and names those it speaks of.
export class Editor {
  // One of the lines that fit, not yet said if any are left, drawn by the moment so the same moment draws the same.
  static choose(lines: VoiceLine[], key: string, used: Set<string>): VoiceLine | undefined {
    const fresh = lines.filter(l => !used.has(l.id)), pool = fresh.length ? fresh : lines;
    if (!pool.length) { return undefined; }
    const total = pool.reduce((sum, l) => sum + (l.weight ?? 1), 0);
    let hash = 2166136261;
    for (let i = 0; i < key.length; i++) { hash = Math.imul(hash ^ key.charCodeAt(i), 16777619); }
    let roll = ((hash >>> 0) % 1000) / 1000 * total;
    for (const l of pool) { roll -= l.weight ?? 1; if (roll < 0) { return l; } }
    return pool.at(-1);
  }
  // Someone as a sentence names them: "Tobu", not "Tobu, Kezu's sister's boy"; "the hall dog".
  static called(campaign: Campaign, id: string): string {
    return (campaign.module.entities.find(e => e.id === id)?.name ?? id).split(', ')[0]!;
  }
}
