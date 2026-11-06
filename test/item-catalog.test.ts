import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Canon } from '../src/canon/canon';

// One authored catalog of the kinds of thing there are (data/catalog/items/; the owner, 6 November: the main catalog
// holds only global item types, what one adventure or one generator alone uses is declared there, as a local Kind).
// A kind of Kyr's own is named by the shared rules, the code, a shared table, or more than one adventure; Orsino's are
// the corpus every table and generator draws from.
class Uses {
  static files(dir: string): string[] {
    return readdirSync(dir).flatMap(f => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? this.files(p) : /\.(kyr|kyrt|json|ts)$/.test(f) ? [p] : [];
    });
  }
  static readonly texts = [...this.files('data'), ...this.files('src'), ...this.files('test/fixtures')]
    .filter(f => !/data\/(catalog\/items|sources|paintings)\//.test(f)).map(f => [f, readFileSync(f, 'utf8')] as const);
  // Who names it: an adventure or a goings-on by its folder, anything else as shared (the specs' own fixtures too:
  // a sack of sand to weigh a plate down is anybody's).
  static owners(id: string): Set<string> {
    const word = new RegExp(`(?<![\\w])${id}(?![\\w])`);
    return new Set(this.texts.filter(([, t]) => word.test(t)).map(([f]) =>
      /^data\/(adventures|goings-on)\/([^/]+)\//.exec(f)?.[2] ?? 'shared'));
  }
}

describe('the item catalog', () => {
  it('holds only the kinds of thing more than one place uses, as Orsino\'s corpus and Kyr\'s own', () => {
    const own = Object.entries(Canon.items).filter(([id, i]) => !i.source?.orsino && !id.startsWith('fine_')
      && !id.endsWith('_gathered')).map(([id]) => id);
    const local = own.map(id => [id, [...Uses.owners(id)]] as const)
      .filter(([, by]) => by.length === 0 || (by.length === 1 && by[0] !== 'shared'));
    expect(local).toEqual([]);
  });
  it('gives every kind of thing a description of its own, never a stand-in', () => {
    const standIn = (i: { name: string; description: string }) => ['a', 'an'].some(a =>
      i.description.toLowerCase() === `${a} ${i.name.toLowerCase()}.`);
    expect(Object.entries(Canon.items).filter(([, i]) => standIn(i)).map(([id]) => id)).toEqual([]);
  });
});
