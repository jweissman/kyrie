import { describe, expect, it } from 'bun:test';
import { Promotion, type Candidate, type Situation } from '../../src/ui/promotion';
import type { Why } from '../../src/presentation/glance-types';

// What the Atlas marks outweighs what it does not (the owner, 19 November, AT-11: "if there's a matching opportunity
// beneath a lens, it should outweigh at least non-atlas-indicated items in the heuristic for promotion"). Below the
// urgent, the aim and the company's needs, which keep their order, no unmarked act is led with while a marked one is
// left beneath its lens: the place's gate and two of its people, its life and no opportunity, had taken the three
// places ahead of the place's own notice and a well not looked at, both worth a look.
const calm: Situation = { threat: false, warned: false, dark: false, settled: true, open: false };
let n = 0;
const made = (choice: string, whys: Why[], extra: Partial<Candidate> = {}): Candidate =>
  ({ choice, label: choice, kind: 'act', whys, order: n++, marks: [], subject: choice, ...extra });

describe('the four, by what the Atlas marks', () => {
  it('lead with a marked act before an unmarked one, the life of the place or a way in', () => {
    const cands = [made('baker', ['life']), made('smith', ['life']), made('gate', ['entry'], { kind: 'way' }),
      made('notice', ['own']), made('well', ['unlooked'])];
    const picked = Promotion.pick(cands, calm);
    const marked = picked.filter(p => p.aspects.length), bare = picked.filter(p => !p.aspects.length);
    expect(marked.map(p => p.choice).sort()).toEqual(['notice', 'well']);
    // Every marked act was led with before any bare one.
    expect(picked.findIndex(p => !p.aspects.length)).toBeGreaterThanOrEqual(marked.length);
    expect(bare.map(p => p.choice)).not.toContain('baker');
  });
  it('keep the urgent, the aim and need ahead of any mark', () => {
    const cands = [made('lane', ['unvisited'], { kind: 'way' }), made('bread', ['hungry'], { kind: 'eat' }),
      made('brother', ['kin']), made('answer', ['answer'])];
    expect(Promotion.pick(cands, calm).map(p => p.choice).slice(0, 3).sort()).toEqual(['answer', 'bread', 'brother']);
  });
  // A way led with for another reason bears whoever is perceived along it (the owner, 19 November: a way in Explore
  // with a companion there, and no companion on its row), though a companion is never its reason to lead.
  it('mark a way led with for another reason with whoever might join along it', () => {
    const picked = Promotion.pick([made('door', ['unlooked', 'companion'], { kind: 'way' })], calm);
    expect(picked.map(p => [p.choice, p.why])).toEqual([['door', 'unlooked']]);
    expect(picked[0]!.aspects).toContain('companionship');
  });
  // Never at the cost of the four (kite's road, where a first try had led with "Help him" and lost the wagoner's
  // talk and his cart to the one-a-person and one-own rules): a marked act takes an unmarked one's place only where
  // nothing else is lost by it.
  it('take no row from the four for a mark', () => {
    const road = [made('green', ['toward'], { kind: 'way' }), made('carter#talk', ['life'], { kind: 'talk',
      subject: 'carter' }), made('cart#look', ['own'], { subject: 'cart' }), made('carter/help', ['own'],
      { subject: 'carter' })];
    const picked = Promotion.pick(road, calm).map(p => p.choice);
    expect(picked).toHaveLength(3);
    expect(picked).toEqual(expect.arrayContaining(['green', 'carter#talk', 'cart#look']));
  });
});
