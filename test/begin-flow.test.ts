import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EngineHost } from '../web/engine/engine-host';
import { FirstChoice } from '../src/creation/first-choice';
import type { Request } from '../src/creation/protocol';
import { ReaderOpening } from '../web/reader/reader-opening';
import type { ReaderApp, AppState } from '../web/reader/reader-app';
import { TitlePage } from '../web/reader/title-page';
import { BeginMenu } from '../web/reader/begin-menu';
import { Shell } from '../web/reader/shell';
import type { SavedGame } from '../web/reader/reader-store';

// OR-120 and OR-160, as the page plays it, headless: the title, Play, how the game begins (the engine's question, two
// rows), We enter the world as we are, and play. A page object over the reader's own opening (ReaderOpening) and its
// pages as they render, with the engine in process and asked as the worker is (each request and its answer passed as
// a message would be): every press by the action id the page draws, never a row's place or its words. The title draws
// Play alone; with no game kept, pressed, the two rows are drawn at once, the engine asked nothing (the country drawn
// already, while the title showed); We enter the world as we are asks for that country and sets out rolled, and the
// page is in play in the country drawn ahead. A kept game Play cannot open goes on to a new game, never nowhere.
class Page {
  state = { phase: 'title', options: {}, campaign: '', seed: '', party: [], editing: -1, view: 'here', cursor: 0,
    open: [], member: '', stage: '', error: '' } as unknown as AppState;
  readonly props = { query: new URLSearchParams() };
  savedGame?: SavedGame;
  readonly asked: Request[] = [];
  readonly host = new EngineHost(() => undefined);
  readonly engine = { request: this.request.bind(this) };
  readonly opening = new ReaderOpening(this as unknown as ReaderApp);
  setState(patch: Partial<AppState>) { this.state = { ...this.state, ...patch }; }
  private async request(r: Request): Promise<unknown> {
    this.asked.push(structuredClone(r));
    return structuredClone(await this.host.handle(structuredClone(r)));
  }
  // The page as drawn now: its mode and the actions it offers, by id.
  html(): string { return renderToStaticMarkup(createElement(TitlePage.View, { app: this as unknown as ReaderApp })); }
  mode(): string { return /data-mode="([^"]+)"/.exec(this.html())?.[1] ?? ''; }
  actions(): string[] {
    const nav = /<nav class="title-menu[^"]*"[^>]*>(.*?)<\/nav>/s.exec(this.html())?.[1] ?? '';
    return [...nav.matchAll(/<(?:button|a) [^>]*data-action="([^"]+)"/g)].map(m => m[1]!);
  }
  // A press on the action by its id, as its row is bound: the title's ways in (TitlePage), how a game begins
  // (BeginMenu.rows).
  press(id: string) {
    expect(this.actions()).toContain(id);
    const title: Record<string, () => void> = { begin: this.opening.play, continue: this.opening.play };
    const row = this.state.phase === 'begin' ? BeginMenu.rows(this as unknown as ReaderApp).find(r => r.id === id)
      : undefined;
    (row?.go ?? title[id]!)();
  }
  async until(phase: AppState['phase'], error = '') {
    for (let i = 0; i < 1200 && this.state.phase !== phase; i++) { await new Promise(r => setTimeout(r, 50)); }
    expect(this.state.error).toBe(error);
    expect(this.state.phase).toBe(phase);
  }
}

