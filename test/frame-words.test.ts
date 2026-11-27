import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import type { PlaySession } from '../src/session/play-session';
import { Worded, type Unworded } from '../src/presentation/worded';
import type { Attention } from '../src/ui/attention';
import type { Choice } from '../src/ui/choice-list';
import { ReaderApp, type AppState } from '../web/reader/reader-app';
import { MenuTree } from '../src/frame/menu-tree';
import { MenuModel } from '../src/frame/menu-model';
import { Stage } from '../web/reader/stage/stage';
import { ChoiceRow } from '../web/reader/stage/choice-row';
import { RowWords } from '../web/reader/stage/row-words';
import { Glanced } from './support/glanced';

// Every selectable action has words a player can read (the owner's play of the deployed build, 20 November, P0: "the
// game displayed a selectable menu action with no visible text … the action for inviting my brother to join the
// company. The action apparently executed"). Held at the player's frame, by what each action is called at each stage
// the engine hands a client (Worded: the screen's acts, the glance's four, offer and lenses, Doable's rows), by every
// choice the page's menu makes of it (MenuModel, at the place, with each person and each thing, trading, the pack),
// and by the page drawn (Stage.View, rendered as the page renders it): no row is drawn without words (RowWords, the
// one gate every row passes), under test a refusal that names the act and where it was drawn.
type Asked = Said | { error: string };
const said = (x: Asked): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
// The page drawn attending to the place, a thing, or someone talked with (the engine's question asked of the frame,
// its wares open or not: OR-1451).
function app(session: PlaySession, attention: Attention, extra: Partial<AppState> & { trading?: boolean } = {}):
  ReaderApp {
  const a = Object.create(ReaderApp.prototype) as ReaderApp & { props: unknown; state: AppState };
  const { trading = false, ...rest } = extra, frame = Glanced.of(session).frame();
  const question = attention.kind === 'person'
    ? MenuTree.question(frame, { kind: 'talk', with: attention.id, page: 0, trading }) : undefined;
  a.props = { query: new URLSearchParams() };
  a.state = { phase: 'play', options: { size: 'usual', rolls: 'shown' }, campaign: '', seed: '', party: [], editing: -1,
    view: 'here', cursor: 0, open: [], ...attention.kind === 'thing' ? { examined: attention.id } : {}, member: '',
    stage: '', error: '', help: false, frame: question ? { ...frame, question } : frame, ...rest } as AppState;
  return a;
}
// The page's rules, each selector with whether it sizes what it selects.
const sizing = readdirSync('web/reader').filter(f => f.endsWith('.css'))
  .flatMap(f => [...readFileSync(`web/reader/${f}`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    .matchAll(/([^{}]+)\{([^}]*)\}/g)].filter(m => /(^|;|\s)width\s*:/.test(m[2]!)).map(m => m[1]!.trim()));
