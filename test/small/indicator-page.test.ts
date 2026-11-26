import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Choice } from '../../src/ui/choice-list';
import type { Aspect, Promoted } from '../../src/presentation/glance-types';
import { Indicator, type Carrying } from '../../src/presentation/indicator';
import { Signs } from '../../src/presentation/signs';
import type { ReaderApp } from '../../web/reader/reader-app';
import { Act } from '../../web/reader/stage/act';
import { GlanceStage } from '../../web/reader/stage/glance';
import { PlaceMark } from '../../web/reader/stage/place-mark';
import { SceneRail } from '../../web/reader/stage/scene-rail';
import { WorldStage } from '../../web/reader/stage/world-stage';
import { Attested_ } from '../support/attested';
import type { Frame } from '../../src/creation/protocol';
import type { Menu } from '../../src/frame/menu-model';
import { MenuTree } from '../../src/frame/menu-tree';

// The page draws every indicator by the one grammar every client reads (TP-02, the owner, 14 November): one colour, an
// act's chief aspect by the one precedence (the aim's gold, then red, green, blue, violet, silver), never a gradient
// through several; a companion its icon alone, never a colour (TP-03); nothing held. A row's mark, a likeness's pip,
// the place's mark and the rail's pips are each the colour Indicator.of gives, so that the page and the terminal can
// never draw one act two ways.
// The terminal's own reading: its colour, and whether a companion's icon stands among its icons (TP-03).
const terminal = (c: Carrying) => Indicator.of(c);
const kin = (c: Carrying) => terminal(c).icons.some(i => i.sign === Signs.aspects.companionship.sign);
const cases: { aspects: Aspect[]; gilded: boolean }[] = [
  { aspects: ['exploration', 'payoff'], gilded: false }, { aspects: ['wonder', 'knowledge'], gilded: false },
  { aspects: ['companionship', 'knowledge'], gilded: false }, { aspects: ['companionship'], gilded: false },
  { aspects: ['payoff', 'danger'], gilded: false }, { aspects: ['exploration', 'wonder'], gilded: false },
  { aspects: ['danger', 'undertaking'], gilded: true }];
const expected = (c: typeof cases[number]) => {
  const tone = terminal({ aspects: c.aspects, gilded: c.gilded }).tone;
  return { tone: tone ? `var(--tone-${tone})` : undefined, companion: kin({ aspects: c.aspects, gilded: c.gilded }) };
};
const ask: Choice = { id: 'wat#talk/0', label: 'Ask about the well', tone: 'person', command: 'ask(wat, well)' };
// The frame's marks are the engine's (MenuTree), over the same glance and menu.
const marked = <F extends Pick<Frame, 'leaf' | 'screen'>>(frame: F, menu: Menu) => ({ ...frame,
  menu: { marks: MenuTree.marks(frame, menu, menu.scene) } });
const app = (acts: Promoted[], likenesses = {}) => {
  const menu = { choices: [ask], scene: { subjects: [], near: [], far: [], you: [] } } as unknown as Menu;
  const frame = marked({ leaf: { glance: { acts, likenesses } }, screen: { exits: [], party: [], path: [],
    place: { id: 'yard', kind: 'place', name: 'The yard' } } } as unknown as Frame, menu);
  return { state: { keyed: false, cursor: 0, open: [], frame }, menu, props: { query: new URLSearchParams() },
    choose: () => undefined } as unknown as ReaderApp;
};
const led = (c: typeof cases[number]): Promoted => ({ choice: ask.id, label: ask.label, why: 'named', facets: ['here'],
  tier: 1, aspects: c.aspects, marks: [], ...c.gilded ? { continues: true as const } : {} });
// The one colour a rendered indicator is drawn in, by its custom property; and whether a companion's icon is beside it.
const drawn = (html: string, property: string) => {
  const fill = new RegExp(`--${property}:\\s*([^;"]+)`).exec(html)?.[1]?.trim();
  return { tone: fill === 'var(--faint)' || fill === 'var(--tone-neutral)' ? undefined : fill,
    companion: /class="(pip-icon companion|led-icon)/.test(html) };
};

describe('the page\'s one indicator', () => {
  it('draws a row\'s mark in the one colour', () => {
    for (const c of cases.filter(x => !x.gilded)) {
      const html = renderToStaticMarkup(createElement(GlanceStage.Acts, { app: app([led(c)]),
        draw: Act.draw(app([led(c)])), acts: [led(c)] }));
      const mark = /class="prism-bar row-mark[^"]*"[^>]*style="--prism:\s*([^;"]+)/.exec(html)?.[1]?.trim();
      expect([c.aspects, mark && !/neutral/.test(mark) ? mark : undefined]).toEqual([c.aspects, expected(c).tone]);
      expect([c.aspects, /gradient/.test(html)]).toEqual([c.aspects, false]);
    }
  });
  it('draws a likeness\'s pip in it, a companion by the icon', () => {
    for (const c of cases.filter(x => !x.gilded)) {
      // The engine's likeness for them (Fold.subject): an act about Lindal the glance leads with.
      const at = app([{ ...led(c), subject: 'lindal' }], { lindal: { aspects: c.aspects } });
      const x = { id: 'lindal', name: 'Lindal', kind: 'person', choices: [] } as never;
      const seen = WorldStage.seen(at, x);
      expect([c.aspects, seen?.tone ? `var(--tone-${seen.tone})` : undefined]).toEqual([c.aspects, expected(c).tone]);
      const html = renderToStaticMarkup(createElement(WorldStage.Portrait, { subject: x, draw: Act.draw(at),
        pip: seen }));
      expect([c.aspects, drawn(html, 'pip')]).toEqual([c.aspects, expected(c)]);
    }
  });
  // The place's mark is a horizontal place-mark (the owner, 26 November, OR-1248, superseding OR-513 for it): coloured
  // by what the place offers, from the same leaves as its rows, what it offers said in its words too.
  it('draws the place\'s mark in the tones of what the place offers, said in words', () => {
    for (const c of cases.filter(x => !x.gilded)) {
      const html = renderToStaticMarkup(createElement(PlaceMark.View, { app: app([led(c)]) }));
      expect([c.aspects, /--pm:/.test(html)]).toEqual([c.aspects, !!expected(c).tone]);
      expect([c.aspects, /aria-label="[^"]+"/.test(html)]).toEqual([c.aspects, true]);
    }
  });
  it('draws the rail\'s pips in it, and a companion among its rows by the icon', () => {
    for (const c of cases.filter(x => !x.gilded)) {
      const mark = Attested_.of(c.aspects, false);
      const lit = renderToStaticMarkup(createElement(SceneRail.Mark, { app: app([]), part: 'look', glyph: 'look_about',
        words: 'Look', standing: mark ? { lit: mark } : {} }));
      expect([c.aspects, drawn(lit, 'pip').tone]).toEqual([c.aspects, expected(c).tone]);
    }
    const html = renderToStaticMarkup(createElement(SceneRail.Mark, { app: app([]), part: 'go', glyph: 'go_on',
      words: 'Go', standing: { lit: Attested_.of(['companionship'], false)! } }));
    expect(drawn(html, 'pip')).toEqual(expected({ aspects: ['companionship'], gilded: false }));
  });
});
