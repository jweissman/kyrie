import type { DeemValue } from 'deem';
import { Content } from '../../content';
import { ModuleParser } from '../../lang/module-parser';
import type { Ledger } from './ledger';
import type { Kit, ProposalSpec, SlotSpec } from './kit';
import type { Trace } from './trace';

interface Row { _key: string; _requires?: string[]; _why?: string; _implies?: Record<string, SlotSpec> }
interface Ask { kit: Kit; dimension: string; spec: ProposalSpec; context: Record<string, string> }

// Asks Deem for one value of a kit's dimension: a weighted draw from the kit's table for the region's context. A
// proposal whose requirements fail against what is already committed is refused and the draw is made again without
// it, so at most every row is considered once; if none fits, the dimension cannot be filled here.
export class Proposer {
  constructor(private readonly ledger: Ledger, private readonly trace: Trace) {}
  // implied: what a row's implications need, bound against the ledger, or why they cannot be.
  propose(ask: Ask, at: { bindings: Record<string, string>; step: string; seed: string; fixed?: string;
    implied: (slots: Record<string, SlotSpec>) => string | undefined }): { key: string } | { refused: string } {
    const { kit, dimension, spec } = ask, rows = this.rows(kit, spec, ask.context);
    if (at.fixed) {
      const row = rows.find(r => r._key === at.fixed);
      const failed = row ? this.failure(row, at) : `${spec.table} has no ${at.fixed} for this region`;
      this.trace.add({ step: at.step, kind: 'proposal', dimension, key: at.fixed, fixed: true,
        ...(failed ? { failed } : {}), ...(row?._why ? { why: row._why } : {}) });
      return failed ? { refused: `${dimension} ${at.fixed}: ${failed}` } : { key: at.fixed };
    }
    const refused: string[] = [];
    for (let n = 0; n < rows.length; n++) {
      const key = this.draw(ask, refused, `${at.seed}:${n}`);
      if (!key) { break; }
      const row = rows.find(r => r._key === key)!, failed = this.failure(row, at);
      this.trace.add({ step: at.step, kind: 'proposal', dimension, key, fixed: false,
        ...(failed ? { failed } : {}), ...(row._why ? { why: row._why } : {}) });
      if (!failed) { return { key }; }
      refused.push(key);
    }
    return { refused: `no ${dimension} Deem proposes fits here (${refused.join(', ') || 'none for this context'})` };
  }
  // What rules a row out: a requirement that does not hold, or an implication nothing can meet.
  private failure(row: Row, at: { bindings: Record<string, string>;
    implied: (slots: Record<string, SlotSpec>) => string | undefined }): string | undefined {
    return (row._requires ?? []).find(r => !this.ledger.test(ModuleParser.predicate(r), at.bindings))
      ?? (row._implies ? at.implied(row._implies) : undefined);
  }
  // The rows the context selects: the table's group for the context value, else its default group.
  private rows(kit: Kit, spec: ProposalSpec, context: Record<string, string>): Row[] {
    const table = kit.tables[spec.table] as unknown as { groups: Record<string, Row[]> };
    return table.groups[this.group(table.groups, spec, context)] ?? [];
  }
  private group(groups: Record<string, unknown>, spec: ProposalSpec, context: Record<string, string>): string {
    const wanted = spec.by ? context[spec.by] : undefined;
    return wanted && groups[wanted] ? wanted : 'default';
  }
  // One weighted draw by Deem's select over the rows not yet refused.
  private draw(ask: Ask, refused: string[], seed: string): string | undefined {
    const { kit, spec, context } = ask;
    const table = kit.tables[spec.table] as unknown as { groups: Record<string, Row[]> };
    const group = this.group(table.groups, spec, context);
    const keep = refused.map(k => `dig(#__it, "_key") != ${JSON.stringify(k)}`).join(' && ') || 'true';
    const name = `${spec.table}_choice`;
    const setting = Content.settingWith({ [spec.table]: kit.tables[spec.table] } as never,
      { [name]: { __no_id: true, _pick: `=select(${spec.table}, ${group}, '${keep}')`, key: "=dig(#_pick, '_key')" } } as never);
    try {
      const drawn = new Content(seed, setting).generate(name, context as Record<string, DeemValue>) as { key: string };
      return String(drawn.key);
    } catch { return undefined; }
  }
}
