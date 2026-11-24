import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tiny } from '../support/tiny';
import { MenuModel } from '../../web/reader/menu-model';
import type { Frame } from '../../src/creation/protocol';
import type { Lens } from '../../src/presentation/glance-types';
import type { ReaderApp } from '../../web/reader/reader-app';
import { Act } from '../../web/reader/stage/act';
import { GlanceStage } from '../../web/reader/stage/glance';

// A lens opened never puts a led act a lens away (OR-240: the first blind cold play of the page, P72-73 and P85-86:
// the badger's Attack gone with Look, lifting the prop with Dai only once Talk was put away). What the resting scene
// led with that will not wait (the danger) or carries the aim on (its gold) stays in sight above whichever lens is
// open, in the four's places (Lensed.kept), and is no part of the lens's own mark. Read on the page as it draws each
// lens (GlanceStage.Lens over MenuModel's menu), headlessly, at every lens the rail opens.
const adit = `
  Place adit "the old adit" is room at 0, 0 underground.
  Place drift "the drift" is room at 1, 0 underground.
  Passage upway "the way up" is passage between adit and drift.
  Company party "You" of 1 at adit.
  Person badger "an old boar badger" at adit { Role "a badger". Species badger. Level 1. }
  Person dai "Dai" at adit { Role "a boy". Ancestry human. Peaceable. Pronouns he. }
  Thing prop "the fallen prop" at adit { State fallen "A prop lies across the drift.". State lifted "The prop is lifted.".
    Change lift "Lift the fallen prop" from fallen to lifted. }
  Objective out when state(prop, fallen) "Lift the prop.".
  Goal false.`;
const states: [Lens, Record<string, unknown>][] = [['things', { exploring: 'look' }], ['people', { talking: true }],
  ['places', { exploring: 'go' }], ['time', { exploring: 'wait' }]];
const drawn = (t: Tiny, state: Record<string, unknown>, lens: Lens) => {
  const frame = { screen: t.screen, leaf: t.leaf } as unknown as Frame, menu = MenuModel.build(frame, 'here', []);
  const app = { state: { frame, open: [], keyed: false, cursor: 0, ...state }, menu,
    props: { query: new URLSearchParams() }, choose: () => undefined, setState: () => undefined,
    hover: () => undefined } as unknown as ReaderApp;
  const html = renderToStaticMarkup(createElement(GlanceStage.Lens, { app, draw: Act.draw(app), lens }));
  return [...html.matchAll(/data-act="([^"]+)"/g)].map(m => m[1]!);
};
describe('a lens opened', () => {
  it('keeps what will not wait and the aim\'s step in sight above it', async () => {
    const t = await Tiny.start(adit, { party: [{ name: 'Wynn', raceId: 'human', classId: 'warrior' }] });
    t.follow('out');
    const four = t.glance.offer!.primary;
    expect(four.find(o => o.continues)?.choice).toBe('t__prop#look');
    expect(four.map(o => o.choice)).toContain('t__badger/0:Attack');
    for (const [lens, state] of states) {
      const rows = drawn(t, state, lens), lensed = t.glance.lenses![lens];
      expect([lens, rows.includes('t__badger/0:Attack'), rows.includes('t__prop/0:Lift the fallen prop')])
        .toEqual([lens, true, true]);
      // In the four's places, and no part of the lens's mark: Look is not red for the badger kept above it.
      expect((lensed.kept ?? []).length + lensed.promoted.length).toBeLessThanOrEqual(4);
      if (lens !== 'people') { expect(lensed.aspects).not.toContain('danger'); }
    }
  });
});
