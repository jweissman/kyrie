import { Narration } from '../src/presentation/narration';
import type { ActionFeedback } from '../src/presentation/action-feedback';
import type { CampaignEvent } from '../src/campaign/campaign';
import type { Entry } from './play-types';

export interface Said { said: string; move: boolean; moved: boolean; place: string; placeName: string; elapsed: number }

// What a command leaves on the page. The page echoes what the company did, then tells what came of it, once: a
// thing learned is noted in the margin rather than told twice, coin spent is a note, and a walk from one room to
// the next is just the arrival.
export class PlayTranscript {
  static entry(event: CampaignEvent, f: ActionFeedback, c: Said): Entry {
    const fight = event.combat.some(e => e.type === 'end');
    const plain = c.move && c.moved && event.result === 'success' && !event.prelude;
    // Fallen on: what was seen and said as it happened comes before how the fight went.
    const ambush = event.prelude ? [...(event.prelude.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.text),
      event.prelude.response ?? ''] : [];
    const lines = [...ambush, ...(plain ? [] : [f.result]),
      ...f.immediate.map(l => l.replace(/^You witness: /, '')),
      ...(c.moved ? [] : f.observations), ...f.events];
    const told = Narration.tidy([...new Set(lines.filter(Boolean))],
      fight ? event.combat.filter(e => e.type === 'action').length : 0);
    const said = told.join(' ');
    const notes = [...f.resources.map(r => this.resource(r)),
      ...f.discoveries.filter(d => !said.includes(d)).map(d => `Noted: ${d}`)];
    return { at: f.time.split(' · ').at(-1)!, elapsed: c.elapsed, place: c.place, placeName: c.placeName,
      ...(c.moved ? { arrival: true } : {}), ...(plain ? {} : { said: c.said }),
      lines: told, notes, tone: fight ? 'fight' : event.result === 'failure' ? 'fail' : 'act',
      title: plain ? `→ ${c.placeName}` : c.said };
  }
  // "Coin: 22 → 21" reads "−1 coin (21 left)".
  static resource(line: string): string {
    const m = /^(.+): (\d+) → (\d+)$/.exec(line);
    if (!m) { return line; }
    const [, name, a, b] = m, delta = Number(b) - Number(a);
    return `${delta > 0 ? '+' : '−'}${Math.abs(delta)} ${name!.toLowerCase()} (${b} now)`;
  }
  // The entries the page tells for where the company is: everything since it last arrived here.
  static here(log: Entry[], place: string): Entry[] {
    let start = log.length;
    while (start > 0 && log[start - 1]!.place === place) {
      start--;
      if (log[start]!.arrival) { break; }
    }
    return log.slice(start);
  }
}
