import { describe, expect, it } from 'bun:test';
import { Glob } from 'bun';
import { Attest, type Projected, type Witness } from '../../src/presentation/attest';
import { Fold, type Leaf } from '../../src/presentation/fold';
import type { Promoted } from '../../src/presentation/glance-types';
import type { Choice } from '../../src/ui/choice-list';

// A container's mark is the fold of its leaves, and can be made no other way (AT-07 §4 I1, I2; the owner, 19
// November: a container lit by its own reasons must not be constructible). On a synthetic choice hierarchy: an opener
// (a tablet's look) led blue and red for reasons of its own, its three acts one of which the glance leads it for.
const opener: Choice = { id: 'tablet#look', label: 'a tablet', tone: 'thing', children: [
  { id: 'tablet/0', label: 'Read it', tone: 'thing', command: 'read(tablet)' },
  { id: 'tablet/1', label: 'Smash it', tone: 'thing', command: 'smash(tablet)' },
  { id: 'tablet/2', label: 'Hide it', tone: 'thing', command: 'hide(tablet)' }] };
const led = (inside: Promoted['inside']): Projected => ({ acts: [{ choice: 'tablet#look', label: 'a tablet', why: 'own',
  facets: [], tier: 3, aspects: ['knowledge', 'danger'], ...inside ? { inside } : {} } as unknown as Promoted] });

describe('a container\'s mark', () => {
  it('is the fold of its rows: an opener lit by its own reasons, with nothing inside bearing them, is unlit', () => {
    const g = led(undefined);
    // Its own witness says blue and red ...
    expect(Attest.of([Attest.witness(g, 'tablet#look')], true)?.tone).toBe('red');
    // ... and its mark, made of its rows, says nothing: none of them bears either.
    expect(Fold.mark(Fold.of(g as never, opener, opener.id, true), true)).toBeUndefined();
  });
  it('is lit by the one row that bears what the opener is led for, and by nothing else', () => {
    const g = led([{ command: 'read(tablet)', aspects: ['knowledge'] }]);
    const leaves = Fold.of(g as never, opener, opener.id, true);
    expect(leaves.map(l => [l.id, l.witnesses.flatMap(w => w.aspects)])).toEqual([
      ['tablet/0', ['knowledge']], ['tablet/1', []], ['tablet/2', []]]);
    const mark = Fold.mark(leaves, true);
    expect([mark?.tone, mark?.witnesses.map(w => w.id)]).toEqual(['blue', ['read(tablet)']]);
  });
  it('refuses an opener offered as a leaf, at construction', () => {
    expect(() => Fold.leaf(opener, [Attest.witness(led(undefined), 'tablet#look')])).toThrow(/no leaf/);
    expect(Fold.leaf(opener.children![0]!, []).id).toBe('tablet/0');
  });
  it('cannot be written of witnesses, nor a leaf written as a literal (the brand is the fold module\'s own)', () => {
    const w = Attest.witness(led(undefined), 'tablet#look') as Witness;
    // @ts-expect-error: a container's mark takes leaves, never witnesses
    expect(() => Fold.mark([w], true)).not.toThrow();
    // @ts-expect-error: a leaf has no constructor but Fold.leaf
    const forged: Leaf = { id: 'tablet#look', witnesses: [w] };
    expect(forged.id).toBe('tablet#look');
  });
  it('is made by Fold alone in the page\'s containers: the lenses, their rows and pagers, the rail\'s Go and Look', async () => {
    const containers = ['web/reader/stage/lens-focused.tsx', 'web/reader/stage/lenses.tsx', 'web/reader/stage/glance.tsx'];
    const offending: string[] = [];
    for (const f of containers) { if (/Attest\.(of|join)\(/.test(await Bun.file(f).text())) { offending.push(f); } }
    const rail = await Bun.file('web/reader/stage/scene-rail.tsx').text();
    for (const m of ['go', 'look']) {
      const body = rail.split(`static ${m}(app: ReaderApp): Standing {`)[1]?.split('\n  }')[0] ?? '';
      if (/Attest\.(of|join)\(/.test(body) || !/Fold\.mark\(/.test(body)) { offending.push(`SceneRail.${m}`); }
    }
    expect(offending).toEqual([]);
  });
  it('reaches a way only by what is along it: a step refuses a thing done elsewhere (I7)', () => {
    const g = { acts: [{ choice: 'tablet/0', aspects: ['knowledge'] }], following: ['x_mill'],
      sensed: [{ to: 'mill', aspect: 'companionship', far: 2 }] } as unknown as Projected;
    const step = Fold.step('x_mill', [Attest.witness(g, 'x_mill'), Attest.sensed(g, 'mill')]);
    expect(Fold.mark([step], true)?.icons.length).toBeGreaterThan(0);
    expect(Fold.mark([step], true)?.tone).toBe('gold');
    expect(() => Fold.step('x_mill', [Attest.witness(g, 'tablet/0')])).toThrow(/not along the way/);
  });
  it('folds someone by the acts with them: the aim\'s next step alone, else all of them, and a danger seen', () => {
    const acts = [{ choice: 'cyril#talk', subject: 'cyril', aspects: ['companionship'] },
      { choice: 'cyril/give', subject: 'cyril', aspects: ['payoff'] }];
    const none = () => undefined;
    const plain = { acts, likenesses: { cyril: { aspects: ['companionship', 'payoff'] } } } as unknown as Projected;
    expect(Fold.likeness(plain, 'cyril', none).map(l => l.id)).toEqual(['cyril#talk', 'cyril/give']);
    const on = { acts: [...acts, { choice: 'cyril/ask', subject: 'cyril', aspects: ['undertaking'], continues: true }],
      likenesses: { cyril: { aspects: ['undertaking'], continues: true } } } as unknown as Projected;
    expect(Fold.mark(Fold.likeness(on, 'cyril', none), true)?.witnesses.map(w => w.id)).toEqual(['cyril/ask']);
    const threat = { acts: [], likenesses: { wolf: { aspects: ['danger'] } } } as unknown as Projected;
    expect(Fold.mark(Fold.likeness(threat, 'wolf', none), true)?.tone).toBe('red');
    // A talk the page draws no row for is folded by what it is led for inside it, never its own reasons.
    const talk = { acts: [{ choice: 'cyril#talk', subject: 'cyril', aspects: ['knowledge', 'danger'],
      inside: [{ command: 'ask(cyril)', aspects: ['knowledge'] }] }] } as unknown as Projected;
    expect(Fold.mark(Fold.likeness(talk, 'cyril', none), true)?.tone).toBe('blue');
  });
  it('is made by Fold alone anywhere in the game: no module but the fold calls Attest.of (I1 whole)', async () => {
    // Every indicator any client draws is a Fold.mark of leaves: the page, the map, the talk, the rail and the engine's
    // own readings (PlaceFacets) alike. Attest issues witnesses; only the fold makes an indicator of them.
    const callers: string[] = [];
    for (const root of ['web', 'src']) {
      for await (const f of new Glob(`${root}/**/*.{ts,tsx}`).scan('.')) {
        if (['src/presentation/fold.ts', 'src/presentation/attest.ts'].includes(f)) { continue; }
        if (/Attest\.(of|join)\(/.test(await Bun.file(f).text())) { callers.push(f); }
      }
    }
    expect(callers).toEqual([]);
  });
});
