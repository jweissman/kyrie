import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Frame } from '../../src/creation/protocol';
import { Emphasis } from '../../src/presentation/emphasis';
import { Indicator } from '../../src/presentation/indicator';
import { SceneModel } from '../../src/ui/scene';
import { MenuModel } from '../../web/reader/menu-model';
import { TalkStage } from '../../web/reader/stage/talk-stage';

// A person's likeness against the drawer the page draws for them (OR-201, OR-178; AGENTS.md: marks derive from the
// rows their drawer shows): the talk drawer rendered as the page renders it (TalkStage.View, opened on them, nothing
// asked yet), the tones its rows and its More… carry, and the likeness the engine gives them (Glance.likenesses).
// Both ways: the one tone the likeness is drawn in (Indicator, by its precedence) is drawn on the drawer's first page
// or on its More…, and a tone drawn anywhere on the drawer is among the likeness's aspects (a row is drawn in one tone
// too: one gold and blue is drawn gold). Each disagreement is said, by whom and which tones.
export class DrawerTruth {
  static of(frame: Frame): string[] {
    const out: string[] = [], scene = SceneModel.build(frame.screen), g = frame.leaf.glance;
    for (const sub of scene.subjects.filter(x => x.kind === 'person' || x.kind === 'companion')) {
      const aspects = g?.likenesses?.[sub.id]?.aspects ?? [], tone = Indicator.of({ aspects }).tone;
      const has = new Set<string>(aspects.flatMap(a => Emphasis.tones[a] ?? []));
      const drawn = this.drawn(frame, sub.id);
      if (!drawn) { continue; }
      const extra = [...drawn].filter(t => !has.has(t));
      if ((tone && !drawn.has(tone)) || extra.length) {
        out.push(`${sub.name}: likeness ${[...has].join('+') || 'plain'}, drawer ${[...drawn].join('+') || 'plain'}`);
      }
    }
    return out;
  }
  // The tones the drawer draws on its rows and its More…, nothing asked: none where no talk is drawn for them.
  static drawn(frame: Frame, id: string): Set<string> | undefined {
    const menu = MenuModel.build(frame, 'here', [], { attention: { kind: 'person', id }, asked: [] });
    if (!menu.talk) { return undefined; }
    const app = { state: { frame, asked: [], talk: [], open: [], keyed: false }, menu,
      props: { query: new URLSearchParams() }, trade: () => undefined } as never;
    const html = renderToStaticMarkup(createElement(TalkStage.View, { app, talk: menu.talk }));
    const rows = /<div class="answer">(.*)/s.exec(html)?.[1] ?? '';
    return new Set([...rows.matchAll(/--tone-(\w+)/g)].map(m => m[1]!));
  }
}
