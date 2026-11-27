import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tiny } from '../support/tiny';
import { MenuModel } from '../../src/frame/menu-model';
import type { Frame } from '../../src/creation/protocol';
import type { Lens } from '../../src/presentation/glance-types';
import type { ReaderApp } from '../../web/reader/reader-app';
import { Act } from '../../web/reader/stage/act';
import { GlanceStage } from '../../web/reader/stage/glance';
import { Paging } from '../../src/frame/paging';
import { MenuTree } from '../../src/frame/menu-tree';

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
  const frame = MenuTree.framed({ screen: t.screen, leaf: t.leaf } as unknown as Frame), menu = MenuModel.build(frame, 'here', []);
  const app = { state: { frame, open: [], keyed: false, cursor: 0, ...state }, menu,
    props: { query: new URLSearchParams() }, choose: () => undefined, setState: () => undefined,
    hover: () => undefined } as unknown as ReaderApp;
  // Within the lens, where the keys reach its rows (Explorer.key reads `.glance .lens [data-act]`): kept above a lens
  // drawn by focus, a row lit by the arrows had done nothing on Enter (the Slip's way onto the Strand under Wait…,
  // test/skeel-browser).
  const html = renderToStaticMarkup(createElement(GlanceStage.Lens, { app, draw: Act.draw(app), lens }));
  const within = html.slice(html.indexOf('data-lens='));
  return { rows: [...within.matchAll(/data-act="([^"]+)"/g)].map(m => m[1]!), focused: html.includes('lens-focus') };
};
describe('a lens opened', () => {
  it('keeps what will not wait and the aim\'s step in sight above it', async () => {
    const t = await Tiny.start(adit, { party: [{ name: 'Wynn', raceId: 'human', classId: 'warrior' }] });
    t.follow('out');
    const four = t.glance.offer!.primary;
    expect(four.find(o => o.continues)?.choice).toBe('t__prop#look');
    expect(four.map(o => o.choice)).toContain('t__badger/0:Attack');
    const forms = new Set<boolean>();
    for (const [lens, state] of states) {
      const { rows, focused } = drawn(t, state, lens), lensed = t.glance.lenses![lens];
      forms.add(focused);
      expect([lens, rows.includes('t__badger/0:Attack'), rows.includes('t__prop/0:Lift the fallen prop')])
        .toEqual([lens, true, true]);
      // In the four's places, and no part of the lens's mark: Look is not red for the badger kept above it.
      expect((lensed.kept ?? []).length + lensed.promoted.length).toBeLessThanOrEqual(4);
      if (lens !== 'people') { expect(lensed.aspects).not.toContain('danger'); }
    }
    // Both of a lens's forms, its rows and by focus.
    expect([...forms].sort()).toEqual([false, true]);
  });
  // The kept take a lens's places on its first page only: on the others its own rows keep theirs, so that what pages
  // keeps its pages (the drove landing's ways by quarter had gone from three pages to four: test/lens-rows-valid).
  it('pages its own rows as it would without them, the kept on the first page only', () => {
    const items = Array.from({ length: 8 }, (_, i) => i);
    expect(Paging.of(items, 4, 0, { lead: 1 })).toEqual({ shown: [0, 1], at: 0, pages: 3 });
    expect(Paging.of(items, 4, 1, { lead: 1 })).toEqual({ shown: [2, 3, 4], at: 1, pages: 3 });
    expect(Paging.of(items, 4, 2, { lead: 1 })).toEqual({ shown: [5, 6, 7], at: 2, pages: 3 });
    expect(Paging.of(items, 4, 0)).toEqual({ shown: [0, 1, 2], at: 0, pages: 3 });
    expect(Paging.of([0, 1, 2], 4, 0, { lead: 1 })).toEqual({ shown: [0, 1, 2], at: 0, pages: 1 });
  });
});
