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
// November; BRIEF §3.1): the title says only Play, which takes up a game still going or else asks one question, Create
// a character or We enter the world as we are; and nothing on the way in is held (OR-160, OR-169).
describe('Interface › Play', () => {
  it('is the title\'s one way in: it continues a game kept and still going, and otherwise begins', () => {
    expect(FirstChoice.title().cards.map(c => [c.id, c.name])).toEqual([['begin', 'Play']]);
    const kept = FirstChoice.title({ where: 'The lane', when: 'Morning, the first day' });
    expect(kept.cards.map(c => [c.id, c.name, c.said])).toEqual([['continue', 'Play',
      'Play: continue, The lane · Morning, the first day']]);
    // A game that has ended is not taken up again: Play begins anew over it.
    expect(FirstChoice.title({ where: 'The lane', ended: true }).chosen).toBe('begin');
  });
  it('then asks one thing: create a character, or enter the world as we are', () => {
    expect(FirstChoice.step().cards.map(c => c.name)).toEqual(['Create a character', 'We enter the world as we are']);
  });
  it('takes up the terminal\'s kept game while it is going, and from one that cannot be opened begins, saying why',
    async () => {
      const dir = await mkdtemp(join(tmpdir(), 'kyrie-play-pin-'));
      try {
        const t = await Tiny.start(`
          Place lane "the lane" is room at 0, 0 outdoors.
          Company party "You" of 1 at lane.`);
        const store = TerminalSlots.store(join(dir, 'slots.json')), said: string[] = [];
        expect(TerminalPlay.kept(l => said.push(l), store)).toBeUndefined();
        store.write(CheckpointStore.autosave, t.session.checkpoint());
        const kept = TerminalPlay.kept(l => said.push(l), store);
        expect(FirstChoice.title(kept && { ended: !kept.campaign.running }).chosen).toBe('continue');
        expect(kept?.campaign.world.one('at', 'party')).toBe('t__lane');
        const broken = TerminalSlots.store(join(dir, 'broken.json'));
        broken.write(CheckpointStore.autosave, { ...t.session.checkpoint(), save: {} } as never);
        expect(TerminalPlay.kept(l => said.push(l), broken)).toBeUndefined();
        expect(said).toEqual([expect.stringMatching(/^The game kept here could not be taken up, so a new one begins/)]);
      } finally { await rm(dir, { recursive: true, force: true }); }
    });
});
describe('Interface › No long presses on the way in', () => {
  it('holds nothing on the title, how a game begins, creation\'s rows or the opening\'s Continue', () => {
    const app = (phase: string) => ({ state: { phase }, props: { query: new URLSearchParams() },
      opening: { play: () => undefined, kept: () => undefined, beginAs: () => undefined } }) as never;
    const drawn = [renderToStaticMarkup(createElement(TitlePage.View, { app: app('title') })),
      renderToStaticMarkup(createElement(TitlePage.View, { app: app('begin') })),
      renderToStaticMarkup(createElement(ComposedRow.View, { option: { id: 'human', name: 'Human' },
        onConsider: () => undefined, onChoose: () => undefined })),
      renderToStaticMarkup(createElement(PrologueStage.Continue, { action: 'go-on', then: () => undefined }))];
    expect(drawn.map(html => html.includes('data-action') || html.includes('data-option'))).toEqual([true, true, true, true]);
    expect(drawn.filter(html => /data-hold|Hold to/.test(html))).toEqual([]);
  });
  it('takes a press at once, and a double press once', () => {
    let taken = 0;
    const row = PressGuard.once(() => { taken++; });
    // A click, a tap or the keys (detail 1, or 0 for the keys and an assistive technology), then a double's second.
    row.onClick({ detail: 1 }); row.onClick({ detail: 0 }); row.onClick({ detail: 2 });
    expect(taken).toBe(2);
  });
});
