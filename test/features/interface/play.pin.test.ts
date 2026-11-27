import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Tiny } from '../../support/tiny';
import { FirstChoice } from '../../../src/creation/first-choice';
import { TerminalPlay } from '../../../src/cli/terminal-play';
import { TerminalSlots } from '../../../src/cli/terminal-slots';
import { CheckpointStore } from '../../../src/session/checkpoint-store';
import { TitlePage } from '../../../web/reader/title-page';
import { ComposedRow } from '../../../web/reader/creation/composed-row';
import { PrologueStage } from '../../../web/reader/stage/prologue-stage';
import { PressGuard } from '../../../web/reader/press-guard';

// Feature pins: see test/features/choice/consequence.pin.test.ts. The first minute's interface (the owner, 23
// November; BRIEF §3.1; the playtests of 23-24 November, OR-300; OR-1072, 26 November): the title's ways in, Continue
// a game still going and New Game, each its own row; then one question, Create a character or a life at once, and
// where a country is kept, in which world; and nothing on the way in is held (OR-169).
describe('Interface › Ways in', () => {
  it('offers New Game alone with nothing kept; New Game and Continue over a kept game', () => {
    expect(FirstChoice.title().cards.map(c => [c.id, c.name])).toEqual([['begin', 'New Game']]);
    const kept = FirstChoice.title({ where: 'The lane', when: 'Morning, the first day', seed: 'bakelo' });
    // New Game at the top (OR-1683), the keys on it; Continue says where and when the game kept was left.
    expect(kept.cards.map(c => [c.id, c.name])).toEqual([['begin', 'New Game'], ['continue', 'Continue']]);
    expect([kept.chosen, kept.cards[1]!.said]).toEqual(['begin', 'Continue: The lane · Morning, the first day']);
    // New Game begins in a country never seen, and asks no map (OR-1271); where a game is kept, each act that sets
    // out says that it is replaced then, and with none kept nothing is said of one.
    const over = FirstChoice.step({ kept: 'bakelo' }), none = FirstChoice.step();
    expect(over.cards.map(c => c.id)).toEqual(['build', 'set-out-now', 'back']);
    expect(over.cards.filter(c => c.id !== 'back').every(c => /saved game is replaced as this life sets out/.test(c.say ?? '')))
      .toBe(true);
    expect(none.cards.some(c => /saved game/.test(c.say ?? ''))).toBe(false);
    // A game that has ended is not taken up again; one refused is not offered, and why is said plainly.
    expect(FirstChoice.title({ where: 'The lane', ended: true, seed: 'bakelo' }).chosen).toBe('begin');
    const refused = FirstChoice.title({ seed: 'bakelo', refused: 'no such world' });
    expect(refused.cards.map(c => c.id)).toEqual(['begin']);
    expect(refused.told).toMatch(/^The game kept here cannot be opened by this edition.*\(no such world\)$/);
  });
  it('then asks one thing: create a character, or a new life at once, never which map (OR-1271)', () => {
    expect(FirstChoice.step().cards.map(c => c.id)).toEqual(['build', 'set-out-now', 'back']);
    expect(FirstChoice.step({ kept: 'bakelo' }).cards.map(c => c.id)).toEqual(['build', 'set-out-now', 'back']);
  });
  it('pauses a game with two ways: back to it, or Return to title', () => {
    expect(FirstChoice.paused().cards.map(c => c.name)).toEqual(['Back to the game', 'Return to title']);
  });
  it('knows the terminal\'s kept game, and refuses one it cannot open', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'kyrie-play-pin-'));
    try {
      const t = await Tiny.start(`
        Place lane "the lane" is room at 0, 0 outdoors.
        Company party "You" of 1 at lane.`);
      const store = TerminalSlots.store(join(dir, 'slots.json'));
      expect(TerminalPlay.kept(store)).toEqual({});
      store.write(CheckpointStore.autosave, t.session.checkpoint());
      const { session, kept } = TerminalPlay.kept(store);
      expect(FirstChoice.title(kept).cards.map(c => c.id)).toEqual(['begin', 'continue']);
      expect(session?.campaign.world.one('at', 'party')).toBe('t__lane');
      const broken = TerminalSlots.store(join(dir, 'broken.json'));
      broken.write(CheckpointStore.autosave, { ...t.session.checkpoint(), save: {} } as never);
      const refused = TerminalPlay.kept(broken);
      expect(refused.session).toBeUndefined();
      expect(FirstChoice.title(refused.kept).cards.map(c => c.id)).toEqual(['begin']);
      expect(FirstChoice.title(refused.kept).told).toMatch(/^The game kept here cannot be opened/);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
});
describe('Interface › No long presses on the way in', () => {
  it('holds nothing on the title, how a game begins, creation\'s rows or the opening\'s Continue', () => {
    const app = (phase: string) => ({ state: { phase }, props: { query: new URLSearchParams() },
      opening: { way: () => undefined, kept: () => undefined, beginAs: () => undefined, where: () => ({}) } }) as never;
    const drawn = [renderToStaticMarkup(createElement(TitlePage.View, { app: app('title') })),
      renderToStaticMarkup(createElement(TitlePage.View, { app: app('begin') })),
      renderToStaticMarkup(createElement(ComposedRow.View, { option: { id: 'human', name: 'Human' },
        onConsider: () => undefined, onChoose: () => undefined })),
      renderToStaticMarkup(createElement(PrologueStage.Continue, { action: 'go-on', label: 'Go on…',
        then: () => undefined }))];
    expect(drawn.map(html => html.includes('data-action') || html.includes('data-option'))).toEqual([true, true, true, true]);
    expect(drawn.filter(html => /data-hold|Hold to/.test(html))).toEqual([]);
  });
  it('takes every press at once, a quick second tap on the page just drawn among them', () => {
    let taken = 0;
    const row = PressGuard.once(() => { taken++; });
    // A click, the keys or an assistive technology (detail 0), and a tap the browser counts as a double's second.
    row.onClick(); row.onClick(); row.onClick();
    expect(taken).toBe(3);
  });
});
