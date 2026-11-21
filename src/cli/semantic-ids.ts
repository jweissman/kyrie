import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { BundleManifest } from '../campaign/module-bundle';
import { ExportRoles } from './export-roles';
import { KyrLint } from './kyr-lint';

// Every Route, Promise and Occasion of the shipped corpus by its semantic id as written (kind:name) and its phases,
// module by module (MT-30): the compatibility pin of what a replay by meaning names (test/fixtures/semantic-ids.json).
// Each module is read on its own, as ExportRoles reads it, so nothing is installed or played.
export class SemanticIds {
  private static readonly forms = /^\s*(Route|Promise|Occasion)\s/m;
  // The modules whose own files write one of the forms.
  static modules(): string[] {
    return KyrLint.walk(join(KyrLint.root, 'data'), f => f === 'module.json').filter(p => {
      const m = JSON.parse(readFileSync(p, 'utf8')) as BundleManifest;
      return [m.source].flat().some(f => this.forms.test(readFileSync(join(dirname(p), f), 'utf8')));
    }).sort();
  }
  // `<module> <kind:name>: <phases>`, one a declaration.
  static async corpus(): Promise<string[]> {
    const out: string[] = [];
    for (const path of this.modules()) {
      const read = await ExportRoles.module(path), where = path.slice(KyrLint.root.length + 1);
      if ('error' in read) { out.push(`${where} unread: ${read.error}`); continue; }
      out.push(...(read.semantic ?? []).map(r => `${where} ${r.kind}:${r.name}: ${r.phases.map(p => p.id).join(', ')}`));
    }
    return out;
  }
}
