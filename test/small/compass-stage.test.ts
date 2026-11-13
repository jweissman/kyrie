import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReaderApp } from '../../web/reader/reader-app';
import type { Draw } from '../../web/reader/stage/act';
import { CompassStage } from '../../web/reader/stage/compass-stage';
import type { Compass } from '../../src/presentation/glance-types';

// The compass inside an enclosed place, as the page draws it (CN-02, CN-03): the engine's routes (Glance.compass) as
// the column's own rows, Out and On each with its arrow from the shared signs, its route under it and the act it is
// done by marked (data-act); a barred way out says what bars it and does nothing; nothing outside an enclosure; the
// way on left out where the scene leads with it already.
const app = (glance: object) => ({ state: { keyed: false, cursor: 0, open: [], frame: { leaf: { glance } } },
  menu: { choices: [] }, choose: () => undefined }) as unknown as ReaderApp;
const draw = (a: ReaderApp): Draw => ({ app: a, index: new Map(), open: new Set() });
const compass: Compass = { exhausted: false,
  out: { to: 'yard', name: 'the churchyard', ways: ['the stair', 'the crypt door'], minutes: 4, command: 'travel:yard' },
  next: { to: 'ossuary', name: 'the ossuary', ways: ['the low arch'], minutes: 2, command: 'exit:ossuary' } };
const render = (glance: object, drawn: string[] = []) => {
  const a = app(glance);
  return renderToStaticMarkup(createElement(CompassStage.View, { app: a, draw: draw(a), drawn }));
};

describe('the compass in the page', () => {
  it('draws the way on and the way out as rows, their routes beneath, each marked by its act', () => {
    const html = render({ enclosed: true, compass });
    expect(html).toContain('data-act="exit:ossuary"');
    expect(html).toContain('data-act="travel:yard"');
    expect(html).toMatch(/compass-on[\s\S]*→[\s\S]*On to the ossuary/);
    expect(html).toMatch(/compass-out[\s\S]*←[\s\S]*Out to the churchyard/);
    expect(html).toContain('the stair › the crypt door · 4 minutes');
  });
  it('says what bars the way out, and does no act by it', () => {
    const html = render({ enclosed: true, compass: { exhausted: true, out: { ...compass.out!, command: undefined,
      barred: 'The crypt door is locked.' } } });
    expect(html).toMatch(/class="[^"]*compass-out[^"]*shut/);
    expect(html).not.toContain('data-act=');
    expect(html).toContain('The crypt door is locked.');
    expect(html).toContain('Nothing more is known in here.');
  });
  it('is nothing outside an enclosure, and leaves out a way on the scene leads with', () => {
    expect(render({ compass })).toBe('');
    expect(render({ enclosed: true, compass }, ['exit:ossuary'])).not.toContain('compass-on');
  });
});
