import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../web/engine/creation-flow';
import type { Setting } from '../../web/engine/protocol';
import type { ReaderApp } from '../../web/reader/reader-app';
import { CreationPage } from '../../web/reader/creation/creation-page';

// The page of making the protagonist is the engine's flow as it is (CreationFlow; the owner, 14 November: "the
// creation script should not be defined per-client"): its pages are the flow's steps in the flow's order (how you
// present asked on the name's page), each with the flow's question and the flow's cards, and the one the flow says is
// chosen pressed; a choice goes back to the flow by its step and its card.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] }, elf: { she: ['Ithil'], he: ['Lorin'], they: ['Aerin'] } };
const setting: Setting = { title: 'Merscfaenn', generated: true, pitch: { heading: '', text: '' },
  origins: [{ id: 'debt', title: 'A debt', choice: 'You owe money' }], names,
  party: [Creation.protagonist('elf', 'page', names)] };
const app = (chosen: [string, string][] = []) => {
  const flow = () => new CreationFlow(setting, Creation.catalog(), setting.party[0]);
  return { state: { setting, catalog: Creation.catalog(), party: setting.party, origin: undefined },
    opening: { flow, choose: (step: string, id: string) => chosen.push([step, id]) } } as unknown as ReaderApp;
};

describe('the page of making the protagonist', () => {
  it('is the flow\'s steps, in its order, with its questions', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    expect(CreationPage.steps(app()).map(s => [s.id, s.ask])).toEqual(flow.steps().filter(s => s.id !== 'presenting')
      .map(s => [s.id, s.ask]));
  });
  it('draws each step\'s cards as the flow gives them, the chosen one pressed', () => {
    const a = app(), flow = new CreationFlow(setting, Creation.catalog());
    for (const id of ['you', 'calling', 'before'] as const) {
      const step = CreationPage.steps(a).find(s => s.id === id)!, html = renderToStaticMarkup(createElement(step.View,
        { app: a, step }));
      const cards = [...html.matchAll(/<button[^>]*class="card[^"]*"[^>]*>/g)].map(m => m[0]);
      expect([id, cards.length]).toEqual([id, flow.steps().find(s => s.id === id)!.cards.length]);
      expect(cards.filter(c => c.includes('aria-pressed="true"')).length).toBe(step.chosen ? 1 : 0);
    }
    // An elf's callings are the flow's: no cleric among them.
    const calling = CreationPage.steps(a).find(s => s.id === 'calling')!;
    expect(renderToStaticMarkup(createElement(calling.View, { app: a, step: calling }))).not.toContain('classId:cleric');
  });
});
