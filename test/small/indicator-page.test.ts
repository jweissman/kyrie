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
const app = (acts: Promoted[], likenesses = {}) => ({ state: { keyed: false, cursor: 0, open: [], frame: {
  leaf: { glance: { acts, likenesses } },
  screen: { exits: [], party: [], path: [], place: { id: 'yard', kind: 'place', name: 'The yard' } } } },
menu: { choices: [ask], scene: { subjects: [] } }, props: { query: new URLSearchParams() },
choose: () => undefined } as unknown as ReaderApp);
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
      const at = app([], { lindal: { aspects: c.aspects } }), x = { id: 'lindal', name: 'Lindal', kind: 'person',
        choices: [] } as never;
      const seen = WorldStage.seen(at, x);
      expect([c.aspects, seen.fill]).toEqual([c.aspects, expected(c).tone]);
      const html = renderToStaticMarkup(createElement(WorldStage.Portrait, { subject: x, draw: Act.draw(at),
        pip: seen }));
      expect([c.aspects, drawn(html, 'pip')]).toEqual([c.aspects, expected(c)]);
    }
  });
  it('draws the place\'s mark in it', () => {
    for (const c of cases.filter(x => !x.gilded)) {
      const html = renderToStaticMarkup(createElement(PlaceMark.View, { app: app([led(c)]) }));
      expect([c.aspects, drawn(html, 'pm').tone]).toEqual([c.aspects, expected(c).tone]);
    }
  });
  it('draws the rail\'s pips in it, and what is perceived that way a companion by the icon', () => {
    for (const c of cases.filter(x => !x.gilded)) {
      const tone = terminal({ aspects: c.aspects, gilded: false }).tone;
      const lit = renderToStaticMarkup(createElement(SceneRail.Mark, { app: app([]), part: 'look', glyph: 'look_about',
        words: 'Look', standing: tone ? { lit: tone } : {} }));
      expect([c.aspects, drawn(lit, 'pip').tone]).toEqual([c.aspects, expected(c).tone]);
    }
    for (const aspect of ['companionship', 'knowledge'] as const) {
      const html = renderToStaticMarkup(createElement(SceneRail.Mark, { app: app([]), part: 'go', glyph: 'go_on',
        words: 'Go', standing: {}, faint: aspect }));
      expect([aspect, drawn(html, 'pip')]).toEqual([aspect, expected({ aspects: [aspect], gilded: false })]);
    }
  });
});
