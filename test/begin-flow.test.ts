import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EngineHost } from '../web/engine/engine-host';
import { FirstChoice, type Way } from '../src/creation/first-choice';
import type { Request } from '../src/creation/protocol';
import { ReaderOpening } from '../web/reader/reader-opening';
import type { ReaderApp, AppState } from '../web/reader/reader-app';
import { TitlePage } from '../web/reader/title-page';
import { BeginMenu } from '../web/reader/begin-menu';
import { Shell } from '../web/reader/shell';
import { ReaderStore, type SavedGame } from '../web/reader/reader-store';

// OR-120, OR-160 and OR-300, as the page plays it, headless: the title's ways in, how the game begins (the engine's
// question, two rows), a life at once, and play. A page object over the reader's own opening (ReaderOpening) and its
// pages as they render, with the engine in process and asked as the worker is (each request and its answer passed as
// a message would be): every press by the action id the page draws, never a row's place or its words. With no game
// kept the title draws New Game alone; pressed, its rows are drawn at once, the engine asked nothing (the
// country drawn already, while the title showed); a life at once asks for that country and sets out rolled, and the
// page is in play in the country drawn ahead. A kept game this build cannot open is refused and said, never migrated.
// The title's rows after its ways in: Options and Quit, the engine's too (OpeningPages.title, OR-382, OR-1072).
const apart = ['options', 'quit'];
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
    const row = this.state.phase === 'begin' ? BeginMenu.rows(this as unknown as ReaderApp).find(r => r.id === id)
      : undefined;
    if (row) { row.go(); } else { this.opening.way(id as Way); }
  }
  // The countries drawn ahead, once the nth has been asked for: the seed a new life rolls is the engine's (FreshSeeds,
  // asked as { kind: 'seed' }), so the page names it to be drawn ahead a moment after the title or the question is up.
  async aheads(n: number): Promise<string[]> {
    const aheads = () => this.asked.filter(r => r.kind === 'ahead').map(r => (r as { seed: string }).seed);
    for (let i = 0; i < 400 && aheads().length < n; i++) { await new Promise(r => setTimeout(r, 25)); }
    return aheads();
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
    expect(page.actions()).toEqual(['begin', ...apart]);
    await page.aheads(1);
    const ahead = page.asked.find(r => r.kind === 'ahead');
    expect(ahead).toBeDefined();
    page.press('begin');
    // At once: the engine's question in its two rows, by their ids, each its words and no icon; nothing asked of
    // the engine for them.
    const before = page.asked.length;
    expect(page.mode()).toBe('begin');
    expect(page.actions()).toEqual(FirstChoice.step().cards.map(c => c.id));
    expect(page.actions()).toEqual(['build', 'set-out-now', 'back']);
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
  // OR-770: the seed a new life rolls is asked of the engine; Set out now pressed before it has come sets out in the
  // country that seed names, the one drawn ahead, never a second roll.
  it('sets out in the country drawn ahead, though chosen before its seed has come', async () => {
    spyOn(Shell, 'had').mockResolvedValue(undefined);
    const page = new Page();
    await page.opening.boot();
    page.press('begin'); page.press('set-out-now');
    await page.until('play');
    const [seed] = await page.aheads(1);
    expect(page.asked.filter(r => r.kind === 'seed')).toHaveLength(1);
    expect(page.asked.find(r => r.kind === 'world')).toMatchObject({ seed });
    expect(page.state.frame?.transcript.seed).toBe(seed);
    await page.host.idle();
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
    // Back to the title, and New Game: asked at once, a country drawn for it by a seed of its own (the kept game
    // names no seed of its own here).
    page.opening.title();
    expect(page.actions()).toEqual(['begin', 'continue', ...apart]);
    page.press('begin');
    expect(page.mode()).toBe('begin');
    await page.aheads(2);
    expect(aheads()).toHaveLength(2);
    expect(aheads()[1]).not.toBe(first);
    // Escape, and Play: the kept game, in its own country.
    page.opening.title();
    page.press('continue');
    await page.until('play');
    expect(page.state.frame!.transcript.seed).toBe(first);
    // And a new life again: rolled afresh, not asked of the country let go as the game was opened.
    page.opening.title(); page.press('begin');
    await page.aheads(3);
    expect(aheads()).toHaveLength(3);
    expect(new Set(aheads()).size).toBe(3);
    await page.host.idle();
  }, 180000);
  // OR-300: a kept game this build cannot open is tried once, refused, and said plainly on the title; Continue goes,
  // and New Game (in its country, by its seed, or a new one) remains. Nothing is migrated.
  it('refuses a kept game it cannot open, says so on the title, and offers a new game', async () => {
    const refused: string[] = [];
    spyOn(ReaderStore, 'refuse').mockImplementation(r => { refused.push(r); });
    const page = new Page();
    page.savedGame = { text: 'not a kept game', title: 'Kyr', where: 'The lane', when: 'Morning', company: 'Aud',
      seed: 'bakelo' };
    await page.opening.boot();
    // Kept and still going: Continue under New Game (OR-1683), and nothing is drawn ahead for a new game meanwhile.
    expect(page.actions()).toEqual(['begin', 'continue', ...apart]);
    expect(page.asked.some(r => r.kind === 'ahead')).toBe(false);
    page.press('continue');
    for (let i = 0; i < 400 && page.state.phase !== 'title'; i++) { await new Promise(r => setTimeout(r, 25)); }
    // Not opened: the title again, Continue gone, why said in the engine's line, and remembered beside the game.
    expect(page.mode()).toBe('title');
    expect(page.actions()).toEqual(['begin', ...apart]);
    expect(page.html()).toContain('data-id="refused"');
    expect(page.html()).toContain('cannot be opened by this edition');
    expect(refused).toHaveLength(1);
    expect(page.state.error).toBe('');
    // New Game: a new life in a country never seen, not the kept game's (OR-1271).
    page.press('begin');
    expect(page.mode()).toBe('begin');
    const aheads = await page.aheads(1);
    expect(aheads[0]).not.toBe('bakelo');
    await page.host.idle();
  }, 120000);
  // OR-1271: no map asked: New Game draws a country never seen, and the act that sets out says, in its own words, that
  // the saved game is replaced then; it is let go, its seed remembered, only as the new life sets out.
  it('draws a country of its own for a new life, and lets the kept game go only as the new life sets out', async () => {
    const forgot: string[] = [];
    spyOn(ReaderStore, 'forget').mockImplementation(seed => { forgot.push(seed); });
    const page = new Page();
    page.savedGame = { text: 'kept', title: 'Kyr', where: 'The lane', when: 'Morning', company: 'Aud', seed: 'bakelo' };
    await page.opening.boot();
    page.press('begin');
    expect(page.mode()).toBe('begin');
    expect(page.actions()).toEqual(['build', 'set-out-now', 'back']);
    expect(page.html()).toContain('Your saved game is replaced as this life sets out.');
    const seeds = await page.aheads(1);
    expect(seeds[0]).not.toBe('bakelo');
    expect(forgot).toEqual([]);
    page.press('build');
    await page.until('company');
    expect(forgot).toEqual(['bakelo']);
    expect(page.state.seed).toBe(seeds[0]!);
    await page.host.idle();
  }, 120000);
  it('builds a character in the same country, by the other row', async () => {
    const page = new Page();
    await page.opening.boot();
    await page.aheads(1);
    const seed = (page.asked.find(r => r.kind === 'ahead') as Extract<Request, { kind: 'ahead' }>).seed;
    page.press('begin');
    page.press('build');
    await page.until('company');
    expect([page.state.seed, page.state.creation?.at]).toEqual([seed, page.state.creation?.steps[0]?.id]);
    await page.host.idle();
  }, 120000);
});
