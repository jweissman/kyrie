import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { OrsinoCorpusFiles } from '../registry/orsino-extract';


// The Orsino source files the registry reads. Paths are relative to an Orsino checkout. Reading is separate from
// extraction so that tests and the CLI extract from exactly the same parsed files.
export class OrsinoCorpus {
  static readonly jsonFiles = [
    'settings/fantasy/tables.json', 'settings/fantasy/tables/items.json', 'settings/fantasy/tables/terrain.json',
    'settings/fantasy/tables/names.json', 'settings/fantasy/tables/barks.json', 'settings/fantasy/traits.json',
    'settings/fantasy/statuses.json', 'settings/fantasy/abilities.json', 'settings/fantasy/abilities/arcane.json',
    'settings/fantasy/abilities/divine.json', 'settings/fantasy/templates.json', 'settings/fantasy/languages.json',
  ];
  static readonly codeFiles = [
    'src/orsino/types/SaveKind.ts', 'src/orsino/types/DamageKind.ts', 'src/orsino/Status.ts',
    'src/orsino/Ability.ts', 'src/orsino/rules/Commands.ts', 'src/orsino/rules/Fighting.ts',
  ];
  static available(root: string): boolean {
    return [...this.jsonFiles, ...this.codeFiles].every(path => existsSync(join(root, path)));
  }
  private static git(root: string, ...args: string[]): string {
    return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
  }
  static load(root: string): OrsinoCorpusFiles {
    if (!this.available(root)) { throw new Error(`${root} is not an Orsino checkout with the expected source files`); }
    const revision = this.git(root, 'rev-parse', 'HEAD');
    const dirty = this.git(root, 'status', '--porcelain', '--', 'settings', 'src').length > 0;
    return { revision, dirty,
      json: Object.fromEntries(this.jsonFiles.map(path =>
        [path, JSON.parse(readFileSync(join(root, path), 'utf8')) as Record<string, unknown>])),
      code: Object.fromEntries(this.codeFiles.map(path => [path, readFileSync(join(root, path), 'utf8')])) };
  }
}
