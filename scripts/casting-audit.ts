#!/usr/bin/env bun
// The casting-fiction audit (the owner, 15 November: causal legibility): every authored action whose effect is a
// consequence (it slays or restores), and what answers who did it, by what means, at what cost and how it resolved.
// Begun from the consequence, not from magical words in a label (a "charm" in prose and a bare Slay are told apart by
// the action's own clauses). An action's means is `invoke` (Resolve invoke(ability, caster, target): the ordinary
// rules' route), `item` (holds and spends a thing), `calling` (gated on hasCalling or learned alone) or `bare` (none
// of them: the author's say-so). Its resolution is `shared` where it resolves through the ordinary rules, else
// `declared`. bun scripts/casting-audit.ts [--json] [--bare]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export type Means = 'invoke' | 'item' | 'calling' | 'bare';
export interface Found { file: string; name: string; label: string; effects: string[]; means: Means; gate: string[];
  cost: string[] }

export class CastingAudit {
  static readonly root = join(import.meta.dir, '..', 'data');
  static readonly consequential = ['Slay', 'Restore'];
  static files(dir: string): string[] {
    return readdirSync(dir).flatMap(name => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? this.files(path) : /\.kyrt?$/.test(name) ? [path] : [];
    });
  }
  // The text from an opening brace to its match, braces inside a quoted string (a {caster} to be told) not counted.
  static block(text: string, open: number): string {
    let depth = 0, quoted = false;
    for (let i = open; i < text.length; i++) {
      const c = text[i]!;
      if (quoted) { quoted = !(c === '"' && text[i - 1] !== '\\'); continue; }
      if (c === '"') { quoted = true; } else if (c === '{') { depth++; } else if (c === '}' && --depth === 0) {
        return text.slice(open, i + 1);
      }
    }
    return text.slice(open);
  }
  static actions(file: string, text: string): Found[] {
    const out: Found[] = [], head = /\bAction\s+([\w{}]+)\(/g;
    for (let m = head.exec(text); m; m = head.exec(text)) {
      const label = /"((?:[^"\\]|\\.)*)"\s*\{/.exec(text.slice(m.index, m.index + 600));
      if (!label) { continue; }
      const open = m.index + label.index + label[0].length - 1, body = this.block(text, open);
      const effects = this.consequential.filter(e => new RegExp(`\\b${e}\\b`).test(body));
      if (!effects.length) { continue; }
      const requires = /Requires([^.]*(?:\.[^\s][^.]*)*)\./.exec(body)?.[1] ?? '';
      const gate = (requires.match(/\b(hasCalling|learned|canCast)\(/g) ?? []).map(g => g.slice(0, -1));
      const cost = [/\bSpend\b/.test(body) ? 'spend' : '', /\bTime\b/.test(body) ? 'time' : ''].filter(Boolean);
      const means: Means = /Resolve\s+invoke\(/.test(body) ? 'invoke' : /\b(holding|Spend)\b/.test(body) ? 'item'
        : gate.length ? 'calling' : 'bare';
      out.push({ file: file.slice(this.root.length - 4), name: m[1]!, label: label[1]!, effects, means, gate, cost });
    }
    return out;
  }
  static all(): Found[] {
    return this.files(this.root).flatMap(f => this.actions(f, readFileSync(f, 'utf8')));
  }
  static main(args: string[]): number {
    const found = this.all();
    if (args.includes('--json')) { console.log(JSON.stringify(found, null, 1)); return 0; }
    const shown = args.includes('--bare') ? found.filter(f => f.means === 'bare' || f.means === 'calling') : found;
    for (const f of shown) {
      console.log(`${f.means.padEnd(8)}${f.effects.join('+').padEnd(14)}${(f.gate.join(',') || '-').padEnd(24)}`
        + `${(f.cost.join(',') || 'free').padEnd(11)}${f.file}: ${f.name}`);
    }
    const tally = (['invoke', 'item', 'calling', 'bare'] as Means[]).map(m => `${found.filter(f => f.means === m).length} ${m}`);
    console.log(`\n${found.length} consequential actions: ${tally.join(', ')}`);
    return 0;
  }
}
if (import.meta.main) { process.exit(CastingAudit.main(process.argv.slice(2))); }
