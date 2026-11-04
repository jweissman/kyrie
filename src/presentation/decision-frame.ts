import type { Promoted, Why } from './glance-types';
import type { ActionFeedback } from './action-feedback';
import { Sentences } from './sentences';

// What came of the last act, as one frame (the cold review's REV-05, the systemic review's SYS-01): what was
// attempted, what came of it, what it changed in the company's state, and the act it has made worth doing now. The
// page had told an act as a button and a paragraph, then a new list of everything legal, and left the player to work
// out which of those the act had opened; the frame says it.
//   attempt  the act, in the words it was offered in;
//   result   what came of it, in a sentence; failed when it did not succeed;
//   changed  the company's state it changed: where it now is, coin and stores, aims taken up or changed, places it
//            now knows the way to, what it learnt;
//   next     the act it made relevant: an answer to what was just asked; one with whoever an aim it gave names; a
//            choice it opened, led with or not (asking Alfric what he means to do opens asking him along); on coming
//            somewhere, what the place leads with. None when it made none: the frame does not invent one.
export interface AfterAct {
  attempt: string; result?: string; failed?: boolean; changed: string[];
  // choice: the glance's choice id, when the act is one it leads with; why: why it leads with it.
  next?: { command: string; label: string; choice?: string; why?: Why };
}
export interface Acted { feedback: ActionFeedback; moved: boolean; failed: boolean; place: string }
// Where the act left the company: who is here by name, and the choices it has now, as the page words them.
export interface Standing { names: Map<string, string>; choices: { command: string; label: string; schema?: string }[] }

export class DecisionFrame {
  // Choices an act opens that are only its own undoing or a farewell, never what it made relevant.
  static readonly quiet = ['take_leave', 'leave', 'wait'];
  static after(acted: Acted, acts: Promoted[], standing: Standing): AfterAct {
    const f = acted.feedback, result = [f.result, ...f.discoveries, ...f.observations, ...f.events, ...f.immediate]
      .find(t => t?.trim());
    const next = this.next(acted, acts, standing);
    return { attempt: f.attempt, ...result ? { result: Sentences.first(result) } : {},
      ...acted.failed ? { failed: true } : {}, changed: this.changed(acted), ...next ? { next } : {} };
  }
  // The company's state the act changed, each in a line.
  static changed(acted: Acted): string[] {
    const f = acted.feedback;
    return [...acted.moved ? [`Now at ${acted.place}`] : [], ...f.resources, ...(f.aims ?? []).map(a => `Aim: ${a}`),
      ...(f.amended ?? []).map(a => `Aim now: ${a}`), ...f.leads ?? [],
      ...acted.moved ? [] : f.discoveries.map(d => `Learnt: ${Sentences.first(d)}`)];
  }
  // The act it made relevant: what answers it first, then one with whoever a new aim names, then what it opened.
  private static next(acted: Acted, acts: Promoted[], standing: Standing): AfterAct['next'] {
    const f = acted.feedback, aims = [...f.aims ?? [], ...f.amended ?? []].join(' ');
    const opened = new Set(f.opened ?? []);
    const named = aims ? acts.find(a => a.subject && aims.includes(standing.names.get(a.subject) ?? '\u0000')) : undefined;
    const led = acts.find(a => a.why === 'answer') ?? named
      ?? acts.find(a => a.command !== undefined && opened.has(a.command)) ?? (acted.moved ? acts[0] : undefined);
    if (led) { return { command: led.command ?? led.choice, label: led.label, choice: led.choice, why: led.why }; }
    const other = standing.choices.find(c => opened.has(c.command) && !this.quiet.includes(c.schema ?? ''));
    return other && { command: other.command, label: other.label };
  }
}
