import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PageFrame } from '../../web/reader/page-frame';

// One structure for every page, at its source (the owner, 16 November night: "enforce this mechanically"): a menu
// or a rail is made one only by PageFrame (its slots, or PageFrame.slot spread on the element), so that what the
// census counts as a page's menu is what the one page made one. No other file writes the marks by hand.
describe('a page\'s menu and rail are PageFrame\'s alone', () => {
  const root = join(import.meta.dir, '../../web/reader');
  const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory()
    ? files(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []);
  it('is marked nowhere else', () => {
    const marked = files(root).filter(f => !f.endsWith('page-frame.tsx'))
      .filter(f => /\bdata-(menu|rail|slot)\b(?=[\s=>{'"])/.test(readFileSync(f, 'utf8')));
    expect(marked.map(f => f.slice(root.length + 1))).toEqual([]);
  });
  it('marks a menu and a rail as the census reads them', () => {
    expect(PageFrame.slot('menu')).toEqual({ 'data-slot': 'menu', 'data-menu': true });
    expect(PageFrame.slot('rail')).toEqual({ 'data-slot': 'rail', 'data-rail': true });
    expect(PageFrame.slot('narrative')).toEqual({ 'data-slot': 'narrative' });
  });
});
