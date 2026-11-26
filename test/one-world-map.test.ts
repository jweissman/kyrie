import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import type { PlaySession } from '../src/session/play-session';
import { ReaderApp, type AppState } from '../web/reader/reader-app';
import { Stage } from '../web/reader/stage/stage';
import { Glanced } from './support/glanced';
import { GoldenWalk } from './support/golden-walk';

// The world map offered once (the owner's playtest of 20 November, P0: "I'm seeing three distinct 'open the world
// map' action offers … it has me losing faith in what I'm seeing"). A journey the four lead with across the country
// opens the map at where it goes, in its own words (DoableJourneys: chart); the page had drawn it in the world map's
// own row's words beside that row, on the road between Reedbridge and Wrackham. At every turn of the warrior's walk
// and of a1's first acts, in the place and in each of its lenses, at most one row says "Open the world map".
function app(session: PlaySession, extra: Partial<AppState> = {}): ReaderApp {
  const a = Object.create(ReaderApp.prototype) as ReaderApp & { props: unknown; state: AppState };
  a.props = { query: new URLSearchParams() };
  a.state = { phase: 'play', options: { size: 'usual', rolls: 'shown' }, campaign: '', seed: '', party: [], editing: -1,
    view: 'here', cursor: 0, open: [], attention: { kind: 'place' }, talk: [], asked: [], member: '', stage: '',
    error: '', help: false, frame: Glanced.of(session).frame(), ...extra } as AppState;
  return a;
}
function maps(session: PlaySession): number {
  return Math.max(...[{}, { exploring: 'go' as const }, { exploring: 'look' as const }, { talking: true }].map(extra => {
    const html = renderToStaticMarkup(createElement(Stage.View, { app: app(session, extra) }));
    return [...html.matchAll(/<(button|a)\b[^>]*>([\s\S]*?)<\/\1>/g)]
      .filter(m => /^Open the world map/.test(m[2]!.replace(/<[^>]+>/g, '').trim())).length;
  }));
}
describe('the world map, offered', () => {
  it('once at most, at every turn of the warrior\'s walk', async () => {
    const lines = readFileSync('doc/architecture/mission-22/golden/warrior-walk.txt', 'utf8').split('\n')
      .filter(l => l.trim() && !l.startsWith('#'));
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session), over: string[] = [];
    for (const [turn, line] of lines.entries()) {
      if (maps(journey.session) > 1) { over.push(`${turn}: ${journey.session.campaign.world.one('at', 'party')}`); }
      await r.ask(line);
    }
    expect(over).toEqual([]);
  }, 300000);
  it('once at most, over a1\'s first acts', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'a1']));
    const r = new Runner(journey.session), over: string[] = [];
    for (let turn = 0; turn < 20; turn++) {
      if (maps(journey.session) > 1) { over.push(`${turn}: ${journey.session.campaign.world.one('at', 'party')}`); }
      const next = r.said().offer.primary[0];
      if (!next) { break; }
      await r.ask(JSON.stringify({ act: next.id }));
    }
    expect(over).toEqual([]);
  }, 300000);
});