describe('a new game, set out on at once', () => {
  afterEach(() => { mock.restore(); });
  it('asks how it begins in two rows, and Set out now goes into the country drawn while the title showed', async () => {
    spyOn(Shell, 'had').mockResolvedValue(undefined);
    const page = new Page();
    await page.opening.boot();
    // The title: its ways in, and the country a new game will begin in asked for behind it, by its seed.
    expect(page.mode()).toBe('title');
    expect(page.html()).toContain('class="mark"');
    expect(page.actions()).toEqual(['begin']);
    const ahead = page.asked.find(r => r.kind === 'ahead');
    expect(ahead).toBeDefined();
    page.press('begin');
    // At once: the engine's question in its two rows, by their ids, each its words and no icon; nothing asked of
    // the engine for them.
    const before = page.asked.length;
    expect(page.mode()).toBe('begin');
    expect(page.actions()).toEqual(FirstChoice.step().cards.map(c => c.id));
    expect(page.actions()).toEqual(['build', 'set-out-now']);
    const html = page.html();
    for (const card of FirstChoice.step().cards) { expect(html).toContain(card.name); }
    // The name is the title page's alone: the question stands by itself (OR-160), so nothing above it moves.
    expect(html).not.toContain('class="mark"');
    expect(html).not.toContain('class="lede"');
    expect(/<nav class="title-menu begin-menu".*?<\/nav>/s.exec(html)?.[0]).not.toContain('<svg');
    expect(page.asked.length).toBe(before);
    await page.host.idle();
    page.press('set-out-now');
    await page.until('play');
    // The country drawn ahead, by the seed the title named, set out on rolled.
    const seed = (ahead as Extract<Request, { kind: 'ahead' }>).seed;
    expect(page.asked.slice(before).map(r => r.kind)).toEqual(['world', 'creation', 'set-out']);
    expect(page.asked.at(-1)).toMatchObject({ kind: 'set-out', rolled: true });
    expect(page.asked.find(r => r.kind === 'world')).toMatchObject({ seed });
    expect([page.state.seed, page.state.frame?.transcript.seed]).toEqual([seed, seed]);
    expect(page.state.frame?.screen.place.name).toBeTruthy();
  }, 120000);
  // The roll made while the title shows (AX-04, OR-23) never crosses a life: a new life begun from a game in play is
  // rolled afresh, by a seed of its own; the kept game taken up again is its own country, never the roll; and a new
  // life after that is rolled afresh again (the page had kept a seed the engine let go of as the game was opened).
  it('rolls each new life afresh, and a game taken up again never meets the roll', async () => {
    spyOn(Shell, 'had').mockResolvedValue(undefined);
    const page = new Page();
    await page.opening.boot();
    const aheads = () => page.asked.filter(r => r.kind === 'ahead').map(r => (r as { seed: string }).seed);
    await page.host.idle();
    page.press('begin'); page.press('set-out-now');
    await page.until('play');
    const first = page.state.frame!.transcript.seed;
    expect(aheads()).toEqual([first]);
    page.savedGame = { text: await page.engine.request({ kind: 'checkpoint' }) as string, title: 'Kyr', where: 'Here',
      when: 'Now', company: 'You' };
    // Begin a new life: asked at once, a country drawn for it by a seed of its own.
    page.opening.leave();
    expect(page.mode()).toBe('begin');
    expect(aheads()).toHaveLength(2);
    expect(aheads()[1]).not.toBe(first);
    // Escape, and Play: the kept game, in its own country.
    page.opening.title();
    page.press('continue');
    await page.until('play');
    expect(page.state.frame!.transcript.seed).toBe(first);
    // And a new life again: rolled afresh, not asked of the country let go as the game was opened.
    page.opening.leave();
    expect(aheads()).toHaveLength(3);
    expect(new Set(aheads()).size).toBe(3);
    await page.host.idle();
  }, 180000);
  it('goes on from a kept game Play cannot open to how a new game begins, and says why', async () => {
    const page = new Page();
    page.savedGame = { text: 'not a kept game', title: 'Kyr', where: 'The lane', when: 'Morning', company: 'Aud' };
    await page.opening.boot();
    // Kept and still going: Play continues it, and nothing is drawn ahead for a new game meanwhile.
    expect(page.actions()).toEqual(['continue']);
    expect(page.asked.some(r => r.kind === 'ahead')).toBe(false);
    page.press('continue');
    // Not opened: how a new game begins, at once, why said in a line; and the country for it drawn meanwhile.
    for (let i = 0; i < 400 && page.state.phase !== 'begin'; i++) { await new Promise(r => setTimeout(r, 25)); }
    expect(page.mode()).toBe('begin');
    expect(page.state.error).toStartWith('The game kept here could not be taken up, so a new one begins.');
    expect(page.asked.some(r => r.kind === 'ahead')).toBe(true);
    // Back at the title (Escape), Play no longer offers the game that would not open: it begins.
    page.opening.title();
    expect(page.actions()).toEqual(['begin']);
    await page.host.idle();
  }, 120000);
  it('builds a character in the same country, by the other row', async () => {
    const page = new Page();
    await page.opening.boot();
    const seed = (page.asked.find(r => r.kind === 'ahead') as Extract<Request, { kind: 'ahead' }>).seed;
    page.press('begin');
    page.press('build');
    await page.until('company');
    expect([page.state.seed, page.state.creation?.at]).toEqual([seed, page.state.creation?.steps[0]?.id]);
    await page.host.idle();
  }, 120000);
});
