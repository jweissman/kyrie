// The startup benchmark's tables (scripts/startup-bench.ts): medians over runs, stage by stage, in Markdown.
export interface Started {
  ms: number; stages: Record<string, { n: number; ms: number; kb?: number }>;
  installs: { id: string; ms: number; stages?: Record<string, number> }[];
  parses?: { text: string; kinds: string; kb: number; ms: number }[];
}
export interface NodeRun { scale: string; mode: string; load: number; importMs: number; first: Started; again: Started }
export interface BrowserRun {
  pass: string; load: number; toCreation: number; toPlace: number;
  requests: { kind: string; ms: number }[];
  timing?: { engine?: number; screen?: number; narrative?: number; draw?: number; place?: number };
  steps: number[]; render?: number;
}

export class StartupReport {
  // The stages in the order a start crosses them; each includes those called within it (see StartupProbes).
  static readonly order = ['world', 'region', 'campaign', 'kits', 'canon', 'install', 'parse', 'parse kept', 'compose', 'instantiate',
    'validate', 'discovery', 'namespace', 'join', 'roles', 'check joined', 'populate', 'project', 'creature',
    'structuredClone', 'refresh', 'settle', 'session', 'screen', 'leaf'];
  static median(xs: number[]): number {
    const s = [...xs].sort((a, b) => a - b), m = Math.floor(s.length / 2);
    return s.length ? s.length % 2 ? s[m]! : Math.round((s[m - 1]! + s[m]!) / 2) : 0;
  }
  static brief(r: NodeRun): string {
    return `${r.scale} ${r.mode} load ${r.load.toFixed(1)}: import ${r.importMs} ms, start ${r.first.ms} ms, `
      + `again ${r.again.ms} ms`;
  }
  // One table a scale: a column for cold, warm and again (medians), a row for each stage.
  private static scale(runs: NodeRun[], scale: string): string[] {
    const cold = runs.filter(r => r.scale === scale && r.mode === 'cold');
    const warm = runs.filter(r => r.scale === scale && r.mode === 'warm');
    const columns: [string, Started[]][] = [['cold', cold.map(r => r.first)], ['warm', warm.map(r => r.first)],
      ['again, no store', cold.map(r => r.again)], ['again, store', warm.map(r => r.again)]];
    const loads = [...cold, ...warm].map(r => r.load);
    const lines = [`### ${scale} (${cold.length} cold, ${warm.length} warm runs; load ${Math.min(...loads).toFixed(1)}`
      + `–${Math.max(...loads).toFixed(1)})`, '', `| stage | ${columns.map(c => c[0]).join(' | ')} |`, '|---|---:|---:|---:|---:|',
    `| import | ${this.median(cold.map(r => r.importMs))} ms | ${this.median(warm.map(r => r.importMs))} ms | — | — |`,
    `| **start, whole** | **${columns.map(([, xs]) => `${this.median(xs.map(x => x.ms))} ms`).join('** | **')}** |`];
    for (const stage of this.order) {
      if (columns.some(([, xs]) => xs.some(x => x.stages[stage]))) {
        lines.push(`| ${stage} | ${columns.map(([, xs]) => this.cell(xs, stage)).join(' | ')} |`);
      }
    }
    return [...lines, '', ...this.installs(warm.map(r => r.first), cold.map(r => r.first))];
  }
  private static cell(xs: Started[], stage: string): string {
    const hit = xs.map(x => x.stages[stage]).filter(Boolean);
    return hit.length ? `${this.median(hit.map(h => h!.ms))} ms (${this.median(hit.map(h => h!.n))})` : '—';
  }
  private static at(xs: Started[], i: number): number { return this.median(xs.map(x => x.installs[i]?.ms ?? 0)); }
  // Each install's median, warm and cold, in the order taken.
  private static installs(warm: Started[], cold: Started[]): string[] {
    const ids = warm[0]?.installs.map(i => i.id) ?? [];
    if (ids.length < 3) { return []; }
    return ['| # | install | warm | cold |', '|---:|---|---:|---:|',
      ...ids.map((id, i) => `| ${i + 1} | ${id} | ${this.at(warm, i)} ms | ${this.at(cold, i)} ms |`), ''];
  }
  private static browser(runs: BrowserRun[]): string[] {
    if (!runs.length) { return []; }
    const lines = ['### Browser (Chromium, local site build)', '',
      '| pass | load | page to creation | Start to first place | engine (draw + place) | screen + telling | '
      + 'transfer and paint |', '|---|---:|---:|---:|---:|---:|---:|'];
    for (const pass of [...new Set(runs.map(r => r.pass))]) {
      const rs = runs.filter(r => r.pass === pass), place = this.median(rs.map(r => r.toPlace));
      const engine = this.median(rs.map(r => (r.timing?.draw ?? 0) + (r.timing?.place ?? 0)));
      const told = this.median(rs.map(r => (r.timing?.screen ?? 0) + (r.timing?.narrative ?? 0)));
      lines.push(`| ${pass} (${rs.length}) | ${Math.max(...rs.map(r => r.load)).toFixed(1)} | `
        + `${this.median(rs.map(r => r.toCreation))} ms | ${place} ms | ${engine} ms | ${told} ms | `
        + `${place - engine - told} ms |`);
    }
    const kinds = [...new Set(runs.flatMap(r => r.requests.map(q => q.kind)))];
    lines.push('', '| request (cold pass, median) | ms |', '|---|---:|');
    const cold = runs.filter(r => r.pass === runs[0]!.pass);
    for (const k of kinds) {
      lines.push(`| ${k} | ${this.median(cold.map(r => r.requests.filter(q => q.kind === k)
        .reduce((s, q) => s + q.ms, 0)))} |`);
    }
    return [...lines, ''];
  }
  static tables(node: NodeRun[], browser: BrowserRun[]): string {
    return [...[...new Set(node.map(r => r.scale))].flatMap(s => this.scale(node, s)), ...this.browser(browser)]
      .join('\n');
  }
}
