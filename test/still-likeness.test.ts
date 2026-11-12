import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorldStage } from '../web/reader/stage/world-stage';
import type { SceneSubject } from '../src/ui/scene';

// A likeness with nothing to open says why when it is touched, rather than nothing (round 6: three taps on the factor's
// hands, and on an enemy, did nothing, and nothing said why).
describe('a still likeness', () => {
  const subject = (more: Partial<SceneSubject>) => ({ id: 'x', name: 'The factor’s hands', kind: 'person',
    choices: [], ...more }) as unknown as SceneSubject;
  it('is a button that says why it opens nothing', () => {
    const html = renderToStaticMarkup(createElement(WorldStage.Still, { subject: subject({}), fell: '', children: 'x' }));
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('Nothing to say to you now.');
  });
  it('says a foe is dealt with in the scene, and the fallen as they are', () => {
    expect(WorldStage.why(subject({ danger: 'grave' } as Partial<SceneSubject>))).toMatch(/Means you harm/);
    expect(WorldStage.why(subject({ state: 'dead' } as Partial<SceneSubject>))).toBe('Dead.');
  });
  it('says one at their own business as they are seen at it (round 10, S)', () => {
    expect(WorldStage.why(subject({ says: ['The boy is coiling a snare-line by the causeway.'] })))
      .toBe('The boy is coiling a snare-line by the causeway.');
  });
});
