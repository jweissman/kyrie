import type * as ohm from 'ohm-js';
import type { Call } from './module';

export interface RelativeSpan { at: number; end: number }
export interface CallSpans { call: Call; name: RelativeSpan; args: RelativeSpan[] }
interface Capture { input: string; start: number; end: number; calls: CallSpans[] }

// Capture the nodes that actually made calls, not calls synthesized by a declaration's lowering.
export class ReferenceSpans {
  private static current?: Capture;

  static declaration<T extends { field: string; value: unknown }>(node: ohm.Node, read: () => T):
    T & { callSpans?: CallSpans[] } {
    const previous = this.current;
    const capture = { input: node.source.sourceString, start: node.source.startIdx,
      end: node.source.endIdx, calls: [] };
    this.current = capture;
    try {
      const field = read();
      return capture.calls.length ? { ...field, callSpans: capture.calls } : field;
    } finally { this.current = previous; }
  }

  static call(call: Call, name: ohm.Node, args: ohm.Node[]): void {
    const c = this.current;
    if (!c || name.source.sourceString !== c.input || name.source.startIdx < c.start
      || name.source.endIdx > c.end) { return; }
    c.calls.push({ call, name: this.span(name, c.start), args: args.map(node => this.span(node, c.start)) });
  }
  private static span(node: ohm.Node, start: number): RelativeSpan {
    return { at: node.source.startIdx - start, end: node.source.endIdx - start };
  }
}
