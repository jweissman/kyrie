import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tiny } from '../support/tiny';
import { Terminal } from '../../src/cli/terminal';
import { MenuModel } from '../../web/reader/menu-model';
import type { Frame } from '../../web/engine/protocol';
import type { ReaderApp } from '../../web/reader/reader-app';
import { Act } from '../../web/reader/stage/act';
import { GlanceStage } from '../../web/reader/stage/glance';

// The page's four are the engine's four (the owner, 14 November: TB-02, "four promoted, everywhere", and the terminal
// and the page agreeing on which four): the scene at rest draws the glance's offer as its numbered rows, one to four,
// each by the act it does (data-act), the same four the terminal leads with, whether or not the page's menu has a
// choice of its own for it (talking to someone here, which the page otherwise draws by their likeness). The yard of
// test/small/offer-four, with a well, a dog, a carter, a gate and a door.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 0, 1 outdoors.
  Place kitchen "the kitchen" is room at 1, 0.
  Passage gate "the yard gate" is path between yard and lane.
  Passage door "the back door" is path between yard and kitchen.
  Thing well "the well" at yard { State full "The well is full.". Change draw "Draw a bucket" from full to full. }
  Person dog "Fly" at yard { Role "the yard dog". Species dog. Peaceable. }
  Person wat "Wat" at yard { Role "the carter". Ancestry human. Peaceable. Pronouns he. }
  Company party "You" of 1 at yard.`;

describe('the page\'s four', () => {
  it('are the engine\'s offer, the terminal\'s four, drawn as the numbered rows', async () => {
    const t = await Tiny.start(yard), frame = { screen: t.screen, leaf: t.leaf } as unknown as Frame;
    const menu = MenuModel.build(frame, 'here', []);
    const app = { state: { frame, open: [], keyed: false, cursor: 0 }, menu, props: { query: new URLSearchParams() },
      choose: () => undefined } as unknown as ReaderApp;
    const four = GlanceStage.offered(app)!;
    expect(four.map(a => a.choice)).toEqual(t.glance.offer!.primary.map(o => o.choice));
    expect(four).toHaveLength(4);
    const html = renderToStaticMarkup(createElement(GlanceStage.Acts, { app, draw: Act.draw(app), acts: four }));
    const rows = [...html.matchAll(/<li data-promoted="(\d)"[^>]*>[\s\S]*?data-act="([^"]+)"/g)].map(m => [m[1], m[2]]);
    expect(rows.map(r => r[0])).toEqual(['1', '2', '3', '4']);
    // Each row does the act offered: its own choice, or the command where the menu has none of its own.
    const offered = t.glance.offer!.primary;
    expect(rows.map(r => r[1])).toEqual(offered.map(o => o.choice));
    // And the terminal leads with the same four, by the commands they do.
    expect(Terminal.led(t.glance, t.screen)).toEqual(offered.map(o => o.command ?? o.choice));
  });
});
