import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { BundleManifest } from '../src/campaign/module-bundle';

// Every going-on and situation a country draws keeps a clock, or says why it keeps none (the play-structure
// investigation's PT-29: not every going-on kept a clock, so whether a country went on depended on drawing one that
// did). A clock is the hour or the deadline asked of in its Kyr (watch(clock), untilLight(clock), a deadline); a
// manifest's `unclocked` says why not: the den grows no worse for being left.
class Clocks {
  static readonly roots = ['goings-on', 'situations'].map(d => join(import.meta.dir, '..', 'data', d));
  static readonly clock = /\((clock)\)|\bdeadline\b/;
  // The Kyr of a module and of the modules within it (the drover's oxen).
  static kyr(dir: string): string {
    return readdirSync(dir).map(f => join(dir, f)).map(p => statSync(p).isDirectory() ? this.kyr(p)
      : p.endsWith('.kyr') ? readFileSync(p, 'utf8') : '').join('\n');
  }
  static all(): { id: string; clocked: boolean; unclocked?: string }[] {
    return this.roots.flatMap(root => readdirSync(root).filter(d => statSync(join(root, d)).isDirectory()).map(d => {
      const manifest = JSON.parse(readFileSync(join(root, d, 'module.json'), 'utf8')) as BundleManifest;
      return { id: d, clocked: this.clock.test(this.kyr(join(root, d))),
        ...manifest.unclocked ? { unclocked: manifest.unclocked } : {} };
    }));
  }
}

describe('a going-on\'s clock', () => {
  it('is kept by every going-on and situation, or declined with why', () => {
    const all = Clocks.all();
    expect(all.length).toBeGreaterThan(8);
    expect(all.filter(m => !m.clocked && !m.unclocked?.trim()).map(m => m.id)).toEqual([]);
    // And none says it keeps none when it does.
    expect(all.filter(m => m.clocked && m.unclocked).map(m => m.id)).toEqual([]);
  });
});
