import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { ProseLint } from '../../src/presentation/prose-lint';
import { ProseSource } from '../../scripts/prose-lint';
import watch from '../../data/editorial/watchlist.json';

// The prose lint (doc/authoring/plain-prose.md; the owner, 17 November night: plain, exact, literal English for
// ordinary events). The banned expressions are absent from the ordinary prose as written, and each was earned by a
// sentence it matches; the pages generated worlds actually told in a first hour (recorded by scripts/prose-census.ts
// and re-recorded when the prose moves) have no unfilled slot, word said twice, wrong article or sentence begun in
// lower case. The watchlist is for an editor and fails nothing, but each entry carries its evidence.
describe('the prose lint', () => {
  it('finds the faults of a filled template, and passes what is right', () => {
    const rules = (t: string) => ProseLint.filled(t).map(f => f.rule);
    expect(rules('You give {gift} to the boy.')).toContain('unfilled slot');
    expect(rules('The the wagoner looks up.')).toContain('word said twice');
    expect(rules('He hands you a oak staff.')).toContain('a before a vowel');
    expect(rules('He hands you an staff.')).toContain('an before a consonant');
    expect(rules('You arrive. the wagoner looks up.')).toContain('lower case after a stop');
    expect(rules('the wagoner looks up.')).toContain('lower case after a stop');
    expect(rules('It is an hour on, and a one-eyed dog had had enough of a useful, honest man.')).toEqual([]);
  });
  it('finds no banned expression in the ordinary prose, and each was earned by the sentence it cites', () => {
    const failing = ProseSource.banned().filter(f => !ProseSource.isOwned(f.file));
    expect(failing.map(f => `${f.file}: ${f.match}`)).toEqual([]);
    for (const e of ProseLint.entries) {
      expect(e.why.length).toBeGreaterThan(10);
      expect(ProseLint.source(e.evidence).length).toBeGreaterThan(0);
    }
  });
  it('finds no fault in what a first hour was told, filled', () => {
    const pages = (JSON.parse(readFileSync('test/fixtures/prose/first-hour.json', 'utf8')) as
      { pages: { at: string; page: string }[] }).pages;
    expect(pages.length).toBeGreaterThan(300);
    const found = pages.flatMap(p => ProseLint.filled(p.page).map(f => `${p.at}: ${f.rule} "${f.match}"`));
    expect(found).toEqual([]);
  });
  it('keeps a watchlist of constructions, each with its evidence, matching it', () => {
    for (const w of (watch as { watch: { pattern: string; why: string; evidence: string }[] }).watch) {
      expect(w.why.length).toBeGreaterThan(10);
      expect(new RegExp(w.pattern.replace(/^\^/, ''), 'i').test(w.evidence)).toBe(true);
    }
  });
});
