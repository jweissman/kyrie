import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The design system's mechanically enforceable rules, read from the reader's stylesheets alone (Mission 21's aesthetic
// investigation, design-system.md §Constraints): no browser, no world, a few milliseconds. Each rule names the
// exceptions the tree holds today; the list may shrink and never grow, so a new page cannot add to the debt.
interface Rule { file: string; selector: string; body: string }
class Sheets {
  static readonly dir = join(import.meta.dir, '../web/reader');
  static rules(): Rule[] {
    return readdirSync(Sheets.dir).filter(f => f.endsWith('.css')).flatMap(file => {
      const text = readFileSync(join(Sheets.dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      // Innermost rules only (a media block's rules are innermost too): selector { declarations }.
      return [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ file, selector: m[1]!.trim().replace(/\s+/g, ' '),
        body: m[2]! }));
    });
  }
  // The custom properties that are gold, by name or by being defined as one (--blue: var(--gold) is gold).
  static golds(rules: Rule[]): Set<string> {
    const gold = new Set(['--gold', '--gold-glow', '--gold-line', '--gold-bright', '--gold-deep']);
    for (let grew = true; grew;) {
      grew = false;
      for (const r of rules) {
        for (const m of r.body.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) {
          if (!gold.has(m[1]!) && [...gold].some(g => m[2]!.includes(`var(${g})`)) && !/^\.tone-gold$/.test(r.selector)) {
            gold.add(m[1]!); grew = true;
          }
        }
      }
    }
    return gold;
  }
}

describe('the design system, held by the stylesheets', () => {
  const rules = Sheets.rules();
  // Gold is the followed undertaking's and nothing else's (the owner, amendment 6 C and 11 November's atlas): a rule
  // may paint with gold only where its selector says it is the aim's (aimed, followed, led for the aim, the step it
  // continues by, the gold tone). The rest are listed as they stand on 12 November, each a debt to retire.
  const aims = /\.aim\b|aimed|-aim\b|\.aims\b|follow|\.led\b|continues|tone-gold|gild|\.bound\b/;
  const known = new Set([
    'fight.css .fight .fighter.target', 'fight.css .fight .moves .aiming', 'foundations.css .kicker',
    'foundations.css .cornered::after', 'frame.css .frame::after',
    'frame.css .title-menu .indicator::before, .title-menu .indicator::after', 'frame.css .motes i',
    'frame.css .ident .ground', 'frame.css .ident .lamp', 'frame.css .ident .lamp.seventh', 'frame.css .ident .star',
    'reader.css .fields input:focus, .fields select:focus', 'reader.css .campaign-sheet .card.recommended',
    'reader.css .character .members .act.here .n', 'reader.css .character .gauge .bar i.mana',
    'stage.css .when.light-afternoon::before', 'stage.css .prologue-page .on i', 'stage.css .sheet-title',
    'world.css .world-page.interrupted .board-you::after, .world-page.threatened .board-you::after',
  ]);
  it('paints gold only where the aim is', () => {
    const gold = Sheets.golds(rules), uses = (body: string) => body.split(';').some(d => !/^\s*--/.test(d)
      && [...gold].some(g => d.includes(`var(${g})`)));
    const found = rules.filter(r => uses(r.body) && !aims.test(r.selector)).map(r => `${r.file} ${r.selector}`);
    const fresh = found.filter(f => !known.has(f));
    expect(fresh).toEqual([]);
  });
  // The type scale (foundations.css, design-system.md): sizes come from roles. 38 literal sizes stood in the sheets on
  // 12 November beside ten tokens; the number may only fall. The design system's own sheet is held apart, and tighter.
  it('keeps the literal type sizes from growing, and none in the design system’s own sheet', () => {
    const sizes = new Set(rules.filter(r => r.file !== 'look.css')
      .flatMap(r => [...r.body.matchAll(/font(?:-size)?\s*:[^;]*?(\d+(?:\.\d+)?)px/g)].map(m => m[1])));
    expect(sizes.size).toBeLessThanOrEqual(38);
    const own = rules.filter(r => r.file === 'look.css' && !r.selector.startsWith(':root {') && r.selector !== ':root')
      .filter(r => /font(?:-size)?\s*:[^;]*\d+(\.\d+)?px/.test(r.body)).map(r => r.selector);
    expect(own.length).toBeLessThanOrEqual(LOOK_FONT_LITERALS);
  });
  // Capitals are spaced by one tracking each; the sheets used twenty values on 12 November. The number may only fall.
  it('keeps the letter-spacing values from growing', () => {
    const tracks = new Set(rules.flatMap(r => [...r.body.matchAll(/letter-spacing\s*:\s*([.\d]+em)/g)].map(m => m[1])));
    expect(tracks.size).toBeLessThanOrEqual(20);
  });
});
// The design system's prototype sheet still sets a few sizes by hand (a lens tab's glyph, an unfolded act, a phone's
// foe name); each is a role the token list has yet to name. May only fall.
const LOOK_FONT_LITERALS = 5;
