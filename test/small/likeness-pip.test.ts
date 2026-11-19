import { describe, expect, it } from 'bun:test';
import { WorldStage } from '../../web/reader/stage/world-stage';
import type { ReaderApp } from '../../web/reader/reader-app';
import type { SceneSubject } from '../../src/ui/scene';
import type { Glance, Promoted } from '../../src/presentation/glance-types';
import { Likenesses } from '../../src/presentation/likenesses';

// A likeness's one pip is the fold of what is done with them (Fold.likeness; AT-05: a likeness lit with no row of
// theirs to bear it): the acts about them the glance leads with, in the one precedence; the aim's gold alone where one
// of them is the followed aim's next step (Likenesses' rule, M21's PL-32: at Merscstede Lindal, the sealed letter's
// next step, whose talk also teaches, had been a ring that read blue); and a danger seen in them, the engine's.
const act = (aspects: Promoted['aspects'], continues = false): Promoted => ({ choice: 'lindal#talk', subject: 'lindal',
  label: 'Speak with Lindal', why: 'named', facets: ['here'], tier: 1, aspects, marks: [],
  ...continues ? { continues: true as const } : {} });
const app = (glance: Partial<Glance>) => ({ props: { query: new URLSearchParams() }, menu: { choices: [] },
  state: { frame: { leaf: { glance }, screen: { party: [] } } } }) as unknown as ReaderApp;
const lindal = (more: Partial<SceneSubject> = {}) => ({ id: 'lindal', name: 'Lindal', kind: 'person', choices: [],
  ...more }) as unknown as SceneSubject;

describe('a likeness\'s pip', () => {
  it('is the fold of the acts about them, the aim\'s gold alone where one carries it on', () => {
    const glance = { acts: [act(['undertaking', 'knowledge'], true)],
      likenesses: { lindal: { aspects: ['undertaking' as const], continues: true as const } } };
    const seen = WorldStage.seen(app(glance), lindal());
    expect([seen?.witnesses.flatMap(w => w.aspects), seen?.tone]).toEqual([['undertaking'], 'gold']);
    // Not led on, the act bears what it bears: here what it teaches.
    expect(WorldStage.seen(app({ acts: [act(['knowledge'])] }), lindal())?.tone).toBe('blue');
  });
  // A likeness the engine reckons for something no act of theirs bears is drawn plain (AT-05); a danger seen in them is
  // the engine's (Likenesses: SceneModel.threat), never added on the page.
  it('is lit by nothing no act bears, but a danger seen in them, the engine\'s', () => {
    expect(Likenesses.of([], ['lindal']).lindal).toEqual({ aspects: ['danger'] });
    const told = WorldStage.seen(app({ acts: [], likenesses: { lindal: { aspects: ['knowledge'] } } }),
      lindal({ owed: true, danger: 'grave' } as Partial<SceneSubject>));
    expect(told).toBeUndefined();
    const threat = WorldStage.seen(app({ acts: [], likenesses: { lindal: { aspects: ['danger'] } } }), lindal());
    expect([threat?.witnesses.flatMap(w => w.aspects), threat?.tone]).toEqual([['danger'], 'red']);
  });
});
