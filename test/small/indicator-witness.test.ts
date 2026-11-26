import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';

// No semantic indicator without a witness (the owner's trust contracts, 18 November: "The desired invariant is not
// merely that every pip passes a test. It is that no semantic pip can be constructed without an authoritative
// witness."). A witness is issued only from the glance (Attest), branded; an indicator is made only of witnesses; the
// page's Pip and ChoiceRow take an indicator, never a colour. This holds the paths shut: the only places an Atlas tone
// is written as a colour are the indicator's own drawing, the Atlas's legend, and drawing what an indicator already
// says (a way's tint, a map mark's); the brand is cast nowhere but where witnesses are issued.
const files = [...new Glob('web/**/*.{ts,tsx}').scanSync('.'), ...new Glob('src/**/*.ts').scanSync('.')];
const read = (f: string) => readFileSync(f, 'utf8');
describe('a semantic indicator', () => {
  it('is drawn in an Atlas tone only from an indicator', () => {
    const allowed = new Set(['web/reader/stage/pip.tsx', 'web/reader/stage/choice-row.tsx', 'web/reader/notices.tsx',
      'web/reader/stage/wayfinder.tsx', 'web/reader/board/board-labels.ts',
      // The folded lenses' diamond, glittering with the tones of their own indicators (OR-1084: Folded.held).
      'web/reader/stage/folded-rail.tsx']);
    const tones = files.filter(f => f.startsWith('web/') && !allowed.has(f) && /var\(--tone-|`var\(--tone-\$\{/.test(read(f)));
    expect(tones).toEqual([]);
    // Where a tone is drawn from a variable, it is an indicator's.
    expect(read('web/reader/stage/wayfinder.tsx')).toMatch(/Fold\.mark\(borne\.leaves/);
  });
  it('is made only of witnesses, whose brand is cast nowhere but where they are issued', () => {
    const cast = files.filter(f => f !== 'src/presentation/attest.ts' && /as (unknown as )?(Witness|Attested)\b/.test(read(f)));
    expect(cast).toEqual([]);
  });
  it('is drawn by Pip and ChoiceRow from an indicator, never from a fill', () => {
    const pip = read('web/reader/stage/pip.tsx'), row = read('web/reader/stage/choice-row.tsx');
    expect(pip).toMatch(/static View\(\{ mark, label \}: \{ mark\?: Attested; label\?: string \}\)/);
    expect(row).toMatch(/indicator\?: Attested; plain\?: Plain;/);
    const filled = files.filter(f => /<Pip\.View fill=|\bmark=\{['"`]var\(/.test(read(f)));
    expect(filled).toEqual([]);
  });
});
