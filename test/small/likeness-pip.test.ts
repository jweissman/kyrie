import { describe, expect, it } from 'bun:test';
import { WorldStage } from '../../web/reader/stage/world-stage';
import type { ReaderApp } from '../../web/reader/reader-app';
import type { SceneSubject } from '../../src/ui/scene';
import type { Glance, Promoted } from '../../src/presentation/glance-types';

// A likeness's one pip is the engine's value for it (Glance.likenesses, M21's PL-32), with only what the scene says of
// them besides (something owed, a danger seen): never composed again on the page from the glance's acts, which at
// Merscstede had made Lindal, the sealed letter's next step, a ring that read blue.
const act = (aspects: Promoted['aspects'], continues = false): Promoted => ({ choice: 'lindal#talk', subject: 'lindal',
  label: 'Speak with Lindal', why: 'named', facets: ['here'], tier: 1, aspects, marks: [],
  ...continues ? { continues: true as const } : {} });
const app = (glance: Partial<Glance>) => ({ props: { query: new URLSearchParams() },
  state: { frame: { leaf: { glance }, screen: { party: [] } } } }) as unknown as ReaderApp;
const lindal = (more: Partial<SceneSubject> = {}) => ({ id: 'lindal', name: 'Lindal', kind: 'person', choices: [],
  ...more }) as unknown as SceneSubject;

describe('a likeness\'s pip', () => {
  it('is the engine\'s likeness, not the glance\'s acts about them', () => {
    const glance = { acts: [act(['undertaking', 'knowledge'], true)],
      likenesses: { lindal: { aspects: ['undertaking' as const], continues: true as const } } };
    const seen = WorldStage.seen(app(glance), lindal());
    expect([seen.aspects, seen.gilded, seen.tone]).toEqual([['undertaking'], true, 'gold']);
    // The acts alone say nothing of the likeness: with no likeness given, no pip.
    expect(WorldStage.seen(app({ acts: glance.acts }), lindal()).fill).toBeUndefined();
  });
  it('adds only what is owed them and a danger seen in them', () => {
    const seen = WorldStage.seen(app({ acts: [], likenesses: { lindal: { aspects: ['knowledge'] } } }),
      lindal({ owed: true, danger: 'grave' } as Partial<SceneSubject>));
    expect(seen.aspects.toSorted()).toEqual(['danger', 'knowledge', 'payoff']);
  });
});
