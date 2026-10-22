import { memo } from 'react';
import type { Entry } from '../engine/protocol';
import { Words } from './words';

// One thing that happened: what the company did, echoed, and what came of it. Someone's own words are set as
// speech. An entry is drawn once and kept; nothing the player does afterwards redraws it.
export class EntryView {
  static View({ entry, latest, prose }: { entry: Entry; latest: boolean; prose: string[] }) {
    // A line the page already says of the place, alone or within a paragraph, is not said again.
    const lines = entry.lines.filter(l => !prose.some(p => p.includes(l)));
    if (!entry.said && !lines.length && !entry.notes.length) { return null; }
    return (
      <article className={`entry tone-${entry.tone}${latest ? ' latest' : ''}`} data-entry={entry.id}>
        {entry.said && <p className="said">{Words.echo(entry.said)}</p>}
        {lines.length > 0 && <div className="told" {...latest ? { 'data-id': 'response' } : {}}>
          {lines.map((l, i) => <p key={i} className={/^['‘"“]/.test(l) ? 'speech' : undefined}>{l}</p>)}
        </div>}
        {entry.notes.length > 0 && <p className="notes">{entry.notes.map(n => <span key={n}>{n}</span>)}</p>}
      </article>
    );
  }
  static readonly Memo = memo(EntryView.View);
  // What the page tells for where the company is: everything since it last arrived here, with a run of waits in
  // which nothing happened told once.
  static here(log: Entry[], place: string): Entry[] {
    let start = log.length;
    while (start > 0 && log[start - 1]!.place === place) {
      start--;
      if (log[start]!.arrival) { break; }
    }
    return log.slice(start).filter((e, i, all) => !(EntryView.quiet(e) && all[i + 1] && EntryView.quiet(all[i + 1]!)));
  }
  static readonly passing = ['An hour passes.', 'Time passes.'];
  // A wait in which nothing happened but the time.
  static quiet(e: Entry): boolean {
    return /^Wait /.test(e.said ?? '') && e.lines.every(l => EntryView.passing.includes(l));
  }
}
