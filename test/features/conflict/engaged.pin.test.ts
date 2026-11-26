import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner } from '../../../src/cli/runner';
import type { PlaySession } from '../../../src/session/play-session';
import { Doable } from '../../../src/presentation/doable';
import { Engaged } from '../../../src/presentation/engaged';
import { MenuModel } from '../../../src/frame/menu-model';
import { MapMenu } from '../../../web/reader/map-menu';
import type { ReaderApp } from '../../../web/reader/reader-app';
import { Glanced } from '../../support/glanced';
import { GoldenWalk } from '../../support/golden-walk';

// Conflict › An engagement answered (OR-163; the owner, 17 November and 20 November late): with a live threat, the
// company may only respond to it: act on it, act on the place, flee, or stand its ground. No wait but standing, no
// search, no aim taken up, no journey beyond the hex, no world map; and on the map, Put away the map alone. The
// engine's state (Engaged, read into the frame), so the engine's rows (Doable) and the page's menu offer the same.
// a1's first danger, the rats of the corn-store's runs, and the drove's, the conger at the gate well.
class Engagement {
  // What every client is offered, and what the page draws: the engine's rows' commands and the menu's.
  static offered(s: PlaySession): { rows: string[]; menu: string[]; labels: string[]; map: string[] } {
    const g = Glanced.of(s), rows = Doable.flat(Doable.of(g.glance, g.screen)).flatMap(r => r.does ? [r.does] : []);
    const m = MenuModel.build(g.frame(), 'here', []);
    const app = { state: { frame: g.frame() }, menu: m } as unknown as ReaderApp;
    const html = renderToStaticMarkup(createElement(MapMenu.View, { app, screen: g.screen, put: () => undefined }));
    return { rows, menu: m.choices.flatMap(c => c.command ? [c.command] : []), labels: m.choices.map(c => c.label),
      map: [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(x => x[1]!.replace(/<[^>]+>/g, '').trim()) };
  }
  static answer(s: PlaySession, threat: string) {
    const o = this.offered(s);
    expect(Engaged.threat(Glanced.of(s).screen)).toBe(threat);
    for (const commands of [o.rows, o.menu]) {
      expect(commands.filter(c => /^(wait_|search|camp|sleep|follow:|travel:|view:)/.test(c)).join(' ; ')).toBe('');
      expect(commands.some(c => c.startsWith('attack(') && c.includes(threat))).toBe(true);
      expect(commands.some(c => c.startsWith('go('))).toBe(true);
    }
    expect(o.labels).toContain(Engaged.stand);
    expect(o.map).toEqual(['Something is here: put away the map']);
  }
}
describe('Conflict › An engagement answered', () => {
  it('in a1\'s corn-store runs, the rats warning: only the answers to them, and the map put away', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'a1', '--as', 'human/warrior/Aud']));
    for (const step of ['To the landing at Lowmouth', 'Read the notice', 'To Mik\'s salt-house', 'Talk to Mik',
      'Ask Mik about the rats', 'Take your leave', 'To the landing at Lowmouth', 'To the old corn-store',
      'a torch: Light', 'Down to the corn-store cellar', 'To the rat-runs']) { await j.step(step); }
    Engagement.answer(j.session, 'region__s1_u_rats');
    // Answered (the rats beaten), the company carries on as before: its waits, its search, its aims again.
    await j.step('Attack');
    const after = Engagement.offered(j.session);
    expect(after.rows.some(c => c.startsWith('wait_'))).toBe(true);
  }, 120000);
  it('at the drove\'s gate well, the conger warning: the same', async () => {
    // The walk up to its coming down the gate-well's ladder by night, where the conger warns.
    const all = GoldenWalk.lines(), lines = all.slice(0, all.indexOf('{"act":"go(gate__well_ladder,gate__well)"}') + 1);
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session);
    for (const line of lines) { await r.ask(line); }
    Engagement.answer(journey.session, 'gate__conger');
  }, 300000);
});
