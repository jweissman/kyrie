import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tiny } from '../support/tiny';
import { TerminalDoable } from '../../src/cli/terminal-doable';
import { MenuModel } from '../../src/frame/menu-model';
import type { Frame } from '../../src/creation/protocol';
import type { ReaderApp } from '../../web/reader/reader-app';
import { Act } from '../../web/reader/stage/act';
import { GlanceStage } from '../../web/reader/stage/glance';
import { MenuTree } from '../../src/frame/menu-tree';

// The page's four are the engine's four (the owner, 14 November: TB-02, "four promoted, everywhere", and the terminal
// and the page agreeing on which four): the scene at rest draws the glance's offer as its numbered rows, one to four,
// each by the act it does (data-act), the same four the terminal leads with, whether or not the page's menu has a
// choice of its own for it (talking to someone here, which the page otherwise draws by their likeness). The yard of
// test/small/offer-four, with a well, a dog, a carter, a gate and a door, and three more things of the place's own to
// do: the four are filled only from what has a reason to be led (AT-01), and the carter and the ways have none.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 0, 1 outdoors.
  Place kitchen "the kitchen" is room at 1, 0.
  Passage gate "the yard gate" is path between yard and lane.
  Passage door "the back door" is path between yard and kitchen.
  Thing well "the well" at yard { State full "The well is full.". Change draw "Draw a bucket" from full to full. }
  Thing pail "a pail" at yard { State dry "A dry pail.". State wet "A wet pail.".
    Change dip "Dip the pail" from dry to wet. }
  Thing bench "a bench" at yard { State bare "A bench.". State swept "A swept bench.".
    Change sweep "Sweep the bench" from bare to swept. }
  Thing hatch "a hatch" at yard { State shut "A hatch, shut.". State open "A hatch, open.".
    Change lift "Lift the hatch" from shut to open. }
  Person dog "Fly" at yard { Role "the yard dog". Species dog. Peaceable. }
  Person wat "Wat" at yard { Role "the carter". Ancestry human. Peaceable. Pronouns he. }
  Company party "You" of 1 at yard.`;

describe('the page\'s four', () => {
  it('are the engine\'s offer, the terminal\'s four, drawn as the numbered rows', async () => {
    const t = await Tiny.start(yard, { horizon: ['probing'] });
    const frame = MenuTree.framed({ screen: t.screen, leaf: t.leaf } as unknown as Frame);
    const menu = MenuModel.build(frame, 'here', []);
    const app = { state: { frame, open: [], keyed: false, cursor: 0 }, menu, props: { query: new URLSearchParams() },
      choose: () => undefined } as unknown as ReaderApp;
    const four = GlanceStage.offered(app)!;
    expect(four.map(a => a.choice)).toEqual(t.glance.offer!.primary.map(o => o.choice));
    expect(four).toHaveLength(4);
    const html = renderToStaticMarkup(createElement(GlanceStage.Acts, { app, draw: Act.draw(app), acts: four }));
    const rows = [...html.matchAll(/<li data-promoted="(\d)"[^>]*>[\s\S]*?data-act="([^"]+)"/g)].map(m => [m[1], m[2]]);
    expect(rows.map(r => r[0])).toEqual(['1', '2', '3', '4']);
    // Each row does the act offered: its own choice, or the command where the menu has none of its own; a thing's look
    // is the act it leads with, one of the thing's own (the owner, 15 November), as the terminal's is.
    const offered = t.glance.offer!.primary;
    // A fold is the one act it leads with, one of its own (no compound menu: "Wait a while" waits a while).
    const does = rows.map((r, i) => /#look$/.test(offered[i]!.choice)
      ? r[1]!.startsWith(offered[i]!.choice.replace(/#look$/, '/'))
      : r[1] === offered[i]!.choice || r[1]!.startsWith(`${offered[i]!.choice}/`));
    expect(does).toEqual(offered.map(() => true));
    // And the terminal leads with the same four, by the commands they do, an opener by its own id (TB-12; the page's
    // four press as Doable's rows do, GlanceStage.acted: see test/small/one-projection).
    // (One with a single act under it is that act: the well's look, drawing a bucket.)
    const listed = offered.map(o => {
      const c = MenuModel.lead(menu, o.choice), kids = c?.children ?? [];
      return c && !c.command && kids.length ? kids.length === 1 && kids[0]!.command ? kids[0]!.command : o.choice
        : o.command ?? o.choice;
    });
    expect(TerminalDoable.led(t.glance, t.screen)).toEqual(listed);
  });
});
