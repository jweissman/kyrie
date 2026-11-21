import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EngineHost } from '../web/engine/engine-host';
import { LoadingPage } from '../web/reader/loading-page';
import type { ReaderApp } from '../web/reader/reader-app';
import type { Frame, Setting } from '../src/creation/protocol';
import { Typography } from '../src/presentation/typography';

// The prologue as the loading screen (OR-23): while the world is made after Set out now, the page shows the opening's
// first page, the chapter and why the company came, in the origin's own words read from its own module before any
// world is (Setting.origins[].opening); when the world is ready, the opening's first page is the same words, and the
// first place does not tell them again. The painting and the passage without a cut are the browser's to see (CI).
describe('the opening while the world is made', () => {
  it('is the origin\'s own first page, the same the opening then tells, and not told again by the first place', async () => {
    const host = new EngineHost(() => undefined);
    const setting = await host.handle({ kind: 'world', seed: 'iscoed' } as never) as Setting;
    const opening = setting.origins?.find(o => o.id === 'drove')?.opening;
    expect(opening?.title).toBe('Down the drove road');
    expect(opening?.beats[0]).toBe("Eleven days you have walked Bran ap Ifor's drove down from the fells to sell. The last "
      + 'mile, in the dark, was the worst.');
    // Drawn while the world is made: that page, no steps of the engine's.
    const app = { state: { phase: 'loading', leaving: true, approach: 'plate', setting, origin: 'drove', stage: 'Setting out' },
      opening: { apart: () => true } } as unknown as ReaderApp;
    const page = renderToStaticMarkup(createElement(LoadingPage.View, { app }));
    expect(page).toContain(Typography.curl(opening!.beats[0]!));
    expect(page).toContain('Down the drove road');
    expect(page).not.toMatch(/Drawing the world|Placing its people|Telling where you are/);
    // The world made: its opening's pages are the same beats, in the same order, and the place leaves them out.
    const frame = await host.handle({ kind: 'begin', campaign: 'world', seed: 'iscoed', origin: 'drove', apart: true,
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] } as never) as Frame;
    expect(frame.leaf.prologue?.beats).toEqual(opening!.beats.map(b => Typography.curl(b)));
    const place = [...frame.leaf.glanced?.situation ?? [], ...frame.leaf.glanced?.presence ?? []].join(' ');
    for (const beat of frame.leaf.prologue!.beats) { expect(place).not.toContain(beat.slice(0, 40)); }
  }, 180000);
});
