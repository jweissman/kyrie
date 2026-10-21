import { Narration } from '../src/presentation/narration';
import type { ActionFeedback } from '../src/presentation/action-feedback';
import type { CampaignEvent } from '../src/campaign/campaign';
import type { LogEntry } from '../src/ui/screen-types';

// What a command leaves in the log the player reads: a title (the choice, or the place arrived at) and the lines
// that say what came of it, in the order they happened.
export class MonoLog {
  static entry(event: CampaignEvent, f: ActionFeedback,
    context: { title: string; subject: string; move: boolean; moved: boolean; arrived: string }): LogEntry {
    const fight = event.combat.some(e => e.type === 'end');
    const plain = context.move && context.moved && event.result === 'success' && !event.prelude;
    // Fallen on: what was said and done as it happened comes before how the fight went.
    const ambush = event.prelude ? [...(event.prelude.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.text),
      event.prelude.response ?? ''] : [];
    const lines = [...ambush,
      ...(plain ? [] : [f.result]),
      ...f.resources, ...f.discoveries.filter(d => !f.result.includes(d)).map(d => `Learned: ${d}`),
      ...f.immediate.map(l => l.replace(/^You witness: /, '')),
      ...(context.moved ? [] : f.observations), ...f.events,
    ];
    const title = plain ? `→ ${context.arrived}` : context.subject ? `${context.subject}: ${context.title}` : context.title;
    const told = Narration.tidy([...new Set(lines.filter(Boolean))], fight ? event.combat.filter(e => e.type === 'action').length : 0);
    return { at: f.time, title, lines: told, tone: fight ? 'fight' : event.result === 'failure' ? 'fail' : 'act' };
  }
}
