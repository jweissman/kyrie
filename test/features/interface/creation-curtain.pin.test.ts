import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Creation } from '../../../web/engine/creation';
import { EngineCreation } from '../../../web/engine/engine-creation';
import { CreationFlow } from '../../../src/creation/creation-flow';
import type { Setting } from '../../../src/creation/protocol';
import { PageFrame } from '../../../web/reader/page-frame';
import { Shell } from '../../../web/reader/shell';
import type { ReaderApp } from '../../../web/reader/reader-app';
import { ColourCensus } from '../../support/colour-census';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Creation's backdrop is the engine's hint (the owner,
// 27 November: "We shouldn't have the background, and especially it shouldn't pan/zoom, if it's going to be so low
// res; especially during creation, I'd prefer black curtain and embers"; OR-1800): every page of the making, setting
// out's too, is drawn over the black curtain with the embers before it, by the frame; the sky's step reads through its
// stars over it; and no painting stands behind any of it.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, terrain: 'forest', pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'curtain', names)] };
const frame = readFileSync('web/reader/frame.css', 'utf8');

describe('Interface › Creation behind its curtain', () => {
  it('hints the curtain for every page of the making, and the stars where the sky is asked', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    for (const step of flow.steps()) {
      expect([step.id, step.hints?.backdrop]).toEqual([step.id, 'curtain']);
      expect([step.id, step.hints?.instrument]).toEqual([step.id, step.present === 'sky' ? 'stars' : undefined]);
    }
    const engine = new EngineCreation();
    engine.begun(setting, { campaign: 'world', seed: 'curtain' });
    expect(engine.state().hints).toEqual({ backdrop: 'curtain' });
  });
  it('is drawn by the frame, the embers before it, and no painting behind it', () => {
    const page = renderToStaticMarkup(createElement(PageFrame.View, { kind: 'creation', backdrop: 'curtain' }));
    expect(page).toMatch(/data-slot="background"[^>]*><div class="curtain"[^>]*><div class="motes"/);
    const app = { state: { phase: 'company', seed: 'curtain', setting,
      creation: { hints: { backdrop: 'curtain' } } } } as unknown as ReaderApp;
    expect(Shell.plate(app)).toBeUndefined();
    // Still: nothing of the curtain is animated, panned or zoomed, and nothing in it is a hue.
    const curtain = [...ColourCensus.rules(frame)].find(r => r.selector === '.curtain')!.body;
    expect(curtain).not.toMatch(/animation|transform|url\(/);
    expect(ColourCensus.greyless(curtain)).toBe(false);
  });
});