// Every glyph drawn inside a row is sized there by a rule that reaches it in a row, never left at an svg's own 300 by
// 150, which pushes the row's words out of it (the brother's asking to join, drawn blank: the companion's glyph had a
// size only among the four, .led-act). By class: a rule naming it in a row (.choice-row), or alone, or by a class of
// the row it is in (.led-act among the four, .portrait).
function unsized(html: string): string[] {
  const out = new Set<string>();
  for (const b of html.matchAll(/<button\b[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/button>/g)) {
    for (const g of b[2]!.matchAll(/<svg\b[^>]*class="([^"]*)"/g)) {
      const cls = g[1]!.split(' ')[0]!, row = b[1]!.split(' ');
      const reached = sizing.some(sel => sel.includes(`.${cls}`) && (sel.includes('.choice-row') || sel === `.${cls}`
        || row.some(r => r !== 'act' && new RegExp(`\\.${r}(?![\\w-])`).test(sel))));
      if (!reached) { out.add(`${cls} in ${b[1]}`); }
    }
  }
  return [...out];
}
function leaves(cs: Choice[]): Choice[] { return cs.flatMap(c => [c, ...leaves(c.children ?? [])]); }
// Whatever at this turn has no words, by stage: the engine's frame, the page's menu, the page drawn.
function unworded(session: PlaySession): Unworded[] {
  const g = Glanced.of(session), frame = g.frame(), out = [...Worded.of(g.screen, g.glance)];
  const scene = MenuModel.build(frame, 'here', []).scene;
  const attentions: Attention[] = [{ kind: 'place' }, ...(scene?.subjects ?? []).map(x => ({
    kind: x.kind === 'thing' ? 'thing' as const : 'person' as const, id: x.id }))];
  for (const attention of attentions) {
    for (const trading of [false, true]) {
      for (const c of leaves(MenuModel.build(frame, 'here', [], { attention }).choices)) {
        if (!Worded.said(c.alone || c.label)) { out.push({ act: c.command ?? c.id, stage: 'MenuModel', words: c.label }); }
      }
      for (const extra of [{}, { talking: true }, { exploring: 'go' as const }, { exploring: 'look' as const }]) {
        const drawn = app(session, attention, { trading, ...extra });
        const html = renderToStaticMarkup(createElement(Stage.View, { app: drawn }));
        for (const u of unsized(html)) { out.push({ act: u, stage: 'Stage.View (an unsized glyph)', words: '' }); }
      }
    }
  }
  for (const c of leaves(MenuModel.build(frame, 'pack', []).choices)) {
    if (!Worded.said(c.alone || c.label)) { out.push({ act: c.command ?? c.id, stage: 'MenuModel pack', words: c.label }); }
  }
  return out;
}
beforeAll(() => { RowWords.strict = true; });
afterAll(() => { RowWords.strict = false; });
describe('the player\'s frame, in words', () => {
  it('refuses a row with no words, naming its act and where it was drawn', () => {
    const draw = { index: new Map(), open: new Set(), app: { state: { open: [], cursor: 0 } } };
    expect(() => renderToStaticMarkup(createElement(ChoiceRow.Button, { data: { action: 'x' }, act: 'recruit(b)',
      label: ' ' }))).toThrow('A row with no words was not drawn: recruit(b), at ChoiceRow.Button');
    const blank = { id: 'b#join', label: '', alone: '', tone: 'person', command: 'recruit(b)' } as Choice;
    RowWords.strict = false;
    expect(renderToStaticMarkup(createElement(ChoiceRow.Act, { choice: blank, draw: draw as never, label: '' }))).toBe('');
    RowWords.strict = true;
    expect(RowWords.refused.at(-1)).toEqual({ act: 'b#join', stage: 'ChoiceRow.Act' });
    expect(Worded.said('Ask Tibb Holt to join the company')).toBe(true);
    expect([' ', '—', ''].map(w => Worded.said(w))).toEqual([false, false, false]);
  });
  // The owner's case: the brother of the kin's road (a1), asked what he means to do and then to join the company.
  it('says asking the brother to join, wherever it is drawn, and every row about it, as he is recruited', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--origin', 'kin', '--as',
      'human/warrior/Wenna']));
    const session = journey.session, runner = new Runner(session);
    let s = runner.said();
    const here = () => Glanced.of(session).screen.people.some(p => p.id === 'drover__son');
    for (let t = 0; t < 8 && !here(); t++) {
      const gold = s.offer.primary.find(o => o.aspects.includes('undertaking')) ?? s.offer.primary[0]!;
      s = said(await runner.ask(JSON.stringify(gold.id.startsWith('follow:') ? { follow: gold.id.slice(7) }
        : { act: gold.id })));
      expect(unworded(session)).toEqual([]);
    }
    expect(here()).toBe(true);
    said(await runner.ask(JSON.stringify({ act: 'drover__son_plan' })));
    expect(unworded(session)).toEqual([]);
    const frame = Glanced.of(session).frame();
    const talk = MenuModel.build(frame, 'here', [], { attention: { kind: 'person', id: 'drover__son' } });
    const join = talk.choices.find(c => c.command === 'recruit(drover__son)')!;
    expect(join.alone || join.label).toBe('Ask Tibb Holt to join the company');
    const html = renderToStaticMarkup(createElement(Stage.View, { app: app(session, { kind: 'person', id: 'drover__son' }) }));
    expect(html).toContain('Ask Tibb Holt to join the company');
    said(await runner.ask(JSON.stringify({ act: 'recruit(drover__son)' })));
    expect(Glanced.of(session).screen.party.map(m => m.name)).toContain('Tibb Holt');
    expect(unworded(session)).toEqual([]);
  }, 240000);
  it('has words for every act at every turn of the golden route\'s opening (iscoed)', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const session = journey.session, runner = new Runner(session);
    let s = runner.said();
    for (let t = 0; t < 10; t++) {
      expect(unworded(session)).toEqual([]);
      const gold = s.offer.primary.find(o => o.aspects.includes('undertaking')) ?? s.offer.primary[0]!;
      s = said(await runner.ask(JSON.stringify(gold.id.startsWith('follow:') ? { follow: gold.id.slice(7) }
        : { act: gold.id })));
      for (let k = 0; s.moment === 'fight' && k < 40; k++) { s = said(await runner.ask('{"act":"fight:auto"}')); }
    }
  }, 240000);
});
