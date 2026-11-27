import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';

// The layers of src, and what each may not reach by a value import (a type is free): the language reads no campaign,
// the runtime no page and no generator, the rules no campaign, and the generators no session. What crosses today is
// debt, listed here, which may only shrink (the architecture review's A10, from its probe import-graph).
class Layers {
  static readonly forbidden: Record<string, string[]> = {
    lang: ['campaign', 'session', 'presentation', 'ui', 'world', 'narrative', 'autoplay', 'cli', 'client'],
    campaign: ['presentation', 'ui', 'session', 'narrative', 'world', 'autoplay', 'cli', 'client'],
    rules: ['campaign', 'presentation', 'ui', 'session', 'world', 'narrative', 'client'],
    world: ['session', 'autoplay', 'cli', 'client'],
  };
  static readonly debt = [
    'campaign/module-bundle.ts -> world/compose/composition',
    'rules/advancement.ts -> campaign/party-capabilities',
    'rules/checks.ts -> campaign/party-capabilities',
  ];
  static crossings(): string[] {
    const out: string[] = [], imports = /^import\s+(?!type\b)[^;]*?from\s+'(\.[^']+)'/gm;
    for (const file of new Bun.Glob('**/*.ts').scanSync('src')) {
      const layer = file.split('/')[0]!, barred = this.forbidden[layer];
      if (!barred) { continue; }
      for (const m of readFileSync(join('src', file), 'utf8').matchAll(imports)) {
        const target = relative('src', normalize(join('src', dirname(file), m[1]!)));
        if (barred.includes(target.split('/')[0]!)) { out.push(`${file} -> ${target}`); }
      }
    }
    return out.sort();
  }
}
describe('the layers of src', () => {
  it('are crossed by no value import but the debt, which may only shrink', () => {
    expect(Layers.crossings()).toEqual(Layers.debt);
  });
});
