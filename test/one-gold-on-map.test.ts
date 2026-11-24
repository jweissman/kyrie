import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import type { PlaySession } from '../src/session/play-session';
import { ReaderApp, type AppState } from '../web/reader/reader-app';
import { MapMenu } from '../web/reader/map-menu';
import { Glanced } from './support/glanced';
import { GoldenWalk } from './support/golden-walk';

// One gold on the map's menu (the owner's playtest of 20 November, OR-161: "I was seeing gold both for a travel option
// and put away the map"). Putting the map away had taken the scene's own gold (SceneRail.local) beside a journey of
// the map's that was the aim's. At every turn of the warrior's walk, the map's menu draws at most one row in gold.
function app(session: PlaySession): ReaderApp {
  const a = Object.create(ReaderApp.prototype) as ReaderApp & { props: unknown; state: AppState };
  a.props = { query: new URLSearchParams() };
  a.state = { phase: 'play', options: { size: 'usual', rolls: 'shown' }, campaign: '', seed: '', party: [], editing: -1,
    view: 'map', cursor: 0, open: [], attention: { kind: 'place' }, talk: [], asked: [], member: '', stage: '',
    error: '', help: false, frame: Glanced.of(session).frame() } as AppState;
  return a;
}
function golds(session: PlaySession): string[] {
  const a = app(session), screen = a.state.frame!.screen;
  const html = renderToStaticMarkup(createElement(MapMenu.View, { app: a, screen, put: () => undefined }));
  return [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].filter(m => m[0].includes('--tone-gold'))
    .map(m => m[1]!.replace(/<[^>]+>/g, '').trim());
}
describe('the map\'s menu', () => {
  it('draws at most one gold, at every turn of the warrior\'s walk', async () => {
    const lines = readFileSync('doc/architecture/mission-22/golden/warrior-walk.txt', 'utf8').split('\n')
      .filter(l => l.trim() && !l.startsWith('#'));
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session), over: string[] = [];
    let seen = 0;
    for (const [turn, line] of lines.entries()) {
      const gold = golds(journey.session);
      seen += gold.length ? 1 : 0;
      if (gold.length > 1) { over.push(`${turn}: ${gold.join(' | ')}`); }
      await r.ask(line);
    }
    expect(over).toEqual([]);
    // And the aim's gold is there to be seen on the map at some turn of the walk (the measure is not vacuous).
    expect(seen).toBeGreaterThan(0);
  }, 300000);
});
