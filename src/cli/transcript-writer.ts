import type { Journey } from '../session/journey';
import { ScreenModel } from '../ui/screen-model';

// A journey written out as the page told it (see TranscriptsTool): its heading, its first page, and each step as the
// page offered it, waits that tell nothing counted, not repeated.
export class TranscriptWriter {
  // What the journey has told so far, from its first page, as Markdown.
  static lines(j: Journey, opening: string): string[] {
    const lines: string[] = ['*(The first page)*', '', opening, ''];
    let quiet = 0;
    for (const t of j.taken) {
      const said = t.page.trim();
      const nothing = !said || /^(An hour passes|Time passes|A while passes)\.$/.test(said);
      if (/^Wait/.test(t.label) && nothing) { quiet++; continue; }
      if (quiet) { lines.push(`*(${quiet} ${quiet === 1 ? 'wait' : 'waits'} in which nothing is told)*`, ''); quiet = 0; }
      lines.push(`**${t.label}**`, '', said || '*(nothing is told)*', '');
    }
    return lines;
  }
  // The journey's heading: who played it, from what, and where it ended.
  static heading(j: Journey, title: string, how: string): string[] {
    const ending = j.campaign.module.entities.find(e => e.type === 'ending' && j.holds('reached', e.id));
    return [`# ${title}`, '', `${how}; ${j.taken.length} steps; ended at watch ${j.watch()}`
      + `${ending ? `, at the ending "${ending.name}"` : ''}.`, ''];
  }
  static opening(j: Journey): string { return ScreenModel.build(j.campaign).prose.join(' '); }
}
