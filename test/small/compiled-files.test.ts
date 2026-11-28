import { describe, expect, it } from 'bun:test';
import { CompiledModules, type Compiled } from '../../src/campaign/compiled-modules';
import type { Module, SemanticRecord } from '../../src/lang';

// A module compiled before is kept by its texts, not by where its files were: one loading names a country's files
// absolutely, another from where it runs. Taken again, its semantic records say this loading's own files, and the one
// kept is not changed (the AX-04 harness, red only on CI's kept store: wren's situations filed under the other's path).
describe('a module compiled before', () => {
  const record = (file: string) => ({ id: 'situation:region/lost', kind: 'situation', name: 'lost', words: 'lost',
    span: { line: 3, column: 3, file }, participants: [], phases: [] }) as unknown as SemanticRecord;
  const kept: Compiled = { id: 'region', told: [], files: ['world-wren/region/company.kyr'],
    module: { id: 'region', semantic: [record('world-wren/region/company.kyr')] } as unknown as Module };
  it('says its records are of the files this loading read', () => {
    const now = CompiledModules.filed(kept, ['/runner/world-wren/region/company.kyr']);
    expect(now.semantic!.map(r => r.span?.file)).toEqual(['/runner/world-wren/region/company.kyr']);
    expect(kept.module.semantic![0]!.span?.file).toBe('world-wren/region/company.kyr');
  });
  it('is the one kept where its files are named as they were', () => {
    expect(CompiledModules.filed(kept, ['world-wren/region/company.kyr'])).toBe(kept.module);
  });
});
