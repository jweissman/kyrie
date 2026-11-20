import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PromiseCorpus, type Check, type PromiseCase, type Turn } from '../../scripts/promise-corpus';
import type { Offered, Said } from '../../src/cli/runner';

// The false-promise corpus's contracts (S3-2; test/fixtures/promises/corpus.json, replayed by `bun
// scripts/promise-fidelity.ts --corpus`): each check says a turn broke its contract only where it did, on turns made
// to the cold plays' findings.
class Turned {
  static said(lines: string[], o: { primary?: Offered[]; coin?: number; moment?: Said['moment'] } = {}): Said {
    return { turn: 0, moment: o.moment ?? 'outcome', scene: { lines: ['the place · 17 Smoke', ...lines], prose: [] },
      offer: { primary: o.primary ?? [], rest: [] }, purse: { coin: o.coin ?? 8, rations: 2 } } as Said;
  }
  static row(label: string, does: string, type = 'act'): Offered {
    return { id: does, label, does, aspects: [], type, marks: [] } as unknown as Offered;
  }
  static turn(after: Said, o: { chosen?: Offered; before?: Said; heard?: string } = {}): Turn {
    return { before: o.before ?? Turned.said([]), after, heard: o.heard ?? '', ...o.chosen ? { chosen: o.chosen } : {} };
  }
}
describe('the false-promise corpus', () => {
  const broken = (check: Check, t: Turn) => PromiseCorpus.broken(check, t);
  it('holds every case to a check, each with its state, signal, act, result and contract', () => {
    const cases = (JSON.parse(readFileSync('test/fixtures/promises/corpus.json', 'utf8')) as { cases: PromiseCase[] }).cases;
    expect(cases.length).toBeGreaterThanOrEqual(10);
    for (const c of cases) {
      expect([c.state, c.signal, c.act, c.result, c.contract].every(Boolean)).toBe(true);
      expect(broken(c.check, Turned.turn(Turned.said([])))).toBeUndefined();
    }
    expect(new Set(cases.map(c => c.play))).toEqual(new Set(['cold-2', 'cold-4', 'cold-5', 'cold-6', 'cold-8']));
  });
  it('finds a Talk to that sells, coin said and not had, a To that goes elsewhere', () => {
    expect(broken('talk-does-talk', Turned.turn(Turned.said([]), { chosen: Turned.row('Talk to the factor', 'sell(x,y)') })))
      .toMatch(/does sell/);
    expect(broken('talk-does-talk', Turned.turn(Turned.said([]), { chosen: Turned.row('Talk to Gek', 'talk_to(gek)') })))
      .toBeUndefined();
    expect(broken('purse-as-said', Turned.turn(Turned.said(['The cook counts out eight silver.'], { coin: 8 }))))
      .toMatch(/unchanged/);
    expect(broken('purse-as-said', Turned.turn(Turned.said(['Ten coin are yours.'], { coin: 18 })))).toBeUndefined();
    const hall = Turned.row('To the great hall', 'go(a,b)', 'go');
    expect(broken('arrive-as-labelled', Turned.turn(Turned.said([]), { chosen: hall }))).toMatch(/came to/);
    const there = Turned.said([]); there.scene.lines[0] = 'the great hall · 17 Smoke';
    expect(broken('arrive-as-labelled', Turned.turn(there, { chosen: hall }))).toBeUndefined();
  });
  it('finds what needs seeing led in the dark, a talk with nothing said, someone asked of before they are named', () => {
    const dark = Turned.said(['It is pitch dark. Without a light you can see nothing here, and do nothing that needs seeing.'],
      { primary: [Turned.row('Search here', 'search(w)')] });
    expect(broken('dark-no-seeing', Turned.turn(dark))).toMatch(/Search here/);
    expect(broken('talk-says-something', Turned.turn(Turned.said(['Following: Ask Owain.']),
      { chosen: Turned.row('Talk to Orla Pennick', 'talk_to(orla)') }))).toMatch(/said nothing/);
    const asked = Turned.said([], { primary: [Turned.row('Ask the factor about the king-barrow', 'factor_barrow')] });
    expect(broken('named-before-asked', Turned.turn(Turned.said([]), { before: asked, heard: 'Owain waits.' })))
      .toMatch(/before any factor/);
    expect(broken('named-before-asked', Turned.turn(Turned.said([]), { before: asked, heard: 'The factor is here.' })))
      .toBeUndefined();
  });
});
