import { describe, expect, it } from 'bun:test';
import { Promotion, type Candidate, type Situation } from '../src/ui/promotion';
import type { Why } from '../src/presentation/glance-types';

// The glance's ranking, on candidates made up for it (OWN-18, OWN-19): urgent before the aim, the aim before need,
// need before the place, three at most and never padded, one for each subject, and what is never led with never is.
class Made {
  static n = 0;
  static c(choice: string, whys: Why[], extra: Partial<Candidate> = {}): Candidate {
    return { choice, label: choice, kind: 'act', whys, order: Made.n++, marks: [], subject: choice, ...extra };
  }
  static readonly calm: Situation = { threat: false, warned: false, dark: false, settled: true, open: false };
  static ids(cands: Candidate[], s: Situation = Made.calm): string[] {
    return Promotion.pick(cands, s).map(p => p.choice);
  }
}

describe('the glance ranks', () => {
  it('urgent, then the aim, then need, then the place, three at most', () => {
    const cands = [Made.c('dog', ['sign']), Made.c('bread', ['hungry'], { kind: 'eat' }), Made.c('brother', ['kin']),
      Made.c('answer', ['answer']), Made.c('swing', ['own'])];
    const picked = Promotion.pick(cands, Made.calm);
    expect(picked.map(p => p.choice)).toEqual(['answer', 'brother', 'bread']);
    expect(picked.map(p => [p.why, p.tier])).toEqual([['answer', 0], ['kin', 1], ['hungry', 2]]);
    expect(picked[1]!.facets).toEqual(['here', 'aimed']);
    expect(picked[0]!.facets).toContain('urgent');
  });
  it('takes one choice for each subject, and pads nothing', () => {
    const cands = [Made.c('wat#talk', ['kin'], { subject: 'wat' }), Made.c('wat/coat', ['own'], { subject: 'wat' }),
      Made.c('gate', ['named'], { kind: 'way', subject: undefined })];
    expect(Made.ids(cands)).toEqual(['wat#talk', 'gate']);
    expect(Made.ids([Made.c('one', ['life'])])).toEqual(['one']);
    expect(Made.ids([Made.c('known', [], { known: true })])).toEqual([]);
  });
  it('lets a danger take its gentlest act, the attack, and the way back', () => {
    const s = { ...Made.calm, threat: true };
    const fight = { kind: 'fight' as const, said: 'a hard fight', ask: false };
    const cands = [Made.c('hounds/attack', ['danger'], { subject: 'hounds', kind: 'attack', marks: [fight] }),
      Made.c('hounds/smoke', ['danger', 'about'], { subject: 'hounds' }),
      Made.c('exit:fells', ['retreat'], { kind: 'way', subject: undefined }), Made.c('kist', ['sign'])];
    const picked = Promotion.pick(cands, s);
    expect(picked.map(p => p.choice)).toEqual(['hounds/smoke', 'hounds/attack', 'exit:fells']);
    expect(picked[0]!.facets).toEqual(['here', 'aimed', 'urgent']);
    expect(picked[1]!.marks).toEqual([fight]);
  });
  it('never leads with a wait, a step, study, a bare search, a camp or rest unneeded, the barred', () => {
    const never = [Made.c('wait', ['life'], { kind: 'wait' }), Made.c('north', ['unvisited'], { kind: 'step' }),
      Made.c('prepare', ['own'], { kind: 'study' }), Made.c('search', ['own'], { kind: 'search' }),
      Made.c('camp', ['own'], { kind: 'camp' }), Made.c('rest', ['life'], { kind: 'rest' }),
      Made.c('shut', ['named'], { barred: true })];
    expect(Made.ids(never)).toEqual([]);
    // But first light in the dark, a search for a sign, a camp for the night.
    expect(Made.ids([Made.c('dawn', ['dark'], { kind: 'wait' }), Made.c('search', ['sign'], { kind: 'search' }),
      Made.c('camp', ['exposed'], { kind: 'camp' })], { ...Made.calm, dark: true })).toEqual(['dawn', 'camp', 'search']);
  });
  it('leads with one of the place\'s own, not its risk unless there is nothing else, and two ways at most', () => {
    const own = [Made.c('skittles', ['own'], { own: true, risk: true }), Made.c('swing', ['own'], { own: true }),
      Made.c('boat', ['own'], { own: true })];
    expect(Made.ids(own)).toEqual(['swing']);
    expect(Made.ids([Made.c('skittles', ['own'], { own: true, risk: true })])).toEqual(['skittles']);
    const ways = ['a', 'b', 'c'].map(id => Made.c(`exit:${id}`, ['named'], { kind: 'way' }));
    expect(Made.ids(ways)).toEqual(['exit:a', 'exit:b']);
  });
  it('leads with a way not yet taken only in a settlement, only while fewer than two are led with', () => {
    const lane = Made.c('exit:lane', ['unvisited'], { kind: 'way', minutes: 2 });
    expect(Made.ids([Made.c('dog', ['sign']), lane])).toEqual(['dog', 'exit:lane']);
    expect(Made.ids([Made.c('dog', ['sign']), Made.c('cat', ['sign']), lane])).toEqual(['dog', 'cat']);
    expect(Made.ids([lane], { ...Made.calm, settled: false })).toEqual([]);
    expect(Made.ids([lane], { ...Made.calm, threat: true })).toEqual([]);
  });
  it('breaks ties by the authored order, and is the same every time', () => {
    const cands = [Made.c('first', ['asked']), Made.c('second', ['asked']), Made.c('third', ['asked']),
      Made.c('fourth', ['asked'])];
    const once = Promotion.pick(cands, Made.calm);
    expect(once.map(p => p.choice)).toEqual(['first', 'second', 'third']);
    expect(Promotion.pick([...cands].reverse(), Made.calm)).toEqual(once);
  });
  it('rows the ways the aim names first, then those named now, then those not taken, nearest first', () => {
    const ways = [Made.c('exit:old', [], { kind: 'way', visited: true }),
      Made.c('exit:far', [], { kind: 'way', visited: false, minutes: 9 }),
      Made.c('exit:near', [], { kind: 'way', visited: false, minutes: 2 }),
      Made.c('exit:told', [], { kind: 'way', visited: true, pointed: true }),
      Made.c('exit:aim', ['held'], { kind: 'way', visited: true })];
    expect(Promotion.ways(ways, [], Made.calm)).toEqual(['exit:aim', 'exit:told', 'exit:near']);
    const steps = ['n', 'e', 's'].map(id => Made.c(id, [], { kind: 'step' }));
    expect(Promotion.ways([...ways, ...steps], [], { ...Made.calm, open: true })).toEqual(['n', 'e', 's']);
  });
});
