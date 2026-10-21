// What the assembler did and why, one decision at a time: which kit was asked for, every candidate it weighed for
// each slot and the requirement that ruled one out, what Deem proposed and whether it was accepted, the facts it
// committed and the modules it installed, or why it refused.
export type TraceEntry =
  | { step: string; kind: 'request'; kit: string; fixed: Record<string, string> }
  | { step: string; kind: 'candidate'; slot: string; candidate: string; score: number; failed?: string }
  | { step: string; kind: 'bound'; slot: string; value: string; score: number; considered: number; fixed: boolean }
  | { step: string; kind: 'proposal'; dimension: string; key: string; failed?: string; why?: string; fixed: boolean }
  | { step: string; kind: 'commit'; fact: string }
  | { step: string; kind: 'module'; id: string; bundle: string }
  | { step: string; kind: 'refused'; reason: string };

export class Trace {
  readonly entries: TraceEntry[] = [];
  add(entry: TraceEntry): void { this.entries.push(entry); }
  refusals(): string[] {
    return this.entries.flatMap(e => e.kind === 'refused' ? [`${e.step}: ${e.reason}`] : []);
  }
  // The trace as an author reads it: one line per decision, candidates that lost indented under the slot.
  text(): string[] {
    return this.entries.map(e => {
      switch (e.kind) {
        case 'request': return `${e.step}: ${e.kit}${Object.keys(e.fixed).length ? ` with ${Trace.pairs(e.fixed)} fixed` : ''}`;
        case 'candidate': return `    ${e.slot} ${e.candidate}: ${e.failed ? `no (${e.failed})` : `fits, score ${e.score}`}`;
        case 'bound': return `  ${e.slot} = ${e.value}${e.fixed ? ' (fixed)' : ` (score ${e.score}, of ${e.considered} considered)`}`;
        case 'proposal': return `  ${e.dimension}: ${e.fixed ? 'fixed ' : 'Deem proposes '}${e.key}${e.failed
          ? `, refused (${e.failed})` : `, accepted${e.why ? `: ${e.why}` : ''}`}`;
        case 'commit': return `  + ${e.fact}`;
        case 'module': return `  installs ${e.id} (${e.bundle})`;
        case 'refused': return `  REFUSED: ${e.reason}`;
      }
    });
  }
  private static pairs(record: Record<string, string>): string {
    return Object.entries(record).map(([k, v]) => `${k}=${v}`).join(', ');
  }
}
