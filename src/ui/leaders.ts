import type { GroupingContext, Row } from './choice-grouping';

// Who goes first, asked only where it matters (OR-1873, the cold-play review's Wave 2: "ask which member leads only
// where the member changes odds or consequence"): a hazard risked on a way is offered once where what it would do is
// said alike whoever goes first, the one who would bear it best (the most whole of the company) named on it; where
// what it would do differs by who goes first (it could kill one and only hurt another), each is asked. A row for each
// of the company at every hazard ("risk the glowing rune — Wenna goes first", "… Thea goes first") had been two of
// eight ways past one trap (cold round A1).
export class Leaders {
  // The one who goes first for each hazard that is asked once, by the act and what it is done with but who.
  static first(rows: readonly Row[], context: Pick<GroupingContext, 'names'>, bearer: (member: string) => number):
    Map<string, string> {
    const by = new Map<string, Row[]>();
    for (const r of rows) {
      if (!r.action.bindings?.victim || r.wanting) { continue; }
      const key = this.key(r);
      by.set(key, [...by.get(key) ?? [], r]);
    }
    const out = new Map<string, string>();
    for (const [key, rs] of by) {
      if (rs.length < 2 || new Set(rs.map(r => this.unnamed(r, context))).size > 1) { continue; }
      const best = [...rs].sort((a, b) => bearer(b.action.bindings!.victim!) - bearer(a.action.bindings!.victim!))[0]!;
      out.set(key, best.action.bindings!.victim!);
    }
    return out;
  }
  // Whether a row is offered: one with someone to go first is, where it is that one, or the hazard is asked of each.
  static offered(row: Row, leads?: Map<string, string>): boolean {
    const victim = row.action.bindings?.victim, first = victim && leads?.get(this.key(row));
    return !first || first === victim;
  }
  // The rows grouped, a hazard asked once offered for the one who goes first alone.
  static only(rows: readonly Row[], context: Pick<GroupingContext, 'names' | 'bearer'>): readonly Row[] {
    const leads = context.bearer ? this.first(rows, context, context.bearer) : undefined;
    return leads?.size ? rows.filter(r => this.offered(r, leads)) : rows;
  }
  private static key(r: Row): string {
    const rest = Object.entries(r.action.bindings ?? {}).filter(([k]) => k !== 'victim');
    return `${r.action.schema ?? r.action.id}|${JSON.stringify(rest)}`;
  }
  // What the act says, whoever goes first.
  private static unnamed(r: Row, context: Pick<GroupingContext, 'names'>): string {
    const victim = r.action.bindings!.victim!, name = context.names.get(victim) ?? victim;
    return r.choice.name.split(name).join('');
  }
}
